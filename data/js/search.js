/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
  'use strict';
  console.log('Loading search.js ...');
  var TSCORE = require('tscore');
  var currentQuery = '';
  var nextQuery = '';

  var search4Tag = function(tagQuery) {
    TSCORE.Search.nextQuery = '+' + tagQuery;
    $('#searchBox').val('+' + tagQuery);
    TSCORE.PerspectiveManager.redrawCurrentPerspective();
    TSCORE.showSearchArea();
  };

  var search4String = function(query) {
    TSCORE.Search.nextQuery = '+' + query;
    $('#searchBox').val('+' + query);
    TSCORE.PerspectiveManager.redrawCurrentPerspective();
    TSCORE.showSearchArea();
  };

  var calculateTags = function(data) {
    console.log('Calculating tags from search results');
    var allTags = [];
    data.forEach(function(fileEntry) {
      fileEntry[TSCORE.fileListTAGS].forEach(function(tag) {
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
  };

  function prepareQuery(queryText) {
    // cleaning up the query, reducing the spaces
    var queryText = queryText.toLowerCase().replace(/^\s+|\s+$/g, '');
    var recursive = queryText.indexOf('?') === 0;
    if (recursive) {
      queryText = queryText.substring(1, queryText.length);
    }
    var queryTerms = queryText.split(' ');
    var queryObj = {
      includedTerms: [],
      excludedTerms: [],
      includedTags: [],
      excludedTags: [],
      recursive: recursive,
    };

    // parsing the query
    queryTerms.forEach(function(value) {
      if (value.length > 1) {
        if (value.indexOf('!') === 0) {
          queryObj.excludedTerms.push([
            value.substring(1, value.length),
            false
          ]);
        } else if (value.indexOf('+') === 0) {
          queryObj.includedTags.push([
            value.substring(1, value.length),
            true
          ]);
        } else if (value.indexOf('-') === 0) {
          queryObj.excludedTags.push([
            value.substring(1, value.length),
            true
          ]);
        } else {
          queryObj.includedTerms.push([
            value,
            false
          ]);
        }
      }
    });

    return queryObj;
  }

  function fileContentFilter(filePath) {

    return /\.(html|txt|xml|md|json)$/i.test(filePath);
  }

  function filterFileObject(fileEntry, queryObj) {
    var parentDir = TSCORE.TagUtils.extractParentDirectoryPath(fileEntry.path).toLowerCase();
    var searchIn = fileEntry.name.toLowerCase();
    var tags;

    // TODO consider tags in .ts/meta.json and ./ts/ts.json
    if (fileEntry.tags) {
      tags = fileEntry.tags;
    } else {
      tags = TSCORE.TagUtils.extractTags(fileEntry.path);
    }

    var result = true;

    if (tags.length < 1 && queryObj.includedTags.length > 0) {
      return false;
    }
    for (var i = 0; i < queryObj.includedTerms.length; i++) {
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
      for (var j = 0; j < tags.length; j++) {
        if (tags[j].toLowerCase() == queryObj.includedTags[i][0]) {
          queryObj.includedTags[i][1] = true;
        }
      }
    }
    for (var i = 0; i < queryObj.includedTags.length; i++) {
      result = result & queryObj.includedTags[i][1];
    }
    for (var i = 0; i < queryObj.excludedTags.length; i++) {
      queryObj.excludedTags[i][1] = true;
      for (var j = 0; j < tags.length; j++) {
        if (tags[j].toLowerCase() == queryObj.excludedTags[i][0]) {
          queryObj.excludedTags[i][1] = false;
        }
      }
    }
    for (var i = 0; i < queryObj.excludedTags.length; i++) {
      result = result & queryObj.excludedTags[i][1];
    }
    return result;
  }

  var searchData = function(data, query) {

    //todo make a switch in gui for content search
    var searchInContent = (isChrome || isFirefox)?false:true
    var queryObj = prepareQuery(query);

    var searchResults = [];
    var scan = function(content, fileEntry) {
      return new Promise(function(resolve, reject) {
        var found = false;
        queryObj.includedTerms.forEach(function(term) {
          if (content.indexOf(term[0]) >= 0) {
            found = true;
          }
          if (found) {
            console.log("Term " + term[0] + " found in " + fileEntry.path);
            searchResults.push(fileEntry);
          }
        });
        resolve();
      });
    };

    if (query.length > 0) {
      TSCORE.showWaitingDialog($.i18n.t("ns.common:waitDialogDiectoryIndexing"));
      console.time("walkDirectorySearch");
      TSCORE.Utils.walkDirectory(TSCORE.currentPath, {recursive: queryObj.recursive},
        function(fileEntry) {
          return new Promise(function(resolve, reject) {
            if (filterFileObject(fileEntry, queryObj)) {
              searchResults.push(fileEntry);
            }
            if (searchInContent && fileContentFilter(fileEntry.name)) {
              TSCORE.IO.loadTextFilePromise(fileEntry.path).then(function(content) {
                //return scan(content, fileEntry);
                var found = false;
                queryObj.includedTerms.forEach(function(term) {
                  if (content.indexOf(term[0]) >= 0) {
                    found = true;
                  }
                  if (found) {
                    console.log("Term " + term[0] + " found in " + fileEntry.path);
                    searchResults.push(fileEntry);
                  }
                });
              }, function(err) {
                console.log("Failed loading content for: " + fileEntry.path);
              });
            }
            resolve();
          });
        }
        //, function(dirEntry) {}
      ).then(
        function(entries) {
          console.timeEnd("walkDirectorySearch");
          console.log("Found " + searchResults.length + " out of " + entries.length + " entries.");
          TSCORE.Search.nextQuery = "";
          TSCORE.PerspectiveManager.updateFileBrowserData(searchResults);
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
        exports.calculateTags(data);
      }
      return data;
    }
  };

  // Public variables definition
  exports.currentQuery = currentQuery;
  exports.nextQuery = nextQuery;

  // Public API definition    
  exports.searchData = searchData;
  exports.searchForTag = search4Tag;
  exports.searchForString = search4String;
  exports.calculateTags = calculateTags;
});
