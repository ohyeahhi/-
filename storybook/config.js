// 가족 공유 링크용 서버 설정이에요. 만드는 방법은 SETUP-공유.md에 있어요.
// 비워 두면 앱은 그대로 쓸 수 있고, "보내기"를 누르면 서버 연결 안내만 떠요.
export const CONFIG = {
  supabaseUrl: 'https://xnnqmrinympbkutpzevb.supabase.co',
  supabaseAnonKey: 'sb_publishable_Y-zsr0RngIcT91PiIUPlew_IaUTTDxF',  // Supabase의 publishable 키(sb_publishable_…) 또는 anon 키 (공개해도 되는 키예요)
  bucket: 'shares',
  // 토스페이먼츠 클라이언트 키 (test_ck_… 또는 live_ck_…). 공개해도 되는 키예요. SETUP-결제.md 참고.
  // 비워 두면 주문서까지만 보이고 "결제가 아직 연결되지 않았어요" 안내가 떠요.
  tossClientKey: '',
  // 시범 기간 로그인: 여기 있는 아이디·비밀번호를 아는 사람만 앱을 열 수 있어요. 비우면([]) 로그인 없이 열려요.
  // 비밀번호는 그대로 적지 않고 암호처럼 바꾼 값(salt·hash)만 적어요. 새 계정은 tools/make_login.py 로 만들어요.
  access: [
    { id: 'tester', salt: '65109cceefcecb6b9276ef2236c6cc9e', hash: '2172038ae0c2b39cee7aefca665f8324f3421db362e36156844c071ee7faa7bb' },
  ],
};
