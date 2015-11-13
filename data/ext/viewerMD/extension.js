/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
  "use strict";

  console.log("Loading viewerMD");

  var extensionTitle = "MardDown Viewer";
  var extensionID = "viewerMD"; // ID should be equal to the directory name where the ext. is located
  var extensionType = "viewer";
  var extensionIcon = "icon-list";
  var extensionVersion = "1.0";
  var extensionManifestVersion = 1;
  var extensionLicense = "AGPL";
  var extensionSupportedFileTypes = ["md", "markdown", "mdown"];

  var TSCORE = require("tscore");

  var md2htmlConverter;
  var containerElID;
  var currentFilePath;
  var $containerElement;

  var extensionDirectory = TSCORE.Config.getExtensionPath() + "/" + extensionID;

  // GFM https://help.github.com/articles/github-flavored-markdown

  exports.init = function(filePath, containerElementID) {
    console.log("Initalization MD Viewer...");
    containerElID = containerElementID;
    $containerElement = $('#' + containerElID);

    currentFilePath = filePath;

    $containerElement.empty();
    $containerElement.css("background-color", "white");
    $containerElement.append($('<iframe>', {
      sandbox: "allow-same-origin allow-scripts",
      id: "iframeViewer",
      "nwdisable": "",
      //"nwfaketop": "",
      "src": extensionDirectory + "/index.html?&locale=" + TSCORE.currentLanguage,
    }));

    require([
      extensionDirectory + '/marked/marked.js',
    ], function(marked) {
      md2htmlConverter = marked;
      md2htmlConverter.setOptions({
        renderer: new marked.Renderer(),
        //highlight: function (code) {
        //    //return require([extensionDirectory+'/highlightjs/highlight.js']).highlightAuto(code).value;
        //},
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        smartLists: true,
        smartypants: false
      });

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
    var UTF8_BOM = "\ufeff";

    // removing the UTF8 bom because it brakes thing like #header1 in the beginning of the document
    if (content.indexOf(UTF8_BOM) === 0) {
      content = content.substring(1, content.length);
    }

    var fileDirectory = TSCORE.TagUtils.extractContainingDirectoryPath(currentFilePath);

    var cleanedContent = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    var mdContent = md2htmlConverter(cleanedContent);

    var contentWindow = document.getElementById("iframeViewer").contentWindow;
    if (typeof contentWindow.setContent === "function") {
      contentWindow.setContent(mdContent, fileDirectory);
    } else {
      // TODO optimize setTimeout
      window.setTimeout(function() {
        contentWindow.setContent(mdContent, fileDirectory);
      }, 500);
    }
  };

  exports.getContent = function() {
    //$('#'+containerElID).html();
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
