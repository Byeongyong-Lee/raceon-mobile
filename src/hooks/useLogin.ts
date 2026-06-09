import NaverLogin, {NaverLoginResponse} from '@react-native-seoul/naver-login';
import {login as kakaoLogin, me as getKakaoMe} from '@react-native-kakao/user';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {useUser} from '../context/UserContext';
import {SocialProvider} from '../types';

export function useLogin(onSuccess?: () => void) {
  const {setUser} = useUser();

  const handleLogin = async (provider: SocialProvider) => {
    try {
      if (provider === 'naver') {
        const result: NaverLoginResponse = await NaverLogin.login();
        if (result.isSuccess && result.successResponse) {
          const token = result.successResponse.accessToken;
          const profile = await NaverLogin.getProfile(token);
          if (profile.message === 'success') {
            setUser({
              name: profile.response.name ?? '네이버 사용자',
              imageUrl: profile.response.profile_image ?? null,
            });
            onSuccess?.();
          }
        }
        return;
      }
      if (provider === 'kakao') {
        await kakaoLogin();
        const profile = await getKakaoMe();
        setUser({
          name: profile.nickname ?? '카카오 사용자',
          imageUrl: profile.profileImageUrl ?? null,
        });
        onSuccess?.();
        return;
      }
      if (provider === 'google') {
        await GoogleSignin.hasPlayServices();
        const response = await GoogleSignin.signIn();
        if (response.type === 'success') {
          const {name, photo} = response.data.user;
          setUser({
            name: name ?? 'Google 사용자',
            imageUrl: photo ?? null,
          });
          onSuccess?.();
        }
      }
    } catch (e) {
      console.error(`[Login] ${provider} 로그인 실패:`, e);
    }
  };

  return {handleLogin};
}
