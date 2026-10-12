// 글 → 그림 조립 (브라우저 없이): 낱말 찾기, 뜻이 둘인 말, 인물 수
import { analyze, describe, compose } from '../composer.js';
import { EMOTIONS, SITUATIONS } from '../scenes.js';

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
  const mood = (txt) => analyze(txt).ground.map((c) => c.mood).join(',');
  check('"슬펐어요" → 슬픔 (우는 얼굴 + 비구름)', mood('손녀가 강아지를 잃어버려서 너무 슬펐어요.').startsWith('sad') && compose('손녀가 너무 슬펐어요.').includes('gloomsky'));
  check('"보고 싶었어요" → 외로움', analyze('할머니는 손주가 보고 싶었어요.').mood === 'lonely');
  check('"무서워서 덜덜" → 무서움 (떨림)', mood('토끼는 무서워서 덜덜 떨었어요.') === 'scared' && compose('토끼는 무서워서 덜덜 떨었어요.').includes('class="shiver"'));
  check('걱정·부끄러움·사랑·놀람·화남', ['걱정했어요', '부끄러웠어요', '사랑해요', '깜짝 놀랐어요', '화가 났어요'].map((w) => analyze(`할머니가 ${w}.`).mood).join() === 'worried,shy,love,surprised,angry');
  check('웃는 토끼와 우는 거북이: 각자 다른 얼굴, 하늘은 그대로', mood('토끼는 깔깔 웃었고 거북이는 엉엉 울었어요.') === 'happy,crying' && analyze('토끼는 깔깔 웃었고 거북이는 엉엉 울었어요.').scene === null);
  check('"졸졸 흐르는 시냇물"은 졸음이 아니에요', analyze('졸졸 흐르는 시냇물 옆에서 고양이가 놀았어요.').mood !== 'sleep');
  // 상황 100가지: 낱말마다 그 상황으로 읽고, 그림이 오류 없이 나와요.
  const sitMiss = [];
  for (const [key, , words] of SITUATIONS) {
    for (const w of words) {
      const txt = `할머니가 ${w}`;
      try { if (!analyze(txt).situations.includes(key)) sitMiss.push(`${key}:${w}`); compose(txt); } catch (e) { sitMiss.push(`${key}:${w} 오류 ${e.message}`); }
    }
  }
  check(`상황 ${SITUATIONS.length}가지 (낱말 ${SITUATIONS.reduce((n, x) => n + x[2].length, 0)}개)를 모두 알아봐요`, SITUATIONS.length >= 100 && !sitMiss.length, sitMiss.slice(0, 8));
  const emoMiss = [];
  for (const [key, , e] of EMOTIONS) {
    for (const w of e.words) {
      const txt = `할머니가 ${w}`;
      try { compose(txt); } catch (err) { emoMiss.push(`${key}:${w} 오류`); }
      if (!Object.values(analyze(txt)).length) emoMiss.push(key);
    }
    const got = analyze(`할머니가 ${e.words[0]}`).mood;
    if (got !== key) emoMiss.push(`${key}:${e.words[0]}→${got}`);
  }
  check(`감정 ${EMOTIONS.length}가지 (표현 ${EMOTIONS.reduce((n, x) => n + x[2].words.length, 0)}개)를 그려요`, !emoMiss.length, emoMiss.slice(0, 8));
  const faceOf = (txt) => compose(txt);
  check('걱정하면 八자 눈썹 얼굴', faceOf('엄마는 걱정했어요.').includes('q3.5-4 7 0t7 0'));
  check('사랑하면 하트 눈', faceOf('할머니는 손주를 사랑해요.').includes('c-7-5-7-11-3-11'));
  check('엉엉 울면 눈물 얼굴, 슬프면 눈물 없는 얼굴', analyze('엉엉 울었어요.').mood === 'crying' && analyze('너무 슬펐어요.').mood === 'sad');
  check('"의사 선생님"은 학교가 아니라 병원', analyze('의사 선생님을 만났어요.').situations[0] === 'hospital');
  check('"온 가족이 모여" → 다섯 식구', analyze('추석날 온 가족이 모여 송편을 먹었어요.').ground.length === 5);
  check('추석 → 보름달 밤 + 잔칫상', ((x) => x.time === 'night' && x.fullMoon && x.extras.includes('feast'))(analyze('추석날 송편을 먹었어요.')));
  const svg = compose('들판에서 연을 날리는데 파랑새가 날아왔어요.');
  check('사람이 없어도 연은 하늘을 날아요', svg.includes('M0-60L40 0L0 60L-40 0Z'));
  check('같은 글 + 같은 번호면 같은 그림', compose('밤에 손녀가 웃었어요.', 2) === compose('밤에 손녀가 웃었어요.', 2));
}
