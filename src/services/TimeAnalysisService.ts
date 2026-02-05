import { DailySchedule, TimeAnalysis, UserProfile } from '@/types';

export class TimeAnalysisService {
  static calculateTimeAnalysis(
    schedules: DailySchedule[],
    userProfile: UserProfile
  ): TimeAnalysis {
    if (schedules.length === 0) {
      return {
        totalWorkHours: 0,
        totalSleepHours: 0,
        totalFreeHours: 0,
        averageWorkHours: 0,
        averageSleepHours: 0,
        averageFreeHours: 0,
        daysUntilRetirement: this.calculateDaysUntilRetirement(userProfile),
        freeTimeUntilRetirement: 0,
      };
    }

    let totalWorkHours = 0;
    let totalSleepHours = 0;
    let totalFreeHours = 0;

    schedules.forEach(schedule => {
      const workHours = this.calculateWorkHours(schedule);
      const sleepHours = this.calculateSleepHours(schedule);
      const freeHours = 24 - workHours - sleepHours;

      totalWorkHours += workHours;
      totalSleepHours += sleepHours;
      totalFreeHours += freeHours;
    });

    const averageWorkHours = totalWorkHours / schedules.length;
    const averageSleepHours = totalSleepHours / schedules.length;
    const averageFreeHours = totalFreeHours / schedules.length;

    const daysUntilRetirement = this.calculateDaysUntilRetirement(userProfile);
    const freeTimeUntilRetirement = averageFreeHours * daysUntilRetirement;

    return {
      totalWorkHours,
      totalSleepHours,
      totalFreeHours,
      averageWorkHours,
      averageSleepHours,
      averageFreeHours,
      daysUntilRetirement,
      freeTimeUntilRetirement,
    };
  }

  /**
   * 计算当日时间分配
   */
  static calculateDailyTimeDistribution(schedule?: DailySchedule, date?: Date) {
    const targetDate = date || new Date();
    
    if (!schedule) {
      // 检查是否为双休日或节假日
      const isWeekend = this.isWeekend(targetDate);
      const isHoliday = this.isHoliday(targetDate);
      
      if (isWeekend || isHoliday) {
        // 双休日和节假日：工作时间为0
        return {
          work: { hours: 0, percentage: 0 },
          sleep: { hours: 8, percentage: 33.3 },
          free: { hours: 16, percentage: 66.7 }
        };
      } else {
        // 工作日：默认时间分配
        return {
          work: { hours: 8, percentage: 33.3 },
          sleep: { hours: 8, percentage: 33.3 },
          free: { hours: 8, percentage: 33.3 }
        };
      }
    }

    const workHours = this.calculateWorkHours(schedule);
    const sleepHours = this.calculateSleepHours(schedule);
    const freeHours = Math.max(0, 24 - workHours - sleepHours);

    return {
      work: { 
        hours: workHours, 
        percentage: (workHours / 24) * 100 
      },
      sleep: { 
        hours: sleepHours, 
        percentage: (sleepHours / 24) * 100 
      },
      free: { 
        hours: freeHours, 
        percentage: (freeHours / 24) * 100 
      }
    };
  }

