"""동화 그림 생성기.

캐릭터(엄마, 오누이, 호랑이, 토끼, 거북이, 나무꾼, 산신령)를 한 번씩만 정의하고
쪽마다 자세·표정·위치만 바꿔서 그려요. 그래서 모든 쪽에서 캐릭터가 똑같아요.

    python3 tools/draw_scenes.py      # img/*.svg 를 다시 만들어요

그림 안에 CSS 애니메이션이 들어 있어서 <img>로 넣어도 살짝 움직여요.
(움직임 줄이기 설정을 켠 기기에서는 멈춰 있어요.)
"""
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / 'img'

INK = '#3A2A22'
SKIN = '#FFD6B3'
BLUSH = '#FF9AA8'

STYLE = """
.a{transform-box:fill-box}
.bob{animation:bob 2.6s ease-in-out infinite alternate;transform-box:fill-box}
.bob2{animation:bob 3.2s ease-in-out infinite alternate;animation-delay:-1.1s;transform-box:fill-box}
.breathe{animation:breathe 2.8s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 100%}
.sway{animation:sway 4.5s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 100%}
.drift{animation:drift 11s ease-in-out infinite alternate}
.drift2{animation:drift 14s ease-in-out infinite alternate-reverse}
.wag{animation:wag 1.7s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:0% 100%}
.paw{animation:paw 1.3s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:100% 100%}
.twinkle{animation:twinkle 1.9s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 50%}
.glow{animation:glow 3.2s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 50%}
.float{animation:float 3.4s ease-in-out infinite alternate;transform-box:fill-box}
.rise{animation:rise 3.6s ease-out infinite;transform-box:fill-box}
.smoke{animation:smoke 4.5s ease-out infinite;transform-box:fill-box;transform-origin:50% 100%}
.hop{animation:hop .55s cubic-bezier(.3,0,.5,1) infinite alternate;transform-box:fill-box}
.chop{animation:chop .9s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:85% 90%}
.knock{animation:knock .5s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:100% 100%}
.ear{animation:ear 2.2s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 100%}
.ripple{animation:ripple 2.6s ease-out infinite;transform-box:fill-box;transform-origin:50% 50%}
.dangle{animation:dangle 3s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 0%}
.flutter{animation:flutter 1.6s ease-in-out infinite alternate;transform-box:fill-box}
@keyframes bob{to{transform:translateY(-5px)}}
@keyframes breathe{to{transform:scale(1.015,1.03)}}
@keyframes sway{from{transform:rotate(-1.6deg)}to{transform:rotate(1.6deg)}}
@keyframes drift{from{transform:translateX(-18px)}to{transform:translateX(18px)}}
@keyframes wag{from{transform:rotate(-6deg)}to{transform:rotate(8deg)}}
@keyframes paw{from{transform:rotate(-5deg)}to{transform:rotate(7deg)}}
@keyframes twinkle{from{opacity:.35;transform:scale(.8)}to{opacity:1;transform:scale(1.1)}}
@keyframes glow{from{transform:scale(1)}to{transform:scale(1.05)}}
@keyframes float{from{transform:translateY(4px)}to{transform:translateY(-8px)}}
@keyframes rise{0%{transform:translateY(0);opacity:0}20%{opacity:1}100%{transform:translateY(-40px);opacity:0}}
@keyframes smoke{0%{transform:translateY(0) scale(.6);opacity:0}30%{opacity:.8}100%{transform:translateY(-50px) scale(1.4);opacity:0}}
@keyframes hop{to{transform:translateY(-14px)}}
@keyframes chop{from{transform:rotate(12deg)}to{transform:rotate(-22deg)}}
@keyframes knock{from{transform:rotate(-8deg)}to{transform:rotate(10deg)}}
@keyframes ear{from{transform:rotate(-4deg)}to{transform:rotate(5deg)}}
@keyframes ripple{0%{transform:scale(.4);opacity:.9}100%{transform:scale(1.5);opacity:0}}
@keyframes dangle{from{transform:rotate(-2.5deg)}to{transform:rotate(2.5deg)}}
@keyframes flutter{from{transform:translate(0,0) rotate(-8deg)}to{transform:translate(14px,-12px) rotate(8deg)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
"""


# ---------- 도우미 ----------
def at(x, y, s=1, flip=False, rot=0):
    sx = -s if flip else s
    r = f' rotate({rot})' if rot else ''
    return f'translate({x} {y}){r} scale({sx} {s})'


def put(content, x, y, s=1, flip=False, rot=0):
    return f'<g transform="{at(x, y, s, flip, rot)}">{content}</g>'


def anim(cls, content, delay=None):
    d = f' style="animation-delay:{delay}s"' if delay is not None else ''
    return f'<g class="{cls}"{d}>{content}</g>'


def svg(title, defs, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">\n'
            f'<!-- {title} -->\n<style>{STYLE}</style>\n<defs>{defs}</defs>\n{body}\n</svg>\n')


def grad(id_, stops, vertical=True):
    x2, y2 = ('0', '1') if vertical else ('1', '0')
    s = ''.join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops)
    return f'<linearGradient id="{id_}" x1="0" y1="0" x2="{x2}" y2="{y2}">{s}</linearGradient>'


GLOW = ('<radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF3C4" stop-opacity=".95"/>'
        '<stop offset="1" stop-color="#FFF3C4" stop-opacity="0"/></radialGradient>'
        '<radialGradient id="moonglow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF6D0" stop-opacity=".55"/>'
        '<stop offset="1" stop-color="#FFF6D0" stop-opacity="0"/></radialGradient>'
        '<radialGradient id="ropeglow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFE9A0" stop-opacity=".7"/>'
        '<stop offset="1" stop-color="#FFE9A0" stop-opacity="0"/></radialGradient>')


# ---------- 배경 소품 ----------
def cloud(x, y, s=1, color='#FFF6E6', cls='drift', delay=None):
    c = (f'<path d="M0 0a26 26 0 0 1 48-12a20 20 0 0 1 34 14a16 16 0 0 1 2 30H6a20 20 0 0 1-6-32z" '
         f'fill="{color}" opacity=".9"/>')
    return anim(cls, put(c, x, y, s), delay)


def birds(x, y, color='#B9746A'):
    return anim('drift2', put(f'<g stroke="{color}" stroke-width="4" stroke-linecap="round" fill="none">'
                              '<path d="M0 0q10-10 20 0q10-10 20 0"/><path d="M52-22q8-8 16 0q8-8 16 0"/></g>', x, y))


