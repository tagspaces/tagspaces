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

function scanDirectory(dirPath, index) {
    try {   
        var dirList = filesIO.list(dirPath);
        var path = "";
        for (var i=0; i < dirList.length; i++) {
            path = filesIO.join(dirPath,dirList[i]);
            if(filesIO.isFile(path)) {
                index.push({
                    "name": dirList[i],
                    "type": "file",    
                    "path": path
                })
            } else {
                index.push({
                    "name": dirList[i],
                    "type": "directory",
                    "path": path    
                });                
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

exports.searchDirectory = function searchDirectory(dirPath, keewords, worker) {
    console.debug("Searching directory: "+dirPath+" for: "+keewords);
    var resultIndex = [];
    resultIndex = searchDir(dirPath, resultIndex, keewords);
//    IOUtils.saveTextFile("/media/truecrypt1/searchresult.js", JSON.stringify(resultIndex));
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
    // IOUtils.saveTextFile("/media/truecrypt1/myoffice.js", JSON.stringify(directoryIndex), worker);
//    console.debug("Index: "+JSON.stringify(directoryIndex));
    worker.postMessage({
        "command": "indexDirectory",
        "success": true,
        "content": directoryIndex
    }); 
}

exports.listDirectory = function listDirectory(dirPath, worker) {
    console.debug("Listing directory: "+dirPath);
    try {   
        var dirList = filesIO.list(dirPath);
        var anotatedDirList = [];
        for (var i=0; i < dirList.length; i++) {
            var type = "directory";
            // TODO Add last changed timestamp to the annotation data
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
