/* eslint-disable compat/compat */
/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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

import AppConfig from '-/AppConfig';
import { getAllTags } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { extractTimePeriod } from '-/utils/dates';
import { parseGeoLocation } from '-/utils/geo';
import jmespath from '@gorillastack/jmespath';
import { isPathStartsWith } from '@tagspaces/tagspaces-common/paths';
import Fuse from 'fuse.js';

export function haveSearchFilters(searchQuery: TS.SearchQuery) {
  return (
    searchQuery &&
    (searchQuery.textQuery ||
      (searchQuery.tagsAND !== undefined && searchQuery.tagsAND.length > 0) ||
      (searchQuery.tagsNOT !== undefined && searchQuery.tagsNOT.length > 0) ||
      (searchQuery.tagsOR !== undefined && searchQuery.tagsOR.length > 0) ||
      (searchQuery.fileTypes !== undefined &&
        searchQuery.fileTypes !== AppConfig.SearchTypeGroups.any) ||
      searchQuery.lastModified ||
      searchQuery.dateCreated ||
      searchQuery.tagTimePeriodFrom ||
      searchQuery.tagTimePeriodTo ||
      searchQuery.tagPlaceLat ||
      searchQuery.tagPlaceLong ||
      searchQuery.fileSize)
  );
}

