"""지은 이야기에 자주 나오는 물건·과일·음식·탈것·작은 동물.

draw_scenes.py 그림체를 따라요: 둥근 도형, 납작한 색, 같은 얼굴 표정.
모든 부품은 바닥 가운데가 (0,0) 이에요. 과일·음식은 한 손에 쥘 만한 크기(폭 40~70)로 그려요.
"""
from draw_scenes import INK, put, anim, face

HL = '<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="#FFFFFF" opacity=".45" transform="rotate(-30 {x} {y})"/>'


def hl(x, y, rx=6, ry=3.5):
    return HL.format(x=x, y=y, rx=rx, ry=ry)


def leaf(x, y, rot=-30, color='#6DAD68', s=1):
    return put(f'<path d="M0 0C6-10 18-12 26-6C18 2 6 4 0 0Z" fill="{color}"/>', x, y, s, rot=rot)


# ---------- 과일 ----------
def apple(color='#E4573D'):
    return (f'<path d="M0-40C-10-48-30-46-32-26C-34-8-18 2 0-4C18 2 34-8 32-26C30-46 10-48 0-40Z" fill="{color}"/>'
            '<path d="M0-40q-2-10 4-16" stroke="#8A5A3B" stroke-width="4" fill="none" stroke-linecap="round"/>'
            + leaf(3, -50, -20) + hl(-16, -30))


def persimmon():
    return ('<ellipse cy="-20" rx="30" ry="22" fill="#F28C28"/>'
            '<path d="M-16-40l16 6 16-6-6 10 10 4-20 0-20 0 10-4z" fill="#5E9B5C"/>' + hl(-14, -26))


def tangerine():
    return ('<ellipse cy="-22" rx="28" ry="24" fill="#FFA63C"/>' + leaf(0, -44, -40)
            + ''.join(f'<circle cx="{x}" cy="{y}" r="1.6" fill="#E88A1E"/>' for x, y in ((-10, -14), (8, -10), (14, -26), (-4, -30), (-16, -24)))
            + hl(-12, -32))


def peach():
    return ('<path d="M0-44C-24-48-34-24-28-12C-22 0-8 2 0-2C8 2 22 0 28-12C34-24 24-48 0-44Z" fill="#FFB8A0"/>'
            '<path d="M0-44C-6-30-6-14 0-2" stroke="#F2917C" stroke-width="3" fill="none"/>'
            '<path d="M-4-26C-20-30-24-18-20-10" fill="#FF8F8F" opacity=".35"/>' + leaf(2, -46, -40) + leaf(2, -46, 200, '#7DBE73'))


def pear():
    return ('<path d="M0-56C-10-56-12-44-14-36C-30-30-32-4-14 0H14C32-4 30-30 14-36C12-44 10-56 0-56Z" fill="#E9D27A"/>'
            '<path d="M0-56q0-8 4-12" stroke="#8A5A3B" stroke-width="4" fill="none" stroke-linecap="round"/>' + hl(-12, -20)
            + ''.join(f'<circle cx="{x}" cy="{y}" r="1.4" fill="#C9AE4E"/>' for x, y in ((-8, -10), (6, -16), (12, -6), (-2, -28))))


def grapes():
    pts = ((-14, -44), (0, -46), (14, -44), (-8, -32), (8, -32), (-14, -20), (0, -20), (14, -20), (-6, -8), (8, -8), (0, 2))
    return ('<path d="M0-52q0-10 6-14" stroke="#8A5A3B" stroke-width="4" fill="none" stroke-linecap="round"/>' + leaf(4, -58, -10)
            + ''.join(f'<circle cx="{x}" cy="{y - 6}" r="9" fill="#8E5BB5"/><circle cx="{x - 3}" cy="{y - 9}" r="2.5" fill="#FFFFFF" opacity=".5"/>' for x, y in pts))


def strawberry():
    return ('<path d="M-24-36C-24-12-8 0 0 2C8 0 24-12 24-36C14-42-14-42-24-36Z" fill="#F04E5E"/>'
            '<path d="M-18-38l8 6 10-8 10 8 8-6-6-8h-24z" fill="#5E9B5C"/>'
            + ''.join(f'<ellipse cx="{x}" cy="{y}" rx="1.6" ry="2.4" fill="#FFE27A"/>' for x, y in ((-12, -26), (0, -24), (12, -26), (-6, -14), (6, -14), (0, -6))))


def watermelon():
    return ('<path d="M-44-4A44 44 0 0 1 44-4Z" fill="#4E9A4A" transform="translate(0 0)"/>'
            '<path d="M-38-6A38 38 0 0 1 38-6Z" fill="#F7F1D8"/><path d="M-34-6A34 34 0 0 1 34-6Z" fill="#F0606A"/>'
            + ''.join(f'<ellipse cx="{x}" cy="{y}" rx="2" ry="3.2" fill="{INK}"/>' for x, y in ((-16, -14), (0, -22), (16, -14), (-6, -10), (8, -10))))


def banana():
    return ('<path d="M-34-30C-30-4 10 6 34-16C26-12 4-6-10-18C-20-26-26-34-34-30Z" fill="#FFD84A"/>'
            '<path d="M-34-30l-4-6" stroke="#8A5A3B" stroke-width="5" stroke-linecap="round"/>'
            '<path d="M-24-22C-14-6 10-2 26-12" stroke="#E8B830" stroke-width="3" fill="none"/>')


def fruit_pile(fn, n=3):
    """바구니 없이 땅에 놓인 과일 몇 개."""
    spots = ((-34, 0, .9), (34, 2, .85), (0, -14, 1))[:n]
    return ''.join(put(fn(), x, y, s) for x, y, s in spots)


