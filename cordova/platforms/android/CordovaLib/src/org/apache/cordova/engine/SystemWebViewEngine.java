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

package org.apache.cordova.engine;

import android.annotation.SuppressLint;
import android.annotation.TargetApi;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.ApplicationInfo;
import android.os.Build;
import android.view.View;
import android.webkit.ValueCallback;
import android.webkit.WebSettings;
import android.webkit.WebSettings.LayoutAlgorithm;
import android.webkit.WebView;

import org.apache.cordova.CordovaBridge;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPreferences;
import org.apache.cordova.CordovaResourceApi;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CordovaWebViewEngine;
import org.apache.cordova.ICordovaCookieManager;
import org.apache.cordova.LOG;
import org.apache.cordova.NativeToJsMessageQueue;
import org.apache.cordova.PluginManager;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;


/**
 * Glue class between CordovaWebView (main Cordova logic) and SystemWebView (the actual View).
 * We make the Engine separate from the actual View so that:
 *  A) We don't need to worry about WebView methods clashing with CordovaWebViewEngine methods
 *     (e.g.: goBack() is void for WebView, and boolean for CordovaWebViewEngine)
 *  B) Separating the actual View from the Engine makes API surfaces smaller.
 * Class uses two-phase initialization. However, CordovaWebView is responsible for calling .init().
 */
public class SystemWebViewEngine implements CordovaWebViewEngine {
    public static final String TAG = "SystemWebViewEngine";

    protected final SystemWebView webView;
    protected final SystemCookieManager cookieManager;
    protected CordovaPreferences preferences;
    protected CordovaBridge bridge;
    protected CordovaWebViewEngine.Client client;
    protected CordovaWebView parentWebView;
    protected CordovaInterface cordova;
    protected PluginManager pluginManager;
    protected CordovaResourceApi resourceApi;
    protected NativeToJsMessageQueue nativeToJsMessageQueue;
    private BroadcastReceiver receiver;

    /** Used when created via reflection. */
    public SystemWebViewEngine(Context context, CordovaPreferences preferences) {
        this(new SystemWebView(context), preferences);
    }

    public SystemWebViewEngine(SystemWebView webView) {
        this(webView, null);
    }

    public SystemWebViewEngine(SystemWebView webView, CordovaPreferences preferences) {
        this.preferences = preferences;
        this.webView = webView;
        cookieManager = new SystemCookieManager(webView);
    }

    @Override
    public void init(CordovaWebView parentWebView, CordovaInterface cordova, CordovaWebViewEngine.Client client,
              CordovaResourceApi resourceApi, PluginManager pluginManager,
              NativeToJsMessageQueue nativeToJsMessageQueue) {
        if (this.cordova != null) {
            throw new IllegalStateException();
        }
        // Needed when prefs are not passed by the constructor
        if (preferences == null) {
            preferences = parentWebView.getPreferences();
        }
        this.parentWebView = parentWebView;
        this.cordova = cordova;
        this.client = client;
        this.resourceApi = resourceApi;
        this.pluginManager = pluginManager;
        this.nativeToJsMessageQueue = nativeToJsMessageQueue;
        webView.init(this, cordova);

        initWebViewSettings();

        nativeToJsMessageQueue.addBridgeMode(new NativeToJsMessageQueue.OnlineEventsBridgeMode(new NativeToJsMessageQueue.OnlineEventsBridgeMode.OnlineEventsBridgeModeDelegate() {
            @Override
            public void setNetworkAvailable(boolean value) {
                //sometimes this can be called after calling webview.destroy() on destroy()
                //thus resulting in a NullPointerException
                if(webView!=null) {
                   webView.setNetworkAvailable(value);
                }
            }
            @Override
            public void runOnUiThread(Runnable r) {
                SystemWebViewEngine.this.cordova.getActivity().runOnUiThread(r);
            }
        }));
        nativeToJsMessageQueue.addBridgeMode(new NativeToJsMessageQueue.EvalBridgeMode(this, cordova));
        bridge = new CordovaBridge(pluginManager, nativeToJsMessageQueue);
        exposeJsInterface(webView, bridge);
    }

    @Override
    public CordovaWebView getCordovaWebView() {
        return parentWebView;
    }

    @Override
    public ICordovaCookieManager getCookieManager() {
        return cookieManager;
    }

    @Override
    public View getView() {
        return webView;
    }

