-- =====================================================================
-- Admin member operations: wallet adjustments and profile maintenance
-- =====================================================================

create or replace function public.admin_adjust_member_points(
  p_user_id uuid,
  p_mode text,
  p_amount int,
  p_reason text,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid := auth.uid();
  v_wallet public.member_wallets;
  v_mode text := lower(trim(coalesce(p_mode, '')));
  v_reason text := trim(coalesce(p_reason, ''));
  v_delta int := 0;
  v_direction text;
  v_transaction_id uuid;
begin
  if v_admin_id is null then
    raise exception 'not_authenticated';
  end if;

  if not public.is_admin(v_admin_id) then
    raise exception 'forbidden: not admin';
  end if;

  if p_user_id is null then
    raise exception 'member_required';
  end if;

  if v_mode not in ('credit', 'debit', 'set') then
    raise exception 'invalid_adjustment_mode';
  end if;

  if nullif(v_reason, '') is null then
    raise exception 'reason_required';
  end if;

  if p_amount is null or p_amount < 0 or (v_mode in ('credit', 'debit') and p_amount <= 0) then
    raise exception 'invalid_amount';
  end if;

  perform public.ensure_member_wallet(p_user_id);

  select *
    into v_wallet
    from public.member_wallets
   where user_id = p_user_id
   for update;

  if not found then
    raise exception 'wallet_not_found';
  end if;

  if v_mode = 'credit' then
    v_delta := p_amount;
  elsif v_mode = 'debit' then
    v_delta := -p_amount;
  else
    v_delta := p_amount - v_wallet.balance;
  end if;

  if v_delta = 0 then
    return jsonb_build_object(
      'adjusted', false,
      'mode', v_mode,
      'delta', 0,
      'balance', v_wallet.balance
    );
  end if;

  if v_wallet.balance + v_delta < 0 then
    raise exception 'insufficient_points';
  end if;

  if v_delta > 0 then
    update public.member_wallets
       set balance = balance + v_delta,
           lifetime_earned = lifetime_earned + v_delta
     where user_id = p_user_id
     returning * into v_wallet;

    v_direction := 'credit';
  else
    update public.member_wallets
       set balance = balance + v_delta,
           lifetime_spent = lifetime_spent + abs(v_delta)
     where user_id = p_user_id
     returning * into v_wallet;

    v_direction := 'debit';
  end if;

  insert into public.point_transactions (
    user_id,
    amount,
    direction,
    reason,
    reference_type,
    reference_id,
    balance_after,
    metadata
  ) values (
    p_user_id,
    abs(v_delta),
    v_direction,
    'admin_adjustment:' || v_reason,
    'admin_adjustment',
    v_admin_id::text,
    v_wallet.balance,
    coalesce(p_metadata, '{}'::jsonb) || jsonb_build_object(
      'admin_user_id', v_admin_id,
      'mode', v_mode,
      'reason', v_reason,
      'delta', v_delta
    )
  )
  returning id into v_transaction_id;

  return jsonb_build_object(
    'adjusted', true,
    'mode', v_mode,
    'direction', v_direction,
    'delta', v_delta,
    'amount', abs(v_delta),
    'balance', v_wallet.balance,
    'transaction_id', v_transaction_id
  );
end;
$$;

create or replace function public.admin_update_member_profile(
  p_user_id uuid,
  p_display_name text default null,
  p_bio text default null,
  p_birth_date date default null,
  p_birth_time time default null,
  p_birth_location text default null,
  p_birth_timezone text default null,
  p_gender text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid := auth.uid();
  v_profile public.profiles;
  v_gender text := nullif(trim(coalesce(p_gender, '')), '');
begin
  if v_admin_id is null then
    raise exception 'not_authenticated';
  end if;

  if not public.is_admin(v_admin_id) then
    raise exception 'forbidden: not admin';
  end if;

  if p_user_id is null then
    raise exception 'member_required';
  end if;

  if v_gender is not null and v_gender not in ('男', '女', '其他', '未填') then
    raise exception 'invalid_gender';
  end if;

  update public.profiles
     set display_name = nullif(trim(coalesce(p_display_name, '')), ''),
         bio = nullif(trim(coalesce(p_bio, '')), ''),
         birth_date = p_birth_date,
         birth_time = p_birth_time,
         birth_location = nullif(trim(coalesce(p_birth_location, '')), ''),
         birth_timezone = nullif(trim(coalesce(p_birth_timezone, '')), ''),
         gender = coalesce(v_gender, '未填'),
         updated_at = now()
   where id = p_user_id
   returning * into v_profile;

  if not found then
    raise exception 'profile_not_found';
  end if;

  return v_profile;
end;
$$;

grant execute on function public.admin_adjust_member_points(uuid, text, int, text, jsonb) to authenticated;
grant execute on function public.admin_update_member_profile(uuid, text, text, date, time, text, text, text) to authenticated;
