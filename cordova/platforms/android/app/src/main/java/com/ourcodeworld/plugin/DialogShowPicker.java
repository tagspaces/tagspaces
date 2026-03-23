package com.ourcodeworld.plugins.filebrowser;

import org.apache.cordova.*;
import android.app.Activity;
import org.json.JSONArray;
import android.content.Intent;
import android.os.Bundle;
import android.net.Uri;
import android.content.ClipData;

public class DialogShowPicker extends Activity {
    static final int FILE_CODE = 1;
    private boolean firstTime = true;

    @Override
    public void onStart() {
        super.onStart();

        if (firstTime) {
            Bundle extras = getIntent().getExtras();
            String action = extras.getString("action");

            Intent i;

            if (action.equals("showFolderpicker") || action.equals("showMultiFolderpicker")) {
                i = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
                i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
            } else if (action.equals("showCreatefile")) {
                i = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("*/*");
                i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
            } else {
                // showPicker, showMultiFilepicker, showMixedPicker
                i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("*/*");
                i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                if (action.equals("showMultiFilepicker") || action.equals("showMixedPicker")) {
                    i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                }
            }

            startActivityForResult(i, FILE_CODE);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        firstTime = false;
        JSONArray jsonArray = new JSONArray();

        if (requestCode == FILE_CODE && resultCode == Activity.RESULT_OK && data != null) {
            if (data.getClipData() != null) {
                ClipData clip = data.getClipData();
                for (int i = 0; i < clip.getItemCount(); i++) {
                    jsonArray.put(clip.getItemAt(i).getUri().toString());
                }
            } else if (data.getData() != null) {
                jsonArray.put(data.getData().toString());
            }
        }

        Intent intent = new Intent();
        intent.putExtra("information", jsonArray.toString());
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        setResult(Activity.RESULT_OK, intent);
        finish();
    }
}
