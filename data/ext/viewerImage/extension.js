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

exports.init = function(elementID) {
    console.debug("Initalization Browser Viewer...");
    var viewer = document.getElementById(elementID);
    viewer.innerHTML = '<img id="idImageViewer"></img>';                 
}

exports.viewerMode = function(isViewerMode) {

}

exports.setContent = function(content) {
    document.getElementById('idImageViewer').src = content;
}

exports.getContent = function() {

}

});