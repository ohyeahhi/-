# 결혼 전 10번의 대화 — 테스트 에디션 워크북 HTML 생성기
import html

E = html.escape

UNITS = [
    {
        "no": "02", "title": "돈",
        "intro": "돈 갈등은 액수보다 “상의했느냐”에서 터집니다. 기준 금액과 관리 방식을 결혼 전에 숫자로 정해 두는 단원입니다.",
        "qs": [
            {"t": "서술", "q": "우리 집에서 돈은 어떤 분위기의 주제였나요? 돈 때문에 불안하거나 다투던 장면이 기억나나요?", "lines": 7},
            {"t": "척도", "q": "나는 돈을 어떻게 대하는 편인가요?", "scale": [["", "모으는 게 우선", "지금을 즐기는 게 우선"]]},
            {"t": "서술", "q": "현재 내 소득, 저축, 대출이나 빚을 솔직하게 적어 주세요. 보여주기 불편한 부분이 있다면 그 이유도 적어 주세요.", "lines": 7},
            {"t": "서술", "q": "결혼 후 통장은 어떤 방식이 좋을까요? 이유도 적어 주세요.", "choices": ["합치기", "따로 두기", "공동 통장 + 각자 용돈", "기타"], "lines": 4},
            {"t": "서술", "q": "상의 없이 써도 괜찮다고 느끼는 금액은 얼마인가요?", "blank": "만 원까지", "lines": 3},
            {"t": "상황", "q": "결혼 3개월 차, 상대가 상의 없이 150만 원짜리 운동 장비를 샀습니다. 내 마음은 어떨까요? 그리고 뭐라고 말할까요?", "lines": 8},
            {"t": "상황", "q": "한쪽 부모님이 급하게 500만 원을 빌려 달라고 하십니다. 우리는 어떻게 결정해야 할까요?", "lines": 8},
            {"t": "서술", "q": "양가 부모님 용돈이나 경조사 비용은 어떤 기준으로 정하면 공평하다고 느낄까요?", "lines": 6},
            {"t": "순위", "q": "앞으로 5년간 돈을 쓸 우선순위를 1부터 매겨 주세요.", "items": ["집", "차", "여행", "저축·투자", "양가 지원", "자기계발", "출산·육아 준비"]},
            {"t": "예측", "q": "상대는 5번에 얼마를 적었을까요?", "blank": "만 원", "lines": 2},
        ],
        "together": [
            ("우리의 통장 방식", 2),
            ("상의 기준 금액", "blank:만 원 이상은 함께 결정한다"),
            ("각자 자유롭게 쓸 월 용돈", 1),
            ("양가 지원 원칙", 3),
            ("1년 안에 함께 이룰 돈 목표", 2),
        ],
    },
    {
        "no": "03", "title": "양가 가족과 명절",
        "intro": "한국 신혼부부가 가장 예민하게 부딪히는 단원입니다. 핵심은 “내 부모님과의 일은 내가 앞장서서 조율한다”는 원칙을 함께 정하는 것입니다.",
        "qs": [
            {"t": "서술", "q": "결혼 후 우리 부모님과는 얼마나 자주 연락하고 만나면 적당하다고 생각하나요? 상대 부모님과는요?", "lines": 6},
            {"t": "서술", "q": "설과 추석은 어떻게 보내면 공평하다고 느낄까요? 이유도 적어 주세요.", "choices": ["번갈아 가기", "하루씩 나눠 가기", "우리끼리 보내기", "기타"], "lines": 4},
            {"t": "상황", "q": "상대 부모님이 주말에 연락 없이 반찬을 들고 집에 오셨습니다. 나는 어떻게 느낄까요? 상대가 어떻게 해 주길 바랄까요?", "lines": 8},
            {"t": "상황", "q": "명절에 한쪽 집에서만 일을 도맡아 하는 분위기가 되었습니다. 배우자가 옆에서 가만히 있다면 나는 어떨까요?", "lines": 8},
            {"t": "서술", "q": "양가 부모님이 우리 부부의 결정(집, 아이, 직장 등)에 의견을 내실 때, 어디까지 듣고 어디부터는 우리가 결정해야 할까요?", "lines": 6},
            {"t": "상황", "q": "내 부모님이 배우자에게 서운한 말을 하셨습니다. 나는 그 자리에서, 그리고 집에 와서 어떻게 할까요?", "lines": 8},
            {"t": "척도", "q": "나는 부모님으로부터 독립되어 있다고 느끼나요? 상대는 어떨지도 표시해 보세요.", "scale": [["나", "매우 의존적", "완전히 독립적"], ["상대 (내 예측)", "매우 의존적", "완전히 독립적"]]},
            {"t": "서술", "q": "상대 부모님을 부르는 호칭, 안부 전화, 생신 챙기기 등에서 부담되는 것이 있나요?", "lines": 6},
            {"t": "서술", "q": "앞으로 부모님이 나이 드시고 돌봄이 필요해지면 우리는 어떻게 하면 좋을까요? (합가, 근처 거주, 비용 분담 등)", "lines": 6},
            {"t": "예측", "q": "상대는 3번 상황에서 뭐라고 답했을까요?", "lines": 3},
        ],
        "together": [
            ("양가 연락·방문 원칙", 3),
            ("우리의 명절 방식", 3),
            ("각자 자기 부모님과의 일은 자기가 조율한다", "sign"),
        ],
    },
]

