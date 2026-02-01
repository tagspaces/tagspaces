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
  encodeFileName,
  extractFileExtension,
} from '@tagspaces/tagspaces-common/paths';
import DOMPurify from 'dompurify';
import JSZip from 'jszip';
import * as mm from 'music-metadata';
import { getDocument } from 'pdfjs-dist/build/pdf.min.mjs';
import TgaLoader from 'tga-js';
import UTIF from 'utif';
import('pdfjs-dist/build/pdf.worker.min.mjs');

let maxSize = AppConfig.maxThumbSize;
const pdfMaxSize = 1000;

export const supportedMisc = ['url', 'html', 'htm'];
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
export const supportedAudio = [
  'mp3',
  'flac',
  'wav',
  'aiff',
  'afc',
  'ogg',
  'opus',
  'speex',
  'wma',
  'm4a',
  'm4b',
  'm4p',
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
  } else if (supportedAudio.includes(ext)) {
    if (fileSize && fileSize < maxFileSize) {
      return generateAudioThumbnail(
        fileURLEscaped,
        maxSize,
        getFileContentPromise,
      );
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

function getPropertiesThumbnail(propertiesFile: string): string | null {
  if (!propertiesFile) return null;

  const sectionHeader = '[InternetShortcut]';
  const startInx = propertiesFile.indexOf(sectionHeader);

  // 1. If the section doesn't exist, exit immediately
  if (startInx === -1) return null;

  // 2. Isolate the section body to avoid searching the whole file
  // Find the start of the next section or the end of the string
  let endInx = propertiesFile.indexOf('[', startInx + sectionHeader.length);
  const sectionBody =
    endInx === -1
      ? propertiesFile.slice(startInx)
      : propertiesFile.slice(startInx, endInx);

  /**
   * 3. Targeted extraction
   * Match 'COMMENT' key followed by '=' and 'data:image/'
   * [ \t]* matches optional spaces/tabs around the equals sign
   * ([^ \n\r\t]+) captures the URI until the first whitespace or newline
   */
  const match = sectionBody.match(
    /COMMENT[ \t]*=[ \t]*(data:image\/[^ \n\r\t]+)/i,
  );

  return match ? match[1].trim() : null;
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
      const thumb = getPropertiesThumbnail(content);
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
export async function getResizedImageThumbnailOptimized(
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

export async function generateHtmlThumbnail(
  fileURL: string,
  maxSize: number,
  loadTextFilePromise: (url: string) => Promise<string>,
): Promise<string> {
  try {
    const html = await loadTextFilePromise(fileURL);
    if (!html) return '';

    // Fast path check
    const existing = getHtmlThumbnail(html);
    if (existing) return await resizeImg(existing, maxSize);

    const sanitized = DOMPurify.sanitize(html, { WHOLE_DOCUMENT: true });

    return new Promise((resolve) => {
      const iframe = document.createElement('iframe');

      // Sandbox for security
      iframe.setAttribute('sandbox', 'allow-same-origin');

      Object.assign(iframe.style, {
        position: 'fixed',
        left: '-5000px',
        width: '1024px',
        height: '768px',
      });

      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) {
        document.body.removeChild(iframe);
        resolve('');
        return;
      }

      doc.open();
      doc.write(sanitized);
      doc.close();

      // Give the browser a moment to render styles
      setTimeout(async () => {
        try {
          const { default: html2canvas } = await import('html2canvas');
          const canvas = await html2canvas(doc.body, {
            width: maxSize,
            height: maxSize,
            scale: maxSize / 1024,
          });

          resolve(canvas.toDataURL(AppConfig.thumbType || 'image/jpeg'));
        } catch (e) {
          resolve('');
        } finally {
          if (iframe.parentNode) document.body.removeChild(iframe);
        }
      }, 500);
    });
  } catch (e) {
    return '';
  }
}

export async function generateZipContainerImageThumbnail(
  fileURL: string,
  maxSize: number,
  supportedImgs: string[],
  getFileContentPromise: (url: string) => Promise<ArrayBuffer>,
  dirSeparator: string,
): Promise<string> {
  let objectURL: string | null = null;

  try {
    // 1. Decode URL
    let decodedFileURL = fileURL;
    try {
      decodedFileURL = decodeURIComponent(fileURL);
    } catch (e) {
      /* ignore */
    }

    // 2. Load Zip
    const content = await getFileContentPromise(decodedFileURL);
    const zipFile = await JSZip.loadAsync(content);

    const keywords = ['cover', 'thumbnail', 'preview'];
    let bestMatch: { name: string; size: number; isKeyword: boolean } | null =
      null;

    // 3. Find the best candidate file
    // We want: A keyword match first, otherwise the largest image file found.
    for (const [fileName, fileObj] of Object.entries(zipFile.files)) {
      if (fileObj.dir) continue;

      const ext = fileName.split('.').pop()?.toLowerCase() || '';
      if (!supportedImgs.includes(ext)) continue;

      const lowerName = fileName.toLowerCase();
      const isKeyword = keywords.some((key) => lowerName.includes(key));

      // JSZip exposes 'uncompressedSize' in newer versions.
      // Fallback to 0 if accessing private _data is required in very old versions.
      const size =
        (fileObj as any).uncompressedSize ||
        (fileObj as any)._data?.uncompressedSize ||
        0;

      // Logic:
      // - If we find a keyword match and current best isn't a keyword -> take it.
      // - If both are same priority (both keywords or both not) -> take the larger one.
      if (
        !bestMatch ||
        (isKeyword && !bestMatch.isKeyword) ||
        (isKeyword === bestMatch.isKeyword && size > bestMatch.size)
      ) {
        bestMatch = { name: fileName, size, isKeyword };
      }
    }

    if (!bestMatch) {
      console.warn('No suitable image found in ZIP');
      return '';
    }

    // 4. Extract as Uint8Array (Memory efficient)
    const imgData = await zipFile.file(bestMatch.name)!.async('uint8array');

    // 5. Determine MIME type
    const imgExt = bestMatch.name.split('.').pop()?.toLowerCase() || 'jpeg';
    const mime = imgExt === 'svg' ? 'image/svg+xml' : `image/${imgExt}`;

    // 6. Create Blob URL
    const blob = new Blob([imgData as BlobPart], { type: mime });
    objectURL = URL.createObjectURL(blob);

    // 7. Resize (Using our optimized resizeImg from before)
    const result = await resizeImg(objectURL, maxSize);

    return result;
  } catch (err) {
    console.error(`Error generating ZIP thumbnail for: ${fileURL}`, err);
    return '';
  } finally {
    // 8. Cleanup memory
    if (objectURL) {
      URL.revokeObjectURL(objectURL);
    }
  }
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

export async function generateTextThumbnail(
  fileURL: string,
  maxSize: number = AppConfig.maxTmbSize,
  loadTextFilePromise: (url: string, asText: boolean) => Promise<string>,
): Promise<string> {
  try {
    // 1. Load content
    const rawContent = await loadTextFilePromise(fileURL, true);
    if (!rawContent) return '';

    // 2. PERFORMANCE: Only process the start of the file
    // Splitting a 10MB file into lines would crash the app
    const previewText = rawContent.substring(0, 2500);
    const lines = previewText.split('\n').slice(0, 15);

    // 3. Initialize Canvas (with Fallback)
    let canvas: any;
    let isOffscreen = false;

    if (typeof OffscreenCanvas !== 'undefined') {
      canvas = new OffscreenCanvas(maxSize, maxSize);
      isOffscreen = true;
    } else {
      canvas = document.createElement('canvas');
      canvas.width = maxSize;
      canvas.height = maxSize;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // 4. Background and Typography Setup
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, maxSize, maxSize);

    const fontSize = Math.max(12, Math.floor(maxSize / 16));
    const lineHeight = fontSize * 1.4;
    const padding = maxSize * 0.08;

    ctx.fillStyle = '#222222';
    ctx.font = `${fontSize}px sans-serif`;

    // 5. Draw Lines
    for (let i = 0; i < lines.length; i++) {
      const y = padding + (i + 1) * lineHeight;
      if (y > maxSize - padding) break; // Stop if we go off canvas

      const line = lines[i].trim();
      if (line.length > 0) {
        // Canvas clips text automatically if it's wider than the canvas
        ctx.fillText(line, padding, y, maxSize - padding * 2);
      }
    }

    // 6. Export to DataURL
    if (isOffscreen) {
      // OffscreenCanvas uses asynchronous blob conversion
      const blob = await (canvas as OffscreenCanvas).convertToBlob({
        type: AppConfig.thumbType || 'image/jpeg',
        quality: 0.8,
      });

      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } else {
      // Standard canvas uses synchronous DataURL conversion
      return canvas.toDataURL(AppConfig.thumbType || 'image/jpeg', 0.8);
    }
  } catch (error) {
    console.error('Text thumbnail error:', error);
    return '';
  }
}

/* Supported formats in music-metadata for tmb extraction 
1. Most Common Formats
    MP3: Extracts from ID3v2 tags (specifically the APIC frame). It supports ID3v2.2, v2.3, and v2.4.
    M4A / MP4 / M4B / M4P (AAC): Extracts from the iTunes/Apple covr atom.
    FLAC: Extracts from the Vorbis Comment METADATA_BLOCK_PICTURE block.
2. Lossless & High-Fidelity Formats
    WAV: Extracts from ID3v2 chunks embedded in the RIFF file.
    AIFF / AFC: Extracts from ID3v2 tags or Native AIFF metadata.
    DSF / DSD: Extracts from ID3v2 tags.
    APE (Monkey's Audio): Extracts from APE v2 tags.
    WV (WavPack): Extracts from APE v2 tags.
3. Open Source & Alternative Formats
    OGG / OPUS / SPEEX: Extracts from Vorbis Comments (METADATA_BLOCK_PICTURE).
    WMA (Windows Media Audio): Extracts from ASF metadata (specifically the WM/Picture attribute).
    WebM / Matroska: Extracts from EBML tags (though this is less common for audio-only files).
*/
export async function generateAudioThumbnail(
  src: string,
  maxSize: number = AppConfig.maxTmbSize,
  getFileContentPromise: (url: string) => Promise<ArrayBuffer>,
): Promise<string> {
  let objectURL: string | null = null;

  try {
    // 1. Get binary data using XHR helper
    const content = await getFileContentPromise(src);

    // 2. Parse Metadata
    const metadata = await mm.parseBuffer(new Uint8Array(content));

    // 3. Locate the "Front Cover"
    const picture = mm.selectCover(metadata.common.picture);

    if (!picture) {
      return '';
    }

    // 4. Convert embedded image binary to a temporary Blob URL
    if (picture && picture.data) {
      // 1. Wrap picture.data in a new Uint8Array to ensure it matches 'BlobPart'
      // 2. Provide a fallback for 'type' in case format is missing
      const imageBlob = new Blob([new Uint8Array(picture.data)], {
        type: picture.format || 'image/jpeg',
      });

      objectURL = URL.createObjectURL(imageBlob);
    }

    // 5. Use your optimized resize function
    const thumbnail = await getResizedImageThumbnail(objectURL, maxSize);

    // 6. Cleanup
    if (objectURL) {
      URL.revokeObjectURL(objectURL);
      objectURL = null;
    }

    return thumbnail;
  } catch (err) {
    console.error('Audio thumbnail extraction failed:', err);
    return '';
  } finally {
    if (objectURL) URL.revokeObjectURL(objectURL);
  }
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
        // 1. Capture current dimensions
        const vWidth = video.videoWidth;
        const vHeight = video.videoHeight;

        // 2. Safety check: If video dimensions are 0, we can't divide
        if (!vWidth || !vHeight) {
          console.warn('Video dimensions not available yet.');
          resolve('');
          cleanup();
          return;
        }

        // 3. Calculate Scale Factor safely
        // Ensure maxSize is a valid number, fallback to 200 if missing
        const targetMaxSize = Number(maxSize) || 200;
        const scale = Math.min(
          targetMaxSize / vWidth,
          targetMaxSize / vHeight,
          1,
        );

        // 4. Force dimensions to be valid "unsigned long" (Integers >= 1)
        // Use Math.max(1, ...) to ensure we never pass 0 to the constructor
        const canvasWidth = Math.max(1, Math.round(vWidth * scale));
        const canvasHeight = Math.max(1, Math.round(vHeight * scale));

        // 5. Construct Canvas
        const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);
          const blob = await canvas.convertToBlob({
            type: AppConfig.thumbType || 'image/jpeg',
            quality: 0.8,
          });

          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
            cleanup();
          };
          reader.readAsDataURL(blob);
        } else {
          throw new Error('Could not get 2D context');
        }
      } catch (e) {
        console.error('Video thumbnail canvas error:', e);
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
