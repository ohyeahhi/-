#!/usr/bin/env bash
# 렌더링에 필요한 도구 설치 (ffmpeg, 한글 폰트, PyYAML)
set -euo pipefail
apt-get update -qq
apt-get install -y -qq --no-install-recommends ffmpeg fonts-noto-cjk python3-yaml
