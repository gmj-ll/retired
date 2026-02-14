import Foundation

// 调试脚本：验证 Widget 数据读取
// 在 Xcode 中运行此脚本来检查 App Group 数据

let appGroupID = "group.mengji.retirement.app.2026"

if let sharedDefaults = UserDefaults(suiteName: appGroupID) {
    print("✅ 成功访问 App Group: \(appGroupID)")
    
    if let widgetData = sharedDefaults.dictionary(forKey: "widgetData") {
        print("\n📦 Widget 数据内容:")
        print("-------------------")
        for (key, value) in widgetData {
            print("\(key): \(value)")
        }
        print("-------------------\n")
        
        // 验证必需字段
        let requiredFields = ["name", "retirementDate", "currentFormat", "progress"]
        var missingFields: [String] = []
        
        for field in requiredFields {
            if widgetData[field] == nil {
                missingFields.append(field)
            }
        }
        
        if missingFields.isEmpty {
            print("✅ 所有必需字段都存在")
        } else {
            print("❌ 缺少字段: \(missingFields.joined(separator: ", "))")
        }
        
        // 检查背景图片
        if let profileImage = widgetData["profileImage"] as? String, !profileImage.isEmpty {
            print("\n🖼️ 背景图片路径: \(profileImage)")
            
            // 尝试读取图片
            if let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupID) {
                let imageURL = containerURL.appendingPathComponent(profileImage)
                if FileManager.default.fileExists(atPath: imageURL.path) {
                    print("✅ 背景图片文件存在")
                    if let data = try? Data(contentsOf: imageURL) {
                        print("✅ 成功读取图片数据，大小: \(data.count) bytes")
                    } else {
                        print("❌ 无法读取图片数据")
                    }
                } else {
                    print("❌ 背景图片文件不存在: \(imageURL.path)")
                }
            }
        } else {
            print("\n⚠️ 未设置背景图片")
        }
        
    } else {
        print("❌ 未找到 widgetData 键")
        print("\n可用的键:")
        if let allKeys = sharedDefaults.dictionaryRepresentation().keys as? [String] {
            for key in allKeys {
                print("  - \(key)")
            }
        }
    }
    
    // 检查共享容器路径
    if let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupID) {
        print("\n📁 共享容器路径: \(containerURL.path)")
    } else {
        print("\n❌ 无法访问共享容器")
    }
    
} else {
    print("❌ 无法访问 App Group: \(appGroupID)")
    print("请检查:")
    print("1. App Group ID 是否正确")
    print("2. Entitlements 文件是否配置正确")
    print("3. 开发者账号是否有权限")
}
