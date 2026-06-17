import './global.css';
import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import BootSplash from 'react-native-bootsplash';
import {AreaProvider} from './src/context/AreaContext';
import {GroupProvider} from './src/context/GroupContext';
import {UserProvider, useUser} from './src/context/UserContext';
import RootNavigator from './src/navigation/RootNavigator';

function AppContent() {
  const {isReady} = useUser();

  useEffect(() => {
    if (isReady) {
      BootSplash.hide({fade: true});
    }
  }, [isReady]);

  if (!isReady) {
    return null; // 네이티브 스플래시가 덮고 있으므로 빈 화면
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
