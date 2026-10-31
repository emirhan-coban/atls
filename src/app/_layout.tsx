import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// The app is still one screen with modals; real routes (country, trip, planner) are added under src/app as they are split out.
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Slot />
    </GestureHandlerRootView>
  );
}
