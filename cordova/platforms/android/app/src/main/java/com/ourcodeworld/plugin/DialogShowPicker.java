package com.ourcodeworld.plugins.filebrowser;

import android.app.Activity;
import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.provider.DocumentsContract;

import org.json.JSONArray;

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
                    jsonArray.put(uriToPath(clip.getItemAt(i).getUri()));
                }
            } else if (data.getData() != null) {
                jsonArray.put(uriToPath(data.getData()));
            }
        }

        Intent intent = new Intent();
        intent.putExtra("information", jsonArray.toString());
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        setResult(Activity.RESULT_OK, intent);
        finish();
    }

    /**
     * Converts a SAF content URI back to a plain file system path where possible.
     * Falls back to the URI string for URIs that cannot be mapped.
     */
    private String uriToPath(Uri uri) {
        if (uri == null) return "";

        if ("file".equals(uri.getScheme())) {
            return uri.getPath();
        }

        if ("content".equals(uri.getScheme())) {
            String authority = uri.getAuthority();

            if ("com.android.externalstorage.documents".equals(authority)) {
                String docId;
                // Tree URIs come from ACTION_OPEN_DOCUMENT_TREE
                if (uri.getPathSegments().contains("tree")) {
                    docId = DocumentsContract.getTreeDocumentId(uri);
                } else {
                    docId = DocumentsContract.getDocumentId(uri);
                }
                return docIdToPath(docId);
            }
        }

        return uri.toString();
    }

    /**
     * Converts a DocumentsContract document ID (e.g. "primary:Pictures") to an absolute path.
     */
    private String docIdToPath(String docId) {
        if (docId == null) return "";
        String[] parts = docId.split(":", 2);
        if (parts.length < 2) return docId;
        String storageType = parts[0];
        String relativePath = parts[1];
        if ("primary".equalsIgnoreCase(storageType)) {
            return Environment.getExternalStorageDirectory().getAbsolutePath()
                    + (relativePath.isEmpty() ? "" : "/" + relativePath);
        }
        // Removable storage (SD card)
        return "/storage/" + storageType + (relativePath.isEmpty() ? "" : "/" + relativePath);
    }
}
