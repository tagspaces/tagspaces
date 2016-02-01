'use strict';
module.exports = function (str) {
	return typeof str === 'string' ? str.replace(/[\\"]/g, '\\$&') : str;
};
