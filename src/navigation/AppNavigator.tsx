import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import {Text} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MyRacesScreen from '../screens/MyRacesScreen';
import RaceListScreen from '../screens/RaceListScreen';

const Tab = createBottomTabNavigator();

function TabIcon({emoji, focused}: {emoji: string; focused: boolean}) {
  return (
    <Text style={{fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5}}>
      {emoji}
    </Text>
  );
}

export default function AppNavigator() {
  const {bottom: bottomInset} = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#f3f4f6',
          height: 60 + bottomInset,
          paddingBottom: 8 + bottomInset,
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {fontSize: 11, fontWeight: '600'},
      }}>
      <Tab.Screen
        name="RaceList"
        component={RaceListScreen}
        options={{
          tabBarLabel: '대회 일정',
          tabBarIcon: ({focused}) => (
            <TabIcon emoji="🗓️" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="MyRaces"
        component={MyRacesScreen}
        options={{
          tabBarLabel: '내 대회',
          tabBarIcon: ({focused}) => (
            <TabIcon emoji="🏅" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
