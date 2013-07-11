/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";
	
	// Activating browser specific exports modul
	console.log("Loading ioapi.chrome.js..");

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
    
Missing:
    renameFile
    createDirectory 
    openDirectory
    selectDirectory 
    
    fileSize buggy
    lastModified datetime
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
            for (var i=0; i < dirList.length; i++) {
            	var path = dirPath+getDirseparator()+dirList[i];
            	var isDir = nativeIO.isDirectory(path);
                var fileSize = 0; //nativeIO.getFileSize(path);
                index.push({
	                "name": dirList[i],
	                "type": isDir?"directory":"file",
	                "size": fileSize,
	                "lmdt": "0",
	                "path": path  
                }); 
	            if (isDir) {
	                scanDirectory(path, index);
	            }	    	                
            }
	        return index;
	    } catch(ex) {
	        console.error("Listing directory failed "+ex);
	    }   
	}
	
    function generateDirectoryTree(dirPath) {
        try {
            var tree = {}; 
            tree["name"] = dirPath.substring(dirPath.lastIndexOf(getDirseparator()) + 1, dirPath.length);
            tree["type"] = "directory";
            tree["lmdt"] = 0;   
            tree["path"] = dirPath;         
            tree["children"] = [];            
            var dirList = nativeIO.getDirEntries(dirPath); 
            for (var i=0; i < dirList.length; i++) {
                var path = dirPath+getDirseparator()+dirList[i];
                var isDir = nativeIO.isDirectory(path);
                if (!isDir) {
                    tree["children"].push({
                        "name": dirList[i],
                        "type": "file",
                        "size": 0,
                        "lmdt": 0,   
                        "path": path 
                    });            
                } else {
                    tree["children"].push( generateDirectoryTree(path) );                   
                }  
            }
            return tree;
        } catch(ex) {
            console.error("Scanning directory "+dirPath+" failed "+ex);
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
	
    exports.checkNewVersion = function() {
        console.log("Checking for new version...");
        var cVer = TSCORE.Config.DefaultSettings["appVersion"]+"."+TSCORE.Config.DefaultSettings["appBuild"];
        $.ajax({
            url: 'http://tagspaces.org/releases/version.json?cVer='+cVer,
            type: 'GET',
        })
        .done(function(data) { 
            TSCORE.updateNewVersionData(data);    
        })
        .fail(function(data) { 
            console.log("AJAX failed "+data); 
        })
        ;            
    }	
	
	exports.loadTextFile = function(filePath) {
		console.log("Loading file: "+filePath);
	    if(nativeIO.fileExists(filePath)) {
            var blob;
            var size = nativeIO.getFileSize(filePath);
            if (size){
                var byteArray = nativeIO.contentsAtPath(filePath);
                blob = new Int8Array(byteArray);
            } else {
                blob = new Int8Array(0);
            }
            var b = new Blob([blob]);
            b.size = size;
            var reader = new FileReader();
            reader.onload = function (e) {
                TSCORE.FileOpener.updateEditorContent(e.target.result);   
            }
            reader.readAsText(b);
	    } else {
	        console.error("File does not exists...");
	    }	
	}
	
	exports.listDirectory = function(dirPath) {
		console.log("Listing directory: "+dirPath);
		if(nativeIO.isDirectory(dirPath)) {
			try {
				var dirList = nativeIO.getDirEntries(dirPath);
	            var anotatedDirList = [];
	            for (var i=0; i < dirList.length; i++) {
	            	var path = dirPath+getDirseparator()+dirList[i];
	            	var isDir = nativeIO.isDirectory(path);
                    var fileSize = 0; //nativeIO.getFileSize(path);
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
		console.log("Getting subdirs: "+dirPath);
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
        console.log("Deleting: "+path);
        try {
            nativeIO.removeRecursively(path)            
        } catch(ex) {
            console.error("Deleting file failed "+ex);
        }
    }

    exports.createDirectoryIndex = function(dirPath) {
        console.log("Creating index for directory: "+dirPath);
        var directoryIndex = [];
        directoryIndex = scanDirectory(dirPath, directoryIndex);
        //console.log(JSON.stringify(directoryIndex));
        TSCORE.PerspectiveManager.updateFileBrowserData(directoryIndex);
    }
    
    exports.createDirectoryTree = function(dirPath) {
        console.log("Creating directory index for: "+dirPath);
        var directoyTree = generateDirectoryTree(dirPath);
        //console.log(JSON.stringify(directoyTree));
        TSCORE.PerspectiveManager.updateTreeData(directoyTree); 
    }

    exports.saveTextFile = function(filePath,content) {
        // TODO implement saveTextFile use saveBlobToFile
        console.log("Saving file: "+filePath);
        console.log("Saving file functionality not implemented on chrome yet!");
        TSCORE.showAlertDialog("Saving file functionality not implemented on chrome yet!")
    }   
	
    exports.renameFile = function(filePath, newFilePath) {
        // TODO implement renameFile
        console.log("Renaming file: "+filePath+" to "+newFilePath);
        console.log("Renaming file functionality not implemented on chrome yet!");
        TSCORE.showAlertDialog("Renaming file functionality not implemented on chrome yet!")
    }

	exports.selectDirectory = function() {
        // TODO implement selectDirectory		
		console.log("Select directory functionality not implemented on chrome yet!");
	//	TSCORE.showAlertDialog("Not implemented yet");
        /* nativeIO.launchFolderSelect(function(dirPath){
			if (dirPath && dirPath.length){
				$("#favoriteLocation").val(dirPath);
			}
	       }); */
	}

    exports.openDirectory = function(dirPath) {
        // TODO implement openDirectory
        console.log("Open directory functionality not implemented on chrome yet!");
        TSCORE.showAlertDialog("Select file functionality not implemented on chrome yet!")
    }

    exports.createDirectory = function(dirPath) {
        // TODO implement create directory
        console.log("Creating directory: "+dirPath);    
        console.log("Creating directory functionality not implemented on chrome yet!");
        TSCORE.showAlertDialog("Creating directory functionality not implemented on chrome yet!")
    }   
	
	exports.selectFile = function() {
		// TODO implement selectFile
		console.log("Select file functionality not implemented on chrome yet!");
		TSCORE.showAlertDialog("Select file functionality not implemented on chrome yet!")
	}
	
	exports.openExtensionsDirectory = function() {
		// TODO implement openExtensionsDirectory
		console.log("Open extensions directory functionality not implemented on chrome yet!");
		TSCORE.showAlertDialog("Open extensions directory functionality not implemented on chrome yet!"); 
	}
});
