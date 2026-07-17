# Database and migrations

The first additive migration is `supabase/migrations/20260717143337_editorial_foundation.sql`.

## Main record groups

- Identity and authorization: staff profiles, public profiles, roles, permissions and user-role assignments.
- Content: articles, translation groups, active/inactive sections, job details and scheme details.
- Verification: structured sources, claim checks, approvals and revisions.
- Accountability: workflow events, corrections, reader reports, publication events and immutable audit entries.

Every table in the exposed `public` schema has RLS. No editorial table is granted to `anon`. Authenticated grants make a table reachable, while policies still decide which rows and actions the current staff member may use.

## Applying safely

1. Create or explicitly identify the Citizen Affairs Supabase project.
2. Take a backup if it contains any data.
3. Link the repository with `npx supabase link`.
4. Review the migration, then use `npx supabase db push`.
5. Run database advisors and test each role. Do not apply this migration to the two unrelated connected projects.

Changes to a used production database require a new migration; never edit an already-applied file. See [Backup and recovery](BACKUP-RECOVERY.md).
