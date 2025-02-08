import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Animated, { Easing, useSharedValue, withTiming } from 'react-native-reanimated';
import Animation from './Animation'; // Ensure this path is correct

export default function App() {
  const [isWaterFlowing, setIsWaterFlowing] = useState(false);
  const opacity = useSharedValue(0);

  const handleOnPress = async () => {
    try {
      const response = await fetch('https://leak-detection.onrender.com/send_signal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsWaterFlowing(true);
        opacity.value = withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) });
      } else {
        console.error('Failed to toggle water flow on');
      }
    } catch (error) {
      console.error('Error toggling water flow on:', error);
    }
  };

  const handleOffPress = async () => {
    try {
      const response = await fetch('https://leak-detection.onrender.com/send_signal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsWaterFlowing(false);
        opacity.value = withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) });
      } else {
        console.error('Failed to toggle water flow off');
      }
    } catch (error) {
      console.error('Error toggling water flow off:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AquaAlert</Text>
      
      <Animated.View style={[styles.animationContainer, { opacity }]}>
        <Animation
          source={require('./assets/water-flow.json')} // Path to your animation file
          isPlaying={isWaterFlowing}
          style={styles.animation}
        />
      </Animated.View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleOnPress}>
          <Text style={styles.buttonText}>On</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleOffPress}>
          <Text style={styles.buttonText}>Off</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  animationContainer: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});