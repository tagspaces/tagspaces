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

import EXIF from 'exif-js';
import {
  extractFileExtension,
  extractContainingDirectoryPath,
  extractFileName,
  getMetaDirectoryPath
} from '../utils/paths';
import { base64ToArrayBuffer } from '../utils/misc';
import AppConfig from '../config';
import PlatformIO from '../services/platform-io';
import { Pro } from '../pro';

const maxSize = AppConfig.maxThumbSize;

const supportedImgs = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'];
const supportedContainers = [
  'zip',
  'epub',
  'docx',
  'pptx',
  'pptm',
  'potx',
  'potm',
  'ppxs',
  'ppsm',
  'sldx',
  'sldm',
  'dotx',
  'dotm',
  'xlsx',
  'xlsm',
  'xlst',
  'odp',
  'odg',
  'ods',
  'odt'
];
const supportedText = [
  'txt',
  'md',
  'coffee',
  'c',
  'cpp',
  'css',
  'groovy',
  'haxe',
  'xml',
  'java',
  'js',
  'json',
  'less',
  'markdown',
  'mdown',
  'php',
  'pl',
  'py',
  'rb',
  'ini',
  'sh',
  'sql',
  'mhtml'
];
const supportedVideos = ['mp4', 'webm', 'ogv', 'm4v'];
const maxFileSize = 30 * 1024 * 1024;

function saveThumbnailPromise(filePath, dataURL) {
  return new Promise((resolve, reject) => {
    if (!dataURL || dataURL.length < 7) { // data:,
      return reject('Invalid dataURL');
    }
    const baseString = dataURL.split(',').pop();
    const content = base64ToArrayBuffer(baseString);
    PlatformIO.saveBinaryFilePromise(filePath, content, true)
      .then(() => resolve(filePath))
      .catch((error) => {
        console.warn('Saving thumbnail for ' + filePath + ' failed with ' + JSON.stringify(error));
        return reject('Saving tmb failed for: ' + filePath);
      });
  });
}

function getThumbFileLocation(filePath) {
  const containingFolder = extractContainingDirectoryPath(filePath);
  const metaFolder = getMetaDirectoryPath(containingFolder);
  return metaFolder + AppConfig.dirSeparator + extractFileName(filePath) + AppConfig.thumbFileExt;
}

export function getThumbnailURLPromise(filePath) {
  return new Promise((resolve) => {
    PlatformIO.getPropertiesPromise(filePath).then((origStats) => {
      const thumbFilePath = getThumbFileLocation(filePath);
      PlatformIO.getPropertiesPromise(thumbFilePath).then((stats) => {
        if (stats) { // Thumbnail exists
          if (origStats.lmdt > stats.lmdt) { // Checking if is up to date
            createThumbnailPromise(filePath, origStats.size, thumbFilePath).then((tmbPath) => {
              return resolve({ filePath, tmbPath });
            }).catch((err) => {
              console.warn('Thumb generation failed ' + err);
              resolve({ filePath, tmbPath: thumbFilePath });
            });
          } else { // Tmb up to date
            resolve({ filePath });
          }
        } else {
          // Thumbnail does not exists
          createThumbnailPromise(filePath, origStats.size, thumbFilePath).then((tmbPath) => {
            return resolve({ filePath, tmbPath });
          }).catch(err => {
            console.warn('Thumb generation failed ' + err);
            resolve({ filePath });
          });
        }
      }).catch(err => {
        console.warn('Error getting tmb properties ' + err);
        resolve({ filePath });
      });
    }).catch(err => {
      console.warn('Error getting file properties ' + err);
      resolve({ filePath });
    });
  });
}

export function createThumbnailPromise(
  filePath: string,
  fileSize: number,
  thumbFilePath: string
) {
  return new Promise((resolve) => {
    generateThumbnailPromise(filePath, fileSize).then((dataURL) => {
      if (dataURL && dataURL.length) {
        saveThumbnailPromise(thumbFilePath, dataURL)
          .then(() => resolve(thumbFilePath))
          .catch((err) => {
            console.warn('Thumb saving failed ' + err);
            resolve();
          });
      } else {
        resolve();
      }
    }).catch((err) => {
      console.warn('Thumb generation failed ' + err);
      resolve();
    });
  });
}

