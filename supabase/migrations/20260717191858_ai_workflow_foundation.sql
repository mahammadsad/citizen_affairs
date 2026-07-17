-- Private, review-gated AI research and drafting foundation.
-- No table in this migration is readable by anon and no automation status can
-- transition an article to an editorial approval or publication state.

create type public.automation_pipeline_status as enum (
  'discovered', 'queued', 'researching', 'research_failed', 'research_complete',
  'seo_analysis', 'draft_generating', 'draft_generated', 'fact_checking',
  'fact_check_failed', 'needs_review', 'approved', 'rejected', 'scheduled',
  'published', 'update_required'
);
create type public.automation_run_status as enum ('queued', 'running', 'succeeded', 'failed', 'cancelled');
create type public.claim_check_status as enum ('confirmed', 'partially-confirmed', 'unverified', 'contradicted', 'outdated');

insert into public.permissions(key, description) values
  ('automation.view', 'View private automation topics, dossiers and runs'),
  ('automation.review', 'Review topics, evidence and generated drafts'),
  ('automation.manage', 'Start and retry trusted automation jobs')
on conflict (key) do update set description = excluded.description;

insert into public.role_permissions(role_id, permission_key)
select r.id, p.key
from public.roles r
join public.permissions p on
  (r.name = 'writer' and p.key = 'automation.view') or
  (r.name in ('section-editor', 'fact-checker', 'copy-reviewer') and p.key in ('automation.view', 'automation.review')) or
  (r.name in ('managing-editor', 'administrator', 'owner') and p.key in ('automation.view', 'automation.review', 'automation.manage')) or
  (r.name = 'publisher' and p.key = 'automation.view')
on conflict do nothing;

create table public.automation_runs (
  id uuid primary key default gen_random_uuid(),
  run_type text not null check (run_type in ('topic-discovery', 'research', 'seo-analysis', 'article-generation', 'fact-check', 'thumbnail', 'freshness-check')),
  status public.automation_run_status not null default 'queued',
  idempotency_key text not null unique check (length(idempotency_key) between 8 and 200),
  trigger_source text not null default 'manual' check (trigger_source in ('manual', 'schedule', 'retry', 'webhook')),
  model_name text,
  prompt_version text,
  attempt integer not null default 0 check (attempt between 0 and 10),
  max_attempts integer not null default 3 check (max_attempts between 1 and 10),
  input_metadata jsonb not null default '{}',
  output_metadata jsonb not null default '{}',
  token_usage jsonb not null default '{}',
  cost_metadata jsonb not null default '{}',
  error_code text,
  error_message text check (error_message is null or length(error_message) <= 2000),
  created_by uuid references public.staff_profiles(id) on delete set null,
  started_at timestamptz,
  completed_at timestamptz,
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint automation_runs_dates check (completed_at is null or started_at is null or completed_at >= started_at)
);

