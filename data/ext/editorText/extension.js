/* Copyright (c) 2013 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";

	console.log("Loading editorText extension");

	exports.id = "editorText"; // ID should be equal to the directory name where the ext. is located   
	exports.title = "Text Editor based on codemirror";
	exports.type = "editor";
	exports.supportedFileTypes = [
            "h", "c", "clj", "coffee", "coldfusion", "cpp",
            "cs", "css", "groovy", "haxe", "htm", "html",
            "java", "js", "jsm", "json", "latex", "less",
            "ly", "ily", "lua", "markdown", "md", "mdown",
            "mdwn", "mkd", "ml", "mli", "pl", "php",
            "powershell", "py", "rb", "scad", "scala",
            "scss", "sh", "sql", "svg", "textile", "txt", "xml"
         ] ;

    var TSCORE = require("tscore");

    var cmEditor = undefined;
    var extensionDirectory = TSCORE.Config.getExtensionPath() + "/" + exports.id;

    var contentLoaded = false;

    exports.init = function (filePath, containerElementID, isViewerMode) {
        console.log("Initalization Text Editor...");
        contentLoaded = false;

        var fileExt = filePath.substring(filePath.lastIndexOf(".") + 1, filePath.length).toLowerCase();

        $("#" + containerElementID).append('<div id="code" style="width: 100%; height: 100%">');
        var mode = filetype[fileExt];
        if (mode == null) {
            mode = "properties";
        }
        require([
                extensionDirectory + '/codemirror/codemirror.js',
                'css!' + extensionDirectory + '/codemirror/codemirror.css',
                'css!' + extensionDirectory + '/extension.css'
        ], function () {
            require([
                    extensionDirectory + "/codemirror/mode/" + mode + "/" + mode + ".js"
            ], function () {
                var cursorBlinkRate = isViewerMode ? -1 : 530; // disabling the blinking cursor in readonly mode

                //var saveKB = convertMouseTrapToCodeMirrorKeyBindings(TSCORE.Config.getSaveDocumentKeyBinding());

                var keys = {};

                keys[convertMouseTrapToCodeMirrorKeyBindings(TSCORE.Config.getSaveDocumentKeyBinding())] = function () {
                    TSCORE.FileOpener.saveFile();
                };

                keys[convertMouseTrapToCodeMirrorKeyBindings(TSCORE.Config.getCloseViewerKeyBinding())] = function () {
                    TSCORE.FileOpener.closeFile();
                };

                cmEditor = CodeMirror(document.getElementById("code"), {
                    fixedGutter: false,
                    mode: mode,
                    lineNumbers: true,
                    lineWrapping: true,
                    tabSize: 2,
                    collapseRange: true,
                    matchBrackets: true,
                    cursorBlinkRate: cursorBlinkRate,
                    readOnly: isViewerMode,
                    autofocus: true,
                    //theme: "lesser-dark",
                    extraKeys: keys
                });

                cmEditor.on("change", function() {
                    if(contentLoaded) {
                        TSCORE.FileOpener.setFileChanged(true);
                    }
                });

                cmEditor.setSize("100%", "100%");
                TSCORE.IO.loadTextFile(filePath);
            });
        });
    };

    // Converts mod+s to Ctrl+S
    function convertMouseTrapToCodeMirrorKeyBindings(keyBinding) {
        if(keyBinding.indexOf("+") < 0) return;
        var key = keyBinding.split("+");
        if(key[0] === "mod") {
            isOSX?key[0]="cmd":key[0]="ctrl";
        }
        key[0] = key[0].charAt(0).toUpperCase() + key[0].slice(1);
        return key[0] + "-" + key[1].toUpperCase();
    }

    exports.viewerMode = function (isViewerMode) {
        cmEditor.readOnly = isViewerMode;
    };

    exports.setContent = function (content) {
        //console.log("Content: "+content);
        var UTF8_BOM = "\ufeff";
        if (content.indexOf(UTF8_BOM) === 0) {
            content = content.substring(1, content.length);
        }
        cmEditor.setValue(content);
        cmEditor.clearHistory();
        contentLoaded = true;
    };

    exports.getContent = function () {
        return cmEditor.getValue();
    };
	
	var filetype = [];
	filetype["h"] = "clike";
	filetype["c"] = "clike";
	filetype["clj"] = "clojure";
	filetype["coffee"] = "coffeescript";
	filetype["cpp"] = "clike";
	filetype["cs"] = "clike";
	filetype["css"] = "css";
	filetype["groovy"] = "groovy";
	filetype["haxe"] = "haxe";
	filetype["htm"] = "xml";
	filetype["html"] = "xml";
	filetype["java"] = "clike";
	filetype["js"] = "javascript";
	filetype["jsm"] = "javascript";
	filetype["json"] = "javascript";
	filetype["less"] = "less";
	filetype["lua"] = "lua";
	filetype["markdown"] = "markdown";
	filetype["md"] = "markdown";
	filetype["mdown"] = "markdown";
	filetype["mdwn"] = "markdown";
	filetype["mkd"] = "markdown";
	filetype["ml"] = "ocaml";
	filetype["mli"] = "ocaml";
	filetype["pl"] = "perl";
	filetype["php"] = "php";
	filetype["py"] = "python";
	filetype["rb"] = "ruby";
	filetype["sh"] = "shell";
	filetype["sql"] = "sql";
	filetype["svg"] = "xml";
	filetype["xml"] = "xml";

});