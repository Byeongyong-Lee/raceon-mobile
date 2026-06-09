import React, {useEffect, useRef} from 'react';
import {Animated, Modal, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {ClipPath, Defs, G, Path} from 'react-native-svg';
import {SocialProvider} from '../types';

function GoogleLogo() {
  return (
    <Svg width={24} height={24} viewBox="0 0 48 48">
      <Defs>
        <ClipPath id="g">
          <Path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#g)">
        <Path d="M0 37V11l17 13z" fill="#FBBC05" />
        <Path d="M0 11l17 13 7-6.1L48 14V0H0z" fill="#EA4335" />
        <Path d="M0 37l30-23 7.9 1L48 0v48H0z" fill="#34A853" />
        <Path d="M48 48L17 24l-4-3 35-10z" fill="#4285F4" />
      </G>
    </Svg>
  );
}

function NaverLogo() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        d="M1.6 0S0 0 0 1.6v20.8S0 24 1.6 24h20.8s1.6 0 1.6-1.6V1.6S24 0 22.4 0zm3.415 5.6h4.78l4.425 6.458V5.6h4.765v12.8h-4.78L9.78 11.943V18.4H5.015Z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

function KakaoLogo() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3"
        fill="#3C1E1E"
      />
    </Svg>
  );
}

type Props = {
  visible: boolean;
  onClose: () => void;
  onLogin: (provider: SocialProvider) => void;
};

export default function LoginSheet({visible, onClose, onLogin}: Props) {
  const {bottom: bottomInset} = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 22,
        stiffness: 220,
      }).start();
    } else {
      slideAnim.setValue(600);
    }
  }, [visible, slideAnim]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}>
      <View style={{flex: 1, justifyContent: 'flex-end'}}>
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
          }}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View style={{transform: [{translateY: slideAnim}]}}>
          <View className="rounded-t-3xl bg-white px-6 pt-4" style={{paddingBottom: Math.max(bottomInset, 24) + 16}}>
            <View className="mb-8 h-1 w-10 self-center rounded-full bg-gray-200" />

            <View className="mb-8 items-center">
              <View className="mb-3 flex-row items-center">
                <Text className="text-2xl font-black text-orange-500">Race</Text>
                <Text className="text-2xl font-black text-gray-900">On</Text>
              </View>
              <Text className="text-base font-semibold text-gray-800">
                로그인하고 대회를 관리해보세요
              </Text>
              <Text className="mt-1 text-sm text-gray-400">
                대회 신청·D-day 알림·일정 관리
              </Text>
            </View>

            {/* Google */}
            <TouchableOpacity
              onPress={() => onLogin('google')}
              activeOpacity={0.85}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                height: 56,
                borderRadius: 16,
                backgroundColor: '#FFFFFF',
                borderWidth: 1.5,
                borderColor: '#E5E7EB',
                marginBottom: 12,
                elevation: 1,
                shadowColor: '#000',
                shadowOpacity: 0.06,
                shadowRadius: 4,
                shadowOffset: {width: 0, height: 2},
              }}>
              <GoogleLogo />
              <Text style={{marginLeft: 12, fontSize: 15, fontWeight: '600', color: '#374151'}}>
                Google로 로그인
              </Text>
            </TouchableOpacity>

            {/* Naver */}
            <TouchableOpacity
              onPress={() => onLogin('naver')}
              activeOpacity={0.85}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                height: 56,
                borderRadius: 16,
                backgroundColor: '#03C75A',
                marginBottom: 12,
              }}>
              <NaverLogo />
              <Text style={{marginLeft: 12, fontSize: 15, fontWeight: '600', color: '#FFFFFF'}}>
                네이버로 로그인
              </Text>
            </TouchableOpacity>

            {/* Kakao */}
            <TouchableOpacity
              onPress={() => onLogin('kakao')}
              activeOpacity={0.85}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                height: 56,
                borderRadius: 16,
                backgroundColor: '#FEE500',
              }}>
              <KakaoLogo />
              <Text style={{marginLeft: 12, fontSize: 15, fontWeight: '600', color: '#3C1E1E'}}>
                카카오로 로그인
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
