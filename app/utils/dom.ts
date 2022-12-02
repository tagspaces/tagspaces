import { locationType } from '@tagspaces/tagspaces-platforms/misc';
import { normalizePath } from '@tagspaces/tagspaces-platforms/paths';
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

export function updateHistory(
  currentLocation: TS.Location,
  currentDirectory: string,
  entryPath?: string
) {
  const currentDirectoryPath = normalizePath(currentDirectory);
  const entryPathNormed = normalizePath(entryPath);
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
      currentLocationPath = normalizePath(currentLocationPath);
    }

    if (currentDirectoryPath && currentDirectoryPath.length > 0) {
      const currentDir = isCloudLocation
        ? currentDirectoryPath
        : currentDirectoryPath.replace(currentLocationPath, '');
      console.log('href curdir ' + currentDir);
      urlParams += '&tsdpath=' + encodeURIComponent(currentDir);
    }

    if (entryPathNormed && entryPathNormed.length > 0) {
      const ePath = isCloudLocation
        ? entryPathNormed
        : entryPathNormed.replace(currentLocationPath, '');
      urlParams += '&tsepath=' + encodeURIComponent(ePath);
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
