/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
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
            	style: "width: 0px; height: 0px; border: 0px" 
        	})).html();
        	thumbHTML = thumbHTML + " ";
        } 	    

        var checkboxHTML = $('<legend>', {
                class: "checkbox",            
            }).append($('<input>', { 
                type: "checkbox",
                class: "fileSelection", 
            })).html();
        
	    var titleHTML = $('<p>').append($('<span>', { 
            	text: fileName, 
            	class: "fileTitle" 
            })).html();
	        
	    var buttonHTML = $('<span>').append($('<button>', { 
	            title: "Options for "+fileName, 
	            filepath: filePath,
	            class: 'btn fileTitleButton', 
	        })
	        .append("<i class='icon-file' />")
            .append("<span class='caret'/>")
	        ).html();
	        
	    return checkboxHTML+" "+buttonHTML +" "+ thumbHTML + titleHTML;        
	}

	ExtUI.prototype.buildUI = function() {
		console.debug("Init UI module");
		       
		var self = this;
		
		//  var tagButtons = $("<div>").appendTo( "#tagGroups" );  
		
		this.viewToolbar.append($("<div>", { 
			class: "btn-group",
			style: "margin: 0px",
			id: this.extensionID+"Toolbar", 			
	    })

        .append($("<a>", { 
            class: "btn ",
            title: "Toggle Select All Files",
            id: this.extensionID+"ToogleSelectAll",    
        })
        .click(function() {
            if($(this).find("input").prop("checked")) {
                TSCORE.selectedFiles = [];   
                $('#'+self.extensionID+'FileTable tbody tr').each(function(){
                    $(this).addClass('ui-selected');
                    $(this).find(".fileSelection").prop("checked",true);
                    TSCORE.selectedFiles.push($(this).find(".fileTitleButton").attr("filepath"));  
                    self.handleElementActivation();                          
                }); 
            } else {
                TSCORE.PerspectiveManager.clearSelectedFiles();                
            }            
        })
        .append( "<input type='checkbox' style='margin-top: -3px;'>" )
        )
	    
	    .append($("<a>", { 
			class: "btn  disabled",
	        title: "Create new file",
	        id: this.extensionID+"CreateFileButton",    
	    })
        .click(function() {
            TSCORE.showFileCreateDialog();
        })
        .append( "<i class='icon-plus'>" )
//        .append(" New")
        )
    
	    .append($("<button>", { 
            class: "btn  disabled",
	        title: "Show subfolders content. \nOn subfolder with many files, this step can take some time!",
	        id: this.extensionID+"IncludeSubDirsButton",    
	    })
	    .click(function() {
		    $( "#"+self.extensionID+"IncludeSubDirsButton" ).addClass( "disabled" );
			TSCORE.IO.createDirectoryIndex(TSCORE.currentPath);
	    })
	    .append( $("<i>", { class: "icon-retweet", }) )
//	    .append(" Subdirs")
	    )
	    
	    .append($("<button>", { 
            class: "btn  disabled",	        
	        title: "Tag Selected Files",
	        id: this.extensionID+"TagButton",    
	    })
	    .click(function() {
			TSCORE.showAddTagsDialog();
	    })
	    .append( $("<i>", { class: "icon-tag", }) )
//	    .append(" Add Tag")
	    )    

	    .append($("<button>", { 
            class: "btn ",	
            "data-toggle": "button",        
	        title: "Toggle file thumbnails",
	        id: this.extensionID+"ShowTmbButton",    
	    })
	    .click(function() {
			self.toggleThumbnails();
	    })
	    .append( $("<i>", { class: "icon-picture", }) )
	    //.append("Toggle Thumbnails")
	    )
 
	    .append($("<button>", { 
            class: "btn ",	
	        title: "Increase Thumbnails Size",
	        id: this.extensionID+"IncreaseThumbsButton",    
	    })
	    .click(function() {
			self.switchThumbnailSize();
	    })	    
	    .append( $("<i>", { class: "icon-zoom-in", }) )
	    //.append("Zoom In")
	    )	    	    
		
	    ); // end toolbar
	    		
	    this.viewToolbar.append($("<div >", { 
            class: "btn-group",	
            "data-toggle": "buttons-checkbox",        
	    })	    
		    .append($("<button>", { 
		            class: "btn ",	
			        title: "Toggle File Details",
			        id: this.extensionID+"ShowFileDetailsButton",    
			    })
			    .click(function() {
					self.toggleFileDetails();
			    })
			    .append( $("<i>", { class: "icon-list-alt", }) )
			    //.append("File Details")
		    )
		     	    
			.append($("<button>", { 
		            class: "btn active",	
			        title: "Toggle Tags",
			        id: this.extensionID+"ShowTagsButton",    
			    })
				.click(function() {
					self.toggleTags();
			    })		    
			    .append( $("<i>", { class: "icon-tags", }) )
			    //.append("Tags")
		    )	     
	    ) // end button group

        this.viewToolbar.append($("<div >", { 
            class: "input-append pull-right", 
        })      
            // Filter               
            .append($("<input>", { 
                type: "text",
                //name: "fileFilter",
                class: "input-small",
                id:   this.extensionID+"FilterBox",
                placeholder: "Filter",
            }).keyup(function() {
                TSCORE.PerspectiveManager.clearSelectedFiles();
                self.fileTable.fnFilter(this.value);
                console.debug("Filter to value: "+this.value);
            }))
                    
            .append($("<button>", { 
                    class: "btn", 
                    title: "Clear Filter",
                    id:   this.extensionID+"ClearFilterButton",
                })
                .append( $("<i>", { class: "icon-remove", }) )
            )        
        ); // End Filter
        
        $('#'+this.extensionID+"ClearFilterButton").click(function(evt) {
            evt.preventDefault();
            $("#"+self.extensionID+"FilterBox").val('').focus();
            self.fileTable.fnFilter( "" );
        });            
	
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
	    /* $("tbody", $(this.fileTable)).selectable({
	      filter: 'tr',
	      start: function() {
	        console.debug("Start selecting");  
	        TSCORE.hideAllDropDownMenus();				            
			TSCORE.PerspectiveManager.clearSelectedFiles();
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
	    }) */
	}			
	
	ExtUI.prototype.reInitTableWithData = function(fileList) {
		$('#'+this.extensionID+"FileTable_wrapper").hide();
		
		// handle thumbnail activation
		this.showThumbs  = false;
					
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
		
				    TSCORE.PerspectiveManager.clearSelectedFiles();
				    
				    TSCORE.selectedFiles.push(targetFilePath); 
					
					TSCORE.TagUtils.addTag(TSCORE.selectedFiles, [tagName]);
	
					self.handleElementActivation();
					
					$(ui.helper).remove();  
		    	}	            	
		    })
            // Disable due incompatibility with the select checkbox
            //.click( function() {
            //    var titleBut = $(this).find(".fileTitleButton");
            //    self.selectFile(titleBut, $(titleBut).attr("filepath"));
            //} )  
		    .dblclick( function() {
		        console.debug("Opening file...");
		        var rowData = self.fileTable.fnGetData( this );
		        TSCORE.FileOpener.openFile(rowData[TC_FILEPATH]); 
		        
                var titleBut = $(this).find(".fileTitleButton");
                self.selectFile(titleBut, $(titleBut).attr("filepath"));
		    } );     
	    
	    this.fileTable.$('.fileTitleButton')
	    	.draggable({
	    		"cancel":    false,
	    		"appendTo":  "body",
	    		"helper":    "clone",
	    		"revert":    true,
		        "start":     function() { self.selectFile(this, $(this).attr("filepath")); }    		
	    	})  
	        .click( function() {
	            self.selectFile(this, $(this).attr("filepath"));
	        } )        
	        .dropdown( 'attach' , '#fileMenu' );   
	    
	    this.fileTable.$('.fileSelection')
            .click( function() {
                var fpath = $(this).parent().find(".fileTitleButton").attr("filepath");
                if($(this).prop("checked")) {                    
                    $(this).parent().parent().addClass("ui-selected");
                    TSCORE.selectedFiles.push(fpath);  
                } else {
                    $(this).parent().parent().removeClass("ui-selected");
                    TSCORE.selectedFiles.splice(TSCORE.selectedFiles.indexOf(fpath), 1);
                }
                self.handleElementActivation(); 
            } )        
	    
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
					TSCORE.TagUtils.changeTitle($(this).parent().find(".fileTitleButton").attr("filepath"),newTitle);
					},
	    		show_buttons: false,
	    		callback_skip_dom_reset: true
			});	 
	    
	    this.fileTable.$('.tagButton')
	    	.draggable({
	    		"cancel":   false,
	    		"appendTo": "body",
	    		"helper":   "clone",
	    		"revert":   true,
		        "start":    function() { self.selectFile(this, $(this).attr("filepath")); }    		
	    	})   	        
	        .click( function() {
	            self.selectFile(this, $(this).attr("filepath"));
	            TSCORE.openTagMenu(this, $(this).attr("tag"), $(this).attr("filepath"));
	        } )     
	        .dropdown( 'attach' , '#tagMenu' );
	
	    $('#'+this.extensionID+"FileTable_wrapper").show();  

	    $( "#"+this.extensionID+"CreateFileButton" ).removeClass( "disabled" );
	    $( "#"+this.extensionID+"IncludeSubDirsButton" ).removeClass( "disabled" );
	    
	}
	
	ExtUI.prototype.selectFile = function(uiElement, filePath) {
	    TSCORE.PerspectiveManager.clearSelectedFiles();   

	    $(uiElement).parent().parent().toggleClass("ui-selected");

        $(uiElement).parent().parent().find(".fileSelection").prop("checked",true);   
	    
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
			$( "#"+this.extensionID+"IncreaseThumbsButton" ).addClass( "disabled" );
			$.each(this.fileTable.$('.thumbImg'), function() {
            	$(this).attr('style', "width: 0px; height: 0px; border: 0px");
				$(this).attr('src',"");
			});
		} else {
			$( "#"+this.extensionID+"IncreaseThumbsButton" ).removeClass( "disabled" );
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
	
	ExtUI.prototype.handleElementActivation = function() {
	    console.debug("Entering element activation handler...");
	    
	    var tagButton = $( "#"+this.extensionID+"TagButton" );
	    
	    if (TSCORE.selectedFiles.length > 1) {
	        tagButton.removeClass( "disabled" );
	    } else if (TSCORE.selectedFiles.length == 1) {
	       	tagButton.removeClass( "disabled" );
	    } else {
	        tagButton.addClass( "disabled" );
	    }    
	}

	exports.ExtUI	 				= ExtUI;
});