/* Copyright (c) 2012-2016 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
  'use strict';

  console.log('Loading search.js ...');

  var TSCORE = require('tscore');
  var currentQuery = '';
  var nextQuery = '';
  var recursiveSymbol = '~';

  // TODO implement case sensitive search
  var caseSensitiveSearch = false;

  function prepareQuery(queryText) {
    // cleaning up the query, reducing the spaces
    var queryText = queryText.toLowerCase().replace(/^\s+|\s+$/g, '');

    var recursive = queryText.indexOf(recursiveSymbol) !== 0;
    if (!recursive) {
      queryText = queryText.substring(1, queryText.length);
    }

    var queryTerms = queryText.split(' ');
    var queryObj = {
      includedTerms: [],
      excludedTerms: [],
      includedTags: [],
      excludedTags: [],
      recursive: recursive,
      fileTypeFilter: function() {
        return true;
      },
    };

    // parsing the query terms
    queryTerms.forEach(function(value) {
      if (value.length <= 1) {
        return;
      }

      if (TSCORE.PRO && value.indexOf('t:picture') === 0) {
        queryObj.fileTypeFilter = TSCORE.PRO.Search.filterPictures;
      } else if (TSCORE.PRO && value.indexOf('t:note') === 0) {
        queryObj.fileTypeFilter = TSCORE.PRO.Search.filterNotes;
      } else if (TSCORE.PRO && value.indexOf('t:doc') === 0) {
        queryObj.fileTypeFilter = TSCORE.PRO.Search.filterDocuments;
      } else if (TSCORE.PRO && value.indexOf('t:audio') === 0) {
        queryObj.fileTypeFilter = TSCORE.PRO.Search.filterAudioFiles;
      } else if (TSCORE.PRO && value.indexOf('t:video') === 0) {
        queryObj.fileTypeFilter = TSCORE.PRO.Search.filterVideoFiles;
      } else if (TSCORE.PRO && value.indexOf('t:archive') === 0) {
        queryObj.fileTypeFilter = TSCORE.PRO.Search.filterArchives;
      } else if (value.indexOf('!') === 0) {
        queryObj.excludedTerms.push([value.substring(1, value.length), false]);
      } else if (value.indexOf('+') === 0) {
        queryObj.includedTags.push([value.substring(1, value.length), true]);
      } else if (value.indexOf('-') === 0) {
        queryObj.excludedTags.push([value.substring(1, value.length), true]);
      } else {
        queryObj.includedTerms.push([value, false]);
      }
    });

    return queryObj;
  }

  function filterTextBasedFiles(filePath) {
    // Returning only text based files
    return /\.(html|htm|txt|xml|md|mdown|json)$/i.test(filePath);
  }

  function filterFileObject(fileEntry, queryObj) {
    var parentDir = TSCORE.TagUtils.extractContainingDirectoryName(fileEntry.path).toLowerCase();
    var searchIn = fileEntry.name.toLowerCase();
    var fileNameTags;

    //if(!queryObj.fileTypeFilter(searchIn)) {
    //  return false;
    //}

    if (fileEntry.tags) {
      fileNameTags = fileEntry.tags;
    } else {
      fileNameTags = TSCORE.TagUtils.extractTags(fileEntry.path);
    }

    var result = true;

    if (fileNameTags.length < 1 && queryObj.includedTags.length > 0) {
      return false;
    }
    for (var i = 0; i < queryObj.includedTerms.length; i++) {
      // Considers the parent directory name in the search results
      if ((parentDir + searchIn).indexOf(queryObj.includedTerms[i][0]) >= 0) {
        queryObj.includedTerms[i][1] = true;
      } else {
        return false;
      }
    }
    for (var i = 0; i < queryObj.excludedTerms.length; i++) {
      if (searchIn.indexOf(excludedTerms[i][0]) < 0) {
        queryObj.excludedTerms[i][1] = true;
      } else {
        return false;
      }
    }
    for (var i = 0; i < queryObj.includedTags.length; i++) {
      queryObj.includedTags[i][1] = false;
      for (var j = 0; j < fileNameTags.length; j++) {
        if (fileNameTags[j].toLowerCase() == queryObj.includedTags[i][0]) {
          queryObj.includedTags[i][1] = true;
        }
      }
    }
    for (var i = 0; i < queryObj.includedTags.length; i++) {
      result = result & queryObj.includedTags[i][1];
    }
    for (var i = 0; i < queryObj.excludedTags.length; i++) {
      queryObj.excludedTags[i][1] = true;
      for (var j = 0; j < fileNameTags.length; j++) {
        if (fileNameTags[j].toLowerCase() == queryObj.excludedTags[i][0]) {
          queryObj.excludedTags[i][1] = false;
        }
      }
    }
    for (var i = 0; i < queryObj.excludedTags.length; i++) {
      result = result & queryObj.excludedTags[i][1];
    }
    return result;
  }

  function searchData(data, query) {
    // TODO make a switch in gui for content search
    var searchContentSupported = (isChrome || isFirefox) ? false : true;
    var queryObj = prepareQuery(query);
    var searchResults = [];
    var metaDirPattern = TSCORE.dirSeparator + TSCORE.metaFolder + TSCORE.dirSeparator;

    if (query.length > 0) {
      TSCORE.showWaitingDialog($.i18n.t("ns.common:waitDialogDiectoryIndexing"));
      console.time("walkDirectorySearch");
      TSCORE.IOUtils.walkDirectory(TSCORE.currentPath, {recursive: queryObj.recursive},
        function(fileEntry) {
          return new Promise(function(resolve, reject) {
            var indexOfMetaDirectory = fileEntry.path.indexOf(metaDirPattern);

            // Searching in file names while skipping paths containing '/.ts/'
            if (indexOfMetaDirectory < 1 && filterFileObject(fileEntry, queryObj) && queryObj.fileTypeFilter(fileEntry.name.toLowerCase())) {
              searchResults.push(fileEntry);
              resolve();
              return;
            }

            // Searching in content
            if (searchContentSupported && filterTextBasedFiles(fileEntry.name)) { // Search in content
              TSCORE.IO.getFileContentPromise(fileEntry.path, "text").then(function(content) {
                var found;
                var metaExtLocation = fileEntry.path.lastIndexOf(TSCORE.metaFileExt); // .json

                // Checking for matching tags, parsing meta JSONs located in ../.ts/ folders
                if (indexOfMetaDirectory > 0 && metaExtLocation > indexOfMetaDirectory) {
                  try {
                    var metaData = JSON.parse(content);
                    if (metaData.tags && metaData.tags.length > 0 && queryObj.includedTags.length > 0) {
                      // Checking if both tag arrays have same members
                      for (var i = 0; i < metaData.tags.length; i++) {
                        for (var j = 0; j < queryObj.includedTags.length; j++) {
                          if (queryObj.includedTags[j][0] === (metaData.tags[i].title.toLowerCase())) {
                            queryObj.includedTags[j][1] = true;
                            found = true;
                          }
                        }
                      }
                      // Logicaling AND-ing the result
                      for (var j = 0; j < queryObj.includedTags.length; j++) {
                        found = found & queryObj.includedTags[j][1];
                        queryObj.includedTags[j][1] = false;
                      }
                    }
                  } catch (err) {
                    console.log("Error " + err + " parsing JSON from: " + fileEntry.path);
                  }
                }

                if (!found) {
                  // Searching in the content
                  queryObj.includedTerms.forEach(function(term) {
                    if (content.indexOf(term[0]) >= 0) {
                      console.log("Term " + term[0] + " found in " + fileEntry.path);
                      found = true;
                    }
                  });
                }

                if (found) {
                  if (indexOfMetaDirectory > 0) { // file is in the meta folder

                    var contentExtLocation = fileEntry.path.lastIndexOf(TSCORE.contentFileExt); // .txt
                    var metaFolderLocation = fileEntry.path.lastIndexOf(TSCORE.metaFolderFile); // .ts

                    // file is meta file (json) and not tsm.json
                    if (metaExtLocation > indexOfMetaDirectory && metaFolderLocation < 0) {
                      fileEntry.name = fileEntry.name.substring(0, fileEntry.name.indexOf(TSCORE.metaFileExt));
                      fileEntry.path = fileEntry.path.substring(0, indexOfMetaDirectory + 1) + fileEntry.name;
                    }

                    // file is text file containing extracted contentent (txt)
                    if (contentExtLocation > indexOfMetaDirectory) {
                      fileEntry.name = fileEntry.name.substring(0, fileEntry.name.indexOf(TSCORE.contentFileExt));
                      fileEntry.path = fileEntry.path.substring(0, indexOfMetaDirectory + 1) + fileEntry.name;
                    }

                    // file is meta directory file (tsm.json)
                    if (metaFolderLocation > indexOfMetaDirectory) {
                      fileEntry.path = fileEntry.path.substring(0, indexOfMetaDirectory + 1);
                      fileEntry.name = TSCORE.TagUtils.extractDirectoryName(fileEntry.path) + "." + TSCORE.directoryExt;
                      fileEntry.isDirectory = true;
                    }

                    if (!fileEntry.isDirectory) { // TODO check if the main file exists
                      //  TSCORE.IO.getPropertiesPromise(fileEntry.path).then(function(mainFileEntry) {
                      //    searchResults.push(mainFileEntry);
                      searchResults.push(fileEntry);
                      resolve();
                      return;
                      //  }, function() {
                      //    console.log("main file does not exist anymore " + fileEntry.path);
                      //    resolve();
                      //  })
                    } else { // by tsm.json files
                      fileEntry.size = 0;
                      fileEntry.lmdt = 0;
                      searchResults.push(fileEntry);
                      resolve();
                      return;
                    }
                  } else { // file is regular text, md, json file
                    searchResults.push(fileEntry);
                    resolve();
                    return;
                  }
                } else { // file does not match
                  resolve();
                  return;
                }
              }, function(err) {
                console.log("Failed loading content for: " + fileEntry.path);
                resolve();
                return;
              });
            } else {
              resolve();
              return;
            }
          });
        }
        //, function(dirEntry) {}
      ).then(
        function(entries) {
          console.timeEnd("walkDirectorySearch");
          console.log("Found " + searchResults.length + " out of " + entries.length + " entries.");
          TSCORE.Search.nextQuery = "";
          TSCORE.PerspectiveManager.updateFileBrowserData(searchResults, true);
          TSCORE.hideWaitingDialog();
        },
        function(err) {
          console.warn("Error creating index: " + err);
        }
      ).catch(function() {
        TSCORE.hideWaitingDialog();
      });
      return false;
    } else {
      if (TSCORE.Config.getCalculateTags()) {
        // Find all tags in the current search results
        calculateTags(data);
      }
      return data;
    }
  }

  function calculateTags(data) {
    console.log('Calculating tags from search results');

    // TODO consider tags in sidecar files
    var allTags = [];
    data.forEach(function(fileEntry) {
      fileEntry.tags.forEach(function(tag) {
        allTags.push(tag.toLowerCase());
      });
    });
    var countData = _.countBy(allTags, function(obj) {
      return obj;
    });
    TSCORE.calculatedTags.length = 0;
    _.each(countData, function(count, tag) {
      TSCORE.calculatedTags.push({
        'title': tag,
        'type': 'plain',
        'count': count
      });
    });
    TSCORE.generateTagGroups();
  }

  // Public variables definition
  exports.currentQuery = currentQuery;
  exports.nextQuery = nextQuery;
  exports.recursiveSymbol = recursiveSymbol;

  // Public API definition    
  exports.searchData = searchData;
  exports.calculateTags = calculateTags;
});
