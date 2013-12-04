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
IO-API

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
    std::time_t NPAPIFileIOforChromeAPI::getFileLastDateModified(std::string strPath);
    void launchFolder(std::string path); -- not implemented yet

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
                    if(isWin) {
                    	lastDateModified = new Date(nativeIO.getFileLastDateModified(path)*1000);                    	
                    }
                }
                index.push({
	                "name":   dirList[i],
	                "isFile": !isDir,
	                "size":   fileSize,
	                "lmdt":   lastDateModified,
	                "path":   path  
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
            tree["type"] = false;
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
                    if(isWin) {
                    	lastDateModified = new Date(nativeIO.getFileLastDateModified(path)*1000);                    	
                    }
                    tree["children"].push({
                        "name":   dirList[i],
                        "isFile": true,
                        "size":   fileSize,
                        "lmdt":   lastDateModified,   
                        "path":   path 
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
	
    var checkNewVersion = function() {
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
    };	
	
	var loadTextFile = function(filePath) {
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
            };
            reader.readAsText(b);
	    } else {
	        console.error("File does not exists...");
	    }	
	};
	
	var listDirectory = function(dirPath) {
		console.log("Listing directory: "+dirPath);
		if(nativeIO.isDirectory(dirPath)) {
			//try {
				var dirList = nativeIO.getDirEntries(dirPath);
	            var anotatedDirList = [];
	            for (var i=0; i < dirList.length; i++) {
	            	var path = dirPath+getDirseparator()+dirList[i];
	            	var isDir = nativeIO.isDirectory(path);
                    var fileSize = 0;
                    var lastDateModified = 0;
                    if(!isDir) {
                        fileSize = nativeIO.getFileSize(path);
	                    if(isWin) {
	                    	lastDateModified = new Date(nativeIO.getFileLastDateModified(path)*1000);                    	
	                    }
                    }
                    anotatedDirList.push({
		                "name": dirList[i],
		                "isFile": !isDir,
		                "size": fileSize,
		                "lmdt": lastDateModified,
		                "path": path  
                    }); 
	            } 
	            TSPOSTIO.listDirectory(anotatedDirList);
			//} catch(ex) {
			//	console.error("Directory listing failed "+ex);
			//}		
		} else {
			console.error("Directory does not exists.");	
		}	
	};

    var deleteElement = function(path) {
        console.log("Deleting: "+path);
        try {
        	if(!nativeIO.isDirectory(path)) {
            	nativeIO.removeRecursively(path);         		
        	}
            TSPOSTIO.deleteElement();           
        } catch(ex) {
            console.error("Deleting file failed "+ex);
        }
    };

    var createDirectoryIndex = function(dirPath) {
        console.log("Creating index for directory: "+dirPath);
        var directoryIndex = [];
        directoryIndex = scanDirectory(dirPath, directoryIndex);
        //console.log(JSON.stringify(directoryIndex));
        TSPOSTIO.createDirectoryIndex(directoryIndex);
    };
    
    var createDirectoryTree = function(dirPath) {
        console.log("Creating directory index for: "+dirPath);
        var directoyTree = generateDirectoryTree(dirPath);
        //console.log(JSON.stringify(directoyTree));
        TSPOSTIO.createDirectoryTree(directoyTree);
    };

    var saveTextFile = function(filePath,content) {
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
        };
        reader.readAsArrayBuffer(blob);
    };   

    var createDirectory = function(dirPath) {
        console.log("Creating directory: "+dirPath);    
        try {
            nativeIO.createDirectory(dirPath);
            TSPOSTIO.createDirectory();
        } catch(ex) {
            console.error("Deleting file failed "+ex);
        }
    };  
	
    var renameFile = function(filePath, newFilePath) {
        console.log("Renaming file: "+filePath+" to "+newFilePath);
        if(filePath.toLowerCase() == newFilePath.toLowerCase()) {
            console.log("Initial and target filenames are the same...");
            return false;            
        }
	    if(nativeIO.fileExists(newFilePath)) {
	        console.log("File renaming failed! Target filename already exists.");
	        return false; 	    	
	    }        
        if(isWin) {
	        if(nativeIO.renameFile(filePath, newFilePath)) {
	            TSPOSTIO.renameFile(filePath, newFilePath);
	        } else {
	            console.error("File renaming failed!");            
	        }
        } else {
	        if(nativeIO.fileExists(filePath)) {
	            var blob;
	            var size = nativeIO.getFileSize(filePath);
	            // TODO remove the 5MB restriction
	            if(size > 5*1024*1024) {
	                TSCORE.showAlertDialog("In Chrome, TagSpaces does not support renaming/tagging of files bigger than 5MB!");
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
	            };
	            reader.readAsArrayBuffer(b);
	        } else {
	            console.error("File does not exists...");
	        }          	
        }
    };

	var selectDirectory = function() {
		console.log("Select directory!");
        nativeIO.launchFolderSelect(function(dirPath){
			if (dirPath && dirPath.length){
				TSPOSTIO.selectDirectory(dirPath);
			}
	    });
	};

    var selectFile = function() {
        console.log("Select file!");
        nativeIO.launchFileSelect(function(filePath){
            if (filePath && filePath.length){
                //$("#folderLocation").val(dirPath);
            }
        });
    };
    
    var checkAccessFileURLAllowed = function() {
        chrome.extension.isAllowedFileSchemeAccess(function(isAllowedAccess) {
            if(!isAllowedAccess) {
               TSCORE.showAlertDialog(
                    "Please make sure that you check the 'Allow access to file URLs'"+
                    " checkbox as shown in the following screenshot "+
                    " from the extension ('chrome://extensions/') settings of chrome/chromium"+
                    "<img src='chrome/ChromeAllowAccessFileURLs.png' />",
                     "TagSpaces can not read files from your local disk!"
               );               
            }
        });          
    };
    
    var openDirectory = function(dirPath) {
        // TODO implement openDirectory
        console.log("Open directory functionality not implemented in chrome yet!");
        TSCORE.showAlertDialog("Select file functionality not implemented on chrome yet!");
    };
	
	var openExtensionsDirectory = function() {
		// TODO implement openExtensionsDirectory
		console.log("Open extensions directory functionality not implemented in chrome yet!");
		TSCORE.showAlertDialog("Open extensions directory functionality not implemented on chrome yet!"); 
	};
	
	exports.createDirectory 			= createDirectory; 
	exports.renameFile 					= renameFile;
	exports.loadTextFile 				= loadTextFile;
	exports.saveTextFile 				= saveTextFile;
	exports.listDirectory 				= listDirectory;
	exports.deleteElement 				= deleteElement;
    exports.createDirectoryIndex 		= createDirectoryIndex;
    exports.createDirectoryTree 		= createDirectoryTree;
	exports.selectDirectory 			= selectDirectory;
	exports.openDirectory				= openDirectory;
	exports.selectFile 					= selectFile;
	exports.openExtensionsDirectory 	= openExtensionsDirectory;
	exports.checkAccessFileURLAllowed 	= checkAccessFileURLAllowed;
	exports.checkNewVersion 			= checkNewVersion;	
});
