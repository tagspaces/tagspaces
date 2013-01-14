/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define([
    'require',
    'exports',
    'module',
    'datatables',
//    'css!datatablescss'
],function(require, exports, module) {
"use strict";

exports.Title = "File View"
exports.ID = "viewBasic";  // ID should be equal to the directory name where the ext. is located   
exports.Type =  "view";
exports.Icon = "ui-icon-note"; // ui-icon-tag

console.debug("Loading viewBasic.js");

exports.init = function init() {
	console.debug("Initializing View "+exports.ID);
	
/*
    <table id="fileTable" cellpadding="0" cellspacing="0" border="0" style="width: 100%"></table>

    <span style="float: right; margin: 0px; padding: 0px;">
        <input id="filterBox" type="filter" value="" autocomplete="off" title="This filter applies to current directory without subdirectories." />
    </span>	
 */	
}

exports.load = function init() {
	console.debug("Loading View "+exports.ID);
	/*
    UIAPI.fileTable.hide();     
    $("fileTable_wrapper").hide();
    
    // Purging file table
    UIAPI.fileTable.fnClearTable();  

    UIAPI.initFileTagView();  
    if(viewType == "fileView") {
        console.debug("Change to FileView");
        UIAPI.fileTable.fnSetColumnVis(0, true);            
        UIAPI.fileTable.fnSetColumnVis(1, true);            
        UIAPI.fileTable.fnSetColumnVis(2, true);            
        UIAPI.fileTable.fnSetColumnVis(3, false);            
        UIAPI.fileTable.fnSetColumnVis(4, false);            
    } else if (viewType == "tagView") {
        console.debug("Change to TagView");            
        UIAPI.fileTable.fnSetColumnVis(0, false);            
        UIAPI.fileTable.fnSetColumnVis(1, false);            
        UIAPI.fileTable.fnSetColumnVis(2, false);            
        UIAPI.fileTable.fnSetColumnVis(3, true);            
        UIAPI.fileTable.fnSetColumnVis(4, true);            
    }
    UIAPI.fileTable.show();
    $("fileTable_wrapper").show();  
    */      
     
    UIAPI.hideLoadingAnimation(); 
}

var BasicViewsUI = (typeof BasicViewsUI == 'object' && BasicViewsUI != null) ? BasicViewsUI : {};

            /*
            BasicViewsUI.initContextMenus();
            BasicViewsUI.initFileTagViews();
            BasicViewsUI.initDialogs(); 
            BasicViewsUI.initButtons();
            BasicViewsUI.initThumbView(); 
            */

UIAPI.initFileTagView = function(viewType) {
    UIAPI.fileTable.fnClearTable();  
    UIAPI.fileTable.fnAddData( UIAPI.fileList );

    UIAPI.fileTable.fnSetColumnVis(0, true);            
    UIAPI.fileTable.fnSetColumnVis(1, true);            
    UIAPI.fileTable.fnSetColumnVis(2, true);            
    UIAPI.fileTable.fnSetColumnVis(3, true);            
    UIAPI.fileTable.fnSetColumnVis(4, true);  

    UIAPI.fileTable.$('tr').dblclick( function() {
        console.debug("Opening file...");
        var rowData = UIAPI.fileTable.fnGetData( this );
        $("#selectedFilePath").val(UIAPI.currentPath+UIAPI.getDirSeparator()+rowData[0]);            
        FileViewer.openFile(rowData[0]);
        UIAPI.hideAllContextMenus();
    } );     
    
    UIAPI.fileTable.$('.fileButton')
        .click( function() {
            BasicViewsUI.openFileMenu(this, $(this).attr("title"));
        } )      
        .dropdown( 'attach' , '#fileMenu' );

    UIAPI.fileTable.$('.fileTitleButton')
        .click( function() {
            BasicViewsUI.openFileTitleMenu(this, $(this).attr("title"));
        } )
        .dropdown( 'attach' , '#fileTitleMenu' );   
    
    UIAPI.fileTable.$('.extTagButton')
        .click( function() {
            TagsUI.openTagMenu(this, $(this).attr("tag"), $(this).attr("filename"));
        } )
        .dropdown( 'attach' , '#tagMenu' );               
    
    UIAPI.fileTable.$('.tagButton')
        .click( function() {
            TagsUI.openTagMenu(this, $(this).attr("tag"), $(this).attr("filename"));
        } )     
        .dropdown( 'attach' , '#tagMenu' );
}

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
} 

BasicViewsUI.initButtons = function() {
// Layout Buttons    
    $( "#toggleLeftPanel" ).button({
        text: false,
        icons: {
            primary: "ui-icon-bookmark"
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
        IOAPI.createDirectoryIndex(UIAPI.currentPath);
        // TODO uncomment
        //$( "#dialog-filecreate" ).dialog( "open" );
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


});