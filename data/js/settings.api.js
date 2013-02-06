/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
console.debug("Loading SettingsAPI.js..");

var TSSETTINGS = (typeof TSSETTINGS == "object" && TSSETTINGS != null) ? TSSETTINGS : {};


TSSETTINGS.TagTemplate = {
	"title" : undefined,
	"type" : "plain",
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
}


TSSETTINGS.FavoriteTemplate = {
                            "name": undefined,
                            "path": undefined
                        }
                        
TSSETTINGS.TagGroupTemplate = {
            "title": undefined,
            "isFolder": true,
            "key": undefined,
            "expand": true,
            "noLink": false,
            "children": []
        }

TSSETTINGS.DefaultSettings = {
	"appName": "@APPNAME@",
	"appVersion": "@VERSION@beta",
    "appBuild": "@VERSION@.@BUILD@",
	"settingsVersion": 1,
    "supportedFileTypeThumnailing": ['jpg','jpeg','png','gif'],
	"newTextFileContent": "Text file created with tagspaces!",
    "newHTMLFileContent": "<html><head><meta http-equiv='content-type' content='text/html; charset=utf-8'><title>Tagspaces File</title></head><body>File created with tagspaces!</body></html>",	
	"newMDFileContent": '#File created with tagspaces!',
	"showUnixHiddenEntries": false, 
	"lastOpenedTSID": 0,
    "lastOpenedDirectory": "",
	"tagspacesList": [
        {
            "name":'Windows Location', 
            "path":'Z:\\' 
        }, 
        {
            "name":'Unix Location', 
            "path":'/media' 
        }, 
	],
    "extensionsPath": "file:///C:/TagSpaces/extensions",
    "extensions": [
        {   
            "id": "viewRiver", // ID should be equal to the directory name where the ext. is located 
            "enabled": false, 
            "type": "view", 
        },
        {   
            "id": "viewThumb", // ID should be equal to the directory name where the ext. is located 
            "enabled": true, 
            "type": "view", 
        },
    ],
    "supportedFileTypes": [
        { "type": "jpg", "viewer": "viewerBrowser", "editor": false  },        
        { "type": "jpeg", "viewer": "viewerBrowser", "editor": false  },    
        { "type": "gif", "viewer": "viewerBrowser", "editor": false  },        
        { "type": "png", "viewer": "viewerBrowser", "editor": false  },        
        { "type": "svg", "viewer": "viewerBrowser", "editor": false  },
        { "type": "pdf", "viewer": "viewerBrowser", "editor": false  },                
        { "type": "html", "viewer": "viewerBrowser", "editor": false  },                        
        { "type": "htm", "viewer": "viewerBrowser", "editor": false  },                        
        { "type": "mht", "viewer": "viewerBrowser", "editor": false  },                        
        { "type": "mhtml", "viewer": "viewerBrowser", "editor": false  },                                
        { "type": "maff", "viewer": "viewerBrowser", "editor": false  },                                
        { "type": "txt", "viewer": "viewerBrowser", "editor": false  },
        { "type": "js", "viewer": false, "editor": false  },
        { "type": "css", "viewer": false, "editor": false  },
        { "type": "mdown", "viewer": false, "editor": false  },                
        { "type": "md", "viewer": false, "editor": false  }
    ],
	"tagGroups": [
		{
		    "title":"Common Tags",
		    "isFolder": true,
		    "key":"OTB",
		    "expand": true,
		    "children":[
		        {
		            "title":"book",
		            "type":"plain",
		        },        
		        {
		            "title":"paper",
		            "type":"plain",
		        },
		        {
		            "title":"XEUR",
		            "type":"plain",
		        },
		        {
		            "title":"201XMMDD",
		            "type":"plain",
		        }
		    ]
		}			
	]
}

TSSETTINGS.Settings = undefined;

//TSSETTINGS.DummyDirlistTree = [
//{"title":"2009","isFolder":true,"isLazy":true,"key":"z:\\Chronique\\2009"},
//{"title":"2010","isFolder":true,"isLazy":true,"key":"z:\\Chronique\\2010"},
//];

