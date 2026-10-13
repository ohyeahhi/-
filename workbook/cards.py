# 대화 카드 생성기 (63×88mm). 워크북 최종 디자인(겹친 노랑 원, 회색 칩, Q 번호)과 같은 모양.
# 사용법: python3 cards.py  → cards_{before,after}_{print,back,sheet}.html
import html

from build import FONTS
from cards_data import AFTER, BEFORE

E = html.escape
W, H, B = 63, 88, 3  # 카드 크기, 재단 여백(mm)
INK, INK2, INK3 = "#191F28", "#4E5968", "#8B95A1"
Y, YS, YI, GRAY = "#FFC93C", "#FFF5D6", "#B07A00", "#F2F4F6"


def circles(size_mm, soft=YS, main=Y, cls="art"):
    return (f'<svg class="{cls}" width="{size_mm}mm" height="{size_mm}mm" viewBox="0 0 96 96">'
            f'<circle cx="40" cy="52" r="30" fill="{soft}"/><circle cx="62" cy="40" r="30" fill="{main}" fill-opacity=".92"/></svg>')


CSS = FONTS + f"""
*{{box-sizing:border-box;margin:0}}
html,body{{background:#fff;color:{INK};font-family:'Pretendard',sans-serif;letter-spacing:-.02em;word-break:keep-all;
  -webkit-print-color-adjust:exact;print-color-adjust:exact}}
.card{{position:relative;width:{W}mm;height:{H}mm;overflow:hidden;background:#fff}}
.in{{position:absolute;inset:6mm 6mm 5.5mm 6mm;display:flex;flex-direction:column}}
.top{{display:flex;align-items:center;gap:1.6mm}}
.qno{{font-size:7.4pt;font-weight:800;color:{YI}}}
.chip{{display:inline-flex;align-items:center;height:4.4mm;padding:0 1.8mm;border-radius:1.2mm;background:{GRAY};color:{INK2};font-size:5.8pt;font-weight:600;white-space:nowrap}}
.chip.sit{{background:{YS};color:{YI}}}
.deck{{margin-left:auto;font-size:5.6pt;font-weight:600;color:{INK3}}}
.q{{margin-top:7mm;font-size:12.4pt;font-weight:700;line-height:1.5;letter-spacing:-.045em}}
.sit-box{{margin-top:6mm;background:{YS};border-radius:3mm;padding:3.6mm 3.8mm}}
.sit-box .q{{margin-top:0}}
.foot{{margin-top:auto;display:flex;justify-content:space-between;align-items:center}}
.brand{{font-size:5.4pt;font-weight:600;color:{INK3}}}
.mark{{width:7mm;height:7mm}}

/* 표지 카드: 워크북 표지 축소판 */
.title .art{{position:absolute;right:-9mm;top:-7mm}}
.title .ed{{font-size:5.8pt;font-weight:700;color:{YI}}}
.title .t{{margin-top:auto;font-size:17pt;font-weight:800;line-height:1.22;letter-spacing:-.05em}}
.title .tag{{margin-top:2.4mm;font-size:6.4pt;font-weight:500;color:{INK2};line-height:1.6;white-space:pre-line}}
.title .chips{{margin-top:3mm;display:flex;gap:1.2mm}}
/* 사용법 카드: 워크북 '이렇게 사용해요' 축소판 */
.how .ey{{font-size:5.8pt;font-weight:700;color:{YI}}}
.how h3{{margin-top:1mm;font-size:11.5pt;font-weight:800;letter-spacing:-.04em}}
.rules{{margin-top:3mm;display:flex;flex-direction:column;gap:1.4mm}}
.rules div{{display:flex;gap:1.8mm;align-items:flex-start;background:{GRAY};border-radius:2mm;padding:1.8mm 2mm;font-size:6.3pt;line-height:1.45;font-weight:500;color:#333D4B}}
.rules b{{flex:none;width:3.4mm;height:3.4mm;border-radius:50%;background:{Y};font-size:5.2pt;display:flex;align-items:center;justify-content:center}}
/* 뒷면 */
.back .art{{position:absolute;right:-12mm;top:-9mm}}
.back .t{{position:absolute;left:6mm;bottom:12mm;font-size:18pt;font-weight:800;line-height:1.2;letter-spacing:-.05em}}
.back .s{{position:absolute;left:6mm;bottom:6.5mm;font-size:6pt;font-weight:600}}
"""


