package com.ourcodeworld.plugins.filebrowser;

import android.app.Activity;
import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.storage.StorageManager;
import android.os.storage.StorageVolume;
import android.provider.DocumentsContract;

import org.json.JSONArray;

import java.io.File;
import java.util.List;

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
     */
    private String uriToPath(Uri uri) {
        if (uri == null) return "";

        if ("file".equals(uri.getScheme())) {
            return uri.getPath();
        }

        if ("content".equals(uri.getScheme())
                && "com.android.externalstorage.documents".equals(uri.getAuthority())) {
            String docId = uri.getPathSegments().contains("tree")
                    ? DocumentsContract.getTreeDocumentId(uri)
                    : DocumentsContract.getDocumentId(uri);
            return docIdToPath(docId);
        }

        return uri.toString();
    }

    /**
     * Converts a document ID like "primary:Pictures" or "XXXX-XXXX:folder" to an absolute path.
     * Uses StorageManager to resolve the actual mount point of removable volumes.
     */
    private String docIdToPath(String docId) {
        if (docId == null) return "";
        String[] parts = docId.split(":", 2);
        if (parts.length < 2) return docId;

        String storageType = parts[0];
        String relativePath = parts[1];

        if ("primary".equalsIgnoreCase(storageType)) {
            String root = Environment.getExternalStorageDirectory().getAbsolutePath();
            return relativePath.isEmpty() ? root : root + "/" + relativePath;
        }

        // Removable storage (SD card, USB stick) — resolve via StorageManager
        String mountPath = resolveRemovableVolume(storageType);
        return relativePath.isEmpty() ? mountPath : mountPath + "/" + relativePath;
    }

    /**
     * Finds the actual mount path for a removable volume by its UUID/ID.
     */
    private String resolveRemovableVolume(String volumeId) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            StorageManager sm = (StorageManager) getSystemService(STORAGE_SERVICE);
            if (sm != null) {
                List<StorageVolume> volumes = sm.getStorageVolumes();
                for (StorageVolume vol : volumes) {
                    String uuid = vol.getUuid();
                    if (volumeId.equalsIgnoreCase(uuid)) {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                            File dir = vol.getDirectory();
                            if (dir != null) return dir.getAbsolutePath();
                        }
                        // API 24-29: reflect getPath() which is hidden but reliable
                        try {
                            java.lang.reflect.Method getPath = vol.getClass().getMethod("getPath");
                            Object path = getPath.invoke(vol);
                            if (path != null) return path.toString();
                        } catch (Exception ignored) {}
                        // Last resort: standard mount point convention
                        return "/storage/" + volumeId;
                    }
                }
            }
        }
        return "/storage/" + volumeId;
    }
}
