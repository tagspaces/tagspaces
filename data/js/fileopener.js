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

    function initUI() {
        var options;
        
        $( "#editDocument" )
            /*.focus(function() {
                this.blur();
            })*/
            .click(function() {
                if ( _isEditMode ) { 
                    TSCORE.showConfirmDialog("Confirm","Do you really want to overwrite the current file?", function() {
                        $("#editDocument").html("&nbsp;&nbsp;<i class='fa fa-pencil-square'></i>&nbsp;&nbsp;");
                        _isEditMode = false;
                        saveFile(_openedFilePath);                 
                    });
                } else {
                    $(this).html("&nbsp;&nbsp;<i class='fa fa-save'></i>&nbsp;&nbsp;");
                    editFile(_openedFilePath);
                }
            });        

        $( "#nextFileButton" )
            .click(function() {
                TSCORE.FileOpener.openFile(TSCORE.PerspectiveManager.getNextFile(_openedFilePath));            
            });

        $( "#prevFileButton" )
            .click(function() {
                TSCORE.FileOpener.openFile(TSCORE.PerspectiveManager.getPrevFile(_openedFilePath));
            });

        $( "#reloadFile" )
            .click(function() {
                TSCORE.FileOpener.openFile(_openedFilePath);                     
            });

        $( "#showFullDetails" )
            .click(function() {
                TSCORE.toggleFileDetails();
            });        

        $( "#openFileInNewWindow" )
            .click(function() {
                window.open("file:///"+_openedFilePath);
            });     
        
        $( "#printFile" ).click(function() {
            $('iframe').get(0).contentWindow.print();
        });   
        
        $( "#openDirectory" ).click( function() {
            TSCORE.IO.openDirectory(TSCORE.currentPath);
        }); 
        
        $( "#renameFile" ).click( function() {
            TSCORE.showFileRenameDialog();
        });         
        
        $( "#toggleFullWidthButton" ).click(function() {
            TSCORE.toggleFullWidth();           
        }); 
        
        $( "#deleteFile" ).click( function() {
            console.log("Deleting file...");
            TSCORE.showConfirmDialog(
                "Delete File",
                "This item will be permanently deleted and cannot be recovered. Are you sure?",
                function() {
                    TSCORE.IO.deleteElement(_openedFilePath);
                }
            );
        });             

        $( "#closeOpenedFile" ).click(function() {
            // TODO Extract as function for the API
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

        $( "#fullscreenFile" ).click(function() {
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
            if(confirm("Any unsaved changes will be lost! Do you want to continue?")) {
                 $("#editDocument").html("&nbsp;&nbsp;<i class='fa fa-pencil-square'></i>&nbsp;&nbsp;");
                _isEditMode = false;               
            } else {
                return false;   
            }
		}
		
	    _isEditMode = false;
	
	    _openedFilePath = filePath;    
	    $("#selectedFilePath").val(_openedFilePath.replace("\\\\","\\")); 
	    
	    var fileExt = TSCORE.TagUtils.extractFileExtension(filePath);
	
	    updateUI();         
	
	    // Getting the viewer for the file extension/type
	    var viewerExt = TSCORE.Config.getFileTypeViewer(fileExt);  
        var editorExt = TSCORE.Config.getFileTypeEditor(fileExt);  
	    console.log("File Viewer: "+viewerExt+" File Editor: "+editorExt);

        // Handling the edit button
        if(!editorExt) {
            $( "#editDocument" ).hide();        
        } else {
            $( "#editDocument" ).show();                
        }

	    initTagSuggestionMenu(filePath);
     
	    $( "#viewer" ).empty();
	    
	    TSCORE.IO.checkAccessFileURLAllowed();
        
        if(!viewerExt) {
	        $( "#viewer" ).html("<div class='alert alert-info'><strong>Info</strong> File type not supported for viewing.</div>");        
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
        try {
            require([TSCORE.Config.getExtensionPath()+"/"+editorExt+"/extension.js"], function(editr) {
                _tsEditor = editr;
                _tsEditor.init(filePath, "viewer", false);
            });
            _isEditMode = true;
        } catch(ex) {
            console.error("Loading editing extension failed: "+ex);
        }
	} 
	
	function saveFile(filePath) {
	    console.log("Save current file: "+filePath);
	    var content = _tsEditor.getContent();
	    TSCORE.IO.saveTextFile(filePath, content);   	    	
	}
	
	function updateUI() {
		
		// Initialize File Extension
        var fileExtension = TSCORE.TagUtils.extractFileExtension(_openedFilePath);
		$( "#fileExtText" ).text(fileExtension);
	    
	    // Initialize File Title Editor
        var title = TSCORE.TagUtils.extractTitle(_openedFilePath);
	    $("#fileTitle").text(title);
        //$("#fileTitle").attr("title",title);
        
        $("#fileTitle").editable('destroy');
        $("#fileTitle").editable({
            type: 'textarea',
            placement: 'bottom',
            title: 'New File Title',
            //mode: 'inline',
            success: function(response, newValue) {
                TSCORE.TagUtils.changeTitle(_openedFilePath,newValue);
            },            
        });

	    // Generate tag & ext buttons
	    $( "#fileTags" ).empty();
        
        // Appending tag buttons	    
        var tags = TSCORE.TagUtils.extractTags(_openedFilePath);
	    var tagString = "";
	    tags.forEach(function (value, index) {         
            if(index == 0) {
                tagString = value;                 
            } else {
                tagString = tagString + "," +value;                                 
            }
        }); 
	    $( "#fileTags" ).append(TSCORE.generateTagButtons(tagString,_openedFilePath));
    
	    $( "#tagsContainer" ).droppable({
	        greedy: "true", 
	    	accept: ".tagButton",
	    	hoverClass: "activeRow",
	    	drop: function( event, ui ) {
				console.log("Tagging file: "+TSCORE.selectedTag+" to "+_openedFilePath);
				TSCORE.TagUtils.addTag([_openedFilePath], [TSCORE.selectedTag]);
				$(ui.helper).remove(); 
	    	}	            	
	    });
	       
		// Init Tag Context Menus
	    $('#fileTags').on("contextmenu click", ".tagButton", function (e) {
			TSCORE.hideAllDropDownMenus();
			
	        TSCORE.openTagMenu(this, $(this).attr("tag"), $(this).attr("filepath"));
	        
	        $("#tagMenu").css({
	            display: "block",
	            left: e.pageX,
	            top: e.pageY
	        });
            // TODO use the showContextMenu method
            //TSCORE.showContextMenu("#tagMenu", $(this));	       
	        return false;
	    });		
	}
	
	function initTagSuggestionMenu(filePath) {
	    var tags = TSCORE.TagUtils.extractTags(filePath);	
	    var suggTags = TSCORE.TagUtils.suggestTags(filePath);
	
	    var tsMenu = $( "#tagSuggestionsMenu" );	
	    tsMenu.empty(); 
        tsMenu.append($('<li class="dropdown-header">Tagging Actions<button type="button" class="close">×</button></li>'));      
        tsMenu.append($('<li>', {name: suggTags[i]}).append($('<a>', { 
            title: "Add a tag to the current file", 
            filepath: filePath,
            text: " Add Tag",
            })
            .prepend("<i class='fa fa-tag'></i>") 
            .click(function() {
                TSCORE.PerspectiveManager.clearSelectedFiles();
                TSCORE.selectedFiles.push(filePath);                     
                TSCORE.showAddTagsDialog();
            })                
        )); 
        tsMenu.append($('<li class="dropdown-header"><span id="">Suggested Tags:</span></li>'));      
	
	    // Adding context menu entries for creating tags according to the suggested tags
	    for (var i=0; i < suggTags.length; i++) {        
	        // Ignoring the tags already assigned to a file
	        if(tags.indexOf(suggTags[i]) < 0) {
	            tsMenu.append($('<li>', {name: suggTags[i]}).append($('<a>', { 
	                title: "Add tag "+suggTags[i]+" to current file", 
					tagname: suggTags[i],
					filepath: filePath,
					//text: " Tag with '"+suggTags[i]+"'",
	                })
                    .append($('<button>', {
                        title: "Tag with "+suggTags[i],
                        "class":  "btn btn-sm btn-success tagButton", 
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
	        }         
	    };
	}
  
    // Public API definition 
    exports.initUI                              = initUI;
    exports.openFile                    		= openFile;
    exports.isFileOpened						= isFileOpened;
    exports.isFileEdited 						= isFileEdited;
    exports.setFileOpened						= setFileOpened;
    exports.getOpenedFilePath             		= getOpenedFilePath;  
    exports.updateEditorContent                 = updateEditorContent;
                                                          
});