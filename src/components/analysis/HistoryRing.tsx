import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';

interface TimeData {
  work: { hours: number; percentage: number };
  sleep: { hours: number; percentage: number };
  free: { hours: number; percentage: number };
}

interface CalendarDayRingProps {
  timeData: TimeData;
  day: number; // 日期数字
  isToday?: boolean;
  isCurrentMonth?: boolean;
  colors?: {
    work: string;
    sleep: string;
    free: string;
  };
}

export const CalendarDayRing: React.FC<CalendarDayRingProps> = ({
  timeData,
  day,
  isToday = false,
  isCurrentMonth = true,
  colors = {
    work: '#FF6B6B',    // 红色 - 工作
    sleep: '#9B59B6',   // 紫色 - 睡眠
    free: '#2ECC71'     // 绿色 - 自由时间
  }
}) => {
  const size = 44; // iOS日历单元格标准大小
  const center = size / 2;
  const radius = 18; // 圆环半径
  const strokeWidth = 3; // 圆环宽度

  // 计算角度
  const freeAngle = (timeData.free.percentage / 100) * 360;
  const workAngle = (timeData.work.percentage / 100) * 360;
  const sleepAngle = (timeData.sleep.percentage / 100) * 360;

  // 使用固定的起始位置
  const freeStart = 0;
  const workStart = freeAngle;
  const sleepStart = freeAngle + workAngle;

  // SVG路径计算函数
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  // 计算路径
  const freePath = freeAngle > 0 ? describeArc(center, center, radius, freeStart, freeStart + freeAngle) : '';
  const workPath = workAngle > 0 ? describeArc(center, center, radius, workStart, workStart + workAngle) : '';
  const sleepPath = sleepAngle > 0 ? describeArc(center, center, radius, sleepStart, sleepStart + sleepAngle) : '';

  return (
    <View style={[
      styles.container,
      isToday && styles.todayContainer
    ]}>
      <Svg width={size} height={size} style={styles.svg}>
        <G>
          {/* 背景圆环 */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#E5E5E5"
            strokeWidth={strokeWidth}
            fill="none"
          />
          
          {/* 自由时间弧 */}
          {freeAngle > 0 && (
            <Path
              d={freePath}
              stroke={colors.free}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
            />
          )}
          
          {/* 工作时间弧 */}
          {workAngle > 0 && (
            <Path
              d={workPath}
              stroke={colors.work}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
            />
          )}
          
          {/* 睡眠时间弧 */}
          {sleepAngle > 0 && (
            <Path
              d={sleepPath}
              stroke={colors.sleep}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
            />
          )}
        </G>
      </Svg>
      
      {/* 中心日期数字 */}
      <View style={styles.dayNumber}>
        <Text style={[
          styles.dayText,
          !isCurrentMonth && styles.otherMonthText,
          isToday && styles.todayText
        ]}>
          {day}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  todayContainer: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 22,
  },
  svg: {
    position: 'absolute',
  },
  dayNumber: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 14,
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
});
