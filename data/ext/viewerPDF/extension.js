/* Copyright (c) 2013 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
  "use strict";

  console.log("Loading viewerPDF");

  exports.id = "viewerPDF"; // ID should be equal to the directory name where the ext. is located   
  exports.title = "PDF Viewer";
  exports.type = "viewer";
  exports.supportedFileTypes = ["pdf"];

  var TSCORE = require("tscore");
  var TSPRO = require("tspro");
  var extensionDirectory = TSCORE.Config.getExtensionPath() + "/" + exports.id;

  exports.init = function(filePath, elementID) {
    console.log("Initalization Browser PDF Viewer...");
    if (TSPRO.available) {
      exports.getTextContent(filePath, function(content) {
        TSPRO.saveTextContent(filePath, content);
      });
    }
    $('#' + elementID).append($('<iframe>', {
      id: "iframeViewer",
      src: "libs/pdfjs/web/viewer.html?file=" + filePath,
      "nwdisable": "",
      "nwfaketop": ""
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

  var pdfToText = function(file) {

    PDFJS.workerSrc = 'libs/pdfjs/build/pdf.worker.js';
    return PDFJS.getDocument(file).then(function(pdf) {
      var pages = [];
      for (var i = 0; i < pdf.numPages; i++) {
        pages.push(i);
      }
      return Promise.all(pages.map(function(pageNumber) {
        return pdf.getPage(pageNumber + 1).then(function(page) {
          return page.getTextContent().then(function(textContent) {
            return textContent.items.map(function(item) {
              return item.str;
            }).join(' ');
          });
        });
      })).then(function(pages) {
        return pages.join("\r\n");
      });
    }, function(error) {
      console.log("Failed! " + error);
    });
  };

  exports.getTextContent = function(file, loaded) {
    pdfToText(file).then(function(result) {
      loaded(result);
    });
  };
});
