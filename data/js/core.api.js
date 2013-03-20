/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";

	console.debug("Loading core.api.js ...");
	
	var TSSETTINGS = require("tssetting");	
	var IOAPI = require("tsioapi");

    var tsPersManager = require("tspersmanager");
    var tsTagUtils = require("tstagutils");
    var tsFileOpener = require("tsfileopener");
    var tsTagsUI = require("tstagsui");
    var tsDirectoriesUI = require("tsdirectoriesui");
    var tsCoreUI = require("tscoreui")
	
	var layoutContainer = undefined;  
	
	exports.updateSubDirs = undefined;
	exports.initFavorites = undefined;
	exports.generateTagGroups = undefined;
	
	var currentPath = "";
	
	var currentView = undefined;
	
	// Current selected files
	var selectedFiles = [];
	
	// True if a file is opened in the viewer
	var isFileOpened = false;
	
	// Current directory list of files
	var fileList = [];
	
	// Last clicked button for removing a tag
	var selectedTag = "";
	
	var selectedTagData = "";

	function initApp() {
	    console.debug("Init application");
	
		exports.ViewManager = tsPersManager;
		exports.TagUtils = tsTagUtils;
		exports.FileOpener = tsFileOpener;

		exports.Config = TSSETTINGS;
		exports.IO = IOAPI;
		
		// Proxy for tsTagsUI
		exports.generateTagButtons = tsTagsUI.generateTagButtons
		exports.buttonizeTitle = tsTagsUI.buttonizeTitle
		exports.openTagMenu = tsTagsUI.openTagMenu
		
		tsCoreUI.initButtons();
		tsCoreUI.initDialogs();
	
	    tsTagsUI.initContextMenus();
	    tsTagsUI.initDialogs();
	    
	    tsDirectoriesUI.initDialogs();
	    tsDirectoriesUI.initButtons();
	    tsDirectoriesUI.initContextMenus();   
		
		// Proxying directoriesUI and tagsUI
		exports.updateSubDirs = tsDirectoriesUI.updateSubDirs;
		exports.initFavorites = tsDirectoriesUI.initFavorites;
		exports.generateTagGroups = tsTagsUI.generateTagGroups;

	    TSSETTINGS.loadSettingsLocalStorage();
	    
	    // In firefox, by empty local storage trying to load the settings from mozilla preferences
	    if(TSSETTINGS.Settings == undefined && $.browser.mozilla) {
	        window.setTimeout(IOAPI.loadSettings, 1000); // executes initUI and updateSettingMozillaPreferences by success
	        console.debug("Loading setting with from mozilla pref execured with delay...");
	    } 
	
	    // If still nothing found, loading the default setting from the application's javascript
	    // This is usually the case by a new installation
	    if(TSSETTINGS.Settings == undefined) {
	        TSSETTINGS.Settings = TSSETTINGS.DefaultSettings;
	    }    
	  
	  	TSSETTINGS.upgradeSettings();
	    
	    // Init views
		exports.ViewManager.initViews();                 
	    
	    $("#appVersion").text("["+TSSETTINGS.DefaultSettings["appVersion"]+"]");
	    $("#appVersion").attr("title","["+TSSETTINGS.DefaultSettings["appBuild"]+"]");
	
	    tsDirectoriesUI.initFavorites();
	    
	    tsTagsUI.generateTagGroups();
	
	    $( "#loading" ).hide();  
	    $( "#container" ).show();  
	    
	    hideLoadingAnimation();
	    // TODO check if document.ready is really needed
	    $(document).ready(function() {
	        initLayout();
	        console.debug("Layout initialized");
	    });  
	    
	    // Show start hint
	    $( "#selectTagSpace" ).tooltip( "open" );		
	}
	
	function setCurrentPath(path) {
	    console.debug("Setting current path to: "+path);
	    currentPath = path;
		
		// List preselected dir automatically
	    IOAPI.listDirectory(currentPath);
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
	
	function refreshFileListContainer() {
		// TODO what happens with search view
	    IOAPI.listDirectory(currentPath);  
	}
	
	function updateFileBrowserData(dirList) {
	    console.debug("Updating the file browser data...");
	    
	    fileList = [];
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
	            if (TSSETTINGS.Settings["showUnixHiddenEntries"] || 
	               (!TSSETTINGS.Settings["showUnixHiddenEntries"] && (dirList[i].name.indexOf(".") != 0))) {
	                 path = currentPath + exports.TagUtils.DIR_SEPARATOR + dirList[i].name;
	                 tags = exports.TagUtils.extractTags(path);
	                 title = exports.TagUtils.extractTitle(path);
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
	                 fileList.push(entry);
	            }
	        }
	    }     
	         
	    exports.ViewManager.changeView(currentView);    
	}
	
	/** Depricated
	// ONE_DIR_UP
	var parentDir = "..";

	function changeDirectory(newDir) {
	    console.debug("Change direcotory to: "+newDir);
	    var newPath = currentPath;
	    if(exports.TagUtils.isWindows()) { 
	        // Cutting trailig \\ or \\\\ .
	        if(currentPath.lastIndexOf("\\")+1 == currentPath.length) {
	            newPath = currentPath.substring(0,currentPath.length-1);
			} else if(currentPath.lastIndexOf("\\\\")+2 == currentPath.length) {
	            newPath = currentPath.substring(0,currentPath.length-2);
			}
	        if(newDir == parentDir) {
	            newPath = newPath.substring(0,newPath.lastIndexOf("\\"));            
	            currentPath  = newPath;
	        } else if(newDir.length > 0) {
	            currentPath  = newPath+"\\"+newDir+"\\";
	        }        
	    } else { 
	        // Cutting trailing /
	        if(currentPath.lastIndexOf("/")+1 == currentPath.length) {
	            newPath = currentPath.substring(0,currentPath.length-1);
	        }
	        if(newDir == parentDir) {
	            newPath = newPath.substring(0,newPath.lastIndexOf("/"));            
	            currentPath  = newPath;
	        } else if(newDir.length > 0) {
	            currentPath  = newPath+"/"+newDir+"/";
	        }      
	    }
	    console.debug("New path: "+currentPath);
	    IOAPI.listDirectory(currentPath);
	    selectedTag = "";
	} */
	
	function reloadUI() {
	    location.reload();
	}
	
	function openFile(filePath) {
	//    console.debug("Opening file..."); 
	    exports.FileOpener.openFile(filePath);	
	}
	
	function openFileViewer() {
		isFileOpened = true;
	    layoutContainer.open("east");    
	}
	
	function closeFileViewer() {
		isFileOpened = false;
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

	// Public API definition
	exports.initApp 					= initApp;
	exports.setCurrentPath 				= setCurrentPath;
	exports.updateLogger				= updateLogger;
	exports.showLoadingAnimation 		= showLoadingAnimation;
	exports.hideLoadingAnimation 		= hideLoadingAnimation;
	exports.fileExists 					= fileExists;
	exports.refreshFileListContainer 	= refreshFileListContainer;
	exports.updateFileBrowserData 		= updateFileBrowserData;
	exports.reloadUI 					= reloadUI;
	exports.openFile 					= openFile;								
	exports.openFileViewer 				= openFileViewer;
	exports.closeFileViewer 			= closeFileViewer;
	exports.toggleLeftPanel 			= toggleLeftPanel;
	
	exports.currentPath 				= currentPath;
	exports.currentView 				= currentView;
	exports.selectedFiles 				= selectedFiles;
	exports.isFileOpened 				= isFileOpened;
	exports.fileList 					= fileList;
	exports.selectedTag 				= selectedTag;
	exports.selectedTagData 			= selectedTagData;
		
});