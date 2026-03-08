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

#import "CDVWebViewEngine.h"
#import "CDVWebViewUIDelegate.h"
#import "CDVURLSchemeHandler.h"
#import <Cordova/CDVWebViewProcessPoolFactory.h>
#import <Cordova/CDVSettingsDictionary.h>
#import "CDVViewController+Private.h"

#import <objc/message.h>

#define CDV_BRIDGE_NAME @"cordova"

@interface CDVWebViewWeakScriptMessageHandler : NSObject <WKScriptMessageHandler>

@property (nonatomic, weak, readonly) id<WKScriptMessageHandler>scriptMessageHandler;

- (instancetype)initWithScriptMessageHandler:(id<WKScriptMessageHandler>)scriptMessageHandler;

@end


@interface CDVWebViewEngine ()

@property (nonatomic, strong, readwrite) UIView* engineWebView;
@property (nonatomic, strong, readwrite) id <WKUIDelegate> uiDelegate;
@property (nonatomic, weak) id <WKScriptMessageHandler> weakScriptMessageHandler;
@property (nonatomic, strong) CDVURLSchemeHandler * schemeHandler;
@property (nonatomic, readwrite) NSString *CDV_ASSETS_URL;
@property (nonatomic, readwrite) Boolean cdvIsFileScheme;
@property (nullable, nonatomic, strong, readwrite) WKWebViewConfiguration *configuration;

@end

// see forwardingTargetForSelector: selector comment for the reason for this pragma
#pragma clang diagnostic ignored "-Wprotocol"

@implementation CDVWebViewEngine

@synthesize engineWebView = _engineWebView;

- (nullable instancetype)initWithFrame:(CGRect)frame configuration:(nullable WKWebViewConfiguration *)configuration
{
    self = [super init];
    if (self) {
        if (NSClassFromString(@"WKWebView") == nil) {
            return nil;
        }
        
        self.configuration = configuration;
        self.engineWebView = configuration ? [[WKWebView alloc] initWithFrame:frame configuration:configuration] : [[WKWebView alloc] initWithFrame:frame];
    }

    return self;
}

- (nullable instancetype)initWithFrame:(CGRect)frame
{
    return [self initWithFrame:frame configuration:nil];
}

