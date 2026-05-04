-- =====================================================================
-- Member point economy: daily claims, one daily draw, paid unlocks
-- =====================================================================

create table if not exists public.member_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance int not null default 0 check (balance >= 0),
  lifetime_earned int not null default 0 check (lifetime_earned >= 0),
  lifetime_spent int not null default 0 check (lifetime_spent >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.point_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount int not null check (amount > 0),
  direction text not null check (direction in ('credit', 'debit')),
  reason text not null,
  reference_type text,
  reference_id text,
  balance_after int not null check (balance_after >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_point_claims (
  user_id uuid not null references auth.users(id) on delete cascade,
  claim_date date not null,
  amount int not null default 200 check (amount > 0),
  created_at timestamptz not null default now(),
  primary key (user_id, claim_date)
);

create table if not exists public.content_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  unlock_type text not null check (unlock_type in ('deep_reading', 'transit_day', 'transit_month', 'transit_year')),
  tool chart_tool not null,
  scope_key text not null,
  cost_points int not null default 100 check (cost_points > 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, unlock_type, tool, scope_key)
);

alter table public.daily_draws
  drop constraint if exists uniq_daily_draws_user_date_choice;

alter table public.daily_draws
  add constraint uniq_daily_draws_user_date_choice unique (user_id, draw_date);

create index if not exists idx_point_transactions_user_created
  on public.point_transactions(user_id, created_at desc);

create index if not exists idx_content_unlocks_user_scope
  on public.content_unlocks(user_id, unlock_type, tool, scope_key);

alter table public.member_wallets enable row level security;
alter table public.point_transactions enable row level security;
alter table public.daily_point_claims enable row level security;
alter table public.content_unlocks enable row level security;

create policy "member_wallets_self_select" on public.member_wallets
  for select using (auth.uid() = user_id);
create policy "member_wallets_admin_all" on public.member_wallets
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "point_transactions_self_select" on public.point_transactions
  for select using (auth.uid() = user_id);
create policy "point_transactions_admin_all" on public.point_transactions
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "daily_point_claims_self_select" on public.daily_point_claims
  for select using (auth.uid() = user_id);
create policy "daily_point_claims_admin_all" on public.daily_point_claims
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "content_unlocks_self_select" on public.content_unlocks
  for select using (auth.uid() = user_id);
create policy "content_unlocks_admin_all" on public.content_unlocks
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create trigger trg_member_wallets_updated
before update on public.member_wallets
for each row execute function public.tg_set_updated_at();

create or replace function public.ensure_member_wallet(p_user_id uuid)
returns public.member_wallets
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wallet public.member_wallets;
begin
  insert into public.member_wallets (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select *
    into v_wallet
    from public.member_wallets
   where user_id = p_user_id;

  return v_wallet;
end;
$$;

create or replace function public.claim_daily_points(
  p_claim_date date default (timezone('Asia/Taipei', now())::date),
  p_daily_amount int default 200
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_inserted_count int := 0;
  v_wallet public.member_wallets;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if p_daily_amount <= 0 then
    raise exception 'daily_amount_must_be_positive';
  end if;

  perform public.ensure_member_wallet(v_user_id);

  insert into public.daily_point_claims (user_id, claim_date, amount)
  values (v_user_id, p_claim_date, p_daily_amount)
  on conflict (user_id, claim_date) do nothing;

  get diagnostics v_inserted_count = row_count;

  if v_inserted_count > 0 then
    update public.member_wallets
       set balance = balance + p_daily_amount,
           lifetime_earned = lifetime_earned + p_daily_amount
     where user_id = v_user_id
     returning * into v_wallet;

    insert into public.point_transactions (
      user_id, amount, direction, reason, reference_type, reference_id, balance_after, metadata
    ) values (
      v_user_id, p_daily_amount, 'credit', 'daily_claim', 'daily_point_claim', p_claim_date::text,
      v_wallet.balance, jsonb_build_object('claim_date', p_claim_date)
    );
  else
    select *
      into v_wallet
      from public.member_wallets
     where user_id = v_user_id;
  end if;

  return jsonb_build_object(
    'claimed', v_inserted_count > 0,
    'amount', case when v_inserted_count > 0 then p_daily_amount else 0 end,
    'balance', v_wallet.balance,
    'claim_date', p_claim_date
  );
end;
$$;

create or replace function public.unlock_content(
  p_unlock_type text,
  p_tool chart_tool,
  p_scope_key text,
  p_cost int default 100,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_wallet public.member_wallets;
  v_existing public.content_unlocks;
  v_unlock public.content_unlocks;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if p_cost <= 0 then
    raise exception 'cost_must_be_positive';
  end if;

  if p_unlock_type not in ('deep_reading', 'transit_day', 'transit_month', 'transit_year') then
    raise exception 'invalid_unlock_type';
  end if;

  if nullif(trim(p_scope_key), '') is null then
    raise exception 'scope_key_required';
  end if;

  perform public.ensure_member_wallet(v_user_id);

  select *
    into v_existing
    from public.content_unlocks
   where user_id = v_user_id
     and unlock_type = p_unlock_type
     and tool = p_tool
     and scope_key = p_scope_key;

  if found then
    select *
      into v_wallet
      from public.member_wallets
     where user_id = v_user_id;

    return jsonb_build_object(
      'unlocked', true,
      'already_unlocked', true,
      'balance', v_wallet.balance,
      'unlock_id', v_existing.id
    );
  end if;

  select *
    into v_wallet
    from public.member_wallets
   where user_id = v_user_id
   for update;

  if v_wallet.balance < p_cost then
    raise exception 'insufficient_points';
  end if;

  update public.member_wallets
     set balance = balance - p_cost,
         lifetime_spent = lifetime_spent + p_cost
   where user_id = v_user_id
   returning * into v_wallet;

  insert into public.content_unlocks (
    user_id, unlock_type, tool, scope_key, cost_points, metadata
  ) values (
    v_user_id, p_unlock_type, p_tool, p_scope_key, p_cost, p_metadata
  )
  returning * into v_unlock;

  insert into public.point_transactions (
    user_id, amount, direction, reason, reference_type, reference_id, balance_after, metadata
  ) values (
    v_user_id, p_cost, 'debit', p_unlock_type, 'content_unlock', v_unlock.id::text,
    v_wallet.balance, jsonb_build_object('tool', p_tool, 'scope_key', p_scope_key) || p_metadata
  );

  return jsonb_build_object(
    'unlocked', true,
    'already_unlocked', false,
    'balance', v_wallet.balance,
    'unlock_id', v_unlock.id
  );
end;
$$;

grant execute on function public.claim_daily_points(date, int) to authenticated;
grant execute on function public.unlock_content(text, chart_tool, text, int, jsonb) to authenticated;
