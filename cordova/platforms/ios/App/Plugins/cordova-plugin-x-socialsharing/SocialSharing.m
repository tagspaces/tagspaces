#import "SocialSharing.h"
#import "NSString+SSURLEncoding.h"
#import <Cordova/CDV.h>
#import <Social/Social.h>
#import <Foundation/NSException.h>
#import <MessageUI/MFMessageComposeViewController.h>
#import <MessageUI/MFMailComposeViewController.h>
#import <MobileCoreServices/MobileCoreServices.h>

static NSString *const kShareOptionMessage = @"message";
static NSString *const kShareOptionSubject = @"subject";
static NSString *const kShareOptionFiles = @"files";
static NSString *const kShareOptionUrl = @"url";
static NSString *const kShareOptionIPadCoordinates = @"iPadCoordinates";

@implementation SocialSharing {
  UIPopoverController *_popover;
  NSString *_popupCoordinates;
}

- (void)pluginInitialize {
}

- (void)available:(CDVInvokedUrlCommand*)command {
  BOOL avail = NO;
  if (NSClassFromString(@"UIActivityViewController")) {
    avail = YES;
  }
  CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:avail];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (NSString*)getIPadPopupCoordinates {
  // see https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin/issues/1052
  return nil;
  /*
  if (_popupCoordinates != nil) {
    return _popupCoordinates;
  }
  if ([self.webView respondsToSelector:@selector(stringByEvaluatingJavaScriptFromString:)]) {
    return [(UIWebView*)self.webView stringByEvaluatingJavaScriptFromString:@"window.plugins.socialsharing.iPadPopupCoordinates();"];
  } else {
    // prolly a wkwebview, ignoring for now
    return nil;
  }
  */
}

- (void)setIPadPopupCoordinates:(CDVInvokedUrlCommand*)command {
  _popupCoordinates  = [command.arguments objectAtIndex:0];
}

- (CGRect)getPopupRectFromIPadPopupCoordinates:(NSArray*)comps {
  CGRect rect = CGRectZero;
  if ([comps count] == 4) {
    rect = CGRectMake([[comps objectAtIndex:0] integerValue], [[comps objectAtIndex:1] integerValue], [[comps objectAtIndex:2] integerValue], [[comps objectAtIndex:3] integerValue]);
  }
  return rect;
}

- (void)share:(CDVInvokedUrlCommand*)command {
  [self shareInternal:command
          withOptions:@{
                        kShareOptionMessage: [command.arguments objectAtIndex:0],
                        kShareOptionSubject: [command.arguments objectAtIndex:1],
                        kShareOptionFiles: [command.arguments objectAtIndex:2],
                        kShareOptionUrl: [command.arguments objectAtIndex:3],
                        kShareOptionIPadCoordinates: [command.arguments objectAtIndex:4]
                      }
    isBooleanResponse:YES
];
}

- (void)shareWithOptions:(CDVInvokedUrlCommand*)command {
  NSDictionary* options = [command.arguments objectAtIndex:0];
  [self shareInternal:command
          withOptions:options
    isBooleanResponse:NO
   ];
}

