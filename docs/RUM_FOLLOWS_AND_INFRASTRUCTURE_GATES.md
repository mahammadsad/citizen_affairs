# RUM, follows and infrastructure decision gates

These are implementation specifications, not enabled products.

## Real-user Core Web Vitals

Prefer Search Console/CrUX when sufficient traffic exists. If privacy-reviewed first-party RUM is later approved, collect LCP, INP and CLS by page type, device class, language and coarse connection class; do not attach account, exact IP/location, full URL query, fingerprint or content entered by a reader. Report p75 with sample size and collection window. Lab budgets remain separate and must not be called field Core Web Vitals.

Enable RUM only after the event-dictionary approval gate, privacy notice, processor/endpoint, retention, deletion, access and security controls are recorded. Roll out disabled → internal test → small consented sample → reviewed production; document rollback.

## Topic/deadline follows

The safe current capability is device-local saving. Accounts, push and email reminders remain disabled. A future follow system requires a clear user benefit, explicit channel consent, verified topic/deadline source, expiry/withdrawal handling, frequency controls, unsubscribe/delete/export, delivery-failure handling, processor disclosure and protection against misleading stale reminders.

No reminder may outlive a withdrawn/cancelled record or substitute for the original official notice. Start with one channel only after a real owner, privacy review and end-to-end cancellation test exist.

## Supabase restoration gate

Do not restore Supabase merely because schemas exist. Require at least two real editorial users, approved roles/separation, assignment/audit need that Git cannot safely meet, RLS and backup/restore tests, secret rotation, cost/exit plan and named administration. Public static rendering must remain available if the editorial backend is unavailable.

## Header-capable hosting gate

Keep GitHub Pages while the site is static and low-risk. Reassess hosting only when approved forms, accounts, analytics/RUM, authenticated editorial APIs or central security logging require response-level CSP/HSTS/permissions/framing controls. Compare cost, operator skill, rollback, logs, custom domain/DNS, caching and lock-in. This gate does not select Cloudflare or any provider.
