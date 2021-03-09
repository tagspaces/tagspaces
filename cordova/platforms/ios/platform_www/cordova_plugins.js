cordova.define('cordova/plugin_list', function(require, exports, module) {
  module.exports = [
    {
      "id": "com.whebcraft.cordova.plugin.downloader.Downloader",
      "file": "plugins/com.whebcraft.cordova.plugin.downloader/www/Downloader.js",
      "pluginId": "com.whebcraft.cordova.plugin.downloader",
      "clobbers": [
        "plugins.Downloader"
      ]
    }
  ];
  module.exports.metadata = {
    "com.whebcraft.cordova.plugin.downloader": "0.1.0"
  };
});