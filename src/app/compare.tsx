import { useEffect } from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useCompareStore } from '../stores/useCompareStore';
import { decodeVisited } from '../utils/compareCode';

/**
 * Deep link: atls://compare?c=<code>&n=<name> opens the passport comparison with that friend.
 * Like the country route it only records the invite and returns home; the sheet is a modal of the main screen.
 */
export default function CompareRoute() {
  const { c, n } = useLocalSearchParams<{ c?: string; n?: string }>();
  const setInvite = useCompareStore((s) => s.setInvite);

  useEffect(() => {
    if (typeof c === 'string' && decodeVisited(c)) {
      setInvite({ code: c, name: typeof n === 'string' ? n.slice(0, 30) : '' });
    }
  }, [c, n, setInvite]);

  return <Redirect href="/" />;
}
