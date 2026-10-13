# 대화 카드 생성기 (63×88mm, 워크북 노랑 스타일)
# 사용법: python3 cards.py  → cards_{before,after}_{print,back,sheet}.html
import html

from build import FONTS
from cards_data import AFTER, BEFORE

E = html.escape
W, H, B = 63, 88, 3  # 카드 크기, 재단 여백(mm)
INK, Y, YS = "#191F28", "#FFC93C", "#FFF5D6"

# 주제마다 하나씩, 내용을 단순한 도형으로 옮긴 기호 (viewBox 0 0 40 40, 노랑 면 + 먹색 선)
S = f'fill="none" stroke="{INK}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"'
ICONS = {
    "자란 집": f'<rect x="9" y="18" width="22" height="16" fill="{Y}"/><path d="M6 20 L20 7 L34 20" {S}/><path d="M17 34 V26 H23 V34" {S}/>',
    "돈": f'<ellipse cx="20" cy="27" rx="12" ry="4" fill="{Y}"/><ellipse cx="20" cy="21" rx="12" ry="4" {S}/><path d="M8 21 V27 M32 21 V27" {S}/><ellipse cx="20" cy="13" rx="12" ry="4" {S}/><path d="M8 13 V19 M32 13 V19" {S}/>',
    "양가": f'<rect x="4" y="19" width="13" height="13" fill="{Y}"/><path d="M3 20 L10.5 12 L18 20 M22 20 L29.5 12 L37 20 M23 20 V32 H36 V20" {S}/><path d="M17 26 H23" {S} stroke-dasharray="1.5 2"/>',
    "집안일": f'<rect x="8" y="8" width="11" height="11" fill="{Y}"/><rect x="8" y="8" width="24" height="24" {S}/><path d="M20 8 V32 M8 20 H32" {S}/>',
    "다툼": f'<circle cx="20" cy="20" r="11" fill="{Y}"/><path d="M5 14 L11 20 L17 14 L23 20 L29 14 L35 20" {S}/><path d="M5 26 L35 26" {S}/>',
    "일과 시간": f'<path d="M20 20 L20 8 A12 12 0 0 1 32 20 Z" fill="{Y}"/><circle cx="20" cy="20" r="12" {S}/><path d="M20 12 V20 H26" {S}/>',
    "나만의 시간": f'<circle cx="27" cy="13" r="6" fill="{Y}"/><circle cx="12" cy="25" r="3" {S}/><circle cx="20" cy="30" r="3" {S}/><circle cx="8" cy="33" r="3" {S}/><circle cx="27" cy="13" r="6" {S}/>',
    "애정": f'<path d="M20 11.5 A9 9 0 0 1 20 28.5 A9 9 0 0 1 20 11.5Z" fill="{Y}"/><circle cx="15" cy="20" r="9" {S}/><circle cx="25" cy="20" r="9" {S}/>',
    "가족계획": f'<circle cx="28" cy="27" r="5" fill="{Y}"/><circle cx="15" cy="17" r="9" {S}/><circle cx="28" cy="27" r="5" {S}/>',
    "미래": f'<path d="M10 28 A10 10 0 0 1 30 28 Z" fill="{Y}"/><path d="M4 28 H36 M8 33 H32 M13 38 H27" {S}/><path d="M20 6 V11 M9 11 L12 14 M31 11 L28 14" {S}/>',
    "약속 점검": f'<rect x="8" y="8" width="24" height="24" rx="3" fill="{Y}"/><rect x="8" y="8" width="24" height="24" rx="3" {S}/><path d="M14 20 L18.5 24.5 L26.5 15.5" {S}/>',
    "우리의 일상": f'<circle cx="14" cy="20" r="7" fill="{Y}"/><circle cx="14" cy="20" r="7" {S}/><path d="M30 13 A7 7 0 1 0 30 27 A5.5 5.5 0 1 1 30 13Z" {S}/>',
    "마음 들여다보기": f'<rect x="6" y="20" width="28" height="12" fill="{Y}"/><path d="M6 14 Q10.5 9 15 14 T24 14 T33 14" {S}/><path d="M6 20 Q10.5 15 15 20 T24 20 T33 20" {S}/>',
    "다툼과 회복": f'<circle cx="20" cy="20" r="6" fill="{Y}"/><path d="M5 20 H15 M25 20 H35" {S}/><path d="M15 12 L20 20 L15 28 M25 12 L20 20 L25 28" {S}/>',
    "고마움": f'<circle cx="20" cy="20" r="5" fill="{Y}"/><path d="M20 6 V13 M20 27 V34 M6 20 H13 M27 20 H34 M10 10 L15 15 M25 25 L30 30 M30 10 L25 15 M15 25 L10 30" {S}/>',
    "앞으로의 우리": f'<circle cx="31" cy="11" r="5" fill="{Y}"/><path d="M5 33 C15 33 14 20 22 18 S30 14 31 11" {S}/><path d="M5 33 H11" {S}/>',
}


