/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";

	console.log("Loading core.api.js ...");
	
	var tsSettings = require("tssetting");	
	var tsIOApi = require("tsioapi");
  //  var tsIOApiDropbox = require("tsioapidropbox");
    var tsPersManager = require("tspersmanager");
    var tsTagUtils = require("tstagutils");
    var tsFileOpener = require("tsfileopener");
    var tsTagsUI = require("tstagsui");
    var tsDirectoriesUI = require("tsdirectoriesui");
    var tsCoreUI = require("tscoreui");
    var tsSearch = require("tssearch");
	
	var layoutContainer = undefined;  
    var westLayout = undefined;
    var centerLayout = undefined;
    var eastLayout = undefined;

	var currentPath = undefined;
	
	var currentView = undefined;
	
	// Current selected files
	var selectedFiles = [];
	
	// Current directory list of files
	var fileList = [];
	
	// Last clicked button for removing a tag
	var selectedTag = "";
	
	var selectedTagData = "";
	
	var startTime = undefined;
	
	var subfoldersDirBrowser = undefined;
	
	var directoryBrowser = undefined;

	function initApp() {
	    console.log("Init application");
		
	    tsSettings.loadSettingsLocalStorage();
	    
        checkLocalStorageEnabled();	    
	    
	    // In firefox, by empty local storage trying to load the settings from mozilla preferences
	    if(tsSettings.Settings == undefined && isFirefox) {
	        window.setTimeout(tsIOApi.loadSettings, 1000); // executes initUI and updateSettingMozillaPreferences by success
	        console.log("Loading setting with from mozilla pref execured with delay...");
	    } 
	
	    // If still nothing found, loading the default setting from the application's javascript
	    // This is usually the case by a new installation
	    if(tsSettings.Settings == undefined) {
	        tsSettings.Settings = tsSettings.DefaultSettings;
	    }    
	  
	  	tsSettings.upgradeSettings();
        
        // Init UI components
        tsCoreUI.initUI();  
        tsTagsUI.initUI();      
        tsTagsUI.generateTagGroups();
        tsDirectoriesUI.initUI();
        tsDirectoriesUI.initLocations();
        tsFileOpener.initUI();
		tsPersManager.initPerspectives();                 
	    
	    hideLoadingAnimation();

	    $(document).ready(function() {
	        initLayout();
	        initI18N();
	        initKeyBindings();
		    $( "#loading" ).hide();  
	    
            // Show start hint by no locations
            if(tsSettings.Settings.tagspacesList.length < 1 ) {
                $( "#createNewLocation" ).tooltip( "show" );
                $( "#locationName" ).prop('disabled', true);
                $( "#selectLocation" ).prop('disabled', true);     
                tsCoreUI.showWelcomeDialog();         
            }	    
	    
	        console.log("Layout initialized");
	    }); 
	    
        checkForNewVersion();
	}

    function initI18N() {
		$.i18n.init({
		    ns: { namespaces: ['ns.common'], defaultNs: 'ns.common'},
		    lng: "en",
		    debug: false 
		}, function() {
            $('[data-i18n]').i18n();
	    });
    }	
	
    function initKeyBindings() {
    	// TODO handle documents opened for editing
	  //  $(document).bind('keyup', 'esc', closeFileViewer);
	  if(isNode) {
          var win = gui.Window.get();
	      // if (PRODUCTION == "true") {
	      $(document).bind('keyup', 'F12', function() {
	          win.showDevTools();
	      });
          $(document).bind('keyup', 'F5', function() {
              win.reloadIgnoringCache();
          });	      
          $(document).bind('keyup', 'F11', function() {
              win.toggleFullscreen();
          });                   
	  }
    }		
	
    function checkForNewVersion() {
        if(tsSettings.getCheckForUpdates()) {            
            tsIOApi.checkNewVersion();
        }
    }	
    
    function checkLocalStorageEnabled() {
        var val = 'tagspaces';
        try {
            localStorage.setItem(val, val);
            localStorage.removeItem(val);
        } catch(e) {
            tsCoreUI.showAlertDialog("Please enable the localStorage support in your browser, in order to use TagSpaces!","Error");
        }
    }    

    function updateNewVersionData(data) {
        console.log("Version Information: "+data);
        var versioningData = JSON.parse(data);
        
        // Analysing Version Information
        var availableBuild = parseInt(versioningData['appBuild']); 
        var availableVersion = parseFloat(versioningData['appVersion']);
                 
        var currentBuild = parseInt(tsSettings.DefaultSettings["appBuild"]);
        var currentVersion = parseFloat(tsSettings.DefaultSettings["appVersion"]);        

		/* Testing the new version notifications		 
		availableVersion = 1;
		currentVersion = 1;
		availableBuild = 2;
		currentBuild = 1;
		*/

        if(availableVersion > currentVersion) {
            $("#newVersionMenu").html('<p style="padding: 15px" id="newVersionMessageContent">'+
            'New TagSpaces major release available! Please go to '+
            '<a href="http://tagspaces.org/whatsnew/" target="_blank">tagspaces.org/whatsnew/</a> and update.</p>');                                    
            $("#newVersionAvailable").css('display', "inline");                                    
        } else if ((availableVersion == currentVersion) && (availableBuild > currentBuild)) {
            $("#newVersionMenu").html('<p style="padding: 15px" id="newVersionMessageContent">'+
            'New TagSpaces minor release available on '+
            '<a href="http://tagspaces.org/whatsnew/" target="_blank">tagspaces.org/whatsnew/</a></p>');                                    
            $("#newVersionAvailable").css('display', "inline");                                      
        }
    }
	
	function updateLogger(message) {
		// TODO reactivate
	    console.log("Updating logger...");
	//    $("#footer").attr("value",message);
	}
	
	function showLoadingAnimation(message) {
	    $("#loadingAnimation").css('visibility', "visible");
	}
	
	function hideLoadingAnimation(message) {
	    $("#loadingAnimation").css('visibility', "hidden");
	}
	
    function removeFileModel(model, filePath) {
        console.log("Removing file from model");            
        for(var i = 0; i < model.length; i++) {
            if(model[i][exports.fileListFILEPATH] == filePath) {
                model.splice( i, 1 );                
            }
        }
    }    	

    function updateFileModel(model, oldPath, newPath) {
        console.log("Removing file from model");            
        var title = tsTagUtils.extractTitle(newPath),
            fileExt = tsTagUtils.extractFileExtension(newPath),
            fileTags = tsTagUtils.extractTags(newPath);
                    
        for(var i = 0; i < model.length; i++) {
            if(model[i][exports.fileListFILEPATH] == oldPath) {
                model[i][exports.fileListFILEPATH] = newPath;
                model[i][exports.fileListTITLE] = title;
                model[i][exports.fileListTAGS] = fileTags;
                model[i][exports.fileListFILEEXT] = fileExt;
                // TODO complete the list
                //model[i][exports.fileListFILELMDT] = newPath;
                //model[i][exports.fileListFILENAME] = newPath;
                //model[i][exports.fileListFILESIZE] = newPath;                               
            }
        }
    }  
	
    function exportFileListCSV(fileList) {
            var csv = '';
            var headers = [];
            var rows = [];
            var numberOfTagColumns = 40; // max. estimated to 40 ca. 5 symbols per tag _[er], max. path length 25x chars   
    
            headers.push("path");
            headers.push("title");
            headers.push("size");
            for(var i = 0; i < numberOfTagColumns; i++) {
                headers.push("tag"+i);
            }
            csv += headers.join(',') + "\n";     
            
            for(var i = 0; i < fileList.length; i++) {
                var row = fileList[i][exports.fileListFILEPATH]+","+fileList[i][exports.fileListTITLE]+","+fileList[i][exports.fileListFILESIZE]+","+fileList[i][exports.fileListTAGS];
                rows.push(row);
            }
    
            csv += rows.join("\n");
            return csv;
    }    	

    function exportFileListArray(fileList) {
            var rows = [];
            for(var i = 0; i < fileList.length; i++) {
                var row = [];
                row["path"] = fileList[i][exports.fileListFILEPATH];
                row["title"] = fileList[i][exports.fileListTITLE];
                row["size"] = fileList[i][exports.fileListFILESIZE];
                
                var tags = fileList[i][exports.fileListTAGS];
                for(var j = 0; j < tags.length; j++) {
                    row["tag"+(j)] = tags[j];
                }                
                rows.push(row);
            }
            return rows;        
    }

