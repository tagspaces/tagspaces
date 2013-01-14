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

var viewContainer = undefined;
var viewToolbar = undefined;

exports.fileTable = undefined;

exports.init = function init() {
	console.debug("Initializing View "+exports.ID);
	
    viewContainer = $("#"+exports.ID+"Container");
    viewToolbar = $("#"+exports.ID+"Toolbar");
	
    viewToolbar.append($("<button>", { 
        text: "New",
		disabled: true,
        title: "Create new file",
        id: exports.ID+"CreateFileButton",    
    }));
    
/*  <span style="float: right; margin: 0px; padding: 0px;">
        <input id="filterBox" type="filter" value="" autocomplete="off" title="" />
    </span>	 */	
    viewToolbar.append($("<input>", { 
    	style: "float: right; margin: 0px; padding: 0px;",
		type: "filter",
		autocomplete: "off",
        title: "This filter applies to current directory without subdirectories.",
        id: exports.ID+"FilterBox",    
    }));

    viewContainer.append($("<table>", { 
		cellpadding: "0",
		cellspacing: "0",
		border: "0",
		style: "width: 100%",
        id: exports.ID+"FileTable",    
    })); 

    exports.fileTable = $('#'+exports.ID+"FileTable").dataTable( {
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
                "mRender": function ( data, type, row ) { return buttonizeFileName(data) },
                "aTargets": [ 0 ]
            }, 
            { // Title column
                "mRender": function ( data, type, row ) { return buttonizeTitle(data,row[0]) },
                "aTargets": [ 3 ]
            }, 
            { // Tags column
                "mRender": function ( data, type, row ) { return generateTagButtons(data,row[5],row[0]) },
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
    exports.fileTable.dataTableExt.sErrMode = 'throw';

    // Makes the body of the fileTable selectable
    $("tbody", $(exports.fileTable)).selectable({
      filter: 'tr',
      start: function() {
        console.debug("Start selecting");  
        //UIAPI.hideAllContextMenus();
        UIAPI.selectedFiles = [];       
        $('#'+exports.ID+"FileTable tbody tr").each(function(){
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
        console.debug("Selected files: "+UIAPI.selectedFiles);
        UIAPI.handleElementActivation();        
      }
    })
    
    // Filter functionality
    $("#"+exports.ID+"FilterBox").keyup(function() {
        exports.fileTable.fnFilter(this.value);
        console.debug("Filter to value: "+this.value);
    });  
    
    $('#'+exports.ID+"FilterBox").wrap('<span id="resetFilter" />').after($('<span/>').click(function() {
        $(this).prev('input').val('').focus();
        exports.fileTable.fnFilter( "" );  
    }));    

    initContextMenus();
    initButtons();
}

exports.load = function init() {
	console.debug("Loading View "+exports.ID);

    exports.fileTable.hide();     
    $("fileTable_wrapper").hide();
    
    // Purging file table
    exports.fileTable.fnClearTable();  

    exports.fileTable.fnAddData( UIAPI.fileList );

    exports.fileTable.fnSetColumnVis(0, true);            
    exports.fileTable.fnSetColumnVis(1, true);            
    exports.fileTable.fnSetColumnVis(2, true);            
    exports.fileTable.fnSetColumnVis(3, true);            
    exports.fileTable.fnSetColumnVis(4, true);  

    exports.fileTable.$('tr').dblclick( function() {
        console.debug("Opening file...");
        var rowData = exports.fileTable.fnGetData( this );
        $("#selectedFilePath").val(UIAPI.currentPath+UIAPI.getDirSeparator()+rowData[0]);            
        
        // TODO use central API not fileView
        FileViewer.openFile(rowData[0]);
        UIAPI.hideAllContextMenus();
    } );     
    
    exports.fileTable.$('.fileButton')
        .click( function() {
            openFileMenu(this, $(this).attr("title"));
        } )      
        .dropdown( 'attach' , '#fileMenu' );

    exports.fileTable.$('.fileTitleButton')
        .click( function() {
            openFileTitleMenu(this, $(this).attr("title"));
        } )
        .dropdown( 'attach' , '#fileTitleMenu' );   
    
    exports.fileTable.$('.extTagButton')
        .click( function() {
            TagsUI.openTagMenu(this, $(this).attr("tag"), $(this).attr("filename"));
        } )
        .dropdown( 'attach' , '#tagMenu' );               
    
    exports.fileTable.$('.tagButton')
        .click( function() {
            TagsUI.openTagMenu(this, $(this).attr("tag"), $(this).attr("filename"));
        } )     
        .dropdown( 'attach' , '#tagMenu' );

    if(viewType == "fileView") {
        console.debug("Change to FileView");
        exports.fileTable.fnSetColumnVis(0, true);            
        exports.fileTable.fnSetColumnVis(1, true);            
        exports.fileTable.fnSetColumnVis(2, true);            
        exports.fileTable.fnSetColumnVis(3, false);            
        exports.fileTable.fnSetColumnVis(4, false);            
//    } else if (viewType == "tagView") {
  	  } else {	
        console.debug("Change to TagView");            
        exports.fileTable.fnSetColumnVis(0, false);            
        exports.fileTable.fnSetColumnVis(1, false);            
        exports.fileTable.fnSetColumnVis(2, false);            
        exports.fileTable.fnSetColumnVis(3, true);            
        exports.fileTable.fnSetColumnVis(4, true);            
    }

    $("fileTable_wrapper").show();  
     
    UIAPI.hideLoadingAnimation(); 
}

exports.setFileFilter = function setFileFilter(filter) {
	exports.fileTable.fnFilter(filter);
}

function generateTagButtons(commaSeparatedTags, fileExtension, fileName) {
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

exports.clearSelectedFiles = function() {
    // Deselect all
    $(".selectedRow", $(exports.fileTable)).each(function(){
        $(this).toggleClass('selectedRow');
    });    
}

function buttonizeTitle(title, fileName) {
    return $('<span>').append($('<button>', { 
            title: fileName, 
            class: 'fileTitleButton', 
            text: title+' ' 
        })).html();    
}

function openFileTitleMenu(tagButton, fileName) {
    exports.clearSelectedFiles();
    $(tagButton).parent().parent().toggleClass("selectedRow");

    UIAPI.currentFilename = fileName;
    UIAPI.selectedFiles.push(UIAPI.currentFilename);
} 

function buttonizeFileName(fileName) {
    return $('<span>').append($('<button>', { 
        	title: fileName, 
        	class: 'fileButton', 
        	text: fileName 
        })).html();
} 

function openFileMenu(tagButton, fileName) {
    exports.clearSelectedFiles();
    $(tagButton).parent().parent().toggleClass("selectedRow");

    UIAPI.currentFilename = fileName;
    UIAPI.selectedFiles.push(UIAPI.currentFilename);
} 

function initButtons() {
    
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

function initContextMenus() {
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