# Widget containerBackground API 修复指南

## 问题描述
真机调试时添加小组件显示需要采用 `containerBackground` API，并确保数据能正确读取。

## 已完成的修复

### 1. 更新 Widget 代码以支持 containerBackground API

已更新 `ios/RetirementCountdownWidget/RetirementCountdownWidget.swift`：

**主要改动：**
- ✅ 添加了 `containerBackground(for: .widget)` 修饰符（iOS 17+ 要求）
- ✅ 将背景视图提取为独立的 `@ViewBuilder` 属性
- ✅ 增强了数据读取的调试日志
- ✅ 改进了图片加载逻辑，支持从共享容器读取
- ✅ 添加了详细的错误处理和状态提示

**关键代码结构：**
```swift
struct RetirementCountdownWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        VStack(spacing: 6) {
            // 内容...
        }
        .padding(12)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .containerBackground(for: .widget) {
            backgroundView  // iOS 17+ 要求
        }
    }
    
    @ViewBuilder
    private var backgroundView: some View {
        ZStack {
            // 背景图片或渐变
            // 遮罩层
        }
    }
}
```

### 2. App Group 配置验证

**App Group ID:** `group.mengji.retirement.app.2026`

**配置文件：**
- ✅ `ios/app/app.entitlements` - 主应用
- ✅ `ios/RetirementCountdownWidgetExtension.entitlements` - Widget 扩展

两个文件都正确配置了相同的 App Group ID。

### 3. 数据读取增强

**改进的数据读取逻辑：**
```swift
// 1. 从 App Group 读取数据
if let sharedDefaults = UserDefaults(suiteName: "group.mengji.retirement.app.2026"),
   let widgetData = sharedDefaults.dictionary(forKey: "widgetData") {
    print("✅ Widget: Successfully loaded data from App Group")
    // 处理数据...
}

// 2. 图片加载支持多种路径
private func loadImageData(from path: String) -> Data? {
    // 支持 file:// URL
    // 支持共享容器路径
    // 支持 Documents 目录
}
```

## 调试步骤

### 步骤 1: 验证 App Group 配置

在 Xcode 中：
1. 选择主应用 target
2. 进入 "Signing & Capabilities"
3. 确认 "App Groups" 能力已启用
4. 确认 `group.mengji.retirement.app.2026` 已勾选

重复以上步骤检查 Widget Extension target。

### 步骤 2: 查看 Widget 日志

在真机上运行应用后：
1. 打开 Xcode
2. Window → Devices and Simulators
3. 选择你的设备
4. 点击 "Open Console"
5. 搜索 "Widget:" 查看日志

**预期日志：**
```
✅ Widget: Successfully loaded data from App Group
✅ Widget: All required fields found
✅ Widget: Entry created successfully with calculated time: 365 天
```

**如果看到错误：**
```
❌ Widget: Failed to load data from App Group
❌ Widget: Missing required fields in widgetData
```

### 步骤 3: 使用调试脚本

我已创建 `ios/DebugWidgetData.swift` 调试脚本。

**使用方法：**
1. 在 Xcode 中打开项目
2. 创建一个新的 Swift Playground 或在主应用中临时添加此代码
3. 运行并查看输出

**脚本会检查：**
- ✅ App Group 访问权限
- ✅ widgetData 是否存在
- ✅ 所有必需字段是否完整
- ✅ 背景图片是否可读取
- ✅ 共享容器路径

### 步骤 4: 强制刷新 Widget

在真机上：
```bash
# 1. 在应用中更新数据后，强制刷新 Widget
# 在 HomeScreen.tsx 中已经有自动刷新逻辑

# 2. 或者手动移除并重新添加 Widget
```

## 常见问题排查

### 问题 1: Widget 显示"请打开应用"

**原因：** Widget 无法读取 App Group 数据

**解决方案：**
1. 确认 App Group 配置正确
2. 在主应用中打开一次，触发数据写入
3. 检查 Xcode Console 日志
4. 验证开发者账号权限

