#!/usr/bin/env python3
"""다큐멘터리 톤 유튜브 롱폼(16:9) 브이로그 렌더러.

project.yaml 하나에 장면 순서, 챕터 카드, 내레이션 자막을 적으면
컷 편집 → 16:9 리프레임 → 슬로 줌 → 색보정/필름 그레인 → 크로스페이드
→ 자막 → BGM 믹스까지 ffmpeg 한 번으로 렌더링한다.

사용법:
    python3 vlog/render.py vlog/project.yaml [-o out.mp4] [--preview]
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

# EBS 다큐풍 그레이드: 살짝 따뜻하고, 채도와 대비는 낮추고, 블랙을 들어 올린 필름 톤.
GRADE = ",".join([
    "eq=contrast=0.94:saturation=0.86:gamma=1.02",
    "curves=master='0/0.045 0.25/0.24 0.5/0.5 0.75/0.77 1/0.96'",
    "colorbalance=rs=0.025:gs=0.005:bs=-0.03:rh=0.02:bh=-0.025",
    "vignette=angle=PI/5",
    "noise=alls=3:allf=t",
])


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


def build_ass(cfg, timeline, total, bars):
    # 레터박스가 있으면 자막을 아래 검은 띠 한가운데에 둔다.
    cap_tags = f"\\an5\\pos({W // 2},{H - bars // 2})" if bars else f"\\an2\\pos({W // 2},{H - 70})"
    lines = [
        "[Script Info]", "ScriptType: v4.00+", f"PlayResX: {W}", f"PlayResY: {H}",
        "WrapStyle: 0", "ScaledBorderAndShadow: yes", "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, "
        "BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, "
        "BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
        f"Style: Caption,{SERIF},44,&H00F0F0F0,&H00FFFFFF,&H90000000,&HA0000000,0,0,0,0,100,100,1,0,1,1.5,0,2,160,160,0,1",
        f"Style: Kicker,{SANS},26,&H30FFFFFF,&H00FFFFFF,&HB0000000,&HA0000000,0,0,0,0,100,100,8,0,1,1,0,5,60,60,0,1",
        f"Style: Chapter,{SERIF},72,&H00FFFFFF,&H00FFFFFF,&H90000000,&HA0000000,1,0,0,0,100,100,4,0,1,2,0,5,60,60,0,1",
        f"Style: Title,{SERIF},96,&H00FFFFFF,&H00FFFFFF,&H90000000,&HA0000000,1,0,0,0,100,100,8,0,1,2,0,5,60,60,0,1",
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
        ev(t0, t1, "Title", cfg["title"], f"\\an5\\pos({cx},{cy - 20})\\fad(1000,800)\\blur0.6")
        if cfg.get("subtitle"):
            ev(t0 + 0.6, t1, "Kicker", cfg["subtitle"], f"\\an5\\pos({cx},{cy + 75})\\fad(1000,800)")

    for scene, (start, dur) in zip(cfg["scenes"], timeline):
        ch = scene.get("chapter")
        if ch:
            a, b = start + 0.4, start + min(3.5, dur - 0.2)
            if ch.get("time"):
                ev(a, b, "Kicker", ch["time"], f"\\an5\\pos({cx},{cy - 75})\\fad(700,600)")
            if ch.get("text"):
                ev(a + 0.25, b, "Chapter", ch["text"], f"\\an5\\pos({cx},{cy + 10})\\fad(800,600)\\blur0.5")
        if scene.get("place"):
            # 좌측 하단 장소 표기 (다큐 로워서드)
            a = start + (3.8 if ch else 0.6)
            if a + 1.5 < start + dur:
                ev(a, min(a + 3.5, start + dur - 0.2), "Place", scene["place"],
                   f"\\an1\\pos(110,{H - (bars + 60 if bars else 150)})\\fad(500,500)")
        for cap in scene.get("captions", []):
            a = start + float(cap.get("at", 0))
            b = min(a + float(cap.get("dur", 3.0)), start + dur)
            ev(a, b, "Caption", cap["text"], f"{cap_tags}\\fad(250,250)")

    if cfg.get("ending"):
        ev(total - ENDING_DUR + 0.4, total - 0.3, "Chapter", cfg["ending"],
           f"\\an5\\pos({cx},{cy})\\fad(1000,800)")
    return "\n".join(lines) + "\n"


def scene_video_chain(idx, scene, dur, preview):
    zoom = float(scene.get("zoom", 0.04))   # 장면 동안 확대되는 비율 (0이면 고정)
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
    chain += [f"scale={W}:{H}", "format=yuv420p", GRADE, "setsar=1"]
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
    # 시네마 레터박스(2.39:1) 위아래 검은 띠 높이
    bars = int(round((H - W / 2.39) / 2)) if cfg.get("letterbox", True) else 0

    inputs, filters, timeline = [], [], []
    for i, sc in enumerate(scenes):
        path = os.path.join(root, sc["clip"])
        length, has_audio = probe(path)
        sc["start"] = float(sc.get("start", 0.0))
        sc["end"] = min(float(sc.get("end", length)), length)
        dur = sc["end"] - sc["start"]
        inputs += ["-i", path]
        filters.append(scene_video_chain(i, sc, dur, args.preview))
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

    # BGM: 페이드 인/아웃 후 현장음 아래에 깐다.
    aout = alast
    bgm = cfg.get("bgm")
    if bgm:
        inputs += ["-stream_loop", "-1", "-i", os.path.join(root, bgm)]
        bv = float(cfg.get("bgm_volume", 0.3))
        filters.append(
            f"[{n}:a]atrim=0:{total:.3f},asetpts=PTS-STARTPTS,aresample=48000,"
            f"aformat=channel_layouts=stereo,volume={bv},afade=in:st=0:d=2,"
            f"afade=out:st={total - 4:.3f}:d=4[bgm]")
        filters.append(f"[{alast}][bgm]amix=inputs=2:duration=first:normalize=0[amix]")
        aout = "amix"
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
