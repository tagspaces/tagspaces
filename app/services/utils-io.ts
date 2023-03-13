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

import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import {
  loadIndex,
  enhanceDirectoryIndex
} from '@tagspaces/tagspaces-platforms/indexer';
import {
  enhanceEntry,
  loadJSONString
} from '@tagspaces/tagspaces-common/utils-io';
import { saveAs } from 'file-saver';
import {
  locationType,
  prepareTagForExport
} from '@tagspaces/tagspaces-common/misc';
import {
  extractTagsAsObjects,
  extractFileExtension,
  cleanTrailingDirSeparator,
  getMetaDirectoryPath,
  getMetaFileLocationForFile,
  getMetaFileLocationForDir,
  extractContainingDirectoryPath,
  extractDirectoryName,
  getThumbFileLocationForFile,
  getThumbFileLocationForDirectory,
  getBgndFileLocationForDirectory,
  cleanFrontDirSeparator
} from '@tagspaces/tagspaces-common/paths';
import AppConfig from '-/AppConfig';
import PlatformIO from './platform-facade';
import i18n from '../services/i18n';
import versionMeta from '../version.json';
import { OpenedEntry, actions as AppActions } from '-/reducers/app';
import { getLocation } from '-/reducers/locations';
import { TS } from '-/tagspaces.namespace';
import {
  getThumbnailURLPromise,
  supportedContainers,
  supportedImgs,
  supportedText,
  supportedVideos,
  supportedMisc,
  generateImageThumbnail
} from '-/services/thumbsgenerator';
import { base64ToArrayBuffer } from '-/utils/dom';
import { Pro } from '-/pro';
import { supportedFileTypes } from '-/extension-config';

const supportedImgsWS = [
  'jpg',
  'jpeg',
  'jif',
  'jfif',
  'png',
  'gif',
  'svg',
  'tif',
  'tiff',
  'ico',
  'webp',
  'avif'
  // 'bmp' currently electron main processed: https://github.com/lovell/sharp/issues/806
];

export function enhanceDirectoryContent(
  dirEntries,
  isCloudLocation,
  showUnixHiddenEntries,
  useGenerateThumbnails,
  showDirs = true,
  limit = undefined,
  enableWS = true
) {
  const directoryContent = [];
  const tmbGenerationPromises = [];
  const tmbGenerationList = [];
  const isWorkerAvailable = enableWS && PlatformIO.isWorkerAvailable();

  dirEntries.map(entry => {
    if (!showUnixHiddenEntries && entry.name.startsWith('.')) {
      return true;
    }

    if (!showDirs && !entry.isFile) {
      return true;
    }

    if (limit !== undefined && directoryContent.length >= limit) {
      return true;
    }

    const enhancedEntry: TS.FileSystemEntry = enhanceEntry(
      entry,
      AppConfig.tagDelimiter,
      PlatformIO.getDirSeparator()
    );
    directoryContent.push(enhancedEntry);
    if (
      // Enable thumb generation by
      !AppConfig.isWeb && // not in webdav mode
      !PlatformIO.haveObjectStoreSupport() && // not in object store mode
      !PlatformIO.haveWebDavSupport() && // not in webdav mode
      enhancedEntry.isFile && // only for files
      useGenerateThumbnails // enabled in the settings
    ) {
      // const isPDF = enhancedEntry.path.endsWith('.pdf');
      if (
        isWorkerAvailable &&
        supportedImgsWS.includes(enhancedEntry.extension)
      ) {
        // !isPDF) {
        tmbGenerationList.push(enhancedEntry.path);
      } else if (
        supportedImgs.includes(enhancedEntry.extension) ||
        supportedContainers.includes(enhancedEntry.extension) ||
        supportedText.includes(enhancedEntry.extension) ||
        supportedMisc.includes(enhancedEntry.extension) ||
        supportedVideos.includes(enhancedEntry.extension)
      ) {
        tmbGenerationPromises.push(getThumbnailURLPromise(enhancedEntry.path));
      } else {
        console.log(
          'Unsupported thumbgeneration ext:' + enhancedEntry.extension
        );
      }
    }
    return true;
  });

  return {
    directoryContent,
    tmbGenerationPromises,
    tmbGenerationList
  };
}

export async function getMetaForEntry(
  entry: TS.FileSystemEntry,
  metaFilePath?: string
): Promise<any> {
  if (entry.meta) {
    // && Object.keys(entry.meta).length > 0) {
    // entry is Enhanced
    return { [entry.path]: { ...entry } };
  }
  if (!metaFilePath) {
    if (entry.isFile) {
      metaFilePath = getMetaFileLocationForFile(
        entry.path,
        PlatformIO.getDirSeparator()
      );
    } else {
      metaFilePath = getMetaFileLocationForDir(
        entry.path,
        PlatformIO.getDirSeparator()
      );
    }
  }
  const meta: TS.FileSystemEntryMeta = await loadJSONFile(metaFilePath);
  if (meta) {
    const entryEnhanced = enhanceEntry(
      { ...entry, meta },
      AppConfig.tagDelimiter,
      PlatformIO.getDirSeparator()
    );
    return { [entry.path]: entryEnhanced };
  }
  return Promise.resolve({ [entry.path]: undefined });
}

export function enhanceOpenedEntry(
  entry: OpenedEntry,
  tagDelimiter
): OpenedEntry {
  if (entry.isFile) {
    const fineNameTags = extractTagsAsObjects(
      entry.path,
      tagDelimiter,
      PlatformIO.getDirSeparator()
    );
    if (fineNameTags.length > 0) {
      if (entry.tags && entry.tags.length > 0) {
        const uniqueTags = entry.tags.filter(
          tag => fineNameTags.findIndex(obj => obj.title === tag.title) === -1
        );
        return {
          ...entry,
          tags: [...uniqueTags, ...fineNameTags]
        };
      }
      return {
        ...entry,
        tags: fineNameTags
      };
    }
  }
  return entry;
}

