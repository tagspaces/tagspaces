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

import { saveAs } from 'file-saver';
import PlatformIO from './platform-io';
import AppConfig from '../config';
import {
  extractTagsAsObjects,
  extractFileExtension,
  cleanTrailingDirSeparator,
  getMetaDirectoryPath,
  getMetaFileLocationForFile,
  getMetaFileLocationForDir,
  extractContainingDirectoryPath
} from '../utils/paths';
// import { formatDateTime4Tag } from '../utils/misc';
import versionMeta from '../version.json';
import { Tag } from '../reducers/taglibrary';

export interface FileSystemEntry {
  uuid?: string;
  name: string;
  isFile: boolean;
  extension: string;
  thumbPath?: string;
  color?: string;
  textContent?: string;
  description?: string;
  tags?: Array<Tag>;
  size: number;
  lmdt: number;
  path: string;
  meta?: FileSystemEntryMeta;
}

export interface FileSystemEntryMeta {
  description: string;
  tags: Array<Tag>;
  color?: string;
  appVersionCreated: string;
  appName: string;
  appVersionUpdated: string;
  lastUpdated: string;
}

export function enhanceEntry(entry: any): FileSystemEntry {
  let fileNameTags = [];
  if (entry.isFile) {
    fileNameTags = extractTagsAsObjects(entry.name);
  }
  let sidecarDescription = '';
  let sidecarColor = '';
  let sidecarTags = [];
  if (entry.meta) {
    sidecarDescription = entry.meta.description || '';
    sidecarColor = entry.meta.color || '';
    sidecarTags = entry.meta.tags || [];
    sidecarTags.map(tag => {
      tag.type = 'sidecar';
      if (tag.id) {
        delete tag.id;
      }
      return true;
    });
  }
  const enhancedEntry: FileSystemEntry = {
    name: entry.name,
    isFile: entry.isFile,
    extension: entry.isFile ? extractFileExtension(entry.name) : '',
    tags: [...sidecarTags, ...fileNameTags],
    size: entry.size,
    lmdt: entry.lmdt,
    path: entry.path
  };
  if (sidecarDescription) {
    enhancedEntry.description = sidecarDescription;
  }
  // enhancedEntry.description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam vitae magna rhoncus, rutrum dolor id, vestibulum arcu. Maecenas scelerisque nisl quis sollicitudin dapibus. Ut pulvinar est sed nunc finibus cursus. Nam semper felis eu ex auctor, nec semper lectus sagittis. Donec dictum volutpat lorem, in mollis turpis scelerisque in. Morbi pulvinar egestas turpis, euismod suscipit leo egestas eget. Nullam ac mollis sem. \n Quisque luctus dapibus elit, sed molestie ipsum tempor quis. Sed urna turpis, mattis quis orci ac, placerat lacinia est. Pellentesque quis arcu malesuada, consequat magna ut, tincidunt eros. Aenean sodales nisl finibus pharetra blandit. Pellentesque egestas magna et lectus tempor ultricies. Phasellus sed ornare leo. Vivamus sed massa erat. \n Mauris eu dignissim justo, eget luctus nisi. Ut nec arcu quis ligula tempor porttitor. Pellentesque in pharetra quam. Nulla nec ornare magna. Phasellus interdum dictum mauris eget laoreet. In vulputate massa sem, a mattis elit turpis duis.';
  if (entry && entry.thumbPath) {
    enhancedEntry.thumbPath = entry.thumbPath;
  }
  if (entry && entry.textContent) {
    enhancedEntry.textContent = entry.textContent;
  }
  if (sidecarColor) {
    enhancedEntry.color = sidecarColor;
  }
  // console.log('Enhancing ' + entry.path); console.log(enhancedEntry);
  return enhancedEntry;
}

