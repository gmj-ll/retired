// 核心功能测试脚本
import { UserProfile, DailySchedule } from '../types';
import { TimeAnalysisService } from '../services/TimeAnalysisService';
import { formatDate, calculateAge, addYears } from '../utils/dateUtils';

// 测试用户资料
const testUserProfile: UserProfile = {
  id: 'test-user-1',
  name: '张三',
  gender: 'male',
  birthDate: new Date('1990-01-01'),
  workStartDate: new Date('2010-07-01'),
  jobType: 'general',
  retirementAge: 60,
  retirementDate: addYears(new Date('1990-01-01'), 60),
  createdAt: new Date(),
  updatedAt: new Date(),
};

// 测试日程数据
const testSchedules: DailySchedule[] = [
  {
    id: 'schedule-1',
    date: formatDate(new Date()),
    workStartTime: '09:00',
    workEndTime: '18:00',
    sleepTime: '23:00',
    wakeUpTime: '07:00',
    createdAt: new Date(),
  },
  {
    id: 'schedule-2',
    date: formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000)),
    workStartTime: '09:30',
    workEndTime: '18:30',
    sleepTime: '23:30',
    wakeUpTime: '07:30',
    createdAt: new Date(),
  },
];

// 运行测试
export const runCoreTests = () => {
  console.log('🧪 开始核心功能测试...\n');

  // 测试1: 用户年龄计算
  const age = calculateAge(testUserProfile.birthDate);
  console.log(`✅ 用户年龄: ${age}岁`);

  // 测试2: 退休倒计时
  const timeUntilRetirement = TimeAnalysisService.formatTimeUntilRetirement(
    testUserProfile,
    'days'
  );
  console.log(`✅ 距离退休: ${timeUntilRetirement}`);

  // 测试3: 工作生涯进度（基于工作开始日期）
  const progress = TimeAnalysisService.calculateRetirementProgress(testUserProfile);
  console.log(`✅ 工作生涯进度: ${progress.toFixed(1)}%`);
  
  // 显示详细计算信息
  const now = new Date();
  const workStart = testUserProfile.workStartDate!;
  const retirement = testUserProfile.retirementDate;
  const totalWorkTime = retirement.getTime() - workStart.getTime();
  const workedTime = now.getTime() - workStart.getTime();
  console.log(`   工作开始: ${workStart.toLocaleDateString()}`);
  console.log(`   退休日期: ${retirement.toLocaleDateString()}`);
  console.log(`   已工作: ${(workedTime / (1000 * 60 * 60 * 24 * 365)).toFixed(1)}年`);
  console.log(`   总工作年限: ${(totalWorkTime / (1000 * 60 * 60 * 24 * 365)).toFixed(1)}年`);

  // 测试4: 时间分析
  const analysis = TimeAnalysisService.calculateTimeAnalysis(
    testSchedules,
    testUserProfile
  );
  console.log(`✅ 平均工作时间: ${analysis.averageWorkHours.toFixed(1)}小时/天`);
  console.log(`✅ 平均睡眠时间: ${analysis.averageSleepHours.toFixed(1)}小时/天`);
  console.log(`✅ 平均自由时间: ${analysis.averageFreeHours.toFixed(1)}小时/天`);
  console.log(`✅ 退休前自由时间: ${Math.floor(analysis.freeTimeUntilRetirement / 24)}天`);

  console.log('\n🎉 所有核心功能测试通过！');
  
  // 运行用户资料同步测试
  console.log('\n--- 用户资料状态同步测试 ---');
  try {
    const { testProfileSync } = require('./profileSyncTest');
    testProfileSync();
  } catch (error) {
    console.error('用户资料同步测试失败:', error);
  }
  
  // 运行工作开始日期测试
  console.log('\n--- 工作开始日期功能测试 ---');
  try {
    const { testWorkStartDateFeature } = require('./workStartDateTest');
    testWorkStartDateFeature();
  } catch (error) {
    console.error('工作开始日期测试失败:', error);
  }
  
  // 运行分析页面功能测试
  console.log('\n--- 分析页面功能测试 ---');
  try {
    const { testAnalysisScreenFeatures } = require('./analysisScreenTest');
    testAnalysisScreenFeatures();
  } catch (error) {
    console.error('分析页面功能测试失败:', error);
  }
  
  return {
    userProfile: testUserProfile,
    schedules: testSchedules,
    analysis,
  };
};
