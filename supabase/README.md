# Supabase Setup

This folder contains the database schema, row-level security policies, workflow RPCs, and Edge Functions used by the Mele platform.

## Structure

```text
supabase/
  migrations/
    0001_initial_schema.sql
    0002_rls_policies.sql
    0003_workflow_functions.sql
    0004_p0_fixes.sql
    0005_daily_ritual_center.sql
    0006_match_sessions.sql
    0007_auth_signup_mirror.sql
    0008_teacher_website_application.sql
  functions/
    _shared/
    ecpay-checkout/
    ecpay-webhook/
    line-daily-push/
```

`calc-numerology` was an early prototype Edge Function and has been removed. All calculator traffic now goes through the Python API via the Next.js `/api/calc/*` rewrite.

## Apply Database Migrations

Use Supabase CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Or paste each migration into the Supabase SQL Editor in order:

1. `0001_initial_schema.sql`
2. `0002_rls_policies.sql`
3. `0003_workflow_functions.sql`
4. `0004_p0_fixes.sql`
5. `0005_daily_ritual_center.sql`
6. `0006_match_sessions.sql`
7. `0007_auth_signup_mirror.sql`
8. `0008_teacher_website_application.sql`

After applying migrations, create the first admin:

```sql
insert into public.admins (user_id, role)
values ('<your-auth-user-uuid>', 'super');
```

## Deploy Edge Functions

```bash
supabase functions deploy ecpay-checkout
supabase functions deploy ecpay-webhook --no-verify-jwt
supabase functions deploy line-daily-push
```

Required secrets:

```bash
supabase secrets set SUPABASE_URL=<project-url>
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
supabase secrets set ECPAY_MERCHANT_ID=<ecpay-merchant-id>
supabase secrets set ECPAY_HASH_KEY=<ecpay-hash-key>
supabase secrets set ECPAY_HASH_IV=<ecpay-hash-iv>
supabase secrets set ECPAY_CHECKOUT_URL=https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5
supabase secrets set ECPAY_RETURN_URL=<your-ecpay-webhook-url>
supabase secrets set MELE_WEB_URL=<your-production-web-url>
supabase secrets set LINE_CHANNEL_ACCESS_TOKEN=<line-channel-access-token>
```

## Storage Buckets

Create these buckets before public beta:

- `avatars`: public
- `teacher-docs`: private
- `teacher-portfolio`: public

## Auth Email and Redirects

Run the public Auth diagnostic before inviting testers:

```bash
npm run ops:check-auth
```

Then verify the cloud-only settings in Supabase Dashboard:

- Authentication -> URL Configuration -> Site URL includes the current site, for example `http://localhost:3000` during local testing.
- Authentication -> URL Configuration -> Redirect URLs includes `http://localhost:3000/**` and the production domain wildcard.
- Authentication -> Providers -> Email is enabled.
- Authentication -> Logs shows a successful signup confirmation email and password reset email.
- SMTP is configured before public beta, or the team explicitly accepts Supabase default email limits for closed testing.

See `docs/SUPABASE_AUTH_EMAIL_RUNBOOK.md` for the exact troubleshooting flow when a user does not receive a confirmation email.

## Launch Verification

Before public beta, verify:

- All eight migrations are applied to the production Supabase project.
- RLS is enabled and normal users cannot read admin-only rows.
- Auth confirmation email, resend confirmation, password reset, and `/auth/callback` all work with a real mailbox.
- `ecpay-checkout` creates an ECPay sandbox form.
- `ecpay-webhook` receives sandbox payment callbacks and updates `bookings.status`.
- `line-daily-push` can send a test message to a linked LINE user.
- `/admin/launch` shows only expected non-production warnings.
