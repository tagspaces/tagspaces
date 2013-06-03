/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

// The mozilla implementation of the IOAPI "class"
define(function(require, exports, module) {
"use strict";

console.log("Loading ioapi.mozilla.js..");

var TSCORE = require("tscore");

exports.saveSettings = function(content) {
    console.log("Saving setting...");        
    TSCORE.showLoadingAnimation();
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
        "command": "saveSettings",
        "content": content
    }});
    document.documentElement.dispatchEvent(event);
}

exports.loadSettings = function() {
    console.log("Loading setting from firefox preferences...");
    TSCORE.showLoadingAnimation();            
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
        "command": "loadSettings"
    }});
    document.documentElement.dispatchEvent(event);
}

exports.createDirectory = function(dirPath) {
	console.log("Directory "+dirPath+" created.");
    TSCORE.showLoadingAnimation();			
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
		"command": "createDirectory",
		"path": dirPath
	}});
    document.documentElement.dispatchEvent(event);
}

exports.loadTextFile = function(filePath) {
	console.log("Loading file: "+filePath);
    TSCORE.showLoadingAnimation();	
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
		"command": "loadTextFile",
		"path": filePath
	}});
    document.documentElement.dispatchEvent(event);	
}

exports.renameFile = function(filePath, newFilePath) {
	console.log("Renaming "+filePath+" to "+newFilePath);
    TSCORE.showLoadingAnimation();	
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
		"command": "rename",
		"path": filePath,
		"newPath": newFilePath	
	}});
    document.documentElement.dispatchEvent(event);
}

exports.saveTextFile = function(filePath,content) {
	console.log("Saving file: "+filePath);
    TSCORE.showLoadingAnimation();	
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
		"command": "saveTextFile",
		"path": filePath,
		"content": content	
	}});
    document.documentElement.dispatchEvent(event);	
}

exports.listDirectory = function(dirPath) {
	console.log("Listing directory: "+dirPath);
    TSCORE.showLoadingAnimation();	
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
		"command": "listDirectory",
		"path": dirPath
	}});
    document.documentElement.dispatchEvent(event);		
}

exports.getSubdirs = function(dirPath) {
	console.log("Getting subdirs: "+dirPath);
    TSCORE.showLoadingAnimation();	
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
		"command": "getSubdirs",
		"path": dirPath
	}});	
    document.documentElement.dispatchEvent(event);	
}

exports.deleteElement = function(path) {
	console.log("Deleting: "+path);
    TSCORE.showLoadingAnimation();	
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
		"command": "delete",
		"path": path
	}});
    document.documentElement.dispatchEvent(event);	
}

exports.selectDirectory = function() {
	console.log("Selecting directory...");
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
		"command": "selectDirectory",
	}});
    document.documentElement.dispatchEvent(event);	
}

exports.selectFile = function() {
	console.log("Selecting file...");
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
		"command": "selectFile"
	}});
    document.documentElement.dispatchEvent(event);	
}
    
exports.openDirectory = function(dirPath) {
	console.log("Opening directory: "+dirPath);
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
		"command": "openDirectory",
		"path": dirPath,
	}});
    document.documentElement.dispatchEvent(event);	
}

exports.openExtensionsDirectory = function() {
    console.log("Opening extensions directory...");
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
        "command": "openExtensionsDirectory"
    }});
    document.documentElement.dispatchEvent(event);  
}

exports.createDirectoryIndex = function(dirPath) {
    console.log("Creating directory index for: "+dirPath);
    TSCORE.showLoadingAnimation();   
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
        "command": "createDirectoryIndex",
        "path": dirPath
    }});
    document.documentElement.dispatchEvent(event);  
}

exports.createDirectoryTree = function(dirPath) {
    console.log("Creating directory tree for: "+dirPath);
    TSCORE.showLoadingAnimation();   
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
        "command": "createDirectoryTree",
        "path": dirPath
    }});
    document.documentElement.dispatchEvent(event);  
}

exports.checkNewVersion = function() {
    console.log("Checking for new version...");
    TSCORE.showLoadingAnimation();   
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
        "command": "checkNewVersion",
    }});
    document.documentElement.dispatchEvent(event);  
}

});