/* UI and Layout functionalities */

	function reloadUI() {
	    location.reload();
	}
	
	window.addEventListener("orientationchange", function() {
		console.log("Current orientation: "+window.orientation);
	}, false);	

    //$( window ).on('resize', onWindowResize);

	
    function onWindowResize() {
        console.log("Window was resized to  W:"+window.innerWidth+" H:"+window.innerHeight);
        // TODO consider if file opened
        /*if(
               (window.innerWidth < window.innerHeight) // portret orientation 
               || (window.innerWidth < 1122) // window width smaller than than a minumum
           ) {
            layoutContainer.close("west");
            layoutContainer.sizePane("east", fullWidth);
            //layoutContainer.open("east");
            $('#toggleFullWidthButton').hide();                 
        } else {
            layoutContainer.sizePane("east", halfWidth);
            //layoutContainer.open("east");           
        }*/                               
    }	
	
	function openFileViewer() {
		tsCoreUI.hideAllDropDownMenus();
		if(isFullWidth) {
		    return;
		}
        var fullWidth = window.innerWidth;
        var halfWidth = Math.round(fullWidth/2);
    	if(
    	       (window.innerWidth < window.innerHeight) // portret orientation 
    	       || (window.innerWidth < 1122) // window width smaller than than a minumum
    	   ) {
        	layoutContainer.close("west");
            layoutContainer.sizePane("east", fullWidth);
            layoutContainer.open("east");
            $('#toggleFullWidthButton').hide();            		
    	} else {
        	layoutContainer.sizePane("east", halfWidth);
    		layoutContainer.open("east");     		
    	}
	}
	
	function closeFileViewer() {
        $('#toggleFullWidthButton').show();
		var fullWidth = window.innerWidth;
        var halfWidth = Math.round(fullWidth/2);
    	// In portret mode
    	if(window.innerWidth < window.innerHeight) {
        	layoutContainer.close("east");
			if(isLeftPanelOpen) {
        		layoutContainer.open("west");				
			}
    	} else {
	    	layoutContainer.close("east");    
    	}
    	isFullWidth = false; 
	}	

    var isFullWidth = false; 

    function toggleFullWidth() {
    	// TODO hide tags
        var fullWidth = window.innerWidth;
        var halfWidth = Math.round(fullWidth/2);
        if(isFullWidth) {
            layoutContainer.sizePane("east", halfWidth);
            layoutContainer.open("east");               
			if(isLeftPanelOpen) {
        		layoutContainer.open("west");				
			}
        } else {
        	layoutContainer.close("west");
            layoutContainer.sizePane("east", fullWidth);
            layoutContainer.open("east");
        }
        isFullWidth = !isFullWidth;
    }

    var isPerspectiveFooterOpen = false; 

    function togglePerspectiveFooter() {
/*        var fullHeight = window.innerHeight;
        var halfHeight = Math.round(fullHeight/2);
        if(isPerspectiveFooterOpen) {
            centerLayout.sizePane("south", .03);
            centerLayout.open("south"); 
        } else {
            centerLayout.sizePane("south", halfHeight);
            centerLayout.open("south");               
        }
        isPerspectiveFooterOpen = !isPerspectiveFooterOpen; */
    }

	var fileDetailsFull = false; 
	
	function toggleFileDetails() {
/*	    if(fileDetailsFull) {
		    fileDetailsFull = false;
		    eastLayout.sizePane("north", 70);	    		    	
	    } else {
		    fileDetailsFull = true;
		    eastLayout.sizePane("north", 140);	    	
	    }*/
	}
	
	var isLeftPanelOpen = true;
	
	function toggleLeftPanel() {
	    layoutContainer.toggle("west");
	    isLeftPanelOpen = !isLeftPanelOpen;	   
	}
	
	function initLayout (){
	    console.log("Initializing Layout...");
	
		var row1Height = 40; // px
		var row3Height = 45; // px	
	
		layoutContainer = $('body').layout({ 
			name:			'outerLayout' // for debugging & auto-adding buttons (see below)
	    ,   fxName:         "slide" // none, slide
   	    ,   fxSpeed:        "normal"
		,	autoResize:		true	// try to maintain pane-percentages
		,	autoReopen:		true	// auto-open panes that were previously auto-closed due to 'no room'
		,	autoBindCustomButtons:	true
		,	west__paneSelector: 	'.col1' 
		,	center__paneSelector: 	'.col2' 
		,	east__paneSelector: 	'.col3' 
		,	west__size: 		250		// percentage size expresses as a decimal
		,	east__size: 		0.5
		,   west__spacing_open:         1 	
		,   east__spacing_open:         1
		,	center_minWidth:				200
		,	center_minHeight:				200
	    ,   spacing_closed:		0	
		,	minSize:		100
		,	west__minWidth:		250 
		,	noRoomToOpenAction:	"hide" // 'close' or 'hide' when no room to open a pane at minSize
	//	,   west__showOverflowOnHover:	true
	//	,   center__showOverflowOnHover:	true
	//	,   east__showOverflowOnHover:	true	
		,   enableCursorHotkey:         false
		});
		
		layoutContainer.close("east");
	
		var col1Layout = layoutContainer.panes.west.layout({ 
			name:			'col1Layout' // for debugging & auto-adding buttons (see below)
	//	,	north__paneSelector: 	'.row1'
		,	center__paneSelector: 	'.row2'
		,	south__paneSelector: 	'.row3'
	//	,	north__size: 		row1Height	// percentage size expresses as a string
		,	south__size: 		row3Height
		,   north__spacing_open:        0 	
		,   south__spacing_open:        0 	
		,	autoResize:		false	// try to maintain pane-percentages
		,	closable:		false
		,	togglerLength_open:	0	// hide toggler-buttons
		,	spacing_closed:		0	// hide resizer/slider bar when closed
		,	autoReopen:		true	// auto-open panes that were previously auto-closed due to 'no room'
		,	autoBindCustomButtons:	true
		,	minSize:		25
		,	center__minHeight:	25
	//	,   north__showOverflowOnHover:	true
	//	,   center__showOverflowOnHover:	true
	//	,   south__showOverflowOnHover:	true		
		,   enableCursorHotkey:         false
		}); 
	
	
		var col2Layout = layoutContainer.panes.center.layout({ 
			name:			'col2Layout' // for debugging & auto-adding buttons (see below)
	//	,	north__paneSelector: 	'.row1'
		,	center__paneSelector: 	'.row2'
		,	south__paneSelector: 	'.row3'
	//	,	north__size: 		row1Height	// percentage size expresses as a string
		,	south__size: 		row3Height
		,   north__spacing_open:        0 	
		,   south__spacing_open:        0 	
		,	autoResize:		true	// try to maintain pane-percentages
		,	closable:		false
		,	togglerLength_open:	0	// hide toggler-buttons
		,	spacing_closed:		0	// hide resizer/slider bar when closed
		,	autoReopen:		true	// auto-open panes that were previously auto-closed due to 'no room'
		,	autoBindCustomButtons:	true
		,	minSize:		25
		,	center__minHeight:	25
		,   north__showOverflowOnHover:	true
	//	,   center__showOverflowOnHover:	true
	//	,   south__showOverflowOnHover:	true		
		,   enableCursorHotkey:         false
		}); 
	
	/*
		var col3Layout = layoutContainer.panes.east.layout({ 
			name:			'col2Layout' // for debugging & auto-adding buttons (see below)
	//	,	north__paneSelector: 	'.row1'
		,	center__paneSelector: 	'.row2'
		,	south__paneSelector: 	'.row3'
	//	,	north__size: 		row1Height	// percentage size expresses as a string
		,	south__size: 		row3Height
		,   north__spacing_open:        0 	
		,   south__spacing_open:        0 	
		,	autoResize:		true	// try to maintain pane-percentages
		,	closable:		false
		,	togglerLength_open:	0	// hide toggler-buttons
		,	spacing_closed:		0	// hide resizer/slider bar when closed
		,	autoReopen:		true	// auto-open panes that were previously auto-closed due to 'no room'
		,	autoBindCustomButtons:	true
		,	minSize:		25
		,	center__minHeight:	25
		,   north__showOverflowOnHover:	true
	//	,   center__showOverflowOnHover:	true
	//	,   south__showOverflowOnHover:	true		
		,   enableCursorHotkey:         false
		}); */
	}
	
	function switchIOAPI(type) {
		if(type=="dropbox") {
			tsIOApiDropbox.init();
			exports.IO = tsIOApiDropbox;		
		} else {
			exports.IO = tsIOApi;
		}
	}	
	
	// Proxying applications parts
	exports.Config = tsSettings;
	exports.IO = tsIOApi;	
	exports.PerspectiveManager = tsPersManager;
	exports.TagUtils = tsTagUtils;
	exports.FileOpener = tsFileOpener;
    exports.Search = tsSearch;	
	
	// Public API definition
	exports.initApp 					= initApp;
	exports.updateLogger				= updateLogger;
	exports.showLoadingAnimation 		= showLoadingAnimation;
	exports.hideLoadingAnimation 		= hideLoadingAnimation;
