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
             'create', 'book', 'order', 'paid', 'about', 'send_parents', 'keep_view', 'reply', 'coloring')
    and length(device) between 8 and 40
    and (story is null or length(story) <= 40)
    and (share_id is null or share_id ~ '^[a-z0-9]{12}$')
    and (meta is null or length(meta::text) <= 300)
    and (org is null or org ~ '^[a-z0-9-]{2,20}$')
  );

create index if not exists events_at on public.events (at);
create index if not exists events_name on public.events (name);

-- ---------- 자주 볼 숫자 (SQL Editor 에 붙여 넣고 실행) ----------
-- 1) 주마다: 앱을 연 기기 수, 녹음한 기기 수, 동화를 끝까지 녹음한 수, 보낸 링크 수, 링크를 연 수
-- select date_trunc('week', at) as week,
--        count(distinct device) filter (where name = 'open')     as 연_기기,
--        count(distinct device) filter (where name = 'record')   as 녹음한_기기,
--        count(*)               filter (where name = 'complete') as 완성한_동화,
--        count(*)               filter (where name = 'share')    as 보낸_링크,
--        count(*)               filter (where name = 'listen')   as 링크_재생
-- from public.events group by 1 order by 1 desc;
--
-- 2) 링크 하나를 몇 번 들었나 (가족이 다시 듣는지)
-- select share_id, count(*) as 재생, count(distinct device) as 들은_기기
-- from public.events where name = 'listen' group by 1 order by 2 desc limit 30;
--
-- 3) 처음 연 날부터 1주 뒤에도 녹음한 할머니·할아버지 비율 (재사용률)
-- with first as (select device, min(at) as d0 from public.events where name = 'record' group by 1)
-- select count(*) as 녹음한_기기,
--        count(*) filter (where exists (select 1 from public.events e where e.device = f.device
--                         and e.name = 'record' and e.at > f.d0 + interval '7 days')) as 일주일_뒤에도
-- from first f;
--
-- 5) 기관(복지관)별 참여 결과: 참여 어르신 기기 수, 녹음한 쪽 수, 완성한 동화, 가족이 들은 횟수
-- select org,
--        count(distinct device) filter (where name = 'record')   as 참여_어르신,
--        count(*)               filter (where name = 'record')   as 녹음한_쪽,
--        count(*)               filter (where name = 'complete') as 완성한_동화,
--        count(*)               filter (where name = 'share')    as 가족에게_보냄
-- from public.events where org is not null group by org;
-- (가족이 들은 횟수는 받는 가족 휴대폰에 기관 코드가 없어서, share_id 로 이어 봐요)
-- select e.org, count(l.*) as 가족_재생
-- from public.events e join public.events l on l.share_id = e.share_id and l.name = 'listen'
-- where e.name = 'share' and e.org is not null group by e.org;
--
-- 4) 받은 가족이 직접 만들어 보기로 넘어간 수 (입소문)
-- select count(*) filter (where name = 'invite') as 만들어_보기, count(*) filter (where name = 'send_parents') as 부모님께_보내기
-- from public.events;
--
-- 6) 손주 답장: 끝까지 들은 링크 중 답장이 온 비율 (가족이 반응하는지)
-- select count(distinct share_id) filter (where name = 'listen_end') as 끝까지_들은_링크,
--        count(distinct share_id) filter (where name = 'reply')      as 답장_온_링크,
--        count(*)                 filter (where name = 'reply')      as 답장_수
-- from public.events;
