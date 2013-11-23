/* Copyright (c) 2013 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";

	console.log("Loading viewerImage");

    var extensionTitle = "Image Viewer"
    var extensionID = "viewerImage";  // ID should be equal to the directory name where the ext. is located   
    var extensionType =  "perspective";
    var extensionIcon = "icon-list";
    var extensionVersion = "1.0";
    var extensionManifestVersion = 1;
    var extensionLicense = "AGPL";
    var extensionSupportedFileTypes = [ "jpeg", "jpg", "png",  "gif", "bmp" ];
	
	var TSCORE = require("tscore");
	
	var extensionDirectory = TSCORE.Config.getExtensionPath()+"/"+extensionID;
	var UI = undefined; 
	   
	exports.init = function(filePath, elementID) {
	    console.log("Initalization Browser Image Viewer...");

		require([
              extensionDirectory+'/viewerUI.js',
              extensionDirectory+'/pixastic/pixastic.custom.js',
		      //extensionDirectory+'/camanjs/caman.full.js',
		    ], function(extUI) {
                UI = new extUI.ExtUI(extensionID, elementID, filePath);                          
                UI.buildUI();
                TSCORE.hideLoadingAnimation();              
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
	
    // Vars
    exports.Title                   = extensionTitle;
    exports.ID                      = extensionID;   
    exports.Type                    = extensionType;
    exports.Icon                    = extensionIcon;
    exports.Version                 = extensionVersion;
    exports.ManifestVersion         = extensionManifestVersion;
    exports.License                 = extensionLicense;	
    exports.SupportedFileTypes      = extensionSupportedFileTypes;

});