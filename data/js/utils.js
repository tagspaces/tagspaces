/* Copyright (c) 2012-2015 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
/* global define  */
define(function(require, exports, module) {
  'use strict';
  var TSCORE = require('tscore');
  var TSPOSTIO = require('tspostioapi');

  console.log('Loading utils.js ...');

  var TSCORE = require('tscore');

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


  exports.arrayBufferToDataURL = arrayBufferToDataURL;
  exports.base64ToArrayBuffer = base64ToArrayBuffer;
  exports.dataURLtoBlob = dataURLtoBlob;
  exports.getBase64Image = getBase64Image;
  exports.arrayBufferToStr = arrayBufferToStr;
  exports.baseName  = baseName;
  exports.dirName = dirName;
  exports.getFileExt = getFileExt;
  exports.arrayBufferToBuffer = arrayBufferToBuffer;

});
