import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Svg, {Path} from 'react-native-svg';
import {launchImageLibrary} from 'react-native-image-picker';
import {RootStackParamList} from '../navigation/RootNavigator';
import CourseBadges from '../components/CourseBadges';
import LoginSheet from '../components/LoginSheet';
import {useUser} from '../context/UserContext';
import {useLogin} from '../hooks/useLogin';
import {formatDate} from '../utils/race';
import {UserRace} from '../types';
import {
  updateUserRaceRecord,
  uploadRecordImage,
  getRecordImageUrl,
} from '../services/userRaceApi';

type Props = NativeStackScreenProps<RootStackParamList, 'RaceDetail'>;

function KakaoMapIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3"
        fill="#3C1E1E"
      />
    </Svg>
  );
}

function NaverMapIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M1.6 0S0 0 0 1.6v20.8S0 24 1.6 24h20.8s1.6 0 1.6-1.6V1.6S24 0 22.4 0zm3.415 5.6h4.78l4.425 6.458V5.6h4.765v12.8h-4.78L9.78 11.943V18.4H5.015Z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

function MapButtons({location}: {location: string}) {
  const query = encodeURIComponent(location);
  return (
    <View className="mx-4 mt-4">
      <Text className="mb-2 text-xs font-semibold text-gray-400">지도에서 보기</Text>
      <View className="flex-row" style={{gap: 10}}>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL(`kakaomap://search?q=${query}`).catch(() =>
              Linking.openURL(`https://map.kakao.com/?q=${query}`),
            )
          }
          activeOpacity={0.8}
          className="flex-1 flex-row items-center justify-center rounded-2xl py-3"
          style={{backgroundColor: '#FEE500'}}>
          <KakaoMapIcon />
          <Text className="ml-2 text-sm font-bold" style={{color: '#3C1E1E'}}>카카오맵</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL(`nmap://search?query=${query}&appname=com.raceonmobile`).catch(() =>
              Linking.openURL(`https://map.naver.com/v5/search/${query}`),
            )
          }
          activeOpacity={0.8}
          className="flex-1 flex-row items-center justify-center rounded-2xl py-3"
          style={{backgroundColor: '#03C75A'}}>
          <NaverMapIcon />
          <Text className="ml-2 text-sm font-bold text-white">네이버맵</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function InfoRow({icon, label, value, onPress}: {
  icon: string;
  label: string;
  value: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      className="flex-row items-center px-4 py-3">
      <MaterialIcons name={icon} size={20} color="#9ca3af" style={{width: 28}} />
      <View className="flex-1">
        <Text className="text-xs text-gray-400">{label}</Text>
        <Text
          className="mt-0.5 text-sm text-gray-800"
          style={{color: onPress ? '#f97316' : '#1f2937'}}>
          {value}
        </Text>
      </View>
      {onPress && <MaterialIcons name="open-in-new" size={16} color="#f97316" />}
    </TouchableOpacity>
  );
}

