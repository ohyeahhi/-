"""동화 그림 전체를 만들어요.

    python3 tools/build_images.py

- draw_scenes.py : 그림체, 배경, 처음 만든 캐릭터(엄마·오누이·호랑이·토끼·거북이·나무꾼·산신령…)
- parts2.py      : 새 동화 캐릭터(도깨비·늑대·돼지·양·개미·베짱이·제비…)와 소품
- 이 파일        : 동화별 쪽 장면 (img/<동화id>-<쪽번호>.svg) + 앱용 부품(img/parts.js)
"""
import draw_scenes as ds
import parts2 as P
import parts3 as Q
from draw_scenes import (put, anim, shadow, cloud, birds, stars, stars_colored, sun, moon, pine, night_pine,
                         round_tree, tuft, flower, butterfly, house, pond, ripples, bubbles, mom, kid, tiger,
                         rabbit, turtle, woodcutter, sinseon, axe, face)

# ---------- 예전 장면 가져오기 ----------
# draw_scenes.build() 가 만들던 장면을 파일로 쓰지 않고 받아 두었다가, 새 쪽 번호에 다시 배치해요.
OLD = {}
ds.page = lambda name, title, kind, body: OLD.__setitem__(name, (title, kind, body))
ds.build()

PAGES = {}


def add(story, n, title, kind, body):
    PAGES[f'{story}-{n}'] = (f'{title}', kind, body)


def reuse(story, n, old):
    PAGES[f'{story}-{n}'] = OLD[old]


def day_sky(sun_x=None):
    # 'day' 배경에는 해가 이미 있어서, 해는 들판·숲 배경에서만 따로 그려요.
    return (sun(sun_x, 100, 44) if sun_x else '') + cloud(80, 90) + cloud(430, 60, .8, delay=-5) + birds(250, 140)


def night_sky(moon_x=660):
    return moon(moon_x, 96) + stars([(80, 70, 7), (200, 130, 5), (330, 60, 6), (470, 110, 5), (560, 60, 6), (760, 180, 6)])


def full_moon(x, y, r=56, smile=False):
    m = (f'<circle r="{r*2.6}" fill="url(#moonglow)"/>'
         + anim('glow', f'<circle r="{r}" fill="#FFF1B8"/><circle cx="-18" cy="16" r="9" fill="#F2E3A0"/><circle cx="20" cy="-20" r="7" fill="#F2E3A0"/>'
                + (put(face('happy', ex=18, ey=0, eye_r=5, mouth_y=20), 0, 0) if smile else '')))
    return put(m, x, y)


def ground_deco(*xs):
    return ''.join(flower(x, 545 + (i % 2) * 14, '#FFC4CF' if i % 3 == 1 else '#FFF6E6') if i % 2 == 0 else tuft(x, 560)
                   for i, x in enumerate(xs))


def question(x, y, color='#5B6BB5'):
    return put(anim('float', f'<text x="0" y="0" font-family="sans-serif" font-weight="800" font-size="44" fill="{color}">?</text>'), x, y)


def zz(x, y):
    return ''.join(anim('rise', f'<text x="{x + dx}" y="{y + dy}" font-family="sans-serif" font-weight="700" font-size="{s}" fill="#5B6BB5">z</text>', d)
                   for dx, dy, s, d in ((0, 0, 30, 0), (20, -20, 24, -1.2), (36, -38, 18, -2.4)))


def hearts(x, y):
    return ''.join(put(anim('rise', '<path d="M0 6C-14-4-12-18 0-12C12-18 14-4 0 6Z" fill="#FF8FA3"/>', -n * 1.1), x + dx, y + dy)
                   for n, (dx, dy) in enumerate(((-30, 0), (20, -20), (0, -40))))


def who(svg, x, y=505, s=1, flip=False, sh=60):
    return shadow(x, y + 2, sh * s) + put(svg, x, y, s, flip)


ROAD = '<path d="M330 600C360 540 420 500 520 470S700 445 800 446V472C700 472 612 480 546 502S420 566 410 600Z" fill="#EDD39E"/>'
PATH_LR = '<path d="M0 540C220 520 520 500 800 480V510C520 530 220 560 0 580Z" fill="#EDD39E"/>'


# ===== 해님 달님 =====
S = 'sun-moon'
reuse(S, 1, 'sun-moon-1')
reuse(S, 2, 'sun-moon-2')
add(S, 3, '해님 달님 3: 떡을 다 먹어 치운 호랑이', 'dusk',
    cloud(90, 120) + birds(300, 150) + ROAD + pine(70, 452, 1.05) + pine(748, 440, .95)
    + P.basket(300, 520, 1.2, full=False)
    + ''.join(f'<ellipse cx="{x}" cy="{y}" rx="9" ry="6" fill="#FFFDF6" stroke="#EADFC8" stroke-width="2"/>' for x, y in ((360, 540), (390, 528), (240, 548)))
    + who(tiger('sit', 'grin', look=(-6, 2)), 520, 505, .95, sh=100) + ground_deco(120, 200, 690))
reuse(S, 4, 'sun-moon-3')
paw = ('<g transform="translate(390 400) rotate(-20)"><rect x="-60" y="-14" width="70" height="28" rx="14" fill="#F59A45"/>'
       f'<path d="M-40-14v28M-22-14v28" stroke="{ds.INK}" stroke-width="5"/><circle cx="14" r="18" fill="#FFE7C7"/></g>')
tail = (f'<path d="M560 470C620 470 640 420 610 396C600 388 616 374 628 386" stroke="#F29440" stroke-width="18" fill="none" stroke-linecap="round"/>'
        f'<path d="M590 466l12-8M618 430l14 2" stroke="{ds.INK}" stroke-width="5" stroke-linecap="round"/>')
add(S, 5, '해님 달님 5: 문틈으로 들어온 털 숭숭 난 손', 'night',
    night_sky() + night_pine(60, 470, 1) + house(330, 470, 1.05, night=True) + anim('paw', paw) + anim('wag', tail)
    + put(kid(True, 'down', 'shock'), 230, 418, .55) + put(kid(False, 'down', 'shock'), 432, 418, .55)
    + stars_colored([(450, 360, 12)], '#E4573D'))
reuse(S, 6, 'sun-moon-4')
oil = ''.join(put(anim('rise', '<path d="M0 0q5 8 0 12q-5-4 0-12z" fill="#E9B44C"/>', -i), 400 + i * 14, 440 + i * 20) for i in range(3))
add(S, 7, '해님 달님 7: 참기름 바르고 주르륵 미끄러진 호랑이', 'night',
    moon(120, 96) + stars([(300, 60, 6), (560, 80, 5), (700, 150, 7)]) + night_pine(720, 470, 1)
    + round_tree(420, 520, 1.15, night=True)
    + put(kid(True, 'down', 'happy'), 370, 300, .7) + put(kid(False, 'down', 'happy'), 460, 296, .68)
    + oil + put(tiger('climb', 'surprised', look=(0, -4)), 330, 520, .78, rot=-14) + P.oil_bottle(210, 540, 1.3))
reuse(S, 8, 'sun-moon-5')
rope_top = ('<path d="M400 0C396 60 404 120 400 170" stroke="#C98B4F" stroke-width="9" fill="none" stroke-dasharray="12 5"/>')
add(S, 9, '해님 달님 9: 하늘로 올라간 오누이, 썩은 동아줄', 'night',
    stars([(80, 70, 7), (200, 140, 5), (620, 60, 6), (720, 140, 6)]) + cloud(260, 10, 1.2, '#E8E6F5') + cloud(470, 20, 1.1, '#E8E6F5', delay=-6)
    + rope_top + put(kid(True, 'up', 'happy'), 386, 300, .55) + put(kid(False, 'up', 'happy'), 418, 318, .52)
    + P.sorghum(560, 600, 1.1) + P.sorghum(700, 600, .9)
    + put(anim('fall', tiger('sit', 'surprised', look=(0, -6))), 560, 420, .45, rot=160)
    + '<path d="M600 250q8 30-4 50" stroke="#8A6A4A" stroke-width="7" fill="none" stroke-dasharray="8 6"/>')
