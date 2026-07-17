alter table public.staff_public_profiles
  add column display_name text;

update public.staff_public_profiles
set display_name = initcap(replace(slug, '-', ' '))
where display_name is null;

alter table public.staff_public_profiles
  alter column display_name set not null,
  add constraint staff_public_profiles_display_name_not_blank
    check (nullif(btrim(display_name), '') is not null);

create unique index publication_events_one_active_version_idx
  on public.publication_events(article_id, article_version)
  where status in ('requested', 'building', 'deployed');
