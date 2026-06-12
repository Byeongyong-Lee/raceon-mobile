import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {useUser} from '../context/UserContext';
import RaceDetailScreen from '../screens/RaceDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import {Race} from '../types';
import AppNavigator from './AppNavigator';

export type RootStackParamList = {
  MainTabs: undefined;
  Settings: undefined;
  RaceDetail: {race: Race; fromMyRaces?: boolean};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const {user, logout} = useUser();

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="MainTabs" component={AppNavigator} />
      <Stack.Screen
        name="Settings"
        options={{animation: 'slide_from_right'}}>
        {({navigation}) => (
          <SettingsScreen
            user={user}
            onLogout={() => {
              logout();
              navigation.goBack();
            }}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="RaceDetail"
        component={RaceDetailScreen}
        options={{animation: 'slide_from_right'}}
      />
    </Stack.Navigator>
  );
}
