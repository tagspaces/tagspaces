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

#if !WK_WEB_VIEW_ONLY

#import "CDVUIWebViewEngine.h"
#import "CDVUIWebViewDelegate.h"
#import "CDVUIWebViewNavigationDelegate.h"
#import "NSDictionary+CordovaPreferences.h"

#import <objc/message.h>

@interface CDVUIWebViewEngine ()

@property (nonatomic, strong, readwrite) UIView* engineWebView;
@property (nonatomic, strong, readwrite) id <UIWebViewDelegate> uiWebViewDelegate;
@property (nonatomic, strong, readwrite) CDVUIWebViewNavigationDelegate* navWebViewDelegate;

@end

@implementation CDVUIWebViewEngine

@synthesize engineWebView = _engineWebView;

- (instancetype)initWithFrame:(CGRect)frame
{
    self = [super init];
    if (self) {
        self.engineWebView = [[UIWebView alloc] initWithFrame:frame];
        NSLog(@"Using UIWebView");
    }

    return self;
}

- (void)pluginInitialize
{
    // viewController would be available now. we attempt to set all possible delegates to it, by default

    UIWebView* uiWebView = (UIWebView*)_engineWebView;

    if ([self.viewController conformsToProtocol:@protocol(UIWebViewDelegate)]) {
        self.uiWebViewDelegate = [[CDVUIWebViewDelegate alloc] initWithDelegate:(id <UIWebViewDelegate>)self.viewController];
        uiWebView.delegate = self.uiWebViewDelegate;
    } else {
        self.navWebViewDelegate = [[CDVUIWebViewNavigationDelegate alloc] initWithEnginePlugin:self];
        self.uiWebViewDelegate = [[CDVUIWebViewDelegate alloc] initWithDelegate:self.navWebViewDelegate];
        uiWebView.delegate = self.uiWebViewDelegate;
    }

    [self updateSettings:self.commandDelegate.settings];
}

- (void)evaluateJavaScript:(NSString*)javaScriptString completionHandler:(void (^)(id, NSError*))completionHandler
{
    NSString* ret = [(UIWebView*)_engineWebView stringByEvaluatingJavaScriptFromString:javaScriptString];

    if (completionHandler) {
        completionHandler(ret, nil);
    }
}

- (id)loadRequest:(NSURLRequest*)request
{
    [(UIWebView*)_engineWebView loadRequest:request];
    return nil;
}

- (id)loadHTMLString:(NSString*)string baseURL:(NSURL*)baseURL
{
    [(UIWebView*)_engineWebView loadHTMLString:string baseURL:baseURL];
    return nil;
}

- (NSURL*)URL
{
    return [[(UIWebView*)_engineWebView request] URL];
}

- (BOOL) canLoadRequest:(NSURLRequest*)request
{
    return (request != nil);
}

- (void)updateSettings:(NSDictionary*)settings
{
    UIWebView* uiWebView = (UIWebView*)_engineWebView;

    uiWebView.scalesPageToFit = [settings cordovaBoolSettingForKey:@"EnableViewportScale" defaultValue:NO];
    uiWebView.allowsInlineMediaPlayback = [settings cordovaBoolSettingForKey:@"AllowInlineMediaPlayback" defaultValue:NO];
    uiWebView.mediaPlaybackRequiresUserAction = [settings cordovaBoolSettingForKey:@"MediaPlaybackRequiresUserAction" defaultValue:YES];
    uiWebView.mediaPlaybackAllowsAirPlay = [settings cordovaBoolSettingForKey:@"MediaPlaybackAllowsAirPlay" defaultValue:YES];
    uiWebView.keyboardDisplayRequiresUserAction = [settings cordovaBoolSettingForKey:@"KeyboardDisplayRequiresUserAction" defaultValue:YES];
    uiWebView.suppressesIncrementalRendering = [settings cordovaBoolSettingForKey:@"SuppressesIncrementalRendering" defaultValue:NO];
    uiWebView.gapBetweenPages = [settings cordovaFloatSettingForKey:@"GapBetweenPages" defaultValue:0.0];
    uiWebView.pageLength = [settings cordovaFloatSettingForKey:@"PageLength" defaultValue:0.0];

    id prefObj = nil;

    // By default, DisallowOverscroll is false (thus bounce is allowed)
    BOOL bounceAllowed = !([settings cordovaBoolSettingForKey:@"DisallowOverscroll" defaultValue:NO]);

    // prevent webView from bouncing
    if (!bounceAllowed) {
        if ([uiWebView respondsToSelector:@selector(scrollView)]) {
            ((UIScrollView*)[uiWebView scrollView]).bounces = NO;
        } else {
            for (id subview in self.webView.subviews) {
                if ([[subview class] isSubclassOfClass:[UIScrollView class]]) {
                    ((UIScrollView*)subview).bounces = NO;
                }
            }
        }
    }

    NSString* decelerationSetting = [settings cordovaSettingForKey:@"UIWebViewDecelerationSpeed"];
    if (![@"fast" isEqualToString:decelerationSetting]) {
        [uiWebView.scrollView setDecelerationRate:UIScrollViewDecelerationRateNormal];
    }

    NSInteger paginationBreakingMode = 0; // default - UIWebPaginationBreakingModePage
    prefObj = [settings cordovaSettingForKey:@"PaginationBreakingMode"];
    if (prefObj != nil) {
        NSArray* validValues = @[@"page", @"column"];
        NSString* prefValue = [validValues objectAtIndex:0];

        if ([prefObj isKindOfClass:[NSString class]]) {
            prefValue = prefObj;
        }

        paginationBreakingMode = [validValues indexOfObject:[prefValue lowercaseString]];
        if (paginationBreakingMode == NSNotFound) {
            paginationBreakingMode = 0;
        }
    }
    uiWebView.paginationBreakingMode = paginationBreakingMode;

    NSInteger paginationMode = 0; // default - UIWebPaginationModeUnpaginated
    prefObj = [settings cordovaSettingForKey:@"PaginationMode"];
    if (prefObj != nil) {
        NSArray* validValues = @[@"unpaginated", @"lefttoright", @"toptobottom", @"bottomtotop", @"righttoleft"];
        NSString* prefValue = [validValues objectAtIndex:0];

        if ([prefObj isKindOfClass:[NSString class]]) {
            prefValue = prefObj;
        }

        paginationMode = [validValues indexOfObject:[prefValue lowercaseString]];
        if (paginationMode == NSNotFound) {
            paginationMode = 0;
        }
    }
    uiWebView.paginationMode = paginationMode;
}

- (void)updateWithInfo:(NSDictionary*)info
{
    UIWebView* uiWebView = (UIWebView*)_engineWebView;

    id <UIWebViewDelegate> uiWebViewDelegate = [info objectForKey:kCDVWebViewEngineUIWebViewDelegate];
    NSDictionary* settings = [info objectForKey:kCDVWebViewEngineWebViewPreferences];

    if (uiWebViewDelegate &&
        [uiWebViewDelegate conformsToProtocol:@protocol(UIWebViewDelegate)]) {
        self.uiWebViewDelegate = [[CDVUIWebViewDelegate alloc] initWithDelegate:(id <UIWebViewDelegate>)uiWebViewDelegate];
        uiWebView.delegate = self.uiWebViewDelegate;
    }

    if (settings && [settings isKindOfClass:[NSDictionary class]]) {
        [self updateSettings:settings];
    }
}

// This forwards the methods that are in the header that are not implemented here.
// Both WKWebView and UIWebView implement the below:
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

@end

#endif
