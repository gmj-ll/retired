# iOS WidgetKit 集成完整指南

## 当前状态
✅ 已配置 App Groups 权限
✅ 已创建 Native Module 桥接文件（在 `ios/app/` 目录）
✅ 已更新 Widget Extension Swift 文件
✅ 已更新 WidgetService
✅ Widget Extension 目录已存在

## 接下来的操作步骤

### 第一步：在 Xcode 中配置项目

1. **打开 Xcode 项目**
   ```bash
   open ios/app.xcworkspace
   ```

2. **添加 Native Module 文件到主应用**
   - 在 Xcode 项目导航器中，右键点击 `app` 文件夹
   - 选择 "Add Files to 'app'"
   - 添加 `ios/app/WidgetDataManager.h` 和 `ios/app/WidgetDataManager.m`
   - 确保选择 "Add to target: app"

3. **配置 App Groups**
   - 选择项目根目录，然后选择 `app` Target
   - 进入 "Signing & Capabilities" 标签
   - 点击 "+ Capability" 添加 "App Groups"
   - 添加 Group: `group.com.retirementcountdown.app`
   
   - 选择 `RetirementCountdownWidget` Target
   - 同样添加 "App Groups" capability
   - 添加相同的 Group: `group.com.retirementcountdown.app`

4. **验证 Widget Extension 配置**
   - 确认 `RetirementCountdownWidget` Target 存在
   - 检查 Bundle Identifier 是否为 `com.retirementcountdown.app.RetirementCountdownWidget`
   - 确认 Widget Swift 文件已更新为我们的退休倒计时代码

### 第二步：构建和测试

1. **构建项目**
   ```bash
   npx expo run:ios
   ```

2. **测试 Widget**
   - 在 iOS 模拟器或真机上运行应用
   - 输入用户信息完成引导流程
   - 长按主屏幕进入编辑模式
   - 点击左上角的 "+" 添加 Widget
   - 搜索 "退休倒计时" 并添加中等尺寸的 Widget

3. **验证数据同步**
   - 在应用中更改倒计时格式
   - 检查 Widget 是否同步更新
   - 测试不同的时间格式显示

### 第三步：可能遇到的问题和解决方案

1. **CocoaPods 问题**
   ```bash
   cd ios
   pod deintegrate
   pod install
   ```

2. **Build 错误**
   - 确保所有文件都添加到正确的 Target
   - 检查 Bundle Identifier 配置
   - 验证 App Groups 配置

3. **Widget 不显示数据**
   - 检查 App Groups 权限是否正确配置
   - 验证 UserDefaults suite name 是否一致
   - 查看 Xcode 控制台的错误信息

### 第四步：发布准备

1. **配置签名**
   - 确保主应用和 Widget Extension 都有正确的签名配置
   - App Groups 需要在 Apple Developer Portal 中配置

2. **测试真机**
   - 在真机上测试所有功能
   - 验证 Widget 在不同时间格式下的显示效果

## 文件结构
```
ios/
├── app/                          # 主应用目录
│   ├── WidgetDataManager.h       # Native Module 头文件
│   ├── WidgetDataManager.m       # Native Module 实现文件
│   ├── AppDelegate.swift
│   └── ... (其他应用文件)
├── RetirementCountdownWidget/    # Widget Extension 目录
│   ├── RetirementCountdownWidget.swift
│   └── Info.plist
└── app.xcworkspace              # Xcode 工作空间
```

## 注意事项
- Widget Extension 有内存和 CPU 限制
- Widget 更新频率有系统限制
- 确保 App Groups 在两个 Target 中都正确配置
- Widget 只支持 iOS 14+ 系统

## 下一步
执行第一步的命令，然后在 Xcode 中完成 Widget Extension 的配置。
