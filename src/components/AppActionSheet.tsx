import React from 'react';
import {Modal, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{flex: 1}}>
        <TouchableOpacity
          style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.45)'}}
          activeOpacity={1}
          onPress={onClose}
        />
        <SafeAreaView
          edges={['bottom']}
          style={{
            backgroundColor: '#f9fafb',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}>
          {/* 핸들 */}
          <View style={{alignItems: 'center', paddingTop: 12, paddingBottom: 4}}>
            <View style={{width: 40, height: 4, borderRadius: 2, backgroundColor: '#d1d5db'}} />
          </View>
          {title ? (
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: '#9ca3af',
                textAlign: 'center',
                paddingVertical: 8,
                paddingHorizontal: 16,
              }}>
              {title}
            </Text>
          ) : (
            <View style={{height: 8}} />
          )}
          {/* 옵션 목록 */}
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              marginHorizontal: 16,
              overflow: 'hidden',
            }}>
            {mainOptions.map((opt, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <View style={{height: 1, backgroundColor: '#f3f4f6'}} />}
                <TouchableOpacity
                  onPress={() => {
                    onClose();
                    opt.onPress?.();
                  }}
                  style={{paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center'}}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: opt.style === 'destructive' ? '700' : '500',
                      color: opt.style === 'destructive' ? '#ef4444' : '#111827',
                    }}>
                    {opt.text}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
          {/* 취소 버튼 */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              marginHorizontal: 16,
              marginTop: 8,
              marginBottom: 8,
              backgroundColor: '#fff',
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: 'center',
            }}>
            <Text style={{fontSize: 15, fontWeight: '600', color: '#6b7280'}}>
              {cancelOption?.text ?? '취소'}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
