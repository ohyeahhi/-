// 명절 모드(쪽마다 읽는 사람) · 이야기 릴레이(다른 가족이 다음 장면을 이어 짓기)
import { APP, API, phone, signedIn, recordPages, consent, shot } from './harness.mjs';

export default async function ({ check, browser }) {
  // 1) 할머니: 명절 모드로 인사말은 할머니, 1쪽은 큰삼촌이 읽어요
  const g = await phone(browser);
  await signedIn(g, { role: 'grandma', name: '할머니', emoji: '👵', kid: '하은' }, { myStories: [{ id: 'my-relay0001', title: '감나무 집', pages: [{ text: '마당에 감나무가 있었어요.' }] }] });
  await g.goto(`${APP}#/story/my-relay0001`);
  await g.click('#holiday');
  await g.waitForSelector('#holiday.chip-on');
  check('명절 모드를 켤 수 있어요', (await g.textContent('#holiday')).includes('켜짐'));
  await g.goto(`${APP}#/record/my-relay0001/0`);
  await g.waitForSelector('.holiday-row');
  check('녹음 화면에 "누가 읽나요?"가 나와요', (await g.$$eval('.holiday-who', (e) => e.length)) >= 5);
  await recordPages(g, 1);
  g.once('dialog', (d) => d.accept('큰삼촌'));
  await g.click('.holiday-add');
  await g.waitForSelector('.holiday-who.on[data-who="큰삼촌"]');
  check('＋ 이름으로 새 사람을 더해요', true);
  await shot(g, 'holiday');
  await recordPages(g, 1);

  // 2) 이어 짓기 링크
  await g.goto(`${APP}#/story/my-relay0001`);
  await g.waitForSelector('#relay');
  await g.click('#relay');
  await consent(g);
  await g.waitForSelector('.link-box', { timeout: 15000 });
  const relayUrl = (await g.textContent('.link-box')).trim();
  check('이어 짓기 링크가 만들어져요', /#\/relay\/[a-z0-9]{12}$/.test(relayUrl), relayUrl);

  // 3) 이모: 링크를 열어 다음 장면을 짓고 녹음해요
  const u = await phone(browser);
  await signedIn(u, { role: 'family', name: '이모', emoji: '👩‍🦰', kid: '하은' });
  await u.goto(relayUrl);
  await u.waitForSelector('.relay-item');
  check('지금까지 장면이 보여요', (await u.$$eval('.relay-item', (e) => e.length)) === 1);
  check('장면마다 읽은 사람이 보여요', (await u.textContent('.relay-by')).includes('큰삼촌'));
  await u.fill('#relay-text', '그때 누렁이가 꼬리를 흔들며 달려왔어요.');
  await u.click('[data-r-act="rec"]');
  await u.waitForTimeout(1000);
  await u.click('[data-r-act="rec"]');
  await u.waitForSelector('[data-r-act="send"]');
  await shot(u, 'relay');
  await u.click('[data-r-act="send"]');
  await consent(u);
  await u.waitForSelector('#relay-kid', { timeout: 15000 });
  check('“2장면까지 이어졌어요”', (await u.textContent('h1')).includes('2장면'));
  await u.click('#relay-kid');
  await u.waitForSelector('.link-box');
  const kidUrl = (await u.textContent('.link-box')).trim();

  // 4) 아이: 이어진 이야기를 들어요. 쪽마다 누가 읽는지 나와요
  const k = await phone(browser);
  await k.goto(kidUrl);
  await k.waitForSelector('[data-act="start"]');
  const m = await k.evaluate(async ([api, id]) => (await fetch(`${api}/storage/v1/object/public/shares/${id}/manifest.json`)).json(), [API, kidUrl.split('/').pop()]);
  check('새 링크는 앞 녹음을 다시 올리지 않고 가리켜요', m.pages.filter((p) => p.from).length === 2 && m.pages.length === 3, m.pages);
  check('쪽마다 읽은 사람이 남아요', m.pages.map((p) => p.by?.name).join(',') === '할머니,큰삼촌,이모', m.pages);
  await k.click('[data-act="start"]');
  await k.waitForSelector('.by-chip', { timeout: 10000 });
  check('듣는 화면에 "누가 읽어요"가 나와요', /읽어요/.test(await k.textContent('.by-chip')));
  await k.waitForFunction(() => document.querySelector('.by-chip')?.textContent.includes('이모'), null, { timeout: 30000 });
  check('이어 지은 장면은 이모 목소리예요', true);
  check('오류가 없어요', !g.errors.length && !u.errors.length && !k.errors.length, [...g.errors, ...u.errors, ...k.errors]);
  await g.context().close();
  await u.context().close();
  await k.context().close();
}
