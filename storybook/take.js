// 녹음 도우미: 녹음하는 동안 잰 소리 크기로 (1) 한마디 조언을 하고 (2) 앞뒤의 빈 소리를 찾아요.
// 빈 소리는 파일을 고치지 않고, 들을 때 건너뛸 자리(초)만 적어 둬요.
export function analyzeTake(take) {
  const xs = take?.samples || [];
  if (xs.length < 20) return null;
  const sorted = xs.map(([, v]) => v).sort((a, b) => a - b);
  const at = (q) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))];
  const noise = at(0.15);
  const peak = at(0.95);
  const loudShare = xs.filter(([, v]) => v > 0.55).length / xs.length;
  const thr = Math.max(noise * 3, 0.02);
  const first = xs.find(([, v]) => v > thr)?.[0];
  const lastHit = [...xs].reverse().find(([, v]) => v > thr)?.[0];
  const dur = take.ms / 1000;
  let trim = null;
  if (first != null && lastHit != null) {
    const s0 = Math.max(0, first / 1000 - 0.3);
    const s1 = Math.min(dur, lastHit / 1000 + 0.6);
    // 앞이 0.8초, 뒤가 1.2초 넘게 비었을 때만 잘라요. (말이 짧게 끊긴 걸 자르지 않게)
    if ((s0 > 0.8 || dur - s1 > 1.2) && s1 - s0 > 0.6) trim = [Number((s0 > 0.8 ? s0 : 0).toFixed(2)), Number((dur - s1 > 1.2 ? s1 : dur + 1).toFixed(2))];
  }
  const tip = peak < 0.03 ? 'quiet' : loudShare > 0.05 ? 'loud' : noise > 0.03 ? 'noisy' : 'good';
  return { tip, trim };
}
export const TAKE_TIPS = {
  good: '목소리가 또렷하게 담겼어요 👍',
  quiet: '목소리가 작게 담겼어요. 휴대폰을 입에서 한 뼘쯤 가까이 대고 다시 해 볼까요?',
  noisy: '주변 소리가 조금 커요. 조용한 곳에서 다시 녹음하면 더 또렷해요.',
  loud: '소리가 너무 커서 갈라질 수 있어요. 휴대폰을 조금만 떨어뜨려 주세요.',
};

