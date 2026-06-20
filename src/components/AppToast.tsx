import React, {useEffect, useRef} from 'react';
import {Animated, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

type ToastType = 'error' | 'success' | 'info';

interface AppToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  type?: ToastType;
}

const CONFIG: Record<ToastType, {icon: string; bg: string; border: string; iconColor: string}> = {
  error:   {icon: 'error-outline',         bg: '#fef2f2', border: '#fecaca', iconColor: '#ef4444'},
  success: {icon: 'check-circle-outline',  bg: '#f0fdf4', border: '#bbf7d0', iconColor: '#22c55e'},
  info:    {icon: 'info-outline',          bg: '#fff7ed', border: '#fed7aa', iconColor: '#f97316'},
};

export function AppToast({message, visible, onHide, type = 'error'}: AppToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const cfg = CONFIG[type];

  useEffect(() => {
    if (visible) {
      translateY.setValue(-100);
      Animated.sequence([
        Animated.spring(translateY, {toValue: 0, useNativeDriver: true, tension: 80, friction: 10}),
        Animated.delay(2200),
        Animated.timing(translateY, {toValue: -100, duration: 220, useNativeDriver: true}),
      ]).start(() => onHide());
    }
  }, [visible, message]);

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 56,
        left: 16,
        right: 16,
        zIndex: 9999,
        transform: [{translateY}],
      }}>
      <View
        style={{
          backgroundColor: cfg.bg,
          borderColor: cfg.border,
          borderWidth: 1,
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingVertical: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
        }}>
        <MaterialIcons name={cfg.icon} size={20} color={cfg.iconColor} />
        <Text style={{flex: 1, fontSize: 13, color: '#374151', fontWeight: '600'}}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}
