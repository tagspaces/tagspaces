/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define([
    'require',
    'exports',
    'module',
],function(require, exports, module) {
"use strict";

console.debug("Loading: viewThumb/extension.js");

exports.Title = "Thumbs"
exports.ID = "viewThumb";  // ID should be equal to the directory name where the ext. is located   
exports.Type =  "view";
exports.Icon = "ui-icon-image";

var viewContainer = undefined;
var viewToolbar = undefined;
var viewFooter = undefined;

exports.init = function init() {
	console.debug("Initializing View "+exports.ID);
	
    viewContainer = $("#"+exports.ID+"Container");
    viewToolbar = $("#"+exports.ID+"Toolbar");
	viewFooter = $("#"+exports.ID+"Footer");
	
	viewContainer.empty();
	viewToolbar.empty();
	viewFooter.empty();	
	
    viewToolbar.append($("<button>", { 
        text: "New",
		disabled: true,
        title: "Create new file",
        id: exports.ID+"CreateFileButton",    
    }));
	
    viewContainer.append($("<ol>", { 
        style: "overflow: visible;",
        class: "selectableFiles",
        id: exports.ID+"SelectableFiles",
        text: "Empty viewer."    
    }));	
	
    $( "#"+exports.ID+"SelectableFiles" ).selectable({
        stop: function() {
            UIAPI.selectedFiles = [];          
            $( ".ui-selected", this ).each(function() {
                UIAPI.selectedFiles.push($(this).attr("title"));
            });
            console.debug("Selected files: "+UIAPI.selectedFiles);
         //   UIAPI.handleElementActivation();
            
            // On selecting only one file opens it in the viewer
            if(UIAPI.selectedFiles.length == 1) {
				UIAPI.openFile(UIAPI.currentPath+UIAPI.getDirSeparator()+UIAPI.selectedFiles[0]);             	
            }
        }
    }); 
    
    initButtons();
    initContextMenus();
}

exports.load = function load() {
	console.debug("Showing View "+exports.ID);
   
	// Purging the thumbnail view, avoiding memory leak
	document.getElementById(exports.ID+"SelectableFiles").innerHTML = "";

    $("#"+exports.ID+"SelectableFiles").empty();
        
    for (var i=0; i < UIAPI.fileList.length; i++) {
        var fileName = UIAPI.fileList[i][0];
        var fileExt = fileName.substring(fileName.lastIndexOf(".")+1,fileName.length).toLowerCase();
        if(TSSETTINGS.getSupportedFileExt4Thumbnailing().indexOf(fileExt) >= 0) {
            var filePath = UIAPI.currentPath+UIAPI.getDirSeparator()+fileName;
            $("#"+exports.ID+"SelectableFiles").append(
                 $('<li>', { title: fileName, class: 'ui-widget-content' }).append( 
                    $('<img>', { title: fileName, class: "thumbImg", src: 'file:///'+filePath })));
        } else {
            $("#"+exports.ID+"SelectableFiles").append(
                 $('<li>', { title: fileName, class: 'ui-widget-content' }).append(
                    $('<span>', { class: "fileExtension", text: fileExt})));
        }
    }    
    
	$( exports.ID+"CreateFileButton" ).button( "enable" );    
    UIAPI.hideLoadingAnimation();     
}

exports.setFileFilter = function setFileFilter(filter) {
	console.debug("setFileFilter not implemented in "+exports.ID);
}

exports.clearSelectedFiles = function() {
    // TODO Deselect all
	//$("#"+exports.ID+"SelectableFiles").
}

var initButtons = function() {
    $( "#"+exports.ID+"CreateFileButton" ).button({
        text: true,
        icons: {
            primary: "ui-icon-document"
        }
    })
    .click(function() {
        $( "#dialog-filecreate" ).dialog( "open" );
    });  
}

var initContextMenus = function() {
    $( "#fileMenu1" ).menu({
        select: function( event, ui ) {
            var commandName = ui.item.attr( "action" );
            switch (commandName) {
              case "renameFile":        
                $( this ).hide();
                console.debug("Renaming file...");
                $( "#dialog-filerename" ).dialog( "open" );
                break;  
              case "deleteFile":        
                $( this ).hide();
                console.debug("Deleting file...");
                $( "#dialog-confirmdelete" ).dialog( "open" );
                break;  
              case "closeMenu":
                $( this ).hide(); 
                break;          
              default:
                break;
            }
            $( this ).hide();
        }
    });      
}

});