- (void)shareInternal:(CDVInvokedUrlCommand*)command withOptions:(NSDictionary*)options isBooleanResponse:(BOOL)boolResponse {
  [self.commandDelegate runInBackground:^{ //avoid main thread block  especially if sharing big files from url
    if (!NSClassFromString(@"UIActivityViewController")) {
      CDVPluginResult * pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"not available"];
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
      return;
    }

    NSString *message   = options[kShareOptionMessage];
    NSString *subject   = options[kShareOptionSubject];
    NSArray  *filenames = options[kShareOptionFiles];
    NSString *urlString = options[kShareOptionUrl];
    NSString *iPadCoordString = options[kShareOptionIPadCoordinates];
    NSArray *iPadCoordinates;

    if (iPadCoordString != nil && iPadCoordString != [NSNull null]) {
      iPadCoordinates = [iPadCoordString componentsSeparatedByString:@","];
    } else {
      iPadCoordinates = @[];
    }


    NSMutableArray *activityItems = [[NSMutableArray alloc] init];

    if (message != (id)[NSNull null] && message != nil) {
    [activityItems addObject:message];
    }

    if (filenames != (id)[NSNull null] && filenames != nil && filenames.count > 0) {
      NSMutableArray *files = [[NSMutableArray alloc] init];
      for (NSString* filename in filenames) {
        NSObject *file = [self getImage:filename];
        if (file == nil) {
          file = [self getFile:filename];
        }
        if (file != nil) {
          [files addObject:file];
        }
      }
      [activityItems addObjectsFromArray:files];
    }

    if (urlString != (id)[NSNull null] && urlString != nil) {
        [activityItems addObject:[NSURL URLWithString:[urlString SSURLEncodedString]]];
    }

    UIActivity *activity = [[UIActivity alloc] init];
    NSArray *applicationActivities = [[NSArray alloc] initWithObjects:activity, nil];
    UIActivityViewController *activityVC = [[UIActivityViewController alloc] initWithActivityItems:activityItems applicationActivities:applicationActivities];
    if (subject != (id)[NSNull null] && subject != nil) {
      [activityVC setValue:subject forKey:@"subject"];
    }

    if ([activityVC respondsToSelector:(@selector(setCompletionWithItemsHandler:))]) {
      [activityVC setCompletionWithItemsHandler:^(NSString *activityType, BOOL completed, NSArray * returnedItems, NSError * activityError) {
        [self cleanupStoredFiles];
        if (boolResponse) {
          [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:completed]
                                      callbackId:command.callbackId];
        } else {
          NSDictionary * result = @{@"completed":@(completed), @"app":activityType == nil ? @"" : activityType};
          [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:result]
                                      callbackId:command.callbackId];
        }
      }];
    } else {
      // let's suppress this warning otherwise folks will start opening issues while it's not relevant
#pragma GCC diagnostic ignored "-Wdeprecated-declarations"
        [activityVC setCompletionHandler:^(NSString *activityType, BOOL completed) {
          [self cleanupStoredFiles];
          NSDictionary * result = @{@"completed":@(completed), @"app":activityType == nil ? @"" : activityType};
          CDVPluginResult * pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:result];
          [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        }];
#pragma GCC diagnostic warning "-Wdeprecated-declarations"
      }

    NSArray * socialSharingExcludeActivities = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"SocialSharingExcludeActivities"];
    if (socialSharingExcludeActivities!=nil && [socialSharingExcludeActivities count] > 0) {
      activityVC.excludedActivityTypes = socialSharingExcludeActivities;
    }

    dispatch_async(dispatch_get_main_queue(), ^(void){
      // iPad on iOS >= 8 needs a different approach
      if ([UIDevice currentDevice].userInterfaceIdiom == UIUserInterfaceIdiomPad) {
        NSString* iPadCoords = [self getIPadPopupCoordinates];
        if (iPadCoords != nil && ![iPadCoords isEqual:@"-1,-1,-1,-1"]) {
          CGRect rect;
          if ([iPadCoordinates count] == 4) {

            rect = CGRectMake((int) [[iPadCoordinates objectAtIndex:0] integerValue], (int) [[iPadCoordinates objectAtIndex:1] integerValue], (int) [[iPadCoordinates objectAtIndex:2] integerValue], (int) [[iPadCoordinates objectAtIndex:3] integerValue]);
          } else {
            NSArray *comps = [iPadCoords componentsSeparatedByString:@","];
            rect = [self getPopupRectFromIPadPopupCoordinates:comps];
          }
          if ([activityVC respondsToSelector:@selector(popoverPresentationController)]) {
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 80000 // iOS 8.0 supported
            activityVC.popoverPresentationController.sourceView = self.webView;
            activityVC.popoverPresentationController.sourceRect = rect;
#endif
          } else {
            _popover = [[UIPopoverController alloc] initWithContentViewController:activityVC];
            _popover.delegate = self;
            [_popover presentPopoverFromRect:rect inView:self.webView permittedArrowDirections:UIPopoverArrowDirectionAny animated:YES];
          }
        } else if ([activityVC respondsToSelector:@selector(popoverPresentationController)]) {
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 80000 // iOS 8.0 supported
          activityVC.popoverPresentationController.sourceView = self.webView;
          // position the popup at the bottom, just like iOS < 8 did (and iPhone still does on iOS 8)
          CGRect rect;
          if ([iPadCoordinates count] == 4) {
            NSLog([[NSString alloc] initWithFormat:@"test %d", [[iPadCoordinates objectAtIndex:0] integerValue]]);
            rect = CGRectMake((int) [[iPadCoordinates objectAtIndex:0] integerValue], (int) [[iPadCoordinates objectAtIndex:1] integerValue], (int) [[iPadCoordinates objectAtIndex:2] integerValue], (int) [[iPadCoordinates objectAtIndex:3] integerValue]);
          } else {
            NSArray *comps = [NSArray arrayWithObjects:
                               [NSNumber numberWithInt:(self.viewController.view.frame.size.width/2)-200],
                               [NSNumber numberWithInt:self.viewController.view.frame.size.height],
                               [NSNumber numberWithInt:400],
                               [NSNumber numberWithInt:400],
                               nil];
            rect = [self getPopupRectFromIPadPopupCoordinates:comps];
          }
          activityVC.popoverPresentationController.sourceRect = rect;
#endif
        }
      }
      [[self getTopMostViewController] presentViewController:activityVC animated:YES completion:nil];
    });
  }];
}

