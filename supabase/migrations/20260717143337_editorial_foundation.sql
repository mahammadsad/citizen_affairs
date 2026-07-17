-- Citizen Affairs India editorial foundation
-- This migration is additive and intentionally exposes no editorial data to anon.

create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke usage, select on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;

create type public.editorial_content_type as enum ('job', 'scheme', 'explainer');
create type public.editorial_language as enum ('en', 'bn', 'hi');
create type public.staff_account_status as enum ('invited', 'active', 'suspended', 'disabled');
create type public.editorial_workflow_status as enum (
  'idea', 'assigned', 'draft', 'submitted', 'editorial-review',
  'changes-requested', 'fact-checking', 'verification-failed', 'copy-review',
  'final-review', 'approved', 'scheduled', 'published',
  're-verification-due', 'updating', 'corrected', 'closed', 'withdrawn', 'archived'
);
create type public.public_verification_status as enum (
  'officially-confirmed', 'partially-confirmed', 'under-verification',
  'corrected', 'closed', 'withdrawn'
);
create type public.approval_stage as enum ('editorial', 'fact-check', 'copy', 'final');
create type public.approval_decision as enum ('approved', 'rejected', 'changes-requested');
create type public.publication_status as enum ('requested', 'building', 'deployed', 'failed', 'cancelled');

create table public.permissions (
  key text primary key check (key ~ '^[a-z_]+\.[a-z_]+$'),
  description text not null
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_key text not null references public.permissions(key) on delete cascade,
  primary key (role_id, permission_key)
);

