/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function (require, exports, module) {
    "use strict";

    console.log("Loading ioapi.cordova.js..");

    var TSCORE = require("tscore");    
    var TSPOSTIO = require("tspostioapi");   

    var fsRoot = undefined;

    document.addEventListener("deviceready", onDeviceReady, false);

    // Cordova loaded and can be used
    function onDeviceReady() {
        console.log("Devive Ready: "+device.platform+" - "+device.version);
        getFileSystem();
    }

    function getFileSystem() {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
            function (fileSystem) { // success get file system
                fsRoot = fileSystem.root;
                console.log("Filesystem Name: " + fsRoot.fullPath);
            }, 
            function (evt) { // error get file system
                console.log("File System Error: " + evt.target.error.code);
            }
        );
    }

    // TODO recursively calling callback not really working        
    function scanDirectory(entries) {
        var i;
        for (i = 0; i < entries.length; i++) {
           if (entries[i].isFile) {
               console.log("File: "+entries[i].name);
               anotatedDirListing.push({
                   "name":   entries[i].name,
                   "isFile": entries[i].isFile,
                   "size":   "", // TODO
                   "lmdt":   "", // 
                   "path":   entries[i].fullPath
               });                
           } else {
               var directoryReader = entries[i].createReader();
               pendingRecursions++;
               directoryReader.readEntries(
                   scanDirectory,
                   function (error) {
                        console.log("Error reading dir entries: " + error.code);
                   } );
           }
        }
        pendingRecursions--;            
        console.log("Pending recursions: " + pendingRecursions);   
        if(pendingRecursions <= 0) {
       		TSPOSTIO.createDirectoryIndex(anotatedDirListing);
        }     
    }
    
    var anotatedDirListing = undefined;
    var pendingRecursions = 0;
    var createDirectoryIndex = function(dirPath) {
        dirPath = dirPath+"/"; // TODO make it platform independent
        dirPath = normalizePath(dirPath);
        console.log("Creating index for directory: "+dirPath);
        anotatedDirListing = [];
        pendingRecursions = 0;
        fsRoot.getDirectory(dirPath, {create: false, exclusive: false}, 
            function (dirEntry) {
                var directoryReader = dirEntry.createReader();
        
                // Get a list of all the entries in the directory
                pendingRecursions++;
                directoryReader.readEntries(
 					scanDirectory, 
 					function (error) { // error get file system
                        console.log("Dir List Error: " + error.code);
                    }            
               );
           },
           function (error) {
                console.log("Getting dir: "+dirPath+" failed with error code: " + error.code);
           }                
        );       
    };

    function generateDirectoryTree(entries) {
        var tree = {};        
        var i;
        for (i = 0; i < entries.length; i++) {
           if (entries[i].isFile) {
               console.log("File: "+entries[i].name);
               tree["children"].push({
                   "name":   entries[i].name,
                   "isFile": entries[i].isFile,
                   "size":   "", // TODO
                   "lmdt":   "", // 
                   "path":   entries[i].fullPath
               });                
           } else {
               var directoryReader = entries[i].createReader();
               pendingCallbacks++;
               directoryReader.readEntries(
                   generateDirectoryTree,
                   function (error) {
                        console.log("Error reading dir entries: " + error.code);
                   } );
           }
        }
        pendingCallbacks--;            
        console.log("Pending recursions: " + pendingCallbacks);   
        if(pendingCallbacks <= 0) {
            TSPOSTIO.createDirectoryTree(anotatedTree);
        }     
    }  

    var anotatedTree = undefined;
    var pendingCallbacks = 0;    
    var createDirectoryTree = function(dirPath) {
        console.log("Creating directory index for: "+dirPath);
        //TSCORE.showAlertDialog("Creating directory tree is not supported on Android yet.");                 

    };     
   
    function normalizePath(path) {
        if(path.indexOf(fsRoot.fullPath) >= 0) {
            path = path.substring(fsRoot.fullPath.length+1, path.length);                    
        }
        return path;
    }
    
    var checkNewVersion = function() {
        console.log("Checking for new version...");
        var cVer = TSCORE.Config.DefaultSettings["appVersion"]+"."+TSCORE.Config.DefaultSettings["appBuild"];
        $.ajax({
            url: 'http://tagspaces.org/releases/version.json?pVer='+cVer,
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
    
    var listSubDirectories = function (dirPath) {
        console.log("Listing sub directories of: " + dirPath);
        // directory path format DCIM/Camera/ !
        dirPath = dirPath+"/"; // TODO make it platform independent
        dirPath = normalizePath(dirPath);
        console.log("Listing sub directories of : " + dirPath + " normalized.");
        TSCORE.showLoadingAnimation();   

        fsRoot.getDirectory(dirPath, {create: false, exclusive: false}, 
            function (dirEntry) {
                var directoryReader = dirEntry.createReader();
        
                // Get a list of all the entries in the directory
                directoryReader.readEntries(
                    function (entries) { 
                        var i;
                        var anotatedDirList = [];
                        for (i = 0; i < entries.length; i++) {
                            if(entries[i].isDirectory){
                                anotatedDirList.push({
                                    "name":   entries[i].name,
                                    "path":   entries[i].fullPath
                                });                            
                            }
                        }
                        //console.log("Dir content: " + JSON.stringify(entries));
                        TSPOSTIO.listSubDirectories(anotatedDirList, dirPath);  
                    }, function (error) { // error get file system
                        //TSPOSTIO.errorOpeningPath();            
                        console.log("Listing sub directories failed: " + error.code);
                    }            
               );
           },
           function (error) {
                //TSPOSTIO.errorOpeningPath();              
                console.log("Getting sub directories of : "+dirPath+" failed: " + error.code);
           }                
        ); 
    };    
    
    var listDirectory = function (dirPath) {
        TSCORE.showLoadingAnimation();          
        // directory path format DCIM/Camera/ !
        dirPath = dirPath+"/"; // TODO make it platform independent
        dirPath = normalizePath(dirPath);
        
        console.log("Listing directory: " + dirPath);

        fsRoot.getDirectory(dirPath, {create: false, exclusive: false}, 
            function (dirEntry) {
                var directoryReader = dirEntry.createReader();
		        var anotatedDirList = [];
				var pendingCallbacks = 0;        
                // Get a list of all the entries in the directory
                directoryReader.readEntries(
                    function (entries) { 
                        var i;
                        var normalizedPath;
                        for (i = 0; i < entries.length; i++) {
                            if(entries[i].isFile) {
								pendingCallbacks++;	
	                            entries[i].file(
	                            	function(entry) {
			                            anotatedDirList.push({
			                                "name":   entry.name,
			                                "isFile": true,
			                                "size":   entry.size,
			                                "lmdt":   entry.lastModifiedDate,
			                                "path":   entry.fullPath
			                            });
			                            pendingCallbacks--;                            								                            		
                            			console.log("File: "+entry.name+" Size: "+entry.size+ " i:"+i+" Callb: "+pendingCallbacks);
			                            if(pendingCallbacks == 0 && i == entries.length) {
			                            	TSPOSTIO.listDirectory(anotatedDirList);
			                            }                          
				                    }, function (error) { // error get file system
				                        console.log("Getting file meta error: " + error.code);
				                    }                                        	
	                            );                            	
                            } else {
                                normalizedPath = normalizePath(entries[i].fullPath);                                
	                            anotatedDirList.push({
	                                "name":   entries[i].name,
	                                "isFile": false,
	                                "size":   "",
	                                "lmdt":   "",
	                                "path":   normalizedPath
	                            });
                            	console.log("Dir: "+entries[i].name+ " I:"+i+" Callb: "+pendingCallbacks);                            	
	                            if((pendingCallbacks == 0) && ((i+1) == entries.length)) {
	                            	TSPOSTIO.listDirectory(anotatedDirList);
	                            }                            				                            	
                            } 
                                                   
                        }
                        if(pendingCallbacks == 0) {
                        	TSPOSTIO.listDirectory(anotatedDirList);
                        }   
                        //console.log("Dir content: " + JSON.stringify(entries));
  
                    }, function (error) { // error get file system
                        TSPOSTIO.errorOpeningPath();
                        console.log("Dir List Error: " + error.code);
                    }            
               );
           },
           function (error) {
                TSPOSTIO.errorOpeningPath();
                console.log("Getting dir: "+dirPath+" failed with error code: " + error.code);
           }                
        ); 
    };

    var deleteElement = function(filePath) {
        console.log("Deleting: "+filePath);
        TSCORE.showLoadingAnimation();  
        
        var path = normalizePath(filePath);
 
        fsRoot.getFile(path, {create: false, exclusive: false}, 
            function(entry) {
                entry.remove(
                    function() {
                        console.log("file deleted: "+path);
                        TSPOSTIO.deleteElement(filePath);                           
                    },
                    function() {
                        console.log("error deleting: "+filePath);
                    }                                  
                );
            },
            function() {
                console.log("error getting file");
            }        
        );
    };

    var loadTextFile = function(filePath) {
        console.log("Loading file: "+filePath);
        TSCORE.showLoadingAnimation();  

        filePath = normalizePath(filePath);
        fsRoot.getFile(filePath, {create: false, exclusive: false}, 
            function(entry) {
                entry.file(
                    function(file) {
                        var reader = new FileReader();
                        reader.onloadend = function(evt) {
                            TSPOSTIO.loadTextFile(evt.target.result); 
                        };
                        reader.readAsText(file);                              
                    },
                    function() {
                        console.log("error getting file: "+filePath);
                    }                                  
                );
            },
            function() {
                console.log("Error getting file entry: "+filePath);
            }        
        ); 
    };
    
    var saveTextFile = function(filePath,content) {
        console.log("Saving file: "+filePath);
        TSCORE.showLoadingAnimation();  

        // Handling the UTF8 support for text files
        var UTF8_BOM = "\ufeff";

        if(content.indexOf(UTF8_BOM) == 0) {
            // already has a UTF8 bom
        } else {
            content = UTF8_BOM+content;
        }    

        filePath = normalizePath(filePath);
        fsRoot.getFile(filePath, {create: true, exclusive: false}, 
            function(entry) {
                entry.createWriter(
                    function(writer) {
                        writer.onwriteend = function(evt) {
                            TSPOSTIO.saveTextFile(fsRoot.fullPath+"/"+filePath);
                        };
                        writer.write(content);                           
                    },
                    function() {
                        console.log("error creating writter file: "+filePath);
                    }                                  
                );
            },
            function() {
                console.log("Error getting file entry: "+filePath);
            }        
        ); 
    };   

    var createDirectory = function(dirPath) {
        console.log("Creating directory: "+dirPath);    
        TSCORE.showLoadingAnimation();  

        dirPath = normalizePath(dirPath);

        fsRoot.getDirectory(dirPath, {create: true, exclusive: false}, 
           function (dirEntry) {
                TSPOSTIO.createDirectory(dirPath);
           },
           function (error) {
                console.log("Creating directory failed: "+dirPath+" failed with error code: " + error.code);
           }  
        );
    }; 
    
    var renameFile = function(filePath, newFilePath) {
        TSCORE.showLoadingAnimation();  
        
        filePath = normalizePath(filePath);
        var newFileName = newFilePath.substring(newFilePath.lastIndexOf('/')+1);
        var newFileParentPath = normalizePath(newFilePath.substring(0, newFilePath.lastIndexOf('/')));
        // TODO check if the newFilePath exist or cause issues by renaming
        fsRoot.getDirectory(newFileParentPath, {create: false, exclusive: false}, 
            function (parentDirEntry) {
                fsRoot.getFile(filePath, {create: false, exclusive: false}, 
                    function(entry) {
                        entry.moveTo(
                            parentDirEntry,
                            newFileName,
                            function() {
                                console.log("File renamed to: "+newFilePath+" Old name: "+entry.fullPath);
                                TSPOSTIO.renameFile(entry.fullPath, newFilePath);                                
                            },
                            function() {
                                console.log("error renaming: "+filePath);
                            }                                  
                        );
                    },
                    function() {
                        console.log("Error getting file: "+filePath);
                    }        
                );      
           },
           function (error) {
                console.log("Getting dir: "+newFileParentPath+" failed with error code: " + error.code);
           }                
        );
    };

    var selectDirectory = function() {
        console.log("Open select directory dialog.");        
        //file:///storage/emulated/0/DCIM/Camera/
        TSCORE.showDirectoryBrowserDialog(fsRoot.fullPath);       
    };

    var selectFile = function() {
        console.log("Operation selectFile not supported on Android!");
    };
    
    var checkAccessFileURLAllowed = function() {
        console.log("checkAccessFileURLAllowed function not relevant for Android..");        
    };
    
    var openDirectory = function(dirPath) {
        TSCORE.showAlertDialog("Select file functionality not supported on Android!");
        //dirPath = normalizePath(dirPath);
        //window.open(dirPath,"_blank", "location=no");        
    };

    var openFile = function(filePath) {
        console.log("Opening natively: "+filePath);
        window.plugins.fileOpener.open(filePath);
        //window.open(filePath,"_blank", "location=no");
    };
    
    var openExtensionsDirectory = function() {
        TSCORE.showAlertDialog("Open extensions directory functionality not supported on Android!"); 
    };
    
    var getFileProperties = function(filePath) {
        filePath = normalizePath(filePath);
        var fileProperties = {};
        fsRoot.getFile(filePath, {create: false, exclusive: false}, 
            function(entry) {
                if(entry.isFile) {
                    entry.file( 
                        function(file) {
                            fileProperties.path = entry.fullPath;
                            fileProperties.size = file.size;
                            fileProperties.lmdt = file.lastModifiedDate;
                            fileProperties.mimetype = file.type;
                            TSPOSTIO.getFileProperties(fileProperties);
                        },
                        function() {
                            console.warn("Error retrieving file properties of "+filePath);                               
                        }
                    );
                } else {
                    console.warn("Error getting file properties. "+filePath+" is directory");   
                }
            },
            function() {
                console.log("error getting file");
            }        
        );  
    };
    
	exports.createDirectory 			= createDirectory; 
	exports.renameFile 					= renameFile;
	exports.loadTextFile 				= loadTextFile;
	exports.saveTextFile 				= saveTextFile;
	exports.listDirectory 				= listDirectory;
    exports.listSubDirectories          = listSubDirectories;
	exports.deleteElement 				= deleteElement;
    exports.createDirectoryIndex 		= createDirectoryIndex;
    exports.createDirectoryTree 		= createDirectoryTree;
	exports.selectDirectory 			= selectDirectory;
	exports.openDirectory				= openDirectory;
	exports.openFile                    = openFile;
	exports.selectFile 					= selectFile;
	exports.openExtensionsDirectory 	= openExtensionsDirectory;
	exports.checkAccessFileURLAllowed 	= checkAccessFileURLAllowed;
	exports.checkNewVersion 			= checkNewVersion;	    
	exports.getFileProperties           = getFileProperties;
	
});