    @SuppressLint({"NewApi", "SetJavaScriptEnabled"})
    @SuppressWarnings("deprecation")
    private void initWebViewSettings() {
        webView.setInitialScale(0);
        webView.setVerticalScrollBarEnabled(false);
        // Enable JavaScript
        final WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setLayoutAlgorithm(LayoutAlgorithm.NORMAL);

        /**
         * https://developer.android.com/reference/android/webkit/WebSettings#setAllowFileAccess(boolean)
         * 
         * SDK >= 30 has recently set this value to false by default.
         * It is recommended to turn off this settings To prevent possible security issues targeting Build.VERSION_CODES.Q and earlier.
         * For existing functionality, this setting is set to true. In a future release, this should be defaulted to false.
         */
        settings.setAllowFileAccess(true);

        String manufacturer = android.os.Build.MANUFACTURER;
        LOG.d(TAG, "CordovaWebView is running on device made by: " + manufacturer);

        //We don't save any form data in the application
        settings.setSaveFormData(false);
        settings.setSavePassword(false);

        // Jellybean rightfully tried to lock this down. Too bad they didn't give us a whitelist
        // while we do this
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setMediaPlaybackRequiresUserGesture(false);

        // Enable database
        // We keep this disabled because we use or shim to get around DOM_EXCEPTION_ERROR_16
        String databasePath = webView.getContext().getApplicationContext().getDir("database", Context.MODE_PRIVATE).getPath();
        settings.setDatabaseEnabled(true);
        settings.setDatabasePath(databasePath);


        //Determine whether we're in debug or release mode, and turn on Debugging!
        ApplicationInfo appInfo = webView.getContext().getApplicationContext().getApplicationInfo();
        if ((appInfo.flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
            enableRemoteDebugging();
        }

        settings.setGeolocationDatabasePath(databasePath);

        // Enable DOM storage
        settings.setDomStorageEnabled(true);

        // Enable built-in geolocation
        settings.setGeolocationEnabled(true);

        // Enable AppCache
        // Fix for CB-2282
        settings.setAppCacheMaxSize(5 * 1048576);
        settings.setAppCachePath(databasePath);
        settings.setAppCacheEnabled(true);

        // Fix for CB-1405
        // Google issue 4641
        String defaultUserAgent = settings.getUserAgentString();

        // Fix for CB-3360
        String overrideUserAgent = preferences.getString("OverrideUserAgent", null);
        if (overrideUserAgent != null) {
            settings.setUserAgentString(overrideUserAgent);
        } else {
            String appendUserAgent = preferences.getString("AppendUserAgent", null);
            if (appendUserAgent != null) {
                settings.setUserAgentString(defaultUserAgent + " " + appendUserAgent);
            }
        }
        // End CB-3360

        IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction(Intent.ACTION_CONFIGURATION_CHANGED);
        if (this.receiver == null) {
            this.receiver = new BroadcastReceiver() {
                @Override
                public void onReceive(Context context, Intent intent) {
                    settings.getUserAgentString();
                }
            };
            webView.getContext().registerReceiver(this.receiver, intentFilter);
        }
        // end CB-1405
    }

    private void enableRemoteDebugging() {
        try {
            WebView.setWebContentsDebuggingEnabled(true);
        } catch (IllegalArgumentException e) {
            LOG.d(TAG, "You have one job! To turn on Remote Web Debugging! YOU HAVE FAILED! ");
            e.printStackTrace();
        }
    }

    // Yeah, we know. It'd be great if lint was just a little smarter.
    @SuppressLint("AddJavascriptInterface")
    private static void exposeJsInterface(WebView webView, CordovaBridge bridge) {
        SystemExposedJsApi exposedJsApi = new SystemExposedJsApi(bridge);
        webView.addJavascriptInterface(exposedJsApi, "_cordovaNative");
    }


    /**
     * Load the url into the webview.
     */
    @Override
    public void loadUrl(final String url, boolean clearNavigationStack) {
        webView.loadUrl(url);
    }

    @Override
    public String getUrl() {
        return webView.getUrl();
    }

    @Override
    public void stopLoading() {
        webView.stopLoading();
    }

    @Override
    public void clearCache() {
        webView.clearCache(true);
    }

    @Override
    public void clearHistory() {
        webView.clearHistory();
    }

    @Override
    public boolean canGoBack() {
        return webView.canGoBack();
    }

    /**
     * Go to previous page in history.  (We manage our own history)
     *
     * @return true if we went back, false if we are already at top
     */
    @Override
    public boolean goBack() {
        // Check webview first to see if there is a history
        // This is needed to support curPage#diffLink, since they are added to parentEngine's history, but not our history url array (JQMobile behavior)
        if (webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return false;
    }

    @Override
    public void setPaused(boolean value) {
        if (value) {
            webView.onPause();
            webView.pauseTimers();
        } else {
            webView.onResume();
            webView.resumeTimers();
        }
    }

    @Override
    public void destroy() {
        webView.chromeClient.destroyLastDialog();
        webView.destroy();
        // unregister the receiver
        if (receiver != null) {
            try {
                webView.getContext().unregisterReceiver(receiver);
            } catch (Exception e) {
                LOG.e(TAG, "Error unregistering configuration receiver: " + e.getMessage(), e);
            }
        }
    }

    @Override
    public void evaluateJavascript(String js, ValueCallback<String> callback) {
        webView.evaluateJavascript(js, callback);
    }
}
