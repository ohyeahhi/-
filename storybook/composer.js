// 지은 이야기의 글을 읽고, 나오는 말(호랑이·강아지·집·숲·밤…)에 맞춰
// img/parts.js 의 부품으로 그림을 조립해요. 서버 없이 휴대폰에서 바로 만들어져요.
// 같은 글 + 같은 seed 면 언제나 같은 그림이 나와요 (공유받은 가족도 똑같이 봐요).
import { STYLE, BG, CHARACTERS, PROPS } from './img/parts.js';

// ---------- 낱말 찾기 ----------
// 한 글자짜리(해·달·물·별)는 다른 말 속에 섞여 있기 쉬워서 두 글자 이상으로 찾아요.
const CHAR_WORDS = [
  ['grandma', ['할머니', '할머님', '할미']],
  ['grandpa', ['할아버지', '할아범', '영감']],
  ['mom', ['엄마', '어머니', '어멈']],
  ['woodcutter', ['아빠', '아버지', '나무꾼', '농부', '아저씨', '총각', '머슴']],
  ['girl', ['손녀', '딸', '소녀', '누나', '언니', '누이', '아가씨']],
  ['boy', ['손자', '아들', '소년', '오빠', '도령', '동생', '꼬마']],
  ['kid', ['손주', '아이', '아기', '애기', '어린이', '친구']],
  ['tiger', ['호랑이', '범이']],
  ['rabbit', ['토끼']],
  ['turtle', ['거북']],
  ['dog', ['강아지', '멍멍', '바둑이', '진돗개', '누렁이', '개가', '개는', '개를', '개랑']],
  ['cat', ['고양이', '야옹', '나비야']],
  ['sinseon', ['산신령', '신령', '도사', '신선', '도깨비']],
];
const has = (text, words) => words.some((w) => text.includes(w));
const TIME = {
  night: ['밤', '달님', '달빛', '보름달', '별님', '별빛', '깜깜', '어두', '잠이', '자장'],
  dusk: ['저녁', '노을', '해질', '해 질'],
};
const PLACE = {
  pond: ['연못', '강가', '강물', '바다', '냇가', '개울', '시냇', '우물', '호수', '샘물'],
  house: ['집', '마을', '초가', '마당', '부엌', '방에'],
  forest: ['숲', '나무', '산에', '산속', '산골', '뒷산', '고개'],
  meadow: ['들판', '풀밭', '꽃밭', '논', '밭에', '언덕', '달리'],
};

// ---------- 무작위 (seed 고정) ----------
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hashText = (s) => [...s].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261) >>> 0;

// ---------- 장면 고르기 ----------
export function analyze(text, seed = 0) {
  const r = rng(hashText(text) + seed * 7919);
  const t = text.replace(/\s+/g, ' ');
  // 찾은 낱말은 지워 가며 찾아요. ("할아버지" 속 "아버지"를 또 찾지 않게)
  let rest = t;
  const found = [];
  for (const [name, words] of CHAR_WORDS) {
    let idx = Infinity;
    for (const w of words) {
      let i = rest.indexOf(w);
      if (i !== -1) idx = Math.min(idx, i);
      while (i !== -1) { rest = rest.slice(0, i) + ' '.repeat(w.length) + rest.slice(i + w.length); i = rest.indexOf(w); }
    }
    if (idx !== Infinity) found.push([idx, name]);
  }
  found.sort((a, b) => a[0] - b[0]);
  let cast = [...new Set(found.map(([, n]) => (n === 'kid' ? (r() < 0.5 ? 'boy' : 'girl') : n)))].slice(0, 3);
  // "다른 그림"을 누르면 서는 순서도 바꿔요.
  if (seed) for (let i = cast.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [cast[i], cast[j]] = [cast[j], cast[i]]; }

  const time = has(t, TIME.night) ? 'night' : has(t, TIME.dusk) ? 'dusk' : 'day';
  const place = {
    pond: has(t, PLACE.pond),
    house: has(t, PLACE.house),
    forest: has(t, PLACE.forest),
    meadow: has(t, PLACE.meadow),
  };
  // 아무도 안 나오면 이야기 들려주는 할머니를 넣어요.
  if (!cast.length && t.trim()) cast = ['grandma'];
  return { cast, time, place, r };
}