TAG_DESC = [
    ("서술", "천천히 생각하고 길게 쓰는 질문"),
    ("척도", "1~5 사이에 표시하는 질문"),
    ("순위", "우선순위를 숫자로 매기는 질문"),
    ("상황", "결혼 후 실제로 생길 장면을 상상하고 답하는 질문"),
    ("예측", "상대가 어떻게 답했을지 추측해 보는 질문"),
]

CSS = """
@font-face{font-family:'Gowun Batang';font-weight:400;src:url(fonts/GowunBatang-400.ttf)}
@font-face{font-family:'Gowun Batang';font-weight:700;src:url(fonts/GowunBatang-700.ttf)}
@font-face{font-family:'Noto Sans KR';font-weight:400;src:url(fonts/NotoSansKR-400.ttf)}
@font-face{font-family:'Noto Sans KR';font-weight:500;src:url(fonts/NotoSansKR-500.ttf)}
@font-face{font-family:'Noto Sans KR';font-weight:700;src:url(fonts/NotoSansKR-700.ttf)}
:root{
  --ink:#2A2E38; --muted:#7B7770; --line:#DCD4C9; --accent:#A8583F; --soft:#F5EFE8; --soft2:#EDE4D9;
  --serif:'Gowun Batang',serif; --sans:'Noto Sans KR',sans-serif;
}
@page{size:148mm 210mm;margin:16mm 15mm 16mm 15mm}
@page cover{margin:0}
*{box-sizing:border-box}
html,body{margin:0;background:#fff;color:var(--ink);font-family:var(--sans);font-size:9pt;line-height:1.65;
  -webkit-print-color-adjust:exact;print-color-adjust:exact;word-break:keep-all}
.page{break-after:page}
.page:last-child{break-after:auto}

/* cover */
.cover{page:cover;height:210mm;width:148mm;position:relative;background:var(--soft);overflow:hidden}
.cover .motif{position:absolute;left:50%;top:44mm;transform:translateX(-50%)}
.cover .edition{position:absolute;top:16mm;left:0;right:0;text-align:center;font-size:7.5pt;letter-spacing:.3em;color:var(--accent)}
.cover h1{position:absolute;top:98mm;left:0;right:0;margin:0;text-align:center;font-family:var(--serif);font-weight:700;font-size:25pt;letter-spacing:.02em;line-height:1.3}
.cover .sub{position:absolute;top:130mm;left:18mm;right:18mm;text-align:center;font-family:var(--serif);font-size:10pt;color:var(--muted);line-height:1.7}
.cover .units{position:absolute;top:154mm;left:0;right:0;text-align:center;font-size:8pt;color:var(--ink)}
.cover .owner{position:absolute;bottom:20mm;left:28mm;right:28mm;font-size:8.5pt;color:var(--muted);display:flex;align-items:flex-end;gap:3mm}
.cover .owner span.l{flex:1;border-bottom:.6pt solid var(--ink);height:6mm}

/* generic */
.kicker{font-size:7.5pt;letter-spacing:.25em;color:var(--accent);margin-bottom:2mm}
h2{font-family:var(--serif);font-weight:700;font-size:16pt;margin:0 0 5mm;line-height:1.35}
h3{font-family:var(--serif);font-weight:700;font-size:11pt;margin:7mm 0 3mm}
p{margin:0 0 3mm}
.steps{counter-reset:s;list-style:none;padding:0;margin:0}
.steps li{counter-increment:s;position:relative;padding-left:10mm;margin-bottom:4mm}
.steps li::before{content:counter(s);position:absolute;left:0;top:.2mm;width:6.2mm;height:6.2mm;border-radius:50%;
  background:var(--accent);color:#fff;font-size:8pt;font-weight:700;display:flex;align-items:center;justify-content:center;line-height:1}
.steps b{font-weight:700}
.legend{margin:0;padding:0;list-style:none}
.legend li{display:flex;gap:3mm;align-items:baseline;margin-bottom:2mm}
.note{background:var(--soft);border-radius:2mm;padding:4mm 5mm;font-size:8.5pt;margin-top:6mm}
.note b{color:var(--accent)}

.tag{display:inline-block;font-size:6.8pt;font-weight:500;letter-spacing:.05em;padding:.3mm 2mm;border-radius:1mm;
  border:.5pt solid var(--accent);color:var(--accent);white-space:nowrap;line-height:1.6}
.tag.상황{background:var(--accent);color:#fff}

/* unit opener */
.opener{height:178mm;display:flex;flex-direction:column}
.opener .num{font-family:var(--serif);font-size:56pt;color:var(--accent);line-height:1;margin-top:10mm}
.opener h2{font-size:22pt;margin:3mm 0 6mm}
.opener .intro{font-family:var(--serif);font-size:10.5pt;line-height:1.85;color:var(--ink);max-width:105mm}
.promise{margin-top:auto;border:.8pt solid var(--ink);border-radius:2mm;padding:5mm 6mm}
.promise .t{font-size:7.5pt;letter-spacing:.2em;color:var(--accent);margin-bottom:3mm}
.field{display:flex;align-items:flex-end;gap:3mm;margin-bottom:3.4mm;font-size:8.5pt}
.field .k{width:24mm;color:var(--muted)}
.field .v{flex:1;border-bottom:.5pt solid var(--line);height:6mm}

/* questions */
.runhead{display:flex;justify-content:space-between;font-size:7pt;color:var(--muted);letter-spacing:.1em;
  border-bottom:.5pt solid var(--line);padding-bottom:1.5mm;margin-bottom:6mm}
.q{break-inside:avoid;margin-bottom:8mm}
.qh{display:flex;gap:3.5mm;align-items:flex-start;margin-bottom:3mm}
.qn{font-family:var(--serif);font-weight:700;font-size:15pt;color:var(--accent);line-height:1;min-width:7mm}
.qt{flex:1}
.qt .tag{margin-bottom:1.2mm}
.qt .text{font-family:var(--serif);font-size:10.2pt;line-height:1.65}
.q.상황 .scene{background:var(--soft);border-left:1.6mm solid var(--accent);padding:3mm 4mm;border-radius:0 2mm 2mm 0}
.lines{margin-left:10.5mm}
.lines i{display:block;height:8mm;border-bottom:.6pt solid var(--line)}
.choices{display:flex;flex-wrap:wrap;gap:2mm 5mm;margin:0 0 2mm 10.5mm;font-size:8.5pt}
.box{display:inline-block;width:3.2mm;height:3.2mm;border:.6pt solid var(--ink);border-radius:.5mm;vertical-align:-.4mm;margin-right:1.5mm}
.blank{margin:1mm 0 3mm 10.5mm;display:flex;align-items:flex-end;gap:2mm;font-size:9pt}
.blank .u{width:32mm;border-bottom:.6pt solid var(--ink);height:7mm}
.scale{margin:2mm 0 0 10.5mm}
.srow{margin-bottom:4mm}
.srow .who{font-size:7.5pt;color:var(--muted);margin-bottom:1mm}
.dots{display:flex;align-items:center;gap:0}
.dots .end{font-size:7.5pt;color:var(--muted);width:20mm;line-height:1.3}
.dots .end.r{text-align:right}
.dots .track{flex:1;display:flex;justify-content:space-between;position:relative;padding:0 2mm}
.dots .track::before{content:'';position:absolute;left:4mm;right:4mm;top:50%;border-top:.5pt solid var(--line)}
.dot{position:relative;width:7mm;height:7mm;border-radius:50%;border:.7pt solid var(--ink);background:#fff;
  display:flex;align-items:center;justify-content:center;font-size:7.5pt;color:var(--muted)}
.rank{margin:1mm 0 0 10.5mm;display:grid;grid-template-columns:1fr 1fr;gap:2.5mm 6mm;font-size:9pt}
.rank div{display:flex;align-items:center;gap:2.5mm}
.rank .nb{width:7mm;height:7mm;border:.7pt solid var(--ink);border-radius:1mm}

/* together */
.tg .lead{font-size:8.5pt;color:var(--muted);margin-bottom:6mm}
.tblock{margin-bottom:6mm;break-inside:avoid}
.tblock .k{font-family:var(--serif);font-weight:700;font-size:10pt;margin-bottom:1.5mm}
.tblock .lines{margin-left:0}
.tblock .blank{margin-left:0}
.three{display:grid;grid-template-columns:1fr;gap:5mm}
.col .k{font-family:var(--serif);font-weight:700;font-size:10pt;margin-bottom:1.5mm;display:flex;gap:2mm;align-items:center}
.col .k i{font-style:normal;width:2.2mm;height:2.2mm;border-radius:50%;background:var(--accent);display:inline-block}
.sign{display:flex;gap:8mm;margin-top:3mm;font-size:8pt;color:var(--muted)}
.sign div{flex:1;display:flex;align-items:flex-end;gap:2mm}
.sign span.l{flex:1;border-bottom:.6pt solid var(--ink);height:7mm}
.fb .q{margin-bottom:3mm}.fb h2{margin-bottom:2mm}.fb .qh{margin-bottom:1.5mm}.fb .lines i{height:6.5mm}.fb .scale .srow{margin-bottom:0}
.signoff{border-top:.5pt solid var(--line);padding-top:4mm;margin-top:6mm}
"""