def stars(points):
    out = ''
    for n, (x, y, r) in enumerate(points):
        star = (f'<path d="M0-{r}L{r*.3}-{r*.3}L{r}0L{r*.3} {r*.3}L0 {r}L-{r*.3} {r*.3}L-{r}0L-{r*.3}-{r*.3}Z" '
                f'fill="#FFF3C4"/>')
        out += put(anim('twinkle', star, delay=-n * .6), x, y)
    return out


def sun(x, y, r=56, face=False):
    body = (f'<circle r="{r*2.4}" fill="url(#glow)"/>'
            + anim('glow', f'<circle r="{r}" fill="#FFD66B"/>'
                   + (f'<circle r="{r*.84}" fill="#FFE08A"/>' if not face else '')))
    return put(body, x, y)


def moon(x, y, r=40):
    return put(f'<circle r="{r*2.6}" fill="url(#moonglow)"/>'
               + anim('glow', f'<circle r="{r}" fill="#FFF1B8"/><circle cx="{r*.38}" cy="-{r*.2}" r="{r*.88}" fill="#2E3768"/>'),
               x, y)


def pine(x, y, s=1, delay=None):
    t = ('<rect x="-8" y="-42" width="16" height="44" rx="4" fill="#8A5A3B"/>'
         '<path d="M-56-36L0-112L56-36Z" fill="#4E8A5A" stroke="#4E8A5A" stroke-width="16" stroke-linejoin="round"/>'
         '<path d="M-44-84L0-150L44-84Z" fill="#5A9866" stroke="#5A9866" stroke-width="14" stroke-linejoin="round"/>'
         '<path d="M-30-126L0-182L30-126Z" fill="#66A572" stroke="#66A572" stroke-width="12" stroke-linejoin="round"/>')
    return put(anim('sway', t, delay), x, y, s)


def night_pine(x, y, s=1):
    t = ('<rect x="-8" y="-42" width="16" height="44" rx="4" fill="#4B3A3A"/>'
         '<path d="M-56-36L0-112L56-36Z" fill="#284A45" stroke="#284A45" stroke-width="16" stroke-linejoin="round"/>'
         '<path d="M-44-84L0-150L44-84Z" fill="#2F5650" stroke="#2F5650" stroke-width="14" stroke-linejoin="round"/>'
         '<path d="M-30-126L0-182L30-126Z" fill="#36625B" stroke="#36625B" stroke-width="12" stroke-linejoin="round"/>')
    return put(t, x, y, s)


def round_tree(x, y, s=1, night=False, delay=None):
    trunk = '#5A4038' if night else '#8A5A3B'
    leaf = ('#2F5A4C', '#386A58', '#41755F') if night else ('#5E9B5C', '#6DAD68', '#7DBE73')
    t = (f'<path d="M-16 0C-12-60-14-120-6-180H6C14-120 12-60 16 0Z" fill="{trunk}"/>'
         f'<path d="M-4-120Q-40-150-62-150" stroke="{trunk}" stroke-width="12" stroke-linecap="round" fill="none"/>'
         f'<circle cx="-70" cy="-210" r="62" fill="{leaf[0]}"/><circle cx="66" cy="-214" r="64" fill="{leaf[0]}"/>'
         f'<circle cx="0" cy="-262" r="80" fill="{leaf[1]}"/><circle cx="-40" cy="-190" r="52" fill="{leaf[1]}"/>'
         f'<circle cx="44" cy="-188" r="50" fill="{leaf[1]}"/><circle cx="-22" cy="-290" r="44" fill="{leaf[2]}"/>'
         f'<circle cx="34" cy="-262" r="36" fill="{leaf[2]}" opacity=".9"/>')
    return put(anim('sway', t, delay), x, y, s)


def tuft(x, y, color='#7FA552'):
    return put(f'<path d="M-14 0Q-12-16-4-22M0 0Q0-20 4-28M12 0Q12-14 18-20" stroke="{color}" stroke-width="5" '
               'stroke-linecap="round" fill="none"/>', x, y)


def flower(x, y, petal='#FFF6E6', center='#FFC93C'):
    p = ''.join(f'<circle cx="{dx}" cy="{dy}" r="5" fill="{petal}"/>' for dx, dy in ((0, -6), (6, 0), (0, 6), (-6, 0)))
    return put(p + f'<circle r="4" fill="{center}"/>', x, y)


def butterfly(x, y, color='#FF9AA8'):
    b = (f'<ellipse cx="-7" cy="-4" rx="8" ry="6" fill="{color}"/><ellipse cx="7" cy="-4" rx="8" ry="6" fill="{color}"/>'
         f'<ellipse cx="-5" cy="5" rx="5" ry="4" fill="{color}"/><ellipse cx="5" cy="5" rx="5" ry="4" fill="{color}"/>'
         f'<rect x="-1.5" y="-8" width="3" height="16" rx="1.5" fill="{INK}"/>')
    return put(anim('flutter', b), x, y)


def house(x, y, s=1, night=False, door_open=False):
    wall = '#E9D7B4' if night else '#F6E7C8'
    roof = ('#A7864E', '#957545') if night else ('#D9B26B', '#C79E57')
    win = '#FFD66B' if night else '#FFF6E6'
    h = (f'<rect x="-120" y="-120" width="240" height="120" rx="8" fill="{wall}"/>'
         f'<rect x="-128" y="-8" width="256" height="14" rx="4" fill="#B98E62"/>'
         f'<path d="M-120-120V0M120-120V0M-40-120V0M40-120V0" stroke="#9C6B45" stroke-width="8"/>'
         # 창호지 문
         f'<rect x="-30" y="-100" width="60" height="92" rx="4" fill="{"#3A2E2A" if door_open else win}"/>'
         f'<path d="M0-100v92M-30-70h60M-30-40h60" stroke="#B98E62" stroke-width="3"/>'
         f'<rect x="-100" y="-96" width="44" height="40" rx="4" fill="{win}"/>'
         f'<path d="M-78-96v40M-100-76h44" stroke="#B98E62" stroke-width="3"/>'
         f'<rect x="58" y="-96" width="44" height="40" rx="4" fill="{win}"/>'
         f'<path d="M80-96v40M58-76h44" stroke="#B98E62" stroke-width="3"/>'
         # 초가지붕
         f'<path d="M-160-112C-150-200 150-200 160-112C120-96-120-96-160-112Z" fill="{roof[0]}"/>'
         f'<path d="M-120-150C-60-170 60-170 120-150M-140-128C-60-146 60-146 140-128" stroke="{roof[1]}" '
         f'stroke-width="6" fill="none" stroke-linecap="round"/>'
         f'<rect x="96" y="-196" width="22" height="46" rx="4" fill="#9C6B45"/>')
    smoke = ''.join(anim('smoke', f'<circle cx="107" cy="-210" r="{r}" fill="#FFFFFF" opacity=".75"/>', d)
                    for r, d in ((10, 0), (13, -1.5), (9, -3)))
    return put(h + smoke, x, y, s)


