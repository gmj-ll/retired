import { StorageService } from '@/services/StorageService';

export const clearAllAppData = async () => {
  try {
    await StorageService.clearAllData();
    console.log('所有应用数据已清除');
  } catch (error) {
    console.error('清除数据失败:', error);
  }
};
