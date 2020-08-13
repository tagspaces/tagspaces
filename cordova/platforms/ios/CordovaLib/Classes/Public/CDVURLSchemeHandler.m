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


#import "CDVURLSchemeHandler.h"
#import <MobileCoreServices/MobileCoreServices.h>

@implementation CDVURLSchemeHandler


- (instancetype)initWithVC:(CDVViewController *)controller
{
    self = [super init];
    if (self) {
        _viewController = controller;
    }
    return self;
}

- (void)webView:(WKWebView *)webView startURLSchemeTask:(id <WKURLSchemeTask>)urlSchemeTask
{
    NSString * startPath = [[NSBundle mainBundle] pathForResource:self.viewController.wwwFolderName ofType: nil];
    NSURL * url = urlSchemeTask.request.URL;
    NSString * stringToLoad = url.path;
    NSString * scheme = url.scheme;

    if ([scheme isEqualToString:self.viewController.appScheme]) {
        if ([stringToLoad hasPrefix:@"/_app_file_"]) {
            startPath = [stringToLoad stringByReplacingOccurrencesOfString:@"/_app_file_" withString:@""];
        } else {
            if ([stringToLoad isEqualToString:@""] || [url.pathExtension isEqualToString:@""]) {
                startPath = [startPath stringByAppendingPathComponent:self.viewController.startPage];
            } else {
                startPath = [startPath stringByAppendingPathComponent:stringToLoad];
            }
        }
    }

    NSError * fileError = nil;
    NSData * data = nil;
    if ([self isMediaExtension:url.pathExtension]) {
        data = [NSData dataWithContentsOfFile:startPath options:NSDataReadingMappedIfSafe error:&fileError];
    }
    if (!data || fileError) {
        data =  [[NSData alloc] initWithContentsOfFile:startPath];
    }
    NSInteger statusCode = 200;
    if (!data) {
        statusCode = 404;
    }
    NSURL * localUrl = [NSURL URLWithString:url.absoluteString];
    NSString * mimeType = [self getMimeType:url.pathExtension];
    id response = nil;
    if (data && [self isMediaExtension:url.pathExtension]) {
        response = [[NSURLResponse alloc] initWithURL:localUrl MIMEType:mimeType expectedContentLength:data.length textEncodingName:nil];
    } else {
        NSDictionary * headers = @{ @"Content-Type" : mimeType, @"Cache-Control": @"no-cache"};
        response = [[NSHTTPURLResponse alloc] initWithURL:localUrl statusCode:statusCode HTTPVersion:nil headerFields:headers];
    }

    [urlSchemeTask didReceiveResponse:response];
    [urlSchemeTask didReceiveData:data];
    [urlSchemeTask didFinish];

}

- (void)webView:(nonnull WKWebView *)webView stopURLSchemeTask:(nonnull id<WKURLSchemeTask>)urlSchemeTask
{

}

-(NSString *) getMimeType:(NSString *)fileExtension {
    if (fileExtension && ![fileExtension isEqualToString:@""]) {
        NSString *UTI = (__bridge_transfer NSString *)UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension, (__bridge CFStringRef)fileExtension, NULL);
        NSString *contentType = (__bridge_transfer NSString *)UTTypeCopyPreferredTagWithClass((__bridge CFStringRef)UTI, kUTTagClassMIMEType);
        return contentType ? contentType : @"application/octet-stream";
    } else {
        return @"text/html";
    }
}

-(BOOL) isMediaExtension:(NSString *) pathExtension {
    NSArray * mediaExtensions = @[@"m4v", @"mov", @"mp4",
                           @"aac", @"ac3", @"aiff", @"au", @"flac", @"m4a", @"mp3", @"wav"];
    if ([mediaExtensions containsObject:pathExtension.lowercaseString]) {
        return YES;
    }
    return NO;
}


@end