def pond(cx, cy, rx=210, ry=60, night=False):
    water = '#5C88B8' if night else '#7CCBEE'
    edge = '#3F6C93' if night else '#5FB5DD'
    return (f'<ellipse cx="{cx}" cy="{cy+6}" rx="{rx+10}" ry="{ry+8}" fill="#8FB86B"/>'
            f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{edge}"/>'
            f'<ellipse cx="{cx}" cy="{cy-6}" rx="{rx-10}" ry="{ry-10}" fill="{water}"/>'
            f'<path d="M{cx-120} {cy-16}h50M{cx+60} {cy+8}h70M{cx-40} {cy+20}h40" stroke="#FFFFFF" stroke-width="5" '
            f'stroke-linecap="round" opacity=".55"/>'
            + put('<ellipse rx="22" ry="8" fill="#6DB36A"/><path d="M0 0L18-4" stroke="#5E9A50" stroke-width="3"/>',
                  cx + rx - 60, cy + 10)
            + put('<ellipse rx="18" ry="6" fill="#6DB36A"/>', cx - rx + 70, cy + 18)
            + ''.join(put('<path d="M0 0V-46" stroke="#5E9A50" stroke-width="5" stroke-linecap="round"/>'
                          '<ellipse cy="-52" rx="6" ry="14" fill="#8A5A3B"/>', px, cy + 12)
                      for px in (cx - rx + 10, cx - rx + 26, cx + rx - 14)))


def ripples(x, y):
    return ''.join(put(anim('ripple', '<ellipse rx="40" ry="12" fill="none" stroke="#FFFFFF" stroke-width="4"/>', d), x, y)
                   for d in (0, -1.3))


def bubbles(x, y):
    return ''.join(put(anim('rise', f'<circle r="{r}" fill="none" stroke="#FFFFFF" stroke-width="3"/>', d), x + dx, y)
                   for dx, r, d in ((-10, 6, 0), (8, 4, -1.2), (0, 5, -2.4)))


def sparkles(points, color='#FFE27A'):
    return stars_colored(points, color)


def stars_colored(points, color):
    out = ''
    for n, (x, y, r) in enumerate(points):
        st = (f'<path d="M0-{r}Q0 0 {r} 0Q0 0 0 {r}Q0 0-{r} 0Q0 0 0-{r}Z" fill="{color}"/>')
        out += put(anim('twinkle', st, delay=-n * .5), x, y)
    return out


# ---------- 배경 ----------
def bg(kind):
    """하늘·먼 산·언덕·땅. (defs, body) 를 돌려줘요."""
    if kind == 'dusk':
        d = grad('sky', [(0, '#FFB48C'), (.55, '#FFD9A0'), (1, '#FFEBB8')])
        b = ('<rect width="800" height="600" fill="url(#sky)"/>' + sun(610, 318, 62)
             + '<path d="M0 360C80 300 140 268 220 298S340 248 430 258 560 322 640 300 760 288 800 306V600H0Z" fill="#E9A88E"/>'
             '<path d="M0 402C120 362 220 352 330 382S520 360 640 370 770 390 800 396V600H0Z" fill="#CDB57E"/>'
             '<path d="M0 452C150 426 300 430 420 446S680 440 800 430V600H0Z" fill="#AAC56F"/>')
    elif kind == 'day':
        d = grad('sky', [(0, '#BFE4FF'), (.7, '#FFF4D6')])
        b = ('<rect width="800" height="600" fill="url(#sky)"/>' + sun(660, 110, 46)
             + '<path d="M0 340C90 280 160 250 240 284S360 236 450 250 580 300 660 280 770 270 800 286V600H0Z" fill="#B7D8C6"/>'
             '<path d="M0 400C120 366 230 356 340 384S530 360 650 370 770 388 800 392V600H0Z" fill="#B5DA8C"/>'
             '<path d="M0 452C150 428 300 432 420 446S680 440 800 432V600H0Z" fill="#9CC86C"/>')
    elif kind == 'night':
        d = grad('sky', [(0, '#1F2753'), (1, '#4B4F8F')])
        b = ('<rect width="800" height="600" fill="url(#sky)"/>'
             '<path d="M0 352C90 292 160 262 240 292S360 244 450 256 580 308 660 288 770 278 800 294V600H0Z" fill="#3A4479"/>'
             '<path d="M0 410C120 372 230 362 340 390S530 366 650 376 770 394 800 398V600H0Z" fill="#2E5446"/>'
             '<path d="M0 458C150 434 300 438 420 452S680 446 800 438V600H0Z" fill="#3B6A4B"/>')
    elif kind == 'twilight':
        d = grad('sky', [(0, '#FFE6A0'), (.42, '#FFC98A'), (.58, '#3E4380'), (1, '#1F2753')], vertical=False)
        b = ('<rect width="800" height="600" fill="url(#sky)"/>'
             '<path d="M0 500C140 470 280 476 400 490S660 470 800 480V600H0Z" fill="#F6E2C4" opacity=".9"/>')
    elif kind in ('meadow', 'forest'):
        d = grad('sky', [(0, '#C9EAFF'), (.7, '#FFF8DC')])
        far = '#BFE0B5' if kind == 'meadow' else '#9DCB98'
        b = ('<rect width="800" height="600" fill="url(#sky)"/>'
             f'<path d="M0 380C120 330 220 318 330 350S540 320 660 334 770 352 800 356V600H0Z" fill="{far}"/>'
             '<path d="M0 448C150 420 300 424 420 440S680 434 800 426V600H0Z" fill="#A8D57F"/>')
    else:  # warm
        d = grad('sky', [(0, '#FFF1C4'), (1, '#FFD7B0')])
        b = '<rect width="800" height="600" fill="url(#sky)"/>'
    return d + GLOW, b


def shadow(x, y, rx, ry=12, o=.14):
    return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="#3A2A1A" opacity="{o}"/>'


