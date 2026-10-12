// 테스트 공통 도구: 앱 서버 + 가짜 Supabase 띄우기, 브라우저 열기, 확인(check) 모으기.
import { spawn, execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP_PORT = Number(process.env.APP_PORT || 18765);
const API_PORT = Number(process.env.API_PORT || 18766);
export const APP = `http://localhost:${APP_PORT}/`;
export const API = `http://127.0.0.1:${API_PORT}`;
export const OUT = process.env.OUT || fs.mkdtempSync(path.join(os.tmpdir(), 'deul-shots-'));

// Playwright: 프로젝트에 깔렸으면 그것, 아니면 PW 환경 변수, 아니면 전역 설치본
function loadPlaywright() {
  const require = createRequire(import.meta.url);
  const tries = [() => require('playwright'), () => require(process.env.PW)];
  tries.push(() => require(path.join(execSync('npm root -g').toString().trim(), 'playwright')));
  for (const t of tries) { try { return t(); } catch { /* 다음 */ } }
  throw new Error('playwright 를 찾지 못했어요. npm i -D playwright 또는 PW=<경로> 로 알려 주세요.');
}
export const { chromium, devices } = loadPlaywright();
export const PHONE = devices['iPhone 13'];

export const config = ({ toss = false } = {}) =>
  `export const CONFIG = { supabaseUrl: '${API}', supabaseAnonKey: 'sb_publishable_test', bucket: 'shares'${toss ? ", tossClientKey: 'test_ck_fake'" : ''} };`;

// 토스 결제창 대신: 바로 successUrl 로 돌아가요.
const FAKE_TOSS = `window.TossPayments = function () { return { payment: () => ({ requestPayment: async (o) => {
  location.href = o.successUrl + '&paymentKey=tpk_test&orderId=' + o.orderId + '&amount=' + o.amount.value; } }) }; };
window.TossPayments.ANONYMOUS = 'ANON';`;

// ---------- 서버 ----------
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function up(url) {
  for (let i = 0; i < 50; i++) {
    try { await fetch(url); return; } catch { await wait(100); }
  }
  throw new Error(`서버가 뜨지 않았어요: ${url}`);
}

export async function startServers() {
  const store = fs.mkdtempSync(path.join(os.tmpdir(), 'deul-store-'));
  const procs = [
    spawn('python3', ['-m', 'http.server', String(APP_PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' }),
    spawn('python3', [path.join(ROOT, 'tests', 'mock_supabase.py'), store, String(API_PORT)], { stdio: 'ignore' }),
  ];
  await up(APP);
  await up(`${API}/`);
  return { store, stop: () => procs.forEach((p) => p.kill()) };
}

export const events = (store) => {
  const f = path.join(store, 'events.log');
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [];
};

// ---------- 브라우저 ----------
export const launch = () => chromium.launch({
  args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'],
});

// 설정(config.js)을 가짜 서버로 바꾼 휴대폰 화면. 페이지 오류는 page.errors 에 모여요.
export async function phone(browser, { toss = false, kakao = false, perms = ['microphone', 'camera'] } = {}) {
  const ctx = await browser.newContext({
    ...PHONE,
    ...(kakao ? { userAgent: `${PHONE.userAgent} KAKAOTALK 10.8.0` } : {}),
    serviceWorkers: 'block',
    permissions: perms,
  });
  await ctx.route('**/config.js', (r) => r.fulfill({ contentType: 'text/javascript', body: config({ toss }) }));
  if (toss) await ctx.route('https://js.tosspayments.com/**', (r) => r.fulfill({ contentType: 'text/javascript', body: FAKE_TOSS }));
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(e.message));
  return page;
}

// 처음 설정을 마친 할머니·할아버지 휴대폰
export async function signedIn(page, profile = { role: 'grandma', kid: '하은' }, extra = {}) {
  await page.goto(APP);
  await page.evaluate(([p, x]) => {
    localStorage.setItem('profile', JSON.stringify(p));
    for (const [k, v] of Object.entries(x)) localStorage.setItem(k, JSON.stringify(v));
  }, [profile, extra]);
  await page.reload();
  await page.goto(`${APP}#/`);
}

// 녹음 화면에서 n 쪽을 차례로 녹음해요.
export async function recordPages(page, n, ms = 800) {
  for (let i = 0; i < n; i++) {
    await page.waitForSelector('[data-act="rec"]');
    await page.click('[data-act="rec"]');
    await page.waitForTimeout(ms);
    await page.click('[data-act="rec"]');
    await page.waitForSelector('[data-act="next"]');
    await page.click('[data-act="next"]');
  }
}

// 처음 서버에 올릴 때 나오는 보호자 동의
export async function consent(page) {
  await page.waitForSelector('#consent-ok');
  await page.check('#consent-ok');
  await page.click('.sheet-backdrop:last-child [data-act="primary"]');
}

export const shot = (page, name) => page.screenshot({ path: path.join(OUT, `${name}.png`) });

// ---------- 확인 ----------
export function suite(name) {
  const results = [];
  const check = (label, ok, detail = '') => {
    results.push({ label, ok: Boolean(ok), detail });
    console.log(`  ${ok ? '✓' : '✗'} ${label}${!ok && detail !== '' ? `  → ${JSON.stringify(detail)}` : ''}`);
  };
  return { name, results, check };
}
