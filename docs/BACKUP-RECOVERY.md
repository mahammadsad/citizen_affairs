# Backup and recovery

## What is backed up

- Git stores every published portable Markdown snapshot and code version.
- Supabase database backups cover drafts, approvals, audit history and publication events according to the selected plan.
- Private Storage needs a separate periodic export if it is not covered by the chosen recovery plan.

## Minimum routine

- Export the database with `supabase db dump` before migrations and at a regular interval.
- Store encrypted backups outside the live project and test a restore quarterly.
- Keep a copy of private editorial assets with matching paths.
- Never store database dumps or secret-containing configuration in this public repository.

## Recovery

For a bad public release, revert the GitHub pull request and redeploy. For lost editorial data, stop editing, identify the recovery point, restore to a separate project first, verify counts and permissions, then cut over. Record the incident and any manual publication-status correction in the audit process.
