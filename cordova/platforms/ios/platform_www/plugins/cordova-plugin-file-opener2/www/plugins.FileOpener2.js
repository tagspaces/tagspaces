cordova.define("cordova-plugin-file-opener2.FileOpener2", function(require, exports, module) {
/*jslint browser: true, devel: true, node: true, sloppy: true, plusplus: true*/
/*global require, cordova */
/*
The MIT License (MIT)

Copyright (c) 2013 pwlin - pwlin05@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var exec = require('cordova/exec');

function FileOpener2() {}

FileOpener2.prototype.open = function (fileName, contentType, callbackContext) {
    contentType = contentType || '';
    callbackContext = callbackContext || {};
    exec(callbackContext.success || null, callbackContext.error || null, 'FileOpener2', 'open', [fileName, contentType]);
};

FileOpener2.prototype.showOpenWithDialog = function (fileName, contentType, callbackContext) {
    contentType = contentType || '';
    callbackContext = callbackContext || {};
    exec(callbackContext.success || null, callbackContext.error || null, 'FileOpener2', 'open', [fileName, contentType, false, callbackContext.position || [0, 0]]);
};

FileOpener2.prototype.uninstall = function (packageId, callbackContext) {
    callbackContext = callbackContext || {};
    exec(callbackContext.success || null, callbackContext.error || null, 'FileOpener2', 'uninstall', [packageId]);
};

FileOpener2.prototype.appIsInstalled = function (packageId, callbackContext) {
    callbackContext = callbackContext || {};
    exec(callbackContext.success || null, callbackContext.error || null, 'FileOpener2', 'appIsInstalled', [packageId]);
};

module.exports = new FileOpener2();

});
