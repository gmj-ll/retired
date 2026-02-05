#import "WidgetDataManager.h"
#import <React/RCTLog.h>

@implementation WidgetDataManager

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(updateWidgetData:(NSDictionary *)data
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  @try {
    NSUserDefaults *sharedDefaults = [[NSUserDefaults alloc] initWithSuiteName:@"group.mengji.retirement.app.2026"];
    
    if (sharedDefaults) {
      [sharedDefaults setObject:data forKey:@"widgetData"];
      [sharedDefaults synchronize];
      
      RCTLogInfo(@"Widget data updated successfully");
      resolve(@"success");
    } else {
      reject(@"error", @"Failed to access shared user defaults", nil);
    }
  } @catch (NSException *exception) {
    reject(@"error", exception.reason, nil);
  }
}

RCT_EXPORT_METHOD(getWidgetData:(RCTResponseSenderBlock)callback)
{
  NSUserDefaults *sharedDefaults = [[NSUserDefaults alloc] initWithSuiteName:@"group.mengji.retirement.app.2026"];
  
  if (sharedDefaults) {
    NSDictionary *data = [sharedDefaults objectForKey:@"widgetData"];
    callback(@[data ?: @{}, [NSNull null]]);
  } else {
    callback(@[[NSNull null], @"Failed to access shared user defaults"]);
  }
}

@end
