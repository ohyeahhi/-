// 내가 지은 이야기: 글 → 그림, 그림에 넣은 것, 인물 빼기, 얼굴 영상 녹화, 영상통화처럼 듣기, 가족 공유
import { APP, phone, signedIn, consent, shot } from './harness.mjs';

const overlap = (a, b) => `(() => { const a = document.querySelector('${a}').getBoundingClientRect(), b = document.querySelector('${b}').getBoundingClientRect(); return !(b.top >= a.bottom || b.bottom <= a.top || b.left >= a.right || b.right <= a.left); })()`;

export default async function ({ check, browser }) {
  const p = await phone(browser);
  await signedIn(p);
  await p.click('.new-card');
  await p.waitForSelector('#st-title');
  await p.fill('#st-title', '누렁이와 개울가');
  await p.fill('[data-n="0"] textarea', '강아지 두 마리와 고양이가 사과나무에서 사과를 까먹었어요.');
  await p.waitForTimeout(800);
  const found = await p.textContent('[data-n="0"] .page-found');
  check('그림에 넣은 것: 강아지 ×2, 고양이, 사과나무', found.includes('강아지 ×2') && found.includes('고양이') && found.includes('사과나무'), found);
  const art1 = await p.getAttribute('[data-n="0"] .page-art img', 'src');
  check('사과가 그림에 들어가요', decodeURIComponent(art1).includes('C-10-48-30-46'));
  await p.click('[data-n="0"] [data-act="nocast"]');
  check('인물 빼기를 누르면 풍경만 그려요', (await p.textContent('[data-n="0"] .page-found')).includes('인물 없이 풍경만'));
  await p.click('#add-page');
  await p.fill('[data-n="1"] textarea', '밤이 되면 할아버지가 마당에서 별 이야기를 해 주셨지.');
  await p.waitForTimeout(700);
  const before = await p.getAttribute('[data-n="1"] .page-art img', 'src');
  await p.click('[data-n="1"] [data-act="reroll"]');
  check('"다른 그림"은 그림을 바꿔요', before !== (await p.getAttribute('[data-n="1"] .page-art img', 'src')));
  await shot(p, 'custom-editor');
  await p.click('#save');
  await p.waitForSelector('[data-act="rec"]');
  const id = (await p.evaluate(() => location.hash)).split('/')[2];
  check('인물 빼기가 저장돼요', await p.evaluate((sid) => JSON.parse(localStorage.getItem('myStories')).find((s) => s.id === sid).pages[0].noCast === true, id));

  // 얼굴 영상 켜고 인사말 + 2쪽 녹음
  await p.click('#cam-toggle');
  await p.waitForSelector('#pip video');
  await p.waitForTimeout(500);
  check('녹화 미리보기가 그림을 가리지 않아요', !(await p.evaluate(overlap('.scene', '#pip'))));
  for (let i = 0; i < 3; i++) {
    await p.waitForSelector('[data-act="rec"]');
    await p.click('[data-act="rec"]');
    await p.waitForTimeout(1200);
    await p.click('[data-act="rec"]');
    await p.waitForSelector('[data-act="next"]');
    await p.click('[data-act="next"]');
  }
  await p.waitForSelector('.celebrate');
  const type = await p.evaluate(async (sid) => (await (await import('./db.js')).getRecord(`${sid}/1`)).blob.type, id);
  check('얼굴과 목소리가 영상으로 녹화돼요', type.startsWith('video/'), type);
  await p.click(`a[href="#/listen/${id}"]`);
  await p.click('[data-act="start"]');
  await p.waitForSelector('.call-cam video', { timeout: 5000 });
  await p.waitForTimeout(1000);
  check('듣기 화면의 영상이 그림을 가리지 않아요', !(await p.evaluate(overlap('.scene', '.call-cam'))));
  check('영상이 재생돼요', await p.evaluate(() => { const v = document.querySelector('.call-cam video'); return !v.paused && v.videoWidth > 0; }));
  await shot(p, 'custom-listen');

  await p.goto(`${APP}#/story/${id}`);
  await p.click('#share');
  await p.click('[data-act="primary"]');
  await consent(p);
  await p.waitForSelector('.link-box', { timeout: 15000 });
  const url = (await p.textContent('.link-box')).trim();
  const m = await phone(browser, { perms: [] });
  await m.goto(url);
  await m.waitForSelector('[data-act="start"]');
  check('지은 이야기도 가족 휴대폰에서 열려요', (await m.textContent('.listen-start h1')) === '누렁이와 개울가');
  await m.click('[data-act="start"]');
  await m.waitForTimeout(2000);
  check('가족 휴대폰에서도 얼굴 영상이 나와요', await m.evaluate(() => { const v = document.querySelector('.call-cam video'); return Boolean(v && v.videoWidth > 0); }));
  check('오류가 없어요', !p.errors.length && !m.errors.length, [...p.errors, ...m.errors]);
  await p.context().close();
  await m.context().close();
}
