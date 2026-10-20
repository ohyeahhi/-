// 녹음 화면: 앞뒤 쪽으로 바로 가기. 녹음하는 동안에는 막아요.
import { APP, phone, signedIn } from './harness.mjs';

export default async function ({ check, browser }) {
  const p = await phone(browser);
  await signedIn(p);
  await p.goto(`${APP}#/record/sun-moon/7`);
  await p.waitForSelector('.page-nav');
  await p.click('.page-nav-btn >> nth=0');
  await p.waitForFunction(() => location.hash === '#/record/sun-moon/6');
  check('"6쪽" 버튼으로 7쪽에서 6쪽으로 가요', true);
  await p.click('.page-nav-btn >> nth=1');
  await p.waitForFunction(() => location.hash === '#/record/sun-moon/7');
  check('"7쪽" 버튼으로 다시 7쪽으로 와요', true);
  await p.goto(`${APP}#/record/sun-moon/1`);
  await p.waitForSelector('.page-nav');
  check('1쪽 앞은 "인사말"', (await p.textContent('.page-nav-btn >> nth=0')).includes('인사말'));
  await p.click('[data-act="rec"]');
  await p.waitForTimeout(500);
  await p.click('.page-nav-btn >> nth=0');
  await p.waitForTimeout(300);
  check('녹음하는 동안에는 쪽을 옮기지 않아요', (await p.evaluate(() => location.hash)) === '#/record/sun-moon/1');
  await p.click('[data-act="rec"]');
  await p.waitForSelector('.take-tip', { timeout: 5000 }).catch(() => {});
  check('녹음이 끝나면 녹음 도우미가 한마디 해요', Boolean(await p.$('.take-tip')), await p.evaluate(() => document.querySelector('.dock-main')?.innerText));
  check('오류가 없어요', !p.errors.length, p.errors);
  await p.context().close();
}
