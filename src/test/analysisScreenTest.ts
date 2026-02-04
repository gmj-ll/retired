import { TimeAnalysisService } from '../services/TimeAnalysisService';
import { UserProfile } from '../types';

// 测试分析页面功能
export function testAnalysisScreenFeatures() {
  console.log('=== 测试分析页面功能 ===');
  
  // 创建测试用户资料
  const testProfile: UserProfile = {
    id: 'test-analysis-1',
    name: '测试用户',
    gender: 'male',
    birthDate: new Date(1990, 0, 1),
    workStartDate: new Date(2012, 6, 1),
    jobType: 'general',
    retirementAge: 60,
    retirementDate: new Date(2050, 0, 1),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  console.log('测试用户信息:');
  console.log(`姓名: ${testProfile.name}`);
  console.log(`出生日期: ${testProfile.birthDate.toLocaleDateString('zh-CN')}`);
  console.log(`工作开始日期: ${testProfile.workStartDate?.toLocaleDateString('zh-CN')}`);
  console.log(`退休日期: ${testProfile.retirementDate.toLocaleDateString('zh-CN')}`);
  console.log('---');

  // 测试1: 生成模拟当日时间记录
  const mockSchedule = TimeAnalysisService.generateMockDailySchedule();
  console.log('测试1 - 模拟当日时间记录:');
  console.log(`日期: ${mockSchedule.date}`);
  console.log(`工作时间: ${mockSchedule.workStartTime} - ${mockSchedule.workEndTime}`);
  console.log(`睡眠时间: ${mockSchedule.sleepTime} - ${mockSchedule.wakeUpTime}`);
  console.log('---');

  // 测试2: 计算当日时间分配
  const dailyTimeData = TimeAnalysisService.calculateDailyTimeDistribution(mockSchedule);
  console.log('测试2 - 当日时间分配:');
  console.log(`工作: ${dailyTimeData.work.hours.toFixed(1)}小时 (${dailyTimeData.work.percentage.toFixed(1)}%)`);
  console.log(`睡眠: ${dailyTimeData.sleep.hours.toFixed(1)}小时 (${dailyTimeData.sleep.percentage.toFixed(1)}%)`);
  console.log(`自由: ${dailyTimeData.free.hours.toFixed(1)}小时 (${dailyTimeData.free.percentage.toFixed(1)}%)`);
  console.log('---');

  // 测试3: 计算职业生涯时间分配
  const careerTimeData = TimeAnalysisService.calculateCareerTimeDistribution(
    testProfile,
    {
      averageWorkHours: dailyTimeData.work.hours,
      averageSleepHours: dailyTimeData.sleep.hours,
      averageFreeHours: dailyTimeData.free.hours,
    }
  );
  
  console.log('测试3 - 职业生涯时间分配:');
  console.log(`总工作时间: ${(careerTimeData.totalWork.hours / (24 * 365)).toFixed(1)}年`);
  console.log(`总睡眠时间: ${(careerTimeData.totalSleep.hours / (24 * 365)).toFixed(1)}年`);
  console.log(`总自由时间: ${(careerTimeData.totalFree.hours / (24 * 365)).toFixed(1)}年`);
  console.log(`当前进度: ${careerTimeData.currentProgress.toFixed(1)}%`);
  console.log('---');

  // 测试4: 退休进度计算
  const retirementProgress = TimeAnalysisService.calculateRetirementProgress(testProfile);
  console.log('测试4 - 退休进度:');
  console.log(`退休完成度: ${retirementProgress.toFixed(1)}%`);
  
  // 测试5: 剩余时间计算
  const daysUntilRetirement = TimeAnalysisService.calculateDaysUntilRetirement(testProfile);
  console.log(`剩余天数: ${daysUntilRetirement}天`);
  console.log(`剩余年数: ${Math.floor(daysUntilRetirement / 365)}年`);
  console.log('---');

  // 测试6: 时间格式化
  console.log('测试6 - 时间格式化:');
  const timeFormats = ['years', 'months', 'days', 'hours'] as const;
  timeFormats.forEach(format => {
    const formattedTime = TimeAnalysisService.formatTimeUntilRetirement(testProfile, format);
    console.log(`${format}: ${formattedTime}`);
  });

  console.log('=== 分析页面功能测试完成 ===');
}
