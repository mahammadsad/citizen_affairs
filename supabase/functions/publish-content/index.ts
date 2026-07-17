import { withSupabase } from "@supabase/server";

const cors = {
  "Access-Control-Allow-Origin": Deno.env.get("EDITORIAL_APP_ORIGIN") || "https://citizenaffairs.in",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: cors });
const failure = (error: string, message: string, status: number) => json({ error, message }, status);
const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

// Replace `any` with generated database types after the dedicated project exists.
const secured = withSupabase<any>({ auth: "user" }, async (req, ctx) => {
  if (req.method !== "POST") return failure("method_not_allowed", "Only POST publication requests are accepted.", 405);
  const payload = await req.json().catch(() => ({}));
  const articleId = typeof payload.article_id === "string" ? payload.article_id : "";
  const reason = typeof payload.reason === "string" ? payload.reason.trim() : "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(articleId) || reason.length < 10 || reason.length > 500) {
    return failure("invalid_publication_request", "A valid article and a 10–500 character publication reason are required.", 400);
  }
  const userId = ctx.userClaims?.id;
  if (!userId) return failure("authentication_required", "Sign in with an active staff account before requesting publication.", 401);

  const { data: article, error: articleError } = await ctx.supabase
    .from("articles")
    .select("id, title, version, workflow_status, assigned_publisher_id")
    .eq("id", articleId)
    .is("deleted_at", null)
    .single();
  if (articleError || !article) return failure("article_not_accessible", "The article was not found or is not assigned to this account.", 404);
  if (article.assigned_publisher_id !== userId) return failure("publisher_assignment_required", "Only the assigned publisher can start this publication.", 403);
  if (!["approved", "scheduled"].includes(article.workflow_status)) return failure("article_not_approved", "Only an approved or scheduled article can be published.", 409);

  const { data: existing } = await ctx.supabase
    .from("publication_events")
    .select("id, status")
    .eq("article_id", article.id)
    .eq("article_version", article.version)
    .in("status", ["requested", "building", "deployed"])
    .maybeSingle();
  if (existing) {
    return json({
      publication_event_id: existing.id,
      status: existing.status,
      message: existing.status === "deployed" ? "This article version is already published." : "Publication build already started.",
      idempotent: true,
    }, existing.status === "deployed" ? 200 : 202);
  }

  const { data: event, error: eventError } = await ctx.supabase
    .from("publication_events")
    .insert({ article_id: article.id, article_version: article.version, requested_by: userId })
    .select("id")
    .single();
  if (eventError || !event) {
    const message = eventError?.message || "Publication request was rejected";
    const mapped = message.includes("already has an active publication event") || eventError?.code === "23505"
      ? ["publication_already_started", "Publication build already started.", 202]
      : message.includes("Required") && message.includes("approval")
        ? ["approvals_missing", "Required editorial approvals are missing for this article version.", 409]
        : message.includes("primary source")
          ? ["primary_source_missing", "Add and verify a primary source before publication.", 409]
          : ["publication_not_authorized", "The publication request was rejected by the editorial security rules.", 403];
    return failure(mapped[0] as string, mapped[1] as string, mapped[2] as number);
  }

  const owner = Deno.env.get("GITHUB_OWNER") || "mahammadsad";
  const repository = Deno.env.get("GITHUB_REPOSITORY") || "sarkari-tathya-kendra";
  const token = Deno.env.get("GITHUB_DISPATCH_TOKEN");
  if (!token) {
    await ctx.supabaseAdmin.from("publication_events").update({ status: "failed", error_message: "GITHUB_DISPATCH_TOKEN is not configured", completed_at: new Date().toISOString() }).eq("id", event.id);
    return json({ error: "publishing_integration_not_configured", message: "The GitHub publishing integration is not configured. Contact the owner.", publication_event_id: event.id }, 503);
  }

  let dispatch: Response | undefined;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    dispatch = await fetch(`https://api.github.com/repos/${owner}/${repository}/dispatches`, {
      method: "POST",
      headers: { "Accept": "application/vnd.github+json", "Authorization": `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json" },
      body: JSON.stringify({ event_type: "publish-content", client_payload: { article_id: article.id, article_version: article.version, publication_event_id: event.id, reason } }),
    });
    if (dispatch.ok || (dispatch.status < 500 && dispatch.status !== 429)) break;
    await wait(400 * (2 ** attempt));
  }
  if (!dispatch?.ok) {
    const message = `GitHub repository dispatch failed (${dispatch?.status || "network error"})`;
    await ctx.supabaseAdmin.from("publication_events").update({ status: "failed", error_message: message, completed_at: new Date().toISOString() }).eq("id", event.id);
    return json({ error: "github_dispatch_failed", message: "GitHub could not start the protected build. The event was recorded and can be retried.", publication_event_id: event.id }, 502);
  }
  await ctx.supabaseAdmin.from("publication_events").update({ status: "building" }).eq("id", event.id);
  return json({ publication_event_id: event.id, status: "building", message: "Protected publication build started." }, 202);
});

export default {
  fetch(req: Request) {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    return secured(req);
  },
};
