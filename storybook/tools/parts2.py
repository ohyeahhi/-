"""새 동화에 필요한 캐릭터·소품·배경.

draw_scenes.py 의 그림체(둥근 도형, 같은 얼굴 표정, 같은 색감)를 그대로 따라요.
"""
import draw_scenes as ds
from draw_scenes import (INK, SKIN, BLUSH, put, anim, face, grad, GLOW, mom, kid, woodcutter, sun, moon,
                         cloud, stars, stars_colored, house, pond, round_tree, pine, night_pine, flower, tuft)

ds.STYLE += """
.shiver{animation:shiver .18s linear infinite alternate;transform-box:fill-box}
.spin{animation:spin 6s linear infinite;transform-box:fill-box;transform-origin:50% 50%}
.fall{animation:fall 3.2s ease-in infinite;transform-box:fill-box}
.blow{animation:blow 1.4s ease-out infinite;transform-box:fill-box}
.snow{animation:snow 6s linear infinite;transform-box:fill-box}
.puff{animation:puff 1.4s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 50%}
@keyframes shiver{from{transform:translateX(-1.5px)}to{transform:translateX(1.5px)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fall{0%{transform:translateY(-10px) rotate(0)}100%{transform:translateY(30px) rotate(25deg)}}
@keyframes blow{0%{transform:translateX(-10px);opacity:0}30%{opacity:1}100%{transform:translateX(40px);opacity:0}}
@keyframes snow{0%{transform:translateY(-30px)}100%{transform:translateY(60px)}}
@keyframes puff{from{transform:scale(1)}to{transform:scale(1.06)}}
"""


def recolor(svg, mapping):
    for a, b in mapping.items():
        svg = svg.replace(a, b)
    return svg


# ---------- 배경 더하기 ----------
def bg2(kind):
    if kind == 'kitchen':
        d = ds.grad('sky', [(0, '#F3D9B1'), (1, '#E8C493')])
        b = ('<rect width="800" height="600" fill="url(#sky)"/>'
             '<path d="M0 0h800v70H0z" fill="#9C6B45"/><path d="M0 70h800" stroke="#7A5232" stroke-width="8"/>'
             '<path d="M120 0v70M400 0v70M680 0v70" stroke="#7A5232" stroke-width="10"/>'
             '<rect y="470" width="800" height="130" fill="#A27A55"/><path d="M0 470h800" stroke="#8A6444" stroke-width="6"/>')
        return d + GLOW, b
    if kind == 'winter':
        d = ds.grad('sky', [(0, '#C7D6EA'), (1, '#EEF3FA')])
        flakes = ''.join(put(anim('snow', f'<circle r="{r}" fill="#FFFFFF"/>', -n * .7), x, y)
                         for n, (x, y, r) in enumerate(((60, 60, 5), (180, 120, 4), (300, 40, 6), (420, 140, 4), (540, 70, 5),
                                                         (660, 110, 6), (760, 50, 4), (240, 230, 5), (480, 260, 4), (700, 240, 5))))
        b = ('<rect width="800" height="600" fill="url(#sky)"/>'
             '<path d="M0 360C120 320 220 310 330 340S540 314 660 326 770 344 800 348V600H0Z" fill="#DDE7F3"/>'
             '<path d="M0 448C150 420 300 424 420 440S680 434 800 426V600H0Z" fill="#FFFFFF"/>' + flakes)
        return d + GLOW, b
    if kind == 'autumn':
        d = ds.grad('sky', [(0, '#CFE6F5'), (.7, '#FFF0D6')])
        b = ('<rect width="800" height="600" fill="url(#sky)"/>'
             '<path d="M0 380C120 330 220 318 330 350S540 320 660 334 770 352 800 356V600H0Z" fill="#E9B97A"/>'
             '<path d="M0 448C150 420 300 424 420 440S680 434 800 426V600H0Z" fill="#D8B66B"/>')
        return d + GLOW, b
    if kind in ('paddy', 'paddy_night'):
        night = kind == 'paddy_night'
        d = ds.grad('sky', [(0, '#1F2753'), (1, '#4B4F8F')] if night else [(0, '#CBE8FF'), (.7, '#FFF4D6')])
        far = '#3A4479' if night else '#B7D8C6'
        field = '#8C7A3C' if night else '#F2C94C'
        rows = ''.join(f'<path d="M0 {y}C200 {y-14} 600 {y-14} 800 {y}" stroke="{"#7A6A34" if night else "#E0B23A"}" stroke-width="5" fill="none"/>'
                       for y in range(470, 600, 26))
        b = ('<rect width="800" height="600" fill="url(#sky)"/>'
             f'<path d="M0 352C90 292 160 262 240 292S360 244 450 256 580 308 660 288 770 278 800 294V600H0Z" fill="{far}"/>'
             f'<path d="M0 440C150 420 300 424 420 436S680 430 800 424V600H0Z" fill="{field}"/>' + rows)
        return d + GLOW, b
    if kind == 'sky':
        d = ds.grad('sky', [(0, '#9FD3FF'), (1, '#E6F4FF')])
        return d + GLOW, '<rect width="800" height="600" fill="url(#sky)"/>'
    if kind == 'room':
        d = ds.grad('sky', [(0, '#FFE9CF'), (1, '#F6D6B4')])
        b = ('<rect width="800" height="600" fill="url(#sky)"/>'
             '<rect x="560" y="70" width="150" height="130" rx="10" fill="#BFE4FF" stroke="#B98E62" stroke-width="10"/>'
             '<path d="M635 70v130M560 135h150" stroke="#B98E62" stroke-width="6"/>'
             '<rect y="470" width="800" height="130" fill="#C99B6D"/><path d="M0 470h800" stroke="#B0845A" stroke-width="6"/>')
        return d + GLOW, b
    return ds.bg(kind)


# ---------- 소품 ----------
def rock(x, y, s=1):
    return put('<path d="M-80 0C-90-40-60-80-10-84C40-88 84-50 82 0Z" fill="#B9B4AA"/>'
               '<path d="M-50-40q20-14 40-10" stroke="#D6D1C7" stroke-width="8" stroke-linecap="round" fill="none"/>', x, y, s)


def rice_bundle(x, y, s=1, rot=0):
    b = ('<path d="M-22 0L-14-60L14-60L22 0Z" fill="#E9B949"/>'
         '<path d="M-14-60C-30-90-24-120-6-128M14-60C30-90 24-120 6-128M0-60V-130" stroke="#E9B949" stroke-width="12" fill="none" stroke-linecap="round"/>'
         + ''.join(f'<ellipse cx="{dx}" cy="{dy}" rx="5" ry="8" fill="#F5D06E"/>' for dx, dy in ((-10, -128), (8, -132), (-2, -136), (14, -120), (-16, -118)))
         + '<rect x="-20" y="-40" width="40" height="8" rx="4" fill="#B07440"/>')
    return put(b, x, y, s, rot=rot)