# ---------- 채소 ----------
def corn():
    return ('<path d="M-12-6C-16-30-10-60 0-66C10-60 16-30 12-6Z" fill="#FFD84A"/>'
            + ''.join(f'<path d="M-10 {y}h20" stroke="#E8B830" stroke-width="2"/>' for y in (-50, -40, -30, -20, -10))
            + '<path d="M-4 0C-24-10-26-34-18-50C-14-30-8-14 0-6Z" fill="#7DBE73"/><path d="M4 0C24-10 26-34 18-50C14-30 8-14 0-6Z" fill="#6DAD68"/>')


def carrot():
    return ('<path d="M-12-44C-12-30-4-6 0 2C4-6 12-30 12-44Z" fill="#F28C28"/>'
            '<path d="M-6-34h6M-2-22h6M-4-12h5" stroke="#D9701A" stroke-width="2" stroke-linecap="round"/>'
            '<path d="M0-44C-6-56-14-60-16-64M0-44C0-58 2-64 4-70M0-44C6-54 14-58 18-60" stroke="#6DAD68" stroke-width="5" fill="none" stroke-linecap="round"/>')


def radish():
    return ('<path d="M-18-30C-20-10-6 0 0 6C6 0 20-10 18-30C10-36-10-36-18-30Z" fill="#F7F3EA" stroke="#E5DCCB" stroke-width="2"/>'
            '<path d="M-18-30C-10-36 10-36 18-30C14-24-14-24-18-30Z" fill="#C3DB8E"/>'
            '<path d="M-4-34C-14-54-26-56-30-58M0-34C0-56 0-62 2-70M4-34C14-52 24-56 30-58" stroke="#6DAD68" stroke-width="7" fill="none" stroke-linecap="round"/>')


def potato(color='#C99A62'):
    return (f'<path d="M-28-14C-30-30-10-36 6-32C26-30 32-16 26-6C18 2-22 4-28-14Z" fill="{color}"/>'
            + ''.join(f'<circle cx="{x}" cy="{y}" r="2" fill="#9B7243"/>' for x, y in ((-14, -20), (6, -14), (16, -22), (-4, -8))))


def sweet_potato():
    return ('<path d="M-36-12C-30-30 20-34 34-18C38-10 30-2 10 0C-14 2-38 2-36-12Z" fill="#B5487A"/>'
            '<path d="M-36-12l-8 4M34-18l8-4" stroke="#8A3A5E" stroke-width="3" stroke-linecap="round"/>' + hl(-10, -22, 8, 3))


def cabbage():
    return ('<ellipse cy="-26" rx="34" ry="26" fill="#A8D58A"/>'
            '<path d="M-30-30C-20-50 20-50 30-30C20-40-20-40-30-30Z" fill="#C3E3A3"/>'
            '<path d="M0-50V-6M-18-44C-12-30-12-16-16-6M18-44C12-30 12-16 16-6" stroke="#E9F5DC" stroke-width="3" fill="none"/>')


def mushroom():
    return ('<path d="M-10 0C-12-10-10-22-8-26H8C10-22 12-10 10 0Z" fill="#FFF3DD"/>'
            '<path d="M-34-24C-34-48 34-48 34-24Z" fill="#E4573D"/>'
            '<circle cx="-16" cy="-34" r="5" fill="#FFFFFF"/><circle cx="8" cy="-38" r="4" fill="#FFFFFF"/><circle cx="22" cy="-28" r="3.5" fill="#FFFFFF"/>')


def acorn():
    return ('<ellipse cy="-14" rx="14" ry="16" fill="#C98B4E"/><path d="M-16-22C-16-36 16-36 16-22Z" fill="#8A5A3B"/>'
            '<path d="M0-34v-6" stroke="#5A4038" stroke-width="4" stroke-linecap="round"/>' + hl(-6, -12, 4, 2.5))


# ---------- 음식 ----------
def egg():
    return '<ellipse cy="-20" rx="16" ry="20" fill="#FFF8EC" stroke="#E5DCCB" stroke-width="2"/>' + hl(-6, -28, 4, 2.5)


def bread():
    return ('<path d="M-36-8C-40-30-24-40 0-40S40-30 36-8C36 0-36 0-36-8Z" fill="#D9984E"/>'
            '<path d="M-18-34q6 8 0 16M0-38q6 8 0 16M18-34q6 8 0 16" stroke="#F2C38B" stroke-width="4" fill="none" stroke-linecap="round"/>')


def candy():
    return ('<path d="M-28-24l-14-10v20zM28-24l14-10v20z" fill="#FF9AA8"/>'
            '<circle cy="-24" r="18" fill="#FFC4CF"/><path d="M-12-36C0-30 0-18 12-12M-16-22C-4-18 4-28 14-32" stroke="#FF6F86" stroke-width="4" fill="none" stroke-linecap="round"/>')


def lollipop():
    return ('<path d="M0 0V-40" stroke="#E5DCCB" stroke-width="5" stroke-linecap="round"/><circle cy="-58" r="22" fill="#FFC4CF"/>'
            '<path d="M0-58m-14 0a14 14 0 1 1 14 14a8 8 0 1 1 8-8" stroke="#FF6F86" stroke-width="4" fill="none" stroke-linecap="round"/>')


def icecream():
    return ('<path d="M-18-40L0 0 18-40Z" fill="#E7B36A"/><path d="M-12-30l18 18M-4-38l18 18M6-38l-14 22" stroke="#C99A62" stroke-width="2"/>'
            '<circle cx="-8" cy="-48" r="14" fill="#FFC4CF"/><circle cx="8" cy="-50" r="14" fill="#FFF3DD"/><circle cy="-64" r="13" fill="#B5E0A0"/>'
            '<circle cx="2" cy="-78" r="4" fill="#E4573D"/>')


