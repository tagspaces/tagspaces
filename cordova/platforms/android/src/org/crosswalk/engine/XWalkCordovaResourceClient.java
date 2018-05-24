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

import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.net.http.SslError;
import android.webkit.ValueCallback;
import android.webkit.WebResourceResponse;

import org.apache.cordova.CordovaResourceApi;
import org.apache.cordova.CordovaResourceApi.OpenForReadResult;
import org.apache.cordova.LOG;
import org.apache.cordova.PluginManager;
import org.xwalk.core.ClientCertRequest;
import org.xwalk.core.XWalkHttpAuthHandler;
import org.xwalk.core.XWalkResourceClient;
import org.xwalk.core.XWalkView;

import java.io.FileNotFoundException;
import java.io.IOException;

public class XWalkCordovaResourceClient extends XWalkResourceClient {

	private static final String TAG = "XWalkCordovaResourceClient";
    protected XWalkWebViewEngine parentEngine;

    public XWalkCordovaResourceClient(XWalkWebViewEngine parentEngine) {
        super(parentEngine.webView);
        this.parentEngine = parentEngine;
    }

    /**
    * Report an error to the host application. These errors are unrecoverable (i.e. the main resource is unavailable).
    * The errorCode parameter corresponds to one of the ERROR_* constants.
    *
    * @param view          The WebView that is initiating the callback.
    * @param errorCode     The error code corresponding to an ERROR_* value.
    * @param description   A String describing the error.
    * @param failingUrl    The url that failed to load.
    */
    @Override
    public void onReceivedLoadError(XWalkView view, int errorCode, String description,
           String failingUrl) {
        LOG.d(TAG, "CordovaWebViewClient.onReceivedError: Error code=%s Description=%s URL=%s", errorCode, description, failingUrl);

        parentEngine.client.onReceivedError(errorCode, description, failingUrl);
    }

    @Override
    public WebResourceResponse shouldInterceptLoadRequest(XWalkView view, String url) {
        try {
            // Check the against the white-list.
            if (!parentEngine.pluginManager.shouldAllowRequest(url)) {
                LOG.w(TAG, "URL blocked by whitelist: " + url);
                // Results in a 404.
                return new WebResourceResponse("text/plain", "UTF-8", null);
            }

            CordovaResourceApi resourceApi = parentEngine.resourceApi;
            Uri origUri = Uri.parse(url);
            // Allow plugins to intercept WebView requests.
            Uri remappedUri = resourceApi.remapUri(origUri);

            if (!origUri.equals(remappedUri)) {
                OpenForReadResult result = resourceApi.openForRead(remappedUri, true);
                return new WebResourceResponse(result.mimeType, "UTF-8", result.inputStream);
            }
            // If we don't need to special-case the request, let the browser load it.
            return null;
        } catch (IOException e) {
            if (!(e instanceof FileNotFoundException)) {
                LOG.e(TAG, "Error occurred while loading a file (returning a 404).", e);
            }
            // Results in a 404.
            return new WebResourceResponse("text/plain", "UTF-8", null);
        }
    }

    @Override
    public boolean shouldOverrideUrlLoading(XWalkView view, String url) {
        return parentEngine.client.onNavigationAttempt(url);
    }


    /**
    * Notify the host application that an SSL error occurred while loading a
    * resource. The host application must call either callback.onReceiveValue(true)
    * or callback.onReceiveValue(false). Note that the decision may be
    * retained for use in response to future SSL errors. The default behavior
    * is to pop up a dialog.
    */
    @Override
    public void onReceivedSslError(XWalkView view, ValueCallback<Boolean> callback, SslError error) {
        final String packageName = parentEngine.cordova.getActivity().getPackageName();
        final PackageManager pm = parentEngine.cordova.getActivity().getPackageManager();

        ApplicationInfo appInfo;
        try {
            appInfo = pm.getApplicationInfo(packageName, PackageManager.GET_META_DATA);
            if ((appInfo.flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
                // debug = true
                callback.onReceiveValue(true);
            } else {
                // debug = false
                callback.onReceiveValue(false);
            }
        } catch (PackageManager.NameNotFoundException e) {
            // When it doubt, lock it out!
            callback.onReceiveValue(false);
        }
    }

    @Override
    public void onReceivedHttpAuthRequest(XWalkView view, XWalkHttpAuthHandler handler,
            String host, String realm) {
        // Check if there is some plugin which can resolve this auth challenge
        PluginManager pluginManager = parentEngine.pluginManager;
        if (pluginManager != null && pluginManager.onReceivedHttpAuthRequest(
                parentEngine.parentWebView,
                new XWalkCordovaHttpAuthHandler(handler), host, realm)) {
            parentEngine.client.clearLoadTimeoutTimer();
            return;
        }

        // By default handle 401 like we'd normally do!
        super.onReceivedHttpAuthRequest(view, handler, host, realm);
    }

    @Override
    public void onReceivedClientCertRequest(XWalkView view, ClientCertRequest request) {
        // Check if there is some plugin which can resolve this certificate request
        PluginManager pluginManager = parentEngine.pluginManager;
        if (pluginManager != null && pluginManager.onReceivedClientCertRequest(
                parentEngine.parentWebView, new XWalkCordovaClientCertRequest(request))) {
            parentEngine.client.clearLoadTimeoutTimer();
            return;
        }

        super.onReceivedClientCertRequest(view, request);
    }
}
