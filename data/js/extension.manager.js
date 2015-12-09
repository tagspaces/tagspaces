define(function(require, exports, module) {
  'use strict';
  var TSCORE = require("tscore");
  console.log("Loading: extension.manager.js");

  var bowerFileName = "bower.json";
  
  function getExtFolderPath() {
    var extPath = "ext";
    if (isWeb) {
      return extPath;
    }
    if (isCordova) {
      return cordova.file.applicationDirectory + "www/ext/";
      //return location.href.replace(/index.html/gi, extPath);
    }
    if(isChrome) {
      //TODO: chrome fail to read resource://
      return chrome.extension.getURL(extPath); 
    }
    return location.href.replace(/file:\/\//gi, "").replace(/index.html/gi, extPath);
  }

  function loadBowerData(filePath) {

    var resolvePath = (isCordova) ? cordova.file.applicationDirectory : null;
    
    var promise = new Promise(function(resolve, reject) {
      TSCORE.IO.getFileContentPromise(filePath, "text", resolvePath).then(function(data) {
        try {
          var bowerData = JSON.parse(data);
          console.log('Extension descriptor loaded: ' + filePath);
          resolve(bowerData);
        } catch (e) {
          resolve();
        }
      }).catch(function(error) {
        console.error("Error reading " + filePath);
        resolve();
      });
    });
    return promise;
  }

  function loadExtensionData() {

    var extFolderPath = getExtFolderPath();
    if(isChrome) {
      //TODO: chrome
      return Promise.resolve();
    }
    var promise = new Promise(function(resolve, reject) {
      TSCORE.IO.listDirectoryPromise(extFolderPath).then(function(dirList) {
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
