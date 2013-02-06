define(function(require, exports, module) {
"use strict";

exports.id = "viewerMD"; // ID should be equal to the directory name where the ext. is located   
exports.title = "MD Viewer";
exports.type = "editor";
exports.supportedFileTypes = [ "md", "markdown", "mdown" ];

var md2htmlConverter = undefined;
var containerElID = undefined;

var extensionDirectory = TSSETTINGS.getExtensionPath()+UIAPI.getDirSeparator()+exports.id;

exports.init = function(filePath, containerElementID) {
    console.debug("Initalization MD Viewer...");
    containerElID = containerElementID;
    // TODO create a css namespace for the specific styles
//	require(['css!'+extensionDirectory+'/bootstrapLite.css']);
	require([extensionDirectory+'/showdown/showdown.js'], function() {
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