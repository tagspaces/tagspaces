/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
/*
define([
    'require',
    'exports',
    'module',
    'datatables',
//    'css!datatablescss'
],function(require, exports, module) {
"use strict";
*/
console.debug("Loading BasicViewsUI...");

var BasicViewsUI = (typeof BasicViewsUI == 'object' && BasicViewsUI != null) ? BasicViewsUI : {};

BasicViewsUI.initFileTagViews = function() {
    UIAPI.fileTable = $('#fileTable').dataTable( {
        "bJQueryUI": false,
        "bPaginate": false,
        "bLengthChange": false,
        "bFilter": true,
        "bSort": true,
        "bInfo": false,
        "bAutoWidth": false,
        "aoColumns": [
            { "sTitle": "Filename", "sClass": "right" },
            { "sTitle": "Size(bytes)" },
            { "sTitle": "Date Modified" },
            { "sTitle": "Title" },
            { "sTitle": "Tags" },            
            { "sTitle": "Ext" },
       //     { "sTitle": "Selection", "mData": null }
        ],         
        "aoColumnDefs": [
            { // Filename column
                "mRender": function ( data, type, row ) { return BasicViewsUI.buttonizeFileName(data) },
                "aTargets": [ 0 ]
            }, 
            { // Title column
                "mRender": function ( data, type, row ) { return BasicViewsUI.buttonizeTitle(data,row[0]) },
                "aTargets": [ 3 ]
            }, 
            { // Tags column
                "mRender": function ( data, type, row ) { return BasicViewsUI.generateTagButtons(data,row[5],row[0]) },
                "aTargets": [ 4 ]
            }, 
            { // Last changed date column
                "mRender": function ( data, type, row ) { return TSAPI.formatDateTime(data, true) },
                "aTargets": [ 2 ]
            },
            { "bVisible": false,  "aTargets": [ 5 ] },
//            { "bSearchable": false,  "aTargets": [ 0 ] },
//            { "sClass": "center", "aTargets": [ 0 ] }
        ]
    } );       
    
   
    // Disable alerts in datatable
    UIAPI.fileTable.dataTableExt.sErrMode = 'throw';

    // Makes the body of the fileTable selectable
    $("tbody", $(UIAPI.fileTable)).selectable({
      filter: 'tr',
      start: function() {
        console.debug("Start selecting");  
        UIAPI.hideAllContextMenus();
        UIAPI.selectedFiles = [];       
        $("#fileTable tbody tr").each(function(){
            $(this).removeClass('selectedRow');
        });
      },
      stop: function(){
        $(".ui-selected", this).each(function(){
            var index = $("#fileTable tr").index(this) - 1;
            $('#fileTable tbody tr:eq('+index+')').toggleClass('selectedRow');
            $('#fileTable tbody tr:eq('+index+')').toggleClass('ui-selected');
            var rowData = UIAPI.fileTable.fnGetData( this );
            // Add the filename which is located in the first column to the list of selected filenames
            UIAPI.selectedFiles.push(rowData[0]);
          });
/*        if(UIAPI.selectedFiles.length == 1) {
            var dirSep = UIAPI.getDirSeparator();
            if(dirSep == "\\\\") { dirSep = "&#92;" }
            $("#selectedFilePath").val(UIAPI.currentPath+dirSep+UIAPI.selectedFiles[0]);            
        } else {
            $("#selectedFilePath").val("");            
        } */
        console.debug("Selected files: "+UIAPI.selectedFiles);
        UIAPI.handleElementActivation();        
      }
    })
    
    // Filter search functionality
    // TODO Consider Thumb and other views by filtering
    $("#filterBox").keyup(function() {
        UIAPI.fileTable.fnFilter(this.value);
        console.debug("Filter to value: "+this.value);
    });  
    
    $('#filterBox').wrap('<span id="resetFilter" />').after($('<span/>').click(function() {
        $(this).prev('input').val('').focus();
        UIAPI.fileTable.fnFilter( "" );  
    }));    
}

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

