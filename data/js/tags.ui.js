/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";

	console.log("Loading tags.ui.js...");
	
	var TSCORE = require("tscore");

	function initUI() {
	
        $( "#extMenuAddTagAsFilter" ).click( function() {
            // TODO search for extension
            //TSCORE.Search.searchForString(TSCORE.selectedTag);            
        });

        // Context menu for the tags in the file table and the file viewer
        $( "#tagMenuAddTagAsFilter" ).click( function() {
            TSCORE.Search.searchForTag(TSCORE.selectedTag);
        });
        
        $( "#tagMenuEditTag" ).click( function() {
            TSCORE.showTagEditDialog();
        });
        
        $( "#tagMenuRemoveTag" ).click( function() {
            TSCORE.TagUtils.removeTag(TSCORE.selectedFiles[0],TSCORE.selectedTag);
        });     
        
        $( "#tagMenuMoveTagFirst" ).click( function() {
            TSCORE.TagUtils.moveTagLocation(TSCORE.selectedFiles[0],TSCORE.selectedTag, "first");
        });                    

        $( "#tagMenuMoveTagRight" ).click( function() {
            TSCORE.TagUtils.moveTagLocation(TSCORE.selectedFiles[0],TSCORE.selectedTag, "next");
        });                

        $( "#tagMenuMoveTagLeft" ).click( function() {
            TSCORE.TagUtils.moveTagLocation(TSCORE.selectedFiles[0],TSCORE.selectedTag, "prev");
        });                
	
	    // Context menu for the tags in the tag tree
        $( "#tagTreeMenuAddTagToFile" ).click( function() {
            TSCORE.TagUtils.addTag(TSCORE.selectedFiles, [TSCORE.selectedTag]);              
        });                

        $( "#tagTreeMenuAddTagAsFilter" ).click( function() {
            TSCORE.Search.searchForTag(TSCORE.selectedTag);
        });                

        $( "#tagTreeMenuEditTag" ).click( function() {
            TSCORE.showTagEditInTreeDialog();
        });                

        $( "#tagTreeMenuDeleteTag" ).click( function() {
            TSCORE.showConfirmDialog(
                "Delete Tag",
                "Do you want to delete this tag from the taggroup?",
                function() {
                    TSCORE.Config.deleteTag(TSCORE.selectedTagData);
                    generateTagGroups();                              
                }
            );
        });                
	    
	    // Context menu for the tags groups
        $( "#tagGroupMenuCreateNewTag" ).click( function() {
            TSCORE.showDialogTagCreate();
        });                

        $( "#tagGroupMenuCreateTagGroup" ).click( function() {
            TSCORE.showDialogTagGroupCreate();
        });                

        $( "#tagGroupMenuMoveUp" ).click( function() {
            TSCORE.Config.moveTagGroup(TSCORE.selectedTagData, "up");
            generateTagGroups(); 
        });                

        $( "#tagGroupMenuMoveDown" ).click( function() {
            TSCORE.Config.moveTagGroup(TSCORE.selectedTagData, "down");
            generateTagGroups(); 
        });                

        $( "#tagGroupMenuEditTagGroup" ).click( function() {
            TSCORE.showDialogEditTagGroup();
        });                

        $( "#tagGroupMenuDeleteTagGroup" ).click( function() {
            TSCORE.showConfirmDialog(
                "Delete TagGroup",
                "Do you want to delete taggroup '"+TSCORE.selectedTagData.title+"' ?",
                function() {
                    TSCORE.Config.deleteTagGroup(TSCORE.selectedTagData);
                    generateTagGroups();                              
                }
            );
        });                

		// Dialogs
        $( "#editTagInTreeButton" ).click( function() {
            TSCORE.Config.editTag(
                TSCORE.selectedTagData, 
                $( "#tagInTreeName" ).val(), 
                $( "#tagColor" ).val(),
                $( "#tagTextColor" ).val()
               );
            generateTagGroups();
            TSCORE.PerspectiveManager.refreshFileListContainer();    
        });   

        $( "#addTagsButton" ).click( function() {
            var tags = $("#tags").val().split(",");
            TSCORE.TagUtils.addTag(TSCORE.selectedFiles, tags);
        });             

        $( "#createTagButton" ).click( function() {
        	var tags = $( "#newTagTitle" ).val().split(",");
            tags.forEach(function (value) {
            	TSCORE.Config.createTag(TSCORE.selectedTagData, value );            	
            });
            generateTagGroups();                    
        });             
	                
        $( "#createTagGroupButton" ).click( function() {
            TSCORE.Config.createTagGroup(TSCORE.selectedTagData, $( "#newTagGroupName" ).val() );
            generateTagGroups();                    
        });             

        $( "#editTagGroupButton" ).click( function() {
            TSCORE.Config.editTagGroup(TSCORE.selectedTagData, $( "#tagGroupName" ).val() );
            generateTagGroups();                    
        });           
	}
	
	function generateTagGroups() {
	    console.log("Generating TagGroups...");
	    $("#tagGroupsContent").empty();
	    $("#tagGroupsContent").addClass("accordion");

        // Show TagGroup create button if no taggroup exist
	    if(TSCORE.Config.Settings["tagGroups"].length < 1) {
            $("#tagGroupsContent").append($("<button>", { 
                "class": "btn",
                text: "Create New Taggroup"
            })
            .click( function(event) {
                TSCORE.showDialogTagGroupCreate();
            })            
            );	        
	        return true;
	    }
	    
	    if(TSCORE.Config.getCalculateTags()) {
    	    // Adding tags to the calculated tag group 
            //console.log("Calculated tags: "+JSON.stringify(exports.calculatedTags));
            for(var i=0; i < TSCORE.Config.Settings["tagGroups"].length; i++) {
                var tagGroupExist = false;
                if(TSCORE.Config.Settings["tagGroups"][i].key == "CTG") {
                    TSCORE.Config.Settings["tagGroups"][i].children = exports.calculatedTags;
                    tagGroupExist = true;
                    break;
                }        
            }
            // Adding the calculated tag group if it not exists
            if(!tagGroupExist) {
                TSCORE.Config.Settings["tagGroups"].push({ 
                        "title": "Tags in Perspective", 
                        "key": "CTG", 
                        "expanded": true,
                        "children": exports.calculatedTags
                    });
            } 
        }
    	    
	    for(var i=0; i < TSCORE.Config.Settings["tagGroups"].length; i++) {
	        $("#tagGroupsContent").append($("<div>", { 
	            "class": "accordion-group disableTextSelection",    
                "style": "width: 99%; border: 0px #aaa solid;",	            
	        })
	        .append($("<div>", { 
	            "class":        "accordion-heading  btn-group",
	            "style":        "width:100%; margin: 0px;",
                "key":          TSCORE.Config.Settings["tagGroups"][i].key,	            
	        })
	        
            .append($("<button>", { // Taggroup toggle button
                        "class":        "btn btn-link tagGroupIcon",
                        "data-toggle":  "collapse",
                        "data-target":  "#tagButtons"+i,
                        "title":        "Toggle TagGroup",
                    }  
                )
                .html("<i class='fa fa-tags'></i>")   
            )// End taggroup toggle button  
                        	        
	        .append($("<button>", {
				"class":        "btn btn-link btn-sm tagGroupTitle",
	            "text":         TSCORE.Config.Settings["tagGroups"][i].title, 
                "key":          TSCORE.Config.Settings["tagGroups"][i].key, 	      
	        })  
	        )
	        .droppable({
                accept: '.tagButton',
                hoverClass: "dirButtonActive",
                drop: function( event, ui ) {
                    //ui.draggable.detach();
                    var tagGroupData = TSCORE.Config.getTagData(ui.draggable.attr("tag"), ui.draggable.attr("parentKey"));
                    tagGroupData.parentKey = ui.draggable.attr("parentKey");
                    var targetTagGroupKey = $(this).attr("key");
                    console.log("Moving tag: "+tagGroupData.title+" to "+targetTagGroupKey);
                    TSCORE.Config.moveTag(tagGroupData, targetTagGroupKey);
                    generateTagGroups();
                    $(ui.helper).remove();
                }                   
            })  
	        
	        .append($("<button>", {
	                "class": "btn btn-link tagGroupActions",
	                "tag": TSCORE.Config.Settings["tagGroups"][i].title, 
	                "key": TSCORE.Config.Settings["tagGroups"][i].key, 
	                "title": "Taggroup options",
 	        })              
	        .append("<b class='fa fa-ellipsis-v'></b>")
	        ) // end gear
	        
	        ) // end heading
	        
	        .append($("<div>", { 
	            "class":   "accordion-body collapse in",
	            "id":      "tagButtons"+i,
	            "style":   "margin: 0px 0px 0px 3px; border: 0px;",
	        })	        
	        .append($("<div>", { 
	            "class":   "accordion-inner",
	            "id":      "tagButtonsContent"+i,
	            "style":   "padding: 2px; border: 0px;",
	        })
	        ) // end accordion-inner	
	        ) // end accordion button        

  	        ); // end group

	        var tagButtons = $("<div>").appendTo( "#tagButtonsContent"+i );  
	        for(var j=0; j < TSCORE.Config.Settings["tagGroups"][i]["children"].length; j++) {
	            var tagTitle = undefined;
	            if(TSCORE.Config.Settings["tagGroups"][i]["children"][j].description != undefined) {
	                tagTitle = TSCORE.Config.Settings["tagGroups"][i]["children"][j].description;
	            } else {
                    tagTitle = "Opens context menu for "+TSCORE.Config.Settings["tagGroups"][i]["children"][j].title;	                
	            }
	            var tagIcon = "";
                if(TSCORE.Config.Settings["tagGroups"][i]["children"][j].type == "smart"){
                    tagIcon = "<span class='fa fa-flask'/> ";
                }
                var tagCount = "";
                if(TSCORE.Config.Settings["tagGroups"][i]["children"][j].count != undefined) {
                    tagCount = " ("+TSCORE.Config.Settings["tagGroups"][i]["children"][j].count+")"; 
                }                
	            tagButtons.append($("<a>", { 
	                "class":         "btn btn-sm tagButton", 
	                "tag":           TSCORE.Config.Settings["tagGroups"][i]["children"][j].title, 
	                "parentKey":     TSCORE.Config.Settings["tagGroups"][i].key,
	                "title":         tagTitle,
	                "text":          TSCORE.Config.Settings["tagGroups"][i]["children"][j].title+tagCount+" ",
	                "style":         generateTagStyle(TSCORE.Config.Settings["tagGroups"][i]["children"][j]), 
	            })            
                .draggable({
                    "appendTo":   "body",
                    "helper":     "clone",
                    "revert":     'invalid',
                    "start":     function(e, ui) {
                        TSCORE.selectedTagData = TSCORE.Config.getTagData($(this).attr("tag"), $(this).attr("parentKey"));
                        TSCORE.selectedTag = generateTagValue(TSCORE.selectedTagData);
                        TSCORE.selectedTagData.parentKey = $(this).attr("parentKey");                         
                    }                     
                }) 
                .prepend(tagIcon)
                .append("<span class='caret'/>")
                );
	       } 
	    }
        
        $("#tagGroupsContent").on("contextmenu click", ".tagGroupActions", function (e) {
            TSCORE.hideAllDropDownMenus();
            TSCORE.selectedTag = $(this).attr("tag");
            TSCORE.selectedTagData = TSCORE.Config.getTagGroupData($(this).attr("key"));
            TSCORE.selectedTagData.parentKey = undefined;  

            TSCORE.showContextMenu("#tagGroupMenu", $(this));

            return false;
        });

        $("#tagGroupsContent").on("contextmenu click", ".tagButton", function (e) {
            TSCORE.hideAllDropDownMenus();
            TSCORE.selectedTagData = TSCORE.Config.getTagData($(this).attr("tag"), $(this).attr("parentKey"));
            TSCORE.selectedTag = generateTagValue(TSCORE.selectedTagData);
            TSCORE.selectedTagData.parentKey = $(this).attr("parentKey");

            TSCORE.showContextMenu("#tagTreeMenu", $(this));

            return false;
        });               

	}
		
    function generateTagValue(tagData) {
        var tagValue = tagData.title;
        if (tagData.type == "smart") {
            switch (tagData.functionality){
                case "here": {
                    /* window.onload = function() {
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(function(position) {
                                var lat = position.coords.latitude;
                                var lng = position.coords.longitude;
                                alert("Current position: " + lat + " " + lng);
                            }, function(error) {
                                alert('Error occurred. Error code: ' + error.code);         
                            },{timeout:50000});
                        }else{
                            alert('no geolocation support');
                        }
                    };*/
                    break;                
                }
                case "today": {
                    tagValue = TSCORE.TagUtils.formatDateTime4Tag(new Date(), false);   
                    break;                
                }
                case "tomorrow": {
                    var d = new Date();
                    d.setDate(d.getDate() + 1);
                    tagValue = TSCORE.TagUtils.formatDateTime4Tag(d, false);   
                    break;                
                }
                case "yesterday": {
                    var d = new Date();
                    d.setDate(d.getDate() - 1);
                    tagValue = TSCORE.TagUtils.formatDateTime4Tag(d, false);   
                    break;                
                }
                case "currentMonth": {
                    var cMonth = ""+((new Date()).getMonth()+1);
                    if(cMonth.length == 1) {
                        cMonth = "0"+cMonth;
                    }
                    tagValue = ""+(new Date()).getFullYear()+cMonth;   
                    break;                
                }                                
                case "currentYear": {
                    tagValue = ""+(new Date()).getFullYear();   
                    break;                
                }   
                case "now": {
                    tagValue = TSCORE.TagUtils.formatDateTime4Tag(new Date(), true);   
                    break;                
                }
                default : {
                    break;                            
                }
            }            
        }
        return tagValue;                   
    }   
    		
	function openTagMenu(tagButton, tag, filePath) {
	    TSCORE.selectedFiles.push(filePath);
	    TSCORE.selectedTag = tag;
	}
	
	// Helper function generating tag buttons
	function generateTagButtons(commaSeparatedTags, filePath) {
	    //console.log("Creating tags...");
	    var tagString = ""+commaSeparatedTags;
	    var wrapper = $('<span>');
	    if(tagString.length > 0) {
	        var tags = tagString.split(",");
	        for (var i=0; i < tags.length; i++) { 
	            wrapper.append($('<button>', {
	                title: "Opens context menu for "+tags[i],
	                tag: tags[i],
	            	filepath: filePath,                
	                "class":  "btn btn-sm tagButton", 
	                text: tags[i]+" ",
	                style: generateTagStyle(TSCORE.Config.findTag(tags[i]))
	                })
	                .append("<span class='caret'/>")
                );   
	        }   
	    }
	    return wrapper.html();        
	}
	
	// Get the color for a tag
	function generateTagStyle(tagObject) {
        var tagStyle = "";
        if(tagObject.color != undefined) {
           var textColor = tagObject.textcolor;
           if(textColor == undefined) {
              textColor = "white"; 
           }
           tagStyle = "color: "+textColor+" !important; background-color: "+tagObject.color+" !important;";
        }
        return tagStyle;	    
	}	
	
    // Helper function generating file extension button
    function generateExtButton(fileExtension, filePath) {
        //console.log("Creating ext button...");
        var wrapper = $('<span>');
        if(fileExtension.length > 0) {
            wrapper.append($('<button>', {
                title: "Opens context menu for "+fileExtension,
                tag: fileExtension,
                filepath: filePath,
                "class":  "btn btn-sm extTagButton",                
                text: fileExtension+" "
                })
                .append("<span class='caret'/>")
                );          
        } 
        return wrapper.html();        
    }	

    function showDialogTagCreate() {
        $( "#newTagTitle" ).val("");         
        $( '#dialogTagCreate' ).modal({show: true});        
    }   

    function showDialogEditTagGroup() {
        $( "#tagGroupName" ).val(TSCORE.selectedTagData.title);              
        $( '#dialogEditTagGroup' ).modal({show: true});        
    }
    
    function showDialogTagGroupCreate() {
        $( "#newTagGroupName" ).val("");         
        $( '#dialogTagGroupCreate' ).modal({show: true});        
    }

    function showTagEditInTreeDialog() {
        $( "#tagInTreeName" ).val(TSCORE.selectedTagData.title);
        $( "#tagColor" ).simplecolorpicker({picker: false, theme: 'fontawesome'});
        
        if(TSCORE.selectedTagData.color == undefined || TSCORE.selectedTagData.color.length < 1) {
            $( "#tagColor" ).simplecolorpicker('selectColor', '#008000');  
        } else {
            $( "#tagColor" ).simplecolorpicker('selectColor', TSCORE.selectedTagData.color);   
        }
        
        $( "#tagTextColor" ).simplecolorpicker({picker: false, theme: 'fontawesome'});
        
        if(TSCORE.selectedTagData.textcolor == undefined || TSCORE.selectedTagData.textcolor.length < 1) {
            $( "#tagTextColor" ).simplecolorpicker('selectColor', '#ffffff');            
        } else {
            $( "#tagTextColor" ).simplecolorpicker('selectColor', TSCORE.selectedTagData.textcolor);            
        }
        $( '#dialogEditInTreeTag' ).modal({show: true});        
    }	

	function showAddTagsDialog() {
	    console.log("Adding tags..."); 
        function split( val ) {
            return val.split( /,\s*/ );
        }
        function extractLast( term ) {
            return split( term ).pop();
        }
        
        $('#tags').select2('data', null);
		$("#tags").select2({
	        multiple: true,
			tags: TSCORE.Config.getAllTags(),
			tokenSeparators: [",", " "],
			minimumInputLength: 2,
		});                   

        $( '#dialogAddTags' ).modal({show: true});
	}    

    // Public Vars
    exports.calculatedTags                   = [];

    // Public API definition
    exports.initUI			                 = initUI;
    exports.generateTagGroups                = generateTagGroups;
    exports.openTagMenu    				     = openTagMenu;
    exports.generateTagStyle                 = generateTagStyle;
    exports.generateTagButtons               = generateTagButtons;
    exports.generateExtButton                = generateExtButton;
	exports.showAddTagsDialog				 = showAddTagsDialog;
	exports.showTagEditInTreeDialog          = showTagEditInTreeDialog;	
    exports.showDialogTagCreate              = showDialogTagCreate;
    exports.showDialogEditTagGroup           = showDialogEditTagGroup;
    exports.showDialogTagGroupCreate	     = showDialogTagGroupCreate;

});