reuse(S, 10, 'sun-moon-6')

# ===== 토끼와 거북이 =====
S = 'rabbit-turtle'
reuse(S, 1, 'rabbit-turtle-1')
add(S, 2, '토끼와 거북이 2: 바위 위에서 뽐내는 토끼', 'meadow',
    day_sky(660) + round_tree(90, 470, .85) + P.rock(400, 520, 1.3)
    + put(rabbit('point', 'smug'), 400, 420, 1.25) + stars_colored([(330, 230, 14), (500, 200, 12), (470, 300, 9)], '#FFE27A')
    + butterfly(620, 300) + ground_deco(160, 250, 640, 720))
reuse(S, 3, 'rabbit-turtle-2')
add(S, 4, '토끼와 거북이 4: 우리 달리기 시합 해 볼래?', 'meadow',
    day_sky() + round_tree(720, 440, .6)
    + shadow(270, 528, 64) + anim('hop', put(rabbit('stand', 'happy'), 270, 524, 1.35))
    + who(turtle('determined'), 540, 524, 1.4, flip=True, sh=70) + ground_deco(120, 400, 660))
startline = '<path d="M60 560L740 520" stroke="#FFFFFF" stroke-width="10" stroke-dasharray="26 14"/>'
add(S, 5, '토끼와 거북이 5: 준비, 출발!', 'meadow',
    cloud(120, 80) + birds(560, 120) + startline
    + who(rabbit('stand', 'calm'), 230, 530, 1.15, sh=56) + who(turtle('determined', band=True), 560, 520, 1.15, sh=70)
    + who(P.squirrel(), 400, 470, 1.1, sh=30) + butterfly(680, 300) + butterfly(120, 330, '#FFD66B'))
reuse(S, 6, 'rabbit-turtle-3')
reuse(S, 7, 'rabbit-turtle-4')
reuse(S, 8, 'rabbit-turtle-5')
flag = put('<rect x="-3" y="-90" width="6" height="90" fill="#8A5A3B"/>' + anim('sway', '<path d="M3-90h40v28H3z" fill="#FFFFFF"/><path d="M3-90h10v7H3zM23-90h10v7H23zM13-83h10v7H13zM33-83h10v7H33zM3-76h10v7H3zM23-76h10v7H23z" fill="#3A2A22"/>'), 690, 400)
add(S, 9, '토끼와 거북이 9: 허둥지둥 달려가는 토끼', 'dusk',
    '<path d="M0 560C250 520 500 460 800 400V430C520 490 260 560 0 600Z" fill="#EDD39E"/>' + flag
    + put(turtle('happy', band=True), 650, 412, .5)
    + ''.join(anim('drift', f'<path d="M{x} {y}h{w}" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>', -n) for n, (x, y, w) in enumerate(((90, 430, 70), (70, 460, 90), (100, 490, 60))))
    + shadow(280, 540, 56) + anim('hop', put(rabbit('run', 'shock'), 280, 530, 1.1, rot=12)))
reuse(S, 10, 'rabbit-turtle-6')

# ===== 금도끼 은도끼 =====
S = 'golden-axe'
logs = put('<rect x="-70" y="-24" width="140" height="24" rx="12" fill="#B07440"/><circle cx="70" cy="-12" r="12" fill="#E9C9A0"/>'
           '<rect x="-60" y="-48" width="120" height="24" rx="12" fill="#C98B4F"/><circle cx="60" cy="-36" r="12" fill="#F0D6B0"/>', 0, 0)
add(S, 1, '금도끼 은도끼 1: 어머니를 모시고 사는 나무꾼', 'day',
    day_sky() + pine(740, 460, 1) + house(560, 470, .95)
    + who(woodcutter('down', 'happy'), 220, 505, .95) + who(ds.grandma('happy'), 380, 505, .9)
    + put(logs, 130, 560, .8) + ground_deco(300, 470, 700))
reuse(S, 2, 'golden-axe-1')
reuse(S, 3, 'golden-axe-2')
add(S, 4, '금도끼 은도끼 4: 엉엉 우는 나무꾼', 'forest',
    cloud(560, 80) + pine(60, 440, .9) + pine(740, 436, .9, delay=-2) + pond(500, 486, 220, 64) + ripples(500, 480)
    + who(woodcutter('cry', 'cry'), 220, 518, 1))
reuse(S, 5, 'golden-axe-3')
reuse(S, 6, 'golden-axe-4')
add(S, 7, '금도끼 은도끼 7: 그럼 이 은도끼가 네 도끼냐?', 'forest',
    pine(60, 440, .9) + pine(740, 436, .9, delay=-2) + pond(480, 486, 230, 66)
    + put(sinseon(hold='silver'), 480, 470, .95) + stars_colored([(600, 220, 14), (650, 290, 10)], '#FFFFFF')
    + who(woodcutter('no', 'calm'), 160, 518, 1))
reuse(S, 8, 'golden-axe-5')
greedy = P.recolor(woodcutter('reach', 'smug'), {'#A8784E': '#C9574A'}) + P.MUSTACHE
add(S, 9, '금도끼 은도끼 9: 거짓말한 욕심쟁이 이웃', 'forest',
    pine(60, 440, .9) + pine(740, 436, .9, delay=-2) + pond(500, 486, 220, 64)
    + put(anim('twinkle', sinseon(hold='gold')), 500, 470, .9) + who(greedy, 180, 518, 1)
    + stars_colored([(300, 250, 12)], '#E4573D'))
reuse(S, 10, 'golden-axe-6')

# ===== 팥죽 할멈과 호랑이 =====
S = 'patjuk'
beans = ''.join(put('<circle cx="-12" cy="-10" r="14" fill="#6DAD68"/><circle cx="10" cy="-14" r="16" fill="#7DBE73"/><circle cx="0" cy="-26" r="12" fill="#5E9B5C"/>'
                    '<circle cx="-4" cy="-12" r="3" fill="#8C3B3B"/><circle cx="8" cy="-20" r="3" fill="#8C3B3B"/>', x, y)
                for x, y in ((80, 540), (150, 560), (220, 540), (640, 560), (710, 540), (760, 566), (110, 580), (690, 590)))
add(S, 1, '팥죽 할멈과 호랑이 1: 팥죽을 잘 쑤는 할머니', 'day',
    day_sky() + house(560, 470, .95) + beans + who(ds.grandma('happy'), 300, 505, .95) + P.bowl(400, 540, 1))
add(S, 2, '팥죽 할멈과 호랑이 2: 팥밭에 나타난 호랑이', 'meadow',
    cloud(120, 80) + pine(740, 440, .9) + beans + who(ds.grandma('shock'), 240, 505, .95)
    + who(tiger('reach', 'grin', look=(-6, 2)), 540, 505, .9, sh=100) + stars_colored([(170, 230, 12), (330, 220, 10)], '#E4573D'))
add(S, 3, '팥죽 할멈과 호랑이 3: 동짓날 밤에 오너라', 'dusk',
    cloud(90, 120) + pine(70, 452, 1.05) + beans + who(ds.grandma('calm'), 250, 505, .95)
    + who(tiger('sit', 'grin', look=(5, 2)), 560, 505, .85, flip=True, sh=100) + P.bowl(400, 540, .9))
add(S, 4, '팥죽 할멈과 호랑이 4: 팥죽을 쑤며 우는 할머니', 'kitchen',
    P.cauldron(540, 470, 1.1) + who(ds.grandma('cry'), 260, 505, .95))
add(S, 5, '팥죽 할멈과 호랑이 5: 데굴데굴 굴러온 알밤', 'kitchen',
    P.cauldron(580, 470, 1) + who(ds.grandma('calm'), 220, 505, .95) + who(P.chestnut('happy'), 390, 510, 1.1, sh=40) + P.bowl(460, 540, .8))
