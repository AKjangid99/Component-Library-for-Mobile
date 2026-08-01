import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WebBadge } from '@/components/web-badge';
import { Badge, Button, Card, Progress, Switch, Text } from '@/ui';

function FeatureItem({ index, title, body }: { index: string; title: string; body: string }) {
  return (
    <View className="flex-1 gap-2 border-t border-border pt-4">
      <Text className="font-mono text-xs text-muted-foreground">{index}</Text>
      <Text className="text-lg font-semibold text-foreground">{title}</Text>
      <Text className="text-sm leading-6 text-muted-foreground">{body}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 720;
  const [demoOn, setDemoOn] = useState(true);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + (isWide ? 72 : 40),
        paddingBottom: insets.bottom + 96,
        paddingHorizontal: isWide ? 40 : 24,
        maxWidth: 960,
        width: '100%',
        alignSelf: 'center',
      }}
      showsVerticalScrollIndicator={false}>
      {/* Wordmark */}
      <View className="flex-row items-center justify-between">
        <Text className="font-mono text-xs uppercase tracking-widest text-foreground">
          Component&nbsp;Lib
        </Text>
        <Text className="font-mono text-xs text-muted-foreground">expo · nativewind</Text>
      </View>

      {/* Hero */}
      <View className={isWide ? 'mt-24 max-w-[720px]' : 'mt-16'}>
        <Text
          className="font-bold tracking-tight text-foreground"
          style={{ fontSize: isWide ? 60 : 40, lineHeight: isWide ? 64 : 44 }}>
          Native interfaces,{'\n'}without the slop.
        </Text>
        <Text className="mt-6 max-w-[560px] text-lg leading-7 text-muted-foreground">
          A custom Expo component library styled with NativeWind and animated with Reanimated.
          Copy-paste, themable, light and dark out of the box.
        </Text>
        <View className="mt-8 flex-row flex-wrap gap-3">
          <Button label="Browse components" rightIcon="arrow.right" onPress={() => router.navigate('/explore')} />
          <Button label="Read the docs" variant="outline" onPress={() => router.navigate('/explore')} />
        </View>
      </View>

      {/* Features */}
      <View className={isWide ? 'mt-24 flex-row gap-8' : 'mt-16 gap-8'}>
        <FeatureItem
          index="01"
          title="Token theming"
          body="Semantic design tokens defined once, following the device color scheme automatically."
        />
        <FeatureItem
          index="02"
          title="Reanimated motion"
          body="Press springs, animated accordions, focus borders — motion that feels native."
        />
        <FeatureItem
          index="03"
          title="Publish-ready"
          body="A clean src/ui surface ready to be extracted into its own npm package."
        />
      </View>

      {/* Live preview */}
      <View className="mt-24 gap-4">
        <Text className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Live preview
        </Text>
        <Card className="gap-5">
          <View className="flex-row flex-wrap items-center gap-2">
            <Button label="Filled" size="sm" />
            <Button label="Tonal" size="sm" variant="tonal" />
            <Button label="Outline" size="sm" variant="outline" />
          </View>
          <View className="flex-row flex-wrap items-center gap-2">
            <Badge label="Default" />
            <Badge label="Success" variant="success" />
            <Badge label="Warning" variant="warning" />
            <Badge label="Outline" variant="outline" />
          </View>
          <Progress value={demoOn ? 72 : 24} />
          <View className="flex-row items-center justify-between">
            <Text variant="small">Toggle to animate the bar</Text>
            <Switch value={demoOn} onValueChange={setDemoOn} />
          </View>
        </Card>
      </View>

      {Platform.OS === 'web' && (
        <View className="mt-16 items-center">
          <WebBadge />
        </View>
      )}
    </ScrollView>
  );
}
