-- 녹음 보관 기간. Supabase → SQL Editor 에서 한 번 실행해요. (orders.sql 다음에)
--   무료: 링크를 만든 날부터 1년
--   10년 보관(9,900원)을 사거나 그림책을 주문하면: 결제한 날부터 10년
-- 브라우저(공개 키)는 이 표를 읽지도 쓰지도 못해요. orders·cleanup 함수(서비스 키)만 써요.
create table if not exists public.keeps (
  share_id   text primary key check (share_id ~ '^[a-z0-9]{12}$'),
  until      timestamptz not null,
  order_id   text,
  updated_at timestamptz not null default now()
);
alter table public.keeps enable row level security;

-- 주문 표: 보관 상품은 배송 정보가 없어서 이름·전화·주소를 비워 둘 수 있게 해요.
alter table public.orders add column if not exists kind text not null default 'book';  -- book · keep
alter table public.orders alter column name drop not null;
alter table public.orders alter column phone drop not null;
alter table public.orders alter column addr drop not null;

-- 가족 1년권: 책장(shelf_id)마다 언제까지인지. 이 기간에 보낸 동화는 10년 보관돼요. (orders 함수만 써요)
create table if not exists public.passes (
  shelf_id   text primary key check (shelf_id ~ '^[a-z0-9]{12}$'),
  until      timestamptz not null,
  order_id   text,
  updated_at timestamptz not null default now()
);
alter table public.passes enable row level security;
