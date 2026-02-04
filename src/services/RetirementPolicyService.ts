import { UserProfile } from '@/types';

export interface RetirementPolicy {
  normalRetirementAge: number;
  earlyRetirementAge?: number;
  description: string;
}

export class RetirementPolicyService {
  /**
   * 根据用户信息计算退休年龄和日期
   * 基于中国现行退休政策
   */
  static calculateRetirement(
    gender: 'male' | 'female',
    jobType: 'general' | 'special' | 'civil_servant' | 'enterprise' | 'flexible',
    birthDate: Date,
    workStartDate?: Date
  ): { retirementAge: number; retirementDate: Date; policy: RetirementPolicy } {
    const policy = this.getRetirementPolicy(gender, jobType);
    let retirementAge = policy.normalRetirementAge;
    
    // 对于特殊工种，需要检查工作年限
    if (jobType === 'special' && workStartDate) {
      const workYears = this.calculateWorkYears(workStartDate, new Date());
      // 特殊工种需要满足一定工作年限才能提前退休
      const requiredYears = gender === 'male' ? 10 : 10; // 特殊工种要求工作满10年
      if (workYears < requiredYears) {
        // 如果工作年限不足，按一般职工退休年龄计算
        retirementAge = gender === 'male' ? 60 : 50;
      }
    }
    
    // 计算退休日期（精确到月份）
    const retirementDate = new Date(birthDate);
    retirementDate.setFullYear(birthDate.getFullYear() + retirementAge);
    
    // 如果是延迟退休政策影响的人群，需要考虑渐进式延迟
    const adjustedRetirement = this.applyDelayedRetirementPolicy(
      birthDate,
      gender,
      jobType,
      retirementAge,
      retirementDate
    );

    return {
      retirementAge: adjustedRetirement.age,
      retirementDate: adjustedRetirement.date,
      policy
    };
  }

  /**
   * 计算工作年限
   */
  private static calculateWorkYears(workStartDate: Date, currentDate: Date): number {
    const diffTime = currentDate.getTime() - workStartDate.getTime();
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return Math.floor(diffYears);
  }

  /**
   * 获取基础退休政策
   */
  private static getRetirementPolicy(
    gender: 'male' | 'female',
    jobType: 'general' | 'special' | 'civil_servant' | 'enterprise' | 'flexible'
  ): RetirementPolicy {
    switch (jobType) {
      case 'general':
        // 一般职工
        if (gender === 'male') {
          return {
            normalRetirementAge: 60,
            description: '男性职工正常退休年龄60岁'
          };
        } else {
          return {
            normalRetirementAge: 50,
            earlyRetirementAge: 45,
            description: '女性职工正常退休年龄50岁，特殊工种45岁'
          };
        }
      
      case 'civil_servant':
        // 公务员和事业单位
        if (gender === 'male') {
          return {
            normalRetirementAge: 60,
            description: '男性公务员/事业单位正常退休年龄60岁'
          };
        } else {
          return {
            normalRetirementAge: 55,
            description: '女性公务员/事业单位正常退休年龄55岁'
          };
        }
      
      case 'enterprise':
        // 企业职工
        if (gender === 'male') {
          return {
            normalRetirementAge: 60,
            description: '男性企业职工正常退休年龄60岁'
          };
        } else {
          return {
            normalRetirementAge: 55,
            description: '女性企业管理人员正常退休年龄55岁'
          };
        }
      
      case 'special':
        // 特殊工种
        if (gender === 'male') {
          return {
            normalRetirementAge: 55,
            description: '男性特殊工种正常退休年龄55岁'
          };
        } else {
          return {
            normalRetirementAge: 45,
            description: '女性特殊工种正常退休年龄45岁'
          };
        }
      
      case 'flexible':
        // 灵活就业
        if (gender === 'male') {
          return {
            normalRetirementAge: 60,
            description: '男性灵活就业人员正常退休年龄60岁'
          };
        } else {
          return {
            normalRetirementAge: 55,
            description: '女性灵活就业人员正常退休年龄55岁'
          };
        }
      
      default:
        return {
          normalRetirementAge: gender === 'male' ? 60 : 55,
          description: '按一般政策执行'
        };
    }
  }

