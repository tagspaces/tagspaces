'use strict';
var os = require('os');
var path = require('path');
var execFile = require('child_process').execFile;
var escapeStringApplescript = require('escape-string-applescript');
var runApplescript = require('run-applescript');
var pify = require('pify');
var Promise = require('pinkie-promise');
var olderThanMountainLion = Number(os.release().split('.')[0]) < 12;
var bin = path.join(__dirname, 'osx-trash');

function legacy(paths) {
	var script =
		'set deleteList to {}\n' +
		'repeat with currentPath in {' + paths.map(function (el) {
			return '"' + escapeStringApplescript(el) + '"';
		}).join(',') + '}\n' +
		'set end of deleteList to POSIX file currentPath\n' +
		'end repeat\n' +
		'tell app "Finder" to delete deleteList';

	return runApplescript(script)
		.catch(function (err) {
			if (/10010/.test(err.message)) {
				throw new Error('Item doesn\'t exist');
			}

			throw err;
		});
}

module.exports = function (paths) {
	if (olderThanMountainLion) {
		return legacy(paths);
	}

	return pify(execFile, Promise)(bin, paths);
};