# ---------- 표정 ----------
def face(kind, ex=10, ey=0, eye_r=4.5, mouth_y=14, cheek=True, look=(0, 0)):
    lx, ly = look
    if kind == 'happy':      # 웃는 눈
        eyes = (f'<path d="M-{ex+5} {ey}q5-6 10 0M{ex-5} {ey}q5-6 10 0" stroke="{INK}" stroke-width="3.2" '
                f'fill="none" stroke-linecap="round"/>')
        mouth = f'<path d="M-6 {mouth_y-2}q6 7 12 0" stroke="{INK}" stroke-width="3" fill="#E8707E" stroke-linecap="round"/>'
    elif kind == 'shock':
        eyes = f'<circle cx="-{ex}" cy="{ey}" r="{eye_r}" fill="{INK}"/><circle cx="{ex}" cy="{ey}" r="{eye_r}" fill="{INK}"/>'
        mouth = f'<ellipse cy="{mouth_y}" rx="4.5" ry="5.5" fill="#B5485A"/>'
    elif kind == 'cry':
        eyes = (f'<path d="M-{ex+5} {ey+2}q5-5 10 0M{ex-5} {ey+2}q5-5 10 0" stroke="{INK}" stroke-width="3" '
                f'fill="none" stroke-linecap="round" transform="rotate(180 0 {ey+1})"/>'
                + anim('rise', f'<path d="M-{ex} {ey+6}q4 7 0 11q-4-4 0-11z" fill="#8FD0F2"/>'))
        mouth = f'<path d="M-6 {mouth_y+3}q6-7 12 0" stroke="{INK}" stroke-width="3" fill="none" stroke-linecap="round"/>'
    elif kind == 'sleep':
        eyes = (f'<path d="M-{ex+5} {ey}q5 5 10 0M{ex-5} {ey}q5 5 10 0" stroke="{INK}" stroke-width="3" '
                f'fill="none" stroke-linecap="round"/>')
        mouth = f'<ellipse cy="{mouth_y}" rx="3" ry="2.5" fill="#B5485A"/>'
    elif kind == 'smug':
        eyes = (f'<path d="M-{ex+5} {ey}h10M{ex-5} {ey}h10" stroke="{INK}" stroke-width="3.2" stroke-linecap="round"/>'
                f'<circle cx="-{ex}" cy="{ey+3}" r="3" fill="{INK}"/><circle cx="{ex}" cy="{ey+3}" r="3" fill="{INK}"/>')
        mouth = f'<path d="M-8 {mouth_y-3}q8 10 16 0z" fill="#E8707E" stroke="{INK}" stroke-width="2.5" stroke-linejoin="round"/>'
    elif kind == 'determined':
        eyes = (f'<circle cx="-{ex}" cy="{ey}" r="{eye_r}" fill="{INK}"/><circle cx="{ex}" cy="{ey}" r="{eye_r}" fill="{INK}"/>'
                f'<path d="M-{ex+6} {ey-9}l10 3M{ex+6} {ey-9}l-10 3" stroke="{INK}" stroke-width="3" stroke-linecap="round"/>')
        mouth = f'<path d="M-5 {mouth_y}h10" stroke="{INK}" stroke-width="3" stroke-linecap="round"/>'
    else:                    # calm: 동그란 눈 + 미소
        eyes = (f'<circle cx="{-ex+lx}" cy="{ey+ly}" r="{eye_r}" fill="{INK}"/>'
                f'<circle cx="{ex+lx}" cy="{ey+ly}" r="{eye_r}" fill="{INK}"/>')
        mouth = f'<path d="M-5 {mouth_y-1}q5 5 10 0" stroke="{INK}" stroke-width="3" fill="none" stroke-linecap="round"/>'
    cheeks = (f'<circle cx="-{ex+8}" cy="{ey+10}" r="5.5" fill="{BLUSH}" opacity=".55"/>'
              f'<circle cx="{ex+8}" cy="{ey+10}" r="5.5" fill="{BLUSH}" opacity=".55"/>') if cheek else ''
    return eyes + mouth + cheeks


# ---------- 캐릭터: 엄마 ----------
def mom(pose='carry', mood='shock'):
    """발밑 가운데가 (0,0), 키 약 280."""
    body = ('<path d="M-72 0C-68-70-42-118 0-124S68-70 72 0Z" fill="#E4738A"/>'
            '<path d="M-64-14C-40-6 40-6 64-14" stroke="#D05E77" stroke-width="5" fill="none" stroke-linecap="round"/>'
            '<path d="M-44-108C-40-150-22-166 0-166S40-150 44-108Z" fill="#FFF3DD"/>'
            '<path d="M-14-164L0-138L14-164" stroke="#5B6BB5" stroke-width="7" fill="none" stroke-linejoin="round" stroke-linecap="round"/>'
            '<path d="M2-136q14 8 8 30M2-136q-2 16-12 26" stroke="#D94A5E" stroke-width="6" fill="none" stroke-linecap="round"/>')
    if pose == 'carry':
        arms = ('<path d="M-30-150Q-58-184-42-230" stroke="#FFF3DD" stroke-width="24" fill="none" stroke-linecap="round"/>'
                '<path d="M30-150Q58-184 42-230" stroke="#FFF3DD" stroke-width="24" fill="none" stroke-linecap="round"/>'
                '<path d="M-50-218l18 4M32-214l18-4" stroke="#5B6BB5" stroke-width="7" stroke-linecap="round"/>'
                f'<circle cx="-40" cy="-238" r="10" fill="{SKIN}"/><circle cx="40" cy="-238" r="10" fill="{SKIN}"/>')
        basket = ('<path d="M-56-240Q0-210 56-240L48-258Q0-240-48-258Z" fill="#C98B4F"/>'
                  '<ellipse cy="-258" rx="50" ry="10" fill="#B07440"/>'
                  '<path d="M-34-248l6 14M-14-244l3 15M10-244l-2 15M32-248l-6 14" stroke="#A86B38" stroke-width="3" stroke-linecap="round"/>'
                  '<ellipse cx="-22" cy="-266" rx="13" ry="8" fill="#FFFDF6" stroke="#EADFC8" stroke-width="2"/>'
                  '<ellipse cy="-270" rx="13" ry="8" fill="#F7B6C2" stroke="#E99FAE" stroke-width="2"/>'
                  '<ellipse cx="22" cy="-266" rx="13" ry="8" fill="#C3DB8E" stroke="#AFC97A" stroke-width="2"/>'
                  '<ellipse cx="-11" cy="-279" rx="12" ry="7.5" fill="#FFFDF6" stroke="#EADFC8" stroke-width="2"/>'
                  '<ellipse cx="11" cy="-279" rx="12" ry="7.5" fill="#F7B6C2" stroke="#E99FAE" stroke-width="2"/>')
    else:  # 팔을 내리고 아이들을 감싸요
        arms = ('<path d="M-32-150Q-52-118-50-84" stroke="#FFF3DD" stroke-width="22" fill="none" stroke-linecap="round"/>'
                '<path d="M32-150Q52-118 50-84" stroke="#FFF3DD" stroke-width="22" fill="none" stroke-linecap="round"/>'
                f'<circle cx="-50" cy="-76" r="10" fill="{SKIN}"/><circle cx="50" cy="-76" r="10" fill="{SKIN}"/>')
        basket = ''
    head = (f'<circle cy="-196" r="31" fill="{SKIN}"/>'
            '<path d="M-31-196C-31-232 31-232 31-196C26-212 12-218 0-216C-12-218-25-212-31-196Z" fill="#2E2A33"/>'
            f'<path d="M0-226v11" stroke="{SKIN}" stroke-width="2.5" stroke-linecap="round"/>'
            + put(face(mood, ex=11, ey=0, mouth_y=16), 0, -196))
    if pose != 'carry':  # 쪽진 머리와 비녀
        head = ('<circle cx="0" cy="-168" r="0"/>' + '<ellipse cx="0" cy="-230" rx="0" ry="0"/>' + head
                + '<circle cx="30" cy="-212" r="12" fill="#2E2A33"/><path d="M18-214h30" stroke="#E9C46A" stroke-width="4" stroke-linecap="round"/>')
    return anim('breathe', body + arms + head + basket)