//	exports.fileExists 					= fileExists;
	exports.reloadUI 					= reloadUI;
	exports.openFileViewer 				= openFileViewer;
	exports.closeFileViewer 			= closeFileViewer;
	exports.toggleLeftPanel 			= toggleLeftPanel;
	exports.toggleFileDetails 			= toggleFileDetails;
	exports.toggleFullWidth             = toggleFullWidth;
	exports.togglePerspectiveFooter     = togglePerspectiveFooter;
	exports.updateNewVersionData        = updateNewVersionData;
	exports.exportFileListCSV           = exportFileListCSV;
	exports.exportFileListArray         = exportFileListArray;
	exports.removeFileModel             = removeFileModel;
	exports.updateFileModel             = updateFileModel;

	// Proxying functions from tsCoreUI
    exports.clearSearchFilter           = tsCoreUI.clearSearchFilter;
	exports.enableTopToolbar            = tsCoreUI.enableTopToolbar;
    exports.disableTopToolbar           = tsCoreUI.disableTopToolbar;	
	exports.showAlertDialog 			= tsCoreUI.showAlertDialog;
	exports.showConfirmDialog			= tsCoreUI.showConfirmDialog;
	exports.showTagEditDialog           = tsCoreUI.showTagEditDialog;
	exports.hideAllDropDownMenus		= tsCoreUI.hideAllDropDownMenus;
	exports.showFileCreateDialog        = tsCoreUI.showFileCreateDialog;	
	exports.showFileRenameDialog        = tsCoreUI.showFileRenameDialog;
    exports.showFileDeleteDialog        = tsCoreUI.showFileDeleteDialog;
	exports.showLocationsPanel        	= tsCoreUI.showLocationsPanel;
	exports.showTagsPanel        		= tsCoreUI.showTagsPanel;	
	exports.showContextMenu        		= tsCoreUI.showContextMenu;
	exports.showDirectoryBrowserDialog  = tsCoreUI.showDirectoryBrowserDialog;
	
	// Proxying functions from tsTagsUI
	exports.generateTagButtons 			= tsTagsUI.generateTagButtons;
	exports.generateExtButton           = tsTagsUI.generateExtButton;
	exports.generateTagStyle            = tsTagsUI.generateTagStyle;
	exports.openTagMenu 				= tsTagsUI.openTagMenu;
	exports.showAddTagsDialog			= tsTagsUI.showAddTagsDialog;
	exports.showTagEditInTreeDialog     = tsTagsUI.showTagEditInTreeDialog;
    exports.showDialogTagCreate         = tsTagsUI.showDialogTagCreate;
    exports.showDialogEditTagGroup      = tsTagsUI.showDialogEditTagGroup;
    exports.showDialogTagGroupCreate    = tsTagsUI.showDialogTagGroupCreate;	
    exports.calculatedTags              = tsTagsUI.calculatedTags;  
    exports.generateTagGroups           = tsTagsUI.generateTagGroups;  

	// Proxying functions from directoriesUI 
    exports.openLocation                = tsDirectoriesUI.openLocation;
	exports.updateSubDirs 				= tsDirectoriesUI.updateSubDirs;
	exports.initLocations 			    = tsDirectoriesUI.initLocations;
	exports.showCreateDirectoryDialog   = tsDirectoriesUI.showCreateDirectoryDialog;
    exports.closeCurrentLocation        = tsDirectoriesUI.closeCurrentLocation;
    exports.navigateToDirectory         = tsDirectoriesUI.navigateToDirectory; 

	// Public variables definition
	exports.currentPath 				= currentPath;
	exports.currentView 				= currentView;
	exports.selectedFiles 				= selectedFiles;
	exports.fileList 					= fileList;
	exports.selectedTag 				= selectedTag;
	exports.selectedTagData 			= selectedTagData;	
	exports.startTime                   = startTime;
	exports.subfoldersDirBrowser        = subfoldersDirBrowser;
	exports.directoryBrowser            = directoryBrowser;
	
    exports.fileListFILEEXT             = 0;
    exports.fileListTITLE               = 1;
    exports.fileListTAGS                = 2;
    exports.fileListFILESIZE            = 3;
    exports.fileListFILELMDT            = 4;
    exports.fileListFILEPATH            = 5;
    exports.fileListFILENAME            = 6;		
    
    exports.dirSeparator                = isWin?"\\":"/";    
	
});