// BoltEarthBridge.m — Objective-C shim for the Swift BoltEarthBridge RN module.

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(BoltEarthBridge, NSObject)

RCT_EXTERN_METHOD(initializeWithOptions:(NSDictionary *)options
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(initializeLegacy:(NSString *)clientID
                  sdkToken:(NSString *)sdkToken
                  appPackageId:(NSString *)appPackageId
                  environment:(NSString *)environment
                  language:(nullable NSString *)language)

RCT_EXTERN_METHOD(setLanguageCode:(NSString *)code
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(currentLanguageCode:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(supportedLanguageCodes:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setVerboseLoggingEnabled:(BOOL)enabled)

RCT_EXTERN_METHOD(verboseLoggingEnabled:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(presentChargerFlow:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(presentBookingHistoryFlow:(nullable NSDictionary *)options
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(logout:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

@end
