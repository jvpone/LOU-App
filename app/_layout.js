import '../src/global.css';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';

const fontAssets = {};

export default function Layout() {
  const [fontsLoaded] = useFonts(fontAssets);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
      setIsReady(true);
    }
    prepare();
  }, []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!fontsLoaded || !isReady) {
    return (
      <View style={styles.container} />
    );
  }

  return (
    <View style={styles.container}>
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
});
