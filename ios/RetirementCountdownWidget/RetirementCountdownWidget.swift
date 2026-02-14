import WidgetKit
import SwiftUI
internal import Combine

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(
            date: Date(),
            retirementDate: Calendar.current.date(byAdding: .year, value: 1, to: Date())!,
            backgroundImageData: nil
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(
            date: Date(),
            retirementDate: Calendar.current.date(byAdding: .year, value: 1, to: Date())!,
            backgroundImageData: nil
        )
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        var entries: [SimpleEntry] = []
        
        let currentDate = Date()
        var entry: SimpleEntry
        
        print("🔍 Widget getTimeline called at: \(currentDate)")
        print("🔍 Context: \(context)")
        
        if let sharedDefaults = UserDefaults(suiteName: "group.mengji.retirement.app.2026") {
            print("✅ App Group accessed successfully")
            
            if let widgetData = sharedDefaults.dictionary(forKey: "widgetData") {
                print("📦 Widget data found: \(widgetData)")
                print("🔑 Widget data keys: \(Array(widgetData.keys))")
                
                if let retirementDateString = widgetData["retirementDate"] as? String {
                    print("📅 Parsing date: \(retirementDateString)")
                    
                    var backgroundImageData: Data? = nil
                    if let profileImagePath = widgetData["profileImage"] as? String,
                       !profileImagePath.isEmpty {
                        print("🖼️ Loading background image from: \(profileImagePath)")
                        backgroundImageData = loadImageData(from: profileImagePath)
                        print("🖼️ Background image loaded: \(backgroundImageData != nil)")
                    }
                    
                    if let retirementDate = parseDate(from: retirementDateString) {
                        print("✅ Widget: Date parsed successfully: \(retirementDate)")
                        
                        // 检查日期是否在未来
                        let timeInterval = retirementDate.timeIntervalSince(currentDate)
                        print("⏰ Time interval: \(timeInterval) seconds")
                        print("⏰ Time interval in days: \(timeInterval / (24 * 60 * 60))")
                        
                        entry = SimpleEntry(
                            date: currentDate,
                            retirementDate: retirementDate,
                            backgroundImageData: backgroundImageData
                        )
                        print("✅ Widget: Entry created successfully")
                    } else {
                        print("❌ Widget: Failed to parse date: \(retirementDateString)")
                        // 使用一个未来的默认日期进行测试
                        let testDate = Calendar.current.date(byAdding: .year, value: 1, to: currentDate) ?? currentDate
                        entry = SimpleEntry(
                            date: currentDate,
                            retirementDate: testDate,
                            backgroundImageData: backgroundImageData
                        )
                        print("🧪 Widget: Using test date: \(testDate)")
                    }
                } else {
                    print("❌ Widget: Missing retirementDate field")
                    print("❌ Available keys: \(Array(widgetData.keys))")
                    // 使用测试数据
                    let testDate = Calendar.current.date(byAdding: .year, value: 1, to: currentDate) ?? currentDate
                    entry = SimpleEntry(
                        date: currentDate,
                        retirementDate: testDate,
                        backgroundImageData: nil
                    )
                    print("🧪 Widget: Using fallback test date: \(testDate)")
                }
            } else {
                print("❌ Widget: No widgetData found in App Group")
                // 检查 App Group 中的所有数据
                let allKeys = sharedDefaults.dictionaryRepresentation().keys
                print("📋 All keys in App Group: \(Array(allKeys))")
                
                // 使用测试数据
                let testDate = Calendar.current.date(byAdding: .year, value: 1, to: currentDate) ?? currentDate
                entry = SimpleEntry(
                    date: currentDate,
                    retirementDate: testDate,
                    backgroundImageData: nil
                )
                print("🧪 Widget: Using fallback test date: \(testDate)")
            }
        } else {
            print("❌ CRITICAL: Cannot access App Group 'group.mengji.retirement.app.2026'")
            print("❌ This indicates App Group configuration issues")
            
            // 使用测试数据
            let testDate = Calendar.current.date(byAdding: .year, value: 1, to: currentDate) ?? currentDate
            entry = SimpleEntry(
                date: currentDate,
                retirementDate: testDate,
                backgroundImageData: nil
            )
            print("🧪 Widget: Using emergency fallback date: \(testDate)")
        }
        
        entries.append(entry)
        
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: currentDate) ?? Date()
        let timeline = Timeline(entries: entries, policy: .after(nextUpdate))
        print("📅 Widget: Timeline created with next update at: \(nextUpdate)")
        completion(timeline)
    }
    
    private func parseDate(from dateString: String) -> Date? {
        let formatters: [ISO8601DateFormatter] = [
            {
                let f = ISO8601DateFormatter()
                f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
                return f
            }(),
            {
                let f = ISO8601DateFormatter()
                f.formatOptions = [.withInternetDateTime]
                return f
            }(),
            {
                let f = ISO8601DateFormatter()
                f.formatOptions = [.withYear, .withMonth, .withDay, .withTime, .withDashSeparatorInDate, .withColonSeparatorInTime]
                return f
            }()
        ]
        
        for formatter in formatters {
            if let date = formatter.date(from: dateString) {
                return date
            }
        }
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        dateFormatter.locale = Locale(identifier: "en_US_POSIX")
        dateFormatter.timeZone = TimeZone(secondsFromGMT: 0)
        return dateFormatter.date(from: dateString)
    }
    
    private func loadImageData(from path: String) -> Data? {
        if path.hasPrefix("file://"), let url = URL(string: path) {
            return try? Data(contentsOf: url)
        }
        
        if let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: "group.mengji.retirement.app.2026") {
            let imageURL = containerURL.appendingPathComponent(path)
            if let data = try? Data(contentsOf: imageURL) {
                return data
            }
        }
        
        if let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
            let imageURL = documentsURL.appendingPathComponent(path)
            return try? Data(contentsOf: imageURL)
        }
        
        return nil
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let retirementDate: Date
    let backgroundImageData: Data?
}

