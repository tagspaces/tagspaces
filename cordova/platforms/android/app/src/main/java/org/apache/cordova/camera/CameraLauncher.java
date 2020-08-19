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

import android.Manifest;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.Bitmap.CompressFormat;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.media.ExifInterface;
import android.media.MediaScannerConnection;
import android.media.MediaScannerConnection.MediaScannerConnectionClient;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.support.v4.content.FileProvider;
import android.util.Base64;

import org.apache.cordova.BuildHelper;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.LOG;
import org.apache.cordova.PermissionHelper;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * This class launches the camera view, allows the user to take a picture, closes the camera view,
 * and returns the captured image.  When the camera view is closed, the screen displayed before
 * the camera view was shown is redisplayed.
 */
public class CameraLauncher extends CordovaPlugin implements MediaScannerConnectionClient {

    private static final int DATA_URL = 0;              // Return base64 encoded string
    private static final int FILE_URI = 1;              // Return file uri (content://media/external/images/media/2 for Android)
    private static final int NATIVE_URI = 2;                    // On Android, this is the same as FILE_URI

    private static final int PHOTOLIBRARY = 0;          // Choose image from picture library (same as SAVEDPHOTOALBUM for Android)
    private static final int CAMERA = 1;                // Take picture from camera
    private static final int SAVEDPHOTOALBUM = 2;       // Choose image from picture library (same as PHOTOLIBRARY for Android)

    private static final int PICTURE = 0;               // allow selection of still pictures only. DEFAULT. Will return format specified via DestinationType
    private static final int VIDEO = 1;                 // allow selection of video only, ONLY RETURNS URL
    private static final int ALLMEDIA = 2;              // allow selection from all media types

    private static final int JPEG = 0;                  // Take a picture of type JPEG
    private static final int PNG = 1;                   // Take a picture of type PNG
    private static final String JPEG_TYPE = "jpg";
    private static final String PNG_TYPE = "png";
    private static final String JPEG_EXTENSION = "." + JPEG_TYPE;
    private static final String PNG_EXTENSION = "." + PNG_TYPE;
    private static final String PNG_MIME_TYPE = "image/png";
    private static final String JPEG_MIME_TYPE = "image/jpeg";
    private static final String GET_PICTURE = "Get Picture";
    private static final String GET_VIDEO = "Get Video";
    private static final String GET_All = "Get All";
    private static final String CROPPED_URI_KEY = "croppedUri";
    private static final String IMAGE_URI_KEY = "imageUri";

    private static final String TAKE_PICTURE_ACTION = "takePicture";

    public static final int PERMISSION_DENIED_ERROR = 20;
    public static final int TAKE_PIC_SEC = 0;
    public static final int SAVE_TO_ALBUM_SEC = 1;

    private static final String LOG_TAG = "CameraLauncher";

    //Where did this come from?
    private static final int CROP_CAMERA = 100;

    private static final String TIME_FORMAT = "yyyyMMdd_HHmmss";

    private int mQuality;                   // Compression quality hint (0-100: 0=low quality & high compression, 100=compress of max quality)
    private int targetWidth;                // desired width of the image
    private int targetHeight;               // desired height of the image
    private CordovaUri imageUri;            // Uri of captured image
    private int encodingType;               // Type of encoding to use
    private int mediaType;                  // What type of media to retrieve
    private int destType;                   // Source type (needs to be saved for the permission handling)
    private int srcType;                    // Destination type (needs to be saved for permission handling)
    private boolean saveToPhotoAlbum;       // Should the picture be saved to the device's photo album
    private boolean correctOrientation;     // Should the pictures orientation be corrected
    private boolean orientationCorrected;   // Has the picture's orientation been corrected
    private boolean allowEdit;              // Should we allow the user to crop the image.

    protected final static String[] permissions = { Manifest.permission.CAMERA, Manifest.permission.READ_EXTERNAL_STORAGE, Manifest.permission.WRITE_EXTERNAL_STORAGE };

    public CallbackContext callbackContext;
    private int numPics;

    private MediaScannerConnection conn;    // Used to update gallery app with newly-written files
    private Uri scanMe;                     // Uri of image to be added to content store
    private Uri croppedUri;
    private ExifHelper exifData;            // Exif data from source
    private String applicationId;


    /**
     * Executes the request and returns PluginResult.
     *
     * @param action            The action to execute.
     * @param args              JSONArry of arguments for the plugin.
     * @param callbackContext   The callback id used when calling back into JavaScript.
     * @return                  A PluginResult object with a status and message.
     */
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        this.callbackContext = callbackContext;
        //Adding an API to CoreAndroid to get the BuildConfigValue
        //This allows us to not make this a breaking change to embedding
        this.applicationId = (String) BuildHelper.getBuildConfigValue(cordova.getActivity(), "APPLICATION_ID");
        this.applicationId = preferences.getString("applicationId", this.applicationId);