create table public.staff_profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  full_name text not null,
  department text,
  supervisor_id uuid references public.staff_profiles(id) on delete set null,
  account_status public.staff_account_status not null default 'invited',
  joined_at date,
  two_factor_required boolean not null default false,
  suspended_at timestamptz,
  suspended_by uuid references auth.users(id) on delete set null,
  suspension_reason text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.staff_public_profiles (
  staff_id uuid primary key references public.staff_profiles(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  public_role text not null,
  biography text,
  profile_image_path text,
  areas_of_expertise text[] not null default '{}',
  languages text[] not null default '{}',
  sections_covered text[] not null default '{}',
  verification_methodology text,
  social_links jsonb not null default '{}',
  is_published boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references public.staff_profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create table public.sections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name jsonb not null,
  is_active boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.translation_groups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  content_type public.editorial_content_type not null,
  language public.editorial_language not null,
  translation_group_id uuid not null references public.translation_groups(id) on delete restrict,
  title text not null,
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  short_description text not null,
  body_markdown text not null default '',
  primary_section_id uuid not null references public.sections(id) on delete restrict,
  subsection text,
  author_id uuid not null references public.staff_profiles(id) on delete restrict,
  assigned_editor_id uuid references public.staff_profiles(id) on delete restrict,
  assigned_fact_checker_id uuid references public.staff_profiles(id) on delete restrict,
  assigned_copy_reviewer_id uuid references public.staff_profiles(id) on delete restrict,
  assigned_reviewer_id uuid references public.staff_profiles(id) on delete restrict,
  assigned_publisher_id uuid references public.staff_profiles(id) on delete restrict,
  workflow_status public.editorial_workflow_status not null default 'draft',
  verification_status public.public_verification_status not null default 'under-verification',
  last_transition_reason text,
  publication_date timestamptz,
  scheduled_publication_date timestamptz,
  updated_date timestamptz not null default now(),
  last_verified_date timestamptz,
  next_review_date timestamptz,
  featured boolean not null default false,
  featured_image_path text,
  featured_image_alt text,
  seo_title text,
  seo_description text,
  canonical_url text,
  tags text[] not null default '{}',
  government_level text check (government_level in ('central', 'state')),
  state_or_ut text,
  structured_payload jsonb not null default '{}',
  version integer not null default 1 check (version > 0),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint articles_featured_image_alt check (featured_image_path is null or nullif(btrim(featured_image_alt), '') is not null),
  constraint articles_schedule check (scheduled_publication_date is null or workflow_status in ('approved', 'scheduled', 'published')),
  constraint articles_next_review check (next_review_date is null or last_verified_date is null or next_review_date > last_verified_date)
);
create unique index articles_language_slug_unique on public.articles(language, slug) where deleted_at is null;
create index articles_translation_group_idx on public.articles(translation_group_id);
create index articles_workflow_idx on public.articles(workflow_status) where deleted_at is null;
create index articles_author_idx on public.articles(author_id) where deleted_at is null;
create index articles_review_due_idx on public.articles(next_review_date) where deleted_at is null;

create table public.job_details (
  article_id uuid primary key references public.articles(id) on delete cascade,
  recruiting_organization text not null,
  post_name text not null,
  notification_number text not null,
  notification_date date not null,
  department text,
  employment_type text,
  total_vacancies integer not null check (total_vacancies >= 0),
  category_wise_vacancies jsonb not null default '{}',
  qualification text[] not null,
  experience_requirement text,
  minimum_age integer check (minimum_age >= 0),
  maximum_age integer check (maximum_age >= minimum_age),
  age_calculation_date date,
  age_relaxation text[] not null default '{}',
  salary_minimum numeric check (salary_minimum >= 0),
  salary_maximum numeric check (salary_maximum >= salary_minimum),
  salary_unit text check (salary_unit in ('monthly', 'annual', 'stipend')),
  pay_level text,
  application_fee jsonb not null default '{}',
  fee_exemptions text[] not null default '{}',
  application_start_date timestamptz,
  application_deadline timestamptz not null,
  correction_window jsonb not null default '{}',
  admit_card_date timestamptz,
  examination_date timestamptz,
  result_date timestamptz,
  selection_process text[] not null,
  job_location text[] not null default '{}',
  application_mode text not null check (application_mode in ('online', 'offline', 'both')),
  official_notification_url text not null,
  official_application_url text not null,
  recruitment_status text not null check (recruitment_status in ('upcoming', 'open', 'closing-soon', 'closed', 'admit-card-released', 'examination-completed', 'result-published', 'cancelled', 'withdrawn')),
  updated_at timestamptz not null default now(),
  constraint job_dates_valid check (application_start_date is null or application_deadline >= application_start_date)
);
create index job_deadline_idx on public.job_details(application_deadline);
create index job_status_idx on public.job_details(recruitment_status);

create table public.scheme_details (
  article_id uuid primary key references public.articles(id) on delete cascade,
  scheme_name text not null,
  alternative_names text[] not null default '{}',
  ministry text not null,
  department text,
  scheme_level text not null check (scheme_level in ('central', 'state')),
  launch_date date,
  target_beneficiaries text[] not null,
  benefit_types text[] not null,
  benefit_amount text,
  benefit_frequency text,
  minimum_age integer check (minimum_age >= 0),
  maximum_age integer check (maximum_age >= minimum_age),
  income_limit text,
  residence_requirement text,
  occupation_requirement text,
  social_category_conditions text,
  eligibility_criteria text[] not null,
  exclusion_conditions text[] not null default '{}',
  required_documents text[] not null default '{}',
  application_process text[] not null,
  application_mode text not null check (application_mode in ('online', 'offline', 'both')),
  official_portal text not null,
  helpline_information text[] not null default '{}',
  scheme_status text not null check (scheme_status in ('active', 'temporarily-paused', 'application-open', 'application-closed', 'state-dependent', 'under-revision', 'discontinued', 'withdrawn')),
  last_official_policy_update date,
  updated_at timestamptz not null default now()
);
create index scheme_status_idx on public.scheme_details(scheme_status);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  title text not null,
  url text not null,
  publishing_authority text not null,
  ministry_or_department text,
  document_number text,
  publication_date date,
  accessed_date date not null default current_date,
  source_type text not null,
  designation text not null check (designation in ('primary', 'secondary')),
  archived_url text,
  attachment_path text,
  notes text,
  verified_by uuid references public.staff_profiles(id) on delete restrict,
  verified_at timestamptz,
  created_by uuid not null references public.staff_profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);
create index sources_article_idx on public.sources(article_id);