# ---------- 캐릭터: 오누이 ----------
def kid(boy=True, pose='down', mood='calm'):
    """발밑 가운데 (0,0), 키 약 140."""
    top = '#7FB8E6' if boy else '#FFD66B'
    bottom = ('<path d="M-20-2C-22-30-16-50 0-50C16-50 22-30 20-2Z" fill="#8C9BB8"/>' if boy else
              '<path d="M-26 0C-24-30-14-52 0-52C14-52 24-30 26 0Z" fill="#E4573D"/>')
    feet = ('<ellipse cx="-11" cy="-3" rx="10" ry="5.5" fill="#FFFFFF" stroke="#E5DCCB" stroke-width="2"/>'
            '<ellipse cx="11" cy="-3" rx="10" ry="5.5" fill="#FFFFFF" stroke="#E5DCCB" stroke-width="2"/>')
    jeogori = (f'<path d="M-24-44C-24-74-14-86 0-86S24-74 24-44Z" fill="{top}"/>'
               '<path d="M-7-84L0-70L7-84" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round"/>'
               + ('' if boy else '<path d="M2-70q10 6 6 20" stroke="#D94A5E" stroke-width="4" fill="none" stroke-linecap="round"/>'))
    if pose == 'up':
        arms = (f'<path d="M-18-76Q-30-98-22-120" stroke="{top}" stroke-width="12" fill="none" stroke-linecap="round"/>'
                f'<path d="M18-76Q30-98 22-120" stroke="{top}" stroke-width="12" fill="none" stroke-linecap="round"/>'
                f'<circle cx="-22" cy="-124" r="6.5" fill="{SKIN}"/><circle cx="22" cy="-124" r="6.5" fill="{SKIN}"/>')
    elif pose == 'pray':
        arms = (f'<path d="M-18-76Q-16-62-4-64M18-76Q16-62 4-64" stroke="{top}" stroke-width="12" fill="none" stroke-linecap="round"/>'
                f'<ellipse cy="-68" rx="6" ry="9" fill="{SKIN}"/>')
    elif pose == 'hold':  # 서로 손잡기 (오른손을 옆으로)
        arms = (f'<path d="M-20-76Q-30-62-26-46" stroke="{top}" stroke-width="12" fill="none" stroke-linecap="round"/>'
                f'<path d="M20-76Q34-66 40-56" stroke="{top}" stroke-width="12" fill="none" stroke-linecap="round"/>'
                f'<circle cx="-26" cy="-42" r="6" fill="{SKIN}"/><circle cx="42" cy="-53" r="6" fill="{SKIN}"/>')
    else:
        arms = (f'<path d="M-20-76Q-30-62-26-46M20-76Q30-62 26-46" stroke="{top}" stroke-width="12" fill="none" stroke-linecap="round"/>'
                f'<circle cx="-26" cy="-42" r="6" fill="{SKIN}"/><circle cx="26" cy="-42" r="6" fill="{SKIN}"/>')
    head = f'<circle cy="-108" r="23" fill="{SKIN}"/>'
    if boy:
        hair = '<path d="M-24-108C-25-138 25-138 24-108C17-120 7-124 0-122C-8-124-18-120-24-108Z" fill="#2E2A33"/>'
    else:
        hair = ('<path d="M-24-106C-26-140 26-140 24-106C20-118 10-124 0-120C-10-124-20-118-24-106Z" fill="#2E2A33"/>'
                '<path d="M20-116q12 20 8 46" stroke="#2E2A33" stroke-width="9" fill="none" stroke-linecap="round"/>'
                '<path d="M24-72l8 10l-12-2z" fill="#D94A5E"/>')
    f = put(face(mood, ex=8, ey=0, eye_r=3.6, mouth_y=11), 0, -106)
    return anim('bob', feet + bottom + jeogori + arms + head + hair + f, delay=-.8 if boy else 0)


