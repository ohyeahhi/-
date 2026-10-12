import { STORIES, getStory as getBuiltin } from './stories.js';
import * as db from './db.js';
import { shareEnabled, uploadShare, fetchShare, publicUrl } from './share.js';
import * as mine from './mystories.js';
import { describe } from './composer.js';
import qrcode from './vendor/qrcode.js';
import { payEnabled, startPayment, confirmPayment, keepStatus } from './pay.js';
import { POLICIES, BUSINESS, POLICY_UPDATED } from './policies.js';
import { track, trackOpen } from './stats.js';
import { PRICE_FIRST, PRICE_MORE, GIFT_PRICE, MAX_QTY, priceOf, FREE_KEEP_DAYS, KEEP_PRICE, KEEP_YEARS } from './pricing.js';

const app = document.getElementById('app');
const toastEl = document.getElementById('toast');
const MAX_SECONDS = 180;
// 얼굴 영상은 파일이 커서 한 쪽에 1분 30초까지만 녹화해요. (공유 서버 파일 한도 10MB 안쪽)
const MAX_SECONDS_VIDEO = 90;
const inKakao = /KAKAOTALK/i.test(navigator.userAgent);
const getStory = (id) => getBuiltin(id) || (mine.getRaw(id) ? mine.toStory(mine.getRaw(id)) : null);

/* ---------- 아이콘 ---------- */
const svg = (d, w = 24) =>
  `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I = {
  back: svg('<path d="M15 5l-7 7 7 7"/>', 26),
  close: svg('<path d="M6 6l12 12M18 6L6 18"/>', 24),
  chevron: svg('<path d="M9 6l6 6-6 6"/>', 20),
  check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 18),
  play: '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
  pause: '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.2"/><rect x="14" y="5" width="4" height="14" rx="1.2"/></svg>',
  prev: svg('<path d="M15 5l-7 7 7 7"/>', 28),
  next: svg('<path d="M9 5l7 7-7 7"/>', 28),
  redo: svg('<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>', 20),
  speaker: svg('<path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>', 18),
  send: svg('<path d="M21 3L10 14"/><path d="M21 3l-7 18-4-7-7-4z"/>', 20),
  user: svg('<circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6"/>', 22),
  cam: svg('<rect x="2.5" y="6" width="13" height="12" rx="3"/><path d="M15.5 10.5l5-3v9l-5-3"/>', 18),
  camOff: svg('<rect x="2.5" y="6" width="13" height="12" rx="3"/><path d="M15.5 10.5l5-3v9l-5-3M3 3l18 18"/>', 18),
  plus: svg('<path d="M12 5v14M5 12h14"/>', 22),
  mic: svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>', 18),
  shuffle: svg('<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>', 18),
  trash: svg('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', 18),
  edit: svg('<path d="M4 20h4L19 9l-4-4L4 16z"/>', 18),
};

/* ---------- 프로필 ---------- */
const memory = {};
const local = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return memory[k] ?? null; } },
  set(k, v) { memory[k] = v; try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 사생활 보호 모드 */ } },
};
let profile = local.get('profile');

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const hasBatchim = (w) => {
  const c = w.charCodeAt(w.length - 1);
  return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 !== 0;
};
const whoOf = (role) => (role === 'grandpa' ? '할아버지' : '할머니');
// 하은 → 하은이에게 / 민서 → 민서에게
const toOf = (n) => (!n ? '손주에게' : hasBatchim(n) ? `${n}이에게` : `${n}에게`);
// 하은 → 하은아 / 민서 → 민서야
const callOf = (n) => (!n ? '' : hasBatchim(n) ? `${n}아` : `${n}야`);
const who = () => whoOf(profile?.role);
const kidName = () => (profile?.kid || '').trim();
const kidTo = () => toOf(kidName());

// 모든 동화의 첫 쪽은 손주에게 건네는 인사말이에요.
// 공유 링크로 열면 보낸 사람의 이름 정보(role, kid)로 그려요.
const pagesOf = (story, role = profile?.role, kid = kidName()) => [
  {
    intro: true,
    image: 'img/intro.svg',
    text: `${toOf(kid)} 인사를 건네주세요`,
    hint: `예) ${callOf(kid) ? `${callOf(kid)}, ` : ''}${whoOf(role)}야. 오늘은 ‘${story.title}’ 이야기를 들려줄게.`,
  },
  ...story.pages,
];
const keyOf = (id, i) => `${id}/${i}`;
const recordedSet = async () => new Set(await db.keys().catch(() => []));

/* ---------- 화면 정리 ---------- */
let disposers = [];
const onDispose = (fn) => disposers.push(fn);
function dispose() {
  disposers.forEach((fn) => { try { fn(); } catch { /* 이미 정리됨 */ } });
  disposers = [];
}

/* ---------- 재생 ---------- */
// 소리만 있는 녹음도, 얼굴 영상 녹음도 같은 <video> 하나로 재생해요.
// 영상이면 그림 위 작은 창(.pip)에 붙이고, 소리만이면 보이지 않는 곳에 둬요.
const player = document.createElement('video');
player.playsInline = true;
player.setAttribute('playsinline', '');
const mediaDock = document.createElement('div');
mediaDock.hidden = true;
mediaDock.append(player);
document.body.append(mediaDock);
const parkPlayer = () => { if (player.parentNode !== mediaDock) mediaDock.append(player); };
let playerUrl = null;
function setSource(src, objectUrl = false) {
  if (playerUrl) URL.revokeObjectURL(playerUrl);
  playerUrl = objectUrl ? src : null;
  player.src = src;
}
function stopAudio() {
  player.pause();
  player.onended = null;
  parkPlayer();
}

const AUDIO = { echoCancellation: true, noiseSuppression: true, autoGainControl: true };
const AUDIO_TYPES = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
const VIDEO_TYPES = ['video/mp4;codecs=avc1,mp4a', 'video/mp4', 'video/webm;codecs=vp8,opus', 'video/webm'];
const isVideo = (type) => /^video\//.test(type || '');

const recorder = {
  cur: null,
  get active() { return !!this.cur; },
  // stream 을 주면(얼굴 미리보기 중인 카메라) 그걸로 녹화하고, 끝나도 끄지 않아요.
  async start(onLevel, given = null) {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      throw Object.assign(new Error('녹음 미지원'), { name: 'Unsupported' });
    }
    const stream = given || await navigator.mediaDevices.getUserMedia({ audio: AUDIO });
    const video = stream.getVideoTracks().length > 0;
    const type = (video ? VIDEO_TYPES : AUDIO_TYPES).find((t) => MediaRecorder.isTypeSupported?.(t));
    const opts = { audioBitsPerSecond: 64000, ...(video ? { videoBitsPerSecond: 600000 } : {}), ...(type ? { mimeType: type } : {}) };
    const mr = new MediaRecorder(stream, opts);
    const chunks = [];
    mr.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    mr.start(250);

    const cur = { stream, mr, chunks, type, raf: 0, ctx: null, owns: !given, video };
    try {
      cur.ctx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = cur.ctx.createAnalyser();
      analyser.fftSize = 512;
      cur.ctx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.fftSize);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (const v of data) { const x = (v - 128) / 128; sum += x * x; }
        onLevel(Math.min(1, Math.sqrt(sum / data.length) * 5));
        cur.raf = requestAnimationFrame(tick);
      };
      tick();
    } catch { /* 소리 막대 없이도 녹음은 돼요 */ }
    this.cur = cur;
  },
  stop() {
    const c = this.cur;
    if (!c) return Promise.resolve(null);
    this.cur = null;
    cancelAnimationFrame(c.raf);
    c.ctx?.close?.();
    return new Promise((resolve) => {
      const fallback = c.video ? 'video/webm' : 'audio/webm';
      c.mr.onstop = () => resolve(new Blob(c.chunks, { type: c.mr.mimeType || c.type || fallback }));
      try { c.mr.stop(); } catch { resolve(null); }
      if (c.owns) c.stream.getTracks().forEach((t) => t.stop());
    });
  },
};

/* ---------- 공통 UI ---------- */
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
}

function sheet({ icon, title, body, primary = '확인', secondary, onPrimary, onSecondary, onDismiss, actions = true }) {
  const el = document.createElement('div');
  el.className = 'sheet-backdrop';
  el.innerHTML = `
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
      <div class="sheet-grabber"></div>
      ${icon ? `<div class="sheet-icon">${icon}</div>` : ''}
      <h2 class="sheet-title" id="sheet-title">${title}</h2>
      <p class="sheet-body">${body}</p>
      ${actions ? `<div class="sheet-actions">
        ${secondary ? `<button class="btn btn-secondary" data-act="secondary">${secondary}</button>` : ''}
        <button class="btn btn-primary" data-act="primary">${primary}</button>
      </div>` : ''}
    </div>`;
  document.body.append(el);
  requestAnimationFrame(() => el.classList.add('open'));
  const close = () => { el.classList.remove('open'); setTimeout(() => el.remove(), 260); };
  el.addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if ((e.target === el && actions) || act) close();
    if (act === 'primary') onPrimary?.();
    if (act === 'secondary') onSecondary?.();
    if (e.target === el && actions) onDismiss?.();
  });
  onDispose(close);
  return { el, close };
}

function speak(text) {
  if (!('speechSynthesis' in window)) { toast('이 기기에서는 음성 안내를 쓸 수 없어요'); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ko-KR';
  u.rate = 0.9;
  speechSynthesis.speak(u);
}

const openExternal = () => {
  location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(location.href)}`;
};

/* ---------- 가족에게 보내기 ---------- */
const shareKey = 'shares';
const shareUrl = (shareId) => `${location.origin}${location.pathname}#/s/${shareId}`;

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast('링크를 복사했어요. 카톡 대화창에 붙여넣어 주세요');
  } catch {
    toast('복사하지 못했어요. 링크를 길게 눌러 복사해 주세요');
  }
}

function sendLink(story, shareId) {
  const url = shareUrl(shareId);
  const text = `${who()}가 ${kidTo()} 들려주는 ‘${story.title}’ 동화예요 💛`;
  sheet({
    icon: '💌',
    title: '링크가 준비됐어요',
    body: `카톡이나 문자로 보내면 앱 설치 없이<br>링크만 눌러서 바로 들을 수 있어요.<span class="link-box">${esc(url)}</span>`,
    secondary: navigator.share ? '링크 복사' : '',
    primary: navigator.share ? '카톡·문자로 보내기' : '링크 복사하기',
    onSecondary: () => copyText(url),
    // navigator.share는 버튼을 누른 그 순간에 불러야 열려요 (await 없이)
    onPrimary: () => (navigator.share
      ? navigator.share({ title: story.title, text, url }).catch(() => {})
      : copyText(url)),
  });
}

