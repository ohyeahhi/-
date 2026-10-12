-- 그림책 주문 표. Supabase → SQL Editor 에서 한 번 실행해요.
-- 보안 규칙(RLS)만 켜고 허용 규칙은 만들지 않아요.
-- → 브라우저(공개 키)로는 읽지도 쓰지도 못하고, orders Edge Function(서비스 키)만 접근해요.
create table if not exists public.orders (
  id          bigint generated always as identity primary key,
  order_id    text unique not null,
  share_id    text not null,          -- 인쇄할 책: 앱 주소 #/print/<share_id>
  story_id    text not null,
  title       text not null,
  qty         int  not null check (qty between 1 and 10),
  gift        boolean not null default false,  -- 선물 포장 + 카드
  card        text,                            -- 카드에 적을 말
  amount      int  not null,
  name        text not null,
  phone       text not null,
  addr        text not null,
  memo        text,
  status      text not null default 'pending',  -- pending · paid · failed · shipped
  payment_key text,
  method      text,
  receipt_url text,
  created_at  timestamptz not null default now(),
  paid_at     timestamptz
);

alter table public.orders enable row level security;

-- 이미 표를 만들었다면 아래 두 줄만 실행해요 (선물 포장 칸 더하기).
alter table public.orders add column if not exists gift boolean not null default false;
alter table public.orders add column if not exists card text;