def cookie():
    return ('<circle cy="-20" r="20" fill="#E0A85E"/>'
            + ''.join(f'<circle cx="{x}" cy="{y}" r="3" fill="#6B4430"/>' for x, y in ((-8, -26), (6, -30), (10, -16), (-6, -12), (0, -20))))


def honey():
    return ('<path d="M-24-8C-28-34-20-44 0-44S28-34 24-8C22 0-22 0-24-8Z" fill="#F2A33C"/>'
            '<rect x="-20" y="-52" width="40" height="10" rx="5" fill="#C98B4E"/>'
            '<path d="M-24-34q12 6 24 0t24 0" stroke="#FFD66B" stroke-width="6" fill="none"/>'
            '<rect x="-12" y="-26" width="24" height="14" rx="3" fill="#FFF3DD"/>')


def milk():
    return ('<path d="M-16 0V-44L-8-56H8L16-44V0Z" fill="#FFFFFF" stroke="#DDE7F3" stroke-width="3"/>'
            '<rect x="-16" y="-34" width="32" height="18" fill="#7FB8E6"/><path d="M-8-56H8" stroke="#DDE7F3" stroke-width="3"/>')


def dumpling():
    return ''.join(put('<path d="M-22 0C-26-20 26-20 22 0Z" fill="#FFF3DD" stroke="#D9C7A6" stroke-width="2.5"/>'
                       '<path d="M-14-10q4-6 8 0q4-6 8 0q4-6 8 0" stroke="#D9C7A6" stroke-width="2" fill="none"/>', x, y)
                   for x, y in ((-22, 0), (22, 0), (0, -12)))


def noodles():
    return ('<path d="M-40-30H40C38-6 22 0 0 0S-38-6-40-30Z" fill="#FFFFFF" stroke="#E0D2B4" stroke-width="3"/>'
            '<path d="M-36-30C-30-40-20-34-14-40S0-34 6-40 20-34 36-30" stroke="#F7E3B0" stroke-width="7" fill="none" stroke-linecap="round"/>'
            '<path d="M18-34L40-66M26-32L48-62" stroke="#8A5A3B" stroke-width="4" stroke-linecap="round"/>')


# ---------- 물건·장난감 ----------
def ball():
    return ('<circle cy="-28" r="28" fill="#FF9AA8"/><path d="M-28-28h56" stroke="#FFFFFF" stroke-width="6"/>'
            '<path d="M0-56C-14-40-14-16 0 0" stroke="#7FB8E6" stroke-width="6" fill="none"/>' + hl(-12, -40, 7, 4))


def balloon(color='#E4573D'):
    return anim('float', f'<path d="M0 0C-8-30 8-50 0-80" stroke="#8A6448" stroke-width="2" fill="none"/>'
                f'<ellipse cy="-112" rx="26" ry="32" fill="{color}"/><path d="M-4-80h8l-4-6z" fill="{color}"/>' + hl(-10, -124, 6, 9))


def balloons():
    return put(balloon('#E4573D'), -24, 0) + put(balloon('#7FB8E6'), 10, -10, .95) + put(balloon('#FFC93C'), 32, 6, .9)


def doll():
    return ('<path d="M-22 0C-22-26-14-40 0-40S22-26 22 0Z" fill="#FF9AA8"/>'
            '<circle cy="-58" r="22" fill="#FFE4CC"/><path d="M-24-58C-24-84 24-84 24-58C18-72-18-72-24-58Z" fill="#8A5A3B"/>'
            + put(face('happy', ex=7, ey=0, eye_r=3, mouth_y=10, cheek=True), 0, -58, .8))


def teddy():
    fur = '#C98B4E'
    return (f'<circle cx="-22" cy="-86" r="11" fill="{fur}"/><circle cx="22" cy="-86" r="11" fill="{fur}"/>'
            f'<ellipse cy="-30" rx="30" ry="30" fill="{fur}"/><circle cy="-70" r="26" fill="{fur}"/>'
            '<ellipse cy="-62" rx="11" ry="8" fill="#F2D3A8"/><ellipse cy="-26" rx="16" ry="18" fill="#F2D3A8"/>'
            f'<circle cx="-9" cy="-74" r="3" fill="{INK}"/><circle cx="9" cy="-74" r="3" fill="{INK}"/><ellipse cy="-66" rx="4" ry="3" fill="{INK}"/>'
            '<path d="M-8-50l8 6 8-6-8-4z" fill="#E4573D"/>')


def car(color='#7FB8E6'):
    return (f'<path d="M-70-18V-40C-70-46-66-50-60-50H-40L-24-74H30L48-50H62C68-50 72-46 72-40V-18Z" fill="{color}"/>'
            '<path d="M-34-52L-20-68H-2V-52ZM6-52V-68H26L38-52Z" fill="#E8F4FF"/>'
            '<circle cx="66" cy="-38" r="4" fill="#FFE27A"/>'
            + ''.join(f'<circle cx="{x}" cy="-16" r="15" fill="#3A3436"/><circle cx="{x}" cy="-16" r="6" fill="#C9CCD6"/>' for x in (-40, 42)))


