define(function(require, exports, module) {
"use strict";

exports.config = {
    "id": "viewerImage", // ID should be equal to the directory name where the ext. is located   
    "title": "Image Viewer",
    "type": "viewer", // editor, viewer, ts for tagspace
    "supportedFileTypes": [
        "jpeg",
        "jpg",
        "png",
        "gif",
        "bmp",
        ],        
}

var extensionDirectory = TSSETTINGS.getExtensionPath()+UIAPI.getDirSeparator()+exports.config["id"];

exports.init = function(filePath, elementID) {
    console.debug("Initalization Browser Image Viewer...");
    filePath = "file:///"+filePath;

    $('#'+elementID).append($('<img>', {
    	id: "imgViewer",
		src: filePath
    }));

	require([extensionDirectory+'/croppr.js'], function() {

	});    
}

exports.viewerMode = function(isViewerMode) {
	console.debug("viewerMode not supported on this extension");  
}

exports.setContent = function(content) {
	console.debug("setContent not supported on this extension"); 	
}

exports.getContent = function() {
	console.debug("getContent not supported on this extension"); 	
}

});