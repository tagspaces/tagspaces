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
 *
 */

import AppConfig from '-/AppConfig';
import {
  baseName,
  encodeFileName,
  extractFileExtension,
} from '@tagspaces/tagspaces-common/paths';
import DOMPurify from 'dompurify';
import JSZip from 'jszip';
import * as pdfjsModule from 'pdfjs-dist/legacy/build/pdf.min.mjs';
import TgaLoader from 'tga-js';
import UTIF from 'utif';

const pdfjs = (
  'default' in pdfjsModule ? pdfjsModule['default'] : pdfjsModule
) as typeof pdfjsModule;

import('pdfjs-dist/build/pdf.worker.mjs');
//import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
//pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

let maxSize = AppConfig.maxThumbSize;
const pdfMaxSize = 1000;
const thumbnailBackgroundColor = AppConfig.thumbBgColor;

export const supportedMisc = ['url', 'html'];
export const supportedImgs = AppConfig.SearchTypeGroups.images;
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
  // 'pdf',
];
export const supportedText = [
  'txt',
  // 'md', 'mdown', 'markdown'
  'coffee',
  'c',
  'cpp',
  'css',
  'groovy',
  'haxe',
  'xml',
  'java',
  'js',
  'ts',
  'tsc',
  'json',
  'less',
  'php',
  'pl',
  'py',
  'rb',
  'ini',
  'sh',
  'sql',
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
];
const maxFileSize = 30 * 1024 * 1024; // 30 MB

/**
 * return thumbFilePath: Promise<string> or empty sting on error or not supported
 */
export function generateThumbnailPromise(
  fileURL: string,
  fileSize: number,
  loadTextFilePromise,
  getFileContentPromise,
  getThumbPath,
  dirSeparator: string,
) {
  const ext = extractFileExtension(fileURL, dirSeparator).toLowerCase();

  const fileURLEscaped =
    /^https?:\/\//.test(fileURL) || AppConfig.isElectron
      ? fileURL
      : encodeFileName(fileURL, dirSeparator);

  // Fast path for images
  if (supportedImgs.includes(ext)) {
    if (['dng', 'nef', 'cr2'].includes(ext)) {
      return generateUTIFThumbnail(fileURLEscaped, maxSize);
    } else if (ext === 'tga') {
      return generateTGAThumbnail(fileURLEscaped, maxSize);
    } else if (ext === 'psd') {
      return generatePSDThumbnail(fileURLEscaped, maxSize);
    } else if (ext.startsWith('tif')) {
      return generateUTIFThumbnail(fileURLEscaped, maxSize);
    } else if (fileSize && fileSize < maxFileSize) {
      return generateImageThumbnail(
        fileURL,
        getFileContentPromise,
        dirSeparator,
      );
    }
  } else if (ext === 'pdf') {
    return getFileContentPromise({ path: fileURLEscaped }, 'arraybuffer').then(
      (buffer) => generatePDFThumbnail(buffer, pdfMaxSize),
    );
  } else if (ext === 'html') {
    return generateHtmlThumbnail(fileURLEscaped, maxSize, loadTextFilePromise);
  } else if (ext === 'url') {
    return generateUrlThumbnail(fileURLEscaped, maxSize, loadTextFilePromise);
  } else if (ext === 'mp3') {
    if (fileSize && fileSize < maxFileSize) {
      // return generateMp3Thumbnail(fileURL, maxSize);
    }
  } else if (supportedText.includes(ext)) {
    return generateTextThumbnail(fileURLEscaped, maxSize, loadTextFilePromise);
  } else if (supportedContainers.includes(ext)) {
    if (fileSize && fileSize < maxFileSize) {
      return generateZipContainerImageThumbnail(
        fileURLEscaped,
        maxSize,
        supportedImgs,
        getFileContentPromise,
        dirSeparator,
      );
    }
  } else if (supportedVideos.includes(ext)) {
    if (getThumbPath) {
      return getThumbPath(fileURL).then((url) =>
        generateVideoThumbnail(url, maxSize),
      );
    }
  }
  return generateDefaultThumbnail();
}

