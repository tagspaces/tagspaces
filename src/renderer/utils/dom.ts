import { getMimeType, getRelativeEntryPath } from '-/services/utils-io';

/**
 * Check if an element is visible on screen
 */
export function isVisibleOnScreen(element: HTMLElement | null): boolean {
  if (!element) return false;

  const rect = element.getBoundingClientRect();
  const viewportHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const viewportWidth =
    window.innerWidth || document.documentElement.clientWidth;

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= viewportHeight &&
    rect.right <= viewportWidth
  );
}

/**
 * Get URL parameter value by name
 */
export function getURLParameter(
  paramName: string,
  url?: string,
): string | null {
  try {
    const searchUrl = url || window.location.href;
    const param = new URL(searchUrl).searchParams.get(paramName);
    // Remove trailing backslash (temporal fix for milkdown editor issue)
    return param?.endsWith('\\') ? param.slice(0, -1) : param;
  } catch (e) {
    console.error('Invalid URL in getURLParameter:', e);
    return null;
  }
}

/**
 * Clear all URL parameters and keep only pathname
 */
export function clearAllURLParams(): void {
  window.history.pushState(null, null, window.location.pathname);
}

/**
 * Remove specific URL parameter
 */
export function clearURLParam(paramName: string): void {
  const url = new URL(window.location.href);
  url.searchParams.delete(paramName);
  window.history.pushState(null, null, url.toString());
}

/**
 * Update browser history with location and path parameters
 */
export function updateHistory(
  locationUUID: string,
  locationPath: string,
  newDirectoryPath: string,
  newEntryPath?: string,
): void {
  if (!locationUUID) return;

  const currentUrl = new URL(window.location.href);
  const currentParams = currentUrl.searchParams;
  const newParams = new URLSearchParams();

  // Build new URL parameters
  newParams.set('tslid', locationUUID);

  let hasChanges = locationUUID !== currentParams.get('tslid');

  // Add directory path if provided
  if (newDirectoryPath?.length > 0) {
    const relDir = getRelativeEntryPath(locationPath, newDirectoryPath);
    if (relDir) {
      newParams.set('tsdpath', relDir);
      hasChanges ||= relDir !== currentParams.get('tsdpath');
    }
  }

  // Add entry path if provided
  if (newEntryPath?.length > 0) {
    const relEntryPath = getRelativeEntryPath(locationPath, newEntryPath);
    if (relEntryPath) {
      newParams.set('tsepath', relEntryPath);
      hasChanges ||= relEntryPath !== currentParams.get('tsepath');
    }
  }

  // Preserve locale parameter
  const locale = currentParams.get('locale');
  if (locale?.length) {
    newParams.set('locale', locale);
  }

  // Only update if there are changes
  if (hasChanges) {
    const newUrl = `?${newParams.toString()}`;
    window.history.pushState(null, null, newUrl);
  }
}

/**
 * Convert ArrayBuffer to Data URL
 */
export function arrayBufferToDataURL(
  arrayBuffer: ArrayBuffer,
  mime: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([arrayBuffer], { type: mime });
    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read array buffer'));
    };

    reader.readAsDataURL(blob);
  });
}

/**
 * Convert Data URL to Blob
 */
export function dataURLtoBlob(dataURI: string): Blob {
  const mimeMatch = dataURI.match(/:(.*?);/);
  if (!mimeMatch?.[1]) {
    throw new Error('Invalid data URI format');
  }

  const mime = mimeMatch[1];
  const commaIndex = dataURI.indexOf(',');
  const base64String = dataURI.slice(commaIndex + 1);
  const uint8Array = base64ToUint8Array(base64String);

  return new Blob([new Uint8Array(uint8Array)], { type: mime });
}

/**
 * Convert base64 string to Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  // Find where the actual data starts (after the comma)
  // If no comma is found, assume the string is raw base64
  const startOffset = base64.indexOf(',') + 1;
  const binaryString = window.atob(
    startOffset > 0 ? base64.slice(startOffset) : base64,
  );

  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generate clipboard items with link in HTML and plain text formats
 */
export function generateClipboardLink(
  url: string,
  name?: string,
): ClipboardItem[] {
  if (!url) {
    throw new Error('URL is required');
  }

  const linkText = name || url;
  const htmlLink = `<a href="${url}">${linkText}</a>`;
  const htmlMime = getMimeType('html') || 'text/html';
  const txtMime = getMimeType('txt') || 'text/plain';

  return [
    new ClipboardItem({
      [htmlMime]: new Blob([htmlLink], { type: htmlMime }),
      [txtMime]: new Blob([url], { type: txtMime }),
    }),
  ];
}
