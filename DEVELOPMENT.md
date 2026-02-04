# 开发指南

## 快速开始

### 1. 环境准备
确保你已经安装了以下工具：
- Node.js (>= 18)
- React Native CLI
- Xcode (iOS开发)
- CocoaPods

### 2. 安装依赖
```bash
npm install
```

### 3. iOS设置
由于这是一个新项目，你需要先创建iOS项目：

```bash
# 使用React Native CLI创建iOS项目
npx react-native init RetirementCountdown --template react-native-template-typescript

# 或者手动创建iOS项目文件
```

### 4. 运行项目
```bash
# 启动Metro bundler
npm start

# 在另一个终端运行iOS
npm run ios
```

## 项目架构

### 文件结构
```
src/
├── components/          # 可复用UI组件
├── screens/            # 页面组件
│   └── HomeScreen.tsx  # 主屏幕
├── hooks/              # 自定义React Hooks
│   ├── useUserProfile.ts
│   └── useTimeAnalysis.ts
├── services/           # 业务逻辑服务
│   ├── StorageService.ts
│   └── TimeAnalysisService.ts
├── types/              # TypeScript类型定义
│   └── index.ts
└── utils/              # 工具函数
    └── dateUtils.ts
```

### 核心功能模块

#### 1. 用户资料管理 (UserProfile)
- 存储用户基本信息
- 计算退休日期
- 管理个人设置

#### 2. 时间记录 (DailySchedule)
- 记录每日工作时间
- 记录睡眠时间
- 计算自由时间

#### 3. 数据分析 (TimeAnalysis)
- 分析时间分配
- 计算平均值
- 预测退休前自由时间

#### 4. 本地存储 (StorageService)
- AsyncStorage封装
- 数据持久化
- 错误处理

## 开发任务

### 待完成功能

#### 第一优先级
1. **用户资料设置页面**
   - 姓名、生日输入
   - 退休年龄设置
   - 头像上传功能

2. **日程记录页面**
   - 时间选择器
   - 日历视图
   - 快速记录按钮

3. **时间分析页面**
   - 图表展示
   - 统计数据
   - 趋势分析

#### 第二优先级
1. **iOS小组件**
   - 主屏幕小组件
   - 锁屏小组件
   - 实时更新

2. **通知功能**
   - 每日提醒
   - 周报推送
   - 里程碑通知

#### 第三优先级
1. **数据导出**
   - CSV导出
   - 图片分享
   - 备份恢复

2. **主题定制**
   - 深色模式
   - 自定义颜色
   - 字体大小

## 开发规范

### 代码风格
- 使用TypeScript严格模式
- 遵循ESLint规则
- 使用Prettier格式化

### 组件规范
- 使用函数组件和Hooks
- Props类型定义
- 错误边界处理

### 状态管理
- 使用React Hooks
- 本地状态优先
- 避免过度抽象

### 测试策略
- 单元测试覆盖核心逻辑
- 集成测试覆盖用户流程
- 手动测试UI交互

## 调试技巧

### 常见问题
1. **Metro bundler启动失败**
   ```bash
   npx react-native start --reset-cache
   ```

2. **iOS构建失败**
   ```bash
   cd ios && pod install
   ```

3. **TypeScript错误**
   ```bash
   npx tsc --noEmit
   ```

### 性能优化
- 使用React.memo优化渲染
- 避免在render中创建对象
- 合理使用useCallback和useMemo

## 发布准备

### iOS App Store
1. 配置应用图标和启动页
2. 设置应用权限
3. 准备应用截图和描述
4. 配置应用内购买（如需要）

### 版本管理
- 遵循语义化版本
- 维护CHANGELOG
- 标记重要里程碑

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 编写测试
4. 提交代码
5. 创建Pull Request

## 联系方式

如有问题，请通过以下方式联系：
- 提交GitHub Issue
- 发送邮件讨论
- 参与代码评审
