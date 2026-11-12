import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Reminder } from '../utils/planning';

const MEMORY_IDS_KEY = '@atls_memory_notification_ids';
const GAME_ID_KEY = '@atls_game_reminder_id';

// How a notification looks while the app is open
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
  /** Current permission without asking the user. */
  async hasPermission(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  },

  /** Asks for permission (only shows the system prompt the first time). Call it from a moment that explains why. */
  async requestPermissions(): Promise<boolean> {
    try {
      if (await this.hasPermission()) return true;
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return false;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          lightColor: '#E5A93C',
        });
      }
      return true;
    } catch (err) {
      console.warn('[NotificationService] requestPermissions notice:', err);
      return false;
    }
  },

  /** Schedules each reminder for its own date and returns the notification ids, so they can be cancelled later. */
  async scheduleReminders(reminders: Reminder[], data: Record<string, string> = {}): Promise<string[]> {
    const ids: string[] = [];
    for (const reminder of reminders) {
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: { title: reminder.title, body: reminder.body, data, sound: true },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminder.at },
        });
        ids.push(id);
      } catch (err) {
        console.warn('[NotificationService] scheduleReminders notice:', err);
      }
    }
    return ids;
  },

  /** Replaces the scheduled anniversary reminders with a new set (an empty set turns them off). */
  async setMemoryReminders(reminders: Reminder[]): Promise<void> {
    try {
      const old: string[] = JSON.parse((await AsyncStorage.getItem(MEMORY_IDS_KEY)) || '[]');
      await this.cancel(old);
      const ids = reminders.length > 0 && (await this.hasPermission()) ? await this.scheduleReminders(reminders, { kind: 'memory' }) : [];
      await AsyncStorage.setItem(MEMORY_IDS_KEY, JSON.stringify(ids));
    } catch (err) {
      console.warn('[NotificationService] setMemoryReminders notice:', err);
    }
  },

  /** Replaces the daily-game reminder with this one (null turns it off). Only one is ever scheduled. */
  async setGameReminder(reminder: Reminder | null): Promise<void> {
    try {
      const old: string[] = JSON.parse((await AsyncStorage.getItem(GAME_ID_KEY)) || '[]');
      await this.cancel(old);
      const ids = reminder && (await this.hasPermission()) ? await this.scheduleReminders([reminder], { kind: 'game' }) : [];
      await AsyncStorage.setItem(GAME_ID_KEY, JSON.stringify(ids));
    } catch (err) {
      console.warn('[NotificationService] setGameReminder notice:', err);
    }
  },

  async cancel(ids: string[]): Promise<void> {
    for (const id of ids) {
      try {
        await Notifications.cancelScheduledNotificationAsync(id);
      } catch (err) {
        console.warn('[NotificationService] cancel notice:', err);
      }
    }
  },
};
