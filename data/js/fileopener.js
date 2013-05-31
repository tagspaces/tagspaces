/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";
    
	console.debug("Loading fileOpener...");
	
	var TSCORE = require("tscore");

	var _openedFilePath = undefined; 
	
	var _isFileOpened = false;	

	var _tsEditor = undefined;
	
	// If a file is currently opened for editing, this var should be true
	var _isEditMode = false;	

	function isFileEdited() {
		return _isEditMode;
	}	
	
	function isFileOpened() {
		return _isFileOpened;
	}	

	function setFileOpened(fileOpened) {
		_isFileOpened = fileOpened;
	}
	
	function getOpenedFilePath() {
		return _openedFilePath;
	}

	function openFile(filePath) {
	    console.debug("Opening file: "+filePath);
		
		if(TSCORE.FileOpener.isFileEdited()) {
			if(!confirm("Any unsaved changes will be lost! \nDo you want to continue?")) {
				return false;
			}
		}
		
	    _isEditMode = false;
	
	    _openedFilePath = filePath;    
	    $("#selectedFilePath").val(_openedFilePath.replace("\\\\","\\")); 
	    
	    var fileExt = TSCORE.TagUtils.extractFileExtension(filePath);
	
	    constructFileViewerUI(filePath);         
	
	    // Getting the viewer for the file extension/type
	    var viewerExt = TSCORE.Config.getFileTypeViewer(fileExt);  
	    console.debug("File Viewer: "+viewerExt);
	
	    initTagSuggestionMenu(filePath);
	
	    $( "#viewer" ).empty();
	    if(!viewerExt) {
	        $( "#viewer" ).html("<div class='alert alert-info'><strong>Info</strong> File type not supported for viewing."+
	                            "<button type='button' class='close' data-dismiss='alert'>×</button></div>");        
	    } else if (viewerExt == "viewerBrowser") {
		    filePath = "file:///"+filePath;
		    $('#viewer').append($('<iframe>', {
		    	id: "iframeViewer",
				src: filePath
		    }));    	
	    } else {
	        require([TSCORE.Config.getExtensionPath()+"/"+viewerExt+"/"+"extension.js"], function(viewer) {
	            _tsEditor = viewer;
	            _tsEditor.init(filePath, "viewer");
	            _tsEditor.viewerMode(true);
	        });
	    } 
	    TSCORE.FileOpener.setFileOpened(true); 
		TSCORE.openFileViewer();
	} 
	
	function updateEditorContent(fileContent) {
	    console.debug("Updating editor"); // with data: "+fileContent); 
	    _tsEditor.setContent(fileContent);    
	}
	
	// Should return false if no editor found
	function getFileEditor(filePath) {
	    var fileExt = TSCORE.TagUtils.extractFileExtension(filePath);
	
	    // Getting the editor for the file extension/type
	    var editorExt = TSCORE.Config.getFileTypeEditor(fileExt);  
	    console.debug("File Editor: "+editorExt);
	    return editorExt;    
	}
	
	function editFile(filePath) {
	    console.debug("Editing file: "+filePath);

        $( "#viewer" ).empty();
	
	    var editorExt = getFileEditor(filePath);
/*	    if(editorExt === false || editorExt == "false" || editorExt == "") {
            $( "#viewer" ).html("<div class='alert alert-info'><strong>Info</strong> File type not supported for editing.."); 
	        return;
	    } else {*/
	        try {
	            require([TSCORE.Config.getExtensionPath()+"/"+editorExt+"/extension.js"], function(editr) {
	                _tsEditor = editr;
	                _tsEditor.init(filePath, "viewer");
	            });
	            _isEditMode = true;
	        } catch(ex) {
	            console.error("Loading editing extension failed: "+ex);
	        }
	   // }   
	} 
	
	function saveFile(filePath) {
	    console.debug("Save current file: "+filePath);
	    var content = _tsEditor.getContent();
	    TSCORE.IO.saveTextFile(filePath, content);   	    	
	}
	
	function constructFileViewerUI(filePath) {
	    // Adding tag buttons to the filetoolbox
	    var tags = TSCORE.TagUtils.extractTags(filePath);
	    
	    var title = TSCORE.TagUtils.extractTitle(filePath);
		var fileExtension = TSCORE.TagUtils.extractFileExtension(filePath);
		
		$("#fileTitle").unbind('.editInPlace');
		$("#fileTitle").data('editInPlace',false);
	
	    $( "#fileTitle" ).text(title);
	    
	    $( "#fileTitle" ).editInPlace({
			callback: function(unused, newTitle) { TSCORE.TagUtils.changeTitle(filePath,newTitle); },
    		show_buttons: false,
    		callback_skip_dom_reset: true
		});	    

	    // Generate tag & ext buttons
	    $( "#fileTags" ).empty();
        $( "#fileTags" ).append($('<button>', {
                    title: "Opens context menu for "+fileExtension,
                    tag: fileExtension,
                    "class":  "btn btn-small btn-info extTagButton",                
                    text: fileExtension+" "
                })
                .click( function() {
                    TSCORE.selectedTag = fileExtension;
                })                
                .dropdown( 'attach' , '#extensionMenu' ) 
                .append($("<span>", { class: "caret"}))
             ); 	    
	    
	    for (var i=0; i < tags.length; i++) {
	        $( "#fileTags" ).append($("<button>", { 
	            "class":  "btn btn-success btn-small tagButton", 
	            tag: tags[i], 
	            filepath: filePath, 
	            title: "Opens context menu for "+tags[i],
	            text: tags[i]+" " 
	            })
	            .append($("<span>", { class: "caret"}))
	            );            
	    };    
	    
	    $( "#tagsContainer" ).droppable({
	    	accept: ".tagButton",
	    	hoverClass: "activeRow",
	    	drop: function( event, ui ) {
	    		var tagName = ui.draggable.attr("tag");
				console.log("Tagging file: "+tagName+" to "+filePath);
				TSCORE.TagUtils.addTag([filePath], [tagName]);
	    	}	            	
	    })
	
	    // Activate tagButtons in file view
	    $('.tagButton', $( "#fileTags" ))
	        .click( function() {
	            TSCORE.openTagMenu(this, $(this).attr("tag"), $(this).attr("filepath"));
	        })
	        .dropdown( 'attach' , '#tagMenu' );   
	    
	    // Clear filetoolbox
	    $( "#filetoolbox" ).empty();
	    
	    $( "#selectedFilePath" ).click(function() {
			this.select();
	    });

        $("#filetoolbox").append('<button id="toggleFullWidthButton" class="btn" title="Toggle Full Width"><i class="icon-sort icon-rotate-90"></i></button>');
        $("#filetoolbox").append('<button id="prevFileButton" class="btn" title="Go to the previous file"><i class="icon-circle-arrow-left"></i></button>');
        $("#filetoolbox").append('<button id="nextFileButton" class="btn" title="Go to the next file"><i class="icon-circle-arrow-right"></i></button>');
        $("#filetoolbox").append('<button id="editDocument" class="btn" title="Edit File"><i class="icon-pencil"></i></button>');
        //$("#filetoolbox").append('<button id="openInNewWindow" class="btn" title="Go to the previous file"><i class="icon-circle-arrow-left"></i></button>');
        $("#filetoolbox").append('<button id="openTagSuggestionMenu" class="btn" title="Tag Suggestions"><i class="icon-tags"></i> <b class="caret"></b></button>');
        //$("#filetoolbox").append('<button id="startFullscreen" class="btn" title="Open file in full screen"><i class="icon-fullscreen"></i></b></button>');
        $("#filetoolbox").append('<button id="openFileActionsMenu" data-dropdown="#fileActionsMenu" class="btn" title="Opens a menu with additional file actions"><i class="icon-th-list"></i> <b class="caret"></b></button>');
        $("#filetoolbox").append('<button id="closeOpenedFile" class="btn" title="Close file"><i class="icon-remove-sign"></i></button>');      

        $("#fileActionsMenu").empty();
        //$("#fileActionsMenu").append('<li><a id="editDocument" href="#" title="Edit file"><i class="icon-pencil"></i> Edit File</a></li>');
        $("#fileActionsMenu").append('<li><a id="showFullDetails" href="#" title="Show additional file details"><i class="icon-list-alt"></i> Show File Details</a></li>');
        $("#fileActionsMenu").append('<li><a id="openInNewWindow" href="#" title="Open file in a new tab"><i class="icon-share"></i> Open in New Tab</a></li>');
        $("#fileActionsMenu").append('<li><a id="startFullscreen" href="#" title="Open file in full screen"><i class="icon-fullscreen"></i> Open In Fullscreen</a></li>');                        

		initFileActions("#filetoolbox", filePath);
	}
	
	function initTagSuggestionMenu(filePath) {
	    var tags = TSCORE.TagUtils.extractTags(filePath);
	
	    var suggTags = TSCORE.TagUtils.suggestTags(filePath);
	
	    var tsMenu = $( "#tagSuggestionsMenu" );
	
	    $( "#tagSuggestionsMenu" ).empty(); 
	
		var suggestionMenuEmpty = true;
	
	    // Adding context menu entries for creating tags according to the suggested tags
	    for (var i=0; i < suggTags.length; i++) {        
	        // Ignoring the tags already assigned to a file
	        if(tags.indexOf(suggTags[i]) < 0) {
	            $( "#tagSuggestionsMenu" ).append($('<li>', {name: suggTags[i]}).append($('<a>', { 
	                href: "javascript:void(0);",
	                title: "Add tag "+suggTags[i]+" to current file", 
					tagname: suggTags[i],
					filepath: filePath,
	                })
	                .html("<i class='icon-tag'></i> Tag with '"+suggTags[i]+"'") 
	                .click(function() {
			            var tagName = $(this).attr( "tagname" );    
			            var filePath = $(this).attr( "filepath" );    		            
			            console.debug("Tag suggestion clicked: "+tagName);
			            TSCORE.TagUtils.writeTagsToFile(filePath, [tagName]);
			          	return false;
	        		})                
	               ));              
	             suggestionMenuEmpty = false; 
	        }         
	    };    
	
		// Showing dropdown menu only if the context menus is not empty
		if(!suggestionMenuEmpty) {
	    	$( "#openTagSuggestionMenu" ).dropdown( 'attach' , '#tagSuggestionsMenu' );		
		}
	}

	function initFileActions(container, filePath) {
	    var buttonDisabled = false;
	    // If no editor found, disabling the button
	    if(getFileEditor(filePath) === "false") {
	        buttonDisabled = true;
	    }
		var options;
		

	    $( "#editDocument" ).focus(function() {
	        this.blur();
	    })
	    .click(function() {
            var editorExt = getFileEditor(filePath);
            if(editorExt == false || editorExt == "false" || editorExt == "") {
                TSCORE.showAlertDialog("File type not supported for editing.");
                return false;    
            }

			if ( !_isEditMode ) { 
				$( this )
				    .attr("title","Save & Close")
				    .html("<i class='icon-hdd'></i>");
	        	editFile(filePath);
			} else {
			    TSCORE.showConfirmDialog("Confirm","Do you really want to overwrite the current file?", function() {
                    $( "#editDocument" )
                        .attr("title", "Edit File")                        
                        .html("<i class='icon-pencil'></i>");
                    _isEditMode = false;
                    saveFile(filePath);			        
			    });
			}
	    });        

        $( "#nextFileButton" ).click(function() {
            TSCORE.FileOpener.openFile(TSCORE.PerspectiveManager.getNextFile(_openedFilePath));            
        });

        $( "#prevFileButton" ).click(function() {
            TSCORE.FileOpener.openFile(TSCORE.PerspectiveManager.getPrevFile(_openedFilePath));
        });

        $( "#toggleFullWidthButton" ).click(function() {
            TSCORE.toggleFullWidth();           
        });

	    $( "#showFullDetails" ).click(function() {
			TSCORE.toggleFileDetails();
	    });        

	    $( "#openInNewWindow" ).click(function() {
	        window.open("file:///"+filePath);
	    });        

        $( "#closeOpenedFile" ).click(function() {
            if(_isEditMode) {
                TSCORE.showConfirmDialog("Confirm","If you confirm, all made changes will be lost.", function() {
                    // Cleaning the viewer/editor
                    document.getElementById("viewer").innerHTML = "";
                    TSCORE.FileOpener.setFileOpened(false);
                    TSCORE.closeFileViewer();
                    _isEditMode = false;                               
                });             
            } else {
                // Cleaning the viewer/editor
                document.getElementById("viewer").innerHTML = "";
                TSCORE.FileOpener.setFileOpened(false);
                TSCORE.closeFileViewer();
                _isEditMode = false;            
            }
        });

	    $( "#startFullscreen" ).click(function() {
	        var docElm = $("#viewer")[0];
	        if (docElm.requestFullscreen) {
	            docElm.requestFullscreen();
	        }
	        else if (docElm.mozRequestFullScreen) {
	            docElm.mozRequestFullScreen();
	        }
	        else if (docElm.webkitRequestFullScreen) {
	            docElm.webkitRequestFullScreen();
	        }
	    });    
	}
  
// Methods  
    exports.openFile                    		= openFile;
    exports.isFileOpened						= isFileOpened;
    exports.isFileEdited 						= isFileEdited;
    exports.setFileOpened						= setFileOpened;
    exports.getOpenedFilePath             		= getOpenedFilePath;  
    exports.updateEditorContent                 = updateEditorContent;
                                                          
});