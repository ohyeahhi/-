// 추억 질문 카드: 하루 하나씩 질문을 보여 주고, 대답을 모아 "옛날 이야기" 책으로 만들어요.
// 대답은 직접 지은 이야기(mystories.js)의 한 장면으로 저장돼서, 그림·녹음·보내기·그림책이 그대로 돼요.
import * as mine from './mystories.js';

export const MEMOIR_ID = 'my-memoir';
export const BOOK_READY = 10;   // 이만큼 모이면 책으로 만들자고 권해요
export const MAX_ANSWERS = 30;

// [id, 갈래, 질문]  id 는 한 번 정하면 바꾸지 않아요 (대답과 이어져 있어요)
export const QUESTIONS = [
  ['home', '어린 시절', '어릴 때 살던 집은 어떤 모습이었나요?'],
  ['village', '어린 시절', '어릴 때 살던 동네에는 무엇이 있었나요?'],
  ['play', '어린 시절', '어릴 때 친구들과 무슨 놀이를 하며 놀았나요?'],
  ['food', '어린 시절', '어릴 때 제일 맛있게 먹었던 음식은 무엇인가요?'],
  ['snack', '어린 시절', '어릴 때 좋아했던 간식이나 군것질은 무엇이었나요?'],
  ['pet', '어린 시절', '어릴 때 집에서 키우던 동물이 있었나요?'],
  ['scold', '어린 시절', '어릴 때 크게 혼났던 일이 있나요?'],
  ['brave', '어린 시절', '어릴 때 가장 용감했던 순간은 언제였나요?'],
  ['dream', '어린 시절', '어릴 때 커서 무엇이 되고 싶었나요?'],
  ['holiday', '어린 시절', '어릴 때 설날이나 추석은 어떻게 보냈나요?'],
  ['winter', '어린 시절', '어릴 때 겨울에는 무엇을 하며 놀았나요?'],
  ['summer', '어린 시절', '어릴 때 여름에는 어디서 더위를 식혔나요?'],
  ['school1', '학교', '처음 학교에 가던 날이 기억나나요?'],
  ['teacher', '학교', '기억에 남는 선생님이 계신가요?'],
  ['friend', '학교', '학교 다닐 때 가장 친했던 친구는 누구였나요?'],
  ['lunch', '학교', '학교에 싸 가던 도시락에는 무엇이 들어 있었나요?'],
  ['trip', '학교', '소풍이나 수학여행 가던 날 이야기를 들려주세요.'],
  ['sports', '학교', '운동회 날 무슨 일이 있었나요?'],
  ['mom', '가족', '어머니는 어떤 분이셨나요?'],
  ['dad', '가족', '아버지는 어떤 분이셨나요?'],
  ['sibling', '가족', '형제자매와 있었던 재미난 일이 있나요?'],
  ['grandma', '가족', '내 할머니·할아버지는 어떤 분이셨나요?'],
  ['family-food', '가족', '우리 집만의 특별한 음식이 있었나요?'],
  ['family-rule', '가족', '어릴 때 집에서 꼭 지켜야 했던 약속이 있었나요?'],
  ['first-job', '젊은 날', '처음으로 돈을 벌었던 일은 무엇이었나요?'],
  ['meet', '젊은 날', '{짝}를 처음 만난 날 이야기를 들려주세요.'],
  ['wedding', '젊은 날', '결혼하던 날은 어땠나요?'],
  ['first-home', '젊은 날', '처음으로 꾸린 우리 집은 어떤 곳이었나요?'],
  ['hard', '젊은 날', '살면서 가장 힘들었던 때를 어떻게 이겨냈나요?'],
  ['proud', '젊은 날', '살면서 가장 뿌듯했던 일은 무엇인가요?'],
  ['travel', '젊은 날', '가장 기억에 남는 여행은 어디였나요?'],
  ['song', '젊은 날', '젊을 때 즐겨 부르던 노래는 무엇인가요?'],
  ['born', '엄마·아빠 이야기', '손주의 엄마(아빠)가 태어나던 날이 기억나나요?'],
  ['baby', '엄마·아빠 이야기', '손주의 엄마(아빠)는 어릴 때 어떤 아이였나요?'],
  ['naughty', '엄마·아빠 이야기', '손주의 엄마(아빠)가 어릴 때 했던 장난이 있나요?'],
  ['parent-proud', '엄마·아빠 이야기', '손주의 엄마(아빠)가 자랑스러웠던 순간은 언제였나요?'],
  ['grandkid', '손주에게', '손주가 처음 태어났을 때 어떤 마음이었나요?'],
  ['grandkid-like', '손주에게', '손주와 함께 해 보고 싶은 일은 무엇인가요?'],
  ['wish', '손주에게', '손주가 어떤 사람으로 자라면 좋겠나요?'],
  ['advice', '손주에게', '손주가 힘들 때 꼭 해 주고 싶은 말은 무엇인가요?'],
  ['secret', '손주에게', '손주에게만 알려 주고 싶은 비밀이 있나요?'],
  ['recipe', '손주에게', '손주에게 꼭 물려주고 싶은 요리 비법이 있나요?'],
  ['season', '좋아하는 것', '가장 좋아하는 계절과 그 까닭은 무엇인가요?'],
  ['flower', '좋아하는 것', '가장 좋아하는 꽃이나 나무는 무엇인가요?'],
  ['place', '좋아하는 것', '마음이 편해지는 나만의 장소가 있나요?'],
  ['happy', '좋아하는 것', '요즘 가장 행복한 순간은 언제인가요?'],
  ['change', '그때와 지금', '어릴 때와 지금, 가장 많이 달라진 것은 무엇인가요?'],
  ['old-thing', '그때와 지금', '요즘 아이들은 모르는 옛날 물건을 소개해 주세요.'],
];

