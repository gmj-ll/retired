import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserProfile } from '@/hooks/useUserProfile';
import { TimeAnalysisService } from '@/services/TimeAnalysisService';
import { safeFormatDate } from '@/utils/dateUtils';
import { ImagePickerService } from '@/services/ImagePickerService';

const { width, height } = Dimensions.get('window');

type TimeFormat = 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds';

const TIME_FORMATS: { key: TimeFormat; label: string; unit: string }[] = [
  { key: 'years', label: '年', unit: '年' },
  { key: 'months', label: '月', unit: '个月' },
  { key: 'days', label: '日', unit: '天' },
  { key: 'hours', label: '时', unit: '小时' },
  { key: 'minutes', label: '分', unit: '分钟' },
  { key: 'seconds', label: '秒', unit: '秒' },
  { key: 'milliseconds', label: '毫秒', unit: '毫秒' },
];

export const HomeScreen: React.FC = () => {
  const { profile, loading: profileLoading, updateProfile } = useUserProfile();
  const [currentFormat, setCurrentFormat] = useState<TimeFormat>('days');
  const [timeUntilRetirement, setTimeUntilRetirement] = useState('');

  const handleChangeBackground = () => {
    ImagePickerService.showImagePickerOptions(async (uri: string) => {
      try {
        await updateProfile({ profileImage: uri });
      } catch (error) {
        console.error('更新背景图片失败:', error);
        Alert.alert('错误', '更新背景图片失败，请重试');
      }
    });
  };

  // 更新倒计时
  useEffect(() => {
    if (!profile || !profile.retirementDate) return;

    const updateTime = () => {
      try {
        const time = TimeAnalysisService.formatTimeUntilRetirement(profile, currentFormat);
        setTimeUntilRetirement(time);
      } catch (error) {
        console.error('更新时间失败:', error);
        setTimeUntilRetirement('计算错误');
      }
    };

    updateTime();
    
    // 根据时间格式设置更新频率
    let interval: NodeJS.Timeout;
    switch (currentFormat) {
      case 'milliseconds':
        interval = setInterval(updateTime, 1); // 每毫秒更新
        break;
      case 'seconds':
        interval = setInterval(updateTime, 1000); // 每秒更新
        break;
      case 'minutes':
        interval = setInterval(updateTime, 60000); // 每分钟更新
        break;
      case 'hours':
        interval = setInterval(updateTime, 3600000); // 每小时更新
        break;
      default:
        interval = setInterval(updateTime, 60000); // 默认每分钟更新
    }

    return () => clearInterval(interval);
  }, [profile, currentFormat]);

  if (profileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  if (!profile) {
    return null; // 这种情况应该不会发生，因为有引导页面
  }

  const progress = TimeAnalysisService.calculateRetirementProgress(profile);
  const currentFormatInfo = TIME_FORMATS.find(f => f.key === currentFormat)!;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.heroSection}>
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>你好，{profile.name}</Text>
        </View>
        
        <View style={styles.countdownContainer}>
          <TouchableOpacity 
            style={styles.countdownCard}
            onPress={() => {
              const currentIndex = TIME_FORMATS.findIndex(f => f.key === currentFormat);
              const nextIndex = (currentIndex + 1) % TIME_FORMATS.length;
              setCurrentFormat(TIME_FORMATS[nextIndex].key);
            }}
            onLongPress={handleChangeBackground}
            activeOpacity={0.9}
          >
            {profile.profileImage ? (
              <ImageBackground
                source={{ uri: profile.profileImage }}
                style={styles.countdownBackground}
                imageStyle={styles.countdownBackgroundImage}
              >
                <View style={styles.countdownOverlay}>
                  <Text style={styles.countdownLabel} numberOfLines={1}>距离退休还有</Text>
                  <Text 
                    style={styles.countdownText} 
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                    minimumFontScale={0.6}
                  >
                    {timeUntilRetirement}
                  </Text>
                  <Text style={styles.countdownUnit} numberOfLines={1}>{currentFormatInfo.unit}</Text>
                  
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>工作生涯 {progress.toFixed(1)}% 完成</Text>
                  </View>
                </View>
              </ImageBackground>
            ) : (
              <LinearGradient
                colors={['#4facfe', '#00f2fe']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.countdownDefaultBackground}
              >
                <View style={styles.countdownOverlay}>
                  <Text style={styles.countdownLabel} numberOfLines={1}>距离退休还有</Text>
                  <Text 
                    style={styles.countdownText} 
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                    minimumFontScale={0.6}
                  >
                    {timeUntilRetirement}
                  </Text>
                  <Text style={styles.countdownUnit} numberOfLines={1}>{currentFormatInfo.unit}</Text>
                  
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>工作生涯 {progress.toFixed(1)}% 完成</Text>
                  </View>
                </View>
              </LinearGradient>
            )}
          </TouchableOpacity>
          
          {/* 提示文字移到卡片下方 */}
          <Text style={styles.cardHint}>点击切换格式 · 长按更换背景</Text>
        </View>
      </View>

      <View style={styles.formatSelector}>
        <Text style={styles.sectionTitle}>时间格式</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.formatScroll}>
          {TIME_FORMATS.map((format) => (
            <TouchableOpacity
              key={format.key}
              style={[
                styles.formatButton,
                currentFormat === format.key && styles.activeFormatButton
              ]}
              onPress={() => setCurrentFormat(format.key)}
            >
              <Text style={[
                styles.formatButtonText,
                currentFormat === format.key && styles.activeFormatButtonText
              ]}>
                {format.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>退休信息</Text>
          <Text style={styles.infoText}>退休年龄: {profile.retirementAge}岁</Text>
          <Text style={styles.infoText}>
            退休日期: {safeFormatDate(profile.retirementDate)}
          </Text>
          {profile.workStartDate && (
            <Text style={styles.infoText}>
              参加工作: {safeFormatDate(profile.workStartDate)}
            </Text>
          )}
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
  heroSection: {
    padding: 20,
    paddingTop: 40,
  },
  greeting: {
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  countdownContainer: {
    alignItems: 'center',
  },
  countdownCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // iOS小组件标准尺寸 - 中等尺寸 (2x1)
    width: width - 40, // 屏幕宽度减去左右边距
    height: (width - 40) * 0.47, // 宽高比约为 2.13:1，接近iOS中等组件比例
  },
  countdownBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownBackgroundImage: {
    borderRadius: 20,
  },
  countdownDefaultBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 20, // 与背景图圆角保持一致
    alignItems: 'center',
    width: '100%', // 占满整个背景容器
    height: '100%', // 占满整个背景容器高度
    justifyContent: 'center', // 垂直居中内容
    position: 'absolute', // 绝对定位覆盖整个背景
    top: 0,
    left: 0,
  },
  countdownLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  countdownText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginVertical: 4,
  },
  countdownUnit: {
    fontSize: 18,
    color: '#FFD700',
    marginBottom: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
  },
  progressContainer: {
    width: width * 0.6,
    height: 30, // 固定高度防止抖动
    justifyContent: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
  },
  progressText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 6,
    fontSize: 12,
    height: 16, // 固定高度防止抖动
    lineHeight: 16, // 设置行高与高度一致
  },
  cardHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  formatSelector: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  formatScroll: {
    flexDirection: 'row',
  },
  formatButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  activeFormatButton: {
    backgroundColor: '#007AFF',
  },
  formatButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFormatButtonText: {
    color: 'white',
  },
  infoSection: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});
