// 처음 설정 없이 열리는 화면들: 약관·개인정보·환불, 부모용 소개, 기관 안내지(QR), 기관 코드 통계
import path from 'node:path';
import { APP, OUT, phone, signedIn, shot, events } from './harness.mjs';

export default async function ({ check, browser, store }) {
  const p = await phone(browser, { perms: [] });
  for (const [doc, title] of [['terms', '이용약관'], ['privacy', '개인정보처리방침'], ['refund', '환불 규정']]) {
    await p.goto(`${APP}#/policy/${doc}`);
    await p.waitForSelector('.policy h1');
    check(`${title} 화면이 열려요`, (await p.textContent('.policy h1')) === title);
    if (doc === 'privacy') check('개인정보처리방침에 보관 기간과 통계가 적혀 있어요', ((t) => t.includes('1년') && t.includes('이용 통계'))(await p.textContent('.policy')));
  }

  await p.goto(`${APP}#/about`);
  await p.waitForSelector('#send-parents');
  check('소개 화면은 처음 설정 없이 열려요', p.url().endsWith('#/about'));
  check('소개 화면에 그림책 가격이 나와요', (await p.textContent('.about-book')).includes('39,000원'));
  await shot(p, 'about');

  await p.goto(`${APP}#/flyer/test-center`);
  await p.waitForSelector('.flyer svg');
  check('기관 안내지에 QR이 있어요', Boolean(await p.$('.flyer-qr svg')));
  await p.emulateMedia({ media: 'print' });
  await p.pdf({ path: path.join(OUT, 'flyer.pdf'), preferCSSPageSize: true, printBackground: true });
  await p.emulateMedia({ media: 'screen' });

  // 안내지 QR(…?org=test-center)로 들어온 어르신의 기록에 기관 코드가 붙어요.
  await p.goto(`${APP}?org=test-center#/`);
  await p.waitForTimeout(300);
  check('기관 코드를 기억하고 주소에서는 지워요', (await p.evaluate(() => JSON.parse(localStorage.getItem('org')))) === 'test-center' && !p.url().includes('org='));
  await p.evaluate(() => localStorage.removeItem('openedOn'));
  await signedIn(p);
  await p.waitForTimeout(800);
  check('통계 기록에 기관 코드가 붙어요', events(store).some((e) => e.name === 'open' && e.org === 'test-center'));
  check('오류가 없어요', !p.errors.length, p.errors);
  await p.context().close();
}
