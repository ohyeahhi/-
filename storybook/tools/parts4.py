"""상황(소풍·명절·운동회·캠핑…)과 감정 표시에 쓰는 부품.

draw_scenes.py 그림체를 따라요. 바닥 가운데가 (0,0) 이에요. (하늘에 뜨는 것은 가운데가 (0,0))
"""
from draw_scenes import INK, put, anim


# ---------- 상황 소품 ----------
def fireworks():
    """불꽃놀이: 하늘에 세 송이."""
    def burst(cx, cy, r, color, d):
        rays = ''.join(f'<path d="M0 0L{r * __import__("math").cos(a / 12 * 6.283):.1f} {r * __import__("math").sin(a / 12 * 6.283):.1f}" '
                       f'stroke="{color}" stroke-width="4" stroke-linecap="round"/>' for a in range(12))
        dots = ''.join(f'<circle cx="{(r + 10) * __import__("math").cos(a / 12 * 6.283 + .26):.1f}" cy="{(r + 10) * __import__("math").sin(a / 12 * 6.283 + .26):.1f}" r="3" fill="{color}"/>' for a in range(12))
        return put(anim('twinkle', rays + dots, d), cx, cy)
    return burst(-150, 0, 46, '#FFD66B', 0) + burst(30, -40, 56, '#FF8FA3', -.6) + burst(190, 10, 40, '#8FD0F2', -1.2)


def tent():
    return ('<path d="M-110 0L0-150L110 0Z" fill="#F2A33C"/><path d="M0-150L110 0H40Z" fill="#E08A2A"/>'
            '<path d="M-24 0L0-70L24 0Z" fill="#7A4A26"/><path d="M0-150V-176" stroke="#8A5A3B" stroke-width="5"/>'
            '<path d="M0-176l26 8-26 8z" fill="#E4573D"/>')


def campfire():
    return ('<path d="M-40 0L36-18M-36-18L40 0" stroke="#8A5A3B" stroke-width="12" stroke-linecap="round"/>'
            + anim('glow', '<path d="M0-90C-30-60-30-30-18-14H18C30-30 30-60 0-90Z" fill="#F28C28"/>'
                           '<path d="M0-60C-14-40-14-24-8-14H8C14-24 14-40 0-60Z" fill="#FFD66B"/>')
            + anim('rise', '<circle cx="14" cy="-100" r="3" fill="#FFB347"/><circle cx="-10" cy="-112" r="2.5" fill="#FFB347"/>'))


def xmas_tree():
    return ('<rect x="-12" y="-30" width="24" height="30" fill="#8A5A3B"/>'
            '<path d="M-80-30L0-120L80-30Z" fill="#3F8F5A"/><path d="M-66-90L0-170L66-90Z" fill="#4AA266"/><path d="M-48-146L0-210L48-146Z" fill="#5BB876"/>'
            + ''.join(anim('twinkle', f'<circle cx="{x}" cy="{y}" r="6" fill="{c}"/>', d) for x, y, c, d in
                      ((-40, -50, '#E4573D', 0), (30, -60, '#FFD66B', -.4), (-20, -110, '#7FB8E6', -.8), (24, -126, '#FF8FA3', -1.2), (0, -170, '#FFD66B', -.6)))
            + '<path d="M0-236l7 14 15 2-11 10 3 15-14-7-14 7 3-15-11-10 15-2z" fill="#FFD84A"/>')


def school():
    return ('<rect x="-150" y="-130" width="300" height="130" fill="#FFF3DD" stroke="#E5D3B0" stroke-width="3"/>'
            '<path d="M-166-130L0-200L166-130Z" fill="#E4573D"/><rect x="-30" y="-176" width="60" height="40" fill="#FFF3DD"/>'
            '<circle cy="-156" r="14" fill="#FFFFFF" stroke="#8A5A3B" stroke-width="3"/><path d="M0-156v-8M0-156h6" stroke="#8A5A3B" stroke-width="2.5"/>'
            + ''.join(f'<rect x="{x}" y="-104" width="40" height="34" rx="3" fill="#BFE4FF" stroke="#E5D3B0" stroke-width="2"/>' for x in (-130, -80, 40, 90))
            + '<rect x="-24" y="-70" width="48" height="70" fill="#C98B4E"/><path d="M0-70V0" stroke="#A8744A" stroke-width="3"/>'
            '<path d="M-150 0v-6h300v6" fill="#E5D3B0"/>')


