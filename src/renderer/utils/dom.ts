import { getMimeType, getRelativeEntryPath } from '-/services/utils-io';

export function isVisibleOnScreen(element: any) {
  const rectangle = element.getBoundingClientRect();
  const isVisible =
    rectangle.top >= 0 &&
    rectangle.left >= 0 &&
    rectangle.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rectangle.right <=
      (window.innerWidth || document.documentElement.clientWidth);
  return isVisible;
}

export function getURLParameter(paramName: string, url?: string): string {
  const intUrl = url || window.location.href;
  const params = new URL(intUrl).searchParams;
  let param = params.get(paramName);
  // todo: temporal fix due to issue in the milkdown editor
  if (param?.endsWith('\\')) {
    // removing \ at the end of the param
    param = param.substring(0, param.length - 1);
  }
  return param;
}

export function clearAllURLParams() {
  window.history.pushState(null, null, window.location.pathname);
  // console.log(window.location.href);
}

export function clearURLParam(paramName) {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);

  // Delete the foo parameter.
  params.delete(paramName);
  window.history.pushState(null, null, window.location.pathname + '?' + params);
  // console.log(window.location.href);
}

export function updateHistory(
  locationUUID: string,
  locationPath: string,
  newDirectoryPath: string,
  newEntryPath?: string,
) {
  const currentHref = new URL(window.location.href);
  const params = new URLSearchParams(currentHref.search);
  // console.log('>>> current href: ' + window.location.href);
  const currentLocationID = params.get('tslid');
  const currentFolderPath = params.get('tsdpath');
  const currentEntryPath = params.get('tsepath');
  let diffLocation = false;
  let diffFolderPath = false;
  let diffEntryPath = false;

  if (locationUUID) {
    let urlParams = '?';
    const newEncLocationID = encodeURIComponent(locationUUID);
    urlParams += 'tslid=' + newEncLocationID;
    diffLocation = locationUUID !== currentLocationID;

    if (newDirectoryPath && newDirectoryPath.length > 0) {
      const newRelDir = getRelativeEntryPath(locationPath, newDirectoryPath);
      if (newRelDir) {
        const newEncRelDir = encodeURIComponent(newRelDir);
        urlParams += '&tsdpath=' + newEncRelDir;
      }
      diffFolderPath = newRelDir !== currentFolderPath;
    }

    if (newEntryPath && newEntryPath.length > 0) {
      const entryRelPath = getRelativeEntryPath(locationPath, newEntryPath);
      if (entryRelPath) {
        const newEncEntryPath = encodeURIComponent(entryRelPath);
        urlParams += '&tsepath=' + newEncEntryPath;
      }
      diffEntryPath = entryRelPath !== currentEntryPath;
    }

    const localePar = getURLParameter('locale');
    if (localePar && localePar.length > 1) {
      urlParams += '&locale=' + localePar;
    }

    if (diffLocation || diffEntryPath || diffFolderPath) {
      window.history.pushState(null, null, urlParams);
      // console.log('>>> new href: ' + window.location.href);
      // console.log('>>> url param: ' + urlParams);
    }
  }
}

export function getBase64Image(imgURL: string) {
  const canvas = document.createElement('canvas');
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = imgURL;
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL('image/png');
}

/*export function arrayBufferToDataURL(arrayBuffer: any, mime: string) {
  const blob = new Blob([arrayBuffer], { type: mime });
  const url = window.URL || window.webkitURL;
  return url.createObjectURL(blob);
}*/

export function arrayBufferToDataURL(
  arrayBuffer: any,
  mime: string,
): Promise<string> {
  return new Promise((resolve) => {
    const blob = new Blob([arrayBuffer], { type: mime });
    const reader = new FileReader();

    reader.onload = function (event) {
      const dataUrl = event.target?.result as string;
      resolve(dataUrl);
    };

    reader.readAsDataURL(blob);
  });
}

export function dataURLtoBlob(dataURI) {
  const arr = dataURI.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const arrBuff = base64ToUint8Array(arr[1]).buffer;
  return new window.Blob([arrBuff], { type: mime });
}

/**
 * @param base64
 */
export function base64ToUint8Array(base64) {
  // Find where the actual data starts (after the comma)
  // If no comma is found, assume the string is raw base64
  const commaIndex = base64.indexOf(',');
  const startOffset = commaIndex !== -1 ? commaIndex + 1 : 0;

  // atob can take a portion of a string via substring/slice
  // Most modern engines optimize slice() to be more memory-efficient than split()
  const binaryString = window.atob(base64.slice(startOffset));

  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

export function generateClipboardLink(url, name?) {
  const htmlLink = `<a href="${url}">${name ? name : url}</a>`;
  const cbi = [
    new ClipboardItem({
      [getMimeType('html')]: new Blob([htmlLink], {
        type: getMimeType('html'),
      }),
      [getMimeType('txt')]: new Blob([url], { type: getMimeType('txt') }),
    }),
  ];
  return cbi;
}
