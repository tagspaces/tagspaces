define(function(require, exports, module) {
"use strict";

exports.config = {
    "id": "viewerBrowser", // ID should be equal to the directory name where the ext. is located   
    "title": "Browser Viewer",
    "type": "viewer", // editor, viewer, ts for tagspace
    "supportedFileTypes": [
        "*",
        ],        
}

exports.init = function(elementID) {
    console.debug("Initalization Browser Viewer...");
    var viewer = document.getElementById(elementID);
    viewer.innerHTML = '<iframe id="idFrameViewer"></iframe>';                 
}

exports.viewerMode = function(isViewerMode) {

}

exports.setContent = function(content) {
    document.getElementById('idFrameViewer').src = content;
}

exports.getContent = function() {

}

});