MOTIF = """<svg class="motif" width="78mm" height="46mm" viewBox="0 0 78 46" xmlns="http://www.w3.org/2000/svg">
<circle cx="29" cy="23" r="20" fill="none" stroke="#2A2E38" stroke-width=".6"/>
<circle cx="49" cy="23" r="20" fill="none" stroke="#A8583F" stroke-width=".6"/>
<path d="M39 5.7 A20 20 0 0 1 39 40.3 A20 20 0 0 1 39 5.7Z" fill="#A8583F" fill-opacity=".14"/>
</svg>"""


def lines(n):
    return '<div class="lines">' + "<i></i>" * n + "</div>" if n else ""


def scale_html(rows):
    out = ['<div class="scale">']
    for who, l, r in rows:
        out.append('<div class="srow">')
        if who:
            out.append(f'<div class="who">{E(who)}</div>')
        dots = "".join(f'<span class="dot">{i}</span>' for i in range(1, 6))
        out.append(f'<div class="dots"><span class="end">{E(l)}</span><span class="track">{dots}</span><span class="end r">{E(r)}</span></div></div>')
    out.append("</div>")
    return "".join(out)


def question(i, q):
    t = q["t"]
    text = E(q["q"])
    body = f'<div class="scene">{text}</div>' if t == "상황" else f'<div class="text">{text}</div>'
    parts = [f'<div class="q {t}"><div class="qh"><div class="qn">{i:02d}</div><div class="qt"><span class="tag {t}">{t}</span>{body}</div></div>']
    if "choices" in q:
        parts.append('<div class="choices">' + "".join(f'<span><span class="box"></span>{E(c)}</span>' for c in q["choices"]) + "</div>")
    if "blank" in q:
        parts.append(f'<div class="blank"><span class="u"></span><span>{E(q["blank"])}</span></div>')
    if "scale" in q:
        parts.append(scale_html(q["scale"]))
    if "items" in q:
        parts.append('<div class="rank">' + "".join(f'<div><span class="nb"></span>{E(it)}</div>' for it in q["items"]) + "</div>")
    parts.append(lines(q.get("lines", 0)))
    parts.append("</div>")
    return "".join(parts)


