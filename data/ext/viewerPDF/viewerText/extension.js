/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";

	console.log("Loading viewerText");

	exports.id = "viewerText"; // ID should be equal to the directory name where the ext. is located   
	exports.title = "Text Viewer";
	exports.type = "viewer";
	exports.supportedFileTypes = [ "*" ];
	
	var TSCORE = require("tscore");	
	
	var containerElID = undefined;
	
	var extensionDirectory = TSCORE.Config.getExtensionPath()+"/"+exports.id;
	
	exports.init = function(filePath, containerElementID) {
	    console.log("Initalization Text Viewer...");
	    containerElID = containerElementID;

    	TSCORE.IO.loadTextFile(filePath);

	}
	
	exports.setFileType = function(fileType) {
	    console.log("setFileType not supported on this extension");      
	}
	
	exports.viewerMode = function(isViewerMode) {
	    // set readonly      
	}
	
	exports.setContent = function(content) {
        $('#'+containerElID).empty();
        $('#'+containerElID).append($('<textarea>', {
            style: "overflow: auto; height: 100%; margin: 3px; background-color: white; border-width: 0px;",
            })
            .append(content)
            ); 

	}
	
	exports.getContent = function() {
		$('#'+containerElID).html(); 
	}

});