- (void)shareViaTwitter:(CDVInvokedUrlCommand*)command {
  [self shareViaInternal:command type:SLServiceTypeTwitter];
}

- (void)shareViaFacebook:(CDVInvokedUrlCommand*)command {
  [self shareViaInternal:command type:SLServiceTypeFacebook];
}

- (void)shareViaFacebookWithPasteMessageHint:(CDVInvokedUrlCommand*)command {
  // If Fb app is installed a message is not prefilled.
  // When shared through the default iOS widget (iOS Settings > Facebook) the message is prefilled already.
  NSString *message = [command.arguments objectAtIndex:0];
  if (message != (id)[NSNull null]) {
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 1000 * NSEC_PER_MSEC), dispatch_get_main_queue(), ^{
      BOOL fbAppInstalled = [[UIApplication sharedApplication] canOpenURL:[NSURL URLWithString:@"fb://"]]; // requires whitelisting on iOS9
      if (fbAppInstalled) {
        UIPasteboard *pasteboard = [UIPasteboard generalPasteboard];
        [pasteboard setValue:message forPasteboardType:@"public.utf8-plain-text"];
        NSString *hint = [command.arguments objectAtIndex:4];
        UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"" message:hint delegate:nil cancelButtonTitle:nil otherButtonTitles:nil];
        [alert show];
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 2800 * NSEC_PER_MSEC), dispatch_get_main_queue(), ^{
          [alert dismissWithClickedButtonIndex:-1 animated:YES];
        });
      }
    });
  }
  [self shareViaInternal:command type:SLServiceTypeFacebook];
}

- (void)shareVia:(CDVInvokedUrlCommand*)command {
  [self shareViaInternal:command type:[command.arguments objectAtIndex:4]];
}

- (void)canShareVia:(CDVInvokedUrlCommand*)command {
  NSString *via = [command.arguments objectAtIndex:4];
  CDVPluginResult * pluginResult;
  if ([@"sms" caseInsensitiveCompare:via] == NSOrderedSame && [self canShareViaSMS]) {
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  } else if ([@"email" caseInsensitiveCompare:via] == NSOrderedSame && [self isEmailAvailable]) {
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  } else if ([@"whatsapp" caseInsensitiveCompare:via] == NSOrderedSame && [self canShareViaWhatsApp]) {
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  } else if ([@"instagram" caseInsensitiveCompare:via] == NSOrderedSame && [self canShareViaInstagram]) {
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  } else if ([@"com.apple.social.facebook" caseInsensitiveCompare:via] == NSOrderedSame && [self canShareViaFacebook]) {
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  } else if ([@"com.apple.social.twitter" caseInsensitiveCompare:via] == NSOrderedSame && [self canShareViaTwitter]) {
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  } else if ([self isAvailableForSharing:command type:via]) {
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  } else {
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"not available"];
  }
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)canShareViaEmail:(CDVInvokedUrlCommand*)command {
  if ([self isEmailAvailable]) {
    CDVPluginResult * pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  } else {
    CDVPluginResult * pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"not available"];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }
}

- (bool)isEmailAvailable {
  Class messageClass = (NSClassFromString(@"MFMailComposeViewController"));
  return messageClass != nil && [messageClass canSendMail];
}

- (bool)isAvailableForSharing:(CDVInvokedUrlCommand*)command
                         type:(NSString *) type {

  // isAvailableForServiceType returns true if you pass it a type that is not
  // in the defined constants, this is probably a bug on apples part
  if(!([type isEqualToString:SLServiceTypeFacebook]
       || [type isEqualToString:SLServiceTypeTwitter]
       || [type isEqualToString:SLServiceTypeTencentWeibo]
       || [type isEqualToString:SLServiceTypeSinaWeibo])) {
    return false;
  }
  // wrapped in try-catch, because isAvailableForServiceType may crash if an invalid type is passed
  @try {
    return [SLComposeViewController isAvailableForServiceType:type];
  }
  @catch (NSException* exception) {
    return false;
  }
}

- (void)shareViaInternal:(CDVInvokedUrlCommand*)command
                    type:(NSString *) type {

  NSString *message   = [command.arguments objectAtIndex:0];
  // subject is not supported by the SLComposeViewController
  NSArray  *filenames = [command.arguments objectAtIndex:2];
  NSString *urlString = [command.arguments objectAtIndex:3];

  // boldly invoke the target app, because the phone will display a nice message asking to configure the app
  SLComposeViewController *composeViewController = [SLComposeViewController composeViewControllerForServiceType:type];
  if (message != (id)[NSNull null]) {
    [composeViewController setInitialText:message];
  }

  for (NSString* filename in filenames) {
    UIImage* image = [self getImage:filename];
    if (image != nil) {
      [composeViewController addImage:image];
    }
  }

  if (urlString != (id)[NSNull null]) {
    [composeViewController addURL:[NSURL URLWithString:[urlString SSURLEncodedString]]];
  }

  [composeViewController setCompletionHandler:^(SLComposeViewControllerResult result) {
    if (SLComposeViewControllerResultCancelled == result) {
      CDVPluginResult * pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"cancelled"];
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    } else if (SLComposeViewControllerResultDone == result || [self isAvailableForSharing:command type:type]) {
      CDVPluginResult * pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:true];
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    } else {
      CDVPluginResult * pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"not available"];
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }
    // required for iOS6 (issues #162 and #167)
    [self.viewController dismissViewControllerAnimated:YES completion:nil];
  }];
  [[self getTopMostViewController] presentViewController:composeViewController animated:YES completion:nil];
}

