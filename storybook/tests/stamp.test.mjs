// 듣기 도장판: 아이가 끝까지 들으면 도장 → 같은 동화는 한 번만 → 보낸 사람 홈에 "끝까지 들었어요"
import { APP, phone, signedIn } from './harness.mjs';
import { makeShare } from './fixtures.mjs';

async function listenToEnd(m, id) {
  await m.goto(`${APP}#/s/${id}`);
  await m.reload();
  await m.click('[data-act="start"]');
  await m.waitForSelector('.listen-start .title-xl', { timeout: 20000 });
  await m.waitForFunction(() => document.querySelector('.listen-start .title-xl')?.textContent.includes('끝'), null, { timeout: 20000 });
}

export default async function ({ check, browser, store }) {
  const A = makeShare(store, { id: 'stampstamp01', pages: 1 });
  const m = await phone(browser, { perms: [] });
  await listenToEnd(m, A);
  check('끝까지 들으면 "도장 쾅! 1번째"', (await m.textContent('.stamp-got')).includes('1번째'));
  await listenToEnd(m, A);
  check('같은 동화를 또 들어도 도장은 한 번만', !(await m.$('.stamp-got')) && (await m.evaluate(() => JSON.parse(localStorage.getItem('stamps')).length)) === 1);
  const g = await phone(browser);
  await signedIn(g, { role: 'grandma', name: '할머니', emoji: '👵', kid: '하은' }, { sentShares: [{ id: A, story: 'sun-moon', at: Date.now() }] });
  await g.waitForSelector('.heard-line', { timeout: 10000 });
  check('보낸 사람 홈: "하은이가 할머니 동화 1편을 끝까지 들었어요"', (await g.textContent('.heard-line')).includes('하은이가 할머니 동화 1편을 끝까지 들었어요'));
  check('오류가 없어요', !m.errors.length && !g.errors.length, [...m.errors, ...g.errors]);
  await m.context().close();
  await g.context().close();
}