TSSETTINGS.upgradeSettings = function() {
	if(TSSETTINGS.Settings["appBuild"].localeCompare(TSSETTINGS.DefaultSettings["appBuild"]) < 0) {
		console.debug("Upgrading settings");
		TSSETTINGS.Settings["extensions"] = TSSETTINGS.DefaultSettings["extensions"];
		TSSETTINGS.Settings["appVersion"] = TSSETTINGS.DefaultSettings["appVersion"];
		TSSETTINGS.Settings["appBuild"] = TSSETTINGS.DefaultSettings["appBuild"];
		TSSETTINGS.getExtensions();
		TSSETTINGS.getExtensionPath();
    	TSSETTINGS.saveSettings();   		
	}
}

TSSETTINGS.getExtensions = function() {
	if(TSSETTINGS.Settings["extensions"] == null) {
		TSSETTINGS.Settings["extensions"] = TSSETTINGS.DefaultSettings["extensions"];
	}
    return TSSETTINGS.Settings["extensions"];
}

TSSETTINGS.getExtensionPath = function() {
	if(TSSETTINGS.Settings["extensionsPath"] == null) {
		TSSETTINGS.Settings["extensionsPath"] = TSSETTINGS.DefaultSettings["extensionsPath"];
	}
    return TSSETTINGS.Settings["extensionsPath"];
}

TSSETTINGS.getNewTextFileContent = function() {
    return TSSETTINGS.Settings["newTextFileContent"];
}

TSSETTINGS.getNewHTMLFileContent = function() {
    return TSSETTINGS.Settings["newHTMLFileContent"];
}

TSSETTINGS.getNewMDFileContent = function() {
    return TSSETTINGS.Settings["newMDFileContent"];
}

TSSETTINGS.getSupportedFileExt4Thumbnailing = function() {
    return TSSETTINGS.Settings["supportedFileTypeThumnailing"];
}

TSSETTINGS.getFileTypeEditor = function(fileTypeExt) {
    for(var i=0; i < TSSETTINGS.Settings["supportedFileTypes"].length; i++) {
        if(TSSETTINGS.Settings["supportedFileTypes"][i].type == fileTypeExt) {
             return TSSETTINGS.Settings["supportedFileTypes"][i].editor;
        }        
    }
    return false;   
}

TSSETTINGS.getFileTypeViewer = function(fileTypeExt) {
    for(var i=0; i < TSSETTINGS.Settings["supportedFileTypes"].length; i++) {
        if(TSSETTINGS.Settings["supportedFileTypes"][i].type == fileTypeExt) {
             return TSSETTINGS.Settings["supportedFileTypes"][i].viewer;
        }        
    }
    return false;   
}

TSSETTINGS.findTag = function(tagName, tagGroupKey) {
    for(var i=0; i < TSSETTINGS.Settings["tagGroups"].length; i++) {
        if(TSSETTINGS.Settings["tagGroups"][i].key == tagGroupKey) {
            // console.debug("Current taggroup "+TSSETTINGS.Settings["tagGroups"][i].key);
            for(var j=0; j < TSSETTINGS.Settings["tagGroups"][i]["children"].length; j++) {
                // console.debug("Current tagname "+TSSETTINGS.Settings["tagGroups"][i]["children"][j].title);
                if(TSSETTINGS.Settings["tagGroups"][i]["children"][j].title == tagName) {
                    return TSSETTINGS.Settings["tagGroups"][i]["children"][j];
                }
            }
        }        
    }
    return false;   
}

TSSETTINGS.getAllTags = function() {
    var allTags = [];
    for(var i=0; i < TSSETTINGS.Settings["tagGroups"].length; i++) {
        // console.debug("Current taggroup "+TSSETTINGS.Settings["tagGroups"][i].key);
        for(var j=0; j < TSSETTINGS.Settings["tagGroups"][i]["children"].length; j++) {
            // console.debug("Current tagname "+TSSETTINGS.Settings["tagGroups"][i]["children"][j].title);
            if(TSSETTINGS.Settings["tagGroups"][i]["children"][j].type == "plain") {
                allTags.push(TSSETTINGS.Settings["tagGroups"][i]["children"][j].title);
            }
        }
    }
    return allTags;   
}

