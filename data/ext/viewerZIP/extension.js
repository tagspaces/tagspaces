/* Copyright (c) 2015 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

/*jshint loopfunc: true */

define(function(require, exports, module) {
  "use strict";

  console.log("Loading viewerZIP");

  exports.id = "viewerZIP"; // ID should be equal to the directory name where the ext. is located   
  exports.title = "ZIP Viewer";
  exports.type = "viewer";
  exports.supportedFileTypes = ["zip"];

  var TSCORE = require("tscore");
  var JSZip = require("jszip");
  var maxPreviewSize = (1024 * 3); //3kb limit for preview

  var extensionDirectory = TSCORE.Config.getExtensionPath() + "/" + exports.id;

  function showContentFilePreviewDialog(containFile) {

    var unitArr = containFile.asUint8Array();
    var previewText = "";
    var byteLength = (unitArr.byteLength > maxPreviewSize) ? maxPreviewSize : unitArr.byteLength;
    
    for (var i = 0; i < byteLength; i++) {
      previewText += String.fromCharCode(unitArr[i]);
    }

    var fileContent = $("<pre/>").text(previewText);
    require(['text!' + extensionDirectory + '/previewDialog.html'], function(uiTPL) {
      
      if ($('#previewDialog').length < 1) {
        var uiTemplate = Handlebars.compile(uiTPL);
        $('body').append(uiTemplate());
      }
      var dialogPreview = $('#previewDialog');
      dialogPreview.find('.modal-body').empty().append(fileContent);
      dialogPreview.modal({
        backdrop: 'static',
        show: true
      });
    });
  }

  function createZipPrewiew(filePath, elementID) {
    var $parent = $('#' + elementID);
    var $previewElement = $('<div/>').css({
      'overflow': 'auto',
      'padding': '5px',
      'background-color': 'white',
      'fontSize': 12,
      'width': '100%',
      'height': '100%',
      }).appendTo($parent);
      //.width($parent.width()).height($parent.height()).appendTo($parent);

    TSCORE.showLoadingAnimation();
    
    TSCORE.IO.getFileContent(filePath, function(content) {
      var zipFile = new JSZip(content);
      $previewElement.append("<p> Contents of file " + filePath + "</p>");
      var ulFiles = $previewElement.append("<ul/>");

      for (var fileName in zipFile.files) {

        if (zipFile.files[fileName].dir === true) {
          continue;
        }
        var linkToFile = $('<a>').attr('href', '#').text(fileName);
        linkToFile.click(function(event) {
          event.preventDefault();
          var containFile = zipFile.files[$(this).text()];
          showContentFilePreviewDialog(containFile);
        });
        var liFile = $('<li/>').css('list-style-type', 'none').append(linkToFile);
        ulFiles.append(liFile);
      }

      TSCORE.hideLoadingAnimation();
    }, 
    function(error) {
      $previewElement.append("<p> Error in getFileContent :" + error + "</p>");
    });
  }

  exports.init = function(filePath, elementID) {
    console.log("Initalization Browser ZIP Viewer...");
    createZipPrewiew(filePath, elementID);
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
