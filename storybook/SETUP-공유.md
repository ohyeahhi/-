# 가족 공유 링크 설정하기 (Supabase)

"보내기"로 만든 링크가 작동하려면 녹음 파일을 올릴 저장소가 필요해요.
Supabase 무료 요금제로 시작할 수 있고, 15분 정도 걸려요.

## 1. 프로젝트 만들기
1. [supabase.com](https://supabase.com)에 가입하고 **New project**를 눌러요.
2. Region은 **Northeast Asia (Seoul)** 을 고르면 한국에서 빨라요.

## 2. 녹음 저장소(버킷) 만들기
**Storage → New bucket**
- Name: `shares`
- **Public bucket: 켬** (링크를 아는 사람이 들을 수 있게)
- Additional configuration
  - Restrict file upload size: **10 MB** (얼굴 영상은 한 쪽에 최대 1분 30초, 약 7MB)
  - Allowed MIME types: `audio/mp4, audio/webm, audio/ogg, video/mp4, video/webm, application/json`

> 이미 버킷을 만들었다면: Storage → `shares` 옆 ⋮ → **Edit bucket**에서 위 두 값을 바꿔 주세요.
> 영상 형식을 허용하지 않으면 얼굴 영상을 녹화한 동화는 "올리지 못했어요"가 떠요.

## 3. 올리기 권한 주기
**SQL Editor**에서 아래를 실행해요. 누구나 *올리기만* 할 수 있고, 목록 보기·고치기·지우기는 못 해요.
`supabase/storage.sql` 내용을 붙여 넣고 **Run** 해요. 앱이 쓰는 모양의 파일 이름(공유 ID 12자/쪽 번호.m4a 등)만 올릴 수 있어서, 남이 아무 파일이나 올려 두는 저장소로 쓸 수 없어요.
> 예전에 `with check (bucket_id = 'shares')` 만 있는 규칙을 만들었다면, 이 파일을 실행하면 새 규칙으로 바뀌어요.

## 4. 앱에 연결하기
**Project Settings → API Keys**에서 두 값을 복사해 `config.js`에 넣어요.
```js
export const CONFIG = {
  supabaseUrl: 'https://<프로젝트ID>.supabase.co',
  supabaseAnonKey: 'sb_publishable_…',   // 예전 프로젝트라면 anon 키(eyJ…)도 돼요
  bucket: 'shares',
};
```
이 키는 브라우저에 공개되는 용도라 저장소에 올려도 괜찮아요. **service_role / secret 키는 절대 넣지 마세요.**

## 5. https 주소에 올리기
마이크와 공유는 `https`에서만 작동해요. `storybook` 폴더를 GitHub Pages, Netlify, Vercel 중 하나에 올리면 돼요.

## 알아둘 점 (시제품 단계)
- **링크를 아는 사람은 누구나 들을 수 있어요.** 공유 ID는 무작위 12글자라 추측하기는 어려워요.
- 지금은 로그인 없이 누구나 이 버킷에 파일을 올릴 수 있어요. 크기와 형식을 제한해 두었지만, 정식 출시 전에는 로그인이나 서버 함수를 거쳐 올리도록 바꿔야 해요.
- 녹음 삭제 기능은 아직 없어요. 지우려면 Supabase 대시보드의 Storage에서 해당 폴더를 지우면 돼요.
- 동화 한 편(7쪽) 녹음은 목소리만이면 대략 0.5~1MB, 얼굴 영상까지 담으면 10~20MB예요. 무료 요금제(1GB)로 목소리만이면 1,000편 이상, 영상이면 50~100편 정도예요.
