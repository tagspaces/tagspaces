/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define([
    'require',
    'exports',
    'module',
],function(require, exports, module) {
"use strict";

console.debug("Loading core.api.js ...");

var UIAPI = (typeof UIAPI == 'object' && UIAPI != null) ? UIAPI : {};

var TSSETTINGS = require("tssetting");

var layoutContainer = undefined;  

UIAPI.updateSubDirs = undefined;
UIAPI.initFavorites = undefined;
UIAPI.generateTagGroups = undefined;

UIAPI.initApp = function() {
    console.debug("InitApplication");

    require([
	    	"tstagsui",
	    	"tsdirectoriesui",
	    	"tspersmanager",
	    	"tstagutils",
	    	"tsfileopener",
	    	"tscoreui"
    	], 
    function(
	    	tsTagsUI, 
	    	tsDirectoriesUI, 
	    	tsPersManager, 
	    	tsTagUtils, 
	    	tsFileOpener,
	    	tsCoreUI
    	) {
		UIAPI.ViewManager = tsPersManager;
		UIAPI.TagUtils = tsTagUtils;
		UIAPI.FileOpener = tsFileOpener;
		
		tsCoreUI.initButtons();
		tsCoreUI.initDialogs();
	
	    tsTagsUI.initContextMenus();
	    tsTagsUI.initDialogs();
	    
	    tsDirectoriesUI.initDialogs();
	    tsDirectoriesUI.initButtons();
	    tsDirectoriesUI.initContextMenus();   
		
		// Proxying directoriesUI and tagsUI
		UIAPI.updateSubDirs = tsDirectoriesUI.updateSubDirs;
		UIAPI.initFavorites = tsDirectoriesUI.initFavorites;
		UIAPI.generateTagGroups = tsTagsUI.generateTagGroups;

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
		UIAPI.ViewManager.initViews();                 
	    
	    $("#appVersion").text("["+TSSETTINGS.DefaultSettings["appVersion"]+"]");
	    $("#appVersion").attr("title","["+TSSETTINGS.DefaultSettings["appBuild"]+"]");
	
	    tsDirectoriesUI.initFavorites();
	    
	    tsTagsUI.generateTagGroups();
	
	    $( "#loading" ).hide();  
	    $( "#container" ).show();  
	    
	    UIAPI.hideLoadingAnimation();
	    // TODO check if document.ready is really needed
	    $(document).ready(function() {
	        UIAPI.initLayout();
	        console.debug("Layout initialized");
	    });  
	    
	    // Show start hint
	    $( "#selectTagSpace" ).tooltip( "open" );		

    });

}

// ONE_DIR_UP
UIAPI.parentDir = "..";

UIAPI.currentPath = "";

UIAPI.currentView = undefined;

// Current selected files
UIAPI.selectedFiles = [];

// True if a file is opened in the viewer
UIAPI.isFileOpened = false;

// Current directory list of files
UIAPI.fileList = [];

// Last clicked button for removing a tag
UIAPI.selectedTag = "";

UIAPI.selectedTagData = "";

UIAPI.IO = undefined;

UIAPI.setCurrentPath = function(path) {
    console.debug("Setting current path to: "+path);
    UIAPI.currentPath = path;
	
	// List preselected dir automatically
    IOAPI.listDirectory(UIAPI.currentPath);
}

UIAPI.updateLogger = function(message) {
    console.debug("Updating logger...");
    $("#footer").attr("value",message);
}

UIAPI.showLoadingAnimation = function(message) {
    $("#loadingAnimation").css('visibility', "visible");
}

UIAPI.hideLoadingAnimation = function(message) {
    $("#loadingAnimation").css('visibility', "hidden");
}

UIAPI.fileExists = function(fileName) {
    console.debug("Check if filename: "+fileName+" already exists.");
    for (var i=0; i < UIAPI.fileList.length; i++) {
        if(UIAPI.fileList[i].name == fileName) {
            return true;
        }
    }
    return false;
}

UIAPI.refreshFileListContainer = function() {
	// TODO what happens with search view
    IOAPI.listDirectory(UIAPI.currentPath);  
}

UIAPI.updateFileBrowserData = function(dirList) {
    console.debug("Updating the file browser data...");
    
    UIAPI.fileList = [];
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
                 path = UIAPI.currentPath + UIAPI.TagUtils.DIR_SEPARATOR + dirList[i].name;
                 tags = UIAPI.TagUtils.extractTags(path);
                 title = UIAPI.TagUtils.extractTitle(path);
                 if(dirList[i].name.lastIndexOf(".") > 0) {
                    // title = dirList[i].name.substring(0, dirList[i].name.lastIndexOf(".")); 
                     ext = dirList[i].name.substring(dirList[i].name.lastIndexOf(".")+1,dirList[i].name.length);                     
                 } else {
                    // title = dirList[i].name;
                     ext = "";
                 }
                 fileSize = dirList[i].size;
                 fileLMDT = dirList[i].lmdt;
                 if(fileSize == undefined) fileSize = "";
                 if(fileLMDT == undefined) fileLMDT = "";
                 var entry = [dirList[i].name,fileSize,fileLMDT,title,tags,ext];   
                 UIAPI.fileList.push(entry);
            }
        }
    }     
         
    UIAPI.ViewManager.changeView(UIAPI.currentView);    
}

UIAPI.changeDirectory = function(newDir) {
    console.debug("Change direcotory to: "+newDir);
    var newPath = UIAPI.currentPath;
    if(UIAPI.TagUtils.isWindows()) { 
        // Cutting trailig \\ or \\\\ .
        if(UIAPI.currentPath.lastIndexOf("\\")+1 == UIAPI.currentPath.length) {
            newPath = UIAPI.currentPath.substring(0,UIAPI.currentPath.length-1);
		} else if(UIAPI.currentPath.lastIndexOf("\\\\")+2 == UIAPI.currentPath.length) {
            newPath = UIAPI.currentPath.substring(0,UIAPI.currentPath.length-2);
		}
        if(newDir == UIAPI.parentDir) {
            newPath = newPath.substring(0,newPath.lastIndexOf("\\"));            
            UIAPI.currentPath  = newPath;
        } else if(newDir.length > 0) {
            UIAPI.currentPath  = newPath+"\\"+newDir+"\\";
        }        
    } else { 
        // Cutting trailing /
        if(UIAPI.currentPath.lastIndexOf("/")+1 == UIAPI.currentPath.length) {
            newPath = UIAPI.currentPath.substring(0,UIAPI.currentPath.length-1);
        }
        if(newDir == UIAPI.parentDir) {
            newPath = newPath.substring(0,newPath.lastIndexOf("/"));            
            UIAPI.currentPath  = newPath;
        } else if(newDir.length > 0) {
            UIAPI.currentPath  = newPath+"/"+newDir+"/";
        }      
    }
    console.debug("New path: "+UIAPI.currentPath);
    IOAPI.listDirectory(UIAPI.currentPath);
    UIAPI.selectedTag = "";
}

UIAPI.reloadUI = function() {
    location.reload();
}

UIAPI.openFile = function(filePath) {
//    console.debug("Opening file..."); 
    UIAPI.FileOpener.openFile(filePath);	
}

UIAPI.openFileViewer = function() {
	UIAPI.isFileOpened = true;
    layoutContainer.open("east");    
}

UIAPI.closeFileViewer = function() {
	UIAPI.isFileOpened = false;
    layoutContainer.close("east");    
}

UIAPI.toggleLeftPanel = function() {
    layoutContainer.toggle("west");
}

UIAPI.initLayout = function(){
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

return UIAPI;
});