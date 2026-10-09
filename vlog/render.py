#!/usr/bin/env python3
"""감성 다큐 톤 유튜브 롱폼(16:9) 브이로그 렌더러.

project.yaml 하나에 장면 순서, 내레이션 자막, 영어 키워드, 목소리 녹음을 적으면
컷 편집 → 16:9 리프레임 → 슬로 줌 → 색보정 → 크로스페이드
→ 자막/키워드 → 목소리 + 현장음 + BGM(목소리 나올 때 자동으로 줄임) 믹스까지
ffmpeg 한 번으로 렌더링한다.

사용법:
    python3 vlog/render.py vlog/demo/project.yaml [-o out.mp4] [--preview]
"""
import argparse
import json
import os
import subprocess
import sys

import yaml

W, H, FPS = 1920, 1080, 30
XFADE = 0.6          # 장면 사이 크로스페이드(초)
OPENING_DUR = 4.5    # 오프닝 타이틀 카드 길이(초)
ENDING_DUR = 4.0     # 엔딩 카드 길이(초)
MAX_LEN = 300        # 목표 최대 길이(초)

SERIF = "Noto Serif CJK KR"
SANS = "Noto Sans CJK KR"
LATIN = "Inter Display Medium"

# 색보정 프리셋
LOOKS = {
    # 차갑고 차분한 톤: 채도·대비를 낮추고 그림자에 푸른 기, 하이라이트는 부드럽게.
    "cool": [
        "eq=contrast=0.9:saturation=0.78:gamma=1.04",
        "curves=master='0/0.06 0.25/0.27 0.5/0.52 0.75/0.76 1/0.95'",
        "colorbalance=rs=-0.03:gs=0.0:bs=0.035:rm=-0.02:bm=0.02:rh=-0.01:bh=0.015",
        "vignette=angle=PI/7",
        "noise=alls=2:allf=t",
    ],
    # 따뜻한 필름 톤: 살짝 노랗고 블랙을 띄움.
    "warm": [
        "eq=contrast=0.94:saturation=0.86:gamma=1.02",
        "curves=master='0/0.045 0.25/0.24 0.5/0.5 0.75/0.77 1/0.96'",
        "colorbalance=rs=0.025:gs=0.005:bs=-0.03:rh=0.02:bh=-0.025",
        "vignette=angle=PI/5",
        "noise=alls=3:allf=t",
    ],
    "none": ["null"],
}


def probe(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type",
         "-of", "json", path],
        check=True, capture_output=True, text=True).stdout
    info = json.loads(out)
    has_audio = any(s["codec_type"] == "audio" for s in info.get("streams", []))
    return float(info["format"]["duration"]), has_audio


