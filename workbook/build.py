# 결혼 전 10번의 대화 — 테스트 에디션 워크북 HTML 생성기
import html

from data import UNITS

E = html.escape

TAG_DESC = [
    ("서술", "천천히 생각하고 길게 쓰는 질문"),
    ("척도", "1~5 사이에 표시하는 질문"),
    ("순위", "우선순위를 숫자로 매기는 질문"),
    ("상황", "결혼 후 실제로 생길 장면을 상상하고 답하는 질문"),
    ("예측", "상대가 어떻게 답했을지 추측해 보는 질문"),
]

FONT_WEIGHTS = {400: "Regular", 500: "Medium", 600: "SemiBold", 700: "Bold", 800: "ExtraBold"}
FONTS = "".join(f"@font-face{{font-family:'Pretendard';font-weight:{w};src:url(fonts/Pretendard-{n}.otf)}}" for w, n in FONT_WEIGHTS.items())

CSS = FONTS + """
:root{
  --ink:#191F28; --ink2:#4E5968; --ink3:#8B95A1; --line:#E5E8EB; --bg:#F2F4F6; --field:#F7F8FA;
}
@page{size:148mm 210mm;margin:17mm 16mm 16mm 16mm}
@page cover{margin:0}
*{box-sizing:border-box}
html,body{margin:0;background:#fff;color:var(--ink);font-family:'Pretendard',sans-serif;font-size:9pt;line-height:1.6;
  letter-spacing:-.01em;-webkit-print-color-adjust:exact;print-color-adjust:exact;word-break:keep-all}
.page{break-after:page}
.page:last-child{break-after:auto}

/* cover */
.cover{page:cover;height:210mm;width:148mm;position:relative;overflow:hidden;background:#fff}
.cover .trim{position:absolute;left:var(--bleed);top:var(--bleed);width:148mm;height:210mm}
.back .mark{position:absolute;left:16mm;bottom:20mm;display:flex;flex-direction:column;gap:2mm}
.back .mark b{font-size:11pt;font-weight:800;letter-spacing:-.04em;color:var(--ink)}
.back .mark span{font-size:7.5pt;font-weight:600;color:var(--ink3)}
.blankpage{height:1px}
.cover .art{position:absolute;right:-14mm;top:-10mm}
.cover .edition{position:absolute;top:18mm;left:16mm;font-size:7.5pt;font-weight:600;color:var(--accent-ink);letter-spacing:.02em}
.cover h1{position:absolute;top:100mm;left:16mm;right:16mm;margin:0;font-weight:800;font-size:31pt;line-height:1.22;letter-spacing:-.045em}
.cover .sub{position:absolute;top:131mm;left:16mm;right:16mm;font-size:10pt;font-weight:500;color:var(--ink2);line-height:1.6;letter-spacing:-.02em}
.cover .units{position:absolute;top:150mm;left:16mm;display:flex;gap:2mm}
.chip{display:inline-flex;align-items:center;height:6.4mm;padding:0 3mm;border-radius:3.2mm;background:var(--bg);color:var(--ink2);font-size:7.5pt;font-weight:600;white-space:nowrap}
.cover .owner{position:absolute;bottom:16mm;left:16mm;right:16mm;height:13mm;border-radius:3.5mm;background:var(--bg);
  display:flex;align-items:center;padding:0 5mm;font-size:8.5pt;font-weight:600;color:var(--ink3)}

/* type */
.eyebrow{font-size:8pt;font-weight:700;color:var(--accent-ink);margin-bottom:1.5mm;letter-spacing:-.01em}
h2{font-weight:800;font-size:19pt;line-height:1.3;letter-spacing:-.04em;margin:0 0 3mm}
h3{font-weight:700;font-size:11pt;letter-spacing:-.03em;margin:8mm 0 3mm}
.lead{font-size:9.5pt;color:var(--ink2);line-height:1.65;margin:0 0 7mm}

/* steps & lists */
.steps{display:flex;flex-direction:column;gap:2.4mm}
.step{display:flex;gap:4mm;align-items:flex-start;background:var(--bg);border-radius:3.5mm;padding:4mm 4.5mm}
.num{flex:none;width:6.4mm;height:6.4mm;border-radius:50%;background:var(--accent);color:var(--on-accent);font-size:8pt;font-weight:700;
  display:flex;align-items:center;justify-content:center;line-height:1}
.step b{display:block;font-size:9.8pt;font-weight:700;letter-spacing:-.02em;margin-bottom:.4mm}
.step span{color:var(--ink2);font-size:8.6pt}
.legend{display:flex;flex-direction:column;gap:2.2mm}
.legend div{display:flex;gap:3mm;align-items:center;font-size:8.6pt;color:var(--ink2)}
.legend .tag{width:11mm;justify-content:center}
.checks{display:flex;flex-direction:column;gap:4.2mm;margin-top:2mm}
.checks div{display:flex;gap:3.5mm;align-items:flex-start;font-size:9.4pt;line-height:1.55}
.checks svg{flex:none;margin-top:.4mm}
.callout{margin-top:8mm;background:var(--accent-soft);border-radius:3.5mm;padding:4.5mm 5mm;font-size:8.6pt;color:var(--ink2)}
.callout b{display:block;color:var(--accent-ink);font-size:9.2pt;margin-bottom:.8mm}

.tag{display:inline-flex;align-items:center;height:5mm;padding:0 2.2mm;border-radius:1.4mm;background:var(--bg);color:var(--ink2);
  font-size:7pt;font-weight:600;white-space:nowrap;letter-spacing:0}
.tag.상황{background:var(--accent-soft);color:var(--accent-ink)}

/* unit opener */
.opener{height:177mm;display:flex;flex-direction:column}
.opener .unit{margin-top:14mm;font-size:9pt;font-weight:700;color:var(--accent-ink)}
.opener h2{font-size:30pt;letter-spacing:-.05em;line-height:1.2;margin:2mm 0 6mm}
.opener .intro{font-size:10.5pt;color:var(--ink2);line-height:1.7;letter-spacing:-.02em}
.promise{margin-top:auto;background:var(--bg);border-radius:4.5mm;padding:5mm}
.promise .t{font-size:10pt;font-weight:700;letter-spacing:-.02em;margin:0 0 3.5mm 1mm}
.row{display:flex;align-items:center;height:10.5mm;background:#fff;border-radius:2.6mm;padding:0 4mm;margin-bottom:1.8mm;font-size:8.6pt;color:var(--ink3);font-weight:500}
.row:last-child{margin-bottom:0}

/* questions */
.runhead{display:flex;justify-content:space-between;font-size:7.4pt;font-weight:600;color:var(--ink3);margin-bottom:7mm}
.q{break-inside:avoid;margin-bottom:7mm}
.qmeta{display:flex;align-items:center;gap:2mm;margin-bottom:1.6mm}
.qno{font-size:9pt;font-weight:800;color:var(--accent-ink);letter-spacing:-.01em}
.qtext{font-size:11pt;font-weight:600;line-height:1.55;letter-spacing:-.03em;margin-bottom:3.2mm}
.q.상황 .qtext{background:var(--accent-soft);border-radius:3.5mm;padding:3.6mm 4.4mm;color:var(--ink)}
.field{background:var(--field);border-radius:3.5mm;padding:1mm 4.4mm 3mm}
.field i{display:block;height:8mm;border-bottom:.6pt solid var(--line)}
.choices{display:flex;flex-wrap:wrap;gap:1.8mm;margin-bottom:2.2mm}
.choice{display:inline-flex;align-items:center;gap:1.6mm;height:7.4mm;padding:0 3.2mm 0 2.4mm;border-radius:3.7mm;border:.6pt solid var(--line);font-size:8.4pt;font-weight:500;color:var(--ink2)}
.choice .o{width:3.4mm;height:3.4mm;border-radius:50%;border:.7pt solid #B0B8C1}
.blank{display:flex;align-items:center;gap:2.4mm;margin-bottom:2.2mm;font-size:9pt;font-weight:600;color:var(--ink2)}
.blank .u{width:34mm;height:9.5mm;border-radius:2.6mm;background:var(--field)}
.scale{display:flex;flex-direction:column;gap:3mm}
.srow .who{font-size:7.8pt;font-weight:600;color:var(--ink3);margin-bottom:1.2mm}
.seg{display:grid;grid-template-columns:repeat(5,1fr);gap:1.4mm}
.seg span{height:9mm;border-radius:2.4mm;background:var(--field);border:.6pt solid var(--line);display:flex;align-items:center;justify-content:center;font-size:8.6pt;font-weight:600;color:var(--ink3)}
.ends{display:flex;justify-content:space-between;margin-top:1.2mm;font-size:7.4pt;font-weight:500;color:var(--ink3)}
.rank{display:grid;grid-template-columns:1fr 1fr;gap:1.6mm}
.rank div{display:flex;align-items:center;gap:2.6mm;height:9.5mm;background:var(--field);border-radius:2.6mm;padding:0 2mm;font-size:8.8pt;font-weight:500}
.rank .nb{width:6.2mm;height:6.2mm;border-radius:1.6mm;background:#fff;border:.6pt solid var(--line)}

/* together */
.tblock{margin-bottom:4.5mm;break-inside:avoid}
.tblock .k{font-size:10pt;font-weight:700;letter-spacing:-.025em;margin-bottom:2mm}
.tblock .hint{font-size:8pt;color:var(--ink3);margin:-1.2mm 0 2mm}
.dot{display:inline-block;width:2mm;height:2mm;border-radius:50%;background:var(--accent);margin-right:2mm;vertical-align:.4mm}
.sign{display:grid;grid-template-columns:1fr 1fr;gap:2mm}
.sign div{height:11mm;border-radius:2.6mm;background:var(--field);display:flex;align-items:center;padding:0 4mm;font-size:8pt;font-weight:600;color:var(--ink3)}
.signoff{margin-top:2mm;background:var(--bg);border-radius:4.5mm;padding:4.5mm}
.signoff .row{background:#fff}
.signoff .sign div{background:#fff}

/* feedback */
.fb .q{margin-bottom:3.2mm}
.fb .qtext{font-size:9.4pt;margin-bottom:1.6mm}
.fb .field i{height:6.4mm}.fb .ends{margin-top:.6mm}
.fb .seg span{height:7mm}
"""

