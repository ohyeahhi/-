// 동요·자장가 · 오늘의 추천 · 우리 동네 옛이야기 · 오늘 밤 재생 목록
import { APP, phone, signedIn, recordPages, consent, shot } from './harness.mjs';

async function recordAndShare(g, id, first = false) {
  await g.goto(`${APP}#/record/${id}/0`);
  await recordPages(g, 3, 600);
  await g.waitForSelector('#share');
  await g.click('#share');
  await g.click('[data-act="primary"]');
  if (first) await consent(g);
  await g.waitForSelector('.link-box', { timeout: 15000 });
  await g.click('[data-act="secondary"]').catch(() => {});
}

export default async function ({ check, browser }) {
  const g = await phone(browser);
  await signedIn(g, { role: 'grandma', name: '할머니', emoji: '👵', kid: '하은' });
  await g.waitForSelector('.pick-card');
  check('홈에 오늘의 추천이 있어요', /#\/story\/[\w-]+$/.test(await g.getAttribute('.pick-card', 'href')) && (await g.textContent('.pick-card')).includes('오늘의 추천'));
  check('홈에 동요·자장가 5곡이 있어요', (await g.$$eval('a[href^="#/story/song-"]:not(.pick-card)', (e) => e.length)) === 5);
  await shot(g, 'home-songs');

  // 우리 동네 옛이야기
  await g.click('a[href="#/new/village"]');
  await g.waitForSelector('.page-hint');
  check('동네 옛이야기 틀: 질문 4개와 제목이 채워져요', (await g.$$eval('.page-hint', (e) => e.length)) === 4 && (await g.inputValue('#st-title')) === '우리 동네 옛이야기');
  await g.fill('.page-card[data-n="0"] textarea', '할머니가 자란 곳은 강원도 산골 마을이었는데, 마을 앞에 커다란 느티나무가 있었단다.');
  await g.fill('.page-card[data-n="1"] textarea', '그 느티나무에는 마을을 지켜 주는 신령님이 산다고 했어.');
  await g.click('#save');
  await g.waitForSelector('.read-text');
  const saved = await g.evaluate(() => JSON.parse(localStorage.getItem('myStories')).find((x) => x.title === '우리 동네 옛이야기'));
  check('적은 장면만 저장되고, 안내 글은 남지 않아요', saved?.pages.length === 2 && saved.pages.every((p) => !p.hint && !p.ex), saved);

  // 동요 녹음: 노래로 불러 달라는 안내
  await g.goto(`${APP}#/record/song-toad/1`);
  await g.waitForSelector('.hint-card');
  check('동요 녹음 화면에 "노래하듯 불러 주세요"', (await g.textContent('.hint-card')).includes('노래하듯'));
  check('동요 그림이 그려져요', (await g.getAttribute('.scene img', 'src')).startsWith('data:image/svg'));
  await recordAndShare(g, 'song-toad', true);
  await recordAndShare(g, 'song-bird');
  await g.goto(`${APP}#/`);
  await g.waitForSelector('#send-shelf');
  await g.click('#send-shelf');
  await g.waitForSelector('.link-box');
  const shelfUrl = (await g.textContent('.link-box')).trim();

  // 아이: 오늘 밤 이어 듣기
  const k = await phone(browser, { perms: [] });
  await k.goto(shelfUrl);
  await k.waitForSelector('#tonight');
  check('가족 책장에 "오늘 밤 이어 듣기 · 2편"', (await k.textContent('#tonight')).includes('2편'));
  await k.click('#tonight');
  await k.waitForSelector('[data-act="toggle"]', { timeout: 10000 });
  check('누르면 첫 동화가 바로 시작해요', await k.evaluate(() => !document.querySelector('[data-act="start"]')));
  check('오늘 밤 목록에서는 잠자리 되풀이를 쓰지 않아요', await k.evaluate(() => !document.documentElement.classList.contains('bedtime')));
  await k.waitForSelector('.tonight-next', { timeout: 30000 });
  check('다 들으면 "다음 이야기 (2/2)"가 나와요', (await k.textContent('.tonight-next')).includes('2/2'));
  const first = await k.evaluate(() => location.hash);
  await k.waitForFunction((h) => location.hash !== h, first, { timeout: 15000 });
  check('잠시 뒤 다음 동화로 저절로 넘어가요', true);
  await k.waitForSelector('[data-act="toggle"]', { timeout: 10000 });
  await k.waitForSelector('.tonight-done', { timeout: 30000 });
  check('마지막엔 "다 들었어요. 잘 자요!"', (await k.textContent('.tonight-done')).includes('잘 자요'));
  check('오류가 없어요', !g.errors.length && !k.errors.length, [...g.errors, ...k.errors]);
  await g.context().close();
  await k.context().close();
}
