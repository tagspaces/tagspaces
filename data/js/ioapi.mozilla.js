/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

// The mozilla implementation of the IOAPI "class"
define(function(require, exports, module) {
"use strict";

console.log("Loading ioapi.mozilla.js..");

var TSCORE = require("tscore");

var TSPOSTIO = require("tspostioapi");

document.documentElement.addEventListener("tsMessage", function(event) {
    console.log("Message received in page script from content script: "); //+JSON.stringify(event.detail));
    TSCORE.hideLoadingAnimation();
    var message = event.detail;
    switch (message.command) {
      case "loadSettings":
        if(message.success) {
            try {
                console.log("Loading settings...: "+JSON.stringify(message.content));
                TSCORE.Config.updateSettingMozillaPreferences(message.content);

                TSCORE.initConnections();
                TSCORE.generateTagGroups();
                  
            } catch (ex) {
                console.log("Exception while getting setting from firefox failed "+ex)
            }
        } else {
            console.log("Getting setting from firefox failed") 
        }
        break;
      case "saveSettings":
        if(message.success) {
            console.log("Saving setting as native mozilla preference successfull!")
        } else {
            console.log("Saving setting as native mozilla preference failed!")            
        }
        break;        
      case "rename":
        if(message.success){
            TSPOSTIO.renameFile(message.content[0],message.content[1]);
        } else {
            TSCORE.updateLogger("Rename failed");        
        }
        break;
      case "saveTextFile":
        if(message.success){
            TSPOSTIO.saveTextFile(message.content);
        } else {
            TSCORE.updateLogger("Save failed");      
        }
        break;
      case "createDirectory":
        if(message.success){
            TSPOSTIO.createDirectory();
        } else {
            TSCORE.updateLogger("Create dir failed");        
        }
        break;
      case "loadTextFile":
        if(message.success){
            TSPOSTIO.loadTextFile(message.content);
        } else {
            TSCORE.updateLogger("File loading failed");      
        }
        break;
      case "listDirectory":
        if(message.success){
            TSPOSTIO.listDirectory(message.content);       
        } else {
            TSCORE.updateLogger("List directory failed");        
        }
        break;      
      case "indexDirectory":
        if(message.success){
            TSPOSTIO.createDirectoryIndex(message.content);
        } else {
            TSCORE.updateLogger("Indexing directory failed");        
        }
        break;  
      case "createDirectoryTree":
        if(message.success){
            console.log("Directory tree: "+JSON.stringify(message.content));
            TSPOSTIO.createDirectoryTree(message.content);            
        } else {
            TSCORE.updateLogger("Indexing directory failed");        
        }
        break;  
      case "getSubdirs":
        if(message.success){
            var dirListing = [];
            for (var i=0; i < message.content.length; i++) {
                dirListing.push(message.content[i]);
            }
            // TODO JSON functions are a workarround for a bug....
            TSPOSTIO.getSubdirs(JSON.parse( JSON.stringify(dirListing)));
        } else {
            TSCORE.updateLogger("Getting subdirs failed");       
        }
        break;  
      case "delete":
        if(message.success){
            TSPOSTIO.deleteElement();         
        } else {
            TSCORE.updateLogger("Delete failed");        
        }
        break;          
      case "selectDirectory":
        if(message.success){
            TSPOSTIO.selectDirectory(message.content);
        } else {
            TSCORE.updateLogger("Selecting directory failed.");        
        }
        break;  
      case "checkNewVersion":
        if(message.success){
            TSPOSTIO.checkNewVersion(message.content);
        } else {
            TSCORE.updateLogger("Create dir failed");        
        }
        break;                  
      default:
        break;
    }   
}, false);

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
