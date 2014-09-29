/* Copyright (c) 2014 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";

    console.log("Loading editorJSON");
    exports.id = "editorJSON"; // ID should be equal to the directory name where the ext. is located
    exports.title = "JSON Editor";
    exports.type = "editor";
    exports.supportedFileTypes = [ "json" ];

    var TSCORE = require("tscore");

    var jsonEditor;

    var extensionsPath = TSCORE.Config.getExtensionPath();

    var extensionDirectory = extensionsPath+"/"+exports.id;

    var currentContent;
    var currentFilePath;

    exports.init = function(filePath, containerElementID, isViewer) {
        console.log("Initalization JSON Editor...");
        currentFilePath = filePath;
        require([
            extensionDirectory+'/jsoneditor/jsoneditor.js',
            'css!'+extensionDirectory+'/jsoneditor/jsoneditor.css',
            'css!'+extensionDirectory+'/extension.css'
            ], function(JSONEditor) {
                $("#"+containerElementID).append('<div id="jsonEditor"></div>');
                var options = {mode: isViewer?'view':'tree', change: contentChanged};
                jsonEditor = new JSONEditor(document.getElementById("jsonEditor"), options);
                TSCORE.IO.loadTextFile(filePath);
        });
    };

    function contentChanged() {
        TSCORE.FileOpener.setFileChanged(true);
    }

    exports.setFileType = function(fileType) {
        console.log("setFileType not supported on this extension");
    };

    exports.viewerMode = function(isViewerMode) {
        if(isViewerMode) {
            jsonEditor.setMode('view');
        } else {
            jsonEditor.setMode('tree');
        }
    };

    exports.setContent = function(content) {
        var jsonContent;

        var UTF8_BOM = "\ufeff";
        if(content.indexOf(UTF8_BOM) === 0) {
            content = content.substring(1,content.length);
        }

        try {
            jsonContent = JSON.parse(content);
        } catch(e) {
            console.log("Error parsing JSON document. "+e);
            TSCORE.FileOpener.closeFile(true);
            TSCORE.showAlertDialog("Error parsing JSON document");
            return false;
        }
        //console.log("Content: "+JSON.stringify(jsonConten));
        jsonEditor.set(jsonContent);
        //jsonEditor.expandAll();
    };

    exports.getContent = function() {
        return JSON.stringify(jsonEditor.get());
    };

});
