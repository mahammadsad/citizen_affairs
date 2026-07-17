# Roles and permissions

Public titles and technical permissions are separate.

| Role | Main abilities | Explicit limits |
|---|---|---|
| Writer | Create/edit own drafts, attach sources, submit | Cannot approve, fact-check own work or publish |
| Section Editor | Assign, edit section work, request changes, editorial approval | Cannot perform final publication |
| Fact Checker | Verify sources/claims and fact-check approval | Cannot verify own article or publish |
| Copy Reviewer | Copy/translation review and requested changes | Cannot silently change verified facts |
| Managing Editor | Final approval, corrections and withdrawals | Needs other required approvals |
| Publisher | Schedule, publish and unpublish approved versions | Cannot bypass missing approvals or sources |
| Administrator | Users, roles, audit and integrations | No automatic editorial authorship |
| Owner | Emergency full permission collection | Reserve for owner and one backup |

Permissions are seeded as configurable rows, including `article.create`, `article.fact_check`, `article.approve_final`, `article.publish`, `role.assign`, `audit.view` and `integration.manage`. The database checks permissions; hiding a button is not security.
