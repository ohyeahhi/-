// 처음 화면: 할머니·할아버지가 아니어도 (삼촌·이모·고모…) 내 이름과 이모지로 들려줘요.
import { APP, phone, recordPages, consent, shot } from './harness.mjs';

export default async function ({ check, browser }) {
  const p = await phone(browser);
  await p.goto(`${APP}#/welcome`);
  await p.waitForSelector('.preset');
  check('저는: 할머니·할아버지·엄마·아빠·이모·고모·삼촌·숙모', (await p.$$eval('.preset', (e) => e.map((x) => x.textContent.replace(/\P{L}/gu, '')).join(','))) === '할머니,할아버지,엄마,아빠,이모,고모,삼촌,숙모');
  await p.click('.preset[data-name="삼촌"]');
  check('고르면 내 이름 칸에 들어가요', (await p.inputValue('#my-name')) === '삼촌');
  await p.fill('#my-name', '<큰삼촌>');
  await p.click('.emoji-pick[data-emoji="🐻"]');
  await p.fill('#kid', '예빈');
  await shot(p, 'identity');
  await p.click('#go');
  await p.waitForSelector('.screen-home .title-xl');
  check('홈에 "큰삼촌 목소리로"', (await p.textContent('.screen-home .title-xl')).includes('큰삼촌 목소리로'));
  check('이름에서 꺾쇠 같은 글자는 빼요', (await p.evaluate(() => JSON.parse(localStorage.getItem('profile')).name)) === '큰삼촌');
  await p.goto(`${APP}#/record/sun-moon/0`);
  await p.waitForSelector('.hint-card');
  check('인사말 예시: "예빈아, 큰삼촌이야."', (await p.textContent('.hint-card')).includes('예빈아, 큰삼촌이야.'));
  await recordPages(p, 11);
  await p.waitForSelector('#share');
  await p.click('#share');
  await p.click('[data-act="primary"]');
  await consent(p);
  await p.waitForSelector('.link-box', { timeout: 15000 });
  const url = (await p.textContent('.link-box')).trim();
  const m = await phone(browser, { perms: [] });
  await m.goto(url);
  await m.waitForSelector('[data-act="start"]');
  check('받은 링크: "큰삼촌이 읽어주는"', (await m.textContent('.eyebrow')).includes('큰삼촌이 읽어주는'));
  check('오류가 없어요', !p.errors.length && !m.errors.length, [...p.errors, ...m.errors]);
  await p.context().close();
  await m.context().close();
}
