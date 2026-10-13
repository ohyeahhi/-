// 가족 책장: 동화를 보낼 때마다 책장에 모이고, 손주는 링크 하나로 모두 봐요. 새로 들어온 동화에는 표시가 붙어요.
import { APP, API, phone, signedIn, recordPages, consent, shot } from './harness.mjs';

const story = (id, title, text) => ({ id, title, pages: [{ text }] });

async function recordAndShare(g, id, first = false) {
  await g.goto(`${APP}#/record/${id}/0`);
  await recordPages(g, 2);
  await g.waitForSelector('#share');
  await g.click('#share');
  await g.click('[data-act="primary"]');
  if (first) await consent(g);
  await g.waitForSelector('.link-box', { timeout: 15000 });
  const note = await g.textContent('.sheet-body');
  await g.click('[data-act="secondary"]').catch(() => {});
  return note;
}

export default async function ({ check, browser }) {
  const g = await phone(browser);
  await signedIn(g, { role: 'grandpa', kid: '민준' }, {
    myStories: [story('my-shelfaa1', '개울가 이야기', '할아버지가 개울에서 물고기를 잡았어요.'), story('my-shelfbb2', '감나무 이야기', '마당 감나무에 감이 주렁주렁 열렸어요.'), story('my-shelfcc3', '눈사람 이야기', '눈이 오는 날 눈사람을 만들었어요.')],
  });
  const note = await recordAndShare(g, 'my-shelfaa1', true);
  check('보내기 화면에 "가족 책장에도 들어갔어요"', note.includes('가족 책장에도'));
  await recordAndShare(g, 'my-shelfbb2');
  await g.goto(`${APP}#/`);
  await g.waitForSelector('#send-shelf');
  await g.click('#send-shelf');
  await g.waitForSelector('.link-box');
  const url = (await g.textContent('.link-box')).trim();
  check('홈에서 가족 책장 링크를 보내요', /#\/shelf\/[a-z0-9]{12}$/.test(url), url);

  const m = await phone(browser, { perms: [] });
  await m.goto(url);
  await m.waitForSelector('.book-spine');
  check('아이는 처음 설정 없이 가족 책장을 열어요 (할아버지 존)', (await m.textContent('.title-xl')).includes('우리 가족 책장') && (await m.textContent('.zone-head')).includes('할아버지'));
  check('보낸 동화 2편이 모여 있어요', (await m.$$eval('.book-spine', (e) => e.length)) === 2);
  check('처음 볼 때는 "새 동화" 표시가 없어요', !(await m.$('.shelf-new')));
  // 책장 주소만 아는 사람이 서명 없이 가짜 동화를 끼워 넣어도 보이지 않아요.
  const shelf = url.split('#/shelf/')[1];
  const forged = await m.evaluate(async ([api, id]) => (await fetch(`${api}/storage/v1/object/shares/${id}/s-3.json`, { method: 'POST', headers: { apikey: 'sb_publishable_test', 'content-type': 'application/json' }, body: JSON.stringify({ shareId: 'aaaaaaaaaaaa', storyId: 'sun-moon', title: '가짜 동화', at: new Date().toISOString(), sig: 'AAAA' }) })).status, [API, shelf]);
  await m.reload();
  await m.waitForSelector('.book-spine');
  check('서명 없는 가짜 동화는 책장에 보이지 않아요', forged === 200 && !(await m.textContent('.screen-shelf')).includes('가짜 동화'));

  await recordAndShare(g, 'my-shelfcc3');
  await m.reload();
  await m.waitForSelector('.book-spine');
  check('새로 보낸 동화가 맨 위에 "새 동화"로 붙어요', (await m.$$eval('.book-spine', (e) => e.length)) === 3 && (await m.textContent('.shelf-new')).includes('눈사람'));
  await shot(m, 'shelf');
  await m.click('.shelf-new');
  await m.waitForSelector('[data-act="start"]');
  check('책장에서 누르면 그 동화가 열려요', (await m.textContent('.title-xl')).includes('눈사람'));
  await m.click('[data-act="start"]');
  await m.waitForSelector('a[href="#/family"]', { timeout: 20000 });
  check('동화 끝 화면에서 가족 책장으로 돌아갈 수 있어요', (await m.textContent('a[href="#/family"]')).includes('가족 책장'));
  // 삼촌도 자기 휴대폰에서 동화를 보내면, 아이 책장에 "큰삼촌 존"이 따로 생겨요.
  const u = await phone(browser);
  await signedIn(u, { role: 'family', name: '큰삼촌', emoji: '🧔', kid: '민준' }, { myStories: [story('my-uncleaa1', '삼촌의 낚시', '삼촌이 바다에서 물고기를 잡았어요.')] });
  await u.goto(`${APP}#/record/my-uncleaa1/0`);
  await recordPages(u, 2);
  await u.waitForSelector('#share');
  await u.click('#share');
  await u.click('[data-act="primary"]');
  await consent(u);
  await u.waitForSelector('.link-box', { timeout: 15000 });
  const uncleUrl = (await u.textContent('.link-box')).trim();
  await m.goto(uncleUrl);
  await m.waitForSelector('[data-act="start"]');
  await m.goto(`${APP}#/family`);
  await m.waitForSelector('.zone + .zone');
  const zones = await m.$$eval('.zone-head b', (e) => e.map((x) => x.textContent));
  check('삼촌 링크를 한 번 열면 "큰삼촌 존"이 생겨요', zones.includes('할아버지') && zones.includes('큰삼촌'), zones);
  await shot(m, 'family-shelf');
  await m.goto(APP);
  await m.waitForFunction(() => location.hash === '#/family');
  check('아이 휴대폰에서 앱을 열면 가족 책장으로 가요', true);
  await u.context().close();
  await m.goto(`${APP}#/shelf/zzzzzzzzzzzz`);
  await m.waitForSelector('.zone');
  check('없는 책장 링크는 가족 책장에 더하지 않아요', !(await m.evaluate(() => JSON.parse(localStorage.getItem('familyShelves')).includes('zzzzzzzzzzzz'))));
  check('오류가 없어요', !g.errors.length && !m.errors.length, [...g.errors, ...m.errors]);
  await g.context().close();
  await m.context().close();
}
