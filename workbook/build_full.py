# 전체판(10개 단원, 노랑) 생성기. 사용법: python3 build_full.py [재단여백mm] [개인 메모쪽수] [기록지 메모쪽수]
import sys

import build as b
from data_full import UNITS

b.UNITS = UNITS
b.THEME = b.THEMES["노랑"]
b.BLEED = int(sys.argv[1]) if len(sys.argv) > 1 else 0
memo_p = int(sys.argv[2]) if len(sys.argv) > 2 else 1
memo_s = int(sys.argv[3]) if len(sys.argv) > 3 else 1
import json, os
for u, n in zip(UNITS, json.loads(os.environ.get("MEMO_LINES", "[]"))):
    u["memo_lines"] = n
suffix = "_bleed" if b.BLEED else ""


def memos(k):
    return [b.memo()] + [b.memo2() for _ in range(k - 1)] if k else []


personal = [b.cover("개인 워크북", "결혼 후 가장 많이 부딪히는 이야기를<br>결혼 전에 미리 나누는 워크북", "이 워크북의 주인"), b.howto(), b.guide(), b.toc()]
for u in UNITS:
    personal += [b.opener(u), b.questions(u)]
personal += memos(memo_p) + [b.back_cover("개인 워크북")]

shared = [b.cover("함께 기록지", "대화를 마친 뒤 두 사람이 함께 쓰는<br>우리의 약속 기록", "우리 두 사람"), b.toc()]
for u in UNITS:
    shared.append(b.together(u))
shared += memos(memo_s) + [b.back_cover("함께 기록지")]

open(f"full_personal{suffix}.html", "w").write(b.doc("결혼 전 10번의 대화 개인 워크북", personal))
open(f"full_shared{suffix}.html", "w").write(b.doc("결혼 전 10번의 대화 함께 기록지", shared))
