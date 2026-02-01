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
import { getDocument } from 'pdfjs-dist/build/pdf.min.mjs';
import TgaLoader from 'tga-js';
import UTIF from 'utif';
import('pdfjs-dist/build/pdf.worker.min.mjs');

let maxSize = AppConfig.maxThumbSize;
const pdfMaxSize = 1000;

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
      const pdfDocument = await getDocument(arrayBuffer).promise;
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

export async function generatePDFThumbnail(
  arrayBuffer: ArrayBuffer,
  maxSize: number = AppConfig.maxTmbSize,
): Promise<string> {
  // pdfjs-dist usually provides 'getDocument' in the global scope or as an import
  let loadingTask: any = null;

  try {
    // 1. Load the PDF document
    loadingTask = getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    // 2. Get the first page
    const page = await pdf.getPage(1);

    // 3. Calculate scaling
    // We get the viewport at scale 1.0 to determine original dimensions
    const unscaledViewport = page.getViewport({ scale: 1.0 });
    const scale = Math.min(
      maxSize / unscaledViewport.width,
      maxSize / unscaledViewport.height,
      1, // Don't upscale if the PDF page is smaller than maxSize
    );

    const viewport = page.getViewport({ scale });

    // 4. Prepare OffscreenCanvas
    const canvas = new OffscreenCanvas(
      Math.max(1, Math.round(viewport.width)),
      Math.max(1, Math.round(viewport.height)),
    );
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas context failed');

    // 5. Render PDF to Canvas
    // We fill with white first because many PDFs have transparent backgrounds
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    // 6. Export to Base64
    const blob = await canvas.convertToBlob({
      type: AppConfig.thumbType || 'image/jpeg',
      quality: 0.9,
    });

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error('Error creating PDF thumb:', err);
    return '';
  } finally {
    // 7. CRITICAL: Cleanup PDF.js resources
    // This releases the worker and memory used by PDF.js
    if (loadingTask) {
      loadingTask.destroy();
    }
  }
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
export async function resizeImg(
  image: string,
  maxSize: number,
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      let bitmap: ImageBitmap | null = null;
      try {
        // 1. Decode pixels off the main thread
        bitmap = await createImageBitmap(img);

        // 2. Calculate dimensions using a more concise scale factor
        // This handles both landscape and portrait in one calculation
        const scale = Math.min(
          maxSize / bitmap.width,
          maxSize / bitmap.height,
          1,
        );
        const width = Math.max(1, Math.round(bitmap.width * scale));
        const height = Math.max(1, Math.round(bitmap.height * scale));

        // 3. Use OffscreenCanvas for better performance
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context failed');

        // 4. Draw and Export
        ctx.drawImage(bitmap, 0, 0, width, height);

        const blob = await canvas.convertToBlob({
          type: AppConfig.thumbType || 'image/jpeg',
          quality: 0.8, // Reduces string size significantly with minimal quality loss
        });

        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error('Resize failed:', err);
        resolve('');
      } finally {
        if (bitmap) bitmap.close(); // Immediate memory cleanup
      }
    };

    img.onerror = () => resolve('');
    img.src = image;

    // Fixed: Only trigger manually if it's ALREADY complete when we attach the handler
    // And use a flag to prevent double execution
    if (img.complete && img.naturalWidth) {
      // We don't need to manually call onload if we set src AFTER attaching onload.
    }
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

export async function generateImageThumbnail(
  fileURL: string,
  getFileContentPromise: (url: string, type: string) => Promise<ArrayBuffer>,
  dirSeparator: string,
  maxTmbSize?: number,
): Promise<string> {
  let objectURL: string | null = null;

  try {
    // 1. Handle Remote URLs (Simple path)
    if (/^https?:\/\//.test(fileURL)) {
      return await getResizedImageThumbnail(fileURL, maxTmbSize);
    }

    // 2. Handle Local Files
    const content = await getFileContentPromise(fileURL, 'arraybuffer');
    if (!content) return '';

    const ext = extractFileExtension(fileURL, dirSeparator).toLowerCase();
    const blob = new Blob([content], { type: getMimeType(ext) });

    // 3. Create temporary URL
    if (AppConfig.isCordova) {
      // Assuming cordovaCreateObjectURL returns a Promise<string>
      objectURL = await cordovaCreateObjectURL(blob);
    } else {
      objectURL = URL.createObjectURL(blob);
    }

    if (!objectURL) return '';

    // 4. Generate the thumbnail
    const thumbnail = await getResizedImageThumbnail(objectURL, maxTmbSize);

    // 5. CRITICAL: Cleanup Memory
    // We must revoke the URL after processing to free up the original image bytes
    if (objectURL && !AppConfig.isCordova) {
      URL.revokeObjectURL(objectURL);
      objectURL = null; // Prevent double-revocation in finally block
    }

    return thumbnail;
  } catch (e) {
    console.error(`Error creating image thumb for : ${fileURL}`, e);
    return '';
  } finally {
    // 6. Safety Cleanup for errors
    if (objectURL && !AppConfig.isCordova) {
      URL.revokeObjectURL(objectURL);
    }
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
export async function getResizedImageThumbnail2(
  src: string,
  maxTmbSize: number = AppConfig.maxTmbSize,
): Promise<string> {
  if (src.startsWith('data:image/') && src.length < 5000) {
    return src; // Skip processing if it's already a small thumbnail
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      let bitmap: ImageBitmap | null = null;
      try {
        // 1. Decode the image
        bitmap = await createImageBitmap(img);

        // 2. Safety check: Ensure bitmap has dimensions
        if (!bitmap.width || !bitmap.height) {
          throw new Error('Image has no dimensions');
        }

        // 3. Calculate Scale
        // Ensure maxSize is at least 1 to avoid division by zero or zero-size canvas
        const maxSize = Math.max(1, maxTmbSize || 500);
        const scale = Math.min(
          maxSize / bitmap.width,
          maxSize / bitmap.height,
          1,
        );

        // 4. Force dimensions to be valid integers >= 1
        // The || 1 handles cases where Math.round results in 0 or NaN
        const width = Math.max(1, Math.round(bitmap.width * scale)) || 1;
        const height = Math.max(1, Math.round(bitmap.height * scale)) || 1;

        // 5. Create Canvas
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context unavailable');

        ctx.fillStyle = AppConfig.thumbBgColor || '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(bitmap, 0, 0, width, height);

        // 6. Export
        const outBlob = await canvas.convertToBlob({
          type: AppConfig.thumbType || 'image/jpeg',
          quality: 0.9,
        });

        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(outBlob);
      } catch (err) {
        console.error('Thumbnail processing failed:', err);
        resolve('');
      } finally {
        if (bitmap) bitmap.close();
      }
    };

    img.onerror = () => resolve('');
    img.src = src;
  });
}

export async function getResizedImageThumbnail(
  src: string,
  maxTmbSize: number = AppConfig.maxTmbSize,
): Promise<string> {
  if (src.startsWith('data:image/') && src.length < 5000) {
    return src; // Skip processing if it's already a small thumbnail
  }
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
      ctx.fillStyle = AppConfig.thumbBgColor;
      ctx.fillRect(-width / 2, -height / 2, width, height);
      ctx.drawImage(img, -width / 2, -height / 2, width, height);
      ctx.translate(-x, -y);
      resolve(canvas.toDataURL(AppConfig.thumbType));
      img = null;
      canvas = null;
    };

    img.onerror = (err) => resolve('');
    img.src = src;
  });
}

