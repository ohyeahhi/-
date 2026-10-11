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

export async function putBlob(key, blob) {
  const buf = await blob.arrayBuffer();
  return tx('readwrite', (s) => s.put({ buf, type: blob.type, at: Date.now() }, key));
}

export async function getBlob(key) {
  const rec = await tx('readonly', (s) => s.get(key));
  return rec ? new Blob([rec.buf], { type: rec.type }) : null;
}

export const remove = (key) => tx('readwrite', (s) => s.delete(key));
export const keys = () => tx('readonly', (s) => s.getAllKeys());