export function prepareDirectoryContent(
  dirEntries,
  directoryPath,
  settings,
  dispatch,
  getState,
  dirEntryMeta,
  generateThumbnails
) {
  const currentLocation: TS.Location = getLocation(
    getState(),
    getState().app.currentLocationId
  );
  const isCloudLocation = currentLocation.type === locationType.TYPE_CLOUD;

  function genThumbnails() {
    if (
      !directoryPath ||
      directoryPath.endsWith(AppConfig.dirSeparator + AppConfig.metaFolder) ||
      directoryPath.endsWith(
        AppConfig.dirSeparator + AppConfig.metaFolder + AppConfig.dirSeparator
      )
    ) {
      return false; // dont generate thumbnails in meta folder
    }
    if (AppConfig.useGenerateThumbnails !== undefined) {
      return AppConfig.useGenerateThumbnails;
    }
    return settings.useGenerateThumbnails;
  }

  const {
    directoryContent,
    tmbGenerationPromises,
    tmbGenerationList
  } = enhanceDirectoryContent(
    dirEntries,
    isCloudLocation,
    settings.showUnixHiddenEntries,
    generateThumbnails && genThumbnails(),
    true,
    undefined,
    settings.enableWS
  );

  function handleTmbGenerationResults(results) {
    // console.log('tmb results' + JSON.stringify(results));
    const tmbURLs = [];
    results.map(tmbResult => {
      if (tmbResult.tmbPath && tmbResult.tmbPath.length > 0) {
        // dispatch(actions.updateThumbnailUrl(tmbResult.filePath, tmbResult.tmbPath));
        tmbURLs.push(tmbResult);
      }
      return true;
    });
    dispatch(AppActions.setGeneratingThumbnails(false));
    // dispatch(actions.hideNotifications());
    if (tmbURLs.length > 0) {
      dispatch(AppActions.updateThumbnailUrls(tmbURLs));
    }
    return true;
  }

  function handleTmbGenerationFailed(error) {
    console.warn('Thumb generation failed: ' + error);
    dispatch(AppActions.setGeneratingThumbnails(false));
    dispatch(
      AppActions.showNotification(
        i18n.t('core:generatingThumbnailsFailed'),
        'warning',
        true
      )
    );
  }

  if (
    generateThumbnails &&
    (tmbGenerationList.length > 0 || tmbGenerationPromises.length > 0)
  ) {
    dispatch(AppActions.setGeneratingThumbnails(true));
    if (tmbGenerationList.length > 0) {
      PlatformIO.createThumbnailsInWorker(tmbGenerationList)
        .then(handleTmbGenerationResults)
        .catch(() => {
          // WS error handle
          Promise.all(
            tmbGenerationList.map(tmbPath => getThumbnailURLPromise(tmbPath))
          )
            .then(handleTmbGenerationResults)
            .catch(handleTmbGenerationFailed);
        });
    }
    if (tmbGenerationPromises.length > 0) {
      Promise.all(tmbGenerationPromises)
        .then(handleTmbGenerationResults)
        .catch(handleTmbGenerationFailed);
    }
  }

  console.log('Dir ' + directoryPath + ' contains ' + directoryContent.length);
  dispatch(
    AppActions.loadDirectorySuccess(
      directoryPath,
      directoryContent,
      dirEntryMeta
    )
  );
}

export function orderDirectories(
  directories,
  metaArray: Array<TS.OrderVisibilitySettings>
) {
  // if (sortBy === 'custom') {
  try {
    if (metaArray && metaArray.length > 0) {
      const arrLength = directories.length;
      return directories.sort((a, b) => {
        let indexA = metaArray.findIndex(
          meta => meta.name === a.name
          // meta => meta.path === Object.keys(a)[0]
        );
        let indexB = metaArray.findIndex(
          meta => meta.name === b.name
          // meta => meta.path === Object.keys(b)[0]
        );
        // set new dirs last
        if (indexA === -1) {
          indexA = arrLength;
        }
        if (indexB === -1) {
          indexB = arrLength;
        }
        return indexA - indexB;
      });
    }
  } catch (e) {
    console.log('error orderDirectories:', e);
  }
  // }
  return directories;
}

export function orderByMetaArray(
  arr,
  metaArray: Array<TS.OrderVisibilitySettings>
) {
  const arrLength = arr.length;
  return arr.sort((a, b) => {
    let indexA = metaArray.findIndex(metaFiles => metaFiles.name === a.name);
    let indexB = metaArray.findIndex(metaFiles => metaFiles.name === b.name);
    // set new files last; dirs first
    if (indexA === -1) {
      indexA = !a.isFile ? arrLength * -1 : arrLength;
    }
    if (indexB === -1) {
      indexB = !b.isFile ? arrLength * -1 : arrLength;
    }
    return indexA - indexB;
  });
}

export function findExtensionPathForId(
  extensionId: string,
  extensionExternalPath = undefined
): string {
  if (extensionExternalPath) {
    return extensionExternalPath + '/' + extensionId;
  }
  if (AppConfig.isWeb) {
    return 'modules/' + extensionId;
  }
  return 'node_modules/' + extensionId;
}

export function findExtensionsForEntry(
  uuid: string,
  supportedFileTypes: Array<any>,
  entryPath: string,
  isFile = true
): OpenedEntry {
  const fileExtension = extractFileExtension(
    entryPath,
    PlatformIO.getDirSeparator()
  ).toLowerCase();
  const viewingExtensionPath = isFile
    ? findExtensionPathForId('@tagspaces/extensions/text-viewer')
    : 'about:blank';
  const fileForOpening: OpenedEntry = {
    uuid: uuid,
    path: entryPath,
    viewingExtensionPath,
    viewingExtensionId: '',
    isFile,
    // changed: false,
    locationId: undefined,
    lmdt: 0,
    size: 0
  };
  supportedFileTypes.map(fileType => {
    if (fileType.viewer && fileType.type.toLowerCase() === fileExtension) {
      fileForOpening.viewingExtensionId = fileType.viewer;
      if (fileType.color) {
        fileForOpening.color = fileType.color;
      }
      fileForOpening.viewingExtensionPath = findExtensionPathForId(
        fileType.viewer,
        fileType.extensionExternalPath
      );
      if (fileType.editor && fileType.editor.length > 0) {
        fileForOpening.editingExtensionId = fileType.editor;
        fileForOpening.editingExtensionPath = findExtensionPathForId(
          fileType.editor,
          fileType.extensionExternalPath
        );
      }
    }
    return true;
  });
  return fileForOpening;
}

