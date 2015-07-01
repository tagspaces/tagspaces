/* Copyright (c) 2012-2015 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
/* global define  */
define(function(require, exports, module) {
  'use strict';
  console.log('Loading utils.js ...');

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

  exports.arrayBufferToDataURL = arrayBufferToDataURL;
  exports.base64ToArrayBuffer = base64ToArrayBuffer;
  exports.dataURLtoBlob = dataURLtoBlob;
  exports.getBase64Image = getBase64Image;
});
