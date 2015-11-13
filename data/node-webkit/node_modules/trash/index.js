'use strict';
var path = require('path');
var pathExists = require('path-exists');

module.exports = function (paths) {
	if (!Array.isArray(paths)) {
		return Promise.reject(new TypeError('Expected an array'));
	}

	if (paths.length === 0) {
		return Promise.resolve();
	}

	paths = paths.map(function (x) {
		return path.resolve(String(x));
	}).filter(function (x) {
		return pathExists.sync(x);
	});

	if (process.platform === 'darwin') {
		return require('./lib/osx')(paths);
	}

	if (process.platform === 'win32') {
		return require('./lib/win')(paths);
	}

	return require('./lib/linux')(paths);
};
