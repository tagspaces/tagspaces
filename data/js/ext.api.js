define(function(require, exports, module) {
  'use strict';
  var TSCORE = require("tscore");
  console.log("Loading: ext.api.js");
  
  window.addEventListener("message", function(msg) {
    console.log(msg);
    var data = JSON.parse(msg.data);
    if (data.link) {
      TSCORE.openLinkExternally(data.link);
    }
    
  }, false);

});