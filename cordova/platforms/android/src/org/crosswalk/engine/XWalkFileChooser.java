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
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.Manifest;
import android.net.Uri;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Log;
import android.webkit.ValueCallback;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;

public class XWalkFileChooser {
    private static final String IMAGE_TYPE = "image/";
    private static final String VIDEO_TYPE = "video/";
    private static final String AUDIO_TYPE = "audio/";
    private static final String ALL_IMAGE_TYPES = IMAGE_TYPE + "*";
    private static final String ALL_VIDEO_TYPES = VIDEO_TYPE + "*";
    private static final String ALL_AUDIO_TYPES = AUDIO_TYPE + "*";
    private static final String ANY_TYPES = "*/*";
    private static final String SPLIT_EXPRESSION = ",";
    private static final String PATH_PREFIX = "file:";
    private static final String WRITE_EXTERNAL_STORAGE= "android.permission.WRITE_EXTERNAL_STORAGE";

    public static final int INPUT_FILE_REQUEST_CODE = 1;

    private static final String TAG = "XWalkFileChooser";

    private Activity mActivity;
    private ValueCallback<Uri> mFilePathCallback;
    private String mCameraPhotoPath;

    public XWalkFileChooser(Activity activity) {
        mActivity = activity;
    }

    public boolean showFileChooser(ValueCallback<Uri> uploadFile, String acceptType,
            String capture) {
        mFilePathCallback = uploadFile;

        Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        if (takePictureIntent.resolveActivity(mActivity.getPackageManager()) != null) {
            // Create the File where the photo should go
            File photoFile = createImageFile();
            // Continue only if the File was successfully created
            if (photoFile != null) {
                mCameraPhotoPath = PATH_PREFIX + photoFile.getAbsolutePath();
                takePictureIntent.putExtra("PhotoPath", mCameraPhotoPath);
                takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, Uri.fromFile(photoFile));
            } else {
                takePictureIntent = null;
            }
        }

        Intent camcorder = new Intent(MediaStore.ACTION_VIDEO_CAPTURE);
        Intent soundRecorder = new Intent(MediaStore.Audio.Media.RECORD_SOUND_ACTION);
        Intent contentSelectionIntent = new Intent(Intent.ACTION_GET_CONTENT);
        contentSelectionIntent.addCategory(Intent.CATEGORY_OPENABLE);
        ArrayList<Intent> extraIntents = new ArrayList<Intent>();

        // A single mime type.
        if (!(acceptType.contains(SPLIT_EXPRESSION) || acceptType.contains(ANY_TYPES))) {
            if (capture.equals("true")) {
                if (acceptType.startsWith(IMAGE_TYPE)) {
                    if (takePictureIntent != null) {
                        mActivity.startActivityForResult(takePictureIntent, INPUT_FILE_REQUEST_CODE);
                        Log.d(TAG, "Started taking picture");
                        return true;
                    }
                } else if (acceptType.startsWith(VIDEO_TYPE)) {
                    mActivity.startActivityForResult(camcorder, INPUT_FILE_REQUEST_CODE);
                    Log.d(TAG, "Started camcorder");
                    return true;
                } else if (acceptType.startsWith(AUDIO_TYPE)) {
                    mActivity.startActivityForResult(soundRecorder, INPUT_FILE_REQUEST_CODE);
                    Log.d(TAG, "Started sound recorder");
                    return true;
                }
            } else {
                if (acceptType.startsWith(IMAGE_TYPE)) {
                    if (takePictureIntent != null) {
                        extraIntents.add(takePictureIntent);
                    }
                    contentSelectionIntent.setType(ALL_IMAGE_TYPES);
                } else if (acceptType.startsWith(VIDEO_TYPE)) {
                    extraIntents.add(camcorder);
                    contentSelectionIntent.setType(ALL_VIDEO_TYPES);
                } else if (acceptType.startsWith(AUDIO_TYPE)) {
                    extraIntents.add(soundRecorder);
                    contentSelectionIntent.setType(ALL_AUDIO_TYPES);
                }
            }
        }

