/* Copyright (c) 2012-2014 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
/*global isNode, isWin, isFirefox, Mousetrap, gui */
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
    
    var currentPath;
    var currentLocationObject;
    var currentPerspectiveID;

    // Current selected files
    var selectedFiles = [];

    // Current directory list of files
    var fileList = [];

    // List of the sub directories of the current directory
    var subDirsList = [];

    // Last clicked button for removing a tag
    var selectedTag = "";

    var selectedTagData = "";

    var startTime;

    var subfoldersDirBrowser;

    var directoryBrowser;

    function initApp() {
        console.log("Init application");

        tsSettings.loadSettingsLocalStorage();

        checkLocalStorageEnabled();

        // In firefox, by empty local storage trying to load the settings from mozilla preferences
        if(tsSettings.Settings === undefined && isFirefox) {
            window.setTimeout(tsIOApi.loadSettings, 1000); // executes initUI and updateSettingMozillaPreferences by success
            console.log("Loading setting with from mozilla pref execured with delay...");
        }

        // If still nothing found, loading the default setting from the application's javascript
        // This is usually the case by a new installation
        if(tsSettings.Settings === undefined) {
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
            switchInterfaceLanguage(tsSettings.getInterfaceLangauge()); // "de-DE"
            initKeyBindings();
            $( "#loading" ).hide();

            // Show welcome dialog of first start
            if(tsSettings.isFirstRun()) {
                tsCoreUI.showWelcomeDialog();
            }

            // Show welcome dialog by no locations
            if(tsSettings.Settings.tagspacesList.length < 1 ) {
                $( "#createNewLocation" ).tooltip( "show" );
                $( "#locationName" ).prop('disabled', true);
                $( "#selectLocation" ).prop('disabled', true);     
                tsCoreUI.showWelcomeDialog();
            }

            if(isNode) {
                // Handle command line argument in node-webkit
                tsIOApi.handleStartParameters();

                // Handle minimizing to the tray in node-webkit
                //tsIOApi.handleTray();
            }

            console.log("Layout initialized");
        });

        checkForNewVersion();
    }

    function switchIOAPI(type) {
        if(type=="dropbox") {
            tsIOApiDropbox.init();
            exports.IO = tsIOApiDropbox;        
        } else {
            exports.IO = tsIOApi;
        }
    }

    function switchInterfaceLanguage(language) {
        $.i18n.init({
            ns: { namespaces: ['ns.common','ns.dialogs','ns.perspectiveList']},
            lng: language,
            debug: true,
            fallbackLng: "en_US"
        }, function() {
            $('[data-i18n]').i18n();
            if(isNode) {
                tsIOApi.initMainMenu();
            }
        });
    }

    function initKeyBindings() {
        if(isNode) {
            var win = gui.Window.get();
            Mousetrap.bind(tsSettings.getOpenDevToolsScreenKeyBinding(), function() {
                win.showDevTools();
            });
            Mousetrap.bind(tsSettings.getReloadApplicationKeyBinding(), function() {
                win.reloadIgnoringCache();
            });
            Mousetrap.bind(tsSettings.getToggleFullScreenKeyBinding(), function() {
                win.toggleFullscreen();
            });
        }

        Mousetrap.bind(tsSettings.getShowTagLibraryKeyBinding(), function() {
            tsCoreUI.showTagsPanel();
        });

        Mousetrap.bind(tsSettings.getShowFolderNavigatorBinding(), function() {
            tsCoreUI.showLocationsPanel();
        });

        Mousetrap.bind(tsSettings.getAddRemoveTagsKeyBinding(), function() {
            tsTagsUI.showAddTagsDialog();
        });

        // TODO add swipeleft for closing left panel
        /* $(".col1").hammer().on("swipeleft", function(event) {
            console.log("swipeleft");
           toggleLeftPanel();
        }) */
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
            tsCoreUI.showAlertDialog($.i18n.t("ns.dialogs:enableLocalStorageAlert"),"Error");
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
        currentBuild = 1; */

        if(availableVersion > currentVersion) {
            $("#newVersionMenu").html('<p id="newVersionMessageContent"><span data-i18n="app.newMinorReleaseAvailable">New TagSpaces major release available! See what\'s new on</span> ' +
                '<a href="http://tagspaces.org/whatsnew/" class="whatsNewLink">tagspaces.org/whatsnew</a></p>');
        } else if ((availableVersion == currentVersion) && (availableBuild > currentBuild)) {
            $("#newVersionMenu").html('<p id="newVersionMessageContent"><span data-i18n="app.newMajorReleaseAvailable">New TagSpaces minor release available! See what\'s new on</span> ' +
                '<a href="http://tagspaces.org/whatsnew/" class="whatsNewLink">tagspaces.org/whatsnew</a></p>');
        }
    }

    function updateLogger() {
        console.log("Updating logger...");
    }

    function showLoadingAnimation() {
        $("#loadingAnimation").css('visibility', "visible");
    }

    function hideLoadingAnimation() {
        $("#loadingAnimation").css('visibility', "hidden");
    }

    function removeFileModel(model, filePath) {
        console.log("Removing file from model");            
        for(var i = 0; i < model.length; i++) {
            if(model[i][exports.fileListFILEPATH] === filePath) {
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

    // UI and Layout functionalities

    // Layout vars
    var layoutContainer;
    var col1Layout;
    var col2Layout;

    var isFullWidth = false;
    var shouldOpenCol1 = true;
    var shouldOpenCol3 = false;    
    var col1DefaultWidth = 250;
    
    // End Layout Vars
   
    function reLayout() {
        //console.log("Window w: "+window.innerWidth+" h: "+window.innerHeight+" orient: "+window.orientation+" dpi: "+window.devicePixelRatio);
        var fullWidth = window.innerWidth;
        var halfWidth =  Math.round(window.innerWidth/2);
        var isPortret = fullWidth < window.innerHeight; 
        var oneColumn = fullWidth < 660;
        var twoColumn = (fullWidth >= 660 && fullWidth < 1024);

        layoutContainer.options.east.spacing_open = 1;

        $("#toggleFullWidthButton").hide();

        if(oneColumn) {
            $("#closeLeftPanel").show();
            layoutContainer.options.east.spacing_open = 0;
            if(shouldOpenCol3) {
                layoutContainer.close("west"); // workarround
                shouldOpenCol1 = false; //Closing col1
                layoutContainer.sizePane("east", fullWidth); // make col3 100%
                //east__spacing_open:         1
            } else {
                if(!layoutContainer.state.west.isClosed) {
                    if(isPortret) {
                        // by opened col1 panel make it 75%
                        layoutContainer.sizePane("west", Math.round(3*(window.innerWidth/4)));     
                    } else {
                        layoutContainer.sizePane("west", col1DefaultWidth); 
                    }                    
                }
            }
        } else if(twoColumn) {
            //$("#closeLeftPanel").show();
            if(isPortret) {
                if(shouldOpenCol3) {
                    layoutContainer.close("west"); // workarround
                    shouldOpenCol1 = false; //Closing col1
                    layoutContainer.sizePane("east", fullWidth); // make col3 100%
                } else {
                    // by opened col1 panel make it 250
                    if(!layoutContainer.state.west.isClosed) {
                        layoutContainer.sizePane("west", col1DefaultWidth);
                    }
                }
            } else {            
                if(shouldOpenCol3) {
                    shouldOpenCol1 = false; //Closing col1
                    layoutContainer.sizePane("east", halfWidth); // make col3 100%
                } else {
                    // by opened col1 panel make it 250
                    if(!layoutContainer.state.west.isClosed) {
                        layoutContainer.sizePane("west", col1DefaultWidth);
                    }
                }
            }
        } else { // Regular case
            $("#closeLeftPanel").hide();
            if(isPortret) {
                if(shouldOpenCol3) {
                    layoutContainer.close("west"); // workarround
                    shouldOpenCol1 = false; //Closing col1
                    layoutContainer.sizePane("east", fullWidth); // make col3 100%
                } else {
                    // by opened col1 panel make it 50%
                    if(!layoutContainer.state.west.isClosed) {
                        layoutContainer.sizePane("west", col1DefaultWidth);
                    }
                }
            } else {
                $("#toggleFullWidthButton").show();
                if(isFullWidth) {
                    // TODO hide tags
                    $("#viewerContainer").css("top","38px");
                    layoutContainer.close("west"); // workarround
                    shouldOpenCol1 = false;        
                    layoutContainer.sizePane("east", fullWidth);
                } else {
                    $("#viewerContainer").css("top","81px");
                    layoutContainer.sizePane("west", col1DefaultWidth);
                    layoutContainer.sizePane("east", halfWidth);                                                            
                }
            }
        } 
        
        // Handle opening col1        
        shouldOpenCol1?layoutContainer.open("west"):layoutContainer.close("west");

        // Handle opening col3
        shouldOpenCol3?layoutContainer.open("east"):layoutContainer.close("east");
    }	

    function openFileViewer() {
        tsCoreUI.hideAllDropDownMenus();
        shouldOpenCol3 = true;
        reLayout(); 
    }

    function closeFileViewer() {
        shouldOpenCol3 = false;
        isFullWidth = false;
        reLayout();    	 
    }

    function toggleFullWidth() {
        isFullWidth = !isFullWidth;
        reLayout();        
    }

    function toggleLeftPanel() {
        layoutContainer.toggle("west");
        shouldOpenCol1 = !shouldOpenCol1;
    }

    function openLeftPanel() {
        if(layoutContainer !== undefined) {
            layoutContainer.open("west");
            shouldOpenCol1 = true;
        }
    }

    function reloadUI() {
        location.reload();
    }
    
    window.addEventListener("orientationchange", reLayout);  

    $( window ).on('resize', reLayout);

    function initLayout (){
        console.log("Initializing Layout...");

        layoutContainer = $('body').layout({
            panes: { // defaults for all panes in layout
                tips: {
                    noRoomToOpen: "" // blank = no message
                }
            },
            name:                       'outerLayout', // for debugging & auto-adding buttons (see below)
            //fxName:                     "slide", // none, slide
            //fxSpeed:                    "normal",
            autoResize:                 true,	// try to maintain pane-percentages
            autoReopen:                 true,	// auto-open panes that were previously auto-closed due to 'no room'
            minSize:                    0,
            autoBindCustomButtons:      true,
            west__paneSelector:         '.col1',
            center__paneSelector:       '.col2',
            east__paneSelector:         '.col3',
            west__size:                 col1DefaultWidth,
            west__minWidth:             col1DefaultWidth,
            east__size:                 0.5,
            west__spacing_open:         1,
            east__spacing_open:         1,
            center_minWidth:            0,
            center_minHeight:           200,
            spacing_closed:             0,
            noRoomToOpenAction:         "hide", // 'close' or 'hide' when no room to open a pane at minSize
        //  west__showOverflowOnHover:	true,
        //  center__showOverflowOnHover:	true,
        //  east__showOverflowOnHover:	true,
            enableCursorHotkey:         false
        //  showErrorMessages:          false,
        });

        // Initially close the right panel
        layoutContainer.close("east");

        col1Layout = layoutContainer.panes.west.layout({
            name:                       'col1Layout', // for debugging & auto-adding buttons (see below)
        //  north__paneSelector:        '.row1',
            center__paneSelector:       '.row2',
            south__paneSelector:        '.row3',
        //  north__size:                row1Height,	// percentage size expresses as a string
            south__size:                50,
            north__spacing_open:        0,
            south__spacing_open:        0,
            autoResize:                 false,	// try to maintain pane-percentages
            closable:                   false,
            //fxName:                     "slide", // none, slide
            //fxSpeed:                    "slow", // normal, fast
            togglerLength_open:         0,	// hide toggler-buttons
            spacing_closed:             0,	// hide resizer/slider bar when closed
        //	autoReopen:                 true,	// auto-open panes that were previously auto-closed due to 'no room'
            autoBindCustomButtons:      true,
            minSize:                    0,
            center__minHeight:          25,
        //  north__showOverflowOnHover:	true,
        //  center__showOverflowOnHover:true,
        //  south__showOverflowOnHover:	true,
            enableCursorHotkey:         false
        //  showErrorMessages:          false
        });

        col2Layout = layoutContainer.panes.center.layout({
            name:                       'col2Layout', // for debugging & auto-adding buttons (see below)
        //	north__paneSelector: 	    '.row1',
            center__paneSelector:       '.row2',
            south__paneSelector:        '.row3',
        //  north__size:                row1Height,	// percentage size expresses as a string
            south__size:                45,
            north__spacing_open:        0,
            south__spacing_open:        0,
            autoResize:                 true,	// try to maintain pane-percentages
            closable:                   false,
            togglerLength_open:         0,	// hide toggler-buttons
            spacing_closed:             0,	// hide resizer/slider bar when closed
            autoReopen:                 true,	// auto-open panes that were previously auto-closed due to 'no room'
            autoBindCustomButtons:      true,
            minSize:                    0,
            center__minHeight:          25,
            north__showOverflowOnHover:	true,
        //  center__showOverflowOnHover:true,
        //  south__showOverflowOnHover:	true,
            enableCursorHotkey:         false
        //  showErrorMessages:          false
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

        reLayout();
    }


    // Proxying applications parts
    exports.Config = tsSettings;
    exports.IO = tsIOApi;
    exports.UI = tsCoreUI;
    exports.PerspectiveManager = tsPersManager;
    exports.TagUtils = tsTagUtils;
    exports.FileOpener = tsFileOpener;
    exports.Search = tsSearch;

    // Public API definition
    exports.dirSeparator                = (isWin && !isWeb)?"\\":"/";
    exports.locationDesktop;
    exports.initApp                     = initApp;
    exports.reLayout                    = reLayout;
    exports.updateLogger                = updateLogger;
    exports.showLoadingAnimation        = showLoadingAnimation;
    exports.hideLoadingAnimation        = hideLoadingAnimation;
//	exports.fileExists                  = fileExists;
    exports.reloadUI 					= reloadUI;
    exports.openFileViewer 				= openFileViewer;
    exports.closeFileViewer 			= closeFileViewer;
    exports.toggleLeftPanel 			= toggleLeftPanel;
    exports.openLeftPanel               = openLeftPanel;
    exports.toggleFullWidth             = toggleFullWidth;
    exports.updateNewVersionData        = updateNewVersionData;
    exports.exportFileListCSV           = exportFileListCSV;
    exports.exportFileListArray         = exportFileListArray;
    exports.removeFileModel             = removeFileModel;
    exports.updateFileModel             = updateFileModel;
    exports.switchInterfaceLanguage     = switchInterfaceLanguage;

    // Proxying functions from tsCoreUI
    // TODO use TSCORE.UI instead
    exports.clearSearchFilter           = tsCoreUI.clearSearchFilter;
    exports.openLinkExternally          = tsCoreUI.openLinkExternally;
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
    exports.createHTMLFile              = tsCoreUI.createHTMLFile;
    exports.createMDFile                = tsCoreUI.createMDFile;
    exports.createTXTFile               = tsCoreUI.createTXTFile;

    // Proxying functions from tsTagsUI
    exports.generateTagButtons 			= tsTagsUI.generateTagButtons;
    exports.generateTagStyle            = tsTagsUI.generateTagStyle;
    exports.openTagMenu 				= tsTagsUI.openTagMenu;
    exports.showWaitingDialog           = tsCoreUI.showWaitingDialog;
    exports.hideWaitingDialog           = tsCoreUI.hideWaitingDialog;
    exports.showMoveCopyFilesDialog     = tsCoreUI.showMoveCopyFilesDialog;
    exports.showAddTagsDialog			= tsTagsUI.showAddTagsDialog;
    exports.showTagEditInTreeDialog     = tsTagsUI.showTagEditInTreeDialog;
    exports.showDialogTagCreate         = tsTagsUI.showDialogTagCreate;
    exports.showDialogEditTagGroup      = tsTagsUI.showDialogEditTagGroup;
    exports.showDialogTagGroupCreate    = tsTagsUI.showDialogTagGroupCreate;	
    exports.calculatedTags              = tsTagsUI.calculatedTags;
    exports.locationTags                = tsTagsUI.locationTags;
    exports.generateTagGroups           = tsTagsUI.generateTagGroups;

    // Proxying functions from directoriesUI
    exports.openLocation                = tsDirectoriesUI.openLocation;
    exports.updateSubDirs               = tsDirectoriesUI.updateSubDirs;
    exports.initLocations 			    = tsDirectoriesUI.initLocations;
    exports.showCreateDirectoryDialog   = tsDirectoriesUI.showCreateDirectoryDialog;
    exports.closeCurrentLocation        = tsDirectoriesUI.closeCurrentLocation;
    exports.navigateToDirectory         = tsDirectoriesUI.navigateToDirectory; 

    // Public variables definition
    exports.currentPath                 = currentPath;
    exports.currentLocationObject       = currentLocationObject;
    exports.currentPerspectiveID        = currentPerspectiveID;
    exports.selectedFiles               = selectedFiles;
    exports.fileList                    = fileList;
    exports.subDirsList                 = subDirsList;
    exports.selectedTag                 = selectedTag;
    exports.selectedTagData             = selectedTagData;
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

});