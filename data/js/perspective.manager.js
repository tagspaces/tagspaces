/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";

console.debug("Loading perspective.manager.js");

var perspectives = undefined;

var TSCORE = require("tscore");

var initViews = function () {
	perspectives = [];
	
	$("#viewSwitcher").empty();
	$("#viewToolbars").empty();	
	$("#viewContainers").empty();
	$("#viewFooters").empty();
	
	var defaultViewLoaded = false;

	// Loading perspectiveDefault as a default perspective
    require(["ext/perspectiveDefault/extension.js"], function(perspective) {
		perspectives.push(perspective);
		initViewsUI(perspective);
		perspective.init();
   
   		TSCORE.currentView = perspective.ID;
		perspective.load();
    });  
	
	var extensions = TSCORE.Config.getExtensions();
	for (var i=0; i < extensions.length; i++) {
		if(extensions[i].enabled && (extensions[i].type == "view") ) {
			
			// TODO Some libraries such as ace editor are not working using paths like this "file:///C:/blabal/extension.js"
	        var extPath = TSCORE.Config.getExtensionPath()+"/"+extensions[i].id+"/"+"extension.js"; 

	        require([extPath], function(perspective) {
	            perspectives.push(perspective);
			    initViewsUI(perspective);
		 		try { 			
		 			perspective.init();
		 		} catch(e) {
		 			console.debug("Error while executing 'init' on "+perspectives[i].ID+" - "+e);
		 		}			   
	        });       
		} 
	}	
	
	$( "#viewSwitcher" ).buttonset();	
}

var initViewsUI = function(perspective) {
	console.debug("Init UI for "+perspective.ID);
	
	// Creating perspective's toolbar
    $("#viewToolbars").append($("<div>", { 
        id: perspective.ID+"Toolbar",
        text: perspective.Title,
    }).hide());	
    
	// Creating perspective's container
    $("#viewContainers").append($("<div>", { 
        id: perspective.ID+"Container",
        text: perspective.Title,
        style: "width: 100%; height: 100%",
    }).hide());	        	
  
    $("#viewSwitcher").append($("<input>", { 
        type: "radio",
        name: "viewSwitcher",
        viewid: perspective.ID,
//        checked: radioChecked,
        id: perspective.ID+"Button",    
    }));

    $("#viewSwitcher").append($("<label>", { 
        for: perspective.ID+"Button",
        text: perspective.Title, 
    }));

	// Adding event listener & icon to the radio button
    $( "#"+perspective.ID+"Button" ).button({
	        text: true,
	        icons: {
	            primary: perspective.Icon
	        }
	    })        
	.click(function() { 
		changeView($(this).attr("viewid")); 	
	})   
}

var getNextFile = function (filePath) {
	for (var i=0; i < perspectives.length; i++) {   
		if(perspectives[i].ID == TSCORE.currentView) { 	
	 		try { 			
	 			return perspectives[i].getNextFile(filePath);
	 		} catch(e) {
	 			console.debug("Error while executing 'getNextFile' on "+perspectives[i].ID+" "+e);
	 		}
 		}
	}
}

var getPrevFile = function (filePath) {
	for (var i=0; i < perspectives.length; i++) {   
		if(perspectives[i].ID == TSCORE.currentView) { 	
	 		try { 			
	 			return perspectives[i].getPrevFile(filePath);
	 		} catch(e) {
	 			console.debug("Error while executing 'getPrevFile' on "+perspectives[i].ID+" "+e);
	 		}
 		}
	}
}

var updateTreeData = function (treeData) {
	for (var i=0; i < perspectives.length; i++) {   
 		try { 			
 			perspectives[i].updateTreeData(treeData);
 		} catch(e) {
 			console.debug("Error while executing 'updateTreeData' on "+perspectives[i].ID+" "+e);
 		}
	}
}

var updateFileBrowserData = function(dirList) {
    console.debug("Updating the file browser data...");
    
    TSCORE.fileList = [];
    var tags = undefined;
    var ext = undefined;
    var title = undefined;
    var fileSize = undefined;
    var fileLMDT = undefined;
    var path = undefined;
    var filename = undefined;
    for (var i=0; i < dirList.length; i++) {
        if (dirList[i].type == "file"){  
            // Considering Unix HiddenEntries (. in the beginning of the filename)
            if (TSCORE.Config.Settings["showUnixHiddenEntries"] || 
               (!TSCORE.Config.Settings["showUnixHiddenEntries"] && (dirList[i].name.indexOf(".") != 0))) {
                 filename = dirList[i].name;
                 path = dirList[i].path;
                 tags = TSCORE.TagUtils.extractTags(path);
                 title = TSCORE.TagUtils.extractTitle(path);
				 ext = TSCORE.TagUtils.extractFileExtension(path)
                 fileSize = dirList[i].size;
                 fileLMDT = dirList[i].lmdt;
                 
                 if(fileSize == undefined) fileSize = "";
                 if(fileLMDT == undefined) fileLMDT = "";
                 var entry = [title,tags,fileSize,fileLMDT,path,filename,ext];   
                 TSCORE.fileList.push(entry);
            }
        }
    }    
    changeView(TSCORE.currentView);    
}

var refreshFileListContainer = function() {
	// TODO consider search view
    TSCORE.IO.listDirectory(TSCORE.currentPath);  
}

var changeView = function (viewType) {
    console.debug("Change to "+viewType+" view.");
    TSCORE.showLoadingAnimation();
       
    //Setting the current view
    TSCORE.currentView = viewType;

	for (var i=0; i < perspectives.length; i++) {   
 		$( "#"+perspectives[i].ID+"Container" ).hide();
 		$( "#"+perspectives[i].ID+"Toolbar" ).hide(); 		  
	}	        

	for (var i=0; i < perspectives.length; i++) {   
 		if(perspectives[i].ID == viewType) { 			
 			// Load the selected view
	 		//try { 			
	 			perspectives[i].load();
	 		//} catch(e) {
	 		//	console.error("Error while executing 'load' on "+perspectives[i].ID+" "+e);
	 		//} 			
			$( "#"+perspectives[i].ID+"Container" ).show();
			$( "#"+perspectives[i].ID+"Toolbar" ).show(); 
 		}
	}	
	   	
    // Clear the list with the selected files    
    TSCORE.selectedFiles = [];  

	// Reset the filter by a view change
	setFileFilter("");
	  
//    TSCORE.hideLoadingAnimation();     
}

var clearSelectedFiles = function () {
    // Clear selected files
    TSCORE.selectedFiles = [];  
	for (var i=0; i < perspectives.length; i++) {   
 		try { 			
 			perspectives[i].clearSelectedFiles();
 		} catch(e) {
 			console.debug("Error while executing 'clearSelectedFiles' on "+perspectives[i].ID)
 		} 		
	}	
}

var setFileFilter = function (filter) {
	for (var i=0; i < perspectives.length; i++) {   
 		try { 			
 			perspectives[i].setFileFilter(filter);
 		} catch(e) {
 			console.debug("Error while executing 'setFileFilter' on "+perspectives[i].ID)
 		} 		 		
	}	
}

exports.initViews 					 = initViews	
exports.getNextFile					 = getNextFile;
exports.getPrevFile 				 = getPrevFile;
exports.updateTreeData				 = updateTreeData;
exports.updateFileBrowserData		 = updateFileBrowserData;
exports.refreshFileListContainer	 = refreshFileListContainer;
exports.clearSelectedFiles			 = clearSelectedFiles;
exports.setFileFilter				 = setFileFilter;

});