def bicycle():
    w = ''.join(f'<circle cx="{x}" cy="-28" r="26" fill="none" stroke="#3A3436" stroke-width="6"/><circle cx="{x}" cy="-28" r="4" fill="#3A3436"/>' for x in (-44, 44))
    return w + ('<path d="M-44-28L-12-28L16-62H-22ZM-12-28L-22-62M16-62L44-28M16-62l-4-14h14" stroke="#E4573D" stroke-width="6" fill="none" stroke-linejoin="round" stroke-linecap="round"/>'
                '<path d="M-30-68h18" stroke="#3A3436" stroke-width="7" stroke-linecap="round"/>')


def train():
    return ('<rect x="-90" y="-70" width="70" height="52" rx="8" fill="#E4573D"/><rect x="-14" y="-60" width="70" height="42" rx="8" fill="#7FB8E6"/>'
            '<rect x="-80" y="-96" width="34" height="30" rx="4" fill="#E4573D"/><rect x="-84" y="-100" width="42" height="8" rx="4" fill="#B5485A"/>'
            '<rect x="-34" y="-86" width="12" height="18" rx="3" fill="#3A3436"/>'
            + anim('smoke', '<circle cx="-28" cy="-100" r="9" fill="#FFFFFF" opacity=".8"/><circle cx="-18" cy="-114" r="7" fill="#FFFFFF" opacity=".6"/>')
            + '<rect x="-72" y="-60" width="18" height="16" rx="3" fill="#E8F4FF"/><rect x="0" y="-52" width="16" height="14" rx="3" fill="#E8F4FF"/><rect x="26" y="-52" width="16" height="14" rx="3" fill="#E8F4FF"/>'
            + ''.join(f'<circle cx="{x}" cy="-14" r="12" fill="#3A3436"/><circle cx="{x}" cy="-14" r="4" fill="#C9CCD6"/>' for x in (-74, -36, 2, 40)))


def airplane():
    return anim('float', '<path d="M-80-10C-80-22-60-26-30-26H50C70-26 84-18 84-10S70 6 50 6H-30C-60 6-80 2-80-10Z" fill="#FFFFFF" stroke="#DDE7F3" stroke-width="3"/>'
                '<path d="M-10-24L20-70H40L28-24ZM-10 4L20 40H40L28 4Z" fill="#7FB8E6"/><path d="M-72-14L-86-52H-70L-54-22Z" fill="#E4573D"/>'
                + ''.join(f'<circle cx="{x}" cy="-12" r="5" fill="#BFE4FF"/>' for x in (-30, -14, 2, 18, 34))
                + '<path d="M60-18C70-18 78-14 80-10H60Z" fill="#BFE4FF"/>')


def hat():
    return ('<ellipse cy="-6" rx="46" ry="10" fill="#E7B36A"/><path d="M-26-8C-26-40 26-40 26-8Z" fill="#F2C38B"/>'
            '<path d="M-26-16C-10-10 10-10 26-16V-8C10-2-10-2-26-8Z" fill="#E4573D"/>')


def bouquet():
    heads = ((-14, -76, '#FF9AA8'), (12, -80, '#FFE27A'), (0, -96, '#FF6F86'), (-24, -94, '#B9A7E8'), (24, -98, '#FFC4CF'))
    return ('<path d="M-6 0L-12-60M0 0V-64M6 0L12-60" stroke="#6DAD68" stroke-width="4"/>'
            + ''.join(f'<circle cx="{x}" cy="{y}" r="12" fill="{c}"/><circle cx="{x}" cy="{y}" r="4" fill="#FFF6E6"/>' for x, y, c in heads)
            + '<path d="M-20-56L0-20 20-56Z" fill="#FFF6E6" stroke="#E0D2B4" stroke-width="2"/><path d="M-6-34h12" stroke="#E4573D" stroke-width="5" stroke-linecap="round"/>')


def gift():
    return ('<rect x="-34" y="-50" width="68" height="50" rx="6" fill="#FF9AA8"/><rect x="-38" y="-62" width="76" height="16" rx="5" fill="#FF8296"/>'
            '<rect x="-6" y="-62" width="12" height="62" fill="#FFE27A"/>'
            '<path d="M0-62C-10-80-30-76-22-64ZM0-62C10-80 30-76 22-64Z" fill="#FFE27A"/>')


def lantern():
    return ('<path d="M0-120v14" stroke="#8A5A3B" stroke-width="4"/><rect x="-16" y="-108" width="32" height="8" rx="3" fill="#8A5A3B"/>'
            + anim('glow', '<ellipse cy="-74" rx="26" ry="30" fill="#FF8A5C"/><ellipse cy="-74" rx="14" ry="20" fill="#FFD66B" opacity=".9"/>')
            + '<rect x="-14" y="-46" width="28" height="8" rx="3" fill="#8A5A3B"/><path d="M-6-38l-2 18M0-38v20M6-38l2 18" stroke="#E4573D" stroke-width="3"/>')


def candle():
    return ('<rect x="-12" y="-50" width="24" height="44" rx="4" fill="#FFF3DD" stroke="#E5DCCB" stroke-width="2"/>'
            '<ellipse cy="-4" rx="24" ry="6" fill="#E7B36A"/>'
            + anim('glow', '<path d="M0-74C-8-62-6-54 0-52C6-54 8-62 0-74Z" fill="#FFC93C"/><circle cy="-62" r="18" fill="#FFE27A" opacity=".35"/>'))


def clock():
    return ('<circle cy="-40" r="36" fill="#FFFFFF" stroke="#E7B36A" stroke-width="8"/>'
            + ''.join(f'<circle cx="{x}" cy="{y}" r="2.5" fill="{INK}"/>' for x, y in ((0, -68), (28, -40), (0, -12), (-28, -40)))
            + f'<path d="M0-40V-60M0-40l14 8" stroke="{INK}" stroke-width="4" stroke-linecap="round"/><circle cy="-40" r="3" fill="#E4573D"/>')


