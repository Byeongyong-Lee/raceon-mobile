import React, {useEffect} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import FastImage from 'react-native-fast-image';

const {width, height} = Dimensions.get('window');

interface Props {
  onFinish: () => void;
}

export default function SplashAnimation({onFinish}: Props) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <FastImage
        source={require('../../assets/splash.gif')}
        style={styles.gif}
        resizeMode={FastImage.resizeMode.contain}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gif: {
    width,
    height,
  },
});
