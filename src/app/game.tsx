import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useGameStore } from '../stores/useGameStore';

/** Deep link: atls://game opens the Secret Country game (the Secret Country widget points here). */
export default function GameRoute() {
  const setOpen = useGameStore((s) => s.setOpen);
  useEffect(() => setOpen(true), [setOpen]);
  return <Redirect href="/" />;
}
