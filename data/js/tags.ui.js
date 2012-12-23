/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
/*
define([
    'require',
    'exports',
    'module',
    'dynatree',
//    'css!dynatreecss'
],function(require, exports, module) {
"use strict";
*/
console.debug("Loading TagsUI...");

var TagsUI = (typeof TagsUI == 'object' && TagsUI != null) ? TagsUI : {};

TagsUI.initContextMenus = function() {

//    $( "#tagSuggestionsMenu" ).menu({
//        select: function( event, ui ) {
//            console.debug("Tag suggestion "+ui.item.attr( "action" )+" for tag: "+UIAPI.selectedTag);            
//        }        
//    });        
    
    // Context menu for the tags in the file table and the file viewer
    $( "#tagMenu" ).menu({
        select: function( event, ui ) {
            console.debug("Tag menu action: "+ui.item.attr( "action" )+" for tag: "+UIAPI.selectedTag);
            switch (ui.item.attr( "action" )) {
              case "addTagAsFilter":
                $( this ).hide();
                $("#filterBox").val(UIAPI.selectedTag);
                UIAPI.fileTable.fnFilter(UIAPI.selectedTag);
                break;                            
              case "addTagInTagGroup":
                $( this ).hide();
                // TODO Finish add tag in group
                break;                            
              case "editTag":
                $( this ).hide();
                $( "#newTag" ).val(UIAPI.selectedTag);
                $( "#dialogEditTag" ).dialog( "open" );
                break;                            
              case "removeTag":
                $( this ).hide();
                TSAPI.removeTag(UIAPI.selectedTag);
                break;
              case "closeMenu":
                $( this).hide();                
                break;                
            }
        }
    });

    // Context menu for the tags in the tag tree
    $( "#tagTreeMenu" ).menu({
        select: function( event, ui ) {
            console.debug("Tag menu action: "+ui.item.attr( "action" )+" for tag: "+UIAPI.selectedTag);
            switch (ui.item.attr( "action" )) {
              case "addTagToFile":
                TSAPI.addTag(UIAPI.selectedTag, UIAPI.selectedTagData.type);  
                break;                            
              case "addTagAsFilter":
                $("#filterBox").val(UIAPI.selectedTag);
                UIAPI.fileTable.fnFilter(UIAPI.selectedTag);
                break;                            
              case "editTag":
              // TODO Consider smart tags
                $( "#tagName" ).val(UIAPI.selectedTagData.title);
                $( "#dialog-tagedit" ).dialog( "open" );
                break;                            
              case "deleteTag":
                $( "#dialog-confirmtagdelete" ).dialog( "open" );                
                break;
              case "closeMenu":
                $( this ).hide();                
                break;
            }
        }
    });
    
    // Context menu for the tags groups
    $( "#tagGroupMenu" ).menu({
        select: function( event, ui ) {
            console.debug("TagGroup  menu action: "+ui.item.attr( "action" )+" for tag: "+UIAPI.selectedTag);
            switch (ui.item.attr( "action" )) {
              case "toggleTagGroup":
                $("#tagGroups").dynatree("getTree").getNodeByKey(UIAPI.selectedTagData.key).toggleExpand();
                break;                            
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
                $( "#tagGroupName" ).val(UIAPI.selectedTagData.title);              
                $( "#dialog-taggroupEdit" ).dialog( "open" );
                break;
              case "closeMenu":
                $( "#tagGroupMenu" ).hide();                
                break;                
            }
        }
    });  
}

