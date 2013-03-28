/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
//"use strict";

	console.debug("Loading core.api.js ...");
	
	var tsSettings = require("tssetting");	
	var tsIOApi = require("tsioapi");
    var tsPersManager = require("tspersmanager");
    var tsTagUtils = require("tstagutils");
    var tsFileOpener = require("tsfileopener");
    var tsTagsUI = require("tstagsui");
    var tsDirectoriesUI = require("tsdirectoriesui");
    var tsCoreUI = require("tscoreui")
	
	var layoutContainer = undefined;  
	
	var currentPath = "";
	
	var currentView = undefined;
	
	// Current selected files
	var selectedFiles = [];
	
	// Current directory list of files
	var fileList = [];
	
	// Last clicked button for removing a tag
	var selectedTag = "";
	
	var selectedTagData = "";

	function initApp() {
	    console.debug("Init application");	
	
		tsCoreUI.initButtons();
		tsCoreUI.initDialogs();
	
	    tsTagsUI.initContextMenus();
	    tsTagsUI.initDialogs();
	    
	    tsDirectoriesUI.initDialogs();
	    tsDirectoriesUI.initButtons();
	    tsDirectoriesUI.initContextMenus();   
		
	    tsSettings.loadSettingsLocalStorage();
	    
	    // In firefox, by empty local storage trying to load the settings from mozilla preferences
	    if(tsSettings.Settings == undefined && $.browser.mozilla) {
	        window.setTimeout(tsIOApi.loadSettings, 1000); // executes initUI and updateSettingMozillaPreferences by success
	        console.debug("Loading setting with from mozilla pref execured with delay...");
	    } 
	
	    // If still nothing found, loading the default setting from the application's javascript
	    // This is usually the case by a new installation
	    if(tsSettings.Settings == undefined) {
	        tsSettings.Settings = tsSettings.DefaultSettings;
	    }    
	  
	  	tsSettings.upgradeSettings();
	    
	    // Init views
		tsPersManager.initViews();                 
	    
	    $("#appVersion").text("["+tsSettings.DefaultSettings["appVersion"]+"]");
	    $("#appVersion").attr("title","["+tsSettings.DefaultSettings["appBuild"]+"]");
	
	    tsDirectoriesUI.initFavorites();
	    
	    tsTagsUI.generateTagGroups();
	
	    $( "#loading" ).hide();  
	    $( "#container" ).show();  
	    
	    hideLoadingAnimation();
	    // TODO check if document.ready is really needed
	    $(document).ready(function() {
	        initLayout();
	        console.debug("Layout initialized");

		    // Show start hint
		   	if(tsSettings.Settings.tagspacesList.length < 1 ) {
		   		$( "#createNewLocation" ).attr("title", "Start using TagSpaces by creating a new location.")
                $( "#favoritesList" ).width($( "#reloadTagSpace" ).width()+$("#selectTagSpace").width());
                $( "#favoritesList" ).show().position({
                    my: "left top",
                    at: "left bottom",
                    of: $( "#reloadTagSpace" )
                });
		    	$( "#createNewLocation" ).attr("style","border:1px solid #00AE00; border-radius:5px; border-color:#00AE00; box-shadow:0 0 10px #00AE00;")
		    	//$( "#createNewLocation" ).tooltip( "open" );
		   	}
	 		
	    }); 	    

	}
	
	function updateLogger(message) {
		// TODO reactivate
	    console.debug("Updating logger...");
	//    $("#footer").attr("value",message);
	}
	
	function showLoadingAnimation(message) {
	    $("#loadingAnimation").css('visibility', "visible");
	}
	
	function hideLoadingAnimation(message) {
	    $("#loadingAnimation").css('visibility', "hidden");
	}
	
	function fileExists(fileName) {
	    console.debug("Check if filename: "+fileName+" already exists.");
	    for (var i=0; i < fileList.length; i++) {
	        if(fileList[i].name == fileName) {
	            return true;
	        }
	    }
	    return false;
	}	

	function reloadUI() {
	    location.reload();
	}
	
	function openFileViewer() {
	    layoutContainer.open("east");    
	}
	
	function closeFileViewer() {
	    layoutContainer.close("east");    
	}
	
	function toggleLeftPanel() {
	    layoutContainer.toggle("west");
	}
	
	function initLayout (){
	    console.debug("Initializing Layout...");
	
	    layoutContainer = $('#container').layout(
	        {
	        fxName: "none"
	        
	    //  some resizing/toggling settings
	    ,   north__resizable:            false   // OVERRIDE the pane-default of 'slidable=true'
	    ,   north__spacing_open:        0       // no resizer-bar when open (zero height)       
	 //       ,   north__togglerLength_closed: '100%' // toggle-button is full-width of resizer-bar
	 //       ,   north__spacing_closed:      20      // big resizer-bar when open (zero height)
	    ,   north__size:                33      
	 
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
	    ,   east__size:                 .45
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
	
	    ,   showDebugMessages:          true // log and/or display messages from debugging & testing code
	    } 
	    
	    );
	    
	    // Directories and Tags
	    var westLayout = $('div.ui-layout-west').layout({
	            minSize:                50  // ALL panes
	        ,   center__paneSelector:   ".west-center"
	        ,   south__paneSelector:    ".west-south"
	        ,   south__resizable:       true  
	        ,   south__size:            .5
	        ,   south__spacing_open:    5       
	    });
	
	    var centerLayout = $('div.ui-layout-center').layout({
	            name:                   "middle"
	        ,   north__paneSelector:    ".middle-north"            
	        ,   center__paneSelector:   ".middle-center"      
	        ,   south__paneSelector:    ".middle-south"   
	        ,   minSize:                0  // ALL panes
	        ,   center__minSize:        300
	        ,   north__size:            32
	        ,   north__resizable:       false        
	        ,   north__spacing_open:    0    
	        ,   south__spacing_open:    0              
	        ,   south__size:            1
	    });
	
	    // File Viewer / Editor
	    var eastLayout = $('div.ui-layout-east').layout({
	            minSize:                30  // ALL panes
	        ,   north__paneSelector:    ".east-north"
	        ,   center__paneSelector:   ".east-center"
	        ,   south__paneSelector:    ".east-south" 
	        ,   north__size:            80
	        ,   north__resizable:       false
	        ,   north__spacing_open:    0    
	        ,   south__size:            25
	        ,   south__spacing_open:    0        
	    });
	
	    var dirNavigationLayout = $('#directoryNavigator').layout({
	            minSize:                30  // ALL panes
	        ,   north__paneSelector:    "#directoryNavigatorNorth"
	        ,   center__paneSelector:   "#dirTree"
	        ,   north__size:            30
	        ,   north__resizable:       false
	        ,   north__spacing_open:    0
	    });
	
	    // Closes the viewer area by init
	    layoutContainer.close("east");
	}
	
	// Proxying applications parts
	exports.Config = tsSettings;
	exports.IO = tsIOApi;	
	exports.ViewManager = tsPersManager;
	exports.TagUtils = tsTagUtils;
	exports.FileOpener = tsFileOpener;
	
	// Public API definition
	exports.initApp 					= initApp;
	exports.updateLogger				= updateLogger;
	exports.showLoadingAnimation 		= showLoadingAnimation;
	exports.hideLoadingAnimation 		= hideLoadingAnimation;
	exports.fileExists 					= fileExists;
	exports.reloadUI 					= reloadUI;
	exports.openFileViewer 				= openFileViewer;
	exports.closeFileViewer 			= closeFileViewer;
	exports.toggleLeftPanel 			= toggleLeftPanel;
	
	// Proxying functions from tsTagsUI
	exports.generateTagButtons = tsTagsUI.generateTagButtons
	exports.buttonizeTitle = tsTagsUI.buttonizeTitle
	exports.buttonizeFileName = tsTagsUI.buttonizeFileName	
	exports.openTagMenu = tsTagsUI.openTagMenu

	// Proxying functions from directoriesUI 
	exports.updateSubDirs = tsDirectoriesUI.updateSubDirs;
	exports.initFavorites = tsDirectoriesUI.initFavorites;

	// Public variables definition
	exports.currentPath 				= currentPath;
	exports.currentView 				= currentView;
	exports.selectedFiles 				= selectedFiles;
	exports.fileList 					= fileList;
	exports.selectedTag 				= selectedTag;
	exports.selectedTagData 			= selectedTagData;		
});