import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DailyTimeRecord {
  date: string; // YYYY-MM-DD 格式
  timeData: {
    work: { hours: number; percentage: number };
    sleep: { hours: number; percentage: number };
    free: { hours: number; percentage: number };
  };
  timestamp: number; // 记录时间戳
}

const TIME_RECORDS_KEY = 'time_records';
const YESTERDAY_DATA_KEY = 'yesterday_time_data';

export class TimeDataStorageService {
  // 获取所有时间记录
  static async getAllTimeRecords(): Promise<DailyTimeRecord[]> {
    try {
      const data = await AsyncStorage.getItem(TIME_RECORDS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('获取时间记录失败:', error);
      return [];
    }
  }

  // 保存时间记录
  static async saveTimeRecord(record: DailyTimeRecord): Promise<void> {
    try {
      const records = await this.getAllTimeRecords();
      
      // 检查是否已存在该日期的记录
      const existingIndex = records.findIndex(r => r.date === record.date);
      
      if (existingIndex >= 0) {
        // 更新现有记录
        records[existingIndex] = record;
      } else {
        // 添加新记录
        records.push(record);
      }
      
      // 按日期排序（最新的在前）
      records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      await AsyncStorage.setItem(TIME_RECORDS_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('保存时间记录失败:', error);
    }
  }

  // 获取指定日期的时间记录
  static async getTimeRecordByDate(date: string): Promise<DailyTimeRecord | null> {
    try {
      const records = await this.getAllTimeRecords();
      return records.find(r => r.date === date) || null;
    } catch (error) {
      console.error('获取指定日期记录失败:', error);
      return null;
    }
  }

  // 获取昨日时间数据
  static async getYesterdayTimeData(): Promise<DailyTimeRecord['timeData'] | null> {
    try {
      const data = await AsyncStorage.getItem(YESTERDAY_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('获取昨日时间数据失败:', error);
      return null;
    }
  }

  // 保存昨日时间数据
  static async saveYesterdayTimeData(timeData: DailyTimeRecord['timeData']): Promise<void> {
    try {
      await AsyncStorage.setItem(YESTERDAY_DATA_KEY, JSON.stringify(timeData));
    } catch (error) {
      console.error('保存昨日时间数据失败:', error);
    }
  }

  // 检查是否需要保存昨日数据到历史记录
  static async checkAndSaveYesterdayRecord(): Promise<void> {
    try {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDateStr = yesterday.toISOString().split('T')[0];
      
      // 检查是否已有昨日记录
      const existingRecord = await this.getTimeRecordByDate(yesterdayDateStr);
      if (existingRecord) {
        return; // 已有记录，无需重复保存
      }
      
      // 获取昨日时间数据
      const yesterdayData = await this.getYesterdayTimeData();
      if (yesterdayData) {
        // 保存到历史记录
        const record: DailyTimeRecord = {
          date: yesterdayDateStr,
          timeData: yesterdayData,
          timestamp: Date.now()
        };
        
        await this.saveTimeRecord(record);
        console.log('昨日时间数据已保存到历史记录:', yesterdayDateStr);
      }
    } catch (error) {
      console.error('检查并保存昨日记录失败:', error);
    }
  }

  // 格式化日期为显示用的字符串
  static formatDateForDisplay(dateStr: string): string {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  }

  // 获取今天的日期字符串
  static getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  // 获取昨天的日期字符串
  static getYesterdayDateString(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }
}