export function getNextFile(
  pivotFilePath?: string,
  lastSelectedEntry?: string,
  currentDirectoryEntries?: Array<TS.FileSystemEntry>
): TS.FileSystemEntry {
  const currentEntries = currentDirectoryEntries
    ? currentDirectoryEntries.filter(entry => entry.isFile)
    : [];
  let filePath = pivotFilePath;
  if (!filePath) {
    if (lastSelectedEntry) {
      filePath = lastSelectedEntry;
    } else if (currentEntries.length > 0) {
      filePath = currentEntries[0].path;
    } else {
      return undefined;
    }
  }
  let nextFile;
  currentEntries.forEach((entry, index) => {
    if (entry.path === filePath) {
      const nextIndex = index + 1;
      if (nextIndex < currentEntries.length) {
        nextFile = currentEntries[nextIndex];
      } else {
        // eslint-disable-next-line prefer-destructuring
        nextFile = currentEntries[0];
      }
    }
  });
  if (nextFile === undefined) {
    // eslint-disable-next-line prefer-destructuring
    nextFile = currentEntries[0];
  }
  return nextFile;
}

export function getPrevFile(
  pivotFilePath?: string,
  lastSelectedEntry?: string,
  currentDirectoryEntries?: Array<TS.FileSystemEntry>
): TS.FileSystemEntry {
  const currentEntries = currentDirectoryEntries
    ? currentDirectoryEntries.filter(entry => entry.isFile)
    : [];
  let filePath = pivotFilePath;
  if (!filePath) {
    if (lastSelectedEntry) {
      filePath = lastSelectedEntry;
    } else if (currentEntries.length > 0) {
      filePath = currentEntries[0].path;
    } else {
      return undefined;
    }
  }
  let prevFile;
  currentEntries.forEach((entry, index) => {
    if (entry.path === filePath) {
      const prevIndex = index - 1;
      if (prevIndex >= 0) {
        prevFile = currentEntries[prevIndex];
      } else {
        prevFile = currentEntries[currentEntries.length - 1];
      }
    }
  });
  if (prevFile === undefined) {
    // eslint-disable-next-line prefer-destructuring
    prevFile = currentEntries[0];
  }
  return prevFile;
}

/**
 * persistIndex based on location - used for S3 and cordova only
 * for native used common-platform/indexer.js -> persistIndex instead
 * @param param
 * @param directoryIndex
 */
async function persistIndex(param: string | any, directoryIndex: any) {
  let directoryPath;
  if (typeof param === 'object' && param !== null) {
    directoryPath = param.path;
  } else {
    directoryPath = param;
  }
  const metaDirectory = getMetaDirectoryPath(directoryPath);
  const exist = await PlatformIO.checkDirExist(metaDirectory);
  if (!exist) {
    await PlatformIO.createDirectoryPromise(metaDirectory);
  }
  const folderIndexPath =
    metaDirectory + PlatformIO.getDirSeparator() + AppConfig.folderIndexFile; // getMetaIndexFilePath(directoryPath);
  return PlatformIO.saveTextFilePromise(
    { ...param, path: folderIndexPath },
    JSON.stringify(directoryIndex), // relativeIndex),
    true
  )
    .then(() => {
      console.log(
        'Index persisted for: ' + directoryPath + ' to ' + folderIndexPath
      );
      return true;
    })
    .catch(err => {
      console.error('Error saving the index for ' + folderIndexPath, err);
    });
}

export function createDirectoryIndex(
  param: string | any,
  extractText = false,
  ignorePatterns: Array<string> = [],
  enableWS = true
  // disableIndexing = true,
): Promise<Array<TS.FileSystemEntry>> {
  if (Pro && Pro.Watcher) {
    Pro.Watcher.stopWatching();
  }
  let directoryPath;
  let locationID;
  if (typeof param === 'object' && param !== null) {
    directoryPath = param.path;
    ({ locationID } = param);
  } else {
    directoryPath = param;
  }
  const dirPath = cleanTrailingDirSeparator(directoryPath);
  if (
    enableWS &&
    !PlatformIO.haveObjectStoreSupport() &&
    !PlatformIO.haveWebDavSupport() &&
    PlatformIO.isWorkerAvailable()
  ) {
    // Start indexing in worker if not in the object store mode
    return PlatformIO.createDirectoryIndexInWorker(
      dirPath,
      extractText,
      ignorePatterns
    ).then(succeeded => {
      if (succeeded) {
        return loadIndex({ path: dirPath, locationID });
      }
      return undefined;
    });
  }

  let listDirectoryPromise;
  let loadTextFilePromise;
  if (PlatformIO.haveObjectStoreSupport()) {
    listDirectoryPromise = PlatformIO.listObjectStoreDir;
    // eslint-disable-next-line prefer-destructuring
    loadTextFilePromise = PlatformIO.loadTextFilePromise;
  }
  const mode = ['extractThumbPath'];
  if (extractText) {
    mode.push('extractTextContent');
  }
  return PlatformIO.createIndex(
    param,
    mode,
    ignorePatterns,
    listDirectoryPromise,
    loadTextFilePromise
  )
    .then(directoryIndex =>
      persistIndex(param, directoryIndex).then(success => {
        if (success) {
          console.log('Index generated in folder: ' + directoryPath);
          return enhanceDirectoryIndex(param, directoryIndex, locationID);
        }
        return undefined;
      })
    )
    .catch(err => {
      console.error('Error creating index: ', err);
    });
}

