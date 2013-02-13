/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

const {Cc,Ci,Cr} = require("chrome");
var filesIO = require("file");
var runtime = require("runtime");

function searchDir(dirPath, index, keewords) {
//    console.debug("Indexing directory: "+dirPath);
    var path = "";
    var isFile = false;
    try {   
        var dirList = filesIO.list(dirPath);

        for (var i=0; i < dirList.length; i++) {
            path = filesIO.join(dirPath,dirList[i]);
            isFile = filesIO.isFile(path);
            if(dirList[i].indexOf(keewords)>= 0) {
                index.push({
                    "name": dirList[i],
                    "type": isFile?"file":"directory",    
                    "path": path
                })                    
            }
            if(!isFile) {
                searchDir(path, index, keewords);
            }                 
        }       
        return index;
    } catch(ex) {
        console.error("Searching dir: "+path+" failed "+ex);
    }   
}

exports.searchDirectory = function searchDirectory(dirPath, keewords, worker) {
    console.debug("Searching directory: "+dirPath+" for: "+keewords);
    var resultIndex = [];
    resultIndex = searchDir(dirPath, resultIndex, keewords);
//    console.debug("Index: "+JSON.stringify(resultIndex));
    worker.postMessage({
        "command": "indexDirectory",
        "success": true,
        "content": directoryIndex
    }); 
}

exports.createDirectoryIndex = function createDirectoryIndex(dirPath, worker) {
    console.debug("Creating index for directory: "+dirPath);
    var directoryIndex = [];
    directoryIndex = scanDirectory(dirPath, directoryIndex);
//    console.debug("Index: "+JSON.stringify(directoryIndex));
    worker.postMessage({
        "command": "indexDirectory",
        "success": true,
        "content": directoryIndex
    }); 
}

exports.createDirectoryTree = function createDirectoryTree(dirPath, worker) {
    console.debug("Creating directory tree: "+dirPath);
    var dirTree = directoryTree(dirPath);
//    console.debug("Index: "+JSON.stringify(dirTree));
    worker.postMessage({
        "command": "createDirectoryTree",
        "success": true,
        "content": dirTree
    }); 
}

/* 
	"leafName":"2013",
	"permissions":438,
	"permissionsOfLink":438,
	"lastModifiedTime":1350309208000,
	"lastModifiedTimeOfLink":1350309208000,
	"fileSize":0,
	"fileSizeOfLink":0,
	"target":"Z:\\Chronique\\2013",
	"path":"Z:\\Chronique\\2013",
	"parent":{}
*/

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
}

