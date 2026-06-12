import React from 'react';
import {FlatList, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useUser} from '../context/UserContext';
import {RootStackParamList} from '../navigation/RootNavigator';
import {Race, UserRace} from '../types';
import {formatDate, getDdayLabel} from '../utils/race';

function userRaceToRace(ur: UserRace): Race {
  return {
    id: String(ur.raceIdx),
    sourceId: '',
    name: ur.raceName,
    raceDate: ur.raceDate,
    location: ur.raceLocation,
    course: ur.course,
    organizer: '',
    phone: '',
    homepage: '',
    detailUrl: '',
  };
}

export default function MyRacesScreen() {
  const {myRaces, removeMyRace} = useUser();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      <View className="px-4 pb-3 pt-4">
        <Text className="text-2xl font-bold text-gray-900">내 대회</Text>
        <Text className="mt-1 text-sm text-gray-500">신청한 대회를 관리해요</Text>
      </View>

      {myRaces.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <MaterialIcons name="emoji-events" size={48} color="#d1d5db" />
          <Text className="mt-4 text-base font-semibold text-gray-400">
            추가한 대회가 없어요
          </Text>
          <Text className="mt-1 text-sm text-gray-400">
            대회 상세에서 추가해보세요
          </Text>
        </View>
      ) : (
        <FlatList
          data={myRaces}
          keyExtractor={item => String(item.userRaceIdx)}
          contentContainerStyle={{paddingTop: 8, paddingBottom: 24}}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => {
            const label = getDdayLabel(item.raceDate);
            const isPast = label.startsWith('D+');
            return (
              <TouchableOpacity
                onPress={() => navigation.navigate('RaceDetail', {race: userRaceToRace(item), fromMyRaces: true})}
                activeOpacity={0.75}
                className="mx-4 mb-3 flex-row items-center overflow-hidden rounded-2xl bg-white px-4 py-4"
                style={{
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  shadowOffset: {width: 0, height: 2},
                }}>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                    {item.raceName}
                  </Text>
                  <Text className="mt-0.5 text-xs text-gray-400">
                    {formatDate(item.raceDate)} · {item.course}
                  </Text>
                </View>
                <View
                  className="ml-3 rounded-full px-3 py-1"
                  style={{backgroundColor: isPast ? '#e5e7eb' : '#fff7ed'}}>
                  <Text
                    className="text-sm font-bold"
                    style={{color: isPast ? '#9ca3af' : '#f97316'}}>
                    {label}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeMyRace(item.userRaceIdx)}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                  className="ml-3">
                  <MaterialIcons name="close" size={18} color="#d1d5db" />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
