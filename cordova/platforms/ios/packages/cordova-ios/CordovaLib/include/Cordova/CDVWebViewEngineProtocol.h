/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

#import <UIKit/UIKit.h>

#define kCDVWebViewEngineScriptMessageHandlers @"kCDVWebViewEngineScriptMessageHandlers"
#define kCDVWebViewEngineWKNavigationDelegate @"kCDVWebViewEngineWKNavigationDelegate"
#define kCDVWebViewEngineWKUIDelegate @"kCDVWebViewEngineWKUIDelegate"
#define kCDVWebViewEngineWebViewPreferences @"kCDVWebViewEngineWebViewPreferences"

@class WKWebViewConfiguration;

@protocol CDVWebViewEngineProtocol <NSObject>

NS_ASSUME_NONNULL_BEGIN

@property (nonatomic, strong, readonly) UIView* engineWebView;

- (id)loadRequest:(NSURLRequest*)request;
- (id)loadHTMLString:(NSString*)string baseURL:(nullable NSURL*)baseURL;
- (void)evaluateJavaScript:(NSString*)javaScriptString completionHandler:(void (^_Nullable)(id, NSError*))completionHandler;

- (NSURL*)URL;
- (BOOL)canLoadRequest:(NSURLRequest*)request;
- (nullable instancetype)initWithFrame:(CGRect)frame;

/// Convenience Initializer
/// @param frame The frame for the new web view.
/// @param configuration The configuration for the new web view.
- (nullable instancetype)initWithFrame:(CGRect)frame configuration:(nullable WKWebViewConfiguration *)configuration;

- (void)updateWithInfo:(NSDictionary*)info;

NS_ASSUME_NONNULL_END

@end


@protocol CDVWebViewEngineConfigurationDelegate <NSObject>

@optional
/**
 Provides a fully configured WKWebViewConfiguration which will be overridden
 with any related settings you add to config.xml (e.g., `PreferredContentMode`).
 This is useful for more complex configuration, including `websiteDataStore`.

 ## Example usage

 ```swift
 extension CDVViewController: CDVWebViewEngineConfigurationDelegate {
     public func configuration() -> WKWebViewConfiguration {
         // return your config here
     }
 }
 ```
 */
- (nonnull WKWebViewConfiguration*)configuration;

@end
