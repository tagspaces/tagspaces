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
#import <Cordova/CDVAvailability.h>
#import <Cordova/CDVInvokedUrlCommand.h>
#import <Cordova/CDVCommandDelegate.h>
#import <Cordova/CDVCommandQueue.h>
#import <Cordova/CDVSettingsDictionary.h>
#import <Cordova/CDVScreenOrientationDelegate.h>
#import <Cordova/CDVWebViewEngineProtocol.h>

@class CDVPlugin;

NS_ASSUME_NONNULL_BEGIN

/**
 A view controller that specializes in displaying Cordova web content.

 ## Overview
 `CDVViewController` presents a view that displays Cordova web content in a
 web view. Although often presented as the root view controller for an app,
 a `CDVViewController` can safely be placed within view controller
 hierarchies—such as navigation and tabbed controllers—or presented modally.

 The behavior preferences and web content to be loaded are defined in a Cordova
 XML configuration file, for which a separate [reference
 guide](https://cordova.apache.org/docs/en/latest/config_ref/index.html)
 exists. The web content displayed within the view has access to Cordova
 plugins via their exposed JavaScript APIs.

 > Important: In accordance with [App Store review
 > guidelines](https://developer.apple.com/app-store/review/guidelines/), you
 > must not expose Apple device APIs to web content that is not bundled within
 > the app.

 @Metadata {
    @Available(Cordova, introduced: "2.0.0")
 }
 */
@interface CDVViewController : UIViewController

#pragma mark - Properties

/**
 The view displaying web content for this Cordova controller.

 The exact type of this UIView subclass varies based on which
 plugin is being used to provide the web view implementation. Interactions
 with the web view and its content should be done through the ``webViewEngine``
 property.

 @Metadata {
    @Available(Cordova, introduced: "2.0.0")
 }
 */
@property (nonatomic, readonly, nullable, weak) IBOutlet UIView *webView;

/**
 An array of loaded Cordova plugin instances.

 This array is safe to iterate using a `for...in` loop.

 @Metadata {
    @Available(Cordova, introduced: "8.0.0")
 }
 */
@property (nonatomic, readonly, copy) NSArray <CDVPlugin *> *enumerablePlugins;

/**
 The scheme being used to load web content from the app bundle into the Cordova
 web view.

 The default value is `app` but can be customized via the `Scheme` preference
 in the Cordova XML configuration file. Setting this to `file` will results in
 web content being loaded using the File URL protocol, which has inherent
 security limitations. It is encouraged that you use a custom scheme to load
 your app content.

 It is not valid to set this to an existing protocol scheme such as `http` or
 `https`.

 @Metadata {
    @Available(Cordova, introduced: "6.0.0")
 }
 */
@property (nonatomic, nullable, readwrite, copy) NSString *appScheme;

/**
 @Metadata {
    @Available(Cordova, introduced: "3.0.0")
 }
 */
@property (nonatomic, readonly, strong) CDVCommandQueue *commandQueue;

/**
 @Metadata {
    @Available(Cordova, introduced: "2.0.0")
 }
 */
@property (nonatomic, readonly, strong) id <CDVCommandDelegate> commandDelegate;

/**
 The associated web view engine implementation.

 This provides a reference to the web view plugin class, which
 implements ``CDVWebViewEngineProtocol`` and allows for interaction with the
 web view.

 @Metadata {
    @Available(Cordova, introduced: "4.0.0")
 }
 */
@property (nonatomic, readonly, strong) id <CDVWebViewEngineProtocol> webViewEngine;

/**
 The Cordova preferences for this view.

 This is a dictionary populated from the preference key/value pairs in the
 Cordova XML configuration file.

 @Metadata {
    @Available(Cordova, introduced: "2.0.0")
 }
 */
@property (nonatomic, readonly, strong) CDVSettingsDictionary *settings;

/**
 The filename of the Cordova XML configuration file.

 The default value is `"config.xml"`.

 This can be set in the storyboard file as a view controller attribute.

 @Metadata {
    @Available(Cordova, introduced: "5.0.0")
 }
 */
@property (nonatomic, readwrite, copy) IBInspectable NSString *configFile;

/**
 The file path to the Cordova XML configuration file.

 @Metadata {
    @Available(Cordova, introduced: "8.0.0")
 }
 */
@property (nonatomic, nullable, readonly, copy) NSURL *configFilePath;

/**
 The file path to the HTML error fallback page, if one has been provided.

 @Metadata {
    @Available(Cordova, introduced: "4.0.0")
 }
 */
@property (nonatomic, nullable, readonly, copy) NSURL *errorURL;

/**
 The folder path containing the web content to be displayed.

 The default value is `"www"`.

 This can be set in the storyboard file as a view controller attribute.

 @Metadata {
    @Available(Cordova, introduced: "8.0.0")
 }
 */
@property (nonatomic, readwrite, copy) IBInspectable NSString *webContentFolderName;

/**
 The filename of the HTML file to load into the web view.

 The default value will be read from the Cordova XML configuration file, and
 fall back to `"index.html"` if not specified.

 This can be set in the storyboard file as a view controller attribute.

 @Metadata {
    @Available(Cordova, introduced: "2.0.0")
 }
 */
@property (nonatomic, nullable, readwrite, copy) IBInspectable NSString *startPage;

/**
 A boolean value indicating whether to show the splash screen while the web view
 is initially loading.

 The default value is `YES`.

 This can be set in the storyboard file as a view controller attribute.

 @Metadata {
    @Available(Cordova, introduced: "8.0.0")
 }
 */
