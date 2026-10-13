"""요즘 추억 그림: 거리(역 앞·학교 앞·시장 골목) 배경과 분식·간식·가게·버스 같은 소품.

추억 질문("초등학교 끝나고 포장마차에서 떡볶이를 사 먹었어", "부천역 앞 토스트")에 쓰여요.
draw_scenes.py 그림체를 따라요. 바닥 가운데가 (0,0) 이에요.
"""
from draw_scenes import INK, anim, grad, GLOW


# ---------- 배경: 거리 ----------
def street_bg(night=False):
    """건물이 늘어선 거리: 하늘 · 먼 건물 · 가게 건물 · 보도(인물이 서는 곳) · 차도. 바닥선 y≈505."""
    sky = [(0, '#1E2547'), (1, '#4A4878')] if night else [(0, '#BFE4FF'), (.7, '#FFF4D6')]
    d = grad('sky', sky)
    far = '#2C3358' if night else '#D9E4EE'
    lit = '#FFD66B' if night else '#BFE4FF'
    dark = '#3A4170' if night else '#A9C9E6'
    b = '<rect width="800" height="600" fill="url(#sky)"/>'
    # 먼 건물 실루엣
    b += ''.join(f'<rect x="{x}" y="{y}" width="{w}" height="{440 - y}" fill="{far}"/>'
                 for x, y, w in ((0, 210, 90), (80, 170, 70), (150, 230, 110), (330, 180, 80), (520, 200, 100), (610, 150, 70), (700, 220, 100)))
    # 가까운 건물들 (창문은 밤이면 몇 개만 불이 켜져요)
    cols = ('#F5E1C8', '#E8D4BC', '#F2C9B5', '#DCE6D5', '#F7E7C4')
    if night:
        cols = ('#5A4E6E', '#4E4766', '#5E5070', '#4A5168', '#56506A')
    blocks = ((0, 260, 150), (150, 300, 140), (290, 250, 120), (410, 290, 160), (570, 240, 120), (690, 280, 110))
    for n, (x, top, w) in enumerate(blocks):
        b += f'<rect x="{x}" y="{top}" width="{w}" height="{440 - top}" fill="{cols[n % len(cols)]}"/>'
        b += f'<rect x="{x}" y="{top}" width="{w}" height="8" fill="{"#3E3858" if night else "#E0CBB0"}"/>'
        for row, wy in enumerate(range(top + 26, 400, 46)):
            for col, wx in enumerate(range(x + 16, x + w - 30, 40)):
                on = night and (row * 3 + col + n) % 3 != 0
                b += f'<rect x="{wx}" y="{wy}" width="24" height="28" rx="3" fill="{lit if (on or not night) else dark}"/>'
    # 보도 · 연석 · 차도
    walk = '#B9AFA0' if night else '#E9DFCC'
    b += f'<rect y="440" width="800" height="126" fill="{walk}"/>'
    b += ''.join(f'<path d="M{x} 440l-14 126" stroke="{"#A79D8E" if night else "#DCCFB6"}" stroke-width="2"/>' for x in range(40, 820, 80))
    b += f'<path d="M0 470H800M0 515H800" stroke="{"#A79D8E" if night else "#DCCFB6"}" stroke-width="2"/>'
    b += f'<rect y="560" width="800" height="8" fill="{"#8E8577" if night else "#CFC2A8"}"/>'
    b += f'<rect y="568" width="800" height="32" fill="{"#4E5258" if night else "#7A7F87"}"/>'
    b += ''.join(f'<rect x="{x}" y="582" width="44" height="5" rx="2" fill="#F5F0E0"/>' for x in range(20, 800, 110))
    # 가로등
    for x in (36, 764):
        b += (f'<path d="M{x} 446V300q0-18 {18 if x < 400 else -18}-18" stroke="#5A5A66" stroke-width="7" fill="none"/>'
              f'<rect x="{x + (8 if x < 400 else -32)}" y="276" width="24" height="12" rx="5" fill="#5A5A66"/>')
        if night:
            b += f'<circle cx="{x + (20 if x < 400 else -20)}" cy="294" r="34" fill="#FFE9A8" opacity=".35"/>'
    return d + GLOW, b


