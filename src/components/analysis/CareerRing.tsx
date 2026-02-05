import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';

interface CareerTimeData {
  // 已花费的时间（历史数据）
  spentWork: { hours: number; percentage: number };
  spentSleep: { hours: number; percentage: number };
  spentFree: { hours: number; percentage: number };
  // 剩余时间（预估）
  remainingWork: { hours: number; percentage: number };
  remainingSleep: { hours: number; percentage: number };
  remainingFree: { hours: number; percentage: number };
  // 剩余未度过的时间
  unspentTime: { hours: number; percentage: number };
  // 统计信息
  totalDays: number;
  workedDays: number;
  remainingDays: number;
  historicalDaysCount: number;
  // 平均值
  averages: {
    work: number;
    sleep: number;
    free: number;
  };
}

interface CareerRingProps {
  timeData: CareerTimeData;
  colors?: {
    work: string;
    sleep: string;
    free: string;
    unspent: string; // 未度过时间的颜色
  };
  size?: number;
  timeUnit?: 'years' | 'months' | 'days' | 'hours';
}

const { width } = Dimensions.get('window');
const defaultSize = Math.min(width * 0.8, 300);

export const CareerRing: React.FC<CareerRingProps> = ({
  timeData,
  colors = {
    work: '#FF6B6B',    // 红色 - 工作
    sleep: '#9B59B6',   // 紫色 - 睡眠
    free: '#2ECC71',    // 绿色 - 自由时间
    unspent: '#E5E5E5'  // 灰色 - 未度过时间
  },
  size = defaultSize,
  timeUnit = 'years'
}) => {
  const center = size / 2;
  const radius = size * 0.35;
  const strokeWidth = size * 0.08;

  // 计算角度（从12点钟方向开始，顺时针）
  const spentWorkAngle = (timeData.spentWork.percentage / 100) * 360;
  const spentSleepAngle = (timeData.spentSleep.percentage / 100) * 360;
  const spentFreeAngle = (timeData.spentFree.percentage / 100) * 360;
  const unspentAngle = (timeData.unspentTime.percentage / 100) * 360;

  // 计算路径
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

  // 计算各段的路径
  let currentAngle = 0;
  
  const spentWorkPath = spentWorkAngle > 0 ? describeArc(center, center, radius, currentAngle, currentAngle + spentWorkAngle) : '';
  currentAngle += spentWorkAngle;
  
  const spentSleepPath = spentSleepAngle > 0 ? describeArc(center, center, radius, currentAngle, currentAngle + spentSleepAngle) : '';
  currentAngle += spentSleepAngle;
  
  const spentFreePath = spentFreeAngle > 0 ? describeArc(center, center, radius, currentAngle, currentAngle + spentFreeAngle) : '';
  currentAngle += spentFreeAngle;
  
  const unspentPath = unspentAngle > 0 ? describeArc(center, center, radius, currentAngle, currentAngle + unspentAngle) : '';

  // 格式化时间显示
  const formatTime = (hours: number) => {
    // 添加调试信息
    console.log('formatTime called with hours:', hours, 'timeUnit:', timeUnit);
    
    if (hours === 0 || isNaN(hours)) {
      return '0';
    }
    
    switch (timeUnit) {
      case 'years':
        return `${(hours / (24 * 365)).toFixed(1)}年`;
      case 'months':
        return `${(hours / (24 * 30)).toFixed(0)}月`;
      case 'days':
        return `${(hours / 24).toFixed(0)}天`;
      case 'hours':
        return `${hours.toFixed(0)}小时`;
      default:
        return `${(hours / (24 * 365)).toFixed(1)}年`;
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <Svg width={size} height={size}>
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
            
            {/* 已花费的工作时间弧 */}
            {spentWorkAngle > 0 && (
              <Path
                d={spentWorkPath}
                stroke={colors.work}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
              />
            )}
            
            {/* 已花费的睡眠时间弧 */}
            {spentSleepAngle > 0 && (
              <Path
                d={spentSleepPath}
                stroke={colors.sleep}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
              />
            )}
            
            {/* 已花费的自由时间弧 */}
            {spentFreeAngle > 0 && (
              <Path
                d={spentFreePath}
                stroke={colors.free}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
              />
            )}
            
            {/* 未度过的时间弧 */}
            {unspentAngle > 0 && (
              <Path
                d={unspentPath}
                stroke={colors.unspent}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
              />
            )}
          </G>
        </Svg>
        
        {/* 中心数据显示 - 已花费时间汇总 */}
        <View style={styles.centerData}>
          <Text style={styles.centerTitle}>已花费时间</Text>
          <Text style={styles.progressText}>基于{timeData.historicalDaysCount}天记录平均值</Text>
          <View style={styles.dataRow}>
            <View style={[styles.colorDot, { backgroundColor: colors.work }]} />
            <Text style={styles.dataLabel}>工作</Text>
            <Text style={styles.dataValue}>{formatTime(timeData.spentWork.hours)}</Text>
          </View>
          <View style={styles.dataRow}>
            <View style={[styles.colorDot, { backgroundColor: colors.sleep }]} />
            <Text style={styles.dataLabel}>睡眠</Text>
            <Text style={styles.dataValue}>{formatTime(timeData.spentSleep.hours)}</Text>
          </View>
          <View style={styles.dataRow}>
            <View style={[styles.colorDot, { backgroundColor: colors.free }]} />
            <Text style={styles.dataLabel}>自由</Text>
            <Text style={styles.dataValue}>{formatTime(timeData.spentFree.hours)}</Text>
          </View>
        </View>
      </View>
      
      {/* 圆环下方 - 剩余时间预估 */}
      <View style={styles.remainingTimeContainer}>
        <Text style={styles.remainingTitle}>剩余时间预估</Text>
        <Text style={styles.remainingSubtitle}>基于{timeData.historicalDaysCount}天历史数据平均值</Text>
        <View style={styles.remainingStatsContainer}>
          <View style={styles.remainingStatItem}>
            <Text style={styles.remainingStatValue}>{formatTime(timeData.remainingWork.hours)}</Text>
            <Text style={styles.remainingStatLabel}>工作</Text>
          </View>
          <View style={styles.remainingStatItem}>
            <Text style={styles.remainingStatValue}>{formatTime(timeData.remainingSleep.hours)}</Text>
            <Text style={styles.remainingStatLabel}>睡眠</Text>
          </View>
          <View style={styles.remainingStatItem}>
            <Text style={styles.remainingStatValue}>{formatTime(timeData.remainingFree.hours)}</Text>
            <Text style={styles.remainingStatLabel}>自由</Text>
          </View>
        </View>
        <Text style={styles.remainingDaysText}>剩余{timeData.remainingDays}天</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerData: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 1,
    minWidth: 120,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dataLabel: {
    fontSize: 11,
    color: '#666',
    flex: 1,
  },
  dataValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },
  remainingTimeContainer: {
    marginTop: 30,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  remainingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  remainingSubtitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 15,
    textAlign: 'center',
  },
  remainingStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 15,
  },
  remainingStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  remainingStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  remainingStatLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  remainingDaysText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});
