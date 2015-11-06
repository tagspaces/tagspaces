define(function(require, exports, module) {
  'use strict';
  var TSCORE = require("tscore");
  console.log("Loading: ext.api.js");
  
  window.addEventListener("message", handleMessage , false);

  function handleMessage(msg) {
    var data = JSON.parse(msg.data);
    var command = data.command;

    switch (command) {
      case "openLinkExternally":
        if (data.link) {
          openLinkExternally(data.link);
        }
        break;
      default:
        console.log("Not recognized messaging command: " + msg);
        break;
    }
  }

  function openLinkExternally(url) {
    if (url.indexOf("http://") === 0 || url.indexOf("https://") === 0 || url.indexOf("file://") === 0) {
      TSCORE.openLinkExternally(url);
    } else {
      console.log("Not supported URL format: " + url);
    }
  }

});