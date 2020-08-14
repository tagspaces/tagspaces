/*
 * Copyright (c) 2016, 2017 Oracle and/or its affiliates.
 *
 * The Universal Permissive License (UPL), Version 1.0
 *
 * Subject to the condition set forth below, permission is hereby granted to any person obtaining a copy of this
 * software, associated documentation and/or data (collectively the "Software"), free of charge and under any and
 * all copyright rights in the Software, and any and all patent rights owned or freely licensable by each
 * licensor hereunder covering either (i) the unmodified Software as contributed to or provided by such licensor,
 * or (ii) the Larger Works (as defined below), to deal in both
 *
 *
 * (a) the Software, and
 *
 * (b) any piece of software and/or hardware listed in the lrgrwrks.txt file if one is included with the Software
 * (each a “Larger Work” to which the Software is contributed by such licensors),
 *
 * without restriction, including without limitation the rights to copy, create derivative works of, display,
 * perform, and distribute the Software and make, use, sell, offer for sale, import, export, have made, and
 * have sold the Software and the Larger Work(s), and to sublicense the foregoing rights on either these or other
 * terms.
 *
 * This license is subject to the following condition:
 *
 * The above copyright notice and either this complete permission notice or at a minimum a reference to the UPL
 * must be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

#import "CDVWKWebViewFileXhr.h"
#import <Cordova/CDV.h>

NS_ASSUME_NONNULL_BEGIN


@implementation NSDictionary(CDVWKWebViewFileXhr)

/**
 Convenience method to return a NSString from a dictionary

 @param key The key to return
 @return The value as a String, or nil
 */
- (nullable NSString *) cdvwkStringForKey:(NSString *)key
{
    NSObject* val = self[key];
    if (val == nil)
        return nil;
    if ([val isKindOfClass:NSString.class])
        return (NSString *)val;
    return [NSString stringWithFormat:@"%@",val];
}
@end

@interface CDVWKWebViewFileXhr()

@property (nonatomic, retain) NSURLSession *urlSession;
@property (nonatomic, retain) NSString *nativeXHRLogging;

@end



@implementation CDVWKWebViewFileXhr

-(void) pluginInitialize {
    [super pluginInitialize];
    
    if (![self.webView isKindOfClass:WKWebView.class])
        return;  

    WKWebView *wkWebView = (WKWebView *) self.webView; 

    // added : allowFileAccessFromFileURLs  allowUniversalAccessFromFileURLs
    NSString *value = [self.commandDelegate.settings cdvwkStringForKey:@"allowfileaccessfromfileurls"];   
   
    if (value != nil && [value isEqualToString:@"true"]){   
        _allowFileAccessFromFileURLs = YES;    
        NSLog(@"WARNING: File access allowed due to preference allowFileAccessFromFileURLs=true");        
    }else{
        _allowFileAccessFromFileURLs = NO;
    }
    [wkWebView.configuration.preferences setValue:@(_allowFileAccessFromFileURLs) forKey:@"allowFileAccessFromFileURLs"];
   
    value = [self.commandDelegate.settings cdvwkStringForKey:@"allowuniversalaccessfromfileurls"];
    if (value != nil && [value isEqualToString:@"true"]){  
        _allowUniversalAccessFromFileURLs = YES; 
        NSLog(@"WARNING: Universal access allowed due to preference allowUniversalAccessFromFileURLs=true");
    }else{
        _allowUniversalAccessFromFileURLs = NO;        
    }
    [wkWebView.configuration setValue:@(_allowUniversalAccessFromFileURLs) forKey:@"allowUniversalAccessFromFileURLs"];      
    
    // note:  settings translates all preferences to lower case
    value = [self.commandDelegate.settings cdvwkStringForKey:@"allowuntrustedcerts"];
    if (value != nil && [value compare:@"on" options:NSCaseInsensitiveSearch] == NSOrderedSame) {
        _allowsInsecureLoads = YES;
        NSLog(@"WARNING: NativeXHR is allowing untrusted certificates due to preference AllowUntrustedCerts=on");
    }
    
    value = [self.commandDelegate.settings cdvwkStringForKey:@"interceptremoterequests"];
    if (value != nil && 
        ([value compare:@"all" options:NSCaseInsensitiveSearch] == NSOrderedSame ||
         [value compare:@"secureOnly" options:NSCaseInsensitiveSearch] == NSOrderedSame ||
         [value compare:@"none" options:NSCaseInsensitiveSearch] == NSOrderedSame)) {
        _interceptRemoteRequests = value;
    } else {
        _interceptRemoteRequests = @"secureOnly";
    }
    
    value = [self.commandDelegate.settings cdvwkStringForKey:@"nativexhrlogging"];
    if (value != nil &&
        ([value compare:@"none" options:NSCaseInsensitiveSearch] == NSOrderedSame ||
         [value compare:@"full" options:NSCaseInsensitiveSearch] == NSOrderedSame)) {
        _nativeXHRLogging = value;
    } else {
        _nativeXHRLogging = @"none";
    }
    
   
    if ([_interceptRemoteRequests compare:@"all" options:NSCaseInsensitiveSearch] == NSOrderedSame ||
        [_interceptRemoteRequests compare:@"secureOnly" options:NSCaseInsensitiveSearch] == NSOrderedSame) {

        NSURLSessionConfiguration *sessionConfiguration = [NSURLSessionConfiguration defaultSessionConfiguration];
        [sessionConfiguration setRequestCachePolicy:NSURLRequestReloadIgnoringCacheData];
        self.urlSession = [NSURLSession sessionWithConfiguration:sessionConfiguration delegate:self delegateQueue:nil]; // FortityFalsePositive
        [wkWebView.configuration.userContentController addScriptMessageHandler:self name:@"nativeXHR"];

    }
}

