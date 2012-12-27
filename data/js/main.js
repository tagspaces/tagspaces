/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define([
    'jquery',
    'jqueryui',
    'dynatree',
    'datatables',
    'jsoneditor',
    'jquerylayout',
    'jquerydropdown',    
    'less'
], function($){
"use strict";

var initApp = function(){
    console.debug("Initializing UI...");
    var editor = undefined; // Needed for JSON Editor

    // Setting up the communication between the extension and tagspace app
    if( $.browser.mozilla) {
        require([
           "js/messaging.mozilla",
           "js/ioapi.mozilla"           
           ]); 
    } else if ($.browser.chrome) {
        require([
           "js/ioapi.chrome"           
           ]);         
    }    

    // TODO refactor all libs for integration of backbone.js     
    require([
            "js/fileviewer.ui",
            "js/tags.ui",
            "js/basicviews.ui",
            "js/settings.ui",
            "js/misc.ui",
            "js/settings.api",
            "js/tagspace.api",
            "js/directories.ui",
        ], 
        function() {
            TagsUI.initContextMenus();
            TagsUI.initDialogs();
            //TagsUI.initTagTree();            
            
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
           
            TSSETTINGS.loadSettingsLocalStorage();
            
            // In firefox, by empty local storage trying to load the settings from mozilla preferences
            if(TSSETTINGS.Settings == undefined && $.browser.mozilla) {
                setTimeout(IOAPI.loadSettings, 1000); // executes initUI and updateSettingMozillaPreferences by success
                console.debug("Loading setting with from mozilla pref execured with delay...");
            } 
        
            // If still nothing found, loading the default setting from the application's javascript
            // This is usually the case by a new installation
            if(TSSETTINGS.Settings == undefined) {
                TSSETTINGS.Settings = TSSETTINGS.DefaultSettings;
            }          
            
            $("#appVersion").text("["+TSSETTINGS.DefaultSettings["appVersion"]+"]");
            $("#appVersion").attr("title","["+TSSETTINGS.DefaultSettings["appBuild"]+"]");

            DirectoriesUI.initFavorites();
            
            TagsUI.generateTagGroups();
            
            // TODO workarround for a bug
            $("#dirTree").css("display", "block");         

            $( "#loading" ).hide();  
            $( "#container" ).show();  
            // TODO check if document.ready is really needed
            $(document).ready(function() {
                    UIAPI.initLayout();
                    SettingsUI.initJSONEditor();                                
                } 
            );  
            UIAPI.hideLoadingAnimation();
    });         
}

return {
    initializeApp: initApp,
};
  
});