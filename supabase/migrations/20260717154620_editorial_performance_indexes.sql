-- Cover foreign keys used by joins, referential checks and RLS lookups.
create index if not exists article_approvals_reviewer_idx on public.article_approvals(reviewer_id);
create index if not exists article_revisions_changed_by_idx on public.article_revisions(changed_by);
create index if not exists articles_assigned_copy_reviewer_idx on public.articles(assigned_copy_reviewer_id);
create index if not exists articles_assigned_editor_idx on public.articles(assigned_editor_id);
create index if not exists articles_assigned_fact_checker_idx on public.articles(assigned_fact_checker_id);
create index if not exists articles_assigned_publisher_idx on public.articles(assigned_publisher_id);
create index if not exists articles_assigned_reviewer_idx on public.articles(assigned_reviewer_id);
create index if not exists articles_deleted_by_idx on public.articles(deleted_by);
create index if not exists articles_primary_section_idx on public.articles(primary_section_id);
create index if not exists audit_log_actor_idx on public.audit_log(actor_id);
create index if not exists claims_fact_checker_idx on public.claims(fact_checker_id);
create index if not exists claims_source_idx on public.claims(source_id);
create index if not exists correction_reports_article_idx on public.correction_reports(article_id);
create index if not exists corrections_approved_by_idx on public.corrections(approved_by);
create index if not exists corrections_article_idx on public.corrections(article_id);
create index if not exists corrections_created_by_idx on public.corrections(created_by);
create index if not exists publication_events_requested_by_idx on public.publication_events(requested_by);
create index if not exists role_permissions_permission_idx on public.role_permissions(permission_key);
create index if not exists sources_created_by_idx on public.sources(created_by);
create index if not exists sources_verified_by_idx on public.sources(verified_by);
create index if not exists staff_profiles_supervisor_idx on public.staff_profiles(supervisor_id);
create index if not exists staff_profiles_suspended_by_idx on public.staff_profiles(suspended_by);
create index if not exists user_roles_assigned_by_idx on public.user_roles(assigned_by);
create index if not exists user_roles_role_idx on public.user_roles(role_id);
create index if not exists workflow_events_actor_idx on public.workflow_events(actor_id);

-- A FOR ALL policy also evaluates for SELECT. Split write policies so staff
-- visibility is evaluated once per row instead of through two permissive paths.
drop policy "editors manage job details" on public.job_details;
create policy "editors insert job details" on public.job_details for insert to authenticated
with check (
  exists (select 1 from public.articles a where a.id = article_id and a.author_id = (select auth.uid()) and private.has_permission('article.edit_own'))
  or private.has_permission('article.edit_section') or private.has_permission('article.edit_any')
);
create policy "editors update job details" on public.job_details for update to authenticated
using (
  exists (select 1 from public.articles a where a.id = article_id and a.author_id = (select auth.uid()) and private.has_permission('article.edit_own'))
  or private.has_permission('article.edit_section') or private.has_permission('article.edit_any')
)
with check (
  exists (select 1 from public.articles a where a.id = article_id and a.author_id = (select auth.uid()) and private.has_permission('article.edit_own'))
  or private.has_permission('article.edit_section') or private.has_permission('article.edit_any')
);
create policy "editors delete job details" on public.job_details for delete to authenticated
using (
  exists (select 1 from public.articles a where a.id = article_id and a.author_id = (select auth.uid()) and private.has_permission('article.edit_own'))
  or private.has_permission('article.edit_section') or private.has_permission('article.edit_any')
);

drop policy "editors manage scheme details" on public.scheme_details;
create policy "editors insert scheme details" on public.scheme_details for insert to authenticated
with check (
  exists (select 1 from public.articles a where a.id = article_id and a.author_id = (select auth.uid()) and private.has_permission('article.edit_own'))
  or private.has_permission('article.edit_section') or private.has_permission('article.edit_any')
);
create policy "editors update scheme details" on public.scheme_details for update to authenticated
using (
  exists (select 1 from public.articles a where a.id = article_id and a.author_id = (select auth.uid()) and private.has_permission('article.edit_own'))
  or private.has_permission('article.edit_section') or private.has_permission('article.edit_any')
)
with check (
  exists (select 1 from public.articles a where a.id = article_id and a.author_id = (select auth.uid()) and private.has_permission('article.edit_own'))
  or private.has_permission('article.edit_section') or private.has_permission('article.edit_any')
);
create policy "editors delete scheme details" on public.scheme_details for delete to authenticated
using (
  exists (select 1 from public.articles a where a.id = article_id and a.author_id = (select auth.uid()) and private.has_permission('article.edit_own'))
  or private.has_permission('article.edit_section') or private.has_permission('article.edit_any')
);
