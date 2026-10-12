// 그림책 가격. 서버(supabase/functions/orders/index.ts)도 같은 규칙으로 다시 계산해요. 바꿀 때는 둘 다 바꿔요.
//   첫 권 39,000원, 두 번째 권부터 29,000원 (아들네·딸네·친가·외가에 한 권씩)
//   선물 포장 + 카드: 권마다 5,000원
export const PRICE_FIRST = 39000;
export const PRICE_MORE = 29000;
export const GIFT_PRICE = 5000;
export const MAX_QTY = 10;

// 녹음 보관: 링크를 만든 날부터 1년은 무료. 10년 보관은 9,900원 (그림책을 사면 함께 돼요)
export const FREE_KEEP_DAYS = 365;
export const KEEP_PRICE = 9900;
export const KEEP_YEARS = 10;

export function priceOf({ qty, gift }) {
  const books = qty >= 1 ? PRICE_FIRST + PRICE_MORE * (qty - 1) : 0;
  const wrap = gift ? GIFT_PRICE * qty : 0;
  return { books, wrap, total: books + wrap, saved: (PRICE_FIRST - PRICE_MORE) * Math.max(0, qty - 1) };
}
