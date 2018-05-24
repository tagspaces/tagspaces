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
package org.crosswalk.engine;

import org.apache.cordova.ICordovaHttpAuthHandler;
import org.xwalk.core.XWalkHttpAuthHandler;

/**
 * Specifies interface for HTTP auth handler object which is used to handle auth requests and
 * specifying user credentials.
 */
public class XWalkCordovaHttpAuthHandler implements ICordovaHttpAuthHandler {

    private final XWalkHttpAuthHandler handler;

    public XWalkCordovaHttpAuthHandler(XWalkHttpAuthHandler handler) {
        this.handler = handler;
    }

    /**
     * Instructs the XWalkView to cancel the authentication request.
     */
    public void cancel() {
        handler.cancel();
    }

    /**
     * Instructs the XWalkView to proceed with the authentication with the given credentials.
     *
     * @param username
     * @param password
     */
    public void proceed(String username, String password) {
        handler.proceed(username, password);
    }
}