- (void) dispose {
    
    if ([self.webView isKindOfClass:WKWebView.class]) {
    
        WKWebView *wkWebView = (WKWebView *) self.webView;
        [wkWebView.configuration.userContentController removeScriptMessageHandlerForName:@"nativeXHR"];
    }
    [super dispose];

}
/*!
 * @param uri target relative file from the XMLHttpRequest polyfill
 * @return URL relative to the main bundle's www folder if no file:// prefix is provided. Otherwise the file url is used as is to support /Library paths
 */
-(NSURL*)getWebContentResourceURL: (NSString*) uri
{
    NSURL *targetURL = nil;

    if ([uri hasPrefix: @"file://"] || [uri hasPrefix: @"FILE://"])
    {
        targetURL = [NSURL URLWithString:uri];
    }
    else
    {
        NSURL *baseURL = [[NSBundle mainBundle] resourceURL];
        NSString *wwwuri = [NSString stringWithFormat:@"www/%@", uri];
        targetURL = [NSURL URLWithString:wwwuri relativeToURL:baseURL];
    }
    
    return targetURL;
}

/*!
 * @discussion Verifying the standardized path of the target URL is under the www
 * folder of the main bundle or under the application /Library folder
 *
 * @param targetURL target file under either the www folder of the main bundle or under the application /Library folder
 * @return true if the targetURL is within the www folder in the main bundle or under the application /Library folder
 */
-(BOOL)isWebContentResourceSecure: (NSURL*) targetURL
{
    NSURL *baseURL = [NSURL URLWithString:@"www" relativeToURL:[[NSBundle mainBundle] resourceURL]];
    NSString *basePath = [baseURL absoluteString];
    NSString *targetPath = [[targetURL standardizedURL] absoluteString];
    
    return [targetPath hasPrefix:basePath] ||
           [targetPath hasPrefix:[[NSURL fileURLWithPath:
                                   [NSSearchPathForDirectoriesInDomains(NSLibraryDirectory, NSUserDomainMask, YES) objectAtIndex:0]]  absoluteString]];
}

/*!
 * @discussion Cordova API command impl that reads and return file data as a javascript string
 * @param command NSArray* arguments[0] - NSString* uri
 */
- (void)readAsText:(CDVInvokedUrlCommand*)command
{
    NSString *uri = [command.arguments.firstObject isKindOfClass: NSString.class] ? command.arguments.firstObject : nil;
    if (uri.length == 0) {
        // this catches nil value or empty string
        [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_IO_EXCEPTION messageAsInt:404] callbackId:command.callbackId];
        return;
    }

    NSURL *targetURL = [self getWebContentResourceURL:uri];
    
    if (![self isWebContentResourceSecure:targetURL]) {
        
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ILLEGAL_ACCESS_EXCEPTION messageAsInt:404];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        
    } else {
        
        __weak CDVWKWebViewFileXhr* weakSelf = self;
        [self.commandDelegate runInBackground:^ {
            
            NSData* data = [[NSData alloc] initWithContentsOfURL:targetURL];
            CDVPluginResult* result = nil;
            
            if (data != nil) {
                NSString* str = [[NSString alloc] initWithBytesNoCopy:(void*)[data bytes] length:[data length] encoding:NSUTF8StringEncoding freeWhenDone:NO];
                
                // Check that UTF8 conversion did not fail.
                if (str != nil) {
                    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:str];
                    result.associatedObject = data;
                }
            }
            
            if (result == nil) {
                result = [CDVPluginResult resultWithStatus:CDVCommandStatus_IO_EXCEPTION messageAsInt:404];
            }
            
            [weakSelf.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        }];
    }
}

