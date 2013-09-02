/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";
	
console.log("Loading UI for perspectiveDefault");

	var TSCORE = require("tscore");
		
	var TMB_SIZES = [ "100px", "200px", "300px", "400px", "500px" ];

	var supportedFileTypeThumnailing = ['jpg','jpeg','png','gif'];

    var extensionDirectory = undefined;

	function ExtUI(extID) {
		this.extensionID = extID;
	    this.viewContainer = $("#"+this.extensionID+"Container").empty();
	    this.viewToolbar = $("#"+this.extensionID+"Toolbar").empty();
		this.viewFooter = $("#"+this.extensionID+"Footer").empty();
		
		this.thumbEnabled = false;
		this.showFileDetails = false;
		this.showTags = true;
		this.currentTmbSize = 0;
		
		extensionDirectory = TSCORE.Config.getExtensionPath()+"/"+this.extensionID;
	}
	
	// Helper function user by basic and search views
	function buttonizeTitle(title, fileName, filePath, fileExt) {
	    if(title.length < 1) {
	    	title = filePath;
	    }
	    
        //TODO minimize platform specific calls	    
        var tmbPath = undefined;
        if(isCordova) {
            tmbPath = filePath;            
        } else {
            tmbPath = "file:///"+filePath;  
        }	    
	    
	    var thumbHTML = "";	    
        if(supportedFileTypeThumnailing.indexOf(fileExt) >= 0) {
			thumbHTML = $('<span>').append( $('<img>', { 
            	title: fileName, 
            	class: "thumbImg",
            	filepath: tmbPath, 
            	style: "width: 0px; height: 0px; border: 0px" 
        	})).html();
        	thumbHTML = "<br>" + thumbHTML;
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
	        .append("<i class='icon-file-alt' />")
            .append("<span class='caret'/>")
	        ).html();
	        
	    return checkboxHTML+" "+buttonHTML +" " + titleHTML + thumbHTML;        
	}
     
	ExtUI.prototype.buildUI = function() {
		console.log("Init UI module");
		       
		var self = this;
		
        this.viewToolbar.append($("<div >", { 
            class: "btn-group", 
        })  		
		
            .append($("<button>", { 
                class: "btn ",
                title: "Toggle Select All Files",
                id: this.extensionID+"ToogleSelectAll",    
            })
            .click(function() {
                if($(this).find("i").attr("class") == "icon-check-empty") {
                    TSCORE.selectedFiles = [];   
                    $('#'+self.extensionID+'FileTable tbody tr').each(function(){
                        $(this).addClass('ui-selected');
                        $(this).find(".fileSelection").prop("checked",true);
                        TSCORE.selectedFiles.push($(this).find(".fileTitleButton").attr("filepath"));  
                        self.handleElementActivation();                          
                    });
                    $(this).find("i").removeClass("icon-check-empty"); 
                    $(this).find("i").addClass("icon-check"); 
                } else {
                    TSCORE.PerspectiveManager.clearSelectedFiles();
                    $(this).find("i").removeClass("icon-check");                                     
                    $(this).find("i").addClass("icon-check-empty");
                }            
            })
            .append( "<i class='icon-check-empty'>" )
            )
            
        )
        
		this.viewToolbar.append($("<div>", { 
			class: "btn-group",
			id: this.extensionID+"Toolbar", 			
	    })

    	    .append($("<button>", { 
    			class: "btn ",
    	        title: "Create new file",
    	        id: this.extensionID+"CreateFileButton",    
    	    })
    	    .prop('disabled', true)
            .click(function() {
                TSCORE.showFileCreateDialog();
            })
            .append( "<i class='icon-plus'>" )
            )
        
    	    .append($("<button>", { 
                class: "btn",
    	        title: "Show subfolders content. \nOn subfolder with many files, this step can take some time!",
    	        id: this.extensionID+"IncludeSubDirsButton",    
    	    })
            .prop('disabled', true)    	    
    	    .click(function() {
    		    $( this ).prop('disabled', true);
    			TSCORE.IO.createDirectoryIndex(TSCORE.currentPath);
    	    })
    	    .append( $("<i>", { class: "icon-retweet", }) )
    	    )
    	    
    	    .append($("<button>", { 
                class: "btn",	        
    	        title: "Tag Selected Files",
    	        id: this.extensionID+"TagButton",    
    	    })
            .prop('disabled', true)
    	    .click(function() {
    			TSCORE.showAddTagsDialog();
    	    })
    	    .append( $("<i>", { class: "icon-tag", }) )
    	    )    
        ); // end toolbar
                
        this.viewToolbar.append($("<div >", { 
            class: "btn-group", 
        })  
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
            .prop('disabled', true)
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
		    )	     
	    ) // end button group

        this.viewToolbar.append($("<div >", { 
            class: "btn-group", 
        })       
            .append($("<button>", { 
                class: "btn",           
                title: "Exports current table data as CSV",
                id: this.extensionID+"ExportButton",    
            })
            .click(function() {
                var dialogContent = $('<textarea>', {
                    style: "width: 500px; height: 350px;",
                    text: TSCORE.PerspectiveManager.csvExport()
                });                
                TSCORE.showAlertDialog(dialogContent,"Export to CSV Dialog");
            })
            .append( $("<i>", { class: "icon-download-alt", }) )
            )          
                        
        ); // end toolbar

        this.viewToolbar.append($("<div >", { 
            class: "input-append pull-right", 
            style: "position:absolute; top:2px; right:2px; z-index: 9999"  
        })      
            // Filter               
            .append($("<input>", { 
                type: "text",
                //name: "fileFilter",
                class: "input-medium",
                id:   this.extensionID+"FilterBox",
                placeholder: "Filename Filter",
                style: "width: 100px;"
            }).keyup(function() {
                self.setFilter(this.value); 
            }))
                    
            .append($("<button>", { 
                    class: "btn", 
                    title: "Clear Filter",
                    id:   this.extensionID+"ClearFilterButton",
                })
                .append( $("<i>", { class: "icon-remove", }) )
                .click(function(evt) {
                    evt.preventDefault();
                    self.setFilter("");            
                })
            )        
        ); // End Filter
        
	
	    this.viewContainer.append($("<table>", { 
			cellpadding: "0",
			cellspacing: "0",
			border: "0",
			style: "width: 100%",
			class: "table content disableTextSelection",
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
                { "sTitle": "Extension" },
	            { "sTitle": "Tags" },            
	            { "sTitle": "Size" },
	            { "sTitle": "Date Modified" },
	            { "sTitle": "Path" },
                { "sTitle": "File Name" }                
	        ],         
	        "aoColumnDefs": [
	            { // Title column
	                "mRender": function ( data, type, row ) { 
	                	return buttonizeTitle(data,row[TSCORE.fileListTITLE],row[TSCORE.fileListFILEPATH],row[TSCORE.fileListFILEEXT]); 
	                	},
	                "aTargets": [ TSCORE.fileListTITLE ]
	            }, 
                { // File extension column
                    "mRender": function ( data, type, row ) { 
                        return TSCORE.generateExtButton(data,row[TSCORE.fileListFILEPATH]); 
                        },
                    "aTargets": [ TSCORE.fileListFILEEXT ]
                }, 
	            { // Tags column
	                "mRender": function ( data, type, row ) { 
	                	return TSCORE.generateTagButtons(data,row[TSCORE.fileListFILEPATH]); 
	                	},
	                "aTargets": [ TSCORE.fileListTAGS ]
	            }, 
	            { // Filesize column
	                "mRender": function ( data, type, row ) { 
	                	return TSCORE.TagUtils.formatFileSize(data, true); 
	                	},
	                "aTargets": [ TSCORE.fileListFILESIZE ]
	            },
	            { // Last changed date column
	                "mRender": function ( data, type, row ) { 
	                	return TSCORE.TagUtils.formatDateTime(data, true); 
	                	},
	                "aTargets": [ TSCORE.fileListFILELMDT ]
	            },
                { // Filename column
                    "mRender": function ( data, type, row ) { 
                        return data; 
                        },
                    "aTargets": [ TSCORE.fileListFILENAME ]
                },     
	            { "bVisible": false,  "aTargets": [ 
	                       TSCORE.fileListFILESIZE, 
	                       TSCORE.fileListFILELMDT, 
	                       TSCORE.fileListFILEPATH, 
	                       TSCORE.fileListFILENAME 
	                       ] 
	            },
	            { "bSearchable": false,  "aTargets": [ 
	                       TSCORE.fileListTITLE, 
	                       TSCORE.fileListFILEEXT, 
	                       TSCORE.fileListTAGS, 
	                       TSCORE.fileListFILESIZE, 
	                       TSCORE.fileListFILELMDT, 
	                       TSCORE.fileListFILEPATH 
	                       ] 
                }
	         ]
	    } );
	
	    // Disable alerts in datatable
	    this.fileTable.dataTableExt.sErrMode = 'throw';

	    var self = this;
		
	    // Makes the body of the fileTable selectable
	    /* $("tbody", $(this.fileTable)).selectable({
	      filter: 'tr',
	      start: function() {
	        console.log("Start selecting");  
	        TSCORE.hideAllDropDownMenus();				            
			TSCORE.PerspectiveManager.clearSelectedFiles();
	      },
	      stop: function(){
	        $(".ui-selected", this).each(function(){
	            var rowData = self.fileTable.fnGetData( this );
	            // Add the filename which is located in the first column to the list of selected filenames
	            TSCORE.selectedFiles.push(rowData[TSCORE.fileListFILEPATH]);
	    		self.handleElementActivation();               
	          });
	        console.log("Selected files: "+TSCORE.selectedFiles);
	      }
	    }) */
	   
	}			
	
	ExtUI.prototype.reInitTableWithData = function() {
		$('#'+this.extensionID+"FileTable_wrapper").hide();
					
		// Clearing the old data
	    this.fileTable.fnClearTable();  
	    this.fileTable.fnAddData( TSCORE.fileList );

		var self = this;

	    this.fileTable.$('tr')
		    .droppable({
		    	accept: ".tagButton",
		    	hoverClass: "activeRow",
		    	drop: function( event, ui ) {
		    		var tagName = TSCORE.selectedTag; //ui.draggable.attr("tag");
		    			    		
		    		var targetFilePath = self.fileTable.fnGetData( this )[TSCORE.fileListFILEPATH];
	
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
		        console.log("Opening file...");
		        var rowData = self.fileTable.fnGetData( this );
		        TSCORE.FileOpener.openFile(rowData[TSCORE.fileListFILEPATH]); 
		        
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
		        console.log("Opening file...");
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
		        "start":    function() { 
                    TSCORE.selectedTag = $(this).attr("tag");
		            self.selectFile(this, $(this).attr("filepath")); 
		            }    		
	    	})   	        
	        .click( function() {
                TSCORE.selectedTag = $(this).attr("tag");	            
	            self.selectFile(this, $(this).attr("filepath"));
	            TSCORE.openTagMenu(this, $(this).attr("tag"), $(this).attr("filepath"));
	        } )     
	        .dropdown( 'attach' , '#tagMenu' );
	
	    $('#'+this.extensionID+"FileTable_wrapper").show();  

	    $( "#"+this.extensionID+"CreateFileButton" ).prop('disabled', false);
	    $( "#"+this.extensionID+"IncludeSubDirsButton" ).prop('disabled', false);
	    
        this.refreshThumbnails();	    
	    
	}

    ExtUI.prototype.setFilter = function(filterValue) {
        TSCORE.PerspectiveManager.clearSelectedFiles();   

        $( "#"+this.extensionID+"FilterBox").val(filterValue).focus();
        this.fileTable.fnFilter(filterValue);
        
        if(filterValue.length > 0) {
            $( "#"+this.extensionID+"ClearFilterButton").addClass("filterOn");
        } else {
            $( "#"+this.extensionID+"ClearFilterButton").removeClass("filterOn");
        }
        
        this.handleElementActivation();   
        console.log("Filter to value: "+filterValue);           
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
			this.fileTable.fnSetColumnVis( TSCORE.fileListFILESIZE, false );
			this.fileTable.fnSetColumnVis( TSCORE.fileListFILELMDT, false );
			this.fileTable.fnSetColumnVis( TSCORE.fileListFILEPATH, false );									
		} else {
			this.fileTable.fnSetColumnVis( TSCORE.fileListFILESIZE, true );
			this.fileTable.fnSetColumnVis( TSCORE.fileListFILELMDT, true );
			this.fileTable.fnSetColumnVis( TSCORE.fileListFILEPATH, true );			
		}
		this.showFileDetails = !this.showFileDetails;
	}

    ExtUI.prototype.enableThumbnails = function() {
        $( "#"+this.extensionID+"IncreaseThumbsButton" ).prop('disabled', false);
        $.each(this.fileTable.$('.thumbImg'), function() {
            $(this).attr('style', "");
            $(this).attr('src',$(this).attr('filepath'));
        });
        $('.thumbImg').css({"max-width":TMB_SIZES[this.currentTmbSize], "max-height":TMB_SIZES[this.currentTmbSize] });     
    }   
    
    ExtUI.prototype.disableThumbnails = function() {
        //this.currentTmbSize = 0;
        $( "#"+this.extensionID+"IncreaseThumbsButton" ).prop('disabled', true);
        $.each(this.fileTable.$('.thumbImg'), function() {
            $(this).attr('style', "width: 0px; height: 0px; border: 0px");
            $(this).attr('src',"");
        });
    }     
    
    ExtUI.prototype.refreshThumbnails = function() {
        if(this.thumbEnabled) {
            this.enableThumbnails();
        } else {
            this.disableThumbnails();
        }
    }        
	
	ExtUI.prototype.toggleThumbnails = function() {
		this.thumbEnabled = !this.thumbEnabled;
        this.refreshThumbnails();
	}	
	
	ExtUI.prototype.toggleTags = function() {
		if(this.showTags) {
			this.fileTable.fnSetColumnVis( TSCORE.fileListTAGS, false );
		} else {
			this.fileTable.fnSetColumnVis( TSCORE.fileListTAGS, true );
		}
		this.showTags = !this.showTags;
	}
	
	ExtUI.prototype.handleElementActivation = function() {
	    console.log("Entering element activation handler...");
	    
	    var tagButton = $( "#"+this.extensionID+"TagButton" );
	    
	    if (TSCORE.selectedFiles.length > 1) {
	        tagButton.prop('disabled', false);
	    } else if (TSCORE.selectedFiles.length == 1) {
	       	tagButton.prop('disabled', false);
	    } else {
	        tagButton.prop('disabled', true);
	    }    
	}

	exports.ExtUI	 				= ExtUI;
});