        // Couldn't resolve an accept type.
        if (extraIntents.isEmpty() && canWriteExternalStorage()) {
            if (takePictureIntent != null) {
                extraIntents.add(takePictureIntent);
            }
            extraIntents.add(camcorder);
            extraIntents.add(soundRecorder);
            contentSelectionIntent.setType(ANY_TYPES);
        }

        Intent chooserIntent = new Intent(Intent.ACTION_CHOOSER);
        chooserIntent.putExtra(Intent.EXTRA_INTENT, contentSelectionIntent);
        if (!extraIntents.isEmpty()) {
            chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS,
                    extraIntents.toArray(new Intent[] { }));
        }
        mActivity.startActivityForResult(chooserIntent, INPUT_FILE_REQUEST_CODE);
        Log.d(TAG, "Started chooser");
        return true;
    }

    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if(requestCode == INPUT_FILE_REQUEST_CODE && mFilePathCallback != null) {
            Log.d(TAG, "Activity result: " + resultCode);
            Uri results = null;

            // Check that the response is a good one
            if(Activity.RESULT_OK == resultCode) {
                // In Android M, camera results return an empty Intent rather than null.
                if(data == null || (data.getAction() == null && data.getData() == null)) {
                    // If there is not data, then we may have taken a photo
                    if(mCameraPhotoPath != null) {
                        results = Uri.parse(mCameraPhotoPath);
                    }
                } else {
                    String dataString = data.getDataString();
                    if (dataString != null) {
                        results = Uri.parse(dataString);
                    }
                    deleteImageFile();
                }
            } else if (Activity.RESULT_CANCELED == resultCode) {
                deleteImageFile();
            }

            if (results != null) {
                Log.d(TAG, "Received file: " + results.toString());
            }
            mFilePathCallback.onReceiveValue(results);
            mFilePathCallback = null;
        }
    }

    private boolean canWriteExternalStorage() {
        try {
            PackageManager packageManager = mActivity.getPackageManager();
            PackageInfo packageInfo = packageManager.getPackageInfo(
                    mActivity.getPackageName(), PackageManager.GET_PERMISSIONS);
            return Arrays.asList(packageInfo.requestedPermissions).contains(WRITE_EXTERNAL_STORAGE);
        } catch (NameNotFoundException e) {
            return false;
        } catch (NullPointerException e) {
            return false;
        }
    }

    private File createImageFile() {
        // FIXME: If the external storage state is not "MEDIA_MOUNTED", we need to get
        // other volume paths by "getVolumePaths()" when it was exposed.
        String state = Environment.getExternalStorageState();
        if (!state.equals(Environment.MEDIA_MOUNTED)) {
            Log.e(TAG, "External storage is not mounted.");
            return null;
        }

        // Create an image file name
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        String imageFileName = "JPEG_" + timeStamp + "_";
        File storageDir = Environment.getExternalStoragePublicDirectory(
                Environment.DIRECTORY_PICTURES);
        if (!storageDir.exists()) {
            storageDir.mkdirs();
        }

        try {
            File file = File.createTempFile(imageFileName, ".jpg", storageDir);
            Log.d(TAG, "Created image file: " +  file.getAbsolutePath());
            return file;
        } catch (IOException e) {
            // Error occurred while creating the File
            Log.e(TAG, "Unable to create Image File, " +
                    "please make sure permission 'WRITE_EXTERNAL_STORAGE' was added.");
            return null;
        }
    }

    private boolean deleteImageFile() {
        if (mCameraPhotoPath == null || !mCameraPhotoPath.contains(PATH_PREFIX)) {
            return false;
        }
        String filePath = mCameraPhotoPath.split(PATH_PREFIX)[1];
        boolean result = new File(filePath).delete();
        Log.d(TAG, "Delete image file: " + filePath + " result: " + result);
        return result;
    }
}
