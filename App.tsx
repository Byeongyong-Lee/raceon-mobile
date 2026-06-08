import './global.css';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {UserProvider} from './src/context/UserContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <UserProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </UserProvider>
    </SafeAreaProvider>
  );
}