export async function getAllPropertiesPromise(
  entryPath: string
): Promise<TS.FileSystemEntry> {
  const entryProps = await PlatformIO.getPropertiesPromise(entryPath);
  let metaFilePath;
  const dirSep = PlatformIO.getDirSeparator();
  if (entryProps) {
    metaFilePath = entryProps.isFile
      ? getMetaFileLocationForFile(entryPath, dirSep)
      : getMetaFileLocationForDir(entryPath, dirSep);
    const metaFileProps = await PlatformIO.getPropertiesPromise(metaFilePath);
    if (metaFileProps.isFile) {
      entryProps.meta = await loadJSONFile(metaFilePath);
    }
    return enhanceEntry(
      entryProps,
      AppConfig.tagDelimiter,
      PlatformIO.getDirSeparator()
    );
  }
  console.warn('Error getting props for ' + entryPath);
  return entryProps;
}

export async function loadJSONFile(filePath: string) {
  // console.debug('loadJSONFile:' + filePath);
  const jsonContent = await PlatformIO.loadTextFilePromise(filePath);
  return loadJSONString(jsonContent);
}

export function saveAsTextFile(blob: any, filename: string) {
  saveAs(blob, filename);
}

export function deleteFilesPromise(filePathList: Array<string>) {
  const fileDeletionPromises = [];
  filePathList.forEach(filePath => {
    fileDeletionPromises.push(PlatformIO.deleteFilePromise(filePath));
  });
  return Promise.all(fileDeletionPromises);
}

export function renameFilesPromise(renameJobs: Array<Array<string>>) {
  return Promise.all(
    renameJobs.map(async renameJob => {
      try {
        return await PlatformIO.renameFilePromise(renameJob[0], renameJob[1]);
      } catch (err) {
        console.warn('Error rename file:', err);
        return false;
      }
    })
  );
}

export function copyFilesPromise(copyJobs: Array<Array<string>>) {
  const ioJobPromises = [];
  copyJobs.forEach(copyJob => {
    ioJobPromises.push(PlatformIO.copyFilePromise(copyJob[0], copyJob[1]));
  });
  return Promise.all(ioJobPromises);
}

export async function loadSubFolders(path: string, loadHidden = false) {
  const folderContent = await PlatformIO.listDirectoryPromise(path, []); // 'extractThumbPath']);
  const subfolders = [];
  let i = 0;
  let isHidden = false;
  if (folderContent !== undefined) {
    folderContent.map(entry => {
      if (!entry.isFile) {
        isHidden = entry.name.startsWith('.');
        if (isHidden) {
          if (loadHidden) {
            subfolders.push({
              key: '0-' + (i += 1),
              isLeaf: false,
              name: entry.name,
              isFile: entry.isFile,
              lmdt: entry.lmdt,
              meta: entry.meta,
              path: entry.path,
              tags: entry.tags
            });
          } else {
            // do nothing
          }
        } else {
          subfolders.push({
            key: '0-' + (i += 1),
            isLeaf: false,
            name: entry.name,
            isFile: entry.isFile,
            lmdt: entry.lmdt,
            meta: entry.meta,
            path: entry.path,
            tags: entry.tags
          });
        }
      }
      return true;
    });
  }
  return subfolders;
}

export function generateFileName(
  fileName: string,
  tags: Array<string>,
  tagDelimiter: string
) {
  let tagsString = '';
  const { prefixTagContainer } = AppConfig;
  // Creating the string will all the tags by more that 0 tags
  if (tags && tags.length > 0) {
    tagsString = AppConfig.beginTagContainer;
    for (let i = 0; i < tags.length; i += 1) {
      if (i === tags.length - 1) {
        tagsString += tags[i].trim();
      } else {
        tagsString += tags[i].trim() + tagDelimiter;
      }
    }
    tagsString = tagsString.trim() + AppConfig.endTagContainer;
  }
  // console.log('The tags string: ' + tagsString);
  const fileExt = extractFileExtension(fileName, PlatformIO.getDirSeparator());
  // console.log('Filename: ' + fileName + ' file extension: ' + fileExt);
  // Assembling the new filename with the tags
  let newFileName = '';
  const beginTagContainer = fileName.indexOf(AppConfig.beginTagContainer);
  const endTagContainer = fileName.indexOf(AppConfig.endTagContainer);
  const lastDotPosition = fileName.lastIndexOf('.');
  if (
    beginTagContainer < 0 ||
    endTagContainer < 0 ||
    beginTagContainer >= endTagContainer
  ) {
    // Filename does not contains tags.
    if (lastDotPosition < 0) {
      // File does not have an extension
      newFileName = fileName.trim() + tagsString;
    } else {
      // File has an extension
      newFileName =
        fileName.substring(0, lastDotPosition).trim() +
        prefixTagContainer +
        tagsString +
        '.' +
        fileExt;
    }
  } else {
    // File does not have an extension
    newFileName =
      fileName.substring(0, beginTagContainer).trim() +
      prefixTagContainer +
      tagsString +
      fileName.substring(endTagContainer + 1, fileName.length).trim();
  }
  if (newFileName.length < 1) {
    throw new Error('Generated filename is invalid');
  }
  // Removing double prefix
  newFileName = newFileName
    .split(prefixTagContainer + '' + prefixTagContainer)
    .join(prefixTagContainer);
  return newFileName;
}

