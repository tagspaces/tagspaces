/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define([
    'require',
    'exports',
    'module',
],function(require, exports, module) {
"use strict";

console.debug("Loading View: Thumb");


BasicViewsUI.initThumbView = function() {
    // Managing the selection of files in the thumb view
    $( "#selectableFiles" ).selectable({
        stop: function() {
            UIAPI.selectedFiles = [];          
            $( ".ui-selected", this ).each(function() {
                UIAPI.selectedFiles.push($(this).attr("title"));
            });
            console.debug("Selected files: "+UIAPI.selectedFiles);
            UIAPI.handleElementActivation();
            
            // On selecting only one file opens it in the viewer
            if(UIAPI.selectedFiles.length == 1) {
                FileViewer.openFile(UIAPI.selectedFiles[0]);                
            }
        }
    });   
}


exports.initButtons = function initButtons() {

}

BasicViewsUI.initButtons = function() {
// Layout Buttons    
    $( "#toggleLeftPanel1" ).button({
        text: false,
        icons: {
            primary: "ui-icon-bookmark"
        }
    })
    .click(function() {
        UIAPI.layoutContainer.toggle("west");
    });  
}

BasicViewsUI.initContextMenus = function() {
    $( "#fileMenu" ).menu({
        select: function( event, ui ) {
            var commandName = ui.item.attr( "action" );
            switch (commandName) {
              case "addTag":        
                $( this ).hide();
                console.debug("Adding tag..."); 
                $("#tags").val("");
                $( "#dialogAddTags" ).dialog( "open" );
                break;  
              case "openFile":
                $( this ).hide();
                console.debug("Opening file...");
                FileViewer.openFile(UIAPI.selectedFiles[0]);                
                break;
              case "openDirectory":
                $( this ).hide();
                console.debug("Opening parent directory...");   
                IOAPI.openDirectory(UIAPI.currentPath);
                break;
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

BasicViewsUI.initDialogs = function() {
    var newDirName = $( "#dirname" );    
    var newFileName = $( "#newFileName" );    
    var renamedFileName = $( "#renamedFileName" );    
    
    // TODO evtl add smarttag and the others...    
    var allFields = $( [] ).add( newDirName );
    
    var tips = $( ".validateTips" );

    function updateTips( t ) {
        tips
            .text( t )
            .addClass( "ui-state-highlight" );
        setTimeout(function() {
            tips.removeClass( "ui-state-highlight", 1500 );
        }, 500 );
    }

    function checkLength( o, n, min, max ) {
        if ( o.val().length > max || o.val().length < min ) {
            o.addClass( "ui-state-error" );
            updateTips( "Length of " + n + " must be between " +
                min + " and " + max + "." );
            return false;
        } else {
            return true;
        }
    }

    function checkRegexp( o, regexp, n ) {
        if ( !( regexp.test( o.val() ) ) ) {
            o.addClass( "ui-state-error" );
            updateTips( n );
            return false;
        } else {
            return true;
        }
    }    
    
    $( "#fileTypeRadio" ).buttonset();

    var fileContent = undefined;
 
    
    $( "#tagTypeRadio" ).buttonset();

    $( "#plainTagTypeButton" ).click(function() {
        UIAPI.selectedTag, $( "#newTag" ).datepicker( "destroy" ).val("");
    });  

    $( "#dateTagTypeButton" ).click(function() {
        UIAPI.selectedTag, $( "#newTag" ).datepicker({
            showWeek: true,
            firstDay: 1,
            dateFormat: "yymmdd"
        });
    });  
    
    $( "#currencyTagTypeButton" ).click(function() {
        UIAPI.selectedTag, $( "#newTag" ).datepicker( "destroy" ).val("XEUR")
    });      
    
    $( "#dialogEditTag" ).dialog({
        autoOpen: false,
        resizable: false,
        height:240,
        modal: true,
        buttons: {
            "Edit tag": function() {
                TSAPI.renameTag(UIAPI.selectedFiles[0], UIAPI.selectedTag, $( "#newTag" ).val());
                IOAPI.listDirectory(UIAPI.currentPath);                                   
                $( this ).dialog( "close" );
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        }
    });
}

});