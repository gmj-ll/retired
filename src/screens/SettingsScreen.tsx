import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Image,
} from 'react-native';
import { useUserProfile } from '@/hooks/useUserProfile';
import { UserProfile } from '@/types';
import { addYears, safeFormatDate } from '@/utils/dateUtils';
import { ImagePickerService } from '@/services/ImagePickerService';
import { RetirementPolicyService } from '@/services/RetirementPolicyService';

export const SettingsScreen: React.FC = () => {
  const { profile, updateProfile, loading } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    gender: 'male' as 'male' | 'female',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    workStartYear: '',
    workStartMonth: '',
    workStartDay: '',
    jobType: 'general' as 'general' | 'special' | 'civil_servant' | 'enterprise' | 'flexible',
  });

  const startEditing = () => {
    if (!profile) return;
    
    const birthDate = profile.birthDate instanceof Date ? profile.birthDate : new Date(profile.birthDate);
    const workStartDate = profile.workStartDate ? 
      (profile.workStartDate instanceof Date ? profile.workStartDate : new Date(profile.workStartDate)) :
      new Date();
    
    setEditForm({
      name: profile.name,
      gender: profile.gender,
      birthYear: birthDate.getFullYear().toString(),
      birthMonth: (birthDate.getMonth() + 1).toString(),
      birthDay: birthDate.getDate().toString(),
      workStartYear: workStartDate.getFullYear().toString(),
      workStartMonth: (workStartDate.getMonth() + 1).toString(),
      workStartDay: workStartDate.getDate().toString(),
      jobType: profile.jobType,
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditForm({
      name: '',
      gender: 'male',
      birthYear: '',
      birthMonth: '',
      birthDay: '',
      workStartYear: '',
      workStartMonth: '',
      workStartDay: '',
      jobType: 'general',
    });
  };

  const saveChanges = async () => {
    if (!profile) return;

    // 验证输入
    if (!editForm.name.trim()) {
      Alert.alert('提示', '请输入您的姓名');
      return;
    }

    const year = parseInt(editForm.birthYear);
    const month = parseInt(editForm.birthMonth);
    const day = parseInt(editForm.birthDay);
    const workYear = parseInt(editForm.workStartYear);
    const workMonth = parseInt(editForm.workStartMonth);
    const workDay = parseInt(editForm.workStartDay);

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
      const birthDate = new Date(year, month - 1, day);
      const workStartDate = new Date(workYear, workMonth - 1, workDay);
      
      if (workStartDate.getTime() < birthDate.getTime()) {
        Alert.alert('提示', '参加工作日期不能早于出生日期');
        return;
      }
      
      // 使用退休政策服务重新计算退休信息
      const retirementInfo = RetirementPolicyService.calculateRetirement(
        editForm.gender,
        editForm.jobType,
        birthDate,
        workStartDate
      );

      await updateProfile({
        name: editForm.name.trim(),
        gender: editForm.gender,
        birthDate,
        workStartDate,
        jobType: editForm.jobType,
        retirementAge: retirementInfo.retirementAge,
        retirementDate: retirementInfo.retirementDate,
      });

      setIsEditing(false);
      Alert.alert('成功', '信息已更新');
    } catch (error) {
      console.error('更新失败:', error);
      Alert.alert('错误', '更新失败，请重试');
    }
  };

  const handleSelectBackgroundImage = () => {
    ImagePickerService.showImagePickerOptions(async (uri: string) => {
      try {
        await updateProfile({ profileImage: uri });
        Alert.alert('成功', '背景图片已更新');
      } catch (error) {
        console.error('更新背景图片失败:', error);
        Alert.alert('错误', '更新背景图片失败，请重试');
      }
    });
  };

  const handleRemoveBackgroundImage = () => {
    Alert.alert(
      '确认删除',
      '确定要移除背景图片吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateProfile({ profileImage: null });
              Alert.alert('成功', '背景图片已移除');
            } catch (error) {
              console.error('移除背景图片失败:', error);
              Alert.alert('错误', '移除背景图片失败，请重试');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>暂无数据</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>个人信息</Text>
        
        <View style={styles.infoCard}>
          {!isEditing ? (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>姓名</Text>
                <Text style={styles.infoValue}>{profile.name}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>性别</Text>
                <Text style={styles.infoValue}>{profile.gender === 'male' ? '男性' : '女性'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>出生日期</Text>
                <Text style={styles.infoValue}>
                  {safeFormatDate(profile.birthDate)}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>参加工作日期</Text>
                <Text style={styles.infoValue}>
                  {profile.workStartDate ? safeFormatDate(profile.workStartDate) : '未设置'}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>职业类型</Text>
                <Text style={styles.infoValue}>{RetirementPolicyService.getJobTypeDescription(profile.jobType)}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>退休年龄</Text>
                <Text style={styles.infoValue}>{profile.retirementAge}岁</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>退休日期</Text>
                <Text style={styles.infoValue}>
                  {safeFormatDate(profile.retirementDate)}
                </Text>
              </View>
              
              <TouchableOpacity style={styles.editButton} onPress={startEditing}>
                <Text style={styles.editButtonText}>编辑信息</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>姓名</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.name}
                  onChangeText={(text) => setEditForm({...editForm, name: text})}
                  placeholder="请输入您的姓名"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>性别</Text>
                <View style={styles.genderRow}>
                  <TouchableOpacity
                    style={[styles.genderButton, editForm.gender === 'male' && styles.selectedGender]}
                    onPress={() => setEditForm({...editForm, gender: 'male'})}
                  >
                    <Text style={[styles.genderText, editForm.gender === 'male' && styles.selectedGenderText]}>
                      男性
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.genderButton, editForm.gender === 'female' && styles.selectedGender]}
                    onPress={() => setEditForm({...editForm, gender: 'female'})}
                  >
                    <Text style={[styles.genderText, editForm.gender === 'female' && styles.selectedGenderText]}>
                      女性
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>出生日期</Text>
                <View style={styles.dateInputRow}>
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    value={editForm.birthYear}
                    onChangeText={(text) => setEditForm({...editForm, birthYear: text})}
                    placeholder="年"
                    keyboardType="numeric"
                    maxLength={4}
                  />
                  <Text style={styles.dateSeparator}>年</Text>
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    value={editForm.birthMonth}
                    onChangeText={(text) => setEditForm({...editForm, birthMonth: text})}
                    placeholder="月"
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <Text style={styles.dateSeparator}>月</Text>
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    value={editForm.birthDay}
                    onChangeText={(text) => setEditForm({...editForm, birthDay: text})}
                    placeholder="日"
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <Text style={styles.dateSeparator}>日</Text>
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>参加工作日期</Text>
                <View style={styles.dateInputRow}>
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    value={editForm.workStartYear}
                    onChangeText={(text) => setEditForm({...editForm, workStartYear: text})}
                    placeholder="年"
                    keyboardType="numeric"
                    maxLength={4}
                  />
                  <Text style={styles.dateSeparator}>年</Text>
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    value={editForm.workStartMonth}
                    onChangeText={(text) => setEditForm({...editForm, workStartMonth: text})}
                    placeholder="月"
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <Text style={styles.dateSeparator}>月</Text>
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    value={editForm.workStartDay}
                    onChangeText={(text) => setEditForm({...editForm, workStartDay: text})}
                    placeholder="日"
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <Text style={styles.dateSeparator}>日</Text>
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>职业类型</Text>
                <View style={styles.jobTypeContainer}>
                  {[
                    { key: 'general', label: '一般职工' },
                    { key: 'enterprise', label: '企业管理人员' },
                    { key: 'civil_servant', label: '公务员/事业单位' },
                    { key: 'special', label: '特殊工种' },
                    { key: 'flexible', label: '灵活就业人员' },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.jobTypeButton,
                        editForm.jobType === option.key && styles.selectedJobType
                      ]}
                      onPress={() => setEditForm({...editForm, jobType: option.key as any})}
                    >
                      <Text style={[
                        styles.jobTypeText,
                        editForm.jobType === option.key && styles.selectedJobTypeText
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.cancelButton} onPress={cancelEditing}>
                  <Text style={styles.cancelButtonText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
                  <Text style={styles.saveButtonText}>保存</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>背景图片</Text>
        
        <View style={styles.backgroundCard}>
          {profile.profileImage ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: profile.profileImage }} style={styles.imagePreview} />
              <Text style={styles.imagePreviewText}>当前背景图片</Text>
            </View>
          ) : (
            <View style={styles.noImageContainer}>
              <Text style={styles.noImageText}>未设置背景图片</Text>
              <Text style={styles.noImageSubtext}>设置个性化背景让倒计时更有意义</Text>
            </View>
          )}
          
          <View style={styles.imageButtonRow}>
            <TouchableOpacity 
              style={styles.imageButton} 
              onPress={() => handleSelectBackgroundImage()}
            >
              <Text style={styles.imageButtonText}>
                {profile.profileImage ? '更换图片' : '选择图片'}
              </Text>
            </TouchableOpacity>
            
            {profile.profileImage && (
              <TouchableOpacity 
                style={[styles.imageButton, styles.removeButton]} 
                onPress={() => handleRemoveBackgroundImage()}
              >
                <Text style={[styles.imageButtonText, styles.removeButtonText]}>移除图片</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>应用设置</Text>
        
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>通知提醒</Text>
            <Switch
              value={false}
              onValueChange={() => {}}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={'#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>深色模式</Text>
            <Switch
              value={false}
              onValueChange={() => {}}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={'#f4f3f4'}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>关于</Text>
        
        <View style={styles.aboutCard}>
          <Text style={styles.aboutText}>退休倒计时 v1.0.0</Text>
          <Text style={styles.aboutDescription}>
            帮助您可视化退休倒计时，合理规划人生时间。
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingBottom: 120, // 为浮动 TabBar 留出空间，考虑安全区域
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 100,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f8f8',
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    flex: 0.45,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 15,
    flex: 0.45,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  aboutCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aboutText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  aboutDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  backgroundCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePreview: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  imagePreviewText: {
    fontSize: 14,
    color: '#666',
  },
  noImageContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 15,
  },
  noImageText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 5,
  },
  noImageSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  imageButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 12,
    flex: 0.48,
    alignItems: 'center',
  },
  imageButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
  },
  removeButtonText: {
    color: 'white',
  },
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 0.48,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  selectedGender: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  genderText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  selectedGenderText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  jobTypeContainer: {
    marginTop: 10,
  },
  jobTypeButton: {
    backgroundColor: '#f8f8f8',
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
