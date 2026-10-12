// 글 → 그림 조립 (브라우저 없이): 낱말 찾기, 뜻이 둘인 말, 인물 수
import { analyze, describe, compose } from '../composer.js';

export default async function ({ check }) {
  const who = (t, o) => describe(t, o).who.join(', ');
  const things = (t) => analyze(t).things;
  check('강아지와 고양이가 사과나무에서 사과를 → 과일나무', describe('강아지와 고양이가 사과나무에서 사과를 까먹었어요.').things.includes('사과나무'));
  check('"사과했어요"는 사과를 그리지 않아요', !things('토끼는 미안하다고 사과했어요.').includes('apple'));
  check('"배가 고파서"는 배·과일을 그리지 않아요', !things('배가 고파서 울었어요.').some((k) => k === 'boat' || k === 'pear'));
  check('"모자라요"는 모자를 그리지 않아요', !things('쌀이 모자라요.').includes('hat'));
  check('"아이스크림"은 아이를 그리지 않아요', !who('아이스크림을 먹었어요.').includes('아이'));
  check('"도깨비를"은 비로 읽지 않아요', !analyze('산속에서 도깨비를 만났어요.').weather.includes('rain'));
  check('"기차를 타고"는 기차', things('기차를 타고 갔어요.').includes('train'));
  check('돼지 삼형제 → 돼지 ×3', who('돼지 삼형제가 집을 지었어요.') === '돼지 ×3');
  check('강아지 두 마리 → 강아지 ×2', who('강아지 두 마리가 뛰놀았어요.') === '강아지 ×2');
  check('쌍둥이 손녀 → 여자아이 ×2', who('쌍둥이 손녀가 웃었어요.') === '여자아이 ×2');
  check('"모두 강아지를"은 한 마리', who('모두 강아지를 좋아했어요.') === '강아지');
  check('다섯 명까지 그려요', analyze('할머니, 할아버지, 엄마, 아빠, 손녀가 다 같이 웃었어요.').ground.length === 5);
  check('아무도 안 나오면 풍경만', analyze('옛날 깊은 산골 마을에 맑은 시냇물이 흘렀어요.').ground.length === 0);
  check('인물 빼기는 이름이 나와도 풍경만', analyze('할머니가 웃었어요.', 0, { noCast: true }).ground.length === 0);
  const svg = compose('들판에서 연을 날리는데 파랑새가 날아왔어요.');
  check('사람이 없어도 연은 하늘을 날아요', svg.includes('M0-60L40 0L0 60L-40 0Z'));
  check('같은 글 + 같은 번호면 같은 그림', compose('밤에 손녀가 웃었어요.', 2) === compose('밤에 손녀가 웃었어요.', 2));
}
