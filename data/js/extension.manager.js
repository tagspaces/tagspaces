define(function(require, exports, module) {
  'use strict';
  var TSCORE = require("tscore");
  console.log("Loading: extension.manager.js");

  var bowerFileName = "bower.json";

  document.addEventListener("initApp", function() {

    loadExtFolder().then(function(values) {
      alert("extension list loaded");
      console.log(values);
    }).catch(function(err) {
      console.log("loadExtFolder error: " + err);
    });

  }, false);

  function loadBowerData(filePath) {

    var promise = new Promise(function(resolve, reject) {
      $.get(filePath, function(data) {
        var bowerData = JSON.parse(data);
        console.log('bowerData: ' + JSON.stringify(bowerData));
        resolve(bowerData);
      }).fail(function() {
        resolve();
      });
    });
    return promise;
  }

  function loadExtFolder() {
    var extFolderPath = "ext";
    var promise = new Promise(function(resolve, reject) {
      TSCORE.IO.listDirectory(extFolderPath, function(dirList) {
        var readBowerFileWorkers = [];
        for(var i=0; i < dirList.length; i++) {
          var dirItem = dirList[i];
          if (!dirItem.isFile) {
            var filePath = dirItem.path + TSCORE.dirSeparator + bowerFileName;
            readBowerFileWorkers.push(loadBowerData(filePath));
          }
        }
        Promise.all(readBowerFileWorkers).then(function(values) {
          resolve(values);
        }).catch(reject);
      });
    });
    return promise;
  }

});
