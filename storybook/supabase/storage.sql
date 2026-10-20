-- 가족 공유 버킷(shares) 올리기 규칙. Supabase → SQL Editor 에서 실행해요.
-- 누구나 "올리기만" 할 수 있고(목록 보기·고치기·지우기 없음), 앱이 쓰는 모양의 이름만 받아요:
--   <공유 ID 12자>/manifest.json
--   <공유 ID 12자>/<쪽 번호>.m4a | .mp4 | .webm | .ogg
--   <공유 ID 12자>/q.m4a 등   동화 끝에 남긴 질문
--   <공유 ID 12자>/reply-1 … reply-9   손주가 보낸 목소리 답장
--   <책장 ID 12자>/owner.json, s-1.json … s-30.json   가족 책장 (공개 키, 서명된 동화 목록)
-- 다른 이름으로 올리려는 파일(아무 파일이나 올려 두는 무료 저장소로 쓰는 것)은 거절돼요.
drop policy if exists "가족 공유: 올리기만 허용" on storage.objects;
create policy "가족 공유: 올리기만 허용"
on storage.objects for insert to anon
with check (
  bucket_id = 'shares'
  and name ~ '^[a-z0-9]{12}/(manifest\.json|([0-9]{1,2}|q)\.(m4a|mp4|webm|ogg)|reply-[1-9]|owner\.json|s-([1-9]|[12][0-9]|30)\.json)$'
);
