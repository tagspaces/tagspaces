/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
  "use strict";

  console.log("Loading openNatively");

  var extensionTitle = "Automatically open Natively viewer";
  var extensionID = "viewerOpenNatively"; // ID should be equal to the directory name where the ext. is located
  var extensionType = "viewer";
  var extensionIcon = "icon-list";
  var extensionVersion = "1.0";
  var extensionManifestVersion = 1;
  var extensionLicense = "AGPL";
  var extensionSupportedFileTypes = ["*"];

  var TSCORE = require("tscore");

  var containerElID,
    $containerElement,
    filePath;

  var extensionDirectory = TSCORE.Config.getExtensionPath() + "/" + extensionID;

  exports.init = function(fPath, containerElementID) {
    console.log("Initalization Open Natively...");
    containerElID = containerElementID;
    $containerElement = $('#' + containerElID);
    filePath = fPath;
    TSCORE.IO.openFile(filePath);
  };

  exports.setFileType = function(fileType) {
    console.log("setFileType not supported on this extension");
  };

  exports.viewerMode = function(isViewerMode) {
    // set readonly
  };

  exports.setContent = function(content) {
    $containerElement.empty();
  };

  exports.getContent = function() {
    console.log("Not implemented");
  };

  // Extension Vars
  exports.Title = extensionTitle;
  exports.ID = extensionID;
  exports.Type = extensionType;
  exports.Icon = extensionIcon;
  exports.Version = extensionVersion;
  exports.ManifestVersion = extensionManifestVersion;
  exports.License = extensionLicense;
  exports.SupportedFileTypes = extensionSupportedFileTypes;

});
