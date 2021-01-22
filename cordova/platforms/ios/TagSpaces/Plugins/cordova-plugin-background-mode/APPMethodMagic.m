/*
  Copyright 2013-2017 appPlant GmbH

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

/**
 * Code extracted from
 * - http://defagos.github.io/yet_another_article_about_method_swizzling/
 * - https://gist.github.com/defagos/1312fec96b48540efa5c
 */

#import "APPMethodMagic.h"
#import <objc/runtime.h>
#import <objc/message.h>

/**
 * Swizzle class method specified by class and selector
 * through the provided method implementation.
 *
 * @param [ Class ] clazz The class containing the method.
 * @param [ SEL ] selector The selector of the method.
 * @param [ IMP ] newImpl The new implementation of the method.
 *
 * @return [ IMP ] The previous implementation of the method.
 */
IMP class_swizzleClassSelector(Class clazz, SEL selector, IMP newImpl)
{
    return class_swizzleSelector(object_getClass(clazz), selector, newImpl);
}

/**
 * Swizzle class method specified by class and selector
 * through the provided code block.
 *
 * @param [ Class ] clazz The class containing the method.
 * @param [ SEL ] selector The selector of the method.
 * @param [ id ] newImplBlock The new implementation of the method.
 *
 * @return [ IMP ] The previous implementation of the method.
 */
IMP class_swizzleClassSelectorWithBlock(Class clazz, SEL selector, id newImplBlock)
{
    IMP newImpl = imp_implementationWithBlock(newImplBlock);
    return class_swizzleClassSelector(clazz, selector, newImpl);
}

/**
 * Swizzle method specified by class and selector
 * through the provided code block.
 *
 * @param [ Class ] clazz The class containing the method.
 * @param [ SEL ] selector The selector of the method.
 * @param [ id ] newImplBlock The new implementation of the method.
 *
 * @return [ IMP ] The previous implementation of the method.
 */
IMP class_swizzleSelectorWithBlock(Class clazz, SEL selector, id newImplBlock)
{
    IMP newImpl = imp_implementationWithBlock(newImplBlock);
    return class_swizzleSelector(clazz, selector, newImpl);
}

/**
 * Swizzle method specified by class and selector
 * through the provided method implementation.
 *
 * @param [ Class ] clazz The class containing the method.
 * @param [ SEL ] selector The selector of the method.
 * @param [ IMP ] newImpl The new implementation of the method.
 *
 * @return [ IMP ] The previous implementation of the method.
 */
IMP class_swizzleSelector(Class clazz, SEL selector, IMP newImpl)
{
    Method method     = class_getInstanceMethod(clazz, selector);
    const char *types = method_getTypeEncoding(method);

    class_addMethod(clazz, selector, imp_implementationWithBlock(^(__unsafe_unretained id self, va_list argp) {
        struct objc_super super = {
            .receiver = self,
            .super_class = class_getSuperclass(clazz)
        };

        id (*objc_msgSendSuper_typed)(struct objc_super*, SEL, va_list) = (void*)&objc_msgSendSuper;
        return objc_msgSendSuper_typed(&super, selector, argp);
    }), types);

    return class_replaceMethod(clazz, selector, newImpl, types);
}
