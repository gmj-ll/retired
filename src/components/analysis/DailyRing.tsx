import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';

interface TimeData {
  work: { hours: number; percentage: number };
  sleep: { hours: number; percentage: number };
  free: { hours: number; percentage: number };
}

interface DailyRingProps {
  timeData: TimeData;
  colors?: {
    work: string;
    sleep: string;
    free: string;
  };
  size?: number;
  onTimeChange?: (newTimeData: TimeData) => void;
  onDragStateChange?: (isDragging: boolean) => void;
  editable?: boolean;
}

const { width } = Dimensions.get('window');
const defaultSize = Math.min(width * 0.8, 300);

export const DailyRing: React.FC<DailyRingProps> = ({
  timeData: initialTimeData,
  colors = {
    work: '#FF6B6B',    // 红色 - 工作
    sleep: '#9B59B6',   // 紫色 - 睡眠
    free: '#2ECC71'     // 绿色 - 自由时间
  },
  size = defaultSize,
  onTimeChange,
  onDragStateChange,
  editable = false
}) => {
  const [timeData, setTimeData] = useState(initialTimeData);
  const [isDragging, setIsDragging] = useState(false);
  const [activeBoundary, setActiveBoundary] = useState<number | null>(null); // 0: free-work, 1: work-sleep, 2: sleep-free
  const [dragAngle, setDragAngle] = useState<number | null>(null); // 拖拽时的角度位置
  
  // 每个时间段的独立起始位置（使用连续的衔接位置）
  const [segmentPositions, setSegmentPositions] = useState(() => {
    // 计算初始的连续衔接位置
    const freeAngle = (initialTimeData.free.percentage / 100) * 360;
    const workAngle = (initialTimeData.work.percentage / 100) * 360;
    
    return {
      freeStart: 0,                    // 自由时间从12点开始
      workStart: freeAngle,            // 工作时间紧接自由时间
      sleepStart: freeAngle + workAngle // 睡眠时间紧接工作时间
    };
  });

  const center = size / 2;
  const radius = size * 0.35;
  const strokeWidth = size * 0.08;

  // 计算角度（每个时间段有独立的起始位置）
  const freeAngle = (timeData.free.percentage / 100) * 360;
  const workAngle = (timeData.work.percentage / 100) * 360;
  const sleepAngle = (timeData.sleep.percentage / 100) * 360;

  // 使用独立的起始位置
  const freeStart = segmentPositions.freeStart;
  const workStart = segmentPositions.workStart;
  const sleepStart = segmentPositions.sleepStart;

  // 计算边界点位置（衔接点）
  const getBoundaryAngle = (index: number) => {
    // 如果正在拖拽这个边界点，使用拖拽角度
    if (isDragging && activeBoundary === index && dragAngle !== null) {
      return dragAngle;
    }
    
    // 否则使用当前计算出的角度
    switch (index) {
      case 0: return (freeStart + freeAngle) % 360; // free-work边界（自由时间结束位置）
      case 1: return (workStart + workAngle) % 360; // work-sleep边界（工作时间结束位置）
      case 2: return (sleepStart + sleepAngle) % 360; // sleep-free边界（睡眠时间结束位置）
      default: return 0;
    }
  };

  const boundaries = [
    { angle: getBoundaryAngle(0), name: 'free-work', color: colors.work },
    { angle: getBoundaryAngle(1), name: 'work-sleep', color: colors.sleep },
    { angle: getBoundaryAngle(2), name: 'sleep-free', color: colors.free }
  ];

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

  // 计算点击位置对应的角度
  const getAngleFromPoint = (x: number, y: number) => {
    const dx = x - center;
    const dy = y - center;
    let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
    if (angle < 0) angle += 360;
    return angle;
  };

  // 计算点到圆心的距离
  const getDistanceFromCenter = (x: number, y: number) => {
    const dx = x - center;
    const dy = y - center;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // 判断点击是否在圆环区域内
  const isInRingArea = (x: number, y: number) => {
    const distance = getDistanceFromCenter(x, y);
    const innerRadius = radius - strokeWidth / 2;
    const outerRadius = radius + strokeWidth / 2;
    return distance >= innerRadius && distance <= outerRadius;
  };

  // 检测点击的边界点
  const getBoundaryFromAngle = (angle: number) => {
    const tolerance = 20; // 边界容差角度
    
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      let angleDiff = Math.abs(angle - boundary.angle);
      
      // 处理跨越0度的情况
      if (angleDiff > 180) {
        angleDiff = 360 - angleDiff;
      }
      
      if (angleDiff <= tolerance) {
        return i;
      }
    }
    
    return null;
  };

  // 计算角度差（考虑360度循环）
  const getAngleDifference = (angle1: number, angle2: number) => {
    let diff = angle2 - angle1;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff;
  };

  // 限制拖拽角度，允许最小值为0
  const constrainDragAngle = (boundaryIndex: number, dragAngle: number) => {
    // 允许任何时间段为0，不设置最小角度限制
    return dragAngle;
  };

  // 调整时间分配（混合方案）
  const adjustTimeByBoundary = (boundaryIndex: number, newAngle: number) => {
    const newTimeData = { ...timeData };
    const newPositions = { ...segmentPositions };
    
    // 确保角度在0-360范围内
    newAngle = ((newAngle % 360) + 360) % 360;
    
    switch (boundaryIndex) {
      case 0: // free-work 边界（自由时间的结束边界）
        {
          // 拖拽这个边界影响自由时间和工作时间，睡眠时间保持不变
          
          // 新的自由时间：从当前起始位置到拖拽位置
          let newFreeAngle;
          if (newAngle >= freeStart) {
            newFreeAngle = newAngle - freeStart;
          } else {
            // 跨越0度
            newFreeAngle = (360 - freeStart) + newAngle;
          }
          
          // 工作时间的起始位置调整为新的边界位置
          newPositions.workStart = newAngle;
          
          // 保持睡眠时间不变，工作时间调整
          const originalSleepAngle = sleepAngle;
          const newWorkAngle = 360 - newFreeAngle - originalSleepAngle;
          
          // 更新时间数据
          newTimeData.free.percentage = (newFreeAngle / 360) * 100;
          newTimeData.work.percentage = (newWorkAngle / 360) * 100;
          newTimeData.sleep.percentage = (originalSleepAngle / 360) * 100;
        }
        break;
        
      case 1: // work-sleep 边界（工作时间的结束边界）
        {
          // 拖拽这个边界影响工作时间和睡眠时间，自由时间保持不变
          
          // 新的工作时间：从当前起始位置到拖拽位置
          let newWorkAngle;
          if (newAngle >= workStart) {
            newWorkAngle = newAngle - workStart;
          } else {
            // 跨越0度
            newWorkAngle = (360 - workStart) + newAngle;
          }
          
          // 睡眠时间的起始位置调整为新的边界位置
          newPositions.sleepStart = newAngle;
          
          // 保持自由时间不变，睡眠时间调整
          const originalFreeAngle = freeAngle;
          const newSleepAngle = 360 - originalFreeAngle - newWorkAngle;
          
          // 更新时间数据
          newTimeData.free.percentage = (originalFreeAngle / 360) * 100;
          newTimeData.work.percentage = (newWorkAngle / 360) * 100;
          newTimeData.sleep.percentage = (newSleepAngle / 360) * 100;
        }
        break;
        
      case 2: // sleep-free 边界（睡眠时间的结束边界）
        {
          // 拖拽这个边界影响睡眠时间和自由时间，工作时间保持不变
          
          // 新的睡眠时间：从当前起始位置到拖拽位置
          let newSleepAngle;
          if (newAngle >= sleepStart) {
            newSleepAngle = newAngle - sleepStart;
          } else {
            // 跨越0度
            newSleepAngle = (360 - sleepStart) + newAngle;
          }
          
          // 自由时间的起始位置调整为新的边界位置
          newPositions.freeStart = newAngle;
          
          // 保持工作时间不变，自由时间调整
          const originalWorkAngle = workAngle;
          const newFreeAngle = 360 - originalWorkAngle - newSleepAngle;
          
          // 更新时间数据
          newTimeData.free.percentage = (newFreeAngle / 360) * 100;
          newTimeData.work.percentage = (originalWorkAngle / 360) * 100;
          newTimeData.sleep.percentage = (newSleepAngle / 360) * 100;
        }
        break;
    }
    
    // 更新小时数
    newTimeData.work.hours = (newTimeData.work.percentage / 100) * 24;
    newTimeData.sleep.hours = (newTimeData.sleep.percentage / 100) * 24;
    newTimeData.free.hours = (newTimeData.free.percentage / 100) * 24;
    
    // 更新位置
    setSegmentPositions(newPositions);
    
    return newTimeData;
  };

  // 创建PanResponder处理拖拽
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      if (!editable) return false;
      const { locationX, locationY } = evt.nativeEvent;
      return isInRingArea(locationX, locationY);
    },
    onMoveShouldSetPanResponder: (evt) => {
      if (!editable) return false;
      const { locationX, locationY } = evt.nativeEvent;
      return isInRingArea(locationX, locationY);
    },
    onStartShouldSetPanResponderCapture: (evt) => {
      if (!editable) return false;
      const { locationX, locationY } = evt.nativeEvent;
      return isInRingArea(locationX, locationY);
    },
    onMoveShouldSetPanResponderCapture: (evt) => {
      if (!editable) return false;
      const { locationX, locationY } = evt.nativeEvent;
      return isInRingArea(locationX, locationY);
    },
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      if (isInRingArea(locationX, locationY)) {
        const rawAngle = getAngleFromPoint(locationX, locationY);
        const boundaryIndex = getBoundaryFromAngle(rawAngle);
        
        if (boundaryIndex !== null) {
          setActiveBoundary(boundaryIndex);
          // 应用角度约束
          const constrainedAngle = constrainDragAngle(boundaryIndex, rawAngle);
          setDragAngle(constrainedAngle);
          setIsDragging(true);
          onDragStateChange?.(true);
        }
      }
    },
    onPanResponderMove: (evt) => {
      if (!isDragging || activeBoundary === null) return;
      
      const { locationX, locationY } = evt.nativeEvent;
      const rawAngle = getAngleFromPoint(locationX, locationY);
      
      // 应用角度约束
      const constrainedAngle = constrainDragAngle(activeBoundary, rawAngle);
      
      // 更新拖拽角度
      setDragAngle(constrainedAngle);
      
      const newTimeData = adjustTimeByBoundary(activeBoundary, constrainedAngle);
      setTimeData(newTimeData);
    },
    onPanResponderRelease: () => {
      setIsDragging(false);
      setActiveBoundary(null);
      setDragAngle(null);
      onDragStateChange?.(false);
      if (onTimeChange) {
        onTimeChange(timeData);
      }
    },
    onPanResponderTerminate: () => {
      setIsDragging(false);
      setActiveBoundary(null);
      setDragAngle(null);
      onDragStateChange?.(false);
    },
    onShouldBlockNativeResponder: () => true,
  });

  // 计算路径
  const workPath = describeArc(center, center, radius, workStart, workStart + workAngle);
  const sleepPath = describeArc(center, center, radius, sleepStart, sleepStart + sleepAngle);

  // 计算自由时间弧的完整路径
  const freePath = freeAngle > 0 ? describeArc(center, center, radius, freeStart, freeStart + freeAngle) : '';

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container} {...(editable ? panResponder.panHandlers : {})}>
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
            
            {/* 自由时间弧 - 最下层 */}
            {freeAngle > 0 && (
              <Path
                d={freePath}
                stroke={colors.free}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                opacity={1}
              />
            )}
            
            {/* 睡眠时间弧 - 中层 */}
            {sleepAngle > 0 && (
              <Path
                d={sleepPath}
                stroke={colors.sleep}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                opacity={1}
              />
            )}
            
            {/* 工作时间弧 - 上层 */}
            {workAngle > 0 && (
              <Path
                d={workPath}
                stroke={colors.work}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                opacity={1}
              />
            )}

            
            {/* 边界指示器（衔接点） */}
            {editable && boundaries.map((boundary, index) => {
              const point = polarToCartesian(center, center, radius, boundary.angle);
              return (
                <Circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r={8}
                  fill="rgba(255, 255, 255, 0.95)"
                  stroke={boundary.color}
                  strokeWidth={3}
                  opacity={isDragging && activeBoundary === index ? 1 : 0.8}
                />
              );
            })}
          </G>
        </Svg>
        
        {/* 中心数据显示 */}
        <View style={styles.centerData}>
          <Text style={styles.centerTitle}>
            {isDragging ? '调整中...' : '今日时间'}
          </Text>
          <View style={styles.dataRow}>
            <View style={[styles.colorDot, { backgroundColor: colors.work }]} />
            <Text style={styles.dataLabel}>工作</Text>
            <Text style={styles.dataValue}>{timeData.work.hours.toFixed(1)}h</Text>
          </View>
          <View style={styles.dataRow}>
            <View style={[styles.colorDot, { backgroundColor: colors.sleep }]} />
            <Text style={styles.dataLabel}>睡眠</Text>
            <Text style={styles.dataValue}>{timeData.sleep.hours.toFixed(1)}h</Text>
          </View>
          <View style={styles.dataRow}>
            <View style={[styles.colorDot, { backgroundColor: colors.free }]} />
            <Text style={styles.dataLabel}>自由</Text>
            <Text style={styles.dataValue}>{timeData.free.hours.toFixed(1)}h</Text>
          </View>
          {editable && (
            <Text style={styles.editHint}>拖拽衔接点调整时间</Text>
          )}
        </View>
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
    marginBottom: 10,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
    minWidth: 100,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dataLabel: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  dataValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  editHint: {
    fontSize: 10,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
