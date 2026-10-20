// 녹음 파일을 이 기기의 IndexedDB에 저장해요.
// Safari 호환을 위해 Blob 대신 ArrayBuffer + MIME 타입으로 보관해요.
const DB_NAME = 'deullyeojulge';
const STORE = 'recordings';

let dbPromise;
function open() {
  dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function tx(mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(req?.result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

// extra: { trim: [시작 초, 끝 초] } — 녹음 도우미가 찾은, 들을 때 건너뛸 앞뒤 빈 소리
export async function putBlob(key, blob, extra = {}) {
  const buf = await blob.arrayBuffer();
  return tx('readwrite', (s) => s.put({ buf, type: blob.type, at: Date.now(), ...extra }, key));
}

// { blob, at } — at은 녹음한 시각이에요. 공유 뒤에 다시 녹음했는지 알아낼 때 써요.
export async function getRecord(key) {
  const rec = await tx('readonly', (s) => s.get(key));
  return rec ? { blob: new Blob([rec.buf], { type: rec.type }), at: rec.at, trim: rec.trim || null } : null;
}

export const getBlob = async (key) => (await getRecord(key))?.blob ?? null;

export const remove = (key) => tx('readwrite', (s) => s.delete(key));
export const keys = () => tx('readonly', (s) => s.getAllKeys());

// 이야기를 고쳐서 쪽 순서가 바뀌면 녹음도 따라 옮겨요. moves: [[예전 쪽, 새 쪽], …]
// 목록에 없는 쪽의 녹음은 지워요. (지운 장면의 녹음이 다른 장면에서 나오지 않게)
export async function remap(prefix, moves) {
  const all = (await keys()).filter((k) => typeof k === 'string' && k.startsWith(`${prefix}/`));
  const raw = {};
  for (const [from] of moves) raw[from] = await tx('readonly', (s) => s.get(`${prefix}/${from}`));
  await tx('readwrite', (s) => {
    for (const k of all) s.delete(k);
    for (const [from, to] of moves) if (raw[from]) s.put(raw[from], `${prefix}/${to}`);
    return null;
  });
}