@property (nonatomic) IBInspectable BOOL showInitialSplashScreen;

/**
 The color drawn behind the web content.

 This is used as the background color for the web view behind any HTML content
 and during loading before web content has been rendered. The default value is
 the system background color.

 This can be set in the storyboard file as a view controller attribute.

 @Metadata {
    @Available(Cordova, introduced: "8.0.0")
 }
 */
@property (nonatomic, null_resettable, copy) IBInspectable UIColor *backgroundColor;

/**
 The color drawn behind the splash screen content.

 This is used as the background color for the splash screen while the web
 content is loading. If a page background color has been specified, that will
 be used as the default value, otherwise the system background color is used.

 This can be set in the storyboard file as a view controller attribute.

 @Metadata {
    @Available(Cordova, introduced: "8.0.0")
 }
 */
@property (nonatomic, null_resettable, copy) IBInspectable UIColor *splashBackgroundColor;

/**
 The color drawn behind the status bar.

 This can be set in the storyboard file as a view controller attribute.

 @Metadata {
    @Available(Cordova, introduced: "8.0.0")
 }
 */
@property (nonatomic, null_resettable, copy) IBInspectable UIColor *statusBarBackgroundColor;

#pragma mark - Methods

/**
 @Metadata {
    @Available(Cordova, introduced: "2.0.0")
 }
 */
- (UIView*)newCordovaViewWithFrame:(CGRect)bounds;

/**
 Loads the starting page in the web view, replacing any existing content.

 @Metadata {
    @Available(Cordova, introduced: "8.0.0")
 }
 */
- (void)loadStartPage;

/**
 Returns the ``CDVPlugin`` instance of the given plugin name, creating the
 instance if one does not exist.

 - Parameters:
   - pluginName: The name of the plugin to return.
 - Returns: The ``CDVPlugin`` instance, or `nil` if no plugin exists with the
   given name.

 @Metadata {
    @Available(Cordova, introduced: "3.0.0")
 }
 */
- (nullable CDVPlugin *)getCommandInstance:(NSString *)pluginName;

/**
 @Metadata {
    @Available(Cordova, introduced: "3.0.0")
 }
 */
- (void)registerPlugin:(CDVPlugin*)plugin withClassName:(NSString*)className;

/**
 @Metadata {
    @Available(Cordova, introduced: "3.0.0")
 }
 */
- (void)registerPlugin:(CDVPlugin*)plugin withPluginName:(NSString*)pluginName;

/**
 Toggles the display of the splash screen overtop of the web view.

 - Parameters:
   - visible: Whether to make the splash screen visible or not.

 @Metadata {
    @Available(Cordova, introduced: "8.0.0")
 }
 */
- (void)showSplashScreen:(BOOL)visible;


#pragma mark - Deprecated

/**
 @Metadata {
    @Available(Cordova, introduced: "3.0.0", deprecated: "8.0.0")
 }
 */
@property (nonatomic, nullable, readonly, strong) NSXMLParser *configParser CDV_DEPRECATED(8.0.0, "");

/**
 @Metadata {
    @Available(Cordova, introduced: "2.0.0", deprecated: "8.0.0")
 }
 */
@property (nonatomic, nullable, readonly, copy) NSString *appURLScheme CDV_DEPRECATED(8.0.0, "");

/**
 @Metadata {
    @Available(Cordova, introduced: "2.0.0", deprecated: "8.0.0")
 }
 */
@property (nonatomic, readonly, strong) NSDictionary<NSString *, CDVPlugin *> *pluginObjects CDV_DEPRECATED(8.0.0, "Internal implementation detail, should not be used");

/**
 @Metadata {
    @Available(Cordova, introduced: "2.0.0", deprecated: "8.0.0")
 }
 */
@property (nullable, nonatomic, readonly, strong) NSDictionary<NSString *, NSString *> *pluginsMap CDV_DEPRECATED(8.0.0, "Internal implementation detail, should not be used");

/**
 The folder path containing the web content to be displayed.

 The default value is `"www"`.

 @Metadata {
    @Available(Cordova, introduced: "2.0.0", deprecated: "8.0.0")
 }
 @DeprecationSummary {
   Use ``webContentFolderName`` instead.
 }
 */
@property (nonatomic, readwrite, copy) NSString *wwwFolderName CDV_DEPRECATED_WITH_REPLACEMENT(8.0.0, "Use webContentFolderName instead", "webContentFolderName");

/**
 Toggles the display of the splash screen overtop of the web view.

 - Parameters:
   - visible: Whether to make the splash screen visible or not.

 @Metadata {
    @Available(Cordova, introduced: "6.0.0", deprecated: "8.0.0")
 }
 @DeprecationSummary {
   Use ``showSplashScreen:`` instead.
 }
 */
- (void)showLaunchScreen:(BOOL)visible CDV_DEPRECATED_WITH_REPLACEMENT(8.0.0, "Use showSplashScreen: instead", "showSplashScreen");

/**
 Parses the Cordova XML configuration file using the given delegate.

 @Metadata {
    @Available(Cordova, introduced: "4.0.0", deprecated: "8.0.0")
 }
 @DeprecationSummary {
    Use `CDVConfigParser` ``CDVConfigParser/parseConfigFile:withDelegate:`` instead.
 }
 */
- (void)parseSettingsWithParser:(id <NSXMLParserDelegate>)delegate CDV_DEPRECATED(8.0.0, "Use CDVConfigParser parseConfigFile:withDelegate: instead");

@end

NS_ASSUME_NONNULL_END
