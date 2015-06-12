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
  
  function createPrewiew(filePath, elementID) {

    var fileReader = new FileReader();

    fileReader.onload = function(fileLoadedEvent) {

      var zipFileLoaded = new JSZip(fileLoadedEvent.target.result);

      $('#' + elementID).append( "<p><h4>" + filePath + "<h4></p>" );

      var ulFilesContained = $("#" + elementID).append("<ul/>");

      for (var nameOfFileContainedInZipFile in zipFileLoaded.files)
      {

        var fileContainedInZipFile = zipFileLoaded.files[nameOfFileContainedInZipFile];
        
        console.log("zip file: " + fileContainedInZipFile);

        var linkFileContained = $('<a>').attr('href', '#').text(fileContainedInZipFile);
       
        //linkFileContained.file = fileContainedInZipFile;
        //linkFileContained.onclick = displayFileAsText;

        var liFileContained = $('<li/>')
        liFileContained.append(linkFileContained);
        ulFilesContained.append(liFileContained);

      }
    };
    
    var file = new File(filePath,0);
    fileReader.readAsArrayBuffer(file);
  }

  exports.init = function(filePath, elementID) {
    console.log("Initalization Browser ZIP Viewer...");
    createPrewiew(filePath, elementID);
    
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
});