ART = """<svg class="art" width="96mm" height="96mm" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
<circle cx="40" cy="52" r="30" style="fill:var(--accent-soft)"/>
<circle cx="62" cy="40" r="30" style="fill:var(--accent)" fill-opacity=".92"/>
</svg>"""

CHECK = """<svg width="5.2mm" height="5.2mm" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" style="fill:var(--accent-soft)"/>
<path d="M6 10.4l2.7 2.6L14 7.6" fill="none" style="stroke:var(--accent-check)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>"""


def lines(n):
    return '<div class="field">' + "<i></i>" * n + "</div>" if n else ""


def scale_html(rows):
    out = ['<div class="scale">']
    for who, l, r in rows:
        segs = "".join(f"<span>{i}</span>" for i in range(1, 6))
        who_html = f'<div class="who">{E(who)}</div>' if who else ""
        out.append(f'<div class="srow">{who_html}<div class="seg">{segs}</div><div class="ends"><span>{E(l)}</span><span>{E(r)}</span></div></div>')
    out.append("</div>")
    return "".join(out)


def choices(items):
    return '<div class="choices">' + "".join(f'<span class="choice"><span class="o"></span>{E(c)}</span>' for c in items) + "</div>"


def question(i, q):
    t = q["t"]
    parts = [f'<div class="q {t}"><div class="qmeta"><span class="qno">Q{i}</span><span class="tag {t}">{t}</span></div>',
             f'<div class="qtext">{E(q["q"])}</div>']
    if "choices" in q:
        parts.append(choices(q["choices"]))
    if "blank" in q:
        parts.append(f'<div class="blank"><span class="u"></span><span>{E(q["blank"])}</span></div>')
    if "scale" in q:
        parts.append(scale_html(q["scale"]))
    if "items" in q:
        parts.append('<div class="rank">' + "".join(f'<div><span class="nb"></span>{E(it)}</div>' for it in q["items"]) + "</div>")
    parts.append(lines(q.get("lines", 0)))
    parts.append("</div>")
    return "".join(parts)


