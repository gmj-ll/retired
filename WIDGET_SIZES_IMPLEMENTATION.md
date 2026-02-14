# Widget 多尺寸实现完成

## 已完成的功能：

### 1. 三种尺寸的 Widget ✅

#### 小尺寸 (systemSmall)
- 只显示倒计时数字和单位
- 简洁设计，适合快速查看

#### 中等尺寸 (systemMedium)
- 完整显示：问候语、倒计时、进度条
- 当前的标准显示

#### 大尺寸 (systemLarge)
- 完整显示 + 格式切换按钮
- 6个按钮：年、月、日、时、分、秒
- 当前选中的格式会高亮显示

### 2. 动态倒计时 ✅
- 秒/分钟格式：实时倒计时
- 其他格式：每15分钟更新

### 3. 格式切换按钮 ✅
- 点击按钮会打开 App 并传递格式参数
- 使用 Deep Link: `retirement://changeFormat/{format}`

---

## 需要在 App 中实现 Deep Link 处理

### 步骤 1：配置 URL Scheme

在 `app.json` 中添加：

```json
{
  "expo": {
    "scheme": "retirement",
    "ios": {
      "bundleIdentifier": "com.yourcompany.retirement",
      "infoPlist": {
        "CFBundleURLTypes": [
          {
            "CFBundleURLSchemes": ["retirement"]
          }
        ]
      }
    }
  }
}
```

### 步骤 2：在 App.tsx 中处理 Deep Link

```typescript
import { Linking } from 'react-native';
import * as Notifications from 'expo-notifications';

// 在 App 组件中添加
useEffect(() => {
  // 处理 Deep Link
  const handleDeepLink = (event: { url: string }) => {
    const url = event.url;
    console.log('Deep link received:', url);
    
    // 解析 URL: retirement://changeFormat/days
    if (url.startsWith('retirement://changeFormat/')) {
      const format = url.replace('retirement://changeFormat/', '');
      // 切换格式的逻辑
      handleFormatChangeFromWidget(format);
    }
  };

  // 监听 Deep Link
  const subscription = Linking.addEventListener('url', handleDeepLink);

  // 检查是否通过 Deep Link 启动
  Linking.getInitialURL().then((url) => {
    if (url) {
      handleDeepLink({ url });
    }
  });

  return () => {
    subscription.remove();
  };
}, []);

const handleFormatChangeFromWidget = async (format: string) => {
  // 1. 更新 App 中的格式
  // 2. 更新 Widget 数据
  // 3. 导航到首页
  console.log('Format changed from widget:', format);
  
  // 这里需要访问 HomeScreen 的状态
  // 建议使用 Context 或状态管理库
};
```

### 步骤 3：创建全局状态管理（推荐）

创建 `src/contexts/FormatContext.tsx`:

```typescript
import React, { createContext, useContext, useState } from 'react';

type TimeFormat = 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds';

interface FormatContextType {
  currentFormat: TimeFormat;
  setFormat: (format: TimeFormat) => void;
}

const FormatContext = createContext<FormatContextType | undefined>(undefined);

export const FormatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentFormat, setCurrentFormat] = useState<TimeFormat>('days');

  const setFormat = (format: TimeFormat) => {
    setCurrentFormat(format);
    // 同时更新 Widget
    // WidgetService.updateWidgetData(profile, format);
  };

  return (
    <FormatContext.Provider value={{ currentFormat, setFormat }}>
      {children}
    </FormatContext.Provider>
  );
};

export const useFormat = () => {
  const context = useContext(FormatContext);
  if (!context) {
    throw new Error('useFormat must be used within FormatProvider');
  }
  return context;
};
```

---

## 测试步骤：

1. **Clean Build** (⇧⌘K)
2. **重新运行应用**
3. **添加不同尺寸的 Widget**：
   - 长按主屏幕 → 添加小组件
   - 选择"退休倒计时"
   - 可以选择小、中、大三种尺寸
4. **测试大尺寸 Widget 的按钮**：
   - 点击格式按钮
   - 应该会打开 App（Deep Link 配置后）

---

## 当前状态：

✅ Widget 代码已完成
⏳ 需要配置 Deep Link
⏳ 需要在 App 中处理格式切换

---

## 简化方案（如果不想实现 Deep Link）：

大尺寸 Widget 的按钮可以改为：
- 点击按钮 → 打开 App 到首页
- 用户手动在 App 中切换格式

这样不需要额外配置，但用户体验稍差。

---

需要我帮你实现 Deep Link 处理吗？
