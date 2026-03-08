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

#import "CDVWebViewUIDelegate.h"
#import <Cordova/CDVViewController.h>

@interface CDVWebViewUIDelegate ()

@property (nonatomic, weak) CDVViewController *viewController;

@end

@implementation CDVWebViewUIDelegate
{
    NSMutableArray<UIViewController *> *windows;
}

- (instancetype)initWithViewController:(CDVViewController *)vc
{
    self = [super init];

    if (self) {
        self.viewController = vc;
        self.title = vc.title;
        windows = [[NSMutableArray alloc] init];
    }
    return self;
}

- (void)webView:(WKWebView*)webView runJavaScriptAlertPanelWithMessage:(NSString*)message initiatedByFrame:(WKFrameInfo*)frame completionHandler:(CDV_SWIFT_UI_ACTOR void (^)(void))completionHandler
{
    UIAlertController* alert = [UIAlertController alertControllerWithTitle:self.title
                                                                   message:message
                                                            preferredStyle:UIAlertControllerStyleAlert];

    UIAlertAction* ok = [UIAlertAction actionWithTitle:NSLocalizedString(@"OK", @"OK")
                                                 style:UIAlertActionStyleDefault
                                               handler:^(UIAlertAction* action)
        {
            completionHandler();
            [alert dismissViewControllerAnimated:YES completion:nil];
        }];

    [alert addAction:ok];

    [[self topViewController] presentViewController:alert animated:YES completion:nil];
}

- (void)webView:(WKWebView*)webView runJavaScriptConfirmPanelWithMessage:(NSString*)message initiatedByFrame:(WKFrameInfo*)frame completionHandler:(CDV_SWIFT_UI_ACTOR void (^)(BOOL result))completionHandler
{
    UIAlertController* alert = [UIAlertController alertControllerWithTitle:self.title
                                                                   message:message
                                                            preferredStyle:UIAlertControllerStyleAlert];

    UIAlertAction* ok = [UIAlertAction actionWithTitle:NSLocalizedString(@"OK", @"OK")
                                                 style:UIAlertActionStyleDefault
                                               handler:^(UIAlertAction* action)
        {
            completionHandler(YES);
            [alert dismissViewControllerAnimated:YES completion:nil];
        }];

    [alert addAction:ok];

    UIAlertAction* cancel = [UIAlertAction actionWithTitle:NSLocalizedString(@"Cancel", @"Cancel")
                                                     style:UIAlertActionStyleDefault
                                                   handler:^(UIAlertAction* action)
        {
            completionHandler(NO);
            [alert dismissViewControllerAnimated:YES completion:nil];
        }];
    [alert addAction:cancel];

    [[self topViewController] presentViewController:alert animated:YES completion:nil];
}

- (void)webView:(WKWebView*)webView runJavaScriptTextInputPanelWithPrompt:(NSString*)prompt defaultText:(NSString*)defaultText initiatedByFrame:(WKFrameInfo*)frame completionHandler:(CDV_SWIFT_UI_ACTOR void (^)(NSString* result))completionHandler
{
    UIAlertController* alert = [UIAlertController alertControllerWithTitle:self.title
                                                                   message:prompt
                                                            preferredStyle:UIAlertControllerStyleAlert];

    UIAlertAction* ok = [UIAlertAction actionWithTitle:NSLocalizedString(@"OK", @"OK")
                                                 style:UIAlertActionStyleDefault
                                               handler:^(UIAlertAction* action)
        {
            completionHandler(((UITextField*)alert.textFields[0]).text);
            [alert dismissViewControllerAnimated:YES completion:nil];
        }];

    [alert addAction:ok];

    UIAlertAction* cancel = [UIAlertAction actionWithTitle:NSLocalizedString(@"Cancel", @"Cancel")
                                                     style:UIAlertActionStyleDefault
                                                   handler:^(UIAlertAction* action)
        {
            completionHandler(nil);
            [alert dismissViewControllerAnimated:YES completion:nil];
        }];
    [alert addAction:cancel];

    [alert addTextFieldWithConfigurationHandler:^(UITextField* textField) {
        textField.text = defaultText;
    }];

    [[self topViewController] presentViewController:alert animated:YES completion:nil];
}

- (nullable WKWebView*)webView:(WKWebView*)webView createWebViewWithConfiguration:(WKWebViewConfiguration*)configuration forNavigationAction:(WKNavigationAction*)navigationAction windowFeatures:(WKWindowFeatures*)windowFeatures
{
    if (!navigationAction.targetFrame.isMainFrame) {
        if (self.allowNewWindows) {
            WKWebView* v = [[WKWebView alloc] initWithFrame:webView.frame configuration:configuration];
            v.UIDelegate = webView.UIDelegate;
            v.navigationDelegate = webView.navigationDelegate;

            UIViewController* vc = [[UIViewController alloc] init];
            vc.modalPresentationStyle = UIModalPresentationOverCurrentContext;
            vc.view = v;

            [windows addObject:vc];

            [[self topViewController] presentViewController:vc animated:YES completion:nil];
            return v;
        } else {
            [webView loadRequest:navigationAction.request];
        }
    }

    return nil;
}

- (void)webViewDidClose:(WKWebView*)webView
{
    for (UIViewController* vc in windows) {
        if (vc.view == webView) {
            [vc dismissViewControllerAnimated:YES completion:nil];
            [windows removeObject:vc];
            break;
        }
    }

    // We do not allow closing the primary WebView
}

- (void)webView:(WKWebView *)webView requestMediaCapturePermissionForOrigin:(nonnull WKSecurityOrigin *)origin initiatedByFrame:(nonnull WKFrameInfo *)frame type:(WKMediaCaptureType)type decisionHandler:(nonnull void (^)(WKPermissionDecision))decisionHandler
  API_AVAILABLE(ios(15.0))
{
    WKPermissionDecision decision;
    
    if (_mediaPermissionGrantType == CDVWebViewPermissionGrantType_Prompt) {
        decision = WKPermissionDecisionPrompt;
    }
    else if (_mediaPermissionGrantType == CDVWebViewPermissionGrantType_Deny) {
        decision = WKPermissionDecisionDeny;
    }
    else if (_mediaPermissionGrantType == CDVWebViewPermissionGrantType_Grant) {
        decision = WKPermissionDecisionGrant;
    }
    else {
        if ([origin.host isEqualToString:webView.URL.host]) {
            decision = WKPermissionDecisionGrant;
        }
        else {
            decision =_mediaPermissionGrantType == CDVWebViewPermissionGrantType_GrantIfSameHost_ElsePrompt ? WKPermissionDecisionPrompt : WKPermissionDecisionDeny;
        }
    }
    
    decisionHandler(decision);
}

#pragma mark - Utility Methods

- (nullable UIViewController *)topViewController
{
    UIViewController *vc = self.viewController;

    while (vc.presentedViewController != nil && ![vc.presentedViewController isBeingDismissed]) {
        vc = vc.presentedViewController;
    }

    return vc;
}

@end
