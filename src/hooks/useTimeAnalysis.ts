import { useState, useEffect } from 'react';
import { DailySchedule, TimeAnalysis, UserProfile } from '@/types';
import { StorageService } from '@/services/StorageService';
import { TimeAnalysisService } from '@/services/TimeAnalysisService';

export const useTimeAnalysis = (userProfile: UserProfile | null) => {
  const [schedules, setSchedules] = useState<DailySchedule[]>([]);
  const [analysis, setAnalysis] = useState<TimeAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSchedules();
  }, []);

  useEffect(() => {
    if (userProfile && schedules.length >= 0) {
      calculateAnalysis();
    }
  }, [userProfile, schedules]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const savedSchedules = await StorageService.getAllDailySchedules();
      setSchedules(savedSchedules);
    } catch (err) {
      setError('加载日程数据失败');
      console.error('Error loading schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalysis = () => {
    if (!userProfile) return;

    try {
      const newAnalysis = TimeAnalysisService.calculateTimeAnalysis(
        schedules,
        userProfile
      );
      setAnalysis(newAnalysis);
    } catch (err) {
      setError('计算时间分析失败');
      console.error('Error calculating analysis:', err);
    }
  };

  const saveSchedule = async (schedule: DailySchedule) => {
    try {
      setError(null);
      await StorageService.saveDailySchedule(schedule);
      await loadSchedules(); // Reload to get updated data
    } catch (err) {
      setError('保存日程失败');
      console.error('Error saving schedule:', err);
      throw err;
    }
  };

  const getScheduleForDate = async (date: string): Promise<DailySchedule | null> => {
    try {
      return await StorageService.getDailySchedule(date);
    } catch (err) {
      console.error('Error getting schedule for date:', err);
      return null;
    }
  };

  const getRecentSchedules = (days: number = 30): DailySchedule[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return schedules
      .filter(schedule => new Date(schedule.date) >= cutoffDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return {
    schedules,
    analysis,
    loading,
    error,
    saveSchedule,
    getScheduleForDate,
    getRecentSchedules,
    reloadSchedules: loadSchedules,
  };
};
