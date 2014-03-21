/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";

console.log("Loading perspective.manager.js ...");

var perspectives = undefined;

var TSCORE = require("tscore");

var initPerspectives = function () {
    
	perspectives = [];
	
	$("#viewSwitcher").empty();
	$("#viewToolbars").empty();	
	$("#viewContainers").empty();
	$("#viewFooters").empty();
	
	initWelcomeScreen();
	
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
                    text: perspective.Title,
                    style: "width: 100%; height: 100%",
                }).hide());             
            
                // Creating perspective's footer
                $("#viewFooters").append($("<div>", { 
                    id: perspective.ID+"Footer",
                    text: perspective.Title,
                }).hide());                             
                perspective.init();
            } catch(e) {
                console.log("Error while executing 'init' on "+perspectives[i].ID+" - "+e);
            } finally {
                if( perspectives.length == extensions.length) {
                    initPerspectiveSwitcher();
                    
                    // Opening last saved location by the start of the application
                    var lastLocation = TSCORE.Config.getLastOpenedLocation();
                    if(lastLocation != undefined && lastLocation.length > 1) {
                       TSCORE.openLocation(lastLocation);
                    }                       
                }
            }            
        });       
    }
};

var initWelcomeScreen = function() {
        /* require([
              "text!templates/WelcomeScreen.html",
            ], function(uiTPL) {
                // Check if dialog already created
                if($("#dialogLocationEdit").length < 1) {
                    var uiTemplate = Handlebars.compile( uiTPL );
                    $("#viewContainers").append(uiTemplate()); 
                }
        }); */   
        $("#viewContainers").append('<div id="welcomeScreen"></div>');    
};

var initPerspectiveSwitcher = function() {
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
            "title":    curPers.ID,
            "id":       curPers.ID+"Button",
            "text":     " "+curPers.Title    
        })        
        .prepend($("<i>", {
            "class":  curPers.Icon
        }))));
    
        // Adding event listener & icon to the radio button
        $( "#"+curPers.ID+"Button" ).click(function() { 
            changePerspective($(this).attr("viewid"));
        });   
    };     
};

var redrawCurrentPerspective = function () {
    for (var i=0; i < perspectives.length; i++) {   
        if(perspectives[i].ID == TSCORE.currentView) {  
            try {           
                perspectives[i].load();
                break;
            } catch(e) {
                console.error("Error while executing 'redrawCurrentPerspective' on "+perspectives[i].ID+" "+e);
            }
        }
    }
};

var removeFileUI = function (filePath) {
    console.log("Removing file from perspectives");    
    for (var i=0; i < perspectives.length; i++) {   
        try {           
            perspectives[i].removeFileUI(filePath);
        } catch(e) {
            console.error("Error while executing 'removeFileUI' on "+perspectives[i].ID+" "+e);
        }
    }
};

var updateFileUI = function (oldFilePath,newFilePath) {
    console.log("Updating file in perspectives");    
    for (var i=0; i < perspectives.length; i++) {   
        try {           
            perspectives[i].updateFileUI(oldFilePath, newFilePath);
        } catch(e) {
            console.error("Error while executing 'updateFileUI' on "+perspectives[i].ID+" "+e);
        }
    }
};

var getNextFile = function (filePath) {
	for (var i=0; i < perspectives.length; i++) {   
		if(perspectives[i].ID == TSCORE.currentView) { 	
	 		try { 			
	 			return perspectives[i].getNextFile(filePath);
	 		} catch(e) {
	 			console.error("Error while executing 'getNextFile' on "+perspectives[i].ID+" "+e);
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
	 			console.error("Error while executing 'getPrevFile' on "+perspectives[i].ID+" "+e);
	 		}
 		}
	}
};

var updateTreeData = function (treeData) {
	for (var i=0; i < perspectives.length; i++) {   
 		try { 			
 			perspectives[i].updateTreeData(treeData);
 		} catch(e) {
 			console.error("Error while executing 'updateTreeData' on "+perspectives[i].ID+" "+e);
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
                 filename = $("<html>").text(dirList[i].name).html();
                 path = $("<html>").text(dirList[i].path).html();
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
    changePerspective(TSCORE.currentView); 
};

var refreshFileListContainer = function() {
	// TODO consider search view
    TSCORE.IO.listDirectory(TSCORE.currentPath);  
};

var hideAllPerspectives = function() {
    $( "#welcomeScreen" ).hide();
    for (var i=0; i < perspectives.length; i++) {   
        $( "#"+perspectives[i].ID+"Container" ).hide();
        $( "#"+perspectives[i].ID+"Toolbar" ).hide();
        $( "#"+perspectives[i].ID+"Footer" ).hide(); 
    }    
};

var changePerspective = function (viewType) {
    console.log("Change to "+viewType+" view.");
    TSCORE.showLoadingAnimation();
       
    // Loading first perspective by default
    if(viewType == undefined) {
        TSCORE.currentView = perspectives[0].ID;       
    } else {
        //Setting the current view
        TSCORE.currentView = viewType;          
    }      
       
    if(TSCORE.currentView == undefined) {
        TSCORE.showAlertDialog("No Perspectives found","");
        return false;
    }
    
	hideAllPerspectives();        

	for (var i=0; i < perspectives.length; i++) {   
 		if(perspectives[i].ID == viewType) { 			
            $('#currentPerspectitveIcon').removeClass();
            $('#currentPerspectitveIcon').addClass(perspectives[i].Icon);
            $('#currentPerspectitveName').text(" "+perspectives[i].Title);   
            $('#currentPerspectitveName').attr("title",perspectives[i].ID);   

 			perspectives[i].load();

			$( "#"+perspectives[i].ID+"Container" ).show();
			$( "#"+perspectives[i].ID+"Toolbar" ).show();
            $( "#"+perspectives[i].ID+"Footer" ).show(); 			 
 		}
	}	
	   	
    // Clear the list with the selected files    
    clearSelectedFiles(); 
    
    // Enabled the main toolbar e.g. search functionality
    TSCORE.enableTopToolbar();
	  
    TSCORE.hideLoadingAnimation();     
};

var clearSelectedFiles = function () {
    // Clear selected files
    TSCORE.selectedFiles = [];  
	for (var i=0; i < perspectives.length; i++) {   
 		try { 			
 			perspectives[i].clearSelectedFiles();
 		} catch(e) {
 			console.error("Error while executing 'clearSelectedFiles' on "+perspectives[i].ID+" - "+e);
 		} 		
	}	
};

exports.initPerspectives 			 = initPerspectives;
exports.hideAllPerspectives          = hideAllPerspectives;	
exports.redrawCurrentPerspective     = redrawCurrentPerspective;
exports.getNextFile					 = getNextFile;
exports.getPrevFile 				 = getPrevFile;
exports.updateTreeData				 = updateTreeData;
exports.updateFileBrowserData		 = updateFileBrowserData;
exports.refreshFileListContainer	 = refreshFileListContainer;
exports.clearSelectedFiles			 = clearSelectedFiles;
exports.removeFileUI                 = removeFileUI;
exports.updateFileUI                 = updateFileUI;
exports.changePerspective            = changePerspective;

});