def ass_time(t):
    t = max(t, 0)
    h, rem = divmod(t, 3600)
    m, s = divmod(rem, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"


def ass_text(s):
    return str(s).replace("\n", "\\N")


def ass_color(hex_rgb):
    """'#E8A040' → ASS 색상 '&H0040A0E8&'"""
    h = str(hex_rgb).lstrip("#")
    return f"&H00{h[4:6]}{h[2:4]}{h[0:2]}&".upper()


def build_ass(cfg, timeline, total, bars):
    caption_font = SERIF if cfg.get("caption_font") == "serif" else SANS
    cap_tags = f"\\an5\\pos({W // 2},{H - bars // 2})" if bars else f"\\an2\\pos({W // 2},{H - 112})"
    lines = [
        "[Script Info]", "ScriptType: v4.00+", f"PlayResX: {W}", f"PlayResY: {H}",
        "WrapStyle: 0", "ScaledBorderAndShadow: yes", "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, "
        "BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, "
        "BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
        # 흰 글씨 + 번진 그림자(테두리 없이 은은하게)
        f"Style: Caption,{caption_font},56,&H00FFFFFF,&H00FFFFFF,&HA0000000,&HA0000000,0,0,0,0,100,100,0,0,1,2,0,2,160,160,0,1",
        f"Style: Word,{LATIN},42,&H00FFFFFF,&H00FFFFFF,&HB0000000,&HA0000000,0,0,0,0,100,100,-0.5,0,1,1.5,0,5,0,0,0,1",
        f"Style: Kicker,{SANS},26,&H30FFFFFF,&H00FFFFFF,&HB0000000,&HA0000000,0,0,0,0,100,100,8,0,1,1,0,5,60,60,0,1",
        f"Style: Chapter,{SANS},60,&H00FFFFFF,&H00FFFFFF,&HA0000000,&HA0000000,0,0,0,0,100,100,2,0,1,2,0,5,60,60,0,1",
        f"Style: Title,{LATIN},110,&H00FFFFFF,&H00FFFFFF,&HB0000000,&HA0000000,0,0,0,0,100,100,-2,0,1,2,0,5,60,60,0,1",
        f"Style: Place,{SANS},28,&H20FFFFFF,&H00FFFFFF,&HB0000000,&HA0000000,0,0,0,0,100,100,3,0,1,1,0,1,60,60,0,1",
        "",
        "[Events]",
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ]

    def ev(start, end, style, text, tags=""):
        lines.append(f"Dialogue: 0,{ass_time(start)},{ass_time(end)},{style},,0,0,0,,{{{tags}}}{ass_text(text)}")

    cx, cy = W // 2, H // 2

    # 오프닝 타이틀: 검은 오프닝 카드 위에 얹는다.
    if cfg.get("title"):
        t0, t1 = 0.6, OPENING_DUR - 0.2
        ev(t0, t1, "Title", cfg["title"], f"\\an5\\pos({cx},{cy - 20})\\fad(1000,800)\\blur1")
        if cfg.get("subtitle"):
            ev(t0 + 0.6, t1, "Kicker", cfg["subtitle"], f"\\an5\\pos({cx},{cy + 80})\\fad(1000,800)")

    for scene, (start, dur) in zip(cfg["scenes"], timeline):
        end = start + dur - 0.15
        ch = scene.get("chapter")
        if ch:
            a, b = start + 0.4, start + min(3.5, dur - 0.2)
            if ch.get("time"):
                ev(a, b, "Kicker", ch["time"], f"\\an5\\pos({cx},{cy - 70})\\fad(700,600)")
            if ch.get("text"):
                ev(a + 0.25, b, "Chapter", ch["text"], f"\\an5\\pos({cx},{cy + 10})\\fad(800,600)\\blur1")
        if scene.get("place"):
            # 좌측 하단 장소 표기
            a = start + (3.8 if ch else 0.6)
            if a + 1.5 < start + dur:
                ev(a, min(a + 3.5, end), "Place", scene["place"],
                   f"\\an1\\pos(110,{H - (bars + 60 if bars else 170)})\\fad(500,500)")
        # 화면 속 영어 키워드: 지정한 위치에 하나씩 떠오른다.
        for wd in scene.get("words", []):
            a = start + float(wd.get("at", 0))
            b = min(a + float(wd["dur"]), end) if "dur" in wd else end
            tags = f"\\an5\\pos({int(float(wd.get('x', 0.5)) * W)},{int(float(wd.get('y', 0.5)) * H)})\\fad(200,300)\\blur1"
            if "size" in wd:
                tags += f"\\fs{int(wd['size'])}"
            if "color" in wd:
                tags += f"\\1c{ass_color(wd['color'])}"
            ev(a, b, "Word", wd["text"], tags)
        for cap in scene.get("captions", []):
            a = start + float(cap.get("at", 0))
            b = min(a + float(cap.get("dur", 3.0)), start + dur)
            ev(a, b, "Caption", cap["text"], f"{cap_tags}\\fad(200,200)\\blur2")

    if cfg.get("ending"):
        ev(total - ENDING_DUR + 0.4, total - 0.3, "Chapter", cfg["ending"],
           f"\\an5\\pos({cx},{cy})\\fad(1000,800)")
    return "\n".join(lines) + "\n"


def scene_video_chain(idx, scene, dur, grade, preview):
    zoom = float(scene.get("zoom", 0.03))   # 장면 동안 확대되는 비율 (0이면 고정)
    base = 1 if preview else 2              # 2배 해상도에서 줌을 계산하면 떨림이 줄어든다
    bw, bh = W * base, H * base
    chain = [
        f"[{idx}:v]trim=start={scene['start']}:end={scene['end']},setpts=PTS-STARTPTS",
        f"fps={FPS}",
        f"scale={bw}:{bh}:force_original_aspect_ratio=increase",
        f"crop={bw}:{bh}",
    ]
    if zoom:
        chain += [
            f"scale=w='trunc({bw}*(1+{zoom}*t/{dur:.3f})/2)*2':h=-2:eval=frame",
            f"crop={bw}:{bh}",
        ]
    chain += [f"scale={W}:{H}", "format=yuv420p", grade, "setsar=1"]
    return ",".join(chain) + f"[v{idx}]"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("-o", "--output")
    ap.add_argument("--preview", action="store_true", help="빠른 저화질 미리보기")
    args = ap.parse_args()

    root = os.path.dirname(os.path.abspath(args.project))
    with open(args.project, encoding="utf-8") as f:
        cfg = yaml.safe_load(f)
    scenes = cfg["scenes"]
    grade = ",".join(LOOKS[cfg.get("look", "cool")])
    # 시네마 레터박스(2.39:1) 위아래 검은 띠 높이
    bars = int(round((H - W / 2.39) / 2)) if cfg.get("letterbox", False) else 0

    inputs, filters, timeline = [], [], []
    for i, sc in enumerate(scenes):
        path = os.path.join(root, sc["clip"])
        length, has_audio = probe(path)
        sc["start"] = float(sc.get("start", 0.0))
        sc["end"] = min(float(sc.get("end", length)), length)
        dur = sc["end"] - sc["start"]
        inputs += ["-i", path]
        filters.append(scene_video_chain(i, sc, dur, grade, args.preview))
        vol = float(sc.get("volume", cfg.get("ambient_volume", 0.8)))
        if has_audio:
            filters.append(
                f"[{i}:a]atrim=start={sc['start']}:end={sc['end']},asetpts=PTS-STARTPTS,"
                f"aresample=48000,aformat=channel_layouts=stereo,volume={vol}[a{i}]")
        else:
            filters.append(f"anullsrc=r=48000:cl=stereo,atrim=0:{dur:.3f}[a{i}]")
        timeline.append(dur)

    def black_card(name, dur):
        filters.append(f"color=black:s={W}x{H}:r={FPS}:d={dur},format=yuv420p,setsar=1[v{name}]")
        filters.append(f"anullsrc=r=48000:cl=stereo,atrim=0:{dur}[a{name}]")
        return (name, dur)

    # 오프닝 카드 + 장면들 + 엔딩 카드
    n = len(scenes)
    segs = [(str(i), d) for i, d in enumerate(timeline)]
    if cfg.get("title"):
        segs.insert(0, black_card("op", OPENING_DUR))
    segs.append(black_card("ed", ENDING_DUR))

    # 크로스페이드로 이어 붙이기
    starts, offset = [0.0], segs[0][1]
    vlast, alast = f"v{segs[0][0]}", f"a{segs[0][0]}"
    for k, (name, dur) in enumerate(segs[1:], 1):
        off = offset - XFADE
        starts.append(off)
        filters.append(f"[{vlast}][v{name}]xfade=transition=fade:duration={XFADE}:offset={off:.3f}[vx{k}]")
        filters.append(f"[{alast}][a{name}]acrossfade=d={XFADE}[ax{k}]")
        vlast, alast = f"vx{k}", f"ax{k}"
        offset = off + dur
    total = offset
    scene_starts = [st for st, (name, _) in zip(starts, segs) if name.isdigit()]

    ass_path = os.path.join(root, ".subs.ass")
    with open(ass_path, "w", encoding="utf-8") as f:
        f.write(build_ass(cfg, list(zip(scene_starts, timeline)), total, bars))

    letterbox = f",drawbox=x=0:y=0:w={W}:h={bars}:color=black:t=fill," \
                f"drawbox=x=0:y={H - bars}:w={W}:h={bars}:color=black:t=fill" if bars else ""
    filters.append(
        f"[{vlast}]null{letterbox},fade=in:st=0:d=1.0,"
        f"subtitles=filename='{ass_path}',format=yuv420p[vout]")

    # 배경 소리 = 현장음 (+ BGM)
    next_input = n
    bed = alast
    bgm = cfg.get("bgm")
    if bgm:
        inputs += ["-stream_loop", "-1", "-i", os.path.join(root, bgm)]
        bv = float(cfg.get("bgm_volume", 0.3))
        filters.append(
            f"[{next_input}:a]atrim=0:{total:.3f},asetpts=PTS-STARTPTS,aresample=48000,"
            f"aformat=channel_layouts=stereo,volume={bv},afade=in:st=0:d=2,"
            f"afade=out:st={total - 4:.3f}:d=4[bgm]")
        filters.append(f"[{alast}][bgm]amix=inputs=2:duration=first:normalize=0[bed]")
        bed = "bed"
        next_input += 1

    # 목소리(내레이션): 장면마다 녹음 파일을 지정한 시점에 얹고, 말하는 동안 배경 소리를 줄인다.
    voices = []
    for sc, st in zip(scenes, scene_starts):
        v = sc.get("voice")
        if not v:
            continue
        if isinstance(v, str):
            v = {"file": v}
        inputs += ["-i", os.path.join(root, v["file"])]
        delay = int((st + float(v.get("at", 0.3))) * 1000)
        filters.append(
            f"[{next_input}:a]aresample=48000,aformat=channel_layouts=stereo,"
            f"highpass=f=80,acompressor=threshold=0.1:ratio=3:attack=5:release=120,"
            f"volume={float(v.get('volume', cfg.get('voice_volume', 1.0)))},"
            f"adelay={delay}|{delay}[vo{len(voices)}]")
        voices.append(f"[vo{len(voices)}]")
        next_input += 1

    aout = bed
    if voices:
        if len(voices) > 1:
            filters.append(f"{''.join(voices)}amix=inputs={len(voices)}:duration=longest:normalize=0[voice]")
        else:
            filters.append(f"{voices[0]}anull[voice]")
        # 목소리가 끝난 뒤에도 배경 소리가 끊기지 않게 전체 길이까지 무음으로 채운다.
        filters.append(f"[voice]apad=whole_dur={total:.3f},asplit=2[voice_mix][voice_raw]")
        # 감지용 신호를 키워서 작은 목소리에도 배경이 확실히(약 10dB) 내려가게 한다.
        filters.append("[voice_raw]volume=8[voice_key]")
        filters.append(f"[{bed}][voice_key]sidechaincompress=threshold=0.08:ratio=4:attack=30:release=500[ducked]")
        filters.append("[ducked][voice_mix]amix=inputs=2:duration=first:normalize=0[withvoice]")
        aout = "withvoice"
    filters.append(f"[{aout}]alimiter=limit=0.9,afade=out:st={total - 2:.3f}:d=2[aout]")

    out = args.output or os.path.join(root, "out", "preview.mp4" if args.preview else "final.mp4")
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-stats", *inputs,
           "-filter_complex", ";\n".join(filters), "-map", "[vout]", "-map", "[aout]",
           "-c:v", "libx264", "-preset", "veryfast" if args.preview else "slow",
           "-crf", "26" if args.preview else "20", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-t", f"{total:.3f}", out]
    print(f"장면 {n}개, 총 길이 {int(total // 60)}분 {total % 60:.1f}초 → {out}", file=sys.stderr)
    if total > MAX_LEN:
        print(f"주의: 목표 길이({MAX_LEN // 60}분)를 넘었습니다. 장면을 줄여주세요.", file=sys.stderr)
    subprocess.run(cmd, check=True)


if __name__ == "__main__":
    main()