add(S, 6, '팥죽 할멈과 호랑이 6: 차례차례 찾아온 친구들', 'kitchen',
    who(P.jara(), 110, 525, 1, sh=60) + who(P.dung(), 255, 525, 1.35, sh=56) + who(P.awl(), 375, 525, 1.35, sh=30)
    + who(P.mat(), 530, 525, 1.05, sh=90) + who(P.jige(), 700, 525, 1.15, sh=50)
    + P.bowl(160, 572, .6) + P.bowl(300, 572, .6) + P.bowl(420, 572, .6) + P.bowl(600, 572, .6) + P.bowl(730, 572, .6))
add(S, 7, '팥죽 할멈과 호랑이 7: 아궁이에서 튀어 오른 알밤', 'kitchen',
    '<rect width="800" height="600" fill="#1F2753" opacity=".35"/>' + P.cauldron(230, 470, 1)
    + put(anim('hop', P.chestnut('determined')), 360, 380, .9)
    + who(tiger('sit', 'surprised', look=(-6, 0)), 560, 505, .9, sh=100) + stars_colored([(470, 260, 14), (440, 300, 10)], '#FFE27A'))
slip = '<path d="M560 560q30-10 60 0" stroke="#FFFFFF" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>'
add(S, 8, '팥죽 할멈과 호랑이 8: 손을 꽉 문 자라, 쭉 미끄러지는 쇠똥', 'kitchen',
    P.jar(200, 510, 1.2) + put(P.jara(), 200, 400, .55) + who(tiger('reach', 'surprised', look=(-6, 0)), 420, 505, .85, sh=100)
    + who(P.dung('happy'), 620, 540, .9, sh=40) + slip + stars_colored([(280, 300, 12)], '#E4573D'))
mat_tiger = P.mat('happy', inside=put(tiger('sit', 'surprised'), -96, -6, .22))
add(S, 9, '팥죽 할멈과 호랑이 9: 멍석에 말려 강가로', 'night',
    night_sky(120) + pond(640, 520, 160, 50, night=True)
    + who(P.awl('determined'), 160, 520, 1.1, sh=26)
    + put(P.jige('determined', load=put(mat_tiger, 0, -150, .9)), 400, 530, 1.4))
add(S, 10, '팥죽 할멈과 호랑이 10: 함께 나누어 먹는 팥죽', 'kitchen',
    who(P.chestnut(), 140, 525, 1.3, sh=44) + who(P.dung(), 265, 530, 1.2, sh=50) + who(ds.grandma('happy'), 400, 505, .9)
    + who(P.jara(), 545, 530, .9, sh=56) + who(P.awl(), 670, 530, 1.25, sh=28)
    + P.bowl(320, 575, .7) + P.bowl(470, 575, .7) + hearts(400, 220))

# ===== 의좋은 형제 =====
S = 'brothers'
seedlings = ''.join(put('<path d="M0 0q-6-14-2-24M0 0q6-14 2-24M0 0V-26" stroke="#6DAD68" stroke-width="4" fill="none" stroke-linecap="round"/>', x, y)
                    for y in (520, 556, 592) for x in range(40, 800, 70))
paddy_water = '<path d="M0 480C150 470 300 474 420 486S680 476 800 470V600H0Z" fill="#A8D8E8" opacity=".55"/>'
add(S, 1, '의좋은 형제 1: 함께 벼를 가꾸는 형과 아우', 'day',
    day_sky() + paddy_water + seedlings + who(P.farmer(True, 'down', 'happy'), 300, 505, .9) + who(P.farmer(False, 'down', 'happy'), 500, 505, .9))
add(S, 2, '의좋은 형제 2: 똑같이 나눈 볏단', 'paddy',
    day_sky() + P.rice_stack(170, 520, 5, .9) + P.rice_stack(630, 520, 5, .9)
    + who(P.farmer(True, 'cheer', 'happy'), 340, 505, .85) + who(P.farmer(False, 'cheer', 'happy'), 460, 505, .85))
add(S, 3, '의좋은 형제 3: 몰래 볏단을 나르는 형', 'paddy_night',
    night_sky() + P.rice_stack(130, 520, 5, .8) + P.rice_stack(680, 520, 5, .8) + who(P.farmer(True, 'down', 'calm', load=True), 400, 505, .9))
add(S, 4, '의좋은 형제 4: 몰래 볏단을 나르는 아우', 'paddy_night',
    night_sky(140) + P.rice_stack(130, 520, 5, .8) + P.rice_stack(680, 520, 5, .8) + who(P.farmer(False, 'down', 'calm', load=True), 420, 505, .9, flip=True))
add(S, 5, '의좋은 형제 5: 볏단이 줄지 않았네?', 'paddy',
    day_sky() + P.rice_stack(460, 520, 5, 1) + who(P.farmer(True, 'down', 'calm'), 250, 505, .95) + question(310, 230) + question(560, 220, '#E4573D'))
add(S, 6, '의좋은 형제 6: 밤마다 볏단을 나르는 형제', 'paddy_night',
    night_sky(400) + who(P.farmer(True, 'down', 'calm', load=True), 180, 505, .8) + who(P.farmer(False, 'down', 'calm', load=True), 620, 505, .8, flip=True)
    + P.rice_stack(40, 540, 3, .6) + P.rice_stack(770, 540, 3, .6))
add(S, 7, '의좋은 형제 7: 보름달 아래에서 딱 마주친 형제', 'paddy_night',
    full_moon(400, 120) + stars([(80, 70, 7), (200, 130, 5), (620, 60, 6), (740, 160, 6)])
    + who(P.farmer(True, 'down', 'shock', load=True), 300, 505, .9) + who(P.farmer(False, 'down', 'shock', load=True), 500, 505, .9, flip=True))
add(S, 8, '의좋은 형제 8: 형님! 아우야!', 'paddy_night',
    full_moon(400, 120) + who(P.farmer(True, 'cheer', 'happy'), 320, 505, .9) + who(P.farmer(False, 'cheer', 'happy'), 480, 505, .9)
    + P.rice_bundle(200, 560, .8, rot=-70) + P.rice_bundle(600, 560, .8, rot=70) + stars_colored([(400, 260, 14)], '#FFE27A'))
add(S, 9, '의좋은 형제 9: 서로 꼭 끌어안은 형제', 'paddy_night',
    full_moon(400, 120, 60, smile=True) + who(P.farmer(True, 'bow', 'happy'), 360, 505, .9) + who(P.farmer(False, 'bow', 'happy'), 440, 505, .9, flip=True)
    + hearts(400, 250) + P.rice_bundle(180, 560, .8, rot=-70) + P.rice_bundle(620, 560, .8, rot=70))
add(S, 10, '의좋은 형제 10: 칭찬받는 의좋은 형제', 'paddy',
    day_sky() + house(640, 460, .7) + who(P.farmer(True, 'cheer', 'happy'), 300, 505, .85) + who(P.farmer(False, 'cheer', 'happy'), 420, 505, .85)
    + who(mom('down', 'happy'), 150, 515, .7) + who(kid(True, 'down', 'happy'), 530, 520, .8) + who(kid(False, 'down', 'happy'), 600, 520, .8)
    + stars_colored([(360, 220, 12), (250, 250, 9)], '#FFE27A'))

# ===== 젊어지는 샘물 =====
S = 'spring'
young_man = woodcutter('cheer', 'happy')
young_woman = mom('down', 'happy')
spring = pond(560, 500, 150, 46) + stars_colored([(520, 440, 10), (610, 430, 8)], '#FFFFFF')
woodload = put('<rect x="-50" y="-24" width="100" height="18" rx="9" fill="#B07440"/><rect x="-44" y="-42" width="88" height="18" rx="9" fill="#C98B4F"/>'
               '<rect x="-38" y="-60" width="76" height="18" rx="9" fill="#B07440"/>', 0, 0)
add(S, 1, '젊어지는 샘물 1: 착한 할아버지와 할머니', 'day',
    day_sky() + house(580, 470, .95) + who(P.old_man('happy'), 250, 505, .9) + who(ds.grandma('happy'), 390, 505, .9) + ground_deco(110, 470, 720))
