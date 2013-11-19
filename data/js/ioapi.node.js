/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";
	
	// Activating browser specific exports modul
	console.log("Loading ioapi.node.js..");
    
    var TSCORE = require("tscore");
	
	var TSPOSTIO = require("tspostioapi");
	
/* stats for file:
  dev: 2114,
  ino: 48064969,
  mode: 33188,
  nlink: 1,
  uid: 85,
  gid: 100,
  rdev: 0,
  size: 527,
  blksize: 4096,
  blocks: 8,
  atime: Mon, 10 Oct 2011 23:24:11 GMT,
  mtime: Mon, 10 Oct 2011 23:24:11 GMT,
  ctime: Mon, 10 Oct 2011 23:24:11 GMT 
*/
	
	function scanDirectory(dirPath, index) {
	    try {
            var dirList = fs.readdirSync(dirPath);
            for (var i=0; i < dirList.length; i++) {
                var path = dirPath+getDirseparator()+dirList[i];
                var stats = fs.statSync(path);
                //console.log('stats: ' + JSON.stringify(stats));
                index.push({
                    "name": dirList[i],
                    "isFile": !stats.isDirectory(),
                    "size": stats.size,
                    "lmdt": stats.mtime,
                    "path": path  
                });     
                if (stats.isDirectory()) {
                    scanDirectory(path, index);
                }                        
            }        
            return index;
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

    function generateDirectoryTree(dirPath) {
        try {
            var tree = {}; 
            var dstats = fs.statSync(dirPath);           
            tree["name"] = pathUtils.basename(dirPath);
            tree["isFile"] = false;
            tree["lmdt"] = dstats.mtime;   
            tree["path"] = dirPath;         
            tree["children"] = [];            
            var dirList = fs.readdirSync(dirPath);
            for (var i=0; i < dirList.length; i++) {
                var path = dirPath+getDirseparator()+dirList[i];
                var stats = fs.statSync(path);
                if (stats.isFile()) {
                    tree["children"].push({
                        "name": pathUtils.basename(path),
                        "isFile": true,
                        "size": stats.size,
                        "lmdt": stats.mtime,   
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

    var getFileSize = function(filePath) {
        console.log("Get filesize of: "+filePath);
        var stats = fs.statSync(filePath);
        return stats.size;
        //TSPOSTIO.createDirectoryIndex(directoryIndex);
    };   

    var getLMDT = function(filePath) {
        console.log("Get last modified date time of: "+filePath);
        var stats = fs.statSync(filePath);
        return stats.mtime;
        //TSPOSTIO.createDirectoryIndex(directoryIndex);
    };

    var directoryExist = function(dirPath) {
        console.log("Checks if a directory exist: "+dirPath);

        //TSPOSTIO.createDirectoryIndex(directoryIndex);
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
	
	var createDirectory = function(dirPath) {
	    console.log("Creating directory: "+dirPath);   
        fs.mkdir(dirPath, function(error) {
            if (error) {
                console.log("Creating directory "+dirPath+" failed "+error);
                return;
            }
            TSPOSTIO.createDirectory();
        });         
	};

    var renameFile = function(filePath, newFilePath) {
        console.log("Renaming file: "+filePath+" to "+newFilePath);
        if(filePath.toLowerCase() == newFilePath.toLowerCase()) {
            console.log("Initial and target filenames are the same...");
            return false;            
        }        
        if(fs.existsSync(newFilePath)) {
            console.log("File renaming failed! Target filename already exists.");
            return false;        	
        }
        fs.rename(filePath, newFilePath, function(error) {
            if (error) {
                console.log("Renaming file failed "+error);
                return;
            }
            TSPOSTIO.renameFile(filePath, newFilePath);
        });         
    };
    	
	var loadTextFile = function(filePath) {
		console.log("Loading file: "+filePath);
        fs.readFile(filePath, 'utf8', function(error, content) {
            if (error) {
                console.log("Loading file "+filePath+" failed "+error);
                return;
            }
            TSPOSTIO.loadTextFile(content);            
        }); 
	};
	
	var saveTextFile = function(filePath,content) {
		console.log("Saving file: "+filePath);
		// TODO check if fileExist by saving needed
/*	  	if(plugin.fileExists(filePath)) {
			plugin.removeFile(filePath);      		
        } */
        fs.writeFile(filePath, content, function(error) {
            if (error) {
                console.log("Save to file "+filePath+" failed "+error);
                return;
            }
            TSPOSTIO.saveTextFile(filePath);
        }); 
	};
	
	var listDirectory = function(dirPath) {
      console.log("Listing directory: "+dirPath);
      try {
          fs.readdir(dirPath, function(error, dirList) {
            if (error) {
              console.log("Listing directory: "+dirPath+" failed "+error);
              return;
            }
        
            var anotatedDirList = [];
            for (var i=0; i < dirList.length; i++) {
                var path = dirPath+getDirseparator()+dirList[i];
                var stats = fs.statSync(path);
                //console.log('stats: ' + JSON.stringify(stats));
                anotatedDirList.push({
                    "name": dirList[i],
                    "isFile": !stats.isDirectory(),
                    "size": stats.size,
                    "lmdt": stats.mtime,
                    "path": path  
                });                 
            } 
            TSPOSTIO.listDirectory(anotatedDirList);
          });
       } catch(ex) {
           console.error("Listing directory "+dirPath+" failed "+ex);
       }                    
	};
	
	var deleteElement = function(path) {
		console.log("Deleting: "+path);
        fs.unlink(path, function(error) {
            if (error) {
                console.log("Deleting file "+path+" failed "+error);
                return;
            }
            TSPOSTIO.deleteElement();
        });		
	};
	
    var checkAccessFileURLAllowed = function() {
        console.log("checkAccessFileURLAllowed function not relevant for node..");
    };	
	
    var checkNewVersion = function() {
        console.log("Checking for new version...");
        var cVer = TSCORE.Config.DefaultSettings["appVersion"]+"."+TSCORE.Config.DefaultSettings["appBuild"];
        $.ajax({
            url: 'http://tagspaces.org/releases/version.json?nVer='+cVer,
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

    var selectDirectory = function() {
        if(document.getElementById('folderDialog') == null) {
            $("#folderLocation").after('<input style="display:none;" id="folderDialog" type="file" nwdirectory />');
        }
        var chooser = $('#folderDialog');        
        chooser.change(function(evt) {
            TSPOSTIO.selectDirectory($(this).val());
        });
        chooser.trigger('click');  
    };
    
    var openDirectory = function(dirPath) {
        gui.Shell.openItem(dirPath);
    };

    var selectFile = function() {
        if(document.getElementById('fileDialog') == null) {
            $("#folderLocation").after('<input style="display:none;" id="fileDialog" type="file" />');
        }
        var chooser = $('#fileDialog');        
        chooser.change(function(evt) {
            console.log("File selected: "+$(this).val());
        });
        chooser.trigger('click');  
    };
    
    var openExtensionsDirectory = function() {
        // TODO implement openExtensionsDirectory on node
        //gui.Shell.openItem(extPath);
        console.log("Open extensions directory functionality not implemented on chrome yet!");
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