# ---------- 캐릭터: 호랑이 ----------
def tiger(pose='reach', mood='grin', look=(-5, 2), disguise=False):
    """발밑 가운데 (0,0), 앉은 키 약 250. 원래 그림(566,505) 기준에서 옮겼어요."""
    tail = anim('wag', '<path d="M66-15C138-13 150-85 118-107C102-117 124-137 140-119" stroke="#F29440" stroke-width="20" fill="none" stroke-linecap="round"/>'
                f'<path d="M102-31l14-10M124-69l16 2M118-101l12-12" stroke="{INK}" stroke-width="6" stroke-linecap="round"/>')
    body = ('<path d="M-68-3C-78-65-56-137 0-145S78-65 68-3Z" fill="#F59A45"/>'
            '<path d="M-32-3C-38-53-22-95 0-101S38-53 32-3Z" fill="#FFF1D6"/>'
            f'<path d="M-58-65q18-6 28 6M-62-33q18-4 26 8M58-65q-18-6-28 6M62-33q-18-4-26 8" stroke="{INK}" stroke-width="7" fill="none" stroke-linecap="round"/>'
            '<ellipse cx="-46" cy="-5" rx="28" ry="13" fill="#F59A45"/><ellipse cx="46" cy="-5" rx="28" ry="13" fill="#F59A45"/>')
    if disguise:  # 엄마 치마를 두르고 있어요
        body += ('<path d="M-66-2C-62-66-38-104 0-108S62-66 66-2Z" fill="#E4738A"/>'
                 '<path d="M-58-16C-36-8 36-8 58-16" stroke="#D05E77" stroke-width="5" fill="none" stroke-linecap="round"/>')
    paw_l = '<ellipse cx="16" cy="-7" rx="17" ry="11" fill="#FFE7C7"/>'
    if pose == 'reach':
        arm = anim('paw', '<path d="M-18-93Q-60-101-88-125" stroke="#F59A45" stroke-width="28" fill="none" stroke-linecap="round"/>'
                   f'<path d="M-54-109l6 14M-70-119l5 14" stroke="{INK}" stroke-width="6" stroke-linecap="round"/>'
                   '<circle cx="-94" cy="-129" r="17" fill="#FFE7C7"/>')
    elif pose == 'knock':
        arm = anim('knock', '<path d="M-18-95Q-56-118-74-156" stroke="#F59A45" stroke-width="28" fill="none" stroke-linecap="round"/>'
                   f'<path d="M-48-118l10 10M-60-134l10 8" stroke="{INK}" stroke-width="6" stroke-linecap="round"/>'
                   '<circle cx="-78" cy="-164" r="17" fill="#FFE7C7"/>')
    elif pose == 'climb':  # 두 앞발을 위로 뻗어요
        arm = anim('paw', '<path d="M-22-100Q-40-150-30-196M22-100Q36-150 26-196" stroke="#F59A45" stroke-width="26" fill="none" stroke-linecap="round"/>'
                   f'<path d="M-36-150h14M24-150h14" stroke="{INK}" stroke-width="6" stroke-linecap="round"/>'
                   '<circle cx="-30" cy="-202" r="16" fill="#FFE7C7"/><circle cx="26" cy="-202" r="16" fill="#FFE7C7"/>')
    else:
        arm = '<ellipse cx="-16" cy="-7" rx="17" ry="11" fill="#FFE7C7"/>'
    lx, ly = look
    if mood == 'sweet':
        eyes = (f'<path d="M-36-189q10-10 20 0M10-189q10-10 20 0" stroke="{INK}" stroke-width="5" fill="none" stroke-linecap="round"/>')
        brows = ''
    else:
        eyes = (f'<circle cx="-24" cy="-189" r="12" fill="#fff"/><circle cx="22" cy="-189" r="12" fill="#fff"/>'
                f'<circle cx="{-24+lx}" cy="{-189+ly}" r="6.5" fill="#2B211C"/><circle cx="{22+lx}" cy="{-189+ly}" r="6.5" fill="#2B211C"/>'
                f'<circle cx="{-26+lx}" cy="{-192+ly}" r="2" fill="#fff"/><circle cx="{20+lx}" cy="{-192+ly}" r="2" fill="#fff"/>')
        brows = (f'<path d="M-38-207l24 6M36-207l-24 6" stroke="{INK}" stroke-width="5" stroke-linecap="round"/>'
                 if mood != 'surprised' else
                 f'<path d="M-36-212q10-6 20 0M12-212q10-6 20 0" stroke="{INK}" stroke-width="5" fill="none" stroke-linecap="round"/>')
    mouth = (f'<path d="M-1-164v6M-23-159q22 20 44 0" stroke="{INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/>'
             '<path d="M-12-154l4 9 4-8zM2-154l4 8 4-9z" fill="#fff"/>') if mood != 'surprised' else \
            f'<path d="M-1-164v4"/><ellipse cx="-1" cy="-152" rx="9" ry="8" fill="#B5485A"/>'
    head = ('<circle cx="-48" cy="-235" r="19" fill="#F59A45"/><circle cx="-48" cy="-235" r="9" fill="#FFC9A0"/>'
            '<circle cx="46" cy="-235" r="19" fill="#F59A45"/><circle cx="46" cy="-235" r="9" fill="#FFC9A0"/>'
            '<ellipse cx="-1" cy="-187" rx="68" ry="59" fill="#F59A45"/>'
            '<path d="M-66-175q-14 8-6 22q8-6 16-4M64-175q14 8 6 22q-8-6-16-4" fill="#FFF1D6"/>'
            '<ellipse cx="-1" cy="-163" rx="38" ry="27" fill="#FFF1D6"/>'
            f'<path d="M-18-229h34M-15-217h28M-13-206h24M-1-231v26" stroke="{INK}" stroke-width="6" stroke-linecap="round"/>'
            f'<path d="M-64-199q14 2 20 12M62-199q-14 2-20 12" stroke="{INK}" stroke-width="5" fill="none" stroke-linecap="round"/>'
            + eyes + brows
            + '<path d="M-10-173h18l-9 9z" fill="#E8707E" stroke="#E8707E" stroke-width="4" stroke-linejoin="round"/>'
            + mouth
            + f'<path d="M-38-159l-26-4M-38-151l-24 4M36-159l26-4M36-151l24 4" stroke="{INK}" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>')
    if disguise:  # 엄마 수건을 쓰고 있어요
        head += ('<path d="M-74-178C-78-262 76-262 72-178C58-214 30-232-1-232S-60-214-74-178Z" fill="#FFF6E6"/>'
                 '<path d="M-60-150l-14 22l22-10zM58-150l14 22l-22-10z" fill="#FFF6E6"/>')
    return tail + anim('breathe', body + paw_l + head) + arm


