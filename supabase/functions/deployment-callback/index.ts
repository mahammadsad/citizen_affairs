import { withSupabase } from "@supabase/server";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default {
  // Replace `any` with generated database types after the dedicated project exists.
  fetch: withSupabase<any>({ auth: "secret" }, async (req, ctx) => {
    if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });
    const body = await req.json().catch(() => ({}));
    if (!uuid.test(body.publication_event_id || "") || !["deployed", "failed"].includes(body.status)) {
      return Response.json({ error: "Invalid callback" }, { status: 400 });
    }
    const { data: event } = await ctx.supabaseAdmin.from("publication_events").select("id, article_id, article_version, status").eq("id", body.publication_event_id).single();
    if (!event || !["requested", "building"].includes(event.status)) return Response.json({ error: "Unknown or completed publication event" }, { status: 409 });
    if (body.status === "deployed") {
      const { data: article } = await ctx.supabaseAdmin.from("articles").select("version").eq("id", event.article_id).single();
      if (!article || article.version !== event.article_version) {
        await ctx.supabaseAdmin.from("publication_events").update({ status: "failed", error_message: "Article changed while the deployment was running", completed_at: new Date().toISOString() }).eq("id", event.id);
        return Response.json({ error: "Stale article version" }, { status: 409 });
      }
      const { error } = await ctx.supabaseAdmin.from("articles").update({ workflow_status: "published", last_transition_reason: "GitHub Pages deployment completed successfully" }).eq("id", event.article_id);
      if (error) {
        await ctx.supabaseAdmin.from("publication_events").update({ status: "failed", error_message: error.message, completed_at: new Date().toISOString() }).eq("id", event.id);
        return Response.json({ error: "Could not finalize publication" }, { status: 500 });
      }
    }
    await ctx.supabaseAdmin.from("publication_events").update({
      status: body.status,
      github_run_id: String(body.github_run_id || ""),
      commit_sha: String(body.commit_sha || ""),
      deployment_url: body.deployment_url || null,
      error_message: body.status === "failed" ? String(body.error_message || "Build or deployment failed").slice(0, 2000) : null,
      completed_at: new Date().toISOString(),
    }).eq("id", event.id);
    return Response.json({ ok: true });
  }),
};
