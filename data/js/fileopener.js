/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";
    
	console.log("Loading fileopener...");
	
	var TSCORE = require("tscore");

	var _openedFilePath = undefined; 
	
	var _openedFileProperties = undefined;
	
	var _isFileOpened = false;	

	var _tsEditor = undefined;
	
	// If a file is currently opened for editing, this var should be true
	var _isEditMode = false;	

    function initUI() {
        var options;
        
        $( "#editDocument" )
            .click(function() {
                $("#editDocument").hide();
                $("#saveDocument").show();
                editFile(_openedFilePath);
            });   
            
        $( "#saveDocument" )
            .click(function() {
            	saveFile();
            });                   

        $( "#closeOpenedFile" )
            .click(function() {
                closeFile();
            });

        $( "#nextFileButton" )
            .click(function() {
                TSCORE.FileOpener.openFile(TSCORE.PerspectiveManager.getNextFile(_openedFilePath));            
            });

        $( "#prevFileButton" )
            .click(function() {
                TSCORE.FileOpener.openFile(TSCORE.PerspectiveManager.getPrevFile(_openedFilePath));
            });
        
        $( "#closeFile" )
	        .click(function() {
	            closeFile();
	        });        

        $( "#reloadFile" )
            .click(function() {
                TSCORE.FileOpener.openFile(_openedFilePath);                     
            });

        $( "#openFileInNewWindow" )
            .click(function() {
                window.open("file:///"+_openedFilePath);
            });     
        
        $( "#printFile" )
            .click(function() {
                $('iframe').get(0).contentWindow.print();
            });   

        $( "#tagFile" )
            .click( function() {
                TSCORE.PerspectiveManager.clearSelectedFiles();
                TSCORE.selectedFiles.push(_openedFilePath);                     
                TSCORE.showAddTagsDialog();
            });  

        $( "#suggestTagsFile" )
            .click( function() {
                $("tagSuggestionsMenu").dropdown('toggle');
            });       
        
        $( "#renameFile" )
            .click( function() {
                TSCORE.showFileRenameDialog(_openedFilePath);
            });         
        
        $( "#toggleFullWidthButton" )
            .click(function() {
                TSCORE.toggleFullWidth();           
            }); 
        
        $( "#deleteFile" )
            .click( function() {
                TSCORE.showFileDeleteDialog(_openedFilePath);
            });             

        $( "#openNatively" )
            .click( function() {
                TSCORE.IO.openFile(_openedFilePath);
            }); 

        $( "#openDirectory" )
            .click( function() {
                TSCORE.IO.openDirectory(TSCORE.TagUtils.extractParentDirectoryPath(_openedFilePath));
            }); 

        $( "#fullscreenFile" )
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
                      
        $( "#openProperties" )
            .click( function() {
                showFilePropertiesDialog();
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

    function closeFile(forceClose) {
        if(_isEditMode) {
            if(forceClose) {
                document.getElementById("viewer").innerHTML = "";
                TSCORE.FileOpener.setFileOpened(false);
                TSCORE.closeFileViewer();
                _isEditMode = false;                                               
            } else {
                TSCORE.showConfirmDialog(
                    "Confirm Close",
                    "If you confirm, all made changes will be lost.", 
                    function() {
                        // Cleaning the viewer/editor
                        document.getElementById("viewer").innerHTML = "";
                        TSCORE.FileOpener.setFileOpened(false);
                        TSCORE.closeFileViewer();
                        _isEditMode = false;                               
                    }
                );                             
            }

        } else {
            // Cleaning the viewer/editor
            document.getElementById("viewer").innerHTML = "";
            TSCORE.FileOpener.setFileOpened(false);
            TSCORE.closeFileViewer();
            _isEditMode = false;            
        }
        
        // Unbinding keyboard shortcuts
        Mousetrap.unbind('mod+r');
        Mousetrap.unbind('mod+s');
        Mousetrap.unbind('esc');
        Mousetrap.unbind('alt+enter');
    }

	function openFile(filePath) {
	    console.log("Opening file: "+filePath);
		
		if(filePath == undefined) {
		    return false;
		}
		
		if(TSCORE.FileOpener.isFileEdited()) {
		    // TODO use closeFile method
            if(confirm("Any unsaved changes will be lost! Do you want to continue?")) {
                 $("#saveDocument").hide();
                _isEditMode = false;               
            } else {
                return false;   
            }
		}
                 		
	    _isEditMode = false;
	
	    _openedFilePath = filePath;    
	    $("#selectedFilePath").val(_openedFilePath.replace("\\\\","\\")); 
	    
	    var fileExt = TSCORE.TagUtils.extractFileExtension(filePath);       
	    
	    // TODO Improve preventing opening of directories 
	    if(fileExt.length < 1) {
	        console.log("Path has no extension, quiting fileopener.");
	        return false;
	    } 
	    
	    // Getting the viewer for the file extension/type
	    var viewerExt = TSCORE.Config.getFileTypeViewer(fileExt);  
        var editorExt = TSCORE.Config.getFileTypeEditor(fileExt);  
	    console.log("File Viewer: "+viewerExt+" File Editor: "+editorExt);

        // Handling the edit button depending on existense of an editor
        if(editorExt == false || editorExt == "false" || editorExt == "") {
            $( "#editDocument" ).hide();        
        } else {
            $( "#editDocument" ).show();                
        }
     
	    $( "#viewer" ).empty();
	    
	    TSCORE.IO.checkAccessFileURLAllowed();
	    
	    TSCORE.IO.getFileProperties(filePath.replace("\\\\","\\"));
        
        if(!viewerExt) {
            require([TSCORE.Config.getExtensionPath()+"/viewerText/extension.js"], function(viewer) {
                _tsEditor = viewer;
                _tsEditor.init(filePath, "viewer", true);
            });        
	    /* } else if (viewerExt == "viewerBrowser") {
            var filePathURI = undefined;
            if(isCordova) {
                filePathURI = filePath;            
            } else {
                filePathURI = "file:///"+filePath;  
            }
            
		    $('#viewer').append($('<iframe>', {
		    	id: "iframeViewer",
				src: filePathURI,
				"nwdisable": "",
				"nwfaketop": "",
		    })
		    ); */
	    } else {
	        require([TSCORE.Config.getExtensionPath()+"/"+viewerExt+"/extension.js"], function(viewer) {
	            _tsEditor = viewer;
	            _tsEditor.init(filePath, "viewer", true);
	        });
	    }

        updateUI();  
        initTagSuggestionMenu(filePath);
	    
        // Clearing file selection on file load and adding the current file path to the selection
        TSCORE.PerspectiveManager.clearSelectedFiles();
        TSCORE.selectedFiles.push(filePath); 	     
	    
	    TSCORE.FileOpener.setFileOpened(true); 
		TSCORE.openFileViewer();

		// Handling the keybindings
	    Mousetrap.unbind('mod+r');
		Mousetrap.bind('mod+r', function() {
	    	reloadFile();
	    	return false;
	    });

	    Mousetrap.unbind('mod+s');
		Mousetrap.bind('mod+s', function() {
	    	saveFile();
	    	return false;
	    });		
		
	    Mousetrap.unbind('esc');
		Mousetrap.bind('esc', function() {
	    	closeFile();
	    	return false;
	    });		
		
	    Mousetrap.unbind('alt+enter');
		Mousetrap.bind('alt+enter', function() {
			showFilePropertiesDialog();
			return false;
	    });				
	    
	} 
	
    function setFileProperties(fileProperties) {
        _openedFileProperties = fileProperties;            
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

	function reloadFile() {
	    console.log("Reloading current file.");
    	TSCORE.FileOpener.openFile(_openedFilePath); 
	}	
	
	function saveFile() {
	    console.log("Save current file: "+_openedFilePath);
        TSCORE.showConfirmDialog(
                "Confirm File Save",
                "Do you really want to overwrite the current file?", 
                function() {
                    $("#saveDocument").hide();
                    $("#editDocument").show();      
            	    var content = _tsEditor.getContent();
            	    TSCORE.IO.saveTextFile(_openedFilePath, content);   	    	
                    _isEditMode = false;              
                }
            );	    
	}
	
	function updateUI() {
        $("#saveDocument").hide();
        		
		// Initialize File Extension
        var fileExtension = TSCORE.TagUtils.extractFileExtension(_openedFilePath);
		$( "#fileExtText" ).text(fileExtension);
	    
	    // Initialize File Title Editor
        var title = TSCORE.TagUtils.extractTitle(_openedFilePath);
        
        $("#fileTitle").editable('destroy');

        $("#fileTitle").text(title);
//        $("#fileTitle").attr("title",title);

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
				
				//$(ui.helper).remove(); 
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
	
	    // Add tag suggestion based on the last modified date 
	    if(_openedFileProperties != undefined) {
            suggTags.push(TSCORE.TagUtils.formatDateTime4Tag(_openedFileProperties.lmdt));
            suggTags.push(TSCORE.TagUtils.formatDateTime4Tag(_openedFileProperties.lmdt, true));	        
	    }
	    
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
	
	// TODO Make file properties dialog accessible from core
    function showFilePropertiesDialog() {
        require([
              "text!templates/FilePropertiesDialog.html",
            ], function(uiTPL) {
                if($("#dialogFileProperties").length < 1) {                
                    var uiTemplate = Handlebars.compile( uiTPL );
                    $('body').append(uiTemplate());    
                }
                $("#filePathProperty").val(_openedFileProperties.path);
                $("#fileSizeProperty").val(_openedFileProperties.size);
                $("#fileLMDTProperty").val(new Date(_openedFileProperties.lmdt));                                
                $('#dialogFileProperties').modal({backdrop: 'static',show: true});        
        });
    } 	
  
    // Public API definition 
    exports.initUI                              = initUI;
    exports.openFile                    		= openFile;
    exports.closeFile                           = closeFile;
    exports.saveFile                            = saveFile;
    exports.isFileOpened						= isFileOpened;
    exports.isFileEdited 						= isFileEdited;
    exports.setFileOpened						= setFileOpened;
    exports.getOpenedFilePath             		= getOpenedFilePath;  
    exports.updateEditorContent                 = updateEditorContent;
    exports.setFileProperties                   = setFileProperties;
       
});