        if (action.equals(TAKE_PICTURE_ACTION)) {
            this.srcType = CAMERA;
            this.destType = FILE_URI;
            this.saveToPhotoAlbum = false;
            this.targetHeight = 0;
            this.targetWidth = 0;
            this.encodingType = JPEG;
            this.mediaType = PICTURE;
            this.mQuality = 50;

            //Take the values from the arguments if they're not already defined (this is tricky)
            this.destType = args.getInt(1);
            this.srcType = args.getInt(2);
            this.mQuality = args.getInt(0);
            this.targetWidth = args.getInt(3);
            this.targetHeight = args.getInt(4);
            this.encodingType = args.getInt(5);
            this.mediaType = args.getInt(6);
            this.allowEdit = args.getBoolean(7);
            this.correctOrientation = args.getBoolean(8);
            this.saveToPhotoAlbum = args.getBoolean(9);

            // If the user specifies a 0 or smaller width/height
            // make it -1 so later comparisons succeed
            if (this.targetWidth < 1) {
                this.targetWidth = -1;
            }
            if (this.targetHeight < 1) {
                this.targetHeight = -1;
            }

            // We don't return full-quality PNG files. The camera outputs a JPEG
            // so requesting it as a PNG provides no actual benefit
            if (this.targetHeight == -1 && this.targetWidth == -1 && this.mQuality == 100 &&
                    !this.correctOrientation && this.encodingType == PNG && this.srcType == CAMERA) {
                this.encodingType = JPEG;
            }

            try {
                if (this.srcType == CAMERA) {
                    this.callTakePicture(destType, encodingType);
                }
                else if ((this.srcType == PHOTOLIBRARY) || (this.srcType == SAVEDPHOTOALBUM)) {
                    // FIXME: Stop always requesting the permission
                    if(!PermissionHelper.hasPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE)) {
                        PermissionHelper.requestPermission(this, SAVE_TO_ALBUM_SEC, Manifest.permission.READ_EXTERNAL_STORAGE);
                    } else {
                        this.getImage(this.srcType, destType, encodingType);
                    }
                }
            }
            catch (IllegalArgumentException e)
            {
                callbackContext.error("Illegal Argument Exception");
                PluginResult r = new PluginResult(PluginResult.Status.ERROR);
                callbackContext.sendPluginResult(r);
                return true;
            }

            PluginResult r = new PluginResult(PluginResult.Status.NO_RESULT);
            r.setKeepCallback(true);
            callbackContext.sendPluginResult(r);

            return true;
        }
        return false;
    }

    //--------------------------------------------------------------------------
    // LOCAL METHODS
    //--------------------------------------------------------------------------

    private String getTempDirectoryPath() {
        File cache = null;

        // SD Card Mounted
        if (Environment.getExternalStorageState().equals(Environment.MEDIA_MOUNTED)) {
            cache = cordova.getActivity().getExternalCacheDir();
        }
        // Use internal storage
        else {
            cache = cordova.getActivity().getCacheDir();
        }

        // Create the cache directory if it doesn't exist
        cache.mkdirs();
        return cache.getAbsolutePath();
    }

    /**
     * Take a picture with the camera.
     * When an image is captured or the camera view is cancelled, the result is returned
     * in CordovaActivity.onActivityResult, which forwards the result to this.onActivityResult.
     *
     * The image can either be returned as a base64 string or a URI that points to the file.
     * To display base64 string in an img tag, set the source to:
     *      img.src="data:image/jpeg;base64,"+result;
     * or to display URI in an img tag
     *      img.src=result;
     *
     * @param returnType        Set the type of image to return.
     * @param encodingType           Compression quality hint (0-100: 0=low quality & high compression, 100=compress of max quality)
     */
    public void callTakePicture(int returnType, int encodingType) {
        boolean saveAlbumPermission = PermissionHelper.hasPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE)
                && PermissionHelper.hasPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE);
        boolean takePicturePermission = PermissionHelper.hasPermission(this, Manifest.permission.CAMERA);

        // CB-10120: The CAMERA permission does not need to be requested unless it is declared
        // in AndroidManifest.xml. This plugin does not declare it, but others may and so we must
        // check the package info to determine if the permission is present.

        if (!takePicturePermission) {
            takePicturePermission = true;
            try {
                PackageManager packageManager = this.cordova.getActivity().getPackageManager();
                String[] permissionsInPackage = packageManager.getPackageInfo(this.cordova.getActivity().getPackageName(), PackageManager.GET_PERMISSIONS).requestedPermissions;
                if (permissionsInPackage != null) {
                    for (String permission : permissionsInPackage) {
                        if (permission.equals(Manifest.permission.CAMERA)) {
                            takePicturePermission = false;
                            break;
                        }
                    }
                }
            } catch (NameNotFoundException e) {
                // We are requesting the info for our package, so this should
                // never be caught
            }
        }

        if (takePicturePermission && saveAlbumPermission) {
            takePicture(returnType, encodingType);
        } else if (saveAlbumPermission && !takePicturePermission) {
            PermissionHelper.requestPermission(this, TAKE_PIC_SEC, Manifest.permission.CAMERA);
        } else if (!saveAlbumPermission && takePicturePermission) {
            PermissionHelper.requestPermissions(this, TAKE_PIC_SEC,
                    new String[]{Manifest.permission.READ_EXTERNAL_STORAGE, Manifest.permission.WRITE_EXTERNAL_STORAGE});
        } else {
            PermissionHelper.requestPermissions(this, TAKE_PIC_SEC, permissions);
        }
    }

    public void takePicture(int returnType, int encodingType)
    {
        // Save the number of images currently on disk for later
        this.numPics = queryImgDB(whichContentStore()).getCount();

        // Let's use the intent and see what happens
        Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);

        // Specify file so that large image is captured and returned
        File photo = createCaptureFile(encodingType);
        this.imageUri = new CordovaUri(FileProvider.getUriForFile(cordova.getActivity(),
                applicationId + ".provider",
                photo));
        intent.putExtra(MediaStore.EXTRA_OUTPUT, imageUri.getCorrectUri());
        //We can write to this URI, this will hopefully allow us to write files to get to the next step
        intent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION);

        if (this.cordova != null) {
            // Let's check to make sure the camera is actually installed. (Legacy Nexus 7 code)
            PackageManager mPm = this.cordova.getActivity().getPackageManager();
            if(intent.resolveActivity(mPm) != null)
            {
                this.cordova.startActivityForResult((CordovaPlugin) this, intent, (CAMERA + 1) * 16 + returnType + 1);
            }
            else
            {
                LOG.d(LOG_TAG, "Error: You don't have a default camera.  Your device may not be CTS complaint.");
            }
        }
