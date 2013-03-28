/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";

	console.debug("Loading tags.ui.js...");
	
	var TSCORE = require("tscore");

	function initContextMenus() {
	    $( "#tagSuggestionsMenu" ).menu({
	        select: function( event, ui ) {
	            console.debug("Tag suggestion "+ui.item.attr( "action" )+" for tag: "+TSCORE.selectedTag);            
	        }        
	    });        
	    
	    $( "#extensionMenu" ).menu({
	        select: function( event, ui ) {
	            console.debug("Tag menu action: "+ui.item.attr( "action" )+" for tag: "+TSCORE.selectedTag);
	            switch (ui.item.attr( "action" )) {
	              case "addTagAsFilter":
	                $( this ).hide();
	                $("#filterBox").val(TSCORE.selectedTag);
	                TSCORE.ViewManager.setFileFilter(TSCORE.selectedTag);
	                break;                            
	            }
	        }
	    });
	
	    // Context menu for the tags in the file table and the file viewer
	    $( "#tagMenu" ).menu({
	        select: function( event, ui ) {
	            console.debug("Tag menu action: "+ui.item.attr( "action" )+" for tag: "+TSCORE.selectedTag);
	            switch (ui.item.attr( "action" )) {
	              case "addTagAsFilter":
	                $( this ).hide();
	                $("#filterBox").val(TSCORE.selectedTag);
	                TSCORE.ViewManager.setFileFilter(TSCORE.selectedTag);
	                break;                            
	              case "addTagInTagGroup":
	                $( this ).hide();
	                // TODO Finish add tag in group
	                break;                            
	              case "editTag":
	                $( this ).hide();
	                $( "#newTag" ).val(TSCORE.selectedTag);
	                $( "#dialogEditTag" ).dialog( "open" );
	                break;                            
	              case "removeTag":
	                $( this ).hide();
	                TSCORE.TagUtils.removeTag(TSCORE.selectedFiles[0],TSCORE.selectedTag);
	                break;
	            }
	        }
	    });
	
	    // Context menu for the tags in the tag tree
	    $( "#tagTreeMenu" ).menu({
	        select: function( event, ui ) {
	            console.debug("Tag menu action: "+ui.item.attr( "action" )+" for tag: "+TSCORE.selectedTag);
	            switch (ui.item.attr( "action" )) {
	              case "addTagToFile":
	                TSCORE.TagUtils.addTag(TSCORE.selectedFiles, [TSCORE.selectedTag]);  
	                break;                            
	              case "addTagAsFilter":
	                $("#filterBox").val(TSCORE.selectedTag);
	                TSCORE.ViewManager.setFileFilter(TSCORE.selectedTag);
	                break;                            
	              case "editTag":
	                $( "#tagName" ).val(TSCORE.selectedTag);
	                $( "#dialog-tagedit" ).dialog( "open" );
	                break;                            
	              case "deleteTag":
	                $( "#dialog-confirmtagdelete" ).dialog( "open" );                
	                break;
	            }
	        }
	    });
	    
	    // Context menu for the tags groups
	    $( "#tagGroupMenu" ).menu({
	        select: function( event, ui ) {
	            console.debug("TagGroup  menu action: "+ui.item.attr( "action" )+" for tag: "+TSCORE.selectedTag);
	            switch (ui.item.attr( "action" )) {
	              case "createNewTag":
	                $( "#newTagName" ).val("");
	                $( "#dialog-tagcreate" ).dialog( "open" );
	                break;                            
	              case "deleteTagGroup":
	                $( "#dialog-confirmtaggroupdelete" ).dialog( "open" );                
	                break;                            
	              case "duplicateTagGroup":
	                $( "#dialog-taggroupDupicate" ).dialog( "open" );
	                break;
	              case "editTagGroup":
	                $( "#tagGroupName" ).val(TSCORE.selectedTagData.title);              
	                $( "#dialog-taggroupEdit" ).dialog( "open" );
	                break;
	            }
	        }
	    });  
	    
	    $( "#fileMenu" ).menu({
	        select: function( event, ui ) {
	            var commandName = ui.item.attr( "action" );
	            switch (commandName) {
	              case "addTag":        
	                console.debug("Adding tag..."); 
	                $("#tags").val("");
	                $( "#dialogAddTags" ).dialog( "open" );
	                break;  
	              case "openFile":
	                console.debug("Opening file...");
	        		TSCORE.FileOpener.openFile(TSCORE.selectedFiles[0]);                
	                break;
	              case "openDirectory":
	                console.debug("Opening parent directory...");   
	                TSCORE.IO.openDirectory(TSCORE.currentPath);
	                break;
	              case "renameFile":        
	                console.debug("Renaming file...");
	                $( "#dialog-filerename" ).dialog( "open" );
	                break;  
	              case "deleteFile":        
	                console.debug("Deleting file...");
	                $( "#dialog-confirmdelete" ).dialog( "open" );
	                break;  
	              default:
	                break;
	            }
	        }
	    });      
	}
	
	function initDialogs() {
	    var newDirName = $( "#dirname" );
	    
	    var newFileName = $( "#newFileName" );
	    
	    var renamedFileName = $( "#renamedFileName" );
	    
	    var smartTag = $( "#smartTagName" );
	    
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
	
	    $( "#dialog-smarttag" ).dialog({
	        autoOpen: false,
	        height: 220,
	        width: 450,
	        modal: true,
	        buttons: {
	            "Add smart tag": function() {
	                var bValid = true;                
	                allFields.removeClass( "ui-state-error" );
	
	                bValid = bValid && checkLength( smartTag, "tagname", 2, 40 );
	                if ( bValid ) {
	                    for (var i=0; i < TSCORE.selectedFiles.length; i++) {
	                       TSCORE.TagUtils.writeTagsToFile(TSCORE.selectedFiles[i], [smartTag.val()]);
	                    };
	                    $( this ).dialog( "close" );
	                    IOAPI.listDirectory(TSCORE.currentPath);                    
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
	            $( "#renamedFileName" ).val(TSCORE.selectedFiles[0]);
	        }                
	    });     
	    
	    /* Currently not used
	    $( "#dialog-confirmtagremove" ).dialog({
	        autoOpen: false,
	        resizable: false,
	        height:140,
	        modal: true,
	        buttons: {
	            "Remove": function() {
	                TSCORE.TagUtils.removeTag(TSCORE.selectedTag);  
	                $( this ).dialog( "close" );
	                IOAPI.listDirectory(TSCORE.currentPath);   
	            },
	            Cancel: function() {
	                $( this ).dialog( "close" );
	            }
	        }
	    });    */
	
	    $( "#dialog-confirmtagdelete" ).dialog({
	        autoOpen: false,
	        resizable: false,
	        height:140,
	        modal: true,
	        buttons: {
	            "Delete": function() {                
	                TSCORE.Config.deleteTag(TSCORE.selectedTagData);
	                generateTagGroups();    
	                $( this ).dialog( "close" );
	            },
	            Cancel: function() {
	                $( this ).dialog( "close" );
	            }
	        }
	    });    
	
	    $( "#dialog-confirmtaggroupdelete" ).dialog({
	        autoOpen: false,
	        resizable: false,
	        height:140,
	        modal: true,
	        buttons: {
	            "Delete": function() {                
	                TSCORE.Config.deleteTagGroup(TSCORE.selectedTagData);
	                generateTagGroups();    
	                $( this ).dialog( "close" );
	            },
	            Cancel: function() {
	                $( this ).dialog( "close" );
	            }
	        }
	    }); 
	
	    $( "#dialog-tagedit" ).dialog({
	        autoOpen: false,
	        resizable: false,
	        height:240,
	        modal: true,
	        buttons: {
	            "Save": function() {
	                TSCORE.Config.editTag(TSCORE.selectedTagData, $( "#tagName" ).val() )
	                generateTagGroups();    
	                $( this ).dialog( "close" );
	            },
	            Cancel: function() {
	                $( this ).dialog( "close" );
	            }
	        }
	    });   
	
	    $( "#dialog-tagcreate" ).dialog({
	        autoOpen: false,
	        resizable: false,
	        height:240,
	        modal: true,
	        buttons: {
	            "Create Tag": function() {
	                TSCORE.Config.createTag(TSCORE.selectedTagData, $( "#newTagName" ).val() )
	                generateTagGroups();                    
	                $( this ).dialog( "close" );
	            },
	            Cancel: function() {
	                $( this ).dialog( "close" );
	            }
	        }
	    });  
	    
	    $( "#dialog-taggroupDupicate" ).dialog({
	        autoOpen: false,
	        resizable: false,
	        height:240,
	        modal: true,
	        buttons: {
	            "Duplicate Taggroup": function() {
	                TSCORE.Config.duplicateTagGroup(TSCORE.selectedTagData, $( "#newTagGroupName" ).val(), $( "#newTagGroupKey" ).val() )
	                generateTagGroups();                    
	                $( this ).dialog( "close" );
	            },
	            Cancel: function() {
	                $( this ).dialog( "close" );
	            }
	        }
	    });   
	    
	    $( "#dialog-taggroupEdit" ).dialog({
	        autoOpen: false,
	        resizable: false,
	        height:240,
	        modal: true,
	        buttons: {
	            "Save": function() {
	                TSCORE.Config.editTagGroup(TSCORE.selectedTagData, $( "#tagGroupName" ).val() )
	                generateTagGroups();                    
	                $( this ).dialog( "close" );
	            },
	            Cancel: function() {
	                $( this ).dialog( "close" );
	            }
	        }
	    });               
	}
	
	function generateTagGroups() {
	    console.debug("Generating TagGroups...");
	    $("#tagGroups").empty();
	    $("#tagGroups").addClass("ui-accordion ui-accordion-icons ui-widget ui-helper-reset")
	    for(var i=0; i < TSCORE.Config.Settings["tagGroups"].length; i++) {
	        // Code based on http://jsbin.com/eqape/1/edit
	        $("#tagGroups").append($("<h3>", { 
	            class: "ui-accordion-header ui-helper-reset ui-state-default ui-corner-top ui-corner-bottom"    
	        })
		    /* .droppable({
		    	accept: ".tagButton",
		    	hoverClass: "activeRow",
		    	drop: function( event, ui ) {
		    		var tagName = ui.draggable.attr("tag");
	                TSCORE.Config.createTag(TSCORE.selectedTagData, tagName );
	                TSCORE.Config.deleteTag(TSCORE.selectedTagData);
	                generateTagGroups();    				
		    	}	            	
		    }) */
	        .hover(function() { $(this).toggleClass("ui-state-hover"); })        
	        .append($("<span>", { 
	            class: "tagGroupTitle",
	            text: TSCORE.Config.Settings["tagGroups"][i].title, 
	        })  
	        .click(function() {
	          $(this)
	            .parent().toggleClass("ui-accordion-header-active ui-state-active ui-state-default ui-corner-bottom").end()
	            .parent().next().toggleClass("ui-accordion-content-active").toggle();
	          return false;
	        })        
	        )
	        .append($("<span>", {
	                class: "ui-icon ui-icon-gear",
	                style: "float: right!important; position:relative!important; vertical-align: middle; display:inline-block;",              
	                tag: TSCORE.Config.Settings["tagGroups"][i].title, 
	                key: TSCORE.Config.Settings["tagGroups"][i].key, 
	                title: "Taggroup options",
	        })                
	        .dropdown( 'attach' , '#tagGroupMenu' )
	        .click( function(event) {
	                //console.debug("Clicked in taggroup setting");    
	                TSCORE.selectedTag = $(this).attr("tag");
	                TSCORE.selectedTagData = TSCORE.Config.getTagGroupData($(this).attr("key"));
	                TSCORE.selectedTagData.parentKey = undefined;  
	        })
	        )
	        );
	          
	        var tagButtons = $("<div>").appendTo( "#tagGroups" );  
	        tagButtons.attr("style","margin: 0px; padding: 5px;");
	        tagButtons.addClass("ui-accordion-content  ui-helper-reset ui-widget-content ui-corner-bottom")
	        tagButtons.hide(); 
	        for(var j=0; j < TSCORE.Config.Settings["tagGroups"][i]["children"].length; j++) {
	            tagButtons.append($("<button>", { 
	                class: "tagButton", 
	                tag: TSCORE.Config.Settings["tagGroups"][i]["children"][j].title, 
	                parentKey: TSCORE.Config.Settings["tagGroups"][i].key,
	                title: "Opens context menu for "+TSCORE.Config.Settings["tagGroups"][i]["children"][j].title,
	                text: TSCORE.Config.Settings["tagGroups"][i]["children"][j].title, 
	            })
		    	.draggable({
		    		cancel:false,
		    		appendTo: "body",
		    		helper: "clone",
		    		revert: true,
		    	})              
	            .click( function() {
	                TSCORE.selectedTag = $(this).attr("tag");
	                TSCORE.selectedTagData = TSCORE.Config.getTagData($(this).attr("tag"), $(this).attr("parentKey"));
	                TSCORE.selectedTagData.parentKey = $(this).attr("parentKey");
	            })
	            .dropdown( 'attach' , '#tagTreeMenu' )               
	            );                      
	        }
	    }
	    
	    //Opens all taggroups by default
	    $("#tagGroups").find("h3").each(function(index) {
	      //console.log("Entered h3 "+$(this).next().text());
	      $(this).toggleClass("ui-accordion-header-active ui-state-active ui-state-default ui-corner-bottom").end()
	      $(this).next().toggleClass("ui-accordion-content-active").toggle();
	    });
	}
	
	function openTagMenu(tagButton, tag, filePath) {
	    TSCORE.selectedFiles.push(filePath);
	    TSCORE.selectedTag = tag;
	}
	
	// Helper function user by basic and search views
	function generateTagButtons(commaSeparatedTags, fileExtension, fileName, filePath) {
	    console.debug("Creating tags...");
	    var tagString = ""+commaSeparatedTags;
	    var wrapper = $('<span>');
	    if(filePath == undefined) {
	    	filePath = TSCORE.currentPath+TSCORE.TagUtils.DIR_SEPARATOR+fileName;
	    }
	    if(fileExtension.length > 0) {
	        wrapper.append($('<button>', {
	            title: "Opens context menu for "+fileExtension,
	            tag: fileExtension,
	            filename: fileName,
	            filepath: filePath,
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
	            	filepath: filePath,                
	                class: "tagButton",
	                text: tags[i]
	                }));   
	        }   
	    }
	    return wrapper.html();        
	}
	
	// Helper function user by basic and search views
	function buttonizeTitle(title, fileName, filePath) {
	    if(title.length < 1) {
	    	title = "n/a";
	    }
	    if(filePath == undefined) {
	    	filePath = TSCORE.currentPath+TSCORE.TagUtils.DIR_SEPARATOR+fileName;
	    }    
	    return $('<span>').append($('<button>', { 
	            title: fileName, 
	            filepath: filePath,
	            class: 'fileTitleButton', 
	            text: title 
	        })).html();    
	}
	
	// Helper function user by basic and search views
	function buttonizeFileName(fileName, filePath) {
	    if(filePath == undefined) {
	    	filePath = TSCORE.currentPath+TSCORE.TagUtils.DIR_SEPARATOR+fileName;
	    }	
	    return $('<span>').append($('<button>', { 
	        	title: fileName, 
	        	filepath: filePath,
	        	class: 'fileButton', 
	        	text: fileName 
	        })).html();
	}

    // Public API definition
    exports.initContextMenus                 = initContextMenus;
    exports.initDialogs                      = initDialogs;
    exports.generateTagGroups                = generateTagGroups;
    exports.openTagMenu    				     = openTagMenu;
    exports.generateTagButtons               = generateTagButtons;
    exports.buttonizeTitle               	 = buttonizeTitle;
    exports.buttonizeFileName                = buttonizeFileName;

});