  /**
   * 基于历史数据计算职业生涯总时间分配
   */
  static calculateCareerTimeDistributionFromHistory(
    userProfile: UserProfile,
    historicalRecords: any[] // DailyTimeRecord[]
  ) {
    // 计算工作年限
    let workStartDate: Date;
    if (userProfile.workStartDate && userProfile.workStartDate instanceof Date && !isNaN(userProfile.workStartDate.getTime())) {
      workStartDate = userProfile.workStartDate;
    } else {
      workStartDate = new Date(
        userProfile.birthDate.getFullYear() + 22,
        userProfile.birthDate.getMonth(),
        userProfile.birthDate.getDate()
      );
    }
    
    const retirementDate = new Date(userProfile.retirementDate);
    const now = new Date();
    
    // 计算总工作天数和已工作天数
    const totalWorkingDays = Math.max(0, Math.floor((retirementDate.getTime() - workStartDate.getTime()) / (1000 * 60 * 60 * 24)));
    const workedDays = Math.max(0, Math.floor((now.getTime() - workStartDate.getTime()) / (1000 * 60 * 60 * 24)));
    const remainingDays = Math.max(0, totalWorkingDays - workedDays);
    
    // 计算历史数据的累计时间
    let totalHistoricalWork = 0;
    let totalHistoricalSleep = 0;
    let totalHistoricalFree = 0;
    let historicalDaysCount = historicalRecords.length;
    
    historicalRecords.forEach(record => {
      totalHistoricalWork += record.timeData.work.hours;
      totalHistoricalSleep += record.timeData.sleep.hours;
      totalHistoricalFree += record.timeData.free.hours;
    });
    
    // 计算历史数据的平均值（用于预估剩余时间）
    const avgWorkHours = historicalDaysCount > 0 ? totalHistoricalWork / historicalDaysCount : 8;
    const avgSleepHours = historicalDaysCount > 0 ? totalHistoricalSleep / historicalDaysCount : 8;
    const avgFreeHours = historicalDaysCount > 0 ? totalHistoricalFree / historicalDaysCount : 8;
    
    // 计算从工作开始到今天的实际已花费时间（使用平均值）
    const actualWorkedDays = Math.min(workedDays, Math.max(0, Math.floor((now.getTime() - workStartDate.getTime()) / (1000 * 60 * 60 * 24))));
    const spentWorkHours = avgWorkHours * actualWorkedDays;
    const spentSleepHours = avgSleepHours * actualWorkedDays;
    const spentFreeHours = avgFreeHours * actualWorkedDays;
    
    // 计算剩余时间的预估
    const estimatedRemainingWork = avgWorkHours * remainingDays;
    const estimatedRemainingSleep = avgSleepHours * remainingDays;
    const estimatedRemainingFree = avgFreeHours * remainingDays;
    
    // 计算总时间（已花费 + 预估剩余）
    const totalWork = spentWorkHours + estimatedRemainingWork;
    const totalSleep = spentSleepHours + estimatedRemainingSleep;
    const totalFree = spentFreeHours + estimatedRemainingFree;
    const grandTotal = totalWork + totalSleep + totalFree;
    
    return {
      // 已花费的时间（从工作开始到今天，基于平均值计算）
      spentWork: {
        hours: spentWorkHours,
        percentage: grandTotal > 0 ? (spentWorkHours / grandTotal) * 100 : 0
      },
      spentSleep: {
        hours: spentSleepHours,
        percentage: grandTotal > 0 ? (spentSleepHours / grandTotal) * 100 : 0
      },
      spentFree: {
        hours: spentFreeHours,
        percentage: grandTotal > 0 ? (spentFreeHours / grandTotal) * 100 : 0
      },
      // 剩余时间（预估）
      remainingWork: {
        hours: estimatedRemainingWork,
        percentage: grandTotal > 0 ? (estimatedRemainingWork / grandTotal) * 100 : 0
      },
      remainingSleep: {
        hours: estimatedRemainingSleep,
        percentage: grandTotal > 0 ? (estimatedRemainingSleep / grandTotal) * 100 : 0
      },
      remainingFree: {
        hours: estimatedRemainingFree,
        percentage: grandTotal > 0 ? (estimatedRemainingFree / grandTotal) * 100 : 0
      },
      // 剩余未度过的时间
      unspentTime: {
        hours: estimatedRemainingWork + estimatedRemainingSleep + estimatedRemainingFree,
        percentage: grandTotal > 0 ? ((estimatedRemainingWork + estimatedRemainingSleep + estimatedRemainingFree) / grandTotal) * 100 : 0
      },
      // 统计信息
      totalDays: totalWorkingDays,
      workedDays: actualWorkedDays, // 从工作开始到今天的实际天数
      remainingDays,
      historicalDaysCount, // 实际有记录的天数
      // 平均值（用于显示预估）
      averages: {
        work: avgWorkHours,
        sleep: avgSleepHours,
        free: avgFreeHours
      }
    };
  }

  /**
   * 生成模拟的当日时间记录（用于演示）
   */
  static generateMockDailySchedule(): DailySchedule {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    return {
      id: `mock-${Date.now()}`,
      date: dateStr,
      workStartTime: '09:00',
      workEndTime: '18:00',
      sleepTime: '23:00',
      wakeUpTime: '07:00',
      createdAt: new Date(),
    };
  }

  /**
   * 判断是否为双休日
   */
  static isWeekend(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0 = 周日, 6 = 周六
  }

