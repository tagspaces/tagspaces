/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";

console.log("Loading perspective.manager.js");

var perspectives = undefined;

var TSCORE = require("tscore");

var initViews = function () {
	perspectives = [];
	
	$("#viewSwitcher").empty();
	$("#viewToolbars").empty();	
	$("#viewContainers").empty();
	$("#viewFooters").empty();
	
	var defaultViewLoaded = false;
	
    var extensions = TSCORE.Config.getPerspectives();
    for (var i=0; i < extensions.length; i++) {
           
        // TODO Some libraries such as ace editor are not working using paths like this "file:///C:/blabal/extension.js"
        var extPath = TSCORE.Config.getExtensionPath()+"/"+extensions[i].id+"/extension.js"; 

        require([extPath], function(perspective) {
            perspectives.push(perspective);
            try {
                // Creating perspective's toolbar
                $("#viewToolbars").append($("<div>", { 
                    id: perspective.ID+"Toolbar",
                    class: "btn-toolbar",
                    text: perspective.Title,
                }).hide()); 
                
                // Creating perspective's container
                $("#viewContainers").append($("<div>", { 
                    id: perspective.ID+"Container",
                    class: "btn-toolbar",
                    text: perspective.Title,
                    style: "width: 100%; height: 100%",
                }).hide());             
            
                // Creating perspective's footer
                $("#viewFooters").append($("<div>", { 
                    id: perspective.ID+"Footer",
                    class: "btn-toolbar",
                    text: perspective.Title,
                    style: "width: 100%; height: 100%",
                }).hide());                             
                perspective.init();
            } catch(e) {
                console.log("Error while executing 'init' on "+perspectives[i].ID+" - "+e);
            } finally {
                if( perspectives.length == extensions.length) {
                    initViewSwitcher();
                }
            }            
        });       
    }
};

var initViewSwitcher = function() {
    var extensions = TSCORE.Config.getPerspectives();
	$("#viewSwitcher").empty();
	$("#viewSwitcher").append("<li class='dropdown-header'><span id=''>Perspective Switch</span><button type='button' class='close'>×</button></li>");
	$("#viewSwitcher").append("<li class='divider'></li>");	
    for (var i=0; i < extensions.length; i++) {
        var curPers = undefined;        
        // Finding the right perspective 
        perspectives.forEach(function(value) {
            if(value.ID == extensions[i].id) {
                curPers = value;
            }
        }); 				
      
        $("#viewSwitcher").append($("<li>", {})
        .append($("<a>", { 
            "viewid":   curPers.ID,
            "id":       curPers.ID+"Button",
            "text":     " "+curPers.Title    
        })        
        .prepend($("<i>", {
            "class":  curPers.Icon
        }))));
    
        // Adding event listener & icon to the radio button
        $( "#"+curPers.ID+"Button" ).click(function() { 
            changeView($(this).attr("viewid"));
        });   
    };     

    if(perspectives.length > 0) {
        TSCORE.currentView = perspectives[0].ID;       
        changeView(TSCORE.currentView);
    }
};

var getNextFile = function (filePath) {
	for (var i=0; i < perspectives.length; i++) {   
		if(perspectives[i].ID == TSCORE.currentView) { 	
	 		try { 			
	 			return perspectives[i].getNextFile(filePath);
	 		} catch(e) {
	 			console.log("Error while executing 'getNextFile' on "+perspectives[i].ID+" "+e);
	 		}
 		}
	}
};

var getPrevFile = function (filePath) {
	for (var i=0; i < perspectives.length; i++) {   
		if(perspectives[i].ID == TSCORE.currentView) { 	
	 		try { 			
	 			return perspectives[i].getPrevFile(filePath);
	 		} catch(e) {
	 			console.log("Error while executing 'getPrevFile' on "+perspectives[i].ID+" "+e);
	 		}
 		}
	}
};

var updateTreeData = function (treeData) {
	for (var i=0; i < perspectives.length; i++) {   
 		try { 			
 			perspectives[i].updateTreeData(treeData);
 		} catch(e) {
 			console.log("Error while executing 'updateTreeData' on "+perspectives[i].ID+" "+e);
 		}
	}
};

