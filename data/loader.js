/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
console.debug("Loading Loader...");

// Init layout
require(["js/layout.ui"]);

// Setting up the communication between the extension and tagspace app
if( $.browser.mozilla) {
    require(["js/messaging.mozilla"]); 
}

FileViewer = undefined; 
TagsUI = undefined;
//BasicViewsUI = undefined;

jQuery(function($) {
    require([
            "js/fileviewer.ui",
            "js/tags.ui",
            "js/basicviews.ui.js",
            "js/misc.ui.js",
            "js/ioapi.chrome.js",
            "js/ioapi.mozilla.js",
            "js/settings.api.js",
            "js/tagspace.api.js",
            "js/directories.ui.js",
            "js/settings.ui.js"
        ], 
        function(viewer,tags) { 
            FileViewer = viewer;
            
            TagsUI = tags;
            TagsUI.initContextMenus();
            TagsUI.initDialogs();
            TagsUI.initTagTree();            
            
            //BasicViewsUI = basicviews;
            BasicViewsUI.initContextMenus();
            BasicViewsUI.initFileTagViews();
            BasicViewsUI.initDialogs(); 
            BasicViewsUI.initButtons();
            BasicViewsUI.initThumbView();
            
            DirectoriesUI.initDialogs();
            DirectoriesUI.initButtons();
            DirectoriesUI.initDirectoryTree();
            
            SettingsUI.initButtons();
            SettingsUI.initDialogs();
            SettingsUI.initJSONEditor();
           
            TSSETTINGS.loadSettingsLocalStorage();
            
            // By empty local storage and a mozilla browser, trying to load from mozilla preferences
            if(TSSETTINGS.Settings == undefined && $.browser.mozilla) {
                setTimeout(IOAPI.loadSettings, 1000); // executes initUI and updateSettingMozillaPreferences by success
                console.debug("Loading setting with from mozilla pref execured with delay...");
            } 
        
            if(TSSETTINGS.Settings == undefined) {
                TSSETTINGS.Settings = TSSETTINGS.DefaultSettings;
            }          
            
            UIAPI.initUI(); 
    });    
});