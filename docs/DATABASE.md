# Database and migrations

The first additive migration is `supabase/migrations/20260717143337_editorial_foundation.sql`.

## Main record groups

- Identity and authorization: staff profiles, public profiles, roles, permissions and user-role assignments.
- Content: articles, translation groups, active/inactive sections, job details and scheme details.
- Verification: structured sources, claim checks, approvals and revisions.
- Accountability: workflow events, corrections, reader reports, publication events and immutable audit entries.

Every table in the exposed `public` schema has RLS. No editorial table is granted to `anon`. Authenticated grants make a table reachable, while policies still decide which rows and actions the current staff member may use.

## Current status and future migrations

Citizen Affairs currently has no live Supabase project; the previous project was deleted. The files under `supabase/migrations/` describe the intended schema but are not proof of an active database or applied production history.

For a replacement project:

1. Explicitly select and link the new Citizen Affairs project; never rely on a remembered project reference.
2. Review the migration list and apply each existing migration exactly once.
3. Run database advisors and test each role plus anonymous access before enabling any workflow.
4. For later changes, create a new migration with `npx supabase migration new descriptive_name` and test it locally or against a disposable branch.
5. Take a production backup and test its restore path before applying later migrations.

Changes to a used production database require a new migration; never edit an already-applied file. See [Backup and recovery](BACKUP-RECOVERY.md).
