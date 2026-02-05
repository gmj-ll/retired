# Widget 黑屏问题调试指南

## 问题分析
Widget 黑屏通常由以下原因导致：
1. Swift 代码语法错误或运行时错误
2. App Groups 配置不正确
3. Widget Extension Target 配置问题
4. iOS 版本兼容性问题

## 修复步骤

### 第一步：检查 Xcode 错误信息
1. 在 Xcode 中打开项目：`open ios/app.xcworkspace`
2. 选择 `RetirementCountdownWidget` scheme
3. 尝试构建 Widget Extension (Cmd+B)
4. 查看是否有编译错误

### 第二步：简化 Widget 代码
我已经简化了 Widget 代码，修复了以下问题：
- 移除了 `.containerBackground()` 修饰符（iOS 版本兼容性）
- 简化了进度条实现
- 添加了更好的错误处理
- 优化了数据验证

### 第三步：验证 App Groups 配置
1. 选择主应用 Target (`app`)
2. 进入 "Signing & Capabilities"
3. 确认有 "App Groups" capability
4. 确认包含 `group.com.retirementcountdown.app`

5. 选择 Widget Extension Target (`RetirementCountdownWidget`)
6. 同样确认有相同的 App Groups 配置

### 第四步：检查 Bundle Identifier
确认以下配置：
- 主应用：`com.retirementcountdown.app`
- Widget Extension：`com.retirementcountdown.app.RetirementCountdownWidget`

### 第五步：测试简化版本
如果问题仍然存在，可以尝试使用我创建的简单测试 Widget：

1. 在 `RetirementCountdownWidgetBundle.swift` 中临时替换：
```swift
@main
struct RetirementCountdownWidgetBundle: WidgetBundle {
    var body: some Widget {
        SimpleTestWidget()  // 使用简单测试版本
    }
}
```

2. 重新构建并测试

### 第六步：查看设备日志
1. 在 Xcode 中，打开 Window -> Devices and Simulators
2. 选择你的模拟器或设备
3. 点击 "Open Console"
4. 添加 Widget 时查看错误日志

### 第七步：重新构建项目
```bash
# 清理构建缓存
cd ios
rm -rf build/
xcodebuild clean -workspace app.xcworkspace -scheme app

# 重新构建
npx expo run:ios
```

## 常见错误和解决方案

### 错误1：App Groups 权限问题
**症状**：Widget 显示 "请打开应用"
**解决**：确保主应用和 Widget Extension 都配置了相同的 App Groups

### 错误2：Swift 语法错误
**症状**：Widget 完全不显示或黑屏
**解决**：检查 Xcode 编译错误，修复 Swift 代码问题

### 错误3：数据格式问题
**症状**：Widget 显示但数据不正确
**解决**：检查 Native Module 是否正确传递数据

## 调试技巧

1. **使用 Xcode Widget 预览**：
   在 `RetirementCountdownWidget.swift` 文件中，点击预览按钮查看 Widget 外观

2. **添加调试日志**：
   在 Widget 代码中添加 `print()` 语句，在设备控制台中查看

3. **测试不同尺寸**：
   确保 Widget 在不同尺寸下都能正常显示

## 下一步
1. 按照上述步骤逐一检查
2. 如果简单测试 Widget 能正常显示，说明基础配置正确
3. 逐步恢复复杂功能，找出具体问题所在

## 应急方案
如果问题仍然存在，可以：
1. 删除 Widget Extension Target
2. 重新创建 Widget Extension
3. 使用最简单的代码开始，逐步添加功能
