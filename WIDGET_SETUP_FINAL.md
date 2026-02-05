# WidgetKit 完整配置指南（支持背景图同步）

## 前置步骤：解决 CocoaPods 问题

```bash
# 方案一：使用镜像源（推荐）
cd ios
pod repo remove trunk
pod repo add trunk https://mirrors.tuna.tsinghua.edu.cn/git/CocoaPods/Specs.git
pod install

# 方案二：跳过网络验证
cd ios
pod install --verbose --no-repo-update
```

## 第一步：在 Xcode 中添加 Widget Extension

1. **打开项目**
   ```bash
   open ios/app.xcworkspace
   ```

2. **添加 Widget Extension Target**
   - 选择项目根目录（蓝色图标）
   - 点击底部 "+" 添加 Target
   - 选择 "Widget Extension"
   - 配置：
     - Product Name: `RetirementCountdownWidget`
     - Bundle Identifier: `com.retirementcountdown.app.RetirementCountdownWidget`
     - Language: Swift
     - 不勾选 "Include Configuration Intent"
   - 点击 "Activate" 激活 scheme

## 第二步：配置 App Groups

1. **主应用配置**
   - 选择 `app` Target
   - "Signing & Capabilities"
   - "+ Capability" → "App Groups"
   - 添加: `group.mengji.retirement.app.2026`

2. **Widget Extension 配置**
   - 选择 `RetirementCountdownWidget` Target
   - "Signing & Capabilities"
   - "+ Capability" → "App Groups"
   - 添加: `group.mengji.retirement.app.2026`

## 第三步：添加 Native Module 文件

1. **添加到主应用**
   - 右键点击 `app` 文件夹
   - "Add Files to 'app'"
   - 选择：
     - `ios/app/WidgetDataManager.h`
     - `ios/app/WidgetDataManager.m`
   - 确保勾选 "Add to target: app"

2. **验证**
   - 选择 `app` Target
   - "Build Phases" → "Compile Sources"
   - 确认 `WidgetDataManager.m` 在列表中

## 第四步：替换 Widget 代码

1. **找到 Widget Swift 文件**
   - 在 Xcode 中找到 `RetirementCountdownWidget.swift`

2. **替换内容**
   - 删除所有内容
   - 复制 `WIDGET_WITH_BACKGROUND.swift` 的全部内容
   - 粘贴到 `RetirementCountdownWidget.swift`

3. **删除不需要的文件**
   - 删除 `RetirementCountdownWidgetControl.swift`（如果存在）
   - 删除 `RetirementCountdownWidgetLiveActivity.swift`（如果存在）
   - 删除 `AppIntent.swift`（如果存在）

4. **更新 Bundle 文件**
   - 打开 `RetirementCountdownWidgetBundle.swift`
   - 确保只包含：
   ```swift
   @main
   struct RetirementCountdownWidgetBundle: WidgetBundle {
       var body: some Widget {
           RetirementCountdownWidget()
       }
   }
   ```

## 第五步：构建和测试

1. **构建项目**
   - 选择 `app` scheme
   - 按 Cmd + B 构建
   - 检查是否有错误

2. **运行应用**
   - 按 Cmd + R 运行
   - 完成用户信息设置
   - 设置背景图片

3. **添加 Widget**
   - 长按主屏幕
   - 点击 "+" 添加小组件
   - 搜索 "退休倒计时"
   - 添加中等尺寸 Widget

4. **验证功能**
   - Widget 显示用户姓名和倒计时
   - Widget 背景图与应用中设置的一致
   - 切换时间格式，Widget 同步更新
   - 更换背景图，Widget 同步更新

## 功能特性

### Widget 显示内容
- ✅ 个性化问候语
- ✅ 动态倒计时（6种格式）
- ✅ 工作生涯进度条
- ✅ 自定义背景图片（与应用同步）
- ✅ 文字阴影（确保可读性）
- ✅ 半透明遮罩层

### 数据同步
- 用户姓名
- 退休日期
- 时间格式
- 背景图片
- 进度百分比

## 故障排除

### Widget 黑屏
- 检查 App Groups 配置是否一致
- 查看 Xcode 控制台错误信息
- 确认 Swift 代码无编译错误

### 背景图不显示
- 确认应用中已设置背景图
- 检查图片路径是否正确
- 验证 App Groups 数据共享

### 数据不同步
- 确认两个 Target 都有相同的 App Groups
- 检查 Group ID 拼写是否一致
- 重启应用和 Widget

## 注意事项

- Widget 有内存限制（约 30MB）
- 背景图会被压缩以适应 Widget 尺寸
- Widget 更新频率受系统限制
- 需要付费的 Apple Developer 账户
