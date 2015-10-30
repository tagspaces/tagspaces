'use strict';
var childProcess = require('child_process');

function run(args, cb) {
	childProcess.execFile('df', args, function (err, stdout) {
		if (err) {
			cb(err);
			return;
		}

		cb(null, stdout.trim().split('\n').slice(1).map(function (el) {
			var cl = el.split(/\s+(?=[\d\/])/);

			return {
				filesystem: cl[0],
				size: parseInt(cl[1], 10) * 1024,
				used: parseInt(cl[2], 10) * 1024,
				available: parseInt(cl[3], 10) * 1024,
				capacity: parseInt(cl[4], 10) / 100,
				mountpoint: cl[5]
			};
		}));
	});
};

var df = module.exports = function (cb) {
	run(['-kP'], cb);
};

df.fs = function (name, cb) {
	if (typeof name !== 'string') {
		throw new Error('name required');
	}

	run(['-kP'], function (err, data) {
		if (err) {
			cb(err);
			return;
		}

		var ret;

		data.forEach(function (el) {
			if (el.filesystem === name) {
				ret = el;
			}
		});

		cb(null, ret);
	});
};

df.file = function (file, cb) {
	if (typeof file !== 'string') {
		throw new Error('file required');
	}

	run(['-kP', file], function (err, data) {
		if (err) {
			cb(err);
			return;
		}

		cb(null, data[0]);
	});
};