export function getHtmlThumbnail(html: string): string | null {
  const startMarker = 'data-screenshot="';

  // 1. Find the start index
  const inxBegin = html.indexOf(startMarker);
  if (inxBegin === -1) return null;

  // 2. Find the end quote STARTING from the end of the marker
  const valStart = inxBegin + startMarker.length;
  const inxEnd = html.indexOf('"', valStart);

  if (inxEnd === -1) return null;

  // 3. Extract the exact slice
  const imgDataUrl = html.slice(valStart, inxEnd).trim();

  // 4. Validate prefix
  if (imgDataUrl.startsWith('data:image/')) {
    return imgDataUrl;
  }

  return null; // Return null instead of false for better TypeScript consistency
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

export async function generateVideoThumbnail(
  fileURL: string,
  maxSize: number = AppConfig.maxTmbSize,
): Promise<string> {
  return new Promise((resolve) => {
    // 1. Setup Video Element
    let video: HTMLVideoElement | null = document.createElement('video');
    video.muted = true;
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata'; // Only load what's needed to start

    // Clean up function to prevent memory leaks and free hardware decoders
    const cleanup = () => {
      if (video) {
        video.pause();
        video.src = '';
        video.load(); // Forces the browser to release the video file
        video.remove();
        video = null;
      }
    };

    // 2. Error Handling
    video.onerror = () => {
      console.warn(`Error loading video: ${fileURL}`);
      cleanup();
      resolve('');
    };

    // 3. Metadata loaded: Calculate dimensions and seek
    video.onloadedmetadata = () => {
      if (!video) return;

      // Calculate scaled dimensions
      const scale = Math.min(
        maxSize / video.videoWidth,
        maxSize / video.videoHeight,
        1,
      );
      const width = Math.max(1, Math.round(video.videoWidth * scale));
      const height = Math.max(1, Math.round(video.videoHeight * scale));

      // Seek to 1 second (or halfway if video is short) to avoid black start frames
      const seekTime = Math.min(1, video.duration / 2);
      video.currentTime = seekTime;
    };

    // 4. Seek complete: Draw to canvas
    video.onseeked = async () => {
      if (!video) return;

      try {
        const canvas = new OffscreenCanvas(
          Math.max(
            1,
            Math.round(
              video.videoWidth *
                (maxSize / Math.max(video.videoWidth, video.videoHeight)),
            ),
          ),
          Math.max(
            1,
            Math.round(
              video.videoHeight *
                (maxSize / Math.max(video.videoWidth, video.videoHeight)),
            ),
          ),
        );

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const blob = await canvas.convertToBlob({
            type: AppConfig.thumbType,
            quality: 0.9,
          });

          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
            cleanup();
          };
          reader.readAsDataURL(blob);
        } else {
          resolve('');
          cleanup();
        }
      } catch (e) {
        console.error('Video thumbnail canvas error', e);
        resolve('');
        cleanup();
      }
    };

    // 5. Start loading
    // Use the hash fix from your original code
    video.src = fileURL.startsWith('http')
      ? fileURL
      : fileURL.replace(/#/g, '%23');
    video.load();
  });
}
