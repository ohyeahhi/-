// 가족 1년권: 손주네가 책장에서 1년권 결제 → 지금까지 보낸 동화 10년 보관 → 그 뒤 보낸 동화도 10년 보관
import { APP, phone, signedIn, recordPages, consent, shot } from './harness.mjs';

const story = (id, title, text) => ({ id, title, pages: [{ text }] });

async function share(g, id, first) {
  await g.goto(`${APP}#/record/${id}/0`);
  await recordPages(g, 2);
  await g.waitForSelector('#share');
  await g.click('#share');
  await g.click('[data-act="primary"]');
  if (first) await consent(g);
  await g.waitForSelector('.link-box', { timeout: 15000 });
  return (await g.textContent('.link-box')).trim().split('#/s/')[1];
}

const keptText = async (m, id) => {
  await m.goto(`${APP}#/keep/${id}`);
  await m.waitForSelector('.keep-status');
  return Boolean(await m.$('.keep-status.on'));
};

export default async function ({ check, browser }) {
  const g = await phone(browser, { toss: true });
  await signedIn(g, { role: 'grandma', kid: '하은' }, {
    myStories: [story('my-passaaa1', '봄 소풍', '봄에 언덕으로 소풍을 갔어요.'), story('my-passbbb2', '가을 운동회', '가을 운동회에서 달리기를 했어요.')],
  });
  const first = await share(g, 'my-passaaa1', true);
  await g.goto(`${APP}#/`);
  await g.waitForSelector('a[href^="#/pass/"]');
  check('할머니 홈에 가족 1년권 안내가 있어요', (await g.textContent('#shelf-slot')).includes('가족 1년권'));
  const shelf = await g.evaluate(() => JSON.parse(localStorage.getItem('shelfId')));

  const m = await phone(browser, { toss: true, perms: [] });
  check('결제 전에는 무료 보관이에요', !(await keptText(m, first)));
  await m.goto(`${APP}#/shelf/${shelf}`);
  await m.waitForSelector('.zone-pass');
  await m.click('.zone-pass');
  await m.waitForSelector('#pass-pay');
  check('1년권 값은 29,000원', (await m.textContent('#pass-pay')).includes('29,000원'));
  await shot(m, 'pass');
  await m.click('#pass-pay');
  await m.waitForSelector('.celebrate h1', { timeout: 20000 });
  check('손주네가 결제하면 "가족 1년권이 시작됐어요"', (await m.textContent('.celebrate h1')).includes('1년권이 시작'));
  check('지금까지 보낸 동화가 10년 보관돼요', await keptText(m, first));

  const second = await share(g, 'my-passbbb2', false);
  await g.waitForTimeout(500);
  check('1년권 기간에 새로 보낸 동화도 10년 보관돼요', await keptText(m, second));
  await m.goto(`${APP}#/pass/${shelf}`);
  await m.waitForSelector('#pass-pay');
  check('1년권을 쓰는 중이면 "1년 더 늘리기"', (await m.textContent('#pass-pay')).includes('1년 더'));
  check('오류가 없어요', !g.errors.length && !m.errors.length, [...g.errors, ...m.errors]);
  await g.context().close();
  await m.context().close();
}
