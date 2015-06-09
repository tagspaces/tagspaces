/* Copyright (c) 2015 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
  "use strict";

  console.log("Loading viewerZIP");

  exports.id = "viewerZIP"; // ID should be equal to the directory name where the ext. is located   
  exports.title = "ZIP Viewer";
  exports.type = "viewer";
  exports.supportedFileTypes = ["zip"];

  var TSCORE = require("tscore");

  var extensionDirectory = TSCORE.Config.getExtensionPath() + "/" + exports.id;

  exports.init = function(filePath, elementID) {
    console.log("Initalization Browser ZIP Viewer...");

    $('#' + elementID).append($('<iframe>', {
      id: "iframeViewer"
    }));
  };

  exports.viewerMode = function() {
    console.log("viewerMode not supported on this extension");
  };

  exports.setContent = function() {
    console.log("setContent not supported on this extension");
  };

  exports.getContent = function() {
    console.log("getContent not supported on this extension");
  };
});
