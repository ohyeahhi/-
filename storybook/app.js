import { STORIES, getStory as getBuiltin } from './stories.js';
import * as db from './db.js';
import { shareEnabled, uploadShare, fetchShare, publicUrl } from './share.js';
import * as mine from './mystories.js';

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

function sheet({ icon, title, body, primary = '확인', secondary, onPrimary, onSecondary, actions = true }) {
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

async function shareStory(id) {
  const story = getStory(id);
  if (!shareEnabled()) {
    sheet({
      icon: '🔌',
      title: '공유 서버가 아직 연결되지 않았어요',
      body: '<code>config.js</code>에 Supabase 주소와 키를 넣으면<br>가족에게 링크를 보낼 수 있어요.<br>(설정 방법: SETUP-공유.md)',
    });
    return;
  }
  const pages = pagesOf(story);
  const records = await Promise.all(pages.map((_, i) => db.getRecord(keyOf(id, i))));
  const recorded = records.map((r, i) => r && { i, ...r }).filter(Boolean);
  const latest = Math.max(...recorded.map((r) => r.at || 0));
  const saved = local.get(shareKey)?.[id];
  // 올린 뒤로 다시 녹음한 쪽이 없으면 예전 링크를 그대로 써요.
  if (saved && saved.at >= latest) { sendLink(story, saved.id); return; }

  sheet({
    icon: '☁️',
    title: `${esc(kidTo())} 보낼 링크를 만들까요?`,
    body: '녹음을 서버에 올리고 링크를 만들어요.<br>링크를 아는 사람은 누구나 들을 수 있으니<br>가족에게만 보내주세요.',
    secondary: '취소',
    primary: '링크 만들기',
    onPrimary: () => uploadAndSend(story, recorded),
  });
}

async function uploadAndSend(story, recorded) {
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
        ...(story.custom ? { custom: { title: story.title, pages: story.pages.map(({ text, seed }) => ({ text, seed })) } } : {}),
      },
      recorded.map(({ i, blob }) => ({ i, blob })),
      (n, t) => { bar.style.width = `${(n / t) * 100}%`; label.textContent = `${n} / ${t}`; },
    );
    local.set(shareKey, { ...(local.get(shareKey) || {}), [story.id]: { id: shareId, at: Date.now() } });
    close();
    setTimeout(() => sendLink(story, shareId), 280);
  } catch {
    close();
    setTimeout(() => sheet({
      icon: '📶',
      title: '올리지 못했어요',
      body: '인터넷 연결을 확인하고 다시 시도해 주세요.',
      secondary: '닫기',
      primary: '다시 시도',
      onPrimary: () => uploadAndSend(story, recorded),
    }), 280);
  }
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
      ${s.custom ? `<a class="chip chip-edit" href="#/edit/${id}">${I.edit}이야기 고치기</a>` : ''}
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
      right: `<button class="chip" id="guide">${I.speaker}안내 듣기</button>`,
    })}
    <div class="stepbar"><span style="width:${((i + 1) / pages.length) * 100}%"></span></div>
    ${inKakao ? `
      <div class="notice">
        <p>카카오톡 안에서는 녹음이 안 될 수 있어요.</p>
        <button class="notice-btn" id="external">다른 브라우저로 열기</button>
      </div>` : ''}
    <div class="scene-wrap">
      ${sceneHTML(p)}
      <button class="cam-toggle" id="cam-toggle" aria-pressed="false"></button>
      <div class="pip pip-self" id="pip" hidden></div>
    </div>
    <p class="read-text">${esc(p.text)}</p>
    ${p.intro ? `<div class="hint-card">${esc(p.hint)}</div>` : ''}
    <div class="rec-dock" id="dock" aria-live="polite"></div>
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
    camBtn.innerHTML = `${on ? I.cam : I.camOff}<span>${on ? '얼굴 함께 녹화 중' : '얼굴도 함께 담기'}</span>`;
    camBtn.setAttribute('aria-pressed', String(on));
    camBtn.classList.toggle('on', on);
  };
  const showPreview = () => {
    if (!cam) return;
    parkPlayer();
    preview ??= Object.assign(document.createElement('video'), { muted: true, autoplay: true, playsInline: true });
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
  camBtn.addEventListener('click', () => {
    if (recorder.active) { toast('녹음이 끝난 뒤에 바꿀 수 있어요'); return; }
    if (cam) camOff(); else camOn();
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
    .map((p, i) => ({ ...p, rec: recs[i] }))
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
async function sharedView(shareId) {
  render(`
    ${topbar()}
    <div class="listen" id="stage"><div class="loading"><span class="spinner"></span><p class="sub">동화를 불러오고 있어요</p></div></div>
  `, 'screen-listen');
  let manifest;
  try {
    manifest = await fetchShare(shareId);
  } catch {
    manifest = null;
  }
  // 직접 지은 이야기는 글이 목록에 함께 들어 있어서, 받은 쪽에서 같은 그림을 다시 만들어요.
  const s = manifest && (manifest.custom
    ? mine.toStory({ id: manifest.storyId, ...manifest.custom })
    : getStory(manifest.storyId));
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
      video: isVideo(f.type),
      load: async () => { setSource(publicUrl(shareId, f.file)); return true; },
    }));
  mountPlayer(stage, {
    story: s,
    list,
    reader: whoOf(manifest.role),
    kid: (manifest.kid || '').trim(),
    endExtra: `<a class="btn btn-secondary full" href="#/" data-act="invite">우리 가족도 만들어 보기</a>`,
  });
}

