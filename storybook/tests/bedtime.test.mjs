// 잠자리 모드: 시간 고르기 → 어두운 화면 → 화면 끄기 → 되풀이 → 시간이 다 되면 "잘 자요"
import { APP, phone, shot } from './harness.mjs';
import { makeShare } from './fixtures.mjs';

export default async function ({ check, browser, store }) {
  const ID = makeShare(store, { id: 'bedbedbed001', pages: 2, kid: '하은' });
  const p = await phone(browser);
  await p.clock.install();
  await p.goto(`${APP}#/s/${ID}`);
  await p.waitForSelector('#bed-min');
  check('잠자리 모드는 처음엔 꺼져 있어요', (await p.$eval('#bed-min', (x) => x.value)) === '0');
  check('5분부터 60분까지 5분 단위로 골라요', (await p.$$eval('#bed-min option', (o) => o.map((x) => x.value).join(','))) === '0,5,10,15,20,25,30,35,40,45,50,55,60');
  await p.click('[data-act="bedstep"][data-d="5"]');
  check('+ 를 누르면 5분이 돼요', (await p.$eval('#bed-min', (x) => x.value)) === '5');
  await p.selectOption('#bed-min', '15');
  await shot(p, 'bedtime-start');
  await p.click('[data-act="start"]');
  await p.waitForSelector('.bed-dim-btn');
  check('어두운 화면으로 바뀌어요', await p.evaluate(() => document.documentElement.classList.contains('bedtime')));
  check('남은 시간이 보여요', (await p.textContent('.bed-dim-btn')).includes('15분 남음'));
  await shot(p, 'bedtime-page');
  await p.click('.bed-dim-btn');
  await p.waitForSelector('.bed-dim');
  await p.click('.bed-dim');
  check('까만 화면을 누르면 다시 보여요', !(await p.$('.bed-dim')));
  // 두 쪽(인사말 + 1쪽)이 지나면 끝 화면 대신 처음부터 다시 들려줘요
  for (let i = 0; i < 3; i++) await p.clock.runFor(6500);
  check('잠자리 모드에서는 끝나면 처음부터 되풀이해요', !(await p.$('[data-act="invite"]')) && Boolean(await p.$('.dots')));
  await p.clock.runFor(16 * 60e3);
  await p.waitForSelector('.bed-end');
  check('시간이 다 되면 "잘 자요, 하은아"', (await p.textContent('.bed-end h1')).includes('잘 자요, 하은아'));
  check('끝나면 화면이 원래대로 돌아와요', !(await p.evaluate(() => document.documentElement.classList.contains('bedtime'))));
  await shot(p, 'bedtime-end');
  await p.reload();
  await p.waitForSelector('#bed-min');
  check('고른 시간을 기억해요', (await p.$eval('#bed-min', (x) => x.value)) === '15');
  check('오류가 없어요', !p.errors.length, p.errors);
  await p.context().close();
}
