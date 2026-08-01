# Database and migrations

The first additive migration is `supabase/migrations/20260717143337_editorial_foundation.sql`.

## Main record groups

- Identity and authorization: staff profiles, public profiles, roles, permissions and user-role assignments.
- Content: articles, translation groups, active/inactive sections, job details and scheme details.
- Verification: structured sources, claim checks, approvals and revisions.
- Accountability: workflow events, corrections, reader reports, publication events and immutable audit entries.

Every table in the exposed `public` schema has RLS. No editorial table is granted to `anon`. Authenticated grants make a table reachable, while policies still decide which rows and actions the current staff member may use.

## Production and future migrations

The dedicated Citizen Affairs production project is `tbymfgorepzzewagivit`. The production release record includes the migration files currently under `supabase/migrations/`. Compare the live migration list before every database release and never reapply or edit a completed migration.

1. Take a production backup and test its restore path.
2. Create a new migration with `npx supabase migration new descriptive_name`.
3. Test it against local Supabase or a disposable branch.
4. Review the generated SQL and live migration list, then use `npx supabase db push` against the explicitly linked Citizen Affairs project.
5. Run database advisors and test each role plus anonymous access.

Changes to a used production database require a new migration; never edit an already-applied file. See [Backup and recovery](BACKUP-RECOVERY.md).
