cordova.define("com-darryncampbell-cordova-plugin-intent.IntentShim", function(require, exports, module) {
var argscheck = require('cordova/argscheck'),
    channel = require('cordova/channel'),
    utils = require('cordova/utils'),
    exec = require('cordova/exec'),
    cordova = require('cordova');


/**
 * This represents a thin shim layer over the Android Intent implementation
 * @constructor
 */
function IntentShim() {
    var me = this;
}

IntentShim.prototype.ACTION_SEND = "android.intent.action.SEND";
IntentShim.prototype.ACTION_VIEW= "android.intent.action.VIEW";
IntentShim.prototype.ACTION_INSTALL_PACKAGE="android.intent.action.INSTALL_PACKAGE";
IntentShim.prototype.ACTION_UNINSTALL_PACKAGE= "android.intent.action.UNINSTALL_PACKAGE";
IntentShim.prototype.EXTRA_TEXT = "android.intent.extra.TEXT";
IntentShim.prototype.EXTRA_SUBJECT = "android.intent.extra.SUBJECT";
IntentShim.prototype.EXTRA_STREAM = "android.intent.extra.STREAM";
IntentShim.prototype.EXTRA_EMAIL = "android.intent.extra.EMAIL";
IntentShim.prototype.ACTION_CALL = "android.intent.action.CALL";
IntentShim.prototype.ACTION_SENDTO = "android.intent.action.SENDTO";
//  StartActivityForResult
IntentShim.prototype.ACTION_GET_CONTENT = "android.intent.action.GET_CONTENT";
IntentShim.prototype.ACTION_PICK = "android.intent.action.PICK";
IntentShim.prototype.RESULT_CANCELED = 0; //  Activity.RESULT_CANCELED
IntentShim.prototype.RESULT_OK = -1; //  Activity.RESULT_OK

IntentShim.prototype.startActivity = function(params, successCallback, errorCallback) {
    argscheck.checkArgs('off', 'IntentShim.startActivity', arguments);
    exec(successCallback, errorCallback, "IntentShim", "startActivity", [params]);
};

IntentShim.prototype.startActivityForResult = function(params, successCallback, errorCallback) {
    argscheck.checkArgs('off', 'IntentShim.startActivityForResult', arguments);
    exec(successCallback, errorCallback, "IntentShim", "startActivityForResult", [params]);
};

IntentShim.prototype.sendBroadcast = function(params, successCallback, errorCallback) {
    argscheck.checkArgs('off', 'IntentShim.sendBroadcast', arguments);
    exec(successCallback, errorCallback, "IntentShim", "sendBroadcast", [params]);
};

IntentShim.prototype.startService = function(params, successCallback, errorCallback) {
    argscheck.checkArgs('off', 'IntentShim.startService', arguments);
    exec(successCallback, errorCallback, "IntentShim", "startService", [params]);
};

IntentShim.prototype.registerBroadcastReceiver = function(params, callback) {
    argscheck.checkArgs('of', 'IntentShim.registerBroadcastReceiver', arguments);
    exec(callback, null, "IntentShim", "registerBroadcastReceiver", [params]);
};

IntentShim.prototype.unregisterBroadcastReceiver = function() {
    argscheck.checkArgs('', 'IntentShim.unregisterBroadcastReceiver', arguments);
    exec(null, null, "IntentShim", "unregisterBroadcastReceiver", []);
};

IntentShim.prototype.onIntent = function(callback) {
    argscheck.checkArgs('f', 'IntentShim.onIntent', arguments);
    exec(callback, null, "IntentShim", "onIntent", [callback]);
};

IntentShim.prototype.onActivityResult = function(callback) {
    argscheck.checkArgs('f', 'IntentShim.onActivityResult', arguments);
    exec(callback, null, "IntentShim", "onActivityResult", [callback]);
};

IntentShim.prototype.getIntent = function(successCallback, failureCallback) {
    argscheck.checkArgs('ff', 'IntentShim.getIntent', arguments);
    exec(successCallback, failureCallback, "IntentShim", "getIntent", []);
};

IntentShim.prototype.sendResult = function(params, callback) {
    argscheck.checkArgs('of', 'IntentShim.sendResult', arguments);
    exec(callback, null, "IntentShim", "sendResult", [params]);
}

IntentShim.prototype.realPathFromUri = function(params, successCallback, errorCallback) {
    argscheck.checkArgs('off', 'IntentShim.realPathFromUri', arguments);
    exec(successCallback, errorCallback, "IntentShim", "realPathFromUri", [params]);
};

window.intentShim = new IntentShim();
window.plugins = window.plugins || {};
window.plugins.intentShim = window.intentShim;
});
