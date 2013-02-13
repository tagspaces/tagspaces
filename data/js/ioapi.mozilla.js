/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
// Activating browser specific IOAPI modul

console.debug("Loading IOapiMozilla.js..");

// The mozilla implementation of the IOAPI "class"
IOAPI = (typeof IOAPI == 'object' && IOAPI != null) ? IOAPI : {
    
};

IOAPI.saveSettings = function(content) {
    console.debug("Saving setting...");        
    UIAPI.showLoadingAnimation();
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
        "command": "saveSettings",
        "content": content
    }});
    document.documentElement.dispatchEvent(event);
}

IOAPI.loadSettings = function() {
    console.debug("Loading setting from firefox preferences...");
    UIAPI.showLoadingAnimation();            
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
        "command": "loadSettings"
    }});
    document.documentElement.dispatchEvent(event);
}

IOAPI.createDirectory = function(dirPath) {
	console.debug("Renaming: "+dirPath+" created.");
    UIAPI.showLoadingAnimation();			
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
		"command": "createDirectory",
		"path": dirPath
	}});
    document.documentElement.dispatchEvent(event);
}

IOAPI.loadTextFile = function(filePath) {
	console.debug("Loading file: "+filePath);
    UIAPI.showLoadingAnimation();	
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
		"command": "loadTextFile",
		"path": filePath
	}});
    document.documentElement.dispatchEvent(event);	
}

IOAPI.renameFile = function(filePath, newFilePath) {
	console.debug("Renaming "+filePath+" to "+newFilePath);
    UIAPI.showLoadingAnimation();	
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
		"command": "rename",
		"path": filePath,
		"newPath": newFilePath	
	}});
    document.documentElement.dispatchEvent(event);
}

IOAPI.saveTextFile = function(filePath,content) {
	console.debug("Saving file: "+filePath);
    UIAPI.showLoadingAnimation();	
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
		"command": "saveTextFile",
		"path": filePath,
		"content": content	
	}});
    document.documentElement.dispatchEvent(event);	
}

IOAPI.listDirectory = function(dirPath) {
	console.debug("Listing directory: "+dirPath);
    UIAPI.showLoadingAnimation();	
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
		"command": "listDirectory",
		"path": dirPath
	}});
    document.documentElement.dispatchEvent(event);		
}

IOAPI.getSubdirs = function(dirPath) {
	console.debug("Getting subdirs: "+dirPath);
    UIAPI.showLoadingAnimation();	
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
		"command": "getSubdirs",
		"path": dirPath
	}});	
    document.documentElement.dispatchEvent(event);	
}

IOAPI.deleteElement = function(path) {
	console.debug("Deleting: "+path);
    UIAPI.showLoadingAnimation();	
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
		"command": "delete",
		"path": path
	}});
    document.documentElement.dispatchEvent(event);	
}

IOAPI.selectDirectory = function() {
	console.debug("Selecting directory...");
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
		"command": "selectDirectory"
	}});
    document.documentElement.dispatchEvent(event);	
}

IOAPI.selectFile = function() {
	console.debug("Selecting file...");
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
		"command": "selectFile"
	}});
    document.documentElement.dispatchEvent(event);	
}
    
IOAPI.openDirectory = function(dirPath) {
	console.debug("Opening directory: "+dirPath);
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
		"command": "openDirectory",
		"path": dirPath
	}});
    document.documentElement.dispatchEvent(event);	
}

IOAPI.openExtensionsDirectory = function() {
    console.debug("Opening extensions directory...");
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
        "command": "openExtensionsDirectory"
    }});
    document.documentElement.dispatchEvent(event);  
}

IOAPI.createDirectoryIndex = function(dirPath) {
    console.debug("Creating directory index for: "+dirPath);
    UIAPI.showLoadingAnimation();   
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
        "command": "createDirectoryIndex",
        "path": dirPath
    }});
    document.documentElement.dispatchEvent(event);  
}

IOAPI.createDirectoryTree = function(dirPath) {
    console.debug("Creating directory tree for: "+dirPath);
    UIAPI.showLoadingAnimation();   
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {"detail":{
        "command": "createDirectoryTree",
        "path": dirPath
    }});
    document.documentElement.dispatchEvent(event);  
}