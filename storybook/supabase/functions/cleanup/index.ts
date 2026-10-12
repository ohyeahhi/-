// 보관 기간이 끝난 녹음 지우기 (Supabase Edge Function, 이름: cleanup)
//
// 무료 링크는 만든 날부터 1년, keeps 표에 있는 링크는 그 날짜까지 보관해요.
// 끝나기 60일 전부터는 듣는 화면에 "곧 지워져요" 안내가 나와요. (app.js keepView)
//
//   POST { dry: true }   지울 목록만 돌려줘요 (처음엔 꼭 이걸로 확인)
//   POST { dry: false }  실제로 지워요
//
// 아무나 부르지 못하게 CLEANUP_TOKEN 비밀 값을 정하고, 요청 헤더 x-cleanup-token 에 같은 값을 넣어요.
// Supabase → Integrations → Cron 에서 하루 한 번 이 함수를 부르게 해 두면 돼요. (SETUP-보관.md)
import { createClient } from 'npm:@supabase/supabase-js@2';

const BUCKET = 'shares';
const FREE_DAYS = 365;

Deno.serve(async (req) => {
  const token = Deno.env.get('CLEANUP_TOKEN');
  if (!token || req.headers.get('x-cleanup-token') !== token) return new Response('forbidden', { status: 403 });
  const { dry = true } = await req.json().catch(() => ({}));
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const { data: keeps } = await db.from('keeps').select('share_id, until');
  const keptUntil = new Map((keeps ?? []).map((k) => [k.share_id, new Date(k.until).getTime()]));
  const now = Date.now();
  const expired: string[] = [];

  // 버킷 맨 위 폴더 = 공유 ID. 1000개씩 넘겨 가며 봐요.
  for (let offset = 0; ; offset += 1000) {
    const { data: dirs, error } = await db.storage.from(BUCKET).list('', { limit: 1000, offset });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    for (const d of dirs ?? []) {
      if (!/^[a-z0-9]{12}$/.test(d.name)) continue;
      const { data: files } = await db.storage.from(BUCKET).list(d.name, { limit: 100 });
      const times = (files ?? []).map((f) => new Date(f.created_at).getTime()).filter(Number.isFinite);
      if (!times.length) continue;
      const until = Math.max(keptUntil.get(d.name) ?? 0, Math.min(...times) + FREE_DAYS * 864e5);
      if (until < now) expired.push(d.name);
    }
    if (!dirs || dirs.length < 1000) break;
  }

  if (!dry) {
    for (const id of expired) {
      const { data: files } = await db.storage.from(BUCKET).list(id, { limit: 100 });
      await db.storage.from(BUCKET).remove((files ?? []).map((f) => `${id}/${f.name}`));
    }
  }
  return Response.json({ dry, expired, count: expired.length });
});
