-- Structured fields used by public government-job and welfare-scheme layouts.
alter table public.job_details
  add column if not exists fee_payment_deadline timestamptz;

alter table public.scheme_details
  add column if not exists eligible_regions text[] not null default '{}',
  add column if not exists application_deadline timestamptz,
  add column if not exists official_notification_url text;

create index if not exists job_details_fee_payment_deadline_idx
  on public.job_details (fee_payment_deadline)
  where fee_payment_deadline is not null;

create index if not exists scheme_details_application_deadline_idx
  on public.scheme_details (application_deadline)
  where application_deadline is not null;
