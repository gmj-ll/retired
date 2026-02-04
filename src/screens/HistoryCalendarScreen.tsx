import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CalendarDayRing } from '@/components/analysis/HistoryRing';
import { TimeDataStorageService, DailyTimeRecord } from '@/services/TimeDataStorageService';

const { width } = Dimensions.get('window');

interface DayData {
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasRecord: boolean; // 是否有时间记录
  timeData?: {
    work: { hours: number; percentage: number };
    sleep: { hours: number; percentage: number };
    free: { hours: number; percentage: number };
  };
}

interface HistoryCalendarScreenProps {
  onClose: () => void;
}

export const HistoryCalendarScreen: React.FC<HistoryCalendarScreenProps> = ({ onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<DayData[]>([]);
  const [timeRecords, setTimeRecords] = useState<DailyTimeRecord[]>([]);

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  // 加载时间记录
  useEffect(() => {
    const loadTimeRecords = async () => {
      try {
        const records = await TimeDataStorageService.getAllTimeRecords();
        setTimeRecords(records);
      } catch (error) {
        console.error('加载时间记录失败:', error);
      }
    };

    loadTimeRecords();
  }, []);

  // 生成日历数据
  useEffect(() => {
    const generateCalendarData = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const today = new Date();
      
      // 获取当月第一天和最后一天
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      // 获取第一天是星期几
      const firstDayWeek = firstDay.getDay();
      
      // 获取上个月的最后几天
      const prevMonth = new Date(year, month, 0);
      const prevMonthDays = prevMonth.getDate();
      
      const days: DayData[] = [];
      
      // 添加上个月的日期
      for (let i = firstDayWeek - 1; i >= 0; i--) {
        const day = prevMonthDays - i;
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const record = timeRecords.find(r => r.date === dateStr);
        
        days.push({
          day,
          isCurrentMonth: false,
          isToday: false,
          hasRecord: !!record,
          timeData: record?.timeData
        });
      }
      
      // 添加当月的日期
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const isToday = year === today.getFullYear() && 
                       month === today.getMonth() && 
                       day === today.getDate();
        
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const record = timeRecords.find(r => r.date === dateStr);
        
        days.push({
          day,
          isCurrentMonth: true,
          isToday,
          hasRecord: !!record,
          timeData: record?.timeData
        });
      }
      
      // 添加下个月的日期，补齐6行
      const remainingDays = 42 - days.length; // 6行 × 7天 = 42天
      for (let day = 1; day <= remainingDays; day++) {
        const dateStr = `${year}-${String(month + 2).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const record = timeRecords.find(r => r.date === dateStr);
        
        days.push({
          day,
          isCurrentMonth: false,
          isToday: false,
          hasRecord: !!record,
          timeData: record?.timeData
        });
      }
      
      setCalendarData(days);
    };

    generateCalendarData();
  }, [currentDate, timeRecords]);



  // 切换月份
  const changeMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  return (
    <View style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <View style={styles.monthNavigation}>
          <TouchableOpacity onPress={() => changeMonth('prev')}>
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          
          <Text style={styles.monthTitle}>
            {currentDate.getFullYear()}年{months[currentDate.getMonth()]}
          </Text>
          
          <TouchableOpacity onPress={() => changeMonth('next')}>
            <Ionicons name="chevron-forward" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.placeholder} />
      </View>

      {/* 图例 */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
          <Text style={styles.legendText}>工作</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#9B59B6' }]} />
          <Text style={styles.legendText}>睡眠</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#2ECC71' }]} />
          <Text style={styles.legendText}>自由</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 星期标题 */}
        <View style={styles.weekHeader}>
          {weekDays.map((day, index) => (
            <View key={index} style={styles.weekDay}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* 日历网格 */}
        <View style={styles.calendar}>
          {Array.from({ length: 6 }, (_, weekIndex) => (
            <View key={weekIndex} style={styles.week}>
              {calendarData.slice(weekIndex * 7, (weekIndex + 1) * 7).map((dayData, dayIndex) => (
                <View key={dayIndex} style={styles.dayContainer}>
                  {dayData.hasRecord && dayData.timeData ? (
                    <CalendarDayRing
                      timeData={dayData.timeData}
                      day={dayData.day}
                      isToday={dayData.isToday}
                      isCurrentMonth={dayData.isCurrentMonth}
                    />
                  ) : (
                    <View style={styles.dayWithoutRing}>
                      <Text style={[
                        styles.dayText,
                        !dayData.isCurrentMonth && styles.otherMonthText,
                        dayData.isToday && styles.todayText
                      ]}>
                        {dayData.day}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
        
        {/* 底部说明 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            圆环显示每日时间分配比例
          </Text>
          <Text style={styles.footerSubtext}>
            点击左右箭头切换月份查看历史数据
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginHorizontal: 20,
    minWidth: 120,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  calendar: {
    backgroundColor: 'white',
  },
  week: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  dayContainer: {
    flex: 1,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E5E5',
  },
  dayWithoutRing: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    textAlign: 'center',
  },
  otherMonthText: {
    color: '#C7C7CC',
  },
  todayText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
