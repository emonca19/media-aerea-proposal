const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Optimize for better animation performance
config.transformer.minifierConfig = {
  ...config.transformer.minifierConfig,
  keep_fnames: true, // Keep function names for better performance profiling
};

config.resolver.platforms = ["native", "android", "ios", "web"];

// Enable hermesparser for better performance
config.transformer.hermesParser = true;

// Optimize bundle size for animations
config.transformer.enableBabelRCLookup = false;
config.transformer.enableBabelRuntime = false;

module.exports = config;