add(S, 2, '젊어지는 샘물 2: 무거운 나뭇짐을 지고', 'forest',
    cloud(560, 80) + pine(80, 470, 1.1) + pine(720, 466, 1, delay=-2) + put(woodload, 380, 300, 1.2)
    + who(P.old_man('calm'), 400, 505, .95) + put(anim('rise', '<path d="M0 0q6 9 0 14q-6-5 0-14z" fill="#8FD0F2"/>'), 450, 290))
add(S, 3, '젊어지는 샘물 3: 파랑새를 따라가 찾은 샘물', 'forest',
    pine(60, 440, .9) + pine(740, 436, .9, delay=-2) + spring + put(P.bluebird(), 470, 250, 1.2) + who(P.old_man('shock'), 230, 515, .95))
add(S, 4, '젊어지는 샘물 4: 샘물을 마시고 스르르 잠든 할아버지', 'forest',
    pine(60, 440, .9) + pine(740, 436, .9, delay=-2) + spring + who(P.old_man('sleep'), 300, 515, .95) + zz(350, 270))
add(S, 5, '젊어지는 샘물 5: 젊은 총각이 된 할아버지', 'forest',
    pine(60, 440, .9) + pine(740, 436, .9, delay=-2) + spring + who(young_man, 290, 515, .95)
    + stars_colored([(220, 220, 14), (370, 200, 12), (300, 160, 9)], '#FFE27A'))
add(S, 6, '젊어지는 샘물 6: 새색시가 된 할머니', 'day',
    day_sky() + house(600, 470, .9) + who(young_man, 280, 505, .9) + who(young_woman, 420, 505, .9) + hearts(350, 230))
add(S, 7, '젊어지는 샘물 7: 샘물을 찾아간 욕심쟁이 할아버지', 'forest',
    pine(60, 440, .9) + spring + who(P.old_man('smug', greedy=True, pose='cheer'), 280, 515, .95))
add(S, 8, '젊어지는 샘물 8: 벌컥벌컥 쉬지 않고 마시는 욕심쟁이', 'dusk',
    pine(70, 452, 1.05) + pond(560, 500, 150, 46) + who(P.old_man('happy', greedy=True, pose='bow'), 360, 515, .95)
    + ''.join(put(anim('rise', '<circle r="6" fill="#8FD0F2"/>', -i * .8), 420 + i * 20, 330) for i in range(3)))
add(S, 9, '젊어지는 샘물 9: 아기가 된 욕심쟁이 할아버지', 'dusk',
    pond(560, 500, 150, 46) + who(P.baby('cry'), 430, 520, 1, sh=40)
    + who(young_man, 180, 515, .85) + who(young_woman, 290, 515, .85) + stars_colored([(430, 380, 12)], '#E4573D'))
add(S, 10, '젊어지는 샘물 10: 아기를 키우며 행복하게', 'day',
    day_sky() + house(600, 470, .9) + who(young_man, 260, 505, .9) + who(young_woman, 400, 505, .9)
    + put(P.baby('happy'), 400, 400, .6) + hearts(330, 230))

# ===== 흥부와 놀부 =====
S = 'heungbu'
add(S, 1, '흥부와 놀부 1: 쫓겨나는 흥부네 식구', 'day',
    day_sky() + house(580, 470, 1) + who(P.nolbu('smug', 'no'), 420, 505, .9)
    + who(P.heungbu('cry'), 200, 505, .85) + who(kid(True, 'down', 'cry'), 100, 520, .8))
add(S, 2, '흥부와 놀부 2: 가난해도 웃음 가득한 흥부네', 'day',
    day_sky() + P.straw_house(620, 480, 1) + who(P.heungbu('happy'), 220, 505, .85) + who(mom('down', 'happy'), 340, 505, .85)
    + who(kid(True, 'down', 'happy'), 440, 520, .8) + who(kid(False, 'down', 'happy'), 510, 520, .8))
add(S, 3, '흥부와 놀부 3: 다친 제비를 감싸 주는 흥부', 'day',
    cloud(120, 80) + P.straw_house(600, 480, 1) + P.nest(560, 330, 1) + who(P.heungbu('happy', 'bow'), 300, 505, .95)
    + put(P.swallow(bandage=True), 300, 392, .62) + hearts(300, 230))
add(S, 4, '흥부와 놀부 4: 박씨를 물어다 준 제비', 'meadow',
    day_sky(660) + put(P.swallow(), 440, 200, 1.1) + put(anim('fall', '<ellipse rx="8" ry="12" fill="#8A5A3B"/>'), 440, 270)
    + stars_colored([(470, 300, 10)], '#FFE27A') + who(P.heungbu('happy', 'cheer'), 330, 505, .95) + ground_deco(120, 600, 700))
add(S, 5, '흥부와 놀부 5: 슬근슬근 톱질하세', 'day',
    day_sky() + P.straw_house(640, 440, .8) + P.gourd(600, 300, .6) + P.gourd(690, 310, .5)
    + P.gourd(400, 520, 1.1) + P.saw(400, 400, .8) + who(P.heungbu('happy', 'cheer'), 200, 505, .9) + who(mom('down', 'happy'), 590, 515, .85))
add(S, 6, '흥부와 놀부 6: 박에서 쏟아진 금은보화', 'day',
    day_sky() + P.gourd(400, 530, 1.1, opened='treasure') + who(P.heungbu('happy', 'cheer'), 180, 505, .9) + who(mom('down', 'happy'), 620, 505, .85)
    + put(kid(True, 'up', 'happy'), 290, 560, .6) + put(kid(False, 'up', 'happy'), 520, 560, .6))
add(S, 7, '흥부와 놀부 7: 제비 다리를 일부러 다치게 한 놀부', 'day',
    cloud(120, 80) + house(600, 470, .95) + P.nest(560, 340, 1) + who(P.nolbu('smug', 'reach'), 300, 505, .95)
    + put(P.swallow(bandage=True), 420, 360, .8) + question(470, 290, '#E4573D'))
add(S, 8, '흥부와 놀부 8: 박 속에서 쏟아져 나온 도깨비', 'dusk',
    P.gourd(450, 540, 1.1, opened='goblin') + who(P.goblin('#7FA8E0'), 380, 500, .85, sh=50) + who(P.goblin('#8CCB8A'), 530, 500, .8, sh=50)
    + who(P.nolbu('shock', 'down'), 150, 505, .9) + stars_colored([(230, 230, 12), (300, 200, 9)], '#E4573D'))
add(S, 9, '흥부와 놀부 9: 재산을 몽땅 잃은 놀부', 'dusk',
    cloud(120, 100) + who(P.nolbu('cry', 'down'), 250, 505, .9)
    + who(P.goblin('#F08A7A', 'happy', club=False), 560, 505, .8, sh=50) + P.treasure(660, 520, .6))
add(S, 10, '흥부와 놀부 10: 형님을 따뜻하게 맞이한 흥부', 'day',
    day_sky() + house(620, 470, .9) + who(P.heungbu('happy', 'cheer'), 280, 505, .9) + who(P.nolbu('happy', 'bow'), 440, 505, .9) + hearts(360, 220))

# ===== 혹부리 영감 =====
S = 'lump'
add(S, 1, '혹부리 영감 1: 노래를 잘 부르는 혹부리 영감', 'day',
    day_sky() + house(600, 470, .9) + who(P.old_man('happy', lumps=1), 300, 505, .95) + P.notes(360, 230) + ground_deco(100, 460, 720))
add(S, 2, '혹부리 영감 2: 날이 저물어 찾아간 빈집', 'dusk',
    pine(60, 452, 1.05) + pine(740, 440, .95) + house(560, 470, .9) + put(woodload, 280, 300, 1.1) + who(P.old_man('calm', lumps=1), 290, 505, .95))
add(S, 3, '혹부리 영감 3: 달아 달아 밝은 달아', 'night',
    full_moon(640, 110, 48) + stars([(80, 70, 7), (200, 130, 5), (420, 60, 6)]) + night_pine(740, 470, .9)
    + house(500, 470, .9, night=True) + who(P.old_man('happy', lumps=1), 220, 505, .95) + P.notes(280, 240))