def icon(name, size):
    return f'<svg width="{size}mm" height="{size}mm" viewBox="0 0 40 40">{ICONS[name]}</svg>'


CSS = FONTS + f"""
*{{box-sizing:border-box;margin:0}}
html,body{{background:#fff;color:{INK};font-family:'Pretendard',sans-serif;letter-spacing:-.02em;word-break:keep-all;
  -webkit-print-color-adjust:exact;print-color-adjust:exact}}
.card{{position:relative;width:{W}mm;height:{H}mm;overflow:hidden;background:#fff}}
.card.sit{{background:{YS}}}
.in{{position:absolute;inset:6mm 6mm 5.5mm 6mm;display:flex;flex-direction:column}}
.top{{display:flex;justify-content:space-between;align-items:center;font-size:6.2pt;font-weight:600;color:#4E5968}}
.cat{{display:flex;align-items:center;gap:1.4mm}}
.cat i{{width:1.8mm;height:1.8mm;border-radius:50%;background:{Y}}}
.no{{color:#8B95A1;font-weight:500}}
.label{{margin-top:7mm;align-self:flex-start;font-size:5.8pt;font-weight:700;background:{Y};padding:.5mm 1.8mm;border-radius:1mm}}
.q{{margin-top:8mm;font-size:12.6pt;font-weight:700;line-height:1.48;letter-spacing:-.045em}}
.label + .q{{margin-top:2.6mm}}
.foot{{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end}}
.deck{{font-size:5.4pt;font-weight:600;color:#8B95A1;line-height:1.4}}

/* 표지 카드 */
.title .t{{margin-top:12mm;font-size:17pt;font-weight:800;line-height:1.2;letter-spacing:-.05em}}
.title .tag{{margin-top:3mm;font-size:6.6pt;font-weight:500;color:#4E5968;line-height:1.6;white-space:pre-line}}
.grid{{margin-top:auto;display:grid;grid-template-columns:repeat(5,1fr);gap:1.2mm}}
.grid svg{{width:100%;height:auto}}
/* 사용법 카드 */
.how h3{{margin-top:5mm;font-size:12pt;font-weight:800;letter-spacing:-.04em}}
.rules{{margin-top:3.5mm;display:flex;flex-direction:column;gap:2.2mm}}
.rules div{{display:flex;gap:2mm;font-size:6.9pt;line-height:1.5;font-weight:500;color:#333D4B}}
.rules b{{flex:none;width:3.6mm;height:3.6mm;border-radius:50%;background:{Y};font-size:5.6pt;display:flex;align-items:center;justify-content:center;margin-top:.2mm}}
/* 뒷면 */
.back .in{{inset:7mm}}
.back .t{{font-size:19pt;font-weight:800;line-height:1.18;letter-spacing:-.05em}}
.back .s{{margin-top:2mm;font-size:6.6pt;font-weight:600}}
.back .grid{{grid-template-columns:repeat(5,1fr);gap:1.6mm}}
"""