// 예/아니오를 묻는 시트를 Promise 로 써요.
const ask = (opts) => new Promise((resolve) => sheet({
  ...opts,
  onPrimary: () => resolve(true),
  onSecondary: () => resolve(false),
  onDismiss: () => resolve(false),
}));

async function recordingsOf(story) {
  const records = await Promise.all(pagesOf(story).map((_, i) => db.getRecord(keyOf(story.id, i)).catch(() => null)));
  const recorded = records.map((r, i) => r && { i, ...r }).filter(Boolean);
  return { recorded, latest: Math.max(0, ...recorded.map((r) => r.at || 0)), total: records.length };
}

// 올린 뒤로 다시 녹음한 쪽이 없으면 예전 공유 ID 를 그대로 써요.
const savedShareId = (story, latest) => {
  const saved = local.get(shareKey)?.[story.id];
  return saved && saved.at >= latest ? saved.id : null;
};

function noServerSheet() {
  sheet({
    icon: '🔌',
    title: '공유 서버가 아직 연결되지 않았어요',
    body: '<code>config.js</code>에 Supabase 주소와 키를 넣으면<br>가족에게 링크를 보낼 수 있어요.<br>(설정 방법: SETUP-공유.md)',
  });
}

// 손주(14세 미만)의 이름·목소리·얼굴이 담길 수 있어서, 처음 올릴 때 보호자 동의를 확인해요.
function askUploadConsent(recorded) {
  if (local.get('uploadConsent')) return Promise.resolve(true);
  const face = recorded.some((r) => isVideo(r.blob?.type));
  return new Promise((resolve) => {
    let decided = false;
    const done = (v) => { if (!decided) { decided = true; resolve(v); } };
    const { el } = sheet({
      icon: '🔒',
      title: '녹음을 서버에 올려도 될까요?',
      body: `가족이 들을 수 있도록 아래 내용이 서버에 저장돼요.<span class="consent-list">· ${face ? '목소리와 얼굴 영상' : '목소리'} 녹음<br>· ${kidName() ? `손주 이름(${esc(kidName())})` : '할머니/할아버지 구분'}<br>· 직접 지은 이야기라면 그 글</span>`
        + `<label class="check consent-check"><input type="checkbox" id="consent-ok"><span>손주가 함께 나오는 경우, 손주의 보호자(부모)가 동의했어요.</span></label>`
        + '<a class="consent-link" href="#/policy/privacy">개인정보처리방침 보기</a>',
      secondary: '취소',
      primary: '동의하고 올리기',
      onPrimary: () => { local.set('uploadConsent', { at: Date.now() }); done(true); },
      onSecondary: () => done(false),
      onDismiss: () => done(false),
    });
    const btn = el.querySelector('[data-act="primary"]');
    const box = el.querySelector('#consent-ok');
    btn.disabled = true;
    box.addEventListener('change', () => { btn.disabled = !box.checked; });
    el.querySelector('.consent-link').addEventListener('click', () => done(false));
  });
}

// 녹음을 올리고 공유 ID 를 돌려줘요. 실패하면 다시 시도할지 묻고, 그만두면 null.
async function uploadWithProgress(story, recorded) {
  if (!(await askUploadConsent(recorded))) return null;
  await new Promise((r) => setTimeout(r, 280));
  const total = recorded.length + 1;
  const { el, close } = sheet({
    icon: '☁️',
    title: '목소리를 올리고 있어요',
    body: `<span class="up-bar"><span style="width:0%"></span></span><span class="up-text">0 / ${total}</span>`,
    actions: false,
  });
  const bar = el.querySelector('.up-bar span');
  const label = el.querySelector('.up-text');
  try {
    const shareId = await uploadShare(
      {
        storyId: story.id,
        role: profile?.role || 'grandma',
        kid: kidName(),
        ...(story.custom ? { custom: { title: story.title, pages: story.pages.map(({ text, seed, noCast }) => ({ text, seed, ...(noCast ? { noCast: true } : {}) })) } } : {}),
      },
      recorded.map(({ i, blob }) => ({ i, blob })),
      (n, t) => { bar.style.width = `${(n / t) * 100}%`; label.textContent = `${n} / ${t}`; },
    );
    local.set(shareKey, { ...(local.get(shareKey) || {}), [story.id]: { id: shareId, at: Date.now() } });
    track('share', { story: story.id, shareId, n: recorded.length });
    close();
    await new Promise((r) => setTimeout(r, 280));
    return shareId;
  } catch {
    close();
    await new Promise((r) => setTimeout(r, 280));
    const retry = await ask({
      icon: '📶',
      title: '올리지 못했어요',
      body: '인터넷 연결을 확인하고 다시 시도해 주세요.',
      secondary: '닫기',
      primary: '다시 시도',
    });
    return retry ? uploadWithProgress(story, recorded) : null;
  }
}

async function shareStory(id) {
  const story = getStory(id);
  if (!shareEnabled()) { noServerSheet(); return; }
  const { recorded, latest } = await recordingsOf(story);
  const saved = savedShareId(story, latest);
  if (saved) { sendLink(story, saved); return; }
  const ok = await ask({
    icon: '☁️',
    title: `${esc(kidTo())} 보낼 링크를 만들까요?`,
    body: '녹음을 서버에 올리고 링크를 만들어요.<br>링크를 아는 사람은 누구나 들을 수 있으니<br>가족에게만 보내주세요.',
    secondary: '취소',
    primary: '링크 만들기',
  });
  if (!ok) return;
  const shareId = await uploadWithProgress(story, recorded);
  if (shareId) sendLink(story, shareId);
}

const topbar = ({ back = '', title = '', right = '' } = {}) => `
  <header class="topbar">
    ${back ? `<a class="icon-btn" href="${back}" aria-label="뒤로">${I.back}</a>` : '<span></span>'}
    <div class="topbar-title">${title}</div>
    <div class="topbar-right">${right}</div>
  </header>`;

const tintStyle = (s) => `--c1:${s.tint[0]};--c2:${s.tint[1]}`;
const coverHTML = (s, cls = '') => (s.coverImage
  ? `<div class="cover ${cls}"><img src="${esc(s.coverImage)}" alt=""></div>`
  : `<div class="cover ${cls}" style="${tintStyle(s)}"><span>${s.cover}</span></div>`);

// 쪽 그림: 그림 파일(image)이 있으면 그걸, 없으면 배경 + 이모지로 장면을 그려요.
const sceneHTML = (p, cls = '') => {
  if (p.image) return `<div class="scene ${cls}"><div class="sc-layer"><img src="${esc(p.image)}" alt=""></div></div>`;
  const items = p.scene.items.map(([emoji, x, y, size, anim], n) => `
    <span class="sc-item${anim ? ` a-${anim}` : ''}" style="left:${x}%;top:${y}%;--s:${size};--n:${n}"><i>${emoji}</i></span>`).join('');
  return `<div class="scene ${cls} bg-${p.scene.bg}" aria-hidden="true"><div class="sc-layer">${items}</div></div>`;
};

function render(html, cls = '') {
  app.innerHTML = `<main class="screen ${cls}">${html}</main>`;
}

/* ---------- 화면: 처음 설정 ---------- */
function welcomeView() {
  let role = profile?.role || 'grandma';
  render(`
    ${topbar({ back: profile ? '#/' : '' })}
    <div class="welcome">
      <img class="app-mark" src="icons/icon.svg" alt="" width="64" height="64">
      <h1 class="title-xl">손주에게<br>내 목소리로<br>동화를 들려주세요</h1>
      <p class="sub">녹음은 이 휴대폰에만 저장돼요.</p>

      <span class="label">저는</span>
      <div class="choice-grid" role="radiogroup">
        <button class="choice" role="radio" data-role="grandma"><span class="choice-emoji">👵</span>할머니</button>
        <button class="choice" role="radio" data-role="grandpa"><span class="choice-emoji">👴</span>할아버지</button>
      </div>

      <label class="label" for="kid">손주 이름 <span class="opt">선택</span></label>
      <input id="kid" class="input" placeholder="예) 하은" maxlength="10" autocomplete="off" value="${esc(kidName())}">
    </div>
    <div class="cta-bar"><button class="btn btn-primary" id="go">${profile ? '저장하기' : '시작하기'}</button></div>
  `);
  const sync = () => app.querySelectorAll('.choice').forEach((b) => {
    const on = b.dataset.role === role;
    b.classList.toggle('on', on);
    b.setAttribute('aria-checked', on);
  });
  sync();
  app.querySelector('.choice-grid').addEventListener('click', (e) => {
    const b = e.target.closest('[data-role]');
    if (b) { role = b.dataset.role; sync(); }
  });
  app.querySelector('#go').addEventListener('click', () => {
    if (!profile) track('start', { meta: { role, kid: Boolean(app.querySelector('#kid').value.trim()) } });
    profile = { role, kid: app.querySelector('#kid').value.trim() };
    local.set('profile', profile);
    location.hash = '#/';
  });
}

/* ---------- 화면: 홈 ---------- */
async function homeView() {
  const rec = await recordedSet();
  const card = (s) => {
    const pages = pagesOf(s);
    const n = pages.filter((_, i) => rec.has(keyOf(s.id, i))).length;
    const done = n === pages.length;
    const meta = done
      ? '<span class="badge">완성했어요</span>'
      : n ? `${n}/${pages.length}쪽 녹음했어요` : `${pages.length}쪽 · 약 ${s.minutes}분`;
    return `
      <a class="story-card" href="#/story/${s.id}">
        ${coverHTML(s)}
        <div class="story-card-body">
          <div class="story-card-title">${esc(s.title)}</div>
          <div class="story-card-meta">${meta}</div>
          ${n && !done ? `<div class="progress"><span style="width:${(n / pages.length) * 100}%"></span></div>` : ''}
        </div>
        <span class="chev">${I.chevron}</span>
      </a>`;
  };
  const mineList = mine.myStories();

  render(`
    ${topbar({
      title: '<span class="brand"><img src="icons/icon.svg" alt="" width="24" height="24">들려줄게</span>',
      right: `<a class="icon-btn" href="#/welcome" aria-label="내 정보">${I.user}</a>`,
    })}
    <h1 class="title-xl">${who()} 목소리로<br>어떤 동화를 들려줄까요?</h1>
    <p class="sub">녹음해 두면 ${esc(kidTo())} 언제든 들려줄 수 있어요.</p>
    <h2 class="section-label">전래동화</h2>
    ${STORIES.map(card).join('')}
    <h2 class="section-label">내가 지은 이야기</h2>
    ${mineList.map(card).join('')}
    <a class="story-card new-card" href="#/new">
      <div class="cover cover-new">${I.plus}</div>
      <div class="story-card-body">
        <div class="story-card-title">새 이야기 만들기</div>
        <div class="story-card-meta">옛날이야기나 추억을 적으면 그림이 저절로 그려져요</div>
      </div>
      <span class="chev">${I.chevron}</span>
    </a>
    <div class="tip">
      <span class="tip-emoji">💡</span>
      <p>조용한 곳에서 휴대폰을 입에서 한 뼘 정도 떨어뜨리고 읽으면 목소리가 깨끗하게 담겨요.</p>
    </div>
    ${footerHTML()}
  `, 'screen-home');
}

