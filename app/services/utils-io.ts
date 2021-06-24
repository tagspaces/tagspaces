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

import uuidv1 from 'uuid';
import { saveAs } from 'file-saver';
import micromatch from 'micromatch';
import PlatformIO from './platform-io';
import AppConfig from '../config';
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
  getThumbFileLocationForDirectory
} from '-/utils/paths';
import i18n from '../services/i18n';
import versionMeta from '../version.json';
import { getThumbnailURLPromise } from '-/services/thumbsgenerator';
import { OpenedEntry, actions as AppActions } from '-/reducers/app';
import { getLocation } from '-/reducers/locations';
import { TS } from '-/tagspaces.namespace';
import { locationType } from '-/utils/misc';

export function enhanceDirectoryContent(
  dirEntries,
  isCloudLocation,
  showUnixHiddenEntries,
  useGenerateThumbnails,
  showDirs = true,
  limit = undefined
) {
  const directoryContent = [];
  const tmbGenerationPromises = [];
  const tmbGenerationList = [];
  const isWorkerAvailable = PlatformIO.isWorkerAvailable();

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

    const enhancedEntry = enhanceEntry(entry);
    directoryContent.push(enhancedEntry);
    if (
      // Enable thumb generation by
      !AppConfig.isWeb && // not in webdav mode
      !PlatformIO.haveObjectStoreSupport() && // not in object store mode
      enhancedEntry.isFile && // only for files
      useGenerateThumbnails // enabled in the settings
    ) {
      const isPDF = enhancedEntry.path.endsWith('.pdf');
      if (isWorkerAvailable && !isPDF) {
        tmbGenerationList.push(enhancedEntry.path);
      } else {
        tmbGenerationPromises.push(getThumbnailURLPromise(enhancedEntry.path));
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

export function enhanceEntry(entry: any): TS.FileSystemEntry {
  let fileNameTags = [];
  if (entry.isFile) {
    fileNameTags = extractTagsAsObjects(
      entry.name,
      AppConfig.tagDelimiter,
      PlatformIO.getDirSeparator()
    );
  }
  let sidecarDescription;
  let sidecarColor;
  let sidecarPerspective;
  let sidecarTags = [];
  if (entry.meta) {
    sidecarDescription = entry.meta.description;
    sidecarColor = entry.meta.color;
    sidecarPerspective = entry.meta.perspective;
    sidecarTags = entry.meta.tags || [];
    sidecarTags.map(tag => {
      tag.type = 'sidecar';
      if (tag.id) {
        delete tag.id;
      }
      return true;
    });
  }
  const enhancedEntry: TS.FileSystemEntry = {
    uuid: uuidv1(),
    name: entry.name,
    isFile: entry.isFile,
    extension: entry.isFile
      ? extractFileExtension(entry.name, PlatformIO.getDirSeparator())
      : '',
    tags: [...sidecarTags, ...fileNameTags],
    size: entry.size,
    lmdt: entry.lmdt,
    path: entry.path,
    isIgnored: entry.isIgnored
  };
  if (sidecarDescription) {
    enhancedEntry.description = sidecarDescription;
  }
  if (entry && entry.thumbPath) {
    enhancedEntry.thumbPath = entry.thumbPath;
  }
  if (entry && entry.textContent) {
    enhancedEntry.textContent = entry.textContent;
  }
  if (sidecarColor) {
    enhancedEntry.color = sidecarColor;
  }
  if (sidecarPerspective) {
    enhancedEntry.perspective = sidecarPerspective;
  }
  // console.log('Enhancing ' + entry.path); console.log(enhancedEntry);
  return enhancedEntry;
}

export function enhanceOpenedEntry(
  entry: OpenedEntry,
  tagDelimiter
): OpenedEntry {
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
  return entry;
}

export function prepareDirectoryContent(
  dirEntries,
  directoryPath,
  settings,
  dispatch,
  getState,
  dirEntryMeta
) {
  const currentLocation: TS.Location = getLocation(
    getState(),
    getState().app.currentLocationId
  );
  const isCloudLocation = currentLocation.type === locationType.TYPE_CLOUD;

  const {
    directoryContent,
    tmbGenerationPromises,
    tmbGenerationList
  } = enhanceDirectoryContent(
    dirEntries,
    isCloudLocation,
    settings.showUnixHiddenEntries,
    settings.useGenerateThumbnails
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

  dispatch(AppActions.setGeneratingThumbnails(false));
  if (tmbGenerationList.length > 0) {
    dispatch(AppActions.setGeneratingThumbnails(true));
    PlatformIO.createThumbnailsInWorker(tmbGenerationList)
      .then(handleTmbGenerationResults)
      .catch(handleTmbGenerationFailed);
  }
  if (tmbGenerationPromises.length > 0) {
    dispatch(AppActions.setGeneratingThumbnails(true));
    Promise.all(tmbGenerationPromises)
      .then(handleTmbGenerationResults)
      .catch(handleTmbGenerationFailed);
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

export function findExtensionPathForId(extensionId: string): string {
  const extensionPath = 'node_modules/' + extensionId;
  return extensionPath;
}

export function findExtensionsForEntry(
  supportedFileTypes: Array<any>,
  entryPath: string,
  isFile: boolean = true
): OpenedEntry {
  const fileExtension = extractFileExtension(
    entryPath,
    PlatformIO.getDirSeparator()
  ).toLowerCase();
  const viewingExtensionPath = isFile
    ? findExtensionPathForId('@tagspaces/text-viewer')
    : 'about:blank';
  const fileForOpening: OpenedEntry = {
    path: entryPath,
    viewingExtensionPath,
    viewingExtensionId: '',
    isFile,
    changed: false,
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
        fileType.viewer
      );
      if (fileType.editor && fileType.editor.length > 0) {
        fileForOpening.editingExtensionId = fileType.editor;
        fileForOpening.editingExtensionPath = findExtensionPathForId(
          fileType.editor
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

export function createDirectoryIndex(
  directoryPath: string,
  extractText: boolean = false,
  ignorePatterns: Array<string>
): Promise<Array<TS.FileSystemEntry>> {
  const dirPath = cleanTrailingDirSeparator(directoryPath);
  if (PlatformIO.isWorkerAvailable() && !PlatformIO.haveObjectStoreSupport()) {
    // Start indexing in worker if not in the object store mode
    return PlatformIO.createDirectoryIndexInWorker(
      dirPath,
      extractText,
      ignorePatterns
    );
  }

  const SearchIndex = [];

  // eslint-disable-next-line compat/compat
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let counter = 0;
      console.time('createDirectoryIndex');
      walkDirectory(
        dirPath,
        {
          recursive: true,
          skipMetaFolder: true,
          skipDotHiddenFolder: true,
          extractText
        },
        fileEntry => {
          counter += 1;
          if (counter > AppConfig.indexerLimit) {
            console.warn('Walk canceled by ' + AppConfig.indexerLimit);
            window.walkCanceled = true;
          }
          SearchIndex.push(enhanceEntry(fileEntry));
        },
        directoryEntry => {
          if (directoryEntry.name !== AppConfig.metaFolder) {
            counter += 1;
            SearchIndex.push(enhanceEntry(directoryEntry));
          }
        },
        ignorePatterns
      )
        .then(() => {
          // entries - can be used for further processing
          window.walkCanceled = false;
          console.log(
            'Directory index created ' +
              dirPath +
              ' containing ' +
              SearchIndex.length
          );
          console.timeEnd('createDirectoryIndex');
          resolve(SearchIndex);
          return true;
        })
        .catch(err => {
          window.walkCanceled = false;
          console.timeEnd('createDirectoryIndex');
          console.warn('Error creating index: ' + err);
          reject(err);
        });
    }, 2000);
  });
}

export function walkDirectory(
  path: string,
  options: Object = {},
  fileCallback: any,
  dirCallback: any,
  ignorePatterns: Array<string> = []
) {
  if (ignorePatterns.length > 0 && micromatch.isMatch(path, ignorePatterns)) {
    return;
  }
  const mergedOptions = {
    recursive: false,
    skipMetaFolder: true,
    skipDotHiddenFolder: false,
    skipDotHiddenFiles: false,
    loadMetaDate: true,
    extractText: false,
    ...options
  };
  return (
    PlatformIO.listDirectoryPromise(path, false, mergedOptions.extractText)
      // @ts-ignore
      .then(entries => {
        if (window.walkCanceled || entries === undefined) {
          return false;
        }

        return Promise.all(
          entries.map(entry => {
            if (window.walkCanceled) {
              return false;
            }

            if (
              ignorePatterns.length > 0 &&
              micromatch.isMatch(entry.path, ignorePatterns)
            ) {
              return false;
            }

            if (entry.isFile) {
              if (
                fileCallback &&
                (!mergedOptions.skipDotHiddenFiles ||
                  !entry.name.startsWith('.'))
              ) {
                fileCallback(entry);
              }
              return entry;
            }

            if (
              dirCallback &&
              (!mergedOptions.skipDotHiddenFolder ||
                !entry.name.startsWith('.')) &&
              (!mergedOptions.skipMetaFolder ||
                entry.name !== AppConfig.metaFolder)
            ) {
              dirCallback(entry);
            }

            if (mergedOptions.recursive) {
              if (
                mergedOptions.skipDotHiddenFolder &&
                entry.name.startsWith('.')
              ) {
                return entry;
              }
              if (
                mergedOptions.skipMetaFolder &&
                entry.name === AppConfig.metaFolder
              ) {
                return entry;
              }
              return walkDirectory(
                entry.path,
                mergedOptions,
                fileCallback,
                dirCallback,
                ignorePatterns
              );
            }
            return entry;
          })
        );
      })
      .catch(err => {
        console.warn('Error walking directory ' + err);
        return err;
      })
  );
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
    return enhanceEntry(entryProps);
  }
  console.warn('Error getting props for ' + entryPath);
  return entryProps;
}

export async function loadJSONFile(filePath: string) {
  const jsonContent = await PlatformIO.loadTextFilePromise(filePath);
  return loadJSONString(jsonContent);
  /* const UTF8_BOM = '\ufeff';
  if (jsonContent.indexOf(UTF8_BOM) === 0) {
    jsonContent = jsonContent.substring(1, jsonContent.length);
  }
  try {
    jsonObject = JSON.parse(jsonContent);
  } catch (err) {
    console.warn('Error parsing meta json file for ' + filePath + ' - ' + err);
  }
  return jsonObject; */
}

export function loadJSONString(jsonContent: string) {
  let jsonObject;
  let json;
  const UTF8_BOM = '\ufeff';
  if (jsonContent.indexOf(UTF8_BOM) === 0) {
    json = jsonContent.substring(1, jsonContent.length);
  } else {
    json = jsonContent;
  }
  try {
    jsonObject = JSON.parse(json);
  } catch (err) {
    console.error('Error parsing meta json file: ' + json, err);
  }
  return jsonObject;
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
  const fileRenamePromises = [];
  renameJobs.forEach(renameJob => {
    fileRenamePromises.push(
      PlatformIO.renameFilePromise(renameJob[0], renameJob[1])
    );
  });
  return Promise.all(fileRenamePromises);
}

export function copyFilesPromise(copyJobs: Array<Array<string>>) {
  const ioJobPromises = [];
  copyJobs.forEach(copyJob => {
    ioJobPromises.push(PlatformIO.copyFilePromise(copyJob[0], copyJob[1]));
  });
  return Promise.all(ioJobPromises);
}

export async function loadSubFolders(
  path: string,
  loadHidden: boolean = false
) {
  const folderContent = await PlatformIO.listDirectoryPromise(path, true);
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
  path: string
): Promise<TS.FileSystemEntryMeta> {
  const entryProperties = await PlatformIO.getPropertiesPromise(path);
  if (!entryProperties.isFile) {
    const metaFilePath = getMetaFileLocationForDir(
      path,
      PlatformIO.getDirSeparator(),
      AppConfig.folderLocationsFile
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

export async function loadMetaDataPromise(
  path: string
): Promise<TS.FileSystemEntryMeta> {
  const entryProperties = await PlatformIO.getPropertiesPromise(path);
  let metaDataObject;
  if (entryProperties.isFile) {
    const metaFilePath = getMetaFileLocationForFile(
      path,
      PlatformIO.getDirSeparator()
    );
    let metaData;
    try {
      metaData = await loadJSONFile(metaFilePath);
    } catch (e) {
      console.debug('cannot load json:' + metaFilePath, e);
    }
    if (!metaData) {
      metaData = {};
    }
    metaDataObject = {
      ...metaData,
      description: metaData.description || '',
      color: metaData.color || '',
      tags: metaData.tags || [],
      appName: metaData.appName || '',
      appVersion: metaData.appVersion || '',
      lastUpdated: metaData.lastUpdated || ''
    };
  } else {
    const metaFilePath = getMetaFileLocationForDir(
      path,
      PlatformIO.getDirSeparator()
    );
    let metaData;
    try {
      metaData = await loadJSONFile(metaFilePath);
    } catch (e) {
      console.debug('cannot load json:' + metaFilePath, e);
    }
    if (!metaData) {
      metaData = {};
    }
    metaDataObject = {
      ...metaData,
      id: metaData.id || uuidv1(),
      description: metaData.description || '',
      color: metaData.color || '',
      perspective: metaData.perspective || '',
      tags: metaData.tags || [],
      appName: metaData.appName || '',
      appVersion: metaData.appVersion || '',
      lastUpdated: metaData.lastUpdated || '',
      files: metaData.files || [],
      dirs: metaData.dirs || []
    };
  }
  return metaDataObject;
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
  if (metaData.color) {
    cleanedMeta.color = metaData.color;
  }
  if (metaData.description) {
    cleanedMeta.description = metaData.description;
  }
  if (metaData.files && metaData.files.length > 0) {
    cleanedMeta.files = metaData.files;
  }
  if (metaData.dirs && metaData.dirs.length > 0) {
    cleanedMeta.dirs = metaData.dirs;
  }
  if (metaData.tagGroups && metaData.tagGroups.length > 0) {
    cleanedMeta.tagGroups = metaData.tagGroups;
  }
  if (metaData.tags && metaData.tags.length > 0) {
    cleanedMeta.tags = [];
    metaData.tags.forEach(tag => {
      const cleanedTag: TS.Tag = {};
      if (tag.title) {
        cleanedTag.title = tag.title;
      }
      if (tag.type) {
        cleanedTag.type = tag.type;
      }
      if (tag.color) {
        cleanedTag.color = tag.color;
      }
      if (tag.textcolor) {
        cleanedTag.textcolor = tag.textcolor;
      }
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
    return PlatformIO.saveTextFilePromise(metaFilePath, content, true);
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
      /* await PlatformIO.createDirectoryPromise(
        extractContainingDirectoryPath(
          metaFilePath,
          PlatformIO.getDirSeparator()
        )
      ); */
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
        cleanedMetaData.id = uuidv1();
      }

      metaFilePath = getMetaFileLocationForDir(
        path,
        PlatformIO.getDirSeparator()
      );
    }
    cleanedMetaData.appName = versionMeta.name;
    cleanedMetaData.appVersion = versionMeta.version;
    cleanedMetaData.lastUpdated = new Date().toJSON();
    const content = JSON.stringify(cleanedMetaData);
    return PlatformIO.saveTextFilePromise(metaFilePath, content, true);
  }
  return new Promise((resolve, reject) =>
    reject(new Error('file not found' + path))
  );
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
    getThumbFileLocationForFile(filePath, PlatformIO.getDirSeparator()),
    getThumbFileLocationForDirectory(
      directoryPath,
      PlatformIO.getDirSeparator()
    ),
    i18n.t('core:thumbAlreadyExists', { directoryName })
  ).then(() => directoryPath);
}

export function findColorForFileEntry(
  fileExtension: string,
  isFile: boolean,
  supportedFileTypes: Array<any>
): string {
  if (!isFile) {
    return AppConfig.defaultFolderColor;
  }
  let color = AppConfig.defaultFileColor;
  if (fileExtension !== undefined) {
    supportedFileTypes.map(fileType => {
      if (fileType.type.toLowerCase() === fileExtension.toLowerCase()) {
        if (fileType.color) {
          color = fileType.color;
        }
      }
      return true;
    });
  }
  return color;
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
        reject('loadFileContentPromise error');
      }
    };
    xhr.send();
  });
}
