/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
//define(function(require, exports, module) {
//"use strict";
//    console.log(module.id);
//    console.log(module.uri);
    
console.debug("Loading FileViewer...");

var FileViewer = (typeof FileViewer == 'object' && FileViewer != null) ? FileViewer : {};

FileViewer.openFile = function(filePath) {
    console.debug("Opening file: "+filePath);

    FileViewer.isEditMode = false;

    var openedFilePath = filePath;    
    $("#selectedFilePath").val(openedFilePath.replace("\\\\","\\")); 
    
    var fileExt = TSAPI.extractFileExtension(filePath);

    this.constructFileViewerUI(filePath);         

    // Getting the viewer for the file extension/type
    var viewerExt = TSSETTINGS.getFileTypeViewer(fileExt);  
    console.debug("File Viewer: "+viewerExt);

	UIAPI.openFileViewer();

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
        require([TSSETTINGS.getExtensionPath()+"/"+viewerExt+"/"+"extension.js"], function(viewer) {
            tsEditor = viewer;
            tsEditor.init(filePath, "viewer");
            tsEditor.viewerMode(true);
        });
    }  
} 

var tsEditor = undefined;

// If a file is currently opened for editing, this var should be true
FileViewer.isEditMode = false;

FileViewer.updateEditorContent = function(fileContent) {
    console.debug("Updating editor"); // with data: "+fileContent); 
    tsEditor.setContent(fileContent);    
}

// Should return false if no editor found
FileViewer.getFileEditor = function(filePath) {
    var fileExt = TSAPI.extractFileExtension(filePath);

    // Getting the editor for the file extension/type
    var editorExt = TSSETTINGS.getFileTypeEditor(fileExt);  
    console.debug("File Editor: "+editorExt);
    return editorExt;    
}

FileViewer.editFile = function(filePath) {
    console.debug("Editing file: "+filePath);

    var editorExt = FileViewer.getFileEditor(filePath);
    
    $( "#viewer" ).empty();
    if(editorExt === false) {
        $( "#viewer" ).text("File type not supported for editing.");        
        return;
    } else {
        try {
            require([TSSETTINGS.getExtensionPath()+"/"+editorExt+"/"+"extension.js"], function(editr) {
                tsEditor = editr;
                tsEditor.init(filePath, "viewer");
            });
            FileViewer.isEditMode = true;
        } catch(ex) {
            console.error("Loading editing extension failed: "+ex);
        }
    }   
} 

FileViewer.saveFile = function(filePath) {
    console.debug("Save current file: "+filePath);
    var content = tsEditor.getContent();
    IOAPI.saveTextFile(filePath, content);    	
}

FileViewer.constructFileViewerUI = function(filePath) {
    // Adding tag buttons to the filetoolbox
    var tags = TSAPI.extractTags(filePath);

    $( "#fileTitle" ).text();
    
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
			TSAPI.addTag([filePath], tagName);
    	}	            	
    })

    // Activate tagButtons in file view
    $('.tagButton', $( "#fileTags" ))
        .click( function() {
            TagsUI.openTagMenu(this, $(this).attr("tag"), $(this).attr("filepath"));
        })
        .dropdown( 'attach' , '#tagMenu' );   
    
    // Clear filetoolbox
    $( "#filetoolbox" ).empty();

    this.addEditButton("#filetoolbox", filePath);

    this.addFullScreenButton("#filetoolbox");

    this.addOpenInWindowButton("#filetoolbox", filePath);

    // TODO Tag suggestion disabled due menu init issue
    this.initTagSuggestionMenu(filePath, tags);
    this.addTagSuggestionButton("#filetoolbox");

    this.addCloseButton("#filetoolbox");     
}

FileViewer.initTagSuggestionMenu = function(filePath, tags) {
    var suggTags = TSAPI.suggestTags(filePath);

    var tsMenu = $( "#tagSuggestionsMenu" );
    tsMenu.menu();
//    tsMenu.menu("disable");
    tsMenu.empty(); 

    // Adding context menu entries for creating tags according to the suggested tags
    for (var i=0; i < suggTags.length; i++) {        
        // Ignoring the tags already assigned to a file
        if(tags.indexOf(suggTags[i]) < 0) {
            tsMenu.append($('<li>', {name: suggTags[i]}).append($('<a>', { 
                href: "javascript:void(0);",
                title: "Add tag "+suggTags[i]+" to current file", 
				filepath: filePath,
                text: "Tag with '"+suggTags[i]+"'" 
                })));               
        }         
    };
    
    tsMenu.menu({
        select: function( event, ui ) {
            var tagName = ui.item.attr( "name" );    
            TSAPI.writeTagsToFile(filePath, [tagName]);
        }         
    });  
}

FileViewer.addTagSuggestionButton = function(container) {
    $( ""+container ).append('<button id="openTagSuggestionMenu">Tag</button>');
    $( "#openTagSuggestionMenu" ).button({
        text: false,        
        icons: {
            primary: "ui-icon-tag"
        },
        disabled: false
    })
    .dropdown( 'attach' , '#tagSuggestionsMenu' );  
}

FileViewer.addEditButton = function(container, filePath) {
    var buttonDisabled = false;
    // If no editor found, disabling the button
    if(FileViewer.getFileEditor(filePath) === false) {
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
    .click(function() {
		if ( $( this ).text() === "Edit" ) {
			options = {
				label: "Save&Close",
				icons: {
					primary: "ui-icon-disk"
				}
			};
        	FileViewer.editFile(filePath);
		} else {
		    if(confirm("Do you really want to overwrite the current file?")) {
                options = {
                    label: "Edit",
                    icons: {
                        primary: "ui-icon-wrench"
                    }
                };
                FileViewer.saveFile(filePath);
        		UIAPI.openFile(filePath);                   
		    }
		}
		$( this ).button( "option", options );    	
    });        
}

FileViewer.addOpenInWindowButton = function(container, filePath) {
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

FileViewer.addCloseButton = function(container) {
    $( ""+container ).append('<button id="closeOpenedFile">Close Viewer</button>');
    $( "#closeOpenedFile" ).button({
        text: false,        
        icons: {
            primary: "ui-icon-circle-close"
        },
        disabled: false
    })
    .click(function() {
        if(FileViewer.isEditMode) {
            if(confirm("If you confirm, all made changes will be lost.")){
                // Cleaning the viewer/editor
                document.getElementById("viewer").innerHTML = "";
				UIAPI.closeFileViewer();
                FileViewer.isEditMode = false;                
            }
        } else {
            // Cleaning the viewer/editor
            document.getElementById("viewer").innerHTML = "";
            UIAPI.isFileOpened = false;
			UIAPI.closeFileViewer();
            FileViewer.isEditMode = false;            
        }
    });    
}

FileViewer.addFullScreenButton = function(container) {
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
  
//});