create table public.claims (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  claim_text text not null,
  source_id uuid references public.sources(id) on delete restrict,
  verification_result text not null check (verification_result in ('confirmed', 'partially-confirmed', 'unconfirmed', 'contradicted')),
  fact_checker_id uuid not null references public.staff_profiles(id) on delete restrict,
  checked_at timestamptz not null default now(),
  notes text,
  confidence_status text check (confidence_status in ('complete', 'partial', 'insufficient'))
);
create index claims_article_idx on public.claims(article_id);

create table public.article_approvals (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  article_version integer not null,
  stage public.approval_stage not null,
  decision public.approval_decision not null,
  reviewer_id uuid not null references public.staff_profiles(id) on delete restrict,
  notes text,
  decided_at timestamptz not null default now(),
  invalidated_at timestamptz,
  invalidation_reason text,
  unique (article_id, article_version, stage, reviewer_id)
);
create index approvals_article_version_idx on public.article_approvals(article_id, article_version) where invalidated_at is null;

create table public.article_revisions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  version integer not null,
  snapshot jsonb not null,
  changed_by uuid not null references public.staff_profiles(id) on delete restrict,
  change_reason text not null,
  created_at timestamptz not null default now(),
  unique (article_id, version)
);

create table public.workflow_events (
  id bigint generated always as identity primary key,
  article_id uuid not null references public.articles(id) on delete cascade,
  from_status public.editorial_workflow_status,
  to_status public.editorial_workflow_status not null,
  actor_id uuid references auth.users(id) on delete set null,
  reason text not null,
  article_version integer not null,
  created_at timestamptz not null default now()
);
create index workflow_events_article_idx on public.workflow_events(article_id, created_at desc);

