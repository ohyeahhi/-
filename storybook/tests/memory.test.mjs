// 추억 질문: 홈 카드 → 질문에 답하기 → 그림 → 옛날 이야기 책에 모이기 → 녹음 → 그림책에 질문이 보여요
import { APP, phone, signedIn, shot } from './harness.mjs';

export default async function ({ check, browser }) {
  const p = await phone(browser);
  await signedIn(p, { role: 'grandma', kid: '하은' });
  await p.waitForSelector('.memo-card');
  check('홈에 오늘의 추억 질문이 보여요', (await p.textContent('.memo-card')).includes('오늘의 추억 질문'));
  await shot(p, 'memory-home');
  await p.click('.memo-card');
  await p.waitForSelector('#memo-text');
  const q1 = await p.textContent('.memo-q');
  check('저장 버튼은 대답을 적어야 눌려요', await p.$eval('#memo-save', (b) => b.disabled));
  await p.click('#memo-skip');
  await p.waitForSelector('#memo-text');
  check('"다른 질문"을 누르면 질문이 바뀌어요', (await p.textContent('.memo-q')) !== q1);

  await p.goto(`${APP}#/memory/meet`);
  await p.waitForSelector('#memo-text');
  check('할머니에게는 "할아버지를 처음 만난 날"로 물어요', (await p.textContent('.memo-q')).includes('할아버지를 처음 만난'));
  await p.fill('#memo-text', '할아버지를 처음 만난 건 장날이었어. 할아버지가 사과를 한 봉지 사 주었지.');
  await p.waitForTimeout(800);
  check('대답에 맞는 그림이 그려져요 (사과)', (await p.textContent('#memo-found')).includes('사과'));
  await shot(p, 'memory-answer');
  await p.click('#memo-save');
  await p.waitForSelector('.sheet [data-act="secondary"]');
  await p.click('.sheet [data-act="secondary"]');
  await p.waitForSelector('.memo-card');

  await p.goto(`${APP}#/memory/home`);
  await p.waitForSelector('#memo-text');
  check('모은 개수가 보여요', (await p.textContent('.memo-progress')).includes('1개 모았어요'));
  await p.fill('#memo-text', '어릴 때 우리 집은 마당에 감나무가 있는 초가집이었단다.');
  await p.click('#memo-save');
  await p.waitForSelector('.sheet [data-act="primary"]');
  await p.click('.sheet [data-act="primary"]');
  await p.waitForSelector('.read-text');
  check('바로 그 장면 녹음으로 가요 (질문이 함께 보여요)', (await p.textContent('.read-text')).includes('Q. 어릴 때 살던 집') && (await p.evaluate(() => location.hash)) === '#/record/my-memoir/2');

  await p.goto(`${APP}#/`);
  await p.waitForSelector('.story-card');
  check('홈 "내가 지은 이야기"에 할머니의 옛날 이야기가 생겨요', (await p.textContent('.screen-home')).includes('할머니의 옛날 이야기'));
  const memoQ = await p.textContent('.memo-card-q');
  check('답한 질문은 다시 묻지 않아요', !memoQ.includes('처음 만난') && !memoQ.includes('살던 집은'), memoQ);
  await p.goto(`${APP}#/story/my-memoir`);
  await p.waitForSelector('a[href="#/memory"]');
  check('이야기 화면에서 질문을 더 답할 수 있어요', true);
  await p.goto(`${APP}#/book/my-memoir`);
  await p.waitForSelector('.bp-text .ask');
  check('그림책에도 질문이 보여요', (await p.$$eval('.bp-text .ask', (e) => e.length)) === 2);
  await shot(p, 'memory-book');
  await p.goto(`${APP}#/edit/my-memoir`);
  await p.waitForSelector('#save');
  await p.click('#save');
  await p.waitForTimeout(500);
  check('고쳐서 저장해도 질문이 남아요', await p.evaluate(() => JSON.parse(localStorage.getItem('myStories'))[0].pages.every((x) => x.ask && x.q)));
  check('오류가 없어요', !p.errors.length, p.errors);
  await p.context().close();
}
