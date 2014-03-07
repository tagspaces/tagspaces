/* Copyright (c) 2012-2014 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";

exports.defaultSettings = {
	"appName": "@@APPNAME",
	"appVersion": "@@VERSION",
    "appBuild": "@@BUILD",
    "appBuildID": "@@BID",
	"settingsVersion": 2,
	"newTextFileContent": "Text file created with TagSpaces!",
    "newHTMLFileContent": "<html><head><title>Created with TagSpaces!</title></head><body>Feel free to change this text...</body></html>",	
	"newMDFileContent": '#Markdown file created with TagSpaces!',
	"showUnixHiddenEntries": false, 
	"checkForUpdates": true,
    "lastOpenedDirectory": "", 
	"tagspacesList": [@@DEFAULTLOCATIONS],
    "extensionsPath": "ext",
    "prefixTagContainer": "",
    "tagDelimiter": " ",
    "calculateTags": false,
    "isWindowMaximized": false,
    "lastOpenedLocation": "",
    "ootbPerspectives": [@@DEFAULTPERSPECTIVES],
    "ootbViewers": [ "viewerBrowser", "viewerMD", "viewerImage", "viewerPDF", "editorText", "viewerText", "editorODF"  ],
    "ootbEditors": [ "editorHTML", "editorText", "editorODF" ],        
    "perspectives": [
        { "id": "perspectiveList" }, // ID should be equal to the directory name where the extension is located 
        { "id": "perspectiveGrid" }// ID should be equal to the directory name where the extension is located	        
    ],
    "supportedFileTypes": [
        { "type": "jpg",	"viewer": "viewerImage",     "editor": "false" },        
        { "type": "jpeg", 	"viewer": "viewerImage",     "editor": "false" },    
        { "type": "gif", 	"viewer": "viewerImage",     "editor": "false" },        
        { "type": "png", 	"viewer": "viewerImage",     "editor": "false" },        
        { "type": "svg", 	"viewer": "viewerBrowser",   "editor": "editorText" },
        { "type": "pdf", 	"viewer": "@@PDFVIEWER",	 "editor": "false" },                
        { "type": "html", 	"viewer": "viewerBrowser",   "editor": "editorHTML" },                        
        { "type": "htm", 	"viewer": "viewerBrowser",   "editor": "editorHTML" },                        
        { "type": "xhtml", 	"viewer": "viewerBrowser",   "editor": "editorText" },                        
        { "type": "mht", 	"viewer": "viewerBrowser",   "editor": "false" },                        
        { "type": "mhtml", 	"viewer": "viewerBrowser",   "editor": "false" },
        { "type": "odt",    "viewer": "editorODF",       "editor": "false" },                                             
        { "type": "ods",    "viewer": "editorODF",       "editor": "false" },          
        { "type": "odp",    "viewer": "editorODF",       "editor": "false" },          
        { "type": "odg",    "viewer": "editorODF",       "editor": "false" },                          
        { "type": "txt", 	"viewer": "viewerBrowser",   "editor": "editorText" },
        { "type": "xml", 	"viewer": "editorText",      "editor": "editorText" },
        { "type": "js", 	"viewer": "editorText",      "editor": "editorText" },
        { "type": "json",   "viewer": "editorText",      "editor": "editorText" },
        { "type": "url",    "viewer": "editorText",      "editor": "editorText" },
        { "type": "css", 	"viewer": "editorText",      "editor": "editorText" },
        { "type": "h", 		"viewer": "editorText",      "editor": "editorText" },
        { "type": "c", 		"viewer": "editorText",      "editor": "editorText" },
        { "type": "clj", 	"viewer": "editorText",      "editor": "editorText" },
        { "type": "coffee", "viewer": "editorText",      "editor": "editorText" },
        { "type": "cpp", 	"viewer": "editorText",      "editor": "editorText" },
        { "type": "cs", 	"viewer": "editorText",      "editor": "editorText" },                
        { "type": "groovy", "viewer": "editorText",      "editor": "editorText" },
        { "type": "haxe", 	"viewer": "editorText",      "editor": "editorText" },
        { "type": "java", 	"viewer": "editorText",      "editor": "editorText" },
        { "type": "jsm", 	"viewer": "editorText",      "editor": "editorText" },
        { "type": "less", 	"viewer": "editorText",      "editor": "editorText" },
        { "type": "lua", 	"viewer": "editorText",      "editor": "editorText" },
        { "type": "ml", 	"viewer": "editorText",      "editor": "editorText" },
        { "type": "mli", 	"viewer": "editorText",      "editor": "editorText" },
        { "type": "pl", 	"viewer": "editorText",      "editor": "editorText" },
        { "type": "php", 	"viewer": "editorText",      "editor": "editorText" },
        { "type": "py", 	"viewer": "editorText",      "editor": "editorText" },
        { "type": "rb", 	"viewer": "editorText",      "editor": "editorText" },
        { "type": "sh", 	"viewer": "editorText",      "editor": "editorText" },                                                
        { "type": "sql", 	"viewer": "editorText",      "editor": "editorText" },
        { "type": "mkd", 	"viewer": "viewerMD",        "editor": "editorText" },        
        { "type": "mdwn", 	"viewer": "viewerMD",        "editor": "editorText" },                                               
        { "type": "markdown","viewer": "viewerMD",       "editor": "editorText" },
        { "type": "mdown", 	"viewer": "viewerMD",        "editor": "editorText" },                
        { "type": "md", 	"viewer": "viewerMD",        "editor": "editorText" },
        { "type": "avi", 	"viewer": "viewerBrowser",   "editor": "false" },                
        { "type": "ogg", 	"viewer": "viewerBrowser",   "editor": "false" },                
        { "type": "ogv", 	"viewer": "viewerBrowser",   "editor": "false" },                
        { "type": "oga", 	"viewer": "viewerBrowser",   "editor": "false" },                                        
        { "type": "ogx", 	"viewer": "viewerBrowser",   "editor": "false" },                
        { "type": "spx", 	"viewer": "viewerBrowser",   "editor": "false" },                
        { "type": "opus", 	"viewer": "viewerBrowser",   "editor": "false" },                                        
        { "type": "mp3", 	"viewer": "viewerBrowser",   "editor": "false" },                
        { "type": "mp4", 	"viewer": "viewerBrowser",   "editor": "false" },                
        { "type": "m4p", 	"viewer": "viewerBrowser",   "editor": "false" },                                        
        { "type": "wav", 	"viewer": "viewerBrowser",   "editor": "false" },                
        { "type": "wave", 	"viewer": "viewerBrowser",   "editor": "false" },                
        { "type": "webm", 	"viewer": "viewerBrowser",   "editor": "false" },                                        
        { "type": "m4v", 	"viewer": "viewerBrowser",   "editor": "false" },                
        { "type": "m4a", 	"viewer": "viewerBrowser",   "editor": "false" },                
        { "type": "mov", 	"viewer": "viewerBrowser",   "editor": "false" }  
    ],
	"tagGroups": [
		{
		    "title":"Common Tags",
		    "isFolder": "true",
		    "key":"OTB",
		    "expand": "true",
		    "children":[
		        {
		            "title":"book",
		            "type":"plain",
		        },        
		        {
		            "title":"paper",
		            "type":"plain",
		        }
		    ]
		},		
		{
		    "title":"Getting Things Done",
		    "isFolder": "true",
		    "key":"GTD",
		    "expand": "true",
		    "children":[
		        {
		            "title":"done",
		            "type":"plain"
		        },        
		        {
		            "title":"next",
		            "type":"plain"
		        },
		        {
		            "title":"maybe",
		            "type":"plain"
		        },
		        {
		            "title":"waiting",
		            "type":"plain"
		        }
		    ]
		},
        {
            "title": "Smart Tags",
            "key": "SMR",
            "expanded": true,
            "children": [
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
                },                    
           /*     {
                    "type":          "smart",
                    "title":         "here",
                    "functionality": "here",
                    "desciption":    "Adds the current location as tag",
                    "color":         "#ff7537",
                    "textcolor":     "#ffffff"
                },*/                                                            
            ]
        },   
        {
            "title": "Priorities",
            "key": "PRI",            
            "expanded": true,
            "children": [
                {
                    "type": "plain",
                    "title": "high",
                    "color": "#ff7537",
                    "textcolor": "#ffffff"
                },
                {
                    "type": "plain",
                    "title": "medium",
                    "color": "#ffad46",
                    "textcolor": "#ffffff"
                },
                {
                    "type": "plain",
                    "title": "low",
                    "color": "#7bd148",
                    "textcolor": "#ffffff"
                }
            ]
        },   
        {
            "title": "Tags in Perspective",
            "key": "CTG",            
            "expanded": true,
            "children": []
        }
	]
};

});