add(S, 4, '혹부리 영감 4: 우르르 몰려온 도깨비들', 'night',
    night_sky(120) + who(P.old_man('shock', lumps=1), 190, 505, .95)
    + who(P.goblin('#7FA8E0'), 420, 505, .85, sh=50) + who(P.goblin('#8CCB8A'), 560, 505, .8, sh=50) + who(P.goblin('#F08A7A'), 690, 505, .75, sh=50))
add(S, 5, '혹부리 영감 5: 이 노래는 혹에서 나온다오', 'night',
    night_sky(120) + who(P.old_man('happy', lumps=1, pose='no'), 230, 505, .95) + stars_colored([(270, 300, 12), (290, 330, 8)], '#FFE27A')
    + who(P.goblin('#7FA8E0', 'happy'), 470, 505, .8, sh=50) + who(P.goblin('#8CCB8A', 'happy', club=False), 610, 505, .78, sh=50))
lump_ball = f'<circle cx="-70" cy="-60" r="14" fill="{ds.SKIN}"/>'
add(S, 6, '혹부리 영감 6: 혹도 떼고 부자가 된 할아버지', 'night',
    night_sky(120) + who(P.old_man('happy', pose='cheer'), 230, 505, .95) + P.treasure(260, 560, .7)
    + who(P.goblin('#7FA8E0', 'happy', club=False) + lump_ball, 540, 505, .85, sh=50))
add(S, 7, '혹부리 영감 7: 욕심쟁이 혹부리 영감', 'day',
    day_sky() + PATH_LR + house(640, 470, .8) + who(P.old_man('smug', greedy=True, lumps=1, pose='cheer'), 300, 520, .95))
add(S, 8, '혹부리 영감 8: 이 노래도 내 혹에서 나온다오', 'night',
    night_sky(120) + who(P.old_man('smug', greedy=True, lumps=1), 230, 505, .95) + P.notes(290, 240)
    + who(P.goblin('#7FA8E0', 'calm'), 500, 505, .8, sh=50) + who(P.goblin('#F08A7A', 'calm'), 640, 505, .78, sh=50))
add(S, 9, '혹부리 영감 9: 혹을 하나 더 붙인 도깨비들', 'night',
    night_sky(120) + who(P.old_man('shock', greedy=True, lumps=2), 230, 505, .95) + stars_colored([(160, 310, 12), (300, 300, 12)], '#E4573D')
    + who(P.goblin('#7FA8E0', 'angry'), 480, 505, .85, sh=50) + who(P.goblin('#8CCB8A', 'angry'), 620, 505, .8, sh=50))
add(S, 10, '혹부리 영감 10: 혹이 두 개가 된 욕심쟁이', 'dusk',
    PATH_LR + pine(80, 470, 1) + who(P.old_man('cry', greedy=True, lumps=2), 400, 520, .95))

# ===== 해님과 바람 =====
S = 'sun-wind'
tree_r = round_tree(680, 500, .9)
add(S, 1, '해님과 바람 1: 누가 더 힘이 셀까?', 'sky',
    cloud(60, 460, 1.3) + cloud(560, 470, 1.2, delay=-4) + put(P.sun_face('happy'), 240, 260) + put(P.wind('smug'), 560, 280, 1.2)
    + stars_colored([(400, 220, 14), (390, 290, 10)], '#FFFFFF'))
add(S, 2, '해님과 바람 2: 볼을 빵빵하게 부풀린 바람', 'sky',
    cloud(80, 480, 1.2) + put(P.sun_face('calm'), 200, 250, .9) + put(P.wind('blow'), 520, 260, 1.3) + P.wind_lines(600, 230, 3, 1))
add(S, 3, '해님과 바람 3: 외투를 입은 나그네', 'day',
    put(P.sun_face('happy', 46), 150, 110) + put(P.wind('calm'), 640, 110, .7) + PATH_LR + tree_r + who(P.traveler(True, 'walk', 'calm'), 380, 525, .95))
add(S, 4, '해님과 바람 4: 후우우! 힘껏 부는 바람', 'day',
    put(P.wind('blow'), 160, 150, 1) + P.wind_lines(260, 120, 3, 1) + P.wind_lines(300, 300, 3, 1) + P.leaves(300, 200)
    + PATH_LR + tree_r + who(P.traveler(True, 'hold', 'shock'), 460, 525, .95))
add(S, 5, '해님과 바람 5: 아이고, 추워라!', 'day',
    put(P.wind('blow'), 140, 140, .8) + P.wind_lines(230, 120, 3, 1) + PATH_LR
    + shadow(420, 527, 60) + put(anim('shiver', P.traveler(True, 'hold', 'cry')), 420, 525, 1))
add(S, 6, '해님과 바람 6: 지쳐서 물러난 바람', 'day',
    put(P.wind('sleep'), 640, 130, .6) + PATH_LR + tree_r + who(P.traveler(True, 'hold', 'determined'), 400, 525, .95))
add(S, 7, '해님과 바람 7: 따뜻한 햇살을 비추는 해님', 'day',
    put(P.sun_face('happy', 64), 400, 160) + cloud(220, 140, 1.1, delay=-2) + PATH_LR + tree_r + who(P.traveler(True, 'walk', 'calm'), 400, 525, .9))
add(S, 8, '해님과 바람 8: 단추를 하나둘 푸는 나그네', 'day',
    put(P.sun_face('happy', 64), 400, 150) + PATH_LR + tree_r + who(P.traveler(True, 'open', 'happy'), 400, 525, .95)
    + put(anim('rise', '<path d="M0 0q6 9 0 14q-6-5 0-14z" fill="#8FD0F2"/>'), 440, 300))
add(S, 9, '해님과 바람 9: 외투를 훌렁 벗은 나그네', 'day',
    put(P.sun_face('happy', 64), 200, 140) + PATH_LR + round_tree(600, 520, 1) + who(P.traveler(False, 'off', 'happy'), 470, 525, .95))
add(S, 10, '해님과 바람 10: 따뜻한 마음이 더 큰 힘', 'sky',
    cloud(60, 460, 1.3) + cloud(560, 470, 1.2, delay=-4) + put(P.sun_face('happy'), 300, 260) + put(P.wind('happy'), 580, 290, .9) + hearts(440, 220))

# ===== 개미와 베짱이 =====
S = 'ant'
ants_line = ''.join(who(P.ant(True), x, 520 + (i % 2) * 10, 1.3, sh=26) for i, x in enumerate((150, 280, 410, 540)))
add(S, 1, '개미와 베짱이 1: 부지런히 먹이를 나르는 개미들', 'meadow',
    sun(660, 100, 50) + cloud(120, 80) + PATH_LR + ants_line + ground_deco(80, 660, 740))
add(S, 2, '개미와 베짱이 2: 바이올린을 켜는 베짱이', 'meadow',
    sun(120, 100, 44) + round_tree(620, 500, 1.05) + who(P.grasshopper(True), 540, 515, 1.15, sh=36) + P.notes(600, 260)
    + who(P.ant(True), 160, 530, 1.1, sh=24) + who(P.ant(True), 270, 540, 1.1, sh=24))
add(S, 3, '개미와 베짱이 3: 같이 놀자!', 'meadow',
    sun(660, 100, 44) + cloud(120, 80) + who(P.grasshopper(True, mood='happy'), 520, 515, 1.15, sh=36) + who(P.ant(True, 'calm'), 290, 530, 1.4, sh=30))
add(S, 4, '개미와 베짱이 4: 여름 내내 노래만 부른 베짱이', 'meadow',
    sun(660, 100, 50) + round_tree(120, 480, .9) + shadow(420, 517, 40) + anim('hop', put(P.grasshopper(True), 420, 515, 1.2))
    + P.notes(470, 250) + P.notes(330, 300) + ground_deco(240, 600, 720))
add(S, 5, '개미와 베짱이 5: 곡식을 모으는 가을', 'autumn',
    cloud(120, 80) + P.leaves(150, 150) + P.ant_hill(610, 505, 1) + who(P.ant(True), 220, 530, 1.3, sh=26) + who(P.ant(True), 360, 530, 1.3, sh=26))
