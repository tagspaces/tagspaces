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

import { ipcRenderer } from 'electron';
import { walkDirectory, enhanceEntry } from './services/utils-io';
import AppConfig from './config';
import { getThumbnailURLPromise } from './services/thumbsgenerator';

let isGeneratingThumbs = false;

function init() {
  console.log('Init worker');
  ipcRenderer.on('worker', (event, arg) => {
    // console.log('worker recieved: ' + arg);
    switch (arg.action) {
    case 'createDirectoryIndex': {
      console.log('createDirectoryIndex started in worker window');
      console.time('createDirectoryIndex');
      const directoryIndex = [];
      let counter = 0;
      walkDirectory(arg.path, { recursive: true, skipMetaFolder: true }, (fileEntry) => {
        counter += 1;
        if (counter > AppConfig.indexerLimit) {
          console.warn('Walk canceled by ' + AppConfig.indexerLimit);
          window.walkCanceled = true;
        }
        directoryIndex.push(enhanceEntry(fileEntry));
      }, (directoryEntry) => {
        if (directoryEntry.name !== AppConfig.metaFolder) {
          counter += 1;
          directoryIndex.push(enhanceEntry(directoryEntry));
        }
      }).then(() => { // entries - can be used for further processing
        window.walkCanceled = false;
        console.log('Directory index created ' + arg.path + ' containing ' + directoryIndex.length);
        console.timeEnd('createDirectoryIndex');
        ipcRenderer.send('worker', {
          id: arg.id,
          action: arg.action,
          result: directoryIndex,
          error: ''
        });
        return true;
      }).catch((err) => {
        window.walkCanceled = false;
        console.timeEnd('createDirectoryIndex');
        console.warn('Error creating index: ' + err);
        ipcRenderer.send('worker', {
          id: arg.id,
          action: arg.action,
          result: [], // directoryIndex,
          error: err
        });
      });
      break;
    }
    case 'createThumbnails': {
      console.log('createThumbnails started in worker window');
      if (!arg.tmbGenerationList || arg.tmbGenerationList.length < 1 || isGeneratingThumbs) {
        ipcRenderer.send('worker', {
          id: arg.id,
          action: arg.action,
          result: [],
          error: 'Empty or not available tmb list or busy worker'
        });
        break;
      }
      isGeneratingThumbs = true;
      const tmbGenerationPromises = [];
      arg.tmbGenerationList.map(entry => tmbGenerationPromises.push(getThumbnailURLPromise(entry)));
      Promise.all(tmbGenerationPromises).then(tmbResult => {
        console.log('tmb results' + JSON.stringify(tmbResult));
        ipcRenderer.send('worker', {
          id: arg.id,
          action: arg.action,
          result: tmbResult,
          error: ''
        });
        isGeneratingThumbs = false;
        return true;
      }).catch(error => {
        console.warn('Tmb gener: ' + error);
        ipcRenderer.send('worker', {
          id: arg.id,
          action: arg.action,
          result: [],
          error: 'Error generating tmbs: ' + error
        });
        isGeneratingThumbs = false;
      });
      break;
    }
    default:
      return false;
    }
  });
}

init();
