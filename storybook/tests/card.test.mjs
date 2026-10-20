// 목소리 카드: 홈 → 카드 종류 고르기 → 할 말 고치기 → 한 번 녹음 → 보내기 → 받은 쪽에서 듣기
import { APP, phone, signedIn, recordPages, consent, shot } from './harness.mjs';

export default async function ({ check, browser }) {
  const p = await phone(browser);
  await signedIn(p, { role: 'grandma', name: '할머니', emoji: '👵', kid: '하은' });
  await p.waitForSelector('.card-row');
  await p.click('.card-row');
  await p.waitForSelector('.card-kind');
  check('카드 8가지 (생일·어린이날·입학…)', (await p.$$eval('.card-kind', (e) => e.length)) === 8);
  check('생일 카드 할 말에 아이 이름이 들어가요', (await p.inputValue('#card-text')).startsWith('하은아, 생일 축하해'));
  await p.click('.card-kind[href="#/card/school"]');
  await p.waitForFunction(() => document.querySelector('#card-text')?.value.includes('입학'));
  await p.fill('#card-text', '하은아, 입학 축하해! 할머니가 늘 응원할게.');
  await shot(p, 'card');
  await p.click('#card-go');
  await p.waitForSelector('[data-act="rec"]');
  check('카드는 인사말 없이 바로 그 한 장을 녹음해요', (await p.textContent('.topbar-title')).includes('목소리 카드') && !(await p.$('.hint-card')));
  await recordPages(p, 1);
  await p.waitForSelector('#share');
  check('카드에는 그림책·고치기가 없어요', !(await p.$('a[href^="#/book/"]')) && !(await p.$('a[href^="#/edit/"]')));
  await p.click('#share');
  await p.click('[data-act="primary"]');
  await consent(p);
  await p.waitForSelector('.link-box', { timeout: 15000 });
  const url = (await p.textContent('.link-box')).trim();
  const m = await phone(browser, { perms: [] });
  await m.goto(url);
  await m.waitForSelector('[data-act="start"]');
  check('받은 쪽에서 카드 제목이 보여요', (await m.textContent('.title-xl')).includes('입학 카드'));
  await m.click('[data-act="start"]');
  await m.waitForSelector('.listen-text');
  check('카드 글이 나와요', (await m.textContent('.listen-text')).includes('입학 축하해'));
  check('오류가 없어요', !p.errors.length && !m.errors.length, [...p.errors, ...m.errors]);
  await p.context().close();
  await m.context().close();
}
