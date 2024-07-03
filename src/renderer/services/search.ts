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
import jmespath from '@gorillastack/jmespath';
import { isPathStartsWith } from '@tagspaces/tagspaces-common/paths';
import { parseGeoLocation } from '-/utils/geo';
import { extractTimePeriod } from '-/utils/dates';
import { Pro } from '../pro';
import { TS } from '-/tagspaces.namespace';

// export type FileTypeGroups = 'images' | 'notes' | 'documents' | 'audio' | 'video' | 'archives';

export const FileTypeGroups = {
  any: [''],
  images: [
    'jpg',
    'jpeg',
    'jfif',
    'jif',
    'jiff',
    'png',
    'gif',
    'svg',
    'webp',
    'bmp',
    'tga',
    'tif',
    'tiff',
    'nef',
    'cr2',
    'dng',
    'psd',
    'avif',
    'nef',
  ],
  notes: ['md', 'mdown', 'txt', 'html'],
  documents: [
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'odt',
    'ods',
    'odp',
    'pptx',
    'numbers',
    'potx',
    'sldx',
    'dotx',
  ],
  audio: ['ogg', 'mp3', 'wav', 'wave', 'flac', 'acc'],
  video: ['ogv', 'mp4', 'webm', 'm4v', 'mkv', 'avi', '3gp', '3g2', 'mov'],
  archives: ['zip', 'rar', 'gz', 'tgz', 'arc', '7z'],
  bookmarks: ['url', 'lnk', 'sym', 'desktop', 'website'],
  ebooks: ['epub', 'mobi', 'azw', 'prc', 'azw1', 'azw3', 'azw4', 'azw8', 'azk'],
  emails: ['eml', 'msg'],
  folders: ['folders'],
  files: ['files'],
  untagged: ['untagged'],
};

export function haveSearchFilters(searchQuery: TS.SearchQuery) {
  return (
    searchQuery.textQuery ||
    (searchQuery.tagsAND !== undefined && searchQuery.tagsAND.length > 0) ||
    (searchQuery.tagsNOT !== undefined && searchQuery.tagsNOT.length > 0) ||
    (searchQuery.tagsOR !== undefined && searchQuery.tagsOR.length > 0) ||
    (searchQuery.fileTypes !== undefined &&
      searchQuery.fileTypes !== FileTypeGroups.any) ||
    searchQuery.lastModified ||
    searchQuery.tagTimePeriodFrom ||
    searchQuery.tagTimePeriodTo ||
    searchQuery.tagPlaceLat ||
    searchQuery.tagPlaceLong ||
    searchQuery.fileSize
  );
}

export function defaultTitle(searchQuery: TS.SearchQuery) {
  let title = '';
  if (searchQuery.textQuery) {
    title += searchQuery.textQuery;
  }
  if (searchQuery.tagsAND && searchQuery.tagsAND.length > 0) {
    title += searchQuery.tagsAND.map((tag) => ' +' + tag.title);
  }
  if (searchQuery.tagsNOT && searchQuery.tagsNOT.length > 0) {
    title += searchQuery.tagsNOT.map((tag) => ' -' + tag.title);
  }
  if (searchQuery.tagsOR && searchQuery.tagsOR.length > 0) {
    title += searchQuery.tagsOR.map((tag) => ' |' + tag.title);
  }
  return title.trim();
}

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
  ignoreLocation: true,
  distance: 1000,
  tokenize: true,
  minMatchCharLength: 2,
  useExtendedSearch: true,
  keys: [
    {
      name: 'name',
      getFn: (entry) => entry.name,
      weight: 0.2,
    },
    {
      name: 'id',
      getFn: (entry) => entry.meta?.id,
      weight: 0.1,
    },
    {
      name: 'description',
      getFn: (entry) => entry.meta?.description,
      weight: 0.2,
    },
    {
      name: 'textContent',
      getFn: (entry) => entry.textContent,
      weight: 0.2,
    },
    {
      name: 'tags',
      getFn: (entry) => entry.tags?.title,
      weight: 0.2,
    },
    {
      name: 'path', // TODO ignore .ts folder, should not be in the index
      getFn: (entry) => entry.path,
      weight: 0.1,
    },
  ],
};

