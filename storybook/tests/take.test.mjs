// 녹음 도우미 (브라우저 없이): 소리 크기 표본으로 조언과 앞뒤 빈 소리 찾기
import { analyzeTake } from '../take.js';

// ms 마다 표본 하나: [시작 ms, 끝 ms, 크기] 구간들로 만들어요
const take = (parts, noise = 0.005) => {
  const samples = [];
  const end = parts.at(-1)[1];
  for (let t = 0; t < end; t += 16) samples.push([t, parts.find(([a, b]) => t >= a && t < b)?.[2] ?? noise]);
  return { samples, ms: end };
};

export default async function ({ check }) {
  const good = analyzeTake(take([[0, 2000, 0.005], [2000, 6000, 0.15], [6000, 9000, 0.005]]));
  check('또렷한 목소리 → good', good.tip === 'good');
  check('앞 2초·뒤 3초 빈 소리는 건너뛰어요', good.trim && Math.abs(good.trim[0] - 1.7) < 0.1 && Math.abs(good.trim[1] - 6.6) < 0.1, JSON.stringify(good.trim));
  check('빈 소리가 짧으면 자르지 않아요', analyzeTake(take([[0, 300, 0.005], [300, 5000, 0.15], [5000, 5600, 0.005]])).trim === null);
  check('작은 목소리 → quiet', analyzeTake(take([[0, 5000, 0.015]])).tip === 'quiet');
  check('시끄러운 곳 → noisy', analyzeTake(take([[0, 1000, 0.05], [1000, 5000, 0.2]], 0.05)).tip === 'noisy');
  check('너무 큰 소리 → loud', analyzeTake(take([[0, 5000, 0.7]])).tip === 'loud');
  check('표본이 없으면 조언하지 않아요', analyzeTake({ samples: [], ms: 1000 }) === null);
}
