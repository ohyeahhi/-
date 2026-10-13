# 테스트용 가짜 Supabase: Storage 올리기/받기, events 통계, orders 함수(주문·결제 승인·보관)를 흉내 내요.
#   python3 mock_supabase.py <저장 폴더> <포트>
# 금액 규칙은 pricing.js · supabase/functions/orders/index.ts 와 같아요.
import http.server, os, sys, json, datetime
ROOT = sys.argv[1]; PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8766; KEY = 'sb_publishable_test'
ORDERS = {}
KEEPS = {}
import uuid
class H(http.server.BaseHTTPRequestHandler):
    def cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'apikey, authorization, content-type, cache-control, x-upsert, prefer')
        self.send_header('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS')
    def do_OPTIONS(self):
        self.send_response(204); self.cors(); self.end_headers()
    def do_POST(self):
        if self.path == '/rest/v1/events':
            n = int(self.headers.get('content-length', 0)); ev = json.loads(self.rfile.read(n) or b'{}')
            ok = ev.get('name') in ('open', 'start', 'record', 'complete', 'share', 'listen', 'listen_end', 'invite', 'create', 'book', 'order', 'paid', 'about', 'send_parents', 'keep_view', 'reply') and (ev.get('org') is None or __import__('re').fullmatch(r'[a-z0-9-]{2,20}', ev['org'])) and 8 <= len(ev.get('device', '')) <= 40
            if ok:
                with open(os.path.join(ROOT, 'events.log'), 'a') as f: f.write(json.dumps(ev, ensure_ascii=False) + '\n')
            self.send_response(201 if ok else 403); self.cors(); self.end_headers(); return
        if self.path == '/functions/v1/orders':
            n = int(self.headers.get('content-length', 0)); body = json.loads(self.rfile.read(n) or b'{}')
            def reply(code, obj):
                self.send_response(code); self.cors(); self.send_header('content-type', 'application/json'); self.end_headers(); self.wfile.write(json.dumps(obj).encode())
            if body.get('action') == 'keep_status':
                k = KEEPS.get(body.get('shareId'))
                return reply(200, {'until': k})
            if body.get('action') == 'create' and body.get('kind') == 'keep':
                sid = body.get('shareId', '')
                if not os.path.isdir(os.path.join(ROOT, sid)): return reply(404, {'message': '녹음을 찾을 수 없어요'})
                oid = 'KEEP-' + uuid.uuid4().hex[:8].upper(); ORDERS[oid] = {'amount': 9900, 'title': '목소리 10년 보관', 'qty': 1, 'status': 'pending', 'kind': 'keep', 'shareId': sid}
                return reply(200, {'orderId': oid, 'amount': 9900, 'orderName': '할머니 목소리 10년 보관'})
            if body.get('action') == 'create':
                qty = int(body.get('qty', 0))
                if not (1 <= qty <= 10) or len(body.get('shareId', '')) != 12: return reply(400, {'message': 'bad'})
                oid = 'BOOK-' + uuid.uuid4().hex[:8].upper(); amt = 39000 + 29000 * (qty - 1) + (5000 * qty if body.get('gift') is True else 0); ORDERS[oid] = {'amount': amt, 'gift': body.get('gift') is True, 'card': (body.get('card') or '')[:80], 'title': body['title'], 'qty': qty, 'status': 'pending', 'name': body['name'], 'shareId': body['shareId']}
                return reply(200, {'orderId': oid, 'amount': amt, 'orderName': body['title'] + ' 그림책'})
            if body.get('action') == 'confirm':
                o = ORDERS.get(body.get('orderId'))
                if not o: return reply(404, {'message': '주문을 찾을 수 없어요'})
                if o['status'] == 'paid': return reply(200, {'ok': True, 'order': {'orderId': body['orderId'], 'kind': o.get('kind', 'book'), 'shareId': o.get('shareId'), 'gift': o.get('gift'), 'title': o['title'], 'qty': o['qty'], 'amount': o['amount'], 'receiptUrl': None}})
                if o['amount'] != body.get('amount'): return reply(400, {'message': '결제 금액이 주문과 달라요', 'code': 'AMOUNT_MISMATCH'})
                o['status'] = 'paid'
                if o.get('shareId'): KEEPS[o['shareId']] = (datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None) + datetime.timedelta(days=3652)).isoformat() + 'Z'
                return reply(200, {'ok': True, 'order': {'orderId': body['orderId'], 'kind': o.get('kind', 'book'), 'shareId': o.get('shareId'), 'gift': o.get('gift'), 'title': o['title'], 'qty': o['qty'], 'amount': o['amount'], 'receiptUrl': None}})
            return reply(400, {'message': 'unknown'})
        pre = '/storage/v1/object/shares/'
        if not self.path.startswith(pre): return self.err(404)
        if self.headers.get('apikey') != KEY: return self.err(401)
        rel = self.path[len(pre):]
        # supabase/storage.sql 과 같은 규칙: 앱이 쓰는 이름만 올릴 수 있어요.
        if not __import__('re').fullmatch(r'[a-z0-9]{12}/(manifest\.json|[0-9]{1,2}\.(m4a|mp4|webm|ogg)|reply-[1-9]|s-[0-9]{1,2}\.json)', rel): return self.err(403)
        dest = os.path.join(ROOT, rel)
        if os.path.exists(dest): return self.err(409)  # insert only
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        n = int(self.headers.get('content-length', 0))
        with open(dest, 'wb') as f: f.write(self.rfile.read(n))
        with open(dest + '.type', 'w') as f: f.write(self.headers.get('content-type', ''))
        self.send_response(200); self.cors(); self.send_header('content-type', 'application/json'); self.end_headers()
        self.wfile.write(json.dumps({'Key': 'shares/' + rel}).encode())
    def do_HEAD(self):
        rel = self.path[len('/storage/v1/object/public/shares/'):]; dest = os.path.join(ROOT, rel)
        if not self.path.startswith('/storage/v1/object/public/shares/') or '..' in rel or not os.path.isfile(dest): return self.err(400)
        self.send_response(200); self.cors(); self.send_header('content-type', open(dest + '.type').read()); self.send_header('content-length', str(os.path.getsize(dest))); self.end_headers()
    def do_GET(self):
        pre = '/storage/v1/object/public/shares/'
        if not self.path.startswith(pre): return self.err(404)
        rel = self.path[len(pre):]; dest = os.path.join(ROOT, rel)
        if '..' in rel or not os.path.isfile(dest): return self.err(404)
        data = open(dest, 'rb').read(); typ = open(dest + '.type').read()
        self.send_response(200); self.cors(); self.send_header('content-type', typ); self.send_header('content-length', str(len(data))); self.send_header('accept-ranges', 'bytes'); self.end_headers()
        self.wfile.write(data)
    def err(self, code):
        self.send_response(code); self.cors(); self.end_headers()
    def log_message(self, *a): pass
http.server.ThreadingHTTPServer(('127.0.0.1', PORT), H).serve_forever()
