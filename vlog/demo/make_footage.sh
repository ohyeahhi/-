#!/usr/bin/env bash
# 스타일 확인용 임시 영상(그라디언트 + 잔잔한 현장음)을 만든다. 실제 촬영본으로 교체하면 된다.
set -euo pipefail
cd "$(dirname "$0")/footage"
mk() { # 이름 색1 색2 색3
  ffmpeg -y -hide_banner -loglevel error \
    -f lavfi -i "gradients=s=1920x1080:r=30:d=9:c0=$2:c1=$3:c2=$4:nb_colors=3:speed=0.008" \
    -f lavfi -i "anoisesrc=d=9:c=brown:a=0.04" \
    -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a aac -shortest "$1.mp4"
}
mk morning "0xF6D7A7" "0xC9A27E" "0x6E8CA0"
mk cafe    "0x8A5A3C" "0xD9B48F" "0x3B2A20"
mk walk    "0x7FA38A" "0xD8E3C8" "0x4A6B5A"
mk night   "0x1B2440" "0x3D4C7A" "0xE0A96D"