- (WKWebViewConfiguration*) createConfigurationFromSettings:(CDVSettingsDictionary*)settings
{
    WKWebViewConfiguration* configuration;
    if (_configuration) {
        configuration = _configuration;
    } else {
        configuration = [[WKWebViewConfiguration alloc] init];
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
        configuration.processPool = [[CDVWebViewProcessPoolFactory sharedFactory] sharedProcessPool];
#pragma clang diagnostic pop
    }
    
    if (settings == nil) {
        return configuration;
    }

    configuration.allowsInlineMediaPlayback = [settings cordovaBoolSettingForKey:@"AllowInlineMediaPlayback" defaultValue:NO];

    // Set the media types that are required for user action for playback
    WKAudiovisualMediaTypes mediaType = WKAudiovisualMediaTypeAll; // default

    // targetMediaType will always exist, either from user's "config.xml" or default ("defaults.xml").
    id targetMediaType = [settings cordovaSettingForKey:@"MediaTypesRequiringUserActionForPlayback"];
    if ([targetMediaType isEqualToString:@"none"]) {
        mediaType = WKAudiovisualMediaTypeNone;
    } else if ([targetMediaType isEqualToString:@"audio"]) {
        mediaType = WKAudiovisualMediaTypeAudio;
    } else if ([targetMediaType isEqualToString:@"video"]) {
        mediaType = WKAudiovisualMediaTypeVideo;
    } else if ([targetMediaType isEqualToString:@"all"]) {
        mediaType = WKAudiovisualMediaTypeAll;
    } else {
        NSLog(@"Invalid \"MediaTypesRequiringUserActionForPlayback\" was detected. Fallback to default value of \"all\" types.");
    }
    configuration.mediaTypesRequiringUserActionForPlayback = mediaType;

    configuration.suppressesIncrementalRendering = [settings cordovaBoolSettingForKey:@"SuppressesIncrementalRendering" defaultValue:NO];

    /*
     * If the old preference key "MediaPlaybackAllowsAirPlay" exists, use it or default to "YES".
     * Check if the new preference key "AllowsAirPlayForMediaPlayback" exists and overwrite the "MediaPlaybackAllowsAirPlay" value.
     */
    BOOL allowsAirPlayForMediaPlayback = [settings cordovaBoolSettingForKey:@"MediaPlaybackAllowsAirPlay" defaultValue:YES];
    if([settings cordovaSettingForKey:@"AllowsAirPlayForMediaPlayback"] != nil) {
        allowsAirPlayForMediaPlayback = [settings cordovaBoolSettingForKey:@"AllowsAirPlayForMediaPlayback" defaultValue:YES];
    }
    configuration.allowsAirPlayForMediaPlayback = allowsAirPlayForMediaPlayback;

    /*
     * Sets Custom User Agents
     * - (Default) "userAgent" is set the the clean user agent.
     *   E.g.
     *     UserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"
     *
     * - If "OverrideUserAgent" is set, it will overwrite the entire "userAgent" value. The "AppendUserAgent" will be iggnored if set.
     *   Notice: The override logic is handled in the "pluginInitialize" method.
     *   E.g.
     *     OverrideUserAgent = "foobar"
     *     UserAgent = "foobar"
     *
     * - If "AppendUserAgent" is set and "OverrideUserAgent" is not set, the user defined "AppendUserAgent" will be appended to the "userAgent"
     *   E.g.
     *     AppendUserAgent = "foobar"
     *     UserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 foobar"
     */
    NSString *userAgent = configuration.applicationNameForUserAgent;
    if (
        [settings cordovaSettingForKey:@"OverrideUserAgent"] == nil &&
        [settings cordovaSettingForKey:@"AppendUserAgent"] != nil
        ) {
        userAgent = [NSString stringWithFormat:@"%@ %@", userAgent, [settings cordovaSettingForKey:@"AppendUserAgent"]];
    }
    configuration.applicationNameForUserAgent = userAgent;

    NSString *contentMode = [settings cordovaSettingForKey:@"PreferredContentMode"];
    if ([contentMode isEqual: @"mobile"]) {
        configuration.defaultWebpagePreferences.preferredContentMode = WKContentModeMobile;
    } else if ([contentMode isEqual: @"desktop"]) {
        configuration.defaultWebpagePreferences.preferredContentMode = WKContentModeDesktop;
    }

#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 140000
    if (@available(iOS 14.0, *)) {
        configuration.limitsNavigationsToAppBoundDomains = [settings cordovaBoolSettingForKey:@"LimitsNavigationsToAppBoundDomains" defaultValue:NO];
    }
#endif

    return configuration;
}