def front(deck, cat, n, q):
    sit = q.startswith("상황:")
    q = q[3:] if sit else q
    label = '<div class="label">상황</div>' if sit else ""
    return f"""<div class="card{' sit' if sit else ''}"><div class="in">
<div class="top"><span class="cat"><i></i>{E(cat)}</span><span class="no">{n:02d} / 50</span></div>
{label}<div class="q">{E(q)}</div>
<div class="foot"><div class="deck">결혼 전, 10번의 대화<br>{E(deck['name'])}</div>{icon(cat, 17)}</div></div></div>"""


def title_card(deck):
    icons = "".join(icon(c, 10) for c, _ in deck["cats"])
    return f"""<div class="card title"><div class="in">
<div class="top"><span class="cat"><i></i>결혼 전, 10번의 대화</span><span class="no">52장</span></div>
<div class="t">{E(deck['name']).replace(' 대화', '<br>대화')}</div><div class="tag">{E(deck['tagline'])}</div>
<div class="grid" style="grid-template-columns:repeat({5 if len(deck["cats"]) > 6 else 6},1fr)">{icons}</div></div></div>"""


def how_card(deck):
    rules = "".join(f"<div><b>{i+1}</b><span>{E(r)}</span></div>" for i, r in enumerate(deck["rules"]))
    return f"""<div class="card how"><div class="in">
<div class="top"><span class="cat"><i></i>{E(deck['name'])}</span><span class="no">사용법</span></div>
<h3>이렇게 이야기해요</h3><div class="rules">{rules}</div>
<div class="foot"><div class="deck">결혼 전, 10번의 대화</div></div></div></div>"""


def back_card(deck, dark):
    bg, fg, ic = (INK, "#fff", Y) if dark else (Y, INK, INK)
    icons = "".join(icon(c, 10).replace(f'fill="{Y}"', f'fill="{"rgba(255,255,255,.18)" if dark else "#fff"}"').replace(f'stroke="{INK}"', f'stroke="{ic}"') for c, _ in deck["cats"])
    return f"""<div class="card back" style="background:{bg};color:{fg}"><div class="in">
<div class="t">{E(deck['short'])}<br>대화 카드</div><div class="s">결혼 전, 10번의 대화</div>
<div class="grid" style="grid-template-columns:repeat({5 if len(deck["cats"]) > 6 else 6},1fr)">{icons}</div></div></div>"""


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
.pg>.card{{position:absolute;left:0;top:0;width:{W+2*B}mm;height:{H+2*B}mm}}
.pg>.card>.in{{margin:{B}mm}}"""

# 집 출력용: A4 한 장에 3×3, 회색 재단선
SHEET = f""".sheet{{width:210mm;height:297mm;display:grid;grid-template-columns:repeat(3,{W}mm);grid-auto-rows:{H}mm;
  justify-content:center;align-content:center;break-after:page}}
.sheet>.card{{outline:.2pt dashed #B0B8C1}}"""


def wrap_print(cs):
    return "".join(f'<div class="pg">{c}</div>' for c in cs)


def wrap_sheets(cs):
    return "".join('<div class="sheet">' + "".join(cs[i:i + 9]) + "</div>" for i in range(0, len(cs), 9))


for key, deck, dark in [("before", BEFORE, False), ("after", AFTER, True)]:
    cs = cards(deck)
    back = back_card(deck, dark)
    open(f"cards_{key}_print.html", "w").write(page(deck["name"], f"{W+2*B}mm {H+2*B}mm", wrap_print(cs), PRINT))
    open(f"cards_{key}_back.html", "w").write(page(deck["name"] + " 뒷면", f"{W+2*B}mm {H+2*B}mm", wrap_print([back]), PRINT))
    open(f"cards_{key}_sheet.html", "w").write(page(deck["name"] + " A4", "210mm 297mm", wrap_sheets(cs) + wrap_sheets([back] * 9), SHEET))
print("ok")