// ---------- 그림 조립 ----------
const put = (svg, x, y, s = 1, flip = false) =>
  `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${flip ? -s : s} ${s})">${svg}</g>`;
const shadow = (x, y, rx) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="12" fill="#3A2A1A" opacity=".14"/>`;

export function compose(text, seed = 0) {
  const { cast, time, place, r } = analyze(text, seed);
  const night = time === 'night';
  // 때와 곳이 글에 없으면 seed 에 따라 낮·들판·숲 중에서 골라요.
  const plain = ['day', 'meadow', 'forest'][seed % 3];
  let kind = night ? 'night' : time === 'dusk' ? 'dusk' : place.forest ? 'forest' : place.meadow ? 'meadow' : plain;
  if (!text.trim()) kind = 'warm';
  const bg = BG[kind];
  const out = [bg.body];
  const ground = 505;

  // 하늘
  if (kind === 'warm') {
    out.push(put(PROPS.hearts, 400, 300, 1.4), put(PROPS.sparkles, 400, 260, 1.6));
  } else if (night) {
    out.push(PROPS.stars, put(PROPS.moon, r() < 0.5 ? 120 : 660, 100));
    out.push(put(PROPS.cloud_night, 220 + r() * 300, 40 + r() * 40, 0.9));
  } else {
    if (kind !== 'dusk') out.push(put(PROPS.sun, r() < 0.5 ? 660 : 130, 100));
    out.push(put(PROPS.cloud, 60 + r() * 140, 70 + r() * 40), put(PROPS.cloud, 420 + r() * 200, 50 + r() * 40, 0.8));
    if (r() < 0.6) out.push(put(PROPS.birds, 280 + r() * 160, 140));
  }

  // 배경 소품: 집·연못이 있으면 한쪽에 두고, 등장인물은 나머지 자리에 서요.
  let left = 90; let right = 710;
  const houseSide = r() < 0.5 ? 'right' : 'left';
  if (kind !== 'warm') {
    const tree = night ? 'tree_night' : 'tree';
    const pine = night ? 'pine_night' : 'pine';
    if (place.house) {
      const x = houseSide === 'right' ? 580 : 220;
      out.push(put(PROPS[night ? 'house_night' : 'house'], x, ground - 30, 0.95));
      if (houseSide === 'right') right = 440; else left = 360;
    }
    if (place.pond) {
      const px = place.house ? (houseSide === 'right' ? 250 : 560) : 520;
      out.push(put(PROPS.pond, px, ground - 10, place.house ? 0.75 : 1));
      if (!place.house) right = 330;
    }
    // 가장자리 나무
    const edgeTree = place.forest ? tree : pine;
    if (!(place.house && houseSide === 'left')) out.push(put(PROPS[edgeTree], 40 + r() * 30, ground - 30, place.forest ? 0.8 : 0.95));
    if (!(place.house && houseSide === 'right') && !place.pond) out.push(put(PROPS[edgeTree], 740 + r() * 30, ground - 34, place.forest ? 0.75 : 0.9));
    if (place.forest && !place.house && !place.pond) out.push(put(PROPS[tree], 400 + (r() - 0.5) * 160, ground - 50, 0.75));
  }

  // 등장인물: 빈자리에 고르게 세워요.
  const n = cast.length;
  cast.forEach((name, i) => {
    const c = CHARACTERS[name];
    const x = n === 1 ? (left + right) / 2 : left + 60 + ((right - left - 120) * i) / (n - 1);
    const y = ground + 8 + r() * 14;
    const s = c.scale * (n === 3 ? 0.85 : 1);
    const flip = (name === 'turtle' || name === 'dog') && x > 400;
    out.push(shadow(x, y + 2, 34 + c.h * s * 0.18), put(c.svg, x, y, s, flip));
  });

  // 땅 장식
  if (kind !== 'warm') {
    for (let i = 0; i < 4; i++) {
      const x = 40 + r() * 720;
      const y = 540 + r() * 40;
      out.push(put(r() < 0.5 ? PROPS.tuft : r() < 0.5 ? PROPS.flower : PROPS.flower_pink, x, y));
    }
    if (!night && (place.meadow || place.forest || r() < 0.3)) out.push(put(PROPS.butterfly, 200 + r() * 400, 260 + r() * 80));
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><style>${STYLE}</style><defs>${bg.defs}</defs>${out.join('')}</svg>`;
}

export const svgDataUrl = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
