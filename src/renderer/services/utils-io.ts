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
 */

import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import { saveAs } from 'file-saver';
import { prepareTagForExport } from '@tagspaces/tagspaces-common/misc';
import {
  baseName,
  extractFileName,
  cleanTrailingDirSeparator,
  cleanFrontDirSeparator,
} from '@tagspaces/tagspaces-common/paths';
import AppConfig from '-/AppConfig';
import versionMeta from '../version.json';
import { TS } from '-/tagspaces.namespace';
import { supportedFileTypes } from '-/extension-config';
import removeMd from 'remove-markdown';

export function getAllTags(entry: TS.FileSystemEntry): Array<TS.Tag> {
  const tags = [];
  if (entry.meta && entry.meta.tags && entry.meta.tags.length > 0) {
    tags.push(...entry.meta.tags);
  }
  if (entry.tags && entry.tags.length > 0) {
    if (tags.length > 0) {
      const filteredTags = entry.tags.filter(
        (tag) => !tags.some((t) => t.title === tag.title),
      );
      tags.push(...filteredTags);
    } else {
      tags.push(...entry.tags);
    }
  }
  return tags;
}

/*export function enhanceOpenedEntry(
  entry: TS.OpenedEntry,
  tagDelimiter,
): TS.OpenedEntry {
  if (entry.isFile) {
    const fineNameTags = extractTagsAsObjects(
      entry.path,
      tagDelimiter,
      PlatformIO.getDirSeparator(),
    );
    if (fineNameTags.length > 0) {
      if (entry.tags && entry.tags.length > 0) {
        const uniqueTags = entry.tags.filter(
          (tag) =>
            fineNameTags.findIndex((obj) => obj.title === tag.title) === -1,
        );
        return {
          ...entry,
          tags: [...uniqueTags, ...fineNameTags],
        };
      }
      return {
        ...entry,
        tags: fineNameTags,
      };
    }
  } else {
    // ignore wrong size from fs.stats for directories
    return {
      ...entry,
      size: undefined,
    };
  }
  return entry;
}*/

/**
 * sort in place
 * @param directories
 * @param metaArray
 */
