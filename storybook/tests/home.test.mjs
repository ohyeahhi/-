// 홈: 우리 옛이야기 / 세계 명작으로 나누고, 하다 만 녹음은 맨 위에서 이어서 해요.
import { APP, phone, signedIn, recordPages, shot } from './harness.mjs';

export default async function ({ check, browser }) {
  const p = await phone(browser);
  await signedIn(p, { role: 'grandma', kid: '하은' }, { faceVideo: false });
  await p.waitForSelector('.section-label');
  const labels = await p.$$eval('.section-label', (e) => e.map((x) => x.textContent.trim()));
  check('동화를 "우리 옛이야기"와 "세계 명작"으로 나눠 보여요', labels.includes('우리 옛이야기') && labels.includes('세계 명작'), labels);
  check('처음엔 이어서 녹음하기가 없어요', !(await p.$('.resume-card')));
  await p.goto(`${APP}#/record/heungbu/0`);
  await recordPages(p, 2);
  await p.goto(`${APP}#/`);
  await p.waitForSelector('.resume-card');
  check('하다 만 동화는 맨 위 "이어서 녹음하기"로 3번째 쪽(2쪽)부터 이어가요', (await p.getAttribute('.resume-card', 'href')) === '#/record/heungbu/2', await p.getAttribute('.resume-card', 'href'));
  await shot(p, 'home-resume');
  check('오류가 없어요', !p.errors.length, p.errors);
  await p.context().close();
}
