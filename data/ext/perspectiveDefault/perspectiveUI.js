/* Copyright (c) 2012-2013 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";
	
console.debug("Loading UI for perspectiveDefault");

	var TSCORE = require("tscore");

	var TC_TITLE 		= 0,
		TC_TAGS 		= 1,
		TC_FILESIZE		= 2,
		TC_FILELMDT		= 3,
		TC_FILEPATH		= 4,
		TC_FILENAME		= 5,
		TC_FILEEXT		= 6;
		
	var TMB_SIZES = [ "100px", "200px", "300px", "400px", "500px" ];

	var supportedFileTypeThumnailing = ['jpg','jpeg','png','gif'];

	function ExtUI(extID) {
		this.extensionID = extID;
	    this.viewContainer = $("#"+this.extensionID+"Container").empty();
	    this.viewToolbar = $("#"+this.extensionID+"Toolbar").empty();
		this.viewFooter = $("#"+this.extensionID+"Footer").empty();
		
		this.showThumbs = false;
		this.showFileDetails = false;
		this.showTags = true;
		this.currentTmbSize = 0;
	}
	
	// Helper function user by basic and search views
	function buttonizeTitle(title, fileName, filePath, fileExt) {
	    if(title.length < 1) {
	    	title = filePath;
	    }
	    
	    var thumbHTML = "";	    
        if(supportedFileTypeThumnailing.indexOf(fileExt) >= 0) {
			thumbHTML = $('<p>').append( $('<img>', { 
            	title: fileName, 
            	class: "thumbImg",
            	filepath: 'file:///'+filePath, 
            	style: "width: 0px; height: 0px" 
        	})).html();
        	thumbHTML = thumbHTML + " ";
        } 	    
        
	    var titleHTML = $('<p>').append($('<span>', { 
            	text: fileName, 
            	class: "fileTitle" 
            })).html();
	        
	    var buttonHTML = $('<span>').append($('<button>', { 
	            title: "Options for "+fileName, 
	            filepath: filePath,
	            class: 'fileTitleButton', 
	            text: " | | | " 
	        })).html();
	        
	    return buttonHTML +" "+ thumbHTML + titleHTML;        
	}

	ExtUI.prototype.buildUI = function() {
		console.debug("Init UI module");
       
	    this.viewToolbar.append($("<a>", { 
			class: "btn btn-small",
			disabled: false,
	        title: "Create new file",
	        id: this.extensionID+"CreateFileButton",    
	    })
        .append( $("<i>", { class: "icon-file", }) )
        .append("New")
        .click(function() {
            $( "#dialog-filecreate" ).dialog( "open" );
        })
        );       
    
	    this.viewToolbar.append($("<button>", { 
	        text: "Subdirs",
            class: "btn btn-small",
			disabled: false,
	        title: "Show subfolders content. \nOn subfolder with many files, this step can take some time!",
	        id: this.extensionID+"IncludeSubDirsButton",    
	    })); 	 
	  
	    this.viewToolbar.append($("<button>", { 
	        text: "Add Tag",
            class: "btn btn-small",	        
			disabled: false,
	        title: "Tag Selected Files",
	        id: this.extensionID+"TagButton",    
	    }));   
	
	    this.viewToolbar.append($("<input>", { 
	        type: "checkbox",
			disabled: false,
	        id: this.extensionID+"ShowTmbButton",    
	    }));
	    
	    this.viewToolbar.append($("<label>", { 
			for: this.extensionID+"ShowTmbButton",
	        text: "Toggle Thumbnails",
	        title: "Toggle file thumbnails",
	    }));
	    
	    this.viewToolbar.append($("<button>", { 
	        text: "Zoom In",
			disabled: true,
	        title: "Increase Thumbnails Size",
	        id: this.extensionID+"IncreaseThumbsButton",    
	    }));		    
	    
	    this.viewToolbar.append($("<input>", { 
	        type: "checkbox",
			disabled: false,
	        id: this.extensionID+"ShowFileDetailsButton",    
	    }));
	    
	    this.viewToolbar.append($("<label>", { 
			for: this.extensionID+"ShowFileDetailsButton",
	        text: "Toggle File Details",
	        title: "Toggle file details",
	    }));	    
	       
	    this.viewToolbar.append($("<input>", { 
	        type: "checkbox",
			disabled: false,
	        id: this.extensionID+"ShowTagsButton",    
	    }));
	    
	    this.viewToolbar.append($("<label>", { 
			for: this.extensionID+"ShowTagsButton",
	        text: "Tags",
	        title: "Toggle Tags",
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
			class: "table",
	        id: this.extensionID+"FileTable",    
	    })); 
		  
	}
	
	ExtUI.prototype.initTable = function() {
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
	                "mRender": function ( data, type, row ) { 
	                	return buttonizeTitle(data,row[TC_TITLE],row[TC_FILEPATH],row[TC_FILEEXT]) 
	                	},
	                "aTargets": [ TC_TITLE ]
	            }, 
	            { // Tags column
	                "mRender": function ( data, type, row ) { 
	                	return TSCORE.generateTagButtons(data,row[TC_FILEEXT],row[TC_FILENAME],row[TC_FILEPATH]) 
	                	},
	                "aTargets": [ TC_TAGS ]
	            }, 
	            { // Filesize column
	                "mRender": function ( data, type, row ) { 
	                	return TSCORE.TagUtils.formatFileSize(data) 
	                	},
	                "aTargets": [ TC_FILESIZE ]
	            },
	            { // Last changed date column
	                "mRender": function ( data, type, row ) { 
	                	return TSCORE.TagUtils.formatDateTime(data, true) 
	                	},
	                "aTargets": [ TC_FILELMDT ]
	            },
	            { "bVisible": false,  "aTargets": [ TC_FILESIZE, TC_FILELMDT, TC_FILEPATH ] },
	            { "bSearchable": false,  "aTargets": [ TC_FILEPATH ] }
	//            { "sClass": "center", "aTargets": [ 0 ] }
	         ]
	    } );
	
	    // Disable alerts in datatable
	    this.fileTable.dataTableExt.sErrMode = 'throw';

	    var self = this;
		
	    // Makes the body of the fileTable selectable
	    $("tbody", $(this.fileTable)).selectable({
	      filter: 'tr',
	      start: function() {
	        console.debug("Start selecting");  
	        TSCORE.hideAllDropDownMenus();				            
			TSCORE.ViewManager.clearSelectedFiles();
	      },
	      stop: function(){
	        $(".ui-selected", this).each(function(){
	            var rowData = self.fileTable.fnGetData( this );
	            // Add the filename which is located in the first column to the list of selected filenames
	            TSCORE.selectedFiles.push(rowData[TC_FILEPATH]);
	    		self.handleElementActivation();               
	          });
	        console.debug("Selected files: "+TSCORE.selectedFiles);
	      }
	    })
	}			
	
	ExtUI.prototype.reInitTableWithData = function(fileList) {
		$('#'+this.extensionID+"FileTable_wrapper").hide();
		
		// handle thumbnail activation
		this.showThumbs  = false;
		$( "#"+this.extensionID+"ShowTmbButton" ).prop('checked', false).button("refresh");
					
		// Clearing the old data
	    this.fileTable.fnClearTable();  
	    this.fileTable.fnAddData( fileList );

		var self = this;

	    this.fileTable.$('tr')
		    .droppable({
		    	accept: ".tagButton",
		    	hoverClass: "activeRow",
		    	drop: function( event, ui ) {
		    		var tagName = ui.draggable.attr("tag");
		    			    		
		    		var targetFilePath = self.fileTable.fnGetData( this )[TC_FILEPATH];
	
		    		// preventing self drag of tags
		    		var targetTags = TSCORE.TagUtils.extractTags(targetFilePath);
		    		for (var i = 0; i < targetTags.length; i++) {
	        			if (targetTags[i] === tagName) {
	            			return true;
	        			}
	    			}
		    		
					console.log("Tagging file: "+tagName+" to "+targetFilePath);
			    
				    $(this).toggleClass("ui-selected");
		
				    TSCORE.ViewManager.clearSelectedFiles();
				    
				    TSCORE.selectedFiles.push(targetFilePath); 
					
					TSCORE.TagUtils.addTag(TSCORE.selectedFiles, [tagName]);
	
					self.handleElementActivation();
		    	}	            	
		    })
		    .dblclick( function() {
		        console.debug("Opening file...");
		        var rowData = self.fileTable.fnGetData( this );
		        
		        TSCORE.FileOpener.openFile(rowData[TC_FILEPATH]); 
		    } );     
	    
	    this.fileTable.$('.fileTitleButton')
	    	.draggable({
	    		cancel:false,
	    		appendTo: "body",
	    		helper: "clone",
	    		revert: true,
		        start: function() {
	                self.selectFile(this, $(this).attr("filepath"));
		        }    		
	    	})  
	        .click( function() {
	            self.selectFile(this, $(this).attr("filepath"));
	        } )        
	        .dropdown( 'attach' , '#fileMenu' );   
	    
	    this.fileTable.$('.extTagButton')
	        .click( function() {
	        	self.selectFile(this, $(this).attr("filepath"));
	            TSCORE.openTagMenu(this, $(this).attr("tag"), $(this).attr("filepath"));
	        } )
	        .dropdown( 'attach' , '#extensionMenu' );               

	    this.fileTable.$('.thumbImg')
		    .dblclick( function() {
		        console.debug("Opening file...");
		        TSCORE.FileOpener.openFile($(this).attr("filepath")); 
		    } ); 	    

	    this.fileTable.$('.fileTitle')
			.editInPlace({
				callback: function(unused, newTitle) { 
					TSCORE.TagUtils.changeTitle($(this).parent().children(0).attr("filepath"),newTitle);
					},
	    		show_buttons: false,
	    		callback_skip_dom_reset: true
			});	 
	    
	    this.fileTable.$('.tagButton')
	    	.draggable({
	    		cancel:false,
	    		appendTo: "body",
	    		helper: "clone",
	    		revert: true,
		        start: function() {
	                self.selectFile(this, $(this).attr("filepath"));
		        }    		
	    	})   	        
	        .click( function() {
	            self.selectFile(this, $(this).attr("filepath"));
	            TSCORE.openTagMenu(this, $(this).attr("tag"), $(this).attr("filepath"));
	        } )     
	        .dropdown( 'attach' , '#tagMenu' );
	
	    $('#'+this.extensionID+"FileTable_wrapper").show();  

	//    $( "#"+this.extensionID+"CreateFileButton" ).button( "enable" );
	    	     
	//    $( "#"+this.extensionID+"IncludeSubDirsButton" ).button( "enable" );
	    
	}
	
	ExtUI.prototype.selectFile = function(tagButton, filePath) {
	    TSCORE.ViewManager.clearSelectedFiles();   

	    $(tagButton).parent().parent().toggleClass("ui-selected");

	    TSCORE.selectedFiles.push(filePath);  
		
		this.handleElementActivation();      
	} 		
	
	ExtUI.prototype.switchThumbnailSize = function() {
		this.currentTmbSize = this.currentTmbSize + 1;
		
		if(this.currentTmbSize >= TMB_SIZES.length) { this.currentTmbSize = 0; }
		
		$('.thumbImg').css({"max-width":TMB_SIZES[this.currentTmbSize], "max-height":TMB_SIZES[this.currentTmbSize] });		
	}
	
	ExtUI.prototype.toggleFileDetails = function() {
		if(this.showFileDetails) {
			this.fileTable.fnSetColumnVis( TC_FILESIZE, false );
			this.fileTable.fnSetColumnVis( TC_FILELMDT, false );
			this.fileTable.fnSetColumnVis( TC_FILEPATH, false );									
		} else {
			this.fileTable.fnSetColumnVis( TC_FILESIZE, true );
			this.fileTable.fnSetColumnVis( TC_FILELMDT, true );
			this.fileTable.fnSetColumnVis( TC_FILEPATH, true );			
		}
		this.showFileDetails = !this.showFileDetails;
	}
	
	ExtUI.prototype.toggleThumbnails = function() {
		if(this.showThumbs) {
			this.currentTmbSize = 0;
			$( "#"+this.extensionID+"IncreaseThumbsButton" ).button( "disable" );
			$.each(this.fileTable.$('.thumbImg'), function() {
            	$(this).attr('style', "width: 0px; height: 0px");
				$(this).attr('src',"");
			});
		} else {
			$( "#"+this.extensionID+"IncreaseThumbsButton" ).button( "enable" );
			$.each(this.fileTable.$('.thumbImg'), function() {
            	$(this).attr('style', "");
				$(this).attr('src',$(this).attr('filepath'));
			});
		}
		this.showThumbs = !this.showThumbs;
	}	
	
	ExtUI.prototype.toggleTags = function() {
		if(this.showTags) {
			this.fileTable.fnSetColumnVis( TC_TAGS, false );
		} else {
			this.fileTable.fnSetColumnVis( TC_TAGS, true );
		}
		this.showTags = !this.showTags;
	}
		
	ExtUI.prototype.initButtons = function() {
	    var self = this;
		// Initialize file buttons    


	    
	    $( "#"+this.extensionID+"IncludeSubDirsButton" )
	    .click(function() {
		    $( "#"+self.extensionID+"IncludeSubDirsButton" ).button( "disable" );
			TSCORE.IO.createDirectoryIndex(TSCORE.currentPath);
	    });  
	    
	    $( "#"+this.extensionID+"TagButton" )
	    .click(function() {
			TSCORE.showAddTagsDialog();
	    });  
	
	    $( "#"+this.extensionID+"ShowTmbButton" ).button({
	        text: false,
	        icons: {
	            primary: "ui-icon-image"
	        }
	    })
	    .click(function() {
			self.toggleThumbnails();
	    }); 

    
	    $( "#"+this.extensionID+"IncreaseThumbsButton" ).button({
	        text: false,
	        icons: {
	            primary: "ui-icon-zoomin"
	        }
	    })
	    .click(function() {
			self.switchThumbnailSize();
	    }); 	    
	    
	    $( "#"+this.extensionID+"ShowFileDetailsButton" ).button({
	        text: false,
	        icons: {
	            primary: "ui-icon-contact"
	        }
	    })
	    .click(function() {
			self.toggleFileDetails();
	    });
	    
	    $( "#"+this.extensionID+"ShowTagsButton" ).button({
	        text: false,
	        icons: {
	            primary: "ui-icon-tag"
	        }
	    })
	    .click(function() {
			self.toggleTags();
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