- (void)pluginInitialize
{
    CDVSettingsDictionary* settings = self.commandDelegate.settings;

    NSString *scheme = self.viewController.appScheme;

    // If scheme is file or nil, then default to file scheme
    self.cdvIsFileScheme = [scheme isEqualToString:@"file"] || scheme == nil;

    NSString *hostname = @"";
    if(!self.cdvIsFileScheme) {
        if(scheme == nil || [WKWebView handlesURLScheme:scheme]){
            scheme = @"app";
            self.viewController.appScheme = scheme;
        }

        hostname = [settings cordovaSettingForKey:@"hostname"];
        if(hostname == nil){
            hostname = @"localhost";
        }

        self.CDV_ASSETS_URL = [NSString stringWithFormat:@"%@://%@", scheme, hostname];
    }

    CDVWebViewUIDelegate* uiDelegate = [[CDVWebViewUIDelegate alloc] initWithViewController:self.viewController];
    uiDelegate.title = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleDisplayName"];
    uiDelegate.mediaPermissionGrantType = [self parsePermissionGrantType:[settings cordovaSettingForKey:@"MediaPermissionGrantType"]];
    uiDelegate.allowNewWindows = [settings cordovaBoolSettingForKey:@"AllowNewWindows" defaultValue:NO];
    self.uiDelegate = uiDelegate;

    CDVWebViewWeakScriptMessageHandler *weakScriptMessageHandler = [[CDVWebViewWeakScriptMessageHandler alloc] initWithScriptMessageHandler:self];

    WKUserContentController* userContentController = [[WKUserContentController alloc] init];
    [userContentController addScriptMessageHandler:weakScriptMessageHandler name:CDV_BRIDGE_NAME];

    if(self.CDV_ASSETS_URL) {
        NSString *scriptCode = [NSString stringWithFormat:@"window.CDV_ASSETS_URL = '%@';", self.CDV_ASSETS_URL];
        WKUserScript *wkScript = [[WKUserScript alloc] initWithSource:scriptCode injectionTime:WKUserScriptInjectionTimeAtDocumentStart forMainFrameOnly:YES];

        if (wkScript) {
            [userContentController addUserScript:wkScript];
        }
    }

    WKWebViewConfiguration* configuration = [self createConfigurationFromSettings:settings];
    configuration.userContentController = userContentController;

    // Do not configure the scheme handler if the scheme is default (file)
    if(!self.cdvIsFileScheme) {
        self.schemeHandler = [[CDVURLSchemeHandler alloc] initWithViewController:self.viewController];
        [configuration setURLSchemeHandler:self.schemeHandler forURLScheme:scheme];
    }

    // re-create WKWebView, since we need to update configuration
    WKWebView* wkWebView = [[WKWebView alloc] initWithFrame:self.engineWebView.frame configuration:configuration];
    wkWebView.UIDelegate = self.uiDelegate;

#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 160400
    // With the introduction of iOS 16.4 the webview is no longer inspectable by default.
    // We'll honor that change for release builds, but will still allow inspection on debug builds by default.
    // We also introduce an override option, so consumers can influence this decision in their own build.
    if (@available(iOS 16.4, *)) {
#ifdef DEBUG
        BOOL allowWebviewInspectionDefault = YES;
#else
        BOOL allowWebviewInspectionDefault = NO;
#endif
        wkWebView.inspectable = [settings cordovaBoolSettingForKey:@"InspectableWebview" defaultValue:allowWebviewInspectionDefault];
    }
#endif

    /*
     * This is where the "OverrideUserAgent" is handled. This will replace the entire UserAgent
     * with the user defined custom UserAgent.
     */
    if ([settings cordovaSettingForKey:@"OverrideUserAgent"] != nil) {
        wkWebView.customUserAgent = [settings cordovaSettingForKey:@"OverrideUserAgent"];
    }

    [wkWebView addObserver:self forKeyPath:@"themeColor" options:NSKeyValueObservingOptionInitial context:nil];

    self.engineWebView = wkWebView;

    if ([self.viewController conformsToProtocol:@protocol(WKUIDelegate)]) {
        wkWebView.UIDelegate = (id <WKUIDelegate>)self.viewController;
    }

    if ([self.viewController conformsToProtocol:@protocol(WKNavigationDelegate)]) {
        wkWebView.navigationDelegate = (id <WKNavigationDelegate>)self.viewController;
    } else {
        wkWebView.navigationDelegate = (id <WKNavigationDelegate>)self;
    }

    if ([self.viewController conformsToProtocol:@protocol(WKScriptMessageHandler)]) {
        [wkWebView.configuration.userContentController addScriptMessageHandler:(id < WKScriptMessageHandler >)self.viewController name:CDV_BRIDGE_NAME];
    }

    [self updateSettings:settings];

    NSLog(@"Using WKWebView");
}

- (void)dispose
{
    WKWebView* wkWebView = (WKWebView*)_engineWebView;
    [wkWebView.configuration.userContentController removeScriptMessageHandlerForName:CDV_BRIDGE_NAME];
    _engineWebView = nil;

    [super dispose];
}