THEMES = {
    # accent: 채움색, accent-soft: 연한 배경, accent-ink: 강조 글자색, on-accent: 채움색 위 글자, accent-check: 체크 표시
    "노랑": {"accent": "#FFC93C", "accent-soft": "#FFF5D6", "accent-ink": "#B07A00", "on-accent": "#191F28", "accent-check": "#E0A800"},
    "회색": {"accent": "#333D4B", "accent-soft": "#E9ECEF", "accent-ink": "#333D4B", "on-accent": "#FFFFFF", "accent-check": "#333D4B"},
}
THEME = THEMES["노랑"]


BLEED = 0  # mm. 인쇄소용은 3


def page_css():
    b = BLEED
    return (f"@page{{size:{148+2*b}mm {210+2*b}mm;margin:{17+b}mm {16+b}mm {16+b}mm {16+b}mm}}"
            f".cover{{height:{210+2*b}mm;width:{148+2*b}mm}}:root{{--bleed:{b}mm}}")


def doc(title, pages):
    theme = page_css() + ":root{" + "".join(f"--{k}:{v};" for k, v in THEME.items()) + "}"
    return f"""<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>{E(title)}</title>
<style>{CSS}{theme}</style></head><body>{''.join(pages)}</body></html>"""


def runhead(u, right):
    return f'<div class="runhead"><span>{u["no"]}  {E(u["title"])}</span><span>{right}</span></div>'


