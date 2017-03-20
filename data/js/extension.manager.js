/* Copyright (c) 2013-2016 The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

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
    if (isChrome) {
      //TODO: chrome fail to read resource://
      return chrome.extension.getURL(extPath); 
    }
    if (isWin) {
      var extRealPath = location.href.replace(/file:\/\/\//gi, "").replace(/index.html/gi, extPath);
      return decodeURI(extRealPath);
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
    //TODO: mozilla loads bower data incorrectly
    if (isFirefox || isChrome || isWeb) { // web is disabled, because listing of directories is not always possible
      return Promise.resolve();
    }

    var promise = new Promise(function(resolve, reject) {
      var extensions = [];
      TSCORE.IO.listDirectoryPromise(extFolderPath).then(function(dirList) {
        var readBowerFileWorkers = [];
        for (var i in dirList) {
          var dirItem = dirList[i];
          if (!dirItem.isFile) {
            var filePath = dirItem.path + TSCORE.dirSeparator + bowerFileName;
            readBowerFileWorkers.push(loadBowerData(filePath));
          }
        }
        Promise.all(readBowerFileWorkers).then(function(bowerObjects) {
          bowerObjects.forEach(function(bowerObject) {
            if (bowerObject) {
              extensions.push(bowerObject);
            }
          });
          TSCORE.Config.setExtensions(extensions);
          resolve();
        }).catch(function(err) {
          console.warn("reading of at least one bower.json file failed: " + err);
          resolve();
        });
      }).catch(function(err) {
        console.warn("loadExtensionData failed with error: " + err);
        resolve();
      });
    });

    return promise;
  }

  exports.loadExtensionData = loadExtensionData;
});