- (void)shareViaEmail:(CDVInvokedUrlCommand*)command {
  if ([self isEmailAvailable]) {

    if (TARGET_IPHONE_SIMULATOR && IsAtLeastiOSVersion(@"8.0")) {
      UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"SocialSharing plugin"
                                                      message:@"Sharing via email is not supported on the iOS 8 simulator."
                                                     delegate:nil
                                            cancelButtonTitle:@"OK"
                                            otherButtonTitles:nil];
      [alert show];
      return;
    }

    [self cycleTheGlobalMailComposer];

    self.globalMailComposer.mailComposeDelegate = self;

    if ([command.arguments objectAtIndex:0] != (id)[NSNull null]) {
      NSString *message = [command.arguments objectAtIndex:0];
      BOOL isHTML = [message rangeOfString:@"<[^>]+>" options:NSRegularExpressionSearch].location != NSNotFound;
      [self.globalMailComposer setMessageBody:message isHTML:isHTML];
    }

    if ([command.arguments objectAtIndex:1] != (id)[NSNull null]) {
      [self.globalMailComposer setSubject: [command.arguments objectAtIndex:1]];
    }

    if ([command.arguments objectAtIndex:2] != (id)[NSNull null]) {
      [self.globalMailComposer setToRecipients:[command.arguments objectAtIndex:2]];
    }

    if ([command.arguments objectAtIndex:3] != (id)[NSNull null]) {
      [self.globalMailComposer setCcRecipients:[command.arguments objectAtIndex:3]];
    }

    if ([command.arguments objectAtIndex:4] != (id)[NSNull null]) {
      [self.globalMailComposer setBccRecipients:[command.arguments objectAtIndex:4]];
    }

    if ([command.arguments objectAtIndex:5] != (id)[NSNull null]) {
      NSArray* attachments = [command.arguments objectAtIndex:5];
      NSFileManager* fileManager = [NSFileManager defaultManager];
      for (NSString* path in attachments) {
        NSURL *file = [self getFile:path];
        NSData* data = [fileManager contentsAtPath:file.path];

        if (!data) {
          CDVPluginResult * pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"invalid attachment"];
          [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
          return;
        }

        NSString* fileName;
        NSString* mimeType;
        NSString* basename = [self getBasenameFromAttachmentPath:path];

          //Find data anywhere in string
          NSRange rangeData = [basename rangeOfString:@"data:"];
          if (rangeData.location == NSNotFound)
          {
              fileName = [basename pathComponents].lastObject;
              mimeType = [self getMimeTypeFromFileExtension:[basename pathExtension]];
          }
          else
          {
              mimeType = (NSString*)[[[basename substringFromIndex:rangeData.location+rangeData.length] componentsSeparatedByString: @";"] objectAtIndex:0];

              //Find df anywhere in string
              NSRange rangeDF = [basename rangeOfString:@"df:"];
              //If not found fallback to default name
              if (rangeDF.location == NSNotFound) {
                  fileName = @"attachment.";
                  fileName = [fileName stringByAppendingString:(NSString*)[[mimeType componentsSeparatedByString: @"/"] lastObject]];
              } else {
                  //Found, apply name
                  fileName = (NSString*)[[[basename substringFromIndex:rangeDF.location+rangeDF.length] componentsSeparatedByString: @";"] objectAtIndex:0];
              }


              NSString *base64content = (NSString*)[[basename componentsSeparatedByString: @","] lastObject];
              data = [SocialSharing dataFromBase64String:base64content];
          }
          [self.globalMailComposer addAttachmentData:data mimeType:mimeType fileName:fileName];
      }
    }

    // remember the command, because we need it in the didFinishWithResult method
    _command = command;

    dispatch_async(dispatch_get_main_queue(), ^{
      [[self getTopMostViewController] presentViewController:self.globalMailComposer animated:YES completion:nil];
    });
  } else {
    CDVPluginResult * pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"not available"];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }
}

- (UIViewController*) getTopMostViewController {
  UIViewController *presentingViewController = [[UIApplication sharedApplication] keyWindow].rootViewController;
  while (presentingViewController.presentedViewController != nil) {
    presentingViewController = presentingViewController.presentedViewController;
  }
  return presentingViewController;
}

