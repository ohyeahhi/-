# 각 단원 마지막 질문 페이지의 남는 공간을 재서, 채울 메모 줄 수를 JSON으로 출력합니다.
import json, sys
import pdfplumber

MM = 72 / 25.4
LINE, HEAD, BOTTOM = 7.4, 9.0, 16  # 줄 높이, 메모 제목+여백, 아래 여백(mm)
pdf = pdfplumber.open(sys.argv[1])
texts = [p.extract_text() or "" for p in pdf.pages]
openers = [i for i, t in enumerate(texts) if t.lstrip().startswith("UNIT ")]
ends = [o - 1 for o in openers[1:]] + [next(i for i, t in enumerate(texts) if "더 하고 싶은 이야기" in t) - 1]
out = []
for e in ends:
    p = pdf.pages[e]
    bottom = max([c["bottom"] for c in p.chars] + [r["bottom"] for r in p.rects if r["height"] < 300] + [c["bottom"] for c in p.curves] + [l["bottom"] for l in p.lines])
    free = (p.height - bottom) / MM - BOTTOM - 6  # 6mm: 질문 간 여백
    n = int((free - HEAD) // LINE)
    n -= 1  # 안전 여유 한 줄
    out.append(n if n >= 3 else 0)
print(json.dumps(out))