- (id)loadRequest:(NSURLRequest*)request
{
    if ([self canLoadRequest:request]) { // can load, differentiate between file urls and other schemes
        if(request.URL.fileURL && self.cdvIsFileScheme) {
            NSURL* readAccessUrl = [request.URL URLByDeletingLastPathComponent];
            return [(WKWebView*)_engineWebView loadFileURL:request.URL allowingReadAccessToURL:readAccessUrl];
        } else if (request.URL.fileURL) {
            NSURL* startURL = [NSURL URLWithString:self.viewController.startPage];
            NSString* startFilePath = [self.commandDelegate pathForResource:[startURL path]];
            NSURL *url = [[NSURL URLWithString:self.CDV_ASSETS_URL] URLByAppendingPathComponent:request.URL.path];
            if ([request.URL.path isEqualToString:startFilePath]) {
                url = [NSURL URLWithString:[NSString stringWithFormat:@"%@/%@", self.CDV_ASSETS_URL, startURL]];
            }
            if(request.URL.query) {
                url = [NSURL URLWithString:[@"?" stringByAppendingString:request.URL.query] relativeToURL:url];
            }
            if(request.URL.fragment) {
                url = [NSURL URLWithString:[@"#" stringByAppendingString:request.URL.fragment] relativeToURL:url];
            }
            // We ignore any existing cached data, since we're already loading it from the filesystem
            request = [NSURLRequest requestWithURL:url cachePolicy:NSURLRequestReloadIgnoringLocalCacheData timeoutInterval:request.timeoutInterval];
        }
        return [(WKWebView*)_engineWebView loadRequest:request];
    } else { // can't load, print out error
        NSString* errorHtml = [NSString stringWithFormat:
                               @"<!doctype html>"
                               @"<title>Error</title>"
                               @"<div style='font-size:2em'>"
                               @"   <p>The WebView engine '%@' is unable to load the request: %@</p>"
                               @"   <p>Most likely the cause of the error is that the loading of file urls is not supported in iOS %@.</p>"
                               @"</div>",
                               NSStringFromClass([self class]),
                               [request.URL description],
                               [[UIDevice currentDevice] systemVersion]
                               ];
        return [self loadHTMLString:errorHtml baseURL:nil];
    }
}

- (id)loadHTMLString:(NSString*)string baseURL:(NSURL*)baseURL
{
    return [(WKWebView*)_engineWebView loadHTMLString:string baseURL:baseURL];
}

- (NSURL*) URL
{
    return [(WKWebView*)_engineWebView URL];
}

- (BOOL) canLoadRequest:(NSURLRequest*)request
{
    return YES;
}

- (void)updateSettings:(CDVSettingsDictionary*)settings
{
    WKWebView* wkWebView = (WKWebView*)_engineWebView;

    wkWebView.configuration.preferences.minimumFontSize = [settings cordovaFloatSettingForKey:@"MinimumFontSize" defaultValue:0.0];

    /*
     wkWebView.configuration.preferences.javaScriptEnabled = [settings cordovaBoolSettingForKey:@"JavaScriptEnabled" default:YES];
     wkWebView.configuration.preferences.javaScriptCanOpenWindowsAutomatically = [settings cordovaBoolSettingForKey:@"JavaScriptCanOpenWindowsAutomatically" default:NO];
     */

    // By default, DisallowOverscroll is false (thus bounce is allowed)
    BOOL bounceAllowed = !([settings cordovaBoolSettingForKey:@"DisallowOverscroll" defaultValue:NO]);

    // prevent webView from bouncing
    if (!bounceAllowed) {
        if ([wkWebView respondsToSelector:@selector(scrollView)]) {
            UIScrollView* scrollView = [wkWebView scrollView];
            scrollView.bounces = NO;
            scrollView.alwaysBounceVertical = NO;     /* iOS 16 workaround */
            scrollView.alwaysBounceHorizontal = NO;   /* iOS 16 workaround */
        } else {
            for (id subview in wkWebView.subviews) {
                if ([[subview class] isSubclassOfClass:[UIScrollView class]]) {
                    ((UIScrollView*)subview).bounces = NO;
                }
            }
        }
    }

    NSString* decelerationSetting = [settings cordovaSettingForKey:@"WKWebViewDecelerationSpeed"];

    if (![@"fast" isEqualToString:decelerationSetting]) {
        [wkWebView.scrollView setDecelerationRate:UIScrollViewDecelerationRateNormal];
    } else {
        [wkWebView.scrollView setDecelerationRate:UIScrollViewDecelerationRateFast];
    }

    wkWebView.allowsBackForwardNavigationGestures = [settings cordovaBoolSettingForKey:@"AllowBackForwardNavigationGestures" defaultValue:NO];
    wkWebView.allowsLinkPreview = [settings cordovaBoolSettingForKey:@"Allow3DTouchLinkPreview" defaultValue:YES];
}

