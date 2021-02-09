/*global cordova, module*/

module.exports = {
    filePicker: {
        single: function (config) {
            var successCallback = config.success || function(){};
            var errorCallback = config.error || function(){};
            var startupPath = config.startupPath || "default";

            cordova.exec(function(files){
                if(typeof(successCallback) == "function"){
                    successCallback(JSON.parse(files));
                }
            }, errorCallback, "Filebrowser", "showPicker", [{
                "start_directory": startupPath
            }]);
        },
        multi: function (config) {
            var successCallback = config.success || function(){};
            var errorCallback = config.error || function(){};
            var startupPath = config.startupPath || "default";

            cordova.exec(function(files){
                if(typeof(successCallback) == "function"){
                    successCallback(JSON.parse(files));
                }
            }, errorCallback, "Filebrowser", "showMultiFilepicker", [{
                "start_directory": startupPath
            }]);
        }
    },
    folderPicker: {
        single: function (config) {
            var successCallback = config.success || function(){};
            var errorCallback = config.error || function(){};
            var startupPath = config.startupPath || "default";

            cordova.exec(function(files){
                if(typeof(successCallback) == "function"){
                    successCallback(JSON.parse(files));
                }
            }, errorCallback, "Filebrowser", "showFolderpicker", [{
                "start_directory": startupPath
            }]);
        },
        multi: function (config) {
            var successCallback = config.success || function(){};
            var errorCallback = config.error || function(){};
            var startupPath = config.startupPath || "default";

            cordova.exec(function(files){
                if(typeof(successCallback) == "function"){
                    successCallback(JSON.parse(files));
                }
            }, errorCallback, "Filebrowser", "showMultiFolderpicker", [{
                "start_directory": startupPath
            }]);
        }
    },
    mixedPicker: function(config) {
        var successCallback = config.success || function(){};
        var errorCallback = config.error || function(){};
        var startupPath = config.startupPath || "default";

        cordova.exec(function(files){
            if(typeof(successCallback) == "function"){
                successCallback(JSON.parse(files));
            }
        }, errorCallback, "Filebrowser", "showMixedPicker", [{
            "start_directory": startupPath
        }]);
    },
    createFileDialog: function(config){
        var successCallback = config.success || function(){};
        var errorCallback = config.error || function(){};
        var startupPath = config.startupPath || "default";

        cordova.exec(function(files){
            if(typeof(successCallback) == "function"){
                successCallback(JSON.parse(files));
            }
        }, errorCallback, "Filebrowser", "showCreatefile", [{
            "start_directory": startupPath
        }]);
    }
};