create table public.corrections (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete restrict,
  incorrect_information text not null,
  corrected_information text not null,
  reason text not null,
  supporting_source_url text not null,
  status text not null check (status in ('reviewing', 'corrected', 'withdrawn')),
  approved_by uuid references public.staff_profiles(id) on delete restrict,
  published_at timestamptz,
  created_by uuid not null references public.staff_profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.correction_reports (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references public.articles(id) on delete set null,
  article_url text not null,
  reported_issue text not null,
  supporting_official_source text,
  contact_email text,
  privacy_consent boolean not null,
  status text not null default 'new' check (status in ('new', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

create table public.publication_events (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete restrict,
  article_version integer not null,
  status public.publication_status not null default 'requested',
  requested_by uuid not null references public.staff_profiles(id) on delete restrict,
  github_run_id text,
  commit_sha text,
  deployment_url text,
  error_message text,
  requested_at timestamptz not null default now(),
  completed_at timestamptz
);
create index publication_events_article_idx on public.publication_events(article_id, requested_at desc);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index audit_log_entity_idx on public.audit_log(entity_type, entity_id, created_at desc);

insert into public.permissions(key, description) values
  ('article.create', 'Create article drafts'),
  ('article.edit_own', 'Edit owned drafts'),
  ('article.edit_section', 'Edit articles in assigned sections'),
  ('article.edit_any', 'Edit any article'),
  ('article.assign', 'Assign editorial staff'),
  ('article.submit', 'Submit drafts for review'),
  ('article.request_changes', 'Return an article with requested changes'),
  ('article.fact_check', 'Record factual verification'),
  ('article.copy_review', 'Complete language and copy review'),
  ('article.approve_editorial', 'Approve editorial readiness'),
  ('article.approve_final', 'Approve final publication readiness'),
  ('article.schedule', 'Schedule approved content'),
  ('article.publish', 'Publish approved content'),
  ('article.unpublish', 'Remove published content'),
  ('article.correct', 'Issue corrections'),
  ('article.withdraw', 'Withdraw content'),
  ('article.archive', 'Archive content'),
  ('source.create', 'Create and attach sources'),
  ('source.verify', 'Verify sources'),
  ('user.view', 'View private staff profiles'),
  ('user.invite', 'Invite staff'),
  ('user.suspend', 'Suspend staff'),
  ('role.assign', 'Assign roles'),
  ('audit.view', 'View audit history'),
  ('settings.manage', 'Manage editorial settings'),
  ('integration.manage', 'Manage publishing integrations');

insert into public.roles(name, description, is_system) values
  ('writer', 'Create and submit drafts', true),
  ('section-editor', 'Assign and edit section content', true),
  ('fact-checker', 'Verify claims and sources', true),
  ('copy-reviewer', 'Review language, clarity and translations', true),
  ('managing-editor', 'Approve final editorial readiness', true),
  ('publisher', 'Schedule and publish approved content', true),
  ('administrator', 'Manage users, settings and audit records', true),
  ('owner', 'Emergency and organization-wide administration', true);

insert into public.role_permissions(role_id, permission_key)
select r.id, p.key
from public.roles r
join public.permissions p on
  (r.name = 'writer' and p.key in ('article.create','article.edit_own','article.submit','source.create')) or
  (r.name = 'section-editor' and p.key in ('article.create','article.edit_section','article.assign','article.request_changes','article.approve_editorial','source.create')) or
  (r.name = 'fact-checker' and p.key in ('article.fact_check','source.create','source.verify')) or
  (r.name = 'copy-reviewer' and p.key in ('article.copy_review','article.request_changes')) or
  (r.name = 'managing-editor' and p.key in ('article.edit_any','article.assign','article.request_changes','article.approve_final','article.correct','article.withdraw')) or
  (r.name = 'publisher' and p.key in ('article.schedule','article.publish','article.unpublish')) or
  (r.name = 'administrator' and p.key in ('user.view','user.invite','user.suspend','role.assign','audit.view','settings.manage','integration.manage')) or
  (r.name = 'owner');

insert into public.sections(slug, name, is_active, sort_order) values
  ('jobs', '{"en":"Government Jobs","bn":"সরকারি চাকরি","hi":"सरकारी नौकरियाँ"}', true, 10),
  ('projects', '{"en":"Welfare Schemes","bn":"জনকল্যাণ প্রকল্প","hi":"कल्याणकारी योजनाएँ"}', true, 20),
  ('student-hub', '{"en":"Student Hub","bn":"স্টুডেন্ট হাব","hi":"स्टूडेंट हब"}', false, 100);

create or replace function private.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1 from public.staff_profiles sp
      where sp.id = (select auth.uid()) and sp.account_status = 'active'
    );
$$;

create or replace function private.has_permission(requested_permission text)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select private.is_active_staff()
    and exists (
      select 1
      from public.user_roles ur
      join public.role_permissions rp on rp.role_id = ur.role_id
      where ur.user_id = (select auth.uid())
        and rp.permission_key = requested_permission
    );
$$;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.guard_approval()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  article_author uuid;
  required_permission text;
begin
  if (select auth.uid()) is null then return new; end if;
  if new.reviewer_id <> (select auth.uid()) then
    raise exception 'Reviewer identity must match the authenticated user';
  end if;
  select a.author_id into article_author from public.articles a where a.id = new.article_id;
  if article_author = new.reviewer_id then
    raise exception 'Authors cannot approve or fact-check their own work';
  end if;
  required_permission := case new.stage
    when 'editorial' then 'article.approve_editorial'
    when 'fact-check' then 'article.fact_check'
    when 'copy' then 'article.copy_review'
    when 'final' then 'article.approve_final'
  end;
  if not private.has_permission(required_permission) then
    raise exception 'Missing required permission: %', required_permission;
  end if;
  return new;
end;
$$;

create or replace function private.guard_article_update()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  actor uuid := (select auth.uid());
  factual_change boolean;
  required_permission text;
begin
  if actor is null then return new; end if;
  if not private.is_active_staff() then raise exception 'Active staff account required'; end if;
  if (
    old.author_id is distinct from new.author_id or
    old.assigned_editor_id is distinct from new.assigned_editor_id or
    old.assigned_fact_checker_id is distinct from new.assigned_fact_checker_id or
    old.assigned_copy_reviewer_id is distinct from new.assigned_copy_reviewer_id or
    old.assigned_reviewer_id is distinct from new.assigned_reviewer_id or
    old.assigned_publisher_id is distinct from new.assigned_publisher_id
  ) and not private.has_permission('article.assign') then
    raise exception 'Missing article.assign permission';
  end if;

  factual_change :=
    old.title is distinct from new.title or
    old.short_description is distinct from new.short_description or
    old.body_markdown is distinct from new.body_markdown or
    old.structured_payload is distinct from new.structured_payload or
    old.canonical_url is distinct from new.canonical_url;

  if factual_change then
    if actor = old.author_id and old.workflow_status not in ('draft', 'changes-requested', 'updating')
      and not private.has_permission('article.edit_section') and not private.has_permission('article.edit_any') then
      raise exception 'Writers can only change factual content in draft, changes-requested, or updating status';
    end if;
    if actor <> old.author_id and not private.has_permission('article.edit_section') and not private.has_permission('article.edit_any') then
      raise exception 'Reviewers and fact checkers cannot directly alter factual article content';
    end if;
    new.version := old.version + 1;
    new.last_verified_date := null;
    if new.verification_status = 'officially-confirmed' then
      new.verification_status := 'under-verification';
    end if;
  end if;

  if old.workflow_status is distinct from new.workflow_status then
    if nullif(btrim(new.last_transition_reason), '') is null then
      raise exception 'Every workflow transition requires a written reason';
    end if;
    required_permission := case new.workflow_status
      when 'submitted' then 'article.submit'
      when 'editorial-review' then 'article.approve_editorial'
      when 'changes-requested' then 'article.request_changes'
      when 'fact-checking' then 'article.approve_editorial'
      when 'copy-review' then 'article.copy_review'
      when 'final-review' then 'article.approve_final'
      when 'approved' then 'article.approve_final'
      when 'scheduled' then 'article.schedule'
      when 'published' then 'article.publish'
      when 'corrected' then 'article.correct'
      when 'withdrawn' then 'article.withdraw'
      when 'archived' then 'article.archive'
      else null
    end;
    if required_permission is not null and not private.has_permission(required_permission) then
      raise exception 'Missing required permission: %', required_permission;
    end if;
  end if;

  new.updated_date := now();
  return new;
end;
$$;

create or replace function private.enforce_publication_gate()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  missing_stage text;
begin
  if new.workflow_status not in ('approved', 'scheduled', 'published') then return new; end if;

  select required.stage::text into missing_stage
  from unnest(array['editorial','fact-check','final']::public.approval_stage[]) as required(stage)
  where not exists (
    select 1 from public.article_approvals aa
    where aa.article_id = new.id
      and aa.article_version = new.version
      and aa.stage = required.stage
      and aa.decision = 'approved'
      and aa.invalidated_at is null
  )
  limit 1;
  if missing_stage is not null then
    raise exception 'Required % approval is missing for article version %', missing_stage, new.version;
  end if;
  if not exists (select 1 from public.sources s where s.article_id = new.id and s.designation = 'primary') then
    raise exception 'Publication requires a primary source';
  end if;
  if new.content_type = 'job' and not exists (select 1 from public.job_details j where j.article_id = new.id) then
    raise exception 'Government job details are incomplete';
  end if;
  if new.content_type = 'scheme' and not exists (select 1 from public.scheme_details s where s.article_id = new.id) then
    raise exception 'Welfare scheme details are incomplete';
  end if;
  if new.workflow_status = 'published' and new.publication_date is null then
    new.publication_date := now();
  end if;
  return new;
end;
$$;

create or replace function private.bump_parent_article_version()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  parent_id uuid := coalesce(new.article_id, old.article_id);
begin
  update public.articles
    set version = version + 1,
        last_verified_date = null,
        verification_status = case
          when verification_status = 'officially-confirmed' then 'under-verification'::public.public_verification_status
          else verification_status
        end
    where id = parent_id;
  return coalesce(new, old);
end;
$$;

create or replace function private.record_article_change()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if old.version <> new.version then
    update public.article_approvals
      set invalidated_at = now(), invalidation_reason = 'Factual content changed'
      where article_id = new.id and article_version < new.version and invalidated_at is null;
  end if;
  if old.workflow_status is distinct from new.workflow_status then
    insert into public.workflow_events(article_id, from_status, to_status, actor_id, reason, article_version)
    values (new.id, old.workflow_status, new.workflow_status, (select auth.uid()), new.last_transition_reason, new.version);
  end if;
  insert into public.audit_log(actor_id, action, entity_type, entity_id, details)
  values ((select auth.uid()), 'article.updated', 'article', new.id::text, jsonb_build_object('version', new.version));
  return new;
end;
$$;

create or replace function private.prevent_audit_mutation()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  raise exception 'Audit records are immutable';
end;
$$;

create or replace function private.guard_publication_request()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  current_article public.articles%rowtype;
  missing_stage text;
begin
  if (select auth.uid()) is not null and new.requested_by <> (select auth.uid()) then
    raise exception 'Publication requester must match the authenticated user';
  end if;
  select * into current_article from public.articles where id = new.article_id and deleted_at is null;
  if current_article.id is null then raise exception 'Article does not exist'; end if;
  if current_article.workflow_status not in ('approved', 'scheduled') then
    raise exception 'Only approved or scheduled content can be published';
  end if;
  if new.article_version <> current_article.version then
    raise exception 'Publication request uses a stale article version';
  end if;
  if current_article.assigned_editor_id is null
    or current_article.assigned_fact_checker_id is null
    or current_article.assigned_reviewer_id is null
    or current_article.assigned_publisher_id is null then
    raise exception 'Writer, editor, fact-checker, reviewer and publisher attribution is required';
  end if;
  select required.stage::text into missing_stage
  from unnest(array['editorial','fact-check','final']::public.approval_stage[]) as required(stage)
  where not exists (
    select 1 from public.article_approvals aa
    where aa.article_id = new.article_id
      and aa.article_version = new.article_version
      and aa.stage = required.stage
      and aa.decision = 'approved'
      and aa.invalidated_at is null
  ) limit 1;
  if missing_stage is not null then
    raise exception 'Required % approval is missing for the current version', missing_stage;
  end if;
  if not exists (select 1 from public.sources s where s.article_id = new.article_id and s.designation = 'primary') then
    raise exception 'Publication requires a primary source';
  end if;
  if exists (
    select 1 from public.publication_events pe
    where pe.article_id = new.article_id and pe.article_version = new.article_version
      and pe.status in ('requested', 'building', 'deployed')
  ) then raise exception 'This article version already has an active publication event'; end if;
  return new;
end;
$$;

create trigger staff_profiles_updated_at before update on public.staff_profiles
for each row execute function private.set_updated_at();
create trigger staff_public_profiles_updated_at before update on public.staff_public_profiles
for each row execute function private.set_updated_at();
create trigger approval_guard before insert or update on public.article_approvals
for each row execute function private.guard_approval();
create trigger article_update_guard before update on public.articles
for each row execute function private.guard_article_update();
create trigger article_publication_gate before insert or update of workflow_status on public.articles
for each row execute function private.enforce_publication_gate();
create trigger article_change_audit after update on public.articles
for each row execute function private.record_article_change();
create trigger job_details_version after insert or update or delete on public.job_details
for each row execute function private.bump_parent_article_version();
create trigger scheme_details_version after insert or update or delete on public.scheme_details
for each row execute function private.bump_parent_article_version();
create trigger sources_version after insert or update or delete on public.sources
for each row execute function private.bump_parent_article_version();
create trigger publication_request_guard before insert on public.publication_events
for each row execute function private.guard_publication_request();
create trigger audit_log_immutable before update or delete on public.audit_log
for each row execute function private.prevent_audit_mutation();

alter table public.permissions enable row level security;
alter table public.roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.staff_public_profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.sections enable row level security;
alter table public.translation_groups enable row level security;
alter table public.articles enable row level security;
alter table public.job_details enable row level security;
alter table public.scheme_details enable row level security;
alter table public.sources enable row level security;
alter table public.claims enable row level security;
alter table public.article_approvals enable row level security;
alter table public.article_revisions enable row level security;
alter table public.workflow_events enable row level security;
alter table public.corrections enable row level security;
alter table public.correction_reports enable row level security;
alter table public.publication_events enable row level security;
alter table public.audit_log enable row level security;

create policy "staff can view sections" on public.sections for select to authenticated
using (private.is_active_staff());
create policy "staff can view permissions" on public.permissions for select to authenticated
using (private.is_active_staff());
create policy "staff can view roles" on public.roles for select to authenticated
using (private.is_active_staff());
create policy "staff can view role permissions" on public.role_permissions for select to authenticated
using (private.is_active_staff());
create policy "staff can view own role assignments" on public.user_roles for select to authenticated
using (user_id = (select auth.uid()) or private.has_permission('role.assign'));
create policy "administrators can assign roles" on public.user_roles for insert to authenticated
with check (private.has_permission('role.assign'));
create policy "administrators can remove roles" on public.user_roles for delete to authenticated
using (private.has_permission('role.assign'));
create policy "staff can view own private profile" on public.staff_profiles for select to authenticated
using (id = (select auth.uid()) or private.has_permission('user.view'));
create policy "staff can update own public profile" on public.staff_public_profiles for update to authenticated
using (staff_id = (select auth.uid())) with check (staff_id = (select auth.uid()));
create policy "staff can view public profiles" on public.staff_public_profiles for select to authenticated
using (private.is_active_staff());

create policy "staff can view translation groups" on public.translation_groups for select to authenticated
using (private.is_active_staff());
create policy "writers can create translation groups" on public.translation_groups for insert to authenticated
with check (private.has_permission('article.create'));

create policy "staff article visibility" on public.articles for select to authenticated
using (
  author_id = (select auth.uid())
  or assigned_editor_id = (select auth.uid())
  or assigned_fact_checker_id = (select auth.uid())
  or assigned_copy_reviewer_id = (select auth.uid())
  or assigned_reviewer_id = (select auth.uid())
  or assigned_publisher_id = (select auth.uid())
  or private.has_permission('article.edit_any')
  or private.has_permission('audit.view')
);
create policy "writers create own drafts" on public.articles for insert to authenticated
with check (
  private.has_permission('article.create')
  and author_id = (select auth.uid())
  and workflow_status in ('idea', 'assigned', 'draft')
  and deleted_at is null
);
create policy "authorized staff update articles" on public.articles for update to authenticated
using (
  (author_id = (select auth.uid()) and private.has_permission('article.edit_own'))
  or private.has_permission('article.edit_section')
  or private.has_permission('article.edit_any')
  or private.has_permission('article.fact_check')
  or private.has_permission('article.copy_review')
  or private.has_permission('article.schedule')
  or private.has_permission('article.publish')
)
with check (deleted_at is null or private.has_permission('article.archive'));

create policy "staff view job details" on public.job_details for select to authenticated
using (exists (select 1 from public.articles a where a.id = article_id));
create policy "editors manage job details" on public.job_details for all to authenticated
using (
  exists (select 1 from public.articles a where a.id = article_id and a.author_id = (select auth.uid()) and private.has_permission('article.edit_own'))
  or private.has_permission('article.edit_section') or private.has_permission('article.edit_any')
)
with check (
  exists (select 1 from public.articles a where a.id = article_id and a.author_id = (select auth.uid()) and private.has_permission('article.edit_own'))
  or private.has_permission('article.edit_section') or private.has_permission('article.edit_any')
);
create policy "staff view scheme details" on public.scheme_details for select to authenticated
using (exists (select 1 from public.articles a where a.id = article_id));
create policy "editors manage scheme details" on public.scheme_details for all to authenticated
using (
  exists (select 1 from public.articles a where a.id = article_id and a.author_id = (select auth.uid()) and private.has_permission('article.edit_own'))
  or private.has_permission('article.edit_section') or private.has_permission('article.edit_any')
)
with check (
  exists (select 1 from public.articles a where a.id = article_id and a.author_id = (select auth.uid()) and private.has_permission('article.edit_own'))
  or private.has_permission('article.edit_section') or private.has_permission('article.edit_any')
);

create policy "staff view article sources" on public.sources for select to authenticated
using (exists (select 1 from public.articles a where a.id = article_id));
create policy "authorized staff create sources" on public.sources for insert to authenticated
with check (private.has_permission('source.create') and created_by = (select auth.uid()));
create policy "source verifiers update sources" on public.sources for update to authenticated
using (created_by = (select auth.uid()) or private.has_permission('source.verify'))
with check (created_by = (select auth.uid()) or private.has_permission('source.verify'));

create policy "staff view claims" on public.claims for select to authenticated
using (exists (select 1 from public.articles a where a.id = article_id));
create policy "fact checkers create claims" on public.claims for insert to authenticated
with check (private.has_permission('article.fact_check') and fact_checker_id = (select auth.uid()));
create policy "staff view approvals" on public.article_approvals for select to authenticated
using (exists (select 1 from public.articles a where a.id = article_id));
create policy "reviewers record approvals" on public.article_approvals for insert to authenticated
with check (reviewer_id = (select auth.uid()) and private.is_active_staff());
create policy "reviewers update own approvals" on public.article_approvals for update to authenticated
using (reviewer_id = (select auth.uid())) with check (reviewer_id = (select auth.uid()));

create policy "staff view revisions" on public.article_revisions for select to authenticated
using (exists (select 1 from public.articles a where a.id = article_id));
create policy "editors create revisions" on public.article_revisions for insert to authenticated
with check (changed_by = (select auth.uid()) and private.is_active_staff());
create policy "staff view workflow events" on public.workflow_events for select to authenticated
using (exists (select 1 from public.articles a where a.id = article_id));
create policy "staff view corrections" on public.corrections for select to authenticated
using (private.is_active_staff());
create policy "managing editors create corrections" on public.corrections for insert to authenticated
with check (private.has_permission('article.correct') and created_by = (select auth.uid()));
create policy "staff view correction reports" on public.correction_reports for select to authenticated
using (private.has_permission('article.correct') or private.has_permission('audit.view'));
create policy "publishers view publication events" on public.publication_events for select to authenticated
using (private.has_permission('article.publish') or private.has_permission('audit.view'));
create policy "publishers request publication" on public.publication_events for insert to authenticated
with check (private.has_permission('article.publish') and requested_by = (select auth.uid()));
create policy "auditors view audit log" on public.audit_log for select to authenticated
using (private.has_permission('audit.view'));

grant usage on schema public, private to authenticated, service_role;
grant execute on function private.is_active_staff() to authenticated, service_role;
grant execute on function private.has_permission(text) to authenticated, service_role;
revoke execute on all functions in schema private from public, anon;

grant select on public.permissions, public.roles, public.role_permissions, public.sections to authenticated;
grant select, insert, delete on public.user_roles to authenticated;
grant select on public.staff_profiles to authenticated;
grant select, update on public.staff_public_profiles to authenticated;
grant select, insert on public.translation_groups to authenticated;
grant select, insert, update on public.articles to authenticated;
grant select, insert, update, delete on public.job_details, public.scheme_details to authenticated;
grant select, insert, update on public.sources, public.claims, public.article_approvals to authenticated;
grant select, insert on public.article_revisions, public.corrections, public.publication_events to authenticated;
grant select on public.workflow_events, public.correction_reports, public.audit_log to authenticated;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values (
  'editorial-assets',
  'editorial-assets',
  false,
  5242880,
  array['image/jpeg','image/png','image/webp','image/avif','application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "active staff read editorial assets" on storage.objects for select to authenticated
using (bucket_id = 'editorial-assets' and private.is_active_staff());
create policy "source creators upload editorial assets" on storage.objects for insert to authenticated
with check (bucket_id = 'editorial-assets' and private.has_permission('source.create'));
create policy "asset owners update editorial assets" on storage.objects for update to authenticated
using (bucket_id = 'editorial-assets' and owner_id = (select auth.uid()::text))
with check (bucket_id = 'editorial-assets' and owner_id = (select auth.uid()::text));