function RecordSection({
  userRace,
  onUpdate,
}: {
  userRace: UserRace;
  onUpdate: (updated: UserRace) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);

  const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

  useEffect(() => {
    if (userRace.recordImagePath) {
      Image.getSize(
        getRecordImageUrl(userRace.recordImagePath),
        (w, h) => setImageAspectRatio(w / h),
        () => setImageAspectRatio(null),
      );
    }
  }, [userRace.recordImagePath]);
  const [finishYn, setFinishYn] = useState('');
  const [bibNumber, setBibNumber] = useState('');
  const [recordHour, setRecordHour] = useState('');
  const [recordMin, setRecordMin] = useState('');
  const [recordSec, setRecordSec] = useState('');
  const [paceMin, setPaceMin] = useState('');
  const [paceSec, setPaceSec] = useState('');
  const [ranking, setRanking] = useState('');
  const [memo, setMemo] = useState('');

  const hasRecord =
    userRace.finishYn || userRace.bibNumber || userRace.recordTime || userRace.ranking;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const raceDate = new Date(userRace.raceDate);
  raceDate.setHours(0, 0, 0, 0);
  const isRacePast = raceDate <= today;

  const startEditing = () => {
    setFinishYn(userRace.finishYn ?? 'Y');
    setBibNumber(userRace.bibNumber ?? '');
    const [rh = '', rm = '', rs = ''] = (userRace.recordTime ?? '').split(':');
    setRecordHour(rh);
    setRecordMin(rm);
    setRecordSec(rs);
    const [pm = '', ps = ''] = (userRace.pace ?? '').split(':');
    setPaceMin(pm);
    setPaceSec(ps);
    setRanking(userRace.ranking != null ? String(userRace.ranking) : '');
    setMemo(userRace.memo ?? '');
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: {
        bibNumber?: string;
        recordTime?: string;
        pace?: string;
        ranking?: number;
        finishYn?: string;
        memo?: string;
      } = {};
      if (bibNumber.trim()) payload.bibNumber = bibNumber.trim();
      const h = recordHour.padStart(2, '0');
      const m = recordMin.padStart(2, '0');
      const s = recordSec.padStart(2, '0');
      if (recordHour || recordMin || recordSec) payload.recordTime = `${h}:${m}:${s}`;
      const pm = paceMin.padStart(2, '0');
      const ps = paceSec.padStart(2, '0');
      if (paceMin || paceSec) payload.pace = `${pm}:${ps}`;
      if (ranking.trim()) payload.ranking = parseInt(ranking, 10);
      if (finishYn) payload.finishYn = finishYn;
      if (memo.trim()) payload.memo = memo.trim();
      const updated = await updateUserRaceRecord(userRace.userRaceIdx, payload);
      onUpdate(updated);
      setEditing(false);
    } catch {
      // 실패 시 조용히 무시
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.9,
    });
    if (result.didCancel || !result.assets?.[0]) return;
    const asset = result.assets[0];
    if (!asset.uri) return;

    setUploading(true);
    try {
      const updated = await uploadRecordImage(
        userRace.userRaceIdx,
        asset.uri,
        asset.fileName ?? 'record.jpg',
        asset.type ?? 'image/jpeg',
      );
      onUpdate(updated);
    } catch {
      // 실패 시 조용히 무시
    } finally {
      setUploading(false);
    }
  };

  if (editing) {
    return (
      <View
        className="mx-4 mt-4 overflow-hidden rounded-2xl bg-white"
        style={{
          elevation: 1,
          shadowColor: '#000',
          shadowOpacity: 0.04,
          shadowRadius: 4,
          shadowOffset: {width: 0, height: 1},
        }}>
        <View className="px-4 pt-4 pb-2">
          <Text className="text-base font-bold text-gray-900">기록 입력</Text>
        </View>

        {/* 완주 여부 */}
        <View className="px-4 py-2">
          <Text className="mb-1.5 text-xs text-gray-400">완주 여부</Text>
          <View className="flex-row" style={{gap: 8}}>
            {(['Y', 'N'] as const).map(val => (
              <TouchableOpacity
                key={val}
                onPress={() => setFinishYn(finishYn === val ? '' : val)}
                activeOpacity={0.8}
                className="flex-1 items-center rounded-xl py-2.5"
                style={{
                  backgroundColor:
                    finishYn === val ? (val === 'Y' ? '#f97316' : '#6b7280') : '#f3f4f6',
                }}>
                <Text
                  className="text-sm font-bold"
                  style={{color: finishYn === val ? '#fff' : '#9ca3af'}}>
                  {val === 'Y' ? '완주' : '미완주'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="px-4 py-2">
          <Text className="mb-1.5 text-xs text-gray-400">배번호</Text>
          <TextInput
            value={bibNumber}
            onChangeText={v => setBibNumber(v.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
            placeholder="예: A1234"
            placeholderTextColor="#d1d5db"
            autoCapitalize="characters"
            className="rounded-xl bg-gray-50 px-3 py-2.5 text-sm text-gray-800"
          />
        </View>

        <View className="px-4 py-2">
          <Text className="mb-1.5 text-xs text-gray-400">기록</Text>
          <View className="flex-row items-center" style={{gap: 6}}>
            <View className="flex-1 items-center">
              <TextInput
                value={recordHour}
                onChangeText={v => setRecordHour(v.replace(/\D/g, '').slice(0, 2))}
                placeholder="00"
                placeholderTextColor="#d1d5db"
                keyboardType="numeric"
                maxLength={2}
                textAlign="center"
                className="w-full rounded-xl bg-gray-50 py-2.5 text-sm text-gray-800"
              />
              <Text className="mt-1 text-xs text-gray-400">시</Text>
            </View>
            <Text className="mb-4 text-base font-bold text-gray-300">:</Text>
            <View className="flex-1 items-center">
              <TextInput
                value={recordMin}
                onChangeText={v => setRecordMin(v.replace(/\D/g, '').slice(0, 2))}
                placeholder="00"
                placeholderTextColor="#d1d5db"
                keyboardType="numeric"
                maxLength={2}
                textAlign="center"
                className="w-full rounded-xl bg-gray-50 py-2.5 text-sm text-gray-800"
              />
              <Text className="mt-1 text-xs text-gray-400">분</Text>
            </View>
            <Text className="mb-4 text-base font-bold text-gray-300">:</Text>
            <View className="flex-1 items-center">
              <TextInput
                value={recordSec}
                onChangeText={v => setRecordSec(v.replace(/\D/g, '').slice(0, 2))}
                placeholder="00"
                placeholderTextColor="#d1d5db"
                keyboardType="numeric"
                maxLength={2}
                textAlign="center"
                className="w-full rounded-xl bg-gray-50 py-2.5 text-sm text-gray-800"
              />
              <Text className="mt-1 text-xs text-gray-400">초</Text>
            </View>
          </View>
        </View>

        <View className="px-4 py-2">
          <Text className="mb-1.5 text-xs text-gray-400">페이스 (/km)</Text>
          <View className="flex-row items-center" style={{gap: 6}}>
            <View className="flex-1 items-center">
              <TextInput
                value={paceMin}
                onChangeText={v => setPaceMin(v.replace(/\D/g, '').slice(0, 2))}
                placeholder="00"
                placeholderTextColor="#d1d5db"
                keyboardType="numeric"
                maxLength={2}
                textAlign="center"
                className="w-full rounded-xl bg-gray-50 py-2.5 text-sm text-gray-800"
              />
              <Text className="mt-1 text-xs text-gray-400">분</Text>
            </View>
            <Text className="mb-4 text-base font-bold text-gray-300">:</Text>
            <View className="flex-1 items-center">
              <TextInput
                value={paceSec}
                onChangeText={v => setPaceSec(v.replace(/\D/g, '').slice(0, 2))}
                placeholder="00"
                placeholderTextColor="#d1d5db"
                keyboardType="numeric"
                maxLength={2}
                textAlign="center"
                className="w-full rounded-xl bg-gray-50 py-2.5 text-sm text-gray-800"
              />
              <Text className="mt-1 text-xs text-gray-400">초</Text>
            </View>
          </View>
        </View>

        <View className="px-4 py-2">
          <Text className="mb-1.5 text-xs text-gray-400">순위</Text>
          <TextInput
            value={ranking}
            onChangeText={v => setRanking(v.replace(/\D/g, ''))}
            placeholder="예: 523"
            placeholderTextColor="#d1d5db"
            keyboardType="numeric"
            className="rounded-xl bg-gray-50 px-3 py-2.5 text-sm text-gray-800"
          />
        </View>

        <View className="px-4 py-2">
          <Text className="mb-1.5 text-xs text-gray-400">메모</Text>
          <TextInput
            value={memo}
            onChangeText={setMemo}
            placeholder="자유롭게 기록해보세요"
            placeholderTextColor="#d1d5db"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="rounded-xl bg-gray-50 px-3 py-2.5 text-sm text-gray-800"
            style={{minHeight: 72}}
          />
        </View>

        <View className="flex-row px-4 pb-4 pt-2" style={{gap: 8}}>
          <TouchableOpacity
            onPress={() => setEditing(false)}
            activeOpacity={0.7}
            className="flex-1 items-center rounded-xl py-3"
            style={{backgroundColor: '#f3f4f6'}}>
            <Text className="text-sm font-bold text-gray-400">취소</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
            className="flex-1 items-center rounded-xl py-3"
            style={{backgroundColor: '#f97316'}}>
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-sm font-bold text-white">저장</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View
      className="mx-4 mt-4 overflow-hidden rounded-2xl bg-white"
      style={{
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 4,
        shadowOffset: {width: 0, height: 1},
      }}>
      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <Text className="text-base font-bold text-gray-900">내 기록</Text>
        {isRacePast && (
          <TouchableOpacity onPress={startEditing} activeOpacity={0.7} className="flex-row items-center">
            <MaterialIcons name="edit" size={14} color="#f97316" />
            <Text className="ml-1 text-xs font-semibold" style={{color: '#f97316'}}>
              {hasRecord ? '수정' : '기록 입력'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 기록 데이터 */}
      {hasRecord ? (
        <View className="px-4" style={{gap: 8}}>
          {userRace.finishYn && (
            <View
              className="self-start rounded-full px-3 py-1"
              style={{backgroundColor: userRace.finishYn === 'Y' ? '#fff7ed' : '#f3f4f6'}}>
              <Text
                className="text-xs font-bold"
                style={{color: userRace.finishYn === 'Y' ? '#f97316' : '#9ca3af'}}>
                {userRace.finishYn === 'Y' ? '완주' : '미완주'}
              </Text>
            </View>
          )}
          {userRace.bibNumber && (
            <View className="flex-row items-center">
              <Text className="w-16 text-xs text-gray-400">배번호</Text>
              <Text className="text-sm font-semibold text-gray-800">{userRace.bibNumber}</Text>
            </View>
          )}
          {userRace.recordTime && (
            <View className="flex-row items-center">
              <Text className="w-16 text-xs text-gray-400">기록</Text>
              <Text className="text-sm font-semibold text-gray-800">{userRace.recordTime}</Text>
            </View>
          )}
          {userRace.pace && (
            <View className="flex-row items-center">
              <Text className="w-16 text-xs text-gray-400">페이스</Text>
              <Text className="text-sm font-semibold text-gray-800">{userRace.pace} /km</Text>
            </View>
          )}
          {userRace.ranking != null && (
            <View className="flex-row items-center">
              <Text className="w-16 text-xs text-gray-400">순위</Text>
              <Text className="text-sm font-semibold text-gray-800">{userRace.ranking}위</Text>
            </View>
          )}
          {userRace.memo && (
            <View>
              <Text className="mb-1 text-xs text-gray-400">메모</Text>
              <Text className="text-sm text-gray-700">{userRace.memo}</Text>
            </View>
          )}
        </View>
      ) : !isRacePast ? (
        <View className="items-center px-4 pb-6 pt-2">
          <MaterialIcons name="lock-clock" size={32} color="#e5e7eb" />
          <Text className="mt-2 text-sm text-gray-400">대회 당일 이후에 입력할 수 있어요</Text>
        </View>
      ) : (
        <View className="items-center pt-2" style={{paddingBottom: userRace.recordImagePath ? 12 : 0}}>
          <MaterialIcons name="emoji-events" size={32} color="#e5e7eb" />
          <Text className="mt-2 text-sm text-gray-400">아직 기록이 없어요</Text>
          <Text className="mt-0.5 text-xs text-gray-300">대회 후 기록을 입력해보세요</Text>
        </View>
      )}

      {/* 기록증 이미지 */}
      <View className="px-4 pb-4 mt-4">
        <Text className="mb-2 text-xs text-gray-400">기록증</Text>
        {userRace.recordImagePath ? (
          <>
            {/* 전체화면 모달 */}
            <Modal visible={imageModalVisible} transparent animationType="fade">
              <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center'}}>
                <TouchableOpacity
                  style={{position: 'absolute', top: 48, right: 20, zIndex: 10, padding: 8}}
                  onPress={() => setImageModalVisible(false)}
                  activeOpacity={0.7}>
                  <MaterialIcons name="close" size={28} color="#fff" />
                </TouchableOpacity>
                <Image
                  source={{uri: getRecordImageUrl(userRace.recordImagePath)}}
                  style={{
                    width: screenWidth,
                    height: imageAspectRatio
                      ? Math.min(screenWidth / imageAspectRatio, screenHeight)
                      : screenHeight * 0.8,
                  }}
                  resizeMode="contain"
                />
              </View>
            </Modal>

            {/* 썸네일 */}
            <TouchableOpacity onPress={() => setImageModalVisible(true)} activeOpacity={0.9}>
              <Image
                source={{uri: getRecordImageUrl(userRace.recordImagePath)}}
                className="w-full rounded-xl"
                style={{
                  height: imageAspectRatio
                    ? Math.min((screenWidth - 32) / imageAspectRatio, 220)
                    : 160,
                }}
                resizeMode="cover"
              />
              <View
                style={{position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', alignItems: 'center'}}>
                <MaterialIcons name="zoom-in" size={14} color="#fff" />
                <Text style={{color: '#fff', fontSize: 11, marginLeft: 4}}>크게 보기</Text>
              </View>
            </TouchableOpacity>

            {isRacePast && (
              <TouchableOpacity
                onPress={handleUploadImage}
                disabled={uploading}
                activeOpacity={0.8}
                className="mt-2 flex-row items-center justify-center rounded-xl py-2.5"
                style={{backgroundColor: '#f3f4f6'}}>
                {uploading ? (
                  <ActivityIndicator size="small" color="#9ca3af" />
                ) : (
                  <>
                    <MaterialIcons name="photo-camera" size={16} color="#9ca3af" />
                    <Text className="ml-1.5 text-xs font-semibold text-gray-400">사진 변경</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </>
        ) : isRacePast ? (
          <TouchableOpacity
            onPress={handleUploadImage}
            disabled={uploading}
            activeOpacity={0.8}
            className="flex-row items-center justify-center rounded-xl py-4"
            style={{backgroundColor: '#fff7ed', borderWidth: 1.5, borderColor: '#fed7aa', borderStyle: 'dashed'}}>
            {uploading ? (
              <ActivityIndicator size="small" color="#f97316" />
            ) : (
              <>
                <MaterialIcons name="upload-file" size={20} color="#f97316" />
                <Text className="ml-2 text-sm font-semibold" style={{color: '#f97316'}}>
                  기록증 업로드
                </Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <View
            className="flex-row items-center justify-center rounded-xl py-4"
            style={{backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb', borderStyle: 'dashed'}}>
            <MaterialIcons name="lock" size={16} color="#d1d5db" />
            <Text className="ml-2 text-sm text-gray-300">대회 당일 이후에 업로드 가능해요</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function RaceDetailScreen({route, navigation}: Props) {
  const {race, fromMyRaces = false} = route.params;
  const {user, myRaces, addMyRace, removeMyRace, updateMyRace} = useUser();
  const myRaceEntry = myRaces.find(r => r.raceIdx === parseInt(race.id, 10));
  const myRaceAdded = !!myRaceEntry;
  const [showLoginSheet, setShowLoginSheet] = useState(false);
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [adding, setAdding] = useState(false);
  const {handleLogin} = useLogin(() => setShowLoginSheet(false));

  const courses = race.course
    ? race.course.split(/[,\/·]/).map(c => c.trim()).filter(Boolean)
    : [];

  const handleAddPress = () => {
    if (!user) {
      setShowLoginSheet(true);
      return;
    }
    if (myRaceAdded) {
      handleRemove();
      return;
    }
    if (courses.length <= 1) {
      doAdd(courses[0] ?? '');
    } else {
      setShowCoursePicker(true);
    }
  };

  const doAdd = async (course: string) => {
    setAdding(true);
    try {
      await addMyRace(parseInt(race.id, 10), course);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes('401') && !msg.includes('403')) {
        Alert.alert('등록 실패', msg);
      }
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async () => {
    if (!myRaceEntry) return;
    setAdding(true);
    try {
      await removeMyRace(myRaceEntry.userRaceIdx);
    } catch {
      // 실패 시 조용히 무시
    } finally {
      setAdding(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-4 pb-3 pt-2">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="ml-3 text-lg font-bold text-gray-900" numberOfLines={1}>
          대회 상세
        </Text>
      </View>

      <LoginSheet
        visible={showLoginSheet}
        onClose={() => setShowLoginSheet(false)}
        onLogin={handleLogin}
      />

      {/* 코스 선택 모달 */}
      <Modal visible={showCoursePicker} transparent animationType="slide">
        <TouchableOpacity
          style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.3)'}}
          activeOpacity={1}
          onPress={() => setShowCoursePicker(false)}
        />
        <View className="rounded-t-3xl bg-white px-4 pb-8 pt-5">
          <Text className="mb-4 text-center text-base font-bold text-gray-900">코스 선택</Text>
          {courses.map(course => (
            <TouchableOpacity
              key={course}
              onPress={() => {
                setShowCoursePicker(false);
                doAdd(course);
              }}
              activeOpacity={0.8}
              className="mb-3 items-center rounded-2xl py-4"
              style={{backgroundColor: '#fff7ed'}}>
              <Text className="text-base font-bold" style={{color: '#f97316'}}>{course}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() => setShowCoursePicker(false)}
            activeOpacity={0.7}
            className="mt-1 items-center py-3">
            <Text className="text-sm text-gray-400">취소</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 32}}>
        {/* 상단 요약 */}
        <View
          className="mb-4 px-6 py-6"
          style={{backgroundColor: '#fff7ed', marginHorizontal: 16, marginTop: 8, borderRadius: 20}}>
          {race.course ? (
            <View className="mt-2">
              <CourseBadges course={race.course} />
            </View>
          ) : null}
          <Text className="mt-3 text-xl font-black text-gray-900">{race.name}</Text>
          <Text className="mt-1 text-base text-gray-500">{formatDate(race.raceDate)}</Text>
        </View>

        {/* 상세 정보 */}
        <View className="mx-4 overflow-hidden rounded-2xl bg-white"
          style={{elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: {width: 0, height: 1}}}>
          {!fromMyRaces && race.location ? (
            <InfoRow icon="place" label="장소" value={race.location} />
          ) : null}
          {race.organizer ? (
            <>
              {!fromMyRaces && race.location && <View className="mx-4 h-px bg-gray-100" />}
              <InfoRow icon="groups" label="주최" value={race.organizer} />
            </>
          ) : null}
          {race.phone ? (
            <>
              {(!fromMyRaces && race.location || race.organizer) && <View className="mx-4 h-px bg-gray-100" />}
              <InfoRow
                icon="phone"
                label="문의"
                value={race.phone}
                onPress={() => Linking.openURL(`tel:${race.phone}`)}
              />
            </>
          ) : null}
          {race.homepage ? (
            <>
              {(!fromMyRaces && race.location || race.organizer || race.phone) && <View className="mx-4 h-px bg-gray-100" />}
              <InfoRow
                icon="language"
                label="홈페이지"
                value={race.homepage}
                onPress={() => Linking.openURL(race.homepage)}
              />
            </>
          ) : null}
        </View>

        {fromMyRaces ? (
          /* 내 대회 진입 — 기록 섹션 */
          myRaceEntry && (
            <RecordSection userRace={myRaceEntry} onUpdate={updateMyRace} />
          )
        ) : (
          /* 홈 진입 — 지도 버튼 + 내 대회 추가/제거 */
          <>
            {race.location ? <MapButtons location={race.location} /> : null}
            <TouchableOpacity
              onPress={handleAddPress}
              disabled={adding}
              activeOpacity={0.85}
              className="mx-4 mt-4 flex-row items-center justify-center rounded-2xl py-4"
              style={{backgroundColor: myRaceAdded ? '#f3f4f6' : '#f97316'}}>
              {adding ? (
                <ActivityIndicator size="small" color={myRaceAdded ? '#9ca3af' : '#ffffff'} />
              ) : (
                <>
                  <MaterialIcons
                    name={myRaceAdded ? 'check-circle' : 'add-circle-outline'}
                    size={20}
                    color={myRaceAdded ? '#9ca3af' : '#ffffff'}
                  />
                  <Text
                    className="ml-2 text-base font-bold"
                    style={{color: myRaceAdded ? '#9ca3af' : '#ffffff'}}>
                    {myRaceAdded ? '내 대회에 추가됨' : '내 대회에 추가'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
