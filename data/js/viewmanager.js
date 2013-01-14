/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define([
    'require',
    'exports',
    'module',
],function(require, exports, module) {
"use strict";

console.debug("Loading viewmanager.js");

var views = undefined;

exports.initViews = function initViews() {
	views = [];
	
	$("#viewSwitcher").empty();
	$("#viewToolbars").empty();	
	$("#viewContainers").empty();
	$("#viewFooters").empty();
	
	var defaultViewLoaded = false;
	
	for (var i=0; i < TSSETTINGS.Settings["extensions"].length; i++) {
		if(TSSETTINGS.Settings["extensions"][i].enabled 
			&& (TSSETTINGS.Settings["extensions"][i].type == "view") ) {
	//        require([TSSETTINGS.getExtensionPath()+UIAPI.getDirSeparator()+viewerExt+UIAPI.getDirSeparator()+"extension.js"], function(viewer) {
	        require(["js/"+TSSETTINGS.Settings["extensions"][i].id], function(viewer) {
	           views.push(viewer);
			   
			   initViewsUI(viewer);

	           viewer.init();
	           
			   // Loads the first view by default
			   if(!defaultViewLoaded) {
			   		UIAPI.currentView = viewer.ID;
					viewer.load();
					$( "#"+viewer.ID+"Button" ).attr("checked","checked");
					$( "#"+viewer.ID+"Button" ).button("refresh");
					
					$( "#"+viewer.ID+"Container" ).show();
					$( "#"+viewer.ID+"Toolbar" ).show(); 			   	
			   }
			   defaultViewLoaded = true;	
	        });       
		} 
	}
	
	$( "#viewSwitcher" ).buttonset();	
}

function initViewsUI(viewer) {
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
  
    UIAPI.handleElementActivation();   
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