export function parseNewTags(tagsInput: string, tagGroup: TS.TagGroup) {
  if (tagGroup) {
    let tags = tagsInput
      .split(' ')
      .join(',')
      .split(','); // handle spaces around commas
    tags = [...new Set(tags)]; // remove duplicates
    tags = tags.filter(tag => tag && tag.length > 0); // zero length tags

    const taggroupTags = tagGroup.children;
    taggroupTags.forEach(tag => {
      // filter out duplicated tags
      tags = tags.filter(t => t !== tag.title);
    });
    return taggroupTags.concat(
      tags.map(tagTitle => {
        const tag: TS.Tag = {
          type: taggroupTags.length > 0 ? taggroupTags[0].type : 'sidecar',
          title: tagTitle.trim(),
          functionality: '',
          description: '',
          icon: '',
          color: tagGroup.color,
          textcolor: tagGroup.textcolor,
          style: taggroupTags.length > 0 ? taggroupTags[0].style : '',
          modified_date: new Date().getTime()
        };
        return tag;
      })
    );
  }
}

export async function loadLocationDataPromise(
  path: string,
  metaFile = AppConfig.folderLocationsFile
): Promise<TS.FileSystemEntryMeta> {
  const entryProperties = await PlatformIO.getPropertiesPromise(path);
  if (!entryProperties.isFile) {
    const metaFilePath = getMetaFileLocationForDir(
      path,
      PlatformIO.getDirSeparator(),
      metaFile
    );
    let metaData;
    try {
      metaData = await loadJSONFile(metaFilePath);
    } catch (e) {
      console.debug('cannot load json:' + metaFilePath, e);
    }
    return metaData;
  }
  return undefined;
}

/**
 * if you have entryProperties.isFile prefer to use loadFileMetaDataPromise/loadDirMetaDataPromise
 * @param path
 */
export function loadMetaDataPromise(
  path: string
): Promise<TS.FileSystemEntryMeta> {
  return PlatformIO.getPropertiesPromise(path).then(entryProperties => {
    if (entryProperties) {
      if (entryProperties.isFile) {
        return loadFileMetaDataPromise(path);
      }
      return loadDirMetaDataPromise(path);
    }
    throw new Error('loadMetaDataPromise not exist' + path);
  });
}

export function loadFileMetaDataPromise(
  path: string
): Promise<TS.FileSystemEntryMeta> {
  const metaFilePath = getMetaFileLocationForFile(
    path,
    PlatformIO.getDirSeparator()
  );
  return loadJSONFile(metaFilePath).then(metaData => {
    if (!metaData) {
      throw new Error('loadFileMetaDataPromise ' + metaFilePath + ' not exist');
    }
    return {
      ...metaData,
      isFile: true,
      description: metaData.description || '',
      color: metaData.color || '',
      tags: metaData.tags || [],
      appName: metaData.appName || '',
      appVersion: metaData.appVersion || '',
      lastUpdated: metaData.lastUpdated || ''
    };
  });
}

export function loadDirMetaDataPromise(
  path: string
): Promise<TS.FileSystemEntryMeta> {
  const metaDirPath = getMetaFileLocationForDir(
    path,
    PlatformIO.getDirSeparator()
  );
  return loadJSONFile(metaDirPath).then(metaData => {
    if (!metaData) {
      throw new Error('loadDirMetaDataPromise ' + metaDirPath + ' not exist');
    }
    return {
      ...metaData,
      id: metaData.id || getUuid(),
      isFile: false,
      description: metaData.description || '',
      color: metaData.color || '',
      perspective: metaData.perspective || '',
      tags: metaData.tags || [],
      appName: metaData.appName || '',
      appVersion: metaData.appVersion || '',
      lastUpdated: metaData.lastUpdated || ''
    };
  });
}

export function cleanMetaData(
  metaData: TS.FileSystemEntryMeta
): TS.FileSystemEntryMeta {
  const cleanedMeta: any = {};
  if (metaData.id) {
    cleanedMeta.id = metaData.id;
  }
  if (metaData.perspective) {
    cleanedMeta.perspective = metaData.perspective;
  }
  if (metaData.color && metaData.color !== 'transparent') {
    cleanedMeta.color = metaData.color;
  }
  if (metaData.description) {
    cleanedMeta.description = metaData.description;
  }
  if (metaData.perspectiveSettings) {
    cleanedMeta.perspectiveSettings = metaData.perspectiveSettings;
  }
  if (metaData.customOrder) {
    cleanedMeta.customOrder = metaData.customOrder;
  }
  if (metaData.autoSave) {
    cleanedMeta.autoSave = metaData.autoSave;
  }
  /*if (metaData.perspectiveSettings) {  // clean perspectiveSettings !== defaultSettings
    Object.keys(metaData.perspectiveSettings).forEach(perspective => {
      if (!cleanedMeta.perspectiveSettings) {
        cleanedMeta.perspectiveSettings = {};
      }
      cleanedMeta.perspectiveSettings[perspective] = {
        ...(metaData.perspectiveSettings[perspective].showDirectories !=
          defaultSettings.showDirectories && {
          showDirectories:
            metaData.perspectiveSettings[perspective].showDirectories
        }),
        ...(metaData.perspectiveSettings[perspective].showTags !=
          defaultSettings.showTags && {
          showTags: metaData.perspectiveSettings[perspective].showTags
        }),
        ...(metaData.perspectiveSettings[perspective].layoutType !=
          defaultSettings.layoutType && {
          layoutType: metaData.perspectiveSettings[perspective].layoutType
        }),
        ...(metaData.perspectiveSettings[perspective].orderBy !=
          defaultSettings.orderBy && {
          orderBy: metaData.perspectiveSettings[perspective].orderBy
        }),
        ...(metaData.perspectiveSettings[perspective].sortBy !=
          defaultSettings.sortBy && {
          sortBy: metaData.perspectiveSettings[perspective].sortBy
        }),
        ...(metaData.perspectiveSettings[perspective].singleClickAction !=
          defaultSettings.singleClickAction && {
          singleClickAction:
            metaData.perspectiveSettings[perspective].singleClickAction
        }),
        ...(metaData.perspectiveSettings[perspective].entrySize !=
          defaultSettings.entrySize && {
          entrySize: metaData.perspectiveSettings[perspective].entrySize
        }),
        ...(metaData.perspectiveSettings[perspective].thumbnailMode !=
          defaultSettings.thumbnailMode && {
          thumbnailMode: metaData.perspectiveSettings[perspective].thumbnailMode
        }),
        ...(metaData.perspectiveSettings[perspective].gridPageLimit !=
          defaultSettings.gridPageLimit && {
          gridPageLimit: metaData.perspectiveSettings[perspective].gridPageLimit
        })
      };
      if (
        Object.keys(cleanedMeta.perspectiveSettings[perspective]).length === 0
      ) {
        delete cleanedMeta.perspectiveSettings[perspective];
      }
    });
    if (Object.keys(cleanedMeta.perspectiveSettings).length === 0) {
      delete cleanedMeta.perspectiveSettings;
    }
  } */
  if (metaData.tagGroups && metaData.tagGroups.length > 0) {
    cleanedMeta.tagGroups = metaData.tagGroups;
  }
  if (metaData.tags && metaData.tags.length > 0) {
    cleanedMeta.tags = [];
    metaData.tags.forEach(tag => {
      const cleanedTag = prepareTagForExport(tag);
      if (cleanedTag.title) {
        cleanedMeta.tags.push(cleanedTag);
      }
    });
  }
  return cleanedMeta;
}

