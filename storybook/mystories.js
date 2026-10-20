// 할머니·할아버지가 직접 지은 이야기. 이 기기(localStorage)에 저장하고,
// 그림은 글을 읽어 composer.js 가 그때그때 만들어요.
import { compose, svgDataUrl } from './composer.js';

const KEY = 'myStories';
const TINTS = [['#FFE7A8', '#FFC9A8'], ['#C8F0C9', '#A8E0F0'], ['#FFF0B3', '#D9CCFF'], ['#FFD9E0', '#FFE9B8']];

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}
function write(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch { return false; }
}

export const listRaw = () => read();
export const getRaw = (id) => read().find((s) => s.id === id) || null;

export function saveRaw(raw) {
  const list = read().filter((s) => s.id !== raw.id);
  list.unshift({ ...raw, updatedAt: Date.now() });
  return write(list);
}

export function removeRaw(id) {
  write(read().filter((s) => s.id !== id));
}

export function newId() {
  const b = crypto.getRandomValues(new Uint8Array(6));
  return `my-${Array.from(b, (x) => x.toString(36).padStart(2, '0')).join('').slice(0, 8)}`;
}

// 그림 만들기는 조금 무거워서 같은 글이면 다시 쓰지 않아요.
const cache = new Map();
export function pageImage(text, seed = 0, noCast = false) {
  const k = `${seed}|${noCast ? 1 : 0}|${text}`;
  if (!cache.has(k)) {
    if (cache.size > 200) cache.clear();
    cache.set(k, svgDataUrl(compose(text, seed, { noCast })));
  }
  return cache.get(k);
}

// 저장된 글을 앱의 동화 모양으로 바꿔요. 공유받은 가족도 같은 방법으로 그림을 다시 만들어요.
export function toStory(raw) {
  const pages = (raw.pages || []).filter((p) => p.text?.trim())
    .map((p) => ({ text: p.text.trim(), seed: p.seed || 0, noCast: Boolean(p.noCast), ...(p.ask ? { ask: p.ask } : {}), ...(/^[a-z0-9-]{1,20}$/.test(p.q || '') ? { q: p.q } : {}), ...(p.when ? { when: String(p.when).slice(0, 12) } : {}), ...(p.art ? { art: String(p.art).slice(0, 200) } : {}),
      image: pageImage((p.art ? String(p.art).slice(0, 200) : '') || p.text.trim(), p.seed || 0, Boolean(p.noCast)) }));
  const n = [...raw.id].reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    id: raw.id,
    custom: true,
    title: raw.title?.trim() || '내가 지은 이야기',
    desc: raw.card ? '목소리 카드' : raw.memoir ? '추억 질문에 답한 이야기' : '직접 지은 이야기',
    memoir: Boolean(raw.memoir),
    ...(raw.card ? { card: String(raw.card).slice(0, 20) } : {}),
    cover: raw.card ? '💌' : '📖',
    tint: TINTS[n % TINTS.length],
    minutes: Math.max(1, Math.round(pages.length * 0.4)),
    pages,
    coverImage: pages[0]?.image,
  };
}

export const myStories = () => read().map(toStory).filter((s) => s.pages.length);
