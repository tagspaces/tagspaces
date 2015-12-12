define(function(require, exports, module) {
  'use strict';

  var TSCORE = require("tscore");

  function makeMetaPathByName(name) {
    return TSCORE.currentPath + TSCORE.dirSeparator + TSCORE.metaFolder + name;
  }

  function getDirectoryMetaInformation() {
    
    if (TSCORE.IO.listDirectoryPromise) {
      var metaFolderPath = TSCORE.currentPath + TSCORE.dirSeparator + TSCORE.metaFolder;
      console.log("getDirectoryMetaInformation: " + metaFolderPath);
      return TSCORE.IO.listDirectoryPromise(metaFolderPath);
    } else {
      return Promise.resolve();
    }
  }

  function findMetaFilebyPath(filePath, extension) {
    var metaFilePath = null;
    filePath = filePath + extension;
    TSCORE.metaFileList.every(function(element) {
      if (filePath.indexOf(element.name) > 0) {
        metaFilePath = TSCORE.currentPath + TSCORE.dirSeparator + TSCORE.metaFolder + TSCORE.dirSeparator + element.name;
        return false;
      }
      return true;
    });
    return metaFilePath;
  }

  function findMetaObjectFromFileList(filePath) {
    var metaObj = null;
    TSCORE.fileList.every(function(element) {
      if (element[TSCORE.fileListFILEPATH] === filePath) {
        metaObj = element[TSCORE.fileListMETA];
        return false;
      }
      return true;
    });
    return metaObj;
  }

  function saveMetaData(filePath, metaData) {
    var metaFilePath = findMetaFilebyPath(filePath, TSCORE.metaFileExt);
    if (!metaFilePath) {
      var name = TSCORE.Utils.baseName(filePath) + TSCORE.metaFileExt;
      metaFilePath = TSCORE.currentPath + TSCORE.dirSeparator + TSCORE.metaFolder + TSCORE.dirSeparator + name;
      var entry = {
        "name": name,
        "isFile": true,
        "path": metaFilePath,
      };
      TSCORE.metaFileList.push(entry);
    }
    var content = JSON.stringify(metaData);
    TSCORE.IO.saveTextFilePromise(metaFilePath, content, true);
  }

  function updateTsMetaData(oldFileName, newFileName)  { 
    var name = TSCORE.Utils.baseName(oldFileName);
    TSCORE.metaFileList.forEach(function(element, index) {
      if (element.name.indexOf(name) >= 0) {
        if (newFileName) {
          var pathOld  = TSCORE.Utils.dirName(oldFileName);
          var pathNew = TSCORE.Utils.dirName(newFileName);
          var path = TSCORE.currentPath;

          if (pathNew.lastIndexOf(TSCORE.dirSeparator) === 0) {
            pathOld += TSCORE.dirSeparator;
          }

          if (pathOld != pathNew) {
            path = pathNew;
          }
          var newName = TSCORE.Utils.baseName(newFileName) + "." + element.name.split('.').pop();
          var newFilePath = path + TSCORE.dirSeparator + TSCORE.metaFolder + TSCORE.dirSeparator + newName;
          TSCORE.IO.renameFilePromise(element.path, newFilePath);

          if (pathOld == TSCORE.currentPath) {
            element.name = newName;
            element.path = newFilePath;  
          } else {
            TSCORE.metaFileList.splice(index, 1);
          }
          
        } else {
          TSCORE.IO.deleteFilePromise(element.path).then(function() {
            TSCORE.metaFileList.splice(index, 1);
          });
        }
      }
    });
  }

  function loadThumbnail(filePath) {
    var promise = new Promise(function(resolve, reject) {
      if (TSCORE.PRO) {
        TSCORE.PRO.getThumbnailURL(filePath, function(dataURL) {
          resolve(dataURL);
        });
      } else {
        var metaFilePath = findMetaFilebyPath(filePath, TSCORE.thumbFileExt);
        if (metaFilePath && isChrome) {
          metaFilePath = "file://" + metaFilePath;
        }
        resolve(metaFilePath); 
      }
    });
    return promise;
  }

  function loadMetaFileJson(filePath) {
    console.log("loadMetaFileJson: " + filePath);
    var promise = new Promise(function(resolve, reject) {
      var metaFileJson = findMetaFilebyPath(filePath, TSCORE.metaFileExt);
      if (metaFileJson) {
        TSCORE.IO.getFileContentPromise(metaFileJson, "text").then(function(result) {
          var metaData = JSON.parse(result);
          resolve(metaData);
        }, function(error){
          reject(error);
        });
      } else {
        resolve(null);
      }
    });
    return promise;
  }

  function loadMetaDataFromFile(entry) {
    var filePath = entry[TSCORE.fileListFILEPATH];
    var promise = new Promise(function(resolve, reject) {
      loadMetaFileJson(filePath).then(function(result) {
        entry[TSCORE.fileListMETA].metaData = result;
        loadThumbnail(filePath).then(function(result) {
          entry[TSCORE.fileListMETA].thumbnailPath = result;
          resolve(entry);
        });
      });
    });
    return promise;
  }

  function getTagsFromMetaFile(filePath) {
    var tags = [];
    var metaObj = findMetaObjectFromFileList(filePath);
    if (metaObj && metaObj.metaData && metaObj.metaData.tags) {
      metaObj.metaData.tags.forEach(function(elem) {
        tags.push({
          tag: elem.title,
          filepath: filePath,
          style: elem.style
        });
      });
    }
    return tags;
  }

  //meta tag utils
  function addMetaTags(filePath, tags) {
    var metaObj = findMetaObjectFromFileList(filePath);
    if (!metaObj) {
      metaObj = {
        thumbnailPath: "",
        metaData: null,
      };  
    }

    if (!metaObj.metaData) {
      metaObj.metaData = {
        tags: []
      };
    }

    tags.forEach(function(element) {
      var newTag = {
        "title": element,
        "type":"sidecar",
        //"description": "",
        //"icon":"",
        //"style":""
      };
      var isNewTag = true;
      metaObj.metaData.tags.forEach(function(oldTag) {
        if (oldTag.title === element) {
          isNewTag = false;
        }
      });
      if (isNewTag) {
        metaObj.metaData.tags.push(newTag);  
      }
    });

    saveMetaData(filePath, metaObj.metaData);
  }

  function renameMetaTag(filePath, oldTag, newTag) {
    var metaObj = findMetaObjectFromFileList(filePath);
    if (metaObj.metaData) {
      metaObj.metaData.tags.forEach(function(tag , index) {
        if (tag.title === oldTag) {
          tag.title = newTag;
        }
      });
      saveMetaData(filePath, metaObj.metaData);
    }
  }

  function removeMetaTag(filePath, tagName) {
    var metaObj = findMetaObjectFromFileList(filePath);
    if (metaObj.metaData) {
      metaObj.metaData.tags.forEach(function(tag , index) {
        if (tag.title === tagName) {
          metaObj.metaData.tags.splice(index , 1);
        }
      });
      var metaFileJson = findMetaFilebyPath(filePath, TSCORE.metaFileExt);
      if (metaFileJson) {
        var content = JSON.stringify(metaObj.metaData);
        TSCORE.IO.saveTextFilePromise(metaFileJson, content, true);
      }
    }
  }

  function loadFolderMetaData(path , resultCb) {
    var metadataPath;
    if (isWeb) {
      metadataPath = path + TSCORE.dirSeparator + TSCORE.metaFolder + TSCORE.dirSeparator + TSCORE.metaFolderFile;
    } else {
      metadataPath = 'file://' + path + TSCORE.dirSeparator + TSCORE.metaFolder + TSCORE.dirSeparator + TSCORE.metaFolderFile;
    }

    $.get(metadataPath, function(data) {
        if (data.length > 1) {
          var metadata = JSON.parse(data);
          console.log('Location Metadata: ' + JSON.stringify(metadata));
          resultCb(metadata);
        }
      }).fail(function() {
        resultCb();
      });
  }

  exports.getDirectoryMetaInformation = getDirectoryMetaInformation;
  exports.findMetaFilebyPath  =  findMetaFilebyPath;
  exports.findMetaObjectFromFileList = findMetaObjectFromFileList;
  exports.saveMetaData = saveMetaData;
  exports.updateMetaData = updateTsMetaData;
  exports.loadMetaDataFromFile = loadMetaDataFromFile;
  exports.getTagsFromMetaFile = getTagsFromMetaFile;
  //tag utils
  exports.addMetaTags = addMetaTags;
  exports.renameMetaTag = renameMetaTag;
  exports.removeMetaTag = removeMetaTag;
  exports.loadFolderMetaData = loadFolderMetaData;
});