  /**
   * 判断是否为节假日（简化版本，可以根据需要扩展）
   */
  static isHoliday(date: Date): boolean {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 简化的中国法定节假日判断
    const holidays = [
      { month: 1, day: 1 },   // 元旦
      { month: 5, day: 1 },   // 劳动节
      { month: 10, day: 1 },  // 国庆节
      { month: 10, day: 2 },  // 国庆节
      { month: 10, day: 3 },  // 国庆节
    ];
    
    return holidays.some(holiday => holiday.month === month && holiday.day === day);
  }

  private static calculateWorkHours(schedule: DailySchedule): number {
    const startTime = this.parseTime(schedule.workStartTime);
    const endTime = this.parseTime(schedule.workEndTime);
    
    let hours = endTime - startTime;
    if (hours < 0) {
      hours += 24; // Handle overnight work
    }
    
    return hours;
  }

  private static calculateSleepHours(schedule: DailySchedule): number {
    const sleepTime = this.parseTime(schedule.sleepTime);
    const wakeTime = this.parseTime(schedule.wakeUpTime);
    
    let hours = wakeTime - sleepTime;
    if (hours <= 0) {
      hours += 24; // Handle sleep across midnight
    }
    
    return hours;
  }

  private static parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours + minutes / 60;
  }

  private static calculateDaysUntilRetirement(userProfile: UserProfile): number {
    const now = new Date();
    const retirementDate = new Date(userProfile.retirementDate);
    const diffTime = retirementDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  static formatTimeUntilRetirement(
    userProfile: UserProfile,
    format: 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds'
  ): string {
    try {
      const now = new Date();
      const retirementDate = new Date(userProfile.retirementDate);
      
      // 检查日期是否有效
      if (isNaN(retirementDate.getTime())) {
        return '日期错误';
      }
      
      const diffTime = retirementDate.getTime() - now.getTime();

      if (diffTime <= 0) {
        return '已退休！🎉';
      }

      const diffMilliseconds = diffTime;
      const diffSeconds = Math.floor(diffTime / 1000);
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffMonths = Math.floor(diffDays / 30.44); // Average days per month
      const diffYears = Math.floor(diffDays / 365.25); // Account for leap years

      switch (format) {
        case 'years':
          return `${diffYears}`;
        case 'months':
          return `${diffMonths}`;
        case 'days':
          return `${diffDays}`;
        case 'hours':
          return `${diffHours}`;
        case 'minutes':
          return `${diffMinutes}`;
        case 'seconds':
          return `${diffSeconds}`;
        case 'milliseconds':
          return `${diffMilliseconds}`;
        default:
          return `${diffDays}`;
      }
    } catch (error) {
      console.error('计算退休时间失败:', error);
      return '计算错误';
    }
  }

  static calculateRetirementProgress(userProfile: UserProfile): number {
    try {
      const retirementDate = new Date(userProfile.retirementDate);
      const now = new Date();

      // 获取工作开始日期
      let workStartDate: Date;
      if (userProfile.workStartDate && userProfile.workStartDate instanceof Date && !isNaN(userProfile.workStartDate.getTime())) {
        workStartDate = userProfile.workStartDate;
      } else {
        // 如果没有工作开始日期，默认为22岁开始工作
        workStartDate = new Date(
          userProfile.birthDate.getFullYear() + 22,
          userProfile.birthDate.getMonth(),
          userProfile.birthDate.getDate()
        );
      }

      // 检查日期是否有效
      if (isNaN(workStartDate.getTime()) || isNaN(retirementDate.getTime())) {
        return 0;
      }

      // 如果还没开始工作，返回0
      if (now.getTime() < workStartDate.getTime()) {
        return 0;
      }

      // 如果已经退休，返回100
      if (now.getTime() >= retirementDate.getTime()) {
        return 100;
      }

      // 计算工作生涯的总时间和已工作时间
      const totalWorkingTime = retirementDate.getTime() - workStartDate.getTime();
      const timeWorked = now.getTime() - workStartDate.getTime();

      const progress = Math.min(Math.max(timeWorked / totalWorkingTime, 0), 1);
      return progress * 100; // Return as percentage
    } catch (error) {
      console.error('计算退休进度失败:', error);
      return 0;
    }
  }
}
