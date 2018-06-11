/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * @flow
 */

import Fuse from 'fuse.js';
// import ElasticLunr from 'elasticlunr';
import jmespath from 'jmespath';
import AppConfig from '../config';
import { Pro } from '../pro';

let currentQuery = '';
let nextQuery = '';
let caseSensitiveSearch = false; // TODO implement case sensitive search

// export type FileTypeGroups = 'images' | 'notes' | 'documents' | 'audio' | 'video' | 'archives';

export const FileTypeGroups = {
  any: [''],
  images: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tif', 'tiff', 'ico', 'webp', 'psd'],
  notes: ['md', 'mdown', 'txt', 'html'],
  documents: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'odt', 'ods'],
  audio: ['ogg', 'mp3', 'wav', 'wave'],
  video: ['ogv', 'mp4', 'avi', 'webm', 'mkv'],
  archives: ['zip', 'rar', 'gz', 'tgz', 'arc', '7z'],
  folders: ['folders'],
};

export type SearchQuery = {
  textQuery?: string,
  fileTypes?: Array<string>,
  tagConjunction?: 'AND' | 'OR',
  tags?: Array<string>,
  lastChanged?: Date
};


// id, name, isFile, tags, extension, size, lmdt, path

// index[?size > '9000'  && contains(path, 'Apple')]
// index[?size < '2000' || isFile=='false']
// index[?contains(path, 'testfiles')].[tags[?title=='todo']
// index[].[tags[?type=='sidecar']]
// index[?tags[?type=='sidecar']]
// index[?tags[?title=='todo' || title=='high' ]

/*
  {
    "description": "",
    "extension": "jpg",
    "isFile": true,
    "lmdt": 1479679132839,
    "name": "Apple-Notes-Mac2 (copy).jpg",
    "path":
      "/home/na/TagSpaces/testfiles/sidecarTests/Apple-Notes-Mac2 (copy).jpg",
    "size": 84162,
    "tags": [
      {
        "style":
          "color: #333333 !important; background-color: #ffad46 !important;",
        "title": "todo",
        "type": "sidecar"
      }
    ],
    "thumbPath":
      "/home/na/TagSpaces/testfiles/sidecarTests/.ts/Apple-Notes-Mac2 (copy).jpg.jpg",
    "uuid": "76075fc2-4a2f-4e27-a188-d96fece032aa"
  },
*/

const fuseOptions = {
  shouldSort: true,
  threshold: 0.3,
  location: 0,
  distance: 100,
  tokenize: true,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [{
    name: 'name',
    weight: 0.4
  }, {
    name: 'description',
    weight: 0.3
  }, {
    name: 'tags',
    weight: 0.3
  }]
};

function constructTagQuery(searchQuery: SearchQuery): string {
  let tagQuery = '';
  if (searchQuery.tags && searchQuery.tags.length >= 1) {
    tagQuery = 'tags[? (';
    searchQuery.tags.map(tag => {
      const cleanedTag = tag.trim();
      if (cleanedTag.length > 0) {
        tagQuery += 'title==\'' + cleanedTag + '\' || ';
      }
      return true;
    });
    if (tagQuery.endsWith('|| ')) {
      tagQuery = tagQuery.substring(0, tagQuery.length - 3) + ') ]';
    }
  }
  return tagQuery;
}

export default class Search {
  static searchLocationIndex(locationContent: Array<Object>, searchQuery: SearchQuery) {
    // let result = jmespath.search({ index: locationContent }, "index[?contains(name, '" + searchQuery.textQuery + "')]");
    // ?tags[?title=='todo' || title=='high'
    // index[?extension=='png' || extension=='jpg']

    const extensionQuery = Pro ? Pro.Search.constructFileTypeQuery(searchQuery) : '';
    const tagQuery = Pro ? Pro.Search.constructTagQuery(searchQuery) : constructTagQuery(searchQuery);

    let jmespathResults = locationContent;
    if (extensionQuery.length > 1 && tagQuery.length > 1) {
      const jmespathQuery = 'index[? ' + extensionQuery + ' && ' + tagQuery + ']';
      console.log('jmespathQuery: ' + jmespathQuery);
      jmespathResults = jmespath.search({ index: locationContent }, jmespathQuery);
    } else if (extensionQuery.length <= 1 && tagQuery.length > 1) {
      const jmespathQuery = 'index[? ' + tagQuery + ']';
      console.log('jmespathQuery: ' + jmespathQuery);
      jmespathResults = jmespath.search({ index: locationContent }, jmespathQuery);
    } else if (extensionQuery.length > 1 && tagQuery.length <= 1) {
      const jmespathQuery = 'index[? ' + extensionQuery + ']';
      console.log('jmespathQuery: ' + jmespathQuery);
      jmespathResults = jmespath.search({ index: locationContent }, jmespathQuery);
    }

    // console.log('JMES found: ' + jmespathResults.length);

    let results;
    if (searchQuery.textQuery && searchQuery.textQuery.length > 0) { // and fuse enabled
      const fuse = new Fuse(jmespathResults, fuseOptions);
      results = fuse.search(searchQuery.textQuery);
    } else {
      results = jmespathResults;
    }

    // console.log('Fuse found: ' + results.length);
    if (results.length >= AppConfig.maxSearchResult) {
      results = results.slice(0, AppConfig.maxSearchResult);
    }
    return results;
  }

