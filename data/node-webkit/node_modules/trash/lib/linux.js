'use strict';
var path = require('path');
var fsExtra = require('fs-extra');
var pify = require('pify');
var Promise = require('pinkie-promise');
var uuid = require('uuid');
var xdgTrashdir = require('xdg-trashdir');
var fs = pify(fsExtra, Promise);

function trash(src) {
	return xdgTrashdir(src).then(function (dir) {
		var name = uuid.v4();
		var dest = path.join(dir, 'files', name);
		var info = path.join(dir, 'info', name + '.trashinfo');
		var msg = [
			'[Trash Info]',
			'Path=' + src.replace(/\s/g, '%20'),
			'DeletionDate=' + new Date().toISOString()
		].join('\n');

		return Promise.all([
			fs.move(src, dest, {mkdirp: true}),
			fs.outputFile(info, msg)
		]).then(function () {
			return {
				path: dest,
				info: info
			};
		});
	});
}

module.exports = function (paths) {
	return Promise.all(paths.map(trash));
};