# ---------- 캐릭터: 토끼와 거북이 ----------
def rabbit(pose='stand', mood='calm'):
    """발밑 가운데 (0,0), 키 약 170(귀 포함)."""
    fur, inner = '#FBF8F3', '#FFC4CF'
    if pose == 'sleep':
        r = (f'<ellipse cx="0" cy="-26" rx="54" ry="27" fill="{fur}" stroke="#EDE6DA" stroke-width="2"/>'
             f'<circle cx="52" cy="-30" r="12" fill="#FFFFFF"/>'
             f'<ellipse cx="-30" cy="-58" rx="30" ry="12" fill="{fur}" transform="rotate(-12 -30 -58)"/>'
             f'<ellipse cx="-16" cy="-62" rx="26" ry="10" fill="{fur}" transform="rotate(-4 -16 -62)"/>'
             f'<ellipse cx="-16" cy="-62" rx="18" ry="5" fill="{inner}" transform="rotate(-4 -16 -62)"/>'
             f'<circle cx="-50" cy="-34" r="28" fill="{fur}"/>'
             + put(face('sleep', ex=8, mouth_y=10), -52, -36))
        return anim('breathe', r)
    body = (f'<ellipse cx="0" cy="-40" rx="32" ry="38" fill="{fur}" stroke="#EDE6DA" stroke-width="2"/>'
            '<ellipse cx="0" cy="-34" rx="18" ry="24" fill="#FFFFFF"/>'
            f'<circle cx="30" cy="-24" r="11" fill="#FFFFFF" stroke="#EDE6DA" stroke-width="2"/>'
            f'<ellipse cx="-15" cy="-4" rx="15" ry="7" fill="{fur}" stroke="#EDE6DA" stroke-width="2"/>'
            f'<ellipse cx="15" cy="-4" rx="15" ry="7" fill="{fur}" stroke="#EDE6DA" stroke-width="2"/>')
    if pose == 'point':
        arms = (f'<path d="M20-56Q44-62 60-76" stroke="{fur}" stroke-width="12" fill="none" stroke-linecap="round"/>'
                f'<circle cx="62" cy="-78" r="7" fill="{fur}" stroke="#EDE6DA" stroke-width="2"/>'
                f'<path d="M-20-56q-10 10-4 20" stroke="{fur}" stroke-width="12" fill="none" stroke-linecap="round"/>')
    elif pose == 'run':
        arms = (f'<path d="M18-56q20 4 28-8M-18-56q-20 8-30 0" stroke="{fur}" stroke-width="12" fill="none" stroke-linecap="round"/>')
    else:
        arms = (f'<path d="M-20-56q-10 10-4 20M20-56q10 10 4 20" stroke="{fur}" stroke-width="12" fill="none" stroke-linecap="round"/>')
    ears = (anim('ear', f'<ellipse cx="-13" cy="-150" rx="10" ry="32" fill="{fur}" stroke="#EDE6DA" stroke-width="2"/>'
                 f'<ellipse cx="-13" cy="-148" rx="5" ry="22" fill="{inner}"/>')
            + anim('ear', f'<ellipse cx="13" cy="-150" rx="10" ry="32" fill="{fur}" stroke="#EDE6DA" stroke-width="2"/>'
                   f'<ellipse cx="13" cy="-148" rx="5" ry="22" fill="{inner}"/>', delay=-1))
    head = (f'<circle cy="-98" r="30" fill="{fur}" stroke="#EDE6DA" stroke-width="2"/>'
            + put(face(mood, ex=11, ey=-4, eye_r=4, mouth_y=12)
                  + '<path d="M-4 3h8l-4 4z" fill="#FF8FA3" stroke="#FF8FA3" stroke-width="3" stroke-linejoin="round"/>', 0, -98))
    return ears + body + arms + head


def turtle(mood='calm', band=False):
    """발밑 가운데 (0,0), 너비 약 150. 오른쪽을 봐요."""
    t = ('<ellipse cx="-34" cy="-4" rx="13" ry="9" fill="#A8D58A"/><ellipse cx="30" cy="-4" rx="13" ry="9" fill="#A8D58A"/>'
         '<path d="M-58-14l-12 6l12 2z" fill="#A8D58A"/>'
         '<path d="M50-30Q66-40 70-56" stroke="#A8D58A" stroke-width="20" fill="none" stroke-linecap="round"/>'
         '<circle cx="76" cy="-62" r="22" fill="#A8D58A"/>'
         + put(face(mood, ex=7, ey=-2, eye_r=3.6, mouth_y=9), 80, -62)
         + ('<path d="M56-74q20-10 40-2" stroke="#E4573D" stroke-width="7" fill="none" stroke-linecap="round"/>'
            '<path d="M56-74l-12 6M56-74l-10-6" stroke="#E4573D" stroke-width="5" stroke-linecap="round"/>' if band else '')
         + '<path d="M-58-12C-58-76 58-76 58-12Z" fill="#7DB86A"/>'
         '<path d="M-30-60l-8 22h20l8-22M30-60l8 22H18l-8-22M-38-38l-14 22M38-38l14 22M-18-38L-10-16h20l8-22" '
         'stroke="#5E9A50" stroke-width="4" fill="none" stroke-linejoin="round"/>'
         '<rect x="-62" y="-18" width="124" height="12" rx="6" fill="#E9D9A0"/>')
    return anim('bob', t)


# ---------- 캐릭터: 나무꾼과 산신령 ----------
def axe(kind='iron'):
    head = {'iron': ('#8E98A3', '#B8C1CA'), 'gold': ('#F2B21B', '#FFE07A'), 'silver': ('#C9D3DC', '#F2F6FA')}[kind]
    a = ('<rect x="-5" y="-110" width="10" height="110" rx="5" fill="#9C6B45"/>'
         f'<path d="M4-108h22c14 6 20 22 18 40c-14-6-26-8-40-6z" fill="{head[0]}"/>'
         f'<path d="M30-100c6 6 9 14 9 24" stroke="{head[1]}" stroke-width="4" fill="none" stroke-linecap="round"/>')
    if kind == 'gold':
        a = f'<circle cx="20" cy="-86" r="40" fill="url(#glow)"/>' + a
    return a


