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
 */

import AppConfig from '-/AppConfig';
import { Pro } from '-/pro';
import defaultSettings from '-/reducers/settings-default';
import i18n from '-/services/i18n';
import { TS } from '-/tagspaces.namespace';
import { CommonLocation } from '-/utils/CommonLocation';
import { prepareTagForExport } from '@tagspaces/tagspaces-common/misc';
import {
  baseName,
  cleanFrontDirSeparator,
  cleanRootPath,
  cleanTrailingDirSeparator,
  extractFileExtension,
  extractFileName,
  extractTagsAsObjects,
  generateSharingLink,
} from '@tagspaces/tagspaces-common/paths';
import { getUuid, loadJSONString } from '@tagspaces/tagspaces-common/utils-io';
import Links from 'assets/links';
import DOMPurify from 'dompurify';
import { saveAs } from 'file-saver';
import { marked } from 'marked';
import removeMd from 'remove-markdown';
import versionMeta from '../version.json';

export const instanceId = getUuid();

export function getAllTags(
  entry: TS.FileSystemEntry,
  tagDelimiter: string,
): Array<TS.Tag> {
  const tags = [];
  if (entry.meta && entry.meta.tags && entry.meta.tags.length > 0) {
    tags.push(...entry.meta.tags);
  }
  let fileNameTags;
  if (entry.tags && entry.tags.length > 0) {
    fileNameTags = entry.tags;
  } else if (
    entry.path.indexOf(AppConfig.beginTagContainer) !== -1 &&
    entry.path.indexOf(AppConfig.endTagContainer) !== -1
  ) {
    fileNameTags = extractTagsAsObjects(entry.name, tagDelimiter);
  }
  if (fileNameTags) {
    if (tags.length > 0) {
      const filteredTags = fileNameTags.filter(
        (tag) => !tags.some((t) => t.title === tag.title),
      );
      tags.push(...filteredTags);
    } else {
      tags.push(...fileNameTags);
    }
  }
  return tags;
}

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
    if (
      directories &&
      directories.length > 0 &&
      metaArray &&
      metaArray.length > 0
    ) {
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

export interface CandidateExtension {
  extensionId: string;
  extensionName: string;
  role: 'viewer' | 'editor';
  isDefault: boolean;
}

const TEXT_EDITOR_ID = '@tagspaces/extensions/text-editor';

export function findCandidateExtensionsForFile(
  filePath: string,
  supportedFileTypes: Array<TS.FileTypes>,
  extensionsFound: Array<{
    extensionId: string;
    extensionName: string;
    extensionTypes: string[];
    extensionEnabled: boolean;
  }>,
  dirSeparator: string = AppConfig.dirSeparator,
): CandidateExtension[] {
  const fileExtension = extractFileExtension(
    filePath,
    dirSeparator,
  ).toLowerCase();
  const fileType = supportedFileTypes.find(
    (ft) => ft.type && ft.type.toLowerCase() === fileExtension,
  );
  const defaultViewerId = fileType?.viewer;
  const defaultEditorId = fileType?.editor;

  const candidates: CandidateExtension[] = [];
  const seenIds = new Set<string>();

  const add = (
    extensionId: string | undefined,
    role: 'viewer' | 'editor',
    isDefault: boolean,
  ) => {
    if (!extensionId) return;
    if (seenIds.has(extensionId)) return;
    const ext = extensionsFound.find((e) => e.extensionId === extensionId);
    if (!ext || !ext.extensionEnabled) return;
    if (!ext.extensionTypes?.includes(role)) return;
    seenIds.add(extensionId);
    candidates.push({
      extensionId,
      extensionName: ext.extensionName,
      role,
      isDefault,
    });
  };

  add(defaultViewerId, 'viewer', true);
  add(defaultEditorId, 'editor', true);
  add(TEXT_EDITOR_ID, 'viewer', defaultViewerId === TEXT_EDITOR_ID);
  add(TEXT_EDITOR_ID, 'editor', defaultEditorId === TEXT_EDITOR_ID);

  return candidates;
}

export function findExtensionPathForId(
  extensionId: string,
  extensionExternalPath = undefined,
): string {
  if (extensionExternalPath) {
    return (
      AppConfig.mediaProtocol +
      ':///' +
      extensionExternalPath +
      '/' +
      extensionId
    );
  }
  if (AppConfig.isWeb) {
    return 'modules/' + extensionId;
  }
  if (AppConfig.isNativeMobile) {
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
  return { ...nextFile, meta: { ...nextFile.meta, id: undefined } };
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
  return { ...prevFile, meta: { ...prevFile.meta, id: undefined } };
}

export function saveAsTextFile(blob: any, filename: string) {
  saveAs(blob, filename);
}

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
    return tags.map((tagTitle) => {
      const tag: TS.Tag = {
        //type: taggroupTags.length > 0 ? taggroupTags[0].type : 'sidecar',
        title: tagTitle.trim(),
        //functionality: '',
        //description: '',
        //icon: '',
        color: tagGroup.color,
        textcolor: tagGroup.textcolor,
        //style: taggroupTags.length > 0 ? taggroupTags[0].style : '',
        modified_date: new Date().getTime(),
      };
      return tag;
    });
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
  defaultFolderColor: string,
): string {
  if (!fsEntry.isFile) {
    return defaultFolderColor;
  }
  if (fsEntry.extension !== undefined) {
    return findColorForFileExt(fsEntry.extension, supportedFileTypes);
  }
  return AppConfig.defaultFileColor;
}

export function findColorForFileExt(
  fileExt: string,
  supportedFileTypes: Array<any>,
): string {
  if (fileExt) {
    const fileType = supportedFileTypes?.find(
      (type) => type.type.toLowerCase() === fileExt.toLowerCase(),
    );
    if (fileType && fileType.color) {
      return fileType.color;
    } else {
      return AppConfig.defaultFileColor;
    }
  } else {
    return AppConfig.defaultFileColor;
  }
}

export function loadFileContentPromise(
  fullPath: string,
  type: string = 'arraybuffer',
): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr: any = new XMLHttpRequest();
    xhr.open('GET', fullPath, true);
    xhr.responseType = type;
    xhr.onerror = reject;
    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 0) {
        const response = xhr.response || xhr.responseText;
        resolve(response);
      } else {
        reject(new Error('loadFileContentPromise error'));
      }
    };
    xhr.send();
  });
}

