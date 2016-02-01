'use strict';
var path = require('path');
var execFile = require('child_process').execFile;
var Promise = require('pinkie-promise');
var pify = require('pify');
var bin = path.join(__dirname, 'win-trash.exe');

module.exports = function (paths) {
	return pify(execFile, Promise)(bin, paths);
};
