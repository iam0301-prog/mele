-- Lock closed-beta member point economy constants at the database boundary.
-- Daily claim must always be 200 points; paid unlocks must always cost 100 points.
-- Keep the existing function signatures for backwards compatibility, but reject caller overrides.

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
  v_daily_amount constant int := 200;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if coalesce(p_daily_amount, 0) <> v_daily_amount then
    raise exception 'daily_amount_must_be_200';
  end if;

  perform public.ensure_member_wallet(v_user_id);

  insert into public.daily_point_claims (user_id, claim_date, amount)
  values (v_user_id, p_claim_date, v_daily_amount)
  on conflict (user_id, claim_date) do nothing;

  get diagnostics v_inserted_count = row_count;

  if v_inserted_count > 0 then
    update public.member_wallets
       set balance = balance + v_daily_amount,
           lifetime_earned = lifetime_earned + v_daily_amount
     where user_id = v_user_id
     returning * into v_wallet;

    insert into public.point_transactions (
      user_id, amount, direction, reason, reference_type, reference_id, balance_after, metadata
    ) values (
      v_user_id, v_daily_amount, 'credit', 'daily_claim', 'daily_point_claim', p_claim_date::text,
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
    'amount', case when v_inserted_count > 0 then v_daily_amount else 0 end,
    'balance', v_wallet.balance,
    'claim_date', p_claim_date
  );
end;
$$;


create or replace function public.build_member_unlock_content(
  p_unlock_type text,
  p_tool chart_tool,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
stable
set search_path = public
as $$
declare
  v_tool_name text := case p_tool
    when 'numerology' then '生命靈數'
    when 'maya' then '馬雅曆'
    when 'bazi' then '八字'
    when 'ziwei' then '紫微斗數'
    when 'tarot' then '塔羅'
    when 'runes' then '盧恩'
    when 'astro' then '占星'
    when 'humandesign' then '人類圖'
    else '個人解讀'
  end;
  v_anchor text := coalesce(nullif(trim(p_metadata->>'result_anchor'), ''), '本次結果');
  v_signals text := coalesce(nullif(trim(
    (select string_agg(value, '、') from jsonb_array_elements_text(coalesce(p_metadata->'result_signals', '[]'::jsonb)) as t(value))
  ), ''), v_anchor);
  v_period text := case p_unlock_type
    when 'transit_day' then '今日'
    when 'transit_month' then '本月'
    when 'transit_year' then '今年'
    else '本次'
  end;
  v_title text := case p_unlock_type
    when 'deep_reading' then '完整深入解釋'
    when 'transit_day' then '今日流日解讀'
    when 'transit_month' then '本月流月解讀'
    when 'transit_year' then '今年流年解讀'
    else '完整深入解釋'
  end;
begin
  if p_unlock_type = 'deep_reading' then
    return jsonb_build_object(
      'title', v_tool_name || '｜完整深入解釋',
      'summary', '這次先以「' || v_anchor || '」當入口，再用 ' || v_signals || ' 補充細節。重點不是把你定型，而是幫你看懂：現在最容易被觸發的地方在哪裡，以及可以怎麼調整。',
      'sections', jsonb_build_array(
        jsonb_build_object('label', '核心', 'title', '這次最該先看什麼', 'body', v_anchor || ' 是本次結果的主軸。你可以先觀察它有沒有說中：你最近反覆遇到的情緒、選擇或人際模式。'),
        jsonb_build_object('label', '優勢', 'title', '可以拿來使用的能力', 'body', v_signals || ' 代表你手上其實有資源。不要急著否定自己，先分辨哪些特質是能幫你處理問題的。'),
        jsonb_build_object('label', '行動', 'title', '今天先做哪一步', 'body', '先少一點反射性回應，多一點有意識選擇。把問題縮小到今天能完成的一步，會比一次想通全部更有效。')
      ),
      'tasks', jsonb_build_array('寫下今天最有感的一句話', '選一件 15 分鐘內能完成的小行動', '晚上回看：這個提醒是否真的有幫助')
    );
  end if;

  return jsonb_build_object(
    'title', v_tool_name || '｜' || v_title,
    'summary', v_period || '先以「' || v_anchor || '」當入口。這段不是要斷定事情一定會怎樣，而是幫你判斷：現在適合前進、整理，還是先停一下。',
    'sections', jsonb_build_array(
      jsonb_build_object('label', '宜', 'title', v_period || '可以順著做的事', 'body', v_period || '先把注意力收回來，選一個最有感的問題，先把它說清楚。這次 ' || v_tool_name || ' 顯示的 ' || v_signals || '，可以當成提醒。'),
      jsonb_build_object('label', '忌', 'title', v_period || '需要避開的消耗', 'body', '容易把感覺、責任與別人的期待混在一起。越急著立刻回應，越容易做出不是自己真心的選擇。'),
      jsonb_build_object('label', '行', 'title', v_period || '可行的小步驟', 'body', '做一件十五分鐘內能完成的小事；完成後再決定下一步，不要用焦慮催自己。')
    ),
    'tasks', jsonb_build_array(v_period || '只守住一個主題', '用一句話記下現在的心境', '把提醒變成一件做得到的小事')
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
  v_unlock_cost constant int := 100;
  v_content jsonb;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if coalesce(p_cost, 0) <> v_unlock_cost then
    raise exception 'unlock_cost_must_be_100';
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

    v_content := coalesce(v_existing.metadata->'unlocked_content', public.build_member_unlock_content(p_unlock_type, p_tool, v_existing.metadata));

    if not (v_existing.metadata ? 'unlocked_content') then
      update public.content_unlocks
         set metadata = v_existing.metadata || jsonb_build_object('unlocked_content', v_content)
       where id = v_existing.id;
    end if;

    return jsonb_build_object(
      'unlocked', true,
      'already_unlocked', true,
      'balance', v_wallet.balance,
      'unlock_id', v_existing.id,
      'content', v_content
    );
  end if;

  select *
    into v_wallet
    from public.member_wallets
   where user_id = v_user_id
   for update;

  if v_wallet.balance < v_unlock_cost then
    raise exception 'insufficient_points';
  end if;

  v_content := public.build_member_unlock_content(p_unlock_type, p_tool, p_metadata);

  update public.member_wallets
     set balance = balance - v_unlock_cost,
         lifetime_spent = lifetime_spent + v_unlock_cost
   where user_id = v_user_id
   returning * into v_wallet;

  insert into public.content_unlocks (
    user_id, unlock_type, tool, scope_key, cost_points, metadata
  ) values (
    v_user_id, p_unlock_type, p_tool, p_scope_key, v_unlock_cost, p_metadata || jsonb_build_object('unlocked_content', v_content)
  )
  returning * into v_unlock;

  insert into public.point_transactions (
    user_id, amount, direction, reason, reference_type, reference_id, balance_after, metadata
  ) values (
    v_user_id, v_unlock_cost, 'debit', p_unlock_type, 'content_unlock', v_unlock.id::text,
    v_wallet.balance, jsonb_build_object('tool', p_tool, 'scope_key', p_scope_key) || p_metadata
  );

  return jsonb_build_object(
    'unlocked', true,
    'already_unlocked', false,
    'balance', v_wallet.balance,
    'unlock_id', v_unlock.id,
    'content', v_content
  );
end;
$$;

grant execute on function public.claim_daily_points(date, int) to authenticated;
revoke execute on function public.build_member_unlock_content(text, chart_tool, jsonb) from public, anon, authenticated;
grant execute on function public.unlock_content(text, chart_tool, text, int, jsonb) to authenticated;
