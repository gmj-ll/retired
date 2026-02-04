# 退休倒计时 App

一款帮助打工人可视化退休倒计时的React Native应用，同时记录和分析生活时间分配。

## 功能特性

### 核心功能
- 🕐 **实时退休倒计时** - 精确显示距离退休的时间（年/月/日/小时/分钟）
- 📊 **时间分析** - 记录和分析工作时间、睡眠时间、自由时间
- 📱 **iOS小组件支持** - 在主屏幕和锁屏显示退休倒计时
- 🖼️ **个性化背景** - 用户可上传喜欢的图片作为背景

### 时间记录
- 每日上下班时间记录
- 睡觉和起床时间记录
- 自动计算自由时间
- 历史数据统计和趋势分析

### 可视化展示
- 退休进度环形图
- 时间分配饼图
- 历史趋势图表
- 个性化小组件

## 技术栈

- **React Native 0.73** - 跨平台移动应用框架
- **TypeScript** - 类型安全的JavaScript
- **React Navigation** - 导航管理
- **AsyncStorage** - 本地数据存储
- **React Native SVG** - 图表和图形绘制
- **React Native Image Picker** - 图片选择
- **React Native Date Picker** - 日期时间选择

## 项目结构

```
src/
├── components/          # 可复用组件
├── screens/            # 页面组件
├── hooks/              # 自定义React Hooks
├── services/           # 业务逻辑服务
├── types/              # TypeScript类型定义
└── utils/              # 工具函数
```

## 开发环境设置

### 前置要求
- Node.js >= 18
- React Native CLI
- Xcode (iOS开发)
- CocoaPods

### 安装依赖
```bash
npm install
cd ios && pod install
```

### 运行应用
```bash
# iOS
npm run ios

# 启动Metro bundler
npm start
```

## 主要组件说明

### 数据模型
- `UserProfile` - 用户基本信息和退休设置
- `DailySchedule` - 每日时间安排记录
- `TimeAnalysis` - 时间分析结果
- `WidgetSettings` - 小组件配置

### 核心服务
- `StorageService` - 本地数据存储管理
- `TimeAnalysisService` - 时间分析计算逻辑

### 自定义Hooks
- `useUserProfile` - 用户资料管理
- `useTimeAnalysis` - 时间分析数据管理

## 开发计划

### 第一阶段 ✅
- [x] 项目基础架构
- [x] 数据模型设计
- [x] 核心服务实现
- [x] 主屏幕UI

### 第二阶段 🚧
- [ ] 用户资料设置页面
- [ ] 日程记录页面
- [ ] 时间分析页面
- [ ] 应用设置页面

### 第三阶段 📋
- [ ] iOS小组件开发
- [ ] 图片上传和处理
- [ ] 推送通知
- [ ] 数据导出功能

### 第四阶段 📋
- [ ] 应用图标和启动页
- [ ] App Store发布准备
- [ ] 用户反馈收集
- [ ] 性能优化

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件

---

*让我们一起为退休这个人生大任务加油！* 🎯
