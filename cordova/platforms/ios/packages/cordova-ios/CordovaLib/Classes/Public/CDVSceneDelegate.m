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

#import <Cordova/CDVSceneDelegate.h>
#import <Cordova/CDVPluginNotifications.h>

@implementation CDVSceneDelegate

- (void)scene:(UIScene *)scene willConnectToSession:(UISceneSession *)session options:(UISceneConnectionOptions *)connectionOptions
{
    // If the app was launched from a URL, that should also fire the CDVPluginOpenURLNotification
    [self scene:scene openURLContexts:connectionOptions.URLContexts];
}

- (void)scene:(UIScene *)scene openURLContexts:(NSSet<UIOpenURLContext *> *)URLContexts
{
    for (UIOpenURLContext *context in URLContexts) {
        NSMutableDictionary *options = [[NSMutableDictionary alloc] init];
        [options setValue:context.options.sourceApplication forKey:@"sourceApplication"];
        [options setValue:context.options.annotation forKey:@"annotation"];
        [options setValue:@(context.options.openInPlace) forKey:@"openInPlace"];

#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 140500
        if (@available(iOS 14.5, *)) {
            [options setValue:context.options.eventAttribution forKey:@"eventAttribution"];
        }
#endif

        [[NSNotificationCenter defaultCenter] postNotificationName:CDVPluginHandleOpenURLNotification object:context.URL userInfo:options];

    }
}

@end
