/* Copyright (c) 2012-2013 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";
	
console.debug("Loading UI for perspectiveDefault");

	var TSCORE = require("tscore");

	function ExtUI(extID) {
		this.extensionID = extID;
	    this.viewContainer = $("#"+this.extensionID+"Container").empty();
	    this.viewToolbar = $("#"+this.extensionID+"Toolbar").empty();
		this.viewFooter = $("#"+this.extensionID+"Footer").empty();
	}
	
	ExtUI.prototype.buildUI = function() {
		console.debug("Init UI module");
	
	    this.viewToolbar.append($("<button>", { 
	        text: "Subdirs",
			disabled: true,
	        title: "Include subdirectories",
	        id: this.extensionID+"ReIndexButton",    
	    }));	
	    
	    this.viewToolbar.append($("<button>", { 
	        text: "Add Tag",
			disabled: true,
	        title: "TagSelectedFiles",
	        id: this.extensionID+"TagButton",    
	    }));    
	
	    this.viewToolbar.append($("<input>", { 
	        type: "checkbox",
			disabled: false,
	        title: "TagSelectedFiles",
	        id: this.extensionID+"ShowTmbButton",    
	    }));
	    
	    this.viewToolbar.append($("<label>", { 
			for: this.extensionID+"ShowTmbButton",
	        text: "Thumbnails",
	        title: "Some file thumbnails",
	    }));
	    
	    this.viewToolbar.append($("<input>", { 
	        type: "checkbox",
			disabled: false,
	        title: "TagSelectedFiles",
	        id: this.extensionID+"ShowFileDetailsButton",    
	    }));
	    
	    this.viewToolbar.append($("<label>", { 
			for: this.extensionID+"ShowFileDetailsButton",
	        text: "File Details",
	        title: "Some file details",
	    }));	    
	       
	    this.viewToolbar.append($("<input>", { 
	        type: "checkbox",
			disabled: false,
	        title: "TagSelectedFiles",
	        id: this.extensionID+"ShowTagsButton",    
	    }));
	    
	    this.viewToolbar.append($("<label>", { 
			for: this.extensionID+"ShowTagsButton",
	        text: "Tags",
	        title: "Some file details",
	    }));	
	    	    
	    this.viewToolbar.append($("<span>", { 
	    	style: "float: right; margin: 0px; padding: 0px;",
	    }).append($("<input>", { 
			type: "filter",
			// autocomplete: "off", // Error: cannot call methods on autocomplete prior to initialization; attempted to call method 'off' 
	        title: "This filter applies to current directory without subdirectories.",
	        id: this.extensionID+"FilterBox",    
	    })));
	
	    this.viewContainer.append($("<table>", { 
			cellpadding: "0",
			cellspacing: "0",
			border: "0",
			style: "width: 100%",
	        id: this.extensionID+"FileTable",    
	    })); 
		  
	}
	
	ExtUI.prototype.initTable = function() {
		// Column order in json [title(0),tags(1),fileSize(2),fileLMDT(3),path(4),filename(5),extension(6)];
	    this.fileTable = $('#'+this.extensionID+"FileTable").dataTable( {
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
	    this.fileTable.dataTableExt.sErrMode = 'throw';

	    var myTable = this.fileTable;
		var myHandleActivateion = this.handleElementActivation;
		
	    // Makes the body of the fileTable selectable
	    $("tbody", $(myTable)).selectable({
	      filter: 'tr',
	      start: function() {
	        console.debug("Start selecting");  
	        TSCORE.hideAllDropDownMenus();				            
			TSCORE.ViewManager.clearSelectedFiles();
	      },
	      stop: function(){
	        $(".ui-selected", this).each(function(){
	            var rowData = myTable.fnGetData( this );
	            // Add the filename which is located in the first column to the list of selected filenames
	            TSCORE.selectedFiles.push(rowData[4]);
	    		myHandleActivateion();               
	          });
	        console.debug("Selected files: "+TSCORE.selectedFiles);
	      }
	    })
	}			
	
	ExtUI.prototype.toggleThumbnails = function() {
		console.debug("thumbs toggled");
	}
	
	ExtUI.prototype.initButtons = function() {
	    var self = this;
		// Initialize file buttons    
	    $( "#"+this.extensionID+"ReIndexButton" ).button({
	        text: true,
	        icons: {
	            primary: "ui-icon-refresh"
	        }
	    })
	    .click(function() {
		    $( "#"+self.extensionID+"ReIndexButton" ).button( "disable" );
			TSCORE.IO.createDirectoryIndex(TSCORE.currentPath);
	    });  
	    
	    $( "#"+this.extensionID+"TagButton" ).button({
	        text: true,
	        icons: {
	            primary: "ui-icon-tag"
	        }
	    })
	    .click(function() {
			TSCORE.showAddTagsDialog();
	    });  
	
	    $( "#"+this.extensionID+"ShowTmbButton" ).button({
	        text: true,
	        icons: {
	            primary: "ui-icon-image"
	        }
	    })
	    .click(function() {
			self.toggleThumbnails();
	    }); 	         

	    $( "#"+this.extensionID+"ShowFileDetailsButton" ).button({
	        text: true,
	        icons: {
	            primary: "ui-icon-contact"
	        }
	    })
	    .click(function() {
			// self.toggleThumbnails();
	    }); 
	    
	    $( "#"+this.extensionID+"ShowTagsButton" ).button({
	        text: true,
	        icons: {
	            primary: "ui-icon-tag"
	        }
	    })
	    .click(function() {
			// self.toggleThumbnails();
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
	        self.fileTable.fnFilter( "" );        
	    });
	}
	
	ExtUI.prototype.initFileFilter = function() {
	    var self = this;
	    
	    // Filter functionality
	    $("#"+this.extensionID+"FilterBox").keyup(function() {
	        self.fileTable.fnFilter(this.value);
	        console.debug("Filter to value: "+this.value);
	    });  
	    
	    $('#'+this.extensionID+"FilterBox").wrap('<span id="resetFilter" />').after($('<span/>').click(function() {
	        $(this).prev('input').val('').focus();
	        self.fileTable.fnFilter( "" );  
	    }));   		
	}
	
	ExtUI.prototype.handleElementActivation = function() {
	    console.debug("Entering element activation handler...");
	    
	    var tabButton = $( "#"+this.extensionID+"TagButton" );
	    
	    if (TSCORE.selectedFiles.length > 1) {
	        tabButton.button( "enable" );
	    } else if (TSCORE.selectedFiles.length == 1) {
	       	tabButton.button( "enable" );
	    } else {
	        tabButton.button( "disable" );
	    }    
	}

	exports.ExtUI	 				= ExtUI;
});