TagsUI.initDialogs = function() {

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
                    for (var i=0; i < UIAPI.selectedFiles.length; i++) {
                       TSAPI.writeTagsToFile(UIAPI.selectedFiles[i], [smartTag.val()]);
                    };
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
    
    $( "#dialog-confirmtagremove" ).dialog({
        autoOpen: false,
        resizable: false,
        height:140,
        modal: true,
        buttons: {
            "Remove tag": function() {
                TSAPI.removeTag(UIAPI.selectedTag);  
                $( this ).dialog( "close" );
                IOAPI.listDirectory(UIAPI.currentPath);   
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        }
    });    

    $( "#dialog-confirmtagdelete" ).dialog({
        autoOpen: false,
        resizable: false,
        height:140,
        modal: true,
        buttons: {
            "Delete tag from taggroup": function() {                
                TSSETTINGS.deleteTag(UIAPI.selectedTagData);
                TagsUI.updateTagGroups();    
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
                TSSETTINGS.deleteTagGroup(UIAPI.selectedTagData);
                TagsUI.updateTagGroups();    
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
                // TODO complete the functionality for smart tags
                TSSETTINGS.editTag(UIAPI.selectedTagData, $( "#tagName" ).val() )
                TagsUI.updateTagGroups();    
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
            "Create tag": function() {
                TSSETTINGS.createTag(UIAPI.selectedTagData, $( "#newTagName" ).val() )
                TagsUI.updateTagGroups();                    
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
            "Duplicate taggroup": function() {
                TSSETTINGS.duplicateTagGroup(UIAPI.selectedTagData, $( "#newTagGroupName" ).val(), $( "#newTagGroupKey" ).val() )
                TagsUI.updateTagGroups();                    
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
                TSSETTINGS.editTagGroup(UIAPI.selectedTagData, $( "#tagGroupName" ).val() )
                TagsUI.updateTagGroups();                    
                $( this ).dialog( "close" );
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        }
    });               
}

TagsUI.updateTagGroups = function() {
    console.debug("Updating TagGroups tree..."); //+JSON.stringify(TSSETTINGS.Settings["tagGroups"]));
    var tagTree = $("#tagGroups").dynatree("getRoot")
    tagTree.removeChildren();
    tagTree.addChild(TSSETTINGS.Settings["tagGroups"]);        
}

TagsUI.initTagTree = function() {
    // Init the tag tree / taggroups module
    $("#tagGroups").dynatree({
      clickFolderMode: 1,
      onClick: function(node, event) {
        if(!node.data.isFolder) {
           // var jsnode = $.ui.dynatree.getNode(this);
            UIAPI.selectedTag = node.data.title;
            UIAPI.selectedTagData = node.data;
            UIAPI.selectedTagData.parentKey = node.parent.data.key;
            $("#tagGroupMenu").hide();
            $("#tagTreeMenu").show().position({
                my: "left top",
                at: "left bottom",
                of: $("a", $(node.li))
            }); 
            $( document ).one( "click", function() {
                $("#tagTreeMenu").hide();
            });
            return false;            
        } else {
            UIAPI.selectedTag = node.data.title;
            UIAPI.selectedTagData = node.data;
            UIAPI.selectedTagData.parentKey = undefined;  
            $("#tagTreeMenu").hide();
            $("#tagGroupMenu").show().position({
                my: "left top",
                at: "left bottom",
                of: $("a", $(node.li))
            }); 
            $( document ).one( "click", function() {
                $("#tagGroupMenu").hide();
            });
            return false;                            
        }        
      },
      onDblClick: function(node, event) {
        node.toggleExpand();
      },      
    });     
}

TagsUI.openTagMenu = function(tagButton, tag, fileName) {
    BasicViewsUI.clearSelectedFiles();
    $(tagButton).parent().parent().toggleClass("selectedRow");

    UIAPI.currentFilename = fileName;
    UIAPI.selectedFiles.push(UIAPI.currentFilename);
    
    UIAPI.selectedTag = tag;
    UIAPI.currentFilename = fileName;
    var menu = $("#tagMenu").show().position({
        my: "left top",
        at: "left bottom",
        of: tagButton
    });
    // TODO Hide menu
/*    $( document ).one( "click", function() {
        menu.hide();
    });
   return false;*/
}

//});