const byId = new Map(QUESTIONS.map((q) => [q[0], q]));
export const questionOf = (id) => byId.get(id) || null;
// {짝}: 할머니가 쓰면 할아버지, 할아버지가 쓰면 할머니
export const askText = (q, role) => q[2].replace('{짝}', role === 'grandpa' ? '할머니' : '할아버지');

export const memoirRaw = () => mine.getRaw(MEMOIR_ID);
export const answeredIds = () => new Set((memoirRaw()?.pages || []).map((p) => p.q).filter(Boolean));

// 오늘의 질문: 날짜로 정해서 하루 동안은 같은 질문이 나와요. skip 만큼 다음 질문으로 넘겨요.
export function todayQuestion(skip = 0, now = new Date()) {
  const done = answeredIds();
  const left = QUESTIONS.filter((q) => !done.has(q[0]));
  if (!left.length) return null;
  const day = Math.floor((now.getTime() - now.getTimezoneOffset() * 60e3) / 864e5);
  return left[(day + skip) % left.length];
}

// 대답을 옛날 이야기 책의 한 장면으로 저장하고, 몇 번째 장면인지(0부터) 돌려줘요.
export function saveAnswer(qid, text, { title, role, seed = 0, when = '' }) {
  const q = questionOf(qid);
  if (!q || !text.trim()) return -1;
  const raw = memoirRaw() || { id: MEMOIR_ID, title, memoir: true, pages: [] };
  if (raw.pages.length >= MAX_ANSWERS) return -1;
  const w = cleanWhen(when);
  raw.pages.push({ text: text.trim(), seed, q: qid, ask: askText(q, role), ...(w ? { when: w } : {}) });
  return mine.saveRaw(raw) ? raw.pages.length - 1 : -1;
}

// 인생 연표: 질문 갈래를 삶의 때(어린 시절 → 학교 → 젊은 날 → 엄마·아빠를 키울 때 → 지금)로 묶어요.
export const ERAS = [
  ['🧒', '어린 시절'],
  ['🎒', '학교 다닐 때'],
  ['🌸', '젊은 날'],
  ['👶', '엄마·아빠를 키울 때'],
  ['🌳', '지금, 손주에게'],
];
const ERA_OF = { '어린 시절': 0, 가족: 0, 학교: 1, '젊은 날': 2, '엄마·아빠 이야기': 3, 손주에게: 4, '좋아하는 것': 4, '그때와 지금': 4 };
export const cleanWhen = (w) => String(w || '').replace(/[^0-9가-힣a-zA-Z ~.]/g, '').trim().slice(0, 12);
// 장면(p.q 또는 p.ask)으로 때를 찾아요. 모르면 맨 끝(지금)에 둬요.
export function eraOf(p) {
  const q = questionOf(p?.q) || QUESTIONS.find((x) => p?.ask && (x[2] === p.ask || askText(x, 'grandma') === p.ask || askText(x, 'grandpa') === p.ask));
  return q ? ERA_OF[q[1]] ?? 4 : 4;
}
// 적어 둔 때에서 연도(1950~2099)를 찾아요. 없으면 null.
export const yearOf = (when) => {
  const m = String(when || '').match(/(19[0-9]{2}|20[0-9]{2})/);
  return m ? Number(m[1]) : null;
};
// 연표 순서: 때 → 적은 연도 → 원래 순서
export function timeline(pages) {
  return pages.map((p, k) => ({ ...p, k, era: eraOf(p), year: yearOf(p.when) }))
    .sort((a, b) => a.era - b.era || (a.year ?? 9999) - (b.year ?? 9999) || a.k - b.k);
}