/* ---------- 화면: 동화 상세 ---------- */
async function storyView(id) {
  const s = getStory(id);
  if (!s) return notFound();
  const pages = pagesOf(s);
  const rec = await recordedSet();
  const has = (i) => rec.has(keyOf(id, i));
  const n = pages.filter((_, i) => has(i)).length;
  const firstMissing = pages.findIndex((_, i) => !has(i));

  const rows = pages.map((p, i) => `
    <li>
      <a class="list-row" href="#/record/${id}/${i}">
        <span class="num ${has(i) ? 'done' : ''}">${has(i) ? I.check : i === 0 ? '♥' : i}</span>
        <span class="list-text">${p.intro ? `<b>인사말</b> · ${esc(kidTo())} 한마디` : esc(p.text)}</span>
        <span class="chev">${I.chevron}</span>
      </a>
    </li>`).join('');

  let cta;
  if (n === 0) {
    cta = `<a class="btn btn-primary" href="#/record/${id}/0">녹음 시작하기</a>`;
  } else if (n < pages.length) {
    cta = `<a class="btn btn-secondary" href="#/listen/${id}">들어보기</a>
           <a class="btn btn-primary grow" href="#/record/${id}/${firstMissing}">이어서 녹음하기</a>`;
  } else {
    cta = `<button class="btn btn-secondary" id="share">보내기</button>
           <a class="btn btn-primary grow" href="#/listen/${id}">손주에게 들려주기</a>`;
  }

  render(`
    ${topbar({ back: '#/' })}
    <div class="hero">
      ${coverHTML(s, 'cover-lg')}
      <h1 class="title-lg">${esc(s.title)}</h1>
      <p class="sub">${esc(s.desc)}</p>
      <div class="chip-row">
        <a class="chip" href="#/book/${id}">📖 그림책으로 만들기</a>
        ${s.custom ? `<a class="chip" href="#/edit/${id}">${I.edit}이야기 고치기</a>` : ''}
      </div>
      <div class="stat-row">
        <div><b>${pages.length}쪽</b><span>분량</span></div>
        <div><b>약 ${s.minutes}분</b><span>읽는 시간</span></div>
        <div><b>${n}/${pages.length}</b><span>녹음</span></div>
      </div>
    </div>
    <h2 class="section-label">쪽마다 녹음해요</h2>
    <ol class="list">${rows}</ol>
    <div class="cta-bar">${cta}</div>
  `);
  app.querySelector('#share')?.addEventListener('click', () => shareStory(id));
}

/* ---------- 화면: 녹음 ---------- */
async function recordView(id, idxStr) {
  const s = getStory(id);
  const pages = s && pagesOf(s);
  const i = Number(idxStr);
  if (!s || !(i >= 0 && i < pages.length)) return notFound();
  const p = pages[i];
  const key = keyOf(id, i);
  const last = i === pages.length - 1;
  const rec = await recordedSet();

  render(`
    ${topbar({
      back: `#/story/${id}`,
      title: i === 0 ? '인사말' : `${i} / ${pages.length - 1}쪽`,
      right: `<div class="chip-group">
        <button class="chip chip-cam" id="cam-toggle" aria-pressed="false"></button>
        <button class="chip" id="guide">${I.speaker}안내</button>
      </div>`,
    })}
    <div class="stepbar"><span style="width:${((i + 1) / pages.length) * 100}%"></span></div>
    ${inKakao ? `
      <div class="notice">
        <p>카카오톡 안에서는 녹음이 안 될 수 있어요.</p>
        <button class="notice-btn" id="external">다른 브라우저로 열기</button>
      </div>` : ''}
    ${sceneHTML(p)}
    <p class="read-text">${esc(p.text)}</p>
    ${p.intro ? `<div class="hint-card">${esc(p.hint)}</div>` : ''}
    <div class="rec-dock">
      <div class="self-cam" id="pip" hidden></div>
      <div class="dock-main" id="dock" aria-live="polite"></div>
    </div>
  `, 'screen-record');

  const dock = app.querySelector('#dock');
  const pip = app.querySelector('#pip');
  const camBtn = app.querySelector('#cam-toggle');
  let busy = false;
  let timer = 0;
  let bars = [];

  // ----- 얼굴 함께 녹화 (켜고 끌 수 있어요) -----
  let cam = null;
  let preview = null;
  const camWanted = () => local.get('faceVideo') === true;
  const drawCamBtn = () => {
    const on = Boolean(cam);
    camBtn.innerHTML = `${on ? I.cam : I.camOff}<span>얼굴 ${on ? '켬' : '끔'}</span>`;
    camBtn.setAttribute('aria-pressed', String(on));
    camBtn.classList.toggle('on', on);
  };
  const showPreview = () => {
    if (!cam) return;
    parkPlayer();
    preview ??= Object.assign(document.createElement('video'), { muted: true, autoplay: true, playsInline: true, className: 'mirror' });
    preview.setAttribute('playsinline', '');
    preview.srcObject = cam;
    pip.replaceChildren(preview);
    pip.hidden = false;
    preview.play?.().catch(() => {});
  };
  async function camOn() {
    try {
      cam = await navigator.mediaDevices.getUserMedia({
        audio: AUDIO,
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 640 } },
      });
    } catch (e) {
      cam = null;
      local.set('faceVideo', false);
      drawCamBtn();
      sheet({
        icon: '📷',
        title: '카메라를 켤 수 없어요',
        body: e.name === 'NotAllowedError'
          ? '얼굴을 함께 담으려면 카메라 권한이 필요해요.<br>주소창 옆 설정에서 카메라를 ‘허용’으로 바꿔주세요.'
          : '이 기기에서는 카메라를 쓸 수 없어요.<br>목소리만으로도 녹음할 수 있어요.',
      });
      return;
    }
    local.set('faceVideo', true);
    drawCamBtn();
    showPreview();
  }
  function camOff(remember = true) {
    cam?.getTracks().forEach((t) => t.stop());
    cam = null;
    if (preview) preview.srcObject = null;
    pip.replaceChildren();
    pip.hidden = true;
    if (remember) local.set('faceVideo', false);
    drawCamBtn();
  }
  camBtn.addEventListener('click', async () => {
    if (recorder.active) { toast('녹음이 끝난 뒤에 바꿀 수 있어요'); return; }
    if (cam) { camOff(); toast('목소리만 녹음해요'); return; }
    await camOn();
    if (cam) toast('얼굴도 함께 녹화해요');
  });

  const draw = (state) => {
    if (state === 'idle') {
      dock.innerHTML = `
        <p class="dock-hint">빨간 버튼을 누르고<br>소리 내어 읽어주세요</p>
        <button class="rec-btn" data-act="rec" aria-label="녹음 시작"><span class="rec-inner"></span></button>`;
    } else if (state === 'recording') {
      dock.innerHTML = `
        <div class="rec-status">
          <div class="meter">${'<i></i>'.repeat(9)}</div>
          <p class="dock-timer" id="timer">0:00</p>
        </div>
        <button class="rec-btn is-rec" data-act="rec" aria-label="녹음 멈추기"><span class="rec-inner"></span></button>
        <p class="dock-hint small">다 읽으면 버튼을 한 번 더 눌러주세요</p>`;
      bars = [...dock.querySelectorAll('.meter i')];
    } else {
      dock.innerHTML = `
        <div class="done-row">
          <button class="pill" data-act="redo">${I.redo}다시 녹음</button>
          <button class="pill pill-accent" data-act="play">${I.play}<span>들어보기</span></button>
        </div>
        <button class="btn btn-primary full" data-act="next">${last ? '녹음 완성하기' : '다음 쪽으로'}</button>`;
    }
  };

  const shape = [0.45, 0.7, 0.9, 1, 1.1, 1, 0.9, 0.7, 0.45];
  const onLevel = (lv) => bars.forEach((b, j) => {
    const v = Math.max(0.12, Math.min(1, lv * shape[j] * (0.85 + Math.random() * 0.3)));
    b.style.transform = `scaleY(${v})`;
  });

  async function startRec() {
    stopAudio();
    showPreview();
    try {
      await recorder.start(onLevel, cam);
    } catch (e) {
      recError(e);
      return;
    }
    draw('recording');
    navigator.vibrate?.(15);
    const started = Date.now();
    const el = dock.querySelector('#timer');
    timer = setInterval(() => {
      const sec = Math.floor((Date.now() - started) / 1000);
      el.textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
      if (sec >= (cam ? MAX_SECONDS_VIDEO : MAX_SECONDS)) stopRec();
    }, 250);
  }

  async function stopRec() {
    if (!recorder.active) return;
    clearInterval(timer);
    const blob = await recorder.stop();
    navigator.vibrate?.(15);
    if (!blob || blob.size < 1500) {
      toast('녹음이 너무 짧아요. 한 번 더 해볼까요?');
      draw('idle');
      return;
    }
    await db.putBlob(key, blob);
    track('record', { story: id, n: i, meta: { video: isVideo(blob.type) } });
    draw('done');
    toast(isVideo(blob.type) ? '얼굴과 목소리를 담았어요' : '목소리를 담았어요');
  }

  async function togglePlay(btn) {
    const reset = () => { btn.innerHTML = `${I.play}<span>들어보기</span>`; showPreview(); if (!cam) { pip.hidden = true; } };
    if (!player.paused) {
      stopAudio();
      reset();
      return;
    }
    const recd = await db.getRecord(key);
    if (!recd) return;
    setSource(URL.createObjectURL(recd.blob), true);
    if (isVideo(recd.blob.type)) {  // 녹화한 얼굴을 작은 창에서 보여줘요
      pip.replaceChildren(player);
      pip.hidden = false;
    }
    player.onended = () => { parkPlayer(); reset(); };
    await player.play().catch(() => {});
    btn.innerHTML = `${I.pause}<span>멈추기</span>`;
  }

  dock.addEventListener('click', async (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (!act || busy) return;
    busy = true;
    try {
      if (act === 'rec') await (recorder.active ? stopRec() : startRec());
      else if (act === 'redo') await startRec();
      else if (act === 'play') await togglePlay(e.target.closest('[data-act]'));
      else if (act === 'next') location.hash = last ? `#/done/${id}` : `#/record/${id}/${i + 1}`;
    } finally {
      busy = false;
    }
  });

  app.querySelector('#guide').addEventListener('click', () => speak(
    p.intro
      ? `${kidTo()} 하고 싶은 인사를 편하게 말씀해 주세요. 빨간 버튼을 누르면 녹음이 시작되고, 다 말씀하시면 버튼을 한 번 더 누르시면 돼요.`
      : '화면의 글을 소리 내어 읽어 주세요. 빨간 버튼을 누르면 녹음이 시작되고, 다 읽으시면 버튼을 한 번 더 누르시면 돼요.',
  ));
  app.querySelector('#external')?.addEventListener('click', openExternal);

  onDispose(() => {
    clearInterval(timer);
    if (recorder.active) recorder.stop();
    camOff(false);
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  });

  drawCamBtn();
  if (camWanted()) camOn();
  draw(rec.has(key) ? 'done' : 'idle');
}

