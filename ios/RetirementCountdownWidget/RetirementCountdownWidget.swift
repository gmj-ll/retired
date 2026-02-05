import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(
            date: Date(),
            name: "用户",
            timeUntilRetirement: "365",
            unit: "天",
            progress: 0.5,
            backgroundImageData: nil
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(
            date: Date(),
            name: "用户",
            timeUntilRetirement: "365",
            unit: "天",
            progress: 0.5,
            backgroundImageData: nil
        )
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        var entries: [SimpleEntry] = []
        
        let currentDate = Date()
        var entry: SimpleEntry
        
        // 尝试从 App Groups 读取数据
        if let sharedDefaults = UserDefaults(suiteName: "group.mengji.retirement.app.2026"),
           let widgetData = sharedDefaults.dictionary(forKey: "widgetData"),
           let name = widgetData["name"] as? String,
           let retirementDateString = widgetData["retirementDate"] as? String,
           let currentFormat = widgetData["currentFormat"] as? String,
           let progress = widgetData["progress"] as? Double {
            
            // 读取背景图片数据
            var backgroundImageData: Data? = nil
            if let profileImagePath = widgetData["profileImage"] as? String,
               !profileImagePath.isEmpty {
                // 尝试从共享容器读取图片数据
                backgroundImageData = loadImageData(from: profileImagePath)
            }
            
            let formatter = ISO8601DateFormatter()
            if let retirementDate = formatter.date(from: retirementDateString) {
                let timeUntilRetirement = calculateTimeUntilRetirement(from: currentDate, to: retirementDate, format: currentFormat)
                let unit = getUnitString(for: currentFormat)
                entry = SimpleEntry(
                    date: currentDate,
                    name: name,
                    timeUntilRetirement: timeUntilRetirement,
                    unit: unit,
                    progress: progress,
                    backgroundImageData: backgroundImageData
                )
            } else {
                entry = SimpleEntry(
                    date: currentDate,
                    name: name,
                    timeUntilRetirement: "计算错误",
                    unit: "",
                    progress: progress,
                    backgroundImageData: backgroundImageData
                )
            }
        } else {
            // 默认数据
            entry = SimpleEntry(
                date: currentDate,
                name: "用户",
                timeUntilRetirement: "请打开应用",
                unit: "",
                progress: 0.0,
                backgroundImageData: nil
            )
        }
        
        entries.append(entry)
        
        // 设置下次更新时间（默认1小时后）
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: currentDate) ?? Date()
        let timeline = Timeline(entries: entries, policy: .after(nextUpdate))
        completion(timeline)
    }
    
    private func loadImageData(from path: String) -> Data? {
        // 如果是 file:// URL，直接读取
        if path.hasPrefix("file://") {
            let url = URL(string: path)
            return try? Data(contentsOf: url!)
        }
        
        // 如果是相对路径，尝试从 Documents 目录读取
        let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first
        if let documentsURL = documentsPath {
            let imageURL = documentsURL.appendingPathComponent(path)
            return try? Data(contentsOf: imageURL)
        }
        
        return nil
    }
    
    private func calculateTimeUntilRetirement(from startDate: Date, to endDate: Date, format: String) -> String {
        let timeInterval = endDate.timeIntervalSince(startDate)
        
        // 确保时间间隔为正数
        guard timeInterval > 0 else {
            return "0"
        }
        
        switch format {
        case "years":
            let years = timeInterval / (365.25 * 24 * 60 * 60)
            return String(format: "%.1f", max(0, years))
        case "months":
            let months = timeInterval / (30.44 * 24 * 60 * 60)
            return String(format: "%.1f", max(0, months))
        case "days":
            let days = timeInterval / (24 * 60 * 60)
            return String(format: "%.0f", max(0, days))
        case "hours":
            let hours = timeInterval / (60 * 60)
            return String(format: "%.0f", max(0, hours))
        case "minutes":
            let minutes = timeInterval / 60
            return String(format: "%.0f", max(0, minutes))
        case "seconds":
            return String(format: "%.0f", max(0, timeInterval))
        default:
            let days = timeInterval / (24 * 60 * 60)
            return String(format: "%.0f", max(0, days))
        }
    }
    
    private func getUnitString(for format: String) -> String {
        switch format {
        case "years": return "年"
        case "months": return "个月"
        case "days": return "天"
        case "hours": return "小时"
        case "minutes": return "分钟"
        case "seconds": return "秒"
        default: return "天"
        }
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let name: String
    let timeUntilRetirement: String
    let unit: String
    let progress: Double
    let backgroundImageData: Data?
}

struct RetirementCountdownWidgetEntryView : View {
    var entry: Provider.Entry

    var body: some View {
        ZStack {
            // 背景层
            if let imageData = entry.backgroundImageData,
               let uiImage = UIImage(data: imageData) {
                // 使用用户设置的背景图片
                Image(uiImage: uiImage)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .clipped()
            } else {
                // 默认渐变背景
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color(red: 0.31, green: 0.67, blue: 0.996),
                        Color(red: 0.0, green: 0.95, blue: 0.996)
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            }
            
            // 遮罩层（确保文字可读性）
            Rectangle()
                .fill(Color.black.opacity(0.4))
            
            // 内容层
            VStack(spacing: 6) {
                // 问候语
                Text("你好，\(entry.name)")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.white)
                    .shadow(color: .black, radius: 1, x: 0, y: 1)
                
                // 标题
                Text("距离退休还有")
                    .font(.system(size: 11, weight: .regular))
                    .foregroundColor(.white)
                    .opacity(0.9)
                    .shadow(color: .black, radius: 1, x: 0, y: 1)
                
                // 倒计时数字
                Text(entry.timeUntilRetirement)
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(.yellow)
                    .minimumScaleFactor(0.5)
                    .lineLimit(1)
                    .shadow(color: .black, radius: 2, x: 0, y: 1)
                
                // 单位
                if !entry.unit.isEmpty {
                    Text(entry.unit)
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.yellow)
                        .shadow(color: .black, radius: 1, x: 0, y: 1)
                }
                
                // 进度条
                VStack(spacing: 3) {
                    HStack {
                        Rectangle()
                            .fill(Color.white.opacity(0.3))
                            .frame(height: 3)
                            .overlay(
                                HStack {
                                    Rectangle()
                                        .fill(Color.yellow)
                                        .frame(width: max(0, min(1.0, entry.progress)) * 120)
                                    Spacer()
                                }
                            )
                            .frame(width: 120)
                            .cornerRadius(1.5)
                    }
                    
                    Text("工作生涯 \(String(format: "%.1f", max(0, min(100, entry.progress * 100))))% 完成")
                        .font(.system(size: 9, weight: .regular))
                        .foregroundColor(.white)
                        .opacity(0.9)
                        .shadow(color: .black, radius: 1, x: 0, y: 1)
                }
            }
            .padding(12)
        }
    }
}

struct RetirementCountdownWidget: Widget {
    let kind: String = "RetirementCountdownWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            RetirementCountdownWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("退休倒计时")
        .description("显示距离退休的剩余时间，支持自定义背景图片")
        .supportedFamilies([.systemMedium])
    }
}

#if DEBUG
struct RetirementCountdownWidget_Previews: PreviewProvider {
    static var previews: some View {
        RetirementCountdownWidgetEntryView(entry: SimpleEntry(
            date: Date(),
            name: "张三",
            timeUntilRetirement: "365",
            unit: "天",
            progress: 0.65,
            backgroundImageData: nil
        ))
        .previewContext(WidgetPreviewContext(family: .systemMedium))
    }
}
#endif
