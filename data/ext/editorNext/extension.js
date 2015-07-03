/* Copyright (c) 2015 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

/*jshint loopfunc: true */

define(function(require, exports, module) {
  "use strict";

  console.log("Loading editorNext");

  var extensionTitle = "HTML Editor";
  var extensionID = "editorNext"; // ID should be equal to the directory name where the ext. is located
  var extensionType = "editor";
  var extensionSupportedFileTypes = ["html", "htm"];

  var TSCORE = require("tscore");

  var extensionDirectory = TSCORE.Config.getExtensionPath() + "/" + extensionID//exports.id;
  var currentContent;

  exports.init = function(filePath, elementID) {
    console.log("Initalization editorNext");

    var $containerElement = $('#' + elementID);
    $containerElement.empty();
    $containerElement.css("background-color", "white");
    
    var extPath = extensionDirectory + "/index.html";
    $containerElement.append($('<iframe>', {
      id: "iframeViewer",
      sandbox: "allow-same-origin allow-scripts",
      scrolling: "no",
      style: "background-color: white; overflow: hidden;",
      src: extPath,
      "nwdisable": "",
      "nwfaketop": ""
    }).load(function() {
      TSCORE.IO.loadTextFile(filePath);   
    }));
    
  };

  exports.viewerMode = function() {
    console.log("viewerMode not supported on this extension");
  };

  exports.setContent = function(content) {
    currentContent = content;

    var bodyRegex = /\<body[^>]*\>([^]*)\<\/body/m; // jshint ignore:line
    var bodyContent;

    try {
      bodyContent = content.match(bodyRegex)[1];
    } catch (e) {
      console.log("Error parsing HTML document. " + e);
      TSCORE.FileOpener.closeFile(true);
      TSCORE.showAlertDialog("Probably a body tag was not found in the document. Document will be closed.", "Error parsing HTML document");
    }

    // removing all scripts from the document
    var cleanedBodyContent = bodyContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

    var contentWindow = document.getElementById("iframeViewer").contentWindow;
    if (typeof contentWindow.setContent === "function") {
      contentWindow.setContent(cleanedBodyContent);
    } else {
      console.log("editor is not initalized");
    }

  };

  var contentVersion = 0;

  function resetContentVersion() {
    contentVersion = 0;
    document.getElementById("iframeViewer").contentWindow.resetContentVersion();
  }

  exports.getContent = function() {

     var content = $("#iframeViewer").contents().find("textarea").val();

    // removing all scripts from the document
    var cleanedContent = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

    // saving all images as png in base64 format
    var match,
      urls = [],
      imgUrl = "",
      rex = /<img.*?src="([^">]*\/([^">]*?))".*?>/g;

    while (match = rex.exec(cleanedContent)) {
      imgUrl = match[1];
      console.log("URLs: " + imgUrl);
      urls.push([imgUrl, TSCORE.Utils.getBase64Image(imgUrl)]);
    }

    urls.forEach(function(dataURLObject) {
      if (dataURLObject[1].length > 7) {
        cleanedContent = cleanedContent.split(dataURLObject[0]).join(dataURLObject[1]);
      }
      //console.log(dataURLObject[0]+" - "+dataURLObject[1]);
    });
    // end saving all images

    cleanedContent = "<body>" + cleanedContent + "</body>";

    var htmlContent = currentContent.replace(/\<body[^>]*\>([^]*)\<\/body>/m, cleanedContent); // jshint ignore:line
    //console.log("Final html "+htmlContent);
    resetContentVersion();
    return htmlContent;
  };
});
