package org.tagspaces.plugins;

import android.content.Intent;
import android.net.Uri;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "IntentHandler")
public class IntentHandlerPlugin extends Plugin {

    @PluginMethod
    public void getIntent(PluginCall call) {
        Intent intent = getActivity().getIntent();
        JSObject result = new JSObject();

        if (intent != null) {
            String action = intent.getAction();
            String type = intent.getType();
            Uri data = intent.getData();

            result.put("action", action != null ? action : "");
            result.put("type", type != null ? type : "");
            result.put("data", data != null ? data.toString() : "");

            // Handle content:// URIs by converting to file path if possible
            if (data != null && "content".equals(data.getScheme())) {
                // For content URIs, pass the URI string — the web layer can handle it
                result.put("uri", data.toString());
            }
        }

        call.resolve(result);
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        super.handleOnNewIntent(intent);

        if (intent != null) {
            String action = intent.getAction();
            Uri data = intent.getData();

            if (Intent.ACTION_VIEW.equals(action) && data != null) {
                JSObject eventData = new JSObject();
                eventData.put("action", action);
                eventData.put("type", intent.getType() != null ? intent.getType() : "");
                eventData.put("data", data.toString());
                notifyListeners("onIntent", eventData, true);
            }
        }
    }
}
