/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
// Activating browser specific IOAPI modul
console.debug("Loading IOapiChrome.js..");
    
IOAPI = (typeof IOAPI == 'object' && IOAPI != null) ? IOAPI : {};

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

IOAPI.plugin = document.createElement("embed");
IOAPI.plugin.setAttribute("type", "application/x-npapi-file-io");
IOAPI.plugin.style.position = "absolute";
IOAPI.plugin.style.left = "-9999px";

// Add plugin to document if the browser is chrome
if(navigator.userAgent.indexOf("Chrom") > 0) {
    document.documentElement.appendChild(IOAPI.plugin);    
}

// Determine the directory separator
IOAPI.pathSeparator = IOAPI.plugin.getPlatform() == 'windows' ? "\\" : '/';

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
        UIAPI.updateTextEditorContent(fileContent);
    } else {
        console.error("File does not exists...");
    }	
}

// TODO Renaming very slow
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
	IOAPI.plugin.saveTextFile(filePath,content);
}

IOAPI.listDirectory = function(dirPath) {
	console.debug("Listing directory: "+dirPath);
	if(IOAPI.plugin.isDirectory(dirPath)) {
		try {
			var dirList = IOAPI.plugin.listFiles(dirPath);
    		UIAPI.updateFileBrowserData(dirList);
		} catch(ex) {
			console.error("Directory listing failed "+ex);
		}		
	} else {
		console.error("Directory does not exists.");	
	}	
}

//TODO Implement getSubdirs for chrome
IOAPI.getSubdirs = function(dirPath) {
	console.debug("Getting subdirs(Not Implemented): "+dirPath);
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
            // TODO Convert JSON to dyntree format
            UIAPI.updateTree(anotatedDirList);
        } catch(ex) {
            console.error("Directory listing failed "+ex);
        }       
    } else {
        console.error("Directory does not exists.");    
    }
}

IOAPI.deleteElement = function(path) {
	console.debug("Deleting: "+path);
	IOAPI.plugin.removeFile(path)
}

