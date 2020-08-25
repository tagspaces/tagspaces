/* eslint-disable compat/compat */
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
 */

import Fuse from 'fuse.js';
import jmespath from 'jmespath';
import { Tag } from '../reducers/taglibrary';
import { Pro } from '../pro';
import { FileSystemEntry } from './utils-io';

// export type FileTypeGroups = 'images' | 'notes' | 'documents' | 'audio' | 'video' | 'archives';

export const FileTypeGroups = {
  any: [''],
  images: [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'bmp',
    'tif',
    'tiff',
    'ico',
    'webp',
    'psd'
  ],
  notes: ['md', 'mdown', 'txt', 'html'],
  documents: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'odt', 'ods'],
  audio: ['ogg', 'mp3', 'wav', 'wave'],
  video: ['ogv', 'mp4', 'webm', 'm4v', 'mkv', 'avi'],
  archives: ['zip', 'rar', 'gz', 'tgz', 'arc', '7z'],
  bookmarks: ['url', 'lnk', 'sym'],
  ebooks: ['epub', 'mobi', 'azw', 'prc', 'azw1', 'azw3', 'azw4', 'azw8', 'azk'],
  folders: ['folders'],
  files: ['files'],
  untagged: ['untagged']
};

export type SearchQuery = {
  textQuery?: string;
  fileTypes?: Array<string>;
  tagsAND?: Array<Tag>;
  tagsOR?: Array<Tag>;
  tagsNOT?: Array<Tag>;
  lastModified?: string;
  fileSize?: string;
  searchBoxing?: 'location' | 'folder';
  forceIndexing?: boolean;
  currentDirectory?: string;
  tagTimePeriodFrom?: number | null;
  tagTimePeriodTo?: number | null;
  tagPlaceLat?: number | null;
  tagPlaceLong?: number | null;
  tagPlaceRadius?: number | null;
  maxSearchResults?: number;
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
    "textConten": "adsadas dasda",
    "lat": "",
    "lon": "",
    "fromTime": "",
    "toTime": "",
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
  keys: [
    {
      name: 'name',
      weight: 0.25
    },
    {
      name: 'description',
      weight: 0.25
    },
    {
      name: 'textContent',
      weight: 0.25
    },
    {
      name: 'tags',
      weight: 0.2
    },
    {
      name: 'path', // TODO ignore .ts folder, should not be in the index
      weight: 0.05
    }
  ]
};

// Constructs the string for the JMESPath search query.  We first filter for all ORTags, then continuously pipe the result in to the
// filters for all AND and NOT tags. The Pro version can pipe the result into an additional filter for extension instead of tags.title.
// The final string for the tag search should look like this:
// index[? tags[? title=='ORTag1' || title=='ORTag2']] | [? tags[? title=='ANDTag1']] | [? tags[? title=='ANDTag2']] | [?!(tags[? title=='NOTTag1'])] | [?!(tags[? title=='NOTTag2'])] | extensionFilter
function constructjmespathQuery(searchQuery: SearchQuery): string {
  let jmespathQuery = '';
  const ANDtagsExist = searchQuery.tagsAND && searchQuery.tagsAND.length >= 1;
  const ORtagsExist = searchQuery.tagsOR && searchQuery.tagsOR.length >= 1;
  const NOTtagsExist = searchQuery.tagsNOT && searchQuery.tagsNOT.length >= 1;
  if (ANDtagsExist || ORtagsExist || NOTtagsExist) {
    jmespathQuery = '[?';

    if (ORtagsExist) {
      jmespathQuery += ' tags[? ';
      searchQuery.tagsOR.forEach(tag => {
        const cleanedTagTitle = tag.title.trim().toLowerCase();
        if (cleanedTagTitle.length > 0) {
          jmespathQuery += "title=='" + cleanedTagTitle + "' || ";
        }
        return true;
      });
    }

    if (ANDtagsExist) {
      if (jmespathQuery.endsWith(' || ')) {
        jmespathQuery =
          jmespathQuery.substring(0, jmespathQuery.length - 4) +
          ']] | [? tags[? ';
      } else {
        jmespathQuery += ' tags[? ';
      }
      searchQuery.tagsAND.forEach(tag => {
        const cleanedTagTitle = tag.title.trim().toLowerCase();
        if (cleanedTagTitle.length > 0) {
          jmespathQuery += "title=='" + cleanedTagTitle + "']] | [? tags[? ";
        }
      });
    }

    if (NOTtagsExist) {
      if (jmespathQuery.endsWith(' || ')) {
        jmespathQuery =
          jmespathQuery.substring(0, jmespathQuery.length - 4) +
          ']] | [?!(tags[? ';
      } else if (jmespathQuery.endsWith('[? tags[? ')) {
        jmespathQuery =
          jmespathQuery.substring(0, jmespathQuery.length - 10) + '[?!(tags[? ';
      } else {
        jmespathQuery += '!(tags[? ';
      }
      searchQuery.tagsNOT.forEach(tag => {
        const cleanedTagTitle = tag.title.trim().toLowerCase();
        if (cleanedTagTitle.length > 0) {
          jmespathQuery += "title=='" + cleanedTagTitle + "'])] | [?!(tags[? ";
        }
        return true;
      });
    }

    if (jmespathQuery.endsWith(' || ')) {
      jmespathQuery =
        jmespathQuery.substring(0, jmespathQuery.length - 4) + ']]';
    } else if (jmespathQuery.endsWith(' | [? tags[? ')) {
      jmespathQuery = jmespathQuery.substring(0, jmespathQuery.length - 13);
    } else if (jmespathQuery.endsWith(' | [?!(tags[? ')) {
      jmespathQuery = jmespathQuery.substring(0, jmespathQuery.length - 14);
    }
  }

  const extensionQuery = Pro
    ? Pro.Search.constructFileTypeQuery(searchQuery)
    : '';
  if (extensionQuery.length > 0) {
    jmespathQuery =
      jmespathQuery.length > 0
        ? jmespathQuery + ' | ' + extensionQuery
        : extensionQuery;
  }

  if (jmespathQuery.length > 0) {
    return 'index' + jmespathQuery;
  }
  return jmespathQuery;
}

