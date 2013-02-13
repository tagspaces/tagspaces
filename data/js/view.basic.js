/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define([
    'require',
    'exports',
    'module',
    'datatables',
    'jqueryuidraggable',    
//    'css!datatablescss'
],function(require, exports, module) {
"use strict";

exports.Title = "List"
exports.ID = "viewBasic";  // ID should be equal to the directory name where the ext. is located   
exports.Type =  "view";
exports.Icon = "ui-icon-note";

console.debug("Loading view.basic.js");

var viewContainer = undefined;
var viewToolbar = undefined;
var viewFooter = undefined;

var fileTable = undefined;
var viewMode = "files" // tags

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

    viewToolbar.append($("<span>", { 
        id: exports.ID+"ModeSwitcher",    
    }));
    
    var modeSwitcher = $("#"+exports.ID+"ModeSwitcher");
    
    modeSwitcher.append($("<input>", { 
        type: "radio",
        name: "modeSwitcher",
        checked: "checked",
        id: exports.ID+"FilesMode",    
    }));

    modeSwitcher.append($("<label>", { 
        for: exports.ID+"FilesMode",
        text: "Files", 
    }));
    
    modeSwitcher.append($("<input>", { 
        type: "radio",
        name: "modeSwitcher",
        id: exports.ID+"TagsMode",    
    }));

    modeSwitcher.append($("<label>", { 
        for: exports.ID+"TagsMode",
        text: "Tags", 
    }));   
    
    modeSwitcher.buttonset();	 

	// Adding event listener & icon to the radio button
    $( "#"+exports.ID+"TagsMode" ).button({
	        text: true,
	        icons: {
	            primary: "ui-icon-tag"
	        }
	    })        
	.click(function() {
		viewMode = "tags" 
		exports.load(); 	
	})       
	
    $( "#"+exports.ID+"FilesMode" ).button({
	        text: true,
	        icons: {
	            primary: "ui-icon-document-b"
	        }
	    })        
	.click(function() {
		viewMode = "files" 
		exports.load(); 	
	})   
    
    viewToolbar.append($("<span>", { 
    	style: "float: right; margin: 0px; padding: 0px;",
    }).append($("<input>", { 
		type: "filter",
		// autocomplete: "off", // Error: cannot call methods on autocomplete prior to initialization; attempted to call method 'off' 
        title: "This filter applies to current directory without subdirectories.",
        id: exports.ID+"FilterBox",    
    })));

    viewContainer.append($("<table>", { 
		cellpadding: "0",
		cellspacing: "0",
		border: "0",
		style: "width: 100%",
        id: exports.ID+"FileTable",    
    })); 

    fileTable = $('#'+exports.ID+"FileTable").dataTable( {
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
                "mRender": function ( data, type, row ) { return TagsUI.buttonizeFileName(data) },
                "aTargets": [ 0 ]
            }, 
            { // Title column
                "mRender": function ( data, type, row ) { return TagsUI.buttonizeTitle(data,row[0]) },
                "aTargets": [ 3 ]
            }, 
            { // Tags column
                "mRender": function ( data, type, row ) { return TagsUI.generateTagButtons(data,row[5],row[0]) },
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
    fileTable.dataTableExt.sErrMode = 'throw';

    // Makes the body of the fileTable selectable
    $("tbody", $(fileTable)).selectable({
      filter: 'tr',
      start: function() {
        console.debug("Start selecting");  
        
        //Hiding all dropdown menus
		$('BODY')
			.find('.dropdown-menu').hide().end()
			.find('[data-dropdown]').removeClass('dropdown-open');
			            
		exports.clearSelectedFiles();
      },
      stop: function(){
        $(".ui-selected", this).each(function(){
            var rowData = fileTable.fnGetData( this );
            // Add the filename which is located in the first column to the list of selected filenames
            UIAPI.selectedFiles.push(rowData[0]);
          });
        console.debug("Selected files: "+UIAPI.selectedFiles);
      }
    })
    
    // Filter functionality
    $("#"+exports.ID+"FilterBox").keyup(function() {
        fileTable.fnFilter(this.value);
        console.debug("Filter to value: "+this.value);
    });  
    
    $('#'+exports.ID+"FilterBox").wrap('<span id="resetFilter" />').after($('<span/>').click(function() {
        $(this).prev('input').val('').focus();
        fileTable.fnFilter( "" );  
    }));    

    initButtons();
}

exports.load = function load() {
	console.debug("Loading View "+exports.ID);

    $('#'+exports.ID+"FileTable_wrapper").hide();
    
    // Purging file table
    fileTable.fnClearTable();  

    fileTable.fnAddData( UIAPI.fileList );

    fileTable.fnSetColumnVis(0, true);            
    fileTable.fnSetColumnVis(1, true);            
    fileTable.fnSetColumnVis(2, true);            
    fileTable.fnSetColumnVis(3, true);            
    fileTable.fnSetColumnVis(4, true);  

    fileTable.$('tr')
    .droppable({
    	accept: ".tagButton",
    	hoverClass: "activeRow",
    	drop: function( event, ui ) {
    		var tagName = ui.draggable.attr("tag");
    		var targetFile = fileTable.fnGetData( this )[0];
			console.log("Tagging file: "+tagName+" to "+targetFile);

		    exports.clearSelectedFiles();
		    
		    $(this).toggleClass("ui-selected");
		    UIAPI.currentFilename = targetFile;
		    UIAPI.selectedFiles.push(UIAPI.currentFilename); 

			TSAPI.addTag(tagName);
    		IOAPI.listDirectory(UIAPI.currentPath);  
    	}	            	
    })
    .dblclick( function() {
        console.debug("Opening file...");
        var rowData = fileTable.fnGetData( this );
        
        UIAPI.openFile(UIAPI.currentPath+UIAPI.getDirSeparator()+rowData[0]);
    } );     
    
    fileTable.$('.fileButton')
    	.draggable({
    		cancel:false,
    		appendTo: "body",
    		helper: "clone",
    		revert: true,
	        start: function() {
                selectFile(this, $(this).attr("title"));
	        }    		
    	})   
        .click( function() {
            selectFile(this, $(this).attr("title"));
        } )
        .dropdown( 'attach' , '#fileMenu' );

    fileTable.$('.fileTitleButton')
        .click( function() {
            selectFile(this, $(this).attr("title"));
        } )
        .dropdown( 'attach' , '#fileMenu' );   
    
    fileTable.$('.extTagButton')
        .click( function() {
            selectFile(this, $(this).attr("fileName"));
            TagsUI.openTagMenu(this, $(this).attr("tag"), $(this).attr("filename"));
        } )
        .dropdown( 'attach' , '#extensionMenu' );               
    
    fileTable.$('.tagButton')
        .click( function() {
            selectFile(this, $(this).attr("fileName"));
            TagsUI.openTagMenu(this, $(this).attr("tag"), $(this).attr("filename"));
        } )     
        .dropdown( 'attach' , '#tagMenu' );

    if(viewMode == "files") {
        console.debug("Change to FileView");
        fileTable.fnSetColumnVis(0, true);            
        fileTable.fnSetColumnVis(1, true);            
        fileTable.fnSetColumnVis(2, true);            
        fileTable.fnSetColumnVis(3, false);            
        fileTable.fnSetColumnVis(4, false);            
    } else if (viewMode == "tags") {
        console.debug("Change to TagView");            
        fileTable.fnSetColumnVis(0, false);            
        fileTable.fnSetColumnVis(1, false);            
        fileTable.fnSetColumnVis(2, false);            
        fileTable.fnSetColumnVis(3, true);            
        fileTable.fnSetColumnVis(4, true);            
    }

    $('#'+exports.ID+"FileTable_wrapper").show();  
     
    $( "#"+exports.ID+"CreateFileButton" ).button( "enable" );
    
    UIAPI.hideLoadingAnimation(); 
}

exports.setFileFilter = function setFileFilter(filter) {
	$( "#"+exports.ID+"FilterBox").val(filter);
	fileTable.fnFilter(filter);
}

exports.clearSelectedFiles = function() {
    UIAPI.selectedFiles = [];   
    $('#'+exports.ID+'FileTable tbody tr').each(function(){
        $(this).removeClass('ui-selected');
    });	
}

var selectFile = function(tagButton, fileName) {
    exports.clearSelectedFiles();
    
    $(tagButton).parent().parent().toggleClass("ui-selected");
    UIAPI.currentFilename = fileName;
    UIAPI.selectedFiles.push(UIAPI.currentFilename);    
} 

var initButtons = function() {
    
// Initialize file buttons    
    $( "#"+exports.ID+"CreateFileButton" ).button({
        text: true,
        icons: {
            primary: "ui-icon-document"
        }
    })
    .click(function() {
        $( "#dialog-filecreate" ).dialog( "open" );
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
        fileTable.fnFilter( "" );        
    });
}

// currently not used
var handleElementActivation = function() {
    console.debug("Entering element activation handler...");

    if (UIAPI.selectedFiles.length > 1) {
        $( "#openFileButton" ).button( "disable" );
        $( "#editFileButton" ).button( "disable" );
        $( "#deleteFileButton" ).button( "disable" );
        $( "#renameFileButton" ).button( "disable" );   
    } else if (UIAPI.selectedFiles.length == 1) {
        $( "#openFileButton" ).button( "enable" );
        $( "#editFileButton" ).button( "enable" );        
        $( "#deleteFileButton" ).button( "enable" );
        $( "#renameFileButton" ).button( "enable" ); 
    } else {
        $( "#openFileButton" ).button( "disable" );
        $( "#editFileButton" ).button( "disable" );        
        $( "#deleteFileButton" ).button( "disable" );
        $( "#renameFileButton" ).button( "disable" );       
    }    
}

});