def bucket():
    return ('<path d="M-28-44L-22 0H22L28-44Z" fill="#7FB8E6"/><ellipse cy="-44" rx="28" ry="7" fill="#5E9BD0"/>'
            '<path d="M-28-44C-28-74 28-74 28-44" stroke="#5A4A3A" stroke-width="3" fill="none"/>')


def shovel():
    return ('<path d="M0-30V-100" stroke="#8A5A3B" stroke-width="7" stroke-linecap="round"/><path d="M-10-104h20" stroke="#8A5A3B" stroke-width="7" stroke-linecap="round"/>'
            '<path d="M-18-34H18V-14C18 0 0 6 0 6S-18 0-18-14Z" fill="#9AA3B5"/>')


def watering_can():
    return ('<path d="M-30 0V-44H24V0Z" fill="#8CCB8A"/><path d="M24-30L54-58" stroke="#8CCB8A" stroke-width="10" stroke-linecap="round"/>'
            '<path d="M-30-36C-52-36-52-8-30-8" stroke="#6DAD68" stroke-width="7" fill="none"/>'
            + anim('fall', '<circle cx="62" cy="-50" r="3" fill="#7FB8E6"/><circle cx="68" cy="-42" r="3" fill="#7FB8E6"/>'))


def sled():
    return ('<path d="M-60-10H50C66-10 70-26 62-30" stroke="#8A5A3B" stroke-width="6" fill="none" stroke-linecap="round"/>'
            '<rect x="-56" y="-34" width="104" height="14" rx="5" fill="#E4573D"/><path d="M-40-20v10M30-20v10" stroke="#8A5A3B" stroke-width="5"/>')


def shell():
    return ('<path d="M-30 0C-34-30-16-46 0-46S34-30 30 0Z" fill="#FFC4CF"/>'
            '<path d="M0 0V-44M-14 0L-20-38M14 0L20-38M-26-4L-32-26M26-4L32-26" stroke="#FF9AA8" stroke-width="3"/>'
            '<rect x="-12" y="-6" width="24" height="8" rx="4" fill="#FF9AA8"/>')


def star_toy():
    return anim('twinkle', '<path d="M0-60L12-34 40-32 18-14 26 14 0-2-26 14-18-14-40-32-12-34Z" fill="#FFD84A" transform="translate(0 -6) scale(.9)"/>')


def drum():
    return ('<ellipse cy="-46" rx="40" ry="12" fill="#FFF3DD"/><path d="M-40-46V-12C-40 0 40 0 40-12V-46" fill="#E4573D"/>'
            '<ellipse cy="-46" rx="40" ry="12" fill="#FFF3DD" stroke="#C94A36" stroke-width="3"/>'
            '<path d="M-40-30L-20-6M-20-46L0-6M0-46L20-6M20-46L40-20" stroke="#FFE27A" stroke-width="3"/>')


def flower_pot():
    return ('<path d="M-26-30L-20 0H20L26-30Z" fill="#D9844E"/><rect x="-30" y="-36" width="60" height="10" rx="4" fill="#C9703C"/>'
            '<path d="M0-36V-70" stroke="#6DAD68" stroke-width="4"/>' + leaf(0, -50, -30) + leaf(0, -56, 210, '#7DBE73')
            + '<circle cy="-82" r="14" fill="#FF9AA8"/><circle cy="-82" r="5" fill="#FFE27A"/>')


def blanket():
    return ('<path d="M-60 0C-60-24-40-30 0-30S60-24 60 0Z" fill="#B9A7E8"/>'
            + ''.join(f'<circle cx="{x}" cy="{y}" r="4" fill="#FFFFFF" opacity=".7"/>' for x, y in ((-36, -14), (-12, -20), (14, -16), (38, -10))))


def heart_big():
    return anim('glow', '<path d="M0 0C-50-30-50-80-20-80C-8-80 0-70 0-62C0-70 8-80 20-80C50-80 50-30 0 0Z" fill="#FF8FA3"/>')


def stars_sky():
    return ''.join(put(anim('twinkle', '<path d="M0-12L3-3 12 0 3 3 0 12-3 3-12 0-3-3Z" fill="#FFE27A"/>', -i * .5), x, y, s)
                   for i, (x, y, s) in enumerate(((120, 80, 1.4), (260, 140, 1), (420, 70, 1.6), (560, 150, 1.1), (690, 90, 1.3))))


# ---------- 작은 동물 (캐릭터로 써요) ----------
def frog(mood='happy'):
    g = '#8CCB8A'
    return anim('bob', f'<ellipse cy="-24" rx="40" ry="26" fill="{g}"/><ellipse cy="-18" rx="24" ry="14" fill="#E9F5DC"/>'
                f'<circle cx="-20" cy="-50" r="14" fill="{g}"/><circle cx="20" cy="-50" r="14" fill="{g}"/>'
                f'<circle cx="-20" cy="-52" r="8" fill="#FFFFFF"/><circle cx="20" cy="-52" r="8" fill="#FFFFFF"/>'
                + (f'<circle cx="-20" cy="-52" r="4" fill="{INK}"/><circle cx="20" cy="-52" r="4" fill="{INK}"/>' if mood != 'sleep'
                   else f'<path d="M-26-52h12M14-52h12" stroke="{INK}" stroke-width="3" stroke-linecap="round"/>')
                + (f'<path d="M-14-30q14 12 28 0" stroke="{INK}" stroke-width="3" fill="none" stroke-linecap="round"/>' if mood != 'cry'
                   else f'<path d="M-10-26q10-8 20 0" stroke="{INK}" stroke-width="3" fill="none" stroke-linecap="round"/>')
                + f'<path d="M-40-4q-10 4-14 4M40-4q10 4 14 4" stroke="{g}" stroke-width="10" stroke-linecap="round"/>'
                '<circle cx="-30" cy="-34" r="4" fill="#FF9AA8" opacity=".6"/><circle cx="30" cy="-34" r="4" fill="#FF9AA8" opacity=".6"/>')


