/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";

console.debug("Loading perspective.manager.js");

var views = undefined;
var searchViewer = undefined;

var TSCORE = require("tscore");

exports.initViews = function initViews() {
	views = [];
	
	$("#viewSwitcher").empty();
	$("#viewToolbars").empty();	
	$("#viewContainers").empty();
	$("#viewFooters").empty();
	
	var defaultViewLoaded = false;

    require(["ext/perspectiveBasic/extension.js"], function(viewer) {
		views.push(viewer);
		initViewsUI(viewer);
		viewer.init();
   
   		TSCORE.currentView = viewer.ID;
		viewer.load();
		$( "#"+viewer.ID+"Button" ).attr("checked","checked");
		$( "#"+viewer.ID+"Button" ).button("refresh");
		
		$( "#"+viewer.ID+"Container" ).show();
		$( "#"+viewer.ID+"Toolbar" ).show(); 			   	
    });  

    require(["ext/perspectiveSearch/extension.js"], function(viewer) { 
       views.push(viewer);
	   initViewsUI(viewer);
       viewer.init();
       searchViewer = viewer;
    });  
	
	var extensions = TSCORE.Config.getExtensions();
	for (var i=0; i < extensions.length; i++) {
		if(extensions[i].enabled && (extensions[i].type == "view") ) {
			
			// TODO Some extension sucha ace editor are not working using paths like this "file:///C:/blabal/extension.js"
	        var extPath = TSCORE.Config.getExtensionPath()+"/"+extensions[i].id+"/"+"extension.js"; 

	        require([extPath], function(viewer) {
	            views.push(viewer);
			    initViewsUI(viewer);
		 		try { 			
		 			viewer.init();
		 		} catch(e) {
		 			console.debug("Error while executing 'init' on "+views[i].ID+" - "+e);
		 		}			   
	        });       
		} 
	}	
	
	$( "#viewSwitcher" ).buttonset();	
}

var initViewsUI = function(viewer) {
	console.debug("Init UI for "+viewer.ID);
	
	//var radioChecked = true;
	// Only the first button from radio is checked
	//radioChecked = false;

	// Creating viewer's toolbar
    $("#viewToolbars").append($("<div>", { 
        id: viewer.ID+"Toolbar",
        text: viewer.Title,
    }).hide());	
    
	// Creating viewer's container
    $("#viewContainers").append($("<div>", { 
        id: viewer.ID+"Container",
        text: viewer.Title,
        style: "width: 100%; height: 100%",
    }).hide());	        	
  
    $("#viewSwitcher").append($("<input>", { 
        type: "radio",
        name: "viewSwitcher",
        viewid: viewer.ID,
//        checked: radioChecked,
        id: viewer.ID+"Button",    
    }));

    $("#viewSwitcher").append($("<label>", { 
        for: viewer.ID+"Button",
        text: viewer.Title, 
    }));

	// Adding event listener & icon to the radio button
    $( "#"+viewer.ID+"Button" ).button({
	        text: true,
	        icons: {
	            primary: viewer.Icon
	        }
	    })        
	.click(function() { 
		exports.changeView($(this).attr("viewid")); 	
	})   
}

exports.updateIndexData = function updateIndexData(index) {
	for (var i=0; i < views.length; i++) {   
 		try { 			
 			views[i].updateIndexData(index);
 		} catch(e) {
 			console.debug("Error while executing 'updateIndexData' on "+views[i].ID+" "+e);
 		}
	}
}

exports.updateTreeData = function updateTreeData(treeData) {
	for (var i=0; i < views.length; i++) {   
 		try { 			
 			views[i].updateTreeData(treeData);
 		} catch(e) {
 			console.debug("Error while executing 'updateTreeData' on "+views[i].ID+" "+e);
 		}
	}
}

exports.updateFileBrowserData = function(dirList) {
    console.debug("Updating the file browser data...");
    
    TSCORE.fileList = [];
    var tags = undefined;
    var ext = undefined;
    var title = undefined;
    var fileSize = undefined;
    var fileLMDT = undefined;
    var path = undefined;
    // Sort the dir list alphabetically before displaying 
    // TODO sorting files not working correctly
    dirList.sort(function(a,b) { return a.name.localeCompare(b.name); });
    for (var i=0; i < dirList.length; i++) {
        if (dirList[i].type == "file"){  
            // Considering Unix HiddenEntries (. in the beginning)
            if (TSCORE.Config.Settings["showUnixHiddenEntries"] || 
               (!TSCORE.Config.Settings["showUnixHiddenEntries"] && (dirList[i].name.indexOf(".") != 0))) {
                 path = TSCORE.currentPath + TSCORE.TagUtils.DIR_SEPARATOR + dirList[i].name;
                 tags = TSCORE.TagUtils.extractTags(path);
                 title = TSCORE.TagUtils.extractTitle(path);
                 if(dirList[i].name.lastIndexOf(".") > 0) {
                     ext = dirList[i].name.substring(dirList[i].name.lastIndexOf(".")+1,dirList[i].name.length);                     
                 } else {
                     ext = "";
                 }
                 fileSize = dirList[i].size;
                 fileLMDT = dirList[i].lmdt;
                 if(fileSize == undefined) fileSize = "";
                 if(fileLMDT == undefined) fileLMDT = "";
                 var entry = [dirList[i].name,fileSize,fileLMDT,title,tags,ext];   
                 TSCORE.fileList.push(entry);
            }
        }
    }  	         
    exports.changeView(TSCORE.currentView);    
}

exports.refreshFileListContainer = function() {
	// TODO consider search view
    TSCORE.IO.listDirectory(TSCORE.currentPath);  
}

exports.changeView = function changeView(viewType) {
    console.debug("Change to "+viewType+" view.");
    TSCORE.showLoadingAnimation();
       
    //Setting the current view
    TSCORE.currentView = viewType;

	for (var i=0; i < views.length; i++) {   
 		$( "#"+views[i].ID+"Container" ).hide();
 		$( "#"+views[i].ID+"Toolbar" ).hide(); 		  
	}	        

	for (var i=0; i < views.length; i++) {   
 		if(views[i].ID == viewType) { 			
 			// Load the selected view
	 		try { 			
	 			views[i].load();
	 		} catch(e) {
	 			console.error("Error while executing 'load' on "+views[i].ID+" "+e);
	 		} 			
			$( "#"+views[i].ID+"Container" ).show();
			$( "#"+views[i].ID+"Toolbar" ).show(); 
 		}
	}	
	   	
    // Clear the list with the selected files    
    TSCORE.selectedFiles = [];  

	// Reset the filter by a view change
	exports.setFileFilter("");
	  
//    TSCORE.hideLoadingAnimation();     
}

exports.clearSelectedFiles = function clearSelectedFiles() {
    // Clear selected files
    TSCORE.selectedFiles = [];  
	for (var i=0; i < views.length; i++) {   
 		try { 			
 			views[i].clearSelectedFiles();
 		} catch(e) {
 			console.debug("Error while executing 'clearSelectedFiles' on "+views[i].ID)
 		} 		
	}	
}

exports.setFileFilter = function setFileFilter(filter) {
	for (var i=0; i < views.length; i++) {   
 		try { 			
 			views[i].setFileFilter(filter);
 		} catch(e) {
 			console.debug("Error while executing 'setFileFilter' on "+views[i].ID)
 		} 		 		
	}	
}

});