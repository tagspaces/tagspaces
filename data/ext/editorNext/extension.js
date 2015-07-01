/* Copyright (c) 2015 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

/*jshint loopfunc: true */

define(function(require, exports, module) {
  "use strict";

  console.log("Loading editorNext");

  console.log("Loading editorHTML");

  var extensionTitle = "HTML Editor";
  var extensionID = "editorHTML"; // ID should be equal to the directory name where the ext. is located
  var extensionType = "editor";
  var extensionSupportedFileTypes = ["html", "htm"];

  var TSCORE = require("tscore");

  var extensionDirectory = TSCORE.Config.getExtensionPath() + "/" + exports.id;

  exports.init = function(filePath, elementID) {
    console.log("Initalization editorNext");
    var $parent = $('#' + elementID);

    alert(filePath);

    var newDiv =  $("<div />"); 
    var textArea = $('<textarea style="padding-left:100px" />'); 
    textArea.text("Hello world");
    newDiv.append(textArea);
    $parent.append(newDiv);

    require(["ext/editorNext/woofmark/woofmark.min"], function() {
      alert(woofmark);
      woofmark(textArea, {
          //parseMarkdown: megamark,
          //parseHTML: domador
        });
    };

  exports.viewerMode = function() {
    console.log("viewerMode not supported on this extension");
  };

  exports.setContent = function(content) {
    console.log("setContent not supported on this extension");
  };

  exports.getContent = function() {
    console.log("getContent not supported on this extension");
  };
});
