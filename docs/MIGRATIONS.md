# Migration guide

Use one migration for one reversible database change. Create it with `npx supabase migration new descriptive_name`; do not invent or reuse timestamps.

1. Work against local Supabase or a disposable branch/project.
2. Add constraints, RLS and explicit grants together with the table change.
3. Test as Writer, Reviewer, Publisher, suspended staff and anonymous caller.
4. Run database advisors and inspect any security/performance warnings.
5. Back up production, review the generated SQL and apply with `npx supabase db push`.
6. Verify row counts, policies, functions and the staff/public flows after deployment.

Prefer additive changes: new nullable column, backfill, validate, then make it required in a later migration. For destructive changes, write and test a restore path first. Never edit `20260717143337_editorial_foundation.sql` after it has been applied to a shared project.