function recError(e) {
  if (e.name === 'NotAllowedError' || e.name === 'SecurityError') {
    sheet({
      icon: '🎙️',
      title: '마이크를 쓸 수 있게 해주세요',
      body: '녹음하려면 마이크 권한이 필요해요.<br>주소창 옆 설정에서 마이크를 ‘허용’으로 바꿔주세요.',
    });
  } else if (e.name === 'NotFoundError') {
    sheet({ icon: '🎙️', title: '마이크를 찾지 못했어요', body: '이어폰이나 마이크가 잘 연결되어 있는지 확인해 주세요.' });
  } else if (e.name === 'Unsupported') {
    sheet({
      icon: '🧭',
      title: '이 브라우저에서는 녹음할 수 없어요',
      body: inKakao
        ? '카카오톡 안에서는 녹음이 막혀 있어요.<br>다른 브라우저로 열어서 녹음해 주세요.'
        : '크롬이나 사파리 최신 버전에서 열어주세요.',
      primary: inKakao ? '다른 브라우저로 열기' : '확인',
      onPrimary: inKakao ? openExternal : null,
    });
  } else {
    toast('녹음을 시작하지 못했어요. 다시 눌러주세요.');
  }
}

/* ---------- 화면: 완성 ---------- */
function doneView(id) {
  const s = getStory(id);
  if (!s) return notFound();
  const completed = local.get('completed') || {};
  if (!completed[id]) { track('complete', { story: id }); local.set('completed', { ...completed, [id]: Date.now() }); }
  render(`
    ${topbar({ back: `#/story/${id}` })}
    <div class="celebrate">
      <div class="celebrate-badge">🎉</div>
      <h1 class="title-xl">‘${esc(s.title)}’<br>녹음을 마쳤어요</h1>
      <p class="sub">이제 ${esc(kidTo())} ${who()} 목소리로<br>동화를 들려줄 수 있어요.</p>
    </div>
    <div class="cta-bar">
      <button class="btn btn-secondary" id="share">보내기</button>
      <a class="btn btn-primary grow" href="#/listen/${id}">지금 들려주기</a>
    </div>
  `);
  app.querySelector('#share').addEventListener('click', () => shareStory(id));
}

/* ---------- 화면: 손주가 듣기 ---------- */
async function listenView(id) {
  const s = getStory(id);
  if (!s) return notFound();
  const pages = pagesOf(s);
  const recs = await Promise.all(pages.map((_, i) => db.getRecord(keyOf(id, i)).catch(() => null)));
  const list = pages
    .map((p, i) => ({ ...p, n: i, rec: recs[i] }))
    .filter((p) => p.rec)
    .map(({ rec, ...p }) => ({
      ...p,
      video: isVideo(rec.blob.type),
      load: async () => { setSource(URL.createObjectURL(rec.blob), true); return true; },
    }));
  if (!list.length) {
    toast('먼저 녹음해 주세요');
    location.replace(`#/story/${id}`);
    return;
  }
  render(`
    ${topbar({ right: `<a class="icon-btn" href="#/story/${id}" aria-label="닫기">${I.close}</a>` })}
    <div class="listen" id="stage"></div>
  `, 'screen-listen');
  mountPlayer(app.querySelector('#stage'), { story: s, list, reader: who(), kid: kidName() });
}

/* ---------- 화면: 공유 링크로 듣기 (받은 가족) ---------- */
// 직접 지은 이야기는 글이 목록에 함께 들어 있어서, 받은 쪽에서 같은 그림을 다시 만들어요.
async function loadShared(shareId) {
  try {
    const manifest = await fetchShare(shareId);
    const s = manifest.custom ? mine.toStory({ id: manifest.storyId, ...manifest.custom }) : getStory(manifest.storyId);
    return s ? { manifest, s } : null;
  } catch {
    return null;
  }
}

// #/s/<공유ID>/<쪽> : 그림책 QR 은 그 쪽부터 들려줘요.
async function sharedView(shareId, page) {
  render(`
    ${topbar()}
    <div id="keep-note"></div>
    <div class="listen" id="stage"><div class="loading"><span class="spinner"></span><p class="sub">동화를 불러오고 있어요</p></div></div>
  `, 'screen-listen');
  const loaded = await loadShared(shareId);
  const manifest = loaded?.manifest;
  const s = loaded?.s;
  const stage = app.querySelector('#stage');
  if (!stage) return; // 기다리는 사이 다른 화면으로 갔어요
  if (!s) {
    stage.innerHTML = `
      <div class="listen-start">
        <div class="celebrate-badge">🔗</div>
        <h1 class="title-lg">링크를 열 수 없어요</h1>
        <p class="sub">주소가 정확한지 보낸 분께 확인해 주세요.</p>
      </div>`;
    return;
  }
  const pages = pagesOf(s, manifest.role, manifest.kid || '');
  const list = manifest.pages
    .filter((f) => pages[f.i])
    .map((f) => ({
      ...pages[f.i],
      n: f.i,
      video: isVideo(f.type),
      load: async () => { setSource(publicUrl(shareId, f.file)); return true; },
    }));
  mountPlayer(stage, {
    story: s,
    list,
    reader: whoOf(manifest.role),
    kid: (manifest.kid || '').trim(),
    endExtra: `<a class="keep-link" href="#/keep/${shareId}">🔒 이 목소리 오래 간직하기<span>${I.chevron}</span></a>
      <a class="btn btn-secondary full" href="#/about" data-act="invite">우리 가족도 만들어 보기</a>`,
    startAt: Number(page) || 0,
    shareId,
  });
  // 무료 보관이 60일 안에 끝나면 위에 알려 줘요.
  const freeUntil = freeKeepUntil(manifest);
  if (payEnabled() && freeUntil && freeUntil - Date.now() < 60 * 864e5) {
    const until = await keepStatus(shareId);
    const note = app.querySelector('#keep-note');
    if (note && !(until && new Date(until) > freeUntil)) {
      note.innerHTML = `<a class="notice keep-notice" href="#/keep/${shareId}"><p>이 녹음은 <b>${dateKo(freeUntil)}</b>에 지워져요. 오래 간직하려면 눌러 주세요.</p></a>`;
    }
  }
}

// 듣기 화면: 표지 → 쪽마다 그림 + 목소리 → 끝. 한 쪽이 끝나면 저절로 넘어가요.
function mountPlayer(stage, { story: s, list, reader, kid, endExtra = '', startAt = 0, shareId = null }) {
  const first = Math.max(0, list.findIndex((p) => p.n === startAt));
  let pos = 0;
  let alive = true;
  let advanceTimer = 0;
  onDispose(() => { alive = false; clearTimeout(advanceTimer); stopAudio(); player.onerror = null; player.onplaying = null; });

  const drawStart = () => {
    stage.innerHTML = `
      <div class="listen-start">
        ${coverHTML(s, 'cover-xl')}
        <p class="eyebrow">${reader}가 읽어주는${first > 0 && list[first].n ? ` · ${list[first].n}쪽부터` : ''}</p>
        <h1 class="title-xl">${esc(s.title)}</h1>
        ${kid ? `<p class="sub">${esc(toOf(kid))}</p>` : ''}
        <button class="play-big" data-act="start" aria-label="듣기 시작">${I.play}</button>
      </div>`;
  };

  const drawPage = () => {
    const p = list[pos];
    stage.innerHTML = `
      ${sceneHTML(p, p.video ? 'scene-xl scene-call' : 'scene-xl')}
      ${p.video
        ? `<div class="call-row">
            <div class="call-cam"><span class="pip-label"><i></i>${reader}</span></div>
            <p class="listen-text call-text">${p.intro ? `${reader}의 인사 💌` : esc(p.text)}</p>
          </div>`
        : `<p class="listen-text">${p.intro ? `${reader}의 인사 💌` : esc(p.text)}</p>`}
      <div class="dots">${list.map((_, j) => `<i class="${j === pos ? 'on' : ''}"></i>`).join('')}</div>
      <div class="controls">
        <button class="ctl" data-act="prev" aria-label="앞 쪽" ${pos === 0 ? 'disabled' : ''}>${I.prev}</button>
        <button class="ctl ctl-main" data-act="toggle" aria-label="재생/멈춤">${I.pause}</button>
        <button class="ctl" data-act="next" aria-label="다음 쪽" ${pos === list.length - 1 ? 'disabled' : ''}>${I.next}</button>
      </div>`;
  };

  const drawEnd = () => {
    if (shareId) track('listen_end', { story: s.id, shareId });
    stage.innerHTML = `
      <div class="listen-start">
        <div class="celebrate-badge">🌟</div>
        <h1 class="title-xl">끝!</h1>
        <p class="sub">${reader}, 재미있는 이야기 고마워요!</p>
        <div class="end-actions">
          <button class="btn btn-primary full" data-act="again">처음부터 다시 듣기</button>
          ${endExtra}
        </div>
      </div>`;
  };

  const setToggle = (playing) => {
    const b = stage.querySelector('[data-act="toggle"]');
    if (b) b.innerHTML = playing ? I.pause : I.play;
  };

  // 재생이 안 되는 쪽(기기가 녹음 형식을 못 읽거나, 인터넷이 끊겼을 때)은
  // 그림과 글을 잠깐 보여 주고 다음 쪽으로 넘어가요.
  let played = 0;
  let failed = 0;
  let warned = false;
  const failPage = () => {
    if (!alive || stage.querySelector('.play-fail')) return;
    failed += 1;
    setToggle(false);
    stage.querySelector('.call-row')?.classList.add('cam-off');
    stage.querySelector('.dots')?.insertAdjacentHTML('beforebegin',
      `<p class="play-fail" role="status">이 쪽 ${list[pos].video ? '영상을' : '소리를'} 이 휴대폰에서 틀 수 없어요.${pos < list.length - 1 ? ' 그림을 보고 다음 쪽으로 넘어갈게요.' : ''}</p>`);
    const at = pos;
    advanceTimer = setTimeout(() => {
      if (!alive || pos !== at) return;
      if (pos < list.length - 1) playAt(pos + 1);
      else drawEnd();
    }, 6000);
    if (failed >= 2 && !played && !warned) {
      warned = true;
      sheet({
        icon: '🧭',
        title: '이 브라우저에서는 재생이 잘 안 돼요',
        body: inKakao
          ? '카카오톡 안에서는 녹음이 안 나올 수 있어요.<br>다른 브라우저로 열면 잘 들려요.'
          : '크롬이나 사파리 최신 버전에서 이 링크를 열어 주세요.',
        secondary: '닫기',
        primary: inKakao ? '다른 브라우저로 열기' : '링크 복사하기',
        onPrimary: inKakao ? openExternal : () => copyText(location.href),
      });
    }
  };
  player.onerror = () => {
    if (!alive || !player.getAttribute('src')) return;
    failPage();
  };
  player.onplaying = () => { played += 1; };

  async function playAt(j) {
    clearTimeout(advanceTimer);
    pos = j;
    drawPage();
    if (!(await list[pos].load()) || !alive) return;
    // 영상통화처럼: 얼굴 영상이 있으면 그림 위 작은 창에서 보여줘요.
    const pip = stage.querySelector('.call-cam');
    if (pip) pip.prepend(player); else parkPlayer();
    player.onended = () => {
      setToggle(false);
      advanceTimer = setTimeout(() => {
        if (!alive) return;
        if (pos < list.length - 1) playAt(pos + 1);
        else drawEnd();
      }, 900);
    };
    try {
      await player.play();
      setToggle(true);
    } catch (e) {
      // 자동 재생이 막힌 건(NotAllowedError) 재생 버튼을 누르면 돼요.
      if (e?.name === 'NotSupportedError') failPage(); else setToggle(false);
    }
  }

  stage.addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'start') { playAt(first); if (shareId) track('listen', { story: s.id, shareId, n: list[first]?.n ?? 0 }); }
    else if (act === 'invite' && shareId) track('invite', { shareId });
    else if (act === 'again') playAt(0);
    else if (act === 'prev') playAt(pos - 1);
    else if (act === 'next') playAt(pos + 1);
    else if (act === 'toggle') {
      if (player.paused) { player.play().then(() => setToggle(true)).catch(() => {}); }
      else { player.pause(); clearTimeout(advanceTimer); setToggle(false); }
    }
  });

  drawStart();
}

