/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";
	
	console.debug("Loading perspectiveSearch");
	
	exports.Title = "Search"
	exports.ID = "perspectiveSearch";  // ID should be equal to the directory name where the ext. is located   
	exports.Type =  "view";
	exports.Icon = "ui-icon-search";
	exports.Version = "1.0";
	exports.ManifestVersion = 1;
	exports.License = "AGPL";
	
	var TSCORE = require("tscore");
	require('datatables');
	//require('css!datatablescss');
	
	var viewContainer = undefined;
	var viewToolbar = undefined;
	var viewFooter = undefined;
	
	var fileTable = undefined;
	var viewMode = "files" // tags
	
	exports.init = function init() {
		console.debug("Initializing View "+exports.ID);
		
	    viewContainer = $("#"+exports.ID+"Container");
	    viewToolbar = $("#"+exports.ID+"Toolbar");
		viewFooter = $("#"+exports.ID+"Footer");
		
		viewContainer.empty();
		viewToolbar.empty();
		viewFooter.empty();	
			
	    viewToolbar.append($("<button>", { 
	        text: "ReIndex",
			disabled: true,
	        title: "Reindex current favorite folder.",
	        id: exports.ID+"ReIndexButton",    
	    }));	
	    
	    viewToolbar.append($("<button>", { 
	        text: "Tag",
			disabled: true,
	        title: "TagSelectedFiles",
	        id: exports.ID+"TagButton",    
	    }));    
	    
	    viewToolbar.append($("<span>", { 
	    	style: "float: right; margin: 0px; padding: 0px;",
	    }).append($("<input>", { 
			type: "filter",
			// autocomplete: "off", // Error: cannot call methods on autocomplete prior to initialization; attempted to call method 'off' 
	        title: "This filter applies to current directory without subdirectories.",
	        id: exports.ID+"FilterBox",    
	    })));
	
	    viewContainer.append($("<table>", { 
			cellpadding: "0",
			cellspacing: "0",
			border: "0",
			style: "width: 100%",
	        id: exports.ID+"FileTable",    
	    })); 
	
	
		// Column order in json [title(0),tags(1),fileSize(2),fileLMDT(3),path(4),filename(5),extension(6)];
	    fileTable = $('#'+exports.ID+"FileTable").dataTable( {
	        "bJQueryUI": false,
	        "bPaginate": false,
	        "bLengthChange": false,
	        "bFilter": true,
	        "bSort": true,
	        "bInfo": false,
	        "bAutoWidth": false,
	        "aoColumns": [
	            { "sTitle": "Title", "sClass": "right" },
	            { "sTitle": "Tags" },            
	            { "sTitle": "Size(bytes)" },
	            { "sTitle": "Date Modified" },
	            { "sTitle": "Path" },
	        ],         
	        "aoColumnDefs": [
	            { // Title column
	                "mRender": function ( data, type, row ) { return TSCORE.buttonizeTitle(data,row[0],row[4]) },
	                "aTargets": [ 0 ]
	            }, 
	            { // Tags column
	                "mRender": function ( data, type, row ) { return TSCORE.generateTagButtons(data,row[6],row[5],row[4]) },
	                "aTargets": [ 1 ]
	            }, 
	            { // Filesize column
	                "mRender": function ( data, type, row ) { return TSCORE.TagUtils.formatFileSize(data) },
	                "aTargets": [ 2 ]
	            },
	            { // Last changed date column
	                "mRender": function ( data, type, row ) { return TSCORE.TagUtils.formatDateTime(data, true) },
	                "aTargets": [ 3 ]
	            },
	//            { "bVisible": false,  "aTargets": [ 5 ] },
	//            { "bSearchable": false,  "aTargets": [ 0 ] },
	//            { "sClass": "center", "aTargets": [ 0 ] }
	         ]
	    } );           
	   
	
	    // Disable alerts in datatable
	    fileTable.dataTableExt.sErrMode = 'throw';
	
	    // Makes the body of the fileTable selectable
	    $("tbody", $(fileTable)).selectable({
	      filter: 'tr',
	      start: function() {
	        console.debug("Start selecting");  
	        
	        //Hiding all dropdown menus
			$('BODY')
				.find('.dropdown-menu').hide().end()
				.find('[data-dropdown]').removeClass('dropdown-open');
				            
			exports.clearSelectedFiles();
	      },
	      stop: function(){
	        $(".ui-selected", this).each(function(){
	            var rowData = fileTable.fnGetData( this );
	            // Add the filename which is located in the first column to the list of selected filenames
	            TSCORE.selectedFiles.push(rowData[4]);
	    		handleElementActivation();               
	          });
	        console.debug("Selected files: "+TSCORE.selectedFiles);
	      }
	    })
	    
	    // Filter functionality
	    $("#"+exports.ID+"FilterBox").keyup(function() {
	        fileTable.fnFilter(this.value);
	        console.debug("Filter to value: "+this.value);
	    });  
	    
	    $('#'+exports.ID+"FilterBox").wrap('<span id="resetFilter" />').after($('<span/>').click(function() {
	        $(this).prev('input').val('').focus();
	        fileTable.fnFilter( "" );  
	    }));    
	
	    initButtons();
	}
	
	exports.load = function load() {
		console.debug("Loading View "+exports.ID);
	
	    $('#'+exports.ID+"FileTable_wrapper").hide();
	    
	    // Purging file table
	    fileTable.fnClearTable();  
		
		$( "#"+exports.ID+"ReIndexButton" ).button( "enable" );
		TSCORE.hideLoadingAnimation();
	//    $( "#"+exports.ID+"ReIndexButton" ).button( "disable" );
	//	TSCORE.IO.createDirectoryIndex(TSCORE.currentPath);
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
	
	exports.updateIndexData = function updateIndexData(index) {
		console.debug("Updating index data.");
	
		// Clearing the old data
	    fileTable.fnClearTable();  
	
	    fileTable.fnAddData( enhanceIndexData(index) );
	    
	    fileTable.$('tr')
	    .droppable({
	    	accept: ".tagButton",
	    	hoverClass: "activeRow",
	    	drop: function( event, ui ) {
	    		var tagName = ui.draggable.attr("tag");
	    		var targetFilePath = fileTable.fnGetData( this )[4];
				console.log("Tagging file: "+tagName+" to "+targetFilePath);
		    
			    $(this).toggleClass("ui-selected");
	
			    exports.clearSelectedFiles();
			    TSCORE.selectedFiles.push(targetFilePath); 
				handleElementActivation();
	
				TSCORE.TagUtils.addTag(TSCORE.selectedFiles, [tagName]);
	    	}	            	
	    })
	    .dblclick( function() {
	        console.debug("Opening file...");
	        var rowData = fileTable.fnGetData( this );
	        
	        TSCORE.openFile(rowData[4]); // 4 is the filePath
	    } );     
	    
	    fileTable.$('.fileTitleButton')
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
	    
	    fileTable.$('.extTagButton')
	        .click( function() {
	        	selectFile(this, $(this).attr("fileName"));
	            TSCORE.openTagMenu(this, $(this).attr("tag"), $(this).attr("filepath"));
	        } )
	        .dropdown( 'attach' , '#extensionMenu' );               
	    
	    fileTable.$('.tagButton')
	        .click( function() {
	            selectFile(this, $(this).attr("fileName"));
	            TSCORE.openTagMenu(this, $(this).attr("tag"), $(this).attr("filepath"));
	        } )     
	        .dropdown( 'attach' , '#tagMenu' );
	
	    $('#'+exports.ID+"FileTable_wrapper").show();  
	     
	    $( "#"+exports.ID+"ReIndexButton" ).button( "enable" );
	    
	    TSCORE.hideLoadingAnimation();     
	}
	
	exports.setFileFilter = function setFileFilter(filter) {
		$( "#"+exports.ID+"FilterBox").val(filter);
		fileTable.fnFilter(filter);
	}
	
	exports.clearSelectedFiles = function() {
	    TSCORE.selectedFiles = [];   
	    $('#'+exports.ID+'FileTable tbody tr').each(function(){
	        $(this).removeClass('ui-selected');
	    });	
	}
	
	var selectFile = function(tagButton, filePath) {
	    exports.clearSelectedFiles();    
	    $(tagButton).parent().parent().toggleClass("ui-selected");
	    TSCORE.selectedFiles.push(filePath);  
		handleElementActivation();      
	} 
	
	var initButtons = function() {
	    
	// Initialize file buttons    
	    $( "#"+exports.ID+"ReIndexButton" ).button({
	        text: true,
	        icons: {
	            primary: "ui-icon-refresh"
	        }
	    })
	    .click(function() {
		    $( "#"+exports.ID+"ReIndexButton" ).button( "disable" );
			TSCORE.IO.createDirectoryIndex(TSCORE.currentPath);
	    });  
	    
	    $( "#"+exports.ID+"TagButton" ).button({
	        text: true,
	        icons: {
	            primary: "ui-icon-document"
	        }
	    })
	    .click(function() {
	        $( "#dialogAddTags" ).dialog( "open" );
	    });  
	          
	   
	    $( "#clearFilterButton" ).button({
	        text: false,
	        disabled: false,
	        icons: {
	            primary: "ui-icon-close"
	        }
	    })
	    .click(function() {
	        $( "#filterBox" ).val( "" );
	        fileTable.fnFilter( "" );        
	    });
	}
	
	var handleElementActivation = function() {
	    console.debug("Entering element activation handler...");
	
	    if (TSCORE.selectedFiles.length > 1) {
	        $( "#"+exports.ID+"TagButton" ).button( "enable" );
	    } else if (TSCORE.selectedFiles.length == 1) {
	        $( "#"+exports.ID+"TagButton" ).button( "enable" );
	    } else {
	        $( "#"+exports.ID+"TagButton" ).button( "disable" );
	    }    
	}

});