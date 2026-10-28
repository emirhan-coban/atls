import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return false;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4F46E5',
        });
      }

      return true;
    } catch (err) {
      console.warn('[NotificationService] requestPermissions notice:', err);
      return false;
    }
  },

  async sendLocalNotification(title: string, body: string, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // send immediately
      });
    } catch (err) {
      console.warn('[NotificationService] sendLocalNotification notice:', err);
    }
  },

  async scheduleTravelReminder(
    countryName: string,
    seconds: number = 86400,
    lang: 'tr' | 'en' = 'tr'
  ) {
    try {
      const title = lang === 'tr' ? `Hedefin Seni Bekliyor! ✈️` : `Your Destination Awaits! ✈️`;
      const body =
        lang === 'tr'
          ? `${countryName} hâlâ istek listende! Yeni anılar biriktirmeye hazır mısın?`
          : `${countryName} is still on your bucket list! Ready to explore?`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds,
        },
      });
    } catch (err) {
      console.warn('[NotificationService] scheduleTravelReminder notice:', err);
    }
  },
};
