/* Copyright (c) 2015 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
  "use strict";

  console.log("Loading player");

  var extensionTitle = "AV Viewer";
  var extensionID = "viewerAudioVideo";  // ID should be equal to the directory name where the ext. is located
  var extensionType =  "perspective";
  var extensionIcon = "icon-list";
  var extensionVersion = "1.0";
  var extensionManifestVersion = 1;
  var extensionLicense = "AGPL";

  var  extensionSupportedFileTypesVideo = ["mp4", "webm", "ogv", "m4v"];
  var  extensionSupportedFileTypesAudio = ["mp3", "ogg"];

  var TSCORE = require("tscore");

  var extensionDirectory = TSCORE.Config.getExtensionPath() + "/" + extensionID;
  var UI;

  exports.init = function(filePath, elementID) {
    console.log("Initalization Audio Video Viewer...");

    //TODO minimize platform specific calls
    filePath = (isCordova || isWeb) ?  filePath : "file:///" + filePath;

    var $containerElement = $('#' + elementID);
    $containerElement.empty();
    $containerElement.css("background-color", "white");

    var extPath = extensionDirectory + "/player.html";
    $containerElement.append($('<iframe>', {
      id: "iframeViewer",
      sandbox: "allow-same-origin allow-scripts",
      scrolling: "no",
      style: "background-color: white; overflow: hidden;",
      src: extPath,
      "nwdisable": "",
      "nwfaketop": "",
      "allowFullScreen": ""
    }).load(function() {
      loadSprite($(this).contents().find("body"));
      var ext = filePath.split(".").pop().toLowerCase();
      if (extensionSupportedFileTypesVideo.indexOf(ext) !== -1) {
        $(this).contents().find(".player").append("<video controls>");
      } else {
        $(this).contents().find(".player").append("<audio controls>");
      }

      this.contentWindow.plyr.setup();
      var player = $(this).contents().find(".player").get(0).plyr;
      player.source(filePath);
      player.play();
    }));
  };

  function loadSprite(body) {
    var jqxhr = $.get(extensionDirectory + "/plyr/sprite.svg", function() {
      var $el = $("<div/>").css("display", "none").html(jqxhr.responseText);
      body.prepend($el);
    });
  }

  exports.viewerMode = function(isViewerMode) {
    console.log("viewerMode not supported on this extension");
  };

  exports.setContent = function(content) {
    console.log("setContent not supported on this extension");
  };

  exports.getContent = function() {
    console.log("getContent not supported on this extension");
  };

  // Vars
  exports.Title                   = extensionTitle;
  exports.ID                      = extensionID;
  exports.Type                    = extensionType;
  exports.Icon                    = extensionIcon;
  exports.Version                 = extensionVersion;
  exports.ManifestVersion         = extensionManifestVersion;
  exports.License                 = extensionLicense;
  exports.SupportedFileTypes      = extensionSupportedFileTypesVideo.concat(extensionSupportedFileTypesAudio);
});