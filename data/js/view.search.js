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

exports.Title = "Search"
exports.ID = "viewSearch";  // ID should be equal to the directory name where the ext. is located   
exports.Type =  "view";
exports.Icon = "ui-icon-search";
exports.Version = "1.0";
exports.ManifestVersion = 1;
exports.License = "AGPL";

console.debug("Loading view.search.js");

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
        text: "ReIndex",
		disabled: true,
        title: "Reindex current favorite folder.",
        id: exports.ID+"ReIndexButton",    
    }));	
    
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


	// Column order in json [title(0),tags(1),fileSize(2),fileLMDT(3),path(4),filename(5),extension(6)];
    fileTable = $('#'+exports.ID+"FileTable").dataTable( {
        "bJQueryUI": false,
        "bPaginate": false,
        "bLengthChange": false,
        "bFilter": true,
        "bSort": true,
        "bInfo": false,
        "bAutoWidth": false,
        "aoColumns": [
            { "sTitle": "Title", "sClass": "right" },
            { "sTitle": "Tags" },            
            { "sTitle": "Size(bytes)" },
            { "sTitle": "Date Modified" },
            { "sTitle": "Path" },
        ],         
        "aoColumnDefs": [
            { // Title column
                "mRender": function ( data, type, row ) { return TagsUI.buttonizeTitle(data,row[0],row[4]) },
                "aTargets": [ 0 ]
            }, 
            { // Tags column
                "mRender": function ( data, type, row ) { return TagsUI.generateTagButtons(data,row[6],row[5],row[4]) },
                "aTargets": [ 1 ]
            }, 
            { // Filesize column
                "mRender": function ( data, type, row ) { return TSAPI.formatFileSize(data) },
                "aTargets": [ 2 ]
            },
            { // Last changed date column
                "mRender": function ( data, type, row ) { return TSAPI.formatDateTime(data, true) },
                "aTargets": [ 3 ]
            },
//            { "bVisible": false,  "aTargets": [ 5 ] },
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
	
	$( "#"+exports.ID+"ReIndexButton" ).button( "enable" );
	UIAPI.hideLoadingAnimation();
//    $( "#"+exports.ID+"ReIndexButton" ).button( "disable" );
//	IOAPI.createDirectoryIndex(UIAPI.currentPath);
}

var enhanceIndexData = function(index) {
	console.debug("Enhancing directory index...");
    var enhancedIndex = [];
    var tags = undefined;
    var ext = undefined;
    var title = undefined;
    var fileSize = undefined;
    var fileLMDT = undefined;
    var path = undefined;
    for (var i=0; i < index.length; i++) {
        if (index[i].type == "file"){  
            // Considering Unix HiddenEntries (. in the beginning of the filename)
            if (TSSETTINGS.Settings["showUnixHiddenEntries"] || 
               (!TSSETTINGS.Settings["showUnixHiddenEntries"] && (index[i].name.indexOf(".") != 0))) {
                 tags = TSAPI.extractTags(index[i].name);
                 title = TSAPI.extractTitle(index[i].name);
                 if(index[i].name.lastIndexOf(".") > 0) {
                     ext = index[i].name.substring(index[i].name.lastIndexOf(".")+1,index[i].name.length);                     
                 } else {
                     ext = "";
                 }
                 fileSize = index[i].size;
                 fileLMDT = index[i].lmdt;
                 path = index[i].path;
                 if(fileSize == undefined) fileSize = "";
                 if(fileLMDT == undefined) fileLMDT = "";
                 var entry = [title,tags,fileSize,fileLMDT,path,index[i].name,ext];   
                 enhancedIndex.push(entry);
            }
        }
    }
    return enhancedIndex; 		
}

exports.updateIndexData = function updateIndexData(index) {
	console.debug("Updating index data.");

	// Clearing the old data
    fileTable.fnClearTable();  

    fileTable.fnAddData( enhanceIndexData(index) );
    
    fileTable.$('tr').dblclick( function() {
        console.debug("Opening file...");
        var rowData = fileTable.fnGetData( this );
        
        UIAPI.openFile(rowData[4]); // 4 is the filePath
    } );     
    
    fileTable.$('.fileTitleButton')
        .click( function() {
            selectFile(this, $(this).attr("title"));
        } )
// TODO Context menu disable until the view.basic and view.search use filepath instead of filename
//        .dropdown( 'attach' , '#fileMenu' );   
    
    fileTable.$('.extTagButton')
        .click( function() {
        	selectFile(this, $(this).attr("fileName"));
            TagsUI.openTagMenu(this, $(this).attr("tag"), $(this).attr("filename"));
        } )
// TODO Context menu disable until the view.basic and view.search use filepath instead of filename
//        .dropdown( 'attach' , '#extensionMenu' );               
    
    fileTable.$('.tagButton')
        .click( function() {
            selectFile(this, $(this).attr("fileName"));
            TagsUI.openTagMenu(this, $(this).attr("tag"), $(this).attr("filename"));
        } )     
// TODO Context menu disable until the view.basic and view.search use filepath instead of filename
//        .dropdown( 'attach' , '#tagMenu' );

    $('#'+exports.ID+"FileTable_wrapper").show();  
     
    $( "#"+exports.ID+"ReIndexButton" ).button( "enable" );
    
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
    $( "#"+exports.ID+"ReIndexButton" ).button({
        text: true,
        icons: {
            primary: "ui-icon-refresh"
        }
    })
    .click(function() {
	    $( "#"+exports.ID+"ReIndexButton" ).button( "disable" );
		IOAPI.createDirectoryIndex(UIAPI.currentPath);
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