snowcap = '<path d="M490 410C520 360 700 360 730 410C700 396 520 396 490 410Z" fill="#FFFFFF"/>'
add(S, 6, '개미와 베짱이 6: 하얀 눈이 펑펑 내리는 겨울', 'winter',
    P.ant_hill(610, 505, 1) + snowcap + put(round_tree(0, 0, 1).replace('#5E9B5C', '#E8EEF5').replace('#6DAD68', '#F2F6FA').replace('#7DBE73', '#FFFFFF'), 180, 500, .8))
add(S, 7, '개미와 베짱이 7: 춥고 배고픈 베짱이', 'winter',
    who(P.grasshopper(cold=True, mood='cry'), 400, 515, 1.25, sh=36))
add(S, 8, '개미와 베짱이 8: 똑똑, 개미네 집 문을 두드리는 베짱이', 'winter',
    P.ant_hill(560, 505, 1.1) + snowcap.replace('490 410', '434 400').replace('730 410', '686 400') + who(P.grasshopper(cold=True, mood='calm'), 340, 515, 1.15, sh=36)
    + stars_colored([(470, 430, 10)], '#FFE27A'))
add(S, 9, '개미와 베짱이 9: 어서 들어와, 같이 먹자', 'room',
    who(P.ant(False, 'happy'), 220, 520, 1.5, sh=30) + who(P.ant(False, 'happy'), 340, 530, 1.4, sh=30)
    + who(P.grasshopper(cold=True, mood='happy'), 560, 515, 1.15, sh=36) + P.bowl(440, 560, .9) + hearts(400, 240))
add(S, 10, '개미와 베짱이 10: 함께 일하고 함께 노래해요', 'meadow',
    sun(660, 100, 50) + cloud(120, 80) + who(P.grasshopper(True), 540, 515, 1.15, sh=36) + P.notes(600, 250)
    + anim('hop', who(P.ant(True), 200, 530, 1.3, sh=26)) + who(P.ant(True), 330, 530, 1.3, sh=26) + ground_deco(80, 720))

# ===== 양치기 소년 =====
S = 'shepherd'
flock = ''.join(who(P.sheep(), x, y, s, sh=40) for x, y, s in ((420, 500, 1), (540, 520, 1.05), (650, 500, .95), (480, 560, 1)))
scared = ''.join(who(P.sheep(scared=True), x, y, s, sh=40) for x, y, s in ((300, 520, 1), (400, 540, 1)))
add(S, 1, '양치기 소년 1: 심심한 양치기 소년', 'meadow',
    day_sky() + flock + who(P.shepherd('calm'), 200, 520, 1.15, sh=36) + ground_deco(100, 740))
add(S, 2, '양치기 소년 2: 늑대다! 늑대가 나타났다!', 'meadow',
    day_sky() + flock + who(P.shepherd('smug', 'up'), 220, 520, 1.15, sh=36) + stars_colored([(160, 300, 12), (290, 290, 12)], '#E4573D'))
add(S, 3, '양치기 소년 3: 헐레벌떡 달려온 마을 사람들', 'meadow',
    cloud(120, 80) + who(P.shepherd('happy'), 160, 520, 1.1, sh=36) + who(P.villager(False, 'shock'), 440, 505, .85) + who(P.villager(True, 'shock'), 600, 505, .85)
    + put(P.sheep(), 730, 520, .8))
add(S, 4, '양치기 소년 4: 하하하, 거짓말이에요!', 'meadow',
    cloud(120, 80) + shadow(220, 522, 40) + anim('hop', put(P.shepherd('happy'), 220, 520, 1.15))
    + who(woodcutter('down', 'determined'), 470, 505, .85, flip=True) + who(mom('down', 'determined'), 620, 505, .85, flip=True))
add(S, 5, '양치기 소년 5: 이번엔 진짜예요!', 'meadow',
    day_sky() + flock + who(P.shepherd('smug', 'up'), 200, 520, 1.1, sh=36) + who(P.villager(False, 'shock'), 340, 505, .75))
add(S, 6, '양치기 소년 6: 진짜 늑대가 나타났어요', 'dusk',
    pine(700, 452, 1.05) + pine(770, 460, .8) + scared + who(P.wolf('reach', 'sly', look=(-5, 2)), 580, 505, .85, sh=90))
add(S, 7, '양치기 소년 7: 도와주세요!', 'dusk',
    pine(740, 452, 1) + who(P.shepherd('shock', 'up'), 180, 520, 1.1, sh=36) + put(P.sheep(scared=True), 330, 530, .9)
    + who(P.wolf('sit', 'sly'), 560, 505, .8, sh=90) + stars_colored([(120, 300, 12), (240, 290, 12)], '#E4573D'))
add(S, 8, '양치기 소년 8: 또 거짓말이겠지', 'dusk',
    house(560, 470, .9) + who(woodcutter('down', 'calm'), 280, 505, .9) + who(mom('down', 'calm'), 420, 505, .9) + question(340, 220))
add(S, 9, '양치기 소년 9: 엉엉 우는 양치기 소년', 'night',
    night_sky(120) + night_pine(560, 470, 1) + night_pine(700, 466, .9) + who(P.shepherd('cry'), 300, 520, 1.15, sh=36)
    + put(P.sheep(scared=True), 620, 500, .6) + put(P.sheep(scared=True), 740, 510, .55))
add(S, 10, '양치기 소년 10: 다시는 거짓말하지 않을 거예요', 'meadow',
    day_sky() + who(P.shepherd('happy'), 320, 520, 1.15, sh=36) + who(P.sheep(), 470, 520, 1.1, sh=40) + who(P.sheep(), 580, 530, 1, sh=40) + hearts(400, 260))

# ===== 빨간 모자 =====
S = 'red-hood'
flowers_many = ''.join(flower(x, y, c) for x, y, c in ((120, 540, '#FFC4CF'), (180, 570, '#FFF6E6'), (260, 550, '#FFD66B'), (520, 560, '#FFC4CF'),
                                                      (600, 540, '#FFF6E6'), (680, 570, '#FFD66B'), (740, 540, '#FFC4CF')))
add(S, 1, '빨간 모자 1: 빨간 모자를 쓴 아이', 'day',
    day_sky() + house(620, 470, .85) + who(P.red_hood('happy', basket_=False), 360, 520, 1.2, sh=36) + flowers_many)
add(S, 2, '빨간 모자 2: 할머니께 갖다 드리렴', 'day',
    day_sky() + house(600, 470, .95) + who(mom('down', 'calm'), 280, 505, .9) + who(P.red_hood('happy'), 420, 520, 1.1, sh=36))
add(S, 3, '빨간 모자 3: 숲에서 만난 늑대', 'forest',
    pine(60, 470, 1.1) + round_tree(660, 500, 1) + who(P.red_hood('calm'), 260, 525, 1.15, sh=36) + who(P.wolf('reach', 'sly'), 540, 510, .85, sh=90))
add(S, 4, '빨간 모자 4: 저기 예쁜 꽃 좀 봐', 'forest',
    round_tree(80, 480, .9) + flowers_many + who(P.red_hood('happy'), 300, 525, 1.15, sh=36) + who(P.wolf('reach', 'sly', look=(-6, 0)), 560, 510, .85, sh=90)
    + butterfly(420, 300) + butterfly(650, 340, '#FFD66B'))
add(S, 5, '빨간 모자 5: 지름길로 달려간 늑대', 'forest',
    flowers_many + who(P.red_hood('happy', 'up', basket_=False), 180, 525, 1, sh=36) + house(680, 430, .55)
    + shadow(500, 507, 60) + put(P.wolf('run', 'sly', look=(6, 0)), 500, 505, .7, flip=True, rot=-8))
add(S, 6, '빨간 모자 6: 할머니, 귀가 왜 이렇게 커요?', 'room',
    P.bed(500, 520, 1.1, who=P.wolf_in_bed('sly')) + who(P.red_hood('calm'), 200, 525, 1.15, sh=36) + question(260, 270))
add(S, 7, '빨간 모자 7: 드르렁 코를 고는 늑대', 'room',
    P.bed(440, 520, 1.15, who=P.wolf_in_bed('sleep')) + zz(420, 250))
