// 수다 마을 서버: 정적 파일 + WebSocket으로 위치·채팅·게시판·꽃 물주기를 공유한다.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');
const DATA_FILE = path.join(__dirname, 'data.json');
const ANIMALS = ['cat', 'dog', 'rabbit', 'bear'];

let data = { notes: [], flowers: {} };
try { data = { ...data, ...JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) }; } catch {}
let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => fs.writeFile(DATA_FILE, JSON.stringify(data), () => {}), 500);
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(PUBLIC, urlPath === '/' ? 'index.html' : urlPath);
  if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  });
});

const wss = new WebSocketServer({ server });
const players = new Map(); // ws -> player
let nextId = 1;

const clean = (s, max) => String(s ?? '').replace(/[\u0000-\u001f]/g, '').trim().slice(0, max);
const num = (v, lo, hi) => Math.min(hi, Math.max(lo, Number(v) || 0));
function broadcast(msg) {
  const s = JSON.stringify(msg);
  for (const c of wss.clients) if (c.readyState === 1) c.send(s);
}

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    let m;
    try { m = JSON.parse(raw); } catch { return; }
    const p = players.get(ws);

    if (m.t === 'join' && !p) {
      const player = {
        id: nextId++,
        name: clean(m.name, 12) || '주민',
        animal: ANIMALS.includes(m.animal) ? m.animal : 'cat',
        color: /^#[0-9a-f]{6}$/i.test(m.color) ? m.color : '#f2b880',
        x: num(m.x, 0, 4000), y: num(m.y, 0, 4000), d: 0, lastChat: 0,
      };
      players.set(ws, player);
      ws.send(JSON.stringify({ t: 'welcome', id: player.id, notes: data.notes, flowers: data.flowers }));
      broadcast({ t: 'sys', text: `${player.name} 님이 마을에 놀러 왔어요` });
      return;
    }
    if (!p) return;

    if (m.t === 'move') {
      p.x = num(m.x, 0, 4000); p.y = num(m.y, 0, 4000); p.d = num(m.d, 0, 3) | 0;
    } else if (m.t === 'chat') {
      const text = clean(m.text, 120);
      const now = Date.now();
      if (!text || now - p.lastChat < 400) return;
      p.lastChat = now;
      broadcast({ t: 'chat', id: p.id, name: p.name, text });
    } else if (m.t === 'note') {
      const text = clean(m.text, 140);
      if (!text) return;
      data.notes.unshift({ name: p.name, text, at: Date.now() });
      data.notes = data.notes.slice(0, 60);
      save();
      broadcast({ t: 'notes', notes: data.notes });
    } else if (m.t === 'water') {
      const key = clean(m.key, 12);
      if (!/^\d+,\d+$/.test(key)) return;
      const f = data.flowers[key] || { count: 0, at: 0, by: '' };
      f.count++; f.at = Date.now(); f.by = p.name;
      data.flowers[key] = f;
      save();
      broadcast({ t: 'water', key, flower: f });
    }
  });

  ws.on('close', () => {
    const p = players.get(ws);
    players.delete(ws);
    if (p) broadcast({ t: 'sys', text: `${p.name} 님이 집으로 돌아갔어요` });
  });
});

// 위치는 초당 10번 묶어서 보낸다.
setInterval(() => {
  const list = [...players.values()].map(({ id, name, animal, color, x, y, d }) => ({ id, name, animal, color, x, y, d }));
  broadcast({ t: 'state', players: list });
}, 100);

server.listen(PORT, () => console.log(`수다 마을: http://localhost:${PORT}`));
