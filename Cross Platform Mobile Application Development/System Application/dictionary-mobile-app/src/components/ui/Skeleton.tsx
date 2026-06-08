import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

export interface SkeletonProps {
  className?: string;
}

/** Single shimmering placeholder block. */
export function Skeleton({ className = "h-4 w-full" }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View style={{ opacity }} className={`rounded-lg bg-gray-200 dark:bg-gray-800 ${className}`} />
  );
}

/** Pre-composed skeleton mimicking a word detail card while loading. */
export function WordDetailSkeleton() {
  return (
    <View className="gap-4">
      <Skeleton className="h-9 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
      <View className="gap-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </View>
      <View className="gap-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/6" />
      </View>
    </View>
  );
}
