/* Copyright (c) 2013-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
  "use strict";

  console.log("Loading viewerText");

  var extensionTitle = "IFrame Viewer";
  var extensionID = "viewerBrowser"; // ID should be equal to the directory name where the ext. is located   
  var extensionType = "viewer";
  var extensionIcon = "icon-list";
  var extensionVersion = "1.0";
  var extensionManifestVersion = 1;
  var extensionLicense = "AGPL";
  var extensionSupportedFileTypes = ["*"];

  var TSCORE = require("tscore");

  var containerElID,
    $containerElement,
    currentFilePath;

  var extensionDirectory = TSCORE.Config.getExtensionPath() + "/" + extensionID;

  exports.init = function(filePath, containerElementID) {
    console.log("Initalization Text Viewer...");
    containerElID = containerElementID;
    $containerElement = $('#' + containerElID);

    currentFilePath = filePath;

    var filePathURI;
    if (isCordova || isWeb) {
      filePathURI = filePath;
    } else {
      filePathURI = "file:///" + filePath;
    }

    var fileExt = TSCORE.TagUtils.extractFileExtension(filePath);

    $containerElement.empty();
    $containerElement.css("background-color", "white");

    if ((fileExt.indexOf("htm") === 0 || fileExt.indexOf("xhtm") === 0 || fileExt.indexOf("txt") === 0) && !isFirefox) {
      $containerElement.append($('<iframe>', {
        sandbox: "allow-same-origin allow-scripts",
        id: "iframeViewer",
        "nwdisable": "",
        "nwfaketop": ""
      }));
      
      TSCORE.IO.loadTextFilePromise(filePath).then(function(content) {
        exports.setContent(content);
      }, 
      function(error) {
        TSCORE.hideLoadingAnimation();
        TSCORE.showAlertDialog("Loading " + filePath + " failed.");
        console.error("Loading file " + filePath + " failed " + error);
      });
    } else {
      $containerElement.append($('<iframe>', {
        // sandbox: "allow-same-origin allow-scripts", // comment out due not loading pdfs in chrome ext
        id: "iframeViewer",
        src: filePathURI,
        "nwdisable": "",
        "nwfaketop": ""
      }));
    }
  };

  exports.setFileType = function(fileType) {
    console.log("setFileType not supported on this extension");
  };

  exports.viewerMode = function(isViewerMode) {
    // set readonly      
  };

  exports.setContent = function(content) {
    // removing the script tags from the content 
    var cleanedContent = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    var viewerIframe = $("#iframeViewer").get(0);

    var fileDirectory = TSCORE.TagUtils.extractContainingDirectoryPath(currentFilePath);

    if (viewerIframe !== undefined) {
      viewerIframe.contentWindow.document.write(cleanedContent);

      // making all links open in the user default browser
      $(viewerIframe.contentWindow.document).find("a").bind('click', function(e) {
        e.preventDefault();
        TSCORE.openLinkExternally($(this).attr("href"));
      });

      // fixing embedding of local images
      $(viewerIframe.contentWindow.document).find("img[src]").each(function() {
        var currentSrc = $(this).attr("src");
        if (currentSrc.indexOf("http://") === 0 ||
            currentSrc.indexOf("https://") === 0 ||
            currentSrc.indexOf("file://") === 0 ||
            currentSrc.indexOf("data:") === 0) {
          // do nothing if src begins with http(s):// or data:
        } else {
          $(this).attr("src", "file://" + fileDirectory + "/" + currentSrc);
        }
      });

      $(viewerIframe.contentWindow.document).find("a[href]").each(function() {
        var currentSrc = $(this).attr("href");
        if (currentSrc.indexOf("http://") === 0 ||
            currentSrc.indexOf("https://") === 0 ||
            currentSrc.indexOf("file://") === 0 ||
            currentSrc.indexOf("data:") === 0) {
          // do nothing if src begins with http(s):// or data:
        } else {
          var path = "file://" + fileDirectory + "/" + currentSrc;
          $(this).attr("href", path);
        }
      });

    }
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
