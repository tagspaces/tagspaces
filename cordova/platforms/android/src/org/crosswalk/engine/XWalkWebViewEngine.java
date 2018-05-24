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

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.content.res.AssetManager;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.Manifest;
import android.util.Log;
import android.view.View;
import android.webkit.ValueCallback;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;

import org.apache.cordova.CordovaBridge;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaPreferences;
import org.apache.cordova.CordovaResourceApi;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CordovaWebViewEngine;
import org.apache.cordova.ICordovaCookieManager;
import org.apache.cordova.NativeToJsMessageQueue;
import org.apache.cordova.PluginEntry;
import org.apache.cordova.PluginManager;
import org.xwalk.core.XWalkActivityDelegate;
import org.xwalk.core.XWalkNavigationHistory;
import org.xwalk.core.XWalkView;
import org.xwalk.core.XWalkGetBitmapCallback;

/**
 * Glue class between CordovaWebView (main Cordova logic) and XWalkCordovaView (the actual View).
 */
public class XWalkWebViewEngine implements CordovaWebViewEngine {

    public static final String TAG = "XWalkWebViewEngine";
    public static final String XWALK_USER_AGENT = "xwalkUserAgent";
    public static final String XWALK_Z_ORDER_ON_TOP = "xwalkZOrderOnTop";

    private static final String XWALK_EXTENSIONS_FOLDER = "xwalk-extensions";

    private static final int PERMISSION_REQUEST_CODE = 100;

    protected final XWalkCordovaView webView;
    protected XWalkCordovaCookieManager cookieManager;
    protected CordovaBridge bridge;
    protected CordovaWebViewEngine.Client client;
    protected CordovaWebView parentWebView;
    protected CordovaInterface cordova;
    protected PluginManager pluginManager;
    protected CordovaResourceApi resourceApi;
    protected NativeToJsMessageQueue nativeToJsMessageQueue;
    protected XWalkActivityDelegate activityDelegate;
    protected String startUrl;
    protected CordovaPreferences preferences;

    /** Used when created via reflection. */
    public XWalkWebViewEngine(Context context, CordovaPreferences preferences) {
        this.preferences = preferences;
        Runnable cancelCommand = new Runnable() {
            @Override
            public void run() {
                cordova.getActivity().finish();
            }
        };
        Runnable completeCommand = new Runnable() {
            @Override
            public void run() {
                cookieManager = new XWalkCordovaCookieManager();

                initWebViewSettings();
                exposeJsInterface(webView, bridge);
                loadExtensions();

                CordovaPlugin notifPlugin = new CordovaPlugin() {
                    @Override
                    public void onNewIntent(Intent intent) {
                        Log.i(TAG, "notifPlugin route onNewIntent() to XWalkView: " + intent.toString());
                        XWalkWebViewEngine.this.webView.onNewIntent(intent);
                    }

                    @Override
                    public Object onMessage(String id, Object data) {
                        if (id.equals("captureXWalkBitmap")) {
                            // Capture bitmap on UI thread.
                            XWalkWebViewEngine.this.cordova.getActivity().runOnUiThread(new Runnable() {
                                public void run() {
                                    XWalkWebViewEngine.this.webView.captureBitmapAsync(
                                            new XWalkGetBitmapCallback() {
                                        @Override
                                        public void onFinishGetBitmap(Bitmap bitmap,
                                                int response) {
                                            pluginManager.postMessage(
                                                    "onGotXWalkBitmap", bitmap);
                                        }
                                    });
                                }
                            });
                        }
                        return null;
                    }
                };
                pluginManager.addService(new PluginEntry("XWalkNotif", notifPlugin));

                // Send the massage of xwalk's ready to plugin.
                if (pluginManager != null) {
                    pluginManager.postMessage("onXWalkReady", this);
                }

                if (startUrl != null) {
                    webView.load(startUrl, null);
                }
            }
        };
        activityDelegate = new XWalkActivityDelegate((Activity) context, cancelCommand, completeCommand);

        webView = new XWalkCordovaView(context, preferences);
    }

    // Use two-phase init so that the control will work with XML layouts.

    @Override
    public void init(CordovaWebView parentWebView, CordovaInterface cordova, CordovaWebViewEngine.Client client,
                     CordovaResourceApi resourceApi, PluginManager pluginManager,
                     NativeToJsMessageQueue nativeToJsMessageQueue) {
        if (this.cordova != null) {
            throw new IllegalStateException();
        }
        this.parentWebView = parentWebView;
        this.cordova = cordova;
        this.client = client;
        this.resourceApi = resourceApi;
        this.pluginManager = pluginManager;
        this.nativeToJsMessageQueue = nativeToJsMessageQueue;

        CordovaPlugin activityDelegatePlugin = new CordovaPlugin() {
            @Override
            public void onResume(boolean multitasking) {
                activityDelegate.onResume();
            }
        };
        pluginManager.addService(new PluginEntry("XWalkActivityDelegate", activityDelegatePlugin));

        webView.init(this);

        nativeToJsMessageQueue.addBridgeMode(new NativeToJsMessageQueue.OnlineEventsBridgeMode(
                new NativeToJsMessageQueue.OnlineEventsBridgeMode.OnlineEventsBridgeModeDelegate() {
            @Override
            public void setNetworkAvailable(boolean value) {
                webView.setNetworkAvailable(value);
            }
            @Override
            public void runOnUiThread(Runnable r) {
                XWalkWebViewEngine.this.cordova.getActivity().runOnUiThread(r);
            }
        }));
        nativeToJsMessageQueue.addBridgeMode(new NativeToJsMessageQueue.EvalBridgeMode(this, cordova));
        bridge = new CordovaBridge(pluginManager, nativeToJsMessageQueue);
    }

