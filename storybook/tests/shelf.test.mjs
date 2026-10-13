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
  await m.waitForSelector('.screen-shelf .story-card');
  check('손주는 처음 설정 없이 책장을 열어요', (await m.textContent('.title-xl')).includes('할아버지의 동화 책장'));
  check('보낸 동화 2편이 모여 있어요', (await m.$$eval('.story-card', (e) => e.length)) === 2);
  check('처음 볼 때는 "새 동화" 표시가 없어요', !(await m.$('.shelf-new')));
  // 책장 주소만 아는 사람이 서명 없이 가짜 동화를 끼워 넣어도 보이지 않아요.
  const shelf = url.split('#/shelf/')[1];
  const forged = await m.evaluate(async ([api, id]) => (await fetch(`${api}/storage/v1/object/shares/${id}/s-3.json`, { method: 'POST', headers: { apikey: 'sb_publishable_test', 'content-type': 'application/json' }, body: JSON.stringify({ shareId: 'aaaaaaaaaaaa', storyId: 'sun-moon', title: '가짜 동화', at: new Date().toISOString(), sig: 'AAAA' }) })).status, [API, shelf]);
  await m.reload();
  await m.waitForSelector('.screen-shelf .story-card');
  check('서명 없는 가짜 동화는 책장에 보이지 않아요', forged === 200 && !(await m.textContent('.screen-shelf')).includes('가짜 동화'));

  await recordAndShare(g, 'my-shelfcc3');
  await m.reload();
  await m.waitForSelector('.screen-shelf .story-card');
  check('새로 보낸 동화가 맨 위에 "새 동화"로 붙어요', (await m.$$eval('.story-card', (e) => e.length)) === 3 && (await m.textContent('.shelf-new')).includes('눈사람'));
  await shot(m, 'shelf');
  await m.click('.shelf-new');
  await m.waitForSelector('[data-act="start"]');
  check('책장에서 누르면 그 동화가 열려요', (await m.textContent('.title-xl')).includes('눈사람'));
  await m.click('[data-act="start"]');
  await m.waitForSelector('a[href^="#/shelf/"]', { timeout: 20000 });
  check('동화 끝 화면에서 책장으로 돌아갈 수 있어요', (await m.textContent('a[href^="#/shelf/"]')).includes('가족 책장'));
  await m.goto(`${APP}#/shelf/zzzzzzzzzzzz`);
  await m.waitForSelector('.title-lg');
  check('없는 책장은 안내가 나와요', (await m.textContent('.title-lg')).includes('비어 있어요') || (await m.textContent('.title-lg')).includes('열 수 없어요'));
  check('오류가 없어요', !g.errors.length && !m.errors.length, [...g.errors, ...m.errors]);
  await g.context().close();
  await m.context().close();
}
