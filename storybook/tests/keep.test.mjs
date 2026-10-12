// 녹음 보관: 1년 무료, 끝나기 60일 전 안내, 10년 보관 결제
import { APP, API, phone, shot } from './harness.mjs';
import { makeShare } from './fixtures.mjs';

export default async function ({ check, browser, store }) {
  const old = makeShare(store, { id: 'oldoldold001', daysAgo: 330 });
  const fresh = makeShare(store, { id: 'newnewnew001', daysAgo: 3 });
  const p = await phone(browser, { toss: true, perms: [] });
  await p.goto(`${APP}#/s/${fresh}`);
  await p.waitForSelector('[data-act="start"]');
  await p.waitForTimeout(600);
  check('새 링크에는 지워진다는 안내가 없어요', (await p.textContent('#keep-note')).trim() === '');
  await p.goto(`${APP}#/s/${old}`);
  await p.waitForSelector('.keep-notice', { timeout: 5000 }).catch(() => {});
  check('330일 된 링크에는 지워지는 날 안내가 떠요', (await p.textContent('#keep-note')).includes('지워져요'));
  await p.click('.keep-notice');
  await p.waitForSelector('#keep-pay');
  check('보관 화면에 무료 보관 끝나는 날이 보여요', (await p.textContent('.keep-status')).includes('무료로'));
  check('10년 보관은 9,900원', (await p.textContent('#keep-pay')).includes('9,900원'));
  await shot(p, 'keep');
  await p.click('#keep-pay');
  await p.waitForSelector('.celebrate h1', { timeout: 10000 });
  check('결제 후 "10년 동안 간직할게요"', (await p.textContent('.celebrate h1')).includes('10년'));
  check('결제 후 그 녹음 보관 화면으로 돌아와요 (처음 설정으로 가지 않음)', p.url().includes(`#/keep/${old}`), p.url());
  await p.click('.cta-bar .btn-primary');
  await p.waitForSelector('[data-act="start"]');
  await p.waitForTimeout(600);
  check('보관을 산 뒤에는 안내가 사라져요', (await p.textContent('#keep-note')).trim() === '');
  const res = await p.evaluate(async (api) => (await fetch(`${api}/functions/v1/orders`, { method: 'POST', body: JSON.stringify({ action: 'create', kind: 'keep', shareId: 'zzzzzzzzzzzz' }) })).status, API);
  check('없는 녹음의 보관은 서버가 거절해요', res === 404, res);
  check('오류가 없어요', !p.errors.length, p.errors);
  await p.context().close();
}
