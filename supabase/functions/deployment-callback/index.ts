import { withSupabase } from "@supabase/server";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const failure = (error: string, message: string, status: number) => Response.json({ error, message }, { status });
const safeText = (value: unknown, fallback: string) => String(value || fallback)
  .replace(/(bearer|apikey|authorization)\s*[:=]?\s*[^\s,;]+/gi, '$1 [redacted]')
  .replace(/(?:sb_secret_|gh[opusr]_|github_pat_)[A-Za-z0-9_-]+/g, '[redacted]')
  .slice(0, 500);

export default {
  // Replace `any` with refreshed generated database types in a separate type-only change.
  fetch: withSupabase<any>({ auth: "secret" }, async (req, ctx) => {
    if (req.method !== "POST") return failure("method_not_allowed", "Only POST deployment callbacks are accepted.", 405);
    const body = await req.json().catch(() => ({}));
    if (!uuid.test(body.publication_event_id || "") || !["deployed", "failed"].includes(body.status)) {
      return failure("invalid_callback", "A valid publication event and terminal deployment status are required.", 400);
    }
    const { data: event } = await ctx.supabaseAdmin.from("publication_events").select("id, article_id, article_version, status").eq("id", body.publication_event_id).single();
    if (!event) return failure("publication_event_not_found", "The publication event does not exist.", 404);
    if (["deployed", "failed"].includes(event.status)) {
      if (event.status === body.status) return Response.json({ ok: true, idempotent: true, status: event.status });
      return failure("publication_event_completed", "The publication event already has a different terminal status.", 409);
    }
    if (!["requested", "building"].includes(event.status)) return failure("publication_event_not_active", "The publication event is not active.", 409);
    if (body.status === "deployed") {
      const { data: article } = await ctx.supabaseAdmin.from("articles").select("version").eq("id", event.article_id).single();
      if (!article || article.version !== event.article_version) {
        await ctx.supabaseAdmin.from("publication_events").update({ status: "failed", error_message: "Article changed while the deployment was running", completed_at: new Date().toISOString() }).eq("id", event.id);
        return failure("stale_article_version", "The article changed while deployment was running.", 409);
      }
      const { error } = await ctx.supabaseAdmin.from("articles").update({ workflow_status: "published", last_transition_reason: "GitHub Pages deployment completed successfully" }).eq("id", event.article_id);
      if (error) {
        await ctx.supabaseAdmin.from("publication_events").update({ status: "failed", error_message: "Database could not finalize the published article state", completed_at: new Date().toISOString() }).eq("id", event.id);
        return failure("publication_finalize_failed", "The deployment succeeded but the editorial record could not be finalized.", 500);
      }
    }
    await ctx.supabaseAdmin.from("publication_events").update({
      status: body.status,
      github_run_id: String(body.github_run_id || ""),
      commit_sha: String(body.commit_sha || ""),
      deployment_url: body.deployment_url || null,
      error_message: body.status === "failed" ? safeText(body.error_message, "Build or deployment failed") : null,
      completed_at: new Date().toISOString(),
    }).eq("id", event.id);
    return Response.json({ ok: true });
  }),
};
