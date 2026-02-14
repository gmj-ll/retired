import { NativeModules, Platform } from 'react-native';
import { UserProfile } from '@/types';

const { WidgetDataManager } = NativeModules;

export class WidgetService {
  /**
   * 更新Widget数据（简化版本 - 只传递退休日期和背景图）
   */
  static async updateWidgetData(profile: UserProfile): Promise<void> {
    if (Platform.OS !== 'ios' || !WidgetDataManager) {
      console.log('Widget service not available on this platform');
      return;
    }

    try {
      // 简化的数据结构 - 只传递必要数据
      const widgetData = {
        retirementDate: profile.retirementDate.toISOString(),
        profileImage: profile.profileImage || '',
      };

      console.log('📤 Sending simplified widget data:', JSON.stringify(widgetData, null, 2));
      console.log('📅 Retirement date:', profile.retirementDate.toISOString());
      
      await WidgetDataManager.updateWidgetData(widgetData);
      console.log('✅ Widget data updated successfully');
    } catch (error) {
      console.error('❌ Failed to update widget data:', error);
    }
  }

  /**
   * 获取Widget数据
   */
  static async getWidgetData(): Promise<any> {
    if (Platform.OS !== 'ios' || !WidgetDataManager) {
      return null;
    }

    return new Promise((resolve, reject) => {
      WidgetDataManager.getWidgetData((data: any, error: string) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve(data);
        }
      });
    });
  }

  /**
   * 检查Widget是否可用
   */
  static isWidgetAvailable(): boolean {
    return Platform.OS === 'ios' && WidgetDataManager !== undefined;
  }
}
