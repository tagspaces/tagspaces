/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";
	
	// Activating browser specific exports modul
	console.log("Loading web.js..");
    
    var TSCORE = require("tscore");	
	var TSPOSTIO = require("tspostioapi");
	
    require("webdavlib");	
	
	function connectDav() {
        var davClient = new nl.sara.webdav.Client("192.168.1.71");

        //var customHeaders = {};
        //customHeaders[ 'X-Test-Header' ] = 'some header';
        davClient.get(
            "/test.txt",
            function( status, data, headers ) {
                console.log("Test Status:  "+status);                      
                console.log("Test Content: "+data);
                console.log("Test headers: "+headers);     
            }
            //,customHeaders
        );
        

          davClient.propfind(
              "/TagSpaces/",
              function( status, data ) {
                    console.log("Dirlist Status:  "+status);                      
                    console.log("Dirlist Content: "+JSON.stringify(data));
              },1
              //,
              //undefined, // undefined should be depth 0
              //undefined, // undefined should be allprop
              //undefined//, // undefined should not set the include element
              //customHeaders
          );

        /*davClient.get(
            "/test.pdf",
            function( status, data, headers ) {
                console.log("Test Status:  "+status);                      
                console.log("Test Content: "+data);
                console.log("Test headers: "+headers);     
            }
            //,customHeaders
        );*/        
	};
	
	window.setTimeout(connectDav(), 1000); 
	
    /* var directoryExist = function(dirPath) {
        console.log("Checks if a directory exist: "+dirPath);
        //TSPOSTIO.
    }; */
	
    var createDirectoryIndex = function(dirPath) {
        console.log("Creating index for directory: "+dirPath);
        TSCORE.showLoadingAnimation();  
        
        var directoryIndex = [];
        TSPOSTIO.createDirectoryIndex(directoryIndex);
    };	
    
    var createDirectoryTree = function(dirPath) {
        console.log("Creating directory index for: "+dirPath);
        TSCORE.showLoadingAnimation();  
                
        var directoyTree = [];
        //console.log(JSON.stringify(directoyTree));
        TSPOSTIO.createDirectoryTree(directoyTree);
    };    
	
	var createDirectory = function(dirPath) {
	    console.log("Creating directory: "+dirPath);   
        TSCORE.showLoadingAnimation();  
                
            TSPOSTIO.createDirectory(dirPath);

	};

    var renameFile = function(filePath, newFilePath) {
        console.log("Renaming file: "+filePath+" to "+newFilePath);
        TSCORE.showLoadingAnimation();  
                
            TSPOSTIO.renameFile(filePath, newFilePath);
    };
    	
	var loadTextFile = function(filePath) {
		console.log("Loading file: "+filePath);
        TSCORE.showLoadingAnimation();  
                
            TSPOSTIO.loadTextFile(content);            
	};
	
	var saveTextFile = function(filePath,content,overWrite) {
		console.log("Saving file: "+filePath);
        TSCORE.showLoadingAnimation();  
        		
       
        // Handling the UTF8 support for text files
        var UTF8_BOM = "\ufeff";
        
        if(content.indexOf(UTF8_BOM) == 0) {
            // already has a UTF8 bom
        } else {
            content = UTF8_BOM+content;
        }

        var isNewFile = !pathUtils.existsSync(filePath);
       
            TSPOSTIO.saveTextFile(filePath, isNewFile);
	};
	
	var listDirectory = function(dirPath) {
      console.log("Listing directory: "+dirPath);
      TSCORE.showLoadingAnimation();  
              

            TSPOSTIO.errorOpeningPath();
        
            var anotatedDirList = [],
                dirList = []; // remove
            for (var i=0; i < dirList.length; i++) {
                var path = dirPath+TSCORE.dirSeparator+dirList[i];
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
                    
	};
	
	var deleteElement = function(path) {
		console.log("Deleting: "+path);
        TSCORE.showLoadingAnimation();  
        		
            TSPOSTIO.deleteElement(path);

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

    };
    
    var openDirectory = function(dirPath) {

    };

    var openFile = function(filePath) {

    };

    var selectFile = function() {
    };
    
    var openExtensionsDirectory = function() {

    };

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
    var getFileProperties = function(filePath) {
        var fileProperties = {};
/*        var stats = fs.statSync(filePath);
        if (stats.isFile()) {
            fileProperties.path = filePath;
            fileProperties.size = stats.size;
            fileProperties.lmdt = stats.mtime;
            TSPOSTIO.getFileProperties(fileProperties);
        } else {
            console.warn("Error getting file properties. "+filePath+" is directory");   
        }*/        
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
    exports.openFile                    = openFile;
	exports.selectFile 					= selectFile;
	exports.openExtensionsDirectory 	= openExtensionsDirectory;
	exports.checkAccessFileURLAllowed 	= checkAccessFileURLAllowed;
	exports.checkNewVersion 			= checkNewVersion;
    exports.getFileProperties           = getFileProperties;  	

});