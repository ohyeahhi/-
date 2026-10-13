#!/bin/sh
# 워크북에 쓰는 글꼴 Pretendard(OFL)를 fonts/ 에 내려받습니다.
set -e
cd "$(dirname "$0")" && mkdir -p fonts
for w in Regular Medium SemiBold Bold ExtraBold; do
  curl -sS -o "fonts/Pretendard-$w.otf" "https://raw.githubusercontent.com/orioncactus/pretendard/main/packages/pretendard/dist/public/static/Pretendard-$w.otf"
done