- (NSString*) getBasenameFromAttachmentPath:(NSString*)path {
  if ([path hasPrefix:@"base64:"]) {
    NSString* pathWithoutPrefix = [path stringByReplacingOccurrencesOfString:@"base64:" withString:@""];
    return [pathWithoutPrefix substringToIndex:[pathWithoutPrefix rangeOfString:@"//"].location];
  }
  return [path componentsSeparatedByString: @"?"][0];
}

- (NSString*) getMimeTypeFromFileExtension:(NSString*)extension {
  if (!extension) {
    return nil;
  }
  // Get the UTI from the file's extension
  CFStringRef ext = (CFStringRef)CFBridgingRetain(extension);
  CFStringRef type = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension, ext, NULL);
  // Converting UTI to a mime type
  NSString *result = (NSString*)CFBridgingRelease(UTTypeCopyPreferredTagWithClass(type, kUTTagClassMIMEType));
  CFRelease(ext);
  CFRelease(type);
  if (result == nil) {
    result = @"application/octet-stream";
  }

  return result;
}

/**
 * Delegate will be called after the mail composer did finish an action
 * to dismiss the view.
 */
- (void) mailComposeController:(MFMailComposeViewController*)controller
           didFinishWithResult:(MFMailComposeResult)result
                         error:(NSError*)error {
  bool ok = result == MFMailComposeResultSent;
  [self.globalMailComposer dismissViewControllerAnimated:YES completion:nil];
  CDVPluginResult * pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:ok];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:_command.callbackId];
}

-(void)cycleTheGlobalMailComposer {
  // we are cycling the damned GlobalMailComposer: http://stackoverflow.com/questions/25604552/i-have-real-misunderstanding-with-mfmailcomposeviewcontroller-in-swift-ios8-in/25604976#25604976
  self.globalMailComposer = nil;
  self.globalMailComposer = [[MFMailComposeViewController alloc] init];
}

- (bool)canShareViaSMS {
  Class messageClass = (NSClassFromString(@"MFMessageComposeViewController"));
  return messageClass != nil && [messageClass canSendText];
}

- (void)shareViaSMS:(CDVInvokedUrlCommand*)command {
  if ([self canShareViaSMS]) {
    NSDictionary* options = [command.arguments objectAtIndex:0];
    NSString *phonenumbers = [command.arguments objectAtIndex:1];
    NSString *message = [options objectForKey:@"message"];
    NSString *subject = [options objectForKey:@"subject"];
    NSString *image = [options objectForKey:@"image"];

    MFMessageComposeViewController *picker = [[MFMessageComposeViewController alloc] init];
    picker.messageComposeDelegate = (id) self;
    if (message != (id)[NSNull null]) {
      picker.body = message;
    }
    if (subject != (id)[NSNull null]) {
      [picker setSubject:subject];
    }
    if (image != nil && image != (id)[NSNull null]) {
      BOOL canSendAttachments = [[MFMessageComposeViewController class] respondsToSelector:@selector(canSendAttachments)];
      if (canSendAttachments) {
        NSURL *file = [self getFile:image];
        if (file != nil) {
          [picker addAttachmentURL:file withAlternateFilename:nil];
        }
      }
    }

    if (phonenumbers != (id)[NSNull null]) {
      [picker setRecipients:[phonenumbers componentsSeparatedByString:@","]];
    }
    // remember the command, because we need it in the didFinishWithResult method
    _command = command;
    dispatch_async(dispatch_get_main_queue(), ^{
      picker.modalTransitionStyle = UIModalTransitionStyleCrossDissolve;
      [[self getTopMostViewController] presentViewController:picker animated:NO completion:nil];
    });
  } else {
    CDVPluginResult * pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"not available"];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }
}

// Dismisses the SMS composition interface when users taps Cancel or Send
- (void)messageComposeViewController:(MFMessageComposeViewController *)controller didFinishWithResult:(MessageComposeResult)result {
  bool ok = result == MessageComposeResultSent;
  [[self getTopMostViewController] dismissViewControllerAnimated:YES completion:nil];
  CDVPluginResult * pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:ok];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:_command.callbackId];
}

- (bool)canShareViaInstagram {
  return [[UIApplication sharedApplication] canOpenURL: [NSURL URLWithString:@"instagram://app"]]; // requires whitelisting on iOS9
}

- (bool)canShareViaWhatsApp {
  return [[UIApplication sharedApplication] canOpenURL: [NSURL URLWithString:@"whatsapp://app"]]; // requires whitelisting on iOS9
}

- (bool)canShareViaFacebook {
  return [[UIApplication sharedApplication] canOpenURL: [NSURL URLWithString:@"fb://"]]; // requires whitelisting on iOS9
}

