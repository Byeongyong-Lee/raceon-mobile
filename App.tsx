import './global.css';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {ActivityIndicator, StatusBar, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AreaProvider} from './src/context/AreaContext';
import {GroupProvider} from './src/context/GroupContext';
import {UserProvider, useUser} from './src/context/UserContext';
import RootNavigator from './src/navigation/RootNavigator';

function AppContent() {
  const {isReady} = useUser();

  if (!isReady) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb'}}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <AreaProvider>
        <UserProvider>
          <GroupProvider>
            <AppContent />
          </GroupProvider>
        </UserProvider>
      </AreaProvider>
    </SafeAreaProvider>
  );
}