- (void)updateWithInfo:(NSDictionary*)info
{
    NSDictionary* scriptMessageHandlers = [info objectForKey:kCDVWebViewEngineScriptMessageHandlers];
    id settings = [info objectForKey:kCDVWebViewEngineWebViewPreferences];
    id navigationDelegate = [info objectForKey:kCDVWebViewEngineWKNavigationDelegate];
    id uiDelegate = [info objectForKey:kCDVWebViewEngineWKUIDelegate];

    WKWebView* wkWebView = (WKWebView*)_engineWebView;

    if (scriptMessageHandlers && [scriptMessageHandlers isKindOfClass:[NSDictionary class]]) {
        NSArray* allKeys = [scriptMessageHandlers allKeys];

        for (NSString* key in allKeys) {
            id object = [scriptMessageHandlers objectForKey:key];
            if ([object conformsToProtocol:@protocol(WKScriptMessageHandler)]) {
                [wkWebView.configuration.userContentController addScriptMessageHandler:object name:key];
            }
        }
    }

    if (navigationDelegate && [navigationDelegate conformsToProtocol:@protocol(WKNavigationDelegate)]) {
        wkWebView.navigationDelegate = navigationDelegate;
    }

    if (uiDelegate && [uiDelegate conformsToProtocol:@protocol(WKUIDelegate)]) {
        wkWebView.UIDelegate = uiDelegate;
    }

    if (settings && [settings isKindOfClass:[CDVSettingsDictionary class]]) {
        [self updateSettings:settings];
    } else if (settings && [settings isKindOfClass:[NSDictionary class]]) {
        [self updateSettings:[[CDVSettingsDictionary alloc] initWithDictionary:settings]];
    }
}

// This forwards the methods that are in the header that are not implemented here.
// Both WKWebView implement the below:
//     loadHTMLString:baseURL:
//     loadRequest:
- (id)forwardingTargetForSelector:(SEL)aSelector
{
    return _engineWebView;
}

- (UIView*)webView
{
    return self.engineWebView;
}

- (CDVWebViewPermissionGrantType)parsePermissionGrantType:(NSString*)optionString
{
    CDVWebViewPermissionGrantType result = CDVWebViewPermissionGrantType_GrantIfSameHost_ElsePrompt;
    
    if (optionString != nil){
        if ([optionString isEqualToString:@"prompt"]) {
            result = CDVWebViewPermissionGrantType_Prompt;
        } else if ([optionString isEqualToString:@"deny"]) {
            result = CDVWebViewPermissionGrantType_Deny;
        } else if ([optionString isEqualToString:@"grant"]) {
            result = CDVWebViewPermissionGrantType_Grant;
        } else if ([optionString isEqualToString:@"grantIfSameHostElsePrompt"]) {
            result = CDVWebViewPermissionGrantType_GrantIfSameHost_ElsePrompt;
        } else if ([optionString isEqualToString:@"grantIfSameHostElseDeny"]) {
            result = CDVWebViewPermissionGrantType_GrantIfSameHost_ElseDeny;
        } else {
            NSLog(@"Invalid \"MediaPermissionGrantType\" was detected. Fallback to default value of \"grantIfSameHostElsePrompt\"");
        }
    }
    
    return result;
}

- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary *)change context:(void *)context
{
    if ([keyPath isEqualToString:@"themeColor"]) {
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 150000
        if (@available(iOS 15.0, *)) {
            [self.viewController setStatusBarWebViewColor:((WKWebView *)self.engineWebView).themeColor];
        }
#endif
    }
}

#pragma mark - WKScriptMessageHandler implementation

