/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
console.debug("Loading MainUI...");

initExtensionMessaging();

jQuery(function($) {
    
    TagsUI.initContextMenus();    
    TagsUI.initDialogs();
    TagsUI.initTagTree();
    
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

// Layout Buttons    
    $( "#toggleLeftPanel" ).button({
        text: false,
        icons: {
            primary: "ui-icon-triangle-2-e-w"
        }
    })
    .click(function() {
        layoutContainer.toggle("west");
    });  
    
    $( "#toggleRightPanel" ).button({
        text: false,
        icons: {
            primary: "ui-icon-triangle-2-e-w"
        }        
    })
    .click(function() {
        layoutContainer.toggle("east");
    });            
    
    TSSETTINGS.loadSettingsLocalStorage();
    
    // By no local storage setting and a mozilla browser try to load from mozilla preferences
    if(TSSETTINGS.Settings == undefined && $.browser.mozilla) {
        setTimeout(IOAPI.loadSettings, 1000); // executes initUI and updateSettingMozillaPreferences by success
        console.debug("Loading setting with from mozilla pref execured with delay...");
    } 

    if(TSSETTINGS.Settings == undefined) {
        TSSETTINGS.Settings = TSSETTINGS.DefaultSettings;
    }
    
    UIAPI.initUI();    
    
/*    //TODO Opening the first favorite with delay
    if(TSSETTINGS.Settings != undefined) {
        setTimeout(function() {
            DirectoriesUI.openFavorite(TSSETTINGS.Settings["tagspacesList"][0].path, TSSETTINGS.Settings["tagspacesList"][0].name);            
        }, 1000);
        console.debug("Execute loading tree with delay with delay");
    }     */    
});   

// Setting up the communication between the extension and tagspace app
function initExtensionMessaging() {
    console.debug("Init Extension Message...");
    document.documentElement.addEventListener("addon-message1", function(event) {
        console.debug("Message received in page script from content script: "+JSON.stringify(event.detail));
        UIAPI.hideLoadingAnimation();
        var message = event.detail;
        switch (message.command) {
          case "loadSettings":
            if(message.success) {
                try {
                    console.debug("Loading settings...: "+JSON.stringify(message.content));
                    TSSETTINGS.updateSettingMozillaPreferences(message.content);
                } catch (ex) {
                    console.debug("Exception while getting setting from firefox failed "+ex)
                }
            } else {
                console.debug("Getting setting from firefox failed") 
            }
            break;
          case "saveSettings":
            if(message.success) {
                console.debug("Saving setting as native mozilla preference successfull!")
            } else {
                console.debug("Saving setting as native mozilla preference failed!")            
            }
            break;        
          case "updateDefaultPath":
            if(message.content.length > 1) {
                UIAPI.setCurrentPath(message.content);
            }
            break;
          case "rename":
            if(message.success){
                UIAPI.updateLogger("Rename success");   
                // message.content contains the name of the file after the rename
                UIAPI.selectedFiles[0] = message.content;
                if(UIAPI.isFileOpened) {
                   UIAPI.openFile(UIAPI.selectedFiles[0]);
                }            
            } else {
                UIAPI.updateLogger("Rename failed");        
            }
            break;
          case "saveTextFile":
            if(message.success){
                UIAPI.updateLogger("Save success");             
            } else {
                UIAPI.updateLogger("Save failed");      
            }
            break;
          case "createDirectory":
            if(message.success){
                UIAPI.updateLogger("Create dir success");            
                DirectoriesUI.openFavorite(TSSETTINGS.Settings["tagspacesList"][0].path, TSSETTINGS.Settings["tagspacesList"][0].name);
            } else {
                UIAPI.updateLogger("Create dir failed");        
            }
            break;
          case "loadTextFile":
            if(message.success){
                UIAPI.updateTextEditorContent(message.content);         
            } else {
                UIAPI.updateLogger("File loading failed");      
            }
            break;
          case "listDirectory":
            if(message.success){
                UIAPI.updateFileBrowserData(message.content);       
            } else {
                UIAPI.updateLogger("List directory failed");        
            }
            break;      
          case "getSubdirs":
            if(message.success){
                var dirListing = [];
                for (var i=0; i < message.content.length; i++) {
                    dirListing.push(message.content[i]);
                }
                // TODO JSON functions are a workarround for a bug....
                UIAPI.updateTree(JSON.parse( JSON.stringify(dirListing)));
                //if(!extConnected) {
                //    initUI();
                //}
                //extConnected = true;
            } else {
                UIAPI.updateLogger("Getting subdirs failed");       
            }
            break;  
          case "delete":
            if(message.success){
                UIAPI.updateLogger("Delete success");               
            } else {
                UIAPI.updateLogger("Delete failed");        
            }
            break;          
          default:
            break;
        }   
    }, false);
}