export function createDirectoryIndex(
  directoryPath: string,
  extractText: boolean = false
): Promise<Array<FileSystemEntry>> {
  const dirPath = cleanTrailingDirSeparator(directoryPath);
  if (PlatformIO.isWorkerAvailable() && !PlatformIO.haveObjectStoreSupport()) {
    // Start indexing in worker if not in the object store mode
    return PlatformIO.createDirectoryIndexInWorker(dirPath, extractText);
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
        }
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
  dirCallback: any
) {
  const mergedOptions = {
    recursive: false,
    skipMetaFolder: true,
    skipDotHiddenFolder: false,
    loadMetaDate: true,
    extractText: false,
    ...options
  };
  return (
    PlatformIO.listDirectoryPromise(path, false, mergedOptions.extractText)
      // @ts-ignore
      .then(entries => {
        if (window.walkCanceled) {
          return false;
        }
        return Promise.all(
          entries.map(entry => {
            if (window.walkCanceled) {
              return false;
            }

            if (entry.isFile) {
              if (fileCallback) {
                fileCallback(entry);
              }
              return entry;
            }

            if (dirCallback) {
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
                dirCallback
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
): Promise<FileSystemEntry> {
  const entryProps = await PlatformIO.getPropertiesPromise(entryPath);
  let metaFilePath;
  if (entryProps.isFile) {
    metaFilePath = getMetaFileLocationForFile(
      entryPath,
      PlatformIO.getDirSeparator()
    );
  } else {
    metaFilePath = getMetaFileLocationForDir(
      entryPath,
      PlatformIO.getDirSeparator()
    );
  }
  const metaFileProps = await PlatformIO.getPropertiesPromise(metaFilePath);
  if (metaFileProps.isFile) {
    entryProps.meta = await loadJSONFile(metaFilePath);
  }
  return enhanceEntry(entryProps);
}

export async function loadJSONFile(filePath: string) {
  let jsonObject;
  let jsonContent = await PlatformIO.loadTextFilePromise(filePath);
  const UTF8_BOM = '\ufeff';
  if (jsonContent.indexOf(UTF8_BOM) === 0) {
    jsonContent = jsonContent.substring(1, jsonContent.length);
  }
  try {
    jsonObject = JSON.parse(jsonContent);
  } catch (err) {
    console.warn('Error parsing meta json file for ' + filePath + ' - ' + err);
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
  const fileExt = extractFileExtension(fileName);
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

export async function loadMetaDataPromise(
  path: string
): Promise<FileSystemEntryMeta> {
  const entryProperties = await PlatformIO.getPropertiesPromise(path);
  let metaDataObject;
  if (entryProperties.isFile) {
    const metaFilePath = getMetaFileLocationForFile(path);
    const metaData = await loadJSONFile(metaFilePath);
    metaDataObject = {
      description: metaData.description || '',
      color: metaData.color || '',
      tags: metaData.tags || [],
      appVersionCreated: metaData.appVersionCreated || '',
      appName: metaData.appName || '',
      appVersionUpdated: metaData.appVersionUpdated || '',
      lastUpdated: metaData.lastUpdated || ''
    };
  } else {
    const metaFilePath = getMetaFileLocationForDir(path);
    const metaData = await loadJSONFile(metaFilePath);
    metaDataObject = {
      description: metaData.description || '',
      color: metaData.color || '',
      tags: metaData.tags || [],
      appVersionCreated: metaData.appVersionCreated || '',
      appName: metaData.appName || '',
      appVersionUpdated: metaData.appVersionUpdated || '',
      lastUpdated: metaData.lastUpdated || ''
    };
  }
  return metaDataObject;
}

export async function saveMetaDataPromise(
  path: string,
  metaData: Object
): Promise<any> {
  const entryProperties = await PlatformIO.getPropertiesPromise(path);
  let metaFilePath;
  let newFsEntryMeta;

  if (entryProperties.isFile) {
    metaFilePath = getMetaFileLocationForFile(path);
    // check and create meta folder if not exist
    await PlatformIO.createDirectoryPromise(
      extractContainingDirectoryPath(metaFilePath)
    );

    newFsEntryMeta = {
      ...metaData,
      appName: versionMeta.name,
      appVersionUpdated: versionMeta.version,
      lastUpdated: new Date().toJSON()
    };
  } else {
    // check and create meta folder if not exist
    // todo not need to check if folder exist first createDirectoryPromise() recursively will skip creation of existing folders https://nodejs.org/api/fs.html#fs_fs_mkdir_path_options_callback
    const metaDirectoryPath = getMetaDirectoryPath(path);
    const metaDirectoryProperties = await PlatformIO.getPropertiesPromise(
      metaDirectoryPath
    );
    if (!metaDirectoryProperties) {
      await PlatformIO.createDirectoryPromise(metaDirectoryPath);
    }

    metaFilePath = getMetaFileLocationForDir(path);
    newFsEntryMeta = {
      ...metaData,
      appName: versionMeta.name,
      appVersionUpdated: versionMeta.version,
      lastUpdated: new Date().toJSON()
    };
  }
  const content = JSON.stringify(newFsEntryMeta);
  return PlatformIO.saveTextFilePromise(metaFilePath, content, true);
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
  supportedFileTypes.map(fileType => {
    if (fileType.type.toLowerCase() === fileExtension.toLowerCase()) {
      if (fileType.color) {
        color = fileType.color;
      }
    }
    return true;
  });
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