/* ---------- 화면: 이야기 만들기·고치기 ---------- */
const DRAFT = 'storyDraft';
const MAX_PAGES = 12;
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

// 글에서 찾아 그림에 넣은 것들을 작은 꼬리표로 보여 줘요.
function foundHTML(text, noCast = false) {
  const d = describe(text, { noCast });
  if (!d) return '';
  const tag = (label, words) => (words.length ? `<span class="found-row"><i>${label}</i>${words.map((w) => `<span class="found-chip">${esc(w)}</span>`).join('')}</span>` : '');
  const rows = tag('누가', d.who) + tag('무엇', d.things) + tag('어디', d.where) + tag('언제', d.when) + tag('어떻게', d.doing);
  return (rows ? `<p class="found-title">그림에 넣은 것</p>${rows}` : '') + (d.tip ? `<p class="found-tip">💡 ${esc(d.tip)}</p>` : '');
}

function editorView(editId) {
  const raw = editId ? mine.getRaw(editId) : null;
  if (editId && !raw) return notFound();
  const state = raw
    ? JSON.parse(JSON.stringify(raw))
    : (local.get(DRAFT) || { id: mine.newId(), title: '', pages: [{ text: '', seed: 0 }] });
  const saveDraft = () => { if (!editId) local.set(DRAFT, state); };

  render(`
    ${topbar({ back: editId ? `#/story/${editId}` : '#/', title: editId ? '이야기 고치기' : '새 이야기' })}
    <h1 class="title-lg">${editId ? '이야기를 고쳐 보세요' : `${who()}가 지은 이야기를<br>들려주세요`}</h1>
    <p class="sub">장면마다 두세 문장씩 적으면 글에 맞는 그림이 저절로 그려져요. 누가(할머니·손녀·강아지·곰·오리…), 어디서(집·숲·바다·부엌…), 언제(밤·비 오는 날·겨울…), 무엇을(사과를 따 먹었다·풍선을 들고·자전거를 타고…), 어떤 마음이었는지(슬펐다·무서웠다·보고 싶었다·부끄러웠다…) 적을수록 그림이 자세해져요.</p>
    <label class="label" for="st-title">제목</label>
    <input id="st-title" class="input" maxlength="30" placeholder="예) 할머니 어릴 적 개울가" value="${esc(state.title)}">
    <div id="pages"></div>
    <button class="add-page" id="add-page">${I.plus}장면 추가하기</button>
    ${editId ? `<button class="text-danger" id="delete">${I.trash}이 이야기 지우기</button>` : ''}
    <div class="cta-bar"><button class="btn btn-primary" id="save">${editId ? '저장하기' : '저장하고 녹음하기'}</button></div>
  `, 'screen-editor');

  const pagesEl = app.querySelector('#pages');
  const drawPages = () => {
    pagesEl.innerHTML = state.pages.map((p, n) => `
      <section class="page-card" data-n="${n}">
        <div class="page-card-head">
          <b>${n + 1}번째 장면</b>
          ${state.pages.length > 1 ? `<button class="icon-mini" data-act="del" aria-label="장면 지우기">${I.trash}</button>` : ''}
        </div>
        <div class="page-art"><img alt="" src="${mine.pageImage(p.text, p.seed, p.noCast)}"></div>
        <textarea class="page-text" rows="3" maxlength="200" placeholder="${n === 0
          ? '예) 옛날 옛날, 할머니가 어렸을 때 우리 집에는 누렁이라는 강아지가 있었단다.'
          : '다음 장면을 적어 주세요'}">${esc(p.text)}</textarea>
        <div class="page-found" aria-live="polite">${foundHTML(p.text, p.noCast)}</div>
        <div class="page-tools">
          ${SpeechRec ? `<button class="pill" data-act="dictate">${I.mic}<span>말로 쓰기</span></button>` : ''}
          <button class="pill" data-act="reroll">${I.shuffle}다른 그림</button>
          <button class="pill${p.noCast ? ' on' : ''}" data-act="nocast" aria-pressed="${Boolean(p.noCast)}">${p.noCast ? '인물 넣기' : '인물 빼기'}</button>
        </div>
      </section>`).join('');
  };
  drawPages();

  const timers = new Map();
  const refreshArt = (n) => {
    clearTimeout(timers.get(n));
    timers.set(n, setTimeout(() => {
      const img = pagesEl.querySelector(`[data-n="${n}"] .page-art img`);
      const p = state.pages[n];
      if (img && p) img.src = mine.pageImage(p.text, p.seed, p.noCast);
      const found = pagesEl.querySelector(`[data-n="${n}"] .page-found`);
      if (found && p) found.innerHTML = foundHTML(p.text, p.noCast);
    }, 450));
  };

  app.querySelector('#st-title').addEventListener('input', (e) => { state.title = e.target.value; saveDraft(); });
  pagesEl.addEventListener('input', (e) => {
    const card = e.target.closest('[data-n]');
    if (!card || !e.target.matches('textarea')) return;
    const n = Number(card.dataset.n);
    state.pages[n].text = e.target.value;
    saveDraft();
    refreshArt(n);
  });

  // 말로 쓰기: 휴대폰 음성 인식으로 받아 적어요.
  let recog = null;
  const stopDictation = () => { try { recog?.abort(); } catch { /* 이미 멈춤 */ } recog = null; };
  onDispose(stopDictation);
  function dictate(card, btn) {
    if (recog) { recog.stop(); return; }
    const ta = card.querySelector('textarea');
    const base = ta.value.trim() ? `${ta.value.trim()} ` : '';
    recog = new SpeechRec();
    recog.lang = 'ko-KR';
    recog.interimResults = true;
    recog.onresult = (e) => {
      ta.value = base + Array.from(e.results, (r) => r[0].transcript).join('');
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    };
    recog.onerror = (e) => {
      if (e.error === 'not-allowed') toast('마이크 권한을 허용해 주세요');
      else if (e.error !== 'aborted' && e.error !== 'no-speech') toast('잘 듣지 못했어요. 다시 눌러 주세요');
    };
    recog.onend = () => { recog = null; btn.classList.remove('listening'); btn.innerHTML = `${I.mic}<span>말로 쓰기</span>`; };
    try {
      recog.start();
      btn.classList.add('listening');
      btn.innerHTML = `${I.mic}<span>듣고 있어요…</span>`;
    } catch { recog = null; toast('음성 입력을 시작하지 못했어요'); }
  }

  pagesEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    const card = e.target.closest('[data-n]');
    if (!btn || !card) return;
    const n = Number(card.dataset.n);
    if (btn.dataset.act === 'reroll') {
      state.pages[n].seed = (state.pages[n].seed || 0) + 1;
      saveDraft();
      card.querySelector('.page-art img').src = mine.pageImage(state.pages[n].text, state.pages[n].seed, state.pages[n].noCast);
    } else if (btn.dataset.act === 'nocast') {
      // 인물 빼기: 글에 누가 나와도 풍경과 물건만 그려요. (할머니가 어릴 적 살던 마을처럼)
      const p = state.pages[n];
      p.noCast = !p.noCast;
      if (!p.noCast) delete p.noCast;
      saveDraft();
      btn.classList.toggle('on', Boolean(p.noCast));
      btn.setAttribute('aria-pressed', String(Boolean(p.noCast)));
      btn.textContent = p.noCast ? '인물 넣기' : '인물 빼기';
      card.querySelector('.page-art img').src = mine.pageImage(p.text, p.seed, p.noCast);
      card.querySelector('.page-found').innerHTML = foundHTML(p.text, p.noCast);
    } else if (btn.dataset.act === 'del') {
      stopDictation();
      state.pages.splice(n, 1);
      saveDraft();
      drawPages();
    } else if (btn.dataset.act === 'dictate') {
      dictate(card, btn);
    }
  });

  app.querySelector('#add-page').addEventListener('click', () => {
    if (state.pages.length >= MAX_PAGES) { toast(`장면은 ${MAX_PAGES}개까지 만들 수 있어요`); return; }
    stopDictation();
    state.pages.push({ text: '', seed: 0 });
    saveDraft();
    drawPages();
    pagesEl.lastElementChild?.querySelector('textarea')?.focus();
  });

  app.querySelector('#save').addEventListener('click', () => {
    const pages = state.pages.filter((p) => p.text.trim());
    if (!pages.length) { toast('한 장면 이상 적어 주세요'); return; }
    if (!mine.saveRaw({ ...state, title: state.title.trim() || '내가 지은 이야기', pages })) {
      toast('저장하지 못했어요. 휴대폰 저장 공간을 확인해 주세요');
      return;
    }
    if (!editId) { local.set(DRAFT, null); track('create', { n: pages.length }); }
    toast('이야기를 저장했어요');
    location.hash = editId ? `#/story/${state.id}` : `#/record/${state.id}/0`;
  });

  app.querySelector('#delete')?.addEventListener('click', () => sheet({
    icon: '🗑️',
    title: '이 이야기를 지울까요?',
    body: '이야기와 녹음이 이 휴대폰에서 지워져요.<br>지운 뒤에는 되살릴 수 없어요.',
    secondary: '취소',
    primary: '지우기',
    onPrimary: async () => {
      mine.removeRaw(editId);
      const keys = await db.keys().catch(() => []);
      await Promise.all(keys.filter((k) => k.startsWith(`${editId}/`)).map((k) => db.remove(k)));
      toast('이야기를 지웠어요');
      location.hash = '#/';
    },
  }));
}