### 问题 2: Widget 显示"数据不完整"

**原因：** widgetData 缺少必需字段

**解决方案：**
1. 检查 `WidgetDataManager.m` 的数据写入
2. 确认 `WidgetService.ts` 传递了所有字段：
   - name
   - retirementDate
   - currentFormat
   - progress
   - profileImage (可选)

### 问题 3: 背景图片不显示

**原因：** 图片路径不正确或无法访问

**解决方案：**
1. 确认图片保存在共享容器中
2. 使用完整的文件路径或 file:// URL
3. 检查图片文件权限

### 问题 4: containerBackground 编译错误

**错误信息：** `'containerBackground(for:content:)' is only available in iOS 17.0 or newer`

**解决方案：**
1. 确认项目的 Deployment Target 设置为 iOS 17.0+
2. 在 Xcode 中：Target → General → Deployment Info → iOS Deployment Target

## 数据流程图

```
React Native App (HomeScreen.tsx)
    ↓
WidgetService.updateWidgetData()
    ↓
WidgetDataManager.m (Native Module)
    ↓
UserDefaults(suiteName: "group.mengji.retirement.app.2026")
    ↓
Widget Extension (RetirementCountdownWidget.swift)
    ↓
显示在主屏幕
```

## 验证清单

在真机上测试前，确认：

- [ ] App Group ID 在两个 target 中一致
- [ ] Entitlements 文件配置正确
- [ ] 开发者账号有 App Groups 权限
- [ ] iOS Deployment Target ≥ 17.0
- [ ] 主应用能成功写入数据
- [ ] Widget Extension 能读取数据
- [ ] 背景图片路径正确（如果使用）

## 测试步骤

1. **清理并重新构建：**
   ```bash
   cd ios
   rm -rf build
   pod install
   ```

2. **在 Xcode 中运行：**
   - 选择真机设备
   - 运行主应用
   - 填写个人信息并保存

3. **添加 Widget：**
   - 长按主屏幕
   - 点击左上角 "+"
   - 搜索 "退休倒计时"
   - 添加到主屏幕

4. **验证显示：**
   - Widget 应显示正确的姓名
   - 倒计时数字应准确
   - 进度条应显示
   - 背景应正确显示（图片或渐变）

## 技术说明

### containerBackground API

iOS 17 引入了新的 `containerBackground` API，用于 Widget 背景：

**旧方式（iOS 17 之前）：**
```swift
ZStack {
    // 背景
    // 内容
}
```

**新方式（iOS 17+）：**
```swift
VStack {
    // 内容
}
.containerBackground(for: .widget) {
    // 背景
}
```

**优势：**
- 更好的性能
- 支持 Widget 的边距和圆角
- 符合 Apple 的最新设计规范

### App Groups 数据共享

App Groups 允许同一开发者的多个应用/扩展共享数据：

```swift
// 写入数据（主应用）
let sharedDefaults = UserDefaults(suiteName: "group.mengji.retirement.app.2026")
sharedDefaults?.set(data, forKey: "widgetData")
sharedDefaults?.synchronize()

// 读取数据（Widget）
let sharedDefaults = UserDefaults(suiteName: "group.mengji.retirement.app.2026")
let data = sharedDefaults?.dictionary(forKey: "widgetData")
```

## 下一步

如果问题仍然存在：

1. 提供 Xcode Console 的完整日志
2. 截图 Widget 的显示状态
3. 确认 iOS 版本和设备型号
4. 检查开发者账号的 App Groups 权限

## 相关文件

- `ios/RetirementCountdownWidget/RetirementCountdownWidget.swift` - Widget 主代码
- `ios/app/WidgetDataManager.m` - 数据写入模块
- `src/services/WidgetService.ts` - React Native 服务层
- `ios/app/app.entitlements` - 主应用权限配置
- `ios/RetirementCountdownWidgetExtension.entitlements` - Widget 权限配置
- `ios/DebugWidgetData.swift` - 调试脚本
