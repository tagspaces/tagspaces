'use strict';
var execFile = require('child_process').execFile;
var Promise = require('pinkie-promise');
var pify = require('pify');

module.exports = function (str) {
	if (process.platform !== 'darwin') {
		return Promise.reject(new Error('Only OS X systems are supported'));
	}

	return pify(execFile, Promise)('osascript', ['-e', str])
		.then(function (stdout) {
			return stdout.trim();
		});
};
