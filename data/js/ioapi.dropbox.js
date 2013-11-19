/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function (require, exports, module) {
    "use strict";

    console.log("Loading ioapi.dropbox.js..");

    var TSCORE = require("tscore");
    
    var TSPOSTIO = require("tspostioapi");   

/* stat format
- file
{"_json":{"revision":9,"rev":"90068aeb1","thumb_exists":false,"bytes":1268,"modified":"Sat, 30 Jan 2010 12:32:43 +0000","client_mtime":"Sat, 30 Jan 2010 12:32:43 +0000","path":"/Getting Started.rtf","is_dir":false,"icon":"page_white_text","root":"dropbox","mime_type":"application/rtf","size":"1.2 KB"},"path":"/Getting Started.rtf","name":"Getting Started.rtf","isFolder":false,"isFile":true,"isRemoved":false,"typeIcon":"page_white_text","modifiedAt":"2010-01-30T12:32:43.000Z","clientModifiedAt":"2010-01-30T12:32:43.000Z","inAppFolder":false,"size":1268,"humanSize":"1.2 KB","hasThumbnail":false,"versionTag":"90068aeb1","contentHash":null,"mimeType":"application/rtf"}
- directory
{"_json":{"revision":354,"rev":"1620068aeb1","thumb_exists":false,"bytes":0,"modified":"Tue, 19 Nov 2013 16:32:05 +0000","path":"/23","is_dir":true,"icon":"folder","root":"dropbox","size":"0 bytes"},"path":"/23","name":"23","isFolder":true,"isFile":false,"isRemoved":false,"typeIcon":"folder","modifiedAt":"2013-11-19T16:32:05.000Z","clientModifiedAt":null,"inAppFolder":false,"size":0,"humanSize":"0 bytes","hasThumbnail":false,"versionTag":"1620068aeb1","contentHash":null,"mimeType":"inode/directory"}
*/
    var fsRoot;
    
    requirejs(['dropbox'], function () {
		// TODO rework handling of hashes
		if(window.location.hash.length < 1) {
			init();			
		} else {
			// #access_token=p00H94aHbVkAAAAAAAAAAbITvnyzGGMSw5EUYfbpH9V5lSeiK7QmoEIbyvn6uYMw&token_type=bearer&uid=4360164&state=oas_ho7adxkp_0.pd8q6hqf1zs8xgvi 
			// console.log(window.location.hash);
			var locationHash    = location.hash.substr(1);
    		var dboxToken = locationHash.substr(locationHash.indexOf('access_token=')).split('&')[0].split('=')[1];		
    		console.log("Token: "+dboxToken);	
	        if (!fsRoot) {
	            fsRoot = new Dropbox.Client({
	                key: "t174lonmydtl9mk",
	                sandbox: false,
					token: dboxToken,
	            }); 
	        }
		}
    }); 

    function init(callback) {
        if (!fsRoot) {
            fsRoot = new Dropbox.Client({
                key: "t174lonmydtl9mk",
                sandbox: false
            }); 
            fsRoot.authDriver(new Dropbox.AuthDriver.ChromeExtension({receiverPath: "index.html", rememberUser: true}));
            //fsRoot.authDriver(new Dropbox.AuthDriver.Popup({rememberUser: true}));
            fsRoot.authenticate(function (err, fsRoot) {
	            if (err) {
	                console.log("Auth Error: " + err);            	
	            }
            });
        }
    }


    // TODO recursivly calling callback not working        
    function scanDirectory(dirPath, index) {
        fsRoot.getDirectory(normalizePath(dirPath+"/"), {create: false, exclusive: false}, 
            function (dirEntry) {
                var directoryReader = dirEntry.createReader();
                // Get a list of all the entries in the directory
                directoryReader.readEntries(
                    function (entries) { 
                        var i;
                        var recursed = false;
                        for (i = 0; i < entries.length; i++) {
                            index.push({
                                "name": entries[i].name,
                                "type": entries[i].isFile?"file":"directory",
                                "size": "0",
                                "lmdt": "0",
                                "path": entries[i].fullPath  
                            }); 
                            if (entries[i].isDirectory) {
                                recursed = true;
                                scanDirectory(entries[i].fullPath, index);
                            } 
                        }
                        if (!recursed) return index; 
                    }, function (error) { // error get file system
                        console.log("Dir List Error: " + error.code);
                    }            
               );
           },
           function (error) {
                console.log("Getting dir: "+dirPath+" failed with error code: " + error.code);
           }                
        ); 
    }
    
    function generateDirectoryTree(dirPath) {
        // TODO recursivly calling callback not working
        dirPath = dirPath+"/"; // TODO make it platform independent
        dirPath = normalizePath(dirPath);
        var tree = {}; 
        fsRoot.getDirectory(dirPath, {create: false, exclusive: false}, 
            function (dirEntry) {
                var directoryReader = dirEntry.createReader();
                // Get a list of all the entries in the directory
                directoryReader.readEntries(
                    function (entries) { 
                        tree["name"] = dirEntry.name;
                        tree["type"] = "directory";
                        tree["lmdt"] = 0;   
                        tree["path"] = dirEntry.fullPath;         
                        tree["children"] = [];            
                        for (var i=0; i < entries.length; i++) {
                            if (entries[i].isFile) {
                                tree["children"].push({
                                    "name": entries[i].name,
                                    "type": "file",
                                    "size": "0",
                                    "lmdt": "0",   
                                    "path": entries[i].fullPath 
                                });            
                            } else {
                                tree["children"].push( generateDirectoryTree(entries[i].fullPath) );                   
                            }  
                        }
                        return tree;
                    }, 
                    function (error) { // error get file system
                        console.log("Dir Tree Creation Error: " + error.code);
                    }            
               );
           },
           function (error) {
                console.log("Getting dir: "+dirPath+" failed with error code: " + error.code);
           }                
        );
    }   
    
    exports.checkNewVersion = function() {
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
    
    exports.listDirectory = function (dirPath) {
        dirPath = dirPath+"/"; // TODO make it platform independent
        
        console.log("Listing directory: " + dirPath);

        var stats = [];
        
        fsRoot.readdir(dirPath, function (err, contents, dirStat, stats) {
            var i, convertedStats = [];
            
            if (!err) {
                var i;
                var anotatedDirList = [];
                for (i = 0; i < stats.length; i++) {
                    console.log("File: "+stats[i].name);
                    anotatedDirList.push({
                        "name": stats[i].name,
                        "type": stats[i].isFile?"file":"directory",
                        "size": stats[i].size,
                        "lmdt": stats[i].modifiedAt,
                        "path": stats[i].path
                    });                                 
                }
                //console.log("Dir content: " + JSON.stringify(entries));
                TSPOSTIO.listDirectory(anotatedDirList);                     
            }
            
            if (err) {
                console.log("Dir List Error: " + err);            	
            }
        });
    };
    
    exports.getSubdirs = function(dirPath) {
        dirPath = dirPath+"/"; // TODO make it platform independent
                
        console.log("Getting subdirs: "+dirPath);

        var stats = [];
        
        fsRoot.readdir(dirPath, function (err, contents, dirStat, stats) {
            var i, convertedStats = [];
            
            if (err) {
                console.log("Dir List Error: " + err);            	
            } else {
                var i;
                var anotatedDirList = [];
                for (i = 0; i < stats.length; i++) {
                    console.log("File: "+stats[i].name);
                    if(stats[i].isFolder) {
                        anotatedDirList.push({
                            "title": stats[i].name,
                            "isFolder": true,
                            "key": stats[i].path
                        }); 
                    }      
                }            	
				//console.log("Dir content: " + JSON.stringify(stats));                                  
                TSPOSTIO.getSubdirs(anotatedDirList);    
            }
        });         
    };

    exports.deleteElement = function(path) {
        console.log("Deleting: "+path);
        fsRoot.unlink(path, function (err, stat) {
            if(err) {
            	console.log("Error deleting path: "+err);            	
            } else {
            	console.log("Element deleted: "+stat.path);
				TSPOSTIO.deleteElement();  
            }
        }); 
    };

    exports.createDirectoryIndex = function(dirPath) {
        console.log("Creating index for directory: "+dirPath);
        TSCORE.showAlertDialog("Creating directory index is not supported on Android yet.");                 
/*        var directoryIndex = [];
        directoryIndex = scanDirectory(dirPath, directoryIndex);
        console.log(JSON.stringify(directoryIndex));
        TSPOSTIO.createDirectoryIndex(directoryIndex); */
    };
    
    exports.createDirectoryTree = function(dirPath) {
        console.log("Creating directory index for: "+dirPath);
        TSCORE.showAlertDialog("Creating directory tree is not supported on Android yet.");                 
/*        var directoyTree = generateDirectoryTree(dirPath);
        //console.log(JSON.stringify(directoyTree));
        TSPOSTIO.createDirectoryTree(directoyTree);*/
    };

    exports.loadTextFile = function(filePath) {
        console.log("Loading file: "+filePath);
        fsRoot.readFile(filePath, function (err, data, stat) {
            if(err) {
            	console.log("Error loading file: "+err);            	
            } else {
				TSPOSTIO.loadTextFile(data);  
            }
        });        
    };
    
    exports.saveTextFile = function(filePath,content) {
        console.log("Saving file: "+filePath);
        fsRoot.writeFile(filePath, content, function (err, stat) {
            if(err) {
            	console.log("Error creating/saving file: "+err);            	
            } else {
				TSPOSTIO.saveTextFile(stat.path);  
            }
        }); 
    };   

    exports.createDirectory = function(dirPath) {
        console.log("Creating directory: "+dirPath);  
        fsRoot.mkdir(dirPath, function (err, stat) {
            if(err) {
            	console.log("Error creating directory: "+err);            	
            } else {
            	console.log("Directory created: "+stat.path);
				TSPOSTIO.createDirectory();  
            }
        });  
    }; 
    
    exports.renameFile = function(filePath, newFilePath) {
    	console.log("Renaming file from: "+filePath+" to: "+newFilePath);  
		fsRoot.move(filePath, newFilePath, function (err, stat) {
            if(err) {
            	console.log("Error renaming: "+err);            	
            } else {
            	console.log("File renamed to: "+stat.path);
				TSPOSTIO.renameFile(filePath, stat.path);  
            }
        });
    };

    exports.selectDirectory = function() {
        console.log("Operation selectDirectory not supported in the Dropbox mode yet!");
        TSCORE.showAlertDialog("Selecting directory not supported in the Dropbox mode yet, please type the desired directory path manually in textbox!");         
    };

    exports.selectFile = function() {
        console.log("Operation selectFile not supported in the Dropbox mode!");
    };
    
    exports.checkAccessFileURLAllowed = function() {
        console.log("checkAccessFileURLAllowed function not relevant in the Dropbox mode!");        
    };
    
    exports.openDirectory = function(dirPath) {
        TSCORE.showAlertDialog("Select file functionality not supported in the Dropbox mode!");
    };
    
    exports.openExtensionsDirectory = function() {
        TSCORE.showAlertDialog("Open extensions directory functionality not supported in the Dropbox mode!"); 
    };
});