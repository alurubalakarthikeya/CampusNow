import { Tabs } from 'expo-router/js-tabs';

import { FloatingDocNav } from '@/components/navigation/FloatingDocNav';

/**
 * The five CampusNow destinations share one floating dock. The dock is a
 * measured tab bar, so content always clears it and nothing is hidden
 * behind the glass.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: 'transparent' },
      }}
      tabBar={(props) => <FloatingDocNav {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="report" options={{ title: 'Report' }} />
      <Tabs.Screen name="campus" options={{ title: 'Campus' }} />
      <Tabs.Screen name="reports" options={{ title: 'Reports' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