export async function extractPDFcontent(
  arrayBuffer: ArrayBuffer,
): Promise<string> {
  let extractedText = '';
  if (arrayBuffer) {
    try {
      const pdfDocument = await pdfjs.getDocument(arrayBuffer).promise;
      for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        extractedText +=
          textContent.items.map((item) => item.str).join(' ') + '\n';
      }
      extractedText += '\r\n';
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
    }
  }
  return extractedText;
}

export function generatePDFThumbnail(
  arrayBuffer: ArrayBuffer,
  maxSize: number,
): Promise<string> {
  return new Promise((resolve) => {
    try {
      const errorHandler = (err) => {
        console.log('Error while generating thumbnail', err);
        resolve('');
      };

      let canvas: HTMLCanvasElement = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const loadingTask = pdfjs.getDocument(arrayBuffer);
      loadingTask.promise
        .then((pdf) => {
          pdf
            .getPage(1)
            .then((page) => {
              let scale = 1.0;
              const unscaledViewport = page.getViewport({ scale });
              if (unscaledViewport.width >= unscaledViewport.height) {
                canvas.width = maxSize;
                canvas.height =
                  (maxSize * unscaledViewport.height) / unscaledViewport.width;
              } else {
                canvas.height = maxSize;
                canvas.width =
                  (maxSize * unscaledViewport.width) / unscaledViewport.height;
              }
              scale = Math.min(
                canvas.height / unscaledViewport.height,
                canvas.width / unscaledViewport.width,
              );
              const viewport = page.getViewport({ scale });
              const renderContext = { canvasContext: ctx, viewport };
              const renderTask = page.render(renderContext);
              renderTask.promise
                .then(() => {
                  ctx.globalCompositeOperation = 'destination-over';
                  ctx.fillStyle = '#ffffff';
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  resolve(canvas.toDataURL(AppConfig.thumbType));
                  canvas = null;
                })
                .catch(errorHandler);
            })
            .catch(errorHandler);
        }, errorHandler)
        .catch(errorHandler);
    } catch (e) {
      console.log('Error creating PDF thumb', e);
      resolve('');
    }
  });
}

function getPropetiesThumbnail(propertiesFile) {
  if (propertiesFile) {
    let currentSection;
    const propetiesLines = propertiesFile.split('\n');
    for (let i = 0; i < propetiesLines.length; i += 1) {
      const propertyLine = propetiesLines[i].trim();
      if (propertyLine) {
        const section = /^\[([^=]+)\]$/.exec(propertyLine);
        let property;
        if (section) {
          if (currentSection !== section) {
            currentSection = section[1];
          }
        } else {
          property = /^([^#=]+)(={0,1})(.*)$/.exec(propertyLine);
        }

        if (currentSection === 'InternetShortcut') {
          if (property && property[1] === 'COMMENT') {
            if (property[3].startsWith('data:image/')) {
              return property[3];
            }
          }
        }
      }
    }
  }
  return undefined;
}

/**
 *   TODO The onload event is triggered when an image has finished loading.
 *   However, in the case of a base64 image source,
 *   the image is already loaded as a string of text and doesn't need to be fetched from a remote server.
 *   Instead, use the complete property to check if the image has finished loading.
 *
 * @param image
 * @param maxSize
 */
export function resizeImg(image: string, maxSize): Promise<any> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new window.Image();

    img.onload = () => {
      const ratio = img.width / img.height;
      if (img.width >= img.height) {
        canvas.width = maxSize;
        canvas.height = Math.round(maxSize / ratio);
      } else {
        canvas.height = maxSize;
        canvas.width = Math.round(maxSize * ratio);
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL(AppConfig.thumbType));
    };
    img.onerror = () => resolve('');
    img.src = image;
    // If already loaded, trigger onload manually
    // @ts-ignore
    if (img.complete) img.onload();
  });
}

export function generateUrlThumbnail(
  fileURL: string,
  maxSize: number,
  loadTextFilePromise,
): Promise<string> {
  return loadTextFilePromise(fileURL)
    .then((content) => {
      if (!content || content.length < 1) return '';
      const thumb = getPropetiesThumbnail(content);
      if (thumb !== undefined) {
        return resizeImg(thumb, maxSize);
      } else {
        // TODO handle no imgData state (load URL in IFRAME and generate screenshot)
        return '';
      }
    })
    .catch((err) => {
      console.log('Error generating url tmb for: ' + fileURL + ' - ' + err);
      return '';
    });
}

