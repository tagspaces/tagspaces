/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
// Activating browser specific IOAPI modul
define(function(require, exports, module) {
"use strict";

console.log("Loading mozilla's messaging ..");

	var TSCORE = require("tscore");	

	document.documentElement.addEventListener("addon-message1", function(event) {
	    console.log("Message received in page script from content script: "); //+JSON.stringify(event.detail));
	    TSCORE.hideLoadingAnimation();
	    var message = event.detail;
	    switch (message.command) {
	      case "loadSettings":
	        if(message.success) {
	            try {
	                console.log("Loading settings...: "+JSON.stringify(message.content));
	                TSCORE.Config.updateSettingMozillaPreferences(message.content);
	
	                TSCORE.initFavorites();
	                TSCORE.generateTagGroups();
	                  
	            } catch (ex) {
	                console.log("Exception while getting setting from firefox failed "+ex)
	            }
	        } else {
	            console.log("Getting setting from firefox failed") 
	        }
	        break;
	      case "saveSettings":
	        if(message.success) {
	            console.log("Saving setting as native mozilla preference successfull!")
	        } else {
	            console.log("Saving setting as native mozilla preference failed!")            
	        }
	        break;        
	      case "rename":
	        if(message.success){
	            TSCORE.updateLogger("Rename success");   
	            // message.content contains the name of the file after the rename
	            if(TSCORE.FileOpener.isFileOpened()) {
	                TSCORE.FileOpener.openFile(message.content);	            	
	            }
	            // TODO to be replaced with a function which replaced the 
	            // renamed file in the model of the perspective
	            TSCORE.PerspectiveManager.refreshFileListContainer();
	        } else {
	            TSCORE.updateLogger("Rename failed");        
	        }
	        break;
	      case "saveTextFile":
	        if(message.success){
	            if(TSCORE.FileOpener.isFileOpened()) {
	            	// TODO Automatically reopening of the file is not desirable in every case ...
	                TSCORE.FileOpener.openFile(message.content);	            	
	            }          
	        } else {
	            TSCORE.updateLogger("Save failed");      
	        }
	        break;
	      case "createDirectory":
	        if(message.success){
	            TSCORE.updateLogger("Create dir success");            
	            TSCORE.openFavorite(TSCORE.Config.Settings["tagspacesList"][0].path, TSCORE.Config.Settings["tagspacesList"][0].name);
	        } else {
	            TSCORE.updateLogger("Create dir failed");        
	        }
	        break;
	      case "loadTextFile":
	        if(message.success){
	            TSCORE.FileOpener.updateEditorContent(message.content);         
	        } else {
	            TSCORE.updateLogger("File loading failed");      
	        }
	        break;
	      case "listDirectory":
	        if(message.success){
	            TSCORE.PerspectiveManager.updateFileBrowserData(message.content);       
	        } else {
	            TSCORE.updateLogger("List directory failed");        
	        }
	        break;      
	      case "indexDirectory":
	        if(message.success){
	            //console.log("Directory Index: "+JSON.stringify(message.content));
	            TSCORE.PerspectiveManager.updateFileBrowserData(message.content);       
	        } else {
	            TSCORE.updateLogger("Indexing directory failed");        
	        }
	        break;  
	      case "createDirectoryTree":
	        if(message.success){
	            console.log("Directory tree: "+JSON.stringify(message.content));
	            TSCORE.PerspectiveManager.updateTreeData(message.content);       
	        } else {
	            TSCORE.updateLogger("Indexing directory failed");        
	        }
	        break;  
	      case "getSubdirs":
	        if(message.success){
	            var dirListing = [];
	            for (var i=0; i < message.content.length; i++) {
	                dirListing.push(message.content[i]);
	            }
	            // TODO JSON functions are a workarround for a bug....
	            TSCORE.updateSubDirs(JSON.parse( JSON.stringify(dirListing)));
	        } else {
	            TSCORE.updateLogger("Getting subdirs failed");       
	        }
	        break;  
	      case "delete":
	        if(message.success){
	            TSCORE.updateLogger("Delete success"); 
	            TSCORE.PerspectiveManager.refreshFileListContainer();	                          
	        } else {
	            TSCORE.updateLogger("Delete failed");        
	        }
	        break;          
	      case "selectDirectory":
	        if(message.success){
	        	// TODO make the use of this function more general
				$("#folderLocation").val(message.content);
	        } else {
	            TSCORE.updateLogger("Selecting directory failed.");        
	        }
	        break;  
          case "checkNewVersion":
            if(message.success){
                TSCORE.updateLogger("Getting New Version Information Successfull");            
                TSCORE.updateNewVersionData(message.content);
            } else {
                TSCORE.updateLogger("Create dir failed");        
            }
            break;	                
	      default:
	        break;
	    }   
	}, false);
	
});