import NaverLogin, {NaverLoginResponse} from '@react-native-seoul/naver-login';
import {login as kakaoLogin, me as getKakaoMe} from '@react-native-kakao/user';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {useUser} from '../context/UserContext';
import {SocialProvider} from '../types';
import {loginWithSocial, parseAuthUser, SocialLoginPayload} from '../services/authApi';

export function useLogin(onSuccess?: () => void) {
  const {setAuth} = useUser();

  const handleLogin = async (provider: SocialProvider) => {
    try {
      let payload: SocialLoginPayload;

      if (provider === 'naver') {
        const result: NaverLoginResponse = await NaverLogin.login();
        if (!result.isSuccess || !result.successResponse) return;
        const profile = await NaverLogin.getProfile(result.successResponse.accessToken);
        if (profile.message !== 'success') return;
        const r = profile.response;
        payload = {
          socialId: r.id,
          nickname: r.name ?? '네이버 사용자',
          profileImage: r.profile_image ?? null,
          gender: r.gender ?? null,
          age: r.age ?? null,
          birthday: r.birthday ?? null,
          phone: r.mobile ?? null,
        };
      } else if (provider === 'kakao') {
        await kakaoLogin();
        const profile = await getKakaoMe();
        payload = {
          socialId: String(profile.id),
          nickname: profile.nickname ?? '카카오 사용자',
          profileImage: profile.profileImageUrl ?? null,
        };
      } else {
        // google
        await GoogleSignin.hasPlayServices();
        const response = await GoogleSignin.signIn();
        if (response.type !== 'success') return;
        const {id, name, photo} = response.data.user;
        payload = {
          socialId: id,
          nickname: name ?? 'Google 사용자',
          profileImage: photo ?? null,
        };
      }

      const authRes = await loginWithSocial(provider, payload);
      setAuth(parseAuthUser(authRes.data), authRes.data.token);
      onSuccess?.();
    } catch (e) {
      console.error(`[Login] ${provider} 로그인 실패:`, e);
    }
  };

  return {handleLogin};
}