def cover(edition, sub, owner_label):
    chips = "".join(f'<span class="chip">{u["no"]} {E(u["title"])}</span>' for u in UNITS)
    return f"""<section class="page cover"><div class="trim">{ART}<div class="edition">{E(edition)}</div>
<h1>결혼 전,<br>10번의 대화</h1>
<div class="sub">{sub}</div>
<div class="units">{chips}</div>
<div class="owner">{E(owner_label)}</div></div></section>"""


def howto():
    steps = [("약속 잡기", "단원 첫 장에 대화 날짜와 장소를 함께 적어요."),
             ("각자 쓰기 · 3~7일", "혼자 있는 시간에 천천히 답을 적어요. 상대의 워크북은 대화 날까지 열어 보지 않아요."),
             ("대화 데이트 · 1~3시간", "타이머를 켜고 질문마다 번갈아 답을 읽고 이야기해요."),
             ("함께 기록", "합의한 것, 아직 다른 것, 다시 이야기할 것을 함께 기록지에 남겨요.")]
    st = "".join(f'<div class="step"><span class="num">{i+1}</span><div><b>{a}</b><span>{b}</span></div></div>' for i, (a, b) in enumerate(steps))
    legend = "".join(f'<div><span class="tag {t}">{t}</span>{E(d)}</div>' for t, d in TAG_DESC)
    return f"""<section class="page"><div class="eyebrow">시작하기 전에</div><h2>이렇게 사용해요</h2>
<p class="lead">두 사람이 같은 질문이 담긴 워크북을 한 권씩 가져요. 결혼 후 가장 많이 부딪히는 이야기를 미리 꺼내 보는 시간이에요.</p>
<div class="steps">{st}</div>
<h3>질문 형식</h3><div class="legend">{legend}</div></section>"""


