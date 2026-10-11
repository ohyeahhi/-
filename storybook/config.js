// 가족 공유 링크용 서버 설정이에요. 만드는 방법은 SETUP-공유.md에 있어요.
// 비워 두면 앱은 그대로 쓸 수 있고, "보내기"를 누르면 서버 연결 안내만 떠요.
export const CONFIG = {
  supabaseUrl: 'https://xnnqmrinympbkutpzevb.supabase.co',
  supabaseAnonKey: 'sb_publishable_Y-zsr0RngIcT91PiIUPlew_IaUTTDxF',  // Supabase의 publishable 키(sb_publishable_…) 또는 anon 키 (공개해도 되는 키예요)
  bucket: 'shares',
  // 토스페이먼츠 클라이언트 키 (test_ck_… 또는 live_ck_…). 공개해도 되는 키예요. SETUP-결제.md 참고.
  // 비워 두면 주문서까지만 보이고 "결제가 아직 연결되지 않았어요" 안내가 떠요.
  tossClientKey: '',
};
