# 分析页面使用指南

## 问题修复说明

### 手势处理错误修复
之前遇到的 `PanGestureHandler must be used as a descendant of GestureHandlerRootView` 错误已经修复：

1. **根本原因**: react-native-gesture-handler 需要在应用根部包装 GestureHandlerRootView
2. **解决方案**: 在 App.tsx 中添加了 GestureHandlerRootView 包装
3. **优化改进**: 简化了手势处理逻辑，使用原生 ScrollView 实现滑动

## 当前功能状态

### ✅ 正常工作的功能
- 双圆环数据可视化
- 左右滑动页面切换
- 时间单位动态切换
- 职业生涯进度计算
- 响应式布局适配

### 🎯 使用方法

#### 1. 查看当日分析
- 打开分析页面，默认显示当日时间分配圆环
- 查看工作（红色）、睡眠（青色）、自由时间（蓝色）的分配
- 底部显示具体的时间占比统计

#### 2. 查看职业生涯分析
- 向右滑动进入职业生涯分析页面
- 使用顶部的时间单位选择器切换显示格式
- 观察圆环上的箭头指示器了解当前进度
- 查看底部的进度条和洞察信息

#### 3. 页面导航
- 左右滑动切换分析视图
- 底部圆点指示器显示当前页面
- 平滑的动画过渡效果

## 技术实现亮点

### SVG 圆环渲染
```typescript
// 精确的角度计算
const workAngle = (timeData.work.percentage / 100) * 360;
const sleepAngle = (timeData.sleep.percentage / 100) * 360;
const freeAngle = (timeData.free.percentage / 100) * 360;

// 极坐标转换
const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};
```

### 智能数据计算
```typescript
// 职业生涯时间分配计算
const workingDays = Math.floor((retirementDate.getTime() - workStartDate.getTime()) / (1000 * 60 * 60 * 24));
const totalWorkHours = avgWork * workingDays;
const currentProgress = Math.min((timeWorked / totalWorkTime) * 100, 100);
```

## 数据说明

### 当前使用模拟数据
- **工作时间**: 9:00-18:00（9小时）
- **睡眠时间**: 23:00-07:00（8小时）
- **自由时间**: 剩余7小时

### 计算逻辑
- 基于用户的退休政策设置
- 考虑工作开始日期和退休日期
- 动态计算职业生涯进度

## 故障排除

### 如果圆环不显示
1. 检查用户是否完成了注册流程
2. 确认退休日期设置正确
3. 重启应用重新加载数据

### 如果滑动不响应
1. 确保 GestureHandlerRootView 正确配置
2. 检查 ScrollView 的 pagingEnabled 属性
3. 验证页面宽度计算是否正确

### 如果数据显示异常
1. 检查时间计算逻辑
2. 验证日期格式是否正确
3. 确认百分比计算是否准确

## 性能优化

### 渲染优化
- SVG 路径计算缓存
- 组件状态最小化更新
- 响应式尺寸计算优化

### 内存管理
- 及时清理定时器
- 避免内存泄漏
- 优化组件生命周期

## 未来改进计划

### 短期目标
- [ ] 集成真实用户数据
- [ ] 添加历史数据功能
- [ ] 实现个性化颜色主题

### 长期目标
- [ ] 智能建议系统
- [ ] 数据导出功能
- [ ] 社交分享功能

---

*使用指南版本: v1.0.0*
*最后更新: 2026-01-30*
