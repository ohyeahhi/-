# 감성 다큐 톤 브이로그 편집기

유튜브 롱폼(16:9, 5분 이내) 브이로그를 `project.yaml` 하나로 렌더링합니다.
담백한 고딕 내레이션 자막, 화면 속 영어 키워드, 차분한 푸른 톤의 색감을 기본으로 합니다.

## 폴더 구조 (내 영상은 `vlog/my-vlog/`에)
```
vlog/my-vlog/
├── project.yaml   # 장면 순서·자막·키워드 (Claude가 작성)
├── footage/       # 촬영 영상 (mp4, mov)
├── voice/         # 내 목소리 녹음 (m4a, mp3, wav) — 장면별로 01.m4a, 02.m4a …
└── music/         # 배경음악 (선택)
```

## 들어가는 연출
- **색감**: `look: cool`(차분한 푸른 톤, 기본) 또는 `warm`(따뜻한 필름 톤)
- **자막**: 하단 중앙 흰색 고딕(또는 명조) 내레이션, 은은한 그림자
- **키워드**: 화면 속 원하는 위치에 영어 단어가 하나씩 떠오름 (색·크기 지정 가능)
- **화면**: 장면마다 천천히 다가가는 슬로 줌, 0.6초 크로스페이드, 선택 시 시네마 레터박스
- **구성**: 검은 화면 오프닝 타이틀 → 장면들 → 엔딩 문구
- **소리**: 현장음 + 배경음악 + 내 목소리. 목소리가 나오는 동안 배경 소리가 자동으로 약 10dB 줄어듦

## 사용법
```bash
./vlog/setup.sh                                          # 처음 한 번 (ffmpeg, 한글 폰트)
python3 vlog/render.py vlog/demo/project.yaml --preview  # 빠른 미리보기
python3 vlog/render.py vlog/demo/project.yaml            # 최종본 → vlog/demo/out/final.mp4
```

데모의 `footage/` 영상은 스타일 확인용 임시 클립입니다(`vlog/demo/make_footage.sh`로 생성).
설정 항목은 `vlog/demo/project.yaml`의 주석을 참고하세요.
