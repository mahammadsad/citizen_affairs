# Release process

1. Open a focused draft pull request from a branch based on current `main`.
2. Run the full repository validation and secret scan; record exact results in the PR.
3. Obtain a human code review. Editorial content also needs a writer-independent reviewer recorded for the current version before it can claim completed independent review or Officially Confirmed status.
4. Resolve material review findings and rerun affected checks.
5. Confirm rollback: the previous production commit is known and can be redeployed; no migration or personal-data dependency is hidden in the change.
6. Merge only through the protected human workflow. Automation may open draft PRs but must not merge them.
7. Verify the deployment and key routes, record the deployed commit, and update the changelog/operational status when behaviour changed.

## Auto-merge prerequisites

Auto-merge remains disabled. It may be reconsidered only after branch protection is evidenced, two real reviewers are available with separation of duties, required checks cannot be bypassed by the author, rollback has been drilled, and the owner approves the change. Generated editorial work must remain draft-only even if repository automation changes later.

No release step in this document authorizes deployment, DNS changes, Search Console actions, database changes, or publication of an article.