  /**
   * 应用延迟退休政策
   * 根据出生年份和性别计算渐进式延迟退休
   */
  private static applyDelayedRetirementPolicy(
    birthDate: Date,
    gender: 'male' | 'female',
    jobType: string,
    baseRetirementAge: number,
    baseRetirementDate: Date
  ): { age: number; date: Date } {
    const birthYear = birthDate.getFullYear();
    
    // 延迟退休政策预计从2025年开始实施
    // 这里是基于公开信息的预估，实际政策以官方为准
    
    // 对于1965年以后出生的女性职工，可能会受到延迟退休影响
    if (gender === 'female' && jobType === 'general' && birthYear >= 1965) {
      // 渐进式延迟，每年延迟几个月
      const delayMonths = Math.min((birthYear - 1965) * 4, 60); // 最多延迟5年
      const adjustedDate = new Date(baseRetirementDate);
      adjustedDate.setMonth(adjustedDate.getMonth() + delayMonths);
      
      return {
        age: baseRetirementAge + Math.floor(delayMonths / 12),
        date: adjustedDate
      };
    }
    
    // 对于1963年以后出生的女性干部，可能会受到延迟退休影响
    if (gender === 'female' && (jobType === 'civil_servant' || jobType === 'enterprise') && birthYear >= 1963) {
      const delayMonths = Math.min((birthYear - 1963) * 6, 60); // 最多延迟5年
      const adjustedDate = new Date(baseRetirementDate);
      adjustedDate.setMonth(adjustedDate.getMonth() + delayMonths);
      
      return {
        age: baseRetirementAge + Math.floor(delayMonths / 12),
        date: adjustedDate
      };
    }
    
    // 男性延迟退休政策预计影响1962年以后出生的人
    if (gender === 'male' && birthYear >= 1962) {
      const delayMonths = Math.min((birthYear - 1962) * 4, 60); // 最多延迟5年
      const adjustedDate = new Date(baseRetirementDate);
      adjustedDate.setMonth(adjustedDate.getMonth() + delayMonths);
      
      return {
        age: baseRetirementAge + Math.floor(delayMonths / 12),
        date: adjustedDate
      };
    }
    
    return {
      age: baseRetirementAge,
      date: baseRetirementDate
    };
  }

  /**
   * 获取职业类型的中文描述
   */
  static getJobTypeDescription(jobType: string): string {
    const descriptions = {
      general: '一般职工',
      special: '特殊工种',
      civil_servant: '公务员/事业单位',
      enterprise: '企业管理人员',
      flexible: '灵活就业人员'
    };
    return descriptions[jobType as keyof typeof descriptions] || '其他';
  }

  /**
   * 获取退休政策说明
   */
  static getPolicyExplanation(profile: UserProfile): string {
    const policy = this.getRetirementPolicy(profile.gender, profile.jobType);
    const birthYear = profile.birthDate.getFullYear();
    
    let explanation = policy.description;
    
    // 添加工作年限说明
    if (profile.workStartDate && profile.jobType === 'special') {
      const workYears = this.calculateWorkYears(profile.workStartDate, new Date());
      const requiredYears = 10;
      
      if (workYears >= requiredYears) {
        explanation += `\n工作年限：${workYears}年，满足特殊工种退休条件。`;
      } else {
        explanation += `\n工作年限：${workYears}年，需满${requiredYears}年才能按特殊工种退休。`;
      }
    }
    
    // 添加延迟退休政策说明
    if (
      (profile.gender === 'female' && profile.jobType === 'general' && birthYear >= 1965) ||
      (profile.gender === 'female' && (profile.jobType === 'civil_servant' || profile.jobType === 'enterprise') && birthYear >= 1963) ||
      (profile.gender === 'male' && birthYear >= 1962)
    ) {
      explanation += '\n\n注意：根据延迟退休政策，您的实际退休时间可能会有所调整。';
    }
    
    return explanation;
  }
}