/*!
 * @discussion Cordova API command impl that reads and return file data as a javascript arraybuffer
 * @param command NSArray* arguments[0] - NSString* uri
 */
- (void)readAsArrayBuffer:(CDVInvokedUrlCommand*)command
{
    NSString *uri = [command.arguments.firstObject isKindOfClass: NSString.class] ? command.arguments.firstObject : nil;
    if (uri.length == 0) {
        // this catches nil value or empty string
        [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_IO_EXCEPTION messageAsInt:404] callbackId:command.callbackId];
        return;
    } 
    NSURL *targetURL = [self getWebContentResourceURL:uri];
    
    if (![self isWebContentResourceSecure:targetURL]) {
        
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ILLEGAL_ACCESS_EXCEPTION messageAsInt:404];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        
    } else {
        
        __weak CDVWKWebViewFileXhr* weakSelf = self;
        [self.commandDelegate runInBackground:^ {
            
            NSData* data = [[NSData alloc] initWithContentsOfURL:targetURL];
            
            CDVPluginResult* result = nil;
            if (data != nil) {
                result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArrayBuffer:data];
            } else {
                result = [CDVPluginResult resultWithStatus:CDVCommandStatus_IO_EXCEPTION messageAsInt:404];
            }
            
            [weakSelf.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        }];
    }
}

- (void)getConfig:(CDVInvokedUrlCommand*)command {
    
    NSDictionary *dict = @{
                           @"InterceptRemoteRequests" : _interceptRemoteRequests,
                           @"NativeXHRLogging" : _nativeXHRLogging
                          };
    
    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:dict] callbackId:command.callbackId];
}


- (void)URLSession:(NSURLSession *)session didReceiveChallenge:(NSURLAuthenticationChallenge *)challenge
 completionHandler:(void (^)(NSURLSessionAuthChallengeDisposition disposition, NSURLCredential * _Nullable credential))completionHandler {
    
    if (_allowsInsecureLoads) {
        SecTrustRef serverTrust = challenge.protectionSpace.serverTrust;
        if (serverTrust) {
          CFDataRef exceptions = SecTrustCopyExceptions (serverTrust);
          SecTrustSetExceptions (serverTrust, exceptions);
          CFRelease (exceptions);
          completionHandler (NSURLSessionAuthChallengeUseCredential, [NSURLCredential credentialForTrust:serverTrust]); // FortityFalsePositive
         
          return;
        }
    }
    completionHandler(NSURLSessionAuthChallengePerformDefaultHandling, nil);
}


// MARK: - WKScriptMessageHandler

/**
 * Performs an asynchronous network load of the requested resource using native networking routines.
 *
 * The request is described in the body parameter as a dictionary.  The supported keys are outlined below
 *
 *     Name     | Kind                     | Required | Description                    | Allowed Values
 *     ---      | ---                      | ---      | ---                            | ---
 *     id       | string                   | true     | A unique id used for callbacks | any valid non-empty string
 *     callback | string                   | true     | a javascript function that will be invoked on callbacks | any valid javascript function
 *     url      | string                   | true     | The URL to load                | A valid URL
 *     method   | string                   | false    | The http method                | Valid HTTP method. Defaults to GET
 *     headers  | object {string, string}  | false    | Additional request headers     |
 *     body     | string (base 64 encoded) | false    | The http request body          |
 *     timeout  | number                   | false    | Request timeout (seconds)      | any positive value
 *
 * The callback function takes two arguments.  The first argument is the unique identifier supplied in the request 
 * object.  The second argument is a java object defining the HTTP result.
 */
