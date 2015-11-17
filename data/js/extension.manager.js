define(function(require, exports, module) {
  'use strict';
  var TSCORE = require("tscore");
  console.log("Loading: extension.manager.js");

  var bowerFileName = "bower.json";

  /*document.addEventListener("initApp", function() {

    loadExtFolder().then(function(values) {
      alert("extension list loaded");
      console.log(values);
    }).catch(function(err) {
      console.log("loadExtFolder error: " + err);
    });

  }, false);*/

  function getExtFolderPath() {
    var extPath = "ext";
    return location.href.replace(/file:\/\//gi, "").replace(/index.html/gi, extPath);
  }
  function loadBowerData(filePath) {

    var promise = new Promise(function(resolve, reject) {
      $.get(filePath, function(data) {
        try {
          var bowerData = JSON.parse(data);
          console.log('Extension descriptor loaded: ' + filePath);
          //console.log('bowerData: ' + JSON.stringify(bowerData));
          resolve(bowerData);
        } catch (e) {
          resolve();
        }
      }).fail(function() {
        resolve();
      });
    });
    return promise;
  }

  function loadExtensionData() {
    var extFolderPath = getExtFolderPath();
    var promise = new Promise(function(resolve, reject) {
      TSCORE.IO.listDirectory(extFolderPath, function(dirList) {
        var readBowerFileWorkers = [];
        for (var i in dirList) {
          var dirItem = dirList[i];
          if (!dirItem.isFile) {
            var filePath = dirItem.path + TSCORE.dirSeparator + bowerFileName;
            readBowerFileWorkers.push(loadBowerData(filePath));
          }
        }
        Promise.all(readBowerFileWorkers).then(function(values) {
          var result = [];
          for (var val in values) {
            if (values[val]) {
              result.push(values[val]);
            }
          }
          TSCORE.hideLoadingAnimation();
          resolve(result);
        }).catch(function(err) {
          TSCORE.hideLoadingAnimation();
          reject(err);
        });
      });
    });
    return promise;
  }
  exports.loadExtensionData = loadExtensionData;
});
