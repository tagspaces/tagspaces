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

NS_ASSUME_NONNULL_BEGIN

/**
 UI scene delegate class with some additional Cordova-specific behavior.

 The scene delegate object manages your app’s window behaviors. Your app should
 include its own SceneDelegate class which is a subclass of `CDVSceneDelegate`.

 `CDVSceneDelegate` provides an extension point for Cordova plugins to safely
 add behavior to the app by building on system events such as URL handling and
 scene/window management.

 See `UIWindowSceneDelegate` for more details about app delegates.

 @Metadata {
   @Available(Cordova, introduced: "8.0.0")
 }
*/
@interface CDVSceneDelegate : UIResponder <UIWindowSceneDelegate>

/**
 The application window for the current UI scene.

 @Metadata {
   @Available(Cordova, introduced: "8.0.0")
 }
*/
@property (strong, nonatomic) UIWindow *window;

@end

NS_ASSUME_NONNULL_END