export function generateImageThumbnail(
  fileURL: string,
  getFileContentPromise,
  dirSeparator,
  maxTmbSize?: number,
): Promise<string> {
  try {
    if (/^https?:\/\//.test(fileURL)) {
      return getResizedImageThumbnail(fileURL, maxTmbSize);
    }
    return getFileContentPromise(fileURL, 'arraybuffer')
      .then((content) => {
        const ext = extractFileExtension(fileURL, dirSeparator).toLowerCase();
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
        return '';
      });
  } catch (e) {
    console.log(`Error creating image thumb for : ${fileURL}`, e);
    return Promise.resolve('');
  }
}

function cordovaCreateObjectURL(blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      resolve(event.target?.result as string); // dataURL
    };
    reader.readAsDataURL(blob);
  });
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
  maxTmbSize: number = AppConfig.maxTmbSize,
): Promise<string> {
  return new Promise((resolve) => {
    let canvas: HTMLCanvasElement = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('Unable to get canvas context');
      resolve('');
      return;
    }
    if (maxTmbSize && maxTmbSize > maxSize) {
      maxSize = maxTmbSize;
    }

    let img: HTMLImageElement = new window.Image();
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
      let maxSizeWidth = Math.min(img.width, maxSize);
      let maxSizeHeight = Math.min(img.height, maxSize);
      if (img.width >= img.height) {
        canvas.width = maxSizeWidth;
        canvas.height = Math.round((maxSizeWidth * img.height) / img.width);
      } else {
        canvas.height = maxSizeHeight;
        canvas.width = Math.round((maxSizeHeight * img.width) / img.height);
      }

      const { width, height } = canvas;
      const x = width / 2;
      const y = height / 2;

      ctx.translate(x, y);
      ctx.fillStyle = thumbnailBackgroundColor;
      ctx.fillRect(-width / 2, -height / 2, width, height);
      ctx.drawImage(img, -width / 2, -height / 2, width, height);
      ctx.translate(-x, -y);
      resolve(canvas.toDataURL(AppConfig.thumbType));
      img = null;
      canvas = null;
    };
    img.onerror = (err) => {
      console.error('Error loading image in getResizedImageThumbnail:', err);
      resolve('');
    };
    img.src = src;
  });
}

function generateVideoThumbnail_alt(fileURL): Promise<string> {
  return new Promise((resolve) => {
    try {
      let canvas: HTMLCanvasElement = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      let img: HTMLImageElement = new Image();
      let video: HTMLVideoElement = document.createElement('video');
      video.crossOrigin = 'anonymous'; // Attempt to bypass CORS restrictions
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
          console.log(`Error loading: ${fileURL} for tmb gen with: ${err} `);
          resolve('');
        };
        resolve(dataurl);
        img = null;
        canvas = null;
        video = null;
      };
      video.onerror = (err) => {
        console.log(`Error opening: ${fileURL} for tmb gen with: ${err} `);
        resolve('');
      };
      video.src = fileURL.startsWith('http')
        ? fileURL
        : fileURL.replace(/#/g, '%23');
    } catch (e) {
      console.log(`Error creating video thumb for : ${fileURL} with: ${e}`);
      resolve('');
    }
  });
}

function getHtmlThumbnail(html: string) {
  const start = 'data-screenshot="';
  const end = '"';
  const inxBegin = html.indexOf(start);
  let imgDataUrl;
  if (inxBegin > -1) {
    imgDataUrl = html.substr(inxBegin + start.length);
    const inxEnd = imgDataUrl.indexOf(end);
    if (inxEnd > -1) {
      imgDataUrl = imgDataUrl.substr(0, inxEnd);
      if (imgDataUrl.startsWith('data:image/')) {
        return imgDataUrl.trim();
      }
    }
  }
  return false; // wrong format
}

