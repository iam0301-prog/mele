// =====================================================================
// ECPay Checkout Form Creator
// =====================================================================
// Deploy:
//   supabase functions deploy ecpay-checkout
//
// Required secrets:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   ECPAY_MERCHANT_ID
//   ECPAY_HASH_KEY
//   ECPAY_HASH_IV
//   ECPAY_CHECKOUT_URL=https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5
//   MELE_WEB_URL=https://your-domain.com
//   ECPAY_RETURN_URL=https://<project>.functions.supabase.co/ecpay-webhook

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeadersFor } from '../_shared/cors.ts';

function ecpayEncode(value: string) {
  return encodeURIComponent(value)
    .replace(/%20/g, '+')
    .replace(/%2d/gi, '-')
    .replace(/%5f/gi, '_')
    .replace(/%2e/gi, '.')
    .replace(/%21/gi, '!')
    .replace(/%2a/gi, '*')
    .replace(/%28/gi, '(')
    .replace(/%29/gi, ')')
    .toLowerCase();
}

async function checkMacValue(params: Record<string, string>, hashKey: string, hashIV: string) {
  const source = Object.keys(params)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  const encoded = ecpayEncode(`HashKey=${hashKey}&${source}&HashIV=${hashIV}`);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(encoded));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function merchantTradeNo(bookingId: string) {
  const compact = bookingId.replace(/-/g, '').slice(0, 12).toUpperCase();
  const tail = Date.now().toString().slice(-8);
  return `ML${compact}${tail}`.slice(0, 20);
}

function tradeDate() {
  const parts = new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const pick = (type: string) => parts.find((part) => part.type === type)?.value || '00';
  return `${pick('year')}/${pick('month')}/${pick('day')} ${pick('hour')}:${pick('minute')}:${pick('second')}`;
}

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return Response.json({ error: 'method-not-allowed' }, { status: 405, headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const merchantId = Deno.env.get('ECPAY_MERCHANT_ID') || '';
  const hashKey = Deno.env.get('ECPAY_HASH_KEY') || '';
  const hashIV = Deno.env.get('ECPAY_HASH_IV') || '';
  const action = Deno.env.get('ECPAY_CHECKOUT_URL') || 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5';
  const webUrl = (Deno.env.get('MELE_WEB_URL') || '').replace(/\/$/, '');
  const returnUrl = Deno.env.get('ECPAY_RETURN_URL') || '';

  if (!supabaseUrl || !serviceKey || !merchantId || !hashKey || !hashIV || !webUrl || !returnUrl) {
    return Response.json({ error: 'missing-ecpay-env' }, { status: 500, headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization') || '';
  const jwt = authHeader.replace('Bearer ', '');
  const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') || serviceKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser(jwt);
  if (userError || !userData.user) {
    return Response.json({ error: 'unauthorized' }, { status: 401, headers: corsHeaders });
  }

  const { booking_id: bookingId } = await req.json().catch(() => ({ booking_id: null }));
  if (!bookingId) return Response.json({ error: 'missing-booking-id' }, { status: 400, headers: corsHeaders });

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: booking, error } = await admin
    .from('bookings')
    .select('id, customer_id, status, amount_ntd, teacher_services(name), teachers(display_name)')
    .eq('id', bookingId)
    .single();

  if (error || !booking) return Response.json({ error: 'booking-not-found' }, { status: 404, headers: corsHeaders });
  if (booking.customer_id !== userData.user.id) return Response.json({ error: 'forbidden' }, { status: 403, headers: corsHeaders });
  if (booking.status !== 'pending') {
    return Response.json({ error: 'booking-not-payable', status: booking.status }, { status: 409, headers: corsHeaders });
  }

  const serviceName = Array.isArray(booking.teacher_services)
    ? booking.teacher_services[0]?.name
    : booking.teacher_services?.name;
  const teacherName = Array.isArray(booking.teachers)
    ? booking.teachers[0]?.display_name
    : booking.teachers?.display_name;
  const itemName = `${serviceName || '命理諮詢'}-${teacherName || 'Mele'}`.replace(/[<>]/g, '').slice(0, 100);

  const fields: Record<string, string> = {
    MerchantID: merchantId,
    MerchantTradeNo: merchantTradeNo(booking.id),
    MerchantTradeDate: tradeDate(),
    PaymentType: 'aio',
    TotalAmount: String(booking.amount_ntd),
    TradeDesc: 'Mele命理媒介中心預約諮詢',
    ItemName: itemName,
    ReturnURL: returnUrl,
    ChoosePayment: 'Credit',
    EncryptType: '1',
    ClientBackURL: `${webUrl}/account/payment/result?booking=${booking.id}`,
    CustomField1: booking.id,
  };

  fields.CheckMacValue = await checkMacValue(fields, hashKey, hashIV);
  return Response.json({ action, fields }, { headers: corsHeaders });
});
