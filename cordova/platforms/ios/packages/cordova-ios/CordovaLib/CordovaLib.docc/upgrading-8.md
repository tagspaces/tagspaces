# Upgrading Plugins to Cordova iOS 8.x
<!--
#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
# 
# http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#  KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#
-->

A guide for plugin authors to understand the API changes in Cordova iOS 8.

Cordova iOS 8 introduces some significant changes to the exposed API for plugin authors and framework consumers. Many of these changes have been made to better align the framework with modern iOS development practices, such as adopting the `UIScene` APIs and fixing conflicts with SwiftUI projects, as well as work to improve the API experience for apps that consume Cordova as a framework (sometimes called the "platform centric workflow"). In all cases, great care has been taken to try to minimize the risk of breakage to existing 3rd party plugins.

Many plugins will notice new deprecation warnings when built against Cordova iOS 8, rather than outright breaking changes. This document aims to explain the changes, the rationale behind the changes, and offer sample code for plugin authors to ensure their plugin code is compatible with future versions of Cordova iOS.

In cases where different behavior is required for different Cordova versions, the ``CORDOVA_VERSION_MIN_REQUIRED`` macro can be used in Objective-C code to test the current Cordova version:

```objc
#if defined(__CORDOVA_8_0_0) && CORDOVA_VERSION_MIN_REQUIRED >= __CORDOVA_8_0_0
    // Code for Cordova iOS 8 goes here
#else
    // Code for older versions goes here
#endif
```

## Major Breaking Changes
### Minimum iOS version update
The Cordova iOS framework has increased the minimum supported iOS version from 11.0 to 13.0.

The minimum supported Xcode version for the Cordova tooling and generated template app is now Xcode 15.

### Change to the generated app project naming

The generated app template is now consistently named "App", including "App.xcodeproj", and "App.xcworkspace". The Xcode build target for the app is also named "App". If you are expecting the name of the Xcode project or target to match the name specified in config.xml, it will now fail to find the project.

Use the cordova-ios nodeJS API to retrieve the Xcode project path and other project details:

```js
// Old code
const projectRoot = context.opts.projectRoot;
const platformPath = path.join(projectRoot, 'platforms', 'ios');

const config = getConfigParser(context, path.join(projectRoot, 'config.xml'));
const projectName = config.name();

const pbxprojPath = path.join(platformPath, `${projectName}.xcodeproj`, 'project.pbxproj');
const xcodeProject = xcode.project(pbxprojPath);
```

```js
// New code
const projectRoot = context.opts.projectRoot;
const platformPath = path.join(projectRoot, 'platforms', 'ios');

const cordova_ios = require('cordova-ios');
const iosProject = new cordova_ios('ios', platformPath);

const xcodeProject = xcode.project(iosProject.locations.pbxproj);
```

This updated pattern is backwards compatible with existing versions of Cordova iOS 5.0.0 and newer.

Moving to a consistent name for the Xcode project and target resolves a number of issues around dynamic file lookups, Xcode projects with multiple targets, and Unicode compatibility with other tools such as CocoaPods that have issues with non-ASCII project names. Beyond fixing those issues, it was never actually safe to use the `name` from config.xml directly, because even in previous versions of Cordova iOS the project name could be normalized to remove Unicode characters.

Using the cordova-ios JavaScript API ensures that plugins and the Cordova tooling treat projects the same way. The `locations` object contains properties for several useful paths:

* `root` - The platform root directory
* `www` - The platform's generated web content folder
* `pbxproj` - The Xcode project file (the project.pbxproj file)
* `xcodeProjDir` - The Xcode project path (the .xcodeproj directory)
* `xcodeCordovaProj` - The platform folder containing the Cordova iOS app code

You can find the app's Info.plist file in a backwards-compatible way by doing something like this:

```javascript
const projName = path.basename(iosProject.locations.xcodeCordovaProj);
const infoPlistPath = path.join(iosProject.locations.xcodeCordovaProj, `${projName}-Info.plist`);
```
  
### CDVAppDelegate window deprecation

The generated app template now uses the iOS scene API (using `UISceneDelegate`) to support multiple windows, which means that it's no longer a safe assumption that an app has only a single window.

The ``CDVAppDelegate/window`` property of ``CDVAppDelegate`` is deprecated as a result.  This property will always have a `nil` value.

In a plugin class, you should retrieve the `UIWindow` for the current view controller:

```objc
// Old code
CDVAppDelegate *delegate = (CDVAppDelegate *)[[UIApplication sharedApplication] delegate];
UIWindow *currentWindow = delegate.window;
```

```objc
// New code
UIWindow *currentWindow = self.viewController.view.window;
```

There may be other cases where things that previously assumed a single window (such as `UIScreen` bounds) require updating to support iOS scenes.

### CDVAppDelegate viewController deprecation

The ``CDVAppDelegate/viewController`` property of ``CDVAppDelegate`` is deprecated, and may return `nil` if a `CDVViewController` has not yet been initialized.