create table public.topic_candidates (
  id uuid primary key default gen_random_uuid(),
  normalized_topic text not null check (length(btrim(normalized_topic)) between 5 and 300),
  language public.editorial_language not null,
  source_url text not null check (source_url ~ '^https://'),
  source_authority text not null,
  category text not null,
  relevance_scope text not null check (relevance_scope in ('national', 'state', 'local')),
  state_or_ut text,
  status public.automation_pipeline_status not null default 'discovered',
  freshness_label text check (freshness_label in ('low', 'medium', 'high', 'breaking')),
  deadline_urgency text check (deadline_urgency in ('none', 'low', 'medium', 'high')),
  existing_coverage jsonb not null default '{}',
  duplicate_similarity numeric(5,4) check (duplicate_similarity between 0 and 1),
  official_source_available boolean not null default false,
  discovery_evidence jsonb not null default '[]',
  discovered_at timestamptz not null default now(),
  created_by uuid references public.staff_profiles(id) on delete set null,
  reviewed_by uuid references public.staff_profiles(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (normalized_topic, language, source_url)
);

create table public.topic_scores (
  id uuid primary key default gen_random_uuid(),
  topic_candidate_id uuid not null unique references public.topic_candidates(id) on delete cascade,
  scoring_version text not null,
  niche_relevance numeric(5,2) check (niche_relevance between 0 and 100),
  search_demand_label text check (search_demand_label in ('unknown', 'low', 'medium', 'high')),
  demand_evidence jsonb not null default '[]',
  freshness numeric(5,2) check (freshness between 0 and 100),
  official_source_availability numeric(5,2) check (official_source_availability between 0 and 100),
  citizen_usefulness numeric(5,2) check (citizen_usefulness between 0 and 100),
  deadline_urgency numeric(5,2) check (deadline_urgency between 0 and 100),
  competition_label text check (competition_label in ('unknown', 'low', 'medium', 'high')),
  content_gap_opportunity numeric(5,2) check (content_gap_opportunity between 0 and 100),
  original_value numeric(5,2) check (original_value between 0 and 100),
  total_score numeric(5,2) not null check (total_score between 0 and 100),
  evidence jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.research_runs (
  id uuid primary key default gen_random_uuid(),
  topic_candidate_id uuid not null references public.topic_candidates(id) on delete cascade,
  automation_run_id uuid not null unique references public.automation_runs(id) on delete restrict,
  status public.automation_run_status not null default 'queued',
  model_name text not null,
  prompt_version text not null,
  search_providers text[] not null default '{}',
  official_sources_found integer not null default 0 check (official_sources_found >= 0),
  retry_count integer not null default 0 check (retry_count between 0 and 10),
  error_message text check (error_message is null or length(error_message) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.research_dossiers (
  id uuid primary key default gen_random_uuid(),
  topic_candidate_id uuid not null references public.topic_candidates(id) on delete restrict,
  research_run_id uuid not null unique references public.research_runs(id) on delete restrict,
  article_id uuid references public.articles(id) on delete set null,
  dossier jsonb not null,
  confidence text not null check (confidence in ('low', 'medium', 'high')),
  conflicts jsonb not null default '[]',
  missing_information jsonb not null default '[]',
  unverified_claims jsonb not null default '[]',
  research_model text not null,
  completed_at timestamptz not null,
  created_by uuid references public.staff_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.research_source_snapshots (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.research_dossiers(id) on delete cascade,
  url text not null check (url ~ '^https://'),
  title text not null,
  publishing_authority text not null,
  source_priority integer not null check (source_priority between 1 and 6),
  is_official boolean not null default false,
  published_at timestamptz,
  accessed_at timestamptz not null default now(),
  document_number text,
  content_hash text,
  evidence_excerpt text check (evidence_excerpt is null or length(evidence_excerpt) <= 2000),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (dossier_id, url)
);

create table public.claim_evidence (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.research_dossiers(id) on delete cascade,
  article_id uuid references public.articles(id) on delete cascade,
  source_snapshot_id uuid not null references public.research_source_snapshots(id) on delete restrict,
  claim_text text not null,
  claim_category text not null,
  evidence_summary text not null check (length(evidence_summary) <= 2000),
  is_critical boolean not null default false,
  verification_result public.claim_check_status not null default 'unverified',
  confidence text not null check (confidence in ('low', 'medium', 'high')),
  verified_by uuid references public.staff_profiles(id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.keyword_clusters (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null unique references public.research_dossiers(id) on delete cascade,
  primary_keyword text not null,
  secondary_keywords text[] not null default '{}',
  long_tail_keywords text[] not null default '{}',
  search_intent text not null,
  related_questions text[] not null default '{}',
  content_gaps jsonb not null default '[]',
  internal_link_suggestions jsonb not null default '[]',
  title_suggestions text[] not null default '{}',
  heading_structure jsonb not null default '[]',
  suggested_slug text not null check (suggested_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  meta_description text,
  structured_data_recommendations jsonb not null default '[]',
  demand_evidence jsonb not null default '[]',
  model_name text,
  prompt_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.article_generation_runs (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.research_dossiers(id) on delete restrict,
  automation_run_id uuid not null unique references public.automation_runs(id) on delete restrict,
  article_id uuid references public.articles(id) on delete set null,
  status public.automation_run_status not null default 'queued',
  model_name text not null,
  prompt_version text not null,
  generated_payload jsonb,
  sanitized_markdown text check (sanitized_markdown is null or sanitized_markdown !~* '<(script|iframe|object|embed|form)'),
  source_claim_ids uuid[] not null default '{}',
  retry_count integer not null default 0 check (retry_count between 0 and 10),
  error_message text check (error_message is null or length(error_message) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.fact_check_runs (
  id uuid primary key default gen_random_uuid(),
  article_generation_run_id uuid not null references public.article_generation_runs(id) on delete cascade,
  automation_run_id uuid not null unique references public.automation_runs(id) on delete restrict,
  article_id uuid references public.articles(id) on delete cascade,
  status public.automation_run_status not null default 'queued',
  model_name text not null,
  prompt_version text not null,
  results jsonb not null default '{}',
  critical_blockers jsonb not null default '[]',
  approval_blocked boolean not null default true,
  checked_at timestamptz,
  error_message text check (error_message is null or length(error_message) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.thumbnail_assets (
  id uuid primary key default gen_random_uuid(),
  article_generation_run_id uuid references public.article_generation_runs(id) on delete set null,
  article_id uuid references public.articles(id) on delete cascade,
  private_storage_path text,
  public_path text,
  content_hash text,
  width integer not null default 1200 check (width > 0),
  height integer not null default 675 check (height > 0),
  mime_type text not null check (mime_type in ('image/webp', 'image/avif')),
  byte_size integer not null check (byte_size > 0),
  alt_text text not null,
  template_version text not null,
  status text not null check (status in ('generated', 'approved', 'rejected', 'promoted')),
  approved_by uuid references public.staff_profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint thumbnail_asset_target check (article_generation_run_id is not null or article_id is not null),
  constraint thumbnail_public_path check (public_path is null or public_path like '/uploads/%')
);

create table public.review_comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references public.articles(id) on delete cascade,
  topic_candidate_id uuid references public.topic_candidates(id) on delete cascade,
  dossier_id uuid references public.research_dossiers(id) on delete cascade,
  author_id uuid not null references public.staff_profiles(id) on delete restrict,
  body text not null check (length(btrim(body)) between 2 and 5000),
  section_key text,
  resolution_status text not null default 'open' check (resolution_status in ('open', 'resolved', 'dismissed')),
  resolved_by uuid references public.staff_profiles(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint review_comment_target check (num_nonnulls(article_id, topic_candidate_id, dossier_id) = 1)
);

create index topic_candidates_status_score_idx on public.topic_candidates(status, discovered_at desc);
create index research_dossiers_topic_idx on public.research_dossiers(topic_candidate_id, created_at desc);
create index source_snapshots_dossier_idx on public.research_source_snapshots(dossier_id, source_priority);
create index claim_evidence_dossier_result_idx on public.claim_evidence(dossier_id, verification_result);
create index generation_runs_article_idx on public.article_generation_runs(article_id, created_at desc);
create index fact_check_runs_article_idx on public.fact_check_runs(article_id, created_at desc);
create index automation_runs_status_idx on public.automation_runs(status, created_at);
create index review_comments_article_idx on public.review_comments(article_id, created_at);

create or replace function private.audit_automation_change()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  entity_id text := coalesce(new.id, old.id)::text;
  state text := coalesce(to_jsonb(new)->>'status', to_jsonb(old)->>'status');
begin
  insert into public.audit_log(actor_id, action, entity_type, entity_id, details)
  values ((select auth.uid()), lower(tg_op), tg_table_name, entity_id, jsonb_build_object('status', state));
  return coalesce(new, old);
end;
$$;

create or replace function private.ai_topic_review_gate()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  dossier_id uuid;
  generation_id uuid;
  latest_check public.fact_check_runs%rowtype;
begin
  if new.status not in ('needs_review', 'approved') or new.status = old.status then
    return new;
  end if;

  select rd.id into dossier_id
  from public.research_dossiers rd
  where rd.topic_candidate_id = new.id
  order by rd.created_at desc
  limit 1;
  if dossier_id is null then raise exception 'A completed research dossier is required before review'; end if;

  select agr.id into generation_id
  from public.article_generation_runs agr
  where agr.dossier_id = dossier_id and agr.status = 'succeeded'
  order by agr.created_at desc
  limit 1;
  if generation_id is null then raise exception 'A successful generated draft is required before review'; end if;

  select * into latest_check
  from public.fact_check_runs fcr
  where fcr.article_generation_run_id = generation_id and fcr.status = 'succeeded'
  order by fcr.created_at desc
  limit 1;
  if latest_check.id is null or latest_check.approval_blocked or jsonb_array_length(latest_check.critical_blockers) > 0 then
    raise exception 'Critical unsupported claims block review and approval';
  end if;
  if exists (
    select 1 from public.claim_evidence ce
    where ce.dossier_id = dossier_id and ce.is_critical
      and ce.verification_result in ('unverified', 'contradicted', 'outdated')
  ) then
    raise exception 'Critical claim evidence is unresolved';
  end if;

  if new.status = 'approved' and (
    (select auth.uid()) is null
    or not private.has_permission('automation.review')
  ) then
    raise exception 'AI topic approval requires an authenticated human reviewer';
  end if;
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'automation_runs','topic_candidates','topic_scores','research_runs','research_dossiers',
    'claim_evidence','keyword_clusters','article_generation_runs','fact_check_runs',
    'thumbnail_assets','review_comments'
  ] loop
    execute format('create trigger %I_updated_at before update on public.%I for each row execute function private.set_updated_at()', table_name, table_name);
    execute format('create trigger %I_audit after insert or update or delete on public.%I for each row execute function private.audit_automation_change()', table_name, table_name);
  end loop;
end;
$$;

create trigger research_source_snapshots_audit
after insert or update or delete on public.research_source_snapshots
for each row execute function private.audit_automation_change();
create trigger topic_candidates_review_gate
before update of status on public.topic_candidates
for each row execute function private.ai_topic_review_gate();

alter table public.automation_runs enable row level security;
alter table public.topic_candidates enable row level security;
alter table public.topic_scores enable row level security;
alter table public.research_runs enable row level security;
alter table public.research_dossiers enable row level security;
alter table public.research_source_snapshots enable row level security;
alter table public.claim_evidence enable row level security;
alter table public.keyword_clusters enable row level security;
alter table public.article_generation_runs enable row level security;
alter table public.fact_check_runs enable row level security;
alter table public.thumbnail_assets enable row level security;
alter table public.review_comments enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'automation_runs','topic_candidates','topic_scores','research_runs','research_dossiers',
    'research_source_snapshots','claim_evidence','keyword_clusters','article_generation_runs',
    'fact_check_runs','thumbnail_assets','review_comments'
  ] loop
    execute format('create policy "automation reviewers view %1$s" on public.%1$I for select to authenticated using (private.has_permission(''automation.view''))', table_name);
    execute format('create policy "automation managers insert %1$s" on public.%1$I for insert to authenticated with check (private.has_permission(''automation.manage''))', table_name);
    execute format('create policy "automation managers update %1$s" on public.%1$I for update to authenticated using (private.has_permission(''automation.manage'')) with check (private.has_permission(''automation.manage''))', table_name);
  end loop;
end;
$$;

create policy "reviewers create their own comments" on public.review_comments for insert to authenticated
with check (private.has_permission('automation.review') and author_id = (select auth.uid()));
create policy "reviewers update their own comments" on public.review_comments for update to authenticated
using (private.has_permission('automation.review') and author_id = (select auth.uid()))
with check (private.has_permission('automation.review') and author_id = (select auth.uid()));

revoke all on public.automation_runs, public.topic_candidates, public.topic_scores, public.research_runs,
  public.research_dossiers, public.research_source_snapshots, public.claim_evidence, public.keyword_clusters,
  public.article_generation_runs, public.fact_check_runs, public.thumbnail_assets, public.review_comments
from anon, authenticated;

grant select, insert, update on public.automation_runs, public.topic_candidates, public.topic_scores,
  public.research_runs, public.research_dossiers, public.research_source_snapshots, public.claim_evidence,
  public.keyword_clusters, public.article_generation_runs, public.fact_check_runs, public.thumbnail_assets,
  public.review_comments to authenticated;
grant select, insert, update, delete on public.automation_runs, public.topic_candidates, public.topic_scores,
  public.research_runs, public.research_dossiers, public.research_source_snapshots, public.claim_evidence,
  public.keyword_clusters, public.article_generation_runs, public.fact_check_runs, public.thumbnail_assets,
  public.review_comments to service_role;
grant execute on function private.audit_automation_change() to service_role;
revoke execute on function private.audit_automation_change() from public, anon, authenticated;
revoke execute on function private.ai_topic_review_gate() from public, anon, authenticated;
