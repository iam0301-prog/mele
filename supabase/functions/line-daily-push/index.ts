// =====================================================================
// LINE Daily Push
// =====================================================================
// Deploy:
//   supabase functions deploy line-daily-push --no-verify-jwt
//
// Required secrets:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   LINE_CHANNEL_ACCESS_TOKEN
//   MELE_WEB_URL=https://your-domain.com
//
// Schedule this function hourly. It will push to users whose
// line_user_links.daily_push_hour matches the current Asia/Taipei hour.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeadersFor } from '../_shared/cors.ts';

function taipeiParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const pick = (type: string) => parts.find((part) => part.type === type)?.value || '';
  return {
    date: `${pick('year')}-${pick('month')}-${pick('day')}`,
    hour: Number(pick('hour')),
  };
}

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const token = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN') || '';
  const webUrl = (Deno.env.get('MELE_WEB_URL') || '').replace(/\/$/, '');
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

  if (!token || !webUrl || !supabaseUrl || !serviceKey) {
    return Response.json({ ok: false, error: 'missing LINE/Supabase env' }, { status: 500, headers: corsHeaders });
  }

  const { date, hour } = taipeiParts();
  const supabase = createClient(supabaseUrl, serviceKey);
  const { data, error } = await supabase
    .from('line_user_links')
    .select('id, line_user_id, display_name, last_pushed_at')
    .eq('push_enabled', true)
    .eq('daily_push_hour', hour);

  if (error) return Response.json({ ok: false, error: error.message }, { status: 500, headers: corsHeaders });

  const rows = (data || []).filter((row) => !row.last_pushed_at || !row.last_pushed_at.startsWith(date));
  const results: Array<{ id: string; ok: boolean; status?: number; error?: string }> = [];

  for (const row of rows) {
    const body = {
      to: row.line_user_id,
      messages: [
        {
          type: 'text',
          text: `${row.display_name || '你好'}，今天的命理指引已準備好。打開每日中心抽一張塔羅或一顆盧恩，看看今天的能量焦點。\n${webUrl}/daily`,
        },
      ],
    };

    try {
      const response = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await supabase.from('line_user_links').update({ last_pushed_at: new Date().toISOString() }).eq('id', row.id);
      }

      results.push({ id: row.id, ok: response.ok, status: response.status });
    } catch (error) {
      results.push({ id: row.id, ok: false, error: error instanceof Error ? error.message : String(error) });
    }
  }

  return Response.json({ ok: true, date, hour, pushed: results.length, results }, { headers: corsHeaders });
});