function prepareIndex(index: Array<Object>) {
  console.time('PreparingIndex');
  let resultIndex = [];
  if (Pro && Pro.Search && Pro.Search.prepareIndex) {
    resultIndex = Pro.Search.prepareIndex(index);
  } else {
    resultIndex = index.map((entry: any) => {
      const tags = [...entry.tags];
      if (tags && tags.length) {
        tags.map(tag => {
          tag.title = tag.title.toLowerCase();
          return tag;
        });
      }
      return {
        ...entry,
        tags
      };
    });
  }
  console.timeEnd('PreparingIndex');
  return resultIndex;
}

export default class Search {
  static searchLocationIndex = (
    locationContent: Array<FileSystemEntry>,
    searchQuery: SearchQuery
  ): Promise<Array<FileSystemEntry> | []> =>
    new Promise(resolve => {
      console.time('searchtime');
      const jmespathQuery = constructjmespathQuery(searchQuery);
      let results = prepareIndex(locationContent);
      let searched = false;

      // Limiting the search to current folder only (with sub-folders)
      if (searchQuery.searchBoxing === 'folder') {
        results = results.filter(entry =>
          entry.path.startsWith(searchQuery.currentDirectory)
        );
      }

      if (jmespathQuery) {
        const resultCount = results.length;
        console.log('jmespath query: ' + jmespathQuery);
        console.time('jmespath');
        results = jmespath.search({ index: results }, jmespathQuery);
        console.timeEnd('jmespath');
        console.log('jmespath results: ' + results.length);
        searched = searched || results.length <= resultCount;
      }

      if (Pro && Pro.Search.filterIndex) {
        const resultCount = results.length;
        results = Pro.Search.filterIndex(results, searchQuery);
        searched = searched || results.length <= resultCount;
      }

      if (searchQuery.textQuery && searchQuery.textQuery.length > 1) {
        const resultCount = results.length;
        console.log('fuse query: ' + searchQuery.textQuery);
        console.time('fuse');
        const fuse = new Fuse(results, fuseOptions);
        results = fuse.search(searchQuery.textQuery);
        console.timeEnd('fuse');
        searched = searched || results.length <= resultCount;
      }

      if (searched) {
        console.log('Results found: ' + results.length);
        if (
          searchQuery.maxSearchResults &&
          results.length >= searchQuery.maxSearchResults
        ) {
          results = results.slice(0, searchQuery.maxSearchResults);
        }
        // Removing textContent as not needed for the search results
        for (let i = 0, len = results.length; i < len; i += 1) {
          results[i] = results[i].item;
          /*if (results[i].textContent) {
            results[i].textContent = undefined;
          }*/
        }
        console.log('Results send: ' + results.length);
        console.timeEnd('searchtime');
        resolve(results);
        return true;
      }
      results = [];
      console.timeEnd('searchtime');
      resolve(results);
    });
}
