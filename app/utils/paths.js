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

import AppConfig from '../config';
import { type Tag } from '../reducers/taglibrary';

export function baseName(dirPath: string) {
  const fileName = dirPath.substring(dirPath.lastIndexOf(AppConfig.dirSeparator) + 1, dirPath.length);
  return fileName || dirPath;
}

export function extractFileExtension(filePath: string) {
  const lastindexDirSeparator = filePath.lastIndexOf(AppConfig.dirSeparator);
  const lastIndexEndTagContainer = filePath.lastIndexOf(AppConfig.endTagContainer);
  const lastindexDot = filePath.lastIndexOf('.');
  if (lastindexDot < 0) {
    return '';
  } else if (lastindexDot < lastindexDirSeparator) {
    // case: "../remote.php/webdav/somefilename"
    return '';
  } else if (lastindexDot < lastIndexEndTagContainer) {
    // case: "[20120125 89.4kg 19.5% 60.5% 39.8% 2.6kg]"
    return '';
  }
  let extension = filePath.substring(lastindexDot + 1, filePath.length).toLowerCase().trim();
  const lastindexQuestionMark = extension.lastIndexOf('?');
  if (lastindexQuestionMark > 0) { // Removing everything after ? in URLs .png?queryParam1=2342
    extension = extension.substring(0, lastindexQuestionMark);
  }
  return extension;

  /* alternative implementation
    const ext = fileURL.split('.').pop();
    return (ext === fileURL) ? '' : ext; */
}

export function getMetaDirectoryPath(directoryPath: string, dirSeparator: string = AppConfig.dirSeparator) {
  return normalizePath(directoryPath) + dirSeparator + AppConfig.metaFolder;
}

export function getMetaFileLocationForFile(entryPath: string, dirSeparator: string = AppConfig.dirSeparator) {
  const containingFolder = extractContainingDirectoryPath(entryPath, dirSeparator);
  const metaFolder = getMetaDirectoryPath(containingFolder, dirSeparator);
  return metaFolder + dirSeparator + extractFileName(entryPath, dirSeparator) + AppConfig.metaFileExt;
}

export function getThumbFileLocationForFile(entryPath: string, dirSeparator: string = AppConfig.dirSeparator) {
  const containingFolder = extractContainingDirectoryPath(entryPath, dirSeparator);
  const metaFolder = getMetaDirectoryPath(containingFolder, dirSeparator);
  return metaFolder + dirSeparator + extractFileName(entryPath, dirSeparator) + AppConfig.thumbFileExt;
}

export function getMetaFileLocationForDir(entryPath: string) {
  const metaFolder = getMetaDirectoryPath(entryPath);
  return metaFolder + AppConfig.dirSeparator + AppConfig.metaFolderFile;
}

export function extractFileName(filePath: string, dirSeparator: string = AppConfig.dirSeparator): string {
  return filePath.substring(filePath.lastIndexOf(dirSeparator) + 1, filePath.length);
}

export function cleanTrailingDirSeparator(dirPath: string): string {
  if (dirPath) {
    if (dirPath.lastIndexOf('\\') === dirPath.length - 1) {
      return dirPath.substring(0, dirPath.length - 1);
    } else if (dirPath.lastIndexOf('/') === dirPath.length - 1) {
      return dirPath.substring(0, dirPath.length - 1);
    }
    return dirPath;
  }
  console.error('Directory Path ' + dirPath + ' undefined');
  return '';
}

/**
 *
 * @param path -> root//subFolder/
 * @returns {string} -> root/subFolder
 */
