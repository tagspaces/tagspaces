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

#import <Cordova/CDVAppDelegate.h>
#import <Cordova/CDVAvailability.h>
#import <Cordova/CDVPluginNotifications.h>
#import <Cordova/CDVViewController.h>

@implementation CDVAppDelegate

@synthesize window, viewController;

- (BOOL)application:(UIApplication *)application willFinishLaunchingWithOptions:(NSDictionary<UIApplicationLaunchOptionsKey, id> *)launchOptions
{
#if DEBUG
    NSLog(@"Apache Cordova iOS platform version %@ is starting.", CDV_VERSION);
#endif

    return YES;
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary<UIApplicationLaunchOptionsKey, id> *)launchOptions
{
    return YES;
}

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
#pragma clang diagnostic ignored "-Wdeprecated-implementations"
// this happens while we are running ( in the background, or from within our own app )
// only valid if Info.plist specifies a protocol to handle
- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options
{
    if (!url) {
        return NO;
    }

    // all plugins will get the notification, and their handlers will be called
    [[NSNotificationCenter defaultCenter] postNotificationName:CDVPluginHandleOpenURLNotification object:url userInfo:options];

    // TODO: This should be deprecated and removed in Cordova iOS 9, since we're passing this data in the notification userInfo now
    NSMutableDictionary * openURLData = [[NSMutableDictionary alloc] init];

    [openURLData setValue:url forKey:@"url"];

    if (options[UIApplicationOpenURLOptionsSourceApplicationKey]) {
        [openURLData setValue:options[UIApplicationOpenURLOptionsSourceApplicationKey] forKey:@"sourceApplication"];
    }

    if (options[UIApplicationOpenURLOptionsAnnotationKey]) {
        [openURLData setValue:options[UIApplicationOpenURLOptionsAnnotationKey] forKey:@"annotation"];
    }

    [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVPluginHandleOpenURLWithAppSourceAndAnnotationNotification object:openURLData]];

    return YES;
}
#pragma clang diagnostic pop

@end
