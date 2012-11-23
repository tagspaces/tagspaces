/* global exports: false, require: false, console: false */
/* jslint onevar: false */
// Released under the MIT/X11 license
// http://www.opensource.org/licenses/mit-license.php
"use strict";
// ==============================================================
var Cc = require("chrome").Cc;
var Ci = require("chrome").Ci;
// just for JSLINT var Cc, Ci = {};
var promptTitle = "Bugzilla Triage Script";

/**
 * shows the text in a simple window
 *
 * @return none
 */
exports.alert = function alert(msg) {
  var prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"]
      .getService(Ci.nsIPromptService);
  prompts.alert(null, promptTitle, msg);
};

/**
 * general prompts for a string method
 *
 * @return String with the password
 */
exports.prompt = function prompt(prompt, defaultValue) {
  var stringValue = {
    value : defaultValue ? defaultValue : ""
  };

  var prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"]
      .getService(Ci.nsIPromptService);
  var result = prompts.prompt(null, promptTitle, prompt,
      stringValue, null, {});
  if (result) {
    return stringValue.value;
  }
  else {
    return null;
  }
};

/**
 * returns password with a special password
 *
 * @return String with the password
 */
exports.promptPassword = function promptPassword(prompt) {
  if (!prompt) { // either undefined or null
    prompt = "Enter password:";
  }
  var prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"]
      .getService(Ci.nsIPromptService);
  var password = {
    value : ""
  }; // default the password to pass
  var check = {
    value : true
  }; // default the checkbox to true
  var result = prompts.promptPassword(null,
      "Bugzilla Triage Script", prompt, password, null, check);
  // result is true if OK was pressed, false if cancel was pressed.
  // password.value is set if OK was pressed.
  // The checkbox is not displayed.
  if (result) {
    return password.value ? password.value : null;
  }
  else {
    return null;
  }
};

/**
 * YES/NO prompt; returns boolean or null (for Cancel)
 * https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIPromptService
 */
exports.promptYesNoCancel = function promptOKNoCancel(prompt) {
  if (!prompt) { // either undefined or null
    throw new Error("Prompt is required!");
  }
  var prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"]
      .getService(Ci.nsIPromptService);

  var result = prompts.confirmEx(null, "Bugzilla Triage Script",
      prompt, prompts.STD_YES_NO_BUTTONS, null, null, null,
      null, {});
  if (result === 0) {
    return true;
  }
  else if (result === 1) {
    return false;
  }
  else {
    return null;
  }
};

/**
 *
 * documentation is https://developer.mozilla.org/en/NsIFilePicker
 */
exports.promptFileOpenPicker = function promptFilePicker(win) {
  var window = require("window-utils").activeWindow;
  var fp = Cc["@mozilla.org/filepicker;1"]
      .createInstance(Ci.nsIFilePicker);
  fp.init(window, "JSON File Open", Ci.nsIFilePicker.modeOpen);
  fp.appendFilter("JSON files", "*.json");
  fp.appendFilters(Ci.nsIFilePicker.filterAll);
  fp.filterIndex = 0;
  var res = fp.show();

  if (res === Ci.nsIFilePicker.returnOK
      || res === Ci.nsIFilePicker.returnReplace) {
    return fp.file.path;
  }
  return null;
};
