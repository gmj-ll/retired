import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Path, G, Polygon } from 'react-native-svg';

interface CareerTimeData {
  totalWork: { hours: number; percentage: number };
  totalSleep: { hours: number; percentage: number };
  totalFree: { hours: number; percentage: number };
  currentProgress: number; // 0-100 百分比
}

interface CareerRingProps {
  timeData: CareerTimeData;
  colors?: {
    work: string;
    sleep: string;
    free: string;
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
    free: '#2ECC71'     // 绿色 - 自由时间
  },
  size = defaultSize,
  timeUnit = 'years'
}) => {
  const center = size / 2;
  const radius = size * 0.35;
  const strokeWidth = size * 0.08;

  // 计算角度（从12点钟方向开始，顺时针）
  const workAngle = (timeData.totalWork.percentage / 100) * 360;
  const sleepAngle = (timeData.totalSleep.percentage / 100) * 360;
  const freeAngle = (timeData.totalFree.percentage / 100) * 360;

  // 计算当前进度箭头位置
  const progressAngle = (timeData.currentProgress / 100) * 360;

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
  
  const workPath = describeArc(center, center, radius, currentAngle, currentAngle + workAngle);
  currentAngle += workAngle;
  
  const sleepPath = describeArc(center, center, radius, currentAngle, currentAngle + sleepAngle);
  currentAngle += sleepAngle;
  
  const freePath = describeArc(center, center, radius, currentAngle, currentAngle + freeAngle);

  // 计算进度箭头位置
  const arrowRadius = radius + strokeWidth / 2 + 15;
  const arrowPos = polarToCartesian(center, center, arrowRadius, progressAngle);

  // 格式化时间显示
  const formatTime = (hours: number) => {
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
          
          {/* 进度箭头 */}
          <Polygon
            points={`${arrowPos.x},${arrowPos.y - 8} ${arrowPos.x - 6},${arrowPos.y + 4} ${arrowPos.x + 6},${arrowPos.y + 4}`}
            fill="#333"
            transform={`rotate(${progressAngle} ${arrowPos.x} ${arrowPos.y})`}
          />
        </G>
      </Svg>
      
      {/* 中心数据显示 */}
      <View style={styles.centerData}>
        <Text style={styles.centerTitle}>职业生涯</Text>
        <Text style={styles.progressText}>{timeData.currentProgress.toFixed(1)}% 完成</Text>
        <View style={styles.dataRow}>
          <View style={[styles.colorDot, { backgroundColor: colors.work }]} />
          <Text style={styles.dataLabel}>工作</Text>
          <Text style={styles.dataValue}>{formatTime(timeData.totalWork.hours)}</Text>
        </View>
        <View style={styles.dataRow}>
          <View style={[styles.colorDot, { backgroundColor: colors.sleep }]} />
          <Text style={styles.dataLabel}>睡眠</Text>
          <Text style={styles.dataValue}>{formatTime(timeData.totalSleep.hours)}</Text>
        </View>
        <View style={styles.dataRow}>
          <View style={[styles.colorDot, { backgroundColor: colors.free }]} />
          <Text style={styles.dataLabel}>自由</Text>
          <Text style={styles.dataValue}>{formatTime(timeData.totalFree.hours)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});
