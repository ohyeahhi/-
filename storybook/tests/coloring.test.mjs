// 색칠놀이: 동화 그림 → 선 그림, 누르면 칠해져요. 아이(받은 링크)도, 할머니(이야기 화면)도 열 수 있어요.
import { APP, phone, signedIn, shot } from './harness.mjs';
import { makeShare } from './fixtures.mjs';

export default async function ({ check, browser, store }) {
  const p = await phone(browser);
  await signedIn(p);
  await p.goto(`${APP}#/story/sun-moon`);
  await p.waitForSelector('a[href="#/color/story/sun-moon"]');
  await p.click('a[href="#/color/story/sun-moon"]');
  await p.waitForSelector('#color-canvas');
  await p.waitForTimeout(800);
  check('동화 그림 10장이 색칠 그림으로 나와요', (await p.$$eval('.color-thumb', (e) => e.length)) === 10);
  const stats = () => p.evaluate(() => {
    const d = document.querySelector('#color-canvas').getContext('2d').getImageData(0, 0, 800, 600).data;
    let white = 0, dark = 0, red = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i] > 250 && d[i + 1] > 250 && d[i + 2] > 250) white++;
      else if (d[i] < 60 && d[i + 1] < 60) dark++;
      else if (d[i] === 228 && d[i + 1] === 87 && d[i + 2] === 61) red++;
    }
    return { white, dark, red };
  });
  const before = await stats();
  check('흰 바탕에 검은 선 그림이에요', before.white > 300000 && before.dark > 5000, JSON.stringify(before));
  const box = await p.$eval('#color-canvas', (c) => { const r = c.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  await p.mouse.click(box.x + box.w * 0.08, box.y + box.h * 0.06);
  const after = await stats();
  check('누르면 고른 색(빨강)으로 칠해져요', after.red > 1000, JSON.stringify(after));
  await shot(p, 'coloring');
  await p.click('.crayon >> nth=6');
  await p.click('#color-reset');
  await p.waitForTimeout(400);
  check('"처음부터"를 누르면 다시 흰 그림', (await stats()).red === 0);

  const ID = makeShare(store, { id: 'colorcolor01', pages: 3 });
  const m = await phone(browser, { perms: [] });
  await m.goto(`${APP}#/color/s/${ID}`);
  await m.waitForSelector('#color-canvas');
  check('받은 링크로도 색칠놀이를 열어요 (처음 설정 없이)', (await m.$$eval('.color-thumb', (e) => e.length)) === 10);
  check('오류가 없어요', !p.errors.length && !m.errors.length, [...p.errors, ...m.errors]);
  await p.context().close();
  await m.context().close();
}
