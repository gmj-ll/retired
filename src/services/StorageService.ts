import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, DailySchedule, AppSettings, WidgetSettings } from '@/types';

const KEYS = {
  USER_PROFILE: 'user_profile',
  DAILY_SCHEDULES: 'daily_schedules',
  APP_SETTINGS: 'app_settings',
  WIDGET_SETTINGS: 'widget_settings',
};

export class StorageService {
  // User Profile
  static async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  }

  static async getUserProfile(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
      if (!data) return null;
      
      const profile = JSON.parse(data);
      
      // 将日期字符串转换为Date对象
      if (profile.birthDate) {
        profile.birthDate = new Date(profile.birthDate);
      }
      if (profile.workStartDate) {
        profile.workStartDate = new Date(profile.workStartDate);
      }
      if (profile.retirementDate) {
        profile.retirementDate = new Date(profile.retirementDate);
      }
      if (profile.createdAt) {
        profile.createdAt = new Date(profile.createdAt);
      }
      if (profile.updatedAt) {
        profile.updatedAt = new Date(profile.updatedAt);
      }
      
      return profile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Daily Schedules
  static async saveDailySchedule(schedule: DailySchedule): Promise<void> {
    try {
      const schedules = await this.getAllDailySchedules();
      const existingIndex = schedules.findIndex(s => s.date === schedule.date);
      
      if (existingIndex >= 0) {
        schedules[existingIndex] = schedule;
      } else {
        schedules.push(schedule);
      }
      
      await AsyncStorage.setItem(KEYS.DAILY_SCHEDULES, JSON.stringify(schedules));
    } catch (error) {
      console.error('Error saving daily schedule:', error);
      throw error;
    }
  }

  static async getAllDailySchedules(): Promise<DailySchedule[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.DAILY_SCHEDULES);
      if (!data) return [];
      
      const schedules = JSON.parse(data);
      
      // 将日期字符串转换为Date对象
      return schedules.map((schedule: any) => ({
        ...schedule,
        createdAt: schedule.createdAt ? new Date(schedule.createdAt) : new Date(),
      }));
    } catch (error) {
      console.error('Error getting daily schedules:', error);
      return [];
    }
  }

  static async getDailySchedule(date: string): Promise<DailySchedule | null> {
    try {
      const schedules = await this.getAllDailySchedules();
      return schedules.find(s => s.date === date) || null;
    } catch (error) {
      console.error('Error getting daily schedule:', error);
      return null;
    }
  }

  // App Settings
  static async saveAppSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.APP_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving app settings:', error);
      throw error;
    }
  }

  static async getAppSettings(): Promise<AppSettings | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.APP_SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting app settings:', error);
      return null;
    }
  }

  // Widget Settings
  static async saveWidgetSettings(settings: WidgetSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.WIDGET_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving widget settings:', error);
      throw error;
    }
  }

  static async getWidgetSettings(): Promise<WidgetSettings | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.WIDGET_SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting widget settings:', error);
      return null;
    }
  }

  // Clear all data
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(KEYS));
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}