// 듣기 화면: 표지 → 쪽마다 그림 + 목소리 → 끝. 한 쪽이 끝나면 저절로 넘어가요.
function mountPlayer(stage, { story: s, list, reader, kid, endExtra = '' }) {
  let pos = 0;
  let alive = true;
  let advanceTimer = 0;
  onDispose(() => { alive = false; clearTimeout(advanceTimer); stopAudio(); player.onerror = null; });

  const drawStart = () => {
    stage.innerHTML = `
      <div class="listen-start">
        ${coverHTML(s, 'cover-xl')}
        <p class="eyebrow">${reader}가 읽어주는</p>
        <h1 class="title-xl">${esc(s.title)}</h1>
        ${kid ? `<p class="sub">${esc(toOf(kid))}</p>` : ''}
        <button class="play-big" data-act="start" aria-label="듣기 시작">${I.play}</button>
      </div>`;
  };

  const drawPage = () => {
    const p = list[pos];
    stage.innerHTML = `
      <div class="scene-wrap">
        ${sceneHTML(p, 'scene-xl')}
        ${p.video ? `<div class="pip pip-call"><span class="pip-label"><i></i>${reader}</span></div>` : ''}
      </div>
      <p class="listen-text">${p.intro ? `${reader}의 인사 💌` : esc(p.text)}</p>
      <div class="dots">${list.map((_, j) => `<i class="${j === pos ? 'on' : ''}"></i>`).join('')}</div>
      <div class="controls">
        <button class="ctl" data-act="prev" aria-label="앞 쪽" ${pos === 0 ? 'disabled' : ''}>${I.prev}</button>
        <button class="ctl ctl-main" data-act="toggle" aria-label="재생/멈춤">${I.pause}</button>
        <button class="ctl" data-act="next" aria-label="다음 쪽" ${pos === list.length - 1 ? 'disabled' : ''}>${I.next}</button>
      </div>`;
  };

  const drawEnd = () => {
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

  player.onerror = () => {
    if (!alive || !player.getAttribute('src')) return;
    setToggle(false);
    toast('이 쪽 소리를 불러오지 못했어요');
  };

  async function playAt(j) {
    clearTimeout(advanceTimer);
    pos = j;
    drawPage();
    if (!(await list[pos].load()) || !alive) return;
    // 영상통화처럼: 얼굴 영상이 있으면 그림 위 작은 창에서 보여줘요.
    const pip = stage.querySelector('.pip-call');
    if (pip) pip.prepend(player); else parkPlayer();
    player.onended = () => {
      setToggle(false);
      advanceTimer = setTimeout(() => {
        if (!alive) return;
        if (pos < list.length - 1) playAt(pos + 1);
        else drawEnd();
      }, 900);
    };
    try { await player.play(); setToggle(true); } catch { setToggle(false); }
  }

  stage.addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'start' || act === 'again') playAt(0);
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
    <p class="sub">장면마다 두세 문장씩 적으면 그림이 저절로 그려져요. 호랑이·강아지·고양이·집·숲·연못·밤 같은 말을 넣어 보세요.</p>
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
        <div class="page-art"><img alt="" src="${mine.pageImage(p.text, p.seed)}"></div>
        <textarea class="page-text" rows="3" maxlength="200" placeholder="${n === 0
          ? '예) 옛날 옛날, 할머니가 어렸을 때 우리 집에는 누렁이라는 강아지가 있었단다.'
          : '다음 장면을 적어 주세요'}">${esc(p.text)}</textarea>
        <div class="page-tools">
          ${SpeechRec ? `<button class="pill" data-act="dictate">${I.mic}<span>말로 쓰기</span></button>` : ''}
          <button class="pill" data-act="reroll">${I.shuffle}다른 그림</button>
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
      if (img && p) img.src = mine.pageImage(p.text, p.seed);
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
      card.querySelector('.page-art img').src = mine.pageImage(state.pages[n].text, state.pages[n].seed);
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
    if (!editId) local.set(DRAFT, null);
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
  [/^#\/s\/([a-z0-9]+)$/, sharedView],
  [/^#\/new$/, () => editorView()],
  [/^#\/edit\/([\w-]+)$/, editorView],
];

async function route() {
  dispose();
  stopAudio();
  const hash = location.hash || '#/';
  // 공유 링크(#/s/…)는 처음 설정 없이 바로 열려요.
  if (!profile && hash !== '#/welcome' && !hash.startsWith('#/s/')) {
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

window.addEventListener('hashchange', route);
route();

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
