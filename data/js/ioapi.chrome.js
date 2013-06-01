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
Old:
	    Interface of npapi-file-io
	    getTextFile(filename : string) : string
	    getBinaryFile(filename : string) : array<byte>
	    
	    bool getFile(const char *filename, char *&value, size_t &len, const bool issBinary);
	    bool saveText(const char *filename, const char *value, size_t len);
	    saveTextFile
	    bool saveBinaryFile(const char *filename, const char *bytes, const size_t len);

New:
    bool createDirectory(std::string path);
    bool saveBlobToFile(std::string path, FB::JSObjectPtr dataArray);
    FB::VariantList getDirEntries(std::string path);
    FB::JSAPIPtr contentsAtPath(std::string path);
    int getFileSize(std::string path);
    bool isDirectory(std::string path);
    bool fileExists(std::string path);
    bool removeRecursively(std::string path);
    void launchFolderSelect(FB::JSObjectPtr callback);
    void launchFileSelect(FB::JSObjectPtr callback); 
    void watchDirectory(std::string key, std::string path, FB::JSObjectPtr callback);
    void stopWatching(std::string key);
    std::string getChromeDataDir(std::string version);
	*/
	
	var plugin = document.createElement("embed");
	plugin.setAttribute("type", "application/x-npapifileioforchrome");
	plugin.setAttribute("id", "npApiPlugin");
	plugin.style.position = "absolute";
	plugin.style.left = "-9999px";
	
	// Add plugin to document 
    document.documentElement.appendChild(plugin);    
	
	window.nativeIO = document.getElementById("npApiPlugin");
	
	function scanDirectory(dirPath, index) {
	    try {  
			var dirList = nativeIO.getDirEntries(dirPath);
            var index = [];
            for (var i=0; i < dirList.length; i++) {
            	var path = dirPath+getDirseparator()+dirList[i];
            	var isDir = nativeIO.isDirectory(path);
                var fileSize = nativeIO.getFileSize(path);
                index.push({
	                "name": dirList[i],
	                "type": isDir?"directory":"file",
	                "size": fileSize,
	                "lmdt": "0",
	                "path": path  
                }); 
	            if (!file.isFile()) {
	                scanDirectory(path, index);
	            }	    	                
            }
	        return index;
	    } catch(ex) {
	        console.error("Listing directory failed "+ex);
	    }   
	}
	
	
	function isWindows() {
		return (navigator.platform == 'Win32');
	}
	
	function getDirseparator() {
		if(isWindows()) {
			return "\\";
		} else {
			return "/";
		}
	}
	
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
	
	exports.renameFile = function(filePath, newFilePath) {
		console.debug("Renaming file: "+filePath+" to "+newFilePath);

	}
	
	exports.saveTextFile = function(filePath,content) {
		console.debug("Saving file: "+filePath);
/*	  	if(plugin.fileExists(filePath)) {
			plugin.removeFile(filePath);      		
	  	}
		plugin.saveTextFile(filePath,content);*/
	}
	
	exports.listDirectory = function(dirPath) {
		console.debug("Listing directory: "+dirPath);
		if(plugin.isDirectory(dirPath)) {
			try {
				var dirList = nativeIO.getDirEntries(dirPath);
	            var anotatedDirList = [];
	            for (var i=0; i < dirList.length; i++) {
	            	var path = dirPath+getDirseparator()+dirList[i];
	            	var isDir = nativeIO.isDirectory(path);
                    var fileSize = nativeIO.getFileSize(path);
                    anotatedDirList.push({
		                "name": dirList[i],
		                "type": isDir?"directory":"file",
		                "size": fileSize,
		                "lmdt": "0",
		                "path": path  
                    }); 
	            } 
	    		TSCORE.PerspectiveManager.updateFileBrowserData(anotatedDirList);
			} catch(ex) {
				console.error("Directory listing failed "+ex);
			}		
		} else {
			console.error("Directory does not exists.");	
		}	
	}
	
	exports.getSubdirs = function(dirPath) {
		console.debug("Getting subdirs: "+dirPath);
	    if(nativeIO.isDirectory(dirPath)) {
	        try {
				var dirList = nativeIO.getDirEntries(dirPath);
	            var anotatedDirList = [];
	            for (var i=0; i < dirList.length; i++) {
	            	var path = dirPath+getDirseparator()+dirList[i];
	            	var isDir = nativeIO.isDirectory(path);
	                if(isDir) {
	                    anotatedDirList.push({
	                        "title": dirList[i],
	                        "isFolder": true,
	                        "key": path
	                    }); 
	                }            
	            } 
	            TSCORE.updateSubDirs(anotatedDirList);
	        } catch(ex) {
	            console.error("Directory listing failed "+ex);
	        }       
	    } else {
	        console.error("Directory does not exists.");    
	    }
	}
	
	exports.deleteElement = function(path) {
		console.debug("Deleting: "+path);
/*		TSCORE.PerspectiveManager.refreshFileListContainer();		
		plugin.removeFile(path)*/
	}
	
	exports.selectDirectory = function() {
		console.debug("Select directory functionality not implemented on chrome yet!");
	//	TSCORE.showAlertDialog("Not implemented yet");
/*		nativeIO.launchFolderSelect(function(dirPath){
			if (dirPath && dirPath.length){
				$("#favoriteLocation").val(dirPath);
			}
	}); */
	}
	
	exports.selectFile = function() {
		// TODO implement selectFile
		console.debug("Select file functionality not implemented on chrome yet!");
		TSCORE.showAlertDialog("Select file functionality not implemented on chrome yet!")
	}
	
	exports.openDirectory = function(dirPath) {
		// TODO implement openDirectory
		console.debug("Open directory functionality not implemented on chrome yet!");
		TSCORE.showAlertDialog("Select file functionality not implemented on chrome yet!")
	}
	
	exports.openExtensionsDirectory = function() {
		// TODO implement openExtensionsDirectory
		console.debug("Open extensions directory functionality not implemented on chrome yet!");
		TSCORE.showAlertDialog("Open extensions directory functionality not implemented on chrome yet!"); 
	}
	
	exports.createDirectoryIndex = function(dirPath) {
		// TODO implement createDirectoryIndex
		console.debug("Directory indexing functionality not implemented on chrome yet!");
		TSCORE.showAlertDialog("Directory indexing functionality not implemented on chrome yet!"); 
	}
	
	exports.createDirectoryTree = function(dirPath) {
	    console.debug("Creating directory index for: "+dirPath);
		console.debug("Creating Directory Tree functionality not implemented on chrome yet!");	
		// TODO implement createDirectoryTree
		TSCORE.PerspectiveManager.updateTreeData(); 
	}
	
    exports.checkNewVersion = function() {
        console.debug("Checking for new version...");
        var cVer = TSCORE.Config.DefaultSettings["appVersion"]+"."+TSCORE.Config.DefaultSettings["appBuild"];
        $.ajax({
            url: 'http://tagspaces.org/releases/version.json?cVer='+cVer,
            type: 'GET',
        })
        .done(function(data) { 
            TSCORE.updateNewVersionData(data);    
        })
        .fail(function(data) { 
               alert(data); 
        })
//        .always(function(data) { 
//                console.log("ajax complete: "+data); 
//            });
        ;            

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