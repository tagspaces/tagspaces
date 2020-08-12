cordova.define("com.whebcraft.cordova.plugin.downloader.Downloader", function(require, exports, module) {
var Downloader = {
    download: function (arguments, successCallback, errorCallback) {
        cordova.exec(
			successCallback,
			errorCallback,
			'Downloader',
			'download',
			[arguments]
		);
    }
};

function install() {
    if (!window.plugins) {
        window.plugins = {};
    }

    window.plugins.Downloader = Downloader;
    return window.plugins.Downloader;
};

cordova.addConstructor(install);

});
