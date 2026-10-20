// 시범 기간 로그인: config.js 의 access 에 적힌 아이디·비밀번호를 아는 사람만 앱을 열어요.
// 비밀번호는 PBKDF2(SHA-256, 10만 번)로 바꾼 값과 비교해요. 한 번 로그인하면 이 기기에서는 다시 묻지 않아요.
// 주의: 정적 사이트라서 코드를 고쳐 우회할 수는 있어요. 시범용 문지기이고, 나중에 카카오 로그인으로 바꿔요.
import { CONFIG } from './config.js';

const KEY = 'access';
const accounts = () => (Array.isArray(CONFIG.access) ? CONFIG.access : []);
export const gateOn = () => !CONFIG.accessOff && accounts().length > 0;

export function loggedIn() {
  if (!gateOn()) return true;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return Boolean(saved && accounts().some((a) => a.id === saved.id && a.hash === saved.hash));
  } catch { return false; }
}

const hex = (buf) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
const unhex = (s) => Uint8Array.from(s.match(/../g).map((h) => parseInt(h, 16)));

export async function login(id, password) {
  const acc = accounts().find((a) => a.id === id.trim());
  if (!acc) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: unhex(acc.salt), iterations: 100000 }, key, 256);
  if (hex(bits) !== acc.hash) return false;
  try { localStorage.setItem(KEY, JSON.stringify({ id: acc.id, hash: acc.hash, at: Date.now() })); } catch { /* 사생활 보호 모드: 이번만 */ }
  sessionOk = true;
  return true;
}
let sessionOk = false;
export const passed = () => sessionOk || loggedIn();

export function logout() {
  sessionOk = false;
  try { localStorage.removeItem(KEY); } catch { /* 없음 */ }
}
