// 재생이 안 되는 녹음: 안내 → 6초 뒤 다음 쪽 → 두 번 실패하면 다른 브라우저 권하기
import { APP, phone, shot } from './harness.mjs';
import { makeShare } from './fixtures.mjs';

export default async function ({ check, browser, store }) {
  const id = makeShare(store, { id: 'badbadbad001' });
  const p = await phone(browser, { perms: [] });
  await p.goto(`${APP}#/s/${id}`);
  await p.waitForSelector('[data-act="start"]');
  await p.click('[data-act="start"]');
  await p.waitForSelector('.play-fail', { timeout: 8000 });
  check('틀 수 없는 쪽은 안내가 나와요', (await p.textContent('.play-fail')).includes('틀 수 없어요'));
  await shot(p, 'playback-fail');
  const at = () => p.$$eval('.dots i', (d) => d.findIndex((x) => x.classList.contains('on')));
  const before = await at();
  await p.waitForSelector('.sheet-title', { timeout: 9000 });
  check('두 쪽이 안 나오면 다른 브라우저를 권해요', (await p.textContent('.sheet-title')).includes('재생이 잘 안 돼요'));
  check('멈추지 않고 다음 쪽으로 넘어가요', (await at()) > before);
  check('오류가 없어요', !p.errors.length, p.errors);
  await p.context().close();
}
