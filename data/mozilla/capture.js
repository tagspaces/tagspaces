/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
/* global */
'use strict';
const { getTabContentWindow, getActiveTab } = require('sdk/tabs/utils');
const { getMostRecentBrowserWindow } = require('sdk/window/utils');
const { pathFor } = require('sdk/system');
var {Cc, Ci} = require("chrome");

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
    return picker.file.path;
  }
  return null;
}

exports.saveContentToFile = function (name, content) {

  var filePath = getSaveLocationDialog(name);
  var aFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
  aFile.initWithPath(filePath);
  //aFile.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, 0600);
  var foStream = Cc["@mozilla.org/network/file-output-stream;1"].
      createInstance(Ci.nsIFileOutputStream);

  foStream.init(aFile, 0x02 | 0x08 | 0x20, 666, 0); // readwrite, create, truncate

  var converter = Cc["@mozilla.org/intl/converter-output-stream;1"].
      createInstance(Ci.nsIConverterOutputStream);
  converter.init(foStream, "UTF-8", 0, 0);
  converter.writeString(content);
  converter.close();
};

exports.saveContentToBinaryFile = function (name, content) {

  var filePath = getSaveLocationDialog(name);
  var aFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
  aFile.initWithPath(filePath);
  //aFile.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, 0600);
  var stream = Cc["@mozilla.org/network/safe-file-output-stream;1"].
               createInstance(Ci.nsIFileOutputStream);
  stream.init(aFile, 0x04 | 0x08 | 0x20, 600, 0); // readwrite, create, truncate
              
  stream.write(content, content.length);
  if (stream instanceof Ci.nsISafeOutputStream) {
      stream.finish();
  } else {
      stream.close();
  }
};

exports.saveURLToFile = function(name, url) {
  var pageWorker = require("sdk/page-worker");
  // This content script sends header titles from the page to the add-on:
  var script = "self.postMessage(document.body.innerHTML)";
  // Create a page worker that loads Wikipedia:
  pageWorker.Page({
    contentURL: url,
    contentScript: script,
    contentScriptWhen: "ready",
    onMessage: function(message) {
      exports.saveContentToFile(name, message);
      this.destroy();
    }
  });
};
