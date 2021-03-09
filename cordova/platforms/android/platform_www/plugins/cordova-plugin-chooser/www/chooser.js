cordova.define("cordova-plugin-chooser.Chooser", function(require, exports, module) {
/** @see sodiumutil */
function from_base64 (sBase64, nBlocksSize) {
	function _b64ToUint6 (nChr) {
		return nChr > 64 && nChr < 91 ?
			nChr - 65 :
		nChr > 96 && nChr < 123 ?
			nChr - 71 :
		nChr > 47 && nChr < 58 ?
			nChr + 4 :
		nChr === 43 ?
			62 :
		nChr === 47 ?
			63 :
			0;
	}

	var nInLen = sBase64.length;
	var nOutLen = nBlocksSize ?
		Math.ceil(((nInLen * 3 + 1) >> 2) / nBlocksSize) * nBlocksSize :
		(nInLen * 3 + 1) >> 2;
	var taBytes = new Uint8Array(nOutLen);

	for (
		var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0;
		nInIdx < nInLen;
		nInIdx++
	) {
		nMod4 = nInIdx & 3;
		nUint24 |= _b64ToUint6(sBase64.charCodeAt(nInIdx)) << (18 - 6 * nMod4);
		if (nMod4 === 3 || nInLen - nInIdx === 1) {
			for (
				nMod3 = 0;
				nMod3 < 3 && nOutIdx < nOutLen;
				nMod3++, nOutIdx++
			) {
				taBytes[nOutIdx] = (nUint24 >>> ((16 >>> nMod3) & 24)) & 255;
			}
			nUint24 = 0;
		}
	}

	return taBytes;
}

function getFileInternal (
	accept,
	includeData,
	successCallback,
	failureCallback
) {
	if (typeof accept === 'function') {
		failureCallback = successCallback;
		successCallback = accept;
		accept = undefined;
	}

	var result = new Promise(function (resolve, reject) {
		cordova.exec(
			function (json) {
				if (json === 'RESULT_CANCELED') {
					resolve();
					return;
				}

				try {
					var o = JSON.parse(json);

					if (includeData) {
						var base64Data = o.data.replace(
							/[^A-Za-z0-9\+\/]/g,
							''
						);

						o.data = from_base64(base64Data);
						o.dataURI =
							'data:' + o.mediaType + ';base64,' + base64Data;
					}
					else {
						delete o.data;
					}

					resolve(o);
				}
				catch (err) {
					reject(err);
				}
			},
			reject,
			'Chooser',
			'getFile',
			[
				(typeof accept === 'string' ?
					accept.toLowerCase().replace(/\s/g, '') :
					undefined) || '*/*',
				includeData
			]
		);
	});

	if (typeof successCallback === 'function') {
		result.then(successCallback);
	}
	if (typeof failureCallback === 'function') {
		result.catch(failureCallback);
	}

	return result;
}

module.exports = {
	getFile: function (accept, successCallback, failureCallback) {
		return getFileInternal(accept, true, successCallback, failureCallback);
	},
	getFileMetadata: function (accept, successCallback, failureCallback) {
		return getFileInternal(accept, false, successCallback, failureCallback);
	}
};

});
