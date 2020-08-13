cordova.define("cordova-plugin-x-socialsharing.SocialSharing", function(require, exports, module) {
function SocialSharing() {
}

// Override this method (after deviceready) to set the location where you want the iPad popup arrow to appear.
// If not overridden with different values, the popup is not used. Example:
//
//   window.plugins.socialsharing.iPadPopupCoordinates = function() {
//     return "100,100,200,300";
//   };
SocialSharing.prototype.iPadPopupCoordinates = function () {
  // left,top,width,height
  return "-1,-1,-1,-1";
};

SocialSharing.prototype.setIPadPopupCoordinates = function (coords) {
  console.log("Deprecated - setIPadPopupCoordinates no longer works since plugin version 5.5.0. See https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin/issues/1052");
  // left,top,width,height
  cordova.exec(function() {}, this._getErrorCallback(function() {}, "setIPadPopupCoordinates"), "SocialSharing", "setIPadPopupCoordinates", [coords]);
};

SocialSharing.prototype.available = function (callback) {
  cordova.exec(function (avail) {
    callback(avail ? true : false);
  }, null, "SocialSharing", "available", []);
};

// this is the recommended way to share as it is the most feature-rich with respect to what you pass in and get back
SocialSharing.prototype.shareWithOptions = function (options, successCallback, errorCallback) {
  cordova.exec(successCallback, this._getErrorCallback(errorCallback, "shareWithOptions"), "SocialSharing", "shareWithOptions", [options]);
};

SocialSharing.prototype.shareW3C = function (sharedata) {
  return new Promise(function(resolve, reject) {
    var options = {
      subject: sharedata.title,
      message: sharedata.text,
      url: sharedata.url,
      iPadCoordinates: sharedata.iPadCoordinates || undefined
    };
    if(sharedata.hasOwnProperty('title') ||
        sharedata.hasOwnProperty('text') ||
        sharedata.hasOwnProperty('url')) {
          cordova.exec(resolve, reject, "SocialSharing", "shareWithOptions", [options]);
    } else {
      reject();
    }
  });
};

SocialSharing.prototype.share = function (message, subject, fileOrFileArray, url, iPadCoordinates, successCallback, errorCallback) {
  if (typeof iPadCoordinates === 'function') {
    errorCallback = successCallback;
    successCallback = iPadCoordinates;
    iPadCoordinates = "";
  }
  cordova.exec(successCallback, this._getErrorCallback(errorCallback, "share"), "SocialSharing", "share", [message, subject, this._asArray(fileOrFileArray), url, iPadCoordinates]);
};

SocialSharing.prototype.shareViaTwitter = function (message, file /* multiple not allowed by twitter */, url, successCallback, errorCallback) {
  var fileArray = this._asArray(file);
  var ecb = this._getErrorCallback(errorCallback, "shareViaTwitter");
  if (fileArray.length > 1) {
    ecb("shareViaTwitter supports max one file");
  } else {
    cordova.exec(successCallback, ecb, "SocialSharing", "shareViaTwitter", [message, null, fileArray, url]);
  }
};

SocialSharing.prototype.shareViaFacebook = function (message, fileOrFileArray, url, successCallback, errorCallback) {
  cordova.exec(successCallback, this._getErrorCallback(errorCallback, "shareViaFacebook"), "SocialSharing", "shareViaFacebook", [message, null, this._asArray(fileOrFileArray), url]);
};

SocialSharing.prototype.shareViaFacebookWithPasteMessageHint = function (message, fileOrFileArray, url, pasteMessageHint, successCallback, errorCallback) {
  pasteMessageHint = pasteMessageHint || "If you like you can paste a message from your clipboard";
  cordova.exec(successCallback, this._getErrorCallback(errorCallback, "shareViaFacebookWithPasteMessageHint"), "SocialSharing", "shareViaFacebookWithPasteMessageHint", [message, null, this._asArray(fileOrFileArray), url, pasteMessageHint]);
};

SocialSharing.prototype.shareViaWhatsApp = function (message, fileOrFileArray, url, successCallback, errorCallback) {
  cordova.exec(successCallback, this._getErrorCallback(errorCallback, "shareViaWhatsApp"), "SocialSharing", "shareViaWhatsApp", [message, null, this._asArray(fileOrFileArray), url, null, null]);
};

SocialSharing.prototype.shareViaWhatsAppToReceiver = function (receiver, message, fileOrFileArray, url, successCallback, errorCallback) {
  cordova.exec(successCallback, this._getErrorCallback(errorCallback, "shareViaWhatsAppToReceiver"), "SocialSharing", "shareViaWhatsApp", [message, null, this._asArray(fileOrFileArray), url, receiver, null]);
};

SocialSharing.prototype.shareViaWhatsAppToPhone = function (phone, message, fileOrFileArray, url, successCallback, errorCallback) {
  cordova.exec(successCallback, this._getErrorCallback(errorCallback, "shareViaWhatsAppToPhone"), "SocialSharing", "shareViaWhatsApp", [message, null, this._asArray(fileOrFileArray), url, null, phone]);
};

SocialSharing.prototype.shareViaSMS = function (options, phonenumbers, successCallback, errorCallback) {
  var opts = options;
  if (typeof options === "string") {
    opts = {"message":options}; // for backward compatibility as the options param used to be the message
  }
  cordova.exec(successCallback, this._getErrorCallback(errorCallback, "shareViaSMS"), "SocialSharing", "shareViaSMS", [opts, phonenumbers]);
};

SocialSharing.prototype.shareViaEmail = function (message, subject, toArray, ccArray, bccArray, fileOrFileArray, successCallback, errorCallback) {
  cordova.exec(successCallback, this._getErrorCallback(errorCallback, "shareViaEmail"), "SocialSharing", "shareViaEmail", [message, subject, this._asArray(toArray), this._asArray(ccArray), this._asArray(bccArray), this._asArray(fileOrFileArray)]);
};

SocialSharing.prototype.canShareVia = function (via, message, subject, fileOrFileArray, url, successCallback, errorCallback) {
  cordova.exec(successCallback, this._getErrorCallback(errorCallback, "canShareVia"), "SocialSharing", "canShareVia", [message, subject, this._asArray(fileOrFileArray), url, via]);
};

SocialSharing.prototype.canShareViaEmail = function (successCallback, errorCallback) {
  cordova.exec(successCallback, this._getErrorCallback(errorCallback, "canShareViaEmail"), "SocialSharing", "canShareViaEmail", []);
};

SocialSharing.prototype.shareViaInstagram = function (message, fileOrFileArray, successCallback, errorCallback) {
  cordova.exec(successCallback, this._getErrorCallback(errorCallback, "shareViaInstagram"), "SocialSharing", "shareViaInstagram", [message, null, this._asArray(fileOrFileArray), null]);
};

SocialSharing.prototype.shareVia = function (via, message, subject, fileOrFileArray, url, successCallback, errorCallback) {
  cordova.exec(successCallback, this._getErrorCallback(errorCallback, "shareVia"), "SocialSharing", "shareVia", [message, subject, this._asArray(fileOrFileArray), url, via]);
};

SocialSharing.prototype.saveToPhotoAlbum = function (fileOrFileArray, successCallback, errorCallback) {
  cordova.exec(successCallback, this._getErrorCallback(errorCallback, "saveToPhotoAlbum"), "SocialSharing", "saveToPhotoAlbum", [this._asArray(fileOrFileArray)]);
};

SocialSharing.prototype._asArray = function (param) {
  if (param == null) {
    param = [];
  } else if (typeof param === 'string') {
    param = new Array(param);
  }
  return param;
};

SocialSharing.prototype._getErrorCallback = function (ecb, functionName) {
  if (typeof ecb === 'function') {
    return ecb;
  } else {
    return function (result) {
      console.log("The injected error callback of '" + functionName + "' received: " + JSON.stringify(result));
    }
  }
};

SocialSharing.install = function () {
  if (!window.plugins) {
    window.plugins = {};
  }

  window.plugins.socialsharing = new SocialSharing();

  // Note only polyfill navigator.share if it is not defined, since shareW3C implements L1 of the spec,
  // and an existing navigator.share method could implement L2.
  if (!navigator.share) {
    navigator.share = window.plugins.socialsharing.shareW3C;
  }

  return window.plugins.socialsharing;
};

cordova.addConstructor(SocialSharing.install);

});
