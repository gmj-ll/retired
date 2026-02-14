#import "WidgetDataManager.h"
#import <React/RCTLog.h>

#if __has_include(<WidgetKit/WidgetKit.h>)
#import <WidgetKit/WidgetKit.h>
#define HAS_WIDGETKIT 1
#else
#define HAS_WIDGETKIT 0
#endif

@implementation WidgetDataManager

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(updateWidgetData:(NSDictionary *)data
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  @try {
    NSString *appGroupID = @"group.mengji.retirement.app.2026";
    RCTLogInfo(@"🔍 Attempting to write to App Group: %@", appGroupID);
    
    NSUserDefaults *groupDefaults = [[NSUserDefaults alloc] initWithSuiteName:appGroupID];
    
    if (groupDefaults) {
      RCTLogInfo(@"✅ App Group accessed successfully");
      
      // 写入数据
      [groupDefaults setObject:data forKey:@"widgetData"];
      RCTLogInfo(@"📝 Data written to key 'widgetData'");
      
      // 立即同步
      BOOL success = [groupDefaults synchronize];
      RCTLogInfo(@"💾 Synchronize result: %@", success ? @"SUCCESS" : @"FAILED");
      
      // 立即读取验证
      NSDictionary *readBack = [groupDefaults objectForKey:@"widgetData"];
      if (readBack) {
        RCTLogInfo(@"✅ Verification: Data read back successfully");
        RCTLogInfo(@"📦 Written data: %@", data);
        RCTLogInfo(@"📦 Read back data: %@", readBack);
        
        // 比较数据
        if ([readBack isEqualToDictionary:data]) {
          RCTLogInfo(@"✅ Data matches perfectly!");
        } else {
          RCTLogWarn(@"⚠️ Data mismatch!");
        }
      } else {
        RCTLogError(@"❌ Verification FAILED: Cannot read back data!");
      }
      
      // 检查容器路径
      NSURL *containerURL = [[NSFileManager defaultManager] containerURLForSecurityApplicationGroupIdentifier:appGroupID];
      if (containerURL) {
        RCTLogInfo(@"📁 Container path: %@", containerURL.path);
      } else {
        RCTLogError(@"❌ Cannot access container URL");
      }
      
      if (success) {
        // 强制刷新 Widget
        dispatch_async(dispatch_get_main_queue(), ^{
          #if HAS_WIDGETKIT
          if (@available(iOS 14.0, *)) {
            // 先刷新所有时间线
            [[WidgetCenter sharedCenter] reloadAllTimelines];
            RCTLogInfo(@"🔄 reloadAllTimelines called");
            
            // 再刷新特定 Widget
            [[WidgetCenter sharedCenter] reloadTimelinesOfKind:@"RetirementCountdownWidget"];
            RCTLogInfo(@"🔄 reloadTimelinesOfKind called");
            
            // 获取当前配置的 Widget 信息
            [[WidgetCenter sharedCenter] getCurrentConfigurationsWithCompletion:^(NSArray<WidgetInfo *> * _Nonnull widgets, NSError * _Nullable error) {
              if (error) {
                RCTLogError(@"❌ Error getting widget configurations: %@", error.localizedDescription);
              } else {
                RCTLogInfo(@"📱 Current widgets count: %lu", (unsigned long)widgets.count);
                for (WidgetInfo *widget in widgets) {
                  RCTLogInfo(@"📱 Widget: %@ - %@", widget.kind, widget.displayName);
                }
              }
            }];
          }
          #endif
        });
        
        resolve(@"success");
      } else {
        reject(@"sync_error", @"Failed to synchronize data", nil);
      }
    } else {
      RCTLogError(@"❌ CRITICAL: Failed to access App Group: %@", appGroupID);
      RCTLogError(@"❌ This usually means:");
      RCTLogError(@"   1. App Group not configured in Xcode");
      RCTLogError(@"   2. Entitlements file not included");
      RCTLogError(@"   3. Provisioning profile doesn't support App Groups");
      reject(@"error", @"Failed to access shared user defaults", nil);
    }
  } @catch (NSException *exception) {
    RCTLogError(@"❌ Exception: %@", exception.reason);
    reject(@"error", exception.reason, nil);
  }
}

RCT_EXPORT_METHOD(getWidgetData:(RCTResponseSenderBlock)callback)
{
  NSString *appGroupID = @"group.mengji.retirement.app.2026";
  NSUserDefaults *groupDefaults = [[NSUserDefaults alloc] initWithSuiteName:appGroupID];
  
  if (groupDefaults) {
    NSDictionary *data = [groupDefaults objectForKey:@"widgetData"];
    
    if (data) {
      RCTLogInfo(@"✅ Widget data retrieved: %@", data);
      callback(@[data, [NSNull null]]);
    } else {
      RCTLogWarn(@"⚠️ No widget data found in App Group");
      callback(@[@{}, [NSNull null]]);
    }
  } else {
    RCTLogError(@"❌ Failed to access App Group");
    callback(@[[NSNull null], @"Failed to access shared user defaults"]);
  }
}

@end