export function normalizePath(path: string): string {
  return cleanTrailingDirSeparator(path.replace(/\/\//g, '/'));
}

export function extractFileNameWithoutExt(filePath: string): string {
  const fileName = extractFileName(filePath);
  const indexOfDot = fileName.lastIndexOf('.');
  const lastIndexBeginTagContainer = fileName.lastIndexOf(AppConfig.beginTagContainer);
  const lastIndexEndTagContainer = fileName.lastIndexOf(AppConfig.endTagContainer);
  if (lastIndexBeginTagContainer === 0 && lastIndexEndTagContainer + 1 === fileName.length) {
    // case: "[tag1 tag.2]"
    return '';
  } else if (indexOfDot > 0) {
    // case: regular
    return fileName.substring(0, indexOfDot);
  } else if (indexOfDot === 0) {
    // case ".txt"
    return '';
  }
  return fileName;
}

export function extractContainingDirectoryPath(filePath: string, dirSeparator: string = AppConfig.dirSeparator) {
  return filePath.substring(0, filePath.lastIndexOf(dirSeparator));
}

export function extractParentDirectoryPath(dirPath: string, dirSeparator: string = AppConfig.dirSeparator) {
  if (dirPath.endsWith(dirSeparator)) {
    dirPath = dirPath.substring(0, dirPath.lastIndexOf(dirSeparator));
  }
  return dirPath.substring(0, dirPath.lastIndexOf(dirSeparator));
}

export function extractDirectoryName(dirPath: string, dirSeparator: string = AppConfig.dirSeparator) {
  let directoryName;
  if (dirPath.endsWith(dirSeparator)) {
    directoryName = dirPath.substring(0, dirPath.lastIndexOf(dirSeparator));
  }
  directoryName = dirPath.substring(dirPath.lastIndexOf(dirSeparator) + 1, dirPath.length);
  return directoryName;
}

export function extractShortDirectoryName(dirPath: string, dirSeparator: string = AppConfig.dirSeparator) {
  let shortDirName = extractDirectoryName(dirPath, dirSeparator);
  if (shortDirName.length > 20) {
    shortDirName = shortDirName.substr(0, 20) + '...';
  }
  return shortDirName;
}

export function extractContainingDirectoryName(filePath: string) {
  const tmpStr = filePath.substring(0, filePath.lastIndexOf(AppConfig.dirSeparator));
  return tmpStr.substring(tmpStr.lastIndexOf(AppConfig.dirSeparator) + 1, tmpStr.length);
}

export function extractTitle(entryPath: string, isDirectory?: boolean = false) {
  let title;
  if (isDirectory) {
    title = extractDirectoryName(entryPath);
    return title;
  }
  title = extractFileNameWithoutExt(entryPath);

  const beginTagContainer = title.indexOf(AppConfig.beginTagContainer);
  const endTagContainer = title.lastIndexOf(AppConfig.endTagContainer);
  /* cases like "", "t", "["
      if( fileName.length <= 1) {
      // cases like "asd ] asd ["
      else if (beginTagContainer > endTagContainer) {
      // case: [ not found in the filename
      else if ( beginTagContainer < 0 )
      else if ( endTagContainer < 0 ) */
  if (beginTagContainer >= 0 && beginTagContainer < endTagContainer) {
    if (beginTagContainer === 0 && endTagContainer === title.trim().length) {
      // case: "[tag1, tag2]"
      return '';
    } else if (endTagContainer === title.trim().length) {
      // case: "asd[tag1, tag2]"
      return title.slice(0, beginTagContainer);
    }
    // case: "title1 [tag1 tag2] title2"
    return title.slice(0, beginTagContainer) + title.slice(endTagContainer + 1, title.length);
  }
  try {
    title = decodeURIComponent(title);
  } catch (e) {
    console.warn('Decoding URI failed on: ' + title + ' with ' + e);
  }
  return title;
}

export function extractTagsAsObjects(filePath: string, tagDelimiter: string): Array<Tag> {
  const tagsInFileName = extractTags(filePath, tagDelimiter);
  const tagArray = [];
  tagsInFileName.map((tag) => {
    tagArray.push({
      title: '' + tag,
      type: 'plain'
    });
    return true;
  });
  return tagArray;
}

export function extractTags(filePath: string, tagDelimiter: string) {
  if (tagDelimiter === undefined) { // TODO get tagDelimiter from settings reducer only
    // eslint-disable-next-line no-param-reassign
    tagDelimiter = AppConfig.tagDelimiter;
  }
  // console.log('Extracting tags from: ' + filePath);
  const fileName = extractFileName(filePath);
  // WithoutExt
  let tags = [];
  const beginTagContainer = fileName.indexOf(AppConfig.beginTagContainer);
  const endTagContainer = fileName.indexOf(AppConfig.endTagContainer);
  if (beginTagContainer < 0 || endTagContainer < 0 || beginTagContainer >= endTagContainer) {
    // console.log('Filename does not contains tags. Aborting extraction.');
    return tags;
  }
  const cleanedTags = [];
  const tagContainer = fileName.slice(beginTagContainer + 1, endTagContainer).trim();
  tags = tagContainer.split(tagDelimiter);
  for (let i = 0; i < tags.length; i += 1) {
    // Min tag length set to 1 character
    if (tags[i].trim().length > 0) {
      cleanedTags.push(tags[i]);
    }
  }
  return cleanedTags;
}
