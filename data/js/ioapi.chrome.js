/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

// TODO use eventually this http://developer.chrome.com/extensions/fileBrowserHandler.html

define(function(require, exports, module) {
"use strict";
	
	// Activating browser specific exports modul
	console.debug("Loading ioapi.chrome.js..");
	
	var TSCORE = require("tscore");
	    
	/**
	    Interface of npapi-file-io
	    getPlatform() : string
	    fileExists(filename : string) : bool
	    isDirectory(filename : string) : bool
	    getTextFile(filename : string) : string
	    getBinaryFile(filename : string) : array<byte>
	    removeFile(filename : string) : void
	    listFiles(filename : string) : array<object>
	    
	    bool getFile(const char *filename, char *&value, size_t &len, const bool issBinary);
	    bool createDirectory(const char *filename);
	    bool saveText(const char *filename, const char *value, size_t len);
	    saveTextFile
	    bool saveBinaryFile(const char *filename, const char *bytes, const size_t len);
	    bool getTempPath(char *&value, size_t &len);
	    getTmpPath
	*/
	
	var plugin = document.createElement("embed");
	plugin.setAttribute("type", "application/x-npapi-file-io");
	plugin.style.position = "absolute";
	plugin.style.left = "-9999px";
	
	// Add plugin to document 
    document.documentElement.appendChild(plugin);    
	
	
	// Test if plugin works
	//console.debug("Current platform: "+plugin.getPlatform());  
	
	exports.createDirectory = function(dirPath) {
	    console.debug("Creating directory: "+dirPath);    
		if(plugin.isDirectory(dirPath)) {
			console.error("Directory already exists...");
		} else {
			if(plugin.createDirectory(dirPath)) {
				console.debug("Directory: "+dirPath+" created.");		
			} else {
				console.error("Directory creation failed");		
			}
		}
	}
	
	exports.loadTextFile = function(filePath) {
		console.debug("Loading file: "+filePath);
	    if(plugin.fileExists(filePath)) {
	        var fileContent = plugin.getTextFile(filePath);
	        TSCORE.FileOpener.updateEditorContent(fileContent);   
	    } else {
	        console.error("File does not exists...");
	    }	
	}
	
	// TODO Renaming very slow, due the copy implementation
	exports.renameFile = function(filePath, newFilePath) {
		console.debug("Renaming file: "+filePath+" to "+newFilePath);
		if(plugin.fileExists(newFilePath)) {
			console.error("Target file already exists: "+newFilePath);
		} else {
			if(plugin.fileExists(filePath)) {
				plugin.saveBinaryFile(newFilePath,plugin.getBinaryFile(filePath));
				plugin.removeFile(filePath);
	
	            if(TSCORE.FileOpener.isFileOpened()) {
	               TSCORE.FileOpener.openFile(newFilePath); 	
	            }   			
				TSCORE.ViewManager.refreshFileListContainer();
				
				console.debug("File renamed to: "+newFilePath);	
			} else { 
				console.error("Original file does not exists: "+filePath);		
			}
		}
	}
	
	exports.saveTextFile = function(filePath,content) {
		console.debug("Saving file: "+filePath);
	  	if(plugin.fileExists(filePath)) {
			plugin.removeFile(filePath);      		
	  	}
		plugin.saveTextFile(filePath,content);
	}
	
	exports.listDirectory = function(dirPath) {
		console.debug("Listing directory: "+dirPath);
		if(plugin.isDirectory(dirPath)) {
			try {
				var dirList = plugin.listFiles(dirPath);
				console.debug("Dir content: "+JSON.stringify(dirList)); 
	    		TSCORE.ViewManager.updateFileBrowserData(dirList);
			} catch(ex) {
				console.error("Directory listing failed "+ex);
			}		
		} else {
			console.error("Directory does not exists.");	
		}	
	}
	
	exports.getSubdirs = function(dirPath) {
		console.debug("Getting subdirs: "+dirPath);
	    if(plugin.isDirectory(dirPath)) {
	        try {
	            // Determine the directory separator
				var pathSeparator = plugin.getPlatform() == 'windows' ? "\\" : '/';
	            
	            var dirList = plugin.listFiles(dirPath);
	            var anotatedDirList = [];
	            for (var i=0; i < dirList.length; i++) {
	                if(dirList[i].type == "directory") {
	                    anotatedDirList.push({
	                        "title": dirList[i].name,
	                        "isFolder": true,
	                        "isLazy": true,
	                        "key": dirPath+pathSeparator+dirList[i].name 
	                    }); 
	                }            
	            } 
	            // TODO JSON functions are a workarround for a bug....               
	            TSCORE.updateSubDirs(JSON.parse( JSON.stringify(anotatedDirList)));
	        } catch(ex) {
	            console.error("Directory listing failed "+ex);
	        }       
	    } else {
	        console.error("Directory does not exists.");    
	    }
	}
	
	exports.deleteElement = function(path) {
		console.debug("Deleting: "+path);
		TSCORE.ViewManager.refreshFileListContainer();		
		plugin.removeFile(path)
	}
	
	exports.selectDirectory = function() {
		// TODO implement selectDirectory
		console.debug("Select directory functionality not implemented on chrome yet!");
		alert("Select directory functionality not implemented on chrome yet!")	
	}
	
	exports.selectFile = function() {
		// TODO implement selectFile
		console.debug("Select file functionality not implemented on chrome yet!");
		alert("Select file functionality not implemented on chrome yet!")
	}
	
	exports.openDirectory = function(dirPath) {
		// TODO implement openDirectory
		console.debug("Open directory functionality not implemented on chrome yet!");
		alert("Open directory functionality not implemented on chrome yet!");
	}
	
	exports.openExtensionsDirectory = function() {
		// TODO implement openExtensionsDirectory
		console.debug("Open extensions directory functionality not implemented on chrome yet!");
		alert("Open extensions directory functionality not implemented on chrome yet!"); 
	}
	
	exports.createDirectoryIndex = function(dirPath) {
		// TODO implement createDirectoryIndex
		console.debug("Directory indexing functionality not implemented on chrome yet!");
		alert("Directory indexing functionality not implemented on chrome yet!"); 
	}
	
	exports.createDirectoryTree = function(dirPath) {
	    console.debug("Creating directory index for: "+dirPath);
		console.debug("Creating Directory Tree functionality not implemented on chrome yet!");	
		// TODO implement createDirectoryTree
		TSCORE.ViewManager.updateTreeData(); 
	}

});

/* Needed for createDirectoryTree
function directoryTree(dirPath) {
    try {   
        var tree = {};
        var dirList = filesIO.list(dirPath);
        var directory = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsIFile);
		directory.initWithPath(dirPath);
		console.log("Directory "+JSON.stringify(directory));
		tree["name"] = directory.leafName;
        tree["type"] = "directory";
        tree["lmdt"] = directory.lastModifiedTime;   
        tree["path"] = dirPath; 		
		tree["children"] = [];

        for (var i=0; i < dirList.length; i++) {
            var path = filesIO.join(dirPath,dirList[i]);
            var file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsIFile);
            file.initWithPath(path);
            if (file.isFile()) {
	            tree["children"].push({
	                "name": file.leafName,
	                "type": "file",
	                "size": file.fileSize,
	                "lmdt": file.lastModifiedTime,   
	                "path": path 
	            });            
         	} else {
         		tree["children"].push( directoryTree(path) );	         		
         	}
        }       
        return tree;
    } catch(ex) {
        console.error("Creating directory index failed "+ex);
    }   
}*/