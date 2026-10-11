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
  - Restrict file upload size: **5 MB**
  - Allowed MIME types: `audio/mp4, audio/webm, audio/ogg, application/json`

## 3. 올리기 권한 주기
**SQL Editor**에서 아래를 실행해요. 누구나 *올리기만* 할 수 있고, 목록 보기·고치기·지우기는 못 해요.
```sql
create policy "가족 공유: 올리기만 허용"
on storage.objects for insert to anon
with check (bucket_id = 'shares');
```

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
- 동화 한 편(7쪽) 녹음은 대략 0.5~1MB예요. 무료 요금제 저장 용량(1GB) 안에서 1,000편 이상 올릴 수 있어요.
