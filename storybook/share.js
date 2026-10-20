// 가족 공유: 녹음 파일과 목록(manifest.json)을 Supabase Storage에 올리고,
// 받은 사람은 공개 주소로 바로 들어요. 로그인도, 데이터베이스도 필요 없어요.
//
//   shares/<공유ID>/manifest.json   동화 id, 누가 읽었는지, 쪽별 파일 이름
//   shares/<공유ID>/0.m4a, 1.mp4…   쪽별 녹음 (얼굴 영상이면 mp4·webm 영상)
//
// 공유ID는 추측하기 어려운 무작위 12글자예요. 링크를 아는 사람만 들을 수 있어요.
import { CONFIG } from './config.js';

export const shareEnabled = () => Boolean(CONFIG.supabaseUrl && CONFIG.supabaseAnonKey);

const base = () => CONFIG.supabaseUrl.replace(/\/+$/, '');
const bucket = () => CONFIG.bucket || 'shares';
const ID_CHARS = 'abcdefghijkmnpqrstuvwxyz23456789';
const ID_RE = /^[a-z0-9]{12}$/;

function newShareId() {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (b) => ID_CHARS[b % ID_CHARS.length]).join('');
}

const extOf = (type) => {
  const video = type.startsWith('video/');
  if (type.includes('mp4')) return video ? 'mp4' : 'm4a';
  return type.includes('ogg') ? 'ogg' : 'webm';
};

async function upload(path, body, type) {
  const key = CONFIG.supabaseAnonKey;
  const headers = {
    apikey: key,
    // 버킷 허용 형식(audio/mp4 등)과 맞도록 ;codecs=… 는 떼고 보내요.
    'Content-Type': type.split(';')[0],
    'cache-control': '31536000',
    'x-upsert': 'false',
  };
  // 예전 anon 키(eyJ…)는 Authorization에도 넣어요. 새 publishable 키(sb_publishable_…)는 apikey만 써요.
  if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;
  const res = await fetch(`${base()}/storage/v1/object/${bucket()}/${path}`, { method: 'POST', headers, body });
  if (!res.ok) {
    // 같은 이름이 이미 있으면(올리기만 되는 버킷) taken 으로 알려 줘요.
    const text = await res.text().catch(() => '');
    throw Object.assign(new Error(`upload failed: ${res.status}`), { taken: res.status === 409 || /duplicate|already exists|"409"/i.test(text) });
  }
}

export const publicUrl = (id, file) => `${base()}/storage/v1/object/public/${bucket()}/${id}/${file}`;

// pages: [{ i, blob, trim?, by? }] 또는 이미 올린 쪽 [{ i, file, type, from: 공유ID, by? }]  trim: 들을 때 건너뛸 앞뒤 빈 소리 [시작 초, 끝 초]  meta: { storyId, role, kid }
// question: { blob, text, trim? } — 동화 끝에 남긴 질문 (q.m4a 등)
export async function uploadShare(meta, pages, onProgress = () => {}, question = null) {
  const id = newShareId();
  const total = pages.length + 1 + (question ? 1 : 0);
  const files = [];
  for (const [n, { i, blob, trim, by, from, file: oldFile, type: oldType }] of pages.entries()) {
    const extra = { ...(Array.isArray(trim) ? { trim } : {}), ...(by?.name ? { by: { name: String(by.name).slice(0, 10), emoji: String(by.emoji || '').slice(0, 8) } } : {}) };
    // 이야기 릴레이: 앞사람이 이미 올린 쪽은 다시 올리지 않고, 그 링크의 파일을 가리켜요.
    if (!blob && from && ID_RE.test(from) && /^[0-9]{1,2}\.(m4a|mp4|webm|ogg)$/.test(oldFile || '')) {
      files.push({ i, file: oldFile, type: oldType, from, ...extra });
      onProgress(n + 1, total);
      continue;
    }
    const type = blob.type || 'audio/webm';
    const file = `${i}.${extOf(type)}`;
    await upload(`${id}/${file}`, blob, type);
    files.push({ i, file, type, ...extra });
    onProgress(n + 1, total);
  }
  let q = null;
  if (question?.blob) {
    const type = question.blob.type || 'audio/webm';
    const file = `q.${extOf(type)}`;
    await upload(`${id}/${file}`, question.blob, type);
    q = { file, type, text: String(question.text || '').slice(0, 80), ...(Array.isArray(question.trim) ? { trim: question.trim } : {}) };
    onProgress(pages.length + 1, total);
  }
  const manifest = { v: 1, ...meta, pages: files, ...(q ? { question: q } : {}), createdAt: new Date().toISOString() };
  await upload(`${id}/manifest.json`, JSON.stringify(manifest), 'application/json');
  onProgress(total, total);
  return id;
}

export async function fetchShare(id) {
  if (!ID_RE.test(id) || !shareEnabled()) throw new Error('bad link');
  const res = await fetch(publicUrl(id, 'manifest.json'));
  if (!res.ok) throw new Error(`not found: ${res.status}`);
  return res.json();
}

// 손주 답장: <공유ID>/reply-1 … reply-9 (목록 보기 없이 번호로 찾아요)
// 버킷이 올리기만 되니, 앞 번호가 차 있으면 다음 빈 번호에 올려요.
export const REPLY_MAX = 9;
export async function uploadReply(id, blob) {
  if (!ID_RE.test(id) || !shareEnabled()) throw new Error('bad link');
  for (let n = 1; n <= REPLY_MAX; n++) {
    try {
      await upload(`${id}/reply-${n}`, blob, blob.type || 'audio/webm');
      return n;
    } catch (e) {
      if (!e.taken) throw e;
    }
  }
  throw Object.assign(new Error('replies full'), { full: true });
}

