/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
/* global define, Handlebars  */

define(function(require, exports, module) {
"use strict";
	
	var extensionTitle = "List";
	var extensionID = "perspectiveList";  // ID should be equal to the directory name where the ext. is located   
	var extensionType =  "perspective";
	var extensionIcon = "fa fa-list-ul";
	var extensionVersion = "1.0";
	var extensionManifestVersion = 1;
	var extensionLicense = "AGPL";

	console.log("Loading "+extensionID);

	var TSCORE = require("tscore");

	var extensionDirectory = TSCORE.Config.getExtensionPath()+"/"+extensionID;
	var UI;

	function init() {
		console.log("Initializing perspective "+extensionID);
        require([
            "css!"+extensionDirectory+'/extension.css',
            extensionDirectory+'/datatables/jquery.dataTables.min.js',
            'libs/filesaver.js/FileSaver.js'
            ], function() {
            require([
                    extensionDirectory+'/perspectiveUI.js',
                    "text!"+extensionDirectory+'/toolbar.html',
                    extensionDirectory+'/datatables/natural.js',
                ], function(extUI, toolbarTPL) {

                    var toolbarTemplate = Handlebars.compile( toolbarTPL );
                    UI = new extUI.ExtUI(extensionID);
                    UI.buildUI(toolbarTemplate);

                    // TODO refactor translations
                    var translation = $.i18n.t("ns.perspectiveList:fileExtension");
                    if(translation.length > 0) {
                        $('#'+extensionID+'Container').find("th:contains('File Ext.')").text(translation);
                    }
                    translation = $.i18n.t("ns.perspectiveList:fileTitle");
                    if(translation.length > 0) {
                        $('#'+extensionID+'Container').find("th:contains('Title')").text(translation);
                    }
                    translation = $.i18n.t("ns.perspectiveList:fileTags");
                    if(translation.length > 0) {
                        $('#'+extensionID+'Container').find("th:contains('Tags')").text(translation);
                    }
                    translation = $.i18n.t("ns.perspectiveList:fileSize");
                    if(translation.length > 0) {
                        $('#'+extensionID+'Container').find("th:contains('Size')").text(translation);
                    }
                    translation = $.i18n.t("ns.perspectiveList:fileLDTM");
                    if(translation.length > 0) {
                        $('#'+extensionID+'Container').find("th:contains('Last Modified')").text(translation);
                    }
                    translation = $.i18n.t("ns.perspectiveList:filePath");
                    if(translation.length > 0) {
                        $('#'+extensionID+'Container').find("th:contains('File Path')").text(translation);
                    }
                    translation = $.i18n.t("ns.perspectiveList:fileName");
                    if(translation.length > 0) {
                        $('#' + extensionID + 'Container').find("th:contains('File Name')").text(translation);
                    }

                    $('#'+extensionID+'Toolbar [data-i18n]').i18n();

                    platformTuning();
                }
            );
            }
        );
	}
	
	var platformTuning = function() {
        if(isCordova) {
            $('#'+extensionID+'Export2CSVButton').hide();
        }
        if(isCordova || isChrome || isWeb) {
            $('#'+extensionID+'AddFileButton').hide();
        }
    };
	
	var load = function () {
		console.log("Loading perspective "+extensionID);
        if(UI === undefined) {
            window.setTimeout(function() { UI.reInit(); }, 1000);
        } else {
            UI.reInit();
        }
    };

    var clearSelectedFiles = function() {
        if(UI !== undefined) {
            UI.clearSelectedFiles();
            UI.handleElementActivation();
        }
    };
    
    var removeFileUI = function(filePath) {
        UI.removeFileUI(filePath);
    };    
    
    var updateFileUI = function(oldFilePath, newFilePath) {
        UI.updateFileUI(oldFilePath, newFilePath);
    };     
	
	var getNextFile = function (filePath) {
        return UI.getNextFile(filePath);
	};

	var getPrevFile = function (filePath) {
        return UI.getPrevFile(filePath);
	};
		
	// Vars
	exports.Title 					= extensionTitle;
	exports.ID 						= extensionID;   
	exports.Type 					= extensionType;
	exports.Icon 					= extensionIcon;
	exports.Version 				= extensionVersion;
	exports.ManifestVersion 		= extensionManifestVersion;
	exports.License 				= extensionLicense;
	
	// Methods
	exports.init					= init;
	exports.load					= load;
	exports.clearSelectedFiles		= clearSelectedFiles;
	exports.getNextFile				= getNextFile;
	exports.getPrevFile				= getPrevFile;	
    exports.removeFileUI            = removeFileUI;
    exports.updateFileUI            = updateFileUI;
     	
});