def doc(title, pages):
    return f"""<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>{E(title)}</title>
<style>{CSS}</style></head><body>{''.join(pages)}</body></html>"""


def cover(edition, title_sub, owner_label):
    units = " · ".join(f'{u["no"]} {u["title"]}' for u in UNITS)
    return f"""<section class="page cover"><div class="edition">{E(edition)}</div>{MOTIF}
<h1>결혼 전<br>10번의 대화</h1>
<div class="sub">{title_sub}</div>
<div class="units">수록 단원 &nbsp;{E(units)}</div>
<div class="owner">{E(owner_label)}<span class="l"></span></div></section>"""


def howto():
    legend = "".join(f'<li><span class="tag {t}">{t}</span><span>{E(d)}</span></li>' for t, d in TAG_DESC)
    return f"""<section class="page"><div class="kicker">HOW TO USE</div><h2>시작하기 전에</h2>
<p>이 워크북은 결혼 후 신혼부부가 가장 많이 부딪히는 상황을 결혼 전에 미리 꺼내 이야기하기 위한 도구입니다. 두 사람이 같은 질문이 담긴 워크북을 한 권씩 갖습니다.</p>
<ol class="steps">
<li><b>약속 잡기</b><br>단원 첫 장에 대화 날짜와 장소를 함께 적습니다.</li>
<li><b>각자 쓰기 (3~7일)</b><br>혼자 있는 시간에 천천히 답을 적습니다. 상대의 워크북은 대화 날까지 열어 보지 않습니다.</li>
<li><b>대화 데이트 (1~3시간)</b><br>타이머를 켜고 질문마다 번갈아 답을 읽고 이야기합니다.</li>
<li><b>함께 기록</b><br>합의한 것, 아직 다른 것, 다시 이야기할 것을 함께 기록지에 남깁니다.</li>
</ol>
<h3>질문 형식</h3><ul class="legend">{legend}</ul>
</section>"""


