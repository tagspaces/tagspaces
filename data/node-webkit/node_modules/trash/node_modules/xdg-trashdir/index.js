'use strict';
var fs = require('fs');
var path = require('path');
var mountPoint = require('mount-point');
var userHome = require('user-home');
var xdgBasedir = require('xdg-basedir');
var pify = require('pify');
var Promise = require('pinkie-promise');
var mntPoint = pify(mountPoint);

module.exports = function (file) {
	if (process.platform !== 'linux') {
		return Promise.reject(new Error('Only Linux systems are supported'));
	}

	if (!file) {
		return Promise.resolve(path.join(xdgBasedir.data, 'Trash'));
	}

	return Promise.all([
		mntPoint(userHome),
		mntPoint(file)
	]).then(function (result) {
		var ret = result[0];
		var res = result[1];

		if (ret.mount === res.mount) {
			return path.join(xdgBasedir.data, 'Trash');
		}

		var top = path.join(res.mount, '.Trash');
		var topuid = top + '-' + process.getuid();
		var stickyBitMode = 17407;

		return pify(fs.lstat)(top)
			.then(function (stats) {
				if (stats.isSymbolicLink() || stats.mode !== stickyBitMode) {
					return topuid;
				}

				return path.join(top, String(process.getuid()));
			})
			.catch(function (err) {
				if (err.code === 'ENOENT') {
					return topuid;
				}

				return path.join(xdgBasedir.data, 'Trash');
			});
	});
};
