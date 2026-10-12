// 지은 이야기의 글을 읽고, 글에 나오는 것들로 그림을 조립해요.
//   누가(37가지 캐릭터) · 어떤 표정(웃음·울음·놀람·잠·화) · 무엇을 하는지(달리기·노래·춤·먹기·안기)
//   · 언제(낮·저녁·밤) · 어디서(집·숲·들판·논·연못·바다·방·부엌) · 날씨와 계절(비·눈·무지개·봄·가을)
//   · 무엇이 나오는지(과일·채소·먹을거리·장난감·탈것·살림살이 등 70가지쯤)
//   · 과일이 나무에 열렸으면 과일나무를, 먹고 있으면 손에 든 먹을거리를 그려요.
// 부품은 img/parts.js (tools/build_images.py 가 만들어요). 서버 없이 휴대폰에서 바로 그려져요.
// 같은 글 + 같은 seed 면 언제나 같은 그림이 나와요 (공유받은 가족도 똑같이 봐요).
import { STYLE, BG, CHARACTERS, PROPS } from './img/parts.js';
import { EMOTIONS, SITUATIONS } from './scenes.js';

// ---------- 낱말표 ----------
// 한 글자짜리(해·달·물·별·눈·비·양·배·박)는 다른 말 속에 섞여 있기 쉬워서, 붙는 말까지 함께 찾아요.
const CHAR_WORDS = [
  ['grandma', ['할머니', '할머님', '할미', '외할머니']],
  ['grandpa', ['할아버지', '할아범', '영감', '외할아버지']],
  ['sinseon', ['산신령', '신령', '도사', '신선']],
  ['goblin', ['도깨비']],
  ['mom', ['엄마', '어머니', '어멈', '며느리', '아주머니', '아줌마']],
  ['dad', ['아빠', '아버지', '나무꾼', '농부', '아저씨', '총각', '머슴', '사냥꾼', '선비', '형님']],
  ['baby', ['아기', '애기', '갓난']],
  ['girl', ['손녀', '딸', '소녀', '누나', '언니', '누이', '아가씨', '여동생']],
  ['boy', ['손자', '아들', '소년', '오빠', '도령', '남동생', '꼬마', '형이', '형은', '형과']],
  ['kid', ['손주', '아이', '어린이', '친구', '동생']],
  ['tiger', ['호랑이']],
  ['wolf', ['늑대']],
  ['rabbit', ['토끼']],
  ['turtle', ['거북', '자라']],
  ['dog', ['강아지', '멍멍', '바둑이', '진돗개', '누렁이', '백구', '개가', '개는', '개를', '개랑', '개와']],
  ['cat', ['고양이', '야옹', '나비야']],
  ['pig', ['돼지']],
  ['sheep', ['양 떼', '양떼', '양들', '어린양', '양이 ', '양을', '양과']],
  ['ant', ['개미']],
  ['grasshopper', ['베짱이', '메뚜기', '여치']],
  ['squirrel', ['다람쥐']],
  ['chestnut', ['알밤', '밤톨']],
  ['swallow', ['제비']],
  ['bird', ['파랑새', '참새', '까치', '새가', '새들', '새 한', '새를', '새는']],
  ['frog', ['개구리', '올챙이']],
  ['chick', ['병아리']],
  ['hen', ['암탉', '수탉', '닭이', '닭은', '닭을', '닭과', '닭이랑', '닭 한', '닭들', '꼬꼬닭']],
  ['duck', ['청둥오리', '집오리', '오리가', '오리는', '오리를', '오리와', '오리랑', '오리들', '오리도', '오리 한']],
  ['cow', ['황소', '송아지', '젖소', '얼룩소', '누렁소', '소가 ', '소는 ', '소를 ', '소와 ', '소 한 ', '소랑']],
  ['bear', ['반달곰', '불곰', '곰돌이', '곰이', '곰은', '곰을', '곰과', '곰 한', '곰도', '곰아', '곰들']],
  ['fox', ['여우']],
  ['deer', ['사슴', '노루', '고라니']],
  ['mouse', ['생쥐', '들쥐', '쥐가', '쥐는', '쥐를', '쥐와', '쥐 한', '쥐들']],
  ['monkey', ['원숭이']],
  ['elephant', ['코끼리']],
  ['owl', ['부엉이', '올빼미']],
];
// 감정과 상황 낱말표는 scenes.js 에 있어요.
const EMO = Object.fromEntries(EMOTIONS.map(([k, ko, e]) => [k, { ko, ...e }]));
const MOOD_WORDS = Object.fromEntries(EMOTIONS.map(([k, , e]) => [k, e.words]));
const FACE = Object.fromEntries(EMOTIONS.map(([k, , e]) => [k, e.face]));
const GLOOMY = EMOTIONS.filter(([, , e]) => e.scene === 'gloom').map(([k]) => k);
const WARM = EMOTIONS.filter(([, , e]) => e.scene === 'warm').map(([k]) => k);
const SIT = Object.fromEntries(SITUATIONS.map(([k, ko, , r]) => [k, { ko, ...r }]));
const SIT_WORDS = SITUATIONS.map(([k, , words]) => [k, words]);
const ACTION_WORDS = {
  run: ['달리', '달려', '뛰어', '뛰었', '뛰놀', '쫓아', '도망'],
  sing: ['노래', '부르며', '흥얼', '피리', '장구'],
  dance: ['춤', '덩실'],
  eat: ['먹', '맛있', '냠냠', '밥상', '나누어 먹', '나눠 먹'],
  hug: ['안아', '안고', '껴안', '끌어안', '포옹', '사랑해', '업고', '업어'],
};
const TIME = {
  night: ['밤', '달님', '달빛', '보름달', '별님', '별빛', '별이', '깜깜', '어두', '자장'],
  dusk: ['저녁', '노을', '해질', '해 질', '해가 지', '뉘엿'],
};
const WEATHER = {
  rain: ['비가', '비 오', '비를', '소나기', '장마', '빗물', '빗방울', '우산'],
  snow: ['눈이 ', '눈이 펑', '눈 내', '눈사람', '함박눈', '눈싸움', '썰매', '겨울'],
  rainbow: ['무지개'],
  spring: ['봄', '진달래', '개나리', '벚꽃', '꽃이 피', '꽃밭'],
  autumn: ['가을', '단풍', '낙엽', '추수'],
};
const PLACE = {
  kitchen: ['부엌', '아궁이', '가마솥', '솥에', '부뚜막'],
  room: ['방에', '방 안', '안방', '이불', '마루', '방으로'],
  sea: ['바다', '바닷', '파도', '갯벌', '바닷가', '나룻배', '고깃배'],
  pond: ['연못', '강가', '강물', '냇가', '개울', '시냇', '우물', '호수', '샘물', '냇물'],
  field: ['논에', '논두렁', '밭에', '밭을', '볏단', '벼를', '벼가', '추수', '보리'],
  house: ['집', '마을', '초가', '마당', '오두막', '대문'],
  forest: ['숲', '나무', '산에', '산속', '산골', '뒷산', '고개', '산길'],
  meadow: ['들판', '풀밭', '꽃밭', '언덕', '잔디'],
};
const THING_WORDS = [
  // 과일 (나무에 열리거나, 들고 먹어요)
  ['apple', ['사과']],
  ['persimmon', ['감나무', '홍시', '곶감', '단감', '감이 ', '감을 ', '감 한', '감들', '감을 따', '감이 열']],
  ['tangerine', ['귤']],
  ['peach', ['복숭아', '복숭']],
  ['pear', ['배나무', '배를 따', '배가 열', '배 한 개', '배를 깎', '배를 먹', '배와 ', '배랑']],
  ['grapes', ['포도']],
  ['strawberry', ['딸기']],
  ['banana', ['바나나']],
  ['watermelon', ['수박']],
  // 채소·열매
  ['corn', ['옥수수']],
  ['carrot', ['당근']],
  ['radish', ['무를 뽑', '무 뽑', '무밭', '커다란 무', '큰 무', '무 하나', '순무', '총각무', '무청', '무를 캐']],
  ['sweet_potato', ['고구마']],
  ['potato', ['감자']],
  ['cabbage', ['배추']],
  ['mushroom', ['버섯']],
  ['acorn', ['도토리']],
  // 먹을거리
  ['egg', ['달걀', '계란', '알을', '알이', '알 하나', '알 한']],
  ['bread', ['빵']],
  ['lollipop', ['막대사탕', '막대 사탕']],
  ['candy', ['사탕', '캐러멜', '젤리']],
  ['icecream', ['얼음과자', '빙수']],
  ['cookie', ['과자', '쿠키']],
  ['bee', ['꿀벌', '벌이 ', '벌들', '벌 한', '벌떼']],
  ['honey', ['꿀']],
  ['milk', ['우유']],
  ['dumpling', ['만두']],
  ['noodles', ['국수', '라면', '짜장면', '자장면']],
  ['fish', ['물고기', '고기를 잡', '낚시', '붕어', '잉어']],
  ['boat', ['배를 타', '배에 타', '배에 올', '배에서', '나룻배', '고깃배', '돛단배', '배가 떠', '배를 저', '뱃사공', '배가 출렁']],
  ['umbrella', ['우산']],
  ['kite', ['연을', '연날리', '방패연', '가오리연']],
  ['cake', ['생일', '케이크', '케익']],
  ['book', ['책을', '책이', '그림책', '공부', '동화책']],
  ['letter', ['편지']],
  ['treasure', ['보물', '금은보화', '황금', '금덩이', '부자가']],
  ['ricecake', ['떡', '송편']],
  ['basket', ['바구니', '광주리']],
  ['bowl', ['팥죽', '밥을', '죽을', '국을', '밥상']],
  ['gourd', ['호박', '박이', '박을', '박씨']],
  ['rice', ['볏단', '벼를', '벼가', '쌀을']],
  ['axe', ['도끼']],
  ['wood', ['나뭇짐', '장작', '땔감']],
  ['cauldron', ['가마솥', '솥에']],
  ['rock', ['바위', '돌멩이']],
  ['snowman', ['눈사람']],
  // 장난감·물건
  ['balloons', ['풍선']],
  ['teddy', ['곰인형', '곰 인형', '곰돌이 인형']],
  ['doll', ['인형']],
  ['ball', ['공을', '공이 ', '공놀이', '공 차', '공차기', '축구', '농구', '피구']],
  ['bicycle', ['자전거']],
  ['train', ['기차', '열차', '지하철']],
  ['car', ['자동차', '차를 타', '버스', '트럭', '택시', '소방차', '경찰차']],
  ['airplane', ['비행기']],
  ['hat', ['모자를', '모자가', '모자는', '모자도', '모자 ', '밀짚모자', '털모자']],
  ['bouquet', ['꽃다발', '꽃을 꺾', '꽃을 따', '꽃 한 송이', '꽃을 선물', '꽃을 주']],
  ['gift', ['선물']],
  ['lantern', ['등불', '초롱', '등잔', '호롱', '등을 켜']],
  ['candle', ['촛불', '양초', '초를 켜']],
  ['clock', ['시계']],
  ['bucket', ['양동이', '물동이']],
  ['shovel', ['삽으로', '삽을', '호미']],
  ['watering_can', ['물뿌리개', '물을 주']],
  ['sled', ['썰매']],
  ['shell', ['조개', '소라']],
  ['star_toy', ['별을 따', '별을 주', '별 모양', '별사탕']],
  ['drum', ['북을', '북소리', '북 치', '장구']],
  ['flower_pot', ['화분']],
  ['blanket', ['담요']],
  ['heart_big', ['하트', '마음을 전', '사랑한다고']],
  ['butterfly_big', ['나비']],
];
// 과일은 나무에 열려요. 손에 들 수 있는 것들은 먹을 때 손에 쥐어요.
const FRUITS = ['apple', 'persimmon', 'tangerine', 'peach', 'pear', 'grapes', 'strawberry', 'banana'];
const HOLD = new Set([...FRUITS, 'corn', 'carrot', 'sweet_potato', 'potato', 'bread', 'candy', 'lollipop', 'icecream', 'cookie', 'egg', 'star_toy', 'bouquet', 'acorn']);
// 땅에 놓는 크기
const GROUND = {
  cake: 1, book: 0.8, treasure: 1.1, basket: 1, bowl: 0.9, gourd: 0.8, axe: 0.7, wood: 1, rock: 0.6,
  watermelon: 1, radish: 1, cabbage: 1, mushroom: 1, honey: 0.9, milk: 1, dumpling: 1, noodles: 0.9, ball: 0.9,
  doll: 1, teddy: 0.9, hat: 0.9, gift: 1, lantern: 0.9, candle: 1, clock: 0.9, bucket: 1, shovel: 0.9, watering_can: 1,
  sled: 1, shell: 0.9, drum: 1, flower_pot: 1, blanket: 1.2,
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
const has = (t, ws) => ws.some((w) => t.includes(w));
const firstOf = (t, table) => Object.keys(table).find((k) => has(t, table[k]));

// 낱말을 찾으면 그 자리를 지워 가며 찾아요. ("할아버지" 속 "아버지"를 또 찾지 않게)
// masked: 찾은 낱말을 지운 글 ("도깨비를" 속 "비를"을 날씨로 읽지 않게)
function findAll(text, table, masked = {}) {
  let rest = text;
  const found = [];
  for (const [name, words] of table) {
    let idx = Infinity;
    for (const w of words) {
      let i = rest.indexOf(w);
      if (i !== -1) idx = Math.min(idx, i);
      while (i !== -1) {
        rest = rest.slice(0, i) + ' '.repeat(w.length) + rest.slice(i + w.length);
        i = rest.indexOf(w);
      }
    }
    if (idx !== Infinity) found.push({ name, idx });
  }
  masked.text = rest;
  return found.sort((a, b) => a.idx - b.idx);
}

// 캐릭터 바로 뒤에 나오는 말로 그 캐릭터의 표정을 정해요. ("토끼는 깔깔 웃었고 거북이는 엉엉 울었어요")
function moodNear(t, idx, fallback) {
  const win = t.slice(idx, idx + 16);
  return Object.keys(MOOD_WORDS).find((m) => has(win, MOOD_WORDS[m])) || fallback;
}

// "강아지 두 마리", "세 마리 돼지", "돼지 삼형제", "고양이들" → 몇이 나오는지 (최대 5)
const NUM = { 두: 2, 둘: 2, 2: 2, 세: 3, 셋: 3, 3: 3, 삼: 3, 네: 4, 넷: 4, 4: 4, 다섯: 5, 5: 5, 여러: 3 };
function countNear(t, idx) {
  const after = t.slice(idx, idx + 14);
  const before = t.slice(Math.max(0, idx - 8), idx);
  if (/쌍둥이\s?$/.test(before)) return 2;
  let m = after.match(/^\S*?\s?(두|세|네|다섯|여러|[2-5])\s?(마리|명|분|친구)/) || before.match(/(?:^|\s)(두|세|네|다섯|여러|[2-5])\s?(?:마리의?|명의?)?\s?$/);
  if (m) return NUM[m[1]];
  if (/^\S*?\s?(삼|세)\s?(형제|자매|남매|쌍둥이)/.test(after)) return 3;
  if (/^\S*?\s?(형제|자매|쌍둥이|남매|부부)/.test(after)) return 2;
  if (/^\S*?들(이|은|을|과|도|이랑|아|의|\s|,|\.|$)/.test(after)) return 2;
  return 1;
}

export function analyze(text, seed = 0, opts = {}) {
  const r = rng(hashText(text) + seed * 7919);
  // "아기 돼지", "새끼 고양이"의 "아기·새끼"는 꾸미는 말이라 아기 캐릭터로 읽지 않아요.
  const t = text.replace(/\s+/g, ' ')
    .replace(/(아기|새끼|꼬마)\s?(돼지|토끼|고양이|강아지|양|새|제비|다람쥐|거북|호랑이|늑대|개미|오리|곰|여우|사슴|생쥐|원숭이|코끼리|부엉이|개구리)/g, '$2')
    // 뜻이 둘인 말: "사과했어요"(잘못을 빎), "배가 고파"(배고픔), "모자라"(부족함), 아이스크림 속 "아이"
    .replace(/사과(를\s?)?(했|하였|드렸|드리|해야|할게|하세요)/g, '용서$2')
    .replace(/배(가|도)?\s?(고파|고프|불러|부르|아파|아프)/g, '속$2')
    .replace(/모자라|모자란|모자랐/g, '부족')
    .replace(/아이스크림/g, '얼음과자');
  const masked = {};
  // "무지개가", "조개를", "베개를" 속 "개가·개를"을 강아지로 읽지 않게 잠깐 바꿔 두고 찾아요.
  const NOT_DOG = /(무지|조|베|안|지우|날|덮|솔|번|부|무)개/g;
  const found = findAll(t.replace(NOT_DOG, '$1갯'), CHAR_WORDS, masked);
  const m = masked.text.replace(/(무지|조|베|안|지우|날|덮|솔|번|부|무)갯/g, '$1개');  // 캐릭터 이름을 지운 글: 표정·날씨·장소·물건은 여기서 찾아요
  // 상황: 글에 먼저 나온 두 가지까지 (소풍, 추석, 운동회…)
  const sits = findAll(t, SIT_WORDS).slice(0, 2).map((x) => ({ key: x.name, ...SIT[x.name] }));
  const pick = (f) => sits.map((x) => x[f]).find(Boolean);
  // 감정은 글에 쓴 말이 먼저, 없으면 상황의 분위기
  const mood = Object.keys(MOOD_WORDS).find((k) => has(m, MOOD_WORDS[k])) || pick('mood');
  const action = Object.keys(ACTION_WORDS).find((k) => has(m, ACTION_WORDS[k])) || pick('action');
  let cast = found.map(({ name, idx }) => ({
    name: name === 'kid' ? (r() < 0.5 ? 'boy' : 'girl') : name,
    kid: name === 'kid',
    count: countNear(t, idx),
    mood: moodNear(m, idx, mood || (r() < 0.6 ? 'happy' : 'calm')),
  }));
  cast = cast.filter((c, i) => cast.findIndex((d) => d.name === c.name) === i);
  // 여럿이면 그 수만큼 그려요. 아이는 남자아이·여자아이를 번갈아 그려요.
  cast = cast.flatMap((c) => Array.from({ length: c.count }, (_, k) => ({
    name: c.kid && k % 2 ? (c.name === 'boy' ? 'girl' : 'boy') : c.name,
    mood: c.mood,
    copy: k,
  })));
  // "아이들", "손주들", "친구들"이면 둘을 그려요.
  if (has(t, ['아이들', '손주들', '친구들', '애들', '오누이', '남매'])) {
    for (const k of ['boy', 'girl']) if (!cast.some((c) => c.name === k)) cast.push({ name: k, mood: cast.find((c) => c.name === 'boy' || c.name === 'girl')?.mood || mood || 'happy' });
  }
  // "온 가족", "식구들"이면 할머니·할아버지·엄마·아빠·손주를 함께 그려요.
  if (has(t, ['가족', '식구'])) {
    for (const k of ['grandma', 'grandpa', 'mom', 'dad', r() < 0.5 ? 'boy' : 'girl']) {
      if (!cast.some((c) => c.name === k)) cast.push({ name: k, mood: mood || 'happy' });
    }
  }
  // 쫓기는 쪽은 놀란 얼굴
  if (has(m, ['쫓아', '쫓기', '도망'])) cast.forEach((c, i) => { if (i > 0 && !GLOOMY.includes(c.mood)) c.mood = 'scared'; });
  const sky = cast.filter((c) => CHARACTERS[c.name]?.sky);
  let ground = cast.filter((c) => !CHARACTERS[c.name]?.sky).slice(0, 5);
  // 아무도 이름이 안 나왔는데 상황에 어울리는 인물이 있으면 넣어요. (농장 → 소·닭, 자장가 → 할머니·아기)
  if (!ground.length && pick('cast')) ground = pick('cast').map((name) => ({ name, mood: mood || 'happy' }));
  if (seed) for (let i = ground.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [ground[i], ground[j]] = [ground[j], ground[i]]; }
  // 아무도 안 나오면 풍경만 그려요. "인물 빼기"를 고르면 이름이 나와도 풍경만 그려요.
  const nobody = !ground.length && !sky.length;
  // 장면 분위기: 기쁜 인물과 슬픈 인물이 함께 있으면 하늘은 그대로 둬요.
  const moods = cast.map((c) => c.mood);
  const scene = (GLOOMY.includes(mood) && moods.some((x) => WARM.includes(x)))
    || (WARM.includes(mood) && moods.some((x) => GLOOMY.includes(x))) ? null : mood;
  return {
    r,
    nobody,
    noCast: Boolean(opts.noCast),
    ground: opts.noCast ? [] : ground,
    sky: opts.noCast ? [] : sky.slice(0, 3),
    mood,
    scene,
    action,
    time: firstOf(m, TIME) || pick('time') || 'day',
    weather: [...new Set([...Object.keys(WEATHER).filter((w) => has(m, WEATHER[w])), ...sits.map((x) => x.weather).filter(Boolean)])],
    place: Object.fromEntries(Object.keys(PLACE).map((p) => [p, has(m, PLACE[p]) || sits.some((x) => x.place === p)])),
    things: [...new Set([...findAll(m, THING_WORDS).map((x) => x.name), ...sits.flatMap((x) => x.things || [])])],
    extras: [...new Set(sits.flatMap((x) => x.extras || []))],
    situations: sits.map((x) => x.key),
    // "사과나무", "나무에서 감을 땄어요", "주렁주렁 열렸어요"
    onTree: has(m, ['나무', '열렸', '열린', '주렁', '따 먹', '따서', '땄', '따러', '따고']),
    fullMoon: has(m, ['보름달', '둥근 달', '달님']) || sits.some((x) => x.moon),
    straw: has(m, ['초가', '오두막', '움막', '지푸라기']),
    brick: has(m, ['벽돌']),
  };
}

// ---------- 그림 조립 ----------
const put = (svg, x, y, s = 1, flip = false) =>
  `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(flip ? -s : s).toFixed(3)} ${s.toFixed(3)})">${svg}</g>`;
const wrap = (cls, svg) => `<g class="${cls}">${svg}</g>`;
const shadow = (x, y, rx) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="12" fill="#3A2A1A" opacity=".14"/>`;
// 캐릭터에 그 얼굴이 없으면 가까운 얼굴로 차례로 내려가요. (슬픔 → 울음 → 보통)
const FACE_FALLBACK = { sad: 'cry', worried: 'calm', love: 'happy', excited: 'happy', tired: 'sleep', sick: 'cry', shy: 'happy', smug: 'happy',
  angry: 'calm', sleep: 'calm', cry: 'calm', shock: 'calm', run: 'happy', cheer: 'happy' };
const variant = (c, want) => {
  for (let w = want, i = 0; w && i < 4; w = FACE_FALLBACK[w], i++) if (c.v[w]) return c.v[w];
  return c.v.happy || Object.values(c.v)[0];
};

function chooseBg(a, seed) {
  const { place, weather, time } = a;
  if (place.kitchen) return 'kitchen';
  if (place.room) return 'room';
  if (place.sea) return 'sea';
  if (weather.includes('snow')) return 'winter';
  if ((weather.includes('rain') || GLOOMY.includes(a.scene)) && time === 'day') return place.forest ? 'forest' : 'meadow';
  if (time === 'night') return place.field ? 'paddy_night' : 'night';
  if (time === 'dusk') return 'dusk';
  if (weather.includes('autumn')) return 'autumn';
  if (place.field) return 'paddy';
  if (place.forest) return 'forest';
  if (place.meadow || weather.includes('spring')) return 'meadow';
  return ['day', 'meadow', 'forest'][seed % 3];
}

export function compose(text, seed = 0, opts = {}) {
  if (!text.trim()) {
    const bg = BG.warm;
    return svgDoc(bg, [bg.body, put(PROPS.hearts, 400, 320, 1.4), put(PROPS.sparkles, 400, 260, 1.6), put(PROPS.book, 400, 420, 2)]);
  }
  const a = analyze(text, seed, opts);
  const { r, sky, action, weather, place, things } = a;
  let { ground } = a;
  const kind = chooseBg(a, seed);
  const bg = BG[kind];
  const night = kind === 'night' || kind === 'paddy_night';
  const inside = kind === 'kitchen' || kind === 'room';
  const raining = weather.includes('rain');
  const out = [bg.body];
  const back = [];   // 인물 뒤
  const front = [];  // 인물 앞
  const has_ = (k) => things.includes(k);
  const fruit = things.find((k) => FRUITS.includes(k));
  const eating = action === 'eat';
  // 먹는 장면이면 글에 나온 먹을거리를 손에 쥐어요.
  const food = eating ? things.find((k) => HOLD.has(k) && k !== 'bouquet' && k !== 'star_toy') : null;

  // 하늘
  if (!inside) {
    if (weather.includes('rainbow')) back.push(put(PROPS.rainbow, 400, 400, 1));
    if (night) {
      if (kind !== 'paddy_night') back.push(PROPS.stars);
      back.push(put(a.fullMoon ? PROPS.full_moon : PROPS.moon, r() < 0.5 ? 130 : 660, 100));
      back.push(put(PROPS.cloud_night, 220 + r() * 300, 40 + r() * 40, 0.9));
    } else if (raining || GLOOMY.includes(a.scene)) {
      back.push(put(PROPS.cloud_rain, 60 + r() * 100, 50, 1.4), put(PROPS.cloud_rain, 360 + r() * 120, 30, 1.6), put(PROPS.cloud_rain, 620, 60, 1.2));
    } else {
      if (!['day', 'dusk', 'winter'].includes(kind)) back.push(put(PROPS.sun, r() < 0.5 ? 660 : 130, 100));
      if (WARM.includes(a.scene)) back.push(PROPS.warm_glow);
      back.push(put(PROPS.cloud, 60 + r() * 140, 70 + r() * 40), put(PROPS.cloud, 420 + r() * 200, 50 + r() * 40, 0.8));
      if (r() < 0.5 && !sky.length) back.push(put(PROPS.birds, 280 + r() * 160, 140));
    }
  }
  const cauldron = kind === 'kitchen' || has_('cauldron');
  if (cauldron) back.push(put(PROPS.cauldron, 650, 470, 1));

  // 배경 소품: 집·연못·바다의 배가 한쪽을 차지하면 인물은 나머지 자리에 서요.
  const ground_y = kind === 'sea' ? 575 : inside ? 520 : 505;
  let left = 90; let right = cauldron ? 500 : 710;
  const crowd = ground.length >= 4;
  if (!inside && kind !== 'sea') {
    const houseSide = r() < 0.5 ? 'right' : 'left';
    const tree = night ? 'tree_night' : 'tree';
    const pine = night ? 'pine_night' : 'pine';
    if (place.house) {
      const x = crowd ? (houseSide === 'right' ? 660 : 140) : houseSide === 'right' ? 590 : 210;
      const h = a.brick ? PROPS.brick_house : a.straw ? PROPS.straw_house : PROPS[night ? 'house_night' : 'house'];
      back.push(put(h, x, ground_y - 30, crowd ? 0.7 : 0.9));
      if (houseSide === 'right') right = crowd ? 600 : 450; else left = crowd ? 200 : 350;
    }
    if (place.pond) {
      const px = place.house ? (houseSide === 'right' ? 240 : 560) : 540;
      back.push(put(PROPS[night ? 'pond_night' : 'pond'], px, ground_y - 8, place.house ? 0.75 : 1));
      if (has_('fish')) back.push(put(PROPS.fish, px + 40, ground_y - 40, 0.9));
      if (has_('boat')) back.push(put(PROPS.boat, px, ground_y - 10, 0.6));
      if (!place.house) right = 340;
    }
    // 과일나무: 집·연못이 없는 쪽에 서고, 글에 나온 과일이 주렁주렁 달려요.
    let treeSide = '';
    if (fruit && a.onTree) {
      treeSide = place.house ? (houseSide === 'right' ? 'left' : 'right') : place.pond ? 'left' : (r() < 0.5 ? 'left' : 'right');
      const tx = treeSide === 'left' ? 150 : 650;
      back.push(fruitTree(fruit, tx, ground_y - 10, night, r));
      if (treeSide === 'left') left = Math.max(left, crowd ? 200 : 290); else right = Math.min(right, crowd ? 600 : 510);
    }
    // 상황의 큰 소품(텐트·학교·좌판·그네·빨랫줄·장독대·산…)은 집·나무가 없는 쪽에 서요.
    const mark = a.extras.find((k) => k in LANDMARK);
    if (mark) {
      const taken = [place.house && houseSide, treeSide, place.pond && !place.house && 'right'].filter(Boolean);
      const sideM = !taken.includes('left') ? 'left' : !taken.includes('right') ? 'right' : '';
      if (sideM) {
        back.push(put(PROPS[mark], sideM === 'left' ? 170 : 630, ground_y - 4, LANDMARK[mark]));
        if (sideM === 'left') left = Math.max(left, crowd ? 220 : 310); else right = Math.min(right, crowd ? 580 : 490);
        treeSide = treeSide || sideM;
      }
    }
    const edge = place.forest ? tree : pine;
    if (!(place.house && houseSide === 'left') && treeSide !== 'left') back.push(put(PROPS[edge], 40 + r() * 30, ground_y - 30, place.forest ? 0.8 : 0.95));
    if (!(place.house && houseSide === 'right') && !place.pond && treeSide !== 'right') back.push(put(PROPS[edge], 740 + r() * 30, ground_y - 34, place.forest ? 0.75 : 0.9));
    if (place.forest && !place.house && !place.pond && !treeSide) back.push(put(PROPS[tree], 400 + (r() - 0.5) * 160, ground_y - 50, 0.75));
    if (has_('rice') || kind.startsWith('paddy')) { back.push(put(PROPS.rice, 60, ground_y + 40, 0.9), put(PROPS.rice, 740, ground_y + 40, 0.9)); }
  }
  if (kind === 'sea') {
    if (has_('boat')) back.push(put(PROPS.boat, 560, 470, 0.8));
    if (has_('fish')) back.push(put(PROPS.fish, 300, 450, 1), put(PROPS.fish2, 420, 480, 0.8));
  }

  // 하늘과 땅을 덮는 상황 소품
  const ex = (k) => a.extras.includes(k);
  if (ex('fireworks') && !inside) back.push(put(PROPS.fireworks, 400, 150));
  if (ex('shooting_star') && !inside) back.push(put(PROPS.shooting_star, 520, 120));
  if (ex('bunting')) back.push(put(PROPS.bunting, 400, inside ? 40 : 56));
  if (ex('flower_field') && !inside) back.push(put(PROPS.flower_field, 400, ground_y + 30));
  if (ex('seedlings') && !inside) back.push(put(PROPS.seedlings, 400, ground_y + 26));
  if (inside && ex('xmas_tree')) { back.push(put(PROPS.xmas_tree, 660, ground_y + 20, 0.8)); right = Math.min(right, 520); }
  if (inside && ex('bathtub')) { back.push(put(PROPS.bathtub, 250, ground_y + 50, 1.1)); left = Math.max(left, 400); }
  if (has_('airplane') && !inside) back.push(put(PROPS.airplane, 250 + r() * 300, 150 + r() * 40, 0.9));
  // 큰 탈것은 인물 뒤 땅에 서요.
  const vehicle = ['train', 'car', 'bicycle'].find(has_);
  if (vehicle && !inside) {
    const vx = kind === 'sea' ? 400 : (left + right) / 2 + (r() < 0.5 ? -1 : 1) * 110;
    back.push(put(PROPS[vehicle], vx, ground_y - 6, { train: 0.95, car: 1, bicycle: 0.9 }[vehicle]));
  }

  // 하늘을 나는 캐릭터 (제비·새)
  sky.forEach((c, i) => {
    const ch = CHARACTERS[c.name];
    back.push(put(variant(ch, c.mood), 200 + i * 300 + r() * 80, 170 + r() * 50, ch.scale));
  });

  // 눈사람은 인물 자리 한쪽을 차지해요.
  if (has_('snowman') && !inside) { back.push(put(PROPS.snowman, right - 20, ground_y + 10, 1.1)); right -= 170; }
  // 방에서 잠들면 맨 앞 인물은 침대에 누워요.
  let ground_ = ground;
  if (inside && a.mood === 'sleep' && ground.length) {
    const c = ground[0];
    const ch = CHARACTERS[c.name];
    const s = 0.55 * ch.scale;
    back.push(put(PROPS.bed_back + put(variant(ch, 'sleep'), -94, -98 + 0.72 * ch.h * s, s) + PROPS.bed_front, 470, 560, 1.25));
    back.push(put(PROPS.zz, 380, 330));
    ground_ = ground.slice(1);
    right = 300;
  }
  // 인물: 빈자리에 고르게 서요. 서로 안으면 가까이 붙어요.
  ground = ground_;
  const n = ground.length;
  const hugging = action === 'hug' && n >= 2;
  const spots = ground.map((_, i) => {
    if (n === 1) return (left + right) / 2;
    if (hugging) return (left + right) / 2 + (i - (n - 1) / 2) * (n > 3 ? 95 : 120);
    return left + 50 + ((right - left - 100) * i) / (n - 1);
  });
  // 넷 이상이면 두 줄로 서요: 짝수 번째는 조금 뒤(위)에 작게, 앞줄이 나중에 그려져서 앞에 보여요.
  const crowdScale = [1, 1, 1, 0.85, 0.74, 0.66][n] || 0.66;
  const order = ground.map((_, i) => i).sort((i, j) => (n > 3 ? (j % 2) - (i % 2) : 0) || i - j);
  const people = [];
  order.forEach((i) => {
    const c = ground[i];
    const ch = CHARACTERS[c.name];
    const x = spots[i];
    const back_ = n > 3 && i % 2 === 1;
    const y = ground_y + (back_ ? -22 : n > 3 ? 14 : 0) + (n > 1 ? r() * 10 : 6);
    const s = ch.scale * crowdScale * (back_ ? 0.92 : 1) * (kind === 'sea' ? 0.85 : 1);
    let want = FACE[c.mood] || c.mood;
    if (action === 'run' && c.name === 'rabbit') want = 'run';
    if ((action === 'dance' || action === 'sing') && ch.v.cheer && !GLOOMY.includes(c.mood)) want = 'cheer';
    if (c.name === 'sinseon' && (has_('treasure') || has_('axe'))) want = 'gift';
    const flip = ch.faces === 1 ? x > 400 : Boolean(c.copy % 2);
    let svg = put(variant(ch, want), x, y, s, flip);
    if (action === 'run' || action === 'dance') svg = wrap('hop', svg);
    else if (EMO[c.mood]?.motion) svg = wrap(EMO[c.mood].motion === 'shiver' ? 'shiver' : 'hop', svg);  // 무서우면 덜덜, 신나면 깡충
    people.push({ i, x, y, s, h: ch.h * s, name: c.name, mood: c.mood });
    front.push(shadow(x, y + 2, 34 + ch.h * s * 0.18), svg);
  });
  people.sort((p, q) => p.i - q.i);
  const lead = people[0];

  // 하는 일
  if (lead) {
    const head = lead.y - lead.h;
    if (action === 'sing' || action === 'dance') front.push(put(PROPS.notes, lead.x + 30, head + 20));
    if (hugging) front.push(put(PROPS.hearts, (spots[0] + spots[1]) / 2, head - 10));
    if (action === 'run') front.push(put(PROPS.speed, lead.x - 150, lead.y - lead.h * 0.6));
    // 감정 표시: 인물마다 머리 위·옆에 (슬픔 구름, 느낌표, 김, 땀, 빗금, 하트)
    for (const p of people) {
      const top = p.y - p.h;
      const k = Math.min(1, 0.55 + p.s * 0.4);
      const side = p.x > 400 ? -1 : 1;
      for (const [sign, at] of EMO[p.mood]?.signs || []) {
        const [x, y, z] = {
          top: [p.x, top - 6, sign === 'sad_cloud' ? k * 1.25 : k],
          side: [p.x + side * 32, top + 24, k],
          cheek: [p.x + side * 36, top + 44, k],
          belly: [p.x + side * 28, p.y - p.h * 0.35, k],
        }[at];
        // 땀방울과 물음표가 같은 쪽에 겹치지 않게 물음표는 반대쪽
        const flip = sign === 'question' && (EMO[p.mood].signs.length > 1);
        if (PROPS[sign]) front.push(put(PROPS[sign], flip ? p.x - side * 30 : x, flip ? top + 6 : y, z));
      }
    }
    if (food) people.forEach((p, i) => front.push(put(PROPS[food], p.x + (p.x > 400 ? -1 : 1) * (26 + p.h * 0.12), p.y - p.h * 0.28, 0.75)));
    else if (eating && !['bowl', 'ricecake', 'noodles', 'dumpling', 'cake', 'watermelon', 'honey'].some(has_)) people.forEach((p) => front.push(put(PROPS.bowl, p.x + 34, p.y + 44, 0.7)));
  }

  // 글에 나온 물건
  // 인물 발치를 가리지 않게, 인물과 떨어진 자리부터 써요.
  const frontSpots = [400, 230, 570, 120, 680, 320, 480]
    .map((x, i) => ({ x, i, near: people.some((p) => Math.abs(p.x - x) < 75) }))
    .sort((p, q) => p.near - q.near || p.i - q.i)
    .map((p) => p.x);
  let fs = 0;
  const nextSpot = () => frontSpots[fs++ % frontSpots.length];
  for (const k of things) {
    if (k === 'umbrella' && lead) front.push(put(PROPS[r() < 0.5 ? 'umbrella' : 'umbrella2'], lead.x + 24, lead.y - lead.h * 0.45, 1));
    else if (k === 'kite' && lead) {
      const kx = Math.min(700, lead.x + 200), ky = 150;
      front.push(`<path d="M${(lead.x + 30).toFixed(1)} ${(lead.y - lead.h * 0.55).toFixed(1)}Q${kx - 60} ${ky + 160} ${kx} ${ky + 50}" stroke="#8A6448" stroke-width="2" fill="none"/>`, put(PROPS.kite, kx, ky, 1));
    } else if (k === 'letter' && lead) front.push(put(PROPS.letter, lead.x + 60, lead.y - lead.h * 0.5, 0.9));
    else if (k === 'fish' && !place.pond && kind !== 'sea') front.push(put(PROPS.fish, nextSpot(), 570, 0.9));
    else if (k === 'ricecake') front.push(put(PROPS.basket, nextSpot(), 580, 0.9), put(PROPS.ricecake, frontSpots[(fs - 1) % frontSpots.length], 545, 1));
    else if (k === food && lead) continue;  // 이미 손에 들었어요
    else if (FRUITS.includes(k)) {
      // 나무에 열렸으면 두어 개가 떨어져 있고, 아니면 땅에 소복이 놓여요.
      const x = nextSpot();
      if (a.onTree && !inside) front.push(put(PROPS[k], x - 20, 585, 0.8), put(PROPS[k], x + 30, 590, 0.7));
      else front.push(put(PROPS[k], x - 34, 588, 0.9), put(PROPS[k], x + 34, 590, 0.85), put(PROPS[k], x, 576, 1));
    } else if ((k === 'balloons' || k === 'star_toy' || k === 'bouquet') && lead) {
      front.push(put(PROPS[k], lead.x + (lead.x > 400 ? -1 : 1) * (30 + lead.h * 0.12), lead.y - lead.h * (k === 'balloons' ? 0.3 : 0.25), k === 'balloons' ? 1 : 0.8));
    } else if (k === 'heart_big' && lead) front.push(put(PROPS.heart_big, lead.x, lead.y - lead.h - 20, 0.6));
    // 아무도 없을 때: 연은 혼자 하늘을 날고, 우산·편지·풍선은 땅에 놓이거나 떠 있어요.
    else if (!lead && k === 'kite') {
      const kx = 520 + r() * 120;
      front.push(`<path d="M${kx - 140} 560Q${kx - 120} 330 ${kx} 200" stroke="#8A6448" stroke-width="2" fill="none"/>`, put(PROPS.kite, kx, 150, 1));
    } else if (!lead && (k === 'umbrella' || k === 'letter' || k === 'star_toy' || k === 'bouquet')) {
      front.push(put(PROPS[k], nextSpot(), k === 'umbrella' ? 590 : 575, k === 'umbrella' ? 0.7 : 0.9));
    } else if (!lead && k === 'balloons') front.push(put(PROPS.balloons, nextSpot(), 520, 1));
    else if (!lead && k === 'heart_big') front.push(put(PROPS.heart_big, 400, 260, 0.8));
    else if (k === 'bee' || k === 'butterfly_big') front.push(put(PROPS[k], 150 + r() * 500, 230 + r() * 100, 1));
    else if (k === 'clock' && inside) back.push(put(PROPS.clock, 640, 250, 1));
    else if (k === 'egg' || k === 'acorn' || k === 'potato' || k === 'sweet_potato' || k === 'carrot' || k === 'corn') {
      const x = nextSpot();
      front.push(put(PROPS[k], x - 26, 588, 0.9), put(PROPS[k], x + 26, 590, 0.9));
    } else if (k === 'candy' || k === 'cookie' || k === 'bread' || k === 'lollipop' || k === 'icecream') {
      front.push(put(PROPS[k], nextSpot(), 585, 1));
    } else if (GROUND[k]) {
      front.push(put(PROPS[k === 'axe' && has_('treasure') ? 'axe_gold' : k], nextSpot(), k === 'axe' ? 590 : 585, GROUND[k]));
    }
  }

  // 땅에 놓는 상황 소품 (모닥불·잔칫상·선물 더미·모래성·구급상자·사진기), 비눗방울은 공중에
  for (const k of a.extras) {
    if (k in GROUND_EXTRA && !(inside && k === 'sandcastle')) front.push(put(PROPS[k], nextSpot(), 588, GROUND_EXTRA[k]));
    else if (k === 'bubbles') front.push(put(PROPS.bubbles, lead ? lead.x + 60 : 400, lead ? lead.y - lead.h - 10 : 300, 1));
  }

  // 날씨·계절은 맨 앞에
  if (raining) front.push(PROPS.rain);
  if (GLOOMY.includes(a.scene)) back.unshift(PROPS.gloom);  // 하늘이 잿빛으로 (인물은 그대로 밝게)
  if (weather.includes('autumn') && !inside) front.push(put(PROPS.leaves, 120, 160));
  if (!inside && kind !== 'winter' && kind !== 'sea') {
    const flowers = GLOOMY.includes(a.scene) ? 1 : weather.includes('spring') ? 9 : 4;
    for (let i = 0; i < flowers; i++) {
      const x = 30 + r() * 740;
      const y = 545 + r() * 45;
      const pick = r();
      front.push(put(pick < 0.3 ? PROPS.tuft : pick < 0.55 ? PROPS.flower : pick < 0.8 ? PROPS.flower_pink : PROPS.flower_yellow, x, y));
    }
    if (!night && !raining && !GLOOMY.includes(a.scene) && EMO[a.scene]?.scene !== 'fear' && (place.meadow || place.forest || weather.includes('spring'))) front.push(put(PROPS[r() < 0.5 ? 'butterfly' : 'butterfly_y'], 200 + r() * 400, 260 + r() * 80));
  }

  if (EMO[a.scene]?.scene === 'fear') front.push(PROPS.fear_vignette);  // 무서운 장면은 가장자리가 어두워져요
  // "다른 그림"을 누를 때마다(seed) 구도가 바뀌어요: 홀수면 좌우를 뒤집고, 두 번에 한 번씩 가까이 당겨요.
  // seed 0 은 처음 그림 그대로예요. (이미 보낸 이야기는 바뀌지 않아요)
  const mirror = seed % 2 === 1;
  const zoom = [1, 1.14, 1.26, 1.08][Math.floor(seed / 2) % 4];
  const frame = [
    mirror ? 'translate(800 0) scale(-1 1)' : '',
    zoom !== 1 ? `translate(400 ${inside ? 560 : 600}) scale(${zoom}) translate(-400 -${inside ? 560 : 600})` : '',
  ].filter(Boolean).join(' ');
  const parts = [...out, ...back, ...front];
  return svgDoc(bg, frame ? [`<g transform="${frame}">${parts.join('')}</g>`] : parts);
}

// 상황 소품 크기: 옆에 서는 큰 것 / 땅에 놓는 것
const LANDMARK = { tent: 0.9, school: 0.72, stall: 0.85, swing: 0.9, laundry: 0.9, xmas_tree: 0.8, jangdok: 0.8, mountain_flag: 1, bench: 0.8 };
const GROUND_EXTRA = { campfire: 1, feast: 0.9, gift_pile: 0.9, sandcastle: 0.9, first_aid: 0.9, camera: 0.8 };

// 둥근 나무에 과일을 달아요. (나무 그림의 잎 부분은 대략 가운데 (0,-230), 반지름 130)
const FRUIT_SPOTS = [[-80, -210], [-30, -255], [35, -215], [80, -250], [-55, -290], [15, -305], [70, -185], [-100, -245], [0, -180]];
function fruitTree(kind, x, y, night, r) {
  const s = 0.95;
  const fruits = FRUIT_SPOTS.map(([fx, fy]) => put(PROPS[kind], fx + (r() - 0.5) * 10, fy + 26, kind === 'grapes' || kind === 'banana' ? 0.55 : 0.6)).join('');
  return put(PROPS[night ? 'tree_night' : 'tree'] + wrap('sway', fruits), x, y, s);
}

const svgDoc = (bg, parts) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><style>${STYLE}</style><defs>${bg.defs}</defs>${parts.join('')}</svg>`;

export const svgDataUrl = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

// ---------- 그림에 들어간 것 (이야기 쓰는 화면에 보여 줘요) ----------
const NAME_KO = {
  grandma: '할머니', grandpa: '할아버지', sinseon: '산신령', goblin: '도깨비', mom: '엄마', dad: '아빠', baby: '아기',
  girl: '여자아이', boy: '남자아이', tiger: '호랑이', wolf: '늑대', rabbit: '토끼', turtle: '거북이', dog: '강아지',
  cat: '고양이', pig: '돼지', sheep: '양', ant: '개미', grasshopper: '베짱이', squirrel: '다람쥐', chestnut: '알밤',
  swallow: '제비', bird: '새', frog: '개구리', chick: '병아리', hen: '닭', duck: '오리', cow: '소', bear: '곰',
  fox: '여우', deer: '사슴', mouse: '생쥐', monkey: '원숭이', elephant: '코끼리', owl: '부엉이',
  apple: '사과', persimmon: '감', tangerine: '귤', peach: '복숭아', pear: '배', grapes: '포도', strawberry: '딸기',
  banana: '바나나', watermelon: '수박', corn: '옥수수', carrot: '당근', radish: '무', sweet_potato: '고구마',
  potato: '감자', cabbage: '배추', mushroom: '버섯', acorn: '도토리', egg: '달걀', bread: '빵', lollipop: '막대사탕',
  candy: '사탕', icecream: '아이스크림', cookie: '과자', bee: '꿀벌', honey: '꿀', milk: '우유', dumpling: '만두',
  noodles: '국수', fish: '물고기', boat: '배', umbrella: '우산', kite: '연', cake: '케이크', book: '책', letter: '편지',
  treasure: '보물', ricecake: '떡', basket: '바구니', bowl: '밥그릇', gourd: '박', rice: '볏단', axe: '도끼',
  wood: '나뭇짐', cauldron: '가마솥', rock: '바위', snowman: '눈사람', balloons: '풍선', teddy: '곰인형', doll: '인형',
  ball: '공', bicycle: '자전거', car: '자동차', train: '기차', airplane: '비행기', hat: '모자', bouquet: '꽃다발',
  gift: '선물', lantern: '등불', candle: '촛불', clock: '시계', bucket: '양동이', shovel: '삽', watering_can: '물뿌리개',
  sled: '썰매', shell: '조개', star_toy: '별', drum: '북', flower_pot: '화분', blanket: '담요', heart_big: '하트',
  butterfly_big: '나비',
};
const PLACE_KO = { kitchen: '부엌', room: '방', sea: '바다', pond: '물가', field: '논밭', house: '집', forest: '숲', meadow: '들판' };
const WEATHER_KO = { rain: '비', snow: '눈', rainbow: '무지개', spring: '봄', autumn: '가을' };
const ACTION_KO = { run: '달리기', sing: '노래', dance: '춤', eat: '먹기', hug: '안기' };

// 글을 읽고 무엇을 그림에 넣었는지, 무엇을 더 적으면 좋은지 알려 줘요.
export function describe(text, opts = {}) {
  if (!text.trim()) return null;
  const a = analyze(text, 0, opts);
  // 같은 인물이 여럿이면 "강아지 ×2" 처럼 보여 줘요.
  const counts = new Map();
  for (const c of [...a.ground, ...a.sky]) counts.set(NAME_KO[c.name], (counts.get(NAME_KO[c.name]) || 0) + 1);
  const who = a.noCast ? ['인물 없이 풍경만'] : [...counts].map(([k, v]) => (v > 1 ? `${k} ×${v}` : k));
  const things = a.things.map((k) => (FRUITS.includes(k) && a.onTree ? `${NAME_KO[k]}나무` : NAME_KO[k]));
  const where = Object.keys(PLACE_KO).filter((p) => a.place[p]).map((p) => PLACE_KO[p]);
  const when = [a.time === 'night' ? '밤' : a.time === 'dusk' ? '저녁' : '', ...a.weather.map((w) => WEATHER_KO[w])].filter(Boolean);
  // 인물마다 감정이 다르면 모두 보여 줘요 (기쁨, 슬픔)
  const feelings = a.mood ? [...new Set([a.mood, ...a.ground.map((c) => c.mood)].filter((k) => EMO[k] && k !== 'calm'))].map((k) => EMO[k].ko) : [];
  const doing = [a.action && ACTION_KO[a.action], ...feelings].filter(Boolean);
  const situations = a.situations.map((k) => SIT[k].ko);
  let tip = '';
  if (a.nobody && !a.noCast) tip = '지금은 풍경만 그려요. 누가 나오는지 적으면 그 인물을 그려요 (예: 손녀, 강아지 두 마리)';
  else if (!where.length) tip = '어디인지 적으면 배경이 바뀌어요 (예: 바닷가, 숲속, 부엌)';
  else if (!things.length) tip = '무엇이 나오는지 적으면 함께 그려요 (예: 사과, 풍선, 자전거)';
  return { who, things, where, when, doing, situations, tip };
}
