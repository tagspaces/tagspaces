package org.crosswalk.engine;

import org.apache.cordova.CordovaPreferences;
import org.xwalk.core.XWalkPreferences;
import org.xwalk.core.XWalkResourceClient;
import org.xwalk.core.XWalkUIClient;
import org.xwalk.core.XWalkView;

import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.util.AttributeSet;
import android.util.Log;
import android.view.KeyEvent;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CordovaWebViewEngine;

public class XWalkCordovaView extends XWalkView implements CordovaWebViewEngine.EngineView {

    public static final String TAG = "XWalkCordovaView";

    protected XWalkCordovaResourceClient resourceClient;
    protected XWalkCordovaUiClient uiClient;
    protected XWalkWebViewEngine parentEngine;

    private static boolean hasSetStaticPref;
    // This needs to run before the super's constructor.
    private static Context setGlobalPrefs(Context context, CordovaPreferences preferences) {
        if (!hasSetStaticPref) {
            hasSetStaticPref = true;
            ApplicationInfo ai = null;
            try {
                ai = context.getPackageManager().getApplicationInfo(context.getApplicationContext().getPackageName(), PackageManager.GET_META_DATA);
            } catch (PackageManager.NameNotFoundException e) {
                throw new RuntimeException(e);
            }
            boolean prefAnimatable = preferences == null ? false : preferences.getBoolean("CrosswalkAnimatable", false);
            boolean manifestAnimatable = ai.metaData == null ? false : ai.metaData.getBoolean("CrosswalkAnimatable");
            // Selects between a TextureView (obeys framework transforms applied to view) or a SurfaceView (better performance).
            XWalkPreferences.setValue(XWalkPreferences.ANIMATABLE_XWALK_VIEW, prefAnimatable || manifestAnimatable);
            if ((ai.flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
                XWalkPreferences.setValue(XWalkPreferences.REMOTE_DEBUGGING, true);
            }
            XWalkPreferences.setValue(XWalkPreferences.JAVASCRIPT_CAN_OPEN_WINDOW, true);
            XWalkPreferences.setValue(XWalkPreferences.ALLOW_UNIVERSAL_ACCESS_FROM_FILE, true);
        }
        return context;
    }

    public XWalkCordovaView(Context context, CordovaPreferences preferences) {
        super(setGlobalPrefs(context, preferences), (AttributeSet)null);
    }

    public XWalkCordovaView(Context context, AttributeSet attrs) {
        super(setGlobalPrefs(context, null), attrs);
    }

    void init(XWalkWebViewEngine parentEngine) {
        this.parentEngine = parentEngine;
        if (resourceClient == null) {
            setResourceClient(new XWalkCordovaResourceClient(parentEngine));
        }
        if (uiClient == null) {
            setUIClient(new XWalkCordovaUiClient(parentEngine));
        }
    }

    @Override
    public void setResourceClient(XWalkResourceClient client) {
        // XWalk calls this method from its constructor.
        if (client instanceof XWalkCordovaResourceClient) {
            this.resourceClient = (XWalkCordovaResourceClient)client;
        }
        super.setResourceClient(client);
    }

    @Override
    public void setUIClient(XWalkUIClient client) {
        // XWalk calls this method from its constructor.
        if (client instanceof XWalkCordovaUiClient) {
            this.uiClient = (XWalkCordovaUiClient)client;
        }
        super.setUIClient(client);
    }

    // Call CordovaInterface to start activity for result to make sure
    // onActivityResult() callback will be triggered from CordovaActivity correctly.
    // Todo(leonhsl) How to handle |options|?
    @Override
    public void startActivityForResult(Intent intent, int requestCode, Bundle options) {
        parentEngine.cordova.startActivityForResult(new CordovaPlugin() {
            @Override
            public void onActivityResult(int requestCode, int resultCode, Intent intent) {
                // Route to XWalkView.
                Log.i(TAG, "Route onActivityResult() to XWalkView");
                XWalkCordovaView.this.onActivityResult(requestCode, resultCode, intent);
            }
        }, intent, requestCode);
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        Boolean ret = parentEngine.client.onDispatchKeyEvent(event);
        if (ret != null) {
            return ret.booleanValue();
        }
        return super.dispatchKeyEvent(event);
    }

    @Override
    public void pauseTimers() {
        // This is called by XWalkViewInternal.onActivityStateChange().
        // We don't want them paused by default though.
    }

    public void pauseTimersForReal() {
        super.pauseTimers();
    }

    @Override
    public CordovaWebView getCordovaWebView() {
        return parentEngine == null ? null : parentEngine.getCordovaWebView();
    }

    @Override
    public void setBackgroundColor(int color) {
        if (parentEngine != null && parentEngine.isXWalkReady()) {
            super.setBackgroundColor(color);
        }
    }
}