export function generateHtmlThumbnail(
  fileURL: string,
  maxSize: number,
  loadTextFilePromise,
): Promise<string> {
  return new Promise((resolve) => {
    loadTextFilePromise(fileURL)
      .then((contentHtml) => {
        if (!contentHtml || contentHtml.length < 1) {
          resolve('');
        }

        const thumb = getHtmlThumbnail(contentHtml);
        if (thumb) {
          // console.log(thumb);
          // resolve(thumb);
          resizeImg(thumb, maxSize)
            .then((img) => {
              resolve(img);
              return true;
            })
            .catch((err) => {
              console.log('Error resizeImg tmb for: ' + fileURL + ' - ' + err);
              resolve('');
            });
        } else {
          const sanitizedHtml = DOMPurify.sanitize(contentHtml, {});
          const iframe = document.createElement('iframe');
          iframe.onload = () => {
            const iframedoc =
              iframe.contentDocument || iframe.contentWindow.document;
            iframedoc.body.innerHTML = sanitizedHtml;
            // iframedoc.src = 'data:text/html;charset=utf-8,' + contentHtml;

            import(/* webpackChunkName: "html2canvas" */ 'html2canvas')
              .then(({ default: html2canvas }) => {
                html2canvas(iframedoc.body, {
                  // @ts-ignore
                  dpi: 144,
                  letterRendering: true,
                  width: maxSize,
                  height: maxSize,
                })
                  .then((canvas) => {
                    // document.body.appendChild(canvas);
                    document.body.removeChild(iframe);
                    resolve(canvas.toDataURL(AppConfig.thumbType));
                    return true;
                  })
                  .catch((err) => {
                    console.log(
                      'Error html2canvas tmb for: ' + fileURL + ' - ' + err,
                    );
                    resolve('');
                  });
                return true;
              })
              .catch((error) => {
                console.log(
                  'An error occurred while loading the html2canvas: ' + error,
                );
                resolve('');
              });
          };
          document.body.appendChild(iframe);
        }

        return true;
      })
      .catch((err) => {
        console.log('Error generating tmb for: ' + fileURL + ' - ' + err);
        resolve('');
      });
  });
}

export function generateZipContainerImageThumbnail(
  fileURL: string,
  maxSize: number,
  supportedImgs: Array<string>,
  getFileContentPromise,
  dirSeparator: string,
): Promise<string> {
  const parts = ['cover', 'thumbnail', 'preview'];
  // console.log(JSON.stringify(JSZip));
  let decodedFileURL = fileURL;
  try {
    decodedFileURL = decodeURIComponent(fileURL);
  } catch (ex) {}
  return getFileContentPromise(decodedFileURL)
    .then((content) =>
      JSZip.loadAsync(content)
        .then((zipFile) => {
          // console.log(JSON.stringify(zipFile));
          let max = 0;
          let maxImgFile = null;
          let ext;

          for (const fileName in zipFile.files) {
            if (zipFile.files[fileName].dir === true) {
              continue;
            }

            ext = extractFileExtension(fileName, dirSeparator).toLowerCase();
            if (supportedImgs.indexOf(ext) >= 0) {
              let partName = baseName(fileName, dirSeparator);
              partName = partName.split('.').reverse()[1].toLowerCase();

              const containFile = zipFile.files[fileName];

              // console.log("partName " + partName);
              let tmbFound = false;
              parts.forEach((part) => {
                if (partName.includes(part)) {
                  maxImgFile = fileName;
                  tmbFound = true;
                }
              });
              if (tmbFound) {
                break;
              }

              // @ts-ignore
              if (containFile._data.uncompressedSize > max) {
                // @ts-ignore
                max = containFile._data.uncompressedSize;
                maxImgFile = fileName;
              }
            }
          }

          if (maxImgFile) {
            return zipFile
              .file(maxImgFile)
              .async('base64' /* 'uint8array' */)
              .then((thumb) => {
                // console.log(dataURL);
                const imgExt = extractFileExtension(
                  maxImgFile,
                  dirSeparator,
                ).toLowerCase();
                return resizeImg(
                  'data:image/' +
                    (imgExt === 'svg' ? 'svg+xml' : imgExt) +
                    ';base64,' +
                    thumb,
                  maxSize,
                )
                  .then((img) => img)
                  .catch((err) => {
                    console.log(
                      'Error resizeImg tmb for: ' + fileURL + ' - ' + err,
                    );
                  });
                // const buf = zipFile.files[maxImgFile].asArrayBuffer();
                // const dataURL = arrayBufferToDataURL(buf, null);
                // generateImageThumbnail(dataURL).then(resolve).catch(errorHandler);
              })
              .catch((err) => {
                console.log(
                  'Error while generating thumbnail for: ' +
                    fileURL +
                    ' - ' +
                    JSON.stringify(err),
                );
              });
          } else {
            console.log('maxImgFile not found');
          }
          return '';
        })
        .catch((err) => {
          console.log('Failed to load jszip', err);
          return '';
        }),
    )
    .catch((err) => {
      console.log(
        'Error while generating thumbnail for: ' +
          fileURL +
          ' - ' +
          JSON.stringify(err),
      );
      return '';
    });
}

