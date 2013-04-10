/* Copyright (c) 2012-2013 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";
	
	var extensionTitle = "Default"
	var extensionID = "perspectiveDefault";  // ID should be equal to the directory name where the ext. is located   
	var extensionType =  "view";
	var extensionIcon = "ui-icon-tag";
	var extensionVersion = "1.0";
	var extensionManifestVersion = 1;
	var extensionLicense = "AGPL";

	console.debug("Loading "+extensionID);

	var TSCORE = require("tscore");

	var extensionDirectory = TSCORE.Config.getExtensionPath()+"/"+extensionID;
	var UI = undefined;	

	function init() {
		console.debug("Initializing perspective "+extensionID);

		// TODO use css require extension for loading 'css!datatablescss' 
		require([
			extensionDirectory+'/perspectiveUI',
			'datatables'
		 	], function(extUI) {
				UI = new extUI.ExtUI(extensionID);							
				UI.buildUI();
				UI.initTable();
				UI.initFileFilter();	
	    		UI.initButtons();					
		});
	}
	
	var load = function () {
		console.debug("Loading perspective "+extensionID);

		UI.reInitTableWithData(TSCORE.fileList);	    

		TSCORE.hideLoadingAnimation();
	}
	
	var setFileFilter = function (filter) {
		$( "#"+extensionID+"FilterBox").val(filter);
		UI.fileTable.fnFilter(filter);
	}
	
	var clearSelectedFiles = function() {
	    TSCORE.selectedFiles = [];   
	    $('#'+extensionID+'FileTable tbody tr').each(function(){
	        $(this).removeClass('ui-selected');
	    });	
	}
	
	var getNextFile = function (filePath) {
		var nextFilePath = undefined;
		var data = UI.fileTable._('tr', {"filter":"applied"});
		data.forEach(function(entry, index) {
    		if(entry[4] == filePath) {
    			var nextIndex = index+1;
    			if(nextIndex < data.length) {
    				nextFilePath = data[nextIndex][4];	    				
    			} else {
    				nextFilePath = data[0][4];
    			}    			
    		}    		
    		console.log("Path: "+entry[4]);
		});
		console.debug("Next file: "+nextFilePath);
		return nextFilePath;
	}

	var getPrevFile = function (filePath) {
		var prevFilePath = undefined;
		var data = UI.fileTable._('tr', {"filter":"applied"});
		data.forEach(function(entry, index) {
    		if(entry[4] == filePath) {
    			var prevIndex = index-1;
    			if(prevIndex >= 0) {
    				prevFilePath = data[prevIndex][4];	    				
    			} else {
    				prevFilePath = data[data.length-1][4];
    			}
    		}    		
    		console.log("Path: "+entry[4]);
		});
		console.debug("Prev file: "+prevFilePath);
		return prevFilePath;
	}	
		
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
	exports.setFileFilter			= setFileFilter;
	exports.clearSelectedFiles		= clearSelectedFiles;
	exports.getNextFile				= getNextFile;
	exports.getPrevFile				= getPrevFile;
	
});