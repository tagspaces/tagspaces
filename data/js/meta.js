/* Copyright (c) 2013-2016 The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

define(function(require, exports, module) {
  'use strict';

  var TSCORE = require("tscore");

  var maxTmbSize = 300;
  var supportedImageExtensions = ["jpg", "jpeg", "png", "gif"];

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
      if (element.path === filePath) {
        metaObj = element.meta;
        return false;
      }
      return true;
    });
    return metaObj;
  }

  function saveMetaData(filePath, metaData) {
    var metaFilePath = findMetaFilebyPath(filePath, TSCORE.metaFileExt);
    var currentVersion = TSCORE.Config.DefaultSettings.appVersion + "." + TSCORE.Config.DefaultSettings.appBuild;
    if (!metaFilePath) {
      var name = TSCORE.Utils.baseName(filePath) + TSCORE.metaFileExt;
      metaFilePath = TSCORE.currentPath + TSCORE.dirSeparator + TSCORE.metaFolder + TSCORE.dirSeparator + name;
      var entry = {
        "name": name,
        "isFile": true,
        "path": metaFilePath,
      };
      TSCORE.metaFileList.push(entry);
      metaData.appVersionCreated = currentVersion;
    }

    metaData.appName = TSCORE.Config.DefaultSettings.appName;
    metaData.appVersionUpdated = currentVersion;
    metaData.lastUpdated = new Date();

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

  function loadThumbnailPromise(filePath) {
    return new Promise(function(resolve, reject) {
      if (TSCORE.PRO && TSCORE.Config.getEnableMetaData() && TSCORE.Config.getUseGenerateThumbnails()) {
        TSCORE.PRO.getThumbnailURLPromise(filePath).then(function(dataURL) {
          resolve(dataURL);
        }).catch(function(err) {
          console.warn("Thumb generation failed for: " + filePath + " failed with: " + err);
          resolve(filePath);
        });
      } else {
        var metaFilePath = findMetaFilebyPath(filePath, TSCORE.thumbFileExt);
        if (metaFilePath && isChrome) {
          metaFilePath = "file://" + metaFilePath;
        }
        var fileExt = TSCORE.TagUtils.extractFileExtension(filePath);
        if (metaFilePath) {
          resolve(metaFilePath);
        } else if (supportedImageExtensions.indexOf(fileExt) >= 0) {
          if (isChrome) {
            filePath = "file://" + filePath;
          }
          generateImageThumbnail(filePath).then(function(dataURL) {
            resolve(dataURL);
          }).catch(function() {
            resolve();
          });
        }
      }
    });
  }

  // should be in sync with the function from the PRO version
  function generateImageThumbnail(fileURL) {
    return new Promise(function(resolve, reject) {
      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");
      var img = new Image();

      var errorHandler = function(err) {
        console.warn("Error while generating thumbnail for: " + fileURL + " - " + JSON.stringify(err));
        resolve("");
      };

      try {
        img.crossOrigin = 'anonymous';
        img.onload = function() {
          if (img.width >= img.height) {
            canvas.width = maxTmbSize;
            canvas.height = (maxTmbSize * img.height) / img.width;
          } else {
            canvas.height = maxTmbSize;
            canvas.width = (maxTmbSize * img.width) / img.height;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/png"));
          img = null;
          canvas = null;
        };
        img.src = fileURL;
      } catch (err) {
        errorHandler(err);
      }
    });
  }

  function loadMetaFileJsonPromise(entry) {
    return new Promise(function(resolve, reject) {
      var filePath = entry.path;
      var metaFileJson = findMetaFilebyPath(filePath, TSCORE.metaFileExt);
      if (metaFileJson) {
        TSCORE.IO.getFileContentPromise(metaFileJson, "text").then(function(result) {
          var metaData = JSON.parse(result);
          entry.meta.metaData = metaData;
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

    if (!metaObj.metaData.tags) {
      metaObj.metaData.tags = [];
    }

    tags.forEach(function(element) {
      var newTag = {
        "title": element,
        "type":"sidecar",
        "style": TSCORE.generateTagStyle(TSCORE.Config.findTag(element))
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

  function loadFolderMetaDataPromise(path) {
    return new Promise(function(resolve, reject) {
      var metadataPath = 'file://' + path + TSCORE.dirSeparator + TSCORE.metaFolder + TSCORE.dirSeparator + TSCORE.metaFolderFile;
      if (isWeb) {
        metadataPath = path + TSCORE.dirSeparator + TSCORE.metaFolder + TSCORE.dirSeparator + TSCORE.metaFolderFile;
      }

      TSCORE.IO.getFileContentPromise(metadataPath, "text").then(function(content) {
        var metadata = JSON.parse(content);
        console.log('Location Metadata: ' + JSON.stringify(metadata));
        resolve(metadata);
      }).catch(function(err) {
        reject("loadFolderMetaDataPromise: Error reading " + metadataPath);
      });
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
  exports.loadFolderMetaDataPromise = loadFolderMetaDataPromise;
  exports.createMetaFolder = createMetaFolder;
});
