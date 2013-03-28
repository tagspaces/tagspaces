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
	        $( "#viewer" ).text("File type not supported for viewing.");        
	        return;
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
	
	    var editorExt = getFileEditor(filePath);
	    
	    $( "#viewer" ).empty();
	    if(editorExt === false) {
	        $( "#viewer" ).text("File type not supported for editing.");        
	        return;
	    } else {
	        try {
	            require([TSCORE.Config.getExtensionPath()+"/"+editorExt+"/extension.js"], function(editr) {
	                _tsEditor = editr;
	                _tsEditor.init(filePath, "viewer");
	            });
	            _isEditMode = true;
	        } catch(ex) {
	            console.error("Loading editing extension failed: "+ex);
	        }
	    }   
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
	
	    $( "#fileTitle" ).text(title);
	    
	    // Generate tag buttons
	    $( "#fileTags" ).empty();
	    for (var i=0; i < tags.length; i++) {
	        $( "#fileTags" ).append($("<button>", { 
	            class: "tagButton", 
	            tag: tags[i], 
	            filepath: filePath, 
	            title: "Opens context menu for "+tags[i],
	            text: tags[i] 
	            }));            
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
	
	    addEditButton("#filetoolbox", filePath);
	
	    addFullScreenButton("#filetoolbox");
	
	    addOpenInWindowButton("#filetoolbox", filePath);
	
	    addTagSuggestionButton("#filetoolbox");
	
	    addCloseButton("#filetoolbox");     
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
	                text: "Tag with '"+suggTags[i]+"'" 
	                })
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
	
	function addTagSuggestionButton(container) {
	    $( ""+container ).append('<button id="openTagSuggestionMenu" title="Tag Suggestions">Tag</button>');
	    $( "#openTagSuggestionMenu" ).button({
	        text: false,
	        icons: {
	            primary: "ui-icon-tag"
	        },
	        disabled: false
	    })
	}
	
	function addEditButton(container, filePath) {
	    var buttonDisabled = false;
	    // If no editor found, disabling the button
	    if(getFileEditor(filePath) === "false") {
	        buttonDisabled = true;
	    }
		var options;
	    $( ""+container ).append('<button id="editDocument">Edit</button>');
	    $( "#editDocument" ).button({
	        text: true,        
	        icons: {
	            primary: "ui-icon-wrench"
	        },
	        disabled: buttonDisabled
	    })
	    .focus(function() {
	        this.blur();
	    })
	    .click(function() {
			if ( $( this ).text() === "Edit" ) {
				options = {
					label: "Save&Close",
					icons: {
						primary: "ui-icon-disk"
					}
				};
	        	editFile(filePath);
			} else {
			    if(confirm("Do you really want to overwrite the current file?")) {
	                options = {
	                    label: "Edit",
	                    icons: {
	                        primary: "ui-icon-wrench"
	                    }
	                };
	                saveFile(filePath);
	        		openFile(filePath);                   
			    }
			}
			$( this ).button( "option", options );    	
	    });        
	}
	
	function addOpenInWindowButton(container, filePath) {
	    $( ""+container ).append('<button id="openInNewWindow">Open in New Tab</button>');
	    $( "#openInNewWindow" ).button({
	        text: false,        
	        icons: {
	            primary: "ui-icon-extlink" // newwin
	        },
	        disabled: false
	    })
	    .click(function() {
	        window.open("file:///"+filePath);
	    });        
	}
	
	function addCloseButton(container) {
	    $( ""+container ).append('<button id="closeOpenedFile">Close Viewer</button>');
	    $( "#closeOpenedFile" ).button({
	        text: false,        
	        icons: {
	            primary: "ui-icon-circle-close"
	        },
	        disabled: false
	    })
	    .click(function() {
	        if(_isEditMode) {
	            if(confirm("If you confirm, all made changes will be lost.")){
	                // Cleaning the viewer/editor
	                document.getElementById("viewer").innerHTML = "";
					TSCORE.FileOpener.setFileOpened(false);
					TSCORE.closeFileViewer();
	                _isEditMode = false;                
	            }
	        } else {
	            // Cleaning the viewer/editor
	            document.getElementById("viewer").innerHTML = "";
	            TSCORE.FileOpener.setFileOpened(false);
				TSCORE.closeFileViewer();
	            _isEditMode = false;            
	        }
	    });    
	}
	
	function addFullScreenButton(container) {
	    $( ""+container ).append('<button id="startFullscreen">Fullscreen</button>');
	    $( "#startFullscreen" ).button({
	        text: false,        
	        icons: {
	            primary: "ui-icon-arrow-4-diag"
	        },
	        disabled: false
	    })
	    .click(function() {
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
    exports.setFileOpened						= setFileOpened;
    exports.getOpenedFilePath             		= getOpenedFilePath;  
    exports.updateEditorContent                 = updateEditorContent;
                                                          
});