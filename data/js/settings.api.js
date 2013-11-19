/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";

	console.log("Loading settings.api.js..");
	
	var TSCORE = require("tscore");
	
	exports.DefaultSettings = require("tssettingsdefault").defaultSettings;

	exports.Settings = undefined;
	
	var tagTemplate = {
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
	};
	
	var connectionTemplate = {
                "name": undefined,
                "path": undefined
           };
	                        
	var tagGroupTemplate = {
	            "title": undefined,
	            "key": undefined,
	            "expanded": true,
	            "children": []
	       };

	var firstRun = false;
	
	var upgradeSettings = function() {
        var oldBuildNumber = parseInt(exports.Settings["appBuild"]);
		var newBuildNumber = parseInt(exports.DefaultSettings["appBuild"]); // by @BUILD@ as build number, parse returns NaN
		// Workarround for settings update, please comment for production
		//oldBuildNumber = 1;
		//newBuildNumber = 2;		
		if(oldBuildNumber < newBuildNumber) {
			console.log("Upgrading settings");
			exports.Settings["appVersion"] = exports.DefaultSettings["appVersion"];
			exports.Settings["appBuild"] = exports.DefaultSettings["appBuild"];
			getPerspectiveExtensions();
			getExtensionPath();
			getShowUnixHiddenEntries();
			getCheckForUpdates();
                
            // Upgrade only if build number smaller than 1386
            if(oldBuildNumber <= 1385) {
                addToSettingsArray(exports.Settings["ootbViewers"],"viewerImage");
                addToSettingsArray(exports.Settings["ootbViewers"],"viewerPDF");                      
                addToSettingsArray(exports.Settings["ootbViewers"],"editorText"); 
    
                addToSettingsArray(exports.Settings["ootbEditors"],"editorHTML");
                addToSettingsArray(exports.Settings["ootbEditors"],"editorText");                                   
    
                addTagGroup(
                    { "expanded": true, "title": "Priorities", "key": "PRI", "children": [
                        { "type": "plain", "title": "high", "parentKey": "49138", "color": "#ff7537", "textcolor": "#ffffff"},
                        { "type": "plain", "title": "medium", "parentKey": "49138", "color": "#ffad46", "textcolor": "#ffffff" },
                        { "type": "plain", "title": "low", "parentKey": "49138", "color": "#7bd148", "textcolor": "#ffffff"}
                    ],}
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
                removeFromSettingsArray(exports.Settings["ootbPerspectives"],"perspectiveDefault");
                removeFromSettingsArray(exports.Settings["ootbPerspectives"],"perspectiveThumb");
            	
                addToSettingsArray(exports.Settings["ootbPerspectives"],"perspectiveList");
                addToSettingsArray(exports.Settings["ootbPerspectives"],"perspectiveGrid");                      
                addToSettingsArray(exports.Settings["ootbPerspectives"],"perspectiveGraph"); 

	            removeFromSettingsArrayById(exports.Settings["perspectives"], "perspectiveThumb"); 
	            removeFromSettingsArrayById(exports.Settings["perspectives"], "perspectiveDefault");             

                addToSettingsArray(exports.Settings["perspectives"], { "id": "perspectiveList" }); 
                addToSettingsArray(exports.Settings["perspectives"], { "id": "perspectiveGrid" }); 

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
                    ],}
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
                addFileType({ "type": "oga", 	"viewer": "viewerBrowser", "editor": "false" }); 
                addFileType({ "type": "ogx",    "viewer": "viewerBrowser", "editor": "false" }); 
                addFileType({ "type": "spx",    "viewer": "viewerBrowser", "editor": "false" }); 
                addFileType({ "type": "opus",   "viewer": "viewerBrowser", "editor": "false" }); 
                addFileType({ "type": "mp3", 	"viewer": "viewerBrowser", "editor": "false" }); 
                addFileType({ "type": "mp4",    "viewer": "viewerBrowser", "editor": "false" }); 
                addFileType({ "type": "m4p",    "viewer": "viewerBrowser", "editor": "false" }); 
                addFileType({ "type": "wav",    "viewer": "viewerBrowser", "editor": "false" }); 
                addFileType({ "type": "wave", 	"viewer": "viewerBrowser", "editor": "false" }); 
                addFileType({ "type": "webm",   "viewer": "viewerBrowser", "editor": "false" });                 
                addFileType({ "type": "m4v",    "viewer": "viewerBrowser", "editor": "false" }); 
                addFileType({ "type": "m4a", 	"viewer": "viewerBrowser", "editor": "false" }); 
                addFileType({ "type": "mov",    "viewer": "viewerBrowser", "editor": "false" });                 
			}
			
	    	saveSettings();   		
		}
	};

    var addTagGroup = function(newTagGroup) {
        var tagGroupExist = false;
        exports.Settings["tagGroups"].forEach(function (value, index) {         
            if(value.key == newTagGroup.key) {
                tagGroupExist = true;
            }        
        });  
        if(!tagGroupExist) {
            exports.Settings["tagGroups"].push(newTagGroup);            
        }
    };

    var addFileType = function(newFileType) {
        var fileTypeExist = false;
        exports.Settings["supportedFileTypes"].forEach(function (value, index) {         
            if(value.type == newFileType.type) {
                fileTypeExist = true;
            }        
        });  
        if(!fileTypeExist) {
            exports.Settings["supportedFileTypes"].push(newFileType);            
        }
    };
    
    var updateFileType = function(newFileType) {
        exports.Settings["supportedFileTypes"].forEach(function (value, index) {         
            if(value.type == newFileType.type) {
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
	            if(value.id == id) {
		        	arrayLocation.splice( index, 1 );
	            }        
	        });  
        }        
    };


    var getPerspectiveExtensions = function() {
        if(exports.Settings["ootbPerspectives"] == null) {
            exports.Settings["ootbPerspectives"] = exports.DefaultSettings["ootbPerspectives"];
        }
        return exports.Settings["ootbPerspectives"];
    };

    var getViewerExtensions = function() {
        if(exports.Settings["ootbViewers"] == null) {
            exports.Settings["ootbViewers"] = exports.DefaultSettings["ootbViewers"];
        }
        return exports.Settings["ootbViewers"];
    };
    
    var getEditorExtensions = function() {
        if(exports.Settings["ootbEditors"] == null) {
            exports.Settings["ootbEditors"] = exports.DefaultSettings["ootbEditors"];
        }
        return exports.Settings["ootbEditors"];
    };   
	
	var getPerspectives = function() {
		if(exports.Settings["perspectives"] == null) {
			exports.Settings["perspectives"] = exports.DefaultSettings["perspectives"];
		}
	    return exports.Settings["perspectives"];
	};

    var setPerspectives = function(value) {
        exports.Settings["perspectives"] = value;
    };
	
	var getExtensionPath = function() {
		if(exports.Settings["extensionsPath"] == null) {
			exports.Settings["extensionsPath"] = exports.DefaultSettings["extensionsPath"];
		}
	    return exports.Settings["extensionsPath"];
	};

    var setExtensionPath = function(value) {
        exports.Settings["extensionsPath"] = value;
    };
	
    var getShowUnixHiddenEntries = function() {
        if(exports.Settings["showUnixHiddenEntries"] == null) {
            exports.Settings["showUnixHiddenEntries"] = exports.DefaultSettings["showUnixHiddenEntries"];
        }
        return exports.Settings["showUnixHiddenEntries"];
    };

    var setShowUnixHiddenEntries = function(value) {
        exports.Settings["showUnixHiddenEntries"] = value;
    };
    
    var getCheckForUpdates = function() {
        if(exports.Settings["checkForUpdates"] == null) {
            exports.Settings["checkForUpdates"] = exports.DefaultSettings["checkForUpdates"];
        }
        return exports.Settings["checkForUpdates"];
    };

    var setCheckForUpdates = function(value) {
        exports.Settings["checkForUpdates"] = value;
    };    

    var getSupportedFileTypes = function() {
        if(exports.Settings["supportedFileTypes"] == null) {
            exports.Settings["supportedFileTypes"] = exports.DefaultSettings["supportedFileTypes"];
        }
        return exports.Settings["supportedFileTypes"];
    };

    var setSupportedFileTypes = function(value) {
        exports.Settings["supportedFileTypes"] = value;
    };   
    	
	var getNewTextFileContent = function() {
	    return exports.Settings["newTextFileContent"];
	};
	
	var getNewHTMLFileContent = function() {
	    return exports.Settings["newHTMLFileContent"];
	};
	
	var getNewMDFileContent = function() {
	    return exports.Settings["newMDFileContent"];
	};
	
	var getFileTypeEditor = function(fileTypeExt) {
	    for(var i=0; i < exports.Settings["supportedFileTypes"].length; i++) {
	        if(exports.Settings["supportedFileTypes"][i].type == fileTypeExt) {
	             return exports.Settings["supportedFileTypes"][i].editor;
	        }        
	    }
	    return "false";   
	};
	
	var getFileTypeViewer = function(fileTypeExt) {
	    for(var i=0; i < exports.Settings["supportedFileTypes"].length; i++) {
	        if(exports.Settings["supportedFileTypes"][i].type == fileTypeExt) {
	             return exports.Settings["supportedFileTypes"][i].viewer;
	        }        
	    }
	    return false;   
	};
	
	// Returns the tag information from the setting for a given tag 
	var findTag = function(tagName) {
	    for(var i=0; i < exports.Settings["tagGroups"].length; i++) {
//	        if(exports.Settings["tagGroups"][i].key == tagGroupKey) {
	            for(var j=0; j < exports.Settings["tagGroups"][i]["children"].length; j++) {
	                // console.log("Current tagname "+exports.Settings["tagGroups"][i]["children"][j].title);
	                if(exports.Settings["tagGroups"][i]["children"][j].title == tagName) {
	                    return exports.Settings["tagGroups"][i]["children"][j];
	                }
	            }
//	        }        
	    }
	    return false;   
	};
	
	var getAllTags = function() {
	    var allTags = [];
	    for(var i=0; i < exports.Settings["tagGroups"].length; i++) {
	        // console.log("Current taggroup "+exports.Settings["tagGroups"][i].key);
	        for(var j=0; j < exports.Settings["tagGroups"][i]["children"].length; j++) {
	            // console.log("Current tagname "+exports.Settings["tagGroups"][i]["children"][j].title);
	            if(exports.Settings["tagGroups"][i]["children"][j].type == "plain") {
	                allTags.push(exports.Settings["tagGroups"][i]["children"][j].title);
	            }
	        }
	    }
	    return allTags;   
	};
	
	// Not used
	var setLastOpenedDir = function(directory) {
	    exports.Settings["lastOpenedDirectory"] = directory;
	    saveSettings();    
	};
	
	// Not used
	var getLastOpenedDir = function() {
	    return exports.Settings["lastOpenedDirectory"]; 
	};
	
	var getTagData = function(tagTitle, tagGroupKey) {
	    for(var i=0; i < exports.Settings["tagGroups"].length; i++) {
	        if(exports.Settings["tagGroups"][i].key == tagGroupKey) {
	            for(var j=0; j < exports.Settings["tagGroups"][i]["children"].length; j++) {
	                if(exports.Settings["tagGroups"][i]["children"][j].title == tagTitle) {
	                    return exports.Settings["tagGroups"][i]["children"][j];
	                    break;
	                }
	            }
	        }        
	    }  
	};
	
	var getTagGroupData = function(tagGroupKey) {
	    for(var i=0; i < exports.Settings["tagGroups"].length; i++) {
	        if(exports.Settings["tagGroups"][i].key == tagGroupKey) {
	            return exports.Settings["tagGroups"][i];
	            break;
	        }        
	    }  
	};

	var deleteTagGroup = function(tagData) {
	    for(var i=0; i < exports.Settings["tagGroups"].length; i++) {
	        if(exports.Settings["tagGroups"][i].key == tagData.key) {
	            console.log("Deleting taggroup "+exports.Settings["tagGroups"][i].key);
	            exports.Settings["tagGroups"].splice(i, 1);
	            break;
	        }        
	    }  
	    saveSettings();    
	};
	
	var editTag = function(tagData, newTagName, newColor, newTextColor) {
	    for(var i=0; i < exports.Settings["tagGroups"].length; i++) {
	        if(exports.Settings["tagGroups"][i].key == tagData.parentKey) {
	            for(var j=0; j < exports.Settings["tagGroups"][i]["children"].length; j++) {
	                if(exports.Settings["tagGroups"][i]["children"][j].title == tagData.title) {
	                    exports.Settings["tagGroups"][i]["children"][j].title = newTagName;
                        exports.Settings["tagGroups"][i]["children"][j].color = newColor;
                        exports.Settings["tagGroups"][i]["children"][j].textcolor = newTextColor;                        
	                    break;
	                }
	            }
	        }        
	    }  
	    saveSettings();       
	};

    var deleteTag = function(tagData) {
        for(var i=0; i < exports.Settings["tagGroups"].length; i++) {
            if(exports.Settings["tagGroups"][i].key == tagData.parentKey) {
                for(var j=0; j < exports.Settings["tagGroups"][i]["children"].length; j++) {
                    if(exports.Settings["tagGroups"][i]["children"][j].title == tagData.title) {
                        exports.Settings["tagGroups"][i]["children"].splice(j, 1);
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
        exports.Settings["tagGroups"].forEach(function (value, index) {	        
	        if(value.key == tagData.key) {
	            console.log("Creating tag: "+JSON.stringify(newTagModel)+" with parent: "+tagData.key);
                var tagExistsInGroup = false;
                value["children"].forEach(function (child) {
					if(child.title == newTagName) {
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
                    value["children"].push(newTagModel);
                } else {
                    console.log("Tag with the same name already exist in this group or tag length >= 2");                    	
                }
	        }        
	    });  
	    saveSettings();
	    return true;       
	};
	
	var editTagGroup = function(tagData, tagGroupName) {
	    for(var i=0; i < exports.Settings["tagGroups"].length; i++) {
	        if(exports.Settings["tagGroups"][i].key == tagData.key) {
	            exports.Settings["tagGroups"][i].title = tagGroupName;
	            break;
	        }        
	    }  
	    saveSettings();       
	};
	
	var duplicateTagGroup = function(tagData, tagGroupName, tagGroupKey) {
	    var newTagGroupModel = undefined;
	    for(var i=0; i < exports.Settings["tagGroups"].length; i++) {
	        if(exports.Settings["tagGroups"][i].key == tagData.key) {
	            newTagGroupModel = JSON.parse( JSON.stringify(exports.Settings["tagGroups"][i]));
	            break;
	        }        
	    } 
	    newTagGroupModel.title = tagGroupName;
	    newTagGroupModel.key = tagGroupKey;            
	    console.log("Creating taggroup: "+JSON.stringify(newTagGroupModel)+" with key: "+tagGroupKey);
	    exports.Settings["tagGroups"].push(newTagGroupModel);
	    saveSettings();       
	};

	var createTagGroup = function(tagData, tagGroupName) {
	    var newTagGroupModel =  JSON.parse( JSON.stringify( tagGroupTemplate ) );
	    newTagGroupModel.title = tagGroupName;
	    //newTagGroupModel.children = [];
	    newTagGroupModel.key = ""+getRandomInt(10000,99999);            
	    console.log("Creating taggroup: "+JSON.stringify(newTagGroupModel)+" with key: "+newTagGroupModel.key);
	    exports.Settings["tagGroups"].push(newTagGroupModel);
	    saveSettings();       
	};	
	
	var moveTagGroup = function(tagData, direction) {
        var targetPosition = undefined;
        var currentPosition = undefined;
        exports.Settings["tagGroups"].forEach(function (value, index) {
            if(value.key == tagData.key) {
                currentPosition = index;
            }
        });
        
        if (direction == "up") targetPosition = currentPosition -1;
        if (direction == "down") targetPosition = currentPosition +1;
        
        // Check if target position is within the taggroups array range
        if (targetPosition < 0 || targetPosition >= exports.Settings["tagGroups"].length || targetPosition == currentPosition) {
           return false;
        }
        
        var tmpTagGroup = exports.Settings["tagGroups"][currentPosition];
        exports.Settings["tagGroups"][currentPosition] = exports.Settings["tagGroups"][targetPosition];
        exports.Settings["tagGroups"][targetPosition] = tmpTagGroup;
        saveSettings();
	};		
	
	var createConnection = function(name, location) {
	    var newConnectionModel = JSON.parse( JSON.stringify(connectionTemplate));
	    name = name.replace("\\", "\\\\");
	    name = name.replace("\\\\\\", "\\\\");
	    name = name.replace("\\\\\\\\", "\\\\");   
	    newConnectionModel.name = name;
	    newConnectionModel.path = location;
	    var createLocation = true;
        exports.Settings["tagspacesList"].forEach(function (value, index) {
            // TODO make this check from the ui dialog         
            if(value.path == newConnectionModel.path) {
                TSCORE.showAlertDialog("Selected path is already used by a location!","Duplicated Location Path");
                createLocation = false;
            }        
            if(value.name == newConnectionModel.name) {
                TSCORE.showAlertDialog("Selected location name is already used by a location!","Duplicated Location Name");
                createLocation = false;
            }             
        });  	    
        if(createLocation) {
            exports.Settings["tagspacesList"].push(newConnectionModel);
            saveSettings();                
        }
	};

    var getConnectionName = function(connectionPath) {
        var connectionName = undefined;
        exports.Settings["tagspacesList"].forEach(function (value, index) {
            if(value.path == connectionPath) {
                connectionName = value.name;
            }        
        });          
        if(connectionName != undefined) {
            return connectionName;                
        }
    };	
	
	var deleteConnection = function(name) {
	    for(var i=0; i < exports.Settings["tagspacesList"].length; i++) {
	            console.log("Traversing connections "+exports.Settings["tagspacesList"][i].name+" searching for "+name);
	        if(exports.Settings["tagspacesList"][i].name == name) {
	            console.log("Deleting connections "+exports.Settings["tagspacesList"][i].name);
	            exports.Settings["tagspacesList"].splice(i, 1);
	            break;
	        }        
	    }  
	    saveSettings();    
	};
	
	var updateSettingMozillaPreferences = function(settings) {
	    var tmpSettings = JSON.parse(settings);    
	    if(tmpSettings != null) {
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
	    	if(tmpSettings!=null) {
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
    exports.upgradeSettings               			= upgradeSettings;
    exports.getPerspectives              	        = getPerspectives;
    exports.setPerspectives                         = setPerspectives;
    exports.getExtensionPath              			= getExtensionPath;    
    exports.setExtensionPath                        = setExtensionPath;    
    exports.getShowUnixHiddenEntries                = getShowUnixHiddenEntries;
    exports.setShowUnixHiddenEntries                = setShowUnixHiddenEntries;    
    exports.getCheckForUpdates                      = getCheckForUpdates;
    exports.setCheckForUpdates                      = setCheckForUpdates;    
    exports.getSupportedFileTypes                   = getSupportedFileTypes;
    exports.setSupportedFileTypes                   = setSupportedFileTypes;

    exports.getPerspectiveExtensions                = getPerspectiveExtensions;
    exports.getViewerExtensions                     = getViewerExtensions;
    exports.getEditorExtensions                     = getEditorExtensions;

    exports.getNewTextFileContent                	= getNewTextFileContent;
    exports.getNewHTMLFileContent                	= getNewHTMLFileContent;	
    exports.getNewMDFileContent                		= getNewMDFileContent;	
    exports.getFileTypeEditor                		= getFileTypeEditor;	
    exports.getFileTypeViewer                		= getFileTypeViewer;	
    exports.getAllTags                				= getAllTags;	            

    exports.getTagData                              = getTagData;   
    exports.getTagGroupData                         = getTagGroupData;  

    exports.deleteTag                				= deleteTag;	
    exports.deleteTagGroup                			= deleteTagGroup;	
    exports.editTag                					= editTag;	
    exports.createTag                				= createTag;
    exports.findTag                                 = findTag;
    exports.moveTag                                 = moveTag;	
    exports.editTagGroup                			= editTagGroup;	
    exports.moveTagGroup                            = moveTagGroup;
    exports.createTagGroup                			= createTagGroup;    
    exports.duplicateTagGroup                		= duplicateTagGroup;	
    exports.createConnection                	    = createConnection;	
    exports.deleteConnection                		= deleteConnection;
    exports.getConnectionName                       = getConnectionName;	
    exports.updateSettingMozillaPreferences         = updateSettingMozillaPreferences;	
    exports.loadSettingsLocalStorage                = loadSettingsLocalStorage;	
    exports.loadDefaultSettings                     = loadDefaultSettings;
    exports.saveSettings                			= saveSettings;	

});