/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";

exports.defaultSettings = {
	"appName": "@APPNAME@",
	"appVersion": "@VERSION@",
    "appBuild": "@BUILD@",
	"settingsVersion": 2,
	"newTextFileContent": "File created with TagSpaces!",
    "newHTMLFileContent": "<html><head><title>Created with TagSpaces!</title></head><body>Feel free to change this text...</body></html>",	
	"newMDFileContent": '#Markdown file created with TagSpaces!',
	"showUnixHiddenEntries": false, 
	"checkForUpdates": true,
    "lastOpenedDirectory": "",
	"tagspacesList": [@DEFAULTLOCATIONS@],
    "extensionsPath": "ext",
    "ootbPerspectives": [ 'perspectiveList', 'perspectiveGrid', 'perspectiveGraph' ],
    "ootbViewers": [ "viewerBrowser", "viewerMD", "viewerImage", "viewerPDF", "editorText" ],
    "ootbEditors": [ "editorHTML", "editorText" ],        
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
        { "type": "pdf", 	"viewer": "@PDFVIEWER@",	 "editor": "false" },                
        { "type": "html", 	"viewer": "viewerBrowser",   "editor": "editorHTML" },                        
        { "type": "htm", 	"viewer": "viewerBrowser",   "editor": "editorHTML" },                        
        { "type": "mht", 	"viewer": "viewerBrowser",   "editor": "false" },                        
        { "type": "mhtml", 	"viewer": "viewerBrowser",   "editor": "false" },                                
        { "type": "txt", 	"viewer": "viewerBrowser",   "editor": "editorText" },
        { "type": "xml", 	"viewer": "editorText",      "editor": "editorText" },
        { "type": "js", 	"viewer": "editorText",      "editor": "editorText" },
        { "type": "json",   "viewer": "editorText",      "editor": "editorText" },
        { "type": "url",    "viewer": "editorText",      "editor": "editorText" },
        { "type": "css", 	"viewer": "editorText",      "editor": "editorText" },
        { "type": "mdown", 	"viewer": "viewerMD",        "editor": "editorText" },                
        { "type": "md", 	"viewer": "viewerMD",        "editor": "editorText" }
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
		        },
		        {
		            "title":"201XMMDD",
		            "type":"plain",
		        }
		    ]
		},		
		{
		    "title":"GTD",
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
            ],
            "title": "Priorities",
            "key": "PRI"
        }						
	]
};

});