def stall():
    """시장 좌판: 차양 아래 바구니."""
    awning = ''.join(f'<path d="M{x} -120h30v24q-15 10-30 0z" fill="{c}"/>' for x, c in zip(range(-90, 90, 30), ('#E4573D', '#FFF6E6') * 3))
    return ('<path d="M-84-120V0M84-120V0" stroke="#8A5A3B" stroke-width="7"/>' + awning
            + '<rect x="-96" y="-44" width="192" height="44" rx="4" fill="#C98B4E"/>'
            + ''.join(f'<ellipse cx="{x}" cy="-50" rx="24" ry="12" fill="{c}"/>' for x, c in ((-56, '#E4573D'), (0, '#FFA63C'), (56, '#8CCB8A'))))


def swing():
    return ('<path d="M-70 0L-50-150M70 0L50-150M-60-150H60" stroke="#8A5A3B" stroke-width="8" stroke-linecap="round"/>'
            + anim('sway', '<path d="M-20-150V-50M20-150V-50" stroke="#B9A07E" stroke-width="3"/><rect x="-30" y="-52" width="60" height="10" rx="4" fill="#E4573D"/>'))


def bunting():
    """만국기·잔치 깃발 줄 (하늘에 걸어요, 너비 720)."""
    cols = ('#E4573D', '#FFD66B', '#7FB8E6', '#8CCB8A', '#FF8FA3', '#B9A7E8')
    flags = ''.join(f'<path d="M{x} {6 + abs(x) * 0.04:.0f}h30l-15 26z" fill="{cols[i % 6]}"/>' for i, x in enumerate(range(-345, 345, 46)))
    return anim('sway', '<path d="M-360 0Q0 50 360 0" stroke="#8A6448" stroke-width="2" fill="none"/>' + flags)


def laundry():
    return ('<path d="M-120 0V-130M120 0V-130M-120-120Q0-96 120-120" stroke="#8A5A3B" stroke-width="5" fill="none"/>'
            + anim('sway', '<rect x="-90" y="-114" width="44" height="54" rx="4" fill="#7FB8E6"/><path d="M-30-110h40v26h-8v30h-24v-30h-8z" fill="#FF9AA8"/>'
                           '<rect x="40" y="-112" width="40" height="40" rx="3" fill="#FFF6E6" stroke="#E5DCCB" stroke-width="2"/>'))


def sandcastle():
    return ('<path d="M-60 0V-40H-40V-56H-30V-40H-10V-70H10V-40H30V-56H40V-40H60V0Z" fill="#F3DFB4" stroke="#E0C48E" stroke-width="2"/>'
            '<rect x="-8" y="-24" width="16" height="24" rx="8" fill="#E0C48E"/><path d="M0-70v-24" stroke="#8A5A3B" stroke-width="3"/><path d="M0-94l18 6-18 6z" fill="#E4573D"/>')


def bathtub():
    bubbles = ''.join(anim('float', f'<circle cx="{x}" cy="{y}" r="{r}" fill="#FFFFFF" stroke="#BFE4FF" stroke-width="2"/>', -i * .4)
                      for i, (x, y, r) in enumerate(((-60, -70, 14), (-30, -82, 18), (10, -76, 16), (44, -84, 14), (70, -70, 10))))
    return ('<path d="M-100-60H100V-30C100-6 80 0 60 0H-60C-80 0-100-6-100-30Z" fill="#FFFFFF" stroke="#DDE7F3" stroke-width="4"/>'
            '<path d="M-80 0v10M80 0v10" stroke="#C9CCD6" stroke-width="8" stroke-linecap="round"/>' + bubbles)


def camera():
    return ('<rect x="-40" y="-56" width="80" height="54" rx="10" fill="#3A3436"/><rect x="-22" y="-66" width="26" height="12" rx="3" fill="#3A3436"/>'
            '<circle cy="-29" r="18" fill="#7FB8E6" stroke="#C9CCD6" stroke-width="5"/>'
            + anim('twinkle', '<path d="M30-80l4 8 8 4-8 4-4 8-4-8-8-4 8-4z" fill="#FFD84A"/>'))


