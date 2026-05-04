import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';

const db = new PGlite();
let passed = 0;
let failed = 0;

function log(name, ok, detail = '') {
  if (ok) {
    passed += 1;
    console.log(`  \x1b[32mOK\x1b[0m ${name}${detail ? ` - ${detail}` : ''}`);
    return;
  }
  failed += 1;
  console.log(`  \x1b[31mFAIL\x1b[0m ${name}${detail ? ` - ${detail}` : ''}`);
}

function compat(sql) {
  return sql
    .replace(/create extension if not exists "uuid-ossp";/gi, '-- skipped in PGlite: uuid-ossp')
    .replace(/create extension if not exists "pgcrypto";/gi, '-- skipped in PGlite: pgcrypto')
    .replace(/uuid_generate_v4\(\)/gi, 'gen_random_uuid()');
}

console.log('\n=== Auth signup SQL verification ===\n');

await db.exec(`
  create schema if not exists auth;
  create table if not exists auth.users (
    id uuid primary key,
    email text unique,
    instance_id uuid,
    aud text,
    role text,
    encrypted_password text,
    email_confirmed_at timestamptz,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  );
  create or replace function auth.uid() returns uuid as $$
    select current_setting('request.jwt.claim.sub', true)::uuid
  $$ language sql stable;
`);

for (const migration of [
  'supabase/migrations/0001_initial_schema.sql',
  'supabase/migrations/0002_rls_policies.sql',
  'supabase/migrations/0003_workflow_functions.sql',
  'supabase/migrations/0004_p0_fixes.sql',
  'supabase/migrations/0005_daily_ritual_center.sql',
  'supabase/migrations/0006_match_sessions.sql',
  'supabase/migrations/0007_auth_signup_mirror.sql',
]) {
  await db.exec(compat(readFileSync(migration, 'utf8')));
}

const userId = 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa';
await db.exec(`
  insert into auth.users (id, email, aud, role, raw_user_meta_data)
  values (
    '${userId}',
    'signup@example.test',
    'authenticated',
    'authenticated',
    '{
      "display_name": "Signup Mirror",
      "birth_date": "1990-01-02",
      "birth_time": "12:34",
      "birth_location": "Taipei",
      "birth_lat": 25.033,
      "birth_lon": 121.5654,
      "birth_timezone": "Asia/Taipei",
      "gender": "not_specified",
      "privacy_consent_at": "2026-05-02T10:00:00.000Z",
      "tos_consent_at": "2026-05-02T10:00:00.000Z",
      "consent_version": "2026-04-30"
    }'::jsonb
  );
`);

const profile = await db.query(`
  select display_name, birth_date::text as birth_date, birth_time::text as birth_time,
         birth_location, birth_lat, birth_lon, birth_timezone, gender,
         privacy_consent_version, privacy_consent_at, tos_consent_at
    from public.profiles
   where id = '${userId}'
`);

log('auth insert creates profile row', profile.rows.length === 1);
if (profile.rows.length === 1) {
  log('profile mirrors display name', profile.rows[0].display_name === 'Signup Mirror');
  log('profile mirrors birth date', profile.rows[0].birth_date === '1990-01-02');
  log('profile mirrors consent version', profile.rows[0].privacy_consent_version === '2026-04-30');
  log('profile has privacy consent timestamp', Boolean(profile.rows[0].privacy_consent_at));
  log('profile has tos consent timestamp', Boolean(profile.rows[0].tos_consent_at));
}

const consent = await db.query(`
  select consent_type, consent_version
    from public.consent_log
   where user_id = '${userId}'
   order by consent_type
`);

log('auth insert creates two consent rows', consent.rows.length === 2);
log(
  'consent rows include privacy and tos',
  consent.rows.map((row) => row.consent_type).join(',') === 'privacy,tos',
);
log(
  'consent rows keep version',
  consent.rows.every((row) => row.consent_version === '2026-04-30'),
);

await db.exec(`select set_config('request.jwt.claim.sub', '${userId}', false);`);
const app = await db.query(`
  select public.submit_teacher_application(
    'Legal Name',
    'Display Teacher',
    'teacher-apply@example.test',
    '0900000000',
    array['E2E'],
    'Short intro',
    'Long intro',
    'Quote',
    null,
    null,
    'https://example.test/video',
    'https://example.test/line',
    'https://example.test/instagram',
    'https://example.test/facebook',
    'https://example.test/threads',
    'https://example.test/youtube'
  ) as id
`);

const application = await db.query(`
  select status, user_id, email, display_name
    from public.teacher_applications
   where id = '${app.rows[0].id}'
`);

log('teacher application RPC returns id', Boolean(app.rows[0].id));
log('teacher application creates pending row', application.rows[0]?.status === 'pending');
log('teacher application belongs to auth user', application.rows[0]?.user_id === userId);
log('teacher application keeps submitted email', application.rows[0]?.email === 'teacher-apply@example.test');

console.log('\n============================');
console.log(`Auth signup SQL verification: \x1b[32m${passed} passed\x1b[0m / \x1b[31m${failed} failed\x1b[0m`);
process.exit(failed > 0 ? 1 : 0);
