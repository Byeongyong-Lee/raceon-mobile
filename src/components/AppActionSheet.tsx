import React from 'react';
import {Modal, Text, TouchableOpacity, View} from 'react-native';

export interface SheetOption {
  text: string;
  style?: 'default' | 'destructive' | 'cancel';
  onPress?: () => void;
}

interface AppActionSheetProps {
  visible: boolean;
  title?: string;
  options: SheetOption[];
  onClose: () => void;
}

export function AppActionSheet({visible, title, options, onClose}: AppActionSheetProps) {
  const mainOptions = options.filter(o => o.style !== 'cancel');
  const cancelOption = options.find(o => o.style === 'cancel');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40}}
        activeOpacity={1}
        onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={{width: '100%'}}>
          {/* 메인 카드 */}
          <View style={{backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 8}}>
            {title ? (
              <>
                <View style={{paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center'}}>
                  <Text style={{fontSize: 13, fontWeight: '600', color: '#9ca3af', textAlign: 'center'}}>
                    {title}
                  </Text>
                </View>
                <View style={{height: 1, backgroundColor: '#f3f4f6'}} />
              </>
            ) : null}
            {mainOptions.map((opt, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <View style={{height: 1, backgroundColor: '#f3f4f6'}} />}
                <TouchableOpacity
                  onPress={() => {
                    onClose();
                    opt.onPress?.();
                  }}
                  style={{paddingVertical: 16, paddingHorizontal: 16, alignItems: 'center'}}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: opt.style === 'destructive' ? '700' : '600',
                      color: opt.style === 'destructive' ? '#ef4444' : '#f97316',
                    }}>
                    {opt.text}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
          {/* 취소 버튼 (별도 카드) */}
          <TouchableOpacity
            onPress={onClose}
            style={{backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, alignItems: 'center'}}>
            <Text style={{fontSize: 15, fontWeight: '600', color: '#6b7280'}}>
              {cancelOption?.text ?? '취소'}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
