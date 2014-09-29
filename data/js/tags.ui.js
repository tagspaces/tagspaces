/* Copyright (c) 2012-2014 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
/* global define, Handlebars  */

 define(function(require, exports, module) {
"use strict";

    console.log("Loading tags.ui.js...");

    var locationTagGroupKey    = "LTG",
        calculatedTagGroupKey  = "CTG";

    var TSCORE = require("tscore");

    var tagGroupsTmpl = Handlebars.compile(
        '{{#each tagGroups}}'+
        '<div class="accordion-group disableTextSelection tagGroupContainer">'+
            '<div class="accordion-heading  btn-group ui-droppable tagGroupContainerHeading" key="{{key}}">'+
                '<button class="btn btn-link btn-lg tagGroupIcon" data-toggle="collapse" data-target="#tagButtons{{@index}}" data-i18n="[title]ns.common:toggleTagGroup" title="{{../toggleTagGroup}}">'+
                    '<i class="fa fa-tags fa-fw"></i>'+
                '</button>'+
                '<button class="btn btn-link tagGroupTitle" key="{{key}}">{{title}}</button>'+
                '<button class="btn btn-link btn-lg tagGroupActions" key="{{key}}" data-i18n="[title]ns.common:tagGroupOperations" title="{{../tagGroupOperations}}">'+
                    '<b class="fa fa-ellipsis-v"></b>'+
                '</button>'+
            '</div>'+
            '<div class="accordion-body collapse in" id="tagButtons{{@index}}">'+
                '<div class="accordion-inner" id="tagButtonsContent{{@index}}" style="padding: 2px;">'+
                    '<div>'+
                        '{{#each children}}'+
                        '<a class="btn btn-sm tagButton" tag="{{title}}" parentkey="{{../key}}" style="{{style}}" title="{{titleUI}}" >' +
                            '<span class="{{icon}}" /> '+
                            '{{title}}'+
                            '{{#if count}} [{{count}}]{{/if}}'+
                            ' <span class="caret"></span>'+
                        '</a>'+
                        '{{/each}}'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>'+
        '{{/each}}'
    );

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

        $( "#tagGroupSort" ).click( function() {
            TSCORE.Config.sortTagGroup(TSCORE.selectedTagData);
            generateTagGroups();
        });

        $( "#tagGroupMenuMoveUp" ).click( function() {
            TSCORE.Config.moveTagGroup(TSCORE.selectedTagData, "up");
            generateTagGroups(); 
        });                

        $( "#tagGroupMenuMoveDown" ).click( function() {
            TSCORE.Config.moveTagGroup(TSCORE.selectedTagData, "down");
            generateTagGroups(); 
        });                

        $( "#tagGroupMenuEdit" ).click( function() {
            TSCORE.showDialogEditTagGroup();
        });                

        $( "#tagGroupMenuDelete" ).click( function() {
            TSCORE.showConfirmDialog(
                $.i18n.t("ns.dialogs:deleteTagGroupTitleConfirm"),
                $.i18n.t("ns.dialogs:deleteTagGroupContentConfirm", {tagGroup: TSCORE.selectedTagData.title}),
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
                $( "#tagTextColor" ).val(),
                $( "#tagInTreeKeyBinding" ).val()
               );
            generateTagGroups();
            TSCORE.PerspectiveManager.refreshFileListContainer();    
        });

        $( "#cleanTagsButton" ).click( function() {
            TSCORE.showConfirmDialog(
                $.i18n.t("ns.dialogs:cleanFilesTitleConfirm"),
                $.i18n.t("ns.dialogs:cleanFilesContentConfirm"),
                function() {
                    TSCORE.TagUtils.cleanFilesFromTags(TSCORE.selectedFiles);
                }
            );
        });

        $( "#addTagsButton" ).click( function() {
            var tags = $("#tags").val().split(",");
            TSCORE.TagUtils.addTag(TSCORE.selectedFiles, tags);
        });             
        
        $( "#removeTagsButton" ).click( function() {
            var tags = $("#tags").val().split(",");
            TSCORE.TagUtils.removeTags(TSCORE.selectedFiles, tags);
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
        var $tagGroupsContent = $("#tagGroupsContent");
        $tagGroupsContent.children().remove();
        $tagGroupsContent.addClass("accordion");

        // Show TagGroup create button if no taggroup exist
        if(TSCORE.Config.Settings.tagGroups.length < 1) {
            $tagGroupsContent.append($("<button>", {
                "class":        "btn",
                "text":         $.i18n.t("ns.common:createTagGroup"),
                "data-i18n":    "ns.common:createTagGroup"
            })
            .click( function() {
                TSCORE.showDialogTagGroupCreate();
            })            
            );
            return true; // quit the taggroup generation
        }

        var tagGroups = TSCORE.Config.Settings.tagGroups;
        var tag;

        // Cleaning Special TagGroups
        for(var k=0; k < tagGroups.length; k++) {
            if(tagGroups[k].key.indexOf(locationTagGroupKey) === 0 || tagGroups[k].key === calculatedTagGroupKey) {
                console.log("Deleting:"+tagGroups[k].key+" "+k);
                tagGroups.splice(k, 1);
                k--;
            }
        }

        // Adding tags to the calculated tag group
        if(TSCORE.Config.getCalculateTags() && TSCORE.calculatedTags !== null) {
            tagGroups.push({
                "title": $.i18n.t("ns.common:tagsFromCurrentFolder"),
                "key": calculatedTagGroupKey,
                "expanded": true,
                "children": TSCORE.calculatedTags
            });
        }

        // Adding tag groups from the current location
        if(TSCORE.Config.getLoadLocationMeta() && TSCORE.locationTags !== null) {
            TSCORE.locationTags.forEach(function(data) {
                tagGroups.push({
                    "title": data.title+" (imported)",
                    "key": locationTagGroupKey+TSCORE.TagUtils.formatDateTime4Tag(new Date(),true, true),
                    "expanded": true,
                    "children": data.children
                });
            });

        }

        // ehnances the taggroups with addition styling information
        for(var i=0; i < tagGroups.length; i++) {
            for(var j=0; j < tagGroups[i].children.length; j++) {
                tag = tagGroups[i].children[j];

                if(tag.description !== undefined) {
                    tag.titleUI = tag.description;
                } else {
                    tag.titleUI = tag.title;
                }

                tag.icon = "";
                if(tag.type === "smart"){
                    tag.icon = "fa fa-flask";
                }

                // Add keybinding to tags
                if(tag.keyBinding !== undefined && tag.keyBinding.length > 0) {
                    tag.icon = "fa fa-keyboard-o";
                    tag.titleUI = tag.titleUI + " [" +tag.keyBinding+ "]";
                    Mousetrap.unbind(tag.keyBinding);
                    Mousetrap.bind(
                        tag.keyBinding,
                        (function(innerTag) {
                            return function( e ) {
                                TSCORE.TagUtils.addTag(TSCORE.selectedFiles, [innerTag]);
                            };
                        })(tag.title)
                    );
                }
                tag.style = generateTagStyle(tag);
            }
        }

        $tagGroupsContent.html(tagGroupsTmpl({
             "tagGroups":           tagGroups,
             "toggleTagGroup":      $.i18n.t("ns.common:toggleTagGroup"),
             "tagGroupOperations":  $.i18n.t("ns.common:tagGroupOperations")
         }));

        $tagGroupsContent.find(".tagButton").each(function() {
            $(this).draggable({
                    "appendTo":   "body",
                    "helper":     "clone",
                    "revert":     'invalid',
                    "start":     function() {
                        console.log("Start dragging..........");
                        TSCORE.selectedTagData = TSCORE.Config.getTagData($(this).attr("tag"), $(this).attr("parentKey"));
                        TSCORE.selectedTag = generateTagValue(TSCORE.selectedTagData);
                        TSCORE.selectedTagData.parentKey = $(this).attr("parentKey");
                    }
                })
        });

        $tagGroupsContent.find(".tagGroupTitle").each(function() {
            $(this)
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
        });

        $tagGroupsContent.on("contextmenu click", ".tagGroupActions", function () {
            TSCORE.hideAllDropDownMenus();
            TSCORE.selectedTag = $(this).attr("tag");
            TSCORE.selectedTagData = TSCORE.Config.getTagGroupData($(this).attr("key"));
            TSCORE.selectedTagData.parentKey = undefined;
            TSCORE.showContextMenu("#tagGroupMenu", $(this));
            return false;
        });

        $tagGroupsContent.on("contextmenu click", ".tagButton", function () {
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
        var d;
        if (tagData.type === "smart") {
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
                    d = new Date();
                    d.setDate(d.getDate() + 1);
                    tagValue = TSCORE.TagUtils.formatDateTime4Tag(d, false);   
                    break;                
                }
                case "yesterday": {
                    d = new Date();
                    d.setDate(d.getDate() - 1);
                    tagValue = TSCORE.TagUtils.formatDateTime4Tag(d, false);   
                    break;                
                }
                case "currentMonth": {
                    var cMonth = ""+((new Date()).getMonth()+1);
                    if(cMonth.length === 1) {
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

    var tagButtonTmpl = Handlebars.compile('{{#each tags}} <button class="btn btn-sm tagButton" tag="{{tag}}" ' +
        'filepath="{{filepath}}" style="{{style}}">{{tag}} <span class="caret"></span></button>{{/each}}');

    // Helper function generating tag buttons
    function generateTagButtons(commaSeparatedTags, filePath) {
        //console.log("Creating tags...");
        var tagString = ""+commaSeparatedTags;

        var context = { tags : [] };

        if(tagString.length > 0) {
            var tags = tagString.split(",");
            for (var i=0; i < tags.length; i++) {
                context.tags.push({
                    filepath: filePath,
                    tag: tags[i],
                    style: generateTagStyle(TSCORE.Config.findTag(tags[i]))
                });
            }
        }

        return tagButtonTmpl(context);
    }

    // Get the color for a tag
    function generateTagStyle(tagObject) {
        var tagStyle = "";
        if(tagObject.color !== undefined) {
           var textColor = tagObject.textcolor;
           if(textColor === undefined) {
              textColor = "white"; 
           }
           tagStyle = "color: "+textColor+" !important; background-color: "+tagObject.color+" !important;";
        }
        return tagStyle;
    }

    function showDialogTagCreate() {
        $( "#newTagTitle" ).val("");

        $("#formAddTags").validator();
        $('#formAddTags').on('invalid.bs.validator', function() {
            $( "#createTagButton").prop( "disabled", true );
        });
        $('#formAddTags').on('valid.bs.validator', function() {
            $( "#createTagButton").prop( "disabled", false );
        });

        $('#dialogTagCreate').on('shown.bs.modal', function () {
          $('#newTagTitle').focus();
        });
        $('#dialogTagCreate').modal({backdrop: 'static',show: true});
    }   

    function showDialogEditTagGroup() {
        $( "#tagGroupName" ).val(TSCORE.selectedTagData.title);

        $("#formTagGroupEdit").validator();
        $('#formTagGroupEdit').on('invalid.bs.validator', function() {
            $( "#editTagGroupButton").prop( "disabled", true );
        });
        $('#formTagGroupEdit').on('valid.bs.validator', function() {
            $( "#editTagGroupButton").prop( "disabled", false );
        });

        $('#dialogEditTagGroup').on('shown.bs.modal', function () {
          $('#tagGroupName').focus();
        });

        $( '#dialogEditTagGroup' ).modal({backdrop: 'static',show: true});
    }
    
    function showDialogTagGroupCreate() {
        $( "#newTagGroupName" ).val("");

        $("#formTagGroupCreate").validator();
        $('#formTagGroupCreate').on('invalid.bs.validator', function() {
            $( "#createTagGroupButton").prop( "disabled", true );
        });
        $('#formTagGroupCreate').on('valid.bs.validator', function() {
            $( "#createTagGroupButton").prop( "disabled", false );
        });

        $('#dialogTagGroupCreate').on('shown.bs.modal', function () {
          $('#newTagGroupName').focus();
        });

        $( '#dialogTagGroupCreate' ).modal({backdrop: 'static',show: true});
    }

    function showTagEditInTreeDialog() {
        $( "#tagInTreeName" ).val(TSCORE.selectedTagData.title);

        $( "#tagInTreeKeyBinding" ).val(TSCORE.selectedTagData.keyBinding);

        var $tagColorChooser = $( "#tagColorChooser" );
        var  $tagColor =  $('#tagColor');
        $tagColorChooser.simplecolorpicker({picker: false});
        $tagColorChooser.on("change", function() {
            $tagColor.val($tagColorChooser.val());
        });
        if(TSCORE.selectedTagData.color === undefined
            || TSCORE.selectedTagData.color.length < 1) {
            $tagColor.val('#008000');
        } else {
            $tagColor.val(TSCORE.selectedTagData.color);
        }

        var $tagTextColorChooser = $( "#tagTextColorChooser" );
        var  $tagTextColor =  $('#tagTextColor');
        $tagTextColorChooser.simplecolorpicker({picker: false});
        $tagTextColorChooser.on("change", function() {
            $tagTextColor.val($tagTextColorChooser.val());
        });
        if(TSCORE.selectedTagData.textcolor === undefined
            || TSCORE.selectedTagData.textcolor.length < 1) {
            $tagTextColor.val('#ffffff');
        } else {
            $tagTextColor.val(TSCORE.selectedTagData.textcolor);
        }

        $("#formEditInTreeTag").validator();
        $('#formEditInTreeTag').on('invalid.bs.validator', function() {
            $( "#editTagInTreeButton").prop( "disabled", true );
        });
        $('#formEditInTreeTag').on('valid.bs.validator', function() {
            $( "#editTagInTreeButton").prop( "disabled", false );
        });

        $('#dialogEditInTreeTag').on('shown.bs.modal', function () {
          $('#tagInTreeName').focus();
        });

        $( '#dialogEditInTreeTag' ).modal({backdrop: 'static',show: true});        
    }	

    function showAddTagsDialog() {
        console.log("Adding tags...");
        //function split( val ) {
        //    return val.split( /,\s*/ );
        //}
        //function extractLast( term ) {
        //    return split( term ).pop();
        //}*/
        
        $('#tags').select2('data', null);
        $("#tags").select2({
            multiple: true,
            tags: TSCORE.Config.getAllTags(),
            tokenSeparators: [","," "],
            minimumInputLength: 2,
            selectOnBlur: true
        });

        $('#dialogAddTags').on('shown.bs.modal', function () {
          $('.select2-input').focus();
        });

        $( '#dialogAddTags' ).modal({backdrop: 'static',show: true});
    }

    // Public Vars
    exports.calculatedTags                   = [];
    exports.locationTags                     = [];

    // Public API definition
    exports.initUI                           = initUI;
    exports.generateTagGroups                = generateTagGroups;
    exports.openTagMenu                      = openTagMenu;
    exports.generateTagStyle                 = generateTagStyle;
    exports.generateTagButtons               = generateTagButtons;
    exports.showAddTagsDialog                = showAddTagsDialog;
    exports.showTagEditInTreeDialog          = showTagEditInTreeDialog;
    exports.showDialogTagCreate              = showDialogTagCreate;
    exports.showDialogEditTagGroup           = showDialogEditTagGroup;
    exports.showDialogTagGroupCreate         = showDialogTagGroupCreate;

});
