import { Linking, Platform, Alert } from 'react-native';

export function openAppleMaps(query: string) {
  const encoded = encodeURIComponent(query);
  const url = `maps://?q=${encoded}`;
  
  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback to web maps
        Linking.openURL(`https://maps.apple.com/?q=${encoded}`);
      }
    })
    .catch(() => {
      Linking.openURL(`https://maps.apple.com/?q=${encoded}`);
    });
}

export function openGoogleMaps(query: string) {
  const encoded = encodeURIComponent(query);
  const appUrl = Platform.select({
    ios: `comgooglemaps://?q=${encoded}`,
    android: `google.navigation:q=${encoded}`,
    default: `https://www.google.com/maps/search/?api=1&query=${encoded}`,
  });

  const webUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;

  if (appUrl.startsWith('comgooglemaps') || appUrl.startsWith('google.navigation')) {
    Linking.canOpenURL(appUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(appUrl);
        } else {
          Linking.openURL(webUrl);
        }
      })
      .catch(() => {
        Linking.openURL(webUrl);
      });
  } else {
    Linking.openURL(webUrl);
  }
}
