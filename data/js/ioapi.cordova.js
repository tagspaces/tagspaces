/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
console.debug("Loading ioapi.cordova.js..");

var IOAPI = (typeof IOAPI == 'object' && IOAPI != null) ? IOAPI : {};

// Determine the directory separator

//IOAPI.pathSeparator = IOAPI.plugin.getPlatform() == 'windows' ? "\\" : '/';

// Wait for Cordova to load
    
//document.addEventListener("deviceready", onDeviceReady, false);

//function onDeviceReady() {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
//}

function gotFS(fileSystem) {
    fileSystem.root.getFile("readme.txt", {create: true, exclusive: false}, gotFileEntry, fail);
}

function gotFileEntry(fileEntry) {
    fileEntry.createWriter(gotFileWriter, fail);
}

function gotFileWriter(writer) {
    writer.onwriteend = function(evt) {
        console.log("contents of file now 'some sample text'");
        writer.truncate(11);  
        writer.onwriteend = function(evt) {
            console.log("contents of file now 'some sample'");
            writer.seek(4);
            writer.write(" different text");
            writer.onwriteend = function(evt){
                console.log("contents of file now 'some different text'");
            }
        };
    };
    writer.write("some sample text");
}


// Test if plugin works
console.debug("Current platform: "+IOAPI.plugin.getPlatform()+" with path separator: "+IOAPI.pathSeparator);  

IOAPI.createDirectory = function(dirPath) {
    console.debug("Creating directory: "+dirPath);    
    if(IOAPI.plugin.isDirectory(dirPath)) {
        console.error("Directory already exists...");
    } else {
        if(IOAPI.plugin.createDirectory(dirPath)) {
            console.debug("Directory: "+dirPath+" created.");       
        } else {
            console.error("Directory creation failed");     
        }
    }
}

IOAPI.loadTextFile = function(filePath) {
    console.debug("Loading file: "+filePath);
    if(IOAPI.plugin.fileExists(filePath)) {
        var fileContent = IOAPI.plugin.getTextFile(filePath);
        UIAPI.FileOpener.updateEditorContent(fileContent);   
    } else {
        console.error("File does not exists...");
    }   
}

// TODO Renaming very slow, due the copy implementation
IOAPI.renameFile = function(filePath, newFilePath) {
    console.debug("Renaming file: "+filePath+" to "+newFilePath);
    if(IOAPI.plugin.fileExists(newFilePath)) {
        console.error("Target file already exists: "+newFilePath);
    } else {
        if(IOAPI.plugin.fileExists(filePath)) {
            IOAPI.plugin.saveBinaryFile(newFilePath,IOAPI.plugin.getBinaryFile(filePath));
            IOAPI.plugin.removeFile(filePath);
            console.debug("File renamed to: "+newFilePath); 
        } else { 
            console.error("Original file does not exists: "+filePath);      
        }
    }
}

IOAPI.saveTextFile = function(filePath,content) {
    console.debug("Saving file: "+filePath);
    if(IOAPI.plugin.fileExists(filePath)) {
        IOAPI.plugin.removeFile(filePath);              
    }
    IOAPI.plugin.saveTextFile(filePath,content);
}

IOAPI.listDirectory = function(dirPath) {
    console.debug("Listing directory: "+dirPath);
    if(IOAPI.plugin.isDirectory(dirPath)) {
        try {
            var dirList = IOAPI.plugin.listFiles(dirPath);
            console.debug("Dir content: "+JSON.stringify(dirList)); 
            UIAPI.PerspectiveManager.updateFileBrowserData(dirList);
        } catch(ex) {
            console.error("Directory listing failed "+ex);
        }       
    } else {
        console.error("Directory does not exists.");    
    }   
}

IOAPI.getSubdirs = function(dirPath) {
    console.debug("Getting subdirs: "+dirPath);
    if(IOAPI.plugin.isDirectory(dirPath)) {
        try {
            var dirList = IOAPI.plugin.listFiles(dirPath);
            var anotatedDirList = [];
            for (var i=0; i < dirList.length; i++) {
                if(dirList[i].type == "directory") {
                    anotatedDirList.push({
                        "title": dirList[i].name,
                        "isFolder": true,
                        "isLazy": true,
                        "key": dirPath+IOAPI.pathSeparator+dirList[i].name 
                    }); 
                }            
            } 
            // TODO JSON functions are a workarround for a bug....               
            UIAPI.updateSubDirs(JSON.parse( JSON.stringify(anotatedDirList)));
        } catch(ex) {
            console.error("Directory listing failed "+ex);
        }       
    } else {
        console.error("Directory does not exists.");    
    }
}

IOAPI.deleteElement = function(path) {
    console.debug("Deleting: "+path);
//    IOAPI.plugin.removeFile(path)
}

IOAPI.selectDirectory = function() {
    // TODO implement selectDirectory
    console.debug("Select directory functionality not implemented on cordova yet!");
    alert("Select directory functionality not implemented on cordova yet!")  
}

IOAPI.selectFile = function() {
    // TODO implement selectFile
    console.debug("Select file functionality not implemented on cordova yet!");
    alert("Select file functionality not implemented on cordova yet!")
}

IOAPI.openDirectory = function(dirPath) {
    // TODO implement openDirectory
    console.debug("Open directory functionality not implemented on cordova yet!");
    alert("Open directory functionality not implemented on cordova yet!");
}

IOAPI.openExtensionsDirectory = function() {
    // TODO implement openExtensionsDirectory
    console.debug("Open extensions directory functionality not implemented on cordova yet!");
    alert("Open extensions directory functionality not implemented on cordova yet!"); 
}