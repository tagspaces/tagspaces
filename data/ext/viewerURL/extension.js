/* Copyright (c) 2012-2014 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";

    console.log("Loading viewerURL");

    exports.id = "viewerURL"; // ID should be equal to the directory name where the ext. is located
    exports.title = "URL Viewer";
    exports.type = "editor";
    exports.supportedFileTypes = [ "url", "website", "desktop" ];

    var TSCORE = require("tscore");

    var containerElID;
    var currentFilePath;

    var extensionDirectory = TSCORE.Config.getExtensionPath()+"/"+exports.id;

    exports.init = function(filePath, containerElementID) {
        console.log("Initalization MD Viewer...");
        containerElID = containerElementID;
        $('#'+containerElID).attr("style","background-color: white;");
        currentFilePath = filePath;
        require(['css!'+extensionDirectory+'/extension.css'], function() {
            TSCORE.IO.loadTextFile(filePath);
        });
    };

    exports.setFileType = function() {
        console.log("setFileType not supported on this extension");
    };

    exports.viewerMode = function(isViewerMode) {
        // set readonly
    };

    exports.setContent = function(content) {
        var urlBegin = "URL=";

        var url = content.substring(content.indexOf(urlBegin)+urlBegin.length, content.length);

        // preventing the case the url is at the end of the file
        url = url+"\n";

        url = url.substring(0,url.indexOf("\n"));

        var urlRegExp = /https?:\/\/([-\w\.]+)+(:\d+)?(\/([\w/_\.]*(\?\S+)?)?)?/;

        console.log("URL: "+url);

        if(urlRegExp.test(url)) {
            $('#'+containerElID).append($("<button>", {
                "class":     "viewerURLButton btn",
                "data-url":  url,
                "text":      url
            })
            .prepend("<i class='fa fa-external-link'></i>&nbsp;")
            .click(function(e){
                e.preventDefault();
                TSCORE.openLinkExternally($(this).attr("data-url"));
            })
            );
        } else {
            TSCORE.showAlertDialog("No URL found in this file.");
            console.log("No URL found!");
        }
    };

    exports.getContent = function() {
    };

});