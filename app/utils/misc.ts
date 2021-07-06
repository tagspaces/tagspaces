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
import { cleanFileName, getLocationPath } from '-/utils/paths';
import { TS } from '-/tagspaces.namespace';

export const locationType = {
  TYPE_LOCAL: '0',
  TYPE_CLOUD: '1',
  TYPE_AMPLIFY: '2'
};

/** Returns true is a string is plus code e.g. 8FWH4HVG+3V 8FWH4HVG+ 8FWH4H+ */
export function isPlusCode(plusCode: string): boolean {
  if (!plusCode) {
    return false;
  }
  const upperCasedPlusCode = plusCode.toUpperCase(); // needed only lowercased index
  return /(^|\s)([23456789C][23456789CFGHJMPQRV][23456789CFGHJMPQRVWX]{6}\+[23456789CFGHJMPQRVWX]{2,3})(\s|$)/.test(
    upperCasedPlusCode
  );
}

export function parseLatLon(
  latLongInput: string
): { lat: number; lon: number } | false {
  const cleanedInput = latLongInput.replace(/\s+/g, ''); // cleaning spaces
  if (
    !/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(
      cleanedInput
    )
  ) {
    return false;
  }
  const latLongArray = cleanedInput.split(',');
  const lat = parseFloat(latLongArray[0]);
  const lon = parseFloat(latLongArray[1]);
  if (!isNaN(lat) && !isNaN(lon)) {
    return {
      lat,
      lon
    };
  }
  return false;
}

export function traverse(objArr: Array<Object>, func: any) {
  objArr.forEach(obj => {
    Object.keys(obj).map(objKey => {
      func.apply(this, [obj, objKey]);
      if (objKey === 'subPages' && typeof Array.isArray(obj[objKey])) {
        traverse(obj[objKey], func);
      }
      return true;
    });
  });
}

export function immutablySwapItems(
  items: any,
  firstIndex: number,
  secondIndex: number
) {
  const results = items.slice();
  const firstItem = items[firstIndex];
  results[firstIndex] = items[secondIndex];
  results[secondIndex] = firstItem;
  return results;
}

export function arrayBufferToDataURL(arrayBuffer: any, mime: string) {
  const blob = new Blob([arrayBuffer], { type: mime });
  const url = window.URL || window.webkitURL;
  return url.createObjectURL(blob);
}

/**
 * Convert 64bit url string to Blob
 * @name b64toBlob
 * @method
 * @param {string} b64Data - the 64bit url string which should be converted to Blob
 * @param {string} contentType - content type of blob
 * @param {int} sliceSize - optional size of slices if omited 512 is used as default
 * @returns {Blob}
 */
export function b64toBlob(
  b64Data: any,
  contentType: string = '',
  sliceSize: number = 512
) {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i += 1) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
}

export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
  window.history.pushState('', document.title, window.location.pathname);
  // console.log(window.location.href);
}

export function clearURLParam(paramName) {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);

  // Delete the foo parameter.
  params.delete(paramName);
  window.history.pushState(
    '',
    document.title,
    window.location.pathname + '?' + params
  );
  // console.log(window.location.href);
}

