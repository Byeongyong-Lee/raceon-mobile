import React from 'react';
import {Modal, Text, TouchableOpacity, View} from 'react-native';

interface AppConfirmModalProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AppConfirmModal({
  visible,
  title,
  message,
  confirmText = '확인',
  danger = false,
  onConfirm,
  onCancel,
}: AppConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 32,
        }}>
        <View
          style={{
            width: '100%',
            backgroundColor: '#fff',
            borderRadius: 20,
            padding: 24,
          }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: '#111827',
              textAlign: 'center',
            }}>
            {title}
          </Text>
          {message ? (
            <Text
              style={{
                fontSize: 13,
                color: '#6b7280',
                textAlign: 'center',
                marginTop: 8,
                lineHeight: 20,
              }}>
              {message}
            </Text>
          ) : null}
          <View style={{flexDirection: 'row', gap: 8, marginTop: 20}}>
            <TouchableOpacity
              onPress={onCancel}
              style={{
                flex: 1,
                paddingVertical: 13,
                borderRadius: 12,
                backgroundColor: '#f3f4f6',
                alignItems: 'center',
              }}>
              <Text style={{fontSize: 14, fontWeight: '600', color: '#6b7280'}}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {onConfirm(); onCancel();}}
              style={{
                flex: 1,
                paddingVertical: 13,
                borderRadius: 12,
                backgroundColor: danger ? '#ef4444' : '#f97316',
                alignItems: 'center',
              }}>
              <Text style={{fontSize: 14, fontWeight: '700', color: '#fff'}}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