- (void)userContentController:(WKUserContentController*)userContentController didReceiveScriptMessage:(WKScriptMessage*)message
{
    if (![message.name isEqualToString:CDV_BRIDGE_NAME]) {
        return;
    }

    CDVViewController* vc = (CDVViewController*)self.viewController;

    NSArray* jsonEntry = message.body; // NSString:callbackId, NSString:service, NSString:action, NSArray:args
    CDVInvokedUrlCommand* command = [CDVInvokedUrlCommand commandFromJson:jsonEntry];
    CDV_EXEC_LOG(@"Exec(%@): Calling %@.%@", command.callbackId, command.className, command.methodName);

    if (![vc.commandQueue execute:command]) {
#ifdef DEBUG
        NSError* error = nil;
        NSString* commandJson = nil;
        NSData* jsonData = [NSJSONSerialization dataWithJSONObject:jsonEntry
                                                           options:0
                                                             error:&error];

        if (error == nil) {
            commandJson = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
        }

            static NSUInteger maxLogLength = 1024;
            NSString* commandString = ([commandJson length] > maxLogLength) ?
                [NSString stringWithFormat : @"%@[...]", [commandJson substringToIndex:maxLogLength]] :
                commandJson;

            NSLog(@"FAILED pluginJSON = %@", commandString);
#endif
    }
}

#pragma mark - WKNavigationDelegate implementation

- (void)webView:(WKWebView*)webView didStartProvisionalNavigation:(WKNavigation*)navigation
{
    [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVPluginResetNotification object:webView]];
}

- (void)webView:(WKWebView*)webView didFinishNavigation:(WKNavigation*)navigation
{
    [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVPageDidLoadNotification object:webView]];
}

- (void)webView:(WKWebView*)theWebView didFailProvisionalNavigation:(WKNavigation*)navigation withError:(NSError*)error
{
    [self webView:theWebView didFailNavigation:navigation withError:error];
}

- (void)webView:(WKWebView*)theWebView didFailNavigation:(WKNavigation*)navigation withError:(NSError*)error
{
    NSString* message = [NSString stringWithFormat:@"Failed to load webpage with error: %@", [error localizedDescription]];
    NSLog(@"%@", message);

    if (error.code != NSURLErrorCancelled) {
        NSURL* errorUrl = self.viewController.errorURL;
        if (errorUrl) {
            NSCharacterSet *charSet = [NSCharacterSet URLFragmentAllowedCharacterSet];
            errorUrl = [NSURL URLWithString:[NSString stringWithFormat:@"?error=%@", [message stringByAddingPercentEncodingWithAllowedCharacters:charSet]] relativeToURL:errorUrl];
            NSLog(@"%@", [errorUrl absoluteString]);
            [theWebView loadRequest:[NSURLRequest requestWithURL:errorUrl]];
        }
    }
}

- (void)webViewWebContentProcessDidTerminate:(WKWebView *)webView
{
    CDVSettingsDictionary *settings = self.commandDelegate.settings;
    NSString *recoveryBehavior = [settings cordovaSettingForKey:@"CrashRecoveryBehavior"];

    if ([recoveryBehavior isEqualToString:@"reload"]) {
        [self.viewController loadStartPage];
    } else {
        [webView reload];
    }
}

- (BOOL)defaultResourcePolicyForURL:(NSURL*)url
{
    // all file:// urls are allowed
    if ([url isFileURL]) {
        return YES;
    }

    return NO;
}