TSSETTINGS.setLastOpenedDir = function(directory) {
    TSSETTINGS.Settings["lastOpenedDirectory"] = directory;
    TSSETTINGS.saveSettings();    
}

TSSETTINGS.getLastOpenedDir = function() {
    return TSSETTINGS.Settings["lastOpenedDirectory"]; 
}

TSSETTINGS.deleteTag = function(tagData) {
    for(var i=0; i < TSSETTINGS.Settings["tagGroups"].length; i++) {
        if(TSSETTINGS.Settings["tagGroups"][i].key == tagData.parentKey) {
            for(var j=0; j < TSSETTINGS.Settings["tagGroups"][i]["children"].length; j++) {
                if(TSSETTINGS.Settings["tagGroups"][i]["children"][j].title == tagData.title) {
                    TSSETTINGS.Settings["tagGroups"][i]["children"].splice(j, 1);
                    break;
                }
            }
        }        
    }  
    TSSETTINGS.saveSettings();    
}

TSSETTINGS.getTagData = function(tagTitle, parentKey) {
    for(var i=0; i < TSSETTINGS.Settings["tagGroups"].length; i++) {
        if(TSSETTINGS.Settings["tagGroups"][i].key == parentKey) {
            for(var j=0; j < TSSETTINGS.Settings["tagGroups"][i]["children"].length; j++) {
                if(TSSETTINGS.Settings["tagGroups"][i]["children"][j].title == tagTitle) {
                    return TSSETTINGS.Settings["tagGroups"][i]["children"][j];
                    break;
                }
            }
        }        
    }  
}

TSSETTINGS.getTagGroupData = function(tagGroupKey) {
    for(var i=0; i < TSSETTINGS.Settings["tagGroups"].length; i++) {
        if(TSSETTINGS.Settings["tagGroups"][i].key == tagGroupKey) {
            return TSSETTINGS.Settings["tagGroups"][i];
            break;
        }        
    }  
}

TSSETTINGS.deleteTagGroup = function(tagData) {
    for(var i=0; i < TSSETTINGS.Settings["tagGroups"].length; i++) {
        if(TSSETTINGS.Settings["tagGroups"][i].key == tagData.key) {
            console.debug("Deleting taggroup "+TSSETTINGS.Settings["tagGroups"][i].key);
            TSSETTINGS.Settings["tagGroups"].splice(i, 1);
            break;
        }        
    }  
    TSSETTINGS.saveSettings();    
}

TSSETTINGS.editTag = function(tagData, newTagName) {
    for(var i=0; i < TSSETTINGS.Settings["tagGroups"].length; i++) {
        if(TSSETTINGS.Settings["tagGroups"][i].key == tagData.parentKey) {
            for(var j=0; j < TSSETTINGS.Settings["tagGroups"][i]["children"].length; j++) {
                if(TSSETTINGS.Settings["tagGroups"][i]["children"][j].title == tagData.title) {
                    TSSETTINGS.Settings["tagGroups"][i]["children"][j].title = newTagName;
                    break;
                }
            }
        }        
    }  
    TSSETTINGS.saveSettings();       
}

TSSETTINGS.createTag = function(tagData, newTagName) {
    var newTagModel = JSON.parse( JSON.stringify(TSSETTINGS.TagTemplate));
    newTagModel.title = newTagName;
    for(var i=0; i < TSSETTINGS.Settings["tagGroups"].length; i++) {
        if(TSSETTINGS.Settings["tagGroups"][i].key == tagData.key) {
            console.debug("Creating tag: "+JSON.stringify(newTagModel)+" with parent: "+tagData.key);
            TSSETTINGS.Settings["tagGroups"][i]["children"].push(newTagModel);
            break;
        }        
    }  
    TSSETTINGS.saveSettings();       
}

