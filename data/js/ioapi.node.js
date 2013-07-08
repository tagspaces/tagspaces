/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";
	
	// Activating browser specific exports modul
	console.log("Loading ioapi.node.js..");

	var TSCORE = require("tscore");
	
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
            var dirList = fs.readdirSync(dirPath) 
            for (var i=0; i < dirList.length; i++) {
                var path = dirPath+getDirseparator()+dirList[i];
                var stats = fs.statSync(path);
                //console.log('stats: ' + JSON.stringify(stats));
                index.push({
                    "name": dirList[i],
                    "type": stats.isDirectory()?"directory":"file",
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
            tree["type"] = "directory";
            tree["lmdt"] = dstats.mtime;   
            tree["path"] = dirPath;         
            tree["children"] = [];            
            var dirList = fs.readdirSync(dirPath) 
            for (var i=0; i < dirList.length; i++) {
                var path = dirPath+getDirseparator()+dirList[i];
                var stats = fs.statSync(path);
                if (stats.isFile()) {
                    tree["children"].push({
                        "name": pathUtils.basename(path),
                        "type": "file",
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
	
    exports.createDirectoryIndex = function(dirPath) {
        console.log("Creating index for directory: "+dirPath);
        var directoryIndex = [];
        directoryIndex = scanDirectory(dirPath, directoryIndex);
        //console.log(JSON.stringify(directoryIndex));
        TSCORE.PerspectiveManager.updateFileBrowserData(directoryIndex);
    }	
    
    exports.createDirectoryTree = function(dirPath) {
        console.log("Creating directory index for: "+dirPath);
        var directoyTree = generateDirectoryTree(dirPath);
        console.log(JSON.stringify(directoyTree));
        TSCORE.PerspectiveManager.updateTreeData(directoyTree); 
    }    
	
	exports.createDirectory = function(dirPath) {
	    console.log("Creating directory: "+dirPath);   
        fs.mkdir(dirPath, function(error) {
            if (error) {
                console.log("Creating directory "+dirPath+" failed "+error);
                return;
            }
            //TODO refresh the directory area
        });         
	}

    exports.renameFile = function(filePath, newFilePath) {
        console.log("Renaming file: "+filePath+" to "+newFilePath);
        fs.rename(filePath, newFilePath, function(error) {
            if (error) {
                console.log("Renaming file failed "+error);
                return;
            }
            TSCORE.PerspectiveManager.refreshFileListContainer();
        });         
    }
    	
	exports.loadTextFile = function(filePath) {
		console.log("Loading file: "+filePath);
        fs.readFile(filePath, function(error, content) {
            if (error) {
                console.log("Loading file "+filePath+" failed "+error);
                return;
            }
            TSCORE.FileOpener.updateEditorContent(content);             
        }); 
	}
	
	exports.saveTextFile = function(filePath,content) {
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
            TSCORE.PerspectiveManager.refreshFileListContainer();            
        }); 
	}
	
	exports.listDirectory = function(dirPath) {
      console.log("Listing directory: "+dirPath);
      fs.readdir(dirPath, function(error, dirList) {
        if (error) {
          console.log("Listing directory: "+dirPath+" failed "+error);
          return;
        }
    
        var anotatedDirList = [];
        for (var i=0; i < dirList.length; i++) {
            var path = dirPath+getDirseparator()+dirList[i];
            var path = dirPath+getDirseparator()+dirList[i];
            var stats = fs.statSync(path);
            //console.log('stats: ' + JSON.stringify(stats));
            anotatedDirList.push({
                "name": dirList[i],
                "type": stats.isDirectory()?"directory":"file",
                "size": stats.size,
                "lmdt": stats.mtime,
                "path": path  
            });                 
        } 
        TSCORE.PerspectiveManager.updateFileBrowserData(anotatedDirList);
      }); 
	}
	
	exports.getSubdirs = function(dirPath) {
	    console.log("Getting subdirs: "+dirPath);
        fs.readdir(dirPath, function(error, dirList) {
          if (error) {
            console.log("Directory listing failed "+error);
            return;
          }
    
          var anotatedDirList = [];
          for (var i=0; i < dirList.length; i++) {
              var path = dirPath+getDirseparator()+dirList[i];
              var stats = fs.statSync(path);
              if(stats.isDirectory()) {
                  anotatedDirList.push({
                      "title": dirList[i],
                      //"isFolder": true,
                      "key": path  
                  });                      
              }               
          } 
          TSCORE.updateSubDirs(anotatedDirList);
        }); 		
	}
	
	exports.deleteElement = function(path) {
		console.log("Deleting: "+path);
        fs.unlink(path, function(error) {
            if (error) {
                console.log("Deleting file "+path+" failed "+error);
                return;
            }
            TSCORE.PerspectiveManager.refreshFileListContainer();
        });		
	}
	
	exports.selectDirectory = function() {
		console.log("Select directory functionality not implemented on chrome yet!");
	//	TSCORE.showAlertDialog("Not implemented yet");
/*		nativeIO.launchFolderSelect(function(dirPath){
			if (dirPath && dirPath.length){
				$("#favoriteLocation").val(dirPath);
			}
	}); */
	}
	
	exports.selectFile = function() {
		// TODO implement selectFile
		console.log("Select file functionality not implemented on chrome yet!");
		TSCORE.showAlertDialog("Select file functionality not implemented on chrome yet!")
	}
	
	exports.openDirectory = function(dirPath) {
		// TODO implement openDirectory
		console.log("Open directory functionality not implemented on chrome yet!");
		TSCORE.showAlertDialog("Select file functionality not implemented on chrome yet!")
	}
	
	exports.openExtensionsDirectory = function() {
		// TODO implement openExtensionsDirectory
		console.log("Open extensions directory functionality not implemented on chrome yet!");
		TSCORE.showAlertDialog("Open extensions directory functionality not implemented on chrome yet!"); 
	}
	
    exports.checkNewVersion = function() {
        console.log("Checking for new version...");
        var cVer = TSCORE.Config.DefaultSettings["appVersion"]+"."+TSCORE.Config.DefaultSettings["appBuild"];
        $.ajax({
            url: 'http://tagspaces.org/releases/version.json?cVer='+cVer,
            type: 'GET',
        })
        .done(function(data) { 
            TSCORE.updateNewVersionData(data);    
        })
        .fail(function(data) { 
            console.log("AJAX failed "+data); 
        })
        ;      
    }	

});