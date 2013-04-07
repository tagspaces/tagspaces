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
	
	    $('#'+extensionID+"FileTable_wrapper").hide();
		
		updateIndexData(TSCORE.fileList);
		
		$( "#"+extensionID+"ReIndexButton" ).button( "enable" );
		TSCORE.hideLoadingAnimation();
	}
	
	var enhanceIndexData = function(index) {
		console.debug("Enhancing directory index...");
	    var enhancedIndex = [];
	    var tags = undefined;
	    var ext = undefined;
	    var title = undefined;
	    var fileSize = undefined;
	    var fileLMDT = undefined;
	    var path = undefined;
	    var filename = undefined;
	    for (var i=0; i < index.length; i++) {
	        if (index[i].type == "file"){  
	            // Considering Unix HiddenEntries (. in the beginning of the filename)
	            if (TSCORE.Config.Settings["showUnixHiddenEntries"] || 
	               (!TSCORE.Config.Settings["showUnixHiddenEntries"] && (index[i].name.indexOf(".") != 0))) {
	                 filename = index[i].name;
	                 path = index[i].path;
	                 tags = TSCORE.TagUtils.extractTags(path);
	                 title = TSCORE.TagUtils.extractTitle(path);
					 ext = TSCORE.TagUtils.extractFileExtension(path)
	                 fileSize = index[i].size;
	                 fileLMDT = index[i].lmdt;
	                 
	                 if(fileSize == undefined) fileSize = "";
	                 if(fileLMDT == undefined) fileLMDT = "";
	                 var entry = [title,tags,fileSize,fileLMDT,path,filename,ext];   
	                 enhancedIndex.push(entry);
	            }
	        }
	    }
	    return enhancedIndex; 		
	}
	
	var updateIndexData = function (index) {
		console.debug("Updating index data.");
	
		// Clearing the old data
	    UI.fileTable.fnClearTable();  
	
	    UI.fileTable.fnAddData( enhanceIndexData(index) );
	    //UI.fileTable.fnAddData(index);
	    
	    
	    UI.fileTable.$('tr')
	    .droppable({
	    	accept: ".tagButton",
	    	hoverClass: "activeRow",
	    	drop: function( event, ui ) {
	    		var tagName = ui.draggable.attr("tag");
	    		var targetFilePath = UI.fileTable.fnGetData( this )[4];
				console.log("Tagging file: "+tagName+" to "+targetFilePath);
		    
			    $(this).toggleClass("ui-selected");
	
			    clearSelectedFiles();
			    TSCORE.selectedFiles.push(targetFilePath); 
				UI.handleElementActivation();
	
				TSCORE.TagUtils.addTag(TSCORE.selectedFiles, [tagName]);
	    	}	            	
	    })
	    .dblclick( function() {
	        console.debug("Opening file...");
	        var rowData = UI.fileTable.fnGetData( this );
	        
	        TSCORE.FileOpener.openFile(rowData[4]); // 4 is the filePath
	    } );     
	    
	    UI.fileTable.$('.fileTitleButton')
	    	.draggable({
	    		cancel:false,
	    		appendTo: "body",
	    		helper: "clone",
	    		revert: true,
		        start: function() {
	                selectFile(this, $(this).attr("filepath"));
		        }    		
	    	})  
	        .click( function() {
	            selectFile(this, $(this).attr("filepath"));
	        } )        
	        .dropdown( 'attach' , '#fileMenu' );   
	    
	    UI.fileTable.$('.extTagButton')
	        .click( function() {
	        	selectFile(this, $(this).attr("fileName"));
	            TSCORE.openTagMenu(this, $(this).attr("tag"), $(this).attr("filepath"));
	        } )
	        .dropdown( 'attach' , '#extensionMenu' );               
	    
	    UI.fileTable.$('.tagButton')
	        .click( function() {
	            selectFile(this, $(this).attr("fileName"));
	            TSCORE.openTagMenu(this, $(this).attr("tag"), $(this).attr("filepath"));
	        } )     
	        .dropdown( 'attach' , '#tagMenu' );
	
	    $('#'+extensionID+"FileTable_wrapper").show();  
	     
	    $( "#"+extensionID+"ReIndexButton" ).button( "enable" );
	    
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
		
	var selectFile = function(tagButton, filePath) {
	    clearSelectedFiles();    
	    $(tagButton).parent().parent().toggleClass("ui-selected");
	    TSCORE.selectedFiles.push(filePath);  
		UI.handleElementActivation();      
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
	exports.updateIndexData			= updateIndexData;
	exports.setFileFilter			= setFileFilter;
	exports.clearSelectedFiles		= clearSelectedFiles;
	exports.getNextFile				= getNextFile;
	exports.getPrevFile				= getPrevFile;
	
});