- (bool)canShareViaTwitter {
  return [[UIApplication sharedApplication] canOpenURL: [NSURL URLWithString:@"twitter://"]]; // requires whitelisting on iOS9
}

// this is only an internal test method for now, can be used to open a share sheet with 'Open in xx' links for tumblr, drive, dropbox, ..
- (void)openImage:(NSString *)imageName {
  UIImage* image =[self getImage:imageName];
  if (image != nil) {
    NSString * savePath = [NSHomeDirectory() stringByAppendingPathComponent:@"Documents/myTempImage.jpg"];
    [UIImageJPEGRepresentation(image, 1.0) writeToFile:savePath atomically:YES];
    _documentInteractionController = [UIDocumentInteractionController interactionControllerWithURL:[NSURL fileURLWithPath:savePath]];
    _documentInteractionController.UTI = @""; // TODO find the scheme for google drive and create a shareViaGoogleDrive function
    [_documentInteractionController presentOpenInMenuFromRect:CGRectZero inView:self.viewController.view animated: YES];
  }
}

- (void)shareViaInstagram:(CDVInvokedUrlCommand*)command {

  // on iOS9 canShareVia('instagram'..) will only work if instagram:// is whitelisted.
  // If it's not, this method will ask permission to the user on iOS9 for opening the app,
  // which is of course better than Instagram sharing not working at all because you forgot to whitelist it.
  // Tradeoff: on iOS9 this method will always return true, so make sure to whitelist it and call canShareVia('instagram'..)
  if (!IsAtLeastiOSVersion(@"9.0")) {
    if (![self canShareViaInstagram]) {
      CDVPluginResult * pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"not available"];
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
      return;
    }
  }

  NSString *message   = [command.arguments objectAtIndex:0];
  // subject is not supported by the SLComposeViewController
  NSArray  *filenames = [command.arguments objectAtIndex:2];

  // only use the first image (for now.. maybe we can share in a loop?)
  UIImage* image = nil;
  for (NSString* filename in filenames) {
    image = [self getImage:filename];
    break;
  }

//  NSData *imageObj = [NSData dataFromBase64String:objectAtIndex0];
  NSString *tmpDir = NSTemporaryDirectory();
  NSString *path = [tmpDir stringByAppendingPathComponent:@"instagram.igo"];
  [UIImageJPEGRepresentation(image, 1.0) writeToFile:path atomically:YES];

  _documentInteractionController = [UIDocumentInteractionController interactionControllerWithURL:[NSURL fileURLWithPath:path]];
  _documentInteractionController.delegate = self;
  _documentInteractionController.UTI = @"com.instagram.exclusivegram";

  if (message != (id)[NSNull null]) {
    // no longer working, so ..
    _documentInteractionController.annotation = @{@"InstagramCaption" : message};

    // .. we put the message on the clipboard (you app can prompt the user to paste it)
    UIPasteboard *pasteboard = [UIPasteboard generalPasteboard];
    [pasteboard setValue:message forPasteboardType:@"public.utf8-plain-text"];
  }

  // remember the command for the delegate method
  _command = command;

  // test for #513
  dispatch_async(dispatch_get_main_queue(), ^(void){
    [_documentInteractionController presentOpenInMenuFromRect:CGRectZero inView:self.webView animated:YES];
  });
}

