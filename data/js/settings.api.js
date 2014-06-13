/* Copyright (c) 2012-2014 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
/* global define, isFirefox  */

 define(function(require, exports, module) {
"use strict";

    console.log("Loading settings.api.js..");
    
    var TSCORE = require("tscore");
    
    exports.DefaultSettings = require("tssettingsdefault").defaultSettings;

    exports.Settings = undefined;
    
    var tagTemplate = {
        "title" : undefined,
        "type" : "plain"
        /*          ,
         "pattern":"yyyymmddhhmmss-yyyymmddhhmmss",
         "example":"20120114123456-20120823231235",
         "regex":"",
         "maxlength":17,
         "chainedTags":[
         "isbn","autor"
         ],
         "url": "http://example.com",
         "action":"showDatePicker",
         "prefixes":[
         "EUR", "USD", "BGN"
         ]
         */
    };
    
    var locationTemplate = {
                "name": undefined,
                "path": undefined,
                "perspective": undefined
           };
                            
    var tagGroupTemplate = {
                "title": undefined,
                "key": undefined,
                "expanded": true,
                "children": []
           };

    var firstRun = false;
    
    var upgradeSettings = function() {
        var oldBuildNumber = parseInt(exports.Settings.appBuildID);
        // For compartibility reasons
        if(exports.Settings.appBuildID === undefined) {
            oldBuildNumber = parseInt(exports.Settings.appBuild);
            exports.Settings.appBuildID = exports.DefaultSettings.appBuildID;
            saveSettings();          
        }
        var newBuildNumber = parseInt(exports.DefaultSettings.appBuildID);
        // Workarround for settings update, please comment for production
        //oldBuildNumber = 1;
        //newBuildNumber = 2;       
        if(oldBuildNumber < newBuildNumber) {
            console.log("Upgrading settings");
            exports.Settings.appVersion = exports.DefaultSettings.appVersion;
            exports.Settings.appBuild = exports.DefaultSettings.appBuild;
            exports.Settings.appBuildID = exports.DefaultSettings.appBuildID;
            getPerspectiveExtensions();
            getExtensionPath();
            getShowUnixHiddenEntries();
            getCheckForUpdates();
                
            // Upgrade only if build number smaller than 1386
            if(oldBuildNumber <= 1385) {
                addToSettingsArray(exports.Settings.ootbViewers,"viewerImage");
                addToSettingsArray(exports.Settings.ootbViewers,"viewerPDF");
                addToSettingsArray(exports.Settings.ootbViewers,"editorText");
    
                addToSettingsArray(exports.Settings.ootbEditors,"editorHTML");
                addToSettingsArray(exports.Settings.ootbEditors,"editorText");
    
                addTagGroup(
                    { "expanded": true, "title": "Priorities", "key": "PRI", "children": [
                        { "type": "plain", "title": "high", "parentKey": "49138", "color": "#ff7537", "textcolor": "#ffffff"},
                        { "type": "plain", "title": "medium", "parentKey": "49138", "color": "#ffad46", "textcolor": "#ffffff" },
                        { "type": "plain", "title": "low", "parentKey": "49138", "color": "#7bd148", "textcolor": "#ffffff"}
                    ]}
                );
                
                addFileType({ "type": "xml",    "viewer": "editorText",      "editor": "editorText" }); 
                addFileType({ "type": "js",     "viewer": "editorText",      "editor": "editorText" }); 
                addFileType({ "type": "json",   "viewer": "editorText",      "editor": "editorText" }); 
                addFileType({ "type": "url",    "viewer": "editorText",      "editor": "editorText" }); 
                
                updateFileType({ "type": "jpg",    "viewer": "viewerImage",     "editor": "editorText" }); 
                updateFileType({ "type": "jpg",    "viewer": "viewerImage",     "editor": "false" });        
                updateFileType({ "type": "jpeg",   "viewer": "viewerImage",     "editor": "false" });   
                updateFileType({ "type": "gif",    "viewer": "viewerImage",     "editor": "false" });       
                updateFileType({ "type": "png",    "viewer": "viewerImage",     "editor": "false" });       
                updateFileType({ "type": "svg",    "viewer": "viewerBrowser",   "editor": "editorText" });
                updateFileType({ "type": "html",   "viewer": "viewerBrowser",   "editor": "editorHTML" });                        
                updateFileType({ "type": "htm",    "viewer": "viewerBrowser",   "editor": "editorHTML" });                       
                updateFileType({ "type": "txt",    "viewer": "viewerBrowser",   "editor": "editorText" });           
                updateFileType({ "type": "xml",    "viewer": "editorText",      "editor": "editorText" }); 
                updateFileType({ "type": "js",     "viewer": "editorText",      "editor": "editorText" }); 
                updateFileType({ "type": "json",   "viewer": "editorText",      "editor": "editorText" }); 
                updateFileType({ "type": "url",    "viewer": "editorText",      "editor": "editorText" }); 
                updateFileType({ "type": "css",    "viewer": "editorText",      "editor": "editorText" });                 
            }
            // Upgrade only if build number smaller than 1455                                                   
            if(oldBuildNumber <= 1454) {
                removeFromSettingsArray(exports.Settings.ootbPerspectives,"perspectiveDefault");
                removeFromSettingsArray(exports.Settings.ootbPerspectives,"perspectiveThumb");
                
                addToSettingsArray(exports.Settings.ootbPerspectives,"perspectiveList");
                addToSettingsArray(exports.Settings.ootbPerspectives,"perspectiveGrid");
                addToSettingsArray(exports.Settings.ootbPerspectives,"perspectiveGraph");

                removeFromSettingsArrayById(exports.Settings.perspectives, "perspectiveThumb");
                removeFromSettingsArrayById(exports.Settings.perspectives, "perspectiveDefault");

                addToSettingsArray(exports.Settings.perspectives, { "id": "perspectiveList" });
                addToSettingsArray(exports.Settings.perspectives, { "id": "perspectiveGrid" });

                addTagGroup(
                    { "expanded": true, "title": "Smart Tags", "key": "SMR", "children": [
                        {
                            "type":          "smart",
                            "title":         "now",
                            "functionality": "now",
                            "desciption":    "Adds the current date and time as tag",
                            "color":         "#4986e7",
                            "textcolor":     "#ffffff"
                        },
                        {
                            "type":          "smart",
                            "title":         "today",
                            "functionality": "today",
                            "desciption":    "Adds the current date as tag",
                            "color":         "#4986e7",
                            "textcolor":     "#ffffff"
                        },
                        {
                            "type":          "smart",
                            "title":         "tomorrow",
                            "functionality": "tomorrow",
                            "desciption":    "Adds tomorrow's date as tag",
                            "color":         "#4986e7",
                            "textcolor":     "#ffffff"
                        },
                        {
                            "type":          "smart",
                            "title":         "yesterday",
                            "functionality": "yesterday",
                            "desciption":    "Adds the date of yesterday as tag",
                            "color":         "#4986e7",
                            "textcolor":     "#ffffff"
                        },
                        {
                            "type":          "smart",
                            "title":         "month",
                            "functionality": "currentMonth",
                            "desciption":    "Adds the current year and month as tag",
                            "color":         "#4986e7",
                            "textcolor":     "#ffffff"
                        },                    
                        {
                            "type":          "smart",
                            "title":         "year",
                            "functionality": "currentYear",
                            "desciption":    "Adds the current year as tag",
                            "color":         "#4986e7",
                            "textcolor":     "#ffffff"
                        }
                    ]}
                );
            }

            if(oldBuildNumber <= 1600) {  
                addFileType({ "type": "h",     "viewer": "editorText",    "editor": "editorText" });                              
                addFileType({ "type": "c",     "viewer": "editorText",    "editor": "editorText" });                              
                addFileType({ "type": "clj",   "viewer": "editorText",    "editor": "editorText" });                              
                addFileType({ "type": "coffee","viewer": "editorText",    "editor": "editorText" });                              
                addFileType({ "type": "cpp",   "viewer": "editorText",    "editor": "editorText" });                                              
                addFileType({ "type": "cs",    "viewer": "editorText",    "editor": "editorText" });                              
                addFileType({ "type": "groovy","viewer": "editorText",    "editor": "editorText" });                              
                addFileType({ "type": "haxe",  "viewer": "editorText",    "editor": "editorText" });                              
                addFileType({ "type": "java",  "viewer": "editorText",    "editor": "editorText" });                                                              
                addFileType({ "type": "jsm",   "viewer": "editorText",    "editor": "editorText" });
                addFileType({ "type": "less",  "viewer": "editorText",    "editor": "editorText" });                              
                addFileType({ "type": "lua",   "viewer": "editorText",    "editor": "editorText" });                              
                addFileType({ "type": "ml",    "viewer": "editorText",    "editor": "editorText" });                              
                addFileType({ "type": "mli",   "viewer": "editorText",    "editor": "editorText" });                                              
                addFileType({ "type": "pl",    "viewer": "editorText",    "editor": "editorText" });                                                                                                                                                                              
                addFileType({ "type": "php",   "viewer": "editorText",    "editor": "editorText" });                              
                addFileType({ "type": "py",    "viewer": "editorText",    "editor": "editorText" });                              
                addFileType({ "type": "rb",    "viewer": "editorText",    "editor": "editorText" });                              
                addFileType({ "type": "sh",    "viewer": "editorText",    "editor": "editorText" });                              
                addFileType({ "type": "sql",   "viewer": "editorText",    "editor": "editorText" });                              
                addFileType({ "type": "mkd",   "viewer": "viewerMD",    "editor": "editorText" });                            
                addFileType({ "type": "mdwn",  "viewer": "viewerMD",    "editor": "editorText" });                            
                addFileType({ "type": "markdown", "viewer": "viewerMD",    "editor": "editorText" });                                             
                addFileType({ "type": "avi",    "viewer": "viewerBrowser", "editor": "false" }); 
                addFileType({ "type": "ogg",    "viewer": "viewerBrowser", "editor": "false" }); 
                addFileType({ "type": "ogv",    "viewer": "viewerBrowser", "editor": "false" }); 
                addFileType({ "type": "oga",    "viewer": "viewerBrowser", "editor": "false" }); 
                addFileType({ "type": "ogx",    "viewer": "viewerBrowser", "editor": "false" }); 
                addFileType({ "type": "spx",    "viewer": "viewerBrowser", "editor": "false" }); 
                addFileType({ "type": "opus",   "viewer": "viewerBrowser", "editor": "false" }); 
                addFileType({ "type": "mp3",    "viewer": "viewerBrowser", "editor": "false" }); 
                addFileType({ "type": "mp4",    "viewer": "viewerBrowser", "editor": "false" }); 
                addFileType({ "type": "m4p",    "viewer": "viewerBrowser", "editor": "false" }); 
                addFileType({ "type": "wav",    "viewer": "viewerBrowser", "editor": "false" }); 
                addFileType({ "type": "wave",   "viewer": "viewerBrowser", "editor": "false" }); 
                addFileType({ "type": "webm",   "viewer": "viewerBrowser", "editor": "false" });                 
                addFileType({ "type": "m4v",    "viewer": "viewerBrowser", "editor": "false" }); 
                addFileType({ "type": "m4a",    "viewer": "viewerBrowser", "editor": "false" }); 
                addFileType({ "type": "mov",    "viewer": "viewerBrowser", "editor": "false" });                 
            }

            if(oldBuildNumber <= 1700) { 
                setPrefixTagContainer("");       
                setTagDelimiter(" ");
                setCalculateTags(false);     
            }

            if(oldBuildNumber <= 201403070000) { 
                addFileType({ "type": "odt",    "viewer": "editorODF", "editor": "false" });                 
                addFileType({ "type": "ods",    "viewer": "editorODF", "editor": "false" }); 
                addFileType({ "type": "odp",    "viewer": "editorODF", "editor": "false" }); 
                addFileType({ "type": "odg",    "viewer": "editorODF", "editor": "false" });                 
            }

            if(oldBuildNumber <= 201405120000) {
                addTagGroup(
                    {
                        "title": "Ratings", "key": "REV", "expanded": true, "children": [
                            {
                                "type": "plain",
                                "title": "1star",
                                "color": "#FFCC24",
                                "textcolor": "#ffffff",
                                "keyBinding": "t 1"
                            },
                            {
                                "type": "plain",
                                "title": "2star",
                                "color": "#FFCC24",
                                "textcolor": "#ffffff",
                                "keyBinding": "t 2"
                            },
                            {
                                "type": "plain",
                                "title": "3star",
                                "color": "#FFCC24",
                                "textcolor": "#ffffff",
                                "keyBinding": "t 3"
                            },
                            {
                                "type": "plain",
                                "title": "4star",
                                "color": "#FFCC24",
                                "textcolor": "#ffffff",
                                "keyBinding": "t 4"
                            },
                            {
                                "type": "plain",
                                "title": "5star",
                                "color": "#FFCC24",
                                "textcolor": "#ffffff",
                                "keyBinding": "t 5"
                            }
                        ]
                    }
                );
            }
            
            saveSettings();         
        }

    };
    
    //////////////////// Settings upgrade methods ///////////////////   

    var addTagGroup = function(newTagGroup) {
        var tagGroupExist = false;
        exports.Settings.tagGroups.forEach(function (value) {
            if(value.key === newTagGroup.key) {
                tagGroupExist = true;
            }        
        });  
        if(!tagGroupExist) {
            exports.Settings.tagGroups.push(newTagGroup);
        }
    };

    var addFileType = function(newFileType) {
        var fileTypeExist = false;
        exports.Settings.supportedFileTypes.forEach(function (value) {
            if(value.type === newFileType.type) {
                fileTypeExist = true;
            }        
        });  
        if(!fileTypeExist) {
            exports.Settings.supportedFileTypes.push(newFileType);
        }
    };
    
    var updateFileType = function(newFileType) {
        exports.Settings.supportedFileTypes.forEach(function (value) {
            if(value.type === newFileType.type) {
                value.viewer = newFileType.viewer;
                value.editor = newFileType.editor;                
            }        
        });  
    };    

    var addToSettingsArray = function(arrayLocation, value) {
        if(arrayLocation instanceof Array) {
            if($.inArray(value, arrayLocation) < 0) {
                arrayLocation.push(value);                
            }
        }        
    };

    var removeFromSettingsArray = function(arrayLocation, value) {
        if(arrayLocation instanceof Array) {
            arrayLocation.splice( $.inArray(value, arrayLocation), 1 );
        }        
    };

    var removeFromSettingsArrayById = function(arrayLocation, id) {
        if(arrayLocation instanceof Array) {
            arrayLocation.forEach(function (value, index) {         
                if(value.id === id) {
                    arrayLocation.splice( index, 1 );
                }        
            });  
        }        
    };
    
    //////////////////// getter and setter methods ///////////////////    

    var getPerspectiveExtensions = function() {
        return exports.DefaultSettings.ootbPerspectives;
    };

    var getActivatedPerspectiveExtensions = function() {
        if(exports.Settings.perspectives === undefined) {
            exports.Settings.perspectives = exports.DefaultSettings.perspectives;
        }
        return exports.Settings.perspectives;
    };

    var getViewerExtensions = function() {
        return exports.DefaultSettings.ootbViewers;
    };
    
    var getEditorExtensions = function() {
        if(exports.Settings.ootbEditors === undefined) {
            exports.Settings.ootbEditors = exports.DefaultSettings.ootbEditors;
        }
        return exports.Settings.ootbEditors;
    };   
    
    var getPerspectives = function() {
        if(exports.Settings.perspectives === undefined) {
            exports.Settings.perspectives = exports.DefaultSettings.perspectives;
        }
        return exports.Settings.perspectives;
    };

    var setPerspectives = function(value) {
        exports.Settings.perspectives = value;
    };
    
    var getExtensionPath = function() {
        if(exports.Settings.extensionsPath === undefined) {
            exports.Settings.extensionsPath = exports.DefaultSettings.extensionsPath;
        }
        return exports.Settings.extensionsPath;
    };

    var setExtensionPath = function(value) {
        exports.Settings.extensionsPath = value;
    };

    var isFirstRun = function() {
        if(exports.Settings.firstRun === undefined) {
            exports.Settings.firstRun = false;
        }
        if(exports.Settings.firstRun){
            exports.Settings.firstRun = false;
            saveSettings();
            return true;
        } else {
            return false;
        }
    };

    var getIsWindowMaximized = function() {
        if(exports.Settings.isWindowMaximized === undefined) {
            exports.Settings.isWindowMaximized = exports.DefaultSettings.isWindowMaximized;
        }
        return exports.Settings.isWindowMaximized;
    };

    var setIsWindowMaximized = function(value) {
        exports.Settings.isWindowMaximized = value;
    };    
    
    var getLastOpenedLocation = function() {
        if(exports.Settings.lastOpenedLocation === undefined) {
            exports.Settings.lastOpenedLocation = exports.DefaultSettings.lastOpenedLocation;
        }
        return exports.Settings.lastOpenedLocation;
    };

    var setLastOpenedLocation = function(value) {
        exports.Settings.lastOpenedLocation = value;
    };

     var getSupportedLanguages = function () {
         return exports.DefaultSettings.supportedLanguages;
     };

     var getCloseViewerKeyBinding = function () {
         if (exports.Settings.keyBindings === undefined) {
             exports.Settings.keyBindings = exports.DefaultSettings.keyBindings;
             saveSettings();
         }
         if (exports.Settings.keyBindings.closeViewer === undefined) {
             exports.Settings.keyBindings.closeViewer = exports.DefaultSettings.keyBindings.closeViewer;
             saveSettings();
         }
         return exports.Settings.keyBindings.closeViewer;
     };

     var setCloseViewerKeyBinding = function (value) {
         exports.Settings.keyBindings.closeViewer = value;
     };

     var getSaveDocumentKeyBinding = function () {
         if (exports.Settings.keyBindings === undefined) {
             exports.Settings.keyBindings = exports.DefaultSettings.keyBindings;
             saveSettings();
         }
         if (exports.Settings.keyBindings.saveDocument === undefined) {
             exports.Settings.keyBindings.saveDocument = exports.DefaultSettings.keyBindings.saveDocument;
             saveSettings();
         }
         return exports.Settings.keyBindings.saveDocument;
     };

     var setSaveDocumentKeyBinding = function (value) {
         exports.Settings.keyBindings.saveDocument = value;
     };

     var getReloadApplicationKeyBinding = function () {
         //if (exports.Settings.keyBindings === undefined) {
         //    exports.Settings.keyBindings = exports.DefaultSettings.keyBindings;
         //    saveSettings();
         //}
         //if (exports.Settings.keyBindings.reloadApplication === undefined) {
         //    exports.Settings.keyBindings.reloadApplication = exports.DefaultSettings.keyBindings.reloadApplication;
         //    saveSettings();
         //}
         return exports.DefaultSettings.keyBindings.reloadApplication;
     };

     var setReloadApplicationKeyBinding = function (value) {
         consolo.log("Not supported command");
         //exports.Settings.keyBindings.reloadApplication = value;
     };

     var getToggleFullScreenKeyBinding = function () {
         if (exports.Settings.keyBindings === undefined) {
             exports.Settings.keyBindings = exports.DefaultSettings.keyBindings;
             saveSettings();
         }
         if (exports.Settings.keyBindings.toggleFullScreen === undefined) {
             exports.Settings.keyBindings.toggleFullScreen = exports.DefaultSettings.keyBindings.toggleFullScreen;
             saveSettings();
         }
         return exports.Settings.keyBindings.toggleFullScreen;
     };

     var setToggleFullScreenKeyBinding = function (value) {
         exports.Settings.keyBindings.toggleFullScreen = value;
     };

     var getReloadDocumentKeyBinding = function () {
         if (exports.Settings.keyBindings === undefined) {
             exports.Settings.keyBindings = exports.DefaultSettings.keyBindings;
             saveSettings();
         }
         if (exports.Settings.keyBindings.reloadDocument === undefined) {
             exports.Settings.keyBindings.reloadDocument = exports.DefaultSettings.keyBindings.reloadDocument;
             saveSettings();
         }
         return exports.Settings.keyBindings.reloadDocument;
     };

     var setReloadDocumentKeyBinding = function (value) {
         exports.Settings.keyBindings.reloadDocument = value;
     };

     var getDeleteDocumentKeyBinding = function () {
         if (exports.Settings.keyBindings === undefined) {
             exports.Settings.keyBindings = exports.DefaultSettings.keyBindings;
             saveSettings();
         }
         if (exports.Settings.keyBindings.deleteDocument === undefined) {
             exports.Settings.keyBindings.deleteDocument = exports.DefaultSettings.keyBindings.deleteDocument;
             saveSettings();
         }
         return exports.Settings.keyBindings.deleteDocument;
     };

     var setDeleteDocumentKeyBinding = function (value) {
         exports.Settings.keyBindings.deleteDocument = value;
     };

     var getPropertiesDocumentKeyBinding = function () {
         if (exports.Settings.keyBindings === undefined) {
             exports.Settings.keyBindings = exports.DefaultSettings.keyBindings;
             saveSettings();
         }
         if (exports.Settings.keyBindings.propertiesDocument === undefined) {
             exports.Settings.keyBindings.propertiesDocument = exports.DefaultSettings.keyBindings.propertiesDocument;
             saveSettings();
         }
         return exports.Settings.keyBindings.propertiesDocument;
     };

     var setPropertiesDocumentKeyBinding = function (value) {
         exports.Settings.keyBindings.propertiesDocument = value;
     };

     var getNextDocumentKeyBinding = function () {
         if (exports.Settings.keyBindings === undefined) {
             exports.Settings.keyBindings = exports.DefaultSettings.keyBindings;
             saveSettings();
         }
         if (exports.Settings.keyBindings.nextDocument === undefined) {
             exports.Settings.keyBindings.nextDocument = exports.DefaultSettings.keyBindings.nextDocument;
             saveSettings();
         }
         return exports.Settings.keyBindings.nextDocument;
     };

     var setNextDocumentKeyBinding = function (value) {
         exports.Settings.keyBindings.nextDocument = value;
     };

     var getPrevDocumentKeyBinding = function () {
         if (exports.Settings.keyBindings === undefined) {
             exports.Settings.keyBindings = exports.DefaultSettings.keyBindings;
             saveSettings();
         }
         if (exports.Settings.keyBindings.prevDocument === undefined) {
             exports.Settings.keyBindings.prevDocument = exports.DefaultSettings.keyBindings.prevDocument;
             saveSettings();
         }
         return exports.Settings.keyBindings.prevDocument;
     };

     var setShowTagLibraryKeyBinding = function (value) {
         exports.Settings.keyBindings.showTagLibrary = value;
     };

     var getShowTagLibraryKeyBinding = function () {
         if (exports.Settings.keyBindings === undefined) {
             exports.Settings.keyBindings = exports.DefaultSettings.keyBindings;
             saveSettings();
         }
         if (exports.Settings.keyBindings.showTagLibrary === undefined) {
             exports.Settings.keyBindings.showTagLibrary = exports.DefaultSettings.keyBindings.showTagLibrary;
             saveSettings();
         }
         return exports.Settings.keyBindings.showTagLibrary;
     };

     var setShowFolderNavigatorKeyBinding = function (value) {
         exports.Settings.keyBindings.showFolderNavigator = value;
     };

     var getShowFolderNavigatorBinding = function () {
         if (exports.Settings.keyBindings === undefined) {
             exports.Settings.keyBindings = exports.DefaultSettings.keyBindings;
             saveSettings();
         }
         if (exports.Settings.keyBindings.showFolderNavigator === undefined) {
             exports.Settings.keyBindings.showFolderNavigator = exports.DefaultSettings.keyBindings.showFolderNavigator;
             saveSettings();
         }
         return exports.Settings.keyBindings.showFolderNavigator;
     };

     var setPrevDocumentKeyBinding = function (value) {
         exports.Settings.keyBindings.prevDocument = value;
     };

     var getOpenDevToolsScreenKeyBinding = function () {
         if (exports.Settings.keyBindings === undefined) {
             exports.Settings.keyBindings = exports.DefaultSettings.keyBindings;
             saveSettings();
         }
         if (exports.Settings.keyBindings.openDevTools === undefined) {
             exports.Settings.keyBindings.openDevTools = exports.DefaultSettings.keyBindings.openDevTools;
             saveSettings();
         }
         return exports.Settings.keyBindings.openDevTools;
     };

     var setOpenDevToolsScreenKeyBinding = function (value) {
         exports.Settings.keyBindings.openDevTools = value;
     };

     var getInterfaceLangauge = function () {
         if (exports.Settings.interfaceLanguage === undefined) {
             exports.Settings.interfaceLanguage = exports.DefaultSettings.interfaceLanguage;
             saveSettings();
         }
         return exports.Settings.interfaceLanguage;
     };

     var setInterfaceLangauge = function (value) {
         exports.Settings.interfaceLanguage = value;
     };

     var getShowWarningRecursiveScan = function () {
         if (exports.Settings.showWarningRecursiveScan === undefined) {
             exports.Settings.showWarningRecursiveScan = exports.DefaultSettings.showWarningRecursiveScan;
             saveSettings();
         }
         return exports.Settings.showWarningRecursiveScan;
     };

     var setShowWarningRecursiveScan = function (value) {
         exports.Settings.showWarningRecursiveScan = value;
         saveSettings();
     };

     var getShowMainMenu = function() {
        if(exports.Settings.showMainMenu === undefined) {
            exports.Settings.showMainMenu = exports.DefaultSettings.showMainMenu;
        }
        return exports.Settings.showMainMenu;
    };

    var setShowMainMenu = function(value) {
        exports.Settings.showMainMenu = value;
    };

     var getShowUnixHiddenEntries = function() {
         if(exports.Settings.showUnixHiddenEntries === undefined) {
             exports.Settings.showUnixHiddenEntries = exports.DefaultSettings.showUnixHiddenEntries;
         }
         return exports.Settings.showUnixHiddenEntries;
     };

     var setShowUnixHiddenEntries = function(value) {
         exports.Settings.showUnixHiddenEntries = value;
     };

    var getCheckForUpdates = function() {
        if(exports.Settings.checkForUpdates === undefined) {
            exports.Settings.checkForUpdates = exports.DefaultSettings.checkForUpdates;
        }
        return exports.Settings.checkForUpdates;
    };

    var setCheckForUpdates = function(value) {
        exports.Settings.checkForUpdates = value;
    };    

    var getPrefixTagContainer = function() {
        if(exports.Settings.prefixTagContainer === undefined) {
            exports.Settings.prefixTagContainer = exports.DefaultSettings.prefixTagContainer;
        }
        return exports.Settings.prefixTagContainer;
    };

    var setPrefixTagContainer = function(value) {
        exports.Settings.prefixTagContainer = value;
    };  

    var getTagDelimiter = function() {
        if(exports.Settings.tagDelimiter === undefined) {
            exports.Settings.tagDelimiter = exports.DefaultSettings.tagDelimiter;
        }
        return exports.Settings.tagDelimiter;
    };

    var setTagDelimiter = function(value) {
        exports.Settings.tagDelimiter = value;
    };    

    var getCalculateTags = function() {
        if(exports.Settings.calculateTags === undefined) {
            exports.Settings.calculateTags = exports.DefaultSettings.calculateTags;
        }
        return exports.Settings.calculateTags;
    };

    var setCalculateTags = function(value) {
        exports.Settings.calculateTags = value;
    };    

    var getSupportedFileTypes = function() {
        if(exports.Settings.supportedFileTypes === undefined) {
            exports.Settings.supportedFileTypes = exports.DefaultSettings.supportedFileTypes;
        }
        return exports.Settings.supportedFileTypes;
    };

    var setSupportedFileTypes = function(value) {
        exports.Settings.supportedFileTypes = value;
    };   
        
    var getNewTextFileContent = function() {
        return exports.Settings.newTextFileContent;
    };
    
    var getNewHTMLFileContent = function() {
        return exports.Settings.newHTMLFileContent;
    };
    
    var getNewMDFileContent = function() {
        return exports.Settings.newMDFileContent;
    };
    
    //////////////////// API methods ///////////////////
    
    var getFileTypeEditor = function(fileTypeExt) {
        for(var i=0; i < exports.Settings.supportedFileTypes.length; i++) {
            if(exports.Settings.supportedFileTypes[i].type === fileTypeExt) {
                 return exports.Settings.supportedFileTypes[i].editor;
            }        
        }
        return false;   
    };
    
    var getFileTypeViewer = function(fileTypeExt) {
        for(var i=0; i < exports.Settings.supportedFileTypes.length; i++) {
            if(exports.Settings.supportedFileTypes[i].type === fileTypeExt) {
                 return exports.Settings.supportedFileTypes[i].viewer;
            }        
        }
        return false;   
    };
    
    // Returns the tag information from the setting for a given tag 
    var findTag = function(tagName) {
        for(var i=0; i < exports.Settings.tagGroups.length; i++) {
//          if(exports.Settings.tagGroups[i].key == tagGroupKey) {
                for(var j=0; j < exports.Settings.tagGroups[i].children.length; j++) {
                    // console.log("Current tagname "+exports.Settings.tagGroups[i].children[j].title);
                    if(exports.Settings.tagGroups[i].children[j].title === tagName) {
                        return exports.Settings.tagGroups[i].children[j];
                    }
                }
//          }        
        }
        return false;   
    };
    
    var getAllTags = function() {
        var allTags = [];
        for(var i=0; i < exports.Settings.tagGroups.length; i++) {
            // console.log("Current taggroup "+exports.Settings.tagGroups[i].key);
            for(var j=0; j < exports.Settings.tagGroups[i].children.length; j++) {
                // console.log("Current tagname "+exports.Settings.tagGroups[i].children[j].title);
                if(exports.Settings.tagGroups[i].children[j].type === "plain") {
                    allTags.push(exports.Settings.tagGroups[i].children[j].title);
                }
            }
        }
        return allTags;   
    };
    
    var getTagData = function(tagTitle, tagGroupKey) {
        for(var i=0; i < exports.Settings.tagGroups.length; i++) {
            if(exports.Settings.tagGroups[i].key === tagGroupKey) {
                for(var j=0; j < exports.Settings.tagGroups[i].children.length; j++) {
                    if(exports.Settings.tagGroups[i].children[j].title === tagTitle) {
                        return exports.Settings.tagGroups[i].children[j];
                    }
                }
            }        
        }  
    };
    
    var getTagGroupData = function(tagGroupKey) {
        for(var i=0; i < exports.Settings.tagGroups.length; i++) {
            if(exports.Settings.tagGroups[i].key === tagGroupKey) {
                return exports.Settings.tagGroups[i];
            }
        }  
    };

    var deleteTagGroup = function(tagData) {
        for(var i=0; i < exports.Settings.tagGroups.length; i++) {
            if(exports.Settings.tagGroups[i].key === tagData.key) {
                console.log("Deleting taggroup "+exports.Settings.tagGroups[i].key);
                exports.Settings.tagGroups.splice(i, 1);
                break;
            }        
        }  
        saveSettings();    
    };
    
    var editTag = function(tagData, newTagName, newColor, newTextColor, newKeyBinding) {
        for(var i=0; i < exports.Settings.tagGroups.length; i++) {
            if(exports.Settings.tagGroups[i].key === tagData.parentKey) {
                for(var j=0; j < exports.Settings.tagGroups[i].children.length; j++) {
                    if(exports.Settings.tagGroups[i].children[j].title === tagData.title) {
                        exports.Settings.tagGroups[i].children[j].title = newTagName;
                        exports.Settings.tagGroups[i].children[j].color = newColor;
                        exports.Settings.tagGroups[i].children[j].textcolor = newTextColor;
                        exports.Settings.tagGroups[i].children[j].keyBinding = newKeyBinding;
                        break;
                    }
                }
            }        
        }  
        saveSettings();       
    };

    var deleteTag = function(tagData) {
        for(var i=0; i < exports.Settings.tagGroups.length; i++) {
            if(exports.Settings.tagGroups[i].key === tagData.parentKey) {
                for(var j=0; j < exports.Settings.tagGroups[i].children.length; j++) {
                    if(exports.Settings.tagGroups[i].children[j].title === tagData.title) {
                        exports.Settings.tagGroups[i].children.splice(j, 1);
                        break;
                    }
                }
            }        
        }  
        exports.saveSettings();    
    };

    var moveTag = function(tagData, targetTagGroupKey) {
        var targetTagGroupData = getTagGroupData(targetTagGroupKey);
        if(createTag(targetTagGroupData, tagData.title, tagData.color, tagData.textcolor)) {
            deleteTag(tagData);   
            saveSettings();                   
        } 
    };
    
    var createTag = function(tagData, newTagName, newTagColor, newTagTextColor) {
        exports.Settings.tagGroups.forEach(function (value) {
            if(value.key === tagData.key) {
                console.log("Creating tag: "+JSON.stringify(newTagModel)+" with parent: "+tagData.key);
                var tagExistsInGroup = false;
                value.children.forEach(function (child) {
                    if(child.title === newTagName) {
                        tagExistsInGroup = true;
                    }
                });             
                // Create tag if it is not existing in the current group
                // And is at least 2 characters long
                if(!tagExistsInGroup && (newTagName.length >= 2)) {
                    var newTagModel = JSON.parse( JSON.stringify(tagTemplate) );
                    newTagModel.title = newTagName;
                    newTagModel.color = newTagColor;
                    newTagModel.textcolor = newTagTextColor;
                    value.children.push(newTagModel);
                } else {
                    console.log("Tag with the same name already exist in this group or tag length >= 2");                       
                }
            }        
        });  
        saveSettings();
        return true;       
    };
    
    var editTagGroup = function(tagData, tagGroupName) {
        for(var i=0; i < exports.Settings.tagGroups.length; i++) {
            if(exports.Settings.tagGroups[i].key === tagData.key) {
                exports.Settings.tagGroups[i].title = tagGroupName;
                break;
            }        
        }  
        saveSettings();       
    };
    
    var duplicateTagGroup = function(tagData, tagGroupName, tagGroupKey) {
        var newTagGroupModel;
        for(var i=0; i < exports.Settings.tagGroups.length; i++) {
            if(exports.Settings.tagGroups[i].key === tagData.key) {
                newTagGroupModel = JSON.parse( JSON.stringify(exports.Settings.tagGroups[i]));
                break;
            }        
        } 
        newTagGroupModel.title = tagGroupName;
        newTagGroupModel.key = tagGroupKey;            
        console.log("Creating taggroup: "+JSON.stringify(newTagGroupModel)+" with key: "+tagGroupKey);
        exports.Settings.tagGroups.push(newTagGroupModel);
        saveSettings();       
    };

    var createTagGroup = function(tagData, tagGroupName) {
        var newTagGroupModel =  JSON.parse( JSON.stringify( tagGroupTemplate ) );
        newTagGroupModel.title = tagGroupName;
        //newTagGroupModel.children = [];
        newTagGroupModel.key = ""+getRandomInt(10000,99999);            
        console.log("Creating taggroup: "+JSON.stringify(newTagGroupModel)+" with key: "+newTagGroupModel.key);
        exports.Settings.tagGroups.push(newTagGroupModel);
        saveSettings();       
    };  
    
    var moveTagGroup = function(tagData, direction) {
        var targetPosition;
        var currentPosition;
        exports.Settings.tagGroups.forEach(function (value, index) {
            if(value.key === tagData.key) {
                currentPosition = index;
            }
        });
        
        if (direction === "up") { targetPosition = currentPosition -1; }
        if (direction === "down") { targetPosition = currentPosition +1; }
        
        // Check if target position is within the taggroups array range
        if (targetPosition < 0 || targetPosition >= exports.Settings.tagGroups.length || targetPosition === currentPosition) {
           return false;
        }
        
        var tmpTagGroup = exports.Settings.tagGroups[currentPosition];
        exports.Settings.tagGroups[currentPosition] = exports.Settings.tagGroups[targetPosition];
        exports.Settings.tagGroups[targetPosition] = tmpTagGroup;
        saveSettings();
    };      
    
    var createLocation = function(name, location, perspectiveId) {
        var newLocationModel = JSON.parse( JSON.stringify(locationTemplate));
        name = name.replace("\\", "\\\\");
        name = name.replace("\\\\\\", "\\\\");
        name = name.replace("\\\\\\\\", "\\\\");   
        newLocationModel.name = name;
        newLocationModel.path = location;
        newLocationModel.perspective = perspectiveId;
        var createLoc = true;
        exports.Settings.tagspacesList.forEach(function (value) {
            if(value.path === newLocationModel.path) {
                TSCORE.showAlertDialog(
                    $.i18n.t("ns.dialogs:selectedPathExistContentAlert"),
                    $.i18n.t("ns.dialogs:selectedPathExistTitleAlert")
                );
                createLoc = false;
            }        
            if(value.name === newLocationModel.name) {
                TSCORE.showAlertDialog(
                    $.i18n.t("ns.dialogs:selectedLocationNameExistContentAlert"),
                    $.i18n.t("ns.dialogs:selectedLocationNameExistTitleAlert")
                );
                createLoc = false;
            }             
        });         
        if(createLoc) {
            exports.Settings.tagspacesList.push(newLocationModel);
            saveSettings();                
        }
    };

    var editLocation = function(oldName, newName, newLocation, perspectiveId) {
//        name = name.replace("\\", "\\\\");
//        name = name.replace("\\\\\\", "\\\\");
//        name = name.replace("\\\\\\\\", "\\\\");   
        console.log("Old Name: "+oldName+" New Name: "+newName+" New Loc: "+newLocation);
        var editLoc = true;
        exports.Settings.tagspacesList.forEach(function (value) {
            /* if(value.path == newLocation) {
                TSCORE.showAlertDialog("Selected path is already used by a location!","Duplicated Location Path");
                editLocation = false;
            }  */
            if(value.name === newName && value.name !== oldName) {
                TSCORE.showAlertDialog(
                    $.i18n.t("ns.dialogs:selectedLocationNameExistContentAlert"),
                    $.i18n.t("ns.dialogs:selectedLocationNameExistTitleAlert")
                );
                editLoc = false;
            }             
        });         
        if(editLoc) {
            exports.Settings.tagspacesList.forEach(function (value) {
                if(value.name === oldName) {
                    value.name = newName;
                    value.path = newLocation;
                    value.perspective = perspectiveId;
                }        
            });          
            saveSettings();                
        }
    };

    var getLocation = function(path) {
        var location;
        exports.Settings.tagspacesList.forEach(function (value) {
            if(value.path === path) {
                location = value;
            }        
        });          
        return location;
    };  
    
    var deleteLocation = function(name) {
        for(var i=0; i < exports.Settings.tagspacesList.length; i++) {
                console.log("Traversing connections "+exports.Settings.tagspacesList[i].name+" searching for "+name);
            if(exports.Settings.tagspacesList[i].name === name) {
                console.log("Deleting connections "+exports.Settings.tagspacesList[i].name);
                exports.Settings.tagspacesList.splice(i, 1);
                break;
            }        
        }  
        saveSettings();    
    };
    
    var updateSettingMozillaPreferences = function(settings) {
        var tmpSettings = JSON.parse(settings);    
        if(tmpSettings !== null) {
            exports.Settings = tmpSettings;
            console.log("Settings loaded from firefox preferences: "+tmpSettings);
        } else {
            exports.Settings = exports.DefaultSettings;
            console.log('Default settings loaded(Firefox)!');        
        }
        saveSettings();
    };
    
    var loadDefaultSettings = function() {
        exports.Settings = exports.DefaultSettings;
        saveSettings();
        TSCORE.reloadUI();                    
        console.log("Default settings loaded.");    
    };  
    
    var loadSettingsLocalStorage = function() {
        try {
            var tmpSettings = JSON.parse(localStorage.getItem('tagSpacesSettings'));
            //console.log("Settings: "+JSON.stringify(tmpSettings));        
            if(tmpSettings !== null) {
                exports.Settings = tmpSettings;     
            } else {
                // If no settings found in the local storage,
                // the application runs for the first time.
                firstRun = true;
            }
            console.log("Loaded settings from local storage: "+JSON.stringify(exports.Settings));           
        } catch(ex) {
            console.log("Loading settings from local storage failed due exception: "+ex);
        }
    };
    
    // Save setting 
    var saveSettings = function() {
        // TODO Make a file based json backup
        
        // Making a backup of the last settings
        localStorage.setItem('tagSpacesSettingsBackup1', localStorage.getItem('tagSpacesSettings'));

        // Storing setting in the local storage of mozilla and chorme
        localStorage.setItem('tagSpacesSettings', JSON.stringify(exports.Settings));
        
        // Storing settings in firefox native preferences
        if(isFirefox) {
            TSCORE.IO.saveSettings(JSON.stringify(exports.Settings));
        }
        
        console.log('Tagspace Settings Saved!');
    };
    
    var getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    
    // Public API definition
    exports.upgradeSettings                         = upgradeSettings;
    exports.getPerspectives                         = getPerspectives;
    exports.setPerspectives                         = setPerspectives;
    exports.isFirstRun                              = isFirstRun;
    exports.getExtensionPath                        = getExtensionPath;    
    exports.setExtensionPath                        = setExtensionPath;    
    exports.getShowUnixHiddenEntries                = getShowUnixHiddenEntries;
    exports.setShowUnixHiddenEntries                = setShowUnixHiddenEntries;    
    exports.getCheckForUpdates                      = getCheckForUpdates;
    exports.setCheckForUpdates                      = setCheckForUpdates;    
    exports.getSupportedFileTypes                   = getSupportedFileTypes;
    exports.setSupportedFileTypes                   = setSupportedFileTypes;
    exports.setPrefixTagContainer                   = setPrefixTagContainer;
    exports.getPrefixTagContainer                   = getPrefixTagContainer;
    exports.getTagDelimiter                         = getTagDelimiter;
    exports.setTagDelimiter                         = setTagDelimiter;
    exports.getShowMainMenu                         = getShowMainMenu;
    exports.setShowMainMenu                         = setShowMainMenu;
    exports.getCalculateTags                        = getCalculateTags;
    exports.setCalculateTags                        = setCalculateTags;
    exports.getIsWindowMaximized                    = getIsWindowMaximized;
    exports.setIsWindowMaximized                    = setIsWindowMaximized;
    exports.getLastOpenedLocation                   = getLastOpenedLocation;
    exports.setLastOpenedLocation                   = setLastOpenedLocation;
    exports.getShowWarningRecursiveScan             = getShowWarningRecursiveScan;
    exports.setShowWarningRecursiveScan             = setShowWarningRecursiveScan;
    exports.getSupportedLanguages                   = getSupportedLanguages;
    exports.getInterfaceLangauge                    = getInterfaceLangauge;
    exports.setInterfaceLangauge                    = setInterfaceLangauge;
    exports.getCloseViewerKeyBinding                = getCloseViewerKeyBinding;
    exports.setCloseViewerKeyBinding                = setCloseViewerKeyBinding;
    exports.getOpenDevToolsScreenKeyBinding         = getOpenDevToolsScreenKeyBinding;
    exports.setOpenDevToolsScreenKeyBinding         = setOpenDevToolsScreenKeyBinding;
    exports.getToggleFullScreenKeyBinding           = getToggleFullScreenKeyBinding;
    exports.setToggleFullScreenKeyBinding           = setToggleFullScreenKeyBinding;
    exports.getReloadApplicationKeyBinding          = getReloadApplicationKeyBinding;
    exports.setReloadApplicationKeyBinding          = setReloadApplicationKeyBinding;
    exports.getSaveDocumentKeyBinding               = getSaveDocumentKeyBinding;
    exports.setSaveDocumentKeyBinding               = setSaveDocumentKeyBinding;
    exports.getReloadDocumentKeyBinding             = getReloadDocumentKeyBinding;
    exports.setReloadDocumentKeyBinding             = setReloadDocumentKeyBinding;
    exports.getDeleteDocumentKeyBinding             = getDeleteDocumentKeyBinding;
    exports.setDeleteDocumentKeyBinding             = setDeleteDocumentKeyBinding;
    exports.getPropertiesDocumentKeyBinding         = getPropertiesDocumentKeyBinding;
    exports.setPropertiesDocumentKeyBinding         = setPropertiesDocumentKeyBinding;
    exports.getNextDocumentKeyBinding               = getNextDocumentKeyBinding;
    exports.setNextDocumentKeyBinding               = setNextDocumentKeyBinding;
    exports.getPrevDocumentKeyBinding               = getPrevDocumentKeyBinding;
    exports.setPrevDocumentKeyBinding               = setPrevDocumentKeyBinding;
    exports.setShowTagLibraryKeyBinding             = setShowTagLibraryKeyBinding;
    exports.getShowTagLibraryKeyBinding             = getShowTagLibraryKeyBinding;
    exports.setShowFolderNavigatorKeyBinding        = setShowFolderNavigatorKeyBinding;
    exports.getShowFolderNavigatorBinding           = getShowFolderNavigatorBinding;


    exports.getPerspectiveExtensions                = getPerspectiveExtensions;
    exports.getActivatedPerspectiveExtensions       = getActivatedPerspectiveExtensions;
    exports.getViewerExtensions                     = getViewerExtensions;
    exports.getEditorExtensions                     = getEditorExtensions;

    exports.getNewTextFileContent                   = getNewTextFileContent;
    exports.getNewHTMLFileContent                   = getNewHTMLFileContent;    
    exports.getNewMDFileContent                     = getNewMDFileContent;  
    exports.getFileTypeEditor                       = getFileTypeEditor;    
    exports.getFileTypeViewer                       = getFileTypeViewer;    
    exports.getAllTags                              = getAllTags;               

    exports.getTagData                              = getTagData;   
    exports.getTagGroupData                         = getTagGroupData;  

    exports.deleteTag                               = deleteTag;    
    exports.deleteTagGroup                          = deleteTagGroup;   
    exports.editTag                                 = editTag;  
    exports.createTag                               = createTag;
    exports.findTag                                 = findTag;
    exports.moveTag                                 = moveTag;  
    exports.editTagGroup                            = editTagGroup; 
    exports.moveTagGroup                            = moveTagGroup;
    exports.createTagGroup                          = createTagGroup;    
    exports.duplicateTagGroup                       = duplicateTagGroup;    
    exports.createLocation                          = createLocation;   
    exports.editLocation                            = editLocation; 
    exports.deleteLocation                          = deleteLocation;
    exports.getLocation                             = getLocation;  
    exports.updateSettingMozillaPreferences         = updateSettingMozillaPreferences;  
    exports.loadSettingsLocalStorage                = loadSettingsLocalStorage; 
    exports.loadDefaultSettings                     = loadDefaultSettings;
    exports.saveSettings                            = saveSettings; 

});