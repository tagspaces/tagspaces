/* Copyright (c) 2012-2017 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

/* global define  */
define(function(require, exports, module) {
  'use strict';

  console.log('Loading utils.js ...');

  var TSCORE = require('tscore');
  var TSPOSTIO = require('tspostioapi');
  var marked = require("marked");
  var saveAs = require("libs/filesaver.js/FileSaver.min");

  function saveAsTextFile(blob, filename) {
    saveAs(blob, filename);
  }

  //Conversion utility
  function arrayBufferToDataURL(arrayBuffer, mime) {
    var blob = new Blob([arrayBuffer], {type: mime});
    var url = window.URL || window.webkitURL;
    return url.createObjectURL(blob);
  }

  function base64ToArrayBuffer(base64) {
    var bstr = window.atob(base64);
    var bytes = new Uint8Array(bstr.length);
    for (var i = 0; i < bstr.length; i++) {
      bytes[i] = bstr.charCodeAt(i);
    }
    return bytes.buffer;
  }

  function dataURLtoBlob(dataURI) {
    var arr = dataURI.split(','), mime = arr[0].match(/:(.*?);/)[1];
    var arrBuff = base64ToArrayBuffer(arr[1]);
    return new window.Blob([arrBuff], {type: mime});
  }

  function getBase64Image(imgURL) {
    var canvas = document.createElement("canvas");
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imgURL;
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/png");
  }

  function arrayBufferToStr(buf) {
    var str = '',
      bytes = new Uint8Array(buf);
    for (var i = 0; i < bytes.length; i++) {
      str += String.fromCharCode(bytes[i]);
    }
    return decodeURIComponent(escape(str));
  }

  function arrayBufferToBuffer(ab) {
    var buffer = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
      buffer[i] = view[i];
    }
    return buffer;
  }

  function baseName(dirPath) {
    var fileName = dirPath.substring(dirPath.lastIndexOf(TSCORE.dirSeparator) + 1, dirPath.length);
    return fileName ? fileName : dirPath;
  }

  function dirName(dirPath) {

    return dirPath.replace(/\\/g, '/').replace(/\/[^\/]*$/, '');
  }

  function getFileExt(fileURL) {
    var ext = fileURL.split('.').pop();
    return (ext === fileURL) ? "" : ext;
  }

  function getURLParameter(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      if (pair[0] == variable) {
        return pair[1];
      }
    }
    return false;
  }

  function isVisibleOnScreen(element) {
    var rectangle = element.getBoundingClientRect();
    var isVisible = (
      rectangle.top >= 0 &&
      rectangle.left >= 0 &&
      rectangle.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rectangle.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
    return isVisible;
  }

  function getRandomInt(min, max) {

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // TODO Use set instead of array in the core for selectedFiles
  function getUniqueSelectedFiles() {
    return _.uniq(TSCORE.selectedFiles);
  }

  /**
   * Convert 64bit url string to Blob
   * @name b64toBlob
   * @method
   * @memberof TSCORE.Utils
   * @param {string} b64Data - the 64bit url string which should be converted to Blob
   * @param {string} contentType - content type of blob
   * @param {int} sliceSize - optional size of slices if omited 512 is used as default
   * @returns {Blob}
   */
  function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);
      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      var byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    var blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }

  function convertToDateRange(dateRange) {
    var dateRangeRegExp = /^([0]?[1-9]|[1|2][0-9]|[3][0|1])[-]([0]?[1-9]|[1][0-2])$/g;
    if (dateRange.match(dateRangeRegExp) || dateRange.search('-')) {
      var range = dateRange.split('-');
      if (parseInt(range[0]) && parseInt(range[1])) {
        return range;
      }
    }
  }

  function convertToDateTime(dateTime) {
    var dateTimeRegExp = /^\d\d\d\d-(00|[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9])$/g;
    var dateTimeWinRegExp = /^(([0-1]?[0-9])|([2][0-3]))!([0-5]?[0-9])(!([0-5]?[0-9]))?$/g;
    var dateTimeWin1RegExp = /^(([0-1]?[0-9])|([2][0-3]))~([0-5]?[0-9])(!([0-5]?[0-9]))?$/g;
    if (dateTime.match(dateTimeRegExp) || dateTime.match(dateTimeWinRegExp) ||
      dateTime.match(dateTimeWin1RegExp) || dateTime.search('!') ||
      dateTime.search(':') || dateTime.search('~')) {

      var time, firstTime, secondTime;
      if (dateTime.indexOf('!')) {
        time = dateTime.split('!');
        if (parseInt(time[0]) && parseInt(time[1])) {
          firstTime = time[0];
          secondTime = time[1];
          if (firstTime.length === 2 && secondTime.length === 2) {
            time = firstTime + ":" + secondTime;
          } else if (firstTime.length > 2 && firstTime.length <= 8) {
            time = convertToDate(firstTime) + " " + toHHMMSS(secondTime);
          }
          return time;
        }
      }
      if (dateTime.indexOf(':')) {
        time = dateTime.split(':');
        if (parseInt(time[0]) && parseInt(time[1])) {
          return time;
        }
      }
      if (dateTime.indexOf('~')) {
        time = dateTime.split('~');
        if (parseInt(time[0]) && parseInt(time[1])) {
          firstTime = time[0];
          secondTime = time[1];
          if (firstTime.length === 2 && secondTime.length === 2) {
            time = firstTime + ":" + secondTime;
          } else if (firstTime.length > 2 && firstTime.length <= 8) {
            time = convertToDate(firstTime) + " " + toHHMMSS(secondTime);
          }
          return time;
        }
      }
    }
  }

  function convertToDate(date) {

    var d = new Date(date);

    var parseToInt = parseInt(date);
    var dateStr, match, betterDateStr;
    switch (date.length) {
      case 4:
        if (parseToInt && !isNaN(parseToInt)) {
          var year = d.getFullYear();

          return year;
        }
        break;
      case 6:
        if (parseToInt && !isNaN(parseToInt)) {
          dateStr = date;
          match = dateStr.match(/(\d{4})(\d{2})/);
          betterDateStr = match[1] + '-' + match[2];

          return betterDateStr;
        }
        break;
      case 8:
        if (parseToInt && !isNaN(parseToInt)) {
          dateStr = date;
          match = dateStr.match(/(\d{4})(\d{2})(\d{2})/);
          betterDateStr = match[1] + '-' + match[2] + '-' + match[3];

          return betterDateStr;
        }
        break;
      default:
        return false;
    }
  }

  function toHHMMSS(time) {
    var timeFormat = time;
    var match = timeFormat.match(/(\d{2})(\d{2})(\d{2})/);
    var hhmmss = match[1] + ':' + match[2] + ':' + match[3];
    return hhmmss;
  }

  // Format Sun May 11, 2014 to 2014-05-11
  function formatDate(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) {
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }

    return [year, month, day].join('-');
  }

  // Format Sun May 11, 2014 to 2014-05
  function formatDateMonth(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      year = d.getFullYear();

    if (month.length < 2) {
      month = '0' + month;
    }
    return [year, month].join('-');
  }

  // parse “YYYYmmdd” to 'Fri Jul 15 2016 00:00:00 GMT+0300 (FLE Summer Time)'
  function parseFullDate(date) {
    // validate year as 4 digits, month as 01-12, and day as 01-31
    if ((date = date.match(/^(\d{4})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/))) {
      // make a date
      date[0] = new Date(+date[1], +date[2] - 1, +date[3]);
      // check if month stayed the same (ie that day number is valid)
      if (date[0].getMonth() === +date[2] - 1) {
        return date[0];
      }
    }
  }

  // return array of [years, month]
  function parseToDate(date) {
    var dateMonth = convertToDate(date);
    var d;
    if (dateMonth) {
      d = dateMonth;
    } else if (dateMonth.length === 5) {
      var dateString = dateMonth.split('-');
      d = new Date(dateString[0], dateString[1]);
    }
    return d;
  }


  // Format Sun May 11, 2014 to 2014-05-11
  function parseDate(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) {
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }

    return [year, month, day].join('');
  }

  // Format Sun May 11, 2014 to 2014-05
  function parseDateMonth(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      year = d.getFullYear();

    if (month.length < 2) {
      month = '0' + month;
    }
    return [year, month].join('');
  }

  function splitValue(value, index) {
    var currentLat = value.substring(0, index);
    var currentLng = value.substring(index);

    return parseFloat(currentLat) + "," + parseFloat(currentLng);
  }

  function hasURLProtocol(url) {
    return (
      url.indexOf("http://") === 0 ||
      url.indexOf("https://") === 0 ||
      url.indexOf("file://") === 0 ||
      url.indexOf("data:") === 0
    );
  }

  function handleLinks($element) {
    $element.find("img[src]").each(function() {
      var currentSrc = $(this).attr("src");
      if (!hasURLProtocol(currentSrc)) {
        var path = (isWeb ? "" : "file://") + TSCORE.currentPath + "/" + currentSrc;
        $(this).attr("src", path);
      }
    });

    $element.find("a[href]").each(function() {
      var currentSrc = $(this).attr("href");
      var path;

      if (!hasURLProtocol(currentSrc)) {
        var path = (isWeb ? "" : "file://") + TSCORE.currentPath + "/" + currentSrc;
        $(this).attr("href", path);
      }

      $(this).off();
      $(this).on('click', function(e) {
        e.preventDefault();
        if (path) {
          currentSrc = encodeURIComponent(path);
        }
        var msg = {command: "openLinkExternally", link: currentSrc};
        window.postMessage(JSON.stringify(msg), "*");
      });
    });
  }

  function setMarkDownContent($targetElement, content) {
    $targetElement.html(convertMarkdown(content));
    handleLinks($targetElement);
  }

  function convertMarkdown(content) {
    var mdOptions = {
      gfm: true,
      tables: true,
      breaks: true,
      pedantic: false,
      sanitize: true,
      smartLists: true,
      smartypants: false
    }
    if (marked) {
      return marked(content, mdOptions);
    } else {
      console.warn("Marked library not loaded...");
    }
  }

  function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

  exports.arrayBufferToDataURL = arrayBufferToDataURL;
  exports.base64ToArrayBuffer = base64ToArrayBuffer;
  exports.dataURLtoBlob = dataURLtoBlob;
  exports.getBase64Image = getBase64Image;
  exports.arrayBufferToStr = arrayBufferToStr;
  exports.baseName = baseName;
  exports.dirName = dirName;
  exports.getFileExt = getFileExt;
  exports.arrayBufferToBuffer = arrayBufferToBuffer;
  exports.getURLParameter = getURLParameter;
  exports.isVisibleOnScreen = isVisibleOnScreen;
  exports.getRandomInt = getRandomInt;
  exports.getUniqueSelectedFiles = getUniqueSelectedFiles;
  exports.b64toBlob = b64toBlob;
  exports.convertToDate = convertToDate;
  exports.convertToDateTime = convertToDateTime;
  exports.convertToDateRange = convertToDateRange;
  exports.parseFullDate = parseFullDate;
  exports.formatDate = formatDate;
  exports.formatDateMonth = formatDateMonth;
  exports.toHHMMSS = toHHMMSS;
  exports.parseToDate = parseToDate;
  exports.parseDate = parseDate;
  exports.parseDateMonth = parseDateMonth;
  exports.splitValue = splitValue;
  exports.handleLinks = handleLinks;
  exports.guid = guid;
  exports.setMarkDownContent = setMarkDownContent;
  exports.convertMarkdown = convertMarkdown;
  exports.saveAsTextFile = saveAsTextFile;

});