function scanDirectory(dirPath, index) {
    try {   
        var dirList = filesIO.list(dirPath);
        for (var i=0; i < dirList.length; i++) {
            var path = filesIO.join(dirPath,dirList[i]);
            var file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsIFile);
            file.initWithPath(path);
            index.push({
                "name": file.leafName,
                "type": file.isFile()?"file":"directory",
                "size": file.fileSize,
                "lmdt": file.lastModifiedTime,   
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

exports.createDirectory = function createDirectory(filePath, worker) {
    console.debug("Creating directory: "+filePath);
    try {   
        filesIO.mkpath(filePath);
        worker.postMessage({
                "command": "createDirectory",
                "success": true 
            });     
        console.debug("Creating successful!");      
    } catch(ex) {
        worker.postMessage({
                "command": "createDirectory",
                "success": false    
            });
        console.error("Creating failed "+ex);
    }   
}

exports.loadTextFile = function loadTextFile(filePath, worker) {
    console.debug("Loading text file: "+filePath);
    try {   
        var content = filesIO.read(filePath);
        worker.postMessage({
                "command": "loadTextFile",
                "success": true,
                "content": content
            });     
        console.debug("Loading file successful!");      
    } catch(ex) {
        worker.postMessage({
                "command": "loadTextFile",
                "success": false    
            });
        console.error("Loading file failed "+ex);
    }   
}

exports.listDirectory = function listDirectory(dirPath, worker) {
    console.debug("Listing directory: "+dirPath);
    try {   
        var dirList = filesIO.list(dirPath);
        var anotatedDirList = [];
        for (var i=0; i < dirList.length; i++) {
            var file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsIFile);
            file.initWithPath(filesIO.join(dirPath,dirList[i]));
            anotatedDirList.push({
                "name": file.leafName,
                "type": file.isFile()?"file":"directory",
                "size": file.fileSize,
                "lmdt": file.lastModifiedTime   
            });
        }       
        worker.postMessage({
                "command": "listDirectory",
                "success": true,
                "content": anotatedDirList
            });             
        console.debug("Listing directory successful!");     
    } catch(ex) {
        console.error("Listing directory failed "+ex);
        worker.postMessage({
                "command": "listDirectory",
                "success": false    
            });
    }   
}

exports.getSubdirs = function getSubdirs(dirPath, worker) {
    console.debug("Getting subdirectories: "+dirPath);
    try {   
        var dirList = filesIO.list(dirPath);
        var anotatedDirList = [];
        for (var i=0; i < dirList.length; i++) {
            var file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsIFile);
            var fullPath = filesIO.join(dirPath,dirList[i]);
            file.initWithPath(fullPath);
            if(file.isFile() == false) {
	            anotatedDirList.push({
	                "title": file.leafName,
	                "isFolder": true,
	                "isLazy": true,
	                "key": fullPath 
	            });	
            }            
        }       
        worker.postMessage({
                "command": "getSubdirs",
                "success": true,
                "content": anotatedDirList
            });             
        console.debug("Getting subdirectories successful!");     
    } catch(ex) {
        console.error("Getting subdirectories failed "+ex);
        worker.postMessage({
                "command": "getSubdirs",
                "success": false    
            });
    }   
}

exports.deleteElement = function deleteElement(path, worker) {
    console.debug("Deleting: "+path);
    try {
        if(filesIO.isFile(path)) {
            filesIO.remove(path);
            worker.postMessage({
                    "command": "delete",
                    "success": true
                });         
            console.debug("Deleting file successful!");     
        } else {
            filesIO.rmdir(path);
            worker.postMessage({
                    "command": "delete",
                    "success": true
                });     
            console.debug("Deleting directory successful!");                
        }
    } catch(ex) {
        worker.postMessage({
                "command": "delete",
                "success": false    
            });
        console.error("Deleting file failed "+ex);
    }   
}

exports.rename = function rename(filePath, newFilePath, worker) {
    console.debug("Renaming file: "+filePath+" to "+newFilePath);
    // Checks if the file already exists.
//  if(!filesIO.exists(newFilePath)) {
        try { 
			var targetDir;
			var targetFileName;
			// Detecting WINNT os
            if(runtime.OS.toLowerCase().indexOf("win")!=-1) {
				targetDir = newFilePath.substring(0,newFilePath.lastIndexOf("\\"));
				targetFileName = newFilePath.substring(newFilePath.lastIndexOf("\\")+1,newFilePath.length);	
			} else {
				targetDir = newFilePath.substring(0,newFilePath.lastIndexOf("/"));
				targetFileName = newFilePath.substring(newFilePath.lastIndexOf("/")+1,newFilePath.length);
			}
            console.debug("Target dir: "+targetDir+" filename "+targetFileName);            
            var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
            file.initWithPath(filePath); 
            var targetDirFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
            targetDirFile.initWithPath(targetDir);          
//          console.debug("After init: "+file.path+" "+targetDirFile.path); 
            file.moveTo(targetDirFile,targetFileName);
            worker.postMessage({
                    "command": "rename",
                    "success": true,
                    "content": targetFileName
                });     
        } catch(ex) {
            worker.postMessage({
                "command": "rename",
                "success": false    
            });
            console.error("Renaming failed "+ex);
        }   
/*  } else {
        worker.postMessage({
                "command": "rename",
                "success": false    
            });
        console.error("Renaming failed. Target filepath already exists.");
    }*/
}

exports.saveTextFile = function saveTextFile(filePath, content, worker) {
    console.debug("Saving file: "+filePath);
    try { 
        var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
        file.initWithPath(filePath); 
        if(!file.exists())
            file.create(0,0664);
        var out = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
        out.init(file,0x20|0x02,00004,null);
        out.write(content,content.length);
        out.flush();
        out.close();            
        worker.postMessage({
                "command": "saveTextFile",
                "success": true
            });     
        console.debug("Save successed!");       
    } catch(ex) {
        worker.postMessage({
                "command": "saveTextFile",
                "success": false    
            });
        console.error("Save failed "+ex);
    }   
}

/**
 * Returning a path to a file selected from the user
 * documentation is https://developer.mozilla.org/en/NsIFilePicker
 */
exports.promptFileOpenPicker = function promptFileOpenPicker(worker) {
    console.debug("Opening file selection dialog...");
    try { 
	  var window = require("window-utils").activeWindow;
	  var fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
	  fp.init(window, "PDF Open", Ci.nsIFilePicker.modeOpen);
	  fp.appendFilter("PDF files", "*.pdf");
	  fp.appendFilters(Ci.nsIFilePicker.filterAll);
	  fp.filterIndex = 0;
	  var result = fp.show();
	  if (result === Ci.nsIFilePicker.returnOK || result === Ci.nsIFilePicker.returnReplace) {
        worker.postMessage({
                "command": "selectFile",
                "success": true,
				"content": fp.file.path
            });
	  }
    } catch(ex) {
        worker.postMessage({
                "command": "selectFile",
                "success": false    
            });
        console.error("File selection failed "+ex);
    } 
};

/**
 * Returning a path to a directory selected from the user
 * documentation is https://developer.mozilla.org/en/NsIFilePicker
 */
exports.promptDirectorySelector = function promptDirectorySelector(worker) {
    console.debug("Opening directory selection dialog...");
    try { 
	  var window = require("window-utils").activeWindow;
	  var fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
	  fp.init(window, "Directory Selection", Ci.nsIFilePicker.modeGetFolder);
	  var result = fp.show();
	  if (result === Ci.nsIFilePicker.returnOK) {
        worker.postMessage({
                "command": "selectDirectory",
                "success": true,
				"content": fp.file.path
            });
	  }
    } catch(ex) {
        worker.postMessage({
                "command": "selectDirectory",
                "success": false    
            });
        console.error("Directory selection failed "+ex);
    } 
};

/**
 * Open a directory in the default directory viewer (e.g. windows explorer)
 * http://stackoverflow.com/questions/9453786
 */
exports.openDirectory = function openDirectory(dirPath, worker) {
    console.debug("Opening directory: "+dirPath);
    dirPath = "file://"+dirPath;
    try { 
		var ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
		var uri = ioService.newURI(dirPath, null, null);
		if (uri instanceof Ci.nsIFileURL && uri.file.isDirectory()) {
		  uri.file.QueryInterface(Ci.nsILocalFile).launch();
		}
    } catch(ex) {
        console.error("Opening directory failed "+ex);
    } 
}

/**
 * Open the directory where the user can install tagspaces extensions
 * This directory is located in the profile with which firefox is started
 */
exports.openExtensionsDirectory = function openExtensionsDirectory(worker) {
    console.debug("Opening extensions directory...");
    try { 
        // Other nsIPropertues such as ProfD could be found on
        // https://developer.mozilla.org/de/docs/Code_snippets/File_I_O
        var file = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("ProfD", Ci.nsIFile);        
        var profileDir = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
        profileDir.initWithPath(file.path+"/extensions/jid1-FBaMKxTifTSahQ@jetpack/resources/tagspaces/data/ext"); 
        if (profileDir.isDirectory()) {
          profileDir.QueryInterface(Ci.nsILocalFile).launch();
        }
    } catch(ex) {
        console.error("Opening extensions directory failed "+ex);
    } 
}