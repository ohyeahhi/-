// 글 → 그림 조립 (브라우저 없이): 낱말 찾기, 뜻이 둘인 말, 인물 수
import { analyze, describe, compose } from '../composer.js';
import { EMOTIONS, SITUATIONS } from '../scenes.js';
import { STORIES } from '../stories.js';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './harness.mjs';

export default async function ({ check }) {
  const who = (t, o) => describe(t, o).who.join(', ');
  const things = (t) => analyze(t).things;
  check('강아지와 고양이가 사과나무에서 사과를 → 과일나무', describe('강아지와 고양이가 사과나무에서 사과를 까먹었어요.').things.includes('사과나무'));
  check('"사과했어요"는 사과를 그리지 않아요', !things('토끼는 미안하다고 사과했어요.').includes('apple'));
  check('"배가 고파서"는 배·과일을 그리지 않아요', !things('배가 고파서 울었어요.').some((k) => k === 'boat' || k === 'pear'));
  check('"모자라요"는 모자를 그리지 않아요', !things('쌀이 모자라요.').includes('hat'));
  check('"아이스크림"은 아이를 그리지 않아요', !who('아이스크림을 먹었어요.').includes('아이'));
  check('"도깨비를"은 비로 읽지 않아요', !analyze('산속에서 도깨비를 만났어요.').weather.includes('rain'));
  // 움직씨·다른 낱말 속 이름을 동물·장소로 읽지 않아요
  check('"병아리가 자라서 닭이"는 자라를 그리지 않아요', who('병아리가 자라서 닭이 되었어.') === '병아리, 닭');
  check('"자라가 바다로"는 자라(거북)', who('자라가 바다로 갔어요.') === '거북이');
  check('"고개를 넘어"는 강아지가 아니에요', !who('고개를 넘어 할머니 댁에 갔어요.').includes('강아지'));
  check('"신선한 사과"는 신선이 아니에요', !who('신선한 사과를 샀어요.').includes('신선'));
  check('"곰곰이"·"주춤"·"꿀잠"은 곰·춤·꿀이 아니에요', !who('곰곰이 생각했어요.').includes('곰') && !analyze('주춤했어요.').action && !things('꿀잠을 잤어요.').includes('honey'));
  check('"가방에"는 방이 아니고 "부산에서"는 산이 아니에요', !describe('가방에 넣었어요.').where.length && !describe('부산에서 왔어요.').where.length);
  check('"공연을 보러"는 연이 아니에요', !things('공연을 보러 갔어요.').includes('kite') && things('연을 날렸어요.').includes('kite'));
  // 요즘 추억: 거리·역·분식·간식
  const memo1 = describe('초등학교 끝나고 포장마차에서 떡볶이를 사먹었어');
  check('포장마차 떡볶이 → 거리 + 포장마차 + 떡볶이 (비 아님)', memo1.where.includes('거리') && memo1.things.includes('포장마차') && memo1.things.includes('떡볶이') && !memo1.when.includes('비'), JSON.stringify(memo1));
  const memo2 = describe('부천역 앞에서 먹은 토스트가 맛있었어');
  check('부천역 앞 토스트 → 거리 + 역 + 토스트', memo2.where.includes('거리') && memo2.things.includes('역') && memo2.things.includes('토스트'), JSON.stringify(memo2));
  check('"그 지역에서"는 역이 아니에요', !describe('그 지역에서 살았어').things.includes('역'));
  check('"통닭"은 닭(동물)이 아니라 치킨', describe('통닭을 먹었어').things.includes('치킨') && !who('통닭을 먹었어').includes('닭'));
  check('칼국수·달고나·붕어빵·찐빵·숙제', ['칼국수', '달고나', '붕어빵', '찐빵', '숙제'].map((w) => describe(`${w}를 했어`).things[0]).join() === '국수,사탕,붕어빵,만두,책');
  check('거리 그림은 거리 배경으로', compose('부천역 앞에서 토스트를 먹었어').length > 0 && analyze('부천역 앞에서 토스트를 먹었어').place.street);
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
  check('"다른 그림"은 좌우를 뒤집거나 가까이 당겨요', compose('할머니가 웃었어요.', 1).includes('scale(-1 1)') && compose('할머니가 웃었어요.', 2).includes('scale(1.14)') && !compose('할머니가 웃었어요.', 0).includes('transform="translate(800'));
  const missing = STORIES.flatMap((s) => s.pages.map((p) => p.image).filter((img) => !fs.existsSync(path.join(ROOT, img))));
  check(`동화 ${STORIES.length}편, 편마다 10쪽, 그림 파일이 모두 있어요`, STORIES.length >= 19 && STORIES.every((s) => s.pages.length === 10) && !missing.length, missing.slice(0, 5));
  const names = (txt) => [...analyze(txt).ground, ...analyze(txt).sky].map((c) => c.name).join(',');
  check('"사과 한 개", "딸기", "인형", "미소", "태양", "냄새", "아이고"를 인물로 읽지 않아요',
    names('사과 한 개를 엄마에게 줬어요') === 'mom' && analyze('엄마가 딸기를 먹었어요').things.includes('strawberry') && names('엄마가 딸기를 먹었어요') === 'mom'
    && analyze('곰인형이 있었어요').things.includes('teddy') && !names('할머니가 미소를 지었어요').includes('cow') && !names('태양이 떴어요') && !names('맛있는 냄새가 났어요') && !names('아이고 깜짝이야'));
  check('그래도 "딸이", "형이", "소를", "양이", "새가"는 인물로 읽어요', ['딸이 웃었어요', '형이 왔어요', '소를 몰았어요', '양이 풀을 먹었어요', '새가 날아왔어요'].map(names).join() === 'girl,boy,cow,sheep,bird');
  check('"밤을 줍고"는 밤(열매), 낮 그림', analyze('할머니와 밤을 줍고 놀았어요.').time === 'day' && analyze('밤이 되자 별이 떴어요.').time === 'night');
  check('같은 글 + 같은 번호면 같은 그림', compose('밤에 손녀가 웃었어요.', 2) === compose('밤에 손녀가 웃었어요.', 2));
}