export function orderDirectories(
  directories: TS.FileSystemEntry[],
  metaArray: TS.OrderVisibilitySettings[],
) {
  // if (sortBy === 'custom') {
  try {
    if (metaArray && metaArray.length > 0) {
      const arrLength = directories.length;
      directories.sort((a, b) => {
        let indexA = metaArray.findIndex(
          (meta) => meta.name === a.name,
          // meta => meta.path === Object.keys(a)[0]
        );
        let indexB = metaArray.findIndex(
          (meta) => meta.name === b.name,
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
}

export function orderByMetaArray(
  arr,
  metaArray: Array<TS.OrderVisibilitySettings>,
) {
  const arrLength = arr.length;
  return arr.sort((a, b) => {
    let indexA = metaArray.findIndex((metaFiles) => metaFiles.name === a.name);
    let indexB = metaArray.findIndex((metaFiles) => metaFiles.name === b.name);
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
  extensionExternalPath = undefined,
): string {
  if (extensionExternalPath) {
    return extensionExternalPath + '/' + extensionId;
  }
  if (AppConfig.isWeb) {
    return 'modules/' + extensionId;
  }
  if (AppConfig.isCordova) {
    return 'node_modules/' + extensionId;
  }
  return process.env.NODE_ENV === 'development'
    ? 'modules/' + extensionId
    : '../../node_modules/' + extensionId;
}

export function getNextFile(
  pivotFilePath?: string,
  lastSelectedEntry?: string,
  currentDirectoryEntries?: Array<TS.FileSystemEntry>,
): TS.FileSystemEntry {
  const currentEntries = currentDirectoryEntries
    ? currentDirectoryEntries.filter((entry) => entry.isFile)
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
  currentDirectoryEntries?: Array<TS.FileSystemEntry>,
): TS.FileSystemEntry {
  const currentEntries = currentDirectoryEntries
    ? currentDirectoryEntries.filter((entry) => entry.isFile)
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

export function saveAsTextFile(blob: any, filename: string) {
  saveAs(blob, filename);
}

/*function getCommonFolder(paths: Array<string>) {
  const rootFolders = paths.map(p =>
    extractContainingDirectoryPath(p, PlatformIO.getDirSeparator())
  );
  const firstRootFolder = rootFolders[0];
  if (rootFolders.every(rf => rf === firstRootFolder)) {
    return firstRootFolder;
  }
  return false;
}*/

export function isFulfilled<T>(
  result: PromiseSettledResult<T>,
): result is PromiseFulfilledResult<T> {
  return result.status === 'fulfilled';
}

export function isRejected<T>(
  result: PromiseSettledResult<T>,
): result is PromiseRejectedResult {
  return result.status === 'rejected';
}

export function getFulfilledResults<T>(
  results: Array<PromiseSettledResult<T>>,
) {
  return results.filter(isFulfilled).map((result) => result.value);
}

/*export async function loadSubFolders(path: string, loadHidden = false) {
  const folderContent = await PlatformIO.listDirectoryPromise(path, []); // 'extractThumbPath']);
  const subfolders = [];
  let i = 0;
  let isHidden = false;
  if (folderContent !== undefined) {
    folderContent.map((entry) => {
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
              tags: entry.tags,
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
            tags: entry.tags,
          });
        }
      }
      return true;
    });
  }
  return subfolders;
}*/

/*function cleanFileName(fileName, prefixTagContainer) {
  if (prefixTagContainer && fileName.endsWith(prefixTagContainer)) {
    return fileName.slice(0, -prefixTagContainer.length);
  }
  return fileName.trim();
}*/

export function parseNewTags(tagsInput: string, tagGroup: TS.TagGroup) {
  if (tagGroup) {
    let tags = tagsInput.split(' ').join(',').split(','); // handle spaces around commas
    tags = [...new Set(tags)]; // remove duplicates
    tags = tags.filter((tag) => tag && tag.length > 0); // zero length tags

    const taggroupTags = tagGroup.children;
    taggroupTags.forEach((tag) => {
      // filter out duplicated tags
      tags = tags.filter((t) => t !== tag.title);
    });
    return taggroupTags.concat(
      tags.map((tagTitle) => {
        const tag: TS.Tag = {
          type: taggroupTags.length > 0 ? taggroupTags[0].type : 'sidecar',
          title: tagTitle.trim(),
          functionality: '',
          description: '',
          icon: '',
          color: tagGroup.color,
          textcolor: tagGroup.textcolor,
          style: taggroupTags.length > 0 ? taggroupTags[0].style : '',
          modified_date: new Date().getTime(),
        };
        return tag;
      }),
    );
  }
}

export function cleanMetaData(
  metaData: TS.FileSystemEntryMeta,
): TS.FileSystemEntryMeta {
  const cleanedMeta: any = {};
  if (metaData.id) {
    cleanedMeta.id = metaData.id;
  }
  if (metaData.perspective) {
    cleanedMeta.perspective = metaData.perspective;
  }
  if (metaData.color) {
    //&& metaData.color !== 'transparent') {
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
  if (metaData.autoSave !== undefined) {
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
    metaData.tags.forEach((tag) => {
      const cleanedTag = prepareTagForExport(tag);
      if (cleanedTag.title) {
        cleanedMeta.tags.push(cleanedTag);
      }
    });
  }
  return cleanedMeta;
}

export function findBackgroundColorForFolder(fsEntry: TS.FileSystemEntry) {
  if (!fsEntry.isFile) {
    if (fsEntry.meta && fsEntry.meta.color) {
      return fsEntry.meta.color;
    }
  }
  return 'transparent';
}

export function findColorForEntry(
  fsEntry: TS.FileSystemEntry,
  supportedFileTypes: Array<any>,
): string {
  if (!fsEntry.isFile) {
    return AppConfig.defaultFolderColor;
  }
  if (fsEntry.extension !== undefined) {
    const fileType = supportedFileTypes.find(
      (type) => type.type.toLowerCase() === fsEntry.extension.toLowerCase(),
    );

    if (fileType && fileType.color) {
      return fileType.color;
    }
  }
  return AppConfig.defaultFileColor;
}

export function loadFileContentPromise(
  fullPath: string,
  type: string,
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
  // let preview = mdContent
  //   .replace(
  //     /\[(.*?)\]\(.*?\)/g, // remove link href, also dataurls
  //     // /\(data:([\w\/\+]+);(charset=[\w-]+|base64).*,([a-zA-Z0-9+/]+={0,2})\)/g,
  //     '',
  //   )
  //   .replace(/<[^>]*>/g, '') // remove html
  //   .replace(/\*|~|#|_/g, '');
  let preview = removeMd(mdContent);
  if (preview.length > maxLength) {
    preview = preview.substring(0, maxLength) + '...';
  }
  return preview.replaceAll('\n', ' ').replaceAll('|', '').replaceAll('\\', '');
  // .replaceAll('\\\\', '');
  // return preview.replace(/[#*!_\[\]()`]/g, '');
}

// export function removeMarkDown(mdContent) {
//   if (!mdContent) return '';
//   let result = marked.parse(DOMPurify.sanitize(mdContent));
//   const span = document.createElement('span');
//   span.innerHTML = result;
//   result = span.textContent || span.innerText;
//   return result;
// }

// export function convertMarkDown(mdContent: string, directoryPath: string) {
//   const customRenderer = new marked.Renderer();
//   customRenderer.link = (href, title, text) => `
//       <a href="#"
//         title="${href}"
//         onClick="event.preventDefault(); event.stopPropagation(); window.postMessage(JSON.stringify({ command: 'openLinkExternally', link: '${href}' }), '*'); return false;">
//         ${text}
//       </a>`;

//   customRenderer.image = (href, title, text) => {
//     let sourceUrl = href;
//     const dirSep = PlatformIO.getDirSeparator();
//     if (
//       !sourceUrl.startsWith('http') &&
//       directoryPath &&
//       directoryPath !== dirSep
//     ) {
//       sourceUrl = directoryPath.endsWith(dirSep)
//         ? directoryPath + sourceUrl
//         : directoryPath + dirSep + sourceUrl;
//     }
//     if (PlatformIO.haveObjectStoreSupport() || PlatformIO.haveWebDavSupport()) {
//       sourceUrl = PlatformIO.getURLforPath(sourceUrl);
//     }
//     return `<img src="${sourceUrl}" style="max-width: 100%">
//         ${text}
//     </img>`;
//   };
//
//   marked.setOptions({
//     renderer: customRenderer,
//     pedantic: false,
//     gfm: true,
//     tables: true,
//     breaks: false,
//     smartLists: true,
//     smartypants: false,
//     xhtml: true,
//   });

//   return marked.parse(DOMPurify.sanitize(mdContent));
// }

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
 * @param a - source array
 * @param b - updates array
 * @param prop
 */
export function mergeByProp(a, b, prop) {
  const reduced = a.filter(
    (aitem) => !b.find((bitem) => aitem[prop] === bitem[prop]),
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
    const commonB = b.find((bitem) => bitem[prop] === el[prop]);
    if (commonB) {
      const common = {};
      Object.keys(el).forEach(function (key) {
        common[key] = el[key] || commonB[key];
      });
      commonResults.push(common);
    } else {
      uniqueResults.push(el);
    }
  }
  const uniqueB = b.filter(
    (bitem) => !a.find((aitem) => bitem[prop] === aitem[prop]),
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
      v && Array.isArray(v) ? mergeTags(v, b[k]) : v || b[k],
    ]),
  );
};

function mergeTags(oldTagsArray: Array<TS.Tag>, newTagsArray: Array<TS.Tag>) {
  if (newTagsArray.length === 0) {
    return oldTagsArray;
  }
  const uniqueTags = newTagsArray.filter(
    (newTag) => !oldTagsArray.some((oldTag) => oldTag.title === newTag.title),
  );
  return [...oldTagsArray, ...uniqueTags];
}

/*export function setLocationType(location: CommonLocation): Promise<boolean> {
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
}*/

export function getRelativeEntryPath(
  currentLocationPath: string,
  entryPath: string,
): string {
  const entryPathCleaned = cleanTrailingDirSeparator(entryPath);
  const currentPathCleaned = cleanTrailingDirSeparator(currentLocationPath);
  // const isCloudLocation = location.type === locationType.TYPE_CLOUD;
  // const currentLocationPath = getCleanLocationPath(location);
  // let relEntryPath = isCloudLocation
  //   ? entryPathCleaned
  //   : entryPathCleaned.replace(currentLocationPath, '');
  let relEntryPath = entryPathCleaned.replace(currentPathCleaned, '');
  relEntryPath = cleanFrontDirSeparator(relEntryPath);
  return relEntryPath;
}

/**
 * @param entries
 * @param entriesChanges Array<TS.FileSystemEntry> but partly changes from FileSystemEntry model like { path, tags:[] } are acceptable
 * return entries: Array<TS.FileSystemEntry> updated from
 */
export function updateFsEntries(
  entries: Array<TS.FileSystemEntry>,
  entriesChanges: Array<any>,
): Array<TS.FileSystemEntry> {
  return entries.map((entry) => {
    const entryUpdated = entriesChanges.find((e) => e.path === entry.path);
    if (!entryUpdated) {
      return entry;
    }

    return {
      ...entry,
      ...entryUpdated,
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
    id: props.id || getUuid(),
  };
}

/*export function openedToFsEntry(openedEntry: TS.OpenedEntry): TS.FileSystemEntry {
  return {
    uuid: getUuid(),
    name: openedEntry.isFile
      ? extractFileName(openedEntry.path, PlatformIO.getDirSeparator())
      : extractDirectoryName(openedEntry.path, PlatformIO.getDirSeparator()),
    isFile: openedEntry.isFile,
    extension: extractFileExtension(
      openedEntry.path,
      PlatformIO.getDirSeparator(),
    ),
    description: openedEntry.meta?.description,
    tags: openedEntry.tags,
    size: openedEntry.size,
    lmdt: openedEntry.lmdt,
    path: openedEntry.path,
  };
}*/

export function getDefaultViewer(fileType) {
  const type = supportedFileTypes.find((fType) => fType.type === fileType);
  if (type) {
    return type.viewer;
  }
  return undefined;
}
export function getDefaultEditor(fileType) {
  const type = supportedFileTypes.find((fType) => fType.type === fileType);
  if (type) {
    return type.editor;
  }
  return undefined;
}

export function openUrl(url: string): void {
  if (AppConfig.isElectron) {
    window.electronIO.ipcRenderer.sendMessage('openUrl', url);
  } else {
    // web or cordova
    openUrlForWeb(url);
  }
}

export function openURLExternally(url: string, skipConfirmation = false) {
  if (skipConfirmation) {
    openUrl(url);
  } else if (
    window.confirm('Do you really want to open this url: ' + url + ' ?')
  ) {
    openUrl(url);
  }
}

export function openUrlForWeb(url) {
  const tmpLink = document.createElement('a');
  tmpLink.target = '_blank';
  tmpLink.href = url;
  tmpLink.rel = 'noopener noreferrer';
  document.body.appendChild(tmpLink);
  tmpLink.click();
  tmpLink.parentNode.removeChild(tmpLink);
  // window.open(url, '_blank').opener = null;
  // Object.assign(anchor, {
  //   target: '_blank',
  //   href: url,
  //   rel: 'noopener noreferrer'
  // }).click();
}

export async function executePromisesInBatches<T>(
  promises: Promise<T>[],
  batchSize = 5,
): Promise<T[]> {
  const results: T[] = [];

  for (let i = 0; i < promises.length; i += batchSize) {
    const batch = promises.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch);
    results.push(
      ...batchResults.map((result) => {
        if (result.status === 'fulfilled') {
          return result.value as T;
        } else {
          // Handle rejected promise here
          return undefined;
        }
      }),
    );
  }

  return results;
}

export function setZoomFactorElectron(zoomLevel) {
  if (AppConfig.isElectron) {
    window.electronIO.ipcRenderer.sendMessage('setZoomFactor', zoomLevel);
  }
}

export function setGlobalShortcuts(globalShortcutsEnabled) {
  if (AppConfig.isElectron) {
    window.electronIO.ipcRenderer.sendMessage(
      'global-shortcuts-enabled',
      globalShortcutsEnabled,
    );
  }
}

export function loadExtensions() {
  if (AppConfig.isElectron) {
    window.electronIO.ipcRenderer.sendMessage('load-extensions');
  }
}
export function setLanguage(language: string) {
  if (AppConfig.isElectron) {
    window.electronIO.ipcRenderer.sendMessage('set-language', language);
  }
}

/**
 *   needs to run in init this function always return false first time
 */
export function isWorkerAvailable(): Promise<boolean> {
  if (AppConfig.isElectron) {
    return window.electronIO.ipcRenderer.invoke('isWorkerAvailable');
  }
  return Promise.resolve(false);
}

export function createThumbnailsInWorker(
  tmbGenerationList: Array<string>,
): Promise<any> {
  if (AppConfig.isElectron) {
    const payload = JSON.stringify(tmbGenerationList);
    return window.electronIO.ipcRenderer.invoke(
      'postRequest',
      payload,
      '/thumb-gen',
    );
  }
  return Promise.reject(new Error('createThumbnailsInWorker not Electron!'));
}

export function getDirProperties(path): Promise<TS.DirProp> {
  if (AppConfig.isElectron) {
    return window.electronIO.ipcRenderer.invoke('getDirProperties', path);
  } else {
    return Promise.reject(
      new Error(
        'platformDirProperties is supported on Electron local storage.',
      ),
    );
  }
}

export function watchFolderMessage(locationPath, depth) {
  if (AppConfig.isElectron) {
    window.electronIO.ipcRenderer.sendMessage(
      'watchFolder',
      locationPath,
      depth,
    );
  }
}

export function openDirectoryMessage(dirPath: string): void {
  if (AppConfig.isElectron) {
    window.electronIO.ipcRenderer.sendMessage('openDirectory', dirPath);
  } else {
    console.error('Is supported only in Electron');
  }
}

export function openFileMessage(
  filePath: string,
  warningOpeningFilesExternally: boolean,
): void {
  if (
    !warningOpeningFilesExternally ||
    // eslint-disable-next-line no-restricted-globals
    confirm(
      'Do you really want to open "' +
        filePath +
        '"? Execution of some files can be potentially dangerous!',
    )
  ) {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.sendMessage('openFile', filePath);
    } else if (AppConfig.isCordova) {
    } else {
      console.error('Is supported only in Electron');
    }
  }
}

export function createNewInstance(url?: string): void {
  if (AppConfig.isElectron) {
    window.electronIO.ipcRenderer.sendMessage('create-new-window', url);
  } else {
    if (url) {
      window.open(url, '_blank');
    } else {
      window.open('index.html', '_blank');
    }
  }
}

export function readMacOSTags(filename: string): Promise<TS.Tag[]> {
  if (AppConfig.isElectron) {
    return window.electronIO.ipcRenderer.invoke('readMacOSTags', filename);
  }
  return Promise.resolve(undefined);
}

export function getUserDataDir(): Promise<string> {
  if (AppConfig.isElectron) {
    return window.electronIO.ipcRenderer.invoke('getUserDataDir');
  } else {
    return Promise.reject('getUserDataDir is supported only on Electron.');
  }
}

export function unZip(filePath, targetPath): Promise<string> {
  if (AppConfig.isElectron) {
    return window.electronIO.ipcRenderer.invoke('unZip', filePath, targetPath);
  } else {
    console.log('UnZip is supported only on Electron.');
  }
}

/*export function removeExtension(extensionId: string) {
  if (AppConfig.isElectron) {
    window.electronIO.ipcRenderer.sendMessage('removeExtension', extensionId);
  } else {
    console.error('remove extensions is supported only on Electron.');
  }
}*/

export function quitApp(): void {
  if (AppConfig.isElectron) {
    window.electronIO.ipcRenderer.sendMessage('quitApp');
  }
}
export function uploadAbort(path?: string): Promise<any> {
  if (AppConfig.isElectron) {
    return window.electronIO.ipcRenderer.invoke('uploadAbort', path);
  }
  return Promise.resolve(false);
}
export function getDevicePaths(): Promise<any> {
  if (AppConfig.isElectron) {
    return window.electronIO.ipcRenderer.invoke('getDevicePaths');
  } else if (AppConfig.isCordova) {
    const ioAPI = require('@tagspaces/tagspaces-common-cordova');
    return ioAPI.getDevicePaths();
  } else {
    console.log('getDevicePaths not supported');
    return Promise.resolve(undefined);
  }
}

/**
 * @param filePath
 * @param fileUrl
 * @param dirSeparator
 * return 0- succeeded; -1 -error cantDownloadLocalFile; 1 - unknown error
 */
export function downloadFile(
  filePath: string,
  fileUrl: string,
  dirSeparator: string,
): number {
  const entryName = `${baseName(filePath, dirSeparator)}`;
  const fileName = extractFileName(entryName, dirSeparator);

  if (AppConfig.isCordova) {
    if (fileUrl) {
      const downloadCordova = (uri, filename) => {
        const { Downloader } = window.plugins;

        const downloadSuccessCallback = (result) => {
          // result is an object
          /* {
            path: "file:///storage/sdcard0/documents/My Pdf.pdf", // Returns full file path
            file: "My Pdf.pdf", // Returns Filename
            folder: "documents" // Returns folder name
          } */
          console.log(result.file); // My Pdf.pdf
        };

        const downloadErrorCallback = (error) => {
          console.log(error);
        };

        const options = {
          title: 'Downloading File:' + filename, // Download Notification Title
          url: uri, // File Url
          path: filename, // The File Name with extension
          description: 'The file is downloading', // Download description Notification String
          visible: true, // This download is visible and shows in the notifications while in progress and after completion.
          folder: 'documents', // Folder to save the downloaded file, if not exist it will be created
        };

        Downloader.download(
          options,
          downloadSuccessCallback,
          downloadErrorCallback,
        );
      };
      downloadCordova(fileUrl, entryName);
    } else {
      console.log('Can only download HTTP/HTTPS URIs');
      return -1;
      //showNotification(t('core:cantDownloadLocalFile'));
    }
  } else {
    const downloadLink = document.getElementById('downloadFile');
    if (downloadLink) {
      if (AppConfig.isWeb) {
        // eslint-disable-next-line no-restricted-globals
        const { protocol } = location;
        // eslint-disable-next-line no-restricted-globals
        const { hostname } = location;
        // eslint-disable-next-line no-restricted-globals
        const { port } = location;
        const link = `${protocol}//${hostname}${
          port !== '' ? `:${port}` : ''
        }/${filePath}`;
        downloadLink.setAttribute('href', link);
      } else {
        downloadLink.setAttribute('href', `file:///${filePath}`);
      }

      if (fileUrl) {
        // mostly the s3 case
        downloadLink.setAttribute('target', '_blank');
        downloadLink.setAttribute('href', fileUrl);
      }

      downloadLink.setAttribute('download', fileName); // works only for same origin
      downloadLink.click();
      return 0;
    }
  }
  return 1;
}

export function selectDirectoryDialog(): Promise<any> {
  if (AppConfig.isElectron) {
    return window.electronIO.ipcRenderer.invoke('selectDirectoryDialog');
  } else if (AppConfig.isCordova) {
    const ioAPI = require('@tagspaces/tagspaces-common-cordova');
    return ioAPI.selectDirectoryDialog();
  }
  return Promise.reject(new Error('selectDirectoryDialog: not implemented'));
}

export function removePrefix(str, prefix) {
  if (str && prefix && str.length > prefix.length && str.startsWith(prefix)) {
    return str.slice(prefix.length);
  }
  return str.trim();
}

export function getMimeType(extension: string): string | undefined {
  const mimeTypes: { [key: string]: string } = {
    txt: 'text/plain',
    html: 'text/html',
    htm: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
    xml: 'application/xml',
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    bmp: 'image/bmp',
    webp: 'image/webp',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    mp4: 'video/mp4',
    avi: 'video/x-msvideo',
    mov: 'video/quicktime',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
  };
  return mimeTypes[extension.toLowerCase()];
}
