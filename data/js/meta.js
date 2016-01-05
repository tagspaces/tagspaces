define(function(require, exports, module) {
  'use strict';

  var TSCORE = require("tscore");

  function makeMetaPathByName(name) {
    return TSCORE.currentPath + TSCORE.dirSeparator + TSCORE.metaFolder + name;
  }

  function getDirectoryMetaInformation() {
    var metaFolderPath = TSCORE.currentPath + TSCORE.dirSeparator + TSCORE.metaFolder;
    console.log("getDirectoryMetaInformation: " + metaFolderPath);
    return TSCORE.IO.listDirectoryPromise(metaFolderPath, true);
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

  function loadThumbnailPromise(entry) {
    return new Promise(function(resolve, reject) {
      var filePath = entry[TSCORE.fileListFILEPATH];
      if (TSCORE.PRO && TSCORE.Config.getEnableMetaData()) {
        TSCORE.PRO.getThumbnailURLPromise(filePath).then(function(dataURL) {
          entry[TSCORE.fileListMETA].thumbnailPath = dataURL;
          resolve(filePath);
        }).catch(function(err) {
          console.warn("Thumb generation failed for: " + filePath + " failed with: " + err);
          resolve(filePath);
        });
      } else {
        var metaFilePath = findMetaFilebyPath(filePath, TSCORE.thumbFileExt);
        if (metaFilePath && isChrome) {
          metaFilePath = "file://" + metaFilePath;
        }
        entry[TSCORE.fileListMETA].thumbnailPath = metaFilePath;
        resolve(filePath);
      }
    });
  }

  function loadMetaFileJsonPromise(entry) {
    return new Promise(function(resolve, reject) {
      var filePath = entry[TSCORE.fileListFILEPATH];
      var metaFileJson = findMetaFilebyPath(filePath, TSCORE.metaFileExt);
      if (metaFileJson) {
        TSCORE.IO.getFileContentPromise(metaFileJson, "text").then(function(result) {
          var metaData = JSON.parse(result);
          entry[TSCORE.fileListMETA].metaData = metaData;
          resolve(filePath);
        }).catch(function(err) {
          console.warn("Getting meta information failed for: " + filePath);
          resolve(filePath);
        });
      } else {
        console.log("No meta information found for: " + filePath);
        resolve(filePath);
      }
    });
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

    // TODO use the API
    $.get(metadataPath, function(data) {
        if (data.length > 1) {
          try {
            var metadata = JSON.parse(data);
            console.log('Location Metadata: ' + JSON.stringify(metadata));
            resultCb(metadata);
          } catch (err) {
            console.warn('Error while parsing json from ' + metadataPath);
          }
        }
      }).fail(function() {
        resultCb();
      });
  }

  function createMetaFolder(dirPath) {
    if (dirPath.lastIndexOf(TSCORE.metaFolder) >= dirPath.length - TSCORE.metaFolder.length) {
      console.log("Can not create meta folder in a meta folder");
      return;
    }
    var metaDirPath = dirPath + TSCORE.dirSeparator + TSCORE.metaFolder;
    TSCORE.IO.createDirectoryPromise(metaDirPath).then(function() {
      console.log("Metafolder created: " + metaDirPath);
    }).catch(function(error) {
      console.log("Creating metafolder failed, it was probably already created " + error);
    });
  }

  exports.getDirectoryMetaInformation = getDirectoryMetaInformation;
  exports.findMetaFilebyPath  =  findMetaFilebyPath;
  exports.findMetaObjectFromFileList = findMetaObjectFromFileList;
  exports.saveMetaData = saveMetaData;
  exports.updateMetaData = updateTsMetaData;
  exports.loadMetaFileJsonPromise = loadMetaFileJsonPromise;
  exports.loadThumbnailPromise = loadThumbnailPromise;
  exports.getTagsFromMetaFile = getTagsFromMetaFile;
  //tag utils
  exports.addMetaTags = addMetaTags;
  exports.renameMetaTag = renameMetaTag;
  exports.removeMetaTag = removeMetaTag;
  exports.loadFolderMetaData = loadFolderMetaData;
  exports.createMetaFolder = createMetaFolder;
});