def feast():
    """잔칫상: 상 위에 떡·과일·전."""
    return ('<rect x="-110" y="-40" width="220" height="16" rx="6" fill="#B07440"/><path d="M-96-24V0M96-24V0" stroke="#8A5A3B" stroke-width="10"/>'
            '<ellipse cx="-60" cy="-48" rx="30" ry="10" fill="#FFFFFF" stroke="#E5DCCB" stroke-width="2"/>'
            '<ellipse cx="-66" cy="-54" rx="10" ry="7" fill="#F7B6C2"/><ellipse cx="-52" cy="-56" rx="10" ry="7" fill="#C3DB8E"/>'
            '<ellipse cx="0" cy="-48" rx="30" ry="10" fill="#FFFFFF" stroke="#E5DCCB" stroke-width="2"/>'
            '<circle cx="-8" cy="-58" r="10" fill="#E4573D"/><circle cx="10" cy="-58" r="10" fill="#FFA63C"/>'
            '<ellipse cx="60" cy="-48" rx="30" ry="10" fill="#FFFFFF" stroke="#E5DCCB" stroke-width="2"/>'
            '<ellipse cx="56" cy="-54" rx="14" ry="6" fill="#F2C38B"/><ellipse cx="66" cy="-58" rx="14" ry="6" fill="#E0A85E"/>')


def first_aid():
    return ('<rect x="-36" y="-50" width="72" height="50" rx="8" fill="#FFFFFF" stroke="#E5DCCB" stroke-width="3"/>'
            '<rect x="-14" y="-62" width="28" height="14" rx="4" fill="none" stroke="#C9CCD6" stroke-width="4"/>'
            '<path d="M-6-40h12v8h8v12h-8v8h-12v-8h-8v-12h8z" fill="#E4573D"/>')


def mountain_flag():
    return ('<path d="M-130 0L-30-140L20-80L60-120L140 0Z" fill="#8FB58A"/><path d="M-30-140L-10-112L-30-118L-48-110Z" fill="#FFFFFF"/>'
            '<path d="M-30-140V-186" stroke="#8A5A3B" stroke-width="4"/>' + anim('sway', '<path d="M-30-186l34 10-34 10z" fill="#E4573D"/>'))


def bench():
    return ('<rect x="-80" y="-50" width="160" height="10" rx="4" fill="#B07440"/><rect x="-80" y="-80" width="160" height="10" rx="4" fill="#B07440"/>'
            '<path d="M-66-40V0M66-40V0M-66-80V-50M66-80V-50" stroke="#5A4A3A" stroke-width="6"/>')


def shooting_star():
    return anim('drift', '<path d="M-120 40L60-10" stroke="#FFF1B8" stroke-width="3" stroke-linecap="round" opacity=".7"/>'
                          '<path d="M70-14l6 12 13 2-10 9 3 13-12-6-12 6 3-13-10-9 13-2z" fill="#FFE27A"/>')


def bubbles():
    return ''.join(anim('float', f'<circle cx="{x}" cy="{y}" r="{r}" fill="#E8F4FF" fill-opacity=".5" stroke="#B9D7F2" stroke-width="2"/>'
                                 f'<circle cx="{x - r * .35:.1f}" cy="{y - r * .35:.1f}" r="{r * .2:.1f}" fill="#FFFFFF"/>', -i * .5)
                   for i, (x, y, r) in enumerate(((-80, -20, 18), (-20, -60, 24), (50, -10, 14), (90, -70, 20), (10, 20, 12))))


def flower_field():
    """꽃밭 (땅에 넓게, 너비 700)."""
    cols = ('#FF9AA8', '#FFE27A', '#FFC4CF', '#B9A7E8', '#FFFFFF')
    out = ''
    for i in range(28):
        x = -340 + (i * 97) % 680
        y = -((i * 37) % 40)
        c = cols[i % 5]
        out += (f'<path d="M{x} {y}v18" stroke="#6DAD68" stroke-width="3"/>'
                + ''.join(f'<circle cx="{x + dx}" cy="{y + dy}" r="6" fill="{c}"/>' for dx, dy in ((-6, 0), (6, 0), (0, -6), (0, 6)))
                + f'<circle cx="{x}" cy="{y}" r="4" fill="#F2A33C"/>')
    return out


def jangdok():
    """장독대: 항아리 셋."""
    def jar(x, s):
        return put('<path d="M-30-70C-46-50-46-14-30 0H30C46-14 46-50 30-70Z" fill="#7A4A30"/><rect x="-24" y="-80" width="48" height="12" rx="5" fill="#5A3622"/>'
                   '<path d="M-30-50q30 8 60 0" stroke="#946048" stroke-width="3" fill="none"/>', x, 0, s)
    return '<rect x="-110" y="-6" width="220" height="12" rx="4" fill="#C9C2B4"/>' + jar(-60, .9) + jar(0, 1.1) + jar(60, .8)


