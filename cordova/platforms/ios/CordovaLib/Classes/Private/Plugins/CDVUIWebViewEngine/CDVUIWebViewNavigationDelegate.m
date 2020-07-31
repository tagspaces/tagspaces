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

#import "CDVUIWebViewNavigationDelegate.h"
#import <Cordova/CDVViewController.h>
#import <Cordova/CDVCommandDelegateImpl.h>
#import <Cordova/CDVUserAgentUtil.h>
#import <objc/message.h>

@implementation CDVUIWebViewNavigationDelegate

- (instancetype)initWithEnginePlugin:(CDVPlugin*)theEnginePlugin
{
    self = [super init];
    if (self) {
        self.enginePlugin = theEnginePlugin;
    }

    return self;
}

/**
 When web application loads Add stuff to the DOM, mainly the user-defined settings from the Settings.plist file, and
 the device's data such as device ID, platform version, etc.
 */
- (void)webViewDidStartLoad:(UIWebView*)theWebView
{
    NSLog(@"Resetting plugins due to page load.");
    CDVViewController* vc = (CDVViewController*)self.enginePlugin.viewController;

    [vc.commandQueue resetRequestId];
    [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVPluginResetNotification object:self.enginePlugin.webView]];
}

/**
 Called when the webview finishes loading.  This stops the activity view.
 */
- (void)webViewDidFinishLoad:(UIWebView*)theWebView
{
    NSLog(@"Finished load of: %@", theWebView.request.URL);
    CDVViewController* vc = (CDVViewController*)self.enginePlugin.viewController;

    // It's safe to release the lock even if this is just a sub-frame that's finished loading.
    [CDVUserAgentUtil releaseLock:vc.userAgentLockToken];

    /*
     * Hide the Top Activity THROBBER in the Battery Bar
     */
    [[UIApplication sharedApplication] setNetworkActivityIndicatorVisible:NO];

    [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVPageDidLoadNotification object:self.enginePlugin.webView]];
}

- (void)webView:(UIWebView*)theWebView didFailLoadWithError:(NSError*)error
{
    CDVViewController* vc = (CDVViewController*)self.enginePlugin.viewController;

    [CDVUserAgentUtil releaseLock:vc.userAgentLockToken];

    NSString* message = [NSString stringWithFormat:@"Failed to load webpage with error: %@", [error localizedDescription]];
    NSLog(@"%@", message);

    NSURL* errorUrl = vc.errorURL;
    if (errorUrl) {
        errorUrl = [NSURL URLWithString:[NSString stringWithFormat:@"?error=%@", [message stringByAddingPercentEncodingWithAllowedCharacters:NSCharacterSet.URLPathAllowedCharacterSet]] relativeToURL:errorUrl];
        NSLog(@"%@", [errorUrl absoluteString]);
        if(error.code != NSURLErrorCancelled) {
            [theWebView loadRequest:[NSURLRequest requestWithURL:errorUrl]];
        }
    }
}

- (BOOL)defaultResourcePolicyForURL:(NSURL*)url
{
    /*
     * If a URL is being loaded that's a file url, just load it internally
     */
    if ([url isFileURL]) {
        return YES;
    }

    return NO;
}

- (BOOL)webView:(UIWebView*)theWebView shouldStartLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType
{
    NSURL* url = [request URL];
    CDVViewController* vc = (CDVViewController*)self.enginePlugin.viewController;

    /*
     * Execute any commands queued with cordova.exec() on the JS side.
     * The part of the URL after gap:// is irrelevant.
     */
    if ([[url scheme] isEqualToString:@"gap"]) {
        [vc.commandQueue fetchCommandsFromJs];
        // The delegate is called asynchronously in this case, so we don't have to use
        // flushCommandQueueWithDelayedJs (setTimeout(0)) as we do with hash changes.
        [vc.commandQueue executePending];
        return NO;
    }

    /*
     * Give plugins the chance to handle the url
     */
    BOOL anyPluginsResponded = NO;
    BOOL shouldAllowRequest = NO;

    for (NSString* pluginName in vc.pluginObjects) {
        CDVPlugin* plugin = [vc.pluginObjects objectForKey:pluginName];
        SEL selector = NSSelectorFromString(@"shouldOverrideLoadWithRequest:navigationType:");
        if ([plugin respondsToSelector:selector]) {
            anyPluginsResponded = YES;
            shouldAllowRequest = (((BOOL (*)(id, SEL, id, int))objc_msgSend)(plugin, selector, request, navigationType));
            if (!shouldAllowRequest) {
                break;
            }
        }
    }

    if (anyPluginsResponded) {
        return shouldAllowRequest;
    }

    /*
     * Handle all other types of urls (tel:, sms:), and requests to load a url in the main webview.
     */
    BOOL shouldAllowNavigation = [self defaultResourcePolicyForURL:url];
    if (shouldAllowNavigation) {
        return YES;
    } else {
        [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVPluginHandleOpenURLNotification object:url]];
    }

    return NO;
}

@end

#endif