- (void)shareViaWhatsApp:(CDVInvokedUrlCommand*)command {

  // on iOS9 canShareVia('whatsapp'..) will only work if whatsapp:// is whitelisted.
  // If it's not, this method will ask permission to the user on iOS9 for opening the app,
  // which is of course better than WhatsApp sharing not working at all because you forgot to whitelist it.
  // Tradeoff: on iOS9 this method will always return true, so make sure to whitelist it and call canShareVia('whatsapp'..)
  if (!IsAtLeastiOSVersion(@"9.0")) {
    if (![self canShareViaWhatsApp]) {
      CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"not available"];
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
      return;
    }
  }

  NSString *message   = [command.arguments objectAtIndex:0];
  // subject is not supported by the SLComposeViewController
  NSArray *filenames = [command.arguments objectAtIndex:2];
  NSString *urlString = [command.arguments objectAtIndex:3];
  NSString *abid = [command.arguments objectAtIndex:4];
  NSString *phone = [command.arguments objectAtIndex:5];

  // only use the first image (for now.. maybe we can share in a loop?)
  UIImage *image = nil;
  for (NSString *filename in filenames) {
    image = [self getImage:filename];
    break;
  }

  // with WhatsApp, we can share an image OR text+url.. image wins if set
  if (image != nil) {
    NSString *savePath = [NSHomeDirectory() stringByAppendingPathComponent:@"Documents/whatsAppTmp.jpg"];
    [UIImageJPEGRepresentation(image, 1.0) writeToFile:savePath atomically:YES];
    _documentInteractionController = [UIDocumentInteractionController interactionControllerWithURL:[NSURL fileURLWithPath:savePath]];
    _documentInteractionController.UTI = @"net.whatsapp.image";
    _documentInteractionController.delegate = self;
    _command = command;
    [_documentInteractionController presentOpenInMenuFromRect:CGRectZero inView:self.viewController.view animated: YES];
  } else {
    // append an url to a message, if both are passed
    NSString *shareString = @"";
    if (message != (id)[NSNull null]) {
      shareString = message;
    }
    if (urlString != (id)[NSNull null]) {
      if ([shareString isEqual: @""]) {
        shareString = urlString;
      } else {
        shareString = [NSString stringWithFormat:@"%@ %@", shareString, [urlString SSURLEncodedString]];
      }
    }
    NSString *encodedShareString = [shareString stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
    // also encode the '=' character
    encodedShareString = [encodedShareString stringByReplacingOccurrencesOfString:@"=" withString:@"%3D"];
    encodedShareString = [encodedShareString stringByReplacingOccurrencesOfString:@"&" withString:@"%26"];
    NSString *abidString = @"";
    if (abid != (id)[NSNull null]) {
      abidString = [NSString stringWithFormat:@"abid=%@&", abid];
    }
    NSString *phoneString = @"";
    if (phone != (id)[NSNull null]) {
      phoneString = [NSString stringWithFormat:@"phone=%@&", phone];
    }
    NSString *encodedShareStringForWhatsApp = [NSString stringWithFormat:@"whatsapp://send?%@%@text=%@", abidString, phoneString, encodedShareString];

    NSURL *whatsappURL = [NSURL URLWithString:encodedShareStringForWhatsApp];
    [[UIApplication sharedApplication] openURL: whatsappURL];
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }
}

- (void)saveToPhotoAlbum:(CDVInvokedUrlCommand*)command {
  self.command = command;
  NSArray *filenames = [command.arguments objectAtIndex:0];
  [self.commandDelegate runInBackground:^{
    bool shared = false;
    for (NSString* filename in filenames) {
      UIImage* image = [self getImage:filename];
      if (image != nil) {
        shared = true;
        UIImageWriteToSavedPhotosAlbum(image, self, @selector(thisImage:wasSavedToPhotoAlbumWithError:contextInfo:), nil);
      }
    }
    if (!shared) {
      CDVPluginResult * pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"no valid image was passed"];
      [self.commandDelegate sendPluginResult:pluginResult callbackId:self.command.callbackId];
    }
  }];
}

// called from saveToPhotoAlbum, note that we only send feedback for the first image that's being saved (not keeping the callback)
// but since the UIImageWriteToSavedPhotosAlbum function is only called with valid images that should not be a problem
- (void)thisImage:(UIImage *)image wasSavedToPhotoAlbumWithError:(NSError *)error contextInfo:(void*)ctxInfo {
  if (error) {
    CDVPluginResult * pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error.localizedDescription];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:self.command.callbackId];
  } else {
    CDVPluginResult * pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:self.command.callbackId];
  }
}

-(UIImage*)getImage: (NSString *)imageName {
  UIImage *image = nil;
  if (imageName != (id)[NSNull null]) {
    if ([imageName hasPrefix:@"http"]) {
      image = [UIImage imageWithData:[NSData dataWithContentsOfURL:[NSURL URLWithString:imageName]]];
    } else if ([imageName hasPrefix:@"www/"]) {
      image = [UIImage imageNamed:imageName];
    } else if ([imageName hasPrefix:@"file://"]) {
      image = [UIImage imageWithData:[NSData dataWithContentsOfFile:[[NSURL URLWithString:imageName] path]]];
    } else if ([imageName hasPrefix:@"data:"]) {
      // using a base64 encoded string
      NSURL *imageURL = [NSURL URLWithString:imageName];
      NSData *imageData = [NSData dataWithContentsOfURL:imageURL];
      image = [UIImage imageWithData:imageData];
    } else if ([imageName hasPrefix:@"assets-library://"]) {
      // use assets-library
      NSURL *imageURL = [NSURL URLWithString:imageName];
      NSData *imageData = [NSData dataWithContentsOfURL:imageURL];
      image = [UIImage imageWithData:imageData];
    } else {
      // assume anywhere else, on the local filesystem
      image = [UIImage imageWithData:[NSData dataWithContentsOfFile:imageName]];
    }
  }
  return image;
}

