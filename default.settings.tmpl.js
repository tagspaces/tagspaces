/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
define(function (require, exports, module) {
    "use strict";

    exports.defaultSettings = {
        "appName":                  "@@APPNAME",
        "appVersion":               "@@VERSION",
        "appBuild":                 "@@BUILD",
        "appBuildID":               "@@BID",
        "settingsVersion":           2,
        "newTextFileContent":       "",
        "newHTMLFileContent":       "<!DOCTYPE html><html><head><!-- Created with @@APPNAME @@VERSION.@@BUILD --><meta http-equiv='Content-Type' content='text/html; charset=utf-8'><style type='text/css'>body{overflow:auto;width:100%;height:100%;font:13.34px Ubuntu,arial,clean,sans-serif;color:#000;line-height:1.4em;background-color:#fff;padding:15px}p{margin:1em 0;line-height:1.5em}table{font:100%;margin:1em}table th{border-bottom:1px solid #bbb;padding:.2em 1em}table td{border-bottom:1px solid #ddd;padding:.2em 1em}input[type=image],input[type=password],input[type=text],textarea{font:99% helvetica,arial,freesans,sans-serif}option,select{padding:0 .25em}optgroup{margin-top:.5em}code,pre{font:12px Monaco,'Courier New','DejaVu Sans Mono','Bitstream Vera Sans Mono',monospace}pre{margin:1em 0;font-size:12px;background-color:#eee;border:1px solid #ddd;padding:5px;line-height:1.5em;color:#444;overflow:auto;-webkit-box-shadow:rgba(0,0,0,.07) 0 1px 2px inset;-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px}pre code{padding:0;font-size:12px;background-color:#eee;border:none}code{font-size:12px;background-color:#f8f8ff;color:#444;padding:0 .2em;border:1px solid #dedede}img{border:0;max-width:100%}abbr{border-bottom:none}a{color:#4183c4;text-decoration:none}a:hover{text-decoration:underline}a code,a:link code,a:visited code{color:#4183c4}h2,h3{margin:1em 0}h1,h2,h3,h4,h5,h6{border:0}h1{font-size:170%;border-top:4px solid #aaa;padding-top:.5em;margin-top:1.5em}h1:first-child{margin-top:0;padding-top:.25em;border-top:none}h2{font-size:150%;margin-top:1.5em;border-top:4px solid #e0e0e0;padding-top:.5em}h3{font-size:130%;margin-top:1em}h4{font-size:120%;margin-top:1em}h5{font-size:115%;margin-top:1em}h6{font-size:110%;margin-top:1em}hr{border:1px solid #ddd}ol,ul{margin:1em 0 1em 2em}ol li,ul li{margin-top:.5em;margin-bottom:.5em}ol ol,ol ul,ul ol,ul ul{margin-top:0;margin-bottom:0}blockquote{margin:1em 0;border-left:5px solid #ddd;padding-left:.6em;color:#555}dt{font-weight:700;margin-left:1em}dd{margin-left:2em;margin-bottom:1em}</style></head><body></body></html>",
        "newMDFileContent":         '',
        "showUnixHiddenEntries":    false,
        "checkForUpdates":          true,
        "firstRun":                 true,
        "lastOpenedDirectory":      "",
        "tagspacesList":            [@@DEFAULTLOCATIONS], // [{"name":"Demo","path":"/owncloud/remote.php/webdav/Demo","perspective":"perspectiveList","isDefault":true}],
        "searchQueryList":          [],
        "extensionsPath":           "ext",
        "showWarningRecursiveScan": true,
        "prefixTagContainer":       "",
        "tagDelimiter":             " ",
        "calculateTags":            false,
        "loadLocationMeta":         false,
        "useSearchInSubfolders":    true,
        "maxSearchResultCount":     400,
        "isWindowMaximized":        false,
        "showMainMenu":             false,
        "lastOpenedLocation":       "", // "/owncloud/remote.php/webdav/Demo",
        "useDefaultLocation":       false,
        "coloredFileExtensionsEnabled": true,
        "showTagAreaOnStartup":     false,
        "writeMetaToSidecarFile":   false,
        "enableMetaData":           false,
        "webDavPath"  :             "oc/remote.php/webdav",
        "ootbPerspectives":         [@@DEFAULTPERSPECTIVES],
        "ootbViewers":              [ "viewerBrowser", "viewerMD", "viewerImage", "viewerPDF", "editorText", "viewerText", "editorODF", "viewerURL", "viewerHTML", "viewerMHTML", "editorJSON", "viewerZIP", "viewerEPUB", "viewerAudioVideo" ],
        "ootbEditors":              [ "editorHTML", "editorText", "editorODF", "editorJSON", "editorNext" ],
        "perspectives":             [@@ACTIVATEDPERSPECTIVES],
        "interfaceLanguage":        "en_US",
        "writeTagsToFile":          false,
        "useTrashCan":              true,
        "useOCR":                   false,
        "useTextExtraction":        false,
        "useGenerateThumbnails":    false,
        "defaultThumbnailSize":     "400",
        "availableThumbnailSizes":  [ "100", "200", "400", "600", "1000"],
        "defaultThumbnailFormat":   "png",
        "availableThumbnailFormat": ["png", "jpeg"],
        "watchCurrentDirectory":    false,
        "defaultTagTextColor":     "#ffffff",
        "defaultTagColor":         "#008000",
        "supportedLanguages": [
            { "iso": "en_US", "title": "English" },
            { "iso": "de_DE", "title": "Deutsch (German)" },
            { "iso": "it", "title": "Italiano (Italian)" },
            { "iso": "zh_CN", "title": "中国的 (Chinese)" },
            { "iso": "bg", "title": "Български (Bulgarian)" },
            { "iso": "ja", "title": "日本の (Japanese)" },
            { "iso": "pt_BR", "title": "Português (Brazil)" },
            { "iso": "pt_PT", "title": "Português (Portugal)" },
            { "iso": "fr", "title": "Français (French)" },
            { "iso": "sk_SK", "title": "Slovenský (Slovak)" },
            { "iso": "es", "title": "Español (Spanish)" },
            { "iso": "uk", "title": "Український (Ukrainian)" },
            { "iso": "ru", "title": "Русский (Russian)" },
            { "iso": "tr", "title": "Türk (Turkish)" },
            { "iso": "cs", "title": "Čeština (Czech)" },
            { "iso": "ca", "title": "Catalan (Català)" },
            { "iso": "ko", "title": "한국의 (Korean)" },
            { "iso": "el", "title": "ελληνικά (Greek)" },
            { "iso": "sv", "title": "svenska (Swedish)" },
            { "iso": "nl_NL", "title": "Nederlands (Dutch)" },
            { "iso": "zh_TW", "title": "台灣 (Chinese Taiwan BIG5)" },
            { "iso": "hu", "title": "Magyar (Hungarian)" },
            { "iso": "id_ID", "title": "bahasa Indonesia (Indonesian)" },
            { "iso": "pl", "title": "Polski (Polish)" },
            { "iso": "mt", "title": "Maltese (Maltese)" },
            { "iso": "hy", "title": "հայերեն (Armenian)" },
        ],
        "keyBindings": {
            "selectAll": "mod+a",
            "closeViewer": "mod+w",
            "saveDocument": "mod+s",
            "reloadDocument": "mod+r",
            "editDocument": "mod+e",
            "deleteDocument": "del",
            "showTagLibrary": "s t",
            "showFolderNavigator": "s f",
            "toggleShowHiddenEntries": "mod+h",
            "addRemoveTags": "mod+t",
            "propertiesDocument": "alt+enter",
            "nextDocument": ['right', 'down'],
            "prevDocument": ['left', 'up'],
            "showHelp": "f1",
            "renameFile": "f2",
            "reloadApplication": "r a",
            "toggleFullScreen": "f11",
            "openDevTools": "f12",
            "openSearch": "mod+f",
            "openFile": "enter",
            "openFileExternally": "ctrl+enter"
        },
        "supportedFileTypes": [
            { "type": "jpg", "viewer": "viewerImage", "editor": "false" },
            { "type": "jpeg", "viewer": "viewerImage", "editor": "false" },
            { "type": "gif", "viewer": "viewerImage", "editor": "false" },
            { "type": "png", "viewer": "viewerImage", "editor": "false" },
            { "type": "webp", "viewer": "viewerImage", "editor": "false" },
            { "type": "bmp", "viewer": "viewerImage", "editor": "false" },
            { "type": "ico", "viewer": "viewerImage", "editor": "false" },
            { "type": "svg", "viewer": "viewerImage", "editor": "editorText" },
            { "type": "pdf", "viewer": "@@PDFVIEWER", "editor": "false" },
            { "type": "epub", "viewer": "viewerEPUB", "editor": "false" },
            { "type": "html", "viewer": "viewerHTML", "editor": "editorHTML" },
            { "type": "htm", "viewer": "viewerHTML", "editor": "editorHTML" },
            { "type": "xhtml", "viewer": "viewerHTML", "editor": "editorText" },
            { "type": "eml", "viewer": "@@MHTVIEWER", "editor": "false" },
            { "type": "mht", "viewer": "@@MHTVIEWER", "editor": "false" },
            { "type": "mhtml", "viewer": "@@MHTVIEWER", "editor": "false" },
            { "type": "odt", "viewer": "editorODF", "editor": "false" },
            { "type": "ods", "viewer": "editorODF", "editor": "false" },
            { "type": "odp", "viewer": "editorODF", "editor": "false" },
            { "type": "odg", "viewer": "editorODF", "editor": "false" },
            { "type": "txt", "viewer": "editorText", "editor": "editorText" },
            { "type": "xml", "viewer": "editorText", "editor": "editorText" },
            { "type": "js", "viewer": "editorText", "editor": "editorText" },
            { "type": "json", "viewer": "editorJSON", "editor": "editorJSON" },
            { "type": "css", "viewer": "editorText", "editor": "editorText" },
            { "type": "h", "viewer": "editorText", "editor": "editorText" },
            { "type": "c", "viewer": "editorText", "editor": "editorText" },
            { "type": "clj", "viewer": "editorText", "editor": "editorText" },
            { "type": "coffee", "viewer": "editorText", "editor": "editorText" },
            { "type": "cpp", "viewer": "editorText", "editor": "editorText" },
            { "type": "cs", "viewer": "editorText", "editor": "editorText" },
            { "type": "groovy", "viewer": "editorText", "editor": "editorText" },
            { "type": "haxe", "viewer": "editorText", "editor": "editorText" },
            { "type": "java", "viewer": "editorText", "editor": "editorText" },
            { "type": "jsm", "viewer": "editorText", "editor": "editorText" },
            { "type": "less", "viewer": "editorText", "editor": "editorText" },
            { "type": "lua", "viewer": "editorText", "editor": "editorText" },
            { "type": "ml", "viewer": "editorText", "editor": "editorText" },
            { "type": "mli", "viewer": "editorText", "editor": "editorText" },
            { "type": "pl", "viewer": "editorText", "editor": "editorText" },
            { "type": "php", "viewer": "editorText", "editor": "editorText" },
            { "type": "py", "viewer": "editorText", "editor": "editorText" },
            { "type": "rb", "viewer": "editorText", "editor": "editorText" },
            { "type": "sh", "viewer": "editorText", "editor": "editorText" },
            { "type": "sql", "viewer": "editorText", "editor": "editorText" },
            { "type": "mkd", "viewer": "viewerMD", "editor": "editorText" },
            { "type": "mdwn", "viewer": "viewerMD", "editor": "editorText" },
            { "type": "markdown","viewer": "viewerMD", "editor": "editorText" },
            { "type": "mdown", "viewer": "viewerMD", "editor": "editorText" },
            { "type": "md", "viewer": "viewerMD", "editor": "editorText" },
            { "type": "ogg", "viewer": "viewerAudioVideo", "editor": "false" },
            { "type": "ogv", "viewer": "viewerAudioVideo", "editor": "false" },
            { "type": "oga", "viewer": "viewerAudioVideo", "editor": "false" },
            { "type": "ogx", "viewer": "viewerAudioVideo", "editor": "false" },
            { "type": "spx", "viewer": "viewerAudioVideo", "editor": "false" },
            { "type": "opus", "viewer": "viewerAudioVideo", "editor": "false" },
            { "type": "wav", "viewer": "viewerAudioVideo", "editor": "false" },
            { "type": "wave", "viewer": "viewerAudioVideo", "editor": "false" },
            { "type": "webm", "viewer": "viewerAudioVideo", "editor": "false" },
            { "type": "desktop", "viewer": "viewerURL", "editor": "false" },
            { "type": "website", "viewer": "viewerURL", "editor": "false" },
            { "type": "url", "viewer": "viewerURL", "editor": "false" },
            { "type": "zip", "viewer": "viewerZIP", "editor": "false" }
        ],
        "tagGroups": [
            {
                "title":"Common Tags",
                "isFolder": "true",
                "key":"OTB",
                "expanded": "true",
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
                "expanded": "true",
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
            }
        ]
    };
});