Plugins should prefer accessing the view controller using their ``CDVPlugin/viewController`` property (which is now typed as ``CDVViewController``).
  
### UIView scrollView property deprecation

The `scrollView` property added as a global category extension to `UIView` by Cordova is now deprecated in Objective C code and **removed entirely in Swift code**. This is to prevent conflicts with other Swift classes that extend `UIView` and have their own `scrollView` properties. You can read more about the scrollView property in the Cordova discussion [Cordova iOS 8.x Upgrade Guide: UIView scrollView property deprecation](https://github.com/apache/cordova/discussions/565#discussioncomment-14621123).

You can still access the `scrollView` property of the web view by dynamically invoking the method:

```objc
// Old code
UIScrollView *scrollView = self.webView.scrollView;
```

```objc
// New code (Objective-C)
if ([self.webView respondsToSelector:@selector(scrollView)]) {
    UIScrollView *scrollView = [self.webView performSelector:@selector(scrollView)];
}
```

```swift
// New code (Swift)
var scroller : UIScrollView?
let scrollViewSelector = NSSelectorFromString("scrollView")

if webView.responds(to: scrollViewSelector) {
    scroller = webView.perform(scrollViewSelector)?.takeUnretainedValue() as? UIScrollView
}
```

This updated code is compatible with existing versions of Cordova iOS.

### Precompiled prefix header removal

Previously, Cordova projects included a precompiled prefix header that automatically imported the `Foundation` and `UIKit` frameworks. This made these frameworks available globally, without requiring explicit imports in each Objective-C file.

While this may have offered convenience, it also introduced an implicit dependency on the Cordova-managed prefix header and prefix headers have gradually been replaced with module imports in Objective-C and were never supported in Swift.

To align with Xcode defaults and improve long-term maintainability, the precompiled prefix header has been removed from generated Cordova app projects. While this may be a breaking change for some plugins, developers are now expected to explicitly declare the frameworks their code depends on by adding the appropriate import statements directly in their source files.

```objc
// New code (Objective-C)
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
```

```swift
// New code (Swift)
import Foundation
import UIKit
```

### `CDVPluginResult` Swift optionality

The `CDVPluginResult` constructors have been annotated as returning a non-null object, which means the constructor in Swift no longer returns an optional value that needs to be unwrapped. However, this means that attempts to unwrap the value will now be errors.

In most cases, you shouldn't need to worry about the optionality of the result before passing it to `commandDelegate.send` but if you are setting other options then you might need to explicitly store as an optional for backwards compatibility:

```swift
// Old code (Swift)
let result = CDVPluginResult(status: .ok, messageAs: "some value")!
result.setKeepCallbackAs(true)
self.commandDelegate.send(result, callbackId: callback)
```

```swift
// New code (Swift)
let result: CDVPluginResult? = CDVPluginResult(status: .ok, messageAs: "some value")
result?.setKeepCallbackAs(true)
self.commandDelegate.send(result, callbackId: callback)
```

## Other Major Changes
### Deprecating AppDelegate category extensions

Please extend the ``CDVAppDelegate`` base class instead:

```objc
// Old code
#import "AppDelegate.h"

@interface AppDelegate (myplugin)
    // Added extension methods here
@end
```

```objc
// New code
#import <Cordova/CDVAppDelegate.h>

@interface CDVAppDelegate (myplugin)
    // Added extension methods here
@end
```

It was never a completely safe assumption that an app using Cordova would include a class named `AppDelegate` that was a subclass of `CDVAppDelegate` due to the ability to embed CordovaLib in an existing iOS app project as a library. If your plugin needs to add behaviour to the app delegate, it should do so to the ``CDVAppDelegate`` base class.

The updated code is backwards compatible with several existing Cordova iOS versions.
  
### Deprecating MainViewController category extensions
 
Please extend the ``CDVViewController`` base class instead:

```objc
// Old code
#import "MainViewController.h"

@interface MainViewController (myplugin)
    // Added extension methods here
@end
```

```objc
// New code
#import <Cordova/CDVViewController.h>

@interface CDVViewController (myplugin)
    // Added extension methods here
@end
```

It was never a completely safe assumption that an app using Cordova would include a class named `MainViewController` that was a subclass of `CDVViewController` due to the ability to embed CordovaLib in an existing iOS app project as a library. If your plugin needs to add behaviour to the Cordova view controller, it should do so to the ``CDVViewController`` base class.

This updated code is backwards compatible with several existing Cordova iOS versions.
  
### Deprecating CDVCommandStatus constants in Swift

For plugins written in Swift, the old `CDVCommandStatus_*` constants are deprecated in favour of the enum based aliases:

```swift
// Old code
self.commandDelegate.send(CDVPluginResult(status: CDVCommandStatus_OK), callbackId: command.callbackId);
```

```swift
// New code
self.commandDelegate.send(CDVPluginResult(status: .ok), callbackId: command.callbackId);
```

These aliases were introduced in and are backwards compatible with all existing versions since Cordova iOS 5.0.0. See ``CDVCommandStatus`` for a list of the enum values.

### Deprecating CDVWebViewProcessPoolFactory

Apple has deprecated the `WKProcessPool` API, saying that it has no effect in iOS 15 and newer. As such, the `CDVWebViewProcessPoolFactory` API is marked as deprecated, but still exists to support iOS 13 and 14.

The `CDVWebViewProcessPoolFactory` API was also problematic because it exposed WebKit-specific API types to the public API interface of Cordova, potentially causing issues if those APIs need to change in the future. With this deprecation and eventual removal, Cordova is better insulated from upstream WebView changes.

## Public API Removals
The following classes were previously exposed as part of the Cordova iOS public API, but were only used as internal implementation details. To better establish the public/private API boundary within Cordova iOS, they have been removed from the public API in Cordova iOS 8.

* `CDVAllowList`
* `CDVURLSchemeHandler`

The following headers are deprecated due to adding global category extensions to system classes and will be removed in a future version of Cordova iOS:

* `<Cordova/NSDictionary+CordovaPreferences.h>`  
  Use the new ``CDVSettingsDictionary`` class, which provides all the same methods.

* `<Cordova/NSMutableArray+QueueAdditions.h>`  
  This was only ever intended as an internal implementation detail.

* `<Cordova/CDV.h>`  
  Use `<Cordova/Cordova.h>` instead.

## Other Changes
* ``CDVCommandDelegate``
  * The ``CDVCommandDelegate/urlTransformer`` property is deprecated.  
    This property was never used, and does not need to be a required part of the protocol.

  * The ``CDVCommandDelegate/settings`` property is now typed as ``CDVSettingsDictionary``.  

* ``CDVConfigParser``
  * Added a ``CDVConfigParser/parseConfigFile:`` class method.

  * Added a ``CDVConfigParser/parseConfigFile:withDelegate:`` class method.  

* ``CDVPlugin``
  * The ``CDVPlugin/viewController`` property is now typed as ``CDVViewController``.  
    Previously this was typed as the more generic `UIViewController`.

  * Plugin classes that intend to override WebKit scheme handling should implement the ``CDVPluginSchemeHandler`` protocol to ensure compliance with the required methods.

  * The ``CDVPluginHandleOpenURLWithAppSourceAndAnnotationNotification`` notification is now deprecated.  
    The existing ``CDVPluginHandleOpenURLNotification`` notification now includes the source and annotation in its `userInfo` dictionary.

* ``CDVPluginAuthenticationHandler``
  * Newly added protocol for plugins wishing to handle server authentication requests.

* ``CDVPluginNavigationHandler``
  * Newly added protocol for plugins wishing to handle navigation request permitting or denying within the webview.

* ``CDVPluginSchemeHandler``
  * Newly added protocol for plugins wishing to override WebKit scheme handling for web requests.

* ``CDVScreenOrientationDelegate``
  * This protocol is now deprecated and no longer used.

* ``CDVSettingsDictionary``
  * Newly added class to provide `NSDictionary`-like access to config.xml preferences, without relying on global category extensions to `NSDictionary`.

* ``CDVViewController``
  * The ``CDVViewController/settings`` property is now typed as ``CDVSettingsDictionary``.  

  * The ``CDVViewController/wwwFolderName`` property is deprecated.  
    This property has been renamed to ``CDVViewController/webContentFolderName``.

  * The ``CDVViewController/appURLScheme`` property is deprecated.  
    This property was not used internally by Cordova iOS and should not be used by plugins.

  * The ``CDVViewController/pluginsMap`` and ``CDVViewController/pluginObjects`` properties are deprecated.  
    These were internal implementation details that should not have been exposed.

  * Added an ``CDVViewController/enumerablePlugins`` property that can safely be iterated to loop over all loaded plugins.

  * The ``CDVViewController/configParser`` property is deprecated due to not being used.

  * The ``CDVViewController/parseSettingsWithParser:`` method is deprecated.  
    Use the ``CDVConfigParser/parseConfigFile:withDelegate:`` class method on ``CDVConfigParser`` instead.

  * Added a new ``CDVViewController/showInitialSplashScreen`` property.  
    This property is inspectable in Interface Builder for embedding apps to indicate if the splash screen should be displayed during web content loading.

  * Added a new ``CDVViewController/backgroundColor`` property.  
    This property is inspectable in Interface Builder for embedding apps to set the view controller background color.

  * Added a new ``CDVViewController/splashBackgroundColor`` property.  
    This property is inspectable in Interface Builder for embedding apps to set the splash screen background color.

  * The ``CDVViewController/showLaunchScreen:`` method is deprecated.  
    This method has been renamed to ``CDVViewController/showSplashScreen:``.

  * Added a new ``CDVViewController/loadStartPage`` method to load the initial starting page in the web view, replacing any existing content.
