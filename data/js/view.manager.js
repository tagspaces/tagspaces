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
	
	var extensions = TSSETTINGS.getExtensions();
	for (var i=0; i < extensions.length; i++) {
		if(extensions[i].enabled && (extensions[i].type == "view") ) {
	        require([TSSETTINGS.getExtensionPath()+UIAPI.getDirSeparator()+extensions[i].id+UIAPI.getDirSeparator()+"extension.js"], function(viewer) {
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
	 		try { 			
	 			views[i].load();
	 		} catch(e) {
	 			console.debug("Error while executing 'load' on "+views[i].ID+" "+e);
	 		} 			
			$( "#"+views[i].ID+"Container" ).show();
			$( "#"+views[i].ID+"Toolbar" ).show(); 
 		}
	}	
	   	
    // Clear the list with the selected files    
    UIAPI.selectedFiles = [];  
    UIAPI.currentFilename = "";

	// Reset the filter by a view change
	exports.setFileFilter("");
	  
//    UIAPI.hideLoadingAnimation();     
}

exports.clearSelectedFiles = function clearSelectedFiles() {
    // Clear selected files
    UIAPI.selectedFiles = [];  
	for (var i=0; i < views.length; i++) {   
 		try { 			
 			views[i].clearSelectedFiles();
 		} catch(e) {
 			console.debug("Erro while executing 'clearSelectedFiles' on "+views[i].ID)
 		} 		
	}	
}

exports.setFileFilter = function setFileFilter(filter) {
	for (var i=0; i < views.length; i++) {   
 		try { 			
 			views[i].setFileFilter(filter);
 		} catch(e) {
 			console.debug("Erro while executing 'setFileFilter' on "+views[i].ID)
 		} 		 		
	}	
}

});