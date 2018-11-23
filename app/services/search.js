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
  files: ['files'],
  untagged: ['untagged'],
};

export type SearchQuery = {
  textQuery?: string,
  fileTypes?: Array<string>,
  tagConjunction?: 'AND' | 'OR',
  tags?: Array<string>, // TODO Array<Tag>
  lastChanged?: Date,
  maxSearchResults?: number
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
  }, {
    name: 'path', // TODO ignore .ts folder, should not be in the index
    weight: 0.1
  }]
};

function constructTagQuery(searchQuery: SearchQuery): string {
  let tagQuery = '';
  if (searchQuery.tags && searchQuery.tags.length >= 1) {
    tagQuery = 'tags[? (';
    searchQuery.tags.map(tag => {
      const cleanedTag = tag.trim(); // .toLowerCase();
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

function constructFuseQuery(searchQuery: SearchQuery): string {
  if (!searchQuery) return '';
  let fuseQuery = (searchQuery.textQuery) ? searchQuery.textQuery : '';
  if (searchQuery.tags && searchQuery.tags.length >= 1) {
    searchQuery.tags.map(tag => {
      const cleanedTag = tag.trim().toLowerCase();
      fuseQuery = fuseQuery + ' ' + cleanedTag;
      return true;
    });
  }
  return fuseQuery;
}

export default class Search {
  static searchLocationIndex = (locationContent: Array<Object>, searchQuery: SearchQuery): Promise<Array<Object> | []> => new Promise((resolve) => {
    // let result = jmespath.search({ index: locationContent }, "index[?contains(name, '" + searchQuery.textQuery + "')]");
    // ?tags[?title=='todo' || title=='high'
    // index[?extension=='png' || extension=='jpg']

    let results;

    const extensionQuery = Pro ? Pro.Search.constructFileTypeQuery(searchQuery) : '';
    const tagQuery = Pro ? Pro.Search.constructTagQuery(searchQuery) : constructTagQuery(searchQuery);
    let jmespathQuery;

    if (extensionQuery.length > 1 && tagQuery.length > 1) { // extension query and tags available
      jmespathQuery = 'index[? ' + extensionQuery + ' && ' + tagQuery + ']';
    } else if (extensionQuery.length <= 1 && tagQuery.length > 1) { // only tags
      jmespathQuery = 'index[? ' + tagQuery + ']';
    } else if (extensionQuery.length > 1 && tagQuery.length <= 1) { // only extension query
      jmespathQuery = 'index[? ' + extensionQuery + ']';
    }
    if (jmespathQuery) {
      console.log('jmespath query: ' + jmespathQuery);
      console.time('jmespath');
      results = jmespath.search({ index: results || locationContent }, jmespathQuery);
      console.timeEnd('jmespath');
      console.log('jmespath results: ' + results.length);
    }

    if (searchQuery.textQuery && searchQuery.textQuery.length > 1) {
      const fuseQuery = constructFuseQuery(searchQuery);
      console.log('fuse query: ' + fuseQuery);
      console.time('fuse');
      const fuse = new Fuse(results || locationContent, fuseOptions);
      results = fuse.search(fuseQuery);
      console.timeEnd('fuse');
    }

    if (results) {
      console.log('Results found: ' + results.length);
      if (searchQuery.maxSearchResults && results.length >= searchQuery.maxSearchResults) {
        results = results.slice(0, searchQuery.maxSearchResults);
      }
      console.log('Results send: ' + results.length);
      resolve(results);
      return true;
    }
    results = [];
    resolve(results);
  });
}
