"""시범 로그인 계정 만들기: python3 tools/make_login.py 아이디 비밀번호
나온 한 줄을 config.js 의 access: [ … ] 안에 붙여 넣어요. (비밀번호 자체는 어디에도 저장되지 않아요)"""
import hashlib
import secrets
import sys

if len(sys.argv) != 3:
    sys.exit(__doc__)
uid, pw = sys.argv[1], sys.argv[2]
salt = secrets.token_hex(16)
h = hashlib.pbkdf2_hmac('sha256', pw.encode(), bytes.fromhex(salt), 100000).hex()
print(f"    {{ id: '{uid}', salt: '{salt}', hash: '{h}' }},")