TSSETTINGS.editTagGroup = function(tagData, tagGroupName) {
    for(var i=0; i < TSSETTINGS.Settings["tagGroups"].length; i++) {
        if(TSSETTINGS.Settings["tagGroups"][i].key == tagData.key) {
            TSSETTINGS.Settings["tagGroups"][i].title = tagGroupName;
            break;
        }        
    }  
    TSSETTINGS.saveSettings();       
}


TSSETTINGS.duplicateTagGroup = function(tagData, tagGroupName, tagGroupKey) {
    var newTagGroupModel = undefined;
    for(var i=0; i < TSSETTINGS.Settings["tagGroups"].length; i++) {
        if(TSSETTINGS.Settings["tagGroups"][i].key == tagData.key) {
            newTagGroupModel = JSON.parse( JSON.stringify(TSSETTINGS.Settings["tagGroups"][i]));
            break;
        }        
    } 
    newTagGroupModel.title = tagGroupName;
    newTagGroupModel.key = tagGroupKey;            
    console.debug("Creating taggroup: "+JSON.stringify(newTagGroupModel)+" with key: "+tagGroupKey);
    TSSETTINGS.Settings["tagGroups"].push(newTagGroupModel);
    TSSETTINGS.saveSettings();       
}

TSSETTINGS.createFavorite = function(name, location) {
    var newFavoriteModel = JSON.parse( JSON.stringify(TSSETTINGS.FavoriteTemplate));
    name = name.replace("\\", "\\\\");
    name = name.replace("\\\\\\", "\\\\");
    name = name.replace("\\\\\\\\", "\\\\");   
    newFavoriteModel.name = name;
    newFavoriteModel.path = location;
    TSSETTINGS.Settings["tagspacesList"].push(newFavoriteModel);
    TSSETTINGS.saveSettings();    
}

TSSETTINGS.deleteFavorite = function(name) {
    for(var i=0; i < TSSETTINGS.Settings["tagspacesList"].length; i++) {
            console.debug("Traversing favorite "+TSSETTINGS.Settings["tagspacesList"][i].name+" searching for "+name);
        if(TSSETTINGS.Settings["tagspacesList"][i].name == name) {
            console.debug("Deleting favorite "+TSSETTINGS.Settings["tagspacesList"][i].name);
            TSSETTINGS.Settings["tagspacesList"].splice(i, 1);
            break;
        }        
    }  
    TSSETTINGS.saveSettings();    
}

TSSETTINGS.updateSettingMozillaPreferences = function(settings) {
    var tmpSettings = JSON.parse(settings);    
    if(tmpSettings != null) {
        TSSETTINGS.Settings = tmpSettings;
        console.debug("Settings loaded from firefox preferences: "+tmpSettings);
    } else {
        TSSETTINGS.Settings = TSSETTINGS.DefaultSettings;
        console.debug('Default settings loaded(Firefox)!');        
    }
    TSSETTINGS.saveSettings();
}

TSSETTINGS.firstRun = false;

TSSETTINGS.loadSettingsLocalStorage = function() {
    try {
        var tmpSettings = JSON.parse(localStorage.getItem('tsSettings'));
        console.debug("Settings: "+JSON.stringify(tmpSettings));        
    	if(tmpSettings!=null) {
    		TSSETTINGS.Settings = tmpSettings;		
    	} else {
    	    // If no settings found in the local storage,
    	    // the application runs for the first time.
    	    TSSETTINGS.firstRun = true;
    	}
    } catch(ex) {
        console.debug("Loading settings from local storage failed due exception: "+ex);
    }
}

// Save setting and Reloads the app
TSSETTINGS.saveSettings = function() {
    // Storing setting in the local storage for mozilla and chorme
	localStorage.setItem('tsSettings', JSON.stringify(TSSETTINGS.Settings));
    
    // Storing settings in mozilla native preferences
    if($.browser.mozilla) {
        IOAPI.saveSettings(JSON.stringify(TSSETTINGS.Settings));
	}
	
	console.debug('Tagspace Settings Saved!');
}
