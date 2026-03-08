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

#import <Cordova/CDVSettingsDictionary.h>

@interface CDVSettingsDictionary () {
    // Ideally this should not be mutable, but we've got legacy API that allows
    // plugins to set values in here, so this is the world we have to live in
    NSMutableDictionary *_dict;
}
@end

@implementation CDVSettingsDictionary

- (instancetype)init
{
    return [self initWithDictionary:@{}];
}

- (instancetype)initWithDictionary:(NSDictionary *)dict
{
    self = [super init];
    if (self != nil) {
        if ([dict isKindOfClass:[NSMutableDictionary class]]) {
            _dict = (NSMutableDictionary *)dict;
        } else {
            _dict = [NSMutableDictionary dictionaryWithDictionary:dict];
        }
    }
    return self;
}

- (instancetype)initWithObjects:(const id _Nonnull [ _Nullable ])objects forKeys:(const id <NSCopying> _Nonnull [ _Nullable ])keys count:(NSUInteger)cnt
{
    self = [self init];
    if (self != nil) {
        _dict = [NSMutableDictionary dictionaryWithObjects:objects forKeys:keys count:cnt];
    }
    return self;
}

- (instancetype)initWithCoder:(NSCoder *)coder
{
    NSMutableDictionary *dict = [[NSMutableDictionary alloc] initWithCoder:coder];

    if (dict != nil) {
        self = [self initWithDictionary:dict];
    } else {
        self = [self initWithDictionary:@{}];
    }
    return self;
}

+ (BOOL)supportsSecureCoding
{
    return YES;
}

- (Class)classForCoder
{
    return [self class];
}

- (id)forwardingTargetForSelector:(SEL)selector
{
    return _dict;
}

- (NSUInteger)count
{
    return _dict.count;
}

- (id)objectForKey:(NSString *)key
{
    return [_dict objectForKey:[key lowercaseString]];
}

- (NSEnumerator *)keyEnumerator
{
    return [_dict keyEnumerator];
}

- (id)cordovaSettingForKey:(NSString *)key
{
    return [self objectForKey:key];
}

- (BOOL)cordovaBoolSettingForKey:(NSString *)key defaultValue:(BOOL)defaultValue
{
    BOOL value = defaultValue;

    id prefObj = [self objectForKey:key];
    if (prefObj == nil) {
#ifdef DEBUG
        NSLog(@"The preference key \"%@\" is not defined and will default to \"%@\"", key, (defaultValue ? @"TRUE" : @"FALSE"));
#endif
        return value;
    }

    if ([prefObj isKindOfClass:NSString.class]) {
        prefObj = [prefObj lowercaseString];

        if ([prefObj isEqualToString:@"true"] || [prefObj isEqualToString:@"1"] || [prefObj isEqualToString:@"yes"]) {
            return YES;
        } else if ([prefObj isEqualToString:@"false"] || [prefObj isEqualToString:@"0"] || [prefObj isEqualToString:@"no"]) {
            return NO;
        }
    } else if ([prefObj isKindOfClass:NSNumber.class] && ([prefObj isEqual:@YES] || [prefObj isEqual:@NO])) {
        return [prefObj isEqual:@YES];
    }

    return value;
}

- (CGFloat)cordovaFloatSettingForKey:(NSString *)key defaultValue:(CGFloat)defaultValue
{
    CGFloat value = defaultValue;

    id prefObj = [self objectForKey:key];
    if (prefObj != nil) {
        value = [prefObj floatValue];
    }

    return value;
}

- (void)setObject:(id)value forKey:(NSString *)key
{
    [_dict setObject:value forKey:[key lowercaseString]];
}

- (void)setObject:(id)value forKeyedSubscript:(NSString *)key
{
    [_dict setObject:value forKey:[key lowercaseString]];
}

- (void)setCordovaSetting:(id)value forKey:(NSString *)key
{
    [self setObject:value forKey:key];
}

@end
