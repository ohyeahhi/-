// 보관 기간이 끝난 녹음 지우기 (Supabase Edge Function, 이름: cleanup)
//
// 무료 링크는 만든 날부터 1년, keeps 표에 있는 링크는 그 날짜까지 보관해요.
// 끝나기 60일 전부터는 듣는 화면에 "곧 지워져요" 안내가 나와요. (app.js keepView)
// 함께 정리하는 것: 공유 ID 모양이 아닌 곳에 올라온 파일, 하루 넘게 결제되지 않은 주문(이름·주소가 남지 않게).
//
//   POST { dry: true }   지울 목록만 돌려줘요 (처음엔 꼭 이걸로 확인)
//   POST { dry: false }  실제로 지워요
//
// 아무나 부르지 못하게 CLEANUP_TOKEN 비밀 값을 정하고, 요청 헤더 x-cleanup-token 에 같은 값을 넣어요.
// Supabase → Integrations → Cron 에서 하루 한 번 이 함수를 부르게 해 두면 돼요. (SETUP-보관.md)
import { createClient } from 'npm:@supabase/supabase-js@2';

const BUCKET = 'shares';
const FREE_DAYS = 365;
const PAGE = 1000;
const SHARE_RE = /^[a-z0-9]{12}$/;

// 길이가 같을 때 걸리는 시간이 같도록 비교해요.
function sameToken(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  const token = Deno.env.get('CLEANUP_TOKEN');
  if (!token || !sameToken(req.headers.get('x-cleanup-token') ?? '', token)) return new Response('forbidden', { status: 403 });
  const { dry = true } = await req.json().catch(() => ({}));
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const store = db.storage.from(BUCKET);

  // keeps 는 1000줄씩 끝까지 읽어요. (한 번에는 1000줄까지만 와서, 빠뜨리면 돈 내고 보관한 녹음을 지워요)
  const keptUntil = new Map<string, number>();
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db.from('keeps').select('share_id, until').order('share_id').range(from, from + PAGE - 1);
    if (error) return Response.json({ error: `keeps: ${error.message}` }, { status: 500 });
    for (const k of data ?? []) keptUntil.set(k.share_id, new Date(k.until).getTime());
    if (!data || data.length < PAGE) break;
  }

  // 폴더 안의 파일을 하위 폴더까지 모두 모아요. (폴더 항목은 id 가 null)
  async function filesUnder(prefix: string): Promise<{ path: string; created: number }[]> {
    const out: { path: string; created: number }[] = [];
    for (let offset = 0; ; offset += PAGE) {
      const { data, error } = await store.list(prefix, { limit: PAGE, offset });
      if (error) throw new Error(`list ${prefix}: ${error.message}`);
      for (const f of data ?? []) {
        const path = `${prefix}/${f.name}`;
        if (f.id === null) out.push(...await filesUnder(path));
        else out.push({ path, created: new Date(f.created_at).getTime() });
      }
      if (!data || data.length < PAGE) break;
    }
    return out;
  }

  const now = Date.now();
  const expired: string[] = [];
  const stray: string[] = [];
  const remove: string[] = [];
  try {
    for (let offset = 0; ; offset += PAGE) {
      const { data: top, error } = await store.list('', { limit: PAGE, offset });
      if (error) throw new Error(error.message);
      for (const d of top ?? []) {
        if (d.id !== null) { stray.push(d.name); remove.push(d.name); continue; }  // 맨 위에 올라온 파일
        const files = await filesUnder(d.name);
        if (!SHARE_RE.test(d.name)) { stray.push(d.name); remove.push(...files.map((f) => f.path)); continue; }
        // 만든 날 = manifest.json 이 올라온 날 (나중에 끼워 넣은 파일로 앞당겨지지 않게)
        const manifest = files.find((f) => f.path === `${d.name}/manifest.json`);
        const created = manifest?.created ?? Math.max(...files.map((f) => f.created));
        if (!Number.isFinite(created) || created <= 0) continue;
        const until = Math.max(keptUntil.get(d.name) ?? 0, created + FREE_DAYS * 864e5);
        if (until < now) { expired.push(d.name); remove.push(...files.map((f) => f.path)); }
      }
      if (!top || top.length < PAGE) break;
    }
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }

  // 하루 넘게 결제되지 않은 주문은 지워요. (이름·전화·주소가 남지 않게)
  const staleBefore = new Date(now - 864e5).toISOString();
  const { count: stalePending } = await db.from('orders').select('order_id', { count: 'exact', head: true })
    .eq('status', 'pending').lt('created_at', staleBefore);

  if (!dry) {
    for (let i = 0; i < remove.length; i += 500) await store.remove(remove.slice(i, i + 500));
    await db.from('orders').delete().eq('status', 'pending').lt('created_at', staleBefore);
  }
  return Response.json({ dry, expired, stray, files: remove.length, stalePending: stalePending ?? 0 });
});
