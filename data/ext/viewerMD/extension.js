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

  var md2htmlConverter,
    containerElID,
    currentFilePath,
    $iframeViewer,
    $iframeViewerBody,
    $containerElement,
    viewerToolbar;

  var extensionDirectory = TSCORE.Config.getExtensionPath() + "/" + extensionID;

  // GFM https://help.github.com/articles/github-flavored-markdown

  exports.init = function(filePath, containerElementID) {
    console.log("Initalization MD Viewer...");
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
      extensionDirectory + '/marked/marked.js',
      "text!" + extensionDirectory + '/mainUI.html'
    ], function(marked, uiTPL) {
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

      var uiTemplate = Handlebars.compile(uiTPL);
      viewerToolbar = uiTemplate({
        id: extensionID
      });

      $iframeViewer = $("#iframeViewer");
      $iframeViewerBody = $iframeViewer.contents().find('body');

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

    var styles = ['', 'solarized-dark', 'github', 'metro-vibes', 'clearness', 'clearness-dark'];
    var currentStyleIndex = 0;

    var zoomSteps = ['zoomSmallest', 'zoomSmaller', 'zoomSmall', 'zoomDefault', 'zoomLarge', 'zoomLarger', 'zoomLargest'];
    var currentZoomState = 3;

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

      $iframeViewerBody.children().remove();
      $iframeViewerBody.append($('<div/>', {
        id: 'viewerContent',
        class: "markdown"
      }).append(mdContent));
      $iframeViewerBody.append(viewerToolbar);

      if (isCordova) {
        $iframeViewerBody.find("#printButton").hide();
      }

      var $viewerContent = $iframeViewer.contents().find('#viewerContent');

      $iframeViewerBody.find("#changeStyleButton").bind('click', function() {
        currentStyleIndex = currentStyleIndex + 1;
        if (currentStyleIndex >= styles.length) {
          currentStyleIndex = 0;
        }
        $viewerContent.removeClass();
        $viewerContent.addClass('markdown ' + styles[currentStyleIndex] + " " + zoomSteps[currentZoomState]);
      });

      $iframeViewerBody.find("#zoomInButton").bind('click', function(e) {
        currentZoomState++;
        if (currentZoomState >= zoomSteps.length) {
          currentZoomState = 6;
        }
        $viewerContent.removeClass();
        $viewerContent.addClass('markdown ' + styles[currentStyleIndex] + " " + zoomSteps[currentZoomState]);
      });

      $iframeViewerBody.find("#zoomOutButton").bind('click', function(e) {
        currentZoomState--;
        if (currentZoomState < 0) {
          currentZoomState = 0;
        }
        $viewerContent.removeClass();
        $viewerContent.addClass('markdown ' + styles[currentStyleIndex] + " " + zoomSteps[currentZoomState]);
      });

      $iframeViewerBody.find("#zoomResetButton").bind('click', function(e) {
        currentZoomState = 3;
        $viewerContent.removeClass();
        $viewerContent.addClass('markdown ' + styles[currentStyleIndex] + " " + zoomSteps[currentZoomState]);
      });

      $iframeViewerBody.find("#printButton").bind('click', function(e) {
        //document.getElementById("iframeViewer").contentWindow.print();
        $iframeViewer.get(0).contentWindow.print();
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
    //$('#'+containerElID).html();
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
