#!/bin/sh
# 워크북에 쓰는 글꼴(Gowun Batang, Noto Sans KR, 둘 다 OFL)을 fonts/ 에 내려받습니다.
set -e
cd "$(dirname "$0")" && mkdir -p fonts
curl -sS -o fonts/GowunBatang-400.ttf https://fonts.gstatic.com/s/gowunbatang/v12/ijwSs5nhRMIjYsdSgcMa3wRhXA.ttf
curl -sS -o fonts/GowunBatang-700.ttf https://fonts.gstatic.com/s/gowunbatang/v12/ijwNs5nhRMIjYsdSgcMa3wRZ4J7awg.ttf
curl -sS -o fonts/NotoSansKR-400.ttf https://fonts.gstatic.com/s/notosanskr/v40/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuoyeLQ.ttf
curl -sS -o fonts/NotoSansKR-500.ttf https://fonts.gstatic.com/s/notosanskr/v40/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzztgyeLQ.ttf
curl -sS -o fonts/NotoSansKR-700.ttf https://fonts.gstatic.com/s/notosanskr/v40/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzg01eLQ.ttf