BasicViewsUI.generateTagButtons = function(commaSeparatedTags, fileExtension, fileName) {
    console.debug("Creating tags...");
    var tagString = ""+commaSeparatedTags;
    var wrapper = $('<span>');
    if(fileExtension.length > 0) {
        wrapper.append($('<button>', {
            title: "Opens context menu for "+fileExtension,
            tag: fileExtension,
            filename: fileName,
            class: "extTagButton",
            text: fileExtension
            }));          
    } 
    if(tagString.length > 0) {
        var tags = tagString.split(",");
        for (var i=0; i < tags.length; i++) { 
            wrapper.append($('<button>', {
                title: "Opens context menu for "+tags[i],
                tag: tags[i],
                filename: fileName,
                class: "tagButton",
                text: tags[i]
                }));   
        }   
    }
    return wrapper.html();        
}

BasicViewsUI.clearSelectedFiles = function() {
    // Clear selected files in the model
    UIAPI.selectedFiles = [];  
    
    // Deselect all
    $(".selectedRow", $(UIAPI.fileTable)).each(function(){
        $(this).toggleClass('selectedRow');
    });    
}

BasicViewsUI.buttonizeTitle = function(title, fileName) {
    return $('<span>').append($('<button>', { 
            title: fileName, 
            class: 'fileTitleButton', 
            text: title+' ' 
        })).html();    
}

BasicViewsUI.openFileTitleMenu = function(tagButton, fileName) {
    BasicViewsUI.clearSelectedFiles();
    $(tagButton).parent().parent().toggleClass("selectedRow");

    UIAPI.currentFilename = fileName;
    UIAPI.selectedFiles.push(UIAPI.currentFilename);
    
    var menu = $("#fileTitleMenu").show().position({
        my: "left top",
        at: "left bottom",
        of: tagButton
    });    
    // TODO Hide menu
    // $( document ).one( "click", function() { menu.hide(); });
} 

BasicViewsUI.buttonizeFileName = function(fileName) {
    return $('<span>').append($('<button>', { 
        title: fileName, 
        class: 'fileButton', 
        text: fileName 
        })).html();
} 

BasicViewsUI.openFileMenu = function(tagButton, fileName) {
    BasicViewsUI.clearSelectedFiles();
    $(tagButton).parent().parent().toggleClass("selectedRow");

    UIAPI.currentFilename = fileName;
    UIAPI.selectedFiles.push(UIAPI.currentFilename);
    
    var menu = $("#fileMenu").show().position({
        my: "left top",
        at: "left bottom",
        of: tagButton
    });
    // TODO Hide menu
    // $( document ).one( "click", function() { menu.hide(); });
} 

