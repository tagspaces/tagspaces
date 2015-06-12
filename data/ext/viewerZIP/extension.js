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
  var JSZip = require("jszip");

  var extensionDirectory = TSCORE.Config.getExtensionPath() + "/" + exports.id;
  
  function createZipPrewiew(filePath, elementID) {

    var fileReader = new FileReader();

    fileReader.onload = function(event) {

      var zipFile = new JSZip(event.target.result);

      var $parent = $('#' + elementID);

      var $frame = $('<iframe/>')
        .width($parent.width())
        .height($parent.height())
        .appendTo($parent).contents().find('body');
      
      $frame.append( "<p> Contents of file " + filePath + "</p>" );

      var ulFiles = $frame.append("<ul/>");

      for (var fileName in zipFile.files) {

        var file = zipFile.files[fileName];
        var link = $('<a>').attr('href', '#').text(file.name);
        link.click(function(event){
          event.preventDefault();
          alert($(this).text());
        });
        var liFile = $('<li/>').append(link);
        ulFiles.append(liFile);
      }
    };
    
    var file = new File(filePath, 0);
    fileReader.readAsArrayBuffer(file);
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