def front(deck, cat, n, q):
    sit = q.startswith("상황:")
    q = q[3:] if sit else q
    chips = f'<span class="chip">{E(cat)}</span>' + ('<span class="chip sit">상황</span>' if sit else "")
    body = f'<div class="sit-box"><div class="q">{E(q)}</div></div>' if sit else f'<div class="q">{E(q)}</div>'
    return f"""<div class="card"><div class="in">
<div class="top"><span class="qno">Q{n}</span>{chips}<span class="deck">{E(deck['short'])}</span></div>
{body}
<div class="foot"><span class="brand">결혼 전, 10번의 대화 · {E(deck['name'])}</span>{circles(7, cls='mark')}</div></div></div>"""


def title_card(deck):
    return f"""<div class="card title">{circles(46)}<div class="in">
<div class="ed">{E(deck['name'])}</div>
<div class="t">결혼 전,<br>10번의 대화</div><div class="tag">{E(deck['tagline'])}</div>
<div class="chips"><span class="chip">{len(deck['cats'])}개의 주제</span><span class="chip">{sum(len(q) for _, q in deck['cats'])}개의 질문</span></div></div></div>"""


def how_card(deck):
    rules = "".join(f"<div><b>{i+1}</b><span>{E(r)}</span></div>" for i, r in enumerate(deck["rules"]))
    return f"""<div class="card how"><div class="in">
<div class="ey">{E(deck['name'])}</div><h3>이렇게 이야기해요</h3><div class="rules">{rules}</div>
<div class="foot"><span class="brand">결혼 전, 10번의 대화</span>{circles(7, cls='mark')}</div></div></div>"""


def back_card(deck, dark):
    bg, fg, soft = (INK, "#fff", "#3A3F48") if dark else ("#fff", INK, YS)
    return f"""<div class="card back" style="background:{bg};color:{fg}">{circles(60, soft=soft)}
<div class="t">{E(deck['short'])}<br>대화 카드</div><div class="s" style="color:{YI if not dark else Y}">결혼 전, 10번의 대화</div></div>"""


def cards(deck):
    out = [title_card(deck), how_card(deck)]
    n = 0
    for cat, qs in deck["cats"]:
        for q in qs:
            n += 1
            out.append(front(deck, cat, n, q))
    return out


def page(title, size, body, extra=""):
    return f"""<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>{E(title)}</title>
<style>{CSS}@page{{size:{size};margin:0}}{extra}</style></head><body>{body}</body></html>"""


# 인쇄소용: 카드 한 장 = 한 페이지, 사방 3mm 재단 여백
PRINT = f""".pg{{width:{W+2*B}mm;height:{H+2*B}mm;position:relative;overflow:hidden;break-after:page}}
.pg>.card{{position:absolute;left:0;top:0;width:{W+2*B+1}mm;height:{H+2*B+1}mm}}
.pg>.card>.in{{margin:{B}mm}}
.pg>.card>.art{{margin:{B}mm}}
.pg>.back .t,.pg>.back .s{{margin-left:{B}mm;margin-bottom:{B}mm}}"""

# 집 출력용: A4 한 장에 3×3, 회색 재단선
SHEET = f""".sheet{{width:210mm;height:297mm;display:grid;grid-template-columns:repeat(3,{W}mm);grid-auto-rows:{H}mm;
  justify-content:center;align-content:center;break-after:page}}
.sheet>.card{{outline:.2pt dashed #B0B8C1}}"""


def wrap_print(cs):
    return "".join(f'<div class="pg">{c}</div>' for c in cs)


def wrap_sheets(cs):
    return "".join('<div class="sheet">' + "".join(cs[i:i + 9]) + "</div>" for i in range(0, len(cs), 9))


if __name__ == "__main__":
    for key, deck, dark in [("before", BEFORE, False), ("after", AFTER, True)]:
        cs = cards(deck)
        back = back_card(deck, dark)
        open(f"cards_{key}_print.html", "w").write(page(deck["name"], f"{W+2*B}mm {H+2*B}mm", wrap_print(cs), PRINT))
        bg = INK if dark else "#fff"
        open(f"cards_{key}_back.html", "w").write(page(deck["name"] + " 뒷면", f"{W+2*B}mm {H+2*B}mm", wrap_print([back]), PRINT + f"@page{{background:{bg}}}html,body{{background:{bg}}}"))
        open(f"cards_{key}_sheet.html", "w").write(page(deck["name"] + " A4", "210mm 297mm", wrap_sheets(cs) + wrap_sheets([back] * 9), SHEET))
    print("ok")
