// 그림책: QR 넣은 미리보기 → PDF → 주문(여러 권 할인·선물 포장) → 결제 → 승인, 금액 조작 거절, QR 바로 듣기
import path from 'node:path';
import { APP, OUT, phone, signedIn, recordPages, consent, shot } from './harness.mjs';

export default async function ({ check, browser }) {
  const p = await phone(browser, { toss: true });
  await signedIn(p, { role: 'grandma', kid: '하은' }, { faceVideo: false });
  await p.goto(`${APP}#/record/sun-moon/0`);
  await recordPages(p, 11);
  await p.waitForSelector('.celebrate');
  await p.goto(`${APP}#/book/sun-moon`);
  await p.waitForSelector('#make-qr');
  await p.click('#make-qr');
  await consent(p);
  await p.waitForSelector('.bp-qr svg', { timeout: 20000 });
  check('그림책은 13쪽이에요 (표지·인사말·10쪽·뒤표지)', (await p.$$eval('.book-page', (e) => e.length)) === 13);
  check('쪽마다 QR이 있어요 (12개)', (await p.$$eval('.bp-qr svg, .bb-qr svg', (e) => e.length)) === 12);
  await p.emulateMedia({ media: 'print' });
  await p.pdf({ path: path.join(OUT, 'book.pdf'), preferCSSPageSize: true, printBackground: true });
  await p.emulateMedia({ media: 'screen' });
  const shareId = await p.evaluate(() => JSON.parse(localStorage.getItem('shares'))['sun-moon'].id);

  await p.click('a[href="#/order/sun-moon"]');
  await p.waitForSelector('#o-name');
  await p.fill('#o-name', '김하은 엄마');
  await p.fill('#o-phone', '010-1234-5678');
  await p.fill('#o-addr', '서울시 마포구 들려줄로 12, 3층');
  check('1권은 39,000원', (await p.textContent('#sum-total')) === '39,000원');
  await p.click('[data-q="1"]');
  check('2권은 68,000원 (두 번째 권 29,000원)', (await p.textContent('#sum-total')) === '68,000원');
  await p.check('#o-gift');
  await p.fill('#o-card', '사랑하는 하은아');
  check('선물 포장 2권 더하면 78,000원', (await p.textContent('#sum-total')) === '78,000원');
  await p.check('#o-agree');
  await shot(p, 'book-order');
  await p.click('#pay');
  await p.waitForSelector('.celebrate h1', { timeout: 20000 });
  check('결제 승인 후 주문 완료', (await p.textContent('.celebrate h1')).includes('주문이 완료'));
  check('승인된 금액이 78,000원', (await p.textContent('.order-sum .total b')) === '78,000원');
  check('선물 포장이 완료 화면에 나와요', (await p.textContent('.celebrate .sub')).includes('선물 포장'));

  await p.goto(`${APP}?pay=success&paymentKey=x&orderId=NOPE&amount=1`);
  await p.waitForSelector('.celebrate h1');
  check('없는 주문·조작된 금액은 승인하지 않아요', (await p.textContent('.celebrate h1')).includes('확인하지 못했어요'));
  check('결제 뒤에는 받는 분 정보가 기기에 남지 않아요', (await p.evaluate(() => localStorage.getItem('orderForm'))) === 'null');
  check('할머니 휴대폰에 오류가 없어요', !p.errors.length, p.errors);

  const m = await phone(browser, { toss: true, perms: [] });
  await m.goto(`${APP}#/s/${shareId}/3`);
  await m.waitForSelector('[data-act="start"]');
  check('QR은 그 쪽부터 들려줘요', (await m.textContent('.eyebrow')).includes('3쪽부터'));
  await m.goto(`${APP}#/print/${shareId}`);
  await m.waitForSelector('.book-page');
  check('인쇄소 화면도 13쪽', (await m.$$eval('.book-page', (e) => e.length)) === 13);
  await m.goto(`${APP}#/keep/${shareId}`);
  await m.waitForSelector('.keep-status');
  check('그림책을 사면 녹음이 10년 보관돼요', (await m.textContent('.keep-status')).includes('까지 보관해요') && (await m.$('.keep-status.on')));
  await p.context().close();
  await m.context().close();
}
