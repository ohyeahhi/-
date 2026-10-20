// 인생 연표: 추억 질문 대답을 삶의 때·연도 순으로 늘어놓고, 장면마다 목소리로 들어요. 손주는 받은 링크로 봐요.
import { APP, phone, signedIn, recordPages, consent, shot } from './harness.mjs';

export default async function ({ check, browser }) {
  const g = await phone(browser);
  await signedIn(g, { role: 'grandma', name: '할머니', emoji: '👵', kid: '하은' }, {
    myStories: [{ id: 'my-memoir', title: '할머니의 옛날 이야기', memoir: true, pages: [
      { text: '결혼하던 날 눈이 펑펑 왔단다.', seed: 0, q: 'wedding', ask: '결혼하던 날은 어땠나요?', when: '1972년 겨울' },
      { text: '처음 학교 가던 날 새 고무신을 신었지.', seed: 0, q: 'school1', ask: '처음 학교에 가던 날이 기억나나요?' },
    ] }],
  });
  // 추억 질문에서 "언제쯤"을 적어요
  await g.goto(`${APP}#/memory/home`);
  await g.waitForSelector('#memo-when');
  await g.fill('#memo-text', '어릴 때 우리 집은 마당에 감나무가 있는 초가집이었단다.');
  await g.fill('#memo-when', '1955년쯤');
  await g.click('#memo-save');
  await g.waitForSelector('.sheet [data-act="secondary"]');
  await g.click('.sheet [data-act="secondary"]');
  check('언제쯤을 적어 두어요', await g.evaluate(() => JSON.parse(localStorage.getItem('myStories'))[0].pages[2].when === '1955년쯤'));
  await g.goto(`${APP}#/record/my-memoir/0`);
  await recordPages(g, 4);

  await g.goto(`${APP}#/story/my-memoir`);
  await g.waitForSelector('a[href="#/timeline"]');
  await g.click('a[href="#/timeline"]');
  await g.waitForSelector('.tl-item');
  const eras = await g.$$eval('.tl-era-head', (e) => e.map((x) => x.textContent.trim()));
  check('때 순서: 어린 시절 → 학교 → 젊은 날', eras.join('|') === '🧒어린 시절|🎒학교 다닐 때|🌸젊은 날', eras);
  const texts = await g.$$eval('.tl-text', (e) => e.map((x) => x.textContent));
  check('장면이 때 순서로 놓여요', texts[0].includes('초가집') && texts[1].includes('고무신') && texts[2].includes('결혼'), texts);
  check('적어 둔 연도가 보여요', (await g.textContent('.timeline')).includes('1972년 겨울'));
  await g.click('[data-tl="3"]');
  await g.waitForTimeout(500);
  check('장면을 누르면 내 녹음이 나와요', await g.evaluate(() => [...document.querySelectorAll('video, audio')].some((v) => !v.paused && v.currentTime > 0)));
  await shot(g, 'timeline');

  await g.goto(`${APP}#/story/my-memoir`);
  await g.waitForSelector('#share');
  await g.click('#share');
  await g.click('[data-act="primary"]');
  await consent(g);
  await g.waitForSelector('.link-box', { timeout: 15000 });
  const url = (await g.textContent('.link-box')).trim();

  const k = await phone(browser);
  await k.goto(url);
  await k.click('[data-act="start"]');
  await k.waitForSelector('a[href^="#/timeline/s/"]', { timeout: 30000 });
  check('손주 끝 화면에 "할머니의 인생 연표 보기"', (await k.textContent('a[href^="#/timeline/s/"]')).includes('할머니의 인생 연표'));
  await k.click('a[href^="#/timeline/s/"]');
  await k.waitForSelector('.tl-item');
  const kt = await k.$$eval('.tl-text', (e) => e.map((x) => x.textContent));
  check('손주도 같은 순서로 봐요', kt[0].includes('초가집') && kt[2].includes('결혼') && (await k.textContent('.timeline')).includes('1955년쯤'), kt);
  await k.click('[data-tl="1"]');
  await k.waitForTimeout(500);
  check('손주 휴대폰에서도 장면 목소리가 나와요', await k.evaluate(() => [...document.querySelectorAll('video, audio')].some((v) => !v.paused && v.currentTime > 0)));
  check('오류가 없어요', !g.errors.length && !k.errors.length, [...g.errors, ...k.errors]);
  await g.context().close();
  await k.context().close();
}