-(NSURL*)getFile: (NSString *)fileName {
  NSURL *file = nil;
  if (fileName != (id)[NSNull null]) {
    NSRange rangeData = [fileName rangeOfString:@"data:"];
    if ([fileName hasPrefix:@"http"]) {
      NSURL *url = [NSURL URLWithString:fileName];
      NSData *fileData = [NSData dataWithContentsOfURL:url];
      NSURLRequest *request = [NSURLRequest requestWithURL: url];
      NSHTTPURLResponse *response;
      [NSURLConnection sendSynchronousRequest: request returningResponse: &response error: nil];
      if ([response respondsToSelector:@selector(allHeaderFields)]) {
        NSDictionary *dictionary = [response allHeaderFields];
        NSLog([dictionary description]);
        NSString *name = dictionary[@"Content-Disposition"];
        if (name == nil){
          NSString *name = (NSString*)[[fileName componentsSeparatedByString: @"/"] lastObject];
          file = [NSURL fileURLWithPath:[self storeInFile:[name componentsSeparatedByString: @"?"][0] fileData:fileData]];
        } else {
          file = [NSURL fileURLWithPath:[self storeInFile:[[name componentsSeparatedByString:@"="] lastObject] fileData:fileData]];
        }
      } else {
	    NSString *name = (NSString*)[[fileName componentsSeparatedByString: @"/"] lastObject];
        file = [NSURL fileURLWithPath:[self storeInFile:[name componentsSeparatedByString: @"?"][0] fileData:fileData]];
	  }
    } else if ([fileName hasPrefix:@"www/"]) {
      NSString *bundlePath = [[NSBundle mainBundle] bundlePath];
      NSString *fullPath = [NSString stringWithFormat:@"%@/%@", bundlePath, fileName];
      file = [NSURL fileURLWithPath:fullPath];
    } else if ([fileName hasPrefix:@"file://"]) {
      // stripping the first 6 chars, because the path should start with / instead of file://
      file = [NSURL fileURLWithPath:[fileName substringFromIndex:6]];
     } else if (rangeData.location != NSNotFound ){
        //If found "data:"
        NSString *fileType  = (NSString*)[[[fileName substringFromIndex:rangeData.location+rangeData.length] componentsSeparatedByString: @";"] objectAtIndex:0];

        NSString* attachmentName;
        //Find df anywhere in string
        NSRange rangeDF = [fileName rangeOfString:@"df:"];
        //If not found fallback to default name
        if (rangeDF.location == NSNotFound) {
            attachmentName = @"attachment.";
            attachmentName = [attachmentName stringByAppendingString:(NSString*)[[fileType componentsSeparatedByString: @"/"] lastObject]];
        } else {
            //Found, apply name
            attachmentName = (NSString*)[[[fileName substringFromIndex:rangeDF.location+rangeDF.length] componentsSeparatedByString: @";"] objectAtIndex:0];
        }


        NSString *base64content = (NSString*)[[fileName componentsSeparatedByString: @","] lastObject];
        NSData* data = [SocialSharing dataFromBase64String:base64content];
        file = [NSURL fileURLWithPath:[self storeInFile:attachmentName fileData:data]];

    } else {
      // assume anywhere else, on the local filesystem
      file = [NSURL fileURLWithPath:fileName];
    }
  }
  return file;
}

-(NSString*) storeInFile: (NSString*) fileName
                fileData: (NSData*) fileData {
  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *documentsDirectory = [paths objectAtIndex:0];
  NSString *filePath = [documentsDirectory stringByAppendingPathComponent:fileName];
  [fileData writeToFile:filePath atomically:YES];
  _tempStoredFile = filePath;
  return filePath;
}

- (void) cleanupStoredFiles {
  if (_tempStoredFile != nil) {
    NSError *error;
    [[NSFileManager defaultManager]removeItemAtPath:_tempStoredFile error:&error];
  }
}

+ (NSData*) dataFromBase64String:(NSString*)aString {
  return [[NSData alloc] initWithBase64EncodedString:aString options:0];
}

#pragma mark - UIPopoverControllerDelegate methods

- (void)popoverController:(UIPopoverController *)popoverController willRepositionPopoverToRect:(inout CGRect *)rect inView:(inout UIView **)view {
  NSArray *comps = [[self getIPadPopupCoordinates] componentsSeparatedByString:@","];
  CGRect newRect = [self getPopupRectFromIPadPopupCoordinates:comps];
  rect->origin = newRect.origin;
}

- (void)popoverControllerDidDismissPopover:(UIPopoverController *)popoverController {
  _popover = nil;
}

#pragma mark - UIDocumentInteractionControllerDelegate methods

- (void) documentInteractionController: (UIDocumentInteractionController *) controller willBeginSendingToApplication: (NSString *) application {
  // note that the application actually contains the app bundle id which was picked (for whatsapp and instagram only)
      NSLog(@"SocialSharing app selected: %@", application);
}

- (void) documentInteractionControllerDidDismissOpenInMenu: (UIDocumentInteractionController *) controller {
  if (self.command != nil) {
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId: self.command.callbackId];
  }
}

@end