export function updateHistory(
  currentLocation: TS.Location,
  currentDirectory: string,
  entryPath?: string
) {
  if (currentLocation) {
    // const isCloudLocation = currentLocation.type === locationType.TYPE_CLOUD;
    let urlParams = '?';
    let currentLocationPath = '';
    const isCloudLocation = currentLocation.type === locationType.TYPE_CLOUD;

    if (currentLocation && currentLocation.uuid) {
      urlParams += 'tslid=' + encodeURIComponent(currentLocation.uuid);
      currentLocationPath = getLocationPath(currentLocation);
    }

    if (currentDirectory && currentDirectory.length > 0) {
      const currentDir = isCloudLocation
        ? currentDirectory
        : currentDirectory.replace(currentLocationPath, '');
      urlParams += '&tsdpath=' + encodeURIComponent(currentDir);
    }

    if (entryPath && entryPath.length > 0) {
      const ePath = isCloudLocation
        ? entryPath
        : entryPath.replace(currentLocationPath, '');
      urlParams += '&tsepath=' + encodeURIComponent(ePath);
    }

    const localePar = getURLParameter('locale');
    if (localePar && localePar.length > 1) {
      urlParams += '&locale=' + localePar;
    }

    window.history.pushState('', document.title, urlParams);
    // console.log(window.location.href);
  }
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

export function arrayBufferToBuffer(content: any) {
  const buffer = new Buffer(content.byteLength);
  const view = new Uint8Array(content);
  for (let i = 0; i < buffer.length; ++i) {
    buffer[i] = view[i];
  }
  return buffer;
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

export function formatFileSize(sizeInBytes: number): string {
  const kilobyte = 1024;
  const megabyte = kilobyte * kilobyte;
  const gigabyte = megabyte * kilobyte;
  const terabyte = gigabyte * kilobyte;
  const precision = 2;

  if (sizeInBytes >= 0 && sizeInBytes < kilobyte) {
    return sizeInBytes + ' B';
  }
  if (sizeInBytes >= kilobyte && sizeInBytes < megabyte) {
    return (sizeInBytes / kilobyte).toFixed(precision) + ' KB';
  }
  if (sizeInBytes >= megabyte && sizeInBytes < gigabyte) {
    return (sizeInBytes / megabyte).toFixed(precision) + ' MB';
  }
  if (sizeInBytes >= gigabyte && sizeInBytes < terabyte) {
    return (sizeInBytes / gigabyte).toFixed(precision) + ' GB';
  }
  if (sizeInBytes >= terabyte) {
    return (sizeInBytes / terabyte).toFixed(precision) + ' TB';
  }
  return sizeInBytes + '';
}

export function formatFileSize2(
  sizeInBytes: number,
  siSystem: boolean
): string {
  const threshold = siSystem ? 1000 : 1024;
  if (!sizeInBytes) {
    return '';
  }
  if (sizeInBytes < threshold) {
    return sizeInBytes + ' B';
  }
  const units = siSystem
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB'];
  let cUnit = -1;
  do {
    sizeInBytes /= threshold;
    ++cUnit;
  } while (sizeInBytes >= threshold);
  return sizeInBytes.toFixed(1) + ' ' + units[cUnit];
}

export function formatDateTime(date: string | number, includeTime: boolean) {
  if (date === undefined || date === '') {
    return '';
  }
  const d = new Date(date);
  let cDate: string = '' + d.getDate();
  cDate += '';
  if (cDate.length === 1) {
    cDate = '0' + cDate;
  }
  let cMonth: string = '' + (d.getMonth() + 1);
  cMonth += '';
  if (cMonth.length === 1) {
    cMonth = '0' + cMonth;
  }
  const cYear: string = '' + d.getFullYear();
  let cHour: string = '' + d.getHours();
  cHour += '';
  if (cHour.length === 1) {
    cHour = '0' + cHour;
  }
  let cMinute: string = '' + d.getMinutes();
  cMinute += '';
  if (cMinute.length === 1) {
    cMinute = '0' + cMinute;
  }
  let cSecond: string = '' + d.getSeconds();
  cSecond += '';
  if (cSecond.length === 1) {
    cSecond = '0' + cSecond;
  }
  let time = '';
  if (includeTime) {
    time = ' - ' + cHour + ':' + cMinute + ':' + cSecond;
  }
  return cYear + '.' + cMonth + '.' + cDate + time;
}

/** Convert a date in the following format 20191204 or 20191204~124532 */
export function formatDateTime4Tag(
  date: string | Date,
  includeTime: boolean,
  includeMS?: boolean
): string {
  if (date === undefined || date === '') {
    return '';
  }
  const d = new Date(date);
  let cDate: string = '' + d.getDate();
  cDate += '';
  if (cDate.length === 1) {
    cDate = '0' + cDate;
  }
  let cMonth: string = '' + (d.getMonth() + 1);
  cMonth += '';
  if (cMonth.length === 1) {
    cMonth = '0' + cMonth;
  }
  const cYear = d.getFullYear();

  let time = '';
  if (includeTime) {
    let cHour: string = '' + d.getHours();
    cHour += '';
    if (cHour.length === 1) {
      cHour = '0' + cHour;
    }
    let cMinute: string = '' + d.getMinutes();
    cMinute += '';
    if (cMinute.length === 1) {
      cMinute = '0' + cMinute;
    }
    let cSecond: string = '' + d.getSeconds();
    cSecond += '';
    if (cSecond.length === 1) {
      cSecond = '0' + cSecond;
    }
    time = '~' + cHour + '' + cMinute + '' + cSecond; // TODO fix Chrome transforms ~ to _
  }

  let milliseconds = '';
  if (includeMS) {
    milliseconds = '~' + d.getMilliseconds();
  }
  return cYear + '' + cMonth + '' + cDate + time + milliseconds;
}

export function convertStringToDate(dateString: string) {
  if (dateString === undefined || dateString === '') {
    return false;
  }
  if (dateString.length === 8) {
    return new Date(
      dateString.substring(0, 4) +
        '-' +
        dateString.substring(4, 6) +
        '-' +
        dateString.substring(6, 8)
    );
  }
  return false;
}

export function sortAlphaNum(a: TS.FileSystemEntry, b: TS.FileSystemEntry) {
  // Regular expression to separate the digit string from the non-digit strings.
  const reParts = /\d+|\D+/g;

  // Regular expression to test if the string has a digit.
  const reDigit = /\d/;

  // Get rid of casing issues.
  const cleanedA = cleanFileName(a.name.toLowerCase());
  const cleanedB = cleanFileName(b.name.toLowerCase());

  // Separates the strings into substrings that have only digits and those
  // that have no digits.
  const aParts = cleanedA.match(reParts);
  const bParts = cleanedB.match(reParts);

  // Used to determine if aPart and bPart are digits.
  let isDigitPart;

  // If `a` and `b` are strings with substring parts that match...
  if (
    aParts &&
    bParts &&
    (isDigitPart = reDigit.test(aParts[0])) === reDigit.test(bParts[0])
  ) {
    // Loop through each substring part to compare the overall strings.
    const len = Math.min(aParts.length, bParts.length);
    for (let i = 0; i < len; i += 1) {
      let aPart: any = aParts[i];
      let bPart: any = bParts[i];

      // If comparing digits, convert them to numbers (assuming base 10).
      if (isDigitPart) {
        aPart = parseInt(aPart, 10);
        bPart = parseInt(bPart, 10);
      }

      // If the substrings aren't equal, return either -1 or 1.
      if (aPart !== bPart) {
        return aPart < bPart ? -1 : 1;
      }

      // Toggle the value of isDigitPart since the parts will alternate.
      isDigitPart = !isDigitPart;
    }
  }

  // Use normal comparison.
  // @ts-ignore
  return (a >= b) - (a <= b);
}

// Sorting functionality
export function sortByName(a: TS.FileSystemEntry, b: TS.FileSystemEntry) {
  // @ts-ignore
  return !b.isFile - !a.isFile || sortAlphaNum(a, b);
}

export function sortBySize(a: TS.FileSystemEntry, b: TS.FileSystemEntry) {
  return a.size - b.size;
}

export function sortByDateModified(
  a: TS.FileSystemEntry,
  b: TS.FileSystemEntry
) {
  return a.lmdt - b.lmdt;
}

export function sortByExtension(a: TS.FileSystemEntry, b: TS.FileSystemEntry) {
  return a.extension.toString().localeCompare(b.extension);
}

export function sortByFirstTag(a: TS.FileSystemEntry, b: TS.FileSystemEntry) {
  if ((!a.tags && !b.tags) || (a.tags.length < 1 && b.tags.length < 1)) {
    return 0;
  }
  if (!a.tags || a.tags.length < 1) {
    return -1;
  }
  if (!b.tags || b.tags.length < 1) {
    return 1;
  }
  return a.tags[0].title.localeCompare(b.tags[0].title);
}

export function shuffleArray(array: Array<any>) {
  // Durstenfeld shuffle
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function sortByCriteria(data: any, criteria: string, order: boolean) {
  switch (criteria) {
    case 'byName':
      if (order) {
        return data.sort(sortByName);
      }
      return data.sort((a, b) => -1 * sortByName(a, b));
    case 'byFileSize':
      if (order) {
        return data.sort(sortBySize);
      }
      return data.sort((a, b) => -1 * sortBySize(a, b));
    case 'byDateModified':
      if (order) {
        return data.sort(sortByDateModified);
      }
      return data.sort((a, b) => -1 * sortByDateModified(a, b));
    case 'byExtension':
      if (order) {
        return data.sort(sortByExtension);
      }
      return data.sort((a, b) => -1 * sortByExtension(a, b));
    case 'byFirstTag':
      if (order) {
        return data.sort(sortByFirstTag);
      }
      return data.sort((a, b) => -1 * sortByFirstTag(a, b));
    case 'random':
      return shuffleArray(data);
    default:
      return data.sort(sortByName);
  }
}

/**
 * @description Check if value is of type 'object'
 * @param val
 * @returns {boolean}
 */
export const isObj = (val: any) =>
  typeof val === 'object' && !isArr(val) && !isNull(val);

/**
 * @description Check if value is of type 'null'
 * @param val
 * @returns {boolean}
 */
export const isNull = (val: any) => val === null;

/**
 * @description Check if value is of type 'number'
 * @param val
 * @returns {boolean}
 */
export const isNum = (val: any) => typeof val === 'number' && !isNaN(val);

/**
 * @description Check if value is of type 'function'
 * @param val
 * @returns {boolean}
 */
export const isFunc = (val: any) => typeof val === 'function';

/**
 * @description Check if value is of type 'array'
 * @param val
 * @returns {boolean}
 */
export const isArr = (val: any) => Array.isArray(val);

/**
 * @description Check if value is of type 'string'
 * @param val
 * @returns {boolean}
 */
export const isStr = (val: any) => typeof val === 'string';

/**
 * Check if value is of type 'undefined'
 */
export const isUndef = (val: any): boolean => typeof val === 'undefined';

/**
 * Check if value is of type 'boolean'
 */
export const isBool = (val: any) => typeof val === 'boolean';

/**
 * Check if object has property
 */
export const hasProp = (obj: Object, prop: any): boolean =>
  obj.hasOwnProperty(prop);

/**
 * Check if object has method
 */
export const hasMethod = (obj: Object, method: any): boolean =>
  hasProp(obj, method) && isFunc(obj[method]);

/**
 * Check if object has key
 */
export const hasKey = (obj: Object, key: any): boolean =>
  getKeys(obj).indexOf(key) > -1;

/**
 * @description Get object keys
 * @param obj
 * @returns {Array}
 */
export const getKeys = (obj: Object) => Object.keys(obj);

/**
 * @description Iterate over each key of an object
 * @param obj
 * @param callback
 */
export const eachKey = (obj, callback) => {
  Object.keys(obj).forEach((key, index) => callback(key, obj[key], index));
};

/**
 * @description Linear iterator for object properties
 * @param obj
 * @param callback
 */
export const eachProp = (obj, callback) => {
  eachKey(obj, (key, prop, index) => callback(prop, key, index));
};

/**
 * @description Extend
 * @param baseObject
 * @param restObjects
 * @returns {object}
 */
export const extend = (baseObject, ...restObjects) => {
  const { assign } = Object;
  const modifiedObject = assign({}, baseObject);

  restObjects.map(obj => assign(modifiedObject, obj));
  return modifiedObject;
};

/**
 * @description Iterate recursively
 * @param handler
 * @param complete
 * @param index
 * @returns {*}
 */
export const recurIter = (handler, complete, index = 0) => {
  handler(canRecur => {
    if (!canRecur) {
      return complete();
    }
    const nextIndex = index + 1;
    recurIter(handler, complete, nextIndex);
  }, index);
};

/**
 * @description Poll over an interval of time
 * @param handler
 * @param complete
 * @param interval
 */
export const poll = (handler, complete, interval) => {
  setTimeout(() => {
    handler(canPoll => {
      if (canPoll) {
        return poll(handler, complete, interval);
      }
      complete();
    });
  }, interval);
};

/**
 * @description Buffer high-frequency events
 * @returns {function(*=, *=, *=)}
 */
export const buffer = ({ timeout, id }) => {
  const timers = {};

  return callback => {
    if (!id) {
      timers[id] = '0';
    }
    if (timers[id]) {
      clearTimeout(timers[id]);
    }
    timers[id] = setTimeout(callback, timeout);
  };
};

/**
 * @description Determine type checker
 * @param type
 * @returns {*}
 */
export const determineTypeChecker = type => {
  switch (type) {
    case 'number':
      return isNum;
    case 'object':
      return isObj;
    case 'null':
      return isNull;
    case 'function':
      return isFunc;
    case 'array':
      return isArr;
    case 'string':
      return isStr;
    case 'bool':
    case 'boolean':
      return isBool;
    case 'undefined':
    default:
      return isUndef;
  }
};

/**
 * @description Filter object data
 * @param objectData
 * @param requiredKeys
 */
export const filterObjectData = (objectData, requiredKeys) => {
  const filteredObject = {};
  eachKey(objectData, (key, value) => {
    if (requiredKeys.indexOf(key) === -1) {
      return false;
    }
    filteredObject[key] = value;
  });
  return filteredObject;
};

/**
 * @description Filter array of objects data
 * @param arrayData
 * @param requiredKeys
 */
export const filterArrayOfObjectsData = (arrayData, requiredKeys) =>
  arrayData.reduce((accumulator, item) => {
    const filteredObject = filterObjectData(item, requiredKeys);
    accumulator.push(filteredObject);
    return accumulator;
  }, []);

/**
 * @description Pluck object data to array
 * @param objectData
 * @param requiredKey
 */
export const pluckObjectDataToArray = (objectData, requiredKey) => {
  const filteredArray = [];
  eachKey(objectData, (key, value) => {
    if (requiredKey !== key) {
      return false;
    }
    filteredArray.push(value);
  });
  return filteredArray;
};

/**
 * @description Pluck array of objects data to array
 * @param arrayData
 * @param requiredKey
 */
export const pluckArrayOfObjectsDataToArray = (arrayData, requiredKey) =>
  arrayData.reduce((accumulator, item) => {
    const filteredArray = pluckObjectDataToArray(item, requiredKey);
    return [...accumulator, ...filteredArray];
  }, []);

/**
 * @description Extract nexted prop
 * @param obj
 * @param keysText
 * @returns {*}
 */
export const extractNestedProp = (obj, keysText) => {
  const keys = keysText.split('.');
  const keysLength = keys.length - 1;
  let keysIndex = 0;
  let isValidKey = true;
  let targetObj = Object.assign({}, obj);
  let targetProp;
  let nextTarget;

  if (keys.length > 0) {
    while (isValidKey) {
      nextTarget = targetObj[keys[keysIndex]];

      // ... check if final target is reached ...
      if (keysIndex === keysLength) {
        // ... extract target prop
        targetProp =
          !isUndef(nextTarget) && !isNull(nextTarget) ? nextTarget : undefined;
        break;
      }

      // ... check if next target is not an object ...
      if (!isObj(nextTarget)) {
        // ... cancel sequence
        isValidKey = false;
        break;
      }

      targetObj = nextTarget;
      keysIndex++;
    }
  }

  return targetProp;
};

/**
 * @description Sort by
 * @param items
 * @param keysText
 * @param type
 * @param direction
 */
export const sortBy = (
  items: any,
  keysText: any,
  type: string = 'string',
  direction: string = 'asc'
) =>
  items.sort((a, b) => {
    const aVal: any = extractNestedProp(a, keysText);
    const bVal: any = extractNestedProp(b, keysText);

    if (isUndef(aVal) || isNull(aVal)) {
      return direction === 'asc' ? -1 : 1;
    }

    if (isUndef(bVal) || isNull(bVal)) {
      return direction === 'asc' ? 1 : -1;
    }

    if (type === 'string' || type === 'email') {
      if (aVal.toLowerCase() > bVal.toLowerCase()) {
        return direction === 'asc' ? 1 : -1;
      }
      if (aVal.toLowerCase() < bVal.toLowerCase()) {
        return direction === 'asc' ? -1 : 1;
      }
      return 0;
    }
    if (type === 'number' || type === 'integer' || type === 'float') {
      if (aVal > bVal) {
        return direction === 'asc' ? 1 : -1;
      }
      if (aVal < bVal) {
        return direction === 'asc' ? -1 : 1;
      }
      return 0;
    }
    if (type === 'date') {
      // @ts-ignore
      const res1 = new Date(aVal) - new Date(bVal);
      // @ts-ignore
      const res2 = new Date(bVal) - new Date(aVal);
      return direction === 'asc' ? res1 : res2;
    }
  });

/**
 * @description Shape
 * @param items
 * @returns {*}
 */
export const shape = items => {
  let shapeItems = [...items];

  return {
    fetch: () => shapeItems,
    filterByUnique(key) {
      shapeItems = filterByUnique(shapeItems, key);
      return this;
    },
    filterByDuplicate(key, length = 2) {
      shapeItems = filterByDuplicate(shapeItems, key, length);
      return this;
    },
    sortBy({ key, type = 'string', direction = 'asc' }) {
      shapeItems = sortBy(shapeItems, key, type, direction);
      return this;
    },
    reduceTo(key) {
      shapeItems = shapeItems.reduce((accumulator, item) => {
        const prop = extractNestedProp(item, key);
        if (isArr(prop)) {
          return [...accumulator, ...prop];
        }
        if (!isUndef(prop) && !isNull(prop)) {
          return [...accumulator, prop];
        }
      }, []);
      return this;
    }
  };
};

/**
 * @description Filter by unique
 * @param items
 * @param key
 * @returns {*}
 */
export const filterByUnique = (items, key) =>
  items.reduce((accumulator, item) => {
    const itemProp = extractNestedProp(item, key);

    const isDuplicate =
      accumulator.filter(filteredItem => {
        const prop = extractNestedProp(filteredItem, key);
        return prop === itemProp;
      }).length > 0;

    if (isDuplicate) {
      return accumulator;
    }

    const modifiedItem = extend({}, item);
    accumulator.push(modifiedItem);
    return accumulator;
  }, []);

/**
 * @description Filter by duplicate
 * @param items
 * @param key
 * @param duplicateLength
 * @returns {*}
 */
export const filterByDuplicate = (items, key, duplicateLength = 2) =>
  items.filter(item => {
    const itemProp = extractNestedProp(item, key);
    const duplicatesCount = duplicateLength - 1;

    return (
      items.filter(innerItem => {
        const prop = extractNestedProp(innerItem, key);
        return prop === itemProp;
      }).length > duplicatesCount
    );
  });
