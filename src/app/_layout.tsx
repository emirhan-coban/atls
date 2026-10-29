import { Slot } from 'expo-router';

// The app is still one screen with modals; real routes (country, trip, planner) are added under src/app as they are split out.
export default function RootLayout() {
  return <Slot />;
}