def rice_stack(x, y, n=5, s=1):
    out = ''
    for row, count in enumerate((3, 2, 1)[: max(1, (n + 1) // 2)]):
        for i in range(count):
            out += rice_bundle(x + (i - (count - 1) / 2) * 42 * s, y - row * 70 * s, s * .9)
    return out


def sorghum(x, y, s=1):
    st = ''.join(put(anim('sway', '<path d="M0 0V-150" stroke="#7FA552" stroke-width="6"/>'
                     '<path d="M0-100q-24-10-30-30M0-70q22-8 30-28" stroke="#7FA552" stroke-width="5" fill="none" stroke-linecap="round"/>'
                     '<ellipse cy="-162" rx="12" ry="22" fill="#D9493E"/>', -i * .4), dx, 0)
                 for i, dx in enumerate((-80, -40, 0, 40, 80)))
    return put(st, x, y, s)


def oil_bottle(x, y, s=1):
    return put('<path d="M-14 0V-40q0-10 8-14V-66h12v12q8 4 8 14V0Z" fill="#E9B44C" opacity=".9"/>'
               '<rect x="-7" y="-76" width="14" height="10" rx="3" fill="#9C6B45"/>'
               '<path d="M-8-30h16" stroke="#FFF1C4" stroke-width="4" stroke-linecap="round"/>', x, y, s)


def basket(x, y, s=1, full=True):
    b = ('<path d="M-36-30h72l-8 30h-56z" fill="#C98B4F"/><path d="M-30-18h60M-28-8h56" stroke="#A86B38" stroke-width="3"/>'
         '<path d="M-30-30q30-40 60 0" stroke="#A86B38" stroke-width="5" fill="none"/>')
    if full:
        b = ('<circle cx="-14" cy="-34" r="11" fill="#E4573D"/><circle cx="8" cy="-36" r="10" fill="#FFD66B"/>'
             '<ellipse cx="20" cy="-32" rx="14" ry="9" fill="#E9B97A"/>') + b
    return put(b, x, y, s)


def bowl(x, y, s=1):
    return put('<ellipse cy="-22" rx="34" ry="10" fill="#8C3B3B"/>'
               '<circle cx="-10" cy="-23" r="4" fill="#FFF6E6"/><circle cx="8" cy="-21" r="4" fill="#FFF6E6"/><circle cx="0" cy="-26" r="3.5" fill="#FFF6E6"/>'
               '<path d="M-36-22q4 22 36 22t36-22" fill="#FFFFFF" stroke="#E5DCCB" stroke-width="2"/>'
               + anim('smoke', '<path d="M-8-38q-6-10 0-20M8-40q-6-10 0-20" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>'),
               x, y, s)


def cauldron(x, y, s=1, fire=True):
    f = anim('glow', '<path d="M-30 0q-6-30 10-44q-2 20 12 24q4-26 22-34q-6 26 10 36q12-10 6-30q20 22 0 48z" fill="#FF8A3D"/>'
                     '<path d="M-14 0q-4-18 8-26q0 14 10 16q4-14 14-18q-4 16 4 28z" fill="#FFD66B"/>') if fire else ''
    return put('<path d="M-110 40V-40h220v80z" fill="#C9A37A"/><path d="M-110-40h220" stroke="#A8845C" stroke-width="10"/>'
               '<rect x="-46" y="-10" width="92" height="50" rx="10" fill="#3A2E2A"/>' + put(f, 0, 30)
               + '<path d="M-80-40C-80-110 80-110 80-40Z" fill="#3B3B3F"/><ellipse cy="-96" rx="70" ry="14" fill="#2A2A2E"/>'
               '<ellipse cy="-98" rx="58" ry="9" fill="#8C3B3B"/>'
               + anim('smoke', '<path d="M-20-110q-10-16 0-30M10-112q-10-16 0-30" stroke="#FFFFFF" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>'),
               x, y, s)


def jar(x, y, s=1):
    return put('<path d="M-40 0C-56-40-50-90-30-100H30C50-90 56-40 40 0Z" fill="#6B4A36"/>'
               '<ellipse cy="-100" rx="32" ry="8" fill="#4E3526"/><ellipse cy="-100" rx="24" ry="5" fill="#6DB5DD"/>'
               '<path d="M-30-60q30 10 60 0" stroke="#8A6448" stroke-width="5" fill="none"/>', x, y, s)


def treasure(x, y, s=1):
    coins = ''.join(f'<ellipse cx="{dx}" cy="{dy}" rx="16" ry="6" fill="#FFC93C" stroke="#E0A419" stroke-width="2"/>'
                    for dx, dy in ((-60, -6), (-60, -14), (-60, -22), (-36, -6), (-36, -14), (60, -6), (60, -14), (40, -6)))
    sack = ('<path d="M-20 0C-36-20-30-56-10-62L-16-74h32l-6 12C30-56 36-20 20 0Z" fill="#E9D9B0"/>'
            '<path d="M-14-66h28" stroke="#B07440" stroke-width="5"/>')
    silk = ('<rect x="70" y="-46" width="22" height="44" rx="6" fill="#E4738A"/><rect x="96" y="-40" width="22" height="38" rx="6" fill="#7FB8E6"/>')
    return put(coins + sack + silk + stars_colored([(-40, -60, 12), (50, -50, 10), (10, -90, 9)], '#FFE27A'), x, y, s)


def gourd(x, y, s=1, opened=None):
    if opened is None:
        g = ('<ellipse cy="-58" rx="70" ry="58" fill="#EEF3D8"/><path d="M-40-100q-10 40 0 84M40-100q10 40 0 84M0-114v110" '
             'stroke="#D6E0B4" stroke-width="5" fill="none"/><path d="M0-114q6-16 20-18" stroke="#7FA552" stroke-width="7" fill="none" stroke-linecap="round"/>')
        return put(anim('breathe', g), x, y, s)
    inside = {'treasure': treasure(0, -10, .7), 'goblin': ''}[opened]
    g = ('<path d="M-130 0A70 58 0 0 1-10 0Z" fill="#EEF3D8"/><path d="M-118-6A58 46 0 0 1-22-6Z" fill="#FFF8E1"/>'
         '<path d="M10 0A70 58 0 0 1 130 0Z" fill="#EEF3D8"/><path d="M22-6A58 46 0 0 1 118-6Z" fill="#FFF8E1"/>'
         '<circle cy="-50" r="110" fill="url(#glow)"/>')
    return put(g + inside, x, y, s)


def saw(x, y, s=1):
    return put(anim('drift', '<rect x="-150" y="-10" width="300" height="16" rx="4" fill="#B8C1CA"/>'
                    '<path d="M-150 6' + ''.join(f'l10 10l10-10' for _ in range(15)) + '" fill="#B8C1CA"/>'
                    '<rect x="-180" y="-14" width="34" height="24" rx="8" fill="#9C6B45"/><rect x="146" y="-14" width="34" height="24" rx="8" fill="#9C6B45"/>'),
               x, y, s)


def nest(x, y, s=1):
    return put('<path d="M-40 0A40 26 0 0 0 40 0Z" fill="#9C6B45"/><path d="M-36 4q36 10 72 0M-30 12q30 8 60 0" stroke="#7A5232" stroke-width="4" fill="none"/>', x, y, s)


def notes(x, y):
    n = ('<ellipse cx="0" cy="0" rx="8" ry="6" fill="#5B6BB5"/><path d="M7-2V-30l12 4" stroke="#5B6BB5" stroke-width="4" fill="none"/>')
    return ''.join(put(anim('rise', n, -i * 1.1), x + dx, y + dy) for i, (dx, dy) in enumerate(((0, 0), (30, -20), (60, 0))))


def straw_house(x, y, s=1, blown=False):
    if blown:
        bits = ''.join(put(anim('blow', f'<path d="M0 0l30-6" stroke="#E9C46A" stroke-width="6" stroke-linecap="round"/>', -i * .3), dx, dy)
                       for i, (dx, dy) in enumerate(((-60, -120), (-20, -150), (20, -100), (60, -140), (0, -60), (80, -80), (-40, -40))))
        return put('<path d="M-90 0q20-14 40-2t40 0 40-2 50 4" stroke="#E9C46A" stroke-width="10" fill="none" stroke-linecap="round"/>' + bits, x, y, s)
    h = ('<path d="M-100 0C-110-80-60-170 0-180C60-170 110-80 100 0Z" fill="#E9C46A"/>'
         + ''.join(f'<path d="M{dx}-10Q{dx*0.6}-90 {dx*0.2}-170" stroke="#D9A93E" stroke-width="5" fill="none"/>' for dx in (-80, -40, 0, 40, 80))
         + '<path d="M-26 0V-56a26 26 0 0 1 52 0V0Z" fill="#6B4A36"/>')
    return put(h, x, y, s)


def stick_house(x, y, s=1, broken=False):
    if broken:
        sticks = ''.join(f'<rect x="{dx}" y="-14" width="80" height="10" rx="5" fill="#9C6B45" transform="rotate({r} {dx} -10)"/>'
                         for dx, r in ((-100, -12), (-60, 18), (-10, -6), (30, 22), (60, -18), (-80, 6)))
        return put(sticks, x, y, s)
    walls = ''.join(f'<rect x="{dx}" y="-130" width="16" height="130" rx="6" fill="{c}"/>'
                    for dx, c in zip(range(-100, 100, 20), ('#A87448', '#9C6B45') * 5))
    roof = '<path d="M-130-120L0-210L130-120Z" fill="#8A5A3B"/>' + ''.join(
        f'<path d="M{-120 + i*24}-124L{-60 + i*12}-170" stroke="#6B4530" stroke-width="5"/>' for i in range(10))
    return put(walls + roof + '<rect x="-24" y="-80" width="48" height="80" rx="6" fill="#4E3526"/>', x, y, s)


def brick_house(x, y, s=1, steam=False):
    bricks = ''.join(f'<rect x="{-118 + (row % 2) * 20 + col * 40}" y="{-24 - row * 22}" width="36" height="18" rx="3" fill="#C9574A"/>'
                     for row in range(7) for col in range(6 - (row % 2)))
    h = ('<rect x="-120" y="-160" width="240" height="160" fill="#E8D5C4"/>' + bricks
         + '<path d="M-150-150L0-250L150-150Z" fill="#7A3B33"/>'
         + '<rect x="70" y="-250" width="40" height="80" fill="#A84A3E"/>'
         + '<rect x="-26" y="-90" width="52" height="90" rx="8" fill="#6B4A36"/><circle cx="14" cy="-46" r="4" fill="#FFC93C"/>'
         + '<rect x="-96" y="-120" width="50" height="44" rx="6" fill="#FFF1C4" stroke="#6B4A36" stroke-width="5"/>')
    if steam:
        h += ''.join(anim('smoke', f'<circle cx="90" cy="-260" r="{r}" fill="#FFFFFF" opacity=".8"/>', d) for r, d in ((14, 0), (18, -1.4), (12, -2.8)))
    return put(h, x, y, s)


def ant_hill(x, y, s=1):
    return put('<path d="M-140 0C-120-110 120-110 140 0Z" fill="#C9A06A"/><path d="M-100-30q100-30 200 0" stroke="#B48A55" stroke-width="5" fill="none"/>'
               '<path d="M-26 0V-40a26 26 0 0 1 52 0V0Z" fill="#6B4A36"/><circle cx="12" cy="-22" r="3" fill="#FFC93C"/>'
               '<rect x="40" y="-76" width="30" height="24" rx="5" fill="#FFF1C4" stroke="#6B4A36" stroke-width="4"/>', x, y, s)


def leaves(x, y, colors=('#E4573D', '#F2A33C', '#FFC93C')):
    out = ''
    for i, (dx, dy) in enumerate(((0, 0), (80, -40), (160, 10), (240, -30), (320, 20), (400, -20))):
        c = colors[i % len(colors)]
        out += put(anim('fall', f'<path d="M0 0q10-14 20 0q-10 14-20 0z" fill="{c}"/>', -i * .55), x + dx, y + dy)
    return out


def wind_lines(x, y, n=3, s=1):
    return ''.join(put(anim('blow', '<path d="M0 0q30-14 60 0t60 0" stroke="#FFFFFF" stroke-width="7" fill="none" stroke-linecap="round" opacity=".9"/>', -i * .45),
                       x, y + i * 34, s) for i in range(n))


def bed(x, y, s=1, who=None):
    """침대. who 에 이불 밖으로 나온 얼굴(그림)을 넣어요."""
    back = ('<rect x="-150" y="-150" width="22" height="150" rx="6" fill="#9C6B45"/>'
            '<rect x="-136" y="-118" width="84" height="40" rx="16" fill="#FFFFFF"/>')
    front = ('<path d="M-70-108C-30-136 120-126 140-92V-40H-70Z" fill="#E4738A"/>'
             '<path d="M-60-100c40-14 120-14 190 4" stroke="#FFFFFF" stroke-width="5" fill="none" opacity=".6"/>'
             '<rect x="-150" y="-60" width="300" height="40" rx="10" fill="#B98E62"/>'
             '<rect x="128" y="-96" width="22" height="96" rx="6" fill="#9C6B45"/><rect x="-150" y="-30" width="22" height="30" rx="6" fill="#9C6B45"/>')
    # 이불 위로 나온 머리·어깨만 보이게 잘라요.
    clip = '<clipPath id="bedclip"><rect x="-150" y="-320" width="300" height="270"/></clipPath>'
    return put(back + clip + f'<g clip-path="url(#bedclip)">{who or ""}</g>' + front, x, y, s)


# ---------- 캐릭터 ----------
def goblin(color='#7FA8E0', mood='grin', club=True):
    """도깨비. 발밑 가운데 (0,0), 키 약 190."""
    dark = {'#7FA8E0': '#5F86C2', '#8CCB8A': '#68A866', '#F08A7A': '#D0685A'}.get(color, '#666')
    body = (f'<ellipse cx="-20" cy="-8" rx="18" ry="10" fill="{dark}"/><ellipse cx="20" cy="-8" rx="18" ry="10" fill="{dark}"/>'
            f'<path d="M-46-14C-56-70-36-110 0-112S56-70 46-14Z" fill="{color}"/>'
            '<path d="M-46-40h92v26h-92z" fill="#F59A45"/>'
            f'<path d="M-34-40l6 14M-10-40l4 14M14-40l-4 14M36-40l-6 14" stroke="{INK}" stroke-width="5" stroke-linecap="round"/>')
    head = (f'<ellipse cy="-146" rx="50" ry="44" fill="{color}"/>'
            '<path d="M-6-186L4-222L16-184Z" fill="#FFD66B"/>'
            f'<path d="M-46-160q-8-30 10-40q-2 16 14 16q-4-24 16-30q2 18 16 18q4-20 22-18q-6 14 6 24" fill="#3A2E3A"/>'
            + put(face('happy' if mood == 'happy' else 'calm', ex=16, ey=0, eye_r=6, mouth_y=20, cheek=True), 0, -146)
            + ('<path d="M-22-126q22 18 44 0" stroke="#3A2A22" stroke-width="4" fill="#B5485A"/><path d="M-12-124l4 9 4-8zM6-124l4 8 4-9z" fill="#fff"/>'
               if mood == 'grin' else '')
            + (f'<path d="M-32-166l18 6M32-166l-18 6" stroke="{INK}" stroke-width="5" stroke-linecap="round"/>' if mood == 'angry' else ''))
    arm_l = f'<path d="M-40-80q-26 10-30 34" stroke="{color}" stroke-width="16" fill="none" stroke-linecap="round"/>'
    club_g = (anim('chop', f'<path d="M40-82q24-10 30-40" stroke="{color}" stroke-width="16" fill="none" stroke-linecap="round"/>'
                   '<path d="M60-120l40-70q14-6 18 8l-34 72z" fill="#B07440"/>'
                   + ''.join(f'<circle cx="{cx}" cy="{cy}" r="4" fill="#FFE27A"/>' for cx, cy in ((92, -170), (100, -152), (86, -140), (104, -180))))
              if club else f'<path d="M40-80q26 10 30 34" stroke="{color}" stroke-width="16" fill="none" stroke-linecap="round"/>')
    return anim('bob', body + arm_l + head) + club_g


def wolf(pose='sit', mood='sly', look=(-4, 2)):
    """늑대. 발밑 가운데 (0,0), 앉은 키 약 240."""
    fur, light, dark = '#9AA3B5', '#E6E9F0', '#7E879A'
    tail = anim('wag', f'<path d="M58-20C120-20 136-84 104-108C114-76 96-44 60-40Z" fill="{dark}"/><path d="M104-108c8 6 10 16 6 22c-4-8-10-12-16-14z" fill="{light}"/>')
    body = (f'<path d="M-60-3C-70-60-50-132 0-138S70-60 60-3Z" fill="{fur}"/>'
            f'<path d="M-28-3C-34-48-20-88 0-92S34-48 28-3Z" fill="{light}"/>'
            f'<ellipse cx="-40" cy="-5" rx="26" ry="12" fill="{fur}"/><ellipse cx="40" cy="-5" rx="26" ry="12" fill="{fur}"/>')
    if pose == 'reach':
        arm = anim('paw', f'<path d="M-18-96Q-58-104-84-126" stroke="{fur}" stroke-width="26" fill="none" stroke-linecap="round"/><circle cx="-90" cy="-130" r="15" fill="{light}"/>')
    elif pose == 'run':
        arm = f'<path d="M-18-96Q-50-80-70-96M18-96Q50-110 64-130" stroke="{fur}" stroke-width="22" fill="none" stroke-linecap="round"/>'
    else:
        arm = f'<ellipse cx="-14" cy="-8" rx="15" ry="10" fill="{light}"/><ellipse cx="14" cy="-8" rx="15" ry="10" fill="{light}"/>'
    lx, ly = look
    if mood == 'sleep':
        eyes = f'<path d="M-34-196q10 8 20 0M14-196q10 8 20 0" stroke="{INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/>'
    elif mood == 'shock':
        eyes = (f'<circle cx="-24" cy="-196" r="13" fill="#fff"/><circle cx="24" cy="-196" r="13" fill="#fff"/>'
                f'<circle cx="-24" cy="-196" r="5" fill="#2B211C"/><circle cx="24" cy="-196" r="5" fill="#2B211C"/>')
    else:
        eyes = (f'<circle cx="-24" cy="-196" r="11" fill="#fff"/><circle cx="24" cy="-196" r="11" fill="#fff"/>'
                f'<circle cx="{-24+lx}" cy="{-196+ly}" r="6" fill="#2B211C"/><circle cx="{24+lx}" cy="{-196+ly}" r="6" fill="#2B211C"/>'
                f'<path d="M-38-212l24 6M38-212l-24 6" stroke="{INK}" stroke-width="5" stroke-linecap="round"/>')
    if mood == 'blow':
        mouth = (f'<circle cx="0" cy="-156" r="9" fill="#B5485A"/>'
                 '<circle cx="-40" cy="-170" r="18" fill="#FFB0B8" opacity=".6"/><circle cx="40" cy="-170" r="18" fill="#FFB0B8" opacity=".6"/>')
    elif mood == 'shock':
        mouth = '<ellipse cx="0" cy="-152" rx="12" ry="10" fill="#B5485A"/>'
    elif mood == 'sleep':
        mouth = f'<path d="M-10-154q10 6 20 0" stroke="{INK}" stroke-width="4" fill="none" stroke-linecap="round"/>'
    else:
        mouth = (f'<path d="M-24-158q24 20 48 0" stroke="{INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/>'
                 '<path d="M-14-152l4 10 4-9zM6-152l4 9 4-10z" fill="#fff"/>')
    head = (f'<path d="M-52-206L-44-270L-12-220Z" fill="{dark}"/><path d="M52-206L44-270L12-220Z" fill="{dark}"/>'
            '<path d="M-44-216L-40-252L-22-224Z" fill="#E8C9CF"/><path d="M44-216L40-252L22-224Z" fill="#E8C9CF"/>'
            f'<ellipse cy="-190" rx="62" ry="54" fill="{fur}"/>'
            f'<path d="M-62-180q-14 18 2 30M62-180q14 18-2 30" fill="{light}"/>'
            f'<ellipse cy="-162" rx="32" ry="24" fill="{light}"/><ellipse cy="-176" rx="10" ry="7.5" fill="#2B211C"/>'
            + eyes + mouth)
    out = tail + anim('breathe', body + head) + arm
    if mood == 'blow':
        out += wind_lines(-150, -190, 3, 1)
    return out


def wolf_in_bed(mood='sly'):
    """할머니 잠옷 모자를 쓰고 침대에 누운 늑대 (bed 의 who 로 넣어요)."""
    w = put(wolf('sit', mood), -92, 0, .6)
    cap = put('<path d="M-44-14C-46-62 46-62 44-14C20-30-20-30-44-14Z" fill="#FFFFFF"/>'
              '<path d="M-46-12q8 7 15 0t15 0 15 0 15 0 15 0 15 0" stroke="#F2D4DC" stroke-width="5" fill="none"/>', -92, -124)
    return w + cap


def grandma_in_bed():
    return put(ds.grandma('calm'), -90, 130, .52)


def pig(color='#FFB8C6', scarf='#7FB8E6', mood='happy', mother=False):
    """아기 돼지(또는 엄마 돼지). 발밑 가운데 (0,0), 키 약 140."""
    dark = '#F39AAE'
    p = (anim('wag', f'<path d="M40-40q20-4 16 12q-10 2-6-8" stroke="{dark}" stroke-width="5" fill="none" stroke-linecap="round"/>')
         + f'<rect x="-30" y="-24" width="16" height="24" rx="7" fill="{dark}"/><rect x="14" y="-24" width="16" height="24" rx="7" fill="{dark}"/>'
         f'<ellipse cy="-46" rx="44" ry="38" fill="{color}"/>'
         + (f'<path d="M-30-60h60v40q-30 14-60 0z" fill="#FFFFFF"/><path d="M-30-60h60" stroke="#E4738A" stroke-width="6"/>' if mother else '')
         + f'<path d="M-40-90L-34-128L-8-106ZM40-90L34-128L8-106Z" fill="{dark}"/>'
         f'<circle cy="-96" r="34" fill="{color}"/>'
         + (f'<path d="M-30-72q30 14 60 0l-6 10q-24 8-48 0z" fill="{scarf}"/>' if scarf and not mother else '')
         + put(face(mood, ex=14, ey=-6, eye_r=4, mouth_y=20, cheek=True), 0, -96)
         + f'<ellipse cy="-90" rx="14" ry="10" fill="{dark}"/><ellipse cx="-5" cy="-90" rx="2.5" ry="3.5" fill="#B5485A"/><ellipse cx="5" cy="-90" rx="2.5" ry="3.5" fill="#B5485A"/>')
    return anim('bob', p)


def sheep(mood='calm', scared=False):
    """양. 발밑 가운데 (0,0), 키 약 110. 오른쪽을 봐요."""
    wool = ''.join(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#FFFFFF" stroke="#E5E2DA" stroke-width="2"/>'
                   for cx, cy, r in ((-30, -50, 24), (-6, -60, 26), (20, -54, 24), (-20, -32, 22), (8, -32, 24), (28, -36, 20)))
    s = ('<rect x="-26" y="-26" width="9" height="26" rx="4" fill="#3A3436"/><rect x="-6" y="-26" width="9" height="26" rx="4" fill="#3A3436"/>'
         '<rect x="14" y="-26" width="9" height="26" rx="4" fill="#3A3436"/><rect x="30" y="-26" width="9" height="26" rx="4" fill="#3A3436"/>'
         + wool
         + '<ellipse cx="52" cy="-62" rx="20" ry="24" fill="#3A3436"/><ellipse cx="34" cy="-70" rx="12" ry="6" fill="#3A3436" transform="rotate(-20 34 -70)"/>'
         '<circle cx="50" cy="-82" r="12" fill="#FFFFFF"/>'
         + put(f'<circle cx="-6" r="3.6" fill="#fff"/><circle cx="8" r="3.6" fill="#fff"/>'
               + ('<ellipse cx="1" cy="14" rx="4" ry="5" fill="#E8707E"/>' if scared else '<path d="M-4 12q5 4 10 0" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>'),
               52, -62))
    return anim('shiver' if scared else 'bob', s)


def ant(load=True, mood='happy'):
    """개미. 발밑 가운데 (0,0), 키 약 100(먹이 포함)."""
    c = '#5A3E32'
    legs = ''.join(f'<path d="M{x} -26l{dx} 26" stroke="{c}" stroke-width="4" stroke-linecap="round"/>' for x, dx in ((-14, -14), (-4, -6), (6, 6), (16, 14)))
    a = (legs + f'<ellipse cx="-22" cy="-30" rx="18" ry="14" fill="{c}"/><ellipse cy="-36" rx="12" ry="10" fill="{c}"/>'
         f'<circle cx="18" cy="-52" r="18" fill="{c}"/>'
         f'<path d="M12-68q-6-16-16-18M24-68q4-16 14-18" stroke="{c}" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
         + put('<circle cx="-6" r="4" fill="#fff"/><circle cx="7" r="4" fill="#fff"/><circle cx="-6" cy="1" r="2" fill="#2B211C"/><circle cx="7" cy="1" r="2" fill="#2B211C"/>'
               + ('<path d="M-4 9q4 4 8 0" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>' if mood != 'tired' else ''), 18, -54))
    if load:
        a += (f'<path d="M10-40q-4-30 8-48M26-40q8-28 0-48" stroke="{c}" stroke-width="4" fill="none" stroke-linecap="round"/>'
              '<ellipse cx="18" cy="-98" rx="22" ry="13" fill="#F5D06E" stroke="#E0B23A" stroke-width="3"/>')
    return anim('bob', a)


def grasshopper(violin=True, cold=False, mood='happy'):
    """베짱이. 발밑 가운데 (0,0), 키 약 170."""
    g, d = ('#8DCB5A', '#6FAE45') if not cold else ('#9FBF84', '#7F9F66')
    b = (f'<path d="M-24-4l-14-60l20-20" stroke="{d}" stroke-width="8" fill="none" stroke-linejoin="round" stroke-linecap="round"/>'
         f'<path d="M24-4l14-60l-20-20" stroke="{d}" stroke-width="8" fill="none" stroke-linejoin="round" stroke-linecap="round"/>'
         f'<ellipse cy="-84" rx="22" ry="44" fill="{g}"/><path d="M-14-110h28M-16-90h32M-14-70h28" stroke="{d}" stroke-width="3"/>'
         f'<ellipse cx="-30" cy="-100" rx="10" ry="34" fill="#C9EBA6" opacity=".7" transform="rotate(-14 -30 -100)"/>'
         f'<circle cy="-142" r="26" fill="{g}"/>'
         f'<path d="M-8-164q-14-30-36-36M8-164q14-30 36-36" stroke="{d}" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
         + put(face(mood, ex=10, ey=0, eye_r=5, mouth_y=12), 0, -142))
    if cold:
        b += ('<path d="M-24-118q24 12 48 0v14q-24 12-48 0z" fill="#E4573D"/><rect x="10" y="-108" width="12" height="34" rx="5" fill="#E4573D"/>'
              f'<path d="M-20-104q-14 10-10 26M20-104q14 10 10 26" stroke="{g}" stroke-width="8" fill="none" stroke-linecap="round"/>')
    elif violin:
        b += (f'<path d="M-18-110q-20 6-24 26M18-110q22-8 40-34" stroke="{g}" stroke-width="7" fill="none" stroke-linecap="round"/>'
              '<g transform="rotate(-30 -30 -96)"><ellipse cx="-30" cy="-84" rx="16" ry="22" fill="#B07440"/><ellipse cx="-30" cy="-84" rx="8" ry="11" fill="#8A5A3B"/>'
              '<rect x="-33" y="-140" width="6" height="40" fill="#6B4530"/></g>'
              + anim('paw', '<path d="M60-148L-20-70" stroke="#E9D9B0" stroke-width="3"/>'))
    return anim('shiver' if cold else 'bob', b)


def swallow(bandage=False):
    """제비. (0,0) 가운데, 날개 편 너비 약 110."""
    s = ('<path d="M-10 0C-60-30-70-10-60 0C-40-4-20 4-10 6Z" fill="#2E3A5C"/><path d="M10 0C60-30 70-10 60 0C40-4 20 4 10 6Z" fill="#2E3A5C"/>'
         '<ellipse cy="2" rx="16" ry="22" fill="#2E3A5C"/><ellipse cy="8" rx="10" ry="14" fill="#FFFFFF"/>'
         '<path d="M-6 22l-10 22l10-10l6 10l6-10l10 10l-10-22z" fill="#2E3A5C"/>'
         '<circle cy="-18" r="12" fill="#2E3A5C"/><ellipse cy="-10" rx="7" ry="4" fill="#D9493E"/>'
         '<circle cx="-4" cy="-20" r="2.5" fill="#fff"/><circle cx="4" cy="-20" r="2.5" fill="#fff"/><path d="M-3-14h6l-3 5z" fill="#FFC93C"/>')
    if bandage:
        s += '<rect x="-12" y="26" width="24" height="8" rx="3" fill="#FFFFFF" stroke="#E5DCCB" stroke-width="2"/>'
    return anim('flutter', s)


def bluebird():
    b = ('<path d="M-6 0C-40-26-50-6-42 4C-28 0-14 4-6 6Z" fill="#5FA8E0"/><ellipse rx="20" ry="14" fill="#7FC0F0"/>'
         '<circle cx="16" cy="-6" r="11" fill="#7FC0F0"/><circle cx="19" cy="-8" r="2.5" fill="#2B211C"/><path d="M26-6l10 3-10 3z" fill="#FFC93C"/>'
         '<path d="M-18 4l-14 6" stroke="#5FA8E0" stroke-width="6" stroke-linecap="round"/>')
    return anim('flutter', b)


def baby(mood='cry'):
    b = ('<path d="M-40 0C-44-40-26-62 0-62S44-40 40 0Z" fill="#FFF1C4"/><path d="M-40-20q40 14 80 0" stroke="#F5D06E" stroke-width="5" fill="none"/>'
         f'<circle cy="-78" r="28" fill="{SKIN}"/><path d="M-8-104q8-10 16 0" stroke="#3B3036" stroke-width="4" fill="none" stroke-linecap="round"/>'
         + put(face(mood, ex=10, ey=0, eye_r=3.5, mouth_y=12), 0, -78))
    return anim('bob', b)


def chestnut(mood='happy'):
    c = ('<path d="M0-80C30-60 46-30 40-6C34 6-34 6-40-6C-46-30-30-60 0-80Z" fill="#8A4E2E"/>'
         '<path d="M-40-8C-30 4 30 4 40-8L36 2C20 10-20 10-36 2Z" fill="#E9C9A0"/>'
         '<path d="M-14-60q10-8 20-4" stroke="#B0744A" stroke-width="5" fill="none" stroke-linecap="round"/>'
         + put(face(mood, ex=10, ey=0, eye_r=3.6, mouth_y=11), 0, -34))
    return anim('hop', c)


def jara():
    return ds.turtle('happy').replace('#7DB86A', '#9A8F5B').replace('#5E9A50', '#7C7244').replace('#A8D58A', '#C9C99A')


def dung(mood='happy'):
    d = ('<ellipse cy="-14" rx="44" ry="16" fill="#8A5A3B"/><ellipse cy="-36" rx="32" ry="14" fill="#9C6B45"/>'
         '<ellipse cy="-54" rx="20" ry="11" fill="#A87448"/><path d="M0-62q6-12 14-14" stroke="#A87448" stroke-width="8" fill="none" stroke-linecap="round"/>'
         + put(face(mood, ex=11, ey=0, eye_r=3.6, mouth_y=10), 0, -32))
    return anim('bob', d)


def awl(mood='happy'):
    a = ('<path d="M-3 0L0 40L3 0Z" fill="#B8C1CA" transform="translate(0 -40)"/>'
         '<path d="M-2-2L0 0L2-2" fill="none"/>'
         '<rect x="-22" y="-120" width="44" height="80" rx="20" fill="#C98B4F"/>'
         '<path d="M-3-40L0 0L3-40Z" fill="#9AA6B2"/>'
         + put(face(mood, ex=8, ey=0, eye_r=3.4, mouth_y=10), 0, -88))
    return anim('bob', a)


def mat(mood='happy', rolled=True, inside=None):
    if rolled:
        m = ('<rect x="-90" y="-60" width="180" height="60" rx="14" fill="#D9B26B"/>'
             + ''.join(f'<path d="M{x}-58v56" stroke="#C49A54" stroke-width="4"/>' for x in range(-70, 90, 20))
             + '<ellipse cx="-90" cy="-30" rx="18" ry="30" fill="#C49A54"/><path d="M-90-30m-12 0a12 18 0 1 0 24 0a12 18 0 1 0-24 0" fill="none" stroke="#A8844A" stroke-width="3"/>'
             + (inside or '')
             + put(face(mood, ex=12, ey=0, eye_r=3.8, mouth_y=12), 30, -32))
    else:
        m = ('<path d="M-120 0l20-30h220l-20 30z" fill="#D9B26B"/>'
             + ''.join(f'<path d="M{x}-28l-14 26" stroke="#C49A54" stroke-width="4"/>' for x in range(-90, 120, 22))
             + put(face(mood, ex=12, ey=0, eye_r=3.8, mouth_y=12), 0, -14))
    return anim('bob', m)


def jige(mood='happy', load=None):
    j = ('<path d="M-30 0L-20-150M30 0L20-150" stroke="#9C6B45" stroke-width="12" stroke-linecap="round"/>'
         '<path d="M-26-40h52M-24-80h48M-22-120h44" stroke="#9C6B45" stroke-width="9" stroke-linecap="round"/>'
         '<path d="M-24-60l-40 10M24-60l40 10" stroke="#9C6B45" stroke-width="9" stroke-linecap="round"/>'
         + (load or '')
         + put('<circle r="22" fill="#E9C9A0"/>' + face(mood, ex=8, ey=0, eye_r=3.4, mouth_y=9), 0, -100))
    return anim('bob', j)


def squirrel(flag=True):
    s = ('<path d="M20-20C70-30 80-110 40-130C60-100 40-70 14-60Z" fill="#B9774A"/>'
         '<ellipse cy="-40" rx="24" ry="30" fill="#C98552"/><ellipse cy="-34" rx="14" ry="20" fill="#F3D9B1"/>'
         '<circle cy="-86" r="22" fill="#C98552"/><path d="M-16-102l-4-18l14 10zM16-102l4-18l-14 10z" fill="#C98552"/>'
         + put(face('happy', ex=8, ey=0, eye_r=3.4, mouth_y=10), 0, -86))
    if flag:
        s += anim('sway', '<path d="M-20-60L-40-160" stroke="#8A5A3B" stroke-width="5" stroke-linecap="round"/><path d="M-40-160l50 4l-8 30l-46-6z" fill="#E4573D"/>')
    return anim('hop', s)


def sun_face(mood='happy', r=70):
    rays = ''.join(f'<rect x="-7" y="{-r-38}" width="14" height="28" rx="7" fill="#FFC93C" transform="rotate({a})"/>' for a in range(0, 360, 30))
    return ('<circle r="{0}" fill="url(#glow)"/>'.format(r * 2.3)
            + anim('spin', rays) + anim('glow', f'<circle r="{r}" fill="#FFD66B"/>' + put(face(mood, ex=r * .26, ey=-4, eye_r=6, mouth_y=r * .3), 0, 0)))


def wind(mood='blow'):
    c = ('<path d="M-90 20a40 40 0 0 1 20-70a50 50 0 0 1 90-10a40 40 0 0 1 60 40a30 30 0 0 1-10 40Z" fill="#DCEBF7"/>'
         + put(face('determined' if mood == 'blow' else mood, ex=16, ey=0, eye_r=5, mouth_y=24), 0, -6))
    if mood == 'blow':
        c += ('<circle cx="-34" cy="12" r="16" fill="#C2DCF2"/><circle cx="34" cy="12" r="16" fill="#C2DCF2"/>'
              '<circle cx="60" cy="18" r="9" fill="#9DBBD8"/>')
    return anim('puff', c)


# ---------- 사람 변형 ----------
LUMP = (f'<circle cx="30" cy="-166" r="20" fill="{SKIN}" stroke="#E9A982" stroke-width="3"/>'
        '<circle cx="34" cy="-162" r="9" fill="#FF9AA8" opacity=".45"/><path d="M22-176q6-5 12-2" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/>')
LUMP_L = LUMP.replace('cx="30"', 'cx="-30"').replace('cx="34"', 'cx="-26"').replace('M22-176', 'M-38-176')
MUSTACHE = '<path d="M-16-178q8-8 16 0q8-8 16 0" stroke="#3B3036" stroke-width="5" fill="none" stroke-linecap="round"/>'
MUSTACHE_W = MUSTACHE.replace('#3B3036', '#DCDAE2')


def old_man(mood='happy', greedy=False, lumps=0, pose='down'):
    """혹부리 영감·욕심쟁이 할아버지 등. 흰머리 할아버지 모양."""
    g = recolor(woodcutter(pose, mood), {'#3B3036': '#DCDAE2', '#A8784E': '#C9574A' if greedy else '#7E9CC0'})
    extra = (MUSTACHE_W if greedy else '') + (LUMP if lumps >= 1 else '') + (LUMP_L if lumps >= 2 else '')
    return g + extra


def farmer(elder=True, pose='down', mood='happy', load=False):
    """의좋은 형제. 형은 남색, 아우는 초록 저고리."""
    g = recolor(woodcutter(pose, mood), {'#A8784E': '#7E8FB8' if elder else '#8FB98A'})
    if elder:
        g += MUSTACHE
    if load:
        g = rice_bundle(-34, -120, .9, rot=-20) + rice_bundle(34, -120, .9, rot=20) + g
    return g


def heungbu(mood='happy', pose='down'):
    g = recolor(woodcutter(pose, mood), {'#A8784E': '#B9A27E'})
    patches = ('<rect x="-30" y="-130" width="14" height="14" fill="#8FB98A" transform="rotate(10 -23 -123)"/>'
               '<rect x="14" y="-108" width="14" height="12" fill="#E4738A" transform="rotate(-8 21 -102)"/>'
               '<rect x="-24" y="-46" width="14" height="14" fill="#7FB8E6"/>')
    return g + patches


def nolbu(mood='smug', pose='down'):
    g = recolor(woodcutter(pose, mood), {'#A8784E': '#6B5B95', '#EFE6D2': '#E9E2F2'})
    belly = '<ellipse cx="0" cy="-100" rx="54" ry="44" fill="#6B5B95"/><rect x="-54" y="-90" width="108" height="10" rx="5" fill="#E9C46A"/>'
    hat = ('<ellipse cy="-222" rx="62" ry="10" fill="#2B2730" opacity=".92"/>'
           '<path d="M-24-222v-30q24-8 48 0v30z" fill="#2B2730" opacity=".92"/>')
    return g + belly + MUSTACHE + hat


def traveler(coat=True, pose='walk', mood='calm'):
    """해님과 바람의 나그네. 외투와 둥근 모자."""
    C = '#9C6B45'
    legs = ('<path d="M-30-2L-26-70h52L30-2" fill="#5F6E8A"/>'
            '<ellipse cx="-18" cy="-3" rx="15" ry="7" fill="#4E3526"/><ellipse cx="18" cy="-3" rx="15" ry="7" fill="#4E3526"/>')
    if coat:
        body = f'<path d="M-50-30C-52-110-32-160 0-160S52-110 50-30Z" fill="{C}"/><path d="M0-158V-30" stroke="#7A5232" stroke-width="4"/>'
        body += ''.join(f'<circle cx="8" cy="{y}" r="4" fill="#E9C46A"/>' for y in (-130, -104, -78, -52))
        if pose == 'hold':
            arms = f'<path d="M-36-140Q-10-120 10-120M36-140Q10-110-10-110" stroke="{C}" stroke-width="20" fill="none" stroke-linecap="round"/>'
        elif pose == 'open':
            body = (f'<path d="M-50-30C-52-110-32-160 0-160S52-110 50-30Z" fill="#7FB8E6"/>'
                    f'<path d="M-50-30C-52-110-32-160-6-160L-14-30Z" fill="{C}"/><path d="M50-30C52-110 32-160 6-160L14-30Z" fill="{C}"/>')
            arms = f'<path d="M-36-140Q-56-110-50-86M36-140Q56-110 50-86" stroke="{C}" stroke-width="20" fill="none" stroke-linecap="round"/>'
        else:
            arms = f'<path d="M-36-140Q-56-110-50-86M36-140Q56-110 50-86" stroke="{C}" stroke-width="20" fill="none" stroke-linecap="round"/>'
    else:
        body = '<path d="M-44-60C-44-130-26-160 0-160S44-130 44-60Z" fill="#7FB8E6"/>'
        arms = (f'<path d="M-36-140Q-58-150-58-180" stroke="#7FB8E6" stroke-width="18" fill="none" stroke-linecap="round"/><circle cx="-58" cy="-186" r="10" fill="{SKIN}"/>'
                f'<path d="M36-140Q56-110 50-86" stroke="#7FB8E6" stroke-width="18" fill="none" stroke-linecap="round"/>'
                f'<path d="M30-110C60-110 70-60 60-20H40C44-60 40-90 30-110Z" fill="{C}"/>')
    head = (f'<circle cy="-192" r="30" fill="{SKIN}"/>'
            '<ellipse cy="-214" rx="46" ry="10" fill="#C9A37A"/><path d="M-26-214q0-30 26-30t26 30z" fill="#B48A55"/>'
            + put(face(mood, ex=11, ey=0, mouth_y=14), 0, -190))
    return anim('bob', legs + body + arms + head)


def red_hood(mood='happy', pose='down', basket_=True):
    g = kid(False, pose, mood)
    hood = ('<path d="M-30-104C-34-150 34-150 30-104C34-90 30-76 22-70H-22C-30-76-34-90-30-104Z" fill="#E4573D"/>'
            '<path d="M-28-60C-36-40-40-10-34 0H34C40-10 36-40 28-60Z" fill="#D9493E" opacity=".95"/>')
    face_ = put(face(mood, ex=8, ey=0, eye_r=3.6, mouth_y=11), 0, -106)
    skin = f'<circle cy="-106" r="19" fill="{SKIN}"/>'
    b = basket(34, -36, .55) if basket_ else ''
    return anim('bob', g + hood + skin + face_ + '<path d="M-16-122q16-12 32 0" stroke="#2E2A33" stroke-width="6" fill="none" stroke-linecap="round"/>') + b


def hunter(mood='calm', pose='down'):
    g = recolor(woodcutter(pose, mood), {'#A8784E': '#6E9A5C'})
    hat = ('<ellipse cy="-222" rx="44" ry="9" fill="#5A7A4A"/><path d="M-26-222q0-28 26-28t26 28z" fill="#5A7A4A"/>'
           '<path d="M18-246l18-16" stroke="#E4573D" stroke-width="5" stroke-linecap="round"/>')
    return g + hat


def shepherd(mood='happy', pose='down'):
    g = kid(True, pose, mood)
    staff = '<path d="M40 0V-150q0-24 20-20" stroke="#9C6B45" stroke-width="7" fill="none" stroke-linecap="round"/>'
    return staff + g


def villager(woman=False, mood='determined'):
    if woman:
        return recolor(mom('down', mood), {'#E4738A': '#8FB98A', '#D05E77': '#6FA06A'}) + put('<path d="M50-60V-200" stroke="#9C6B45" stroke-width="10" stroke-linecap="round"/>', 0, 0)
    return woodcutter('cheer', mood) + '<path d="M56-214l14-60" stroke="#9C6B45" stroke-width="10" stroke-linecap="round"/>'


# ---------- 지은 이야기용 소품 (글에 나오면 그림에 넣어요) ----------
def fish(color='#F2A33C'):
    f = (f'<path d="M-30 0C-18-18 18-18 30 0C18 18-18 18-30 0Z" fill="{color}"/>'
         f'<path d="M28 0l20-14v28z" fill="{color}"/><circle cx="-16" cy="-3" r="4" fill="#FFFFFF"/><circle cx="-16" cy="-3" r="2" fill="{INK}"/>'
         '<path d="M-4-10q6 10 0 20M6-10q6 10 0 20" stroke="#FFFFFF" stroke-width="3" fill="none" opacity=".6"/>')
    return anim('bob', f)


def boat():
    return anim('bob', '<path d="M-110-30h220l-34 40h-152z" fill="#B07440"/><path d="M-110-30h220" stroke="#8A5A3B" stroke-width="8"/>'
                '<path d="M0-30V-150" stroke="#8A5A3B" stroke-width="7"/><path d="M6-146l70 90H6z" fill="#FFF6E6"/>')


def umbrella(color='#7FB8E6'):
    return ('<path d="M0 0V-110" stroke="#5A4A3A" stroke-width="5"/><path d="M0 0q0 14 12 14" stroke="#5A4A3A" stroke-width="5" fill="none"/>'
            f'<path d="M-80-108C-80-170 80-170 80-108q-20-14-40 0q-20-14-40 0q-20-14-40 0q-20-14-40 0Z" fill="{color}"/>'
            '<path d="M-40-108q0-50 40-56q40 6 40 56" stroke="#FFFFFF" stroke-width="3" fill="none" opacity=".5"/>')


def kite():
    return anim('float', '<path d="M0-60L40 0L0 60L-40 0Z" fill="#E4573D"/><path d="M0-60V60M-40 0H40" stroke="#FFF6E6" stroke-width="4"/>'
                '<path d="M0 60q-14 20 0 40t0 40" stroke="#FFC93C" stroke-width="4" fill="none"/>')


def cake():
    return ('<rect x="-60" y="-50" width="120" height="50" rx="10" fill="#FFF1D6"/><path d="M-60-34q15 10 30 0t30 0 30 0 30 0" stroke="#FF9AA8" stroke-width="8" fill="none"/>'
            '<rect x="-70" y="-4" width="140" height="10" rx="5" fill="#E5DCCB"/>'
            + ''.join(f'<rect x="{x - 3}" y="-74" width="6" height="24" rx="3" fill="{c}"/>'
                      + anim('glow', f'<ellipse cx="{x}" cy="-80" rx="5" ry="8" fill="#FFC93C"/>') for x, c in ((-30, '#7FB8E6'), (0, '#E4573D'), (30, '#8CCB8A')))
            + '<circle cx="-40" cy="-56" r="5" fill="#E4573D"/><circle cx="40" cy="-56" r="5" fill="#E4573D"/>')


def book():
    return ('<path d="M-60 0C-40-10-12-10 0 0C12-10 40-10 60 0V-50C40-60 12-60 0-50C-12-60-40-60-60-50Z" fill="#FFFFFF" stroke="#E0D2B4" stroke-width="3"/>'
            '<path d="M0-50V0" stroke="#E0D2B4" stroke-width="3"/><path d="M-48-36h36M-48-24h32M12-36h36M12-24h32" stroke="#E9DEC6" stroke-width="4" stroke-linecap="round"/>')


def letter():
    return anim('float', '<rect x="-46" y="-32" width="92" height="64" rx="8" fill="#FFFFFF" stroke="#E0D2B4" stroke-width="3"/>'
                '<path d="M-46-30L0 6L46-30" stroke="#E0D2B4" stroke-width="3" fill="none"/>'
                '<path d="M0 18C-10 10-9 2 0 6C9 2 10 10 0 18Z" fill="#FF8FA3"/>')


def rainbow():
    return anim('glow', ''.join(f'<path d="M-300 0A300 300 0 0 1 300 0" stroke="{c}" stroke-width="18" fill="none" transform="scale({1 - i * .06})"/>'
                                for i, c in enumerate(('#FF9AA8', '#FFC93C', '#FFE27A', '#A8D58A', '#7FB8E6', '#B9A7E8'))))


def rain():
    drops = ''.join(put(anim('snow', '<path d="M0 0l-6 18" stroke="#7FB8E6" stroke-width="4" stroke-linecap="round" opacity=".8"/>', -i * .45), x, y)
                    for i, (x, y) in enumerate(((40, 40), (130, 110), (220, 30), (300, 150), (390, 60), (470, 130), (560, 40), (640, 120),
                                                (730, 60), (90, 230), (260, 260), (440, 230), (610, 250), (760, 220))))
    return '<rect width="800" height="600" fill="#5B6BB5" opacity=".08"/>' + drops


def full_moon(r=50):
    return (f'<circle r="{r*2.6}" fill="url(#moonglow)"/>'
            + anim('glow', f'<circle r="{r}" fill="#FFF1B8"/><circle cx="-16" cy="14" r="8" fill="#F2E3A0"/><circle cx="18" cy="-18" r="6" fill="#F2E3A0"/>'))


def sea_bg():
    d = grad('sky', [(0, '#BFE4FF'), (.6, '#FFF4D6')])
    waves = ''.join(anim('drift', f'<path d="M{-40 + i * 20} {y}q30-12 60 0t60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0" stroke="#FFFFFF" stroke-width="5" fill="none" opacity=".7"/>', -i * 2)
                    for i, y in enumerate((420, 460, 500)))
    b = ('<rect width="800" height="600" fill="url(#sky)"/>'
         '<path d="M0 380H800V600H0Z" fill="#6EC3EC"/><path d="M0 380H800V400H0Z" fill="#8FD3F2"/>' + waves
         + '<path d="M0 540C200 520 500 520 800 545V600H0Z" fill="#F3DFB4"/>')
    return d + GLOW, b


_bg2_orig = bg2


def bg2(kind):
    if kind == 'sea':
        return sea_bg()
    return _bg2_orig(kind)


def snowman():
    return anim('bob', '<circle cy="-44" r="44" fill="#FFFFFF" stroke="#DDE7F3" stroke-width="3"/><circle cy="-116" r="32" fill="#FFFFFF" stroke="#DDE7F3" stroke-width="3"/>'
                '<path d="M-40-70l-40-30M40-70l40-34" stroke="#8A5A3B" stroke-width="5" stroke-linecap="round"/>'
                '<path d="M-30-92q30 14 60 0v12q-30 14-60 0z" fill="#E4573D"/><rect x="14" y="-90" width="12" height="30" rx="5" fill="#E4573D"/>'
                '<rect x="-24" y="-176" width="48" height="30" rx="4" fill="#3A3436"/><rect x="-34" y="-150" width="68" height="8" rx="4" fill="#3A3436"/>'
                f'<circle cx="-10" cy="-122" r="4" fill="{INK}"/><circle cx="10" cy="-122" r="4" fill="{INK}"/><path d="M0-114l18 5-18 4z" fill="#F2A33C"/>'
                f'<path d="M-10-104q10 7 20 0" stroke="{INK}" stroke-width="3" fill="none" stroke-linecap="round"/>'
                f'<circle cy="-56" r="4" fill="{INK}"/><circle cy="-36" r="4" fill="{INK}"/>')
