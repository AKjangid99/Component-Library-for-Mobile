// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// `withNativewind` enables the global className polyfill (className on any RN
// component) and generates `nativewind-env.d.ts`. `input` points at the CSS
// entry that pulls in Tailwind + the design tokens.
module.exports = withNativewind(config, { input: './src/global.css' });
