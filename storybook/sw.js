// 앱 화면을 캐시해 두고, 다음에 열 때 바로 뜨게 해요. (네트워크 우선, 오프라인이면 캐시)
const CACHE = 'deullyeojulge-v40';
const SHELL = ['./', 'index.html', 'styles.css', 'app.js', 'stories.js', 'db.js', 'share.js', 'config.js', 'composer.js', 'scenes.js', 'mystories.js', 'memories.js', 'pay.js', 'pricing.js', 'policies.js', 'stats.js', 'vendor/qrcode.js', 'img/parts.js', 'manifest.webmanifest', 'icons/icon.svg', 'fonts/pretendard/pretendardvariable-dynamic-subset.css'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  // 우리 앱 파일만 캐시해요. 공유 서버의 녹음·목록은 항상 새로 받아요.
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  // 결제 결과(?pay=…&paymentKey=…)처럼 주소에 값이 붙은 화면은 저장하지 않아요.
  if (url.search) return;
  // 인터넷이 되면 항상 최신 파일을, 안 되면 저장해 둔 파일을 보여줘요.
  e.respondWith(caches.open(CACHE).then(async (cache) => {
    try {
      const res = await fetch(e.request);
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    } catch {
      return (await cache.match(e.request)) || Response.error();
    }
  }));
});
