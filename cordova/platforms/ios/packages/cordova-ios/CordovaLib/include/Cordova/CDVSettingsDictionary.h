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
 A dictionary-like interface providing access to the preference settings for a Cordova web view.

 @Metadata {
    @Available(Cordova, introduced: "8.0.0")
 }
 */
@interface CDVSettingsDictionary : NSDictionary

/**
 The number of entries in the dictionary.

 @Metadata {
    @Available(Cordova, introduced: "8.0.0")
 }
 */
@property(readonly) NSUInteger count;

/**
 Initializes a newly allocated dictionary by placing in it the keys and values
 contained in another given dictionary.

 - Parameters:
   - dict: A dictionary containing the keys and values with which to initialize
           the new dictionary.
 - Returns: An initialized dictionary containing the keys and values found in `dict`.

 @Metadata {
    @Available(Cordova, introduced: "8.0.0")
 }
 */
- (instancetype)initWithDictionary:(NSDictionary *)dict NS_DESIGNATED_INITIALIZER;

/**
 Returns the value associated with a given key.

 - Parameters:
   - key:  The key for which to return the corresponding value.
 - Returns:  The value associated with `key`, or `nil` if no value is associated with `key`.

 @Metadata {
    @Available(Cordova, introduced: "8.0.0")
 }
 */
- (id)objectForKey:(NSString *)key;

/**
 Provides an enumerator to access the keys in the dictionary.

 - Returns: An enumerator object that lets you access each key in the dictionary.

 @Metadata {
    @Available(Cordova, introduced: "8.0.0")
 }
 */
- (NSEnumerator *)keyEnumerator;

/**
 Returns the value associated with a given key.

 - Parameters:
   - key:  The key for which to return the corresponding value.
 - Returns:  The value associated with `key`, or `nil` if no value is associated with `key`.

 @Metadata {
    @Available(Cordova, introduced: "8.0.0")
 }
 */
- (id)cordovaSettingForKey:(NSString *)key;

/**
 Returns the boolean value associated with a given key, or the given default
 value if the key is not found.

 - Parameters:
   - key:  The key for which to return the corresponding value.
   - defaultValue: The default value to return if the key is missing.
 - Returns:  The value associated with `key`, or the provided default value.

 @Metadata {
    @Available(Cordova, introduced: "8.0.0")
 }
 */
- (BOOL)cordovaBoolSettingForKey:(NSString *)key defaultValue:(BOOL)defaultValue;

/**
 Returns the floating-point numeric value associated with a given key, or the
 given default value if the key is not found.

 - Parameters:
   - key:  The key for which to return the corresponding value.
   - defaultValue: The default value to return if the key is missing.
 - Returns:  The value associated with `key`, or the provided default value.

 @Metadata {
    @Available(Cordova, introduced: "8.0.0")
 }
 */
- (CGFloat)cordovaFloatSettingForKey:(NSString *)key defaultValue:(CGFloat)defaultValue;

/**
 Adds a preference with the given name and value to the dictionary.

 > Warning: Use of this method is highly discouraged. Preferences should be set
 > and customized by app authors in the Cordova XML configuration file, not
 > changed at runtime by plugins.

 - Parameters:
   - value: The value to be stored with the given key.
   - key: The preference name.

 @Metadata {
    @Available(Cordova, introduced: "8.0.0")
 }
 */
- (void)setObject:(id)value forKey:(NSString *)key;

/**
 Adds a preference with the given name and value to the dictionary.

 You shouldn’t need to call this method directly. Instead, this method is called
 when setting an object for a key using subscripting.

 > Warning: Use of this method is highly discouraged. Preferences should be set
 > and customized by app authors in the Cordova XML configuration file, not
 > changed at runtime by plugins.

 - Parameters:
   - value: The value to be stored with the given key.
   - key: The preference name.

 @Metadata {
    @Available(Cordova, introduced: "8.0.0")
 }
 */
- (void)setObject:(id)value forKeyedSubscript:(NSString *)key;

/**
 Adds a preference with the given name and value to the dictionary.

 > Warning: Use of this method is highly discouraged. Preferences should be set
 > and customized by app authors in the Cordova XML configuration file, not
 > changed at runtime by plugins.

 - Parameters:
   - value: The value to be stored with the given key.
   - key: The preference name.

 @Metadata {
    @Available(Cordova, introduced: "8.0.0")
 }
 */
- (void)setCordovaSetting:(id)value forKey:(NSString *)key;

@end

NS_ASSUME_NONNULL_END
