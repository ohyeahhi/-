// 그림책 주문·결제 승인 (Supabase Edge Function, 이름: orders)
//
//   POST { action: 'create', shareId, storyId, title, qty, gift, card, name, phone, addr, memo }
//        → { orderId, amount, orderName }   금액은 여기서 권수·선물 포장으로 계산해요.
//   POST { action: 'create', kind: 'keep', shareId }
//        → { orderId, amount, orderName }   녹음 10년 보관 (배송 없음)
//   POST { action: 'keep_status', shareId } → { until }  보관 날짜 (산 적 없으면 null)
//   POST { action: 'confirm', paymentKey, orderId, amount }
//        → { ok: true, order }               토스에 승인 요청 후 '결제 완료'로 바꿔요.
//
// 필요한 비밀 값(Edge Function Secrets): TOSS_SECRET_KEY
// SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 는 Supabase 가 자동으로 넣어 줘요.
import { createClient } from 'npm:@supabase/supabase-js@2';

// 앱의 pricing.js 와 같은 규칙이에요. 바꿀 때는 둘 다 바꿔요.
const PRICE_FIRST = 39000;  // 첫 권
const PRICE_MORE = 29000;   // 두 번째 권부터
const GIFT_PRICE = 5000;    // 선물 포장 + 카드, 권마다
const priceOf = (qty: number, gift: boolean) => PRICE_FIRST + PRICE_MORE * (qty - 1) + (gift ? GIFT_PRICE * qty : 0);
const KEEP_PRICE = 9900;    // 녹음 10년 보관
const KEEP_YEARS = 10;      // 그림책을 사도 같은 기간 보관해요 (QR이 계속 열리도록)
const SHARE_RE = /^[a-z0-9]{12}$/;
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const fail = (message: string, status = 400, code = 'BAD_REQUEST') => json({ message, code }, status);

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return fail('POST 로 보내 주세요', 405);

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return fail('잘못된 요청이에요'); }

  if (body.action === 'keep_status') {
    const shareId = str(body.shareId, 12);
    if (!SHARE_RE.test(shareId)) return fail('링크가 올바르지 않아요');
    const { data } = await db.from('keeps').select('until').eq('share_id', shareId).maybeSingle();
    return json({ until: data?.until ?? null });
  }

  if (body.action === 'create' && body.kind === 'keep') {
    const shareId = str(body.shareId, 12);
    if (!SHARE_RE.test(shareId)) return fail('링크가 올바르지 않아요');
    const { data: files } = await db.storage.from('shares').list(shareId, { limit: 1 });
    if (!files?.length) return fail('녹음을 찾을 수 없어요', 404, 'NOT_FOUND');
    const orderId = `KEEP-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`.toUpperCase();
    const { error } = await db.from('orders').insert({
      order_id: orderId, kind: 'keep', share_id: shareId, story_id: str(body.storyId, 40) || 'unknown',
      title: '목소리 10년 보관', qty: 1, amount: KEEP_PRICE, status: 'pending',
    });
    if (error) return fail('주문을 저장하지 못했어요', 500, 'DB');
    return json({ orderId, amount: KEEP_PRICE, orderName: '할머니 목소리 10년 보관' });
  }

  if (body.action === 'create') {
    const qty = Number(body.qty);
    const gift = body.gift === true;
    const order = {
      share_id: str(body.shareId, 32),
      story_id: str(body.storyId, 40),
      title: str(body.title, 60),
      qty,
      gift,
      card: gift ? str(body.card, 80) : '',
      amount: Number.isInteger(qty) ? priceOf(qty, gift) : 0,
      name: str(body.name, 30),
      phone: str(body.phone, 20),
      addr: str(body.addr, 200),
      memo: str(body.memo, 200),
    };
    if (!/^[a-z0-9]{12}$/.test(order.share_id) || !order.story_id || !order.title) return fail('책 정보가 없어요');
    if (!Number.isInteger(qty) || qty < 1 || qty > 10) return fail('권수를 확인해 주세요');
    if (!order.name || !/^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(order.phone) || order.addr.length < 6) return fail('받는 분 정보를 확인해 주세요');

    const orderId = `BOOK-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`.toUpperCase();
    const { error } = await db.from('orders').insert({ ...order, order_id: orderId, status: 'pending' });
    if (error) return fail('주문을 저장하지 못했어요', 500, 'DB');
    const orderName = `${order.title} 그림책${qty > 1 ? ` ${qty}권` : ''}${gift ? ' (선물 포장)' : ''}`;
    return json({ orderId, amount: order.amount, orderName });
  }

  if (body.action === 'confirm') {
    const orderId = str(body.orderId, 64);
    const paymentKey = str(body.paymentKey, 200);
    const amount = Number(body.amount);
    const { data: order } = await db.from('orders').select('*').eq('order_id', orderId).maybeSingle();
    if (!order) return fail('주문을 찾을 수 없어요', 404, 'NOT_FOUND');
    // 돌아온 금액이 처음 만든 주문 금액과 다르면 승인하지 않아요.
    if (order.amount !== amount) return fail('결제 금액이 주문과 달라요', 400, 'AMOUNT_MISMATCH');
    if (order.status === 'paid') return json({ ok: true, order: publicOrder(order) });

    const secret = Deno.env.get('TOSS_SECRET_KEY');
    if (!secret) return fail('결제 비밀 키가 설정되지 않았어요', 500, 'NO_SECRET');
    const res = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: { Authorization: `Basic ${btoa(`${secret}:`)}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });
    const payment = await res.json();
    if (!res.ok) {
      await db.from('orders').update({ status: 'failed' }).eq('order_id', orderId);
      return fail(payment.message || '결제를 승인하지 못했어요', 400, payment.code || 'TOSS');
    }
    const update = {
      status: 'paid',
      payment_key: paymentKey,
      method: payment.method ?? null,
      receipt_url: payment.receipt?.url ?? null,
      paid_at: new Date().toISOString(),
    };
    await db.from('orders').update(update).eq('order_id', orderId);
    // 보관을 샀거나 그림책을 샀으면 그 녹음은 결제한 날부터 10년 보관해요. (이미 더 길면 그대로)
    const until = new Date();
    until.setFullYear(until.getFullYear() + KEEP_YEARS);
    const { data: kept } = await db.from('keeps').select('until').eq('share_id', order.share_id).maybeSingle();
    if (!kept || new Date(kept.until) < until) {
      await db.from('keeps').upsert({ share_id: order.share_id, until: until.toISOString(), order_id: orderId, updated_at: new Date().toISOString() });
    }
    return json({ ok: true, order: publicOrder({ ...order, ...update }) });
  }

  return fail('알 수 없는 요청이에요');
});

// 화면에 돌려줄 때는 주소·전화번호를 빼요.
function publicOrder(o: Record<string, unknown>) {
  return { orderId: o.order_id, kind: o.kind ?? 'book', shareId: o.share_id, title: o.title, qty: o.qty, gift: o.gift, amount: o.amount, receiptUrl: o.receipt_url };
}
