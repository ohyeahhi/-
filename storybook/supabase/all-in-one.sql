-- ============================================================
-- 들려줄게: Supabase 설정 한 번에 (SQL Editor 에 통째로 붙여 넣고 Run)
-- 여러 번 실행해도 괜찮아요. 이미 있는 건 그대로 두고, 빠진 것만 채워요.
-- 이 파일은 storage.sql · orders.sql · keeps.sql · events.sql 을 합친 거예요.
-- ============================================================

-- ---------- 0. 녹음 버킷 설정 (파일 크기 10MB, 허용 형식) ----------
update storage.buckets
set file_size_limit = 10485760,
    allowed_mime_types = array['audio/mp4', 'audio/webm', 'audio/ogg', 'video/mp4', 'video/webm', 'application/json']
where id = 'shares';

-- ---------- 1. storage.sql ----------
-- 가족 공유 버킷(shares) 올리기 규칙. Supabase → SQL Editor 에서 실행해요.
-- 누구나 "올리기만" 할 수 있고(목록 보기·고치기·지우기 없음), 앱이 쓰는 모양의 이름만 받아요:
--   <공유 ID 12자>/manifest.json
--   <공유 ID 12자>/<쪽 번호>.m4a | .mp4 | .webm | .ogg
--   <공유 ID 12자>/q.m4a 등   동화 끝에 남긴 질문
--   <공유 ID 12자>/heard.json   아이가 끝까지 들었다는 표시 (한 번)
--   <공유 ID 12자>/reply-1 … reply-9   손주가 보낸 목소리 답장
--   <책장 ID 12자>/owner.json, s-1.json … s-30.json   가족 책장 (공개 키, 서명된 동화 목록)
-- 다른 이름으로 올리려는 파일(아무 파일이나 올려 두는 무료 저장소로 쓰는 것)은 거절돼요.
drop policy if exists "가족 공유: 올리기만 허용" on storage.objects;
create policy "가족 공유: 올리기만 허용"
on storage.objects for insert to anon
with check (
  bucket_id = 'shares'
  and name ~ '^[a-z0-9]{12}/(manifest\.json|([0-9]{1,2}|q)\.(m4a|mp4|webm|ogg)|reply-[1-9]|heard\.json|owner\.json|s-([1-9]|[12][0-9]|30)\.json)$'
);

-- ---------- 2. orders.sql ----------
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

-- ---------- 3. keeps.sql ----------
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

-- ---------- 4. events.sql ----------
-- 시범 사용 통계 표. Supabase → SQL Editor 에서 한 번 실행해요.
-- 브라우저(공개 키)는 정해진 이름의 기록을 "쓰기"만 할 수 있고, 읽지는 못해요.
-- 이름·전화번호 같은 개인정보는 넣지 않아요. 기기 구분은 앱이 만든 무작위 번호(device)로만 해요.
create table if not exists public.events (
  id         bigint generated always as identity primary key,
  at         timestamptz not null default now(),
  name       text not null,
  device     text not null,
  story      text,
  share_id   text,
  n          int,
  meta       jsonb,
  org        text          -- 기관 코드 (복지관 안내지 QR 로 들어온 경우)
);
alter table public.events add column if not exists org text;  -- 예전에 표를 만들었다면

alter table public.events enable row level security;

drop policy if exists "anon can add events" on public.events;
create policy "anon can add events" on public.events
  for insert to anon
  with check (
    name in ('open', 'start', 'record', 'complete', 'share', 'listen', 'listen_end', 'invite',
             'create', 'book', 'order', 'paid', 'about', 'send_parents', 'keep_view', 'reply')
    and length(device) between 8 and 40
    and (story is null or length(story) <= 40)
    and (share_id is null or share_id ~ '^[a-z0-9]{12}$')
    and (meta is null or length(meta::text) <= 300)
    and (org is null or org ~ '^[a-z0-9-]{2,20}$')
  );

create index if not exists events_at on public.events (at);
create index if not exists events_name on public.events (name);

-- ---------- 5. 확인: 아래 표에서 모두 '✅' 이면 끝 ----------
select '버킷 shares' as 항목, case when exists (select 1 from storage.buckets where id = 'shares' and public and file_size_limit = 10485760) then '✅' else '❌ 버킷 이름이 shares 인지, Public 인지 확인' end as 결과
union all select '올리기 규칙', case when exists (select 1 from pg_policies where tablename = 'objects' and policyname = '가족 공유: 올리기만 허용' and with_check like '%owner%') then '✅' else '❌' end
union all select '주문 표', case when exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'orders' and column_name = 'kind') then '✅' else '❌' end
union all select '보관 표', case when to_regclass('public.keeps') is not null and to_regclass('public.passes') is not null then '✅' else '❌' end
union all select '통계 표', case when exists (select 1 from pg_policies where tablename = 'events' and with_check like '%reply%') then '✅' else '❌' end;
