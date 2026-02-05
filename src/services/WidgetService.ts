import { NativeModules, Platform } from 'react-native';
import { UserProfile } from '@/types';
import { TimeAnalysisService } from './TimeAnalysisService';

const { WidgetDataManager } = NativeModules;

export class WidgetService {
  /**
   * 更新Widget数据
   */
  static async updateWidgetData(
    profile: UserProfile,
    currentFormat: string = 'days'
  ): Promise<void> {
    if (Platform.OS !== 'ios' || !WidgetDataManager) {
      console.log('Widget service not available on this platform');
      return;
    }

    try {
      const progress = TimeAnalysisService.calculateRetirementProgress(profile);
      
      const widgetData = {
        name: profile.name,
        retirementDate: profile.retirementDate.toISOString(),
        profileImage: profile.profileImage || '',
        currentFormat: currentFormat,
        progress: progress,
      };

      await WidgetDataManager.updateWidgetData(widgetData);
      console.log('Widget data updated successfully');
    } catch (error) {
      console.error('Failed to update widget data:', error);
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
