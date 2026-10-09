# 다큐 톤 브이로그 편집기

EBS 다큐멘터리 느낌의 유튜브 롱폼(16:9, 5분 이내) 브이로그를 `project.yaml` 하나로 렌더링합니다.

## 들어가는 연출
- **색감**: 따뜻하고 차분한 필름 톤(채도·대비를 낮추고 블랙을 살짝 띄움), 비네팅, 옅은 필름 그레인
- **화면**: 2.39:1 시네마 레터박스, 장면마다 천천히 다가가는 슬로 줌, 0.6초 크로스페이드
- **자막**: 명조체 내레이션 자막(아래 검은 띠 안), 챕터 카드(`AM 07:12` + `하루의 시작`), 좌측 하단 장소 표기
- **구성**: 검은 화면의 오프닝 타이틀 → 장면들 → 엔딩 문구
- **소리**: 현장음, 배경음악(선택), 장면 사이 오디오 크로스페이드, 끝부분 페이드아웃

## 사용법
```bash
./vlog/setup.sh                                          # 처음 한 번
python3 vlog/render.py vlog/demo/project.yaml --preview  # 빠른 미리보기
python3 vlog/render.py vlog/demo/project.yaml            # 최종본 → vlog/demo/out/final.mp4
```

데모의 `footage/` 영상은 스타일 확인용 임시 클립입니다(`vlog/demo/make_footage.sh`로 생성).
실제 촬영본을 쓰려면 새 폴더에 `footage/`와 `project.yaml`을 만들고, 장면마다 `clip`, `start`, `end`를 적으면 됩니다.
설정 항목은 `vlog/demo/project.yaml`의 주석을 참고하세요.