- (void)webView:(WKWebView *)webView decidePolicyForNavigationAction:(WKNavigationAction *)navigationAction decisionHandler:(void (^)(WKNavigationActionPolicy))decisionHandler
{
    CDVViewController *vc = (CDVViewController *)self.viewController;

    NSURLRequest *request = navigationAction.request;
    CDVWebViewNavigationType navType = (CDVWebViewNavigationType)navigationAction.navigationType;
    NSMutableDictionary *info = [NSMutableDictionary dictionary];
    info[@"sourceFrame"] = navigationAction.sourceFrame;
    info[@"targetFrame"] = navigationAction.targetFrame;
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 140500
    if (@available(iOS 14.5, *)) {
        info[@"shouldPerformDownload"] = [NSNumber numberWithBool:navigationAction.shouldPerformDownload];
    }
#endif

    // Give plugins the chance to handle the url, as long as this WebViewEngine is still the WKNavigationDelegate.
    // This allows custom delegates to choose to call this method for `default` cordova behavior without querying all plugins.
    if (webView.navigationDelegate == self) {
        BOOL anyPluginsResponded = NO;
        BOOL shouldAllowRequest = NO;

        for (CDVPlugin *plugin in vc.enumerablePlugins) {
            if ([plugin respondsToSelector:@selector(shouldOverrideLoadWithRequest:navigationType:info:)] || [plugin respondsToSelector:@selector(shouldOverrideLoadWithRequest:navigationType:)]) {
                CDVPlugin <CDVPluginNavigationHandler> *navPlugin = (CDVPlugin <CDVPluginNavigationHandler> *)plugin;
                anyPluginsResponded = YES;

                if ([navPlugin respondsToSelector:@selector(shouldOverrideLoadWithRequest:navigationType:info:)]) {
                    shouldAllowRequest = [navPlugin shouldOverrideLoadWithRequest:request navigationType:navType info:info];
                } else {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
                    shouldAllowRequest = [navPlugin shouldOverrideLoadWithRequest:request navigationType:navType];
#pragma clang diagnostic pop
                }

                if (!shouldAllowRequest) {
                    break;
                }
            }
        }

        if (anyPluginsResponded) {
            return decisionHandler(shouldAllowRequest ? WKNavigationActionPolicyAllow : WKNavigationActionPolicyCancel);
        }
    } else {
        CDVPlugin <CDVPluginNavigationHandler> *intentAndNavFilter = (CDVPlugin <CDVPluginNavigationHandler> *)[vc getCommandInstance:@"IntentAndNavigationFilter"];
        if (intentAndNavFilter) {
            BOOL shouldAllowRequest = [intentAndNavFilter shouldOverrideLoadWithRequest:request navigationType:navType info:info];
            return decisionHandler(shouldAllowRequest ? WKNavigationActionPolicyAllow : WKNavigationActionPolicyCancel);
        }
    }

    // Handle all other types of urls (tel:, sms:), and requests to load a url in the main webview.
    BOOL shouldAllowNavigation = [self defaultResourcePolicyForURL:request.URL];
    if (!shouldAllowNavigation) {
        [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVPluginHandleOpenURLNotification object:request.URL userInfo:@{}]];
    }
    return decisionHandler(shouldAllowNavigation ? WKNavigationActionPolicyAllow : WKNavigationActionPolicyCancel);
}

- (void)webView:(WKWebView *)webView didReceiveAuthenticationChallenge:(NSURLAuthenticationChallenge *)challenge completionHandler:(void (^)(NSURLSessionAuthChallengeDisposition, NSURLCredential * _Nullable))completionHandler
{
    CDVViewController* vc = (CDVViewController*)self.viewController;

    for (CDVPlugin *plugin in vc.enumerablePlugins) {
        if ([plugin respondsToSelector:@selector(willHandleAuthenticationChallenge:completionHandler:)]) {
            CDVPlugin <CDVPluginAuthenticationHandler> *challengePlugin = (CDVPlugin <CDVPluginAuthenticationHandler> *)plugin;
            if ([challengePlugin willHandleAuthenticationChallenge:challenge completionHandler:completionHandler]) {
                return;
            }
        }
    }

    completionHandler(NSURLSessionAuthChallengePerformDefaultHandling, nil);
}

#pragma mark - Plugin interface

- (void)allowsBackForwardNavigationGestures:(CDVInvokedUrlCommand*)command;
{
    id value = [command argumentAtIndex:0];
    if (!([value isKindOfClass:[NSNumber class]])) {
        value = [NSNumber numberWithBool:NO];
    }

    WKWebView* wkWebView = (WKWebView*)_engineWebView;
    wkWebView.allowsBackForwardNavigationGestures = [value boolValue];
}

@end

#pragma mark - CDVWebViewWeakScriptMessageHandler

@implementation CDVWebViewWeakScriptMessageHandler

- (instancetype)initWithScriptMessageHandler:(id<WKScriptMessageHandler>)scriptMessageHandler
{
    self = [super init];
    if (self) {
        _scriptMessageHandler = scriptMessageHandler;
    }
    return self;
}

- (void)userContentController:(WKUserContentController *)userContentController didReceiveScriptMessage:(WKScriptMessage *)message
{
    [self.scriptMessageHandler userContentController:userContentController didReceiveScriptMessage:message];
}

@end
