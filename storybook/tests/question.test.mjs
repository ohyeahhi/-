// 할머니의 질문: 동화 끝에 질문을 녹음 → 아이는 끝 화면에서 질문을 듣고 목소리로 대답 → 할머니 홈에 답장
import { APP, phone, signedIn, recordPages, consent, shot } from './harness.mjs';

export default async function ({ check, browser }) {
  const g = await phone(browser);
  await signedIn(g, { role: 'grandma', name: '할머니', emoji: '👵', kid: '하은' }, { myStories: [{ id: 'my-qqqqqq01', title: '감나무 집', pages: [{ text: '마당에 감나무가 있었어요.' }] }] });
  await g.goto(`${APP}#/record/my-qqqqqq01/0`);
  await recordPages(g, 2);
  await g.goto(`${APP}#/story/my-qqqqqq01`);
  await g.waitForSelector('.q-row');
  await g.click('.q-row');
  await g.waitForSelector('.q-idea');
  check('질문 예시에 아이 이름이 들어가요', (await g.textContent('.q-ideas')).includes('하은아'));
  await g.click('.q-idea >> nth=1');
  check('예시를 누르면 질문 칸에 들어가요', (await g.inputValue('#q-text')).includes('하은이라면'));
  await g.click('[data-q-act="rec"]');
  await g.waitForTimeout(1200);
  await g.click('[data-q-act="rec"]');
  await g.waitForSelector('[data-q-act="play"]');
  check('질문을 녹음했어요', true);
  await shot(g, 'question');
  await g.goto(`${APP}#/story/my-qqqqqq01`);
  await g.waitForSelector('.q-row .num.done');
  await g.click('#share');
  await g.click('[data-act="primary"]');
  await consent(g);
  await g.waitForSelector('.link-box', { timeout: 15000 });
  const url = (await g.textContent('.link-box')).trim();

  const m = await phone(browser);
  await m.goto(url);
  await m.click('[data-act="start"]');
  await m.waitForSelector('.q-card', { timeout: 20000 });
  check('동화 끝에 "할머니의 질문"이 나와요', (await m.textContent('.q-card')).includes('하은이라면 어떻게 했을 것 같아?'));
  await m.click('[data-act="qplay"]');
  await m.waitForTimeout(500);
  check('질문 목소리가 재생돼요', await m.evaluate(() => [...document.querySelectorAll('video, audio')].some((v) => !v.paused && v.currentTime > 0)));
  await m.click('[data-act="reply"]');
  await m.waitForSelector('.sheet-title');
  check('대답 창 제목: "할머니의 질문에 대답하기"', (await m.textContent('.sheet-title')).includes('질문에 대답하기'));
  await m.click('[data-r="rec"]');
  await m.waitForTimeout(1200);
  await m.click('[data-r="rec"]');
  await m.waitForSelector('.reply-done:not([hidden])');
  await m.check('#reply-ok');
  await m.click('[data-r="send"]');
  await m.waitForFunction(() => document.querySelector('.toast')?.textContent.includes('답장을 보냈어요'));
  await g.goto(`${APP}#/replies`);
  await g.waitForSelector('.reply-card');
  check('아이의 대답이 할머니께 와요', (await g.$$eval('.reply-card', (e) => e.length)) === 1);
  check('오류가 없어요', !g.errors.length && !m.errors.length, [...g.errors, ...m.errors]);
  await g.context().close();
  await m.context().close();
}
