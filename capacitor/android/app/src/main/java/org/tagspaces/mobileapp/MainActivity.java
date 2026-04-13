package org.tagspaces.mobileapp;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import org.tagspaces.plugins.IntentHandlerPlugin;
import org.tagspaces.plugins.StoragePermissionPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(StoragePermissionPlugin.class);
        registerPlugin(IntentHandlerPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
