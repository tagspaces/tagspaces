/* Copyright (c) 2013 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";
	
	console.log("Loading perspectiveThumb");

    var extensionTitle = "Grid"
    var extensionID = "perspectiveThumb";  // ID should be equal to the directory name where the ext. is located   
    var extensionType =  "perspective";
    var extensionIcon = "icon-th";
    var extensionVersion = "1.0";
    var extensionManifestVersion = 1;
    var extensionLicense = "AGPL";
	
	var TSCORE = require("tscore");

    var extensionDirectory = TSCORE.Config.getExtensionPath()+"/"+extensionID;
    var UI = undefined; 

	var init = function () {
        console.log("Initializing perspective "+extensionID);
        require([
            extensionDirectory+'/perspectiveUI.js',
            'datatables'
            ], function(extUI) {
                UI = new extUI.ExtUI(extensionID);                          
                UI.buildUI();
            }
        );
	}
	
	var load = function () {
        console.log("Loading perspective "+extensionID);
        if(UI != undefined) {
            UI.reInit(TSCORE.fileList);    
            TSCORE.hideLoadingAnimation();                                  
        }
	    TSCORE.hideLoadingAnimation();     
	}
	
    var getNextFile = function (filePath) {
        return UI.getNextFile(filePath);
    }

    var getPrevFile = function (filePath) {
        return UI.getPrevFile(filePath);
    }	
	
	var setFileFilter = function (filter) {
	    UI.setFilter(filter);
		console.log("setFileFilter not implemented in "+exports.ID);
	}
	
	var clearSelectedFiles = function() {
        TSCORE.selectedFiles = [];   
        $("#"+extensionID+"Container").find(".ui-selected")
            .removeClass("ui-selected");
        $("#"+extensionID+"Container").find(".fileTileSelector").find("i")
            .removeClass("icon-check")
            .addClass("icon-check-empty");
	}

    // Vars
    exports.Title                   = extensionTitle;
    exports.ID                      = extensionID;   
    exports.Type                    = extensionType;
    exports.Icon                    = extensionIcon;
    exports.Version                 = extensionVersion;
    exports.ManifestVersion         = extensionManifestVersion;
    exports.License                 = extensionLicense;
    
    // Methods
    exports.init                    = init;
    exports.load                    = load;
    exports.setFileFilter           = setFileFilter;
    exports.clearSelectedFiles      = clearSelectedFiles;
    exports.getNextFile             = getNextFile;
    exports.getPrevFile             = getPrevFile;	
	
});