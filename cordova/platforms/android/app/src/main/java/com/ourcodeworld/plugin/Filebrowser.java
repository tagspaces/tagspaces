package com.ourcodeworld.plugins.filebrowser;

import org.apache.cordova.*;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;
import android.content.Intent;
import android.content.ActivityNotFoundException;

import android.os.Bundle;

public class Filebrowser extends CordovaPlugin {
    private CallbackContext PUBLIC_CALLBACKS = null;

    @Override
    public boolean execute(String action, JSONArray data, CallbackContext callbackContext) throws JSONException {
        PUBLIC_CALLBACKS = callbackContext;
        final JSONObject arg_object = data.getJSONObject(0);
        String startDirectory = arg_object.getString("start_directory");

        try {
            Intent intent = new Intent("com.ourcodeworld.plugins.filebrowser.DialogShowPicker");
            intent.putExtra("action", action);
            intent.putExtra("start_directory", startDirectory);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            cordova.startActivityForResult((CordovaPlugin) this, intent, 0);
        } catch (ActivityNotFoundException e) {
            PluginResult errorResults = new PluginResult(PluginResult.Status.ERROR, "Cannot find activity com.ourcodeworld.plugins.filebrowser.DialogShowPicker");
            errorResults.setKeepCallback(true);
            PUBLIC_CALLBACKS.sendPluginResult(errorResults);
        }

        PluginResult pluginResult = new  PluginResult(PluginResult.Status.NO_RESULT);
        pluginResult.setKeepCallback(true);

        return true;
    }

    @Override
    public void onActivityResult(final int requestCode, final int resultCode, final Intent data) {
        if(resultCode == cordova.getActivity().RESULT_OK){
            Bundle extras = data.getExtras();
            String resultData = extras.getString("information");

            PluginResult resultado = new PluginResult(PluginResult.Status.OK, resultData);
            resultado.setKeepCallback(true);
            PUBLIC_CALLBACKS.sendPluginResult(resultado);
            return;
        }

        super.onActivityResult(requestCode, resultCode, data);
    }
}