def guide():
    return """<section class="page"><div class="kicker">CONVERSATION GUIDE</div><h2>대화 가이드</h2>
<p>진지한 질문일수록 규칙이 있어야 안전하게 이야기할 수 있습니다. 대화를 시작하기 전에 함께 소리 내어 읽어 주세요.</p>
<ol class="steps">
<li>상대 답을 끝까지 듣고, 평가하기 전에 “그렇게 생각한 이유”를 먼저 물어봅니다.</li>
<li>타이머로 한 사람당 5분씩 번갈아 말합니다. 말하는 동안 상대는 끊지 않습니다.</li>
<li><span class="tag 상황">상황</span> 질문에는 정답이 없습니다. “내 마음”을 이야기합니다.</li>
<li>오늘 결론을 못 내도 괜찮습니다. “아직 다른 것”에 적고 넘어갑니다.</li>
<li>한 단원이 3시간을 넘기면 멈추고 다음 날 이어서 합니다.</li>
<li>대화가 끝나면 서로에게 고마웠던 답 하나를 말해 줍니다.</li>
</ol>
<div class="note"><b>함께 기억해 주세요.</b> 같은 주제에서 반복해서 막히거나 대화가 상처로 끝난다면, 혼전 상담이나 부부 상담을 함께 받아 보길 권합니다. 그것도 이 워크북이 제 역할을 한 것입니다.</div>
</section>"""


def opener(u):
    fields = "".join(f'<div class="field"><span class="k">{k}</span><span class="v"></span></div>' for k in ["대화 날짜", "시간", "장소", "각자 쓰기 마감"])
    return f"""<section class="page"><div class="opener"><div class="num">{u['no']}</div><h2>{E(u['title'])}</h2>
<div class="intro">{E(u['intro'])}</div>
<div class="promise"><div class="t">우리의 대화 약속</div>{fields}</div></div></section>"""


def questions(u):
    qs = "".join(question(i + 1, q) for i, q in enumerate(u["qs"]))
    return f"""<section class="page"><div class="runhead"><span>{u['no']} · {E(u['title'])}</span><span>각자 쓰기</span></div>{qs}</section>"""


