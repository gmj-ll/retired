import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { UserProfile } from '@/types';
import { StorageService } from '@/services/StorageService';
import { RetirementPolicyService } from '@/services/RetirementPolicyService';

interface OnboardingScreenProps {
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [workStartYear, setWorkStartYear] = useState('');
  const [workStartMonth, setWorkStartMonth] = useState('');
  const [workStartDay, setWorkStartDay] = useState('');
  const [jobType, setJobType] = useState<'general' | 'special' | 'civil_servant' | 'enterprise' | 'flexible'>('general');
  const [loading, setLoading] = useState(false);

  const jobTypeOptions = [
    { key: 'general', label: '一般职工' },
    { key: 'enterprise', label: '企业管理人员' },
    { key: 'civil_servant', label: '公务员/事业单位' },
    { key: 'special', label: '特殊工种' },
    { key: 'flexible', label: '灵活就业人员' },
  ];

  const handleComplete = async () => {
    // 验证输入
    if (!name.trim()) {
      Alert.alert('提示', '请输入您的姓名');
      return;
    }

    const year = parseInt(birthYear);
    const month = parseInt(birthMonth);
    const day = parseInt(birthDay);

    if (!year || year < 1940 || year > new Date().getFullYear() - 16) {
      Alert.alert('提示', '请输入有效的出生年份');
      return;
    }

    if (!month || month < 1 || month > 12) {
      Alert.alert('提示', '请输入有效的出生月份 (1-12)');
      return;
    }

    if (!day || day < 1 || day > 31) {
      Alert.alert('提示', '请输入有效的出生日期 (1-31)');
      return;
    }

    // 验证工作开始日期
    const workYear = parseInt(workStartYear);
    const workMonth = parseInt(workStartMonth);
    const workDay = parseInt(workStartDay);

    if (!workYear || workYear < year + 16 || workYear > new Date().getFullYear()) {
      Alert.alert('提示', '请输入有效的参加工作年份');
      return;
    }

    if (!workMonth || workMonth < 1 || workMonth > 12) {
      Alert.alert('提示', '请输入有效的参加工作月份 (1-12)');
      return;
    }

    if (!workDay || workDay < 1 || workDay > 31) {
      Alert.alert('提示', '请输入有效的参加工作日期 (1-31)');
      return;
    }

    try {
      setLoading(true);
      
      const birthDate = new Date(year, month - 1, day);
      const workStartDate = new Date(workYear, workMonth - 1, workDay);
      
      // 验证工作开始日期不能早于出生日期
      if (workStartDate.getTime() < birthDate.getTime()) {
        Alert.alert('提示', '参加工作日期不能早于出生日期');
        return;
      }
      
      // 使用退休政策服务计算退休信息
      const retirementInfo = RetirementPolicyService.calculateRetirement(
        gender,
        jobType,
        birthDate,
        workStartDate
      );
      
      // 检查退休日期是否已过
      if (retirementInfo.retirementDate.getTime() < Date.now()) {
        Alert.alert('恭喜', '根据政策，您已经到了退休年龄！🎉');
      }

      const profile: UserProfile = {
        id: Date.now().toString(),
        name: name.trim(),
        gender,
        birthDate,
        workStartDate,
        jobType,
        retirementAge: retirementInfo.retirementAge,
        retirementDate: retirementInfo.retirementDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await StorageService.saveUserProfile(profile);
      
      // 显示退休政策说明
      const policyExplanation = RetirementPolicyService.getPolicyExplanation(profile);
      Alert.alert(
        '设置完成',
        `根据您的信息，预计退休时间为：${retirementInfo.retirementDate.toLocaleDateString('zh-CN')}\n\n${policyExplanation}`,
        [{ text: '开始使用', onPress: () => onComplete(profile) }]
      );
    } catch (error) {
      console.error('保存用户资料失败:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>欢迎使用退休倒计时</Text>
          <Text style={styles.subtitle}>请填写您的基本信息，开始您的退休倒计时之旅</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>姓名</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="请输入您的姓名"
              maxLength={20}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>性别</Text>
            <View style={styles.optionRow}>
              <TouchableOpacity
                style={[styles.optionButton, gender === 'male' && styles.selectedOption]}
                onPress={() => setGender('male')}
              >
                <Text style={[styles.optionText, gender === 'male' && styles.selectedOptionText]}>
                  男性
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, gender === 'female' && styles.selectedOption]}
                onPress={() => setGender('female')}
              >
                <Text style={[styles.optionText, gender === 'female' && styles.selectedOptionText]}>
                  女性
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>出生日期</Text>
            <View style={styles.dateInputRow}>
              <TextInput
                style={[styles.input, styles.dateInput]}
                value={birthYear}
                onChangeText={setBirthYear}
                placeholder="年份"
                keyboardType="numeric"
                maxLength={4}
              />
              <Text style={styles.dateSeparator}>年</Text>
              <TextInput
                style={[styles.input, styles.dateInput]}
                value={birthMonth}
                onChangeText={setBirthMonth}
                placeholder="月"
                keyboardType="numeric"
                maxLength={2}
              />
              <Text style={styles.dateSeparator}>月</Text>
              <TextInput
                style={[styles.input, styles.dateInput]}
                value={birthDay}
                onChangeText={setBirthDay}
                placeholder="日"
                keyboardType="numeric"
                maxLength={2}
              />
              <Text style={styles.dateSeparator}>日</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>首次参加工作日期</Text>
            <Text style={styles.hint}>用于计算工作年限，影响某些退休政策</Text>
            <View style={styles.dateInputRow}>
              <TextInput
                style={[styles.input, styles.dateInput]}
                value={workStartYear}
                onChangeText={setWorkStartYear}
                placeholder="年份"
                keyboardType="numeric"
                maxLength={4}
              />
              <Text style={styles.dateSeparator}>年</Text>
              <TextInput
                style={[styles.input, styles.dateInput]}
                value={workStartMonth}
                onChangeText={setWorkStartMonth}
                placeholder="月"
                keyboardType="numeric"
                maxLength={2}
              />
              <Text style={styles.dateSeparator}>月</Text>
              <TextInput
                style={[styles.input, styles.dateInput]}
                value={workStartDay}
                onChangeText={setWorkStartDay}
                placeholder="日"
                keyboardType="numeric"
                maxLength={2}
              />
              <Text style={styles.dateSeparator}>日</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>职业类型</Text>
            <Text style={styles.hint}>根据您的职业类型，系统将自动计算退休年龄</Text>
            <View style={styles.jobTypeContainer}>
              {jobTypeOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.jobTypeButton,
                    jobType === option.key && styles.selectedJobType
                  ]}
                  onPress={() => setJobType(option.key as any)}
                >
                  <Text style={[
                    styles.jobTypeText,
                    jobType === option.key && styles.selectedJobTypeText
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.completeButton, loading && styles.disabledButton]} 
          onPress={handleComplete}
          disabled={loading}
        >
          <Text style={styles.completeButtonText}>
            {loading ? '保存中...' : '开始倒计时'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
    marginRight: 5,
  },
  dateSeparator: {
    fontSize: 16,
    color: '#666',
    marginHorizontal: 5,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  completeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 25,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionButton: {
    flex: 0.48,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  optionText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  jobTypeContainer: {
    marginTop: 10,
  },
  jobTypeButton: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  selectedJobType: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  jobTypeText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  selectedJobTypeText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
});