export function getLastVersionPromise(signal?: AbortSignal): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log('Checking for new version...');
    // Allow the caller to abort the request — if the dialog/component
    // unmounts before the server responds, the xhr can be aborted instead
    // of leaking through closure refs. Pre-aborted signals reject right
    // away.
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    let versionFile = 'tagspaces.json';
    const proText = Pro ? 'pro-' : '';
    if (AppConfig.isWeb) {
      versionFile = 'tagspaces-pro-web.json';
    } else if (AppConfig.isWin) {
      versionFile = 'tagspaces-' + proText + 'win-x64.json';
    } else if (AppConfig.isMacLike) {
      versionFile = 'tagspaces-' + proText + 'mac.json';
    } else if (AppConfig.isLinux) {
      versionFile = 'tagspaces-' + proText + 'linux-x64.json';
    } else if (AppConfig.isAndroid) {
      versionFile = 'tagspaces-' + proText + 'android.json';
    }
    const updateUrl =
      Links.links.checkNewVersionURL +
      versionFile +
      '?cv=' +
      versionMeta.version;

    // HTTPS enforcement — refuse to fetch update metadata over plain HTTP.
    // The version string is read into trusted code paths (semver compare,
    // user-visible "X is available" prompt), so a MITM-injected response
    // is the wrong thing to silently downgrade to.
    if (!updateUrl.startsWith('https://')) {
      reject(new Error('Update URL must use https:// — refusing to fetch'));
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', updateUrl, true);
    xhr.responseType = 'text';
    // 10s ceiling so a hung server (slow DNS, captive portal silently
    // dropping packets) doesn't leave the promise dangling forever and
    // block consumers like initApp's checkForUpdate dispatch.
    xhr.timeout = 10000;

    const onAbort = () => {
      try {
        xhr.abort();
      } catch {
        /* xhr already done */
      }
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
    const cleanup = () => {
      signal?.removeEventListener('abort', onAbort);
    };

    xhr.onerror = () => {
      cleanup();
      reject(new Error('Network error while checking for new version'));
    };
    xhr.ontimeout = () => {
      cleanup();
      reject(new Error('Timeout while checking for new version'));
    };
    xhr.onload = () => {
      cleanup();
      // Non-2xx responses (404, 500, captive-portal HTML, …) reach onload
      // too — bail explicitly so we don't try to JSON-parse arbitrary
      // payloads and silently throw out of the callback.
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(
          new Error(
            `HTTP ${xhr.status}${xhr.statusText ? ' ' + xhr.statusText : ''}`,
          ),
        );
        return;
      }
      // Content-Type guard — only accept what the update server claims is
      // JSON. Captive portals, error pages from CDNs, and CORS preflight
      // misconfigurations often return text/html with a 200; without this
      // check we'd JSON-parse arbitrary HTML. Header value may include
      // charset suffix (e.g. "application/json; charset=utf-8"), so use
      // a prefix match.
      const contentType = (
        xhr.getResponseHeader('Content-Type') || ''
      ).toLowerCase();
      if (contentType && !contentType.startsWith('application/json')) {
        reject(
          new Error(
            `Unexpected Content-Type for update metadata: ${contentType}`,
          ),
        );
        return;
      }
      try {
        const data = xhr.responseText;
        const versioningData = loadJSONString(data);
        if (
          versioningData &&
          versioningData.appVersion &&
          versioningData.appVersion.length > 0
        ) {
          resolve(versioningData.appVersion);
        } else {
          reject(new Error('Could not validate update data'));
        }
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
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
  let preview = removeMd(mdContent);
  if (preview.length > maxLength) {
    preview = preview.substring(0, maxLength) + '...';
  }
  return preview.replaceAll('\n', ' ').replaceAll('|', '').replaceAll('\\', '');
}

export function convertMarkDownToHtml(mdContent: string) {
  marked.setOptions({
    pedantic: false,
    gfm: true,
    breaks: false,
  });
  const creationDate = new Date().toISOString();
  // @ts-ignore
  const sanitiezedHTML = DOMPurify.sanitize(marked.parse(mdContent));
  const result = `<!DOCTYPE html><html>
<head><meta charset="UTF-8"></head>
<body data-createdwith="${versionMeta.name}" data-createdon="${creationDate}">
${sanitiezedHTML}
</body>
</html>`;

  return result;
}

/**
 * @param url
 * return true if valid; false otherwise
 */
export function urlValidation(url: string): boolean {
  if (url.length > 0) {
    const urlRegex = /^(https?|ftp|ts):\/\/([^\s/$.?#].[^\s]*|\?[^ ]*)$/i;
    return urlRegex.test(url);
  }
  return false;
}

/**
 * forbidden characters # \ / * ? " < > | & %
 * @param tagTitle
 * return true if valid; false otherwise
 */
export function tagsValidation(tagTitle: string): boolean {
  if (tagTitle.length > 0) {
    if (tagTitle.trim().length === 0 || tagTitle.includes(' ')) {
      return false;
    }
    const rg1 = /^[^#\\/*?"<>|&%]+$/;
    return rg1.test(tagTitle);
  }
  return false;
}

/**
 * forbidden characters # \ / * ? " < > |
 * @param dirName
 * return notValid
 */
export function dirNameValidation(dirName): boolean {
  if (dirName.length > 0) {
    const rg1 = /^[^#\\/*?"<>|&%]+$/; // forbidden characters # \ / * ? " < > | & %
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

export function getRelativeEntryPath(
  currentLocationPath: string,
  entryPath: string,
): string {
  const entryPathCleaned = cleanTrailingDirSeparator(entryPath);
  const currentPathCleaned = cleanTrailingDirSeparator(currentLocationPath);
  let relEntryPath = entryPathCleaned.replace(currentPathCleaned, '');
  relEntryPath = cleanFrontDirSeparator(relEntryPath);
  return relEntryPath;
}

/**
 * Build a TagSpaces `ts://?...` sharing link for the given entry inside its
 * location. Canonical recipe — all callers that produce a shareable link
 * (FileMenu, DirectoryMenu, FilePickerDialog) should go through this.
 *
 * Files go in the `tsepath` slot, folders in the `tsdpath` slot.
 *
 * `getMetadataID` is required: it produces a stable sidecar UUID that
 * survives renames (the runtime `entry.uuid` does not). Pass the function
 * from `useIOActionsContext()`.
 */
export function buildSharingLinkForEntry(
  entry: TS.FileSystemEntry,
  location: CommonLocation,
  getMetadataID: (
    path: string,
    id: string,
    location: CommonLocation,
    isFile: boolean,
  ) => Promise<string>,
): Promise<string> {
  const sep = location.getDirSeparator?.() || '/';
  const relativeEntryPath = cleanRootPath(
    entry.path || '',
    location.path || '',
    sep,
  );
  return getMetadataID(
    entry.path,
    entry.uuid || '',
    location,
    entry.isFile,
  ).then((id) =>
    entry.isFile
      ? generateSharingLink(location.uuid, relativeEntryPath, undefined, id)
      : generateSharingLink(location.uuid, undefined, relativeEntryPath, id),
  );
}

/**
 * Build a Markdown-style relative path from `sourceDir` to the entry.
 * Returns `null` when relativity is not possible — either no `sourceDir` was
 * provided, or the entry and source dir are not under the same location root.
 *
 * Same directory  → returns the leaf name (e.g. `B.md`).
 * Descendant      → `subdir/B.md`.
 * Sibling/parent  → `../images/B.png`.
 *
 * Callers are responsible for providing the correct `sourceDir`:
 * - For a file's description: the file's containing directory
 * - For a folder's description: the folder itself
 */
export function buildRelativeLinkForEntry(
  entry: TS.FileSystemEntry,
  location: CommonLocation,
  sourceDir: string,
): string | null {
  if (!entry.path || !sourceDir) return null;
  const root = cleanTrailingDirSeparator(location.path || '').replace(
    /\\/g,
    '/',
  );
  const target = cleanTrailingDirSeparator(entry.path).replace(/\\/g, '/');
  const sourceDirNorm = cleanTrailingDirSeparator(sourceDir).replace(
    /\\/g,
    '/',
  );

  // Both source and target must live under the same location root.
  if (root) {
    if (!(target === root || target.startsWith(root + '/'))) return null;
    if (!(sourceDirNorm === root || sourceDirNorm.startsWith(root + '/'))) {
      return null;
    }
  }

  const sourceRel = cleanFrontDirSeparator(
    root ? sourceDirNorm.slice(root.length) : sourceDirNorm,
  );
  const targetRel = cleanFrontDirSeparator(
    root ? target.slice(root.length) : target,
  );
  const sourceSegments = sourceRel ? sourceRel.split('/') : [];
  const targetSegments = targetRel ? targetRel.split('/') : [];

  let common = 0;
  while (
    common < sourceSegments.length &&
    common < targetSegments.length &&
    sourceSegments[common] === targetSegments[common]
  ) {
    common += 1;
  }
  const upHops = sourceSegments.length - common;
  const tail = targetSegments.slice(common).join('/');
  const relative = '../'.repeat(upHops) + tail;
  return relative.length > 0 ? relative : './';
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
    ...(!props.tagGroups && { tags: [] }),
    ...props,
    id: props.id || getUuid(),
  };
}

export function getDefaultViewer(fileType) {
  const type = defaultSettings.supportedFileTypes.find(
    (fType) => fType.type === fileType,
  );
  if (type) {
    return type.viewer;
  }
  return undefined;
}
export function getDefaultEditor(fileType) {
  const type = defaultSettings.supportedFileTypes.find(
    (fType) => fType.type === fileType,
  );
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

export function sanitizeAttribution(html: string | undefined): string {
  return DOMPurify.sanitize(html ?? '', {
    ALLOWED_TAGS: ['a', 'b', 'i', 'em', 'strong', 'span'],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
  });
}

export function openURLExternally(url: string, skipConfirmation = false) {
  if (skipConfirmation) {
    openUrl(url);
  } else if (window.confirm(i18n.t('core:confirmOpenUrl', { url }))) {
    openUrl(url);
  }
}

export function openUrlForWeb(url: string): void {
  if (!url) {
    console.warn('openUrlForWeb: URL is required');
    return;
  }

  const tmpLink = document.createElement('a');
  tmpLink.target = '_blank';
  tmpLink.href = url;
  tmpLink.rel = 'noopener noreferrer';
  document.body.appendChild(tmpLink);
  tmpLink.click();

  // Delay removal to ensure click is fully processed
  // Use requestAnimationFrame for better timing
  requestAnimationFrame(() => {
    if (tmpLink.parentNode) {
      tmpLink.parentNode.removeChild(tmpLink);
    }
  });
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

// `runConcurrent` lives in a leaf module (no Pro / DOM imports) so it can
// be unit-tested without dragging in this whole file. Re-exported here so
// existing callers don't have to change their imports.
export { runConcurrent } from '-/utils/runConcurrent';

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
  extractPDFcontent: boolean,
): Promise<any> {
  if (AppConfig.isElectron) {
    const payload = JSON.stringify(tmbGenerationList);
    return window.electronIO.ipcRenderer.invoke(
      'postRequest',
      payload,
      '/thumb-gen' +
        (extractPDFcontent ? '?pdfContent=' + extractPDFcontent : ''),
    );
  }
  return Promise.reject(new Error('createThumbnailsInWorker not Electron!'));
}

export function getDirProperties(path): Promise<TS.DirProp> {
  if (AppConfig.isElectron) {
    try {
      return window.electronIO.ipcRenderer.invoke('getDirProperties', path);
    } catch (e) {
      return Promise.reject(e);
    }
  } else {
    return Promise.reject(
      new Error('getDirProperties is supported on Electron local storage.'),
    );
  }
}

export function resolveRelativePath(path: string): Promise<string> {
  if (
    path &&
    (path.startsWith('.' + AppConfig.dirSeparator) ||
      path.startsWith('./') ||
      path.startsWith('..' + AppConfig.dirSeparator) ||
      path.startsWith('../')) && // location paths are not with platform dirSeparator
    AppConfig.isElectron
  ) {
    // relative paths
    return window.electronIO.ipcRenderer.invoke('resolveRelativePaths', path);
  }
  return Promise.resolve(path);
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
    confirm(i18n.t('core:confirmOpenFile', { path: filePath }))
  ) {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.sendMessage('openFile', filePath);
    } else if (AppConfig.isNativeMobile) {
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
  } else if (AppConfig.isCapacitor) {
    const ioAPI = require('-/services/io-capacitor');
    return ioAPI.getDevicePaths();
  } else if (AppConfig.isCordova) {
    const ioAPI = require('@tagspaces/tagspaces-common-cordova');
    return ioAPI.getDevicePaths();
  } else {
    console.log('getDevicePaths not supported');
    return Promise.resolve(undefined);
  }
}

/**
 * iOS Capacitor only: resolve the iCloud Drive ubiquity container.
 * Returns { available, containerPath, documentsPath }. `available` is false on
 * any non-iOS platform or when the user isn't signed into iCloud.
 */
export function getICloudContainer(): Promise<{
  available: boolean;
  containerPath?: string;
  documentsPath?: string;
}> {
  if (AppConfig.isCapacitor) {
    const ioAPI = require('-/services/io-capacitor');
    return ioAPI.getICloudContainer();
  }
  return Promise.resolve({ available: false });
}

function buildMetaLookup(
  entriesToMerge: TS.FileSystemEntry[],
): Record<string, TS.FileSystemEntryMeta> {
  const metaLookup: Record<string, TS.FileSystemEntryMeta> = {};
  for (const entry of entriesToMerge) {
    if (!entry) continue;

    const { path, meta } = entry;
    // default meta to an object
    const incomingMeta = meta ?? {};

    // if we haven't seen this path, start with a shallow clone of incomingMeta
    if (!metaLookup[path]) {
      metaLookup[path] = { id: getUuid(), ...incomingMeta };
    } else {
      // now both sides are objects, safe to merge
      Object.assign(metaLookup[path], incomingMeta);
    }
  }

  return metaLookup;
}

/**
 * @param entriesToMerge -> updated entries with only
 * @param dirEntries -> currentDirEntries
 */
export function mergeByPath(
  entriesToMerge: TS.FileSystemEntry[],
  dirEntries: TS.FileSystemEntry[],
): TS.FileSystemEntry[] {
  const lookup = buildMetaLookup(entriesToMerge);

  return dirEntries.map((e) => {
    const extraMeta = lookup[e.path];
    if (extraMeta) {
      return {
        ...e,
        meta: { ...(e.meta || {}), ...extraMeta },
        ...(extraMeta.id && { uuid: extraMeta.id }),
      };
    }
    return e;
  });
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

  if (AppConfig.isNativeMobile) {
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
  } else if (AppConfig.isCapacitor) {
    const ioAPI = require('-/services/io-capacitor');
    return ioAPI.selectDirectoryDialog();
  } else if (AppConfig.isCordova) {
    const ioAPI = require('@tagspaces/tagspaces-common-cordova');
    return ioAPI.selectDirectoryDialog();
  }
  return Promise.reject(new Error('selectDirectoryDialog: not implemented'));
}

export function removePrefix(
  str: string | null | undefined,
  prefix: string | null | undefined,
): string {
  if (str && prefix && str.length > prefix.length && str.startsWith(prefix)) {
    return str.slice(prefix.length);
  }
  return str.trim();
}

// Cached MIME type map for performance
const MIME_TYPE_MAP: Readonly<Record<string, string>> = Object.freeze({
  txt: 'text/plain',
  md: 'text/markdown',
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
});

export function getMimeType(extension: string): string | undefined {
  if (!extension) return undefined;
  return MIME_TYPE_MAP[extension.toLowerCase()];
}

export function toTsLocation(location: CommonLocation): TS.S3Location {
  // Build result with required fields first
  const result: any = {
    uuid: location.uuid || getUuid(),
    name: location.name,
    type: location.type,
  };

  // Add optional fields efficiently - only if they have values
  const optionalFields: Array<keyof CommonLocation> = [
    'workSpaceId',
    'authType',
    'username',
    'password',
    'path',
    'isDefault',
    'isReadOnly',
    'isNotEditable',
    'watchForChanges',
    'disableIndexing',
    'reloadOnFocus',
    'disableThumbnailGeneration',
    'fullTextIndex',
    'extractLinks',
    'maxIndexAge',
    'maxLoops',
    'persistTagsInSidecarFile',
    'ignorePatternPaths',
    'autoOpenedFilename',
    'creationDate',
    'lastEditedDate',
    'accessKeyId',
    'secretAccessKey',
    'sessionToken',
    'bucketName',
    'region',
    'endpointURL',
    'encryptionKey',
  ];

  for (const field of optionalFields) {
    const value = location[field];
    if (value !== undefined && value !== null && value !== '') {
      result[field] = value;
    }
  }

  return result as TS.S3Location;
}

export function toBase64Image(
  uint8Array: Uint8Array | null | undefined,
): string | undefined {
  if (!uint8Array || uint8Array.length === 0) {
    return undefined;
  }
  try {
    return btoa(String.fromCharCode.apply(null, Array.from(uint8Array) as any));
  } catch (e) {
    console.error('toBase64Image error:', e);
    return undefined;
  }
}

/**
 * shallow compare Entries array (and optional mtime)
 * @param a
 * @param b
 */
export function entriesEquals(
  a?: TS.FileSystemEntry[],
  b?: TS.FileSystemEntry[],
) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].path !== b[i]?.path) return false;
    // optional check if you have mtime/mtime-like field
    if ((a[i] as any).mtime !== (b[i] as any)?.mtime) return false;
  }
  return true;
}
