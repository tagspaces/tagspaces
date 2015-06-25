/* Copyright (c) 2014 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";

	console.log("Loading viewerEPUB");

	exports.id = "viewerEPUB"; // ID should be equal to the directory name where the ext. is located
	exports.title = "EPUB Viewer";
	exports.type = "viewer";
	exports.supportedFileTypes = [ "epub" ];
	
	var TSCORE = require("tscore");
	
	var extensionDirectory = TSCORE.Config.getExtensionPath()+"/"+exports.id;
	
    exports.init = function(filePath, elementID) {
        console.log("Initalization Browser EPUB Viewer...");
        $('#'+elementID).append($('<iframe>', {
            id: "iframeViewer",
            src: extensionDirectory+"/epub.js/index.html?file="+filePath,
            "nwdisable": "",
            "nwfaketop": ""
        }));
	};
	
	exports.viewerMode = function() {
		console.log("viewerMode not supported on this extension");  
	};
	
	exports.setContent = function() {
		console.log("setContent not supported on this extension"); 	
	};
	
	exports.getContent = function() {
		console.log("getContent not supported on this extension"); 	
	};
});