export async function saveLocationDataPromise(
  path: string,
  metaData: any
): Promise<any> {
  const entryProperties = await PlatformIO.getPropertiesPromise(path);
  if (entryProperties) {
    let metaFilePath;
    if (!entryProperties.isFile) {
      // check and create meta folder if not exist
      // todo not need to check if folder exist first createDirectoryPromise() recursively will skip creation of existing folders https://nodejs.org/api/fs.html#fs_fs_mkdir_path_options_callback
      const metaDirectoryPath = getMetaDirectoryPath(
        path,
        PlatformIO.getDirSeparator()
      );
      const metaDirectoryProperties = await PlatformIO.getPropertiesPromise(
        metaDirectoryPath
      );
      if (!metaDirectoryProperties) {
        await PlatformIO.createDirectoryPromise(metaDirectoryPath);
      }

      metaFilePath = getMetaFileLocationForDir(
        path,
        PlatformIO.getDirSeparator(),
        AppConfig.folderLocationsFile
      );
    }
    const content = JSON.stringify({
      ...metaData,
      appName: versionMeta.name,
      appVersion: versionMeta.version,
      lastUpdated: new Date().toJSON()
    });
    return PlatformIO.saveTextFilePromise(
      { path: metaFilePath },
      content,
      true
    );
  }
  return Promise.reject(new Error('file not found' + path));
}

export async function saveMetaDataPromise(
  path: string,
  metaData: any
): Promise<any> {
  const entryProperties = await PlatformIO.getPropertiesPromise(path);
  const cleanedMetaData = cleanMetaData(metaData);
  if (entryProperties) {
    let metaFilePath;
    if (entryProperties.isFile) {
      metaFilePath = getMetaFileLocationForFile(
        path,
        PlatformIO.getDirSeparator()
      );
      // check and create meta folder if not exist
      const metaFolder = getMetaDirectoryPath(
        extractContainingDirectoryPath(path, PlatformIO.getDirSeparator()),
        PlatformIO.getDirSeparator()
      );
      const metaExist = await PlatformIO.getPropertiesPromise(metaFolder);
      if (!metaExist) {
        await PlatformIO.createDirectoryPromise(metaFolder);
      }
    } else {
      // check and create meta folder if not exist
      // todo not need to check if folder exist first createDirectoryPromise() recursively will skip creation of existing folders https://nodejs.org/api/fs.html#fs_fs_mkdir_path_options_callback
      const metaDirectoryPath = getMetaDirectoryPath(
        path,
        PlatformIO.getDirSeparator()
      );
      const metaDirectoryProperties = await PlatformIO.getPropertiesPromise(
        metaDirectoryPath
      );
      if (!metaDirectoryProperties) {
        await PlatformIO.createDirectoryPromise(metaDirectoryPath);
      }

      if (!cleanedMetaData.id) {
        // add id for directories
        cleanedMetaData.id = getUuid();
      }

      metaFilePath = getMetaFileLocationForDir(
        path,
        PlatformIO.getDirSeparator()
      );
    }
    const content = JSON.stringify(mergeFsEntryMeta(cleanedMetaData));
    return PlatformIO.saveTextFilePromise(
      { path: metaFilePath },
      content,
      true
    );
  }
  return Promise.reject(new Error('file not found' + path));
}

/**
 * @param filePath
 * return Promise<directoryPath> of directory in order to open Folder properties next
 */
export function setFolderThumbnailPromise(filePath: string): Promise<string> {
  const directoryPath = extractContainingDirectoryPath(
    filePath,
    PlatformIO.getDirSeparator()
  );
  const directoryName = extractDirectoryName(
    directoryPath,
    PlatformIO.getDirSeparator()
  );
  return PlatformIO.copyFilePromise(
    getThumbFileLocationForFile(filePath, PlatformIO.getDirSeparator(), false),
    getThumbFileLocationForDirectory(
      directoryPath,
      PlatformIO.getDirSeparator()
    ),
    i18n.t('core:thumbAlreadyExists', { directoryName })
  ).then(() => directoryPath);
}

/**
 * @param filePath
 * @param directoryPath
 * return Promise<directoryPath> of directory in order to open Folder properties next
 */
export function setFolderBackgroundPromise(
  filePath: string,
  directoryPath: string
): Promise<string> {
  const folderBgndPath = getBgndFileLocationForDirectory(
    directoryPath,
    PlatformIO.getDirSeparator()
  );

  return generateImageThumbnail(filePath, AppConfig.maxBgndSize) // 4K -> 3840, 2K -> 2560
    .then(base64Image => {
      if (base64Image) {
        const data = base64ToArrayBuffer(base64Image.split(',').pop());
        return PlatformIO.saveBinaryFilePromise(
          { path: folderBgndPath },
          data,
          true
        )
          .then(() => {
            // props.setLastBackgroundImageChange(new Date().getTime());
            return directoryPath;
          })
          .catch(error => {
            console.error('Save to file failed ', error);
            return Promise.reject(error);
          });
      }
    })
    .catch(error => {
      console.error('Background generation failed ', error);
      return Promise.reject(error);
    });
}

