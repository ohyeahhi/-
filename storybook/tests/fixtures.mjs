// 가짜 서버 저장소에 공유 녹음을 직접 만들어 둬요. (녹음 없이 보관·재생 실패 화면을 시험할 때)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export function makeShare(store, { id, storyId = 'sun-moon', role = 'grandma', kid = '하은', daysAgo = 0, pages = 11, bytes = null }) {
  const dir = path.join(store, id);
  fs.mkdirSync(dir, { recursive: true });
  const put = (name, data, type) => { fs.writeFileSync(path.join(dir, name), data); fs.writeFileSync(path.join(dir, `${name}.type`), type); };
  const files = Array.from({ length: pages }, (_, i) => ({ i, file: `${i}.m4a`, type: 'audio/mp4' }));
  // bytes 를 주지 않으면 소리로 읽을 수 없는 아무 값 (재생 실패 시험용)
  for (const f of files) put(f.file, bytes || crypto.randomBytes(2000), 'audio/mp4');
  const createdAt = new Date(Date.now() - daysAgo * 864e5).toISOString();
  put('manifest.json', JSON.stringify({ v: 1, storyId, role, kid, pages: files, createdAt }), 'application/json');
  return id;
}
