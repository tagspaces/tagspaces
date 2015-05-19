/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
/* global */
'use strict';
const { getTabContentWindow, getActiveTab, getTabs, getTabURL } = require('sdk/tabs/utils');
const { getMostRecentBrowserWindow } = require('sdk/window/utils');
const { pathFor } = require('sdk/system');
var {Cc, Ci, Cr, components: Components} = require("chrome");

exports.captureTab = function(tab=getActiveTab(getMostRecentBrowserWindow())) {
  
  let contentWindow = getTabContentWindow(tab);
  let { document } = contentWindow;

  let w = contentWindow.innerWidth;
  let h = contentWindow.innerHeight;
  let x = contentWindow.scrollX;
  let y = contentWindow.scrollY;

  let canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');

  canvas.width = w;
  canvas.height = h;

  let ctx = canvas.getContext('2d');
  ctx.drawWindow(contentWindow, x, y, w, h, '#000');
  let dataURL = canvas.toDataURL();

  canvas = null;

  return dataURL;
};

exports.dataURItoBlob = function (dataURI) {
  var win = getMostRecentBrowserWindow();
  // convert base64 to raw binary data held in a string
  var byteString = win.atob(dataURI.split(',')[1]);
  return byteString;
};

function getSaveLocationDialog (name) {

  var picker = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
  var win = getMostRecentBrowserWindow();
  var dir = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
  dir.initWithPath(pathFor('DfltDwnld').toString());

  picker.init(win, "Save File as", Ci.nsIFilePicker.modeSave);
  picker.appendFilters(Ci.nsIFilePicker.filterAll | Ci.nsIFilePicker.filterText | Ci.nsIFilePicker.filterHTML);
  picker.defaultString = name;
  picker.displayDirectory = dir;

  var rv = picker.show();
  if (rv == Ci.nsIFilePicker.returnOK || rv == Ci.nsIFilePicker.returnReplace) {
    return picker.file;
  }
  return null;
}

exports.saveContentToFile = function (name, content) {

  var aFile = getSaveLocationDialog(name);
  if (!aFile.exists()) {
      aFile.create(Ci.nsIFile.NORMAL_FILE_TYPE, 438/*0666*/);
  }

  var foStream = Cc["@mozilla.org/network/file-output-stream;1"].
      createInstance(Ci.nsIFileOutputStream);
  foStream.init(aFile, 0x02 | 0x08 | 0x20, 438/*0666*/, 0); // readwrite, create, truncate

  var converter = Cc["@mozilla.org/intl/converter-output-stream;1"].
      createInstance(Ci.nsIConverterOutputStream);
  converter.init(foStream, "UTF-8", 0, 0);
  converter.writeString(content);
  converter.close();
};

exports.saveContentToBinaryFile = function (name, content) {

  var aFile = getSaveLocationDialog(name);
  if (!aFile.exists()) {
      aFile.create(Ci.nsIFile.NORMAL_FILE_TYPE, 438/*0666*/);
  }

  var stream = Cc["@mozilla.org/network/safe-file-output-stream;1"].
               createInstance(Ci.nsIFileOutputStream);
  stream.init(aFile, 0x04 | 0x08 | 0x20, 438/*0666*/, 0); // readwrite, create, truncate

  stream.write(content, content.length);
  if (stream instanceof Ci.nsISafeOutputStream) {
      stream.finish();
  } else {
      stream.close();
  }
};

exports.getFileExt = function(fileName) {
  var ext = fileName.replace(/^.*?\.([a-zA-Z0-9]+)$/, "$1");
  return (ext.length === fileName.length) ? 'html' : ext;
};

exports.saveURLToFile = function(name, url) {

  var window = null;  
  try {
    var tabs = getTabs();
    for (let tab of tabs) {
      var tabURL = getTabURL(tab);
      if(tabURL === url) {
        window = getTabContentWindow(tab);  
        break;   
      }
    }

    var persist = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
        .createInstance(Ci.nsIWebBrowserPersist);
    var ext = exports.getFileExt(name);
    if(ext === 'html') {
      var localFile = getSaveLocationDialog(name);
      var flags = persist.ENCODE_FLAGS_FORMAT_FLOWED | 
          persist.ENCODE_FLAGS_ABSOLUTE_LINKS;

      purifyContent(window.content.document);
      persist.saveDocument(window.content.document, localFile, null, null, flags, 0);      
    } else {
      var data = getContentFromURL(url);
      exports.saveContentToBinaryFile(name, data);
    }
  } catch (e) {
    console.log("saveURLToFile Error: " + e.message);
  }
};

function getContentFromURL(url) {

  var ioserv = Cc["@mozilla.org/network/io-service;1"] 
               .getService(Ci.nsIIOService); 
  var channel = ioserv.newChannel(url, 0, null); 
  var stream = channel.open(); 

  if (channel instanceof Ci.nsIHttpChannel && channel.responseStatus != 200) { 
    return ""; 
  }

  var bstream = Cc["@mozilla.org/binaryinputstream;1"] 
                .createInstance(Ci.nsIBinaryInputStream); 
  bstream.setInputStream(stream); 

  var size = 0; 
  var file_data = ""; 
  while(size = bstream.available()) { 
    file_data += bstream.readBytes(size); 
  }

  return file_data; 
}

function purifyContent (document) {
 
  var content = document.body.innerHTML;
  var head = document.head.innerHTML;
  // removing all scripts from the document
  if (head) {
    document.head.innerHTML = head.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");  
  }
  
  var cleanedContent = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  // saving all images as png in base64 format
  var match,
    urls = [],
    imgUrl = "",
    rex = /<img.*?src="([^">]*\/([^">]*?))".*?>/g;

  while (match = rex.exec(cleanedContent)) {
    imgUrl = match[1];
    console.log("URLs: " + imgUrl);
    urls.push([imgUrl, getBase64Image(imgUrl)]);
  }

  urls.forEach(function(dataURLObject) {
    if (dataURLObject[1].length > 7) {
      cleanedContent = cleanedContent.split(dataURLObject[0]).join(dataURLObject[1]);
    }
    //console.log(dataURLObject[0]+" - "+dataURLObject[1]);
  });

  if (cleanedContent) {
    document.body.innerHTML = cleanedContent;  
  }
}

function getBase64Image(imgURL) {
  let tab = getActiveTab(getMostRecentBrowserWindow());
  let contentWindow = getTabContentWindow(tab);
  let { document } = contentWindow;
  var canvas = document.createElement("canvas");
  var img = new contentWindow.Image();
  img.src = imgURL;
  canvas.width = img.width;
  canvas.height = img.height;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL("image/png");
}
