// =====================================================================
// ECPay (綠界) Payment Webhook
// =====================================================================
// 綠界回呼規格：https://developers.ecpay.com.tw/?p=2856
//   - POST x-www-form-urlencoded
//   - 必驗 CheckMacValue（HMAC-SHA256 + URL encode）
//   - 必須回應「1|OK」表示成功；否則綠界會重試
//
// 部署：
//   supabase functions deploy ecpay-webhook --no-verify-jwt
//   並在 Supabase Dashboard → Edge Functions → Settings 設定 secret：
//     ECPAY_HASH_KEY = 你的 HashKey
//     ECPAY_HASH_IV  = 你的 HashIV
//
// 預約建立流程：
//   前端 booking.insert (status='pending') → 取得 booking.id
//   前端送 ECPay form (MerchantTradeNo = booking.id 縮寫 + 時戳，CustomField1 = booking.id)
//   ECPay → 此 webhook → confirm_payment(booking_id, ...) → booking.status='paid'

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeadersFor } from '../_shared/cors.ts';

// ---------- ECPay CheckMacValue 驗證 ----------
async function computeCheckMac(params: Record<string, string>, hashKey: string, hashIV: string): Promise<string> {
  // 1) 排除 CheckMacValue
  const filtered: Record<string, string> = {};
  for (const k of Object.keys(params)) {
    if (k === 'CheckMacValue') continue;
    filtered[k] = params[k];
  }
  // 2) 依 key 字典序排序
  const sortedKeys = Object.keys(filtered).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  const queryStr = sortedKeys.map(k => `${k}=${filtered[k]}`).join('&');
  // 3) 加 HashKey / HashIV 包裹
  const raw = `HashKey=${hashKey}&${queryStr}&HashIV=${hashIV}`;
  // 4) URL encode（綠界版本，部分字元保留）
  const encoded = encodeURIComponent(raw)
    .replace(/%20/g, '+')
    .replace(/%2d/gi, '-').replace(/%5f/gi, '_').replace(/%2e/gi, '.')
    .replace(/%21/gi, '!').replace(/%2a/gi, '*').replace(/%28/gi, '(').replace(/%29/gi, ')')
    .toLowerCase();
  // 5) SHA256
  const data = new TextEncoder().encode(encoded);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('').toUpperCase();
}

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const text = await req.text();
    const params = Object.fromEntries(new URLSearchParams(text));

    const HASH_KEY = Deno.env.get('ECPAY_HASH_KEY') || '';
    const HASH_IV = Deno.env.get('ECPAY_HASH_IV') || '';
    if (!HASH_KEY || !HASH_IV) {
      console.error('[ecpay-webhook] missing hash key/iv env');
      return new Response('0|missing-config', { status: 200 });
    }

    // 1) 驗 MAC
    const expected = await computeCheckMac(params, HASH_KEY, HASH_IV);
    if (params.CheckMacValue !== expected) {
      console.warn('[ecpay-webhook] CheckMacValue mismatch', {
        got: params.CheckMacValue, expected, mtn: params.MerchantTradeNo,
      });
      return new Response('0|mac-fail', { status: 200 });
    }

    // 2) 確認付款結果（RtnCode=1 表成功）
    if (params.RtnCode !== '1') {
      console.log('[ecpay-webhook] payment not successful', params.RtnCode, params.RtnMsg);
      return new Response('1|OK', { status: 200 }); // 仍回 1|OK 避免綠界重試
    }

    // 3) 取出我們在送單時放在 CustomField1 的 booking.id（uuid）
    const bookingId = params.CustomField1;
    const paidAmount = parseInt(params.TradeAmt || '0', 10);
    if (!bookingId) {
      console.warn('[ecpay-webhook] missing booking id (CustomField1)');
      return new Response('0|no-booking', { status: 200 });
    }

    // 4) 用 service_role 呼叫 confirm_payment RPC
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { error } = await supabase.rpc('confirm_payment', {
      p_booking_id: bookingId,
      p_provider: 'ecpay',
      p_payment_id: params.TradeNo || params.MerchantTradeNo,
      p_paid_amount: paidAmount,
    });

    if (error) {
      console.error('[ecpay-webhook] confirm_payment failed', error);
      return new Response('0|rpc-fail:' + error.message, { status: 200 });
    }

    console.log('[ecpay-webhook] confirmed', bookingId, paidAmount);
    return new Response('1|OK', { status: 200 });
  } catch (e) {
    console.error('[ecpay-webhook] exception', e);
    return new Response('0|exception', { status: 200 });
  }
});
