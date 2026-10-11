# 그림책 주문·결제 설정하기 (토스페이먼츠 + Supabase)

앱의 "인쇄된 책 주문하기"가 실제로 결제되려면 아래 세 가지가 필요해요.
**테스트 결제는 사업자 등록 없이 바로 해볼 수 있어요.** (실제 카드에서 돈이 빠져나가지 않아요)

## 1. 토스페이먼츠 테스트 키 받기 (5분)
1. [developers.tosspayments.com](https://developers.tosspayments.com) 에 가입해요.
2. **API 키** 메뉴에서 **API 개별 연동 키**의 두 값을 확인해요.
   - 클라이언트 키 `test_ck_…` → 앱에 넣어요 (공개해도 되는 키)
   - 시크릿 키 `test_sk_…` → **서버(Supabase)에만** 넣어요. 채팅·코드에 절대 붙이지 마세요.

## 2. 주문 표 만들기
Supabase → **SQL Editor** 에 `supabase/orders.sql` 내용을 붙여넣고 **Run**.
주소·전화번호가 담긴 표라서, 브라우저에서는 읽지도 쓰지도 못하게 막아 두었어요.

## 3. 주문 서버(Edge Function) 올리기
Supabase → **Edge Functions** → **Deploy a new function** → **Via Editor**
1. 이름: `orders`
2. 코드: `supabase/functions/orders/index.ts` 내용을 그대로 붙여넣고 **Deploy**
3. 함수 설정(Details)에서 **Verify JWT(Enforce JWT verification) 끄기**
   - 앱이 쓰는 publishable 키는 JWT 가 아니라서, 켜 두면 주문이 막혀요.
   - 금액·주문 확인은 함수 안에서 직접 해요.
4. **Edge Functions → Secrets** 에 추가: `TOSS_SECRET_KEY` = `test_sk_…`

## 4. 앱에 클라이언트 키 넣기
`config.js` 의 `tossClientKey` 에 `test_ck_…` 를 넣어요. (저에게 보내 주셔도 돼요)

## 주문이 들어오면
- Supabase → **Table Editor → orders** 에서 확인해요. `status` 가 `paid` 인 주문이 결제 완료예요.
- 인쇄용 책: 앱 주소 뒤에 `#/print/<share_id>` 를 붙여 열고 **인쇄 → PDF로 저장** (A5 가로, 여백 없음, 배경 그래픽 켜기)
  - 예) `https://ohyeahhi.github.io/-/storybook/#/print/abcd1234efgh`
- 보낸 뒤에는 `status` 를 `shipped` 로 바꿔 두면 관리하기 편해요.

## 실제로 돈을 받으려면 (출시 전)
1. **사업자 등록** → 토스페이먼츠 **전자결제 계약** (심사 며칠~2주)
2. 키를 `live_ck_…` / `live_sk_…` 로 바꿔요.
3. **통신판매업 신고**, 이용약관·개인정보처리방침·환불 규정 페이지를 준비해요.
   - 주문 제작 상품은 제작 시작 후 청약철회가 제한될 수 있지만, 그 사실을 **결제 전에 분명히 알려야** 해요. (주문서에 안내 문구와 동의 체크를 넣어 두었어요)