/* ---------- 그림책: 미리보기 · PDF · QR ---------- */
// A5 가로(210×148mm) 한 쪽에 그림 + 글 + QR. 브라우저 인쇄로 PDF 를 만들어요.
const qrSvg = (url) => {
  const q = qrcode(0, 'M');
  q.addData(url);
  q.make();
  return q.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
};
const appBase = () => `${location.origin}${location.pathname}`;
const listenUrl = (shareId, n) => `${appBase()}#/s/${shareId}${n ? `/${n}` : ''}`;
const todayKo = () => new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

function bookPagesHTML(s, { shareId, reader, kid, date = todayKo() }) {
  const pages = pagesOf(s, reader === '할아버지' ? 'grandpa' : 'grandma', kid);
  const to = toOf(kid);
  const qr = (n, label) => (shareId
    ? `<div class="bp-qr">${qrSvg(listenUrl(shareId, n))}<span>${label}</span></div>`
    : '');
  const cover = `
    <section class="book-page book-cover">
      <img class="bc-img" src="${esc(s.coverImage || pages[1].image)}" alt="">
      <div class="bc-band">
        <p class="bc-eyebrow">${reader}가 ${esc(to)} 들려주는</p>
        <h1 class="bc-title">${esc(s.title)}</h1>
        <p class="bc-date">${date}</p>
      </div>
    </section>`;
  const letter = `
    <section class="book-page book-letter">
      <img class="bl-img" src="img/intro.svg" alt="">
      <div class="bl-text">
        <p class="bl-eyebrow">💌 ${reader}의 인사</p>
        <p>이 책에는 ${reader}의 목소리가 담겨 있어요.<br>QR코드를 휴대폰 카메라로 찍으면<br>그 쪽을 ${reader} 목소리로 들을 수 있어요.</p>
        ${qr(0, `${reader}의 인사 듣기`)}
      </div>
    </section>`;
  const body = pages.slice(1).map((p, k) => `
    <section class="book-page">
      <div class="bp-art"><img src="${esc(p.image)}" alt=""></div>
      <div class="bp-text">
        <p>${esc(p.text)}</p>
        ${qr(k + 1, `찍으면 ${reader}<br>목소리로 들어요`)}
      </div>
      <span class="bp-num">${k + 1}</span>
    </section>`).join('');
  const back = `
    <section class="book-page book-back">
      <div>
        <p class="bb-text">이 책은 ${reader}가 ${esc(to)}<br>직접 읽어 준 목소리 그림책이에요.</p>
        ${shareId ? `<div class="bb-qr">${qrSvg(listenUrl(shareId, 0))}<span>처음부터 끝까지 듣기</span></div>` : ''}
      </div>
      <p class="bb-brand"><img src="icons/icon.svg" alt="" width="28" height="28">들려줄게</p>
    </section>`;
  return cover + letter + body + back;
}

