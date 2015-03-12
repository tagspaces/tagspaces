/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
  "use strict";

  console.log("Loading viewerHTML");

  var extensionTitle = "HTML Viewer";
  var extensionID = "viewerHTML"; // ID should be equal to the directory name where the ext. is located
  var extensionType = "viewer";
  var extensionIcon = "icon-list";
  var extensionVersion = "1.0";
  var extensionManifestVersion = 1;
  var extensionLicense = "AGPL";
  var extensionSupportedFileTypes = ["html", "htm"];

  var TSCORE = require("tscore");

  var containerElID,
    $containerElement,
    currentFilePath,
    viewerToolbar,
    $iframeViewer;

  var extensionDirectory = TSCORE.Config.getExtensionPath() + "/" + extensionID;

  exports.init = function(filePath, containerElementID) {
    console.log("Initalization HTML Viewer...");
    containerElID = containerElementID;
    $containerElement = $('#' + containerElID);

    currentFilePath = filePath;

    //var fileExt = TSCORE.TagUtils.extractFileExtension(filePath);

    $containerElement.empty();
    $containerElement.css("background-color", "white");

    $containerElement.append($('<iframe>', {
      sandbox: "allow-same-origin allow-scripts",
      id: "iframeViewer",
      "nwdisable": "",
      "nwfaketop": ""
    }));

    require([
      "text!" + extensionDirectory + '/mainUI.html'
    ], function(uiTPL) {
      var uiTemplate = Handlebars.compile(uiTPL);
      viewerToolbar = uiTemplate({
        id: extensionID
      });

      TSCORE.IO.loadTextFile(filePath);
    });
  };

  // set readonly
  exports.setFileType = function(fileType) {
    console.log("setFileType not supported on this extension");
  };

  exports.viewerMode = function(isViewerMode) {};

  exports.setContent = function(content) {
    var cleanedContent = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    $iframeViewer = $("#iframeViewer");

    var fileDirectory = TSCORE.TagUtils.extractContainingDirectoryPath(currentFilePath);

    if ($iframeViewer !== undefined) {
      var $iframeViewerHead = $iframeViewer.contents().find('head');
      $iframeViewerHead.append($('<link/>', {
        rel: 'stylesheet',
        href: extensionDirectory + '/extension.css'
      }));
      $iframeViewerHead.append($('<link/>', {
        rel: 'stylesheet',
        href: extensionDirectory + '/../../libs/bootstrap/css/bootstrap.css'
      }));
      $iframeViewerHead.append($('<link/>', {
        rel: 'stylesheet',
        href: extensionDirectory + '/../../libs/font-awesome/css/font-awesome.css'
      }));
      $iframeViewerHead.append($('<link/>', {
        rel: 'stylesheet',
        href: extensionDirectory + '/css/markdown.css'
      }));
      $iframeViewerHead.append($('<link/>', {
        rel: 'stylesheet',
        href: extensionDirectory + '/css/github.css'
      }));
      //$iframeViewerHead.append($('<link/>', { rel: 'stylesheet', href: extensionDirectory+'/css/haroopad.css' }));
      $iframeViewerHead.append($('<link/>', {
        rel: 'stylesheet',
        href: extensionDirectory + '/css/metro-vibes.css'
      }));
      $iframeViewerHead.append($('<link/>', {
        rel: 'stylesheet',
        href: extensionDirectory + '/css/solarized-dark.css'
      }));
      $iframeViewerHead.append($('<link/>', {
        rel: 'stylesheet',
        href: extensionDirectory + '/css/clearness.css'
      }));
      $iframeViewerHead.append($('<link/>', {
        rel: 'stylesheet',
        href: extensionDirectory + '/css/clearness-dark.css'
      }));
      //$iframeViewerHead.append($('<link/>', { rel: 'stylesheet', href: extensionDirectory+'/readability/readability.css' }));
      //$iframeViewerHead.append($('<script>', { type: 'text/javascript', src: extensionDirectory+'/readability/readability.js' }));
    }

    var styles = ['', 'solarized-dark', 'github', 'metro-vibes', 'clearness', 'clearness-dark'];
    var currentStyleIndex = 0;

    var zoomSteps = ['zoomSmallest', 'zoomSmaller', 'zoomSmall', 'zoomDefault', 'zoomLarge', 'zoomLarger', 'zoomLargest'];
    var currentZoomState = 3;

    if ($iframeViewer !== undefined) {
      var $iframeViewerBody = $iframeViewer.contents().find('body');
      $iframeViewerBody.children().remove();
      $iframeViewerBody.append($('<div/>', {
        id: 'htmlContent'
      }).append(cleanedContent));
      $iframeViewerBody.append(viewerToolbar);

      if (isCordova) {
        $iframeViewerBody.find("#printButton").hide();
      }

      var $iframeHTMLContent = $iframeViewer.contents().find('#htmlContent');

      $iframeViewerBody.find("#changeStyleButton").bind('click', function() {
        currentStyleIndex = currentStyleIndex + 1;
        if (currentStyleIndex >= styles.length) {
          currentStyleIndex = 0;
        }
        $iframeViewerBody.css("padding", "0");
        $iframeViewerBody.css("margin", "0");
        $iframeHTMLContent.removeClass();
        $iframeHTMLContent.addClass('markdown');
        $iframeHTMLContent.addClass(styles[currentStyleIndex]);
      });

      $iframeViewerBody.find("#zoomInButton").bind('click', function() {
        currentZoomState++;
        if (currentZoomState >= zoomSteps.length) {
          currentZoomState = 6;
        }
        $iframeHTMLContent.removeClass();
        $iframeHTMLContent.addClass('markdown ' + styles[currentStyleIndex] + " " + zoomSteps[currentZoomState]);
      });

      $iframeViewerBody.find("#zoomOutButton").bind('click', function() {
        currentZoomState--;
        if (currentZoomState < 0) {
          currentZoomState = 0;
        }
        $iframeHTMLContent.removeClass();
        $iframeHTMLContent.addClass('markdown ' + styles[currentStyleIndex] + " " + zoomSteps[currentZoomState]);
      });

      $iframeViewerBody.find("#printButton").bind('click', function() {
        document.getElementById("iframeViewer").contentWindow.print();
      });

      // making all links open in the user default browser
      $iframeViewerBody.find("a").bind('click', function(e) {
        e.preventDefault();
        TSCORE.openLinkExternally($(this).attr("href"));
      });

      // fixing embedding of local images
      $iframeViewerBody.find("img[src]").each(function() {
        var currentSrc = $(this).attr("src");
        if (currentSrc.indexOf("http://") === 0 || currentSrc.indexOf("https://") === 0 || currentSrc.indexOf("data:") === 0) {
          // do nothing if src begins with http(s):// or data:
        } else {
          $(this).attr("src", "file://" + fileDirectory + TSCORE.dirSeparator + currentSrc);
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