export function generatePSDThumbnail(fileURL, maxSize): Promise<string> {
  return new Promise((resolve) => {
    try {
      console.log(`Thumbnail generation for PSD not supported : ${fileURL}`);
      // const PSD = require('../libs/psd/dist/psd');
      // PSD.fromURL(fileURL).then((psd) => {
      //   const pngDataURL = psd.image.toPng();
      //   resizeImg(pngDataURL, maxSize)
      //   .then(img => {
      //     resolve(img);
      //     return true;
      //   })
      //   .catch(err => {
      //     console.log('Error resizeImg tmb for: ' + fileURL + ' - ' + err);
      //     resolve('');
      //   });
      //   return true;
      // }).catch((err) => {
      //   console.log(`Error loading: ${fileURL} for PSD tmb generation: ${err}`)
      //   resolve('');
      // });
      resolve('');
      return true;
    } catch (e) {
      console.log(`Error creating PSD thumb for : ${fileURL} with: ${e}`);
      resolve('');
    }
  });
}

export function generateUTIFThumbnail(
  fileURL: string,
  maxSize: number,
): Promise<string> {
  return new Promise((resolve) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'arraybuffer';
      xhr.open('GET', fileURL);
      xhr.onload = () => {
        const ifds = UTIF.decode(xhr.response);
        if (ifds[0] && ifds[0].width && ifds[0].width > 0) {
          const dataUrl = UTIF.bufferToURI(xhr.response, ifds[0]);
          resizeImg(dataUrl, maxSize)
            .then((img) => {
              resolve(img);
              return true;
            })
            .catch((err) => {
              console.log('Error resizeImg tmb for: ' + fileURL + ' - ' + err);
              resolve('');
            });
        } else {
          resolve('');
        }
        return true;
      };
      xhr.onerror = (err) => {
        console.log(`Error loading for tmb gen: ${fileURL} ${err} `);
        resolve('');
      };
      xhr.send();
    } catch (e) {
      console.log(`Error creating UTIF thumb for : ${fileURL} with: ${e}`);
      resolve('');
    }
  });
}

export function generateTGAThumbnail(
  fileURL: string,
  maxSize: number,
): Promise<string> {
  return new Promise((resolve) => {
    try {
      const tgaLoader = new TgaLoader();
      tgaLoader.open(fileURL, () => {
        const canvas = tgaLoader.getCanvas();
        // const ctx = canvas.getContext('2d');
        // ctx.fillStyle = thumbnailBackgroundColor;
        const dataUrl = canvas.toDataURL(AppConfig.thumbType);
        resizeImg(dataUrl, maxSize)
          .then((img) => {
            resolve(img);
            return true;
          })
          .catch((err) => {
            console.log('Error resizeImg tmb for: ' + fileURL + ' - ' + err);
            resolve('');
          });
        return true;
      });
    } catch (e) {
      console.log(`Error creating TGA thumb for : ${fileURL} with: ${e}`);
      resolve('');
    }
  });
}