def chick(mood='happy'):
    return anim('hop', '<ellipse cy="-24" rx="22" ry="22" fill="#FFE27A"/><circle cy="-50" r="16" fill="#FFE27A"/>'
                '<path d="M14-50l10 4-10 4z" fill="#F2A33C"/><path d="M-6 0v-6M6 0v-6" stroke="#F2A33C" stroke-width="3"/>'
                '<path d="M-18-28q-10 4-6 14" stroke="#F7CF4A" stroke-width="6" fill="none" stroke-linecap="round"/>'
                + put(face(mood, ex=6, ey=0, eye_r=2.6, mouth_y=0, no_mouth=True, cheek=False), 4, -52, .9))


def hen(mood='happy'):
    return anim('bob', '<path d="M-44-40C-60-60-50-80-36-70C-40-56-30-46-20-48Z" fill="#F2E6D0"/>'
                '<ellipse cy="-36" rx="40" ry="30" fill="#FFFFFF" stroke="#EDE3D2" stroke-width="2"/>'
                '<circle cx="28" cy="-70" r="20" fill="#FFFFFF" stroke="#EDE3D2" stroke-width="2"/>'
                '<path d="M20-90q4-10 8 0q4-10 8 0q4-8 6 2" fill="#E4573D"/><path d="M46-70l14 4-14 6z" fill="#F2A33C"/>'
                '<path d="M40-60q4 10-2 14" fill="#E4573D"/><path d="M-10 0v-8M10 0v-8" stroke="#F2A33C" stroke-width="4"/>'
                '<path d="M-20-40q14 10 30 0" stroke="#EDE3D2" stroke-width="4" fill="none"/>'
                + put(face(mood, ex=6, ey=0, eye_r=3, mouth_y=0, no_mouth=True, cheek=True), 30, -72, .8))


def duck(mood='happy'):
    return anim('bob', '<ellipse cy="-26" rx="38" ry="24" fill="#FFE27A"/><path d="M-38-30l-14-8 4 16z" fill="#FFE27A"/>'
                '<circle cx="24" cy="-58" r="20" fill="#FFE27A"/><path d="M40-56q18-2 20 4q-8 6-20 2z" fill="#F2A33C"/>'
                '<path d="M-14-30q16 12 30 0" stroke="#F7CF4A" stroke-width="5" fill="none" stroke-linecap="round"/>'
                + put(face(mood, ex=6, ey=0, eye_r=3, mouth_y=0, no_mouth=True, cheek=True), 24, -62, .8))


def cow(mood='calm'):
    return anim('breathe', '<ellipse cx="-10" cy="-56" rx="56" ry="34" fill="#FFFFFF" stroke="#E5DCCB" stroke-width="2"/>'
                '<path d="M-40-80C-30-70-18-74-18-60C-26-50-44-56-48-66Z" fill="#3A3436"/><ellipse cx="10" cy="-44" rx="14" ry="10" fill="#3A3436"/>'
                + ''.join(f'<rect x="{x}" y="-30" width="14" height="30" rx="6" fill="#FFFFFF" stroke="#E5DCCB" stroke-width="2"/>' for x in (-54, -36, 4, 22))
                + '<path d="M-66-60q-14 8-10 26" stroke="#E5DCCB" stroke-width="5" fill="none" stroke-linecap="round"/>'
                '<circle cx="50" cy="-82" r="28" fill="#FFFFFF" stroke="#E5DCCB" stroke-width="2"/>'
                '<path d="M30-104q-10-10-4-16M70-104q10-10 4-16" stroke="#E7B36A" stroke-width="6" fill="none" stroke-linecap="round"/>'
                '<ellipse cx="22" cy="-96" rx="10" ry="6" fill="#FFFFFF" stroke="#E5DCCB" stroke-width="2"/><ellipse cx="78" cy="-96" rx="10" ry="6" fill="#FFFFFF" stroke="#E5DCCB" stroke-width="2"/>'
                '<ellipse cx="52" cy="-66" rx="20" ry="13" fill="#FFC4CF"/><circle cx="46" cy="-66" r="2.5" fill="#B5485A"/><circle cx="58" cy="-66" r="2.5" fill="#B5485A"/>'
                + put(face(mood, ex=10, ey=0, eye_r=3.5, mouth_y=0, no_mouth=True, cheek=False), 50, -88))


def bear(mood='happy'):
    fur = '#9B6A45'
    return anim('breathe', f'<ellipse cy="-50" rx="46" ry="50" fill="{fur}"/><ellipse cy="-42" rx="28" ry="32" fill="#D9AE7E"/>'
                f'<circle cx="-30" cy="-150" r="15" fill="{fur}"/><circle cx="30" cy="-150" r="15" fill="{fur}"/>'
                '<circle cx="-30" cy="-150" r="7" fill="#D9AE7E"/><circle cx="30" cy="-150" r="7" fill="#D9AE7E"/>'
                f'<circle cy="-120" r="38" fill="{fur}"/><ellipse cy="-106" rx="16" ry="12" fill="#D9AE7E"/>'
                f'<ellipse cy="-112" rx="6" ry="4.5" fill="{INK}"/>'
                f'<ellipse cx="-24" cy="-6" rx="16" ry="10" fill="{fur}"/><ellipse cx="24" cy="-6" rx="16" ry="10" fill="{fur}"/>'
                + put(face(mood, ex=14, ey=0, eye_r=4, mouth_y=16, cheek=True), 0, -124))