# ---------- 큰 소품 (가장자리에 서요) ----------
def pocha():
    """포장마차: 주황 천막, 안에는 불빛과 떡볶이 판, 앞에 동그란 의자."""
    return ('<path d="M-140-60L-120-176H120L140-60Z" fill="#F28C28"/>'
            '<path d="M-120-176H120L112-160H-112Z" fill="#E07A1C"/>'
            '<path d="M-110-60C-110-130-80-150 0-150S110-130 110-60Z" fill="#5A3A2A"/>'
            '<path d="M0-150V-134" stroke="#3A2A1A" stroke-width="2"/>' + anim('glow', '<circle cy="-126" r="10" fill="#FFE27A"/>')
            + '<rect x="-96" y="-84" width="192" height="24" rx="4" fill="#C98B4E"/>'
            '<ellipse cx="-40" cy="-88" rx="40" ry="10" fill="#7A7F87"/><ellipse cx="-40" cy="-90" rx="34" ry="7" fill="#E4573D"/>'
            '<path d="M-60-92h10M-44-94h10M-30-90h10" stroke="#FFF3DD" stroke-width="4" stroke-linecap="round"/>'
            '<rect x="30" y="-104" width="10" height="20" rx="3" fill="#FFFFFF"/><rect x="48" y="-104" width="10" height="20" rx="3" fill="#FFFFFF"/>'
            '<path d="M-96-60V0M96-60V0" stroke="#8A5A3B" stroke-width="6"/>'
            + ''.join(f'<rect x="{x}" y="-26" width="34" height="8" rx="3" fill="{c}"/><path d="M{x + 6}-18L{x + 2} 0M{x + 28}-18L{x + 32} 0" stroke="{c}" stroke-width="5"/>'
                      for x, c in ((-130, '#E4573D'), (100, '#4A7FD0'))))


def shop():
    """동네 가게(문방구·편의점·빵집): 줄무늬 차양, 진열 창, 문."""
    stripes = ''.join(f'<path d="M{x}-150h34v28q-17 10-34 0z" fill="{c}"/>' for x, c in zip(range(-136, 136, 34), ('#3FA36B', '#FFF6E6') * 4))
    shelf = ''.join(f'<rect x="{x}" y="{y}" width="14" height="18" rx="2" fill="{c}"/>'
                    for y in (-100, -72) for x, c in zip(range(-118, -20, 20), ('#E4573D', '#FFD66B', '#7FB8E6', '#FF8FA3', '#8CCB8A')))
    return ('<rect x="-140" y="-200" width="280" height="200" fill="#FFF3DD" stroke="#E5D3B0" stroke-width="3"/>'
            '<rect x="-140" y="-200" width="280" height="40" fill="#3FA36B"/><rect x="-100" y="-192" width="200" height="24" rx="6" fill="#FFFFFF"/>'
            + stripes + '<rect x="-126" y="-110" width="120" height="70" rx="4" fill="#CFE8FF" stroke="#C9B48E" stroke-width="3"/>'
            '<path d="M-126-80H-6M-126-52H-6" stroke="#C9B48E" stroke-width="2"/>' + shelf
            + '<rect x="30" y="-116" width="70" height="116" rx="4" fill="#C98B4E"/><rect x="40" y="-104" width="50" height="50" rx="3" fill="#CFE8FF"/>'
            '<circle cx="86" cy="-50" r="4" fill="#FFD66B"/>')


def bus():
    """버스: 초록 마을버스 옆모습."""
    win = ''.join(f'<rect x="{x}" y="-118" width="46" height="40" rx="6" fill="#CFE8FF"/>' for x in range(-126, 80, 54))
    return ('<rect x="-150" y="-140" width="300" height="114" rx="22" fill="#5DBB6B"/>'
            '<rect x="-150" y="-60" width="300" height="16" fill="#FFD66B"/>' + win
            + '<rect x="112" y="-118" width="30" height="76" rx="6" fill="#CFE8FF" stroke="#4A9B57" stroke-width="3"/>'
            '<rect x="-160" y="-36" width="320" height="10" rx="5" fill="#4A9B57"/>'
            + ''.join(f'<circle cx="{x}" cy="-18" r="20" fill="#3A3436"/><circle cx="{x}" cy="-18" r="8" fill="#C9C9C9"/>' for x in (-90, 92))
            + '<circle cx="146" cy="-50" r="6" fill="#FFF1B8"/>')


