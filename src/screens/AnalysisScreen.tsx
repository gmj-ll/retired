import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserProfile } from '@/hooks/useUserProfile';
import { TimeAnalysisService } from '@/services/TimeAnalysisService';
import { TimeDataStorageService } from '@/services/TimeDataStorageService';
import { DailyRing } from '@/components/analysis/DailyRing';
import { CareerRing } from '@/components/analysis/CareerRing';
import { TimeUnitSelector } from '@/components/analysis/TimeUnitSelector';
import { ProgressIndicator } from '@/components/analysis/ProgressIndicator';
import { HistoryCalendarScreen } from '@/screens/HistoryCalendarScreen';

const { width } = Dimensions.get('window');

export const AnalysisScreen: React.FC = () => {
  const { profile, loading } = useUserProfile();
  const [currentPage, setCurrentPage] = useState(0);
  const [timeUnit, setTimeUnit] = useState<'years' | 'months' | 'days' | 'hours'>('years');
  const [isDragging, setIsDragging] = useState(false);
  const [showHistoryCalendar, setShowHistoryCalendar] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // 昨日时间数据状态
  const [yesterdayTimeData, setYesterdayTimeData] = useState(() => {
    // 获取昨天的日期
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // 生成昨日的默认数据（考虑双休日和节假日）
    return TimeAnalysisService.calculateDailyTimeDistribution(undefined, yesterday);
  });

  // 组件挂载时加载昨日数据并检查是否需要保存历史记录
  useEffect(() => {
    const initializeData = async () => {
      try {
        // 检查并保存昨日记录到历史
        await TimeDataStorageService.checkAndSaveYesterdayRecord();
        
        // 加载昨日时间数据
        const savedYesterdayData = await TimeDataStorageService.getYesterdayTimeData();
        if (savedYesterdayData) {
          setYesterdayTimeData(savedYesterdayData);
        }
      } catch (error) {
        console.error('初始化数据失败:', error);
      }
    };

    initializeData();
  }, []);

  // 处理时间数据变化
  const handleTimeChange = async (newTimeData: any) => {
    setYesterdayTimeData(newTimeData);
    
    try {
      // 保存昨日时间数据
      await TimeDataStorageService.saveYesterdayTimeData(newTimeData);
      console.log('昨日时间分配已更新:', newTimeData);
    } catch (error) {
      console.error('保存昨日时间数据失败:', error);
    }
  };

  // 处理拖拽状态变化
  const handleDragStateChange = (dragging: boolean) => {
    setIsDragging(dragging);
  };

  // 处理日历按钮点击
  const handleCalendarPress = () => {
    setShowHistoryCalendar(true);
  };

  // 关闭历史日历
  const handleCloseHistoryCalendar = () => {
    setShowHistoryCalendar(false);
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
  
  // 计算职业生涯数据
  const careerTimeData = TimeAnalysisService.calculateCareerTimeDistribution(
    profile,
    {
      averageWorkHours: yesterdayTimeData.work.hours,
      averageSleepHours: yesterdayTimeData.sleep.hours,
      averageFreeHours: yesterdayTimeData.free.hours,
    }
  );

  return (
    <View style={styles.container}>
      {/* 右上角日历按钮 */}
      <TouchableOpacity 
        style={styles.calendarButton}
        onPress={handleCalendarPress}
      >
        <Ionicons name="calendar-outline" size={24} color="#007AFF" />
      </TouchableOpacity>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={!isDragging} // 当圆环在拖拽时禁用滚动
        onMomentumScrollEnd={(event) => {
          const page = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentPage(page);
        }}
      >
            {/* 昨日圆环页面 */}
            <View style={styles.page}>
              <View style={styles.pageHeader}>
                <Text style={styles.pageTitle}>昨日时间分析</Text>
                <Text style={styles.pageSubtitle}>查看您昨天的时间分配情况</Text>
              </View>
              
              <View style={styles.ringContainer}>
                <DailyRing 
                  timeData={yesterdayTimeData} 
                  onTimeChange={handleTimeChange}
                  onDragStateChange={handleDragStateChange}
                  editable={true}
                />
              </View>
              
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{yesterdayTimeData.work.percentage.toFixed(1)}%</Text>
                  <Text style={styles.statLabel}>工作时间占比</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{yesterdayTimeData.sleep.percentage.toFixed(1)}%</Text>
                  <Text style={styles.statLabel}>睡眠时间占比</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{yesterdayTimeData.free.percentage.toFixed(1)}%</Text>
                  <Text style={styles.statLabel}>自由时间占比</Text>
                </View>
              </View>
            </View>

            {/* 职业生涯圆环页面 */}
            <View style={styles.page}>
              <View style={styles.pageHeader}>
                <Text style={styles.pageTitle}>职业生涯分析</Text>
                <Text style={styles.pageSubtitle}>从工作到退休的时间分配预测</Text>
              </View>
              
              <TimeUnitSelector
                selectedUnit={timeUnit}
                onUnitChange={(unit) => {
                  if (unit !== 'minutes') {
                    setTimeUnit(unit);
                  }
                }}
                availableUnits={['years', 'months', 'days', 'hours']}
              />
              
              <View style={styles.ringContainer}>
                <CareerRing 
                  timeData={careerTimeData} 
                  timeUnit={timeUnit}
                />
              </View>
              
              <View style={styles.progressContainer}>
                <Text style={styles.progressTitle}>职业生涯进度</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${careerTimeData.currentProgress}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {careerTimeData.currentProgress.toFixed(1)}% 完成
                </Text>
              </View>
              
              <View style={styles.insightContainer}>
                <View style={styles.insightHeader}>
                  <Ionicons name="bulb-outline" size={20} color="#FF9500" />
                  <Text style={styles.insightTitle}>时间洞察</Text>
                </View>
                <Text style={styles.insightText}>
                  基于当前的时间分配模式，您在整个职业生涯中将拥有{' '}
                  {timeUnit === 'years' 
                    ? `${(careerTimeData.totalFree.hours / (24 * 365)).toFixed(1)}年` 
                    : `${Math.floor(careerTimeData.totalFree.hours / 24)}天`
                  }的自由时间。
                </Text>
              </View>
            </View>
          </ScrollView>
      
      <ProgressIndicator currentPage={currentPage} totalPages={2} />

      {/* 历史日历模态框 */}
      <Modal
        visible={showHistoryCalendar}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <HistoryCalendarScreen onClose={handleCloseHistoryCalendar} />
      </Modal>
    </View>
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
  calendarButton: {
    position: 'absolute',
    top: 50, // 状态栏下方
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000, // 确保在最上层
  },
  page: {
    width,
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60, // 为右上角按钮留出空间
  },
  pageHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  progressContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  insightContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
