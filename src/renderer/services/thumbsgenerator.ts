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

import {
  extractFileExtension,
  encodeFileName,
} from '@tagspaces/tagspaces-common/paths';
import AppConfig from '-/AppConfig';
import PlatformIO from '../services/platform-facade';
import { Pro } from '../pro';
import { FileTypeGroups } from '-/services/search';

let maxSize = AppConfig.maxThumbSize;
const thumbnailBackgroundColor = AppConfig.thumbBgColor;

export const supportedMisc = ['url', 'html'];
export const supportedImgs = FileTypeGroups.images;
export const supportedContainers = [
  'zip',
  'pages',
  'key',
  'numbers',
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
  'odt',
  'pdf',
];
export const supportedText = [
  'txt',
  // 'md',
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
  // 'markdown',
  // 'mdown',
  'php',
  'pl',
  'py',
  'rb',
  'ini',
  'sh',
  'sql',
  // 'mhtml'
];
export const supportedVideos = [
  'ogv',
  'mp4',
  'webm',
  'm4v',
  'mkv',
  'lrv',
  '3gp',
  'mov',
  // '3g2'
];
const maxFileSize = 30 * 1024 * 1024; // 30 MB

/**
 * return thumbFilePath: Promise<string> or empty sting on error or not supported
 */
export function generateThumbnailPromise(fileURL: string, fileSize: number) {
  const ext = extractFileExtension(
    fileURL,
    PlatformIO.getDirSeparator(),
  ).toLowerCase();

  const fileURLEscaped =
    /^https?:\/\//.test(fileURL) || AppConfig.isElectron
      ? fileURL
      : encodeFileName(fileURL, PlatformIO.getDirSeparator());

  if (supportedImgs.indexOf(ext) >= 0) {
    if (Pro && ext === 'tga') {
      return Pro.ThumbsGenerator.generateTGAThumbnail(fileURLEscaped, maxSize);
    } else if (Pro && ext.startsWith('tif')) {
      return Pro.ThumbsGenerator.generateUTIFThumbnail(fileURLEscaped, maxSize);
    } else if (Pro && ext === 'dng') {
      return Pro.ThumbsGenerator.generateUTIFThumbnail(fileURLEscaped, maxSize);
    } else if (Pro && ext === 'nef') {
      return Pro.ThumbsGenerator.generateUTIFThumbnail(fileURLEscaped, maxSize);
    } else if (Pro && ext === 'cr2') {
      return Pro.ThumbsGenerator.generateUTIFThumbnail(fileURLEscaped, maxSize);
    } else if (Pro && ext === 'psd') {
      return Pro.ThumbsGenerator.generatePSDThumbnail(fileURLEscaped, maxSize);
    } else if (fileSize && fileSize < maxFileSize) {
      return generateImageThumbnail(fileURL); //fileURLEscaped);
    }
  } else if (Pro && ext === 'pdf') {
    return Pro.ThumbsGenerator.generatePDFThumbnail(fileURLEscaped, maxSize);
  } else if (Pro && ext === 'html') {
    return Pro.ThumbsGenerator.generateHtmlThumbnail(fileURLEscaped, maxSize);
  } else if (Pro && ext === 'url') {
    return Pro.ThumbsGenerator.generateUrlThumbnail(fileURLEscaped, maxSize);
  } else if (Pro && ext === 'mp3') {
    if (fileSize && fileSize < maxFileSize) {
      // return Pro.ThumbsGenerator.generateMp3Thumbnail(fileURL, maxSize);
    }
  } else if (Pro && supportedText.indexOf(ext) >= 0) {
    return Pro.ThumbsGenerator.generateTextThumbnail(fileURLEscaped, maxSize);
  } else if (Pro && supportedContainers.indexOf(ext) >= 0) {
    if (fileSize && fileSize < maxFileSize) {
      return Pro.ThumbsGenerator.generateZipContainerImageThumbnail(
        fileURLEscaped,
        maxSize,
        supportedImgs,
      );
    }
  } else if (supportedVideos.indexOf(ext) >= 0) {
    if (Pro) {
      return Pro.ThumbsGenerator.generateVideoThumbnail(
        fileURLEscaped,
        maxSize,
      );
    }
    return generateVideoThumbnail(fileURLEscaped);
  }
  return generateDefaultThumbnail();
}

function generateDefaultThumbnail() {
  return Promise.resolve('');
}

export function getMimeType(extension) {
  const types = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    bmp: 'image/bmp',
    pdf: 'application/pdf',
    json: 'application/json',
  };
  return types[extension];
}

/**
 * src: image url or base64string
 * maxTmbSize - max size of image if not set return full image size (from url)
 * return: base64 image string
 */
