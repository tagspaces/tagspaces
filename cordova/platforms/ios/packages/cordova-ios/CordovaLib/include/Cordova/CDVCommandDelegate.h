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

#import <Cordova/CDVAvailability.h>
#import <Cordova/CDVInvokedUrlCommand.h>

@class CDVPlugin;
@class CDVPluginResult;
@class CDVSettingsDictionary;

NS_ASSUME_NONNULL_BEGIN

@protocol CDVCommandDelegate <NSObject>

@optional

@property (nonatomic, nullable, copy) NSURL *(^urlTransformer)(NSURL *) CDV_DEPRECATED(8.0.0, "");

@required
/**
 The Cordova preferences for the web view.

 This is a dictionary populated from the preference key/value pairs in the
 Cordova XML configuration file.
 */
@property (nonatomic, readonly) CDVSettingsDictionary* settings;

- (NSString *)pathForResource:(NSString *)resourcepath;

/**
 Returns the CDVPlugin instance of the given plugin name.

 - Parameters:
   - pluginName: The name of the plugin to return.
 - Returns: The ``CDVPlugin`` instance, or `nil` if no plugin instance was
   found with the given name.
 */
- (nullable CDVPlugin *)getCommandInstance:(NSString *)pluginName;

/**
 Sends a plugin result to the web view. This is thread-safe.

 - Parameters:
   - result: The plugin result to send to the web view.
   - callbackId: The ID of the JavaScript callback to invoke.
 */
- (void)sendPluginResult:(CDVPluginResult *)result callbackId:(NSString *)callbackId;

/**
 Evaluates the given JavaScript string in the web view. This is thread-safe.

 - Parameters:
   - js: The string of JavaScript code to run.
 */
- (void)evalJs:(NSString *)js;

/**
 Evaluates the given JavaScript string right away instead of scheduling it on
 the run-loop.

 This is required for dispatching `resign` and `pause` events, but should not
 be used without reason. Without the run-loop delay, alerts used in JS callbacks
 may result in dead-lock. This method must be called from the UI thread.

 - Parameters:
   - js: The string of JavaScript code to run.
   - scheduledOnRunLoop: Whether to schedule the code to run on the run-loop.
 */
- (void)evalJs:(NSString *)js scheduledOnRunLoop:(BOOL)scheduledOnRunLoop;

/**
 Runs the given block on a background thread using a shared thread-pool.

 - Parameters:
   - block: The block to be run.
 */
- (void)runInBackground:(void (^)(void))block;

@end

NS_ASSUME_NONNULL_END
