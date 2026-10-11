import { STORIES, getStory } from './stories.js';
import * as db from './db.js';

const app = document.getElementById('app');
const toastEl = document.getElementById('toast');
const MAX_SECONDS = 180;
const inKakao = /KAKAOTALK/i.test(navigator.userAgent);

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
  user: svg('<circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6"/>', 22),
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
const who = () => (profile?.role === 'grandpa' ? '할아버지' : '할머니');
const kidName = () => (profile?.kid || '').trim();
// 하은 → 하은이에게 / 민서 → 민서에게
const kidTo = () => { const n = kidName(); return !n ? '손주에게' : hasBatchim(n) ? `${n}이에게` : `${n}에게`; };
// 하은 → 하은아 / 민서 → 민서야
const kidCall = () => { const n = kidName(); return !n ? '' : hasBatchim(n) ? `${n}아` : `${n}야`; };

// 모든 동화의 첫 쪽은 손주에게 건네는 인사말이에요.
const pagesOf = (story) => [
  {
    intro: true,
    art: '💌',
    text: `${kidTo()} 인사를 건네주세요`,
    hint: `예) ${kidCall() ? `${kidCall()}, ` : ''}${who()}야. 오늘은 ‘${story.title}’ 이야기를 들려줄게.`,
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

/* ---------- 오디오 ---------- */
const player = new Audio();
let playerUrl = null;
async function loadAudio(key) {
  const blob = await db.getBlob(key);
  if (!blob) return false;
  if (playerUrl) URL.revokeObjectURL(playerUrl);
  playerUrl = URL.createObjectURL(blob);
  player.src = playerUrl;
  return true;
}
function stopAudio() {
  player.pause();
  player.onended = null;
}

const recorder = {
  cur: null,
  get active() { return !!this.cur; },
  async start(onLevel) {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      throw Object.assign(new Error('녹음 미지원'), { name: 'Unsupported' });
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    const type = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus']
      .find((t) => MediaRecorder.isTypeSupported?.(t));
    const mr = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
    const chunks = [];
    mr.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    mr.start(250);

    const cur = { stream, mr, chunks, type, raf: 0, ctx: null };
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
      c.mr.onstop = () => resolve(new Blob(c.chunks, { type: c.mr.mimeType || c.type || 'audio/webm' }));
      try { c.mr.stop(); } catch { resolve(null); }
      c.stream.getTracks().forEach((t) => t.stop());
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

function sheet({ icon, title, body, primary = '확인', secondary, onPrimary }) {
  const el = document.createElement('div');
  el.className = 'sheet-backdrop';
  el.innerHTML = `
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
      <div class="sheet-grabber"></div>
      ${icon ? `<div class="sheet-icon">${icon}</div>` : ''}
      <h2 class="sheet-title" id="sheet-title">${title}</h2>
      <p class="sheet-body">${body}</p>
      <div class="sheet-actions">
        ${secondary ? `<button class="btn btn-secondary" data-act="secondary">${secondary}</button>` : ''}
        <button class="btn btn-primary" data-act="primary">${primary}</button>
      </div>
    </div>`;
  document.body.append(el);
  requestAnimationFrame(() => el.classList.add('open'));
  const close = () => { el.classList.remove('open'); setTimeout(() => el.remove(), 260); };
  el.addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (e.target === el || act) close();
    if (act === 'primary') onPrimary?.();
  });
  onDispose(close);
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

const shareSoon = () => sheet({
  icon: '💌',
  title: '가족에게 보내기는 준비 중이에요',
  body: `다음 버전에서는 카카오톡 링크 하나로<br>${esc(kidTo())} 바로 들려줄 수 있어요.<br>지금은 이 휴대폰에서 함께 들어보세요.`,
});

const topbar = ({ back = '', title = '', right = '' } = {}) => `
  <header class="topbar">
    ${back ? `<a class="icon-btn" href="${back}" aria-label="뒤로">${I.back}</a>` : '<span></span>'}
    <div class="topbar-title">${title}</div>
    <div class="topbar-right">${right}</div>
  </header>`;

const tintStyle = (s) => `--c1:${s.tint[0]};--c2:${s.tint[1]}`;

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
  const cards = STORIES.map((s) => {
    const pages = pagesOf(s);
    const n = pages.filter((_, i) => rec.has(keyOf(s.id, i))).length;
    const done = n === pages.length;
    const meta = done
      ? '<span class="badge">완성했어요</span>'
      : n ? `${n}/${pages.length}쪽 녹음했어요` : `${pages.length}쪽 · 약 ${s.minutes}분`;
    return `
      <a class="story-card" href="#/story/${s.id}">
        <div class="cover" style="${tintStyle(s)}"><span>${s.cover}</span></div>
        <div class="story-card-body">
          <div class="story-card-title">${s.title}</div>
          <div class="story-card-meta">${meta}</div>
          ${n && !done ? `<div class="progress"><span style="width:${(n / pages.length) * 100}%"></span></div>` : ''}
        </div>
        <span class="chev">${I.chevron}</span>
      </a>`;
  }).join('');

  render(`
    ${topbar({
      title: '<span class="brand"><img src="icons/icon.svg" alt="" width="24" height="24">들려줄게</span>',
      right: `<a class="icon-btn" href="#/welcome" aria-label="내 정보">${I.user}</a>`,
    })}
    <h1 class="title-xl">${who()} 목소리로<br>어떤 동화를 들려줄까요?</h1>
    <p class="sub">녹음해 두면 ${esc(kidTo())} 언제든 들려줄 수 있어요.</p>
    <h2 class="section-label">전래동화</h2>
    ${cards}
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
      <div class="cover cover-lg" style="${tintStyle(s)}"><span>${s.cover}</span></div>
      <h1 class="title-lg">${s.title}</h1>
      <p class="sub">${s.desc}</p>
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
  app.querySelector('#share')?.addEventListener('click', shareSoon);
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
    <div class="art" style="${tintStyle(s)}"><span>${p.art}</span></div>
    <p class="read-text">${esc(p.text)}</p>
    ${p.intro ? `<div class="hint-card">${esc(p.hint)}</div>` : ''}
    <div class="rec-dock" id="dock" aria-live="polite"></div>
  `, 'screen-record');

  const dock = app.querySelector('#dock');
  let busy = false;
  let timer = 0;
  let bars = [];

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
    try {
      await recorder.start(onLevel);
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
      if (sec >= MAX_SECONDS) stopRec();
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
    toast('목소리를 담았어요');
  }

  async function togglePlay(btn) {
    if (!player.paused) {
      stopAudio();
      btn.innerHTML = `${I.play}<span>들어보기</span>`;
      return;
    }
    if (!(await loadAudio(key))) return;
    player.onended = () => { btn.innerHTML = `${I.play}<span>들어보기</span>`; };
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
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  });

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
      <h1 class="title-xl">‘${s.title}’<br>녹음을 마쳤어요</h1>
      <p class="sub">이제 ${esc(kidTo())} ${who()} 목소리로<br>동화를 들려줄 수 있어요.</p>
    </div>
    <div class="cta-bar">
      <button class="btn btn-secondary" id="share">보내기</button>
      <a class="btn btn-primary grow" href="#/listen/${id}">지금 들려주기</a>
    </div>
  `);
  app.querySelector('#share').addEventListener('click', shareSoon);
}

/* ---------- 화면: 손주가 듣기 ---------- */
async function listenView(id) {
  const s = getStory(id);
  if (!s) return notFound();
  const rec = await recordedSet();
  const list = pagesOf(s)
    .map((p, i) => ({ ...p, i }))
    .filter((p) => rec.has(keyOf(id, p.i)));
  if (!list.length) {
    toast('먼저 녹음해 주세요');
    location.replace(`#/story/${id}`);
    return;
  }

  render(`
    ${topbar({ right: `<a class="icon-btn" href="#/story/${id}" aria-label="닫기">${I.close}</a>` })}
    <div class="listen" id="stage"></div>
  `, 'screen-listen');

  const stage = app.querySelector('#stage');
  let pos = 0;
  let alive = true;
  let advanceTimer = 0;
  onDispose(() => { alive = false; clearTimeout(advanceTimer); stopAudio(); });

  const drawStart = () => {
    stage.innerHTML = `
      <div class="listen-start">
        <div class="cover cover-xl" style="${tintStyle(s)}"><span>${s.cover}</span></div>
        <p class="eyebrow">${who()}가 읽어주는</p>
        <h1 class="title-xl">${s.title}</h1>
        ${kidName() ? `<p class="sub">${esc(kidTo())}</p>` : ''}
        <button class="play-big" data-act="start" aria-label="듣기 시작">${I.play}</button>
      </div>`;
  };

  const drawPage = () => {
    const p = list[pos];
    stage.innerHTML = `
      <div class="art art-xl" style="${tintStyle(s)}"><span>${p.art}</span></div>
      <p class="listen-text">${p.intro ? `${who()}의 인사 💌` : esc(p.text)}</p>
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
        <p class="sub">${who()}, 재미있는 이야기 고마워요!</p>
        <button class="btn btn-primary full" data-act="again">처음부터 다시 듣기</button>
      </div>`;
  };

  const setToggle = (playing) => {
    const b = stage.querySelector('[data-act="toggle"]');
    if (b) b.innerHTML = playing ? I.pause : I.play;
  };

  async function playAt(j) {
    clearTimeout(advanceTimer);
    pos = j;
    drawPage();
    if (!(await loadAudio(keyOf(id, list[pos].i))) || !alive) return;
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
];

async function route() {
  dispose();
  stopAudio();
  const hash = location.hash || '#/';
  if (!profile && hash !== '#/welcome') {
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