def guide():
    rules = ["상대 답을 끝까지 듣고, 평가하기 전에 “그렇게 생각한 이유”를 먼저 물어봐요.",
             "타이머로 한 사람당 5분씩 번갈아 말해요. 말하는 동안 상대는 끊지 않아요.",
             "상황 질문에는 정답이 없어요. “내 마음”을 이야기해요.",
             "오늘 결론을 못 내도 괜찮아요. “아직 다른 것”에 적고 넘어가요.",
             "한 단원이 3시간을 넘기면 멈추고 다음 날 이어서 해요.",
             "대화가 끝나면 서로에게 고마웠던 답 하나를 말해 줘요."]
    ch = "".join(f"<div>{CHECK}<span>{E(r)}</span></div>" for r in rules)
    return f"""<section class="page"><div class="eyebrow">대화 가이드</div><h2>대화 전에 함께<br>소리 내어 읽어요</h2>
<p class="lead">진지한 질문일수록 규칙이 있어야 안전하게 이야기할 수 있어요.</p>
<div class="checks">{ch}</div>
<div class="callout"><b>함께 기억해 주세요</b>같은 주제에서 반복해서 막히거나 대화가 상처로 끝난다면, 혼전 상담이나 부부 상담을 함께 받아 보길 권해요. 그것도 이 워크북이 제 역할을 한 거예요.</div>
</section>"""


def opener(u):
    rows = "".join(f'<div class="row">{k}</div>' for k in ["대화 날짜", "시간", "장소", "각자 쓰기 마감"])
    return f"""<section class="page"><div class="opener"><div class="unit">UNIT {u['no']}</div><h2>{E(u['title'])}</h2>
<div class="intro">{E(u['intro'])}</div>
<div class="promise"><div class="t">우리의 대화 약속</div>{rows}</div></div></section>"""


def questions(u):
    qs = "".join(question(i + 1, q) for i, q in enumerate(u["qs"]))
    return f'<section class="page">{runhead(u, "각자 쓰기")}{qs}</section>'


SIGN = '<div class="sign"><div>서명</div><div>서명</div></div>'


def together(u):
    blocks = []
    for k, v in u["together"]:
        if v == "sign":
            blocks.append(f'<div class="tblock"><div class="k">{E(k)}</div><div class="hint">동의한다면 각자 서명해 주세요.</div>{SIGN}</div>')
        elif isinstance(v, str) and v.startswith("blank:"):
            blocks.append(f'<div class="tblock"><div class="k">{E(k)}</div><div class="blank"><span class="u"></span><span>{E(v[6:])}</span></div></div>')
        else:
            blocks.append(f'<div class="tblock"><div class="k">{E(k)}</div>{lines(v)}</div>')
    cols = "".join(f'<div class="tblock"><div class="k"><span class="dot"></span>{k}</div>{lines(3)}</div>' for k in ["합의한 것", "아직 다른 것", "다음에 다시 이야기할 것"])
    return f"""<section class="page">{runhead(u, "함께 기록")}<h2>함께 기록</h2>
<p class="lead">대화가 끝난 뒤 두 사람이 함께 적어요.</p>{''.join(blocks)}</section>
<section class="page">{runhead(u, "함께 기록")}{cols}
<div class="signoff"><div class="row">대화한 날</div><div style="height:1.8mm"></div>{SIGN}</div></section>"""


def back_cover(edition):
    art = """<svg width="20mm" height="14mm" viewBox="0 0 20 14"><circle cx="7" cy="7" r="6" style="fill:var(--accent-soft)"/><circle cx="13" cy="7" r="6" style="fill:var(--accent)" fill-opacity=".92"/></svg>"""
    return f"""<section class="page cover back"><div class="trim"><div class="mark">{art}<b>결혼 전, 10번의 대화</b><span>{E(edition)}</span></div></div></section>"""


