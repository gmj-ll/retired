# 用户资料状态同步修复

## 问题描述

在之前的实现中，首页和设置页面的背景图片没有同步。具体表现为：
- 在设置页面删除背景图片后，首页仍然显示原来的图片
- 在首页更换背景图片后，设置页面不会立即显示新图片
- 需要重新启动应用或切换页面才能看到更新

## 问题原因

每个页面都有自己独立的 `useUserProfile` hook 实例，它们各自维护独立的状态：

```typescript
// 问题代码 - 每个组件都有独立状态
export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null); // 独立状态
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // ...
};
```

当一个页面更新用户资料时，其他页面的 hook 实例不会收到通知。

## 解决方案

实现了全局状态管理和订阅者模式：

### 1. 全局状态变量
```typescript
let globalProfile: UserProfile | null = null;
let globalLoading = true;
let globalError: string | null = null;
const subscribers: Set<() => void> = new Set();
```

### 2. 订阅者模式
```typescript
const notifySubscribers = () => {
  subscribers.forEach(callback => callback());
};
```

### 3. 自动同步机制
```typescript
export const useUserProfile = () => {
  const [, forceUpdate] = useState({});
  
  const triggerUpdate = useCallback(() => {
    forceUpdate({});
  }, []);

  useEffect(() => {
    // 订阅全局状态变化
    subscribers.add(triggerUpdate);
    
    return () => {
      // 取消订阅
      subscribers.delete(triggerUpdate);
    };
  }, [triggerUpdate]);

  // 返回全局状态
  return {
    profile: globalProfile,
    loading: globalLoading,
    error: globalError,
    // ...
  };
};
```

## 修复效果

✅ **实时同步**: 在任何页面更新背景图片，所有页面立即更新
✅ **状态一致**: 所有组件始终显示相同的用户资料数据
✅ **内存优化**: 只维护一份全局状态，减少内存占用
✅ **性能提升**: 避免重复的数据加载和存储操作

## 使用示例

现在用户可以：

1. **在设置页面删除背景图片** → 首页立即显示默认渐变背景
2. **在首页长按更换背景图片** → 设置页面立即显示新图片预览
3. **修改任何用户信息** → 所有页面实时同步显示

## 技术细节

- 使用 React 的 `useState` 和 `useCallback` 实现强制重新渲染
- 使用 `Set` 数据结构管理订阅者，确保高效的添加/删除操作
- 保持向后兼容，不需要修改现有组件的使用方式
- 自动处理组件挂载/卸载时的订阅管理

## 测试验证

创建了专门的测试文件 `src/test/profileSyncTest.ts` 来验证同步功能的正确性。

这个修复确保了用户在使用应用时获得一致、流畅的体验。
