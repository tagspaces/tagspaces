/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

const {Cc,Ci,Cr,Cu} = require("chrome");
var filesIO = require("sdk/io/file"); // file
var runtime = require("sdk/system/runtime"); // runtime 
const { getTabs, getTabId, getOwnerWindow } = require("sdk/tabs/utils"); // tabs/utils
 
function getWindow(worker) {
	let { tab } = worker;
 
	if (!tab) {
		return null;
	}		
 
	let rawTabs = getTabs();
 
	for (let rawTab of rawTabs) {
		if (getTabId(rawTab) === tab.id) {
			return getOwnerWindow(rawTab);
		}			
	}
	 
	return null;
}

function searchDir(dirPath, index, keewords) {
//    console.log("Indexing directory: "+dirPath);
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
                });                    
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
    console.log("Searching directory: "+dirPath+" for: "+keewords);
    var resultIndex = [];
    resultIndex = searchDir(dirPath, resultIndex, keewords);
//    console.log("Index: "+JSON.stringify(resultIndex));
    worker.postMessage({
        "command": "indexDirectory",
        "success": true,
        "content": directoryIndex
    }); 
};

exports.createDirectoryIndex = function createDirectoryIndex(dirPath, worker) {
    console.log("Creating index for directory: "+dirPath);
    var directoryIndex = [];
    directoryIndex = scanDirectory(dirPath, directoryIndex);
//    console.log("Index: "+JSON.stringify(directoryIndex));
    worker.postMessage({
        "command": "indexDirectory",
        "success": true,
        "content": directoryIndex
    }); 
};

exports.createDirectoryTree = function createDirectoryTree(dirPath, worker) {
    console.log("Creating directory tree: "+dirPath);
    var dirTree = directoryTree(dirPath);
//    console.log("Index: "+JSON.stringify(dirTree));
    worker.postMessage({
        "command": "createDirectoryTree",
        "success": true,
        "content": dirTree
    }); 
};

function directoryTree(dirPath) {
    try {   
        var tree = {};
        var dirList = filesIO.list(dirPath);
        var directory = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsIFile);
		directory.initWithPath(dirPath);
		tree["name"] = directory.leafName;
        tree["isFile"] = false;
        tree["lmdt"] = directory.lastModifiedTime;   
        tree["path"] = dirPath; 		
		tree["children"] = [];

        for (var i=0; i < dirList.length; i++) {
            try {
                var path = filesIO.join(dirPath,dirList[i]);
                var file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsIFile);
                file.initWithPath(path);
                if (file.isFile()) {
                    tree["children"].push({
                        "name":   file.leafName,
                        "isFile": true,
                        "size":   file.fileSize,
                        "lmdt":   file.lastModifiedTime,   
                        "path":   path 
                    });            
                } else {
                    tree["children"].push( directoryTree(path) );                   
                }                
            } catch(ex) {
                console.error("Filepath has a invalid encoding "+ex);                
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
           try {
                var path = filesIO.join(dirPath,dirList[i]);
                var file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsIFile);
                file.initWithPath(path);
                index.push({
                    "name":   file.leafName,
                    "isFile": file.isFile(),
                    "size":   file.fileSize,
                    "lmdt":   file.lastModifiedTime,   
                    "path":   path 
                });         
                if (!file.isFile()) {
                    scanDirectory(path, index);
                }
            } catch(ex) {
                console.error("Filepath has a invalid encoding "+ex);                
            }                
        }       
        return index;
    } catch(ex) {
        console.error("Listing directory failed "+ex);
    }   
}

exports.listDirectory = function listDirectory(dirPath, worker) {
    console.log("Listing directory: "+dirPath);
    try {   
        var dirList = filesIO.list(dirPath);
        var anotatedDirList = [];
        for (var i=0; i < dirList.length; i++) {
            try {               
                var path = filesIO.join(dirPath,dirList[i]);
                var file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsIFile);
                file.initWithPath(filesIO.join(dirPath,dirList[i]));
                anotatedDirList.push({
                    "name":    file.leafName,
                    "isFile":  file.isFile(),
                    "size":    file.fileSize,
                    "lmdt":    file.lastModifiedTime,
                    "path":    path                    
                });
            } catch(ex) {
                console.error("Filepath has a invalid encoding "+ex);                
            }                 
        }       
        worker.postMessage({
                "command": "listDirectory",
                "success": true,
                "content": anotatedDirList
            });             
        console.log("Listing directory successful!");     
    } catch(ex) {
        console.error("Listing directory failed "+ex);
        worker.postMessage({
                "command": "listDirectory",
                "success": false    
            });
    }   
};

exports.createDirectory = function createDirectory(dirPath, worker) {
    console.log("Creating directory: "+dirPath);
    try {   
        filesIO.mkpath(dirPath);
        worker.postMessage({
                "command": "createDirectory",
                "content": dirPath,
                "success": true 
            });     
        console.log("Creating successful!");      
    } catch(ex) {
        worker.postMessage({
                "command": "createDirectory",
                "success": false    
            });
        console.error("Creating failed "+ex);
    }   
};

exports.loadTextFile = function loadTextFile(filePath, worker) {
    console.log("Loading text file: "+filePath);
    try {   
        var content = filesIO.read(filePath);
        worker.postMessage({
                "command": "loadTextFile",
                "success": true,
                "content": content
            });     
        console.log("Loading file successful!");      
    } catch(ex) {
        worker.postMessage({
                "command": "loadTextFile",
                "success": false    
            });
        console.error("Loading file failed "+ex);
    }   
};

