'use strict';

var df = require('@sindresorhus/df');

module.exports = function (file, cb) {
	df.file(file, function (err, data) {
		if (err) {
			cb(err);
			return;
		}

		cb(null, {
			fs: data.filesystem,
			size: data.size,
			used: data.used,
			available: data.available,
			percent: data.capacity,
			mount: data.mountpoint
		});
	});
};