    @Override
    public CordovaWebView getCordovaWebView() {
        return parentWebView;
    }

    @Override
    public View getView() {
        return webView;
    }

    private void initWebViewSettings() {
        webView.setVerticalScrollBarEnabled(false);

        boolean zOrderOnTop = preferences == null ? false : preferences.getBoolean(XWALK_Z_ORDER_ON_TOP, false);
        webView.setZOrderOnTop(zOrderOnTop);

        // Set xwalk webview settings by Cordova preferences.
        String xwalkUserAgent = preferences == null ? "" : preferences.getString(XWALK_USER_AGENT, "");
        if (!xwalkUserAgent.isEmpty()) {
            webView.setUserAgentString(xwalkUserAgent);
        }
        
        String appendUserAgent = preferences.getString("AppendUserAgent", "");
        if (!appendUserAgent.isEmpty()) {
            webView.setUserAgentString(webView.getUserAgentString() + " " + appendUserAgent);
        }
        
        if (preferences.contains("BackgroundColor")) {
            int backgroundColor = preferences.getInteger("BackgroundColor", Color.BLACK);
            webView.setBackgroundColor(backgroundColor);
        }
    }

    private static void exposeJsInterface(XWalkView webView, CordovaBridge bridge) {
        XWalkExposedJsApi exposedJsApi = new XWalkExposedJsApi(bridge);
        webView.addJavascriptInterface(exposedJsApi, "_cordovaNative");
    }

    private void loadExtensions() {
        AssetManager assetManager = cordova.getActivity().getAssets();
        String[] extList;
        try {
            Log.i(TAG, "Iterate assets/xwalk-extensions folder");
            extList = assetManager.list(XWALK_EXTENSIONS_FOLDER);
        } catch (IOException e) {
            Log.w(TAG, "Failed to iterate assets/xwalk-extensions folder");
            return;
        }

        for (String path : extList) {
            // Load the extension.
            Log.i(TAG, "Start to load extension: " + path);
            webView.getExtensionManager().loadExtension(XWALK_EXTENSIONS_FOLDER + File.separator + path);
        }
    }

    @Override
    public boolean canGoBack() {
        if (!activityDelegate.isXWalkReady()) return false;
        return this.webView.getNavigationHistory().canGoBack();
    }

    @Override
    public boolean goBack() {
        if (this.webView.getNavigationHistory().canGoBack()) {
            this.webView.getNavigationHistory().navigate(XWalkNavigationHistory.Direction.BACKWARD, 1);
            return true;
        }
        return false;
    }

    @Override
    public void setPaused(boolean value) {
        if (!activityDelegate.isXWalkReady()) return;
        if (value) {
            // TODO: I think this has been fixed upstream and we don't need to override pauseTimers() anymore.
            webView.pauseTimersForReal();
        } else {
            webView.resumeTimers();
        }
    }

    @Override
    public void destroy() {
        if (!activityDelegate.isXWalkReady()) return;
        webView.onDestroy();
    }

    @Override
    public void clearHistory() {
        if (!activityDelegate.isXWalkReady()) return;
        this.webView.getNavigationHistory().clear();
    }

    @Override
    public void stopLoading() {
        if (!activityDelegate.isXWalkReady()) return;
        this.webView.stopLoading();
    }

    @Override
    public void clearCache() {
        if (!activityDelegate.isXWalkReady()) return;
        webView.clearCache(true);
    }

    @Override
    public String getUrl() {
        if (!activityDelegate.isXWalkReady()) return null;
        return this.webView.getUrl();
    }

    @Override
    public ICordovaCookieManager getCookieManager() {
        return cookieManager;
    }

    @Override
    public void loadUrl(String url, boolean clearNavigationStack) {
        if (!activityDelegate.isXWalkReady()) {
            startUrl = url;
            return;
        }
        webView.load(url, null);
    }

    /**
     * This API is used in Cordova-Android 6.0.0 override from
     *
     * CordovaWebViewEngine.java
     * @since Cordova 6.0
     */
    public void evaluateJavascript(String js, ValueCallback<String> callback) {
        webView.evaluateJavascript(js, callback);
    }

    public boolean isXWalkReady() {
        return activityDelegate.isXWalkReady();
    }

    public interface PermissionRequestListener {
        public void onRequestPermissionResult(int requestCode, String[] permissions,
                int[] grantResults);
    }

    public boolean requestPermissionsForFileChooser(final PermissionRequestListener listener) {
        ArrayList<String> dangerous_permissions = new ArrayList<String>();
        try {
            PackageManager packageManager = cordova.getActivity().getPackageManager();
            PackageInfo packageInfo = packageManager.getPackageInfo(
                    cordova.getActivity().getPackageName(), PackageManager.GET_PERMISSIONS);
            for (String permission : packageInfo.requestedPermissions) {
                if (permission.equals(Manifest.permission.WRITE_EXTERNAL_STORAGE)
                        || permission.equals(Manifest.permission.CAMERA)) {
                    dangerous_permissions.add(permission);
                }
            }
        } catch (NameNotFoundException e) {
        }

        if (dangerous_permissions.isEmpty()) {
            return false;
        }

        CordovaPlugin permissionRequestPlugin = new CordovaPlugin() {
            @Override
            public void onRequestPermissionResult(int requestCode, String[] permissions,
                    int[] grantResults) {
                if (requestCode != PERMISSION_REQUEST_CODE) return;
                listener.onRequestPermissionResult(requestCode, permissions, grantResults);
            }
        };
        try {
            cordova.requestPermissions(permissionRequestPlugin, PERMISSION_REQUEST_CODE,
                    dangerous_permissions.toArray(new String[dangerous_permissions.size()]));
        } catch (NoSuchMethodError e) {
            return false;
        }
        return true;
    }
}
