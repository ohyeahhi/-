// 시범 로그인: 아이디·비밀번호를 모르면 어떤 화면(공유 링크 포함)도 열리지 않아요.
import crypto from 'node:crypto';
import { APP, API, phone, shot } from './harness.mjs';

export default async function ({ check, browser }) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync('honey-1234', Buffer.from(salt, 'hex'), 100000, 32, 'sha256').toString('hex');
  const p = await phone(browser);
  await p.context().route('**/config.js', (r) => r.fulfill({ contentType: 'text/javascript',
    body: `export const CONFIG = { supabaseUrl: '${API}', supabaseAnonKey: 'sb_publishable_test', bucket: 'shares', access: [{ id: 'tester', salt: '${salt}', hash: '${hash}' }] };` }));
  await p.goto(`${APP}#/s/aaaaaaaaaaaa`);
  await p.waitForSelector('#login-form');
  check('로그인 전에는 공유 링크도 열리지 않아요', !(await p.$('[data-act="start"]')) && Boolean(await p.$('#login-id')));
  await p.fill('#login-id', 'tester');
  await p.fill('#login-pw', 'wrong');
  await p.click('#login-go');
  await p.waitForSelector('#login-error:not([hidden])');
  check('비밀번호가 틀리면 안내가 나와요', true);
  await shot(p, 'login');
  await p.fill('#login-pw', 'honey-1234');
  await p.click('#login-go');
  await p.waitForFunction(() => !document.querySelector('#login-form'));
  check('맞으면 들어가요', true);
  await p.reload();
  await p.waitForTimeout(800);
  check('한 번 로그인하면 다시 묻지 않아요', !(await p.$('#login-form')));
  check('오류가 없어요', !p.errors.length, p.errors);
  await p.context().close();
}