def station():
    """기차역 건물: 큰 아치 입구와 시계."""
    return ('<rect x="-160" y="-170" width="320" height="170" fill="#F2E3CC" stroke="#D9C2A0" stroke-width="3"/>'
            '<path d="M-176-170L0-230L176-170Z" fill="#8A5A3B"/>'
            '<circle cy="-190" r="20" fill="#FFFFFF" stroke="#5A4A3A" stroke-width="4"/><path d="M0-190v-12M0-190h9" stroke="#5A4A3A" stroke-width="3" stroke-linecap="round"/>'
            '<rect x="-90" y="-160" width="180" height="26" rx="6" fill="#3E6FB0"/><rect x="-70" y="-152" width="140" height="10" rx="4" fill="#FFFFFF" opacity=".85"/>'
            '<path d="M-56 0V-80Q-56-122 0-122T56-80V0Z" fill="#7A5A44"/><path d="M-44 0V-78Q-44-108 0-108T44-78V0Z" fill="#CFE8FF"/>'
            + ''.join(f'<rect x="{x}" y="-118" width="40" height="56" rx="20" fill="#CFE8FF" stroke="#D9C2A0" stroke-width="3"/>' for x in (-140, 100))
            + '<rect x="-170" y="-6" width="340" height="6" fill="#D9C2A0"/>')


# ---------- 먹을거리 (손에 들거나 땅에 놓아요) ----------
def tteokbokki():
    """떡볶이 한 접시: 빨간 양념 속 떡과 어묵, 꼬치."""
    sticks = ''.join(f'<rect x="{x}" y="{y}" width="26" height="10" rx="5" fill="#F05A3A" stroke="#C8402A" stroke-width="2" transform="rotate({a} {x + 13} {y + 5})"/>'
                     for x, y, a in ((-34, -26, -12), (-8, -30, 8), (14, -24, -6), (-20, -16, 14), (6, -14, -16)))
    return ('<ellipse cy="-8" rx="46" ry="12" fill="#FFFFFF" stroke="#E0D2B4" stroke-width="3"/>'
            '<ellipse cy="-14" rx="38" ry="12" fill="#D9452B"/>' + sticks
            + '<path d="M18-30l14 6-6 10z" fill="#F2C38B" stroke="#D9A066" stroke-width="2"/>'
            '<path d="M-2-28L-14-58" stroke="#C9A06A" stroke-width="3" stroke-linecap="round"/>')


def toast():
    """길거리 토스트: 종이에 싼 빵 사이로 달걀과 양배추."""
    return ('<path d="M-30-46C-34-60-18-66 0-66S34-60 30-46Z" fill="#E7B06A"/>'
            '<rect x="-31" y="-48" width="62" height="10" rx="4" fill="#FFD66B"/><rect x="-31" y="-40" width="62" height="6" rx="3" fill="#9CCB6A"/>'
            '<rect x="-31" y="-36" width="62" height="10" rx="4" fill="#E7B06A"/>'
            '<path d="M-34-30H34L28 0H-28Z" fill="#FFFFFF" stroke="#E0D2B4" stroke-width="2.5"/>'
            '<path d="M-18-20h36" stroke="#F2A33C" stroke-width="4" stroke-linecap="round"/>')


def fishcake():
    """어묵 꼬치와 국물 한 컵."""
    return ('<path d="M-14 0V-92" stroke="#C9A06A" stroke-width="4" stroke-linecap="round"/>'
            '<path d="M-14-84C-36-80-36-70-14-66S8-56-14-50-36-40-14-34" stroke="#E2B678" stroke-width="16" fill="none" stroke-linecap="round"/>'
            '<path d="M10 0L14-34H42L46 0Z" fill="#FFFFFF" stroke="#E0D2B4" stroke-width="2.5"/><rect x="14" y="-34" width="28" height="6" fill="#F2D59A"/>'
            + anim('rise', '<path d="M24-44q-6-8 0-14M34-46q-6-8 0-14" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>'))


def gimbap():
    """김밥 한 줄을 썰어 접시에."""
    slice_ = lambda x, y: (f'<circle cx="{x}" cy="{y}" r="15" fill="#2E3A2E"/><circle cx="{x}" cy="{y}" r="11" fill="#FFFDF6"/>'
                          f'<circle cx="{x - 3}" cy="{y - 2}" r="3" fill="#F2A33C"/><circle cx="{x + 4}" cy="{y - 1}" r="3" fill="#6FB35A"/>'
                          f'<circle cx="{x}" cy="{y + 4}" r="3" fill="#FFD66B"/><circle cx="{x + 2}" cy="{y - 6}" r="2.5" fill="#E4573D"/>')
    return ('<ellipse cy="-8" rx="58" ry="12" fill="#FFFFFF" stroke="#E0D2B4" stroke-width="3"/>'
            + slice_(-34, -22) + slice_(-4, -24) + slice_(26, -22) + slice_(-18, -38) + slice_(12, -40))


