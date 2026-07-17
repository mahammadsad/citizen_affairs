import { withSupabase } from "@supabase/server";

const cors = {
  "Access-Control-Allow-Origin": Deno.env.get("EDITORIAL_APP_ORIGIN") || "https://citizenaffairs.in",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: cors });

// Replace `any` with generated database types after the dedicated project exists.
const secured = withSupabase<any>({ auth: "user" }, async (req, ctx) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const payload = await req.json().catch(() => ({}));
  const articleId = typeof payload.article_id === "string" ? payload.article_id : "";
  const reason = typeof payload.reason === "string" ? payload.reason.trim() : "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(articleId) || reason.length < 10 || reason.length > 500) {
    return json({ error: "A valid article_id and a 10–500 character publication reason are required" }, 400);
  }
  const userId = ctx.userClaims?.id;
  if (!userId) return json({ error: "Authenticated staff account required" }, 401);

  const { data: article, error: articleError } = await ctx.supabase
    .from("articles")
    .select("id, title, version, workflow_status, assigned_publisher_id")
    .eq("id", articleId)
    .is("deleted_at", null)
    .single();
  if (articleError || !article) return json({ error: "Article not found or not assigned to this publisher" }, 404);
  if (!["approved", "scheduled"].includes(article.workflow_status)) return json({ error: "Only approved or scheduled content can be published" }, 409);

  const { data: event, error: eventError } = await ctx.supabase
    .from("publication_events")
    .insert({ article_id: article.id, article_version: article.version, requested_by: userId })
    .select("id")
    .single();
  if (eventError || !event) return json({ error: eventError?.message || "Publication request was rejected" }, 403);

  const owner = Deno.env.get("GITHUB_OWNER") || "mahammadsad";
  const repository = Deno.env.get("GITHUB_REPOSITORY") || "sarkari-tathya-kendra";
  const token = Deno.env.get("GITHUB_DISPATCH_TOKEN");
  if (!token) {
    await ctx.supabaseAdmin.from("publication_events").update({ status: "failed", error_message: "GITHUB_DISPATCH_TOKEN is not configured", completed_at: new Date().toISOString() }).eq("id", event.id);
    return json({ error: "Publishing integration is not configured", publication_event_id: event.id }, 503);
  }

  const dispatch = await fetch(`https://api.github.com/repos/${owner}/${repository}/dispatches`, {
    method: "POST",
    headers: { "Accept": "application/vnd.github+json", "Authorization": `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json" },
    body: JSON.stringify({ event_type: "publish-content", client_payload: { article_id: article.id, article_version: article.version, publication_event_id: event.id, reason } }),
  });
  if (!dispatch.ok) {
    const message = `GitHub dispatch failed (${dispatch.status})`;
    await ctx.supabaseAdmin.from("publication_events").update({ status: "failed", error_message: message, completed_at: new Date().toISOString() }).eq("id", event.id);
    return json({ error: message, publication_event_id: event.id }, 502);
  }
  await ctx.supabaseAdmin.from("publication_events").update({ status: "building" }).eq("id", event.id);
  return json({ publication_event_id: event.id, status: "building" }, 202);
});

export default {
  fetch(req: Request) {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    return secured(req);
  },
};
