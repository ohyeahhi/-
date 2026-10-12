// 그림책 결제: 토스페이먼츠 결제창 + Supabase Edge Function(orders).
//
//   1) orders 함수에 주문을 만들어요. 금액은 서버가 권수로 다시 계산해요. (화면에서 바꿔도 소용없어요)
//   2) 토스 결제창을 띄워요. 결제가 끝나면 successUrl(?pay=success&paymentKey…)로 돌아와요.
//   3) orders 함수가 토스에 결제 승인을 요청하고(비밀 키는 서버에만 있어요) 주문을 '결제 완료'로 바꿔요.
//
// 설정 방법: SETUP-결제.md
import { CONFIG } from './config.js';

export const payEnabled = () => Boolean(CONFIG.tossClientKey && CONFIG.supabaseUrl && CONFIG.supabaseAnonKey);

async function callOrders(body) {
  const key = CONFIG.supabaseAnonKey;
  const headers = { 'Content-Type': 'application/json', apikey: key };
  if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;
  const res = await fetch(`${CONFIG.supabaseUrl.replace(/\/+$/, '')}/functions/v1/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.message || `orders ${res.status}`), { code: data.code });
  return data;
}

let sdk = null;
function loadSdk() {
  sdk ??= new Promise((resolve, reject) => {
    if (window.TossPayments) { resolve(window.TossPayments); return; }
    const s = document.createElement('script');
    s.src = 'https://js.tosspayments.com/v2/standard';
    s.onload = () => (window.TossPayments ? resolve(window.TossPayments) : reject(new Error('sdk')));
    s.onerror = () => { sdk = null; reject(new Error('sdk')); };
    document.head.append(s);
  });
  return sdk;
}

// order: { shareId, storyId, title, qty, gift, card, name, phone, addr, memo }  또는  { kind: 'keep', shareId, storyId }
export async function startPayment(order, { successUrl, failUrl }) {
  const created = await callOrders({ action: 'create', ...order });
  const TossPayments = await loadSdk();
  const payment = TossPayments(CONFIG.tossClientKey).payment({ customerKey: TossPayments.ANONYMOUS });
  await payment.requestPayment({
    method: 'CARD',
    amount: { currency: 'KRW', value: created.amount },
    orderId: created.orderId,
    orderName: created.orderName,
    ...(order.name ? { customerName: order.name } : {}),
    ...(order.phone ? { customerMobilePhone: order.phone.replace(/\D/g, '') } : {}),
    successUrl,
    failUrl,
  });
}

export const confirmPayment = ({ paymentKey, orderId, amount }) =>
  callOrders({ action: 'confirm', paymentKey, orderId, amount: Number(amount) });

// 녹음을 언제까지 보관하는지 (10년 보관을 샀거나 그림책을 샀으면 그 날짜, 아니면 null)
export async function keepStatus(shareId) {
  if (!payEnabled()) return null;
  try { return (await callOrders({ action: 'keep_status', shareId })).until; } catch { return null; }
}
