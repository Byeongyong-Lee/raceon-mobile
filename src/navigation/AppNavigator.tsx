import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CalendarScreen from '../screens/CalendarScreen';
import MyRacesScreen from '../screens/MyRacesScreen';
import RaceListScreen from '../screens/RaceListScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const {bottom: bottomInset} = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#f3f4f6',
          borderTopWidth: 1,
          height: 60 + bottomInset,
          paddingBottom: 8 + bottomInset,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {fontSize: 11, fontWeight: '600'},
      }}>
      <Tab.Screen
        name="Home"
        component={RaceListScreen}
        options={{
          tabBarLabel: '홈',
          tabBarIcon: ({color, size}) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: '캘린더',
          tabBarIcon: ({color, size}) => (
            <MaterialIcons name="calendar-month" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyRaces"
        component={MyRacesScreen}
        options={{
          tabBarLabel: '내 대회',
          tabBarIcon: ({color, size}) => (
            <MaterialIcons name="emoji-events" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
