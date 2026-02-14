#!/bin/bash

echo "🔧 修复 Widget 刷新问题..."

# 备份原文件
cp ios/RetirementCountdownWidget/RetirementCountdownWidget.swift ios/RetirementCountdownWidget/RetirementCountdownWidget.swift.backup

# 替换刷新间隔：从 1 小时改为 1 分钟
sed -i '' 's/let nextUpdate = Calendar.current.date(byAdding: \.hour, value: 1, to: currentDate)/let nextUpdate = Calendar.current.date(byAdding: .minute, value: 1, to: currentDate)/' ios/RetirementCountdownWidget/RetirementCountdownWidget.swift

# 替换注释
sed -i '' 's/\/\/ 设置下次更新时间（1小时后）/\/\/ 设置下次更新时间（1分钟后，用于调试）/' ios/RetirementCountdownWidget/RetirementCountdownWidget.swift

echo "✅ 修改完成！"
echo ""
echo "修改内容："
echo "  - 刷新间隔：1小时 → 1分钟"
echo ""
echo "现在请："
echo "  1. 在 Xcode 中 Clean Build (⇧⌘K)"
echo "  2. 重新运行应用"
echo "  3. 切换时间格式"
echo "  4. 等待 1 分钟，Widget 应该会自动更新"
echo ""
echo "如果需要恢复原设置："
echo "  cp ios/RetirementCountdownWidget/RetirementCountdownWidget.swift.backup ios/RetirementCountdownWidget/RetirementCountdownWidget.swift"
