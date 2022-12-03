import { locationType } from '@tagspaces/tagspaces-common/misc';
import {
  normalizePath,
  cleanTrailingDirSeparator
} from '@tagspaces/tagspaces-common/paths';
import { TS } from '-/tagspaces.namespace';
import PlatformIO from '-/services/platform-facade';

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
  return params.get(paramName);
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

function cleanFrontDirSeparator(dirPath) {
  if (dirPath) {
    if (dirPath.startsWith('\\')) {
      return dirPath.substring(2);
    }
    if (dirPath.startsWith('/')) {
      return dirPath.substring(1);
    }
    return dirPath;
  }
  return '';
}

export function updateHistory(
  currentLocation: TS.Location,
  currentDirectory: string,
  entryPath?: string
) {
  const currentDirectoryPath = cleanTrailingDirSeparator(currentDirectory);
  const entryPathNormed = cleanTrailingDirSeparator(entryPath);
  // console.log(
  //   '>>> Updating history: ' +
  //     currentLocation.name +
  //     ' dir: ' +
  //     currentDirectoryPath +
  //     ' entry: ' +
  //     entryPathNormed
  // );
  if (currentLocation) {
    // const isCloudLocation = currentLocation.type === locationType.TYPE_CLOUD;
    let urlParams = '?';
    let currentLocationPath = '';
    const isCloudLocation = currentLocation.type === locationType.TYPE_CLOUD;

    if (currentLocation && currentLocation.uuid) {
      urlParams += 'tslid=' + encodeURIComponent(currentLocation.uuid);
      currentLocationPath =
        currentLocation.path ||
        (currentLocation.paths && currentLocation.paths[0]); // PlatformIO.getLocationPath(currentLocation);
      currentLocationPath = cleanTrailingDirSeparator(currentLocationPath);
      // console.log('>>> history current location path: ' + currentLocationPath);
    }

    if (currentDirectoryPath && currentDirectoryPath.length > 0) {
      let currentRelDir = isCloudLocation
        ? currentDirectoryPath
        : currentDirectoryPath.replace(currentLocationPath, '');
      currentRelDir = cleanFrontDirSeparator(currentRelDir);
      // console.log('>>> history current rel dir path: ' + currentRelDir);
      if (currentRelDir) {
        urlParams += '&tsdpath=' + encodeURIComponent(currentRelDir);
      }
    }

    if (entryPathNormed && entryPathNormed.length > 0) {
      let eRelPath = isCloudLocation
        ? entryPathNormed
        : entryPathNormed.replace(currentLocationPath, '');
      eRelPath = cleanFrontDirSeparator(eRelPath);
      // console.log('>>> history current rel entry path: ' + eRelPath);
      if (eRelPath) {
        urlParams += '&tsepath=' + encodeURIComponent(eRelPath);
      }
    }

    const localePar = getURLParameter('locale');
    if (localePar && localePar.length > 1) {
      urlParams += '&locale=' + localePar;
    }

    window.history.pushState(null, null, urlParams);
    console.log('href updated: ' + window.location.href);
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

export function arrayBufferToDataURL(arrayBuffer: any, mime: string) {
  const blob = new Blob([arrayBuffer], { type: mime });
  const url = window.URL || window.webkitURL;
  return url.createObjectURL(blob);
}

export function dataURLtoBlob(dataURI) {
  const arr = dataURI.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const arrBuff = base64ToArrayBuffer(arr[1]);
  return new window.Blob([arrBuff], { type: mime });
}

export function base64ToArrayBuffer(base64) {
  const bstr = window.atob(base64);
  const bytes = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i += 1) {
    bytes[i] = bstr.charCodeAt(i);
  }
  return bytes.buffer;
}
