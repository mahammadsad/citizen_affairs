# Local development

## Requirements

- Node.js 22 and npm
- Docker only if running the full local Supabase stack
- Supabase CLI through `npx supabase` when needed

## Public site

```bash
npm ci
npm run dev
```

Run `npm run validate` before committing. The generated site is in `dist/`.

## Local editorial backend

1. Run `npx supabase start`.
2. Run `npx supabase db reset` to apply migrations to the local database.
3. Copy only the displayed local URL and publishable key into an uncommitted `.env` file.
4. Never use the local secret key in a `PUBLIC_` variable.

The repository deliberately does not include production `.env` values. Use `npx supabase --help` before CLI operations because commands change over time.
