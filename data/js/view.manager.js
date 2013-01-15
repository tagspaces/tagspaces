/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define([
    'require',
    'exports',
    'module',
],function(require, exports, module) {
"use strict";

console.debug("Loading view.manager.js");

var views = undefined;

var searchViewer = undefined;

exports.initViews = function initViews() {
	views = [];
	
	$("#viewSwitcher").empty();
	$("#viewToolbars").empty();	
	$("#viewContainers").empty();
	$("#viewFooters").empty();
	
	var defaultViewLoaded = false;

    require(["js/view.basic"], function(viewer) {
		views.push(viewer);
		initViewsUI(viewer);
		viewer.init();
   
   		UIAPI.currentView = viewer.ID;
		viewer.load();
		$( "#"+viewer.ID+"Button" ).attr("checked","checked");
		$( "#"+viewer.ID+"Button" ).button("refresh");
		
		$( "#"+viewer.ID+"Container" ).show();
		$( "#"+viewer.ID+"Toolbar" ).show(); 			   	
    });  

    require(["js/view.search"], function(viewer) {
       views.push(viewer);
	   initViewsUI(viewer);
       viewer.init();
       searchViewer = viewer;
    });  
	
	for (var i=0; i < TSSETTINGS.Settings["extensions"].length; i++) {
		if(TSSETTINGS.Settings["extensions"][i].enabled 
			&& (TSSETTINGS.Settings["extensions"][i].type == "view") ) {
	        require([TSSETTINGS.getExtensionPath()+UIAPI.getDirSeparator()+TSSETTINGS.Settings["extensions"][i].id+UIAPI.getDirSeparator()+"extension.js"], function(viewer) {
	           views.push(viewer);
			   initViewsUI(viewer);
	           viewer.init();
	        });       
		} 
	}	
	
	$( "#viewSwitcher" ).buttonset();	
}

exports.updateIndexData = function updateIndexData(index) {
    console.debug("Enhancing directory index...");
    var enhancedIndex = [];
    var tags = undefined;
    var ext = undefined;
    var title = undefined;
    var fileSize = undefined;
    var fileLMDT = undefined;
    var path = undefined;
    for (var i=0; i < index.length; i++) {
        if (index[i].type == "file"){  
            // Considering Unix HiddenEntries (. in the beginning of the filename)
            if (TSSETTINGS.Settings["showUnixHiddenEntries"] || 
               (!TSSETTINGS.Settings["showUnixHiddenEntries"] && (index[i].name.indexOf(".") != 0))) {
                 tags = TSAPI.extractTags(index[i].name);
                 title = TSAPI.extractTitle(index[i].name);
                 if(index[i].name.lastIndexOf(".") > 0) {
                     ext = index[i].name.substring(index[i].name.lastIndexOf(".")+1,index[i].name.length);                     
                 } else {
                     ext = "";
                 }
                 fileSize = index[i].size;
                 fileLMDT = index[i].lmdt;
                 path = index[i].path;
                 if(fileSize == undefined) fileSize = "";
                 if(fileLMDT == undefined) fileLMDT = "";
                 var entry = [index[i].name,fileSize,fileLMDT,title,tags,ext,path];   
                 enhancedIndex.push(entry);
            }
        }
    } 	
	searchViewer.updateIndexData(enhancedIndex);
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

exports.changeView = function changeView(viewType) {
    console.debug("Change to "+viewType+" view.");
    UIAPI.showLoadingAnimation();
       
    //Setting the current view
    UIAPI.currentView = viewType;

	for (var i=0; i < views.length; i++) {   
 		$( "#"+views[i].ID+"Container" ).hide();
 		$( "#"+views[i].ID+"Toolbar" ).hide(); 		  
	}	        

	for (var i=0; i < views.length; i++) {   
 		if(views[i].ID == viewType) { 			
 			// Load the selected view
 			views[i].load();
			$( "#"+views[i].ID+"Container" ).show();
			$( "#"+views[i].ID+"Toolbar" ).show(); 
 		}
	}	
	   	
    // Clear the list with the selected files    
    UIAPI.selectedFiles = [];  
    UIAPI.currentFilename = "";
  
//    UIAPI.hideLoadingAnimation();     
}

exports.clearSelectedFiles = function clearSelectedFiles() {
    // Clear selected files
    UIAPI.selectedFiles = [];  
	for (var i=0; i < views.length; i++) {   
 		views[i].clearSelectedFiles();
	}	
}

exports.setFileFilter = function setFileFilter(filter) {
	for (var i=0; i < views.length; i++) {   
 		views[i].setFileFilter(filter);
	}	
}

});