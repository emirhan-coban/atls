import { useEffect } from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useAppStore } from '../../stores';

/**
 * Deep link: atls://country/JP opens the country sheet on top of the Explore tab.
 * The sheet itself is still a modal of the main screen, so this route only selects the country and returns home.
 */
export default function CountryRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const setSelectedCountryId = useAppStore((s) => s.setSelectedCountryId);

  useEffect(() => {
    if (typeof id === 'string' && /^[A-Za-z]{2}$/.test(id)) {
      setActiveTab('explore');
      setSelectedCountryId(id.toUpperCase());
    }
  }, [id, setActiveTab, setSelectedCountryId]);

  return <Redirect href="/" />;
}
