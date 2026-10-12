// 전체 테스트:  node tests/run.mjs            (모두)
//               node tests/run.mjs book keep  (이름에 들어간 것만)
// 앱 서버(18765)와 가짜 Supabase·토스(18766)를 띄우고, 휴대폰 화면(iPhone 13)으로 눌러 봐요.
// 마이크·카메라는 크롬의 가짜 장치를 써요. 화면 사진과 PDF는 OUT 폴더(마지막에 알려 줘요)에 남아요.
import fs from 'node:fs';
import path from 'node:path';
import { startServers, launch, suite, OUT, ROOT } from './harness.mjs';

const only = process.argv.slice(2);
const files = fs.readdirSync(path.join(ROOT, 'tests'))
  .filter((f) => f.endsWith('.test.mjs') && (!only.length || only.some((o) => f.includes(o))))
  .sort((a, b) => (a.startsWith('composer') ? -1 : b.startsWith('composer') ? 1 : a.localeCompare(b)));

const servers = await startServers();
const browser = await launch();
const all = [];
try {
  for (const f of files) {
    const s = suite(f.replace('.test.mjs', ''));
    console.log(`\n▶ ${s.name}`);
    const t0 = Date.now();
    try {
      const mod = await import(`./${f}`);
      await mod.default({ check: s.check, browser, store: servers.store });
    } catch (e) {
      s.check('끝까지 실행돼요', false, e.message.split('\n').filter((l) => /Error|Timeout|waiting for/.test(l)).slice(0, 2).join(' | ').replace(/\x1b\[[0-9;]*m/g, ''));
    }
    console.log(`  (${((Date.now() - t0) / 1000).toFixed(1)}초)`);
    all.push(s);
  }
} finally {
  await browser.close();
  servers.stop();
}
const failed = all.flatMap((s) => s.results.filter((r) => !r.ok).map((r) => `${s.name}: ${r.label}`));
const total = all.reduce((n, s) => n + s.results.length, 0);
console.log(`\n${total - failed.length}/${total} 통과${failed.length ? `\n실패:\n  ${failed.join('\n  ')}` : ''}`);
console.log(`화면 사진·PDF: ${OUT}`);
process.exit(failed.length ? 1 : 0);