add(S, 8, '빨간 모자 8: 코 고는 소리를 들은 사냥꾼', 'room',
    P.bed(540, 520, 1.05, who=P.wolf_in_bed('sleep')) + zz(520, 260) + who(P.hunter('shock'), 200, 505, .95) + question(260, 220))
add(S, 9, '빨간 모자 9: 줄행랑친 늑대', 'forest',
    pine(60, 470, 1) + who(P.hunter('determined', 'cheer'), 160, 505, .85) + who(ds.grandma('happy'), 300, 505, .85)
    + who(P.red_hood('happy'), 410, 520, 1, sh=36) + shadow(650, 507, 60) + put(P.wolf('run', 'shock'), 650, 505, .7, flip=True, rot=-8))
add(S, 10, '빨간 모자 10: 함께 나누어 먹는 빵', 'room',
    who(ds.grandma('happy'), 260, 505, .85) + who(P.red_hood('happy', basket_=False), 400, 520, 1.05, sh=36) + who(P.hunter('happy'), 560, 505, .85)
    + P.basket(400, 575, 1.1) + hearts(400, 220))

# ===== 아기 돼지 삼형제 =====
S = 'three-pigs'
PIG = {1: '#7FB8E6', 2: '#8CCB8A', 3: '#E4573D'}
add(S, 1, '아기 돼지 삼형제 1: 엄마 돼지와 아기 돼지들', 'day',
    day_sky() + house(640, 470, .8) + who(P.pig(mother=True), 260, 515, 1.4, sh=56)
    + who(P.pig(scarf=PIG[1]), 410, 525, 1, sh=40) + who(P.pig(scarf=PIG[2]), 500, 530, 1, sh=40) + who(P.pig(scarf=PIG[3]), 590, 525, 1, sh=40))
add(S, 2, '아기 돼지 삼형제 2: 지푸라기 집', 'meadow',
    day_sky() + P.straw_house(540, 500, 1.1) + anim('hop', who(P.pig(scarf=PIG[1]), 270, 525, 1.2, sh=44)) + ground_deco(100, 720))
add(S, 3, '아기 돼지 삼형제 3: 나뭇가지 집', 'meadow',
    day_sky() + P.stick_house(540, 500, 1) + who(P.pig(scarf=PIG[2]), 270, 525, 1.2, sh=44) + ground_deco(100, 720))
add(S, 4, '아기 돼지 삼형제 4: 튼튼한 벽돌집', 'meadow',
    day_sky() + P.brick_house(540, 500, 1) + who(P.pig(scarf=PIG[3], mood='determined'), 280, 525, 1.2, sh=44)
    + put(anim('rise', '<path d="M0 0q6 9 0 14q-6-5 0-14z" fill="#8FD0F2"/>'), 320, 380)
    + put(P.pig(scarf=PIG[1]), 90, 540, .6) + put(P.pig(scarf=PIG[2]), 160, 545, .6))
add(S, 5, '아기 돼지 삼형제 5: 훨훨 날아간 지푸라기 집', 'meadow',
    cloud(120, 80) + P.straw_house(560, 500, 1, blown=True) + who(P.wolf('sit', 'blow'), 240, 505, .85, flip=True, sh=90)
    + who(P.pig(scarf=PIG[1], mood='shock'), 700, 530, .9, sh=36))
add(S, 6, '아기 돼지 삼형제 6: 와르르 무너진 나뭇가지 집', 'meadow',
    cloud(120, 80) + P.stick_house(540, 520, 1, broken=True) + who(P.wolf('sit', 'blow'), 230, 505, .85, flip=True, sh=90)
    + who(P.pig(scarf=PIG[1], mood='shock'), 660, 530, .85, sh=36) + who(P.pig(scarf=PIG[2], mood='shock'), 740, 530, .85, sh=36))
add(S, 7, '아기 돼지 삼형제 7: 꿈쩍도 하지 않는 벽돌집', 'meadow',
    cloud(120, 80) + P.brick_house(560, 500, 1) + who(P.wolf('sit', 'blow'), 220, 505, .85, flip=True, sh=90)
    + put(P.pig(scarf=PIG[3], mood='happy'), 491, 397, .35))
add(S, 8, '아기 돼지 삼형제 8: 굴뚝으로 들어가려는 늑대', 'day',
    day_sky() + P.brick_house(400, 520, 1.05) + put(P.wolf('sit', 'sly', look=(4, 2)), 470, 270, .45)
    + who(P.pig(scarf=PIG[3], mood='determined'), 160, 530, .9, sh=36))
add(S, 9, '아기 돼지 삼형제 9: 앗 뜨거워!', 'day',
    cloud(120, 80) + P.brick_house(400, 520, 1.05, steam=True) + put(anim('float', P.wolf('sit', 'shock')), 600, 220, .45, rot=30)
    + stars_colored([(520, 150, 14), (560, 110, 10)], '#E4573D'))
add(S, 10, '아기 돼지 삼형제 10: 벽돌집에서 오순도순', 'meadow',
    day_sky() + P.brick_house(560, 500, .95) + anim('hop', who(P.pig(scarf=PIG[1]), 160, 530, 1, sh=40))
    + who(P.pig(scarf=PIG[2]), 270, 530, 1, sh=40) + anim('hop', who(P.pig(scarf=PIG[3]), 380, 530, 1, sh=40)) + hearts(270, 300))

PAGES['intro'] = OLD['intro']


