/*
The MIT License (MIT)

Copyright (c) 2013 pwlin - pwlin05@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
#import "FileOpener2.h"
#import <Cordova/CDV.h>

#import <QuartzCore/QuartzCore.h>
#import <MobileCoreServices/MobileCoreServices.h>

@implementation FileOpener2
@synthesize controller = docController;

CDVPluginResult* pluginResult = nil;
NSString* callbackId = nil;

- (void) open: (CDVInvokedUrlCommand*)command {
	callbackId = command.callbackId;
	NSString *path = [command.arguments objectAtIndex:0];
	NSString *contentType = [command.arguments objectAtIndex:1];
	BOOL showPreview = YES;

	if ([command.arguments count] >= 3) {
		showPreview = [[command.arguments objectAtIndex:2] boolValue];
	}

	CDVViewController* cont = (CDVViewController*)[super viewController];
	self.cdvViewController = cont;
	NSString *uti = nil;

	if ([contentType length] == 0) {
		NSArray *dotParts = [path componentsSeparatedByString:@"."];
		NSString *fileExt = [dotParts lastObject];

		uti = (__bridge NSString *)UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension, (__bridge CFStringRef)fileExt, NULL);
	} else {
		uti = (__bridge NSString *)UTTypeCreatePreferredIdentifierForTag(kUTTagClassMIMEType, (__bridge CFStringRef)contentType, NULL);
	}

	dispatch_async(dispatch_get_main_queue(), ^{
		NSURL *fileURL = NULL;
		NSString *decodedPath = [path stringByRemovingPercentEncoding];

		if ([path isEqualToString:decodedPath]) {
			NSLog(@"Path parameter not encoded. Building file URL encoding it...");
			fileURL = [NSURL fileURLWithPath:[path stringByReplacingOccurrencesOfString:@"file://" withString:@""]];;
		} else {
			NSLog(@"Path parameter already encoded. Building file URL without encoding it...");
			fileURL = [NSURL URLWithString:path];
		}

		localFile = fileURL.path;

		NSLog(@"looking for file at %@", fileURL);
		NSFileManager *fm = [NSFileManager defaultManager];

    	if (![fm fileExistsAtPath:localFile]) {
	    	NSDictionary *jsonObj = @{@"status" : @"9",
	    	@"message" : @"File does not exist"};
	    	CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:jsonObj];
	    	[self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
	    	return;
    	}

		docController = [UIDocumentInteractionController  interactionControllerWithURL:fileURL];
		docController.delegate = self;
		docController.UTI = uti;

		//Opens the file preview
		CGRect rect;

		if ([command.arguments count] >= 4) {
			NSArray *positionValues = [command.arguments objectAtIndex:3];

			if (![positionValues isEqual:[NSNull null]] && [positionValues count] >= 2) {
				rect = CGRectMake(0, 0, [[positionValues objectAtIndex:0] floatValue], [[positionValues objectAtIndex:1] floatValue]);
			} else {
				rect = CGRectMake(0, 0, 0, 0);
			}
		} else {
			rect = CGRectMake(0, 0, cont.view.bounds.size.width, cont.view.bounds.size.height);
		}

		BOOL wasOpened = NO;

		if (showPreview) {
			wasOpened = [docController presentPreviewAnimated: NO];
		} else {
			CDVViewController* cont = self.cdvViewController;
			wasOpened = [docController presentOpenInMenuFromRect:rect inView:cont.view animated:YES];
		}

		if (wasOpened) {
			pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString: @""];
		} else {
			NSDictionary *jsonObj = [ [NSDictionary alloc]
				initWithObjectsAndKeys :
				@"9", @"status",
				@"Could not handle UTI", @"message",
				nil
			];
			pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:jsonObj];
        	[self.commandDelegate sendPluginResult:pluginResult callbackId:callbackId];
		}
	});
}

@end

@implementation FileOpener2 (UIDocumentInteractionControllerDelegate)
- (void)documentInteractionControllerDidDismissOpenInMenu:(UIDocumentInteractionController *)controller {
	[self.commandDelegate sendPluginResult:pluginResult callbackId:callbackId];
}

- (void)documentInteractionControllerDidEndPreview:(UIDocumentInteractionController *)controller {
	[self.commandDelegate sendPluginResult:pluginResult callbackId:callbackId];
}

- (UIViewController *)documentInteractionControllerViewControllerForPreview:(UIDocumentInteractionController *)controller {
	UIViewController *presentingViewController = self.viewController;

	if (presentingViewController.view.window != [UIApplication sharedApplication].keyWindow) {
		presentingViewController = [UIApplication sharedApplication].keyWindow.rootViewController;
	}

	while (presentingViewController.presentedViewController != nil && ![presentingViewController.presentedViewController isBeingDismissed]) {
		presentingViewController = presentingViewController.presentedViewController;
	}

	return presentingViewController;
}

@end
