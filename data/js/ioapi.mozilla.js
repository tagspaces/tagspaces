/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

// The mozilla implementation of the IOAPI "class"
define(function(require, exports, module) {
"use strict";

console.debug("Loading ioapi.mozilla.js..");

var TSCORE = require("tscore");

exports.saveSettings = function(content) {
    console.debug("Saving setting...");        
    TSCORE.showLoadingAnimation();
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
        "command": "saveSettings",
        "content": content
    }});
    document.documentElement.dispatchEvent(event);
}

exports.loadSettings = function() {
    console.debug("Loading setting from firefox preferences...");
    TSCORE.showLoadingAnimation();            
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
        "command": "loadSettings"
    }});
    document.documentElement.dispatchEvent(event);
}

exports.createDirectory = function(dirPath) {
	console.debug("Directory "+dirPath+" created.");
    TSCORE.showLoadingAnimation();			
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
		"command": "createDirectory",
		"path": dirPath
	}});
    document.documentElement.dispatchEvent(event);
}

exports.loadTextFile = function(filePath) {
	console.debug("Loading file: "+filePath);
    TSCORE.showLoadingAnimation();	
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
		"command": "loadTextFile",
		"path": filePath
	}});
    document.documentElement.dispatchEvent(event);	
}

exports.renameFile = function(filePath, newFilePath) {
	console.debug("Renaming "+filePath+" to "+newFilePath);
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
	console.debug("Saving file: "+filePath);
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
	console.debug("Listing directory: "+dirPath);
    TSCORE.showLoadingAnimation();	
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
		"command": "listDirectory",
		"path": dirPath
	}});
    document.documentElement.dispatchEvent(event);		
}

exports.getSubdirs = function(dirPath) {
	console.debug("Getting subdirs: "+dirPath);
    TSCORE.showLoadingAnimation();	
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
		"command": "getSubdirs",
		"path": dirPath
	}});	
    document.documentElement.dispatchEvent(event);	
}

exports.deleteElement = function(path) {
	console.debug("Deleting: "+path);
    TSCORE.showLoadingAnimation();	
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
		"command": "delete",
		"path": path
	}});
    document.documentElement.dispatchEvent(event);	
}

exports.selectDirectory = function() {
	console.debug("Selecting directory...");
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
		"command": "selectDirectory",
	}});
    document.documentElement.dispatchEvent(event);	
}

exports.selectFile = function() {
	console.debug("Selecting file...");
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
		"command": "selectFile"
	}});
    document.documentElement.dispatchEvent(event);	
}
    
exports.openDirectory = function(dirPath) {
	console.debug("Opening directory: "+dirPath);
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
		"command": "openDirectory",
		"path": dirPath,
	}});
    document.documentElement.dispatchEvent(event);	
}

exports.openExtensionsDirectory = function() {
    console.debug("Opening extensions directory...");
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
        "command": "openExtensionsDirectory"
    }});
    document.documentElement.dispatchEvent(event);  
}

exports.createDirectoryIndex = function(dirPath) {
    console.debug("Creating directory index for: "+dirPath);
    TSCORE.showLoadingAnimation();   
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
        "command": "createDirectoryIndex",
        "path": dirPath
    }});
    document.documentElement.dispatchEvent(event);  
}

exports.createDirectoryTree = function(dirPath) {
    console.debug("Creating directory tree for: "+dirPath);
    TSCORE.showLoadingAnimation();   
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
        "command": "createDirectoryTree",
        "path": dirPath
    }});
    document.documentElement.dispatchEvent(event);  
}

});
