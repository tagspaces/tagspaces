/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";

	console.log("Loading viewerText");

    var extensionTitle = "Universal Viewer";
    var extensionID = "viewerText";  // ID should be equal to the directory name where the ext. is located   
    var extensionType =  "viewer";
    var extensionIcon = "icon-list";
    var extensionVersion = "1.0";
    var extensionManifestVersion = 1;
    var extensionLicense = "AGPL";
    var extensionSupportedFileTypes = [ "*" ];
	
	var TSCORE = require("tscore");	
	
	var containerElID = undefined;
	
	var extensionDirectory = TSCORE.Config.getExtensionPath()+"/"+extensionID;
	
	exports.init = function(filePath, containerElementID) {
	    console.log("Initalization Text Viewer...");
	    containerElID = containerElementID;

    	TSCORE.IO.loadTextFile(filePath);
	};
	
	exports.setFileType = function(fileType) {
	    console.log("setFileType not supported on this extension");      
	};
	
	exports.viewerMode = function(isViewerMode) {
	    // set readonly      
	};
	
	exports.setContent = function(content) {
	    // removing the script tags from the content 
        var cleanedContent = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,""); 	    
        $('#'+containerElID).empty();
        $('#'+containerElID).append($('<textarea>', {
            readonly: "true",
            style: "overflow: auto; height: 100%; width: 100%; font-size: 13px; margin: 3px; background-color: white; border-width: 0px;",
            })
            .append(cleanedContent)
            ); 
    };
	
	exports.getContent = function() {
        console.log("Not implemented");
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