export function defaultTitle(searchQuery: TS.SearchQuery) {
  let title = '';
  if (searchQuery) {
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
    // {
    //   name: 'tags',
    //   getFn: (entry) => entry.tags?.title,
    //   weight: 0.2,
    // },
    {
      name: 'tagsDescription',
      getFn: (entry) => entry.tagsDescription,
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
// filters for all AND and NOT tags. Both versions can pipe the result into an additional filter for extension instead of tags.title.
// The final string for the tag search should look like this:
// index[? tags[? title=='ORTag1' || title=='ORTag2']] | [? tags[? title=='ANDTag1']] | [? tags[? title=='ANDTag2']] | [?!(tags[? title=='NOTTag1'])] | [?!(tags[? title=='NOTTag2'])] | extensionFilter
function constructjmespathQuery(searchQuery: TS.SearchQuery): string {
  const ANDtagsExist = searchQuery.tagsAND && searchQuery.tagsAND.length >= 1;
  const ORtagsExist = searchQuery.tagsOR && searchQuery.tagsOR.length >= 1;
  const NOTtagsExist = searchQuery.tagsNOT && searchQuery.tagsNOT.length >= 1;

  if (!ANDtagsExist && !ORtagsExist && !NOTtagsExist) {
    const extensionQuery = constructFileTypeQuery(searchQuery);
    return extensionQuery.length > 0 ? 'index' + extensionQuery : '';
  }

  const queryParts: string[] = [];

  if (ORtagsExist) {
    const orTags = searchQuery.tagsOR
      .map((tag) => tag.title.trim().toLowerCase())
      .filter((title) => title.length > 0)
      .map((title) => `title=='${title}'`)
      .join(' || ');
    queryParts.push(`[? tags[? ${orTags}]]`);
  }

  if (ANDtagsExist) {
    searchQuery.tagsAND.forEach((tag) => {
      const cleanedTagTitle = tag.title.trim().toLowerCase();
      if (cleanedTagTitle.length > 0) {
        queryParts.push(`[? tags[? title=='${cleanedTagTitle}']]`);
      }
    });
  }

  if (NOTtagsExist) {
    searchQuery.tagsNOT.forEach((tag) => {
      const cleanedTagTitle = tag.title.trim().toLowerCase();
      if (cleanedTagTitle.length > 0) {
        queryParts.push(`[?!(tags[? title=='${cleanedTagTitle}'])]`);
      }
    });
  }

  let jmespathQuery = queryParts.join(' | ');

  const extensionQuery = constructFileTypeQuery(searchQuery);
  if (extensionQuery.length > 0) {
    jmespathQuery =
      jmespathQuery.length > 0
        ? jmespathQuery + ' | ' + extensionQuery
        : extensionQuery;
  }

  return jmespathQuery.length > 0 ? 'index' + jmespathQuery : '';
}

function prepareIndex(
  index: Array<TS.FileSystemEntry>,
  tagDelimiter,
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
    const tags = getAllTags(entry, tagDelimiter);
    let lat = null;
    let lon = null;
    let fromTime = null;
    let toTime = null;
    let tagsDescription = '';
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
          if (tag.description) {
            tagsDescription += ' ' + String(tag.description);
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

    if (entry.meta?.tags) {
      for (const tag of entry.meta.tags) {
        if (tag.description) {
          tagsDescription += ' ' + String(tag.description);
        }
      }
    }

    const enhancedEntry = {
      ...entry,
      tags: enhancedTags,
      tagsDescription: tagsDescription.trim(),
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
    tagDelimiter: string,
  ): Promise<TS.FileSystemEntry[]> =>
    new Promise((resolve, reject) => {
      console.time('searchtime');
      if (!locationContent || locationContent.length === 0) {
        reject(new Error('No Index')); //t('core:noIndex')));
      }
      const jmespathQuery = constructjmespathQuery(searchQuery);
      let results = prepareIndex(
        locationContent,
        tagDelimiter,
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

      const resultCount = results.length;
      results = filterIndex(results, searchQuery);
      searched = searched || results.length <= resultCount;

      if (
        searchQuery &&
        searchQuery.textQuery &&
        searchQuery.textQuery.length > 1
      ) {
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
          searchQuery &&
          searchQuery.maxSearchResults &&
          results.length >= searchQuery.maxSearchResults
        ) {
          results = results.slice(0, searchQuery.maxSearchResults);
        }
        // Removing textContent as not needed for the search results
        results = results.map((result) => {
          const item = result.item !== undefined ? result.item : result;
          if (item.textContent) {
            item.textContent = undefined;
          }
          return item;
        });
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

function filterByDatePeriod(
  items: TS.SearchIndex[],
  periodKey: string | undefined,
  getTimeValue: (item: TS.SearchIndex) => number | undefined,
): TS.SearchIndex[] {
  if (!periodKey) return items;

  const now = new Date();
  // start of today in local timezone
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const msInDay = 1000 * 60 * 60 * 24;

  // Get the appropriate timestamp range
  let fromTs: number | null = null;
  let toTs: number | null = null;

  if (periodKey === AppConfig.SearchTimePeriods.today.key) {
    fromTs = startOfToday;
    toTs = Number.MAX_VALUE;
  } else if (periodKey === AppConfig.SearchTimePeriods.yesterday.key) {
    fromTs = startOfToday - msInDay;
    toTs = startOfToday;
  } else if (periodKey === AppConfig.SearchTimePeriods.past7Days.key) {
    fromTs = startOfToday - msInDay * 7;
    toTs = startOfToday;
  } else if (periodKey === AppConfig.SearchTimePeriods.past30Days.key) {
    fromTs = startOfToday - msInDay * 30;
    toTs = startOfToday;
  } else if (periodKey === AppConfig.SearchTimePeriods.past6Months.key) {
    fromTs = startOfToday - msInDay * 30 * 6;
    toTs = startOfToday;
  } else if (periodKey === AppConfig.SearchTimePeriods.pastYear.key) {
    fromTs = startOfToday - msInDay * 365;
    toTs = startOfToday;
  } else if (periodKey === AppConfig.SearchTimePeriods.moreThanYear.key) {
    fromTs = 0;
    toTs = startOfToday - msInDay * 365;
  }

  if (fromTs === null || toTs === null) return items;

  return items.filter((entry) => {
    const t = getTimeValue(entry) ?? 0;
    return t >= fromTs && t <= toTs;
  });
}

function filterIndex(
  data: TS.SearchIndex[],
  searchQuery: TS.SearchQuery,
): TS.SearchIndex[] {
  let results: TS.SearchIndex[] = data;

  results = filterByDatePeriod(
    results,
    searchQuery.lastModified,
    (entry) => entry.lmdt,
  );
  results = filterByDatePeriod(
    results,
    searchQuery.dateCreated,
    (entry) => entry.cdt,
  );

  // Build a mapping of file size keys to filter predicates
  const fileSizeMap: { [key: string]: (entry: TS.SearchIndex) => boolean } = {
    [AppConfig.SearchSizes.empty.key]: (entry) =>
      entry.size === AppConfig.SearchSizes.empty.thresholdBytes && entry.isFile,
    [AppConfig.SearchSizes.tiny.key]: (entry) =>
      entry.size > AppConfig.SearchSizes.empty.thresholdBytes &&
      entry.size <= AppConfig.SearchSizes.tiny.thresholdBytes &&
      entry.isFile,
    [AppConfig.SearchSizes.verySmall.key]: (entry) =>
      entry.size > AppConfig.SearchSizes.tiny.thresholdBytes &&
      entry.size <= AppConfig.SearchSizes.verySmall.thresholdBytes &&
      entry.isFile,
    [AppConfig.SearchSizes.small.key]: (entry) =>
      entry.size > AppConfig.SearchSizes.verySmall.thresholdBytes &&
      entry.size <= AppConfig.SearchSizes.small.thresholdBytes &&
      entry.isFile,
    [AppConfig.SearchSizes.medium.key]: (entry) =>
      entry.size > AppConfig.SearchSizes.small.thresholdBytes &&
      entry.size <= AppConfig.SearchSizes.medium.thresholdBytes &&
      entry.isFile,
    [AppConfig.SearchSizes.large.key]: (entry) =>
      entry.size > AppConfig.SearchSizes.medium.thresholdBytes &&
      entry.size <= AppConfig.SearchSizes.large.thresholdBytes &&
      entry.isFile,
    [AppConfig.SearchSizes.huge.key]: (entry) =>
      entry.size > AppConfig.SearchSizes.huge.thresholdBytes && entry.isFile,
  };

  if (searchQuery.fileSize && fileSizeMap[searchQuery.fileSize]) {
    results = results.filter(fileSizeMap[searchQuery.fileSize]);
  }

  if (searchQuery.tagTimePeriodFrom && searchQuery.tagTimePeriodTo) {
    results = results.filter(
      (entry) =>
        searchQuery.tagTimePeriodFrom <= entry.fromTime &&
        entry.toTime <= searchQuery.tagTimePeriodTo,
    );
  }

  if (searchQuery.tagPlaceLat && searchQuery.tagPlaceLong) {
    results = results.filter(
      (entry) =>
        searchQuery.tagPlaceLat === entry.lat &&
        searchQuery.tagPlaceLong === entry.lon,
    );
  }

  return results;
}

function constructFileTypeQuery(searchQuery: TS.SearchQuery) {
  let extensionQuery = '';
  if (searchQuery.fileTypes && searchQuery.fileTypes.length >= 1) {
    if (searchQuery.fileTypes[0] === AppConfig.SearchTypeGroups.folders[0]) {
      extensionQuery = '[? (!isFile)]';
    } else if (
      searchQuery.fileTypes[0] === AppConfig.SearchTypeGroups.files[0]
    ) {
      extensionQuery = '[? (isFile)]';
    } else if (
      searchQuery.fileTypes[0] === AppConfig.SearchTypeGroups.untagged[0]
    ) {
      extensionQuery = '[? (!tags)]';
    } else if (searchQuery.fileTypes[0] === AppConfig.SearchTypeGroups.any[0]) {
      // all results
    } else {
      extensionQuery = '[? ( ';
      searchQuery.fileTypes.map((ext) => {
        extensionQuery += "extension=='" + ext + "' || ";
        return true;
      });
      if (extensionQuery.endsWith('|| ')) {
        extensionQuery = extensionQuery.substring(0, extensionQuery.length - 3);
        extensionQuery += ' ) ]';
      }
    }
  }
  return extensionQuery;
}