- (void) performNativeXHR:(NSDictionary<NSString *, id> *) body inWebView:(WKWebView *) webView {
    
    NSString *requestId = [body cdvwkStringForKey:@"id"];
    NSString *callbackFunction = [body cdvwkStringForKey:@"callback"];
    NSString *urlString = [body cdvwkStringForKey:@"url"];
    NSString *method = [body cdvwkStringForKey:@"method"];
    
    __weak WKWebView* weakWebView = webView;
    
    void(^sendResult)(NSDictionary *) = ^void(NSDictionary *result) {
        dispatch_async(dispatch_get_main_queue(), ^{
            
            NSError *jsonError;
            NSData* json = [NSJSONSerialization dataWithJSONObject:result options:0 error:&jsonError];
            
            if (jsonError != nil) {
                NSLog(@"NativeXHR: Failed to encode response to json: %@", jsonError.localizedDescription); // FortityFalsePositive
                
                NSString *script = [NSString stringWithFormat:@"try { %@('%@', {'error' : 'json serialization failed'}) } catch (e) { }", callbackFunction, requestId];
                [weakWebView evaluateJavaScript:script completionHandler:nil];
                return;
            }
            
            NSString *script = [NSString stringWithFormat:@"try { %@('%@', %@) } catch (e) { }", callbackFunction, requestId, [[NSString alloc] initWithData:json encoding:NSUTF8StringEncoding]];
            [weakWebView evaluateJavaScript:script completionHandler:nil];

        });
    };
    
    
    if (requestId.length == 0 || callbackFunction.length == 0 ) {
        NSLog(@"NativeXHR: Required parameters id and callback url were not supplied.");
        return;
    }
    
    if (urlString.length == 0) {
        return sendResult( @{ @"error" : @"Invalid url"});
    }
    
    NSURL *url = [NSURL URLWithString:urlString];
    
    if (![url.scheme.lowercaseString isEqualToString:@"http"] && ![url.scheme.lowercaseString isEqualToString:@"https"]) {
        NSString *msg = [NSString stringWithFormat:@"NativeXHR: Invalid url scheme '%@';  only http and https are supported by NativeXHR", url.scheme];
        return sendResult( @{ @"error" : msg});
    }
    
    __block NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
    if (method.length)
        request.HTTPMethod = [method uppercaseString];
    
    id val = [body objectForKey:@"timeout"];
    if ([val isKindOfClass:NSNumber.class]) {
        request.timeoutInterval = [(NSNumber *) val doubleValue];
    }
    
    
    val = [body objectForKey:@"headers"];
    if ([val isKindOfClass:NSDictionary.class]) {
        [(NSDictionary *) val enumerateKeysAndObjectsUsingBlock:^(id  _Nonnull key, id  _Nonnull obj, BOOL * _Nonnull stop) {
            if (![key isKindOfClass:NSString.class] || ![obj isKindOfClass:NSString.class])
                return;
            [request setValue:(NSString *)obj forHTTPHeaderField:(NSString *)key];
        }];
    }
    
    NSString *body64 = [body cdvwkStringForKey:@"body"];
    if (body64.length) {
        request.HTTPBody = [[NSData alloc] initWithBase64EncodedString:body64 options:0];
    }
    
    NSURLSessionDataTask *task = [self.urlSession dataTaskWithRequest:request completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) { // FortityFalsePositive
        
        NSMutableDictionary* result = [NSMutableDictionary dictionary];
        
        if (data != nil) {
            result[@"data"] = [[NSString alloc] initWithData:[data base64EncodedDataWithOptions:0] encoding:NSUTF8StringEncoding];
        }
        if (response != nil) {
            NSMutableDictionary *dictionary = [NSMutableDictionary dictionary];
            dictionary[@"expectedContentLength"] = @(response.expectedContentLength);
            dictionary[@"suggestedFileName"] = response.suggestedFilename;
            dictionary[@"mimeType"] = response.MIMEType;
            dictionary[@"url"] = response.URL.absoluteString;
            dictionary[@"textEncodingName"] = response.textEncodingName;
            if ([response isKindOfClass:NSHTTPURLResponse.class]) {
                NSHTTPURLResponse* urlResponse = (NSHTTPURLResponse *) response;
                dictionary[@"allHeaderFields"] = urlResponse.allHeaderFields;
                dictionary[@"statusCode"] = @(urlResponse.statusCode);
                dictionary[@"localizedStatusCode"] = [NSHTTPURLResponse localizedStringForStatusCode:urlResponse.statusCode];                    
            }
            
            result[@"response"] = dictionary;
        }
        
        if (error != nil) {
            result[@"error"] = [error localizedDescription];
            result[@"underlyingErrorCode"] = @(error.code);
        }
        sendResult(result);
    }];
    
    task.taskDescription = requestId;
    [task resume];
}

- (void)userContentController:(WKUserContentController *)userContentController didReceiveScriptMessage:(WKScriptMessage *)message {
    
    if (![message.name isEqualToString:@"nativeXHR"] || ![message.body isKindOfClass:NSDictionary.class]) {
        NSLog(@"NativeXHR: Invalid script message '%@' with body '%@' received.  Ignoring.", message.name, message.body);
        return;
    }
    __weak __typeof(message.webView) weakWebView = message.webView;
    NSDictionary<NSString *, id> *body = message.body;

    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        [self performNativeXHR:body inWebView:weakWebView];
    });
    
}

@end

NS_ASSUME_NONNULL_END
