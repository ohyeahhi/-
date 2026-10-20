// 색칠놀이: 동화 그림의 테두리만 남긴 선 그림을 만들고, 누른 곳을 고른 색으로 채워요.
// 그림이 평평한 색 면으로 되어 있어서, 색이 바뀌는 경계(소벨 필터)를 찾으면 깔끔한 선이 나와요.
export const W = 800;
export const H = 600;

const loadImage = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = src;
});

// 그림(src) → 흰 바탕에 검은 선 (ImageData)
export async function lineArt(src) {
  const img = await loadImage(src);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);
  ctx.drawImage(img, 0, 0, W, H);
  const src8 = ctx.getImageData(0, 0, W, H).data;
  const lum = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) lum[i] = src8[i * 4] * 0.299 + src8[i * 4 + 1] * 0.587 + src8[i * 4 + 2] * 0.114;
  const edge = new Uint8Array(W * H);
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      const gx = -lum[i - W - 1] - 2 * lum[i - 1] - lum[i + W - 1] + lum[i - W + 1] + 2 * lum[i + 1] + lum[i + W + 1];
      const gy = -lum[i - W - 1] - 2 * lum[i - W] - lum[i - W + 1] + lum[i + W - 1] + 2 * lum[i + W] + lum[i + W + 1];
      if (gx * gx + gy * gy > 60 * 60) edge[i] = 1;
    }
  }
  const out = ctx.createImageData(W, H);
  for (let i = 0; i < W * H; i++) {
    // 선을 한 겹 두껍게 (끊어진 틈으로 색이 새지 않게)
    const on = edge[i] || edge[i - 1] || edge[i + 1] || edge[i - W] || edge[i + W];
    const v = on ? 40 : 255;
    out.data[i * 4] = v; out.data[i * 4 + 1] = v; out.data[i * 4 + 2] = v; out.data[i * 4 + 3] = 255;
  }
  // 테두리
  for (let x = 0; x < W; x++) for (const y of [0, 1, H - 2, H - 1]) out.data.fill(40, (y * W + x) * 4, (y * W + x) * 4 + 3);
  for (let y = 0; y < H; y++) for (const x of [0, 1, W - 2, W - 1]) out.data.fill(40, (y * W + x) * 4, (y * W + x) * 4 + 3);
  return out;
}

const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];

// 누른 곳(x, y)과 이어진 칸을 색으로 채워요. 선(어두운 점)에서 멈춰요.
export function fill(img, x, y, color) {
  x = Math.floor(x); y = Math.floor(y);
  if (x < 0 || y < 0 || x >= W || y >= H) return false;
  const d = img.data;
  const at = (i) => i * 4;
  const start = y * W + x;
  if (d[at(start)] < 100 && d[at(start) + 1] < 100 && d[at(start) + 2] < 100) return false;   // 선을 눌렀어요
  const [r, g, b] = hex(color);
  const same = (i) => d[at(i)] === d[at(start)] && d[at(i) + 1] === d[at(start) + 1] && d[at(i) + 2] === d[at(start) + 2];
  if (d[at(start)] === r && d[at(start) + 1] === g && d[at(start) + 2] === b) return false;
  const seen = new Uint8Array(W * H);
  const stack = [start];
  while (stack.length) {
    const i = stack.pop();
    if (seen[i] || !same(i)) continue;
    seen[i] = 1;
    const px = i % W;
    if (px > 0) stack.push(i - 1);
    if (px < W - 1) stack.push(i + 1);
    if (i >= W) stack.push(i - W);
    if (i < W * (H - 1)) stack.push(i + W);
  }
  for (let i = 0; i < W * H; i++) if (seen[i]) { d[at(i)] = r; d[at(i) + 1] = g; d[at(i) + 2] = b; }
  return true;
}