def blank_page():
    return '<section class="page"><div class="blankpage"></div></section>'


def memo():
    return f"""<section class="page"><div class="eyebrow">메모</div><h2>더 하고 싶은 이야기</h2>
<p class="lead">대화 중에 떠오른 생각이나 다음에 이어서 할 이야기를 자유롭게 적어요.</p>{lines(16)}</section>"""


def memo2():
    return f"""<section class="page"><div class="runhead"><span>메모</span><span></span></div>{lines(20)}</section>"""


def feedback():
    sc = lambda: scale_html([["", "전혀 아니다", "매우 그렇다"]])
    qs = [
        ("각자 쓰기와 대화에 걸린 시간은 어느 정도였나요?", '<div class="blank"><span>쓰기</span><span class="u"></span><span>대화</span><span class="u"></span></div>'),
        ("대화가 가장 길어졌던 질문은 몇 번이었나요? 왜 그랬을까요?", lines(2)),
        ("불편했거나 건너뛴 질문이 있었나요? 이유도 적어 주세요.", lines(2)),
        ("대화 후 서로를 더 잘 알게 되었다고 느끼나요?", sc()),
        ("지인 커플에게 추천하고 싶나요?", sc()),
        ("워크북 2권, 함께 기록지, 대화 가이드, 타이머가 담긴 세트가 4~5만 원이라면?", choices(["우리가 사겠다", "선물하겠다", "잘 모르겠다", "사지 않겠다"])),
        ("더 있었으면 하는 주제나 질문, 자유로운 의견", lines(9)),
    ]
    item = lambda i, q, a: f'<div class="q"><div class="qmeta"><span class="qno">Q{i+1}</span></div><div class="qtext">{E(q)}</div>{a}</div>'
    body = "".join(item(i, q, a) for i, (q, a) in enumerate(qs[:5]))
    body2 = "".join(item(i + 5, q, a) for i, (q, a) in enumerate(qs[5:]))
    return f"""<section class="page fb"><div class="eyebrow">피드백</div><h2>테스트 커플 피드백</h2>
<p class="lead" style="margin-bottom:5mm">두 단원을 마친 뒤 함께 적어 주세요. 솔직한 의견이 다음 버전을 만들어요.</p>{body}</section>
<section class="page fb"><div class="runhead"><span>피드백</span><span>2 / 2</span></div>{body2}
<div class="callout"><b>고맙습니다</b>작성한 기록지는 사진으로 찍어 보내 주셔도 좋아요. 두 분의 대화가 다음 커플의 워크북을 만들어요.</div></section>"""


import sys
BLEED = int(sys.argv[1]) if len(sys.argv) > 1 else 0
suffix = "_bleed" if BLEED else ""
for theme_name, THEME in THEMES.items():
    personal = [cover("TEST EDITION · 개인 워크북", "결혼 후 가장 많이 부딪히는 이야기를<br>결혼 전에 미리 나누는 워크북", "이 워크북의 주인"), howto(), guide()]
    for u in UNITS:
        personal += [opener(u), questions(u)]
    personal += [memo(), memo2(), blank_page(), back_cover("TEST EDITION · 개인 워크북")]

    shared = [cover("TEST EDITION · 함께 기록지", "대화를 마친 뒤 두 사람이 함께 쓰는<br>우리의 약속 기록", "우리 두 사람")]
    for u in UNITS:
        shared.append(together(u))
    shared.append(feedback())
    shared.append(back_cover("TEST EDITION · 함께 기록지"))

    open(f"personal_{theme_name}{suffix}.html", "w").write(doc("결혼 전 10번의 대화 개인 워크북", personal))
    open(f"shared_{theme_name}{suffix}.html", "w").write(doc("결혼 전 10번의 대화 함께 기록지", shared))
    print("ok")
