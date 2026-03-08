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

/**
 Utility class for measuring the time spent on an operation.

 You can use `CDVTimer` to measure named operations, and it will print the
 elapsed time to the application log upon completion of the operation. This
 allows for simple benchmarking of potentially expensive operations like plugin
 loading and initialization.

 At the start of an operation, call ``start:`` with a unique name, then when the
 operation finishes, call ``stop:`` with the same name:

 @TabNavigator {
    @Tab("Swift") {
        ```swift
        CDVTimer.start("ExpensiveOperation")

        doExpensiveOperation();

        CDVTimer.stop("ExpensiveOperation")
        ```
    }
    @Tab("Objective-C") {
        ```objc
        [CDVTimer start:@"ExpensiveOperation"];

        doExpensiveOperation();

        [CDVTimer stop:@"ExpensiveOperation"];
        ```
    }
 }

 @Metadata {
    @Available(Cordova, introduced: "2.7.0")
 }
 */
@interface CDVTimer : NSObject

/**
 Begins measuring elapsed time for the named operation.

 - Parameters:
   - name: A unique name to identify the timed operation.

 @Metadata {
    @Available(Cordova, introduced: "2.7.0")
 }
 */
+ (void)start:(NSString *)name;

/**
 Stops measuring elapsed time for the named operation, and prints the elapsed
 time to the log.

 - Parameters:
   - name: The unique name to identify the timed operation.

 @Metadata {
    @Available(Cordova, introduced: "2.7.0")
 }
 */
+ (void)stop:(NSString *)name;

@end