// MARK: - 倒计时视图（只显示 HH:MM:SS）
struct CountdownTextView: View {
    let retirementDate: Date
    
    var body: some View {
        let currentDate = Date()
        let timeInterval = retirementDate.timeIntervalSince(currentDate)
        
        // 添加调试信息
        let _ = print("⏰ CountdownTextView - Current: \(currentDate)")
        let _ = print("⏰ CountdownTextView - Retirement: \(retirementDate)")
        let _ = print("⏰ CountdownTextView - Interval: \(timeInterval) seconds")
        
        if timeInterval > 0 {
            Text(retirementDate, style: .timer)
                .onAppear {
                    print("✅ Timer view appeared with valid future date")
                }
        } else {
            Text("已退休")
                .onAppear {
                    print("⚠️ Retirement date is in the past or invalid")
                }
        }
    }
}



// MARK: - Widget Views
struct RetirementCountdownWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        default:
            // 不支持大尺寸，默认显示中等尺寸
            MediumWidgetView(entry: entry)
        }
    }
}

// MARK: - Small Widget
struct SmallWidgetView: View {
    let entry: SimpleEntry
    
    var body: some View {
        ZStack {
            backgroundView
            
            VStack(spacing: 12) {
                Text("退休倒计时 v2.0")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.white.opacity(0.9))
                
                CountdownTextView(retirementDate: entry.retirementDate)
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(.yellow)
                    .minimumScaleFactor(0.6)
                    .lineLimit(1)
                    .multilineTextAlignment(.center)
            }
            .padding(16)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .containerBackground(for: .widget) {
            backgroundView
        }
    }
    
    @ViewBuilder
    private var backgroundView: some View {
        ZStack {
            if let imageData = entry.backgroundImageData,
               let uiImage = UIImage(data: imageData) {
                Image(uiImage: uiImage)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } else {
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color(red: 0.31, green: 0.67, blue: 0.996),
                        Color(red: 0.0, green: 0.95, blue: 0.996)
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            }
            Rectangle().fill(Color.black.opacity(0.4))
        }
    }
}

// MARK: - Medium Widget
struct MediumWidgetView: View {
    let entry: SimpleEntry
    
    var body: some View {
        VStack(spacing: 16) {
            Text("距离退休还有 v2.0")
                .font(.system(size: 18, weight: .medium))
                .foregroundColor(.white)
                .shadow(color: .black, radius: 1, x: 0, y: 1)
            
            CountdownTextView(retirementDate: entry.retirementDate)
                .font(.system(size: 48, weight: .bold))
                .foregroundColor(.yellow)
                .minimumScaleFactor(0.6)
                .lineLimit(1)
                .shadow(color: .black, radius: 2, x: 0, y: 1)
                .multilineTextAlignment(.center)
                .frame(maxWidth: .infinity)
        }
        .padding(20)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .containerBackground(for: .widget) {
            backgroundView
        }
    }
    
    @ViewBuilder
    private var backgroundView: some View {
        ZStack {
            if let imageData = entry.backgroundImageData,
               let uiImage = UIImage(data: imageData) {
                Image(uiImage: uiImage)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } else {
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color(red: 0.31, green: 0.67, blue: 0.996),
                        Color(red: 0.0, green: 0.95, blue: 0.996)
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            }
            Rectangle().fill(Color.black.opacity(0.4))
        }
    }
}



// MARK: - Widget Configuration
struct RetirementCountdownWidget: Widget {
    let kind: String = "RetirementCountdownWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            RetirementCountdownWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("退休倒计时")
        .description("显示距离退休的剩余时间，支持自定义背景图片")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

#if DEBUG
struct RetirementCountdownWidget_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            RetirementCountdownWidgetEntryView(entry: SimpleEntry(
                date: Date(),
                retirementDate: Calendar.current.date(byAdding: .day, value: 365, to: Date())!,
                backgroundImageData: nil
            ))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
            
            RetirementCountdownWidgetEntryView(entry: SimpleEntry(
                date: Date(),
                retirementDate: Calendar.current.date(byAdding: .day, value: 365, to: Date())!,
                backgroundImageData: nil
            ))
            .previewContext(WidgetPreviewContext(family: .systemMedium))
        }
    }
}
#endif
