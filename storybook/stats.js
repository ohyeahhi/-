// 시범 사용 통계: 몇 명이 녹음하고, 보내고, 가족이 들었는지만 세요. (supabase/events.sql)
// 이름·연락처·녹음 내용은 보내지 않아요. 기기는 앱이 처음 열릴 때 만든 무작위 번호로만 구분해요.
// 통계가 실패해도 앱은 그대로 움직여요.
import { CONFIG } from './config.js';

const enabled = () => Boolean(CONFIG.supabaseUrl && CONFIG.supabaseAnonKey && CONFIG.stats !== false);

function deviceId() {
  try {
    let id = localStorage.getItem('device');
    if (!id) {
      id = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem('device', id);
    }
    return id;
  } catch {
    return 'private-mode';
  }
}

export function track(name, { story, shareId, n, meta } = {}) {
  if (!enabled()) return;
  const key = CONFIG.supabaseAnonKey;
  const headers = { apikey: key, 'Content-Type': 'application/json', Prefer: 'return=minimal' };
  if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;
  const body = JSON.stringify({
    name,
    device: deviceId(),
    story: story ?? null,
    share_id: shareId ?? null,
    n: Number.isInteger(n) ? n : null,
    meta: meta ?? null,
  });
  try {
    // keepalive: 화면을 닫는 순간에도 보내져요.
    fetch(`${CONFIG.supabaseUrl.replace(/\/+$/, '')}/rest/v1/events`, { method: 'POST', headers, body, keepalive: true }).catch(() => {});
  } catch { /* 통계는 없어도 돼요 */ }
}

// 하루에 한 번만 "열었어요"를 남겨요.
export function trackOpen() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem('openedOn') === today) return;
    localStorage.setItem('openedOn', today);
  } catch { /* 사생활 보호 모드 */ }
  track('open', { meta: { standalone: matchMedia('(display-mode: standalone)').matches, kakao: /KAKAOTALK/i.test(navigator.userAgent) } });
}
