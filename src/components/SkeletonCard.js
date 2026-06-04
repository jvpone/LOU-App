import { View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

function SkeletonItem() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.image, { opacity }]} />
      <View style={styles.content}>
        <Animated.View style={[styles.titleSkeleton, { opacity }]} />
        <View style={styles.details}>
          <Animated.View style={[styles.dateSkeleton, { opacity }]} />
          <Animated.View style={[styles.infoSkeleton, { opacity }]} />
        </View>
      </View>
    </View>
  );
}

export default function SkeletonCard() {
  return (
    <View style={styles.cardContainer}>
      <SkeletonItem />
      <SkeletonItem />
      <SkeletonItem />
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
  },
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: '#2a2a2a',
  },
  content: {
    padding: 12,
  },
  titleSkeleton: {
    height: 20,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    marginBottom: 12,
    width: '80%',
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateSkeleton: {
    width: 40,
    height: 40,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    marginRight: 16,
  },
  infoSkeleton: {
    flex: 1,
    height: 40,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
  },
});
