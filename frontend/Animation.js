import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

const Animation = ({ source, isPlaying, style }) => {
  return (
    <View style={[styles.container, style]}>
      <LottieView
        source={source}
        autoPlay={isPlaying}
        loop={isPlaying}
        style={styles.animation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});

export default Animation;