def signrow(a="", b=""):
    return '<div class="sign"><div>서명<span class="l"></span></div><div>서명<span class="l"></span></div></div>'


def together(u):
    blocks = []
    for k, v in u["together"]:
        if v == "sign":
            blocks.append(f'<div class="tblock"><div class="k">{E(k)}</div><div style="font-size:8pt;color:var(--muted)">동의한다면 각자 서명해 주세요.</div>{signrow()}</div>')
        elif isinstance(v, str) and v.startswith("blank:"):
            blocks.append(f'<div class="tblock"><div class="k">{E(k)}</div><div class="blank"><span class="u"></span><span>{E(v[6:])}</span></div></div>')
        else:
            blocks.append(f'<div class="tblock"><div class="k">{E(k)}</div>{lines(v)}</div>')
    cols = "".join(f'<div class="col tblock"><div class="k"><i></i>{k}</div>{lines(3)}</div>' for k in ["합의한 것", "아직 다른 것", "다음에 다시 이야기할 것"])
    return f"""<section class="page tg"><div class="runhead"><span>{u['no']} · {E(u['title'])}</span><span>함께 기록</span></div>
<h2>함께 기록</h2><div class="lead">대화가 끝난 뒤 두 사람이 함께 적습니다.</div>{''.join(blocks)}</section>
<section class="page tg"><div class="runhead"><span>{u['no']} \u00b7 {E(u['title'])}</span><span>함께 기록</span></div>
<div class="three">{cols}</div>
<div class="signoff"><div class="field"><span class="k">대화한 날</span><span class="v"></span></div>{signrow()}</div></section>"""


def feedback():
    sc = lambda l, r: scale_html([["", l, r]])
    qs = [
        ("각자 쓰기와 대화에 걸린 시간은 어느 정도였나요?", '<div class="blank"><span>쓰기</span><span class="u"></span><span>대화</span><span class="u"></span></div>'),
        ("대화가 가장 길어졌던 질문은 몇 번이었나요? 왜 그랬을까요?", lines(2)),
        ("불편했거나 건너뛴 질문이 있었나요? 이유도 적어 주세요.", lines(2)),
        ("대화 후 서로를 더 잘 알게 되었다고 느끼나요?", sc("전혀 아니다", "매우 그렇다")),
        ("지인 커플에게 추천하고 싶나요?", sc("전혀 아니다", "매우 그렇다")),
        ("워크북 2권, 함께 기록지, 대화 가이드, 타이머가 담긴 세트가 4~5만 원이라면?",
         '<div class="choices"><span><span class="box"></span>우리가 사겠다</span><span><span class="box"></span>선물하겠다</span><span><span class="box"></span>잘 모르겠다</span><span><span class="box"></span>사지 않겠다</span></div>'),
        ("더 있었으면 하는 주제나 질문, 자유로운 의견", lines(2)),
    ]
    body = "".join(f'<div class="q"><div class="qh"><div class="qn">{i+1:02d}</div><div class="qt"><div class="text">{E(q)}</div></div></div>{a}</div>' for i, (q, a) in enumerate(qs))
    return f"""<section class="page fb"><div class="kicker">FEEDBACK</div><h2>테스트 커플 피드백</h2>
<p style="color:var(--muted);font-size:8.5pt">두 단원을 마친 뒤 함께 적어 주세요. 솔직한 의견이 다음 버전을 만듭니다.</p>{body}</section>"""


personal = [cover("TEST EDITION · 개인 워크북", "결혼 후 가장 많이 부딪히는 이야기를<br>결혼 전에 미리 나누는 워크북", "이 워크북의 주인"), howto(), guide()]
for u in UNITS:
    personal += [opener(u), questions(u)]

shared = [cover("TEST EDITION · 함께 기록지", "대화를 마친 뒤 두 사람이 함께 쓰는<br>우리의 약속 기록", "우리 두 사람")]
for u in UNITS:
    shared.append(together(u))
shared.append(feedback())

open("personal.html", "w").write(doc("결혼 전 10번의 대화 개인 워크북", personal))
open("shared.html", "w").write(doc("결혼 전 10번의 대화 함께 기록지", shared))
print("ok")
