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

import AppConfig from '../config';
import { Tag } from '-/reducers/taglibrary';
import { Location } from '-/reducers/locations';

export function baseName(
  dirPath: string,
  dirSeparator: string // = AppConfig.dirSeparator
) {
  const fileName = dirPath.substring(
    dirPath.lastIndexOf(dirSeparator) + 1,
    dirPath.length
  );
  return fileName || dirPath;
}

export function extractFileExtension(
  filePath: string,
  dirSeparator: string // = AppConfig.dirSeparator
) {
  const lastindexDirSeparator = filePath.lastIndexOf(dirSeparator);
  const lastIndexEndTagContainer = filePath.lastIndexOf(
    AppConfig.endTagContainer
  );
  const lastindexDot = filePath.lastIndexOf('.');
  if (lastindexDot < 0) {
    return '';
  }
  if (lastindexDot < lastindexDirSeparator) {
    // case: "../remote.php/webdav/somefilename"
    return '';
  }
  if (lastindexDot < lastIndexEndTagContainer) {
    // case: "[20120125 89.4kg 19.5% 60.5% 39.8% 2.6kg]"
    return '';
  }
  let extension = filePath
    .substring(lastindexDot + 1, filePath.length)
    .toLowerCase()
    .trim();
  const lastindexQuestionMark = extension.lastIndexOf('?');
  if (lastindexQuestionMark > 0) {
    // Removing everything after ? in URLs .png?queryParam1=2342
    extension = extension.substring(0, lastindexQuestionMark);
  }
  return extension;
}

export function getMetaDirectoryPath(
  directoryPath: string,
  dirSeparator: string // = AppConfig.dirSeparator
) {
  return (
    (directoryPath ? normalizePath(directoryPath) + dirSeparator : '') +
    AppConfig.metaFolder
  );
}

export function getMetaFileLocationForFile(
  entryPath: string,
  dirSeparator: string // = AppConfig.dirSeparator
) {
  const containingFolder = extractContainingDirectoryPath(
    entryPath,
    dirSeparator
  );
  const metaFolder = getMetaDirectoryPath(containingFolder, dirSeparator);
  return (
    metaFolder +
    dirSeparator +
    extractFileName(entryPath, dirSeparator) +
    AppConfig.metaFileExt
  );
}

export function getThumbFileLocationForFile(
  entryPath: string,
  dirSeparator: string // = AppConfig.dirSeparator
) {
  const containingFolder = extractContainingDirectoryPath(
    entryPath,
    dirSeparator
  );
  const metaFolder = getMetaDirectoryPath(containingFolder, dirSeparator);
  return (
    metaFolder +
    dirSeparator +
    extractFileName(entryPath, dirSeparator) +
    AppConfig.thumbFileExt
  );
}

export function getThumbFileLocationForDirectory(
  entryPath: string,
  dirSeparator: string // = AppConfig.dirSeparator
) {
  return (
    entryPath +
    dirSeparator +
    AppConfig.metaFolder +
    dirSeparator +
    AppConfig.folderThumbFile
  );
}

export function getMetaFileLocationForDir(
  entryPath: string,
  dirSeparator: string // = AppConfig.dirSeparator
) {
  const metaFolder = getMetaDirectoryPath(entryPath, dirSeparator);
  return metaFolder + dirSeparator + AppConfig.metaFolderFile;
}

export function extractFileName(
  filePath: string,
  dirSeparator: string // = AppConfig.dirSeparator
): string {
  return filePath
    ? filePath.substring(
        filePath.lastIndexOf(dirSeparator) + 1,
        filePath.length
      )
    : filePath;
}

export function cleanTrailingDirSeparator(dirPath: string): string {
  if (dirPath) {
    if (dirPath.lastIndexOf('\\') === dirPath.length - 1) {
      return dirPath.substring(0, dirPath.length - 1);
    }
    if (dirPath.lastIndexOf('/') === dirPath.length - 1) {
      return dirPath.substring(0, dirPath.length - 1);
    }
    return dirPath;
  }
  // console.log('Directory Path ' + dirPath + ' undefined');
  return '';
}

/**
 *
 * @param path -> root//subFolder/
 * @returns {string} -> root/subFolder
 */
