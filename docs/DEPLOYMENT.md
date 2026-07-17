# Deployment

## Public site

GitHub Actions validates pull requests and deploys `main` to GitHub Pages. Configure the Pages source as **GitHub Actions** and point the custom domain to `https://citizenaffairs.in` as appropriate. The site reads its origin from `brand.config.json`.

## One-time editorial setup

1. Create a dedicated Citizen Affairs Supabase project.
2. Apply the migration and deploy `publish-content` and `deployment-callback` Edge Functions.
3. Disable public sign-up; create the owner and backup accounts; publish their public profiles; assign roles.
4. Add variables listed in [Environment](ENVIRONMENT.md).
5. Create a fine-grained GitHub token limited to this repository with Contents and Pull Requests write access. Store it in Supabase as `GITHUB_DISPATCH_TOKEN` and in GitHub as `EDITORIAL_GITHUB_TOKEN`.
6. Add `SUPABASE_URL` and `SUPABASE_SECRET_KEY` to GitHub Actions secrets.
7. Protect `main`: required PR, required `build` check, stale-approval dismissal, latest-push approval, no force push and no deletion.
8. Test with separate Writer, Fact Checker and Publisher accounts before real content.

The callback sets an article to Published only after a successful Pages deployment. Failed exports/builds/deployments set the publication event to Failed.
