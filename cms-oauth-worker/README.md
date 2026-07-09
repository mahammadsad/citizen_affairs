# CMS Login Setup (one-time, ~10 minutes)

Your site itself stays 100% on GitHub Pages. This Worker is the *only*
server-side piece in the whole project, and it does exactly one job:
turn a GitHub login into a token the CMS can use to commit files.

## 1. Create a GitHub OAuth App

1. Go to https://github.com/settings/developers -> **OAuth Apps** -> **New OAuth App**
2. Fill in:
   - **Application name**: anything, e.g. `Sarkari Tathya Kendra CMS`
   - **Homepage URL**: `https://mahammadsad.github.io/sarkari-tathya-kendra/`
   - **Authorization callback URL**: leave a placeholder for now, e.g.
     `https://example.com/callback` — you'll come back and fix this in step 3.
3. Click **Register application**.
4. Copy the **Client ID** shown on the page.
5. Click **Generate a new client secret**, and copy it immediately (GitHub
   only shows it once).

## 2. Deploy the Worker

1. Go to https://dash.cloudflare.com -> sign up free if you don't have an account.
2. Go to **Workers & Pages** -> **Create** -> **Create Worker**.
3. Give it any name (e.g. `sarkari-cms-auth`) -> **Deploy** (deploys a blank starter first).
4. Click **Edit code**. Delete everything in the editor, paste in the full
   contents of `worker.js` from this folder, then click **Deploy**.
5. Note the URL Cloudflare gives your worker, e.g.
   `https://sarkari-cms-auth.your-subdomain.workers.dev`

## 3. Connect the two

1. Back in your GitHub OAuth App settings (step 1), edit the
   **Authorization callback URL** to:
   `https://sarkari-cms-auth.your-subdomain.workers.dev/callback`
   (your actual worker URL + `/callback`) and save.
2. In the Cloudflare dashboard, open your Worker -> **Settings** ->
   **Variables** -> **Add variable**, add two, both encrypted:
   - `GITHUB_CLIENT_ID` = the Client ID from step 1
   - `GITHUB_CLIENT_SECRET` = the Client secret from step 1
3. Open `public/admin/config.yml` in your project and replace:
   ```yaml
   base_url: https://REPLACE-WITH-YOUR-WORKER.workers.dev
   ```
   with your actual worker URL (no trailing slash, no `/callback`).
4. Commit and push that change.

## 4. Test it

Visit `https://mahammadsad.github.io/sarkari-tathya-kendra/admin/` and
click **Login with GitHub**. You'll be sent to GitHub, asked to authorize
the app, then dropped back into the CMS logged in.

**Note:** whoever logs in needs push access to the
`mahammadsad/sarkari-tathya-kendra` repo — Decap CMS commits as that
GitHub user directly. There's no separate CMS user system to manage.