  /* static prepareQuery(query) {
    // cleaning up the query, reducing the spaces
    let queryText = query.toLowerCase().replace(/^\s+|\s+$/g, '');
    const recursive = queryText.indexOf(recursiveSymbol) !== 0;
    if (!recursive) {
      queryText = queryText.substring(1, queryText.length);
    }

    const queryTerms = queryText.split(' ');
    const queryObj = {
      includedTerms: [],
      excludedTerms: [],
      includedTags: [],
      excludedTags: [],
      recursive,
      fileTypeFilter: () => { return true; }
    };

    // parsing the query terms
    queryTerms.forEach((value) => {
      if (value.length <= 1) {
        return;
      }

      if (value.indexOf('t:picture') === 0) {
        queryObj.fileTypeFilter = this.filterPictures;
      } else if (value.indexOf('t:note') === 0) {
        queryObj.fileTypeFilter = this.filterNotes;
      } else if (value.indexOf('t:doc') === 0) {
        queryObj.fileTypeFilter = this.filterDocuments;
      } else if (value.indexOf('t:audio') === 0) {
        queryObj.fileTypeFilter = this.filterAudioFiles;
      } else if (value.indexOf('t:video') === 0) {
        queryObj.fileTypeFilter = this.filterVideoFiles;
      } else if (value.indexOf('t:archive') === 0) {
        queryObj.fileTypeFilter = this.filterArchives;
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
  } */

  /* static filterFileObject(fileEntry, queryObj) {
    var parentDir = TagUtils.extractContainingDirectoryName(fileEntry.path).toLowerCase();
    var searchIn = fileEntry.name.toLowerCase();
    var fileNameTags;

    //if(!queryObj.fileTypeFilter(searchIn)) {
    //  return false;
    //}

    if (fileEntry.tags) {
      fileNameTags = fileEntry.tags;
    } else {
      fileNameTags = TagUtils.extractTags(fileEntry.path);
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
  } */

  /* static searchData(data, query) {
    // TODO make a switch in gui for content search
    var searchContentSupported = (isChrome || isFirefox) ? false : true;
    var queryObj = prepareQuery(query);
    var searchResults = [];
    var metaDirPattern = dirSeparator + metaFolder + dirSeparator;

    if (query.length > 0) {
      console.time("walkDirectorySearch");
      walkDirectory(currentPath, { recursive: queryObj.recursive },
        function (fileEntry) {
          return new Promise(function (resolve, reject) {
            var indexOfMetaDirectory = fileEntry.path.indexOf(metaDirPattern);

            // Searching in file names while skipping paths containing '/.ts/'
            if (indexOfMetaDirectory < 1 && filterFileObject(fileEntry, queryObj) && queryObj.fileTypeFilter(fileEntry.name.toLowerCase())) {
              searchResults.push(fileEntry);
              resolve();
              return;
            }

            // Searching in content
            if (searchContentSupported && filterTextBasedFiles(fileEntry.name)) { // Search in content
              IO.getFileContentPromise(fileEntry.path, "text").then(function (content) {
                var found;
                var metaExtLocation = fileEntry.path.lastIndexOf(metaFileExt); // .json

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
                  queryObj.includedTerms.forEach(function (term) {
                    if (content.indexOf(term[0]) >= 0) {
                      console.log("Term " + term[0] + " found in " + fileEntry.path);
                      found = true;
                    }
                  });
                }

                if (found) {
                  if (indexOfMetaDirectory > 0) { // file is in the meta folder

                    var contentExtLocation = fileEntry.path.lastIndexOf(contentFileExt); // .txt
                    var metaFolderLocation = fileEntry.path.lastIndexOf(metaFolderFile); // .ts

                    // file is meta file (json) and not tsm.json
                    if (metaExtLocation > indexOfMetaDirectory && metaFolderLocation < 0) {
                      fileEntry.name = fileEntry.name.substring(0, fileEntry.name.indexOf(metaFileExt));
                      fileEntry.path = fileEntry.path.substring(0, indexOfMetaDirectory + 1) + fileEntry.name;
                    }

                    // file is text file containing extracted contentent (txt)
                    if (contentExtLocation > indexOfMetaDirectory) {
                      fileEntry.name = fileEntry.name.substring(0, fileEntry.name.indexOf(contentFileExt));
                      fileEntry.path = fileEntry.path.substring(0, indexOfMetaDirectory + 1) + fileEntry.name;
                    }

                    // file is meta directory file (tsm.json)
                    if (metaFolderLocation > indexOfMetaDirectory) {
                      fileEntry.path = fileEntry.path.substring(0, indexOfMetaDirectory + 1);
                      fileEntry.name = TagUtils.extractDirectoryName(fileEntry.path) + "." + directoryExt;
                      fileEntry.isDirectory = true;
                    }

                    if (!fileEntry.isDirectory) { // TODO check if the main file exists
                      //  IO.getPropertiesPromise(fileEntry.path).then(function(mainFileEntry) {
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
              }, function (err) {
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
        function (entries) {
          console.timeEnd("walkDirectorySearch");
          console.log("Found " + searchResults.length + " out of " + entries.length + " entries.");
          Search.nextQuery = "";
          PerspectiveManager.updateFileBrowserData(searchResults, true);
          hideWaitingDialog();
        },
        function (err) {
          console.warn("Error creating index: " + err);
        }
        ).catch(function () {
          hideWaitingDialog();
        });
      return false;
    } else {
      if (Config.getCalculateTags()) {
        // Find all tags in the current search results
        calculateTags(data);
      }
      return data;
    }
  } */

  /*
  static calculateTags(data) {
    console.log('Calculating tags from search results');

    // TODO consider tags in sidecar files
    var allTags = [];
    data.forEach(function (fileEntry) {
      fileEntry.tags.forEach(function (tag) {
        allTags.push(("" + tag).toLowerCase());
      });
    });
    var countData = _.countBy(allTags, function (obj) {
      return obj;
    });
    calculatedTags.length = 0;
    _.each(countData, function (count, tag) {
      calculatedTags.push({
        'title': tag,
        'type': 'plain',
        'count': count
      });
    });
    generateTagGroups();
  } */
}