exports.deleteElement = function deleteElement(path, worker) {
    console.log("Deleting: "+path);
    try {
        if(filesIO.isFile(path)) {
            filesIO.remove(path);
            worker.postMessage({
                    "command": "delete",
                    "success": true,
                    "content": path
                });         
            console.log("Deleting file successful!");     
        } /* else {
            filesIO.rmdir(path);
            worker.postMessage({
                    "command": "delete",
                    "success": true
                });     
            console.log("Deleting directory successful!");                
        } */
    } catch(ex) {
        worker.postMessage({
                "command": "delete",
                "success": false    
            });
        console.error("Deleting file failed "+ex);
    }   
};

exports.rename = function rename(filePath, newFilePath, worker) {
    console.log("Renaming file: "+filePath+" to "+newFilePath);
    // Checks if the file already exists.
    console.log("Renaming on "+runtime.OS);

    if(!filesIO.exists(newFilePath)) {
        try {
        	// TODO Remove the OSX custom code after https://bugzilla.mozilla.org/show_bug.cgi?id=913663 is fixed 
        	if(runtime.OS.toLowerCase().indexOf("darwin")>=0) { 
				console.log("Renaming under macos ");

				var binaryFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
				binaryFile.initWithPath( filePath );
                console.log("Init File: "+filePath);                
                
				var istream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
				istream.init(binaryFile, -1, -1, false);
				var bstream = Cc["@mozilla.org/binaryinputstream;1"].createInstance(Ci.nsIBinaryInputStream);
				bstream.setInputStream(istream);      		
                var binaryStream = bstream.readBytes(bstream.available());
                
                var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
                file.initWithPath(newFilePath);
                console.log("InitFile: "+newFilePath);                
                
		        var stream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
				stream.init(file, 0x04 | 0x08 | 0x20, 0600, 0); // readwrite, create, truncate
				stream.write(binaryStream,binaryStream.length);
				if (stream instanceof Ci.nsISafeOutputStream) {
				    stream.finish();
				} else {
				    stream.close();
				}        		
        		
        		filesIO.remove(filePath);		
	            worker.postMessage({ "command": "rename", "success": true, "content": [filePath, newFilePath] });        		
        	} else {
				var targetDir;
				var targetFileName;
				// Detecting WIN os
	            if(runtime.OS.toLowerCase().indexOf("win")!=-1) {
					targetDir = newFilePath.substring(0,newFilePath.lastIndexOf("\\"));
					targetFileName = newFilePath.substring(newFilePath.lastIndexOf("\\")+1,newFilePath.length);	
				} else {
					targetDir = newFilePath.substring(0,newFilePath.lastIndexOf("/"));
					targetFileName = newFilePath.substring(newFilePath.lastIndexOf("/")+1,newFilePath.length);
				}
            	console.log("Target dir: "+targetDir+" filename: "+targetFileName);        				
	            var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
	            file.initWithPath(filePath); 
	            
	            //let FileUtils = Cu.import('resource://gre/modules/FileUtils.jsm').FileUtils;
	            //var targetDirFile = new FileUtils.File(targetDir);            
	            
	            var targetDirFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
	            targetDirFile.initWithPath(filesIO.join(targetDir,""));
	            //targetDirFile.initWithPath(targetDir);          
	            
	            console.log("After init: "+file.path+" targetdir: "+targetDirFile.path+" targetfilename: "+targetFileName); 
	            file.moveTo(targetDirFile,targetFileName);
	            var targetPath = filesIO.join(targetDir,targetFileName);
	            worker.postMessage({ "command": "rename", "success": true, "content": [filePath, targetPath] });            		
        	} 
        } catch(ex) {
            worker.postMessage({ "command": "rename", "success": false });
            console.error("Renaming failed "+ex);
        }   
	} else {
	    worker.postMessage({ "command": "rename", "success": false });
	    console.error("Renaming failed. Target filepath already exists.");
	}
};

exports.saveTextFile = function saveTextFile(filePath, content, worker) {
    console.log("Saving file: "+filePath);
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
                "content": filePath,
                "success": true
            });     
        console.log("Save successed!");       
    } catch(ex) {
        worker.postMessage({
                "command": "saveTextFile",
                "content": filePath,
                "success": false    
            });
        console.error("Save failed "+ex);
    }   
};

/**
 * Returning a path to a file selected from the user
 * documentation is https://developer.mozilla.org/en/NsIFilePicker
 */
exports.promptFileOpenPicker = function promptFileOpenPicker(worker) {
    console.log("Opening file selection dialog");
    try { 
	  var window = getWindow(worker);
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
    console.log("Opening directory selection dialog...");
    try { 
//	  var window = require("window/utils").getMostRecentBrowserWindow(); 
	  var window = getWindow(worker);
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
    console.log("Opening directory: "+dirPath);
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
};

/**
 * Open the directory where the user can install tagspaces extensions
 * This directory is located in the profile with which firefox is started
 */
exports.openExtensionsDirectory = function openExtensionsDirectory(worker) {
    console.log("Opening extensions directory (not implemented yet)");
/*    try { 
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
    } */
};

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

exports.getFileProperties = function(filePath, worker) {
    var fileProperties = {};
    try { 
        var targetFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
        targetFile.initWithPath(filesIO.join(filePath,"")); 
        if(targetFile.isFile()) {
            fileProperties.path = filePath;
            fileProperties.size = targetFile.fileSize;
            fileProperties.lmdt = targetFile.lastModifiedTime;
            worker.postMessage({
                "command": "getFileProperties",
                "success": true,
                "content": fileProperties
            });        
        } else {
            console.warn("Error getting file properties. "+filePath+" is directory");           
        }
    } catch(ex) {
        console.error("Error getting properties for file "+filePath+" - "+ex);
    }               
};