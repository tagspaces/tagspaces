/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define([
    'jquery',
    'jqueryui',
    'datatables',
    'jsoneditor',
    'jquerylayout',
    'jquerydropdown',
    'jqueryuitooltips',
    'jqueryuidroppable',
    'less'
], function($){
"use strict";

var initApp = function(){
    console.debug("Initializing UI...");
    var editor = undefined; // Needed for JSON Editor

    // Setting up the IO functionality according to the plattform
    if( $.browser.mozilla ) {
        require([
           "js/messaging.mozilla",
           "js/ioapi.mozilla"           
           ]); 
    } else if ( $.browser.chrome ) {
        require([
           "js/ioapi.chrome"           
           ]);         
    } else { // TODO a more sophisticated check is required for cordova
        require([
           "js/ioapi.cordova"           
           ]);         
    }
    
    var layoutContainer = undefined;   

    // TODO refactor all libs for integration of backbone.js     
    require([
            "js/view.manager",
            "js/settings.api",
            "js/fileviewer.ui",
            "js/core.ui",
            "js/tags.ui",
            "js/core.api",
            "js/tagspace.api",
            "js/directories.ui",
        ], 
        function(viewManager) {
			UIAPI.ViewManager = viewManager;
			
            TagsUI.initContextMenus();
            TagsUI.initDialogs();
            
            DirectoriesUI.initDialogs();
            DirectoriesUI.initButtons();
            DirectoriesUI.initContextMenus();
           
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
          
          	TSSETTINGS.upgradeSettings();
            
            // Init views
 			UIAPI.ViewManager.initViews();                 
            
            $("#appVersion").text("["+TSSETTINGS.DefaultSettings["appVersion"]+"]");
            $("#appVersion").attr("title","["+TSSETTINGS.DefaultSettings["appBuild"]+"]");

            DirectoriesUI.initFavorites();
            
            TagsUI.generateTagGroups();

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

return {
    initializeApp: initApp,
};
  
});