# ---------- 지은 이야기용 부품 (img/parts.js) ----------
# 캐릭터마다 표정·자세 몇 가지를 미리 그려 두면, 앱(composer.js)이 글을 읽고 골라 조립해요.
#   CHARACTERS[name] = { scale, h, faces: 1(오른쪽을 봄) | 0(정면), sky: 하늘에 둘지, v: {표정: svg} }
def export_parts_v2():
    import json
    G = ds.grandma
    people_moods = ('happy', 'calm', 'shock', 'cry', 'sleep', 'angry')
    face_of = {'angry': 'determined'}

    def moods(fn):
        return {m: fn(face_of.get(m, m)) for m in people_moods}

    C = {
        'grandma': dict(scale=.95, h=280, v={**moods(G), 'cheer': G('happy')}),
        'grandpa': dict(scale=.95, h=270, v={**moods(lambda m: P.old_man(m)), 'cheer': P.old_man('happy', pose='cheer')}),
        'mom': dict(scale=.95, h=260, v={**moods(lambda m: mom('down', m)), 'cheer': mom('down', 'happy')}),
        'dad': dict(scale=.95, h=250, v={**moods(lambda m: woodcutter('down', m)), 'cheer': woodcutter('cheer', 'happy')}),
        'boy': dict(scale=1.15, h=150, v={**moods(lambda m: kid(True, 'down', m)), 'cheer': kid(True, 'up', 'happy')}),
        'girl': dict(scale=1.15, h=150, v={**moods(lambda m: kid(False, 'down', m)), 'cheer': kid(False, 'up', 'happy')}),
        'baby': dict(scale=1, h=110, v={'happy': P.baby('happy'), 'calm': P.baby('calm'), 'cry': P.baby('cry'), 'sleep': P.baby('sleep'), 'shock': P.baby('shock')}),
        'tiger': dict(scale=.85, h=250, v={'happy': tiger('sit', 'sweet'), 'calm': tiger('sit', 'grin', look=(0, 2)), 'angry': tiger('reach', 'grin'),
                                           'shock': tiger('sit', 'surprised', look=(0, -2))}),
        'rabbit': dict(scale=1.2, h=180, v={'happy': rabbit('stand', 'happy'), 'calm': rabbit('stand', 'calm'), 'shock': rabbit('stand', 'shock'),
                                            'cry': rabbit('stand', 'cry'), 'sleep': rabbit('sleep'), 'angry': rabbit('point', 'smug'),
                                            'run': rabbit('run', 'happy')}),
        'turtle': dict(scale=1.25, h=110, faces=1, v={'happy': turtle('happy'), 'calm': turtle('calm'), 'angry': turtle('determined'),
                                                     'shock': turtle('shock'), 'cry': turtle('cry'), 'sleep': turtle('sleep')}),
        'dog': dict(scale=1.2, h=130, faces=1, v={m: ds.dog(face_of.get(m, m)) for m in people_moods}),
        'cat': dict(scale=1.2, h=140, v={m: ds.cat(face_of.get(m, m)) for m in people_moods}),
        'pig': dict(scale=1.15, h=140, v={m: P.pig(mood=face_of.get(m, m), scarf=None) for m in people_moods}),
        'sheep': dict(scale=1.1, h=110, faces=1, v={'happy': P.sheep(), 'calm': P.sheep(), 'shock': P.sheep(scared=True), 'cry': P.sheep(scared=True)}),
        'wolf': dict(scale=.8, h=240, v={'calm': P.wolf('sit', 'sly'), 'angry': P.wolf('reach', 'sly'), 'shock': P.wolf('sit', 'shock'),
                                         'sleep': P.wolf('sit', 'sleep'), 'happy': P.wolf('sit', 'sly')}),
        'goblin': dict(scale=.85, h=190, v={'happy': P.goblin('#7FA8E0', 'happy', club=False), 'calm': P.goblin('#8CCB8A', 'calm'),
                                            'angry': P.goblin('#F08A7A', 'angry'), 'shock': P.goblin('#7FA8E0', 'calm')}),
        'sinseon': dict(scale=.85, h=270, v={'calm': sinseon(), 'happy': sinseon(), 'gift': sinseon(hold='gold')}),
        'ant': dict(scale=1.4, h=100, v={'happy': P.ant(True), 'calm': P.ant(True, 'calm'), 'cry': P.ant(False, 'tired'), 'sleep': P.ant(False, 'tired')}),
        'grasshopper': dict(scale=1.15, h=170, v={'happy': P.grasshopper(True), 'calm': P.grasshopper(True, mood='calm'),
                                                  'cry': P.grasshopper(cold=True, mood='cry'), 'shock': P.grasshopper(False, mood='shock')}),
        'squirrel': dict(scale=1.2, h=130, v={'happy': P.squirrel(flag=False)}),
        'chestnut': dict(scale=1.2, h=90, v={'happy': P.chestnut('happy'), 'angry': P.chestnut('determined'), 'shock': P.chestnut('shock')}),
        'swallow': dict(scale=1, h=60, sky=True, v={'happy': P.swallow()}),
        'bird': dict(scale=1.1, h=50, sky=True, v={'happy': P.bluebird()}),
    }
    props = {
        'house': house(0, 0, 1), 'house_night': house(0, 0, 1, night=True),
        'straw_house': P.straw_house(0, 0, 1), 'brick_house': P.brick_house(0, 0, 1),
        'tree': round_tree(0, 0, 1), 'tree_night': round_tree(0, 0, 1, night=True),
        'pine': pine(0, 0, 1), 'pine_night': night_pine(0, 0, 1),
        'pond': pond(0, 0, 210, 60), 'pond_night': pond(0, 0, 210, 60, night=True),
        'flower': flower(0, 0), 'flower_pink': flower(0, 0, '#FFC4CF'), 'flower_yellow': flower(0, 0, '#FFE27A', '#F2A33C'),
        'tuft': tuft(0, 0), 'butterfly': butterfly(0, 0), 'butterfly_y': butterfly(0, 0, '#FFD66B'),
        'cloud': cloud(0, 0), 'cloud_night': cloud(0, 0, 1, '#C9CCE8'), 'cloud_rain': cloud(0, 0, 1, '#C9D2E0'),
        'birds': birds(0, 0), 'sun': sun(0, 0, 46), 'moon': moon(0, 0, 40), 'full_moon': P.full_moon(),
        'stars': stars([(80, 70, 7), (200, 130, 5), (330, 60, 6), (470, 110, 5), (600, 70, 6), (760, 160, 6)]),
        'sparkles': stars_colored([(-40, -20, 12), (40, -40, 10), (10, 30, 8)], '#FFE27A'),
        'alarm': stars_colored([(-20, 0, 12), (20, -10, 10)], '#E4573D'),
        'hearts': hearts(0, 0), 'notes': P.notes(0, 0), 'zz': zz(0, 0), 'question': question(0, 0),
        'tear': anim('rise', '<path d="M0 0q6 9 0 14q-6-5 0-14z" fill="#8FD0F2"/>'),
        'speed': ''.join(anim('drift', f'<path d="M0 {y}h{w}" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>', -n) for n, (y, w) in enumerate(((0, 70), (30, 90), (60, 60)))),
        'fish': P.fish(), 'fish2': P.fish('#7FB8E6'), 'boat': P.boat(), 'umbrella': P.umbrella(), 'umbrella2': P.umbrella('#FF9AA8'),
        'kite': P.kite(), 'cake': P.cake(), 'book': P.book(), 'letter': P.letter(), 'rainbow': P.rainbow(), 'rain': P.rain(),
        'treasure': P.treasure(0, 0, .7), 'basket': P.basket(0, 0, 1.1), 'basket_empty': P.basket(0, 0, 1.1, full=False),
        'bowl': P.bowl(0, 0, 1), 'cauldron': P.cauldron(0, 0, .9), 'jar': P.jar(0, 0, 1), 'gourd': P.gourd(0, 0, .8),
        'rice': P.rice_bundle(0, 0, .9), 'rock': P.rock(0, 0, 1), 'leaves': P.leaves(0, 0), 'bed': P.bed(0, 0, 1),
        'ricecake': ''.join(f'<ellipse cx="{x}" cy="{y}" rx="14" ry="9" fill="{c}" stroke="#E5DCCB" stroke-width="2"/>'
                            for x, y, c in ((-20, -10, '#FFFDF6'), (6, -12, '#F7B6C2'), (28, -9, '#C3DB8E'), (-6, -24, '#FFFDF6'), (16, -25, '#F7B6C2'))),
        'axe': ds.axe('iron'), 'axe_gold': ds.axe('gold'), 'wood': woodload, 'snowman': P.snowman(),
    }
    # 침대: 앞(이불)과 뒤(머리판·베개)를 나눠 두면, 그 사이에 누운 캐릭터를 끼울 수 있어요.
    props.update(Q.props())
    C.update(Q.characters())
    bed_back, bed_front = P.bed(0, 0, 1, who='<!--WHO-->').split('<!--WHO-->')
    props['bed_back'], props['bed_front'] = bed_back, bed_front
    kinds = ('day', 'dusk', 'night', 'twilight', 'meadow', 'forest', 'warm', 'winter', 'autumn', 'kitchen', 'room', 'paddy', 'paddy_night', 'sea')
    bgs = {k: dict(zip(('defs', 'body'), P.bg2(k))) for k in kinds}
    out = {}
    for name, c in C.items():
        out[name] = {'scale': c['scale'], 'h': c['h'], 'faces': c.get('faces', 0), 'sky': c.get('sky', False), 'v': c['v']}
    js = ('// tools/build_images.py 가 만든 파일이에요. 직접 고치지 말고 생성기를 고쳐 주세요.\n'
          f'export const STYLE = {json.dumps(ds.STYLE)};\n'
          f'export const BG = {json.dumps(bgs, ensure_ascii=False)};\n'
          f'export const CHARACTERS = {json.dumps(out, ensure_ascii=False)};\n'
          f'export const PROPS = {json.dumps(props, ensure_ascii=False)};\n')
    (ds.OUT / 'parts.js').write_text(js, encoding='utf-8')


def main():
    ds.OUT.mkdir(exist_ok=True)
    for old in ds.OUT.glob('*.svg'):
        if old.stem not in PAGES:
            old.unlink()
    for name, (title, kind, body) in PAGES.items():
        defs, back = P.bg2(kind)
        (ds.OUT / f'{name}.svg').write_text(ds.svg(title, defs, back + body), encoding='utf-8')
    export_parts_v2()
    print(f'그림 {len(PAGES)}장을 만들었어요.')


if __name__ == '__main__':
    main()