export function findBackgroundColorForFolder(fsEntry: TS.FileSystemEntry) {
  if (!fsEntry.isFile) {
    if (fsEntry.color) {
      return fsEntry.color;
    }
  }
  return 'transparent';
}

export function findColorForEntry(
  fsEntry: TS.FileSystemEntry,
  supportedFileTypes: Array<any>
): string {
  if (!fsEntry.isFile) {
    return 'gray'; // AppConfig.defaultFolderColor;
  }
  if (fsEntry.extension !== undefined) {
    const fileType = supportedFileTypes.find(
      type => type.type.toLowerCase() === fsEntry.extension.toLowerCase()
    );

    if (fileType && fileType.color) {
      return fileType.color;
    }
  }
  return AppConfig.defaultFileColor;
}

export function loadFileContentPromise(
  fullPath: string,
  type: string
): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr: any = new XMLHttpRequest();
    xhr.open('GET', fullPath, true);
    xhr.responseType = type || 'arraybuffer';
    xhr.onerror = reject;
    xhr.onload = () => {
      const response = xhr.response || xhr.responseText;
      if (response) {
        resolve(response);
      } else {
        reject(new Error('loadFileContentPromise error'));
      }
    };
    xhr.send();
  });
}

/**
 * @param mdContent
 * @param maxLength - for preview of fist 200 chars
 */
