// 그림책 쪽마다 글이 넘치지 않는지: 기본 동화 전부 + 가장 긴 글(200자)로 지은 이야기. QR 자리까지 남겨 두고 재요.
import { APP, phone, signedIn, shot } from './harness.mjs';
import { STORIES } from '../stories.js';

// 글 칸 안에서 글 + QR(12cqw) + 틈이 들어갈 자리가 있는지. 넘치는 쪽 번호를 돌려줘요.
const overflowing = () => [...document.querySelectorAll('.book-page')].flatMap((pg, i) => {
  const box = pg.querySelector('.bp-text');
  if (!box) return [];
  const w = pg.clientWidth;
  const cs = getComputedStyle(box);
  const room = box.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const need = box.querySelector('p').scrollHeight + w * 0.14;
  return need > room ? [i] : [];
});

export default async function ({ check, browser }) {
  const p = await phone(browser);
  const long = '옛날 옛적 깊은 산골 마을에 마음씨 고운 할머니가 살았어요. '.repeat(6).slice(0, 200);
  const mine = { id: 'my-longtext', title: '아주 긴 이야기', pages: [{ text: long }, { text: long }, { text: '짧은 쪽' }] };
  await signedIn(p, undefined, { myStories: [mine] });
  const bad = [];
  for (const s of [...STORIES, { id: mine.id }]) {
    await p.goto(`${APP}#/book/${s.id}`);
    await p.waitForSelector('.book-page');
    for (const media of ['screen', 'print']) {
      await p.emulateMedia({ media });
      const o = await p.evaluate(overflowing);
      if (o.length) bad.push(`${s.id}(${media}): ${o.join(',')}쪽`);
    }
    await p.emulateMedia({ media: 'screen' });
  }
  await p.goto(`${APP}#/book/${mine.id}`);
  await p.waitForSelector('.bp-xlong');
  await shot(p, 'book-longtext');
  check('200자 쪽은 작은 글씨로 맞춰요', (await p.$$eval('.bp-xlong', (e) => e.length)) === 2);
  check(`그림책 ${STORIES.length + 1}권 모든 쪽에 글과 QR이 넘치지 않아요`, !bad.length, bad);
  check('오류가 없어요', !p.errors.length, p.errors);
  await p.context().close();
}