export async function fetchReplies(id) {
  const out = [];
  if (!ID_RE.test(id) || !shareEnabled()) return out;
  for (let n = 1; n <= REPLY_MAX; n++) {
    const url = publicUrl(id, `reply-${n}`);
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store' }).catch(() => null);
    if (!res?.ok) break;
    out.push({ n, url });
  }
  return out;
}

// 가족 책장: <책장ID>/s-1.json … s-30.json 에 보낸 동화를 하나씩 더해요. (목록 보기 없이 번호로 찾아요)
// 책장 ID도 공유 ID와 같은 모양이라, 마지막으로 더한 날부터 1년 보관돼요. (cleanup 함수)
//
// 위조 막기: 버킷은 누구나 올릴 수 있어서, 책장 주소를 아는 사람이 가짜 동화를 끼워 넣을 수 있어요.
// 그래서 할머니 휴대폰만 가진 서명 키(ECDSA P-256)로 항목마다 서명하고, 공개 키는 처음에 owner.json 으로 올려요.
// 손주 화면과 서버(orders 함수)는 서명이 맞는 항목만 믿어요.
export const SHELF_MAX = 30;
export const newShelfId = () => newShareId();
const ALG = { name: 'ECDSA', namedCurve: 'P-256' };
const SIGN = { name: 'ECDSA', hash: 'SHA-256' };
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
// 서명하는 글: 항목의 값들을 정해진 순서로 (서버도 똑같이 만들어요)
export const shelfPayload = (e) => JSON.stringify([e.shareId, e.storyId, e.title, e.at, e.cover ?? null]);

const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 사생활 보호 모드 */ } },
};

// 이 휴대폰의 책장 서명 키. 처음 쓸 때 만들고, 공개 키를 owner.json 으로 올려요.
async function shelfSigner(shelfId) {
  let saved = store.get('shelfKey');
  if (saved?.id !== shelfId) {
    const pair = await crypto.subtle.generateKey(ALG, true, ['sign', 'verify']);
    saved = { id: shelfId, priv: await crypto.subtle.exportKey('jwk', pair.privateKey), pub: await crypto.subtle.exportKey('jwk', pair.publicKey), up: false };
    store.set('shelfKey', saved);
  }
  if (!saved.up) {
    const { kty, crv, x, y } = saved.pub;
    try {
      await upload(`${shelfId}/owner.json`, JSON.stringify({ v: 1, pub: { kty, crv, x, y } }), 'application/json');
    } catch (e) {
      // 이미 있는데 우리가 올린 기록이 없으면, 이 책장은 쓸 수 없어요. (남이 먼저 올렸을 때)
      if (!e.taken) throw e;
      throw Object.assign(new Error('shelf owned by someone else'), { owned: true });
    }
    saved.up = true;
    store.set('shelfKey', saved);
  }
  return crypto.subtle.importKey('jwk', saved.priv, ALG, false, ['sign']);
}

export async function addToShelf(shelfId, entry) {
  if (!ID_RE.test(shelfId) || !shareEnabled()) throw new Error('bad shelf');
  const key = await shelfSigner(shelfId);
  const sig = b64(await crypto.subtle.sign(SIGN, key, new TextEncoder().encode(shelfPayload(entry))));
  for (let n = 1; n <= SHELF_MAX; n++) {
    try {
      await upload(`${shelfId}/s-${n}.json`, JSON.stringify({ ...entry, sig }), 'application/json');
      return n;
    } catch (e) {
      if (!e.taken) throw e;
    }
  }
  throw Object.assign(new Error('shelf full'), { full: true });
}

export async function fetchShelf(shelfId) {
  if (!ID_RE.test(shelfId) || !shareEnabled()) throw new Error('bad shelf');
  const get = async (file) => {
    const res = await fetch(publicUrl(shelfId, file), { cache: 'no-store' }).catch(() => null);
    return res?.ok ? res.json().catch(() => null) : null;
  };
  const owner = await get('owner.json');
  if (!owner?.pub) return [];
  const key = await crypto.subtle.importKey('jwk', { kty: 'EC', crv: 'P-256', x: owner.pub.x, y: owner.pub.y }, ALG, false, ['verify']).catch(() => null);
  if (!key) return [];
  const out = [];
  for (let n = 1; n <= SHELF_MAX; n++) {
    const e = await get(`s-${n}.json`);
    if (!e) break;
    let ok = false;
    try { ok = ID_RE.test(e.shareId || '') && await crypto.subtle.verify(SIGN, key, unb64(e.sig), new TextEncoder().encode(shelfPayload(e))); } catch { ok = false; }
    if (ok) out.push({ ...e, n });
  }
  return out;
}

// 끝까지 들었어요: 아이 휴대폰이 처음 끝까지 들은 동화에 heard.json 을 한 번 올려요. (보낸 사람 홈에서 봐요)
export async function markHeard(id) {
  if (!ID_RE.test(id) || !shareEnabled()) return false;
  try {
    await upload(`${id}/heard.json`, JSON.stringify({ at: new Date().toISOString() }), 'application/json');
    return true;
  } catch (e) {
    return Boolean(e.taken);   // 이미 누가 들었다고 올렸으면 그대로 좋아요
  }
}
export async function fetchHeard(id) {
  if (!ID_RE.test(id) || !shareEnabled()) return false;
  const res = await fetch(publicUrl(id, 'heard.json'), { method: 'HEAD', cache: 'no-store' }).catch(() => null);
  return Boolean(res?.ok);
}
