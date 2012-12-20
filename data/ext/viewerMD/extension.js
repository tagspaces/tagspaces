define(function(require, exports, module) {
"use strict";

exports.config = {
    "id": "viewerMD", // ID should be equal to the directory name where the ext. is located   
    "title": "MD Viewer",
    "type": "editor", // viewer, ts for tagspace
    "supportedFileTypes": [
        "md", "markdown"
     ]        
}

var md2htmlConverter = undefined;
var containerElID = undefined;

exports.init = function(filePath, containerElementID) {
    console.debug("Initalization MD Viewer...");
    containerElID = containerElementID;
//	require(['css!./bootstrapLite.css']);
	require(['./showdown/showdown'], function() {
		md2htmlConverter = new Showdown.converter();
		IOAPI.loadTextFile(filePath);
	});
}

exports.setFileType = function(fileType) {
    console.debug("setFileType not supported on this extension");      
}

exports.viewerMode = function(isViewerMode) {
    // set readonly      
}

exports.setContent = function(content) {
   var html = md2htmlConverter.makeHtml(content);
   $('#'+containerElID).append(html);   
}

exports.getContent = function() {
	$('#'+containerElID).html(); 
}

});