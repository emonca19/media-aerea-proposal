const { Platform } = require('react-native');

/**
 * Performance configuration for high refresh rate displays
 */
const PerformanceConfig = {
  // Enable high refresh rate on supported devices
  enableHighRefreshRate: true,
  
  // Optimize for 120Hz displays
  targetFrameRate: Platform.OS === 'android' ? 120 : 120,
  
  // Animation performance settings
  animation: {
    useNativeDriver: true,
    enableLayoutAnimations: true,
    reduceMotionEnabled: false,
  },
  
  // Memory and performance optimizations
  memory: {
    enableHermes: true,
    enableTurboModule: true,
    enableCodegen: true,
  },
  
  // Rendering optimizations
  rendering: {
    enableFabric: true,
    enableConcurrentFeatures: true,
    enablePriorityLevel: true,
  }
};

module.exports = PerformanceConfig;
