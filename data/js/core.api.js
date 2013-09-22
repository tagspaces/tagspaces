/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";

	console.log("Loading core.api.js ...");
	
	var tsSettings = require("tssetting");	
	var tsIOApi = require("tsioapi");
    var tsPersManager = require("tspersmanager");
    var tsTagUtils = require("tstagutils");
    var tsFileOpener = require("tsfileopener");
    var tsTagsUI = require("tstagsui");
    var tsDirectoriesUI = require("tsdirectoriesui");
    var tsCoreUI = require("tscoreui");
	
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

	function initApp() {
	    console.log("Init application");	
	
		tsCoreUI.initUI();
	
	    tsTagsUI.initContextMenus();
	    tsTagsUI.initDialogs();
	    
	    tsDirectoriesUI.initDialogs();
	    tsDirectoriesUI.initButtons();
	    tsDirectoriesUI.initContextMenus();   
		
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
	    
	    // Init views
		tsPersManager.initViews();                 
	    
	    $("#appVersion").text(tsSettings.DefaultSettings["appVersion"]+"beta");
	    $("#appVersion").attr("title","["+tsSettings.DefaultSettings["appVersion"]+"."+tsSettings.DefaultSettings["appBuild"]+"]");
	
	    tsDirectoriesUI.initConnections();
	    
	    tsTagsUI.generateTagGroups();
	    
	    hideLoadingAnimation();

	    $(document).ready(function() {
		    $( "#container" ).show();  
		    $( "#helpers" ).show();
	        initLayout();
		    $( "#loading" ).hide();  
	    
	        console.log("Layout initialized");

		    // Show start hint
		   	if(tsSettings.Settings.tagspacesList.length < 1 ) {
		   		$( "#createNewLocation" ).attr("title", "Start using TagSpaces by creating a new location.");
                $( "#connectionsList" ).width($( "#reloadTagSpace" ).width()+$("#selectTagSpace").width());
                $( "#connectionsList" ).show().position({
                    my: "left top",
                    at: "left bottom",
                    of: $( "#reloadTagSpace" )
                });
		    	$( "#createNewLocation" ).attr("style","border:1px solid #00AE00; border-radius:5px; border-color:#00AE00; box-shadow:0 0 10px #00AE00;");
		    	$( "#createNewLocation" ).tooltip( { placement: "bottom" } );
		    	$( "#createNewLocation" ).tooltip( "show" );
		   	}
	    }); 
	    
        checkForNewVersion();
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
            'New major TagSpaces release available! Please go to '+
            '<a href="http://tagspaces.org/downloads/" target="_blank">tagspaces.org</a> and update.</p>');                                    
            $("#newVersionAvailable").css('display', "inline");                                    
        } else if ((availableVersion == currentVersion) && (availableBuild > currentBuild)) {
            $("#newVersionMenu").html('<p style="padding: 15px" id="newVersionMessageContent">'+
            'New TagSpaces build available on '+
            '<a href="http://tagspaces.org/downloads/" target="_blank">tagspaces.org</a></p>');                                    
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
	
	function openFileViewer() {
    	layoutContainer.open("east"); 
	}

    var isFullWidth = false; 

    function toggleFullWidth() {
        var fullWidth = window.innerWidth;
        var halfWidth = Math.round(fullWidth/2);
        if(!isFullWidth) {
            layoutContainer.sizePane("east", fullWidth);
            layoutContainer.open("east"); 
        } else {
            layoutContainer.sizePane("east", halfWidth);
            layoutContainer.open("east");               
        }
        isFullWidth = !isFullWidth;
    }

    var isPerspectiveFooterOpen = false; 

    function togglePerspectiveFooter() {
        var fullHeight = window.innerHeight;
        var halfHeight = Math.round(fullHeight/2);
        if(isPerspectiveFooterOpen) {
            centerLayout.sizePane("south", .03);
            centerLayout.open("south"); 
        } else {
            centerLayout.sizePane("south", halfHeight);
            centerLayout.open("south");               
        }
        isPerspectiveFooterOpen = !isPerspectiveFooterOpen;
    }

	var fileDetailsFull = false; 
	
	function toggleFileDetails() {
	    if(fileDetailsFull) {
		    fileDetailsFull = false;
		    eastLayout.sizePane("north", 70);	    		    	
	    } else {
		    fileDetailsFull = true;
		    eastLayout.sizePane("north", 140);	    	
	    }
	}
	
	function closeFileViewer() {
	    layoutContainer.open("center");
	    layoutContainer.close("east");    
	}
	
	function toggleLeftPanel() {
	    layoutContainer.toggle("west");
	}
	
	function initLayout (){
	    console.log("Initializing Layout...");
	
	    layoutContainer = $('#container').layout(
	        {
	        fxName: "none"
	    ,   enableCursorHotkey:         false
	        
	    //  some resizing/toggling settings
	    ,   north__resizable:            false   // OVERRIDE the pane-default of 'slidable=true'
	    ,   north__spacing_open:        0       // no resizer-bar when open (zero height)       
	 //       ,   north__togglerLength_closed: '100%' // toggle-button is full-width of resizer-bar
	 //       ,   north__spacing_closed:      20      // big resizer-bar when open (zero height)
	    ,   north__size:                35      
	 
	    ,   south__resizable:           false   // OVERRIDE the pane-default of 'resizable=true'
	    ,   south__spacing_open:        0       // no resizer-bar when open (zero height)
	 //       ,   south__spacing_closed:      20      // big resizer-bar when open (zero height)
	
	    //  west settings
	    ,   west__resizable:           true 
	    ,   west__minSize:              .1
	//        ,   west__maxSize:              .4
	    ,   west__size:                 200
	    ,   west__spacing_open:         5     
	
	    //  east settings
	    ,   east__resizable:           true                 
	    ,   east__size:                 .50
	    ,   east__minSize:              .2
	//        ,   east__maxSize:              .8 // 80% of layout width
	    ,   east__spacing_open:        5   
	
	    //  center settings
	    ,   center__resizable:          true 
	    ,   center__minSize:           0.5
	
	    //  enable showOverflow on west-pane so CSS popups will overlap north pane
	    ,   west__showOverflowOnHover:  true
	
	    //  enable state management
	    ,   stateManagement__enabled:   false // automatic cookie load & save enabled by default
	
	    ,   showDebugMessages:          false // log and/or display messages from debugging & testing code
	    } 
	    
	    );
	    
	    // Directories and Tags
	    westLayout = $('div.ui-layout-west').layout({
	            minSize:                50  // ALL panes
            ,   enableCursorHotkey:    false
	        ,   center__paneSelector:   ".west-center"
	        ,   south__paneSelector:    ".west-south"
	        ,   south__resizable:       true  
	        ,   south__size:            .5
	        ,   south__spacing_open:    1       
	    });
	
	    centerLayout = $('div.ui-layout-center').layout({
	            name:                   "middle"
            ,   enableCursorHotkey:     false	            
	        ,   north__paneSelector:    ".middle-north"            
	        ,   center__paneSelector:   ".middle-center"      
	        ,   south__paneSelector:    ".middle-south"   
	        ,   minSize:                0  // ALL panes
	        ,   center__minSize:        300
	        ,   north__size:            35
	        ,   north__resizable:       false        
	        ,   north__spacing_open:    0    
	        ,   south__spacing_open:    1              
	        ,   south__size:            20
	    });
	
	    // File Viewer / Editor
	    eastLayout = $('div.ui-layout-east').layout({
	            minSize:                0  // ALL panes
            ,   enableCursorHotkey:     false	            
	        ,   north__paneSelector:    ".east-north"
	        ,   center__paneSelector:   ".east-center"
	        ,   south__paneSelector:    ".east-south" 
	        ,   north__size:            70
	        ,   north__resizable:       true
	        ,   north__spacing_open:    0    
	        ,   south__size:            0
	        ,   south__spacing_open:    0        
	    });
	
	    var dirNavigationLayout = $('#directoryNavigator').layout({
	            minSize:                35  // ALL panes
            ,   enableCursorHotkey:     false	            
	        ,   north__paneSelector:    "#directoryNavigatorNorth"
	        ,   center__paneSelector:   "#location"
	        ,   north__size:            32
	        ,   north__resizable:       false
	        ,   north__spacing_open:    0
	    });
	
	    // Closes the viewer area by init
	    layoutContainer.close("east");
	}
	
	// Proxying applications parts
	exports.Config = tsSettings;
	exports.IO = tsIOApi;	
	exports.PerspectiveManager = tsPersManager;
	exports.TagUtils = tsTagUtils;
	exports.FileOpener = tsFileOpener;
	
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

	// Proxying functions from tsCoreUI
	exports.showAlertDialog 			= tsCoreUI.showAlertDialog;
	exports.showConfirmDialog			= tsCoreUI.showConfirmDialog;
	exports.showTagEditDialog           = tsCoreUI.showTagEditDialog;
	exports.hideAllDropDownMenus		= tsCoreUI.hideAllDropDownMenus;
	exports.showFileCreateDialog        = tsCoreUI.showFileCreateDialog;	
	exports.showFileRenameDialog        = tsCoreUI.showFileRenameDialog;
	
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

	// Proxying functions from directoriesUI 
	exports.updateSubDirs 				= tsDirectoriesUI.updateSubDirs;
	exports.initConnections 			= tsDirectoriesUI.initConnections;
	exports.showCreateDirectoryDialog   = tsDirectoriesUI.showCreateDirectoryDialog;

	// Public variables definition
	exports.currentPath 				= currentPath;
	exports.currentView 				= currentView;
	exports.selectedFiles 				= selectedFiles;
	exports.fileList 					= fileList;
	exports.selectedTag 				= selectedTag;
	exports.selectedTagData 			= selectedTagData;	
	exports.startTime                   = startTime;
	
    exports.fileListTITLE                = 0;
    exports.fileListFILEEXT              = 1;
    exports.fileListTAGS                 = 2;
    exports.fileListFILESIZE             = 3;
    exports.fileListFILELMDT             = 4;
    exports.fileListFILEPATH             = 5;
    exports.fileListFILENAME             = 6;		
	
});