import { RetirementPolicyService } from '../services/RetirementPolicyService';

// 测试首次参加工作日期功能
export function testWorkStartDateFeature() {
  console.log('=== 测试首次参加工作日期功能 ===');
  
  // 测试案例1: 特殊工种，工作年限足够
  const birthDate1 = new Date(1980, 0, 1); // 1980年1月1日出生
  const workStartDate1 = new Date(2000, 0, 1); // 2000年1月1日参加工作
  
  const result1 = RetirementPolicyService.calculateRetirement(
    'male',
    'special',
    birthDate1,
    workStartDate1
  );
  
  console.log('测试案例1 - 男性特殊工种，工作年限足够:');
  console.log(`出生日期: ${birthDate1.toLocaleDateString('zh-CN')}`);
  console.log(`参加工作日期: ${workStartDate1.toLocaleDateString('zh-CN')}`);
  console.log(`退休年龄: ${result1.retirementAge}岁`);
  console.log(`退休日期: ${result1.retirementDate.toLocaleDateString('zh-CN')}`);
  console.log('---');
  
  // 测试案例2: 特殊工种，工作年限不足
  const birthDate2 = new Date(1990, 0, 1); // 1990年1月1日出生
  const workStartDate2 = new Date(2020, 0, 1); // 2020年1月1日参加工作
  
  const result2 = RetirementPolicyService.calculateRetirement(
    'female',
    'special',
    birthDate2,
    workStartDate2
  );
  
  console.log('测试案例2 - 女性特殊工种，工作年限不足:');
  console.log(`出生日期: ${birthDate2.toLocaleDateString('zh-CN')}`);
  console.log(`参加工作日期: ${workStartDate2.toLocaleDateString('zh-CN')}`);
  console.log(`退休年龄: ${result2.retirementAge}岁`);
  console.log(`退休日期: ${result2.retirementDate.toLocaleDateString('zh-CN')}`);
  console.log('---');
  
  // 测试案例3: 一般职工，不受工作年限影响
  const birthDate3 = new Date(1985, 5, 15); // 1985年6月15日出生
  const workStartDate3 = new Date(2010, 8, 1); // 2010年9月1日参加工作
  
  const result3 = RetirementPolicyService.calculateRetirement(
    'male',
    'general',
    birthDate3,
    workStartDate3
  );
  
  console.log('测试案例3 - 男性一般职工:');
  console.log(`出生日期: ${birthDate3.toLocaleDateString('zh-CN')}`);
  console.log(`参加工作日期: ${workStartDate3.toLocaleDateString('zh-CN')}`);
  console.log(`退休年龄: ${result3.retirementAge}岁`);
  console.log(`退休日期: ${result3.retirementDate.toLocaleDateString('zh-CN')}`);
  
  console.log('=== 测试完成 ===');
}
