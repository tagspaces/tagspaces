/* Copyright (c) 2013 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";

	console.log("Loading viewerImage");

    var extensionTitle = "Image Viewer";
    var extensionID = "viewerImage";  // ID should be equal to the directory name where the ext. is located   
    var extensionType =  "viewer";
    var extensionIcon = "icon-list";
    var extensionVersion = "1.0";
    var extensionManifestVersion = 1;
    var extensionLicense = "AGPL";
    var extensionSupportedFileTypes = [ "jpeg", "jpg", "png",  "gif", "bmp" ];
	
	var TSCORE = require("tscore");
	
	var extensionDirectory = TSCORE.Config.getExtensionPath()+"/"+extensionID;
	var UI;
	   
	   
	exports.init = function(filePath, elementID) {
	    console.log("Initalization Browser Image Viewer...");

		require([
              extensionDirectory+'/viewerUI.js',
              "text!"+extensionDirectory+'/mainUI.html',
              //extensionDirectory+'/loadimage/canvas-to-blob.js',
              extensionDirectory+'/jquery.panzoom/jquery.panzoom.min.js',              
              extensionDirectory+'/jquery.mousewheel/jquery.mousewheel.js'
              ], function(extUI, uiTPL) {
			//extensionDirectory+'/pixastic/pixastic.custom.js',
				var uiTemplate = Handlebars.compile( uiTPL );
                UI = new extUI.ExtUI(extensionID, elementID, filePath, uiTemplate);

                // TODO remove tmp solution for memory leak prevention
                UI = null;

                /*
                loadImage(
                	    filePath,
                	    function (img) {
                	        img.toBlob(
            	                function (blob) {
            	                    loadImage.parseMetaData(blob, function (data) {
            	                    	console.log("EXIF: "+data.exif);
            	                    	if (data.exif) {
            	                            options.orientation = data.exif.get('Orientation');
            	                            displayExifData(data.exif);
            	                        }
            	                    });                                 	                	
            	                },
            	                'image/jpeg'
            	            );                	        
                	    },
                	    {
                	        maxWidth: 600,
                	        maxHeight: 300,
                	        minWidth: 100,
                	        minHeight: 50,
                	        canvas: true
                	    }
                	); */
		});
	};
	
	exports.viewerMode = function(isViewerMode) {
		console.log("viewerMode not supported on this extension");  
	};
	
	exports.setContent = function(content) {
		console.log("setContent not supported on this extension"); 	
	};
	
	exports.getContent = function() {
		console.log("getContent not supported on this extension"); 	
	};
	
    // Extension Vars
    exports.Title                   = extensionTitle;
    exports.ID                      = extensionID;   
    exports.Type                    = extensionType;
    exports.Icon                    = extensionIcon;
    exports.Version                 = extensionVersion;
    exports.ManifestVersion         = extensionManifestVersion;
    exports.License                 = extensionLicense;	
    exports.SupportedFileTypes      = extensionSupportedFileTypes;

});