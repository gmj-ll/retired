# React Hooks 错误修复说明

## 问题描述

遇到了 React Hooks 顺序错误：
```
ERROR React has detected a change in the order of Hooks called by AnalysisScreen. 
This will lead to bugs and errors if not fixed.
```

## 错误原因

在 `AnalysisScreen` 组件中，`useState` Hook 被放在了条件渲染（`if` 语句）之后，这违反了 React Hooks 的基本规则。

### 错误的代码结构
```typescript
export const AnalysisScreen: React.FC = () => {
  const { profile, loading } = useUserProfile();
  const [currentPage, setCurrentPage] = useState(0);
  const [timeUnit, setTimeUnit] = useState('years');
  const scrollViewRef = useRef<ScrollView>(null);

  // ❌ 条件渲染
  if (loading) {
    return <LoadingView />;
  }

  if (!profile) {
    return <EmptyView />;
  }

  // ❌ 错误：在条件渲染之后调用 useState
  const [dailyTimeData, setDailyTimeData] = useState(initialData);
};
```

## 解决方案

将所有 Hooks 移到组件的顶部，在任何条件渲染之前调用。

### 修复后的代码结构
```typescript
export const AnalysisScreen: React.FC = () => {
  // ✅ 所有 Hooks 都在组件顶部
  const { profile, loading } = useUserProfile();
  const [currentPage, setCurrentPage] = useState(0);
  const [timeUnit, setTimeUnit] = useState('years');
  const scrollViewRef = useRef<ScrollView>(null);
  
  // ✅ 正确：所有 useState 都在条件渲染之前
  const mockSchedule = TimeAnalysisService.generateMockDailySchedule();
  const [dailyTimeData, setDailyTimeData] = useState(
    TimeAnalysisService.calculateDailyTimeDistribution(mockSchedule)
  );

  // ✅ 条件渲染放在所有 Hooks 之后
  if (loading) {
    return <LoadingView />;
  }

  if (!profile) {
    return <EmptyView />;
  }

  // 其余组件逻辑...
};
```

## React Hooks 规则

### 1. 只在顶层调用 Hooks
- ❌ 不要在循环、条件或嵌套函数中调用 Hooks
- ✅ 总是在 React 函数的顶层调用 Hooks

### 2. 只在 React 函数中调用 Hooks
- ✅ 在 React 函数组件中调用 Hooks
- ✅ 在自定义 Hooks 中调用 Hooks
- ❌ 不要在普通的 JavaScript 函数中调用 Hooks

### 3. 保持 Hooks 调用顺序一致
- React 依赖 Hooks 的调用顺序来正确地保存状态
- 每次渲染时，Hooks 必须以相同的顺序被调用

## 最佳实践

### 1. Hooks 声明模式
```typescript
const MyComponent: React.FC = () => {
  // 1. 所有 useState
  const [state1, setState1] = useState(initialValue1);
  const [state2, setState2] = useState(initialValue2);
  
  // 2. 所有 useEffect
  useEffect(() => {
    // effect logic
  }, []);
  
  // 3. 所有 useRef
  const ref1 = useRef<ElementType>(null);
  
  // 4. 自定义 Hooks
  const customHookResult = useCustomHook();
  
  // 5. 条件渲染和其他逻辑
  if (loading) return <Loading />;
  
  return <ComponentContent />;
};
```

### 2. 条件状态管理
如果需要条件性的状态，使用以下模式：

```typescript
const MyComponent: React.FC = () => {
  // ✅ 总是声明状态
  const [conditionalData, setConditionalData] = useState(null);
  
  // ✅ 在 useEffect 中条件性地设置状态
  useEffect(() => {
    if (someCondition) {
      setConditionalData(someValue);
    }
  }, [someCondition]);
  
  // 条件渲染
  if (!conditionalData) return <Loading />;
  
  return <ComponentContent data={conditionalData} />;
};
```

## 修复验证

修复后的应用现在可以正常运行，没有 Hooks 顺序错误。所有功能都正常工作：

- ✅ 双圆环数据可视化
- ✅ 拖拽编辑功能
- ✅ 页面滑动导航
- ✅ 时间单位切换
- ✅ 图标和颜色优化

## 预防措施

1. **使用 ESLint 规则**: 启用 `react-hooks/rules-of-hooks` 规则
2. **代码审查**: 确保所有 Hooks 都在组件顶部
3. **测试**: 定期测试组件的不同渲染路径

---

*修复日期: 2026-01-30*
*状态: 已解决*
