/* Copyright (c) 2013 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";

	console.log("Loading viewerImage");

	exports.id = "viewerImage"; // ID should be equal to the directory name where the ext. is located   
	exports.title = "Image Viewer";
	exports.type = "viewer";
	exports.supportedFileTypes = [ "jpeg", "jpg", "png",  "gif", "bmp" ];
	
	var TSCORE = require("tscore");
	
	var extensionDirectory = TSCORE.Config.getExtensionPath()+"/"+exports.id;
	
	exports.init = function(filePath, elementID) {
	    console.log("Initalization Browser Image Viewer...");
	    filePath = "file:///"+filePath;
	
	    $('#'+elementID).append($('<img>', {
	    	id: "imgViewer",
			src: filePath
	    }));
	
	// TODO croppr integration
	//	require([extensionDirectory+'/croppr.js'], function() {
	//
	//	});    
	}
	
	exports.viewerMode = function(isViewerMode) {
		console.log("viewerMode not supported on this extension");  
	}
	
	exports.setContent = function(content) {
		console.log("setContent not supported on this extension"); 	
	}
	
	exports.getContent = function() {
		console.log("getContent not supported on this extension"); 	
	}

});