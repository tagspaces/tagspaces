/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";
    
	console.log("Loading fileOpener...");
	
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
	    console.log("Opening file: "+filePath);
		
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
	    console.log("File Viewer: "+viewerExt);
	
	    initTagSuggestionMenu(filePath);
     
	    $( "#viewer" ).empty();
	    
	    TSCORE.IO.checkAccessFileURLAllowed();
        
        if(!viewerExt) {
	        $( "#viewer" ).html("<div class='alert alert-info'><strong>Info</strong> File type not supported for viewing."+
	                            "<button type='button' class='close' data-dismiss='alert'>×</button></div>");        
	    } else if (viewerExt == "viewerBrowser") {
	        var filePathURI = undefined;
	        
	        //TODO minimize platform specific calls
	        if(isCordova) {
                filePathURI = filePath;            
	        } else {
                filePathURI = "file:///"+filePath;  
	        }

		    $('#viewer').append($('<iframe>', {
		    	id: "iframeViewer",
				src: filePathURI
		    })); 
	    } else {
	        require([TSCORE.Config.getExtensionPath()+"/"+viewerExt+"/extension.js"], function(viewer) {
	            _tsEditor = viewer;
	            _tsEditor.init(filePath, "viewer", true);
	        });
	    }
	    
        // Clearing file selection on file load and adding the current file path to the selection
        TSCORE.PerspectiveManager.clearSelectedFiles();
        TSCORE.selectedFiles.push(filePath); 	     
	    
	    TSCORE.FileOpener.setFileOpened(true); 
		TSCORE.openFileViewer();
	} 
	
	function updateEditorContent(fileContent) {
	    console.log("Updating editor"); // with data: "+fileContent); 
	    _tsEditor.setContent(fileContent);    
	}
	
	// Should return false if no editor found
	function getFileEditor(filePath) {
	    var fileExt = TSCORE.TagUtils.extractFileExtension(filePath);
	
	    // Getting the editor for the file extension/type
	    var editorExt = TSCORE.Config.getFileTypeEditor(fileExt);  
	    console.log("File Editor: "+editorExt);
	    return editorExt;    
	}
	
	function editFile(filePath) {
	    console.log("Editing file: "+filePath);

        $( "#viewer" ).empty();
	
	    var editorExt = getFileEditor(filePath);
/*	    if(editorExt === false || editorExt == "false" || editorExt == "") {
            $( "#viewer" ).html("<div class='alert alert-info'><strong>Info</strong> File type not supported for editing.."); 
	        return;
	    } else {*/
	        try {
	            require([TSCORE.Config.getExtensionPath()+"/"+editorExt+"/extension.js"], function(editr) {
	                _tsEditor = editr;
	                _tsEditor.init(filePath, "viewer", false);
	            });
	            _isEditMode = true;
	        } catch(ex) {
	            console.error("Loading editing extension failed: "+ex);
	        }
	   // }   
	} 
	
	function saveFile(filePath) {
	    console.log("Save current file: "+filePath);
	    var content = _tsEditor.getContent();
	    TSCORE.IO.saveTextFile(filePath, content);   	    	
	}
	
	function constructFileViewerUI(filePath) {
	    // Adding tag buttons to the filetoolbox
	    
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

        // Appending ext button
        $( "#fileTags" ).append(TSCORE.generateExtButton(fileExtension,filePath));
        
        // Appending tag buttons	    
        var tags = TSCORE.TagUtils.extractTags(filePath);
	    var tagString = "";
	    tags.forEach(function (value, index) {         
            if(index == 0) {
                tagString = value;                 
            } else {
                tagString = tagString + "," +value;                                 
            }
        }) 
	    $( "#fileTags" ).append(TSCORE.generateTagButtons(tagString,filePath));
    
	    $( "#tagsContainer" ).droppable({
	        greedy: "true", 
	    	accept: ".tagButton",
	    	hoverClass: "activeRow",
	    	drop: function( event, ui ) {
				console.log("Tagging file: "+TSCORE.selectedTag+" to "+filePath);
				TSCORE.TagUtils.addTag([filePath], [TSCORE.selectedTag]);
				$(ui.helper).remove(); 
	    	}	            	
	    })
	
	    // Activate tagButtons in file view
	    $('.tagButton', $( "#fileTags" ))
	        .click( function() {
	            TSCORE.openTagMenu(this, $(this).attr("tag"), $(this).attr("filepath"));
	        })
	        .dropdown( 'attach' , '#tagMenu' );   

        $('.extTagButton', $( "#fileTags" ))
            .click( function() {
                TSCORE.selectedTag = fileExtension;
            })
            .dropdown( 'attach' , '#extensionMenu' );
	    
	    // Clear filetoolbox
	    $( "#filetoolbox" ).empty();
	    
	    $( "#selectedFilePath" ).click(function() {
			this.select();
	    });

        $("#filetoolbox").append('<div id="layoutToolbar" class="btn-group"></div>');
        $("#filetoolbox").append('<div id="actionToolbar" class="btn-group"></div>');
        $("#filetoolbox").append('<div id="navigationToolbar" class="btn-group"></div>');        
        
        $("#layoutToolbar").append('<button id="toggleFullWidthButton" class="btn" title="Toggle Full Width"><i class="icon-sort icon-rotate-90"></i></button>');
        
        $("#actionToolbar").append('<button id="editDocument" class="btn" title="Edit File"><i class="icon-pencil"></i></button>');
        //$("#actionToolbar").append('<button id="openInNewWindow" class="btn" title="Go to the previous file"><i class="icon-circle-arrow-left"></i></button>');
        $("#actionToolbar").append('<button id="openTagSuggestionMenu" class="btn" title="Tag File"><i class="icon-tags"></i> <b class="caret"></b></button>');
        //$("#actionToolbar").append('<button id="startFullscreen" class="btn" title="Open file in full screen"><i class="icon-fullscreen"></i></b></button>');
        $("#actionToolbar").append('<button id="openFileActionsMenu" data-dropdown="#fileActionsMenu" class="btn" title="Additional File Actions"><i class="icon-th-list"></i> <b class="caret"></b></button>');

        $("#navigationToolbar").append('<button id="prevFileButton" class="btn" title="Go to Previous File"><i class="icon-circle-arrow-left"></i></button>');
        $("#navigationToolbar").append('<button id="nextFileButton" class="btn" title="Go to Next File"><i class="icon-circle-arrow-right"></i></button>');
        $("#navigationToolbar").append('<button id="closeOpenedFile" class="btn" title="Close file"><i class="icon-remove-sign"></i></button>');      

        $("#fileActionsMenu").empty();
        //$("#fileActionsMenu").append('<li><a id="editDocument" title="Edit file"><i class="icon-pencil"></i> Edit File</a></li>');
        $("#fileActionsMenu").append('<li><a id="reloadFile" title="Reloads Current File"><i class="icon-refresh"></i> Reload File</a></li>');        
        $("#fileActionsMenu").append('<li><a id="showFullDetails" title="Show Additional File Details"><i class="icon-list-alt"></i> Show File Details</a></li>');
        $("#fileActionsMenu").append('<li><a id="openInNewWindow" title="Open File in a New Tab"><i class="icon-share"></i> Open in New Tab</a></li>');
        $("#fileActionsMenu").append('<li><a id="startFullscreen" title="Open File in Fullscreen"><i class="icon-fullscreen"></i> Open in Fullscreen</a></li>');                        
        //$("#fileActionsMenu").append('<li><a id="printButton" title="Print Content from File Viewer"><i class="icon-print"></i> Print</a></li>');                        

		initFileActions("#filetoolbox", filePath);
	}
	
	function initTagSuggestionMenu(filePath) {
	    var tags = TSCORE.TagUtils.extractTags(filePath);
	
	    var suggTags = TSCORE.TagUtils.suggestTags(filePath);
	
	    var tsMenu = $( "#tagSuggestionsMenu" );
	
	    $( "#tagSuggestionsMenu" ).empty(); 
	
//		var suggestionMenuEmpty = true;

        $( "#tagSuggestionsMenu" ).append($('<li>', {name: suggTags[i]}).append($('<a>', { 
            title: "Add a tag to the current file", 
            filepath: filePath,
            text: " Add Tag",
            })
            .prepend("<i class='icon-tag'></i>") 
            .click(function() {
                TSCORE.PerspectiveManager.clearSelectedFiles();
                TSCORE.selectedFiles.push(filePath);                     
                TSCORE.showAddTagsDialog();
            })                
        )); 
        $( "#tagSuggestionsMenu" ).append($('<li>', {class: "divider"}));
        $( "#tagSuggestionsMenu" ).append($('<li>').append($('<a>', {text: " Tag Suggestions:" })))      
	
	    // Adding context menu entries for creating tags according to the suggested tags
	    for (var i=0; i < suggTags.length; i++) {        
	        // Ignoring the tags already assigned to a file
	        if(tags.indexOf(suggTags[i]) < 0) {
	            $( "#tagSuggestionsMenu" ).append($('<li>', {name: suggTags[i]}).append($('<a>', { 
	                title: "Add tag "+suggTags[i]+" to current file", 
					tagname: suggTags[i],
					filepath: filePath,
					//text: " Tag with '"+suggTags[i]+"'",
	                })
                    .append($('<button>', {
                        title: "Tag with "+suggTags[i],
                        "class":  "btn btn-small btn-success tagButton", 
                        text: suggTags[i]
                    }))	                
	                .click(function() {
			            var tagName = $(this).attr( "tagname" );    
			            var filePath = $(this).attr( "filepath" );    		            
			            console.log("Tag suggestion clicked: "+tagName);
			            TSCORE.TagUtils.writeTagsToFile(filePath, [tagName]);
			          	return false;
	        		})                
	               ));              
//	             suggestionMenuEmpty = false; 
	        }         
	    };    
	
		// Showing dropdown menu only if the context menus is not empty
//		if(!suggestionMenuEmpty) {
	    	$( "#openTagSuggestionMenu" ).dropdown( 'attach' , '#tagSuggestionsMenu' );		
//		}
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
				    .html("<i class='icon-save'></i>");
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

        $( "#reloadFile" ).click(function() {
            TSCORE.FileOpener.openFile(_openedFilePath);                     
        });

	    $( "#showFullDetails" ).click(function() {
			TSCORE.toggleFileDetails();
	    });        

	    $( "#openInNewWindow" ).click(function() {
	        window.open("file:///"+filePath);
	    });     
	    
        $( "#printButton" ).click(function() {
            $('iframe').get(0).contentWindow.print();
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