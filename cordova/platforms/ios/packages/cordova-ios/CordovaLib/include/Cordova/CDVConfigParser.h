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

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/**
 An object that handles parsing Cordova XML configuration files.

 ## Overview
 The `CDVConfigParser` class provides methods to parse a Cordova XML
 configuration file and then access the resulting configuration data.

 Use ``parseConfigFile:`` to load data from a file path.

 Use ``parseConfigFile:withDelegate:`` if you need to intercept the XML parsing
 and handle the data yourself with an `NSXMLParserDelegate`.

 @Metadata {
    @Available(Cordova, introduced: "2.3.0")
 }
 */
@interface CDVConfigParser : NSObject <NSXMLParserDelegate>

/**
 A dictionary mapping Cordova plugin name keys to the plugin classes that implement them.

 @Metadata {
    @Available(Cordova, introduced: "2.3.0")
 }
 */
@property (nonatomic, readonly, strong) NSMutableDictionary *pluginsDict;

/**
 A dictionary of Cordova preference keys and their values.

 This should not be used directly, you should only use it to initialize a
 ``CDVSettingsDictionary`` object.

 @Metadata {
    @Available(Cordova, introduced: "2.3.0")
 }
 */
@property (nonatomic, readonly, strong) NSMutableDictionary *settings;

/**
 An array of plugin names to load immediately when Cordova initializes.
 
 @Metadata {
    @Available(Cordova, introduced: "2.5.0")
 }
 */
@property (nonatomic, readonly, strong) NSMutableArray *startupPluginNames;

/**
 The path to the HTML page to display when the web view loads.

 @Metadata {
    @Available(Cordova, introduced: "2.4.0")
 }
 */
@property (nonatomic, nullable, readonly, strong) NSString *startPage;

/**
 Parses the given path as a  Cordova XML configuration file.

 If the file could not be loaded or parsed, the resulting ``CDVConfigParser``
 object will have empty values.

 - Parameters:
   - filePath: The file path URL to the configuration file.
 - Returns: A ``CDVConfigParser`` with the parsed result.

 @Metadata {
    @Available(Cordova, introduced: "8.0.0")
 }
 */
+ (instancetype)parseConfigFile:(NSURL *)filePath;

/**
 Parses the given path as a  Cordova XML configuration file using the given delegate.

 - Parameters:
   - filePath: The file path URL to the configuration file.
   - delegate: The delegate to handle the parsed XML data.
 - Returns: Whether the given file was successfully parsed.

 @Metadata {
    @Available(Cordova, introduced: "8.0.0")
 }
 */
+ (BOOL)parseConfigFile:(NSURL *)filePath withDelegate:(id <NSXMLParserDelegate>)delegate;
@end

NS_ASSUME_NONNULL_END
