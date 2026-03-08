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
#import <Cordova/CDVPlugin.h>

@interface CDVPlugin (CDVPluginResources)

/**
 Returns the localized string with the given key from a plugin bundle.

 The plugin bundle must be named the same as the plugin class.

 For example, if your plugin class was called `Foo`, and you have a Spanish
 localized strings file, this method will try to load the desired key from
 `Foo.bundle/es.lproj/Localizable.strings`.

 - Parameters:
   - key: The key of the localized string to retrieve.

 - Returns: The localized string, or an empty string if the key could not be
    found.

 @Metadata {
    @Available(Cordova, introduced: "4.0.0")
 }
 */
- (NSString *)pluginLocalizedString:(NSString *)key;

/**
 Returns the image with the given name from a plugin bundle.

 The plugin bundle must be named the same as the plugin class.

 For example, if your plugin class was called `Foo`, and you have an image
 called `"bar"`, this method will try to load the image from
 `Foo.bundle/bar.png` (and appropriately named retina versions).

 - Parameters:
   - name: The file name of the image resource to retrieve.

 - Returns: The image, or `nil` if an image with the provided name could not be
    found.

 @Metadata {
    @Available(Cordova, introduced: "4.0.0")
 }
 */
- (UIImage *)pluginImageResource:(NSString *)name;

@end
