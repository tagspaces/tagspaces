package com.ourcodeworld.plugins.filebrowser;

import org.apache.cordova.*;
import android.app.Activity;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import android.content.Intent;
import android.content.Context;
import android.os.Bundle;
import android.net.Uri;
import java.util.Map;
import java.util.ArrayList;
import com.nononsenseapps.filepicker.FilePickerActivity;
import android.os.Environment;
import android.os.Build;
import android.content.ClipData;

public class DialogShowPicker extends Activity{
    static final int FILE_CODE = 1;
    private boolean firstTime = true;
    
    @Override
    public void onStart() {
        super.onStart();

        if(firstTime == true){
            Bundle extras = getIntent().getExtras();

            String action = extras.getString("action");
            String startDirectory = extras.getString("start_directory");

            Context context = getApplicationContext();
            Intent i = new Intent(context, FilePickerActivity.class);
            i.putExtra(FilePickerActivity.EXTRA_ALLOW_CREATE_DIR, true);
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

            // Set start up directory in case it's not the android default
            if(startDirectory.equals("default")){
                i.putExtra(FilePickerActivity.EXTRA_START_PATH, Environment.getExternalStorageDirectory().getPath());
            }else{
                i.putExtra(FilePickerActivity.EXTRA_START_PATH, startDirectory);
            }

            // Start single filepicker
            if (action.equals("showPicker")) {
                i.putExtra(FilePickerActivity.EXTRA_ALLOW_MULTIPLE, false);
                i.putExtra(FilePickerActivity.EXTRA_MODE, FilePickerActivity.MODE_FILE);
            // Start multi filepicker
            }else if(action.equals("showMultiFilepicker")){
                i.putExtra(FilePickerActivity.EXTRA_ALLOW_MULTIPLE, true);
                i.putExtra(FilePickerActivity.EXTRA_MODE, FilePickerActivity.MODE_FILE);
            // Start folder (dir) picker
            }else if(action.equals("showFolderpicker")){
                i.putExtra(FilePickerActivity.EXTRA_ALLOW_MULTIPLE, false);
                i.putExtra(FilePickerActivity.EXTRA_MODE, FilePickerActivity.MODE_DIR);
            // Start multi folder (dir) picker
            }else if(action.equals("showMultiFolderpicker")){
                i.putExtra(FilePickerActivity.EXTRA_ALLOW_MULTIPLE, true);
                i.putExtra(FilePickerActivity.EXTRA_MODE, FilePickerActivity.MODE_DIR);
            }else if(action.equals("showMixedPicker")){
                i.putExtra(FilePickerActivity.EXTRA_ALLOW_MULTIPLE, true);
                i.putExtra(FilePickerActivity.EXTRA_MODE, FilePickerActivity.MODE_FILE_AND_DIR);
            }else if(action.equals("showCreatefile")){
                //i.putExtra(FilePickerActivity.EXTRA_ALLOW_MULTIPLE, true);
                i.putExtra(FilePickerActivity.EXTRA_MODE, FilePickerActivity.MODE_NEW_FILE);
            }

            startActivityForResult(i, FILE_CODE);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        firstTime = false;
        JSONArray jsonArray = new JSONArray();

        // Retrieve file, folders paths
        if (requestCode == FILE_CODE && resultCode == Activity.RESULT_OK) {
            if (data.getBooleanExtra(FilePickerActivity.EXTRA_ALLOW_MULTIPLE, false)) {
                // For JellyBean and above
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
                    ClipData clip = data.getClipData();

                    if (clip != null) {
                        for (int i = 0; i < clip.getItemCount(); i++) {
                            jsonArray.put(clip.getItemAt(i).getUri().toString());
                        }
                    }
                // For Ice Cream Sandwich
                } else {
                    ArrayList<String> paths = data.getStringArrayListExtra
                                (FilePickerActivity.EXTRA_PATHS);

                    if (paths != null) {
                        for (String path: paths) {
                            jsonArray.put(Uri.parse(path).toString());
                        }
                    }
                }

            } else {
                jsonArray.put(data.getData().toString());
            }
        }

        // Send information
        Intent intent = new Intent();
        intent.putExtra("information", jsonArray.toString());
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        setResult(Activity.RESULT_OK, intent);
        finish();
    }
}
