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

console.log('\n=== Free booking SQL verification ===\n');

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
  'supabase/migrations/0007_auth_signup_mirror.sql',
]) {
  await db.exec(compat(readFileSync(migration, 'utf8')));
}

const customer = '11111111-1111-1111-1111-111111111111';
const teacherUser = '22222222-2222-2222-2222-222222222222';
const teacher = '44444444-4444-4444-4444-444444444444';
const service = '55555555-5555-5555-5555-555555555555';

await db.exec(`
  insert into auth.users (id, email, aud, role) values
    ('${customer}', 'customer@example.test', 'authenticated', 'authenticated'),
    ('${teacherUser}', 'teacher@example.test', 'authenticated', 'authenticated');

  insert into public.profiles (id, display_name) values
    ('${customer}', 'Customer A'),
    ('${teacherUser}', 'Teacher B')
  on conflict (id) do update set display_name = excluded.display_name;

  insert into public.teachers (id, user_id, status, display_name, specialties, commission_rate, approved_at)
  values ('${teacher}', '${teacherUser}', 'active', 'Teacher B', array['tarot'], 0.20, now());

  insert into public.teacher_services (id, teacher_id, name, duration_minutes, price_ntd, is_active)
  values ('${service}', '${teacher}', 'Test Reading', 60, 2000, true);

  select set_config('request.jwt.claim.sub', '${customer}', false);
`);

const paidAt = new Date(Date.now() + 96 * 3600 * 1000).toISOString();
const freeAt = new Date(Date.now() + 120 * 3600 * 1000).toISOString();

const paid = await db.query(`
  select public.create_booking_request(
    '${teacher}',
    '${service}',
    '${paidAt}',
    'test paid flow',
    'bazi',
    '{"birthDate":"1990-05-15"}'::jsonb,
    false
  ) as id
`);
const paidBooking = await db.query(`select status, amount_ntd, payment_provider from public.bookings where id='${paid.rows[0].id}'`);
log('paid mode creates pending booking', paidBooking.rows[0].status === 'pending');
log('paid mode keeps service amount', paidBooking.rows[0].amount_ntd === 2000);
log('paid mode leaves payment provider empty', paidBooking.rows[0].payment_provider === null);

const free = await db.query(`
  select public.create_booking_request(
    '${teacher}',
    '${service}',
    '${freeAt}',
    'test free flow',
    null,
    null,
    true
  ) as id
`);
const freeBooking = await db.query(`select status, amount_ntd, payment_provider, payment_id from public.bookings where id='${free.rows[0].id}'`);
log('free test mode creates confirmed booking', freeBooking.rows[0].status === 'confirmed');
log('free test mode preserves service amount for reporting', freeBooking.rows[0].amount_ntd === 2000);
log('free test mode marks provider', freeBooking.rows[0].payment_provider === 'free_test');
log('free test mode writes traceable payment id', String(freeBooking.rows[0].payment_id || '').startsWith('free_test:'));

console.log('\n============================');
console.log(`Free booking SQL verification: \x1b[32m${passed} passed\x1b[0m / \x1b[31m${failed} failed\x1b[0m`);
process.exit(failed > 0 ? 1 : 0);