def fox(mood='happy'):
    f = '#F28C3C'
    return anim('breathe', anim('wag', f'<path d="M24-20C70-20 76-70 54-80C56-50 40-36 20-36Z" fill="{f}"/><path d="M60-74C66-80 62-86 56-82C58-78 58-76 60-74Z" fill="#FFFFFF"/>')
                + f'<path d="M-30 0C-34-50-18-74 0-74S34-50 30 0Z" fill="{f}"/><path d="M-12 0C-14-30-8-46 0-46S14-30 12 0Z" fill="#FFF3DD"/>'
                f'<path d="M-34-100L-30-140-6-112ZM34-100L30-140 6-112Z" fill="{f}"/><path d="M-28-108L-27-128-14-114ZM28-108L27-128 14-114Z" fill="#3A3436"/>'
                f'<path d="M-34-96C-34-120 34-120 34-96C30-76 10-66 0-66S-30-76-34-96Z" fill="{f}"/>'
                '<path d="M-26-86C-16-80-8-72 0-66C8-72 16-80 26-86C20-70 10-64 0-64S-20-70-26-86Z" fill="#FFF3DD"/>'
                f'<ellipse cy="-70" rx="5" ry="4" fill="{INK}"/>'
                + put(face(mood, ex=12, ey=0, eye_r=3.6, mouth_y=0, no_mouth=True, cheek=True), 0, -94))


def deer(mood='happy'):
    f = '#C98B4E'
    return anim('breathe', ''.join(f'<rect x="{x}" y="-50" width="10" height="50" rx="5" fill="{f}"/>' for x in (-44, -30, 18, 32))
                + f'<ellipse cx="-4" cy="-64" rx="52" ry="26" fill="{f}"/>'
                + ''.join(f'<circle cx="{x}" cy="{y}" r="4" fill="#FFF3DD"/>' for x, y in ((-30, -72), (-14, -78), (2, -70), (-20, -62), (14, -76)))
                + f'<path d="M30-74L44-120" stroke="{f}" stroke-width="20" stroke-linecap="round"/>'
                f'<path d="M40-150l-10-20M40-150l10-22M40-150l-2-12M56-148l14-18M56-148l20-6" stroke="#8A5A3B" stroke-width="5" stroke-linecap="round"/>'
                f'<ellipse cx="50" cy="-128" rx="22" ry="20" fill="{f}"/><ellipse cx="64" cy="-120" rx="10" ry="8" fill="#FFF3DD"/>'
                f'<ellipse cx="28" cy="-140" rx="10" ry="5" fill="{f}" transform="rotate(-30 28 -140)"/>'
                f'<circle cx="70" cy="-122" r="3.5" fill="{INK}"/>'
                + put(face(mood, ex=7, ey=0, eye_r=3, mouth_y=0, no_mouth=True, cheek=True), 50, -134, .8))


def mouse(mood='happy'):
    return anim('bob', '<path d="M30-10C60-10 60-30 70-34" stroke="#F2A6B4" stroke-width="4" fill="none" stroke-linecap="round"/>'
                '<ellipse cy="-22" rx="32" ry="22" fill="#B8B4C2"/><circle cx="-14" cy="-56" r="13" fill="#B8B4C2"/><circle cx="14" cy="-56" r="13" fill="#B8B4C2"/>'
                '<circle cx="-14" cy="-56" r="7" fill="#FFC4CF"/><circle cx="14" cy="-56" r="7" fill="#FFC4CF"/>'
                '<circle cy="-36" r="20" fill="#B8B4C2"/><circle cy="-28" r="4" fill="#FF8FA3"/>'
                + put(face(mood, ex=7, ey=0, eye_r=3, mouth_y=0, no_mouth=True, cheek=True), 0, -40, .8))


def monkey(mood='happy'):
    f = '#A8744A'
    return anim('bob', anim('wag', f'<path d="M30-20C70-20 70-70 50-76" stroke="{f}" stroke-width="8" fill="none" stroke-linecap="round"/>')
                + f'<ellipse cy="-40" rx="32" ry="40" fill="{f}"/><ellipse cy="-36" rx="20" ry="26" fill="#F2D3A8"/>'
                f'<circle cx="-40" cy="-108" r="14" fill="#F2D3A8"/><circle cx="40" cy="-108" r="14" fill="#F2D3A8"/>'
                f'<circle cy="-108" r="38" fill="{f}"/><path d="M-26-112C-26-136 0-128 0-116C0-128 26-136 26-112C30-88 14-80 0-80S-30-88-26-112Z" fill="#F2D3A8"/>'
                + put(face(mood, ex=11, ey=0, eye_r=3.6, mouth_y=16, cheek=True), 0, -106))


def elephant(mood='happy'):
    g = '#A9B4C8'
    return anim('breathe', ''.join(f'<rect x="{x}" y="-50" width="24" height="50" rx="10" fill="{g}"/>' for x in (-60, -30, 14, 40))
                + f'<ellipse cx="-6" cy="-76" rx="70" ry="46" fill="{g}"/>'
                f'<ellipse cx="34" cy="-102" rx="36" ry="44" fill="#BFC8D8"/>'
                f'<circle cx="62" cy="-110" r="36" fill="{g}"/>'
                f'<path d="M84-96C100-70 96-40 84-30" stroke="{g}" stroke-width="18" fill="none" stroke-linecap="round"/>'
                + put(face(mood, ex=10, ey=0, eye_r=3.6, mouth_y=0, no_mouth=True, cheek=True), 64, -116))


