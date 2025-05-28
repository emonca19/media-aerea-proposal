const { defineConfig } = require("eslint/config");
const reactNativePlugin = require("eslint-plugin-react-native");

module.exports = defineConfig([
  {
    plugins: {
      "react-native": reactNativePlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...reactNativePlugin.environments["react-native"].globals,
      },
    },
    rules: {
      // Only check for raw text rule
      "react-native/no-raw-text": "error",
    },
  },
  {
    ignores: ["dist/*"],
  },
]);
