// 손주 답장: 다 듣고 나서 목소리로 답장 → 할머니 홈에 "답장이 왔어요" → 모아 듣기
import { APP, phone, signedIn, shot } from './harness.mjs';
import { makeShare } from './fixtures.mjs';

const ID = 'replytest001';

async function sendReply(m) {
  await m.click('[data-act="reply"]');
  await m.waitForSelector('[data-r="rec"]');
  await m.click('[data-r="rec"]');
  await m.waitForTimeout(1200);
  await m.click('[data-r="rec"]');
  await m.waitForSelector('.reply-done:not([hidden])');
}

export default async function ({ check, browser, store }) {
  makeShare(store, { id: ID, pages: 1 });
  const m = await phone(browser);
  await m.goto(`${APP}#/s/${ID}`);
  await m.click('[data-act="start"]');
  await m.waitForSelector('[data-act="reply"]', { timeout: 15000 });
  await sendReply(m);
  check('보호자 확인 전에는 보낼 수 없어요', await m.$eval('[data-r="send"]', (b) => b.disabled));
  await m.check('#reply-ok');
  await shot(m, 'reply-sheet');
  await m.click('[data-r="send"]');
  await m.waitForSelector('.toast.show');
  check('답장을 보냈다고 알려 줘요', (await m.textContent('.toast')).includes('답장을 보냈어요'));
  // 두 번째 답장은 빈 번호(reply-2)로 가요
  await sendReply(m);
  await m.check('#reply-ok');
  await m.click('[data-r="send"]');
  await m.waitForFunction(() => document.querySelector('.toast')?.textContent.includes('답장을 보냈어요') && !document.querySelector('[data-r="send"]'));
  check('손주 휴대폰에 오류가 없어요', !m.errors.length, m.errors);

  const g = await phone(browser);
  await signedIn(g, { role: 'grandma', kid: '하은' }, { sentShares: [{ id: ID, story: 'sun-moon', at: Date.now() }] });
  await g.waitForSelector('.reply-notice', { timeout: 10000 });
  const note = await g.textContent('.reply-notice');
  check('홈에 "하은이가 답장을 보냈어요 · 새 답장 2개"', note.includes('하은이가 답장을 보냈어요') && note.includes('2개'), note);
  await shot(g, 'reply-home');
  await g.click('.reply-notice');
  await g.waitForSelector('.reply-card');
  check('답장 2개가 보여요', (await g.$$eval('.reply-card', (e) => e.length)) === 2);
  await g.click('.reply-card');
  await g.waitForTimeout(500);
  check('답장이 재생돼요', await g.evaluate(() => [...document.querySelectorAll('video, audio')].some((v) => !v.paused && v.currentTime > 0)));
  await shot(g, 'reply-list');
  await g.goto(`${APP}#/`);
  await g.waitForSelector('#reply-slot a');
  check('들은 답장은 새 답장에서 빠져요', (await g.textContent('#reply-slot')).includes('1개'));
  check('할머니 휴대폰에 오류가 없어요', !g.errors.length, g.errors);
  await m.context().close();
  await g.context().close();
}
