-- Cover every automation foreign key used for joins and cascades.
create index article_generation_runs_dossier_idx on public.article_generation_runs(dossier_id);
create index automation_runs_created_by_idx on public.automation_runs(created_by) where created_by is not null;
create index claim_evidence_article_idx on public.claim_evidence(article_id) where article_id is not null;
create index claim_evidence_source_snapshot_idx on public.claim_evidence(source_snapshot_id);
create index claim_evidence_verified_by_idx on public.claim_evidence(verified_by) where verified_by is not null;
create index fact_check_runs_generation_idx on public.fact_check_runs(article_generation_run_id);
create index research_dossiers_article_idx on public.research_dossiers(article_id) where article_id is not null;
create index research_dossiers_created_by_idx on public.research_dossiers(created_by) where created_by is not null;
create index research_runs_topic_idx on public.research_runs(topic_candidate_id);
create index review_comments_author_idx on public.review_comments(author_id);
create index review_comments_dossier_idx on public.review_comments(dossier_id) where dossier_id is not null;
create index review_comments_resolved_by_idx on public.review_comments(resolved_by) where resolved_by is not null;
create index review_comments_topic_idx on public.review_comments(topic_candidate_id) where topic_candidate_id is not null;
create index thumbnail_assets_approved_by_idx on public.thumbnail_assets(approved_by) where approved_by is not null;
create index thumbnail_assets_generation_idx on public.thumbnail_assets(article_generation_run_id) where article_generation_run_id is not null;
create index thumbnail_assets_article_idx on public.thumbnail_assets(article_id) where article_id is not null;
create index topic_candidates_created_by_idx on public.topic_candidates(created_by) where created_by is not null;
create index topic_candidates_reviewed_by_idx on public.topic_candidates(reviewed_by) where reviewed_by is not null;

-- One policy per action avoids evaluating duplicate permissive policies.
drop policy "automation managers insert review_comments" on public.review_comments;
drop policy "automation managers update review_comments" on public.review_comments;
drop policy "reviewers create their own comments" on public.review_comments;
drop policy "reviewers update their own comments" on public.review_comments;

create policy "authorized staff create review comments" on public.review_comments for insert to authenticated
with check (
  private.has_permission('automation.manage')
  or (private.has_permission('automation.review') and author_id = (select auth.uid()))
);
create policy "authorized staff update review comments" on public.review_comments for update to authenticated
using (
  private.has_permission('automation.manage')
  or (private.has_permission('automation.review') and author_id = (select auth.uid()))
)
with check (
  private.has_permission('automation.manage')
  or (private.has_permission('automation.review') and author_id = (select auth.uid()))
);
