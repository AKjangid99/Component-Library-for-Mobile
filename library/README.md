# @ajangid/zen-ui

A NativeWind-powered React Native UI component library — buttons, inputs, dialogs, toasts, avatars, and more. Ships as TypeScript source so your app's Metro bundler transpiles it (same model as NativeWind itself).

## Install

```bash
npx expo install @ajangid/zen-ui nativewind react-native-reanimated react-native-safe-area-context react-native-svg react-native-gesture-handler expo-blur expo-linear-gradient expo-image expo-image-picker expo-symbols @react-native-community/datetimepicker
```

## Setup

This library requires **NativeWind v5** to be configured in your app.

1. Add the library to your `tailwind.config.js` `content` globs so its classes are compiled:

```js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@ajangid/zen-ui/src/**/*.{js,jsx,ts,tsx}',
  ],
  // ...
};
```

2. Make sure your Metro config uses `withNativewind` and your global CSS entry imports Tailwind + the design tokens (see the NativeWind docs).

## Usage

```tsx
import { Button, ToastProvider } from '@ajangid/zen-ui';

export default function App() {
  return (
    <ToastProvider>
      <Button label="Hello" onPress={() => {}} />
    </ToastProvider>
  );
}
```

## License

MIT
