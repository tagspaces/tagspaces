define(function(require, exports, module) {
  'use strict';
  var TSCORE = require("tscore");
  console.log("Loading: ext.api.js");
  
  window.addEventListener("message", handleMessage , false);

  function handleMessage(msg) {
    var data = JSON.parse(msg.data);
    var command = data.command;

    switch (command) {
      case "playbackEnded":
        if(data){
          openNextFile(data);
        }
        break;
      case "openLinkExternally":
        if (data.link) {
          openLinkExternally(data.link);
        }
        break;
      case "contentChangedInEditor":
        TSCORE.FileOpener.setFileChanged(true);
        break;
      default:
        console.log("Not recognized messaging command: " + msg);
        break;
    }
  }

  function openNextFile(filePath) {
    //if(TSCORE.selectedFiles[0]) {
      TSCORE.FileOpener.getNextFile(filePath);
    //}
  }

  function openLinkExternally(uri) {
    uri = decodeURIComponent(uri);
    if (
        uri.indexOf("http://") === 0 ||
        uri.indexOf("https://") === 0 ||
        uri.indexOf("file://") === 0
    ) {
      TSCORE.IO.openFile(uri);
    } else {
      console.log("Not supported URL format: " + uri);
    }
  }

});