BasicViewsUI.initButtons = function() {
// Layout Buttons    
    $( "#toggleLeftPanel" ).button({
        text: false,
        icons: {
            primary: "ui-icon-triangle-2-e-w"
        }
    })
    .click(function() {
        UIAPI.layoutContainer.toggle("west");
    });  
    
    $( "#toggleRightPanel" ).button({
        text: false,
        icons: {
            primary: "ui-icon-triangle-2-e-w"
        }        
    })
    .click(function() {
        UIAPI.layoutContainer.toggle("east");
    });   

// Change View buttons
    $( "#viewsRadio" ).buttonset();

    $( "#fileViewButton" ).button({
        text: true,
        icons: {
            primary: "ui-icon-note"
        }
    })
    .click(function() {
        UIAPI.changeView("fileView");
    }); 
    
    $( "#tagViewButton" ).button({
        text: true,
        icons: {
            primary: "ui-icon-tag"
        }
    })
    .click(function() {
        UIAPI.changeView("tagView");
    }); 
    
    $( "#thumbViewButton" ).button({
        text: true,
        icons: {
            primary: "ui-icon-image"
        }
    })
    .click(function() {
        UIAPI.changeView("thumbView");
    });  
    
    $( "#riverViewButton" ).click(function() {
        UIAPI.changeView("riverView");
    });  
    
// Initialize file buttons    
    $( "#createFileButton" ).button({
        text: true,
        icons: {
            primary: "ui-icon-document"
        }
    })
    .click(function() {
        $( "#dialog-filecreate" ).dialog( "open" );
    });        

    $( "#openFileButton" ).button({
        text: true,
        disabled: true
    })
    .click(function() {
        FileViewer.openFile(UIAPI.selectedFiles[0]);
    }); 
        
    $( "#editFileButton" ).button({
        text: true,
        disabled: true       
    })
    .click(function() {
        UIAPI.editFile(UIAPI.selectedFiles[0]);
    }); 
    
    $( "#deleteFileButton" ).button({
        text: true,
        disabled: true,
        icons: {
            primary: "ui-icon-trash"
        }
    })
    .click(function() {
        $( "#dialog-confirmdelete" ).dialog( "open" );
    });

    $( "#renameFileButton" ).button({
        text: true,
        disabled: true
    })
    .click(function() {
        $( "#dialog-filerename" ).dialog( "open" );
    }); 
    
    $( "#clearFilterButton" ).button({
        text: false,
        disabled: false,
        icons: {
            primary: "ui-icon-close"
        }
    })
    .click(function() {
        $( "#filterBox" ).val( "" );
        UIAPI.fileTable.fnFilter( "" );        
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
    
    $( "#fileTitleMenu" ).menu({
        select: function( event, ui ) {
            var commandName = ui.item.attr( "action" );
            switch (commandName) {
              case "openFile":
                $( this ).hide();              
                console.debug("Opening file...");
                FileViewer.openFile(UIAPI.selectedFiles[0]);                
                break;
              case "editFile":
                $( this ).hide();
                console.debug("Editing file...");   
                UIAPI.editFile(UIAPI.selectedFiles[0]);
                break;
              case "addTag":        
                $( this ).hide();
                console.debug("Adding tag..."); 
                $("#tags").val("");
                $( "#dialogAddTags" ).dialog( "open" );
                break;  
              case "closeMenu":
                $( this ).hide(); 
                break;          
              default:
                break;
            }
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

    $( "#txtFileTypeButton" ).click(function() {
        // TODO Add to config options
        fileContent = TSSETTINGS.getNewTextFileContent();
        //Leave the filename as it is by no extension
        if(newFileName.val().lastIndexOf(".")>=0) {
            newFileName.val(newFileName.val().substring(0,newFileName.val().lastIndexOf("."))+".txt");  
        }
    });            

    $( "#htmlFileTypeButton" ).click(function() {
        // TODO Add to config options
        fileContent = TSSETTINGS.getNewHTMLFileContent();
        //Leave the filename as it is by no extension
        if(newFileName.val().lastIndexOf(".")>=0) {
            newFileName.val(newFileName.val().substring(0,newFileName.val().lastIndexOf("."))+".html");            
        }
    }); 
    
    $( "#mdFileTypeButton" ).click(function() {
        // TODO Add to config options
        fileContent = TSSETTINGS.getNewMDFileContent();
        //Leave the filename as it is by no extension
        if(newFileName.val().lastIndexOf(".")>=0) {
            newFileName.val(newFileName.val().substring(0,newFileName.val().lastIndexOf("."))+".md");            
        }
    });     

    $( "#dialog-filecreate" ).dialog({
        autoOpen: false,
        height: 250,
        width: 450,
        modal: true,
        buttons: {
            "Create": function() {
                var bValid = true;                
                allFields.removeClass( "ui-state-error" );

                bValid = bValid && checkLength( newFileName, "filename", 4, 200 );
        //        bValid = bValid && checkRegexp( renamedFileName, /^[a-z]([0-9a-z_.])+$/i, "Filename may consist of a-z, 0-9, underscores, begin with a letter." );
                if(UIAPI.fileExists(newFileName.val())) {
                    updateTips("File already exists.");
                    bValid = false;
                }
                if ( bValid ) {
                    IOAPI.saveTextFile(UIAPI.currentPath+UIAPI.getDirSeparator()+$( "#newFileName" ).val(),fileContent);
                    $( this ).dialog( "close" );
                    IOAPI.listDirectory(UIAPI.currentPath);                    
                }
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        },
        close: function() {
            allFields.val( "" ).removeClass( "ui-state-error" );
        },
        open: function() {
            fileContent = TSSETTINGS.getNewTextFileContent(); // Default new file in text file
            $( "#newFileName" ).val(".txt");
        }                
    });     

    $( "#dialog-filerename" ).dialog({
        autoOpen: false,
        height: 220,
        width: 450,
        modal: true,
        buttons: {
            "Rename": function() {
                var bValid = true;                
                allFields.removeClass( "ui-state-error" );

                bValid = bValid && checkLength( renamedFileName, "filename", 3, 200 );
        //        bValid = bValid && checkRegexp( renamedFileName, /^[a-z]([0-9a-z_.])+$/i, "Filename may consist of a-z, 0-9, underscores, begin with a letter." );
                if ( bValid ) {
                    IOAPI.renameFile(
                            UIAPI.currentPath+UIAPI.getDirSeparator()+UIAPI.selectedFiles[0],
                            UIAPI.currentPath+UIAPI.getDirSeparator()+renamedFileName.val()
                        );
                    $( this ).dialog( "close" );
                    IOAPI.listDirectory(UIAPI.currentPath);                    
                }
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        },
        close: function() {
            allFields.val( "" ).removeClass( "ui-state-error" );
        },
        open: function() {
            $( "#renamedFileName" ).val(UIAPI.selectedFiles[0]);
        }                
    }); 
    
    $( "#dialog-confirmdelete" ).dialog({
        autoOpen: false,
        resizable: false,
        height:140,
        modal: true,
        buttons: {
            "Delete all items": function() {
                IOAPI.deleteElement(UIAPI.currentPath+UIAPI.getDirSeparator()+UIAPI.selectedFiles[0]);
                $( this ).dialog( "close" );
                IOAPI.listDirectory(UIAPI.currentPath);   
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        }
    }); 
    
    $( "#dialogAddTags" ).dialog({
        autoOpen: false,
        resizable: false,
        height:240,
        modal: true,
        buttons: {
            "Add tags": function() {
                var tags = $("#tags").val().split(",");
                TSAPI.writeTagsToFile(UIAPI.selectedFiles[0], tags);
                IOAPI.listDirectory(UIAPI.currentPath);                                   
                $( this ).dialog( "close" );
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        },
        open: function() {
            
            function split( val ) {
                return val.split( /,\s*/ );
            }
            function extractLast( term ) {
                return split( term ).pop();
            }
                        
            $( "#tags" )
                // don't navigate away from the field on tab when selecting an item
                .bind( "keydown", function( event ) {
                    if ( event.keyCode === $.ui.keyCode.TAB &&
                            $( this ).data( "autocomplete" ).menu.active ) {
                        event.preventDefault();
                    }
                })
                .autocomplete({
                    minLength: 0,
                    source: function( request, response ) {
                        // delegate back to autocomplete, but extract the last term
                        response( $.ui.autocomplete.filter(
                            TSSETTINGS.getAllTags(), extractLast( request.term ) ) );
                    },
                    focus: function() {
                        // prevent value inserted on focus
                        return false;
                    },
                    select: function( event, ui ) {
                        var terms = split( this.value );
                        // remove the current input
                        terms.pop();
                        // add the selected item
                        terms.push( ui.item.value );
                        // add placeholder to get the comma-and-space at the end
                        terms.push( "" );
                        this.value = terms.join( ", " );
                        return false;
                    }
                });
        }            
    });        
    
    $( "#tagTypeRadio" ).buttonset();

    $( "#plainTagTypeButton" ).click(function() {
        UIAPI.selectedTag, $( "#newTag" ).val("")
    });  

    $( "#dateTagTypeButton" ).click(function() {
        UIAPI.selectedTag, $( "#newTag" ).val("201YMMDD")
    });  
    
    $( "#currencyTagTypeButton" ).click(function() {
        UIAPI.selectedTag, $( "#newTag" ).val("XEUR")
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

//return BasicViewsUI;
//});