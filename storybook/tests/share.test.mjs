// 가족에게 보내기: 녹음 → 보호자 동의 → 링크 → 다른 휴대폰(카카오톡)에서 듣기
import { APP, API, phone, signedIn, recordPages, consent, shot } from './harness.mjs';

export default async function ({ check, browser, store }) {
  const g = await phone(browser, { perms: ['microphone', 'clipboard-read', 'clipboard-write'] });
  await signedIn(g, { role: 'grandpa', kid: '민준' });
  await g.goto(`${APP}#/record/rabbit-turtle/0`);
  await recordPages(g, 11);
  await g.waitForSelector('#share');
  await g.click('#share');
  await g.click('[data-act="primary"]');
  await g.waitForSelector('#consent-ok');
  check('동의 전에는 올리기 버튼이 잠겨 있어요', await g.$eval('.sheet-backdrop:last-child [data-act="primary"]', (b) => b.disabled));
  await consent(g);
  await g.waitForSelector('.link-box', { timeout: 15000 });
  const url = (await g.textContent('.link-box')).trim();
  check('공유 링크가 만들어져요', /#\/s\/[a-z0-9]{12}$/.test(url), url);
  await g.click('[data-act="primary"]');
  await g.waitForTimeout(300);
  check('링크가 복사돼요', (await g.evaluate(() => navigator.clipboard.readText())) === url);
  await g.click('#share');
  await g.waitForSelector('.link-box');
  check('다시 누르면 같은 링크를 써요 (다시 올리지 않음)', (await g.textContent('.link-box')).trim() === url);
  check('할아버지 휴대폰에 오류가 없어요', !g.errors.length, g.errors);

  const m = await phone(browser, { kakao: true, perms: [] });
  await m.goto(url);
  await m.waitForSelector('[data-act="start"]');
  check('받은 가족은 처음 설정 없이 바로 열려요', (await m.textContent('.eyebrow')).includes('할아버지'));
  check('손주 이름이 보여요', (await m.textContent('.listen-start .sub')).includes('민준'));
  await m.click('[data-act="start"]');
  await m.waitForTimeout(400);
  check('녹음이 재생돼요', await m.evaluate(() => [...document.querySelectorAll('video, audio')].some((v) => !v.paused && v.currentTime > 0)));
  await shot(m, 'share-recipient');
  for (let i = 0; i < 12; i++) { await m.click('[data-act="next"]:not([disabled])').catch(() => {}); await m.waitForTimeout(150); }
  await m.waitForSelector('[data-act="invite"]', { timeout: 15000 });
  check('끝 화면에 "오래 간직하기"와 "우리 가족도 만들어 보기"가 있어요', (await m.$('.keep-link')) && (await m.$('[data-act="invite"]')));
  check('받은 가족 휴대폰에 오류가 없어요', !m.errors.length, m.errors);

  const stray = await m.evaluate(async (api) => (await fetch(`${api}/storage/v1/object/shares/free-hosting/evil.html`, { method: 'POST', headers: { apikey: 'sb_publishable_test', 'content-type': 'text/html' }, body: '<script>1</script>' })).status, API);
  check('앱이 쓰지 않는 이름으로는 올릴 수 없어요', stray === 403, stray);
  await m.goto(`${APP}#/s/aaaaaaaaaaaa`);
  await m.waitForSelector('.title-lg');
  check('없는 링크는 안내가 나와요', (await m.textContent('.title-lg')).includes('열 수 없어요'));
  await g.context().close();
  await m.context().close();
}