var updateFileBrowserData = function(dirList) {
    console.log("Updating the file browser data...");
    
    TSCORE.fileList = [];
    var tags = undefined;
    var ext = undefined;
    var title = undefined;
    var fileSize = undefined;
    var fileLMDT = undefined;
    var path = undefined;
    var filename = undefined;
    for (var i=0; i < dirList.length; i++) {
        if (dirList[i].isFile){  
            // Considering Unix HiddenEntries (. in the beginning of the filename)
            if (TSCORE.Config.getShowUnixHiddenEntries() || 
               (!TSCORE.Config.getShowUnixHiddenEntries() && (dirList[i].name.indexOf(".") != 0))) {
                 filename = dirList[i].name;
                 path = dirList[i].path;
                 tags = TSCORE.TagUtils.extractTags(path);
                 title = TSCORE.TagUtils.extractTitle(path);
				 ext = TSCORE.TagUtils.extractFileExtension(path);
                 fileSize = dirList[i].size;
                 fileLMDT = dirList[i].lmdt;
                 
                 if(fileSize == undefined) fileSize = "";
                 if(fileLMDT == undefined) fileLMDT = "";
                 var entry = [ext,title,tags,fileSize,fileLMDT,path,filename];   
                 TSCORE.fileList.push(entry);
            }
        }
    }    
    changeView(TSCORE.currentView);    
};

var refreshFileListContainer = function() {
	// TODO consider search view
	TSCORE.startTime = new Date().getTime(); 
    TSCORE.IO.listDirectory(TSCORE.currentPath);  
};

var changeView = function (viewType) {
    console.log("Change to "+viewType+" view.");
    TSCORE.showLoadingAnimation();
       
    //Setting the current view
    TSCORE.currentView = viewType;
 
    
/*    if(TSCORE.currentPath == undefined) {
        TSCORE.showAlertDialog("Please select first location from the dropdown on the left!");
    }*/

	for (var i=0; i < perspectives.length; i++) {   
 		$( "#"+perspectives[i].ID+"Container" ).hide();
 		$( "#"+perspectives[i].ID+"Toolbar" ).hide();
 		$( "#"+perspectives[i].ID+"Footer" ).hide(); 
	}	        

	for (var i=0; i < perspectives.length; i++) {   
 		if(perspectives[i].ID == viewType) { 			
            $('#currentPerspectitveIcon').removeClass();
            $('#currentPerspectitveIcon').addClass(perspectives[i].Icon);
            $('#currentPerspectitveName').text(" "+perspectives[i].Title);   

 			perspectives[i].load();

			$( "#"+perspectives[i].ID+"Container" ).show();
			$( "#"+perspectives[i].ID+"Toolbar" ).show();
            $( "#"+perspectives[i].ID+"Footer" ).show(); 			 
 		}
	}	
	   	
    // Clear the list with the selected files    
    TSCORE.PerspectiveManager.clearSelectedFiles(); 
	  
    TSCORE.hideLoadingAnimation();     
};

var clearSelectedFiles = function () {
    // Clear selected files
    TSCORE.selectedFiles = [];  
	for (var i=0; i < perspectives.length; i++) {   
 		try { 			
 			perspectives[i].clearSelectedFiles();
 		} catch(e) {
 			console.log("Error while executing 'clearSelectedFiles' on "+perspectives[i].ID);
 		} 		
	}	
};

var setFileFilter = function (filter) {
	for (var i=0; i < perspectives.length; i++) {   
 		try {
 		    if(perspectives[i].ID == TSCORE.currentView){
                perspectives[i].setFileFilter(filter); 		        
 		    } 	
 		} catch(e) {
 			console.log("Error while executing 'setFileFilter' on "+perspectives[i].ID);
 		} 		 		
	}	
};

exports.initViews 					 = initViews;	
exports.getNextFile					 = getNextFile;
exports.getPrevFile 				 = getPrevFile;
exports.updateTreeData				 = updateTreeData;
exports.updateFileBrowserData		 = updateFileBrowserData;
exports.refreshFileListContainer	 = refreshFileListContainer;
exports.clearSelectedFiles			 = clearSelectedFiles;
exports.setFileFilter				 = setFileFilter;

});