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

package org.apache.cordova.camera;

import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.support.v4.content.FileProvider;

import java.io.File;

/*
 * This class exists because Andorid FilesProvider doesn't work on Android 4.4.4 and below and throws
 * weird errors.  I'm not sure why writing to shared cache directories is somehow verboten, but it is
 * and this error is irritating for a Compatibility library to have.
 *
 */

public class CordovaUri {

    private Uri androidUri;
    private String fileName;
    private Uri fileUri;

    /*
     * We always expect a FileProvider string to be passed in for the file that we create
     *
     */
    CordovaUri (Uri inputUri)
    {
        //Determine whether the file is a content or file URI
        if(inputUri.getScheme().equals("content"))
        {
            androidUri = inputUri;
            fileName = getFileNameFromUri(androidUri);
            fileUri = Uri.parse("file://" + fileName);
        }
        else
        {
            fileUri = inputUri;
            fileName = FileHelper.stripFileProtocol(inputUri.toString());
        }
    }

    public Uri getFileUri()
    {
        return fileUri;
    }

    public String getFilePath()
    {
        return fileName;
    }

    /*
     * This only gets called by takePicture
     */

    public Uri getCorrectUri()
    {
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
            return androidUri;
        else
            return fileUri;
    }

 /*
  * This is dirty, but it does the job.
  *
  * Since the FilesProvider doesn't really provide you a way of getting a URL from the file,
  * and since we actually need the Camera to create the file for us most of the time, we don't
  * actually write the file, just generate the location based on a timestamp, we need to get it
  * back from the Intent.
  *
  * However, the FilesProvider preserves the path, so we can at least write to it from here, since
  * we own the context in this case.
 */

    private String getFileNameFromUri(Uri uri) {
        String fullUri = uri.toString();
        String partial_path = fullUri.split("external_files")[1];
        File external_storage = Environment.getExternalStorageDirectory();
        String path = external_storage.getAbsolutePath() + partial_path;
        return path;

    }
}
