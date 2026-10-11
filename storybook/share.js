// 가족 공유: 녹음 파일과 목록(manifest.json)을 Supabase Storage에 올리고,
// 받은 사람은 공개 주소로 바로 들어요. 로그인도, 데이터베이스도 필요 없어요.
//
//   shares/<공유ID>/manifest.json   동화 id, 누가 읽었는지, 쪽별 파일 이름
//   shares/<공유ID>/0.m4a, 1.m4a…   쪽별 녹음
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

const extOf = (type) => (type.includes('mp4') ? 'm4a' : type.includes('ogg') ? 'ogg' : 'webm');

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
  if (!res.ok) throw new Error(`upload failed: ${res.status}`);
}

export const publicUrl = (id, file) => `${base()}/storage/v1/object/public/${bucket()}/${id}/${file}`;

// pages: [{ i, blob }]  meta: { storyId, role, kid }
export async function uploadShare(meta, pages, onProgress = () => {}) {
  const id = newShareId();
  const total = pages.length + 1;
  const files = [];
  for (const [n, { i, blob }] of pages.entries()) {
    const type = blob.type || 'audio/webm';
    const file = `${i}.${extOf(type)}`;
    await upload(`${id}/${file}`, blob, type);
    files.push({ i, file, type });
    onProgress(n + 1, total);
  }
  const manifest = { v: 1, ...meta, pages: files, createdAt: new Date().toISOString() };
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