export function generateTextThumbnail(
  fileURL: string,
  maxSize: number,
  loadTextFilePromise,
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    loadTextFilePromise(fileURL, true)
      .then((content) => {
        if (!content || content.length < 1) {
          resolve('');
          return true;
        }
        const lines = content.split('\n');
        const previewLineCount = lines.length > 10 ? 10 : lines.length;
        const ctx = canvas.getContext('2d');
        canvas.width = maxSize;
        canvas.height = maxSize;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.font = '22px sans-serif';
        for (let i = 0; i < previewLineCount; i += 1) {
          const line = lines[i];
          if (line && line.length > 0) {
            ctx.fillText(line, 2, 22 * (i + 1) + 10);
          }
        }
        const dataURL = canvas.toDataURL(AppConfig.thumbType);
        // console.log('DATAURL: ' + AppConfig.thumbType + dataURL);
        resolve(dataURL);
        return true;
      })
      .catch((error) => {
        console.log('Error getting the content: ' + fileURL + ' - ' + error);
        resolve('');
      });
  });
}

export function generateMp3Thumbnail(
  fileURL: string,
  maxSize: number,
): Promise<string> {
  return new Promise((resolve) => {
    // import('id3-reader').then(() => {
    // const errorHandler = err => {
    //   console.log(
    //     'Error while generating thumbnail for: ' +
    //     fileURL +
    //     ' - ' +
    //     JSON.stringify(err)
    //   );
    //   resolve('');
    // };
    // PlatformIO.getFileContentPromise(fileURL)
    //   .then(content => {
    //     const fileBlob = new Blob([content]);
    //     ID3.loadTags(
    //       fileURL,
    //       () => {
    //         const image = ID3.getAllTags(fileURL).picture;
    //         let dataUrl = '';
    //         if (image) {
    //           let base64String = '';
    //           for (let i = 0; i < image.data.length; i++) {
    //             base64String += String.fromCharCode(image.data[i]);
    //           }
    //           const img = new Image();
    //           img.src =
    //             'data:' + image.format + ';base64,' + window.btoa(base64String);
    //           const canvas = document.createElement('canvas');
    //           const ctx = canvas.getContext('2d');
    //           if (img.width >= img.height) {
    //             canvas.width = maxSize;
    //             canvas.height = (maxSize * img.height) / img.width;
    //           } else {
    //             canvas.height = maxSize;
    //             canvas.width = (maxSize * img.width) / img.height;
    //           }
    //           ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    //           dataUrl = canvas.toDataURL(AppConfig.thumbType);
    //         }
    //         resolve(dataUrl);
    //       },
    //       {
    //         tags: ['picture'],
    //         onError: errorHandler,
    //         dataReader: new FileAPIReader(fileBlob)
    //       }
    //     );
    //     return true;
    //   }, errorHandler)
    //   .catch(errorHandler);
    // }).catch((err) => {
    //  console.log('Failed to load id3-minimized', err);
    // });
  });
}

export function generateVideoThumbnail(
  fileURL: string,
  maxSize: number,
): Promise<string> {
  return new Promise((resolve) => {
    try {
      // console.log('generateVideoThumbnail for: ' + fileURL);
      let videoElem: HTMLVideoElement = document.createElement('video');
      videoElem.crossOrigin = 'anonymous'; // Attempt to bypass CORS restrictions
      videoElem.muted = true;
      const sourceElem = document.createElement('source');
      sourceElem.src = fileURL.startsWith('http')
        ? fileURL
        : fileURL.replace(/#/g, '%23');
      videoElem.appendChild(sourceElem);
      videoElem.addEventListener(
        'error',
        (err) => {
          console.log(`Error generating video thumb for: ${fileURL} - ${err}`);
          resolve('');
        },
        false,
      );
      videoElem.addEventListener(
        'canplay',
        () => {
          if (videoElem && videoElem.duration >= 2) {
            videoElem.currentTime = 2;
          }
        },
        false,
      );
      videoElem.addEventListener(
        'seeked',
        () => {
          let canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (videoElem.videoWidth >= videoElem.videoHeight) {
            canvas.width = maxSize;
            canvas.height =
              (maxSize * videoElem.videoHeight) / videoElem.videoWidth;
          } else {
            canvas.height = maxSize;
            canvas.width =
              (maxSize * videoElem.videoWidth) / videoElem.videoHeight;
          }
          ctx.drawImage(videoElem, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL(AppConfig.thumbType));
          videoElem.pause();
          canvas = videoElem = null;
          return true;
        },
        false,
      );
    } catch (e) {
      console.log(`Error creating VIDEO thumb for : ${fileURL} with: ${e}`);
      resolve('');
    }
  });
}
