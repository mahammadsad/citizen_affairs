# Security guide

- RLS is enabled on every editorial table; `anon` has no editorial data grants.
- User authorization is stored in database role assignments, never editable user metadata.
- Security-definer helpers live in a non-exposed `private` schema, set a safe search path and have explicit execute grants.
- Browser code uses only a publishable key. Secret/service-role keys are server-only.
- Private uploads use the `editorial-assets` bucket with staff/permission policies and size/MIME checks.
- Audit records are immutable; content deletion is soft.
- Privileged accounts should enable MFA in Supabase Auth and use short sessions.
- Publication inputs are validated again at the database, Edge Function, exporter and static-site levels.

Before production, run Supabase database advisors, test every role with separate accounts, disable open sign-up, configure an SMTP provider and review allowed redirect URLs. Report suspected key exposure by rotating the key first, then reviewing logs.
