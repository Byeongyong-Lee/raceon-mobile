import './global.css';
import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import BootSplash from 'react-native-bootsplash';
import {AreaProvider} from './src/context/AreaContext';
import {GroupProvider} from './src/context/GroupContext';
import {UserProvider, useUser} from './src/context/UserContext';
import RootNavigator from './src/navigation/RootNavigator';
import SplashAnimation from './src/components/SplashAnimation';

function AppContent() {
  const {isReady} = useUser();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (isReady) {
      BootSplash.hide({fade: true});
    }
  }, [isReady]);

  if (!isReady) {
    return null; // 네이티브 스플래시가 덮고 있으므로 빈 화면
  }

  if (!splashDone) {
    return <SplashAnimation onFinish={() => setSplashDone(true)} />;
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
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
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