def bungeoppang():
    """붕어빵·호떡 같은 길거리 군것질: 붕어 모양 빵 두 개."""
    fish = lambda x, y: (f'<path d="M{x - 34} {y}C{x - 26} {y - 22} {x + 14} {y - 24} {x + 26} {y - 8}L{x + 40} {y - 20}V{y + 14}L{x + 26} {y + 4}C{x + 14} {y + 20} {x - 26} {y + 18} {x - 34} {y}Z" fill="#D9984E" stroke="#B9783A" stroke-width="2.5"/>'
                         f'<circle cx="{x - 20}" cy="{y - 4}" r="3.5" fill="{INK}"/>'
                         f'<path d="M{x - 6} {y - 8}q6 6 0 12M{x + 6} {y - 8}q6 6 0 12" stroke="#B9783A" stroke-width="2.5" fill="none"/>')
    return fish(0, -36) + fish(-8, -14)


def chicken():
    """치킨 상자: 닭다리 두 개."""
    leg = lambda x, a: (f'<g transform="rotate({a} {x} -40)"><path d="M{x - 16}-40C{x - 22}-70 {x + 22}-70 {x + 16}-40C{x + 10}-30 {x - 10}-30 {x - 16}-40Z" fill="#C9772E"/>'
                        f'<rect x="{x - 4}" y="-34" width="8" height="18" fill="#FFF6E6"/><circle cx="{x - 5}" cy="-14" r="5" fill="#FFF6E6"/><circle cx="{x + 5}" cy="-14" r="5" fill="#FFF6E6"/></g>')
    return ('<path d="M-46-36H46L40 0H-40Z" fill="#E4573D"/><path d="M-46-36H46" stroke="#FFFFFF" stroke-width="4"/>'
            + leg(-14, -14) + leg(16, 12)
            + '<path d="M-34-22H34" stroke="#FFFFFF" stroke-width="3" stroke-dasharray="8 6"/>')


def pizza():
    """피자 한 조각."""
    return ('<path d="M-34-10L0-70L34-10Z" fill="#FFD66B"/><path d="M-38-8Q0-24 38-8L34 0Q0-14-34 0Z" fill="#D9984E"/>'
            '<circle cx="-8" cy="-30" r="7" fill="#E4573D"/><circle cx="12" cy="-24" r="6" fill="#E4573D"/><circle cx="0" cy="-50" r="5" fill="#E4573D"/>'
            '<path d="M-18-22q4-4 8 0M8-40q4-4 8 0" stroke="#6FB35A" stroke-width="3" fill="none" stroke-linecap="round"/>')


def burger():
    """햄버거."""
    return ('<path d="M-36-40C-36-66 36-66 36-40Z" fill="#E7A55A"/>'
            + ''.join(f'<ellipse cx="{x}" cy="{y}" rx="3" ry="2" fill="#FFF3DD"/>' for x, y in ((-14, -54), (4, -58), (18, -50), (-2, -46)))
            + '<path d="M-40-40q10 8 20 0t20 0 20 0 20 0" stroke="#7DC05A" stroke-width="6" fill="none" stroke-linecap="round"/>'
            '<path d="M-36-36H36L28-26H-28Z" fill="#FFD66B"/><rect x="-38" y="-30" width="76" height="14" rx="7" fill="#7A4A26"/>'
            '<path d="M-36-16H36C36-2 26 0 0 0S-36-2-36-16Z" fill="#E7A55A"/>')


def cup():
    """찻잔·커피잔: 김이 모락모락."""
    return ('<path d="M-26-50H26L22-6Q20 0 14 0H-14Q-20 0-22-6Z" fill="#FFFFFF" stroke="#DDE7F3" stroke-width="3"/>'
            '<path d="M26-40q18 0 16 14t-18 12" stroke="#DDE7F3" stroke-width="6" fill="none"/>'
            '<ellipse cy="-48" rx="24" ry="5" fill="#8A5A3B"/><path d="M-26-30H24" stroke="#FFC4CF" stroke-width="5"/>'
            + anim('rise', '<path d="M-8-60q-8-10 0-20t0-20M8-62q-8-10 0-20t0-18" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round" opacity=".85"/>'))


def props():
    return {
        'pocha': pocha(), 'shop': shop(), 'bus': bus(), 'station': station(),
        'tteokbokki': tteokbokki(), 'toast': toast(), 'fishcake': fishcake(), 'gimbap': gimbap(), 'bungeoppang': bungeoppang(),
        'chicken': chicken(), 'pizza': pizza(), 'burger': burger(), 'cup': cup(),
    }
