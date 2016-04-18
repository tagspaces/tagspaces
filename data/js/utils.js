/* Copyright (c) 2012-2016 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

/* global define  */
define(function(require, exports, module) {
  'use strict';

  console.log('Loading utils.js ...');

  var TSCORE = require('tscore');
  var TSPOSTIO = require('tspostioapi');

  //Conversion utility
  function arrayBufferToDataURL(arrayBuffer, mime) {
    var blob = new Blob([arrayBuffer], {type: mime});
    var url = window.URL || window.webkitURL;
    return url.createObjectURL(blob);
  }

  function base64ToArrayBuffer(base64) {
    var bstr = window.atob(base64);
    var bytes = new Uint8Array(bstr.length);
    for (var i = 0; i < bstr.length; i++)        {
      bytes[i] = bstr.charCodeAt(i);
    }
    return bytes.buffer;
  }

  function dataURLtoBlob(dataURI) {
    var arr = dataURI.split(','), mime = arr[0].match(/:(.*?);/)[1];
    var arrBuff = base64ToArrayBuffer(arr[1]);
    return new window.Blob([arrBuff], {type:mime});
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


  exports.arrayBufferToDataURL = arrayBufferToDataURL;
  exports.base64ToArrayBuffer = base64ToArrayBuffer;
  exports.dataURLtoBlob = dataURLtoBlob;
  exports.getBase64Image = getBase64Image;
  exports.arrayBufferToStr = arrayBufferToStr;
  exports.baseName  = baseName;
  exports.dirName = dirName;
  exports.getFileExt = getFileExt;
  exports.arrayBufferToBuffer = arrayBufferToBuffer;
  exports.getURLParameter = getURLParameter;
  exports.isVisibleOnScreen = isVisibleOnScreen;
  exports.getRandomInt = getRandomInt;
  exports.getUniqueSelectedFiles = getUniqueSelectedFiles;
  exports.b64toBlob = b64toBlob;

});
