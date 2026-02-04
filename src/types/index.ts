export interface UserProfile {
  id: string;
  name: string;
  gender: 'male' | 'female';
  birthDate: Date;
  jobType: 'general' | 'special' | 'civil_servant' | 'enterprise' | 'flexible';
  workStartDate?: Date; // 参加工作时间
  retirementAge: number; // 计算得出的退休年龄
  retirementDate: Date; // 计算得出的退休日期
  profileImage?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailySchedule {
  id: string;
  date: string; // YYYY-MM-DD format
  workStartTime: string; // HH:mm format
  workEndTime: string; // HH:mm format
  sleepTime: string; // HH:mm format
  wakeUpTime: string; // HH:mm format
  notes?: string;
  createdAt: Date;
}

export interface TimeAnalysis {
  totalWorkHours: number;
  totalSleepHours: number;
  totalFreeHours: number;
  averageWorkHours: number;
  averageSleepHours: number;
  averageFreeHours: number;
  daysUntilRetirement: number;
  freeTimeUntilRetirement: number; // in hours
}

export interface WidgetSettings {
  displayFormat: 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds';
  backgroundImage?: string;
  showProgressRing: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface AppSettings {
  notifications: {
    dailyReminder: boolean;
    reminderTime: string;
    weeklyAnalysis: boolean;
  };
  widget: WidgetSettings;
  privacy: {
    requireAuth: boolean;
    biometricAuth: boolean;
  };
}

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

export type TabParamList = {
  Home: undefined;
  Analysis: undefined;
  Settings: undefined;
};