export function generateThumbnailPromise(
  fileURL: string,
  fileSize: number
) {
  const ext = extractFileExtension(fileURL).toLowerCase();

  if (supportedImgs.indexOf(ext) >= 0) {
    if (fileSize && fileSize < maxFileSize) {
      return generateImageThumbnail(fileURL);
    }
  } else if (Pro && ext === 'pdf') {
    return Pro.ThumbsGenerator.generatePDFThumbnail(fileURL, maxSize);
  } else if (Pro && ext === 'html') {
    // return generateHtmlThumbnail(fileURL);
  } else if (Pro && ext === 'mp3') {
    if (fileSize && fileSize < maxFileSize) {
      return Pro.ThumbsGenerator.generateMp3Thumbnail(fileURL, maxSize);
    }
  } else if (Pro && supportedText.indexOf(ext) >= 0) {
    // return Pro.ThumbsGenerator.generateTextThumbnail(fileURL);
  } else if (Pro && supportedContainers.indexOf(ext) >= 0) {
    if (fileSize && fileSize < maxFileSize) {
      // Pro.ThumbsGenerator.return generateZipContainerImageThumbnail(fileURL, maxSize);
    }
  } else if (Pro && supportedVideos.indexOf(ext) >= 0) {
    return Pro.ThumbsGenerator.generateVideoThumbnail(fileURL, maxSize);
  }
  return generateDefaultThumbnail();
}

function generateDefaultThumbnail() {
  return Promise.resolve('');
}

function generateImageThumbnail(fileURL) {
  return new Promise((resolve) => {
    let canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let img = new Image();

    const errorHandler = err => {
      console.warn(
        'Error while generating thumbnail for: ' +
        fileURL +
        ' - ' +
        JSON.stringify(err)
      );
      resolve('');
    };

    img.crossOrigin = 'anonymous';
    img.onload = () => {
      EXIF.getData(img, function () { // eslint-disable-line
        // TODO Use EXIF only for jpegs
        const orientation = EXIF.getTag(this, 'Orientation');
        /*
          1 - 0 degrees – the correct orientation, no adjustment is required.
          2 - 0 degrees, mirrored – image has been flipped back-to-front.
          3 - 180 degrees – image is upside down.
          4 - 180 degrees, mirrored – image is upside down and flipped back-to-front.
          5 - 90 degrees – image is on its side.
          6 - 90 degrees, mirrored – image is on its side and flipped back-to-front.
          7 - 270 degrees – image is on its far side.
          8 - 270 degrees, mirrored – image is on its far side and flipped back-to-front.
        */
        let angleInRadians;
        switch (orientation) {
          case 8:
            angleInRadians = 270 * (Math.PI / 180);
            break;
          case 3:
            angleInRadians = 180 * (Math.PI / 180);
            break;
          case 6:
            angleInRadians = 90 * (Math.PI / 180);
            break;
          case 1:
            // ctx.rotate(0);
            break;
          default:
          // ctx.rotate(0);
        }
        if (img.width >= img.height) {
          canvas.width = maxSize;
          canvas.height = (maxSize * img.height) / img.width;
        } else {
          canvas.height = maxSize;
          canvas.width = (maxSize * img.width) / img.height;
        }
        const width = canvas.width;
        const height = canvas.height;
        const x = canvas.width / 2;
        const y = canvas.height / 2;

        ctx.translate(x, y);
        ctx.rotate(angleInRadians);
        ctx.drawImage(img, -width / 2, -height / 2, width, height);
        ctx.rotate(-angleInRadians);
        ctx.translate(-x, -y);
        const dataurl = canvas.toDataURL(AppConfig.thumbType);
        resolve(dataurl);
        img = null;
        canvas = null;
      });
    };
    img.src = fileURL;
    img.onerror = errorHandler;
  });
}
