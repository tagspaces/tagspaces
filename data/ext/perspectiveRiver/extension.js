/* Copyright (c) 2013 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";
	
	console.log("Loading perspectiveRiver");
	
	exports.Title = "River View"
	exports.ID = "perspectiveRiver";  // ID should be equal to the directory name where the ext. is located   
	exports.Type =  "perspective";
	exports.Icon = "icon-film";

	var TSCORE = require("tscore");
	
	var viewContainer = undefined;
	var viewToolbar = undefined;
	var viewFooter = undefined;
	
	exports.init = function init() {
		console.log("Initializing View "+exports.ID);
		
	    viewContainer = $("#"+exports.ID+"Container");
	    viewToolbar = $("#"+exports.ID+"Toolbar");
		viewFooter = $("#"+exports.ID+"Footer");
		
		viewContainer.empty();
		viewToolbar.empty();
		viewFooter.empty();	
		
	    viewToolbar.append($("<button>", { 
	        text: "New",
			disabled: true,
	        title: "Create new file",
	        id: exports.ID+"CreateFileButton",    
	    }));
	
	    viewContainer.append($("<div>", { 
	        style: "width: 100%",
	        id: exports.ID+"RV",
	    }));	
		
	    initButtons();
	}
	
	exports.load = function load() {
		console.log("Showing View "+exports.ID);
	   
		// Purging the thumbnail view, avoiding memory leak
		// document.getElementById(exports.ID+"SelectableFiles").innerHTML = "";
	
	    $("#"+exports.ID+"RV").empty();
	    var tagsHTML = undefined;
	    for (var i=0; i < TSCORE.fileList.length; i++) {
	        if(i > 10) break;
	        tagsHTML = "";
	        var fileName = TSCORE.fileList[i][0];
	        var filePath = TSCORE.currentPath+"/"+fileName;
	        // TODO sanitize html
	        //tagsHTML += '<iframe id="idFrameViewer" style="width: 100%; height: 150px;" src="'+'file:///'+filePath+'" />';
	        //$("#"+exports.ID+"RV").append(tagsHTML);
	    }
	
	    TSCORE.hideLoadingAnimation();     
	}
	
	exports.setFileFilter = function setFileFilter(filter) {
		console.log("setFileFilter not implemented in "+exports.ID);
	}
	
	exports.clearSelectedFiles = function() {
	    // TODO Deselect all
	}
	
	var initButtons = function() {
	    $( "#"+exports.ID+"CreateFileButton" )
	    .click(function() {
	        TSCORE.showFileCreateDialog();
	    });  
	}
});