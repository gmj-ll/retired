#!/bin/bash

echo "🔍 验证 Widget 配置..."
echo ""

# 检查 Widget Swift 文件
echo "1️⃣ 检查 Widget 代码文件..."
if [ -f "ios/RetirementCountdownWidget/RetirementCountdownWidget.swift" ]; then
    echo "   ✅ Widget Swift 文件存在"
    
    # 检查 containerBackground
    if grep -q "containerBackground" ios/RetirementCountdownWidget/RetirementCountdownWidget.swift; then
        echo "   ✅ containerBackground API 已添加"
    else
        echo "   ❌ 缺少 containerBackground API"
    fi
    
    # 检查 App Group ID
    if grep -q "group.mengji.retirement.app.2026" ios/RetirementCountdownWidget/RetirementCountdownWidget.swift; then
        echo "   ✅ App Group ID 配置正确"
    else
        echo "   ❌ App Group ID 配置错误"
    fi
    
    # 检查调试日志
    if grep -q "print.*Widget:" ios/RetirementCountdownWidget/RetirementCountdownWidget.swift; then
        echo "   ✅ 调试日志已添加"
    else
        echo "   ⚠️  缺少调试日志"
    fi
else
    echo "   ❌ Widget Swift 文件不存在"
fi

echo ""
echo "2️⃣ 检查 Entitlements 配置..."

# 检查主应用 entitlements
if [ -f "ios/app/app.entitlements" ]; then
    echo "   ✅ 主应用 entitlements 存在"
    if grep -q "group.mengji.retirement.app.2026" ios/app/app.entitlements; then
        echo "   ✅ 主应用 App Group 配置正确"
    else
        echo "   ❌ 主应用 App Group 配置错误"
    fi
else
    echo "   ❌ 主应用 entitlements 不存在"
fi

# 检查 Widget entitlements
if [ -f "ios/RetirementCountdownWidgetExtension.entitlements" ]; then
    echo "   ✅ Widget entitlements 存在"
    if grep -q "group.mengji.retirement.app.2026" ios/RetirementCountdownWidgetExtension.entitlements; then
        echo "   ✅ Widget App Group 配置正确"
    else
        echo "   ❌ Widget App Group 配置错误"
    fi
else
    echo "   ❌ Widget entitlements 不存在"
fi

echo ""
echo "3️⃣ 检查数据管理模块..."

# 检查 WidgetDataManager
if [ -f "ios/app/WidgetDataManager.m" ]; then
    echo "   ✅ WidgetDataManager 存在"
    if grep -q "group.mengji.retirement.app.2026" ios/app/WidgetDataManager.m; then
        echo "   ✅ WidgetDataManager App Group 配置正确"
    else
        echo "   ❌ WidgetDataManager App Group 配置错误"
    fi
else
    echo "   ❌ WidgetDataManager 不存在"
fi

# 检查 WidgetService
if [ -f "src/services/WidgetService.ts" ]; then
    echo "   ✅ WidgetService 存在"
else
    echo "   ❌ WidgetService 不存在"
fi

echo ""
echo "4️⃣ 检查调试工具..."

if [ -f "ios/DebugWidgetData.swift" ]; then
    echo "   ✅ 调试脚本已创建"
else
    echo "   ⚠️  调试脚本不存在"
fi

echo ""
echo "✨ 验证完成！"
echo ""
echo "📝 下一步操作："
echo "   1. 在 Xcode 中打开项目"
echo "   2. 清理构建：Product → Clean Build Folder"
echo "   3. 选择真机设备"
echo "   4. 运行主应用"
echo "   5. 在主屏幕添加 Widget"
echo "   6. 查看 Xcode Console 日志（搜索 'Widget:'）"
echo ""
