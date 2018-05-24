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

import android.os.Looper;

import org.apache.cordova.CordovaBridge;
import org.apache.cordova.ExposedJsApi;
import org.json.JSONException;
import org.xwalk.core.JavascriptInterface;

class XWalkExposedJsApi implements ExposedJsApi {
    private final CordovaBridge bridge;

    XWalkExposedJsApi(CordovaBridge bridge) {
        this.bridge = bridge;
    }

    @JavascriptInterface
    public String exec(int bridgeSecret, String service, String action, String callbackId, String arguments) throws JSONException, IllegalAccessException {
        if (Looper.myLooper() == null) {
            Looper.prepare();
        }
        return bridge.jsExec(bridgeSecret, service, action, callbackId, arguments);
    }

    @JavascriptInterface
    public void setNativeToJsBridgeMode(int bridgeSecret, int value) throws IllegalAccessException {
        bridge.jsSetNativeToJsBridgeMode(bridgeSecret, value);
    }

    @JavascriptInterface
    public String retrieveJsMessages(int bridgeSecret, boolean fromOnlineEvent) throws IllegalAccessException {
        return bridge.jsRetrieveJsMessages(bridgeSecret, fromOnlineEvent);
    }
}
