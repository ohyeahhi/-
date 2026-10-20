// 따라 읽기: 한 쪽이 끝나면 아이가 따라 말하고 → 바로 들어 보고 → 끝에서 할머니께 보내요
import { APP, phone, signedIn } from './harness.mjs';
import { makeShare } from './fixtures.mjs';

export default async function ({ check, browser, store }) {
  const ID = makeShare(store, { id: 'echoecho0001', pages: 2, kid: '하은' });
  const m = await phone(browser);
  await m.goto(`${APP}#/s/${ID}`);
  await m.waitForSelector('#echo-on');
  await m.check('#echo-on');
  await m.click('[data-act="start"]');
  // 이 시험 녹음은 재생이 안 되는 소리라서, 쪽마다 6초 뒤 넘어가요. (인사말 → 1쪽)
  await m.waitForSelector('.echo', { timeout: 20000 });
  await m.click('.sheet-backdrop [data-act="secondary"]').catch(() => {});
  check('1쪽이 끝나면 "따라 말해 볼까?"', (await m.textContent('.echo-say')).includes('따라 말해'));
  await m.click('[data-act="echo-rec"]');
  await m.waitForTimeout(1200);
  await m.click('[data-act="echo-rec"]');
  await m.waitForSelector('[data-act="echo-next"]');
  check('따라 말하면 "잘했어요!"', (await m.textContent('.echo-say')).includes('잘했어요'));
  await m.click('[data-act="echo-next"]');
  await m.waitForSelector('.echo-list');
  check('끝 화면에 따라 읽은 목소리가 모여요', (await m.$$eval('.echo-item', (e) => e.length)) === 1);
  await m.click('[data-act="echo-send"]');
  await m.waitForSelector('#echo-ok');
  await m.check('#echo-ok');
  await m.click('.sheet-backdrop:last-child [data-act="primary"]');
  await m.waitForFunction(() => document.querySelector('.toast')?.textContent.includes('보냈어요'));
  const g = await phone(browser);
  await signedIn(g, { role: 'grandma', name: '할머니', emoji: '👵', kid: '하은' }, { sentShares: [{ id: ID, story: 'sun-moon', at: Date.now() }] });
  await g.goto(`${APP}#/replies`);
  await g.waitForSelector('.reply-card');
  check('따라 읽은 목소리가 할머니께 와요', (await g.$$eval('.reply-card', (e) => e.length)) === 1);
  check('오류가 없어요', !m.errors.length && !g.errors.length, [...m.errors, ...g.errors]);
  await m.context().close();
  await g.context().close();
}