// Constructs the string for the JMESPath search query.  We first filter for all ORTags, then continuously pipe the result in to the
// filters for all AND and NOT tags. The Pro version can pipe the result into an additional filter for extension instead of tags.title.
// The final string for the tag search should look like this:
// index[? tags[? title=='ORTag1' || title=='ORTag2']] | [? tags[? title=='ANDTag1']] | [? tags[? title=='ANDTag2']] | [?!(tags[? title=='NOTTag1'])] | [?!(tags[? title=='NOTTag2'])] | extensionFilter
function constructjmespathQuery(searchQuery: TS.SearchQuery): string {
  let jmespathQuery = '';
  const ANDtagsExist = searchQuery.tagsAND && searchQuery.tagsAND.length >= 1;
  const ORtagsExist = searchQuery.tagsOR && searchQuery.tagsOR.length >= 1;
  const NOTtagsExist = searchQuery.tagsNOT && searchQuery.tagsNOT.length >= 1;
  if (ANDtagsExist || ORtagsExist || NOTtagsExist) {
    jmespathQuery = '[?';

    if (ORtagsExist) {
      jmespathQuery += ' tags[? ';
      searchQuery.tagsOR.forEach((tag) => {
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
      searchQuery.tagsAND.forEach((tag) => {
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
      searchQuery.tagsNOT.forEach((tag) => {
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

function prepareIndex(
  index: Array<TS.FileSystemEntry>,
  showUnixHiddenEntries: boolean,
) {
  console.time('PreparingIndex');
  let filteredIndex = [];
  if (showUnixHiddenEntries) {
    filteredIndex = index;
  } else {
    filteredIndex = index.filter(
      (entry: TS.FileSystemEntry) => !entry.name.startsWith('.'),
    );
  }
  const enhancedIndex = filteredIndex.map((entry: any) => {
    const tags = [...entry.tags];
    let lat = null;
    let lon = null;
    let fromTime = null;
    let toTime = null;
    let enhancedTags: Array<TS.Tag> = [];
    if (tags && tags.length) {
      enhancedTags = tags.map((tag) => {
        const enhancedTag: TS.Tag = {
          ...tag,
        };
        try {
          const location = parseGeoLocation(tag.title);
          if (location !== undefined) {
            ({ lat, lon } = location);
          }
          const { fromDateTime, toDateTime } = extractTimePeriod(tag.title);
          if (fromDateTime && toDateTime) {
            fromTime = fromDateTime.getTime();
            toTime = toDateTime.getTime();
          }
          if (tag.title.toLowerCase() !== tag.title) {
            enhancedTag.originTitle = tag.title;
            enhancedTag.title = tag.title.toLowerCase();
          }
        } catch (e) {
          console.log(
            'Error parsing tag ' + JSON.stringify(tag) + ' from ' + entry.path,
          );
        }
        return enhancedTag;
      });
    }
    const enhancedEntry = {
      ...entry,
      tags: enhancedTags,
    };
    if (lat) {
      enhancedEntry.lat = lat;
    }
    if (lon) {
      enhancedEntry.lon = lon;
    }
    if (fromTime) {
      enhancedEntry.fromTime = fromTime;
    }
    if (toTime) {
      enhancedEntry.toTime = toTime;
    }
    return enhancedEntry;
  });
  console.timeEnd('PreparingIndex');
  return enhancedIndex;
}

function setOriginTitle(results: Array<Object>) {
  return results.map((entry: any) => {
    if (entry.tags && entry.tags.length) {
      entry.tags.map((tag) => {
        if (tag.originTitle) {
          tag.title = tag.originTitle;
        }
        return tag;
      });
    }
    return entry;
  });
}

export default class Search {
  static searchLocationIndex = (
    locationContent: Array<TS.FileSystemEntry>,
    searchQuery: TS.SearchQuery,
  ): Promise<TS.FileSystemEntry[]> =>
    new Promise((resolve, reject) => {
      console.time('searchtime');
      if (!locationContent || locationContent.length === 0) {
        reject(new Error('No Index')); //t('core:noIndex')));
      }
      const jmespathQuery = constructjmespathQuery(searchQuery);
      let results = prepareIndex(
        locationContent,
        searchQuery.showUnixHiddenEntries,
      );
      let searched = false;

      // Limiting the search to current folder only (with sub-folders)
      if (searchQuery.searchBoxing === 'folder') {
        results = results.filter((entry) =>
          isPathStartsWith(entry.path, searchQuery.currentDirectory),
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
        if (
          searchQuery.searchType &&
          searchQuery.searchType.includes('strict')
        ) {
          results = results.filter((entry) => {
            const ignoreCase = searchQuery.searchType === 'semistrict';
            const textQuery = ignoreCase
              ? searchQuery.textQuery.toLowerCase()
              : searchQuery.textQuery;
            // const name = ignoreCase ? entry.name && entry.name.toLowerCase() : entry.name;
            let description = entry.meta?.description;
            if (ignoreCase && description) {
              description = description.toLowerCase();
            }
            let metaId = entry.meta?.id;
            if (ignoreCase && metaId) {
              metaId = metaId.toLowerCase();
            }
            let textContent = entry.textContent;
            if (ignoreCase && textContent) {
              textContent = textContent.toLowerCase();
            }
            let path = entry.path;
            if (ignoreCase && path) {
              path = path.toLowerCase();
            }
            // const foundInName = name && name.includes(textQuery);
            const foundInDescr = description && description.includes(textQuery);
            const foundInMetaId = metaId && metaId.includes(textQuery);
            const foundInContent =
              textContent && textContent.includes(textQuery);
            const foundInPath = path && path.includes(textQuery);
            return (
              foundInPath || foundInDescr || foundInContent || foundInMetaId
            ); // || foundInName;
          });
        } else {
          const fuse = new Fuse(results, fuseOptions);
          results = fuse.search(searchQuery.textQuery);
        }
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
          if (results[i].item !== undefined) {
            results[i] = results[i].item;
          }
          if (results[i].textContent) {
            results[i].textContent = undefined;
          }
        }
        console.log('Results send: ' + results.length);
        console.timeEnd('searchtime');
        resolve(setOriginTitle(results));
        return true;
      }
      results = [];
      console.timeEnd('searchtime');
      resolve(results);
    });
}