async function bookView(id) {
  const s = getStory(id);
  if (!s) return notFound();
  track('book', { story: id });
  const { recorded, latest, total } = await recordingsOf(s);
  const done = recorded.length === total;
  let shareId = shareEnabled() && done ? savedShareId(s, latest) : null;

  render(`
    <div class="no-print">${topbar({ back: `#/story/${id}`, title: '그림책 미리보기' })}</div>
    <div class="book-notice no-print" id="notice"></div>
    <div class="book" id="book"></div>
    <div class="cta-bar no-print">
      <button class="btn btn-secondary" id="pdf">PDF로 저장</button>
      <a class="btn btn-primary grow" href="#/order/${id}">인쇄된 책 주문하기</a>
    </div>
  `, 'screen-book');

  const book = app.querySelector('#book');
  const notice = app.querySelector('#notice');
  const draw = () => {
    book.innerHTML = bookPagesHTML(s, { shareId, reader: who(), kid: kidName() });
    notice.innerHTML = shareId
      ? `<p>📱 쪽마다 <b>QR코드</b>가 들어 있어요. 휴대폰 카메라로 찍으면 그 쪽을 ${who()} 목소리로 들을 수 있어요.</p>`
      : !done
        ? `<p>🎙️ 녹음을 다 마치면 쪽마다 <b>QR코드</b>가 들어가요. (${recorded.length}/${total}쪽 녹음)</p>`
        : !shareEnabled()
          ? '<p>🔌 공유 서버를 연결하면 쪽마다 QR코드를 넣을 수 있어요.</p>'
          : `<p>📱 녹음을 올리면 쪽마다 <b>QR코드</b>가 들어가요.</p><button class="btn btn-secondary full" id="make-qr">QR코드 넣기</button>`;
    notice.querySelector('#make-qr')?.addEventListener('click', async () => {
      const got = await uploadWithProgress(s, recorded);
      if (got) { shareId = got; draw(); toast('QR코드를 넣었어요'); }
    });
  };
  draw();
  app.querySelector('#pdf').addEventListener('click', () => {
    toast('인쇄 화면에서 ‘PDF로 저장’을 골라 주세요');
    setTimeout(() => window.print(), 400);
  });
}

// 주문받은 책을 인쇄용으로 펼쳐요 (공유 ID 로 누구나 같은 책을 만들 수 있어요).
async function printView(shareId) {
  render('<div class="book" id="book"><div class="loading"><span class="spinner"></span></div></div>', 'screen-book');
  const loaded = await loadShared(shareId);
  const book = app.querySelector('#book');
  if (!book) return;
  if (!loaded) { book.innerHTML = '<p class="sub">책을 불러오지 못했어요.</p>'; return; }
  const { manifest, s } = loaded;
  book.innerHTML = bookPagesHTML(s, {
    shareId,
    reader: whoOf(manifest.role),
    kid: (manifest.kid || '').trim(),
    date: new Date(manifest.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
  });
}

/* ---------- 결제 ---------- */
async function checkout(order) {
  if (!payEnabled()) {
    sheet({
      icon: '💳',
      title: '결제가 아직 연결되지 않았어요',
      body: '토스페이먼츠 키와 주문 서버를 연결하면<br>여기서 바로 결제할 수 있어요.<br>(설정 방법: SETUP-결제.md)',
    });
    return;
  }
  local.set('pendingOrder', { kind: order.kind || 'book', shareId: order.shareId, storyId: order.storyId, title: order.title, qty: order.qty });
  track('order', { story: order.storyId, n: order.qty, meta: { kind: order.kind || 'book' } });
  try {
    await startPayment(order, { successUrl: `${appBase()}?pay=success`, failUrl: `${appBase()}?pay=fail` });
  } catch (e) {
    if (e.code === 'USER_CANCEL' || e.code === 'PAY_PROCESS_CANCELED') { toast('결제를 취소했어요'); return; }
    sheet({ icon: '😢', title: '결제를 시작하지 못했어요', body: `${esc(e.message || '잠시 뒤 다시 시도해 주세요.')}` });
  }
}

// 토스 결제창에서 돌아왔을 때 (?pay=success&paymentKey=…&orderId=…&amount=…)
async function payReturnView() {
  const q = new URLSearchParams(location.search);
  // 보관 결제는 받은 가족(처음 설정 없음)이 하니까, 끝나면 그 녹음 화면으로 돌아가요.
  const pending = local.get('pendingOrder') || {};
  const home = pending.kind === 'keep' && pending.shareId ? `#/keep/${pending.shareId}` : '#/';
  history.replaceState(null, '', `${appBase()}${home}`);
  if (q.get('pay') !== 'success') {
    render(`
      ${topbar({ back: home })}
      <div class="celebrate"><div class="celebrate-badge">😢</div>
        <h1 class="title-lg">결제가 완료되지 않았어요</h1>
        <p class="sub">${esc(q.get('message') || '결제를 취소했거나 문제가 생겼어요.')}</p></div>
      <div class="cta-bar"><a class="btn btn-primary" href="${home}">돌아가기</a></div>`);
    return;
  }
  render(`<div class="loading"><span class="spinner"></span><p class="sub">결제를 확인하고 있어요</p></div>`);
  try {
    const { order } = await confirmPayment({ paymentKey: q.get('paymentKey'), orderId: q.get('orderId'), amount: q.get('amount') });
    local.set('pendingOrder', null);
    // 복지관처럼 여럿이 쓰는 기기에 이름·전화·주소가 남지 않게 지워요.
    local.set('orderForm', null);
    track('paid', { n: order.qty, meta: { kind: order.kind || 'book' } });
    if (order.kind === 'keep') {
      const until = new Date();
      until.setFullYear(until.getFullYear() + KEEP_YEARS);
      render(`
        ${topbar({ back: `#/s/${order.shareId}` })}
        <div class="celebrate">
          <div class="celebrate-badge">🔒</div>
          <h1 class="title-xl">${KEEP_YEARS}년 동안 간직할게요</h1>
          <p class="sub">${dateKo(until)}까지 이 링크와 그림책 QR이 그대로 열려요.</p>
        </div>
        <div class="order-sum">
          <div><span>주문 번호</span><b>${esc(order.orderId)}</b></div>
          <div class="total"><span>결제 금액</span><b>${won(order.amount)}</b></div>
        </div>
        <div class="cta-bar">
          ${order.receiptUrl ? `<a class="btn btn-secondary" href="${esc(order.receiptUrl)}" target="_blank" rel="noopener">영수증</a>` : ''}
          <a class="btn btn-primary grow" href="#/s/${esc(order.shareId)}">다시 듣기</a>
        </div>`);
      return;
    }
    render(`
      ${topbar({ back: '#/' })}
      <div class="celebrate">
        <div class="celebrate-badge">🎁</div>
        <h1 class="title-xl">주문이 완료됐어요</h1>
        <p class="sub">‘${esc(order.title)}’ 그림책 ${order.qty}권을<br>${order.gift ? '선물 포장해서 ' : ''}정성껏 만들어 7~10일 안에 보내드릴게요.</p>
      </div>
      <div class="order-sum">
        <div><span>주문 번호</span><b>${esc(order.orderId)}</b></div>
        <div class="total"><span>결제 금액</span><b>${won(order.amount)}</b></div>
      </div>
      <div class="cta-bar">
        ${order.receiptUrl ? `<a class="btn btn-secondary" href="${esc(order.receiptUrl)}" target="_blank" rel="noopener">영수증</a>` : ''}
        <a class="btn btn-primary grow" href="#/">처음으로</a>
      </div>`);
  } catch (e) {
    render(`
      ${topbar({ back: '#/' })}
      <div class="celebrate"><div class="celebrate-badge">⚠️</div>
        <h1 class="title-lg">결제를 확인하지 못했어요</h1>
        <p class="sub">${esc(e.message || '')}<br>돈이 빠져나갔다면 자동으로 취소돼요. 다시 주문해 주세요.</p></div>
      <div class="cta-bar"><a class="btn btn-primary" href="${home}">돌아가기</a></div>`);
  }
}

/* ---------- 그림책 주문 ---------- */
const won = (n) => `${n.toLocaleString('ko-KR')}원`;

async function orderView(id) {
  const s = getStory(id);
  if (!s) return notFound();
  const form = { qty: 1, gift: false, card: '', name: '', phone: '', addr: '', memo: '', ...(local.get('orderForm') || {}) };
  Object.assign(form, { qty: 1, gift: false, card: '' });
  render(`
    ${topbar({ back: `#/book/${id}`, title: '그림책 주문' })}
    <div class="order-item">
      ${coverHTML(s)}
      <div>
        <div class="story-card-title">${esc(s.title)}</div>
        <div class="story-card-meta">A5 가로 · 양장 · ${s.pages.length + 3}쪽 · QR코드</div>
        <div class="order-price">${won(PRICE_FIRST)}</div>
        <div class="order-deal">두 번째 권부터 ${won(PRICE_MORE)}</div>
      </div>
    </div>
    <label class="label" for="o-name">받는 분</label>
    <input id="o-name" class="input" autocomplete="name" value="${esc(form.name)}" placeholder="이름">
    <label class="label" for="o-phone">휴대폰 번호</label>
    <input id="o-phone" class="input" inputmode="tel" autocomplete="tel" value="${esc(form.phone)}" placeholder="010-0000-0000">
    <label class="label" for="o-addr">받으실 주소</label>
    <textarea id="o-addr" class="input textarea" rows="2" autocomplete="street-address" placeholder="도로명 주소와 동·호수">${esc(form.addr)}</textarea>
    <span class="label">권수</span>
    <div class="stepper"><button data-q="-1" aria-label="한 권 빼기">−</button><b id="qty">1권</b><button data-q="1" aria-label="한 권 더하기">+</button></div>
    <p class="order-hint" id="qty-hint">아들네·딸네, 친가·외가에 한 권씩 보내면 좋아요. 두 번째 권부터 ${won(PRICE_FIRST - PRICE_MORE)}씩 싸져요.</p>
    <label class="gift-card">
      <input type="checkbox" id="o-gift">
      <span class="gift-emoji">🎁</span>
      <span><b>선물 포장 + 카드</b><small>리본 포장에 손글씨 느낌 카드를 넣어 드려요 · 권마다 ${won(GIFT_PRICE)}</small></span>
    </label>
    <div id="card-box" hidden>
      <label class="label" for="o-card">카드에 적을 말 <span class="opt">선택</span></label>
      <textarea id="o-card" class="input textarea" rows="2" maxlength="80" placeholder="예) 사랑하는 하은아, 할머니 목소리 들으며 꿈나라 가렴"></textarea>
    </div>
    <label class="label" for="o-memo">남기실 말 <span class="opt">선택</span></label>
    <input id="o-memo" class="input" value="${esc(form.memo)}" placeholder="예) 손주 돌잔치 선물이에요">
    <div class="order-sum">
      <div><span>책 값</span><b id="sum-books"></b></div>
      <div id="sum-saved-row" hidden><span>여러 권 할인</span><b id="sum-saved"></b></div>
      <div id="sum-wrap-row" hidden><span>선물 포장</span><b id="sum-wrap"></b></div>
      <div><span>배송비</span><b>무료</b></div>
      <div class="total"><span>결제 금액</span><b id="sum-total"></b></div>
    </div>
    <p class="order-hint">🔒 그림책을 주문하면 녹음도 ${KEEP_YEARS}년 동안 보관돼서, QR을 찍으면 언제든 그 목소리가 나와요.</p>
    <label class="check"><input type="checkbox" id="o-agree">
      <span>주문 제작 상품이라 제작이 시작되면 취소할 수 없어요(<a href="#/policy/refund">환불 규정</a>). 배송을 위해 이름·연락처·주소를 모으는 데 동의해요(<a href="#/policy/privacy">개인정보처리방침</a>).</span></label>
    <div class="cta-bar"><button class="btn btn-primary" id="pay"></button></div>
  `, 'screen-order');

  const $ = (q) => app.querySelector(q);
  const sync = () => {
    const p = priceOf(form);
    $('#qty').textContent = `${form.qty}권`;
    $('#sum-books').textContent = won(PRICE_FIRST * form.qty);
    $('#sum-saved-row').hidden = !p.saved;
    $('#sum-saved').textContent = `−${won(p.saved)}`;
    $('#sum-wrap-row').hidden = !form.gift;
    $('#sum-wrap').textContent = won(p.wrap);
    $('#sum-total').textContent = won(p.total);
    $('#pay').textContent = `${won(p.total)} 결제하기`;
  };
  sync();
  app.querySelector('.stepper').addEventListener('click', (e) => {
    const d = Number(e.target.closest('[data-q]')?.dataset.q || 0);
    form.qty = Math.min(MAX_QTY, Math.max(1, form.qty + d));
    sync();
  });
  $('#o-gift').addEventListener('change', (e) => {
    form.gift = e.target.checked;
    $('#card-box').hidden = !form.gift;
    sync();
  });

  $('#pay').addEventListener('click', async () => {
    Object.assign(form, {
      name: $('#o-name').value.trim(),
      phone: $('#o-phone').value.trim(),
      addr: $('#o-addr').value.trim(),
      memo: $('#o-memo').value.trim(),
      card: form.gift ? $('#o-card').value.trim() : '',
    });
    local.set('orderForm', { name: form.name, phone: form.phone, addr: form.addr });
    if (!form.name || !/^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(form.phone) || form.addr.length < 6) {
      toast('받는 분, 휴대폰 번호, 주소를 확인해 주세요');
      return;
    }
    if (!$('#o-agree').checked) { toast('주문 내용에 동의해 주세요'); return; }
    if (!shareEnabled()) { noServerSheet(); return; }
    // 인쇄소가 같은 책(그림·글·QR)을 만들 수 있도록 녹음을 먼저 올려 둬요.
    const { recorded, latest, total } = await recordingsOf(s);
    if (recorded.length < total) {
      toast(`녹음을 다 마친 뒤에 주문할 수 있어요 (${recorded.length}/${total}쪽)`);
      return;
    }
    const shareId = savedShareId(s, latest) || await uploadWithProgress(s, recorded);
    if (!shareId) return;
    await checkout({
      shareId,
      storyId: s.id,
      title: s.title,
      qty: form.qty,
      gift: form.gift,
      card: form.card,
      amount: priceOf(form).total,
      name: form.name,
      phone: form.phone,
      addr: form.addr,
      memo: form.memo,
    });
  });
}

/* ---------- 약관 · 개인정보처리방침 · 환불 규정 ---------- */
const footerHTML = () => `
  <footer class="footer">
    <nav>
      <a href="#/about">들려줄게 소개</a>
      <a href="#/policy/terms">이용약관</a>
      <a href="#/policy/privacy"><b>개인정보처리방침</b></a>
      <a href="#/policy/refund">환불 규정</a>
    </nav>
    <p>${esc(BUSINESS.name)} · 대표 ${esc(BUSINESS.owner)} · 사업자등록번호 ${esc(BUSINESS.regNo)}<br>
      통신판매업 ${esc(BUSINESS.mailOrderNo)} · ${esc(BUSINESS.address)}<br>문의 ${esc(BUSINESS.email)}</p>
  </footer>`;

function policyView(doc) {
  const d = POLICIES[doc];
  if (!d) return notFound();
  render(`
    ${topbar({ back: history.length > 1 ? 'javascript:history.back()' : '#/', title: d.title })}
    <article class="policy">
      <h1 class="title-lg">${d.title}</h1>
      <p class="sub">시행일 ${POLICY_UPDATED}</p>
      ${d.sections.map(([h, body]) => `<h2>${esc(h)}</h2><p>${esc(body).replace(/\n/g, '<br>')}</p>`).join('')}
    </article>
    ${footerHTML()}
  `);
}

// 부모(자녀) 세대용 소개. 이 화면을 본 자녀가 할머니·할아버지께 앱 링크를 보내요.
function aboutView() {
  const url = appBase();
  track('about');
  const msg = '엄마(아빠) 목소리로 손주에게 동화 읽어 주세요 💛 링크를 누르고 동화를 골라 녹음만 하면 돼요.';
  const steps = [
    ['📱', '링크 하나로 시작', '앱 설치나 가입 없이 링크만 열면 돼요. 글씨가 크고 버튼이 단순해요.'],
    ['🎙️', '쪽마다 녹음', '그림과 글을 보며 한 쪽씩 읽어요. 얼굴 영상도 함께 담을 수 있어요.'],
    ['💌', '아이에게 도착', '다 읽으면 카톡으로 링크가 와요. 아이는 그림을 보며 할머니 목소리로 들어요.'],
  ];
  const samples = ['sun-moon-4', 'rabbit-turtle-6', 'heungbu-8'];
  render(`
    ${topbar({ back: profile ? '#/' : '', title: '들려줄게 소개' })}
    <section class="about">
      <div class="about-hero">
        <div class="scene scene-xl"><img src="img/intro.svg" alt=""></div>
        <h1 class="title-xl">아이가 잠들기 전,<br>할머니 목소리로<br>동화를 들려주세요</h1>
        <p class="sub">멀리 사는 할머니·할아버지가 직접 읽어 주신 동화를 아이가 언제든 들을 수 있어요.</p>
      </div>

      <h2 class="section-label">이렇게 써요</h2>
      <ol class="about-steps">
        ${steps.map(([e, h, p], i) => `<li><span class="about-step-emoji">${e}</span><div><b>${i + 1}. ${h}</b><p>${p}</p></div></li>`).join('')}
      </ol>

      <h2 class="section-label">동화 13편, 직접 그린 그림</h2>
      <div class="about-gallery">
        ${samples.map((n) => `<div class="scene"><img src="img/${n}.svg" alt="" loading="lazy"></div>`).join('')}
      </div>
      <p class="about-note">해님 달님, 흥부와 놀부, 토끼와 거북이… 저작권이 끝난 옛이야기를 다시 쓰고 그림은 모두 직접 그렸어요. 할머니가 지어낸 이야기도 그림이 저절로 그려져요.</p>

      <div class="about-book">
        <div class="about-book-emoji">📖</div>
        <div>
          <b>목소리 그림책으로 간직하기</b>
          <p>녹음한 동화를 A5 그림책으로 만들어 드려요. 쪽마다 있는 QR을 찍으면 그 쪽부터 할머니 목소리가 나와요. 한 권 ${won(PRICE_FIRST)}, 두 번째 권부터 ${won(PRICE_MORE)} · 선물 포장도 돼요. 배송비 무료.</p>
        </div>
      </div>

      <h2 class="section-label">걱정되는 것들</h2>
      <div class="about-faq">
        <details><summary>녹음은 어디에 저장되나요?</summary><p>처음에는 할머니 휴대폰에만 있어요. ‘보내기’를 누를 때만 서버에 올라가고, 링크를 아는 가족만 들을 수 있어요.</p></details>
        <details><summary>아이 정보는 안전한가요?</summary><p>손주 이름은 넣지 않아도 돼요. 서버에 올리기 전에 보호자 동의를 확인하고, 지워 달라고 하시면 바로 지워 드려요. <a href="#/policy/privacy">개인정보처리방침</a></p></details>
        <details><summary>돈이 드나요?</summary><p>녹음하고 링크로 보내는 건 무료예요. 그림책을 주문할 때만 비용이 들어요.</p></details>
      </div>
    </section>
    ${footerHTML()}
    <div class="cta-bar">
      <button class="btn btn-secondary" id="try">먼저 해 보기</button>
      <button class="btn btn-primary" id="send-parents">부모님께 보내기</button>
    </div>
  `);
  app.querySelector('#try').addEventListener('click', () => { location.hash = profile ? '#/' : '#/welcome'; });
  // navigator.share는 누른 그 순간에 불러야 열려요.
  app.querySelector('#send-parents').addEventListener('click', () => {
    track('send_parents');
    if (navigator.share) navigator.share({ title: '들려줄게', text: msg, url }).catch(() => {});
    else copyText(`${msg}\n${url}`);
  });
}

/* ---------- 녹음 오래 간직하기 (10년 보관) ---------- */
const dateKo = (d) => new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
const freeKeepUntil = (manifest) => (manifest?.createdAt ? new Date(manifest.createdAt).getTime() + FREE_KEEP_DAYS * 864e5 : null);

async function keepView(shareId) {
  render(`
    ${topbar({ back: `#/s/${shareId}`, title: '오래 간직하기' })}
    <div class="loading"><span class="spinner"></span></div>
  `);
  const loaded = await loadShared(shareId);
  if (!loaded?.s) return notFound();
  const { manifest, s } = loaded;
  const reader = whoOf(manifest.role);
  const freeUntil = freeKeepUntil(manifest);
  const until = await keepStatus(shareId);
  const kept = until && (!freeUntil || new Date(until) > freeUntil);
  track('keep_view', { story: s.id, shareId });
  render(`
    ${topbar({ back: `#/s/${shareId}`, title: '오래 간직하기' })}
    <div class="keep-hero">
      ${coverHTML(s, 'cover-xl')}
      <h1 class="title-lg">${esc(reader)} 목소리를<br>${kept ? '오래 간직하고 있어요' : '오래 간직하세요'}</h1>
      <p class="sub">‘${esc(s.title)}’ · ${manifest.pages.length}쪽${manifest.pages.some((p) => isVideo(p.type)) ? ' · 얼굴 영상' : ''}</p>
    </div>
    <div class="keep-status ${kept ? 'on' : ''}">
      <span>${kept ? '🔒' : '⏳'}</span>
      <p>${kept ? `<b>${dateKo(until)}</b>까지 보관해요.` : freeUntil ? `지금은 무료로 <b>${dateKo(freeUntil)}</b>까지 보관해요. 그 뒤에는 지워져요.` : '무료로 1년 동안 보관해요.'}</p>
    </div>
    ${kept ? '' : `
    <ul class="keep-points">
      <li><b>${KEEP_YEARS}년 동안</b> 이 링크와 그림책 QR이 그대로 열려요</li>
      <li>손주가 자라서 다시 들어도, 할머니 목소리 그대로예요</li>
      <li>그림책을 주문하면 ${KEEP_YEARS}년 보관이 <b>함께</b> 돼요</li>
    </ul>
    <p class="keep-fine">한 번만 결제해요 (자동 결제 없음). 결제 후 7일 안에는 전액 환불해 드려요. <a href="#/policy/refund">환불 규정</a></p>`}
    <div class="cta-bar">
      ${kept ? `<a class="btn btn-primary" href="#/s/${shareId}">다시 듣기</a>`
        : `<button class="btn btn-primary" id="keep-pay">${won(KEEP_PRICE)}으로 ${KEEP_YEARS}년 간직하기</button>`}
    </div>
  `, 'screen-keep');
  app.querySelector('#keep-pay')?.addEventListener('click', async () => {
    if (!payEnabled()) { toast('결제가 아직 연결되지 않았어요'); return; }
    await checkout({ kind: 'keep', shareId, storyId: s.id, title: s.title, qty: 1, amount: KEEP_PRICE });
  });
}

/* ---------- 기관(복지관·경로당) 안내지: A4 한 장, 큰 글씨 + QR ---------- */
function flyerView(org) {
  const url = `${appBase()}?org=${org}`;
  const steps = [
    ['📱', '휴대폰 카메라로 아래 QR을 찍어요', '앱을 깔지 않아도 돼요. 가입도 없어요.'],
    ['📖', '동화를 하나 골라요', '해님 달님, 흥부와 놀부… 13편이 있어요. 직접 지은 이야기도 돼요.'],
    ['🎙️', '그림을 보며 한 쪽씩 읽어요', '빨간 버튼을 누르고 읽은 뒤, 한 번 더 누르면 끝이에요.'],
    ['💌', '손주에게 보내요', '카톡으로 링크가 가요. 손주는 그림을 보며 할머니·할아버지 목소리로 들어요.'],
  ];
  render(`
    <div class="no-print flyer-tools">
      <p class="sub">A4 세로로 인쇄해서 나눠 주세요. 기관 코드: <b>${esc(org)}</b></p>
      <button class="btn btn-primary" id="flyer-print">인쇄하기 · PDF로 저장</button>
    </div>
    <article class="flyer">
      <p class="flyer-place">________________ 와 함께하는</p>
      <h1>손주에게<br><em>내 목소리로</em> 동화를 들려주세요</h1>
      <ol>${steps.map(([e, h, p]) => `<li><span>${e}</span><div><b>${h}</b><p>${p}</p></div></li>`).join('')}</ol>
      <div class="flyer-qr">${qrSvg(url)}<p>여기를 휴대폰 카메라로 찍어 주세요</p></div>
      <p class="flyer-foot">궁금한 점은 담당 선생님께 물어보세요 · 담당: ____________ ☎ ____________</p>
    </article>
  `, 'screen-flyer');
  // 이 화면에서만 A4 세로로 인쇄해요. (그림책은 A5 가로)
  const page = document.createElement('style');
  page.textContent = '@media print { @page { size: A4 portrait; margin: 0; } }';
  document.head.append(page);
  onDispose(() => page.remove());
  app.querySelector('#flyer-print').addEventListener('click', () => window.print());
}

function notFound() {
  render(`
    ${topbar({ back: '#/' })}
    <div class="celebrate">
      <div class="celebrate-badge">🤔</div>
      <h1 class="title-lg">페이지를 찾을 수 없어요</h1>
    </div>
    <div class="cta-bar"><a class="btn btn-primary" href="#/">처음으로</a></div>
  `);
}

/* ---------- 라우터 ---------- */
const routes = [
  [/^#\/?$/, homeView],
  [/^#\/welcome$/, welcomeView],
  [/^#\/story\/([\w-]+)$/, storyView],
  [/^#\/record\/([\w-]+)\/(\d+)$/, recordView],
  [/^#\/done\/([\w-]+)$/, doneView],
  [/^#\/listen\/([\w-]+)$/, listenView],
  [/^#\/s\/([a-z0-9]+)(?:\/(\d+))?$/, sharedView],
  [/^#\/book\/([\w-]+)$/, bookView],
  [/^#\/print\/([a-z0-9]+)$/, printView],
  [/^#\/order\/([\w-]+)$/, orderView],
  [/^#\/policy\/(terms|privacy|refund)$/, policyView],
  [/^#\/about$/, aboutView],
  [/^#\/keep\/([a-z0-9]{12})$/, keepView],
  [/^#\/flyer\/([a-z0-9-]{2,20})$/, flyerView],
  [/^#\/new$/, () => editorView()],
  [/^#\/edit\/([\w-]+)$/, editorView],
];

async function route() {
  dispose();
  stopAudio();
  if (/[?&]pay=/.test(location.search)) { await payReturnView(); return; }
  const hash = location.hash || '#/';
  // 공유 링크(#/s/…)는 처음 설정 없이 바로 열려요.
  const open = ['#/s/', '#/print/', '#/policy/', '#/about', '#/keep/', '#/flyer/'].some((p) => hash.startsWith(p));
  if (!profile && hash !== '#/welcome' && !open) {
    location.replace('#/welcome');
    return;
  }
  for (const [re, view] of routes) {
    const m = hash.match(re);
    if (m) {
      await view(...m.slice(1));
      window.scrollTo(0, 0);
      return;
    }
  }
  notFound();
}

// 기관 안내지 QR (…/?org=gangnam-welfare) 로 들어오면 기관 코드를 기억해요. 통계를 기관별로 세는 데만 써요.
{
  const q = new URLSearchParams(location.search);
  const org = (q.get('org') || '').toLowerCase();
  if (/^[a-z0-9-]{2,20}$/.test(org)) local.set('org', org);
  if (q.has('org')) {
    q.delete('org');
    history.replaceState(null, '', `${location.pathname}${q.toString() ? `?${q}` : ''}${location.hash}`);
  }
}
window.addEventListener('hashchange', route);
route();
trackOpen();

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
