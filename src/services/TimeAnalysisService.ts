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
   * 计算职业生涯总时间分配
   */
  static calculateCareerTimeDistribution(
    userProfile: UserProfile,
    averageSchedule?: {
      averageWorkHours: number;
      averageSleepHours: number;
      averageFreeHours: number;
    }
  ) {
    // 计算工作年限 - 确保日期对象有效
    let workStartDate: Date;
    if (userProfile.workStartDate && userProfile.workStartDate instanceof Date && !isNaN(userProfile.workStartDate.getTime())) {
      workStartDate = userProfile.workStartDate;
    } else {
      // 如果没有工作开始日期或日期无效，默认为22岁开始工作
      workStartDate = new Date(
        userProfile.birthDate.getFullYear() + 22,
        userProfile.birthDate.getMonth(),
        userProfile.birthDate.getDate()
      );
    }
    
    const retirementDate = new Date(userProfile.retirementDate);
    const workingDays = Math.max(0, Math.floor((retirementDate.getTime() - workStartDate.getTime()) / (1000 * 60 * 60 * 24)));

    // 使用平均值或默认值
    const avgWork = averageSchedule?.averageWorkHours || 8;
    const avgSleep = averageSchedule?.averageSleepHours || 8;
    const avgFree = averageSchedule?.averageFreeHours || 8;

    // 计算总时间
    const totalWorkHours = avgWork * workingDays;
    const totalSleepHours = avgSleep * workingDays;
    const totalFreeHours = avgFree * workingDays;
    const totalHours = totalWorkHours + totalSleepHours + totalFreeHours;

    // 计算当前进度
    const now = new Date();
    const timeWorked = Math.max(0, now.getTime() - workStartDate.getTime());
    const totalWorkTime = retirementDate.getTime() - workStartDate.getTime();
    const currentProgress = Math.min((timeWorked / totalWorkTime) * 100, 100);

    return {
      totalWork: {
        hours: totalWorkHours,
        percentage: (totalWorkHours / totalHours) * 100
      },
      totalSleep: {
        hours: totalSleepHours,
        percentage: (totalSleepHours / totalHours) * 100
      },
      totalFree: {
        hours: totalFreeHours,
        percentage: (totalFreeHours / totalHours) * 100
      },
      currentProgress
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