export function getDescriptionPreview(mdContent, maxLength = 200) {
  if (!mdContent) return '';
  let preview = mdContent.replace(
    /\[(.*?)\]\(.*?\)/g, // remove link href, also dataurls
    // /\(data:([\w\/\+]+);(charset=[\w-]+|base64).*,([a-zA-Z0-9+/]+={0,2})\)/g,
    ''
  );
  if (preview.length > maxLength) {
    preview = preview.substring(0, maxLength) + '...';
  }
  return preview.replace(/[#*!_\[\]()`]/g, '');
}

export function removeMarkDown(mdContent) {
  if (!mdContent) return '';
  let result = marked.parse(DOMPurify.sanitize(mdContent));
  const span = document.createElement('span');
  span.innerHTML = result;
  result = span.textContent || span.innerText;
  return result;
}

export function convertMarkDown(mdContent: string, directoryPath: string) {
  const customRenderer = new marked.Renderer();
  customRenderer.link = (href, title, text) => `
      <a href="#"
        title="${href}"
        onClick="event.preventDefault(); event.stopPropagation(); window.postMessage(JSON.stringify({ command: 'openLinkExternally', link: '${href}' }), '*'); return false;">
        ${text}
      </a>`;

  customRenderer.image = (href, title, text) => {
    let sourceUrl = href;
    const dirSep = PlatformIO.getDirSeparator();
    if (
      !sourceUrl.startsWith('http') &&
      directoryPath &&
      directoryPath !== dirSep
    ) {
      sourceUrl = directoryPath.endsWith(dirSep)
        ? directoryPath + sourceUrl
        : directoryPath + dirSep + sourceUrl;
    }
    if (PlatformIO.haveObjectStoreSupport() || PlatformIO.haveWebDavSupport()) {
      sourceUrl = PlatformIO.getURLforPath(sourceUrl);
    }
    return `<img src="${sourceUrl}" style="max-width: 100%">
        ${text}
    </img>`;
  };

  marked.setOptions({
    renderer: customRenderer,
    pedantic: false,
    gfm: true,
    tables: true,
    breaks: false,
    smartLists: true,
    smartypants: false,
    xhtml: true
  });

  return marked.parse(DOMPurify.sanitize(mdContent));
}

/**
 * forbidden characters # \ / * ? " < > |
 * @param dirName
 */
export function dirNameValidation(dirName): boolean {
  if (dirName.length > 0) {
    const rg1 = /^[^#\\/*?"<>|]+$/; // forbidden characters # \ / * ? " < > |
    return !rg1.test(dirName);
  }
  return true;
}

/**
 * return true if no valid
 * @param fileName
 */
export function fileNameValidation(fileName): boolean {
  if (fileName.length > 0) {
    const rg1 = /^[^#\\/*?"<>|]+$/;
    // https://stackoverflow.com/a/11101624/2285631
    const rg2 = /^\./; // cannot start with dot (.)
    const rg3 = /^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i; // forbidden file names
    return !(rg1.test(fileName) && !rg2.test(fileName) && !rg3.test(fileName));
  }
  return true;
}

/**
 *  normalize path for URL is always '/'
 */
export function normalizeUrl(url: string) {
  if (PlatformIO.getDirSeparator() !== '/') {
    if (url) {
      return url.replaceAll(PlatformIO.getDirSeparator(), '/');
    }
  }
  return url;
}

/**
 * @param a - source array
 * @param b - updates array
 * @param prop
 */
export function mergeByProp(a, b, prop) {
  const reduced = a.filter(
    aitem => !b.find(bitem => aitem[prop] === bitem[prop])
  );
  return reduced.concat(b);
}

/**
 * Update a props from b only if empty
 * @param a - source array
 * @param b - updates array
 * @param prop
 */
export function updateByProp(a, b, prop) {
  const commonResults = [];
  const uniqueResults = [];
  for (const el of a) {
    const commonB = b.find(bitem => bitem[prop] === el[prop]);
    if (commonB) {
      const common = {};
      Object.keys(el).forEach(function(key) {
        common[key] = el[key] || commonB[key];
      });
      commonResults.push(common);
    } else {
      uniqueResults.push(el);
    }
  }
  const uniqueB = b.filter(
    bitem => !a.find(aitem => bitem[prop] === aitem[prop])
  );
  return [...commonResults, ...uniqueResults, ...uniqueB];
}

/**
 * https://stackoverflow.com/a/71981197/2285631
 * @param a
 * @param b
 */
export const merge = (a, b) => {
  const allKeys = { ...b, ...a };
  return Object.fromEntries(
    Object.entries(allKeys).map(([k, v]) => [
      k,
      v && Array.isArray(v) ? mergeTags(v, b[k]) : v || b[k]
    ])
  );
};

function mergeTags(oldTagsArray: Array<TS.Tag>, newTagsArray: Array<TS.Tag>) {
  if (newTagsArray.length === 0) {
    return oldTagsArray;
  }
  const uniqueTags = newTagsArray.filter(
    newTag => !oldTagsArray.some(oldTag => oldTag.title === newTag.title)
  );
  return [...oldTagsArray, ...uniqueTags];
}

export function getFolderThumbPath(
  path: string,
  lastThumbnailImageChange: any
) {
  return getThumbPath(
    getThumbFileLocationForDirectory(path, PlatformIO.getDirSeparator()),
    lastThumbnailImageChange
  );
}

export function getThumbPath(
  thumbPath: string,
  lastThumbnailImageChange?: any
) {
  if (!thumbPath) {
    return undefined;
  }
  if (PlatformIO.haveObjectStoreSupport() || PlatformIO.haveWebDavSupport()) {
    if (isSignedURL(thumbPath)) {
      return thumbPath;
    }
    return PlatformIO.getURLforPath(thumbPath);
  }
  return (
    normalizeUrl(thumbPath) +
    (lastThumbnailImageChange &&
    lastThumbnailImageChange.thumbPath === thumbPath
      ? '?' + lastThumbnailImageChange.dt
      : '')
  );
}

function isSignedURL(signedUrl) {
  try {
    // const query = url.parse(signedUrl, true).query;
    return signedUrl.indexOf('Signature=') !== -1;
  } catch (ex) {}
  return false;
}

export function getFolderBgndPath(
  path: string,
  lastBackgroundImageChange: any
) {
  return getBgndPath(
    getBgndFileLocationForDirectory(path, PlatformIO.getDirSeparator()),
    lastBackgroundImageChange
  );
}

export function getBgndPath(bgndPath: string, lastBackgroundImageChange: any) {
  if (!bgndPath) {
    return undefined;
  }
  if (PlatformIO.haveObjectStoreSupport() || PlatformIO.haveWebDavSupport()) {
    return PlatformIO.getURLforPath(bgndPath);
  }
  return (
    normalizeUrl(bgndPath) +
    (lastBackgroundImageChange &&
    lastBackgroundImageChange.folderPath === bgndPath
      ? '?' + lastBackgroundImageChange.dt
      : '')
  );
}

export function setLocationType(location: TS.Location): Promise<boolean> {
  if (location) {
    if (location.type === locationType.TYPE_CLOUD) {
      return PlatformIO.enableObjectStoreSupport(location);
    } else if (location.type === locationType.TYPE_WEBDAV) {
      PlatformIO.enableWebdavSupport(location);
    } else if (location.type === locationType.TYPE_LOCAL) {
      PlatformIO.disableObjectStoreSupport();
      PlatformIO.disableWebdavSupport();
    }
    return Promise.resolve(true);
  }
  return Promise.resolve(false);
}

export function getCleanLocationPath(location: TS.Location): string {
  let locationPath = PlatformIO.getLocationPath(location);
  locationPath = cleanTrailingDirSeparator(locationPath);
  return locationPath;
}

export function getRelativeEntryPath(
  location: TS.Location,
  entryPath: string
): string {
  const entryPathCleaned = cleanTrailingDirSeparator(entryPath);
  // const isCloudLocation = location.type === locationType.TYPE_CLOUD;
  const currentLocationPath = getCleanLocationPath(location);
  // let relEntryPath = isCloudLocation
  //   ? entryPathCleaned
  //   : entryPathCleaned.replace(currentLocationPath, '');
  let relEntryPath = entryPathCleaned.replace(currentLocationPath, '');
  relEntryPath = cleanFrontDirSeparator(relEntryPath);
  return relEntryPath;
}

/**
 * @param entries
 * @param entriesChanges Array<TS.FileSystemEntry> but partly changes from FileSystemEntry model like { tags:[] } are acceptable
 * return entries: Array<TS.FileSystemEntry> updated from
 */
export function updateFsEntries(
  entries: Array<TS.FileSystemEntry>,
  entriesChanges: Array<any>
): Array<TS.FileSystemEntry> {
  return entries.map(entry => {
    const entryUpdated = entriesChanges.find(e => e.path === entry.path);
    if (!entryUpdated) {
      return entry;
    }

    return {
      ...entry,
      ...entryUpdated
    };
  });
}

export function mergeFsEntryMeta(props: any = {}): TS.FileSystemEntryMeta {
  return {
    appName: versionMeta.name,
    appVersion: versionMeta.version,
    description: '',
    lastUpdated: new Date().getTime(),
    tags: [],
    ...props,
    id: props.id || getUuid()
  };
}

export function createFsEntryMeta(
  path: string,
  props: any = {}
): Promise<string> {
  const newFsEntryMeta: TS.FileSystemEntryMeta = mergeFsEntryMeta(props);
  return saveMetaDataPromise(path, newFsEntryMeta)
    .then(() => newFsEntryMeta.id)
    .catch(error => {
      console.error(
        'Error saveMetaDataPromise for ' +
          path +
          ' orphan id: ' +
          newFsEntryMeta.id,
        error
      );
      return newFsEntryMeta.id;
    });
}
export function getDefaultViewer(fileType) {
  const type = supportedFileTypes.find(fType => fType.type === fileType);
  if (type) {
    return type.viewer;
  }
  return undefined;
}
export function getDefaultEditor(fileType) {
  const type = supportedFileTypes.find(fType => fType.type === fileType);
  if (type) {
    return type.editor;
  }
  return undefined;
}
