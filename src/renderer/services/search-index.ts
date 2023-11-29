/*
/!**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2020-present TagSpaces UG (haftungsbeschraenkt)
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
 *!/

import {
  extractFileName,
  extractFileExtension,
  extractTagsAsObjects
} from '@tagspaces/tagspaces-common/paths';
import { TS } from '-/tagspaces.namespace';
import PlatformIO from '-/services/platform-facade';
import AppConfig from '-/AppConfig';

const GlobalSearch = (function() {
  let instance;

  function init() {
    // DateCreated for index
    let indexLoadedOn: number = undefined;
    let index = [];
    //let results = [];

    return {
      setIndexLoadedOn: function(loaded) {
        indexLoadedOn = loaded;
      },
      getIndexLoadedOn: () => indexLoadedOn,
      setIndex: function(i) {
        index = i;
      },
      getIndex: () => index,
      /!*setResults: function(r) {
        results = r;
      },
      getResults: () => results,*!/
      reflectDeleteEntry: (path: string) => {
        if (!index || index.length < 1) {
          return;
        }
        for (let i = 0; i < index.length; i += 1) {
          if (index[i].path === path) {
            index = index.splice(i, 1);
            i -= 1;
          }
        }
      },
      reflectDeleteEntries: (paths: string[]) => {
        if (!index || index.length < 1) {
          return;
        }
        for (let i = 0; i < index.length; i += 1) {
          if (paths.some(path => index[i].path === path)) {
            index = index.splice(i, 1);
            i -= 1;
          }
        }
      },
      reflectCreateEntry: (newEntry: TS.FileSystemEntry) => {
        if (!index || index.length < 1) {
          return;
        }
        let entryFound = index.some(entry => entry.path === newEntry.path);
        if (!entryFound) {
          index = [...index, newEntry];
        }
        // else todo update index entry ?
      },
      reflectRenameEntry: (path: string, newPath: string) => {
        if (!index || index.length < 1) {
          return;
        }
        for (let i = 0; i < index.length; i += 1) {
          if (index[i].path === path) {
            index[i].path = newPath;
            index[i].name = extractFileName(
              newPath,
              PlatformIO.getDirSeparator()
            );
            index[i].extension = extractFileExtension(
              newPath,
              PlatformIO.getDirSeparator()
            );
            index[i].tags = [
              ...index[i].tags.filter(tag => tag.type === 'sidecar'), // add only sidecar tags
              ...extractTagsAsObjects(
                newPath,
                AppConfig.tagDelimiter,
                PlatformIO.getDirSeparator()
              )
            ];
          }
        }
      },
      reflectUpdateSidecarTags: (path: string, tags: Array<TS.Tag>) => {
        if (!index || index.length < 1) {
          return;
        }
        for (let i = 0; i < index.length; i += 1) {
          if (index[i].path === path) {
            index[i].tags = [
              ...index[i].tags.filter(tag => tag.type === 'plain'),
              ...tags
            ];
          }
        }
      },
      reflectUpdateSidecarMeta: (path: string, entryMeta: Object) => {
        if (!index || index.length < 1) {
          return;
        }
        for (let i = 0; i < index.length; i += 1) {
          if (index[i].path === path) {
            index[i] = {
              ...index[i],
              ...entryMeta
            };
          }
        }
      }
    };
  }

  return {
    // get the singleton instance if it exists, or create one if it doesn't
    getInstance: function() {
      if (!instance) {
        instance = init();
      }
      return instance;
    }
  };
})();
export default GlobalSearch;
*/
