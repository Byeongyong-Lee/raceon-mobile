import React, {useEffect} from 'react';
import {Modal, Text, TouchableOpacity, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

type ToastType = 'error' | 'success' | 'info';

interface AppToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  type?: ToastType;
}

const CONFIG: Record<ToastType, {icon: string; iconColor: string; btnColor: string}> = {
  error:   {icon: 'error-outline',        iconColor: '#ef4444', btnColor: '#f97316'},
  success: {icon: 'check-circle-outline', iconColor: '#22c55e', btnColor: '#f97316'},
  info:    {icon: 'info-outline',         iconColor: '#f97316', btnColor: '#f97316'},
};

export function AppToast({message, visible, onHide, type = 'error'}: AppToastProps) {
  const cfg = CONFIG[type];

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onHide, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, message]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onHide}>
      <TouchableOpacity
        style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40}}
        activeOpacity={1}
        onPress={onHide}>
        <TouchableOpacity activeOpacity={1} style={{width: '100%'}}>
          <View style={{backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden'}}>
            <View style={{paddingTop: 24, paddingBottom: 16, paddingHorizontal: 20, alignItems: 'center', gap: 10}}>
              <MaterialIcons name={cfg.icon} size={36} color={cfg.iconColor} />
              <Text style={{fontSize: 14, color: '#374151', textAlign: 'center', lineHeight: 21, fontWeight: '500'}}>
                {message}
              </Text>
            </View>
            <View style={{height: 1, backgroundColor: '#f3f4f6'}} />
            <TouchableOpacity onPress={onHide} style={{paddingVertical: 14, alignItems: 'center'}}>
              <Text style={{fontSize: 15, fontWeight: '700', color: cfg.btnColor}}>확인</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
