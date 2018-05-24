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
  return fileName ? fileName : dirPath;
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
  return filePath.substring(lastindexDot + 1, filePath.length).toLowerCase().trim();

  /* alternative implementation
    const ext = fileURL.split('.').pop();
    return (ext === fileURL) ? '' : ext; */
}

export function getMetaDirectoryPath(directoryPath: string) {
  const metaFolder = directoryPath + AppConfig.dirSeparator + AppConfig.metaFolder;
  return metaFolder;
}

export function getMetaFileLocationForFile(entryPath: string) {
  const containingFolder = extractContainingDirectoryPath(entryPath);
  const metaFolder = getMetaDirectoryPath(containingFolder);
  return metaFolder + AppConfig.dirSeparator + extractFileName(entryPath) + AppConfig.metaFileExt;
}

export function getThumbFileLocationForFile(entryPath: string) {
  const containingFolder = extractContainingDirectoryPath(entryPath);
  const metaFolder = getMetaDirectoryPath(containingFolder);
  return metaFolder + AppConfig.dirSeparator + extractFileName(entryPath) + AppConfig.thumbFileExt;
}

export function getMetaFileLocationForDir(entryPath: string) {
  const metaFolder = getMetaDirectoryPath(entryPath);
  return metaFolder + AppConfig.dirSeparator + AppConfig.metaFolderFile;
}


export function extractFileName(filePath: string): string {
  return filePath.substring(filePath.lastIndexOf(AppConfig.dirSeparator) + 1, filePath.length);
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

export function extractContainingDirectoryPath(filePath: string) {
  return filePath.substring(0, filePath.lastIndexOf(AppConfig.dirSeparator));
}

export function extractParentDirectoryPath(dirPath: string) {
  if (dirPath.endsWith(AppConfig.dirSeparator)) {
    dirPath = dirPath.substring(0, dirPath.lastIndexOf(AppConfig.dirSeparator));
  }
  return dirPath.substring(0, dirPath.lastIndexOf(AppConfig.dirSeparator));
}

export function extractDirectoryName(dirPath: string) {
  let directoryName;
  if (dirPath.endsWith(AppConfig.dirSeparator)) {
    directoryName = dirPath.substring(0, dirPath.lastIndexOf(AppConfig.dirSeparator));
  }
  directoryName = dirPath.substring(dirPath.lastIndexOf(AppConfig.dirSeparator) + 1, dirPath.length);
  return directoryName;
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
  return title;
}

export function extractTagsAsObjects(filePath: string): Array<Tag> {
  const tagsInFileName = extractTags(filePath);
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

export function extractTags(filePath: string) {
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
  tags = tagContainer.split(AppConfig.tagDelimiter);
  for (let i = 0; i < tags.length; i += 1) {
    // Min tag length set to 1 character
    if (tags[i].trim().length > 0) {
      cleanedTags.push(tags[i]);
    }
  }
  return cleanedTags;
}