def woodcutter(pose='chop', mood='calm'):
    """발밑 가운데 (0,0), 키 약 230."""
    legs = ('<path d="M-34-2C-36-50-26-90 0-92S36-50 34-2Z" fill="#EFE6D2"/>'
            '<path d="M0-80V-2" stroke="#D8CCB2" stroke-width="4"/>'
            '<path d="M-36-22h28M8-22h28" stroke="#8A6E52" stroke-width="5" stroke-linecap="round"/>'
            '<ellipse cx="-20" cy="-3" rx="16" ry="7" fill="#7A5A3E"/><ellipse cx="20" cy="-3" rx="16" ry="7" fill="#7A5A3E"/>')
    top = ('<path d="M-46-80C-46-138-26-160 0-160S46-138 46-80Z" fill="#A8784E"/>'
           '<path d="M-12-158L0-132L12-158" stroke="#7A5A3E" stroke-width="6" fill="none" stroke-linecap="round"/>'
           '<rect x="-46" y="-92" width="92" height="12" rx="6" fill="#7A5A3E"/>')
    S = '#A8784E'
    if pose == 'chop':
        arms = anim('chop', f'<path d="M-30-146Q-64-170-40-206M30-146Q10-182-20-206" stroke="{S}" stroke-width="20" fill="none" stroke-linecap="round"/>'
                    + put(axe('iron'), -36, -170, 1, rot=-50) + f'<circle cx="-34" cy="-210" r="10" fill="{SKIN}"/><circle cx="-22" cy="-210" r="10" fill="{SKIN}"/>')
    elif pose == 'reach':
        arms = (f'<path d="M30-146Q70-150 96-130" stroke="{S}" stroke-width="20" fill="none" stroke-linecap="round"/>'
                f'<circle cx="102" cy="-126" r="10" fill="{SKIN}"/>'
                f'<path d="M-30-146Q-50-120-46-96" stroke="{S}" stroke-width="20" fill="none" stroke-linecap="round"/>'
                f'<circle cx="-46" cy="-90" r="10" fill="{SKIN}"/>')
    elif pose == 'cry':
        arms = (f'<path d="M-30-146Q-50-176-22-196M30-146Q50-176 22-196" stroke="{S}" stroke-width="20" fill="none" stroke-linecap="round"/>'
                f'<circle cx="-18" cy="-198" r="10" fill="{SKIN}"/><circle cx="18" cy="-198" r="10" fill="{SKIN}"/>')
    elif pose == 'no':
        arms = (anim('paw', f'<path d="M30-146Q66-160 70-198" stroke="{S}" stroke-width="20" fill="none" stroke-linecap="round"/>'
                     f'<ellipse cx="70" cy="-208" rx="11" ry="14" fill="{SKIN}"/>')
                + f'<path d="M-30-146Q-50-120-46-96" stroke="{S}" stroke-width="20" fill="none" stroke-linecap="round"/>'
                f'<circle cx="-46" cy="-90" r="10" fill="{SKIN}"/>')
    elif pose == 'bow':
        arms = (f'<path d="M-30-146Q-20-120-4-124M30-146Q20-120 4-124" stroke="{S}" stroke-width="20" fill="none" stroke-linecap="round"/>'
                f'<ellipse cy="-128" rx="11" ry="13" fill="{SKIN}"/>')
    elif pose == 'cheer':
        arms = (f'<path d="M-30-146Q-60-176-56-214M30-146Q60-176 56-214" stroke="{S}" stroke-width="20" fill="none" stroke-linecap="round"/>'
                f'<circle cx="-56" cy="-220" r="10" fill="{SKIN}"/><circle cx="56" cy="-220" r="10" fill="{SKIN}"/>')
    else:
        arms = (f'<path d="M-30-146Q-50-120-46-96M30-146Q50-120 46-96" stroke="{S}" stroke-width="20" fill="none" stroke-linecap="round"/>'
                f'<circle cx="-46" cy="-90" r="10" fill="{SKIN}"/><circle cx="46" cy="-90" r="10" fill="{SKIN}"/>')
    head = (f'<circle cy="-192" r="32" fill="{SKIN}"/>'
            '<path d="M-30-180C-30-150 30-150 30-180C24-162 12-158 0-158S-24-162-30-180Z" fill="#3B3036"/>'
            '<path d="M-32-196C-32-232 32-232 32-196C24-210 12-214 0-214S-24-210-32-196Z" fill="#3B3036"/>'
            '<ellipse cy="-234" rx="10" ry="12" fill="#3B3036"/>'
            '<rect x="-33" y="-212" width="66" height="9" rx="4.5" fill="#FFFFFF"/>'
            + put(face(mood, ex=11, ey=0, mouth_y=14), 0, -194))
    return anim('breathe', legs + top + head) + arms


def sinseon(hold=None, rising=False):
    """산신령. 발밑 가운데 (0,0)은 구름 아래, 키 약 260."""
    mist = ('<ellipse cx="0" cy="-8" rx="90" ry="22" fill="#FFFFFF" opacity=".9"/>'
            '<ellipse cx="-50" cy="-20" rx="40" ry="20" fill="#FFFFFF"/><ellipse cx="44" cy="-22" rx="44" ry="22" fill="#FFFFFF"/>')
    robe = ('<path d="M-56-20C-52-110-32-170 0-172S52-110 56-20Z" fill="#F4F7FB"/>'
            '<path d="M-14-168L0-120L14-168" stroke="#BFD6EA" stroke-width="6" fill="none" stroke-linecap="round"/>'
            '<path d="M-56-60C-20-50 20-50 56-60" stroke="#BFD6EA" stroke-width="5" fill="none"/>')
    staff = ('<path d="M-70 -10C-74-100-62-180-72-240" stroke="#8A5A3B" stroke-width="10" fill="none" stroke-linecap="round"/>'
             '<path d="M-72-240q-14-10-8-24M-72-240q14-12 10-26" stroke="#8A5A3B" stroke-width="7" fill="none" stroke-linecap="round"/>'
             '<circle cx="-74" cy="-200" r="12" fill="#E9B44C"/><circle cx="-74" cy="-214" r="8" fill="#E9B44C"/>')
    arm_l = (f'<path d="M-30-150Q-60-150-66-176" stroke="#F4F7FB" stroke-width="22" fill="none" stroke-linecap="round"/>'
             f'<circle cx="-68" cy="-182" r="10" fill="{SKIN}"/>')
    if hold == 'gold':
        arm_r = (f'<path d="M30-150Q66-170 70-214" stroke="#F4F7FB" stroke-width="22" fill="none" stroke-linecap="round"/>'
                 + put(anim('float', axe('gold')), 72, -190, 1.1, rot=20) + f'<circle cx="72" cy="-218" r="10" fill="{SKIN}"/>')
    elif hold == 'give':
        arm_r = (f'<path d="M30-150Q60-140 80-128" stroke="#F4F7FB" stroke-width="22" fill="none" stroke-linecap="round"/>'
                 f'<circle cx="86" cy="-126" r="10" fill="{SKIN}"/>')
    else:
        arm_r = (f'<path d="M30-150Q56-130 56-104" stroke="#F4F7FB" stroke-width="22" fill="none" stroke-linecap="round"/>'
                 f'<circle cx="56" cy="-98" r="10" fill="{SKIN}"/>')
    head = (f'<circle cy="-200" r="32" fill="{SKIN}"/>'
            '<path d="M-28-196C-34-140-14-110 0-96C14-110 34-140 28-196C18-176 8-172 0-172S-18-176-28-196Z" fill="#FFFFFF" stroke="#E3EAF1" stroke-width="2"/>'
            '<path d="M-34-210C-36-246 36-246 34-210C24-222 12-226 0-226S-24-222-34-210Z" fill="#FFFFFF" stroke="#E3EAF1" stroke-width="2"/>'
            '<path d="M-22-210q8-6 16-2M6-212q8-4 16 2" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round"/>'
            f'<path d="M-16-200q5 4 10 0M6-200q5 4 10 0" stroke="{INK}" stroke-width="3" fill="none" stroke-linecap="round"/>'
            f'<circle cx="-20" cy="-188" r="5" fill="{BLUSH}" opacity=".5"/><circle cx="20" cy="-188" r="5" fill="{BLUSH}" opacity=".5"/>')
    figure = staff + robe + arm_l + arm_r + head
    return mist + anim('bob' if not rising else 'float', figure)


# ---------- 쪽 그림 ----------
def page(name, title, kind, body):
    defs, back = bg(kind)
    (OUT / f'{name}.svg').write_text(svg(title, defs, back + body), encoding='utf-8')
