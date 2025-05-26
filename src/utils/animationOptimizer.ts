import { Animated, Platform } from "react-native";

/**
 * Optimization utilities for high refresh rate animations (120Hz)
 */
export class AnimationOptimizer {
  /**
   * Get optimal duration for rotation animations on high refresh rate displays
   */
  static getOptimalRotationDuration(): number {
    // For 120Hz displays, use shorter durations to take advantage of higher frame rate
    return Platform.OS === "android" ? 3000 : 4000;
  }

  /**
   * Get optimal spring configuration for high refresh rate displays
   */
  static getOptimalSpringConfig() {
    return {
      friction: 12,
      tension: 80,
      useNativeDriver: true,
    };
  }

  /**
   * Get optimal timing configuration for high refresh rate displays
   */
  static getOptimalTimingConfig(duration: number = 250) {
    return {
      duration,
      useNativeDriver: true,
    };
  }

  /**
   * Create a high-performance looping animation
   */
  static createLoopAnimation(
    animValue: Animated.Value,
    duration: number = 3000,
    iterations: number = -1
  ) {
    animValue.setValue(0);
    return Animated.loop(
      Animated.timing(animValue, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
      { iterations }
    );
  }

  /**
   * Optimize interpolation for smooth rotation
   */
  static createSmoothRotationInterpolation(animValue: Animated.Value) {
    return animValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
      extrapolate: "extend",
    });
  }
}
