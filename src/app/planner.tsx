import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAppStore } from '../stores';

/** Deep link: atls://planner opens the trip planner (the next-trip widget points here). */
export default function PlannerRoute() {
  const setPlannerOpen = useAppStore((s) => s.setPlannerOpen);
  useEffect(() => setPlannerOpen(true), [setPlannerOpen]);
  return <Redirect href="/" />;
}