def owl(mood='calm'):
    return anim('breathe', '<path d="M-30 0C-38-40-30-80 0-80S38-40 30 0Z" fill="#B07A50"/><ellipse cy="-26" rx="20" ry="24" fill="#E8C9A0"/>'
                '<path d="M-30-74L-26-96-10-80ZM30-74L26-96 10-80Z" fill="#B07A50"/>'
                '<circle cx="-13" cy="-58" r="12" fill="#FFF3DD"/><circle cx="13" cy="-58" r="12" fill="#FFF3DD"/>'
                + (f'<circle cx="-13" cy="-58" r="5" fill="{INK}"/><circle cx="13" cy="-58" r="5" fill="{INK}"/>' if mood != 'sleep'
                   else f'<path d="M-19-58h12M7-58h12" stroke="{INK}" stroke-width="3" stroke-linecap="round"/>')
                + '<path d="M-5-48l5 8 5-8z" fill="#F2A33C"/>'
                + ''.join(f'<path d="M{x}-30q4 4 8 0" stroke="#B07A50" stroke-width="2" fill="none"/>' for x in (-12, -2, 6)))


def butterfly_big():
    return anim('flutter', '<ellipse cx="-20" cy="-16" rx="20" ry="16" fill="#FF9AA8"/><ellipse cx="20" cy="-16" rx="20" ry="16" fill="#FF9AA8"/>'
                '<ellipse cx="-14" cy="8" rx="12" ry="10" fill="#FFC4CF"/><ellipse cx="14" cy="8" rx="12" ry="10" fill="#FFC4CF"/>'
                f'<rect x="-3" y="-26" width="6" height="40" rx="3" fill="{INK}"/>'
                f'<path d="M0-26q-6-12-12-14M0-26q6-12 12-14" stroke="{INK}" stroke-width="2" fill="none"/>')


def bee():
    return anim('float', '<ellipse cx="-6" cy="-30" rx="12" ry="9" fill="#E8F4FF" opacity=".9"/><ellipse cx="8" cy="-32" rx="12" ry="9" fill="#E8F4FF" opacity=".9"/>'
                '<ellipse cy="-14" rx="20" ry="14" fill="#FFD84A"/><path d="M-6-27v26M6-27v26" stroke="#3A3436" stroke-width="5"/>'
                f'<circle cx="16" cy="-18" r="2.5" fill="{INK}"/><path d="M-20-14h-8" stroke="#3A3436" stroke-width="3"/>')


FRUITS = {'apple': apple, 'persimmon': persimmon, 'tangerine': tangerine, 'peach': peach, 'pear': pear,
          'grapes': grapes, 'strawberry': strawberry, 'banana': banana}


def props():
    """composer.js 가 쓰는 부품 (이름 → svg)."""
    p = {k: fn() for k, fn in FRUITS.items()}
    p.update({
        'watermelon': watermelon(), 'corn': corn(), 'carrot': carrot(), 'radish': radish(), 'potato': potato(),
        'sweet_potato': sweet_potato(), 'cabbage': cabbage(), 'mushroom': mushroom(), 'acorn': acorn(),
        'egg': egg(), 'bread': bread(), 'candy': candy(), 'lollipop': lollipop(), 'icecream': icecream(), 'cookie': cookie(),
        'honey': honey(), 'milk': milk(), 'dumpling': dumpling(), 'noodles': noodles(),
        'ball': ball(), 'balloons': balloons(), 'doll': doll(), 'teddy': teddy(), 'car': car(), 'bicycle': bicycle(),
        'train': train(), 'airplane': airplane(), 'hat': hat(), 'bouquet': bouquet(), 'gift': gift(), 'lantern': lantern(),
        'candle': candle(), 'clock': clock(), 'bucket': bucket(), 'shovel': shovel(), 'watering_can': watering_can(),
        'sled': sled(), 'shell': shell(), 'star_toy': star_toy(), 'drum': drum(), 'flower_pot': flower_pot(),
        'blanket': blanket(), 'heart_big': heart_big(), 'stars_sky': stars_sky(), 'butterfly_big': butterfly_big(), 'bee': bee(),
    })
    return p


def characters():
    """작은 동물 캐릭터: 표정마다 그림."""
    moods = ('happy', 'calm', 'shock', 'cry', 'sleep', 'angry')
    face_of = {'angry': 'determined'}

    def v(fn, only=moods):
        return {m: fn(face_of.get(m, m)) for m in only}
    return {
        'frog': dict(scale=1.1, h=70, v=v(frog)),
        'chick': dict(scale=1.2, h=70, v=v(chick)),
        'hen': dict(scale=1.1, h=95, faces=1, v=v(hen)),
        'duck': dict(scale=1.1, h=80, faces=1, v=v(duck)),
        'cow': dict(scale=.95, h=130, faces=1, v=v(cow)),
        'bear': dict(scale=.95, h=170, v=v(bear)),
        'fox': dict(scale=1.05, h=140, v=v(fox)),
        'deer': dict(scale=.95, h=170, faces=1, v=v(deer)),
        'mouse': dict(scale=1.2, h=70, v=v(mouse)),
        'monkey': dict(scale=1.05, h=150, v=v(monkey)),
        'elephant': dict(scale=.85, h=160, faces=1, v=v(elephant)),
        'owl': dict(scale=1.1, h=100, v=v(owl)),
    }
