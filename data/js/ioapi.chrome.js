/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";
	
	// Activating browser specific exports modul
	console.log("Loading ioapi.chrome.js..");

	var TSCORE = require("tscore");
	
	var TSPOSTIO = require("tspostioapi");    
/**
API of npapifileioforchrome:

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
    
    bool NPAPIFileIOforChromeAPI::renameFile(std::string oldPath, std::string newPath);
    std::time_t NPAPIFileIOforChromeAPI::lastDateModified(std::string strPath);
    
Still Missing:
    renameFile real one
    openDirectory    
    fileSize buggy in a loop
    lastModified datetime completely missing
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
                var fileSize = 0;
                var lastDateModified = 0;
                if(!isDir) {
                    fileSize = nativeIO.getFileSize(path);
                    //lastDateModified = new Date(nativeIO.lastDateModified(path)*1000);
                }
                index.push({
	                "name": dirList[i],
	                "type": isDir?"directory":"file",
	                "size": fileSize,
	                "lmdt": lastDateModified,
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
                var fileSize = 0;
                var lastDateModified = 0;
                if (!isDir) {
                    fileSize = nativeIO.getFileSize(path);
                    //lastDateModified = new Date(nativeIO.lastDateModified(path)*1000);
                    tree["children"].push({
                        "name": dirList[i],
                        "type": "file",
                        "size": fileSize,
                        "lmdt": lastDateModified,   
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
            TSPOSTIO.checkNewVersion(data);    
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
                TSPOSTIO.loadTextFile(e.target.result);   
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
                    var fileSize = 0;
                    var lastDateModified = 0;
                    if(!isDir) {
                        fileSize = nativeIO.getFileSize(path);
                        //lastDateModified = new Date(nativeIO.lastDateModified(path)*1000);
                    }
                    anotatedDirList.push({
		                "name": dirList[i],
		                "type": isDir?"directory":"file",
		                "size": fileSize,
		                "lmdt": lastDateModified,
		                "path": path  
                    }); 
	            } 
	            TSPOSTIO.listDirectory(anotatedDirList);
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
                TSPOSTIO.getSubdirs(anotatedDirList);
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
            nativeIO.removeRecursively(path); 
            TSPOSTIO.deleteElement();           
        } catch(ex) {
            console.error("Deleting file failed "+ex);
        }
    }

    exports.createDirectoryIndex = function(dirPath) {
        console.log("Creating index for directory: "+dirPath);
        var directoryIndex = [];
        directoryIndex = scanDirectory(dirPath, directoryIndex);
        //console.log(JSON.stringify(directoryIndex));
        TSPOSTIO.createDirectoryIndex(directoryIndex);
    }
    
    exports.createDirectoryTree = function(dirPath) {
        console.log("Creating directory index for: "+dirPath);
        var directoyTree = generateDirectoryTree(dirPath);
        //console.log(JSON.stringify(directoyTree));
        TSPOSTIO.createDirectoryTree(directoyTree);
    }

    exports.saveTextFile = function(filePath,content) {
        console.log("Saving file: "+filePath);
        var byteArray = [];
        for (var i = 0; i < content.length; ++i)
        {
            byteArray.push(content.charCodeAt(i));
        }
        var blobInt8 = new Int8Array(byteArray);
        var blob = new Blob([blobInt8]);           
        var reader = new FileReader();
        reader.onloadend = function(e){
            var data = Array.prototype.slice.call(new Uint8Array(reader.result), 0);
            nativeIO.saveBlobToFile(filePath, data);
            TSPOSTIO.saveTextFile(filePath);
        }
        reader.readAsArrayBuffer(blob);
    }   

    exports.createDirectory = function(dirPath) {
        console.log("Creating directory: "+dirPath);    
        try {
            nativeIO.createDirectory(dirPath);
            TSPOSTIO.createDirectory();
        } catch(ex) {
            console.error("Deleting file failed "+ex);
        }
    }  
	
    exports.renameFile = function(filePath, newFilePath) {
        // TODO use a more efficient rename functionality
        // currently the file is copied to the new location and than
        // deleted from the old location
        /*
        if(nativeIO.renameFile(filePath, newFilePath)) {
            TSPOSTIO.renameFile(filePath, newFilePath);
        } else {
            console.error("File renaming moving failed!");            
        } */

        console.log("Renaming file: "+filePath+" to "+newFilePath);
        if(filePath.toLowerCase() == newFilePath.toLowerCase()) {
            console.error("Initial and target filenames are the same...");
            return;            
        }
        if(nativeIO.fileExists(filePath)) {
            var blob;
            var size = nativeIO.getFileSize(filePath);
            // TODO remove the 5MB restriction
            if(size > 5*1024*1024) {
                TSCORE.showAlertDialog("Currently TagSpaces does not support renaming/tagging of files bigger than 5MB!");
                return;                
            }
            if (size){
                var byteArray = nativeIO.contentsAtPath(filePath);
                blob = new Int8Array(byteArray);
            } else {
                blob = new Int8Array(0);
            }
            var b = new Blob([blob]);
            b.size = size;
            var reader = new FileReader();
            reader.onloadend = function(e){
                var data = Array.prototype.slice.call(new Uint8Array(reader.result), 0);
                nativeIO.saveBlobToFile(newFilePath, data);
                if(nativeIO.fileExists(newFilePath)) {
                    nativeIO.removeRecursively(filePath);                    
                }
                TSPOSTIO.renameFile(filePath,newFilePath);                
            }
            reader.readAsArrayBuffer(b);
        } else {
            console.error("File does not exists...");
        }  

    }

	exports.selectDirectory = function() {
		console.log("Select directory!");
        nativeIO.launchFolderSelect(function(dirPath){
			if (dirPath && dirPath.length){
				TSPOSTIO.selectDirectory(dirPath);
			}
	    });
	}

    exports.selectFile = function() {
        console.log("Select file!");
        nativeIO.launchFileSelect(function(filePath){
            if (filePath && filePath.length){
                //$("#folderLocation").val(dirPath);
            }
        });
    }
    
    exports.checkAccessFileURLAllowed = function() {
        chrome.extension.isAllowedFileSchemeAccess(function(isAllowedAccess) {
            if(!isAllowedAccess) {
               TSCORE.showAlertDialog(
                    "Please make shure that you select the 'Allow access to file URLs'"+
                    " checkbox as shown in the following screenshot "+
                    " from the extension ('chrome://extensions/') settings of chrome/chromium"+
                    "<img src='chrome/ChromeAllowAccessFileURLs.png' />",
                     "TagSpaces can not read files from your local disk!"
               );               
            }
        });          
    }
    
    exports.openDirectory = function(dirPath) {
        // TODO implement openDirectory
        console.log("Open directory functionality not implemented on chrome yet!");
        TSCORE.showAlertDialog("Select file functionality not implemented on chrome yet!");
    }
	
	exports.openExtensionsDirectory = function() {
		// TODO implement openExtensionsDirectory
		console.log("Open extensions directory functionality not implemented on chrome yet!");
		TSCORE.showAlertDialog("Open extensions directory functionality not implemented on chrome yet!"); 
	}
});
