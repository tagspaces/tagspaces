/* Copyright (c) 2013 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";

    console.log("Loading editorODF");

    exports.id = "editorODF"; // ID should be equal to the directory name where the ext. is located
    exports.title = "ODF Viewer/Editor";
    exports.type = "editor";
    exports.supportedFileTypes = [ "odt", "ods" ];

    var TSCORE = require("tscore");

    var extensionDirectory = TSCORE.Config.getExtensionPath()+"/"+exports.id;

    exports.init = function(filePath, elementID) {
        console.log("Initalization ODF Viewer/Editor...");
        //filePath = "file:///"+filePath;
        //filePath = "http://www.webodf.org/demos/presentation/ohm2013.odp";
        var extPath = extensionDirectory+"/index.html";
        $('#'+elementID).append($('<iframe>', {
            id: "iframeViewer",
            src: extPath+"?cp="+filePath,
            "nwdisable": "",
            "nwfaketop": ""
        }));  

        /*require([extensionDirectory+'/webodf/webodf.js'], function() {
            var odfelement = document.getElementById(elementID),
            odfcanvas = new odf.OdfCanvas(odfelement);
            odfcanvas.load(filePath);
        });*/
    };

    exports.viewerMode = function() {
        console.log("viewerMode not supported on this extension");
    };

    exports.setContent = function() {
        console.log("setContent not supported on this extension");
    };

    exports.getContent = function() {
        console.log("getContent not supported on this extension");    };

});