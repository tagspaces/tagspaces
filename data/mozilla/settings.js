/* Copyright (c) 2012-2014 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
/* jshint moz: true, strict: false */
/* global exports */

const prefs = require('sdk/preferences/service'); // preferences-service
  
const PREF_PREFIX = 'extensions.tagspaces.';

function save(field, value) {
    if (typeof value != 'undefined' && value != null) {
        prefs.set(PREF_PREFIX + field, value);
    }
}

function get(field) {
    var value = prefs.get(PREF_PREFIX + field);
    return value;
}	

exports.loadSettings = function loadSettings(worker) {
    console.log("Loading setting...");
    try {   
        var content = get("settings");
        console.log("Content: "+content);
        worker.postMessage({
                "command": "loadSettings",
                "content": content,
                "success": true
            });     
        console.log("Loading settings successful!");      
    } catch(ex) {
        worker.postMessage({
                "command": "loadSettings",
                "success": false    
            });
        console.error("Loading settings failed "+ex);
    }   
};

exports.saveSettings = function saveSettings(content, worker) {
    console.log("Saving setting...");
    try {   
        save("settings", content);
        worker.postMessage({
                "command": "saveSettings",
                "success": true
            });     
        console.log("Saving settings successful!");      
    } catch(ex) {
        worker.postMessage({
                "command": "saveSettings",
                "success": false    
            });
        console.error("Saving settings failed "+ex);
    }   
};