def gift_pile():
    def box(x, y, w, h, c, r):
        return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="4" fill="{c}"/><rect x="{x + w / 2 - 4}" y="{y}" width="8" height="{h}" fill="{r}"/>'
                f'<rect x="{x}" y="{y + h / 2 - 4}" width="{w}" height="8" fill="{r}"/>')
    return box(-70, -50, 60, 50, '#FF9AA8', '#FFE27A') + box(-4, -70, 70, 70, '#7FB8E6', '#FFFFFF') + box(-36, -96, 44, 40, '#8CCB8A', '#E4573D')


def rice_paddy_seedlings():
    """모내기: 물 고인 논에 모 줄."""
    rows = ''.join(f'<path d="M{x} 0q-4-16 0-26M{x} 0q6-14 10-22" stroke="#6DAD68" stroke-width="3" fill="none"/>' for x in range(-300, 320, 40))
    return '<path d="M-340 6H340V-6H-340Z" fill="#9CC7D9" opacity=".7"/>' + rows


# ---------- 감정 표시 더하기 ----------
def thought_dots():
    """심심함·궁금함: 말풍선 속 점 세 개."""
    return ('<path d="M-34-30C-34-50 34-50 34-30C34-14 14-10 0-10L-10 2-8-10C-24-12-34-18-34-30Z" fill="#FFFFFF" stroke="#D9CFBF" stroke-width="2"/>'
            + ''.join(anim('twinkle', f'<circle cx="{x}" cy="-30" r="4.5" fill="#8A7B5C"/>', -i * .3) for i, x in enumerate((-14, 0, 14))))


def swirl():
    """당황·어지러움: 머리 위 소용돌이."""
    return anim('spin', '<path d="M0-20m-14 0a14 14 0 1 1 14 14a8 8 0 1 1 8-8" stroke="#8A7BB5" stroke-width="3.5" fill="none" stroke-linecap="round"/>')


def gloom_line():
    """실망·서운함: 머리 위 어두운 세로줄."""
    return ''.join(f'<path d="M{x} -40v28" stroke="#6B6F86" stroke-width="3.5" stroke-linecap="round" opacity=".7"/>' for x in (-16, -6, 4, 14))


def puff():
    """안도·한숨: 입김."""
    return anim('blow', '<path d="M0-10c10-12 26-12 30 0c10-4 18 6 10 14c-10 6-30 6-40-14z" fill="#FFFFFF" stroke="#D9CFBF" stroke-width="2"/>')


def bandage():
    """아픔: 반창고 + 열."""
    return ('<g transform="rotate(-25)"><rect x="-22" y="-8" width="44" height="16" rx="8" fill="#F2C38B"/>'
            '<rect x="-8" y="-8" width="16" height="16" fill="#E0A85E"/></g>'
            + anim('rise', '<path d="M30-30q6-8 0-16q-6-8 0-16" stroke="#F08A7A" stroke-width="3" fill="none"/>'))


def flame():
    """결심·용기·열정: 작은 불꽃."""
    return anim('glow', '<path d="M0-48C-18-30-20-12-8 0H8C20-12 18-30 0-48Z" fill="#F28C28"/><path d="M0-28C-8-18-8-8-4 0H4C8-8 8-18 0-28Z" fill="#FFD66B"/>')


def rumble():
    """배고픔: 배에서 꼬르륵 물결."""
    return ''.join(f'<path d="M{x} 0q6-8 12 0t12 0" stroke="#C98B4E" stroke-width="3" fill="none" stroke-linecap="round"/>' for x in (-18, -6))


def green_wiggle():
    """질투·샘: 초록 물결."""
    return '<path d="M-24-10q8-14 16 0t16 0t16 0" stroke="#7FB06A" stroke-width="4" fill="none" stroke-linecap="round"/>'


def props():
    return {
        'fireworks': fireworks(), 'tent': tent(), 'campfire': campfire(), 'xmas_tree': xmas_tree(), 'school': school(),
        'stall': stall(), 'swing': swing(), 'bunting': bunting(), 'laundry': laundry(), 'sandcastle': sandcastle(),
        'bathtub': bathtub(), 'camera': camera(), 'feast': feast(), 'first_aid': first_aid(), 'mountain_flag': mountain_flag(),
        'bench': bench(), 'shooting_star': shooting_star(), 'bubbles': bubbles(), 'flower_field': flower_field(),
        'jangdok': jangdok(), 'gift_pile': gift_pile(), 'seedlings': rice_paddy_seedlings(),
        'thought_dots': thought_dots(), 'swirl': swirl(), 'gloom_line': gloom_line(), 'puff': puff(), 'bandage': bandage(),
        'flame': flame(), 'rumble': rumble(), 'green_wiggle': green_wiggle(),
    }
