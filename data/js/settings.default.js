/* Copyright (c) 2012-2014 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function (require, exports, module) {
    "use strict";

    exports.defaultSettings = {
        "appName": "TagSpaces",
        "appVersion": "1.8",
        "appBuild": "1",
        "appBuildID": "201405131358",
        "settingsVersion": 2,
        "newTextFileContent": "Created with TagSpaces",
        "newHTMLFileContent": "<html><head><title>Created with TagSpaces</title><meta http-equiv='Content-Type' content='text/html; charset=utf-8'></head><body></body></html>",
        "newMDFileContent": '#Created with TagSpaces',
        "showUnixHiddenEntries": false,
        "checkForUpdates": true,
        "firstRun": true,
        "lastOpenedDirectory": "",
        "tagspacesList": [],
        "extensionsPath": "ext",
        "showWarningRecursiveScan": true,
        "prefixTagContainer": "",
        "tagDelimiter": " ",
        "calculateTags": false,
        "warnIncludeSubdirs": true,
        "isWindowMaximized": false,
        "showMainMenu": true,
        "lastOpenedLocation": "",
        "ootbPerspectives": ['perspectiveList', 'perspectiveGrid', 'perspectiveGraph'],
        "ootbViewers": [ "viewerBrowser", "viewerMD", "viewerImage", "viewerPDF", "editorText", "viewerText", "editorODF"  ],
        "ootbEditors": [ "editorHTML", "editorText", "editorODF" ],
        "perspectives": [
            { "id": "perspectiveList" }, // ID should be equal to the directory name where the extension is located
            { "id": "perspectiveGrid" }
        ],
        "interfaceLanguage": "en",
        "supportedLanguages": [
            { "iso": "en",	    "title": "English" },
            { "iso": "de",	    "title": "Deutsch (German)" },
            { "iso": "it",	    "title": "Italiano (Italian)" },
            { "iso": "zh-CN",	"title": "中国的 (Chinese)" },
            { "iso": "bg",  	"title": "Български (Bulgarian - started)" },
            { "iso": "ru",	    "title": "Русский (Russian - help needed)" },
            { "iso": "pt",	    "title": "Português (Portuguese - help needed)" },
            { "iso": "es",	    "title": "Español (Spanish - help needed)" },
            { "iso": "fr",	    "title": "Français (French - help needed)" }
        ],
        "keyBindings": {
            "closeViewer":              "mod+w",
            "saveDocument":             "mod+s",
            "reloadDocument":           "mod+r",
            "deleteDocument":           "del",
            "showTagLibrary":           "s t",
            "showFolderNavigator":      "s f",
            "toggleShowHiddenEntries":  "mod+h",
            "addRemoveTags":            "mod+t",
            "propertiesDocument":       "alt+enter",
            "nextDocument":             ['right', 'down'],
            "prevDocument":             ['left', 'up'],
            "showHelp":                 "f1",
            "reloadApplication":        "r a",
            "toggleFullScreen":         "f11",
            "openDevTools":             "f12"
        },
        "supportedFileTypes": [
            { "type": "jpg",	"viewer": "viewerImage",     "editor": "false" },
            { "type": "jpeg", 	"viewer": "viewerImage",     "editor": "false" },
            { "type": "gif", 	"viewer": "viewerImage",     "editor": "false" },
            { "type": "png", 	"viewer": "viewerImage",     "editor": "false" },
            { "type": "webp", 	"viewer": "viewerImage",     "editor": "false" },
            { "type": "svg", 	"viewer": "viewerBrowser",   "editor": "editorText" },
            { "type": "pdf", 	"viewer": "viewerBrowser",	 "editor": "false" },
            { "type": "html", 	"viewer": "viewerBrowser",   "editor": "editorHTML" },
            { "type": "htm", 	"viewer": "viewerBrowser",   "editor": "editorHTML" },
            { "type": "xhtml", 	"viewer": "viewerBrowser",   "editor": "editorText" },
            { "type": "mht", 	"viewer": "viewerBrowser",   "editor": "false" },
            { "type": "mhtml", 	"viewer": "viewerBrowser",   "editor": "false" },
            { "type": "odt",    "viewer": "editorODF",       "editor": "false" },
            { "type": "ods",    "viewer": "editorODF",       "editor": "false" },
            { "type": "odp",    "viewer": "editorODF",       "editor": "false" },
            { "type": "odg",    "viewer": "editorODF",       "editor": "false" },
            { "type": "txt", 	"viewer": "editorText",      "editor": "editorText" },
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
                        "type":"plain"
                    },
                    {
                        "title":"paper",
                        "type":"plain"
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
                    }
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
                        "textcolor": "#ffffff",
                        "keyBinding": "t h"
                    },
                    {
                        "type": "plain",
                        "title": "medium",
                        "color": "#ffad46",
                        "textcolor": "#ffffff",
                        "keyBinding": "t m"
                    },
                    {
                        "type": "plain",
                        "title": "low",
                        "color": "#7bd148",
                        "textcolor": "#ffffff",
                        "keyBinding": "t l"
                    }
                ]
            },
            {
                "title": "Ratings",
                "key": "REV",
                "expanded": true,
                "children": [
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