export function getResizedImageThumbnail(
  src: string,
  maxTmbSize?: number,
): Promise<string> {
  return new Promise((resolve) => {
    let canvas: HTMLCanvasElement = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let img: HTMLImageElement = new Image();
    if (maxTmbSize && maxTmbSize > maxSize) {
      maxSize = maxTmbSize;
    }
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // EXIF extraction not need because the image are rotated
      // automatically in Chrome version 81 and higher
      // EXIF.getData(img as any, function() {
      //   // TODO Use EXIF only for jpegs
      //   const orientation = EXIF.getTag(this, 'Orientation');
      //   /*
      //     1 - 0 degrees – the correct orientation, no adjustment is required.
      //     2 - 0 degrees, mirrored – image has been flipped back-to-front.
      //     3 - 180 degrees – image is upside down.
      //     4 - 180 degrees, mirrored – image is upside down and flipped back-to-front.
      //     5 - 90 degrees – image is on its side.
      //     6 - 90 degrees, mirrored – image is on its side and flipped back-to-front.
      //     7 - 270 degrees – image is on its far side.
      //     8 - 270 degrees, mirrored – image is on its far side and flipped back-to-front.
      //   */
      //   let angleInRadians;
      //   switch (orientation) {
      //     case 8:
      //       angleInRadians = 270 * (Math.PI / 180);
      //       break;
      //     case 3:
      //       angleInRadians = 180 * (Math.PI / 180);
      //       break;
      //     case 6:
      //       angleInRadians = 90 * (Math.PI / 180);
      //       break;
      //     case 1:
      //       // ctx.rotate(0);
      //       break;
      //     default:
      //     // ctx.rotate(0);
      //   }
      let maxSizeWidth = maxSize;
      if (img.width < maxSize) {
        maxSizeWidth = img.width;
      }
      let maxSizeHeight = maxSize;
      if (img.height < maxSize) {
        maxSizeHeight = img.height;
      }
      if (img.width >= img.height) {
        canvas.width = maxSizeWidth;
        canvas.height = (maxSizeWidth * img.height) / img.width;
      } else {
        canvas.height = maxSizeHeight;
        canvas.width = (maxSizeHeight * img.width) / img.height;
      }

      const { width, height } = canvas;
      const x = canvas.width / 2;
      const y = canvas.height / 2;

      ctx.translate(x, y);
      // ctx.rotate(angleInRadians);
      ctx.fillStyle = thumbnailBackgroundColor;
      ctx.fillRect(-width / 2, -height / 2, width, height);
      ctx.drawImage(img, -width / 2, -height / 2, width, height);
      // ctx.rotate(-angleInRadians);
      ctx.translate(-x, -y);
      const dataurl = canvas.toDataURL(AppConfig.thumbType);
      resolve(dataurl);
      img = null;
      canvas = null;
      // });
    };
    img.src = src;
    img.onerror = (err) => {
      console.warn(`Error getResizedImageThumbnail`, err);
      resolve('');
    };
  });
}

export function generateImageThumbnail(
  fileURL: string,
  maxTmbSize?: number,
): Promise<string> {
  try {
    if (fileURL.startsWith('http://') || fileURL.startsWith('https://')) {
      return getResizedImageThumbnail(fileURL, maxTmbSize);
    }
    return PlatformIO.getFileContentPromise(fileURL, 'arraybuffer')
      .then((content) => {
        const ext = extractFileExtension(
          fileURL,
          PlatformIO.getDirSeparator(),
        ).toLowerCase();
        const blob = new Blob([content], { type: getMimeType(ext) });
        if (AppConfig.isCordova) {
          return cordovaCreateObjectURL(blob).then((url) =>
            getResizedImageThumbnail(url, maxTmbSize),
          );
        } else {
          return getResizedImageThumbnail(
            URL.createObjectURL(blob),
            maxTmbSize,
          );
        }
      })
      .catch((e) => {
        console.log(`Error get: ${fileURL}`, e);
        return Promise.resolve('');
      });
  } catch (e) {
    console.warn(`Error creating image thumb for : ${fileURL}`, e);
    return Promise.resolve('');
  }
}

function cordovaCreateObjectURL(blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      const dataUrl = event.target?.result as string;
      resolve(dataUrl);
    };

    reader.readAsDataURL(blob);
  });
}

function generateVideoThumbnail(fileURL): Promise<string> {
  return new Promise((resolve) => {
    try {
      let canvas: HTMLCanvasElement = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      let img: HTMLImageElement = new Image();
      let video: HTMLVideoElement = document.createElement('video');
      const captureTime = 1.5; // time in seconds at which to capture the image from the video

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(Math.max(0, captureTime), video.duration);
        if (video.videoWidth >= video.videoHeight) {
          canvas.width = maxSize;
          canvas.height = (maxSize * video.videoHeight) / video.videoWidth;
        } else {
          canvas.height = maxSize;
          canvas.width = (maxSize * video.videoWidth) / video.videoHeight;
        }
      };

      video.onseeked = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataurl = canvas.toDataURL(AppConfig.thumbType);
        img.onerror = (err) => {
          console.warn(`Error loading: ${fileURL} for tmb gen with: ${err} `);
          resolve('');
        };
        resolve(dataurl);
        img = null;
        canvas = null;
        video = null;
      };
      video.onerror = (err) => {
        console.warn(`Error opening: ${fileURL} for tmb gen with: ${err} `);
        resolve('');
      };
      video.src = fileURL;
    } catch (e) {
      console.warn(`Error creating video thumb for : ${fileURL} with: ${e}`);
      resolve('');
    }
  });
}