//        else
//            LOG.d(LOG_TAG, "ERROR: You must use the CordovaInterface for this to work correctly. Please implement it in your activity");
    }

    /**
     * Create a file in the applications temporary directory based upon the supplied encoding.
     *
     * @param encodingType of the image to be taken
     * @return a File object pointing to the temporary picture
     */
    private File createCaptureFile(int encodingType) {
        return createCaptureFile(encodingType, "");
    }

    /**
     * Create a file in the applications temporary directory based upon the supplied encoding.
     *
     * @param encodingType of the image to be taken
     * @param fileName or resultant File object.
     * @return a File object pointing to the temporary picture
     */
    private File createCaptureFile(int encodingType, String fileName) {
        if (fileName.isEmpty()) {
            fileName = ".Pic";
        }

        if (encodingType == JPEG) {
            fileName = fileName + JPEG_EXTENSION;
        } else if (encodingType == PNG) {
            fileName = fileName + PNG_EXTENSION;
        } else {
            throw new IllegalArgumentException("Invalid Encoding Type: " + encodingType);
        }

        return new File(getTempDirectoryPath(), fileName);
    }


    /**
     * Get image from photo library.
     *
     * @param srcType           The album to get image from.
     * @param returnType        Set the type of image to return.
     * @param encodingType
     */
    // TODO: Images selected from SDCARD don't display correctly, but from CAMERA ALBUM do!
    // TODO: Images from kitkat filechooser not going into crop function
    public void getImage(int srcType, int returnType, int encodingType) {
        Intent intent = new Intent();
        String title = GET_PICTURE;
        croppedUri = null;
        if (this.mediaType == PICTURE) {
            intent.setType("image/*");
            if (this.allowEdit) {
                intent.setAction(Intent.ACTION_PICK);
                intent.putExtra("crop", "true");
                if (targetWidth > 0) {
                    intent.putExtra("outputX", targetWidth);
                }
                if (targetHeight > 0) {
                    intent.putExtra("outputY", targetHeight);
                }
                if (targetHeight > 0 && targetWidth > 0 && targetWidth == targetHeight) {
                    intent.putExtra("aspectX", 1);
                    intent.putExtra("aspectY", 1);
                }
                File photo = createCaptureFile(JPEG);
                croppedUri = Uri.fromFile(photo);
                intent.putExtra(MediaStore.EXTRA_OUTPUT, croppedUri);
            } else {
                intent.setAction(Intent.ACTION_GET_CONTENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
            }
        } else if (this.mediaType == VIDEO) {
            intent.setType("video/*");
            title = GET_VIDEO;
            intent.setAction(Intent.ACTION_GET_CONTENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
        } else if (this.mediaType == ALLMEDIA) {
            // I wanted to make the type 'image/*, video/*' but this does not work on all versions
            // of android so I had to go with the wildcard search.
            intent.setType("*/*");
            title = GET_All;
            intent.setAction(Intent.ACTION_GET_CONTENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
        }
        if (this.cordova != null) {
            this.cordova.startActivityForResult((CordovaPlugin) this, Intent.createChooser(intent,
                    new String(title)), (srcType + 1) * 16 + returnType + 1);
        }
    }


  /**
   * Brings up the UI to perform crop on passed image URI
   *
   * @param picUri
   */
  private void performCrop(Uri picUri, int destType, Intent cameraIntent) {
    try {
        Intent cropIntent = new Intent("com.android.camera.action.CROP");
        // indicate image type and Uri
        cropIntent.setDataAndType(picUri, "image/*");
        // set crop properties
        cropIntent.putExtra("crop", "true");


        // indicate output X and Y
        if (targetWidth > 0) {
          cropIntent.putExtra("outputX", targetWidth);
        }
        if (targetHeight > 0) {
          cropIntent.putExtra("outputY", targetHeight);
        }
        if (targetHeight > 0 && targetWidth > 0 && targetWidth == targetHeight) {
          cropIntent.putExtra("aspectX", 1);
          cropIntent.putExtra("aspectY", 1);
        }
        // create new file handle to get full resolution crop
        croppedUri = Uri.fromFile(createCaptureFile(this.encodingType, System.currentTimeMillis() + ""));
        cropIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        cropIntent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
        cropIntent.putExtra("output", croppedUri);


        // start the activity - we handle returning in onActivityResult

        if (this.cordova != null) {
            this.cordova.startActivityForResult((CordovaPlugin) this,
                cropIntent, CROP_CAMERA + destType);
        }
    } catch (ActivityNotFoundException anfe) {
      LOG.e(LOG_TAG, "Crop operation not supported on this device");
      try {
          processResultFromCamera(destType, cameraIntent);
      }
      catch (IOException e)
      {
          e.printStackTrace();
          LOG.e(LOG_TAG, "Unable to write to file");
      }
    }
  }

    /**
     * Applies all needed transformation to the image received from the camera.
     *
     * @param destType          In which form should we return the image
     * @param intent            An Intent, which can return result data to the caller (various data can be attached to Intent "extras").
     */
    private void processResultFromCamera(int destType, Intent intent) throws IOException {
        int rotate = 0;

        // Create an ExifHelper to save the exif data that is lost during compression
        ExifHelper exif = new ExifHelper();

        String sourcePath = (this.allowEdit && this.croppedUri != null) ?
                FileHelper.stripFileProtocol(this.croppedUri.toString()) :
                this.imageUri.getFilePath();


        if (this.encodingType == JPEG) {
            try {
                //We don't support PNG, so let's not pretend we do
                exif.createInFile(sourcePath);
                exif.readExifData();
                rotate = exif.getOrientation();

            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        Bitmap bitmap = null;
        Uri galleryUri = null;

        // CB-5479 When this option is given the unchanged image should be saved
        // in the gallery and the modified image is saved in the temporary
        // directory
        if (this.saveToPhotoAlbum) {
            galleryUri = Uri.fromFile(new File(getPicturesPath()));

            if (this.allowEdit && this.croppedUri != null) {
                writeUncompressedImage(croppedUri, galleryUri);
            } else {
                Uri imageUri = this.imageUri.getFileUri();
                writeUncompressedImage(imageUri, galleryUri);
            }

            refreshGallery(galleryUri);
        }

        // If sending base64 image back
        if (destType == DATA_URL) {
            bitmap = getScaledAndRotatedBitmap(sourcePath);

            if (bitmap == null) {
                // Try to get the bitmap from intent.
                bitmap = (Bitmap) intent.getExtras().get("data");
            }

            // Double-check the bitmap.
            if (bitmap == null) {
                LOG.d(LOG_TAG, "I either have a null image path or bitmap");
                this.failPicture("Unable to create bitmap!");
                return;
            }


            this.processPicture(bitmap, this.encodingType);

            if (!this.saveToPhotoAlbum) {
                checkForDuplicateImage(DATA_URL);
            }
        }

        // If sending filename back
        else if (destType == FILE_URI || destType == NATIVE_URI) {
            // If all this is true we shouldn't compress the image.
            if (this.targetHeight == -1 && this.targetWidth == -1 && this.mQuality == 100 &&
                    !this.correctOrientation) {

                // If we saved the uncompressed photo to the album, we can just
                // return the URI we already created
                if (this.saveToPhotoAlbum) {
                    this.callbackContext.success(galleryUri.toString());
                } else {
                    Uri uri = Uri.fromFile(createCaptureFile(this.encodingType, System.currentTimeMillis() + ""));

                    if (this.allowEdit && this.croppedUri != null) {
                        Uri croppedUri = Uri.fromFile(new File(getFileNameFromUri(this.croppedUri)));
                        writeUncompressedImage(croppedUri, uri);
                    } else {
                        Uri imageUri = this.imageUri.getFileUri();
                        writeUncompressedImage(imageUri, uri);
                    }

                    this.callbackContext.success(uri.toString());
                }
            } else {
                Uri uri = Uri.fromFile(createCaptureFile(this.encodingType, System.currentTimeMillis() + ""));
                bitmap = getScaledAndRotatedBitmap(sourcePath);

                // Double-check the bitmap.
                if (bitmap == null) {
                    LOG.d(LOG_TAG, "I either have a null image path or bitmap");
                    this.failPicture("Unable to create bitmap!");
                    return;
                }


                // Add compressed version of captured image to returned media store Uri
                OutputStream os = this.cordova.getActivity().getContentResolver().openOutputStream(uri);
                CompressFormat compressFormat = encodingType == JPEG ?
                        CompressFormat.JPEG :
                        CompressFormat.PNG;

                bitmap.compress(compressFormat, this.mQuality, os);
                os.close();

                // Restore exif data to file
                if (this.encodingType == JPEG) {
                    String exifPath;
                    exifPath = uri.getPath();
                    //We just finished rotating it by an arbitrary orientation, just make sure it's normal
                    if(rotate != ExifInterface.ORIENTATION_NORMAL)
                        exif.resetOrientation();
                    exif.createOutFile(exifPath);
                    exif.writeExifData();
                }

                // Send Uri back to JavaScript for viewing image
                this.callbackContext.success(uri.toString());

            }
        } else {
            throw new IllegalStateException();
        }

        this.cleanup(FILE_URI, this.imageUri.getFileUri(), galleryUri, bitmap);
        bitmap = null;
    }

    private String getPicturesPath() {
        String timeStamp = new SimpleDateFormat(TIME_FORMAT).format(new Date());
        String imageFileName = "IMG_" + timeStamp + (this.encodingType == JPEG ? JPEG_EXTENSION : PNG_EXTENSION);
        File storageDir = Environment.getExternalStoragePublicDirectory(
                Environment.DIRECTORY_PICTURES);
        storageDir.mkdirs();
        String galleryPath = storageDir.getAbsolutePath() + "/" + imageFileName;
        return galleryPath;
    }

    private void refreshGallery(Uri contentUri) {
        Intent mediaScanIntent = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE);
        mediaScanIntent.setData(contentUri);
        this.cordova.getActivity().sendBroadcast(mediaScanIntent);
    }

    /**
     * Converts output image format int value to string value of mime type.
     * @param outputFormat int Output format of camera API.
     *                     Must be value of either JPEG or PNG constant
     * @return String String value of mime type or empty string if mime type is not supported
     */
    private String getMimetypeForFormat(int outputFormat) {
        if (outputFormat == PNG) return PNG_MIME_TYPE;
        if (outputFormat == JPEG) return JPEG_MIME_TYPE;
        return "";
    }


    private String outputModifiedBitmap(Bitmap bitmap, Uri uri) throws IOException {
        // Some content: URIs do not map to file paths (e.g. picasa).
        String realPath = FileHelper.getRealPath(uri, this.cordova);

        // Get filename from uri
        String fileName = realPath != null ?
                realPath.substring(realPath.lastIndexOf('/') + 1) :
                "modified." + (this.encodingType == JPEG ? JPEG_TYPE : PNG_TYPE);

        String timeStamp = new SimpleDateFormat(TIME_FORMAT).format(new Date());
        //String fileName = "IMG_" + timeStamp + (this.encodingType == JPEG ? ".jpg" : ".png");
        String modifiedPath = getTempDirectoryPath() + "/" + fileName;

        OutputStream os = new FileOutputStream(modifiedPath);
        CompressFormat compressFormat = this.encodingType == JPEG ?
                CompressFormat.JPEG :
                CompressFormat.PNG;

        bitmap.compress(compressFormat, this.mQuality, os);
        os.close();

        if (exifData != null && this.encodingType == JPEG) {
            try {
                if (this.correctOrientation && this.orientationCorrected) {
                    exifData.resetOrientation();
                }
                exifData.createOutFile(modifiedPath);
                exifData.writeExifData();
                exifData = null;
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return modifiedPath;
    }


    /**
     * Applies all needed transformation to the image received from the gallery.
     *
     * @param destType In which form should we return the image
     * @param intent   An Intent, which can return result data to the caller (various data can be attached to Intent "extras").
     */
    private void processResultFromGallery(int destType, Intent intent) {
        Uri uri = intent.getData();
        if (uri == null) {
            if (croppedUri != null) {
                uri = croppedUri;
            } else {
                this.failPicture("null data from photo library");
                return;
            }
        }
        int rotate = 0;

        String fileLocation = FileHelper.getRealPath(uri, this.cordova);
        LOG.d(LOG_TAG, "File location is: " + fileLocation);

        String uriString = uri.toString();
        String mimeType = FileHelper.getMimeType(uriString, this.cordova);

        // If you ask for video or the selected file doesn't have JPEG or PNG mime type
        //  there will be no attempt to resize any returned data
        if (this.mediaType == VIDEO || !(JPEG_MIME_TYPE.equalsIgnoreCase(mimeType) || PNG_MIME_TYPE.equalsIgnoreCase(mimeType))) {
            this.callbackContext.success(fileLocation);
        }
        else {

            // This is a special case to just return the path as no scaling,
            // rotating, nor compressing needs to be done
            if (this.targetHeight == -1 && this.targetWidth == -1 &&
                    (destType == FILE_URI || destType == NATIVE_URI) && !this.correctOrientation &&
                    mimeType != null && mimeType.equalsIgnoreCase(getMimetypeForFormat(encodingType)))
            {
                this.callbackContext.success(uriString);
            } else {
                Bitmap bitmap = null;
                try {
                    bitmap = getScaledAndRotatedBitmap(uriString);
                } catch (IOException e) {
                    e.printStackTrace();
                }
                if (bitmap == null) {
                    LOG.d(LOG_TAG, "I either have a null image path or bitmap");
                    this.failPicture("Unable to create bitmap!");
                    return;
                }

                // If sending base64 image back
                if (destType == DATA_URL) {
                    this.processPicture(bitmap, this.encodingType);
                }

                // If sending filename back
                else if (destType == FILE_URI || destType == NATIVE_URI) {
                    // Did we modify the image?
                    if ( (this.targetHeight > 0 && this.targetWidth > 0) ||
                            (this.correctOrientation && this.orientationCorrected) ||
                            !mimeType.equalsIgnoreCase(getMimetypeForFormat(encodingType)))
                    {
                        try {
                            String modifiedPath = this.outputModifiedBitmap(bitmap, uri);
                            // The modified image is cached by the app in order to get around this and not have to delete you
                            // application cache I'm adding the current system time to the end of the file url.
                            this.callbackContext.success("file://" + modifiedPath + "?" + System.currentTimeMillis());

                        } catch (Exception e) {
                            e.printStackTrace();
                            this.failPicture("Error retrieving image.");
                        }
                    } else {
                        this.callbackContext.success(fileLocation);
                    }
                }
                if (bitmap != null) {
                    bitmap.recycle();
                    bitmap = null;
                }
                System.gc();
            }
        }
    }

    /**
     * Called when the camera view exits.
     *
     * @param requestCode The request code originally supplied to startActivityForResult(),
     *                    allowing you to identify who this result came from.
     * @param resultCode  The integer result code returned by the child activity through its setResult().
     * @param intent      An Intent, which can return result data to the caller (various data can be attached to Intent "extras").
     */
    public void onActivityResult(int requestCode, int resultCode, Intent intent) {

        // Get src and dest types from request code for a Camera Activity
        int srcType = (requestCode / 16) - 1;
        int destType = (requestCode % 16) - 1;

        // If Camera Crop
        if (requestCode >= CROP_CAMERA) {
            if (resultCode == Activity.RESULT_OK) {

                // Because of the inability to pass through multiple intents, this hack will allow us
                // to pass arcane codes back.
                destType = requestCode - CROP_CAMERA;
                try {
                    processResultFromCamera(destType, intent);
                } catch (IOException e) {
                    e.printStackTrace();
                    LOG.e(LOG_TAG, "Unable to write to file");
                }

            }// If cancelled
            else if (resultCode == Activity.RESULT_CANCELED) {
                this.failPicture("No Image Selected");
            }

            // If something else
            else {
                this.failPicture("Did not complete!");
            }
        }
        // If CAMERA
        else if (srcType == CAMERA) {
            // If image available
            if (resultCode == Activity.RESULT_OK) {
                try {
                    if (this.allowEdit) {
                        Uri tmpFile = FileProvider.getUriForFile(cordova.getActivity(),
                                applicationId + ".provider",
                                createCaptureFile(this.encodingType));
                        performCrop(tmpFile, destType, intent);
                    } else {
                        this.processResultFromCamera(destType, intent);
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                    this.failPicture("Error capturing image.");
                }
            }

            // If cancelled
            else if (resultCode == Activity.RESULT_CANCELED) {
                this.failPicture("No Image Selected");
            }

            // If something else
            else {
                this.failPicture("Did not complete!");
            }
        }
        // If retrieving photo from library
        else if ((srcType == PHOTOLIBRARY) || (srcType == SAVEDPHOTOALBUM)) {
            if (resultCode == Activity.RESULT_OK && intent != null) {
                final Intent i = intent;
                final int finalDestType = destType;
                cordova.getThreadPool().execute(new Runnable() {
                    public void run() {
                        processResultFromGallery(finalDestType, i);
                    }
                });
            } else if (resultCode == Activity.RESULT_CANCELED) {
                this.failPicture("No Image Selected");
            } else {
                this.failPicture("Selection did not complete!");
            }
        }
    }

    private int exifToDegrees(int exifOrientation) {
        if (exifOrientation == ExifInterface.ORIENTATION_ROTATE_90) {
            return 90;
        } else if (exifOrientation == ExifInterface.ORIENTATION_ROTATE_180) {
            return 180;
        } else if (exifOrientation == ExifInterface.ORIENTATION_ROTATE_270) {
            return 270;
        } else {
            return 0;
        }
    }

    /**
     * Write an inputstream to local disk
     *
     * @param fis - The InputStream to write
     * @param dest - Destination on disk to write to
     * @throws FileNotFoundException
     * @throws IOException
     */
    private void writeUncompressedImage(InputStream fis, Uri dest) throws FileNotFoundException,
            IOException {
        OutputStream os = null;
        try {
            os = this.cordova.getActivity().getContentResolver().openOutputStream(dest);
            byte[] buffer = new byte[4096];
            int len;
            while ((len = fis.read(buffer)) != -1) {
                os.write(buffer, 0, len);
            }
            os.flush();
        } finally {
            if (os != null) {
                try {
                    os.close();
                } catch (IOException e) {
                    LOG.d(LOG_TAG, "Exception while closing output stream.");
                }
            }
            if (fis != null) {
                try {
                    fis.close();
                } catch (IOException e) {
                    LOG.d(LOG_TAG, "Exception while closing file input stream.");
                }
            }
        }
    }
    /**
     * In the special case where the default width, height and quality are unchanged
     * we just write the file out to disk saving the expensive Bitmap.compress function.
     *
     * @param src
     * @throws FileNotFoundException
     * @throws IOException
     */
    private void writeUncompressedImage(Uri src, Uri dest) throws FileNotFoundException,
            IOException {

        FileInputStream fis = new FileInputStream(FileHelper.stripFileProtocol(src.toString()));
        writeUncompressedImage(fis, dest);

    }

    /**
     * Create entry in media store for image
     *
     * @return uri
     */
    private Uri getUriFromMediaStore() {
        ContentValues values = new ContentValues();
        values.put(MediaStore.Images.Media.MIME_TYPE, JPEG_MIME_TYPE);
        Uri uri;
        try {
            uri = this.cordova.getActivity().getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
        } catch (RuntimeException e) {
            LOG.d(LOG_TAG, "Can't write to external media storage.");
            try {
                uri = this.cordova.getActivity().getContentResolver().insert(MediaStore.Images.Media.INTERNAL_CONTENT_URI, values);
            } catch (RuntimeException ex) {
                LOG.d(LOG_TAG, "Can't write to internal media storage.");
                return null;
            }
        }
        return uri;
    }

    /**
     * Return a scaled and rotated bitmap based on the target width and height
     *
     * @param imageUrl
     * @return
     * @throws IOException
     */
    private Bitmap getScaledAndRotatedBitmap(String imageUrl) throws IOException {
        // If no new width or height were specified, and orientation is not needed return the original bitmap
        if (this.targetWidth <= 0 && this.targetHeight <= 0 && !(this.correctOrientation)) {
            InputStream fileStream = null;
            Bitmap image = null;
            try {
                fileStream = FileHelper.getInputStreamFromUriString(imageUrl, cordova);
                image = BitmapFactory.decodeStream(fileStream);
            }  catch (OutOfMemoryError e) {
                callbackContext.error(e.getLocalizedMessage());
            } catch (Exception e){
                callbackContext.error(e.getLocalizedMessage());
            }
            finally {
                if (fileStream != null) {
                    try {
                        fileStream.close();
                    } catch (IOException e) {
                        LOG.d(LOG_TAG, "Exception while closing file input stream.");
                    }
                }
            }
            return image;
        }


        /*  Copy the inputstream to a temporary file on the device.
            We then use this temporary file to determine the width/height/orientation.
            This is the only way to determine the orientation of the photo coming from 3rd party providers (Google Drive, Dropbox,etc)
            This also ensures we create a scaled bitmap with the correct orientation

             We delete the temporary file once we are done
         */
        File localFile = null;
        Uri galleryUri = null;
        int rotate = 0;
        try {
            InputStream fileStream = FileHelper.getInputStreamFromUriString(imageUrl, cordova);
            if (fileStream != null) {
                // Generate a temporary file
                String timeStamp = new SimpleDateFormat(TIME_FORMAT).format(new Date());
                String fileName = "IMG_" + timeStamp + (this.encodingType == JPEG ? JPEG_EXTENSION : PNG_EXTENSION);
                localFile = new File(getTempDirectoryPath() + fileName);
                galleryUri = Uri.fromFile(localFile);
                writeUncompressedImage(fileStream, galleryUri);
                try {
                    String mimeType = FileHelper.getMimeType(imageUrl.toString(), cordova);
                    if (JPEG_MIME_TYPE.equalsIgnoreCase(mimeType)) {
                        //  ExifInterface doesn't like the file:// prefix
                        String filePath = galleryUri.toString().replace("file://", "");
                        // read exifData of source
                        exifData = new ExifHelper();
                        exifData.createInFile(filePath);
                        exifData.readExifData();
                        // Use ExifInterface to pull rotation information
                        if (this.correctOrientation) {
                            ExifInterface exif = new ExifInterface(filePath);
                            rotate = exifToDegrees(exif.getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_UNDEFINED));
                        }
                    }
                } catch (Exception oe) {
                    LOG.w(LOG_TAG,"Unable to read Exif data: "+ oe.toString());
                    rotate = 0;
                }
            }
        }
        catch (Exception e)
        {
            LOG.e(LOG_TAG,"Exception while getting input stream: "+ e.toString());
            return null;
        }



        try {
            // figure out the original width and height of the image
            BitmapFactory.Options options = new BitmapFactory.Options();
            options.inJustDecodeBounds = true;
            InputStream fileStream = null;
            try {
                fileStream = FileHelper.getInputStreamFromUriString(galleryUri.toString(), cordova);
                BitmapFactory.decodeStream(fileStream, null, options);
            } finally {
                if (fileStream != null) {
                    try {
                        fileStream.close();
                    } catch (IOException e) {
                        LOG.d(LOG_TAG, "Exception while closing file input stream.");
                    }
                }
            }


            //CB-2292: WTF? Why is the width null?
            if (options.outWidth == 0 || options.outHeight == 0) {
                return null;
            }

            // User didn't specify output dimensions, but they need orientation
            if (this.targetWidth <= 0 && this.targetHeight <= 0) {
                this.targetWidth = options.outWidth;
                this.targetHeight = options.outHeight;
            }

            // Setup target width/height based on orientation
            int rotatedWidth, rotatedHeight;
            boolean rotated= false;
            if (rotate == 90 || rotate == 270) {
                rotatedWidth = options.outHeight;
                rotatedHeight = options.outWidth;
                rotated = true;
            } else {
                rotatedWidth = options.outWidth;
                rotatedHeight = options.outHeight;
            }

            // determine the correct aspect ratio
            int[] widthHeight = calculateAspectRatio(rotatedWidth, rotatedHeight);


            // Load in the smallest bitmap possible that is closest to the size we want
            options.inJustDecodeBounds = false;
            options.inSampleSize = calculateSampleSize(rotatedWidth, rotatedHeight,  widthHeight[0], widthHeight[1]);
            Bitmap unscaledBitmap = null;
            try {
                fileStream = FileHelper.getInputStreamFromUriString(galleryUri.toString(), cordova);
                unscaledBitmap = BitmapFactory.decodeStream(fileStream, null, options);
            } finally {
                if (fileStream != null) {
                    try {
                        fileStream.close();
                    } catch (IOException e) {
                        LOG.d(LOG_TAG, "Exception while closing file input stream.");
                    }
                }
            }
            if (unscaledBitmap == null) {
                return null;
            }

            int scaledWidth = (!rotated) ? widthHeight[0] : widthHeight[1];
            int scaledHeight = (!rotated) ? widthHeight[1] : widthHeight[0];

            Bitmap scaledBitmap = Bitmap.createScaledBitmap(unscaledBitmap, scaledWidth, scaledHeight, true);
            if (scaledBitmap != unscaledBitmap) {
                unscaledBitmap.recycle();
                unscaledBitmap = null;
            }
            if (this.correctOrientation && (rotate != 0)) {
                Matrix matrix = new Matrix();
                matrix.setRotate(rotate);
                try {
                    scaledBitmap = Bitmap.createBitmap(scaledBitmap, 0, 0, scaledBitmap.getWidth(), scaledBitmap.getHeight(), matrix, true);
                    this.orientationCorrected = true;
                } catch (OutOfMemoryError oom) {
                    this.orientationCorrected = false;
                }
            }
            return scaledBitmap;
        }
        finally {
            // delete the temporary copy
            if (localFile != null) {
                localFile.delete();
            }
        }

    }

    /**
     * Maintain the aspect ratio so the resulting image does not look smooshed
     *
     * @param origWidth
     * @param origHeight
     * @return
     */
    public int[] calculateAspectRatio(int origWidth, int origHeight) {
        int newWidth = this.targetWidth;
        int newHeight = this.targetHeight;

        // If no new width or height were specified return the original bitmap
        if (newWidth <= 0 && newHeight <= 0) {
            newWidth = origWidth;
            newHeight = origHeight;
        }
        // Only the width was specified
        else if (newWidth > 0 && newHeight <= 0) {
            newHeight = (int)((double)(newWidth / (double)origWidth) * origHeight);
        }
        // only the height was specified
        else if (newWidth <= 0 && newHeight > 0) {
            newWidth = (int)((double)(newHeight / (double)origHeight) * origWidth);
        }
        // If the user specified both a positive width and height
        // (potentially different aspect ratio) then the width or height is
        // scaled so that the image fits while maintaining aspect ratio.
        // Alternatively, the specified width and height could have been
        // kept and Bitmap.SCALE_TO_FIT specified when scaling, but this
        // would result in whitespace in the new image.
        else {
            double newRatio = newWidth / (double) newHeight;
            double origRatio = origWidth / (double) origHeight;

            if (origRatio > newRatio) {
                newHeight = (newWidth * origHeight) / origWidth;
            } else if (origRatio < newRatio) {
                newWidth = (newHeight * origWidth) / origHeight;
            }
        }

        int[] retval = new int[2];
        retval[0] = newWidth;
        retval[1] = newHeight;
        return retval;
    }

    /**
     * Figure out what ratio we can load our image into memory at while still being bigger than
     * our desired width and height
     *
     * @param srcWidth
     * @param srcHeight
     * @param dstWidth
     * @param dstHeight
     * @return
     */
    public static int calculateSampleSize(int srcWidth, int srcHeight, int dstWidth, int dstHeight) {
        final float srcAspect = (float) srcWidth / (float) srcHeight;
        final float dstAspect = (float) dstWidth / (float) dstHeight;

        if (srcAspect > dstAspect) {
            return srcWidth / dstWidth;
        } else {
            return srcHeight / dstHeight;
        }
    }

    /**
     * Creates a cursor that can be used to determine how many images we have.
     *
     * @return a cursor
     */
    private Cursor queryImgDB(Uri contentStore) {
        return this.cordova.getActivity().getContentResolver().query(
                contentStore,
                new String[]{MediaStore.Images.Media._ID},
                null,
                null,
                null);
    }

    /**
     * Cleans up after picture taking. Checking for duplicates and that kind of stuff.
     *
     * @param newImage
     */
    private void cleanup(int imageType, Uri oldImage, Uri newImage, Bitmap bitmap) {
        if (bitmap != null) {
            bitmap.recycle();
        }

        // Clean up initial camera-written image file.
        (new File(FileHelper.stripFileProtocol(oldImage.toString()))).delete();

        checkForDuplicateImage(imageType);
        // Scan for the gallery to update pic refs in gallery
        if (this.saveToPhotoAlbum && newImage != null) {
            this.scanForGallery(newImage);
        }

        System.gc();
    }

    /**
     * Used to find out if we are in a situation where the Camera Intent adds to images
     * to the content store. If we are using a FILE_URI and the number of images in the DB
     * increases by 2 we have a duplicate, when using a DATA_URL the number is 1.
     *
     * @param type FILE_URI or DATA_URL
     */
    private void checkForDuplicateImage(int type) {
        int diff = 1;
        Uri contentStore = whichContentStore();
        Cursor cursor = queryImgDB(contentStore);
        int currentNumOfImages = cursor.getCount();

        if (type == FILE_URI && this.saveToPhotoAlbum) {
            diff = 2;
        }

        // delete the duplicate file if the difference is 2 for file URI or 1 for Data URL
        if ((currentNumOfImages - numPics) == diff) {
            cursor.moveToLast();
            int id = Integer.valueOf(cursor.getString(cursor.getColumnIndex(MediaStore.Images.Media._ID)));
            if (diff == 2) {
                id--;
            }
            Uri uri = Uri.parse(contentStore + "/" + id);
            this.cordova.getActivity().getContentResolver().delete(uri, null, null);
            cursor.close();
        }
    }

    /**
     * Determine if we are storing the images in internal or external storage
     *
     * @return Uri
     */
    private Uri whichContentStore() {
        if (Environment.getExternalStorageState().equals(Environment.MEDIA_MOUNTED)) {
            return MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
        } else {
            return MediaStore.Images.Media.INTERNAL_CONTENT_URI;
        }
    }

    /**
     * Compress bitmap using jpeg, convert to Base64 encoded string, and return to JavaScript.
     *
     * @param bitmap
     */
    public void processPicture(Bitmap bitmap, int encodingType) {
        ByteArrayOutputStream jpeg_data = new ByteArrayOutputStream();
        CompressFormat compressFormat = encodingType == JPEG ?
                CompressFormat.JPEG :
                CompressFormat.PNG;

        try {
            if (bitmap.compress(compressFormat, mQuality, jpeg_data)) {
                byte[] code = jpeg_data.toByteArray();
                byte[] output = Base64.encode(code, Base64.NO_WRAP);
                String js_out = new String(output);
                this.callbackContext.success(js_out);
                js_out = null;
                output = null;
                code = null;
            }
        } catch (Exception e) {
            this.failPicture("Error compressing image.");
        }
        jpeg_data = null;
    }

    /**
     * Send error message to JavaScript.
     *
     * @param err
     */
    public void failPicture(String err) {
        this.callbackContext.error(err);
    }

    private void scanForGallery(Uri newImage) {
        this.scanMe = newImage;
        if (this.conn != null) {
            this.conn.disconnect();
        }
        this.conn = new MediaScannerConnection(this.cordova.getActivity().getApplicationContext(), this);
        conn.connect();
    }

    public void onMediaScannerConnected() {
        try {
            this.conn.scanFile(this.scanMe.toString(), "image/*");
        } catch (IllegalStateException e) {
            LOG.e(LOG_TAG, "Can't scan file in MediaScanner after taking picture");
        }

    }

    public void onScanCompleted(String path, Uri uri) {
        this.conn.disconnect();
    }


    public void onRequestPermissionResult(int requestCode, String[] permissions,
                                          int[] grantResults) throws JSONException {
        for (int r : grantResults) {
            if (r == PackageManager.PERMISSION_DENIED) {
                this.callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.ERROR, PERMISSION_DENIED_ERROR));
                return;
            }
        }
        switch (requestCode) {
            case TAKE_PIC_SEC:
                takePicture(this.destType, this.encodingType);
                break;
            case SAVE_TO_ALBUM_SEC:
                this.getImage(this.srcType, this.destType, this.encodingType);
                break;
        }
    }

    /**
     * Taking or choosing a picture launches another Activity, so we need to implement the
     * save/restore APIs to handle the case where the CordovaActivity is killed by the OS
     * before we get the launched Activity's result.
     */
    public Bundle onSaveInstanceState() {
        Bundle state = new Bundle();
        state.putInt("destType", this.destType);
        state.putInt("srcType", this.srcType);
        state.putInt("mQuality", this.mQuality);
        state.putInt("targetWidth", this.targetWidth);
        state.putInt("targetHeight", this.targetHeight);
        state.putInt("encodingType", this.encodingType);
        state.putInt("mediaType", this.mediaType);
        state.putInt("numPics", this.numPics);
        state.putBoolean("allowEdit", this.allowEdit);
        state.putBoolean("correctOrientation", this.correctOrientation);
        state.putBoolean("saveToPhotoAlbum", this.saveToPhotoAlbum);

        if (this.croppedUri != null) {
            state.putString(CROPPED_URI_KEY, this.croppedUri.toString());
        }

        if (this.imageUri != null) {
            state.putString(IMAGE_URI_KEY, this.imageUri.getFileUri().toString());
        }

        return state;
    }

    public void onRestoreStateForActivityResult(Bundle state, CallbackContext callbackContext) {
        this.destType = state.getInt("destType");
        this.srcType = state.getInt("srcType");
        this.mQuality = state.getInt("mQuality");
        this.targetWidth = state.getInt("targetWidth");
        this.targetHeight = state.getInt("targetHeight");
        this.encodingType = state.getInt("encodingType");
        this.mediaType = state.getInt("mediaType");
        this.numPics = state.getInt("numPics");
        this.allowEdit = state.getBoolean("allowEdit");
        this.correctOrientation = state.getBoolean("correctOrientation");
        this.saveToPhotoAlbum = state.getBoolean("saveToPhotoAlbum");

        if (state.containsKey(CROPPED_URI_KEY)) {
            this.croppedUri = Uri.parse(state.getString(CROPPED_URI_KEY));
        }

        if (state.containsKey(IMAGE_URI_KEY)) {
            //I have no idea what type of URI is being passed in
            this.imageUri = new CordovaUri(Uri.parse(state.getString(IMAGE_URI_KEY)));
        }

        this.callbackContext = callbackContext;
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
