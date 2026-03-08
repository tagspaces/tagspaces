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
#import <Cordova/CDVAvailabilityDeprecated.h>

@class CDVViewController;

NS_ASSUME_NONNULL_BEGIN

/**
 App delegate class with some additional Cordova-specific behavior.

 The app delegate object manages your app’s shared behaviors. Your app should
 include its own AppDelegate class which is a subclass of `CDVAppDelegate`.

 `CDVAppDelegate` provides an extension point for Cordova plugins to safely add
 behavior to the app by building on system events such as URL handling, push
 notification registration, and deep linking.

 See `UIApplicationDelegate` for more details about app delegates.

 @Metadata {
    @Available(Cordova, introduced: "4.0.0")
 }
 */
@interface CDVAppDelegate : UIResponder <UIApplicationDelegate>

/**
 The application window.

 @Metadata {
    @Available(iOS, introduced: "2.0", deprecated: "13.0")
    @Available(iPadOS, introduced: "2.0", deprecated: "13.0")
    @Available(MacCatalyst, introduced: "2.0", deprecated: "13.0")
    @Available(Cordova, introduced: "4.0.0", deprecated: "8.0.0")
 }
 @DeprecationSummary {
    Deprecated in Cordova 8 in favour of UIScene protocols.
 }
 */
@property (nullable, nonatomic, strong) IBOutlet UIWindow *window API_DEPRECATED_WITH_REPLACEMENT("SceneDelegate:window", ios(2.0, 13.0));

// TODO: Remove in Cordova iOS 9
/**
 The ``CDVViewController`` instance.

 @Metadata {
    @Available(Cordova, introduced: "4.0.0", deprecated: "8.0.0")
 }
 */
@property (nullable, nonatomic, strong) IBOutlet CDVViewController *viewController CDV_DEPRECATED(8.0.0, "");

@end

NS_ASSUME_NONNULL_END