export function normalizePath(path: string): string {
  if (!path) return '';
  return cleanTrailingDirSeparator(path.replace(/\/\//g, '/'));
}

export function extractFileNameWithoutExt(
  filePath: string,
  dirSeparator: string // = AppConfig.dirSeparator
): string {
  const fileName = extractFileName(filePath, dirSeparator);
  const indexOfDot = fileName.lastIndexOf('.');
  const lastIndexBeginTagContainer = fileName.lastIndexOf(
    AppConfig.beginTagContainer
  );
  const lastIndexEndTagContainer = fileName.lastIndexOf(
    AppConfig.endTagContainer
  );
  if (
    lastIndexBeginTagContainer === 0 &&
    lastIndexEndTagContainer + 1 === fileName.length
  ) {
    // case: "[tag1 tag.2]"
    return '';
  }
  if (indexOfDot > 0) {
    // case: regular
    return fileName.substring(0, indexOfDot);
  }
  if (indexOfDot === 0) {
    // case ".txt"
    return '';
  }
  return fileName;
}

export function extractContainingDirectoryPath(
  filePath: string,
  dirSeparator: string // = AppConfig.dirSeparator
) {
  return filePath.substring(0, filePath.lastIndexOf(dirSeparator));
}

export function extractParentDirectoryPath(
  dirPath: string,
  dirSeparator: string // = AppConfig.dirSeparator
) {
  if (!dirPath) return;
  let path = dirPath;
  if (path.endsWith(dirSeparator)) {
    path = path.substring(0, path.lastIndexOf(dirSeparator));
  }
  const lastIndex = path.lastIndexOf(dirSeparator);
  if (lastIndex !== -1) {
    return path.substring(0, lastIndex);
  }
  // return root dir in cases that dirPath not start with dirSeparator (AWS)
  return '';
}

export function extractDirectoryName(
  dirPath: string,
  dirSeparator: string // = AppConfig.dirSeparator
): string {
  if (!dirPath) return '';
  let directoryName = dirPath;
  if (dirPath.indexOf(dirSeparator) !== -1) {
    if (dirPath.endsWith(dirSeparator)) {
      directoryName = directoryName.substring(
        0,
        dirPath.lastIndexOf(dirSeparator)
      );
    }
    const lastDirSeparator = directoryName.lastIndexOf(dirSeparator);
    if (lastDirSeparator !== -1) {
      directoryName = directoryName.substring(
        lastDirSeparator + 1,
        directoryName.length
      );
    }
  }
  return directoryName;
}

export function extractShortDirectoryName(
  dirPath: string,
  dirSeparator: string // = AppConfig.dirSeparator
) {
  let shortDirName: string = extractDirectoryName(dirPath, dirSeparator);
  if (shortDirName.length > 20) {
    shortDirName = shortDirName.substr(0, 20) + '...';
  }
  return shortDirName;
}

export function extractContainingDirectoryName(
  filePath: string,
  dirSeparator: string
) {
  const tmpStr = filePath.substring(0, filePath.lastIndexOf(dirSeparator));
  return tmpStr.substring(tmpStr.lastIndexOf(dirSeparator) + 1, tmpStr.length);
}

export function extractTitle(
  entryPath: string,
  isDirectory: boolean = false,
  dirSeparator: string // = AppConfig.dirSeparator
) {
  let title;
  if (isDirectory) {
    title = extractDirectoryName(entryPath, dirSeparator); // .replace(/(^\/)|(\/$)/g, '');
    return title;
  }
  title = extractFileNameWithoutExt(entryPath, dirSeparator);

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
    }
    if (endTagContainer === title.trim().length) {
      // case: "asd[tag1, tag2]"
      return title.slice(0, beginTagContainer);
    }
    // case: "title1 [tag1 tag2] title2"
    return (
      title.slice(0, beginTagContainer) +
      title.slice(endTagContainer + 1, title.length)
    );
  }
  try {
    title = decodeURIComponent(title);
  } catch (e) {
    console.warn('Decoding URI failed on: ' + title + ' with ' + e);
  }
  return title;
}

export function extractTagsAsObjects(
  filePath: string,
  tagDelimiter: string = AppConfig.tagDelimiter,
  dirSeparator: string // = AppConfig.dirSeparator
): Array<Tag> {
  const tagsInFileName = extractTags(filePath, tagDelimiter, dirSeparator);
  const tagArray = [];
  tagsInFileName.map(tag => {
    tagArray.push({
      title: '' + tag,
      type: 'plain'
    });
    return true;
  });
  return tagArray;
}

export function extractTags(
  filePath: string,
  tagDelimiter: string = AppConfig.tagDelimiter,
  dirSeparator: string // = AppConfig.dirSeparator
) {
  // console.log('Extracting tags from: ' + filePath);
  const fileName = extractFileName(filePath, dirSeparator);
  // WithoutExt
  let tags = [];
  const beginTagContainer = fileName.indexOf(AppConfig.beginTagContainer);
  const endTagContainer = fileName.indexOf(AppConfig.endTagContainer);
  if (
    beginTagContainer < 0 ||
    endTagContainer < 0 ||
    beginTagContainer >= endTagContainer
  ) {
    // console.log('Filename does not contains tags. Aborting extraction.');
    return tags;
  }
  const cleanedTags = [];
  const tagContainer = fileName
    .slice(beginTagContainer + 1, endTagContainer)
    .trim();
  tags = tagContainer.split(tagDelimiter);
  for (let i = 0; i < tags.length; i += 1) {
    // Min tag length set to 1 character
    if (tags[i].trim().length > 0) {
      cleanedTags.push(tags[i]);
    }
  }
  return cleanedTags;
}

export function extractLocation(filePath: string, locations: Array<Location>) {
  let currentLocation;
  const path = filePath.replace(/[/\\]/g, '');
  for (let i = 0; i < locations.length; i += 1) {
    const locationPath = locations[i].path
      ? locations[i].path.replace(/[/\\]/g, '')
      : locations[i].paths[0].replace(/[/\\]/g, '');

    // Handle S3 empty location
    if (locationPath.length === 0) {
      if (currentLocation === undefined) {
        currentLocation = locations[i];
      }
    } else if (path.startsWith(locationPath)) {
      currentLocation = locations[i];
    }
  }
  return currentLocation;
}
