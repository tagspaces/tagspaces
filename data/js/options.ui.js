/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";

    console.log("Loading options.ui.js ...");
    
    var TSCORE = require("tscore");

    function generateUI() {
        var optionsUI = $("#dialogOptions").find(".form-horizontal");
     
        optionsUI.append("<h5>Perspectives</h5>");

        optionsUI.append("<div id='perspectiveList' class='sortable' />");

        optionsUI.append("<button class='btn' id='addPerspectiveButton' title='Add new perspective'><i class='icon-plus'></button>");

        optionsUI.append($("<h5>File Types</h5>"));
        
        optionsUI.append("<div id='fileTypesList'>");

        optionsUI.append("<button class='btn' id='addFileTypeButton' title='Add new file extension'><i class='icon-plus'></button>");
        
        optionsUI.append($("<h5>Miscellaneous</h5>"));
                      
/*        optionsUI.append($("<div class='control-group'>", {})
            .append($("<label class='control-label' for='extensionsPathInput'>Extensions folder</label>"))
            .append($("<div class='controls'>", {})
                .append($("<input type='text' class='input-xlarge' id='extensionsPathInput' placeholder='file:///c:\\tagspaces-extensions' title='Path to your tagspaces extensions'>", {})
                )
            )
        ); */       

        optionsUI.append($("<div class='control-group'>", {})
            .append($("<div class='controls'>", {})
                .append($("<label class='checkbox'>Show hidden files/directories in *nix sytemes</label>")
                    .append($("<input type='checkbox' id='showHiddenFilesCheckbox' />"))
                )
            )
        );

        optionsUI.append($("<div class='control-group'>", {})
            .append($("<div class='controls'>", {})
                .append($("<label class='checkbox'>Check for new version on startup</label>")
                    .append($("<input type='checkbox' id='checkforUpdatesCheckbox' />"))
                )
            )
        );
        
        optionsUI.append($("<p>Some of the changes will be not visible until restarting TagSpaces.</p>"));        
 
    }   

    function generateSelectOptions(parent, data, selectedId) {
        parent.empty();
        parent.append($("<option>").text("").val("false"))
        data.forEach( function(value) {
                if (selectedId == value) { 
                    parent.append($("<option>").attr("selected","selected").text(value).val(value))                
                } else {
                    parent.append($("<option>").text(value).val(value))                    
                }    
            }            
        )
    }

    function addPerspective(parent, perspectiveId) {
        var perspectiveControl = $("<div class='control control-row'>")
                .append($("<div class='input-prepend input-append btn-group' style='padding: 3px 5px'>")
                    .append($("<a class='btn' href='#' ><span class='icon-ellipsis-vertical'></span></a>"))
                    .append($("<select class='span3'></select>"))
                    //.append($("<input autocomplete='off' class='span3' type='text' placeholder='perspective ID'>").val(perspectiveId))
                    //.append($("<a class='btn' href='#'>").append("<span class='caret'></span>"))
                    .append($("<button class='btn' title='Remove this extension'><i class='icon-remove'></button>")
                        .click(function() {
                            $(this).parent().parent().remove();
                        })                
                    )
                )
                //.append($("<button class='btn' title='Remove this extension'><i class='icon-arrow-up'></button>"))
                //.append($("<button class='btn' title='Remove this extension'><i class='icon-arrow-down'></button>"))  

        generateSelectOptions(perspectiveControl.find("select"), TSCORE.Config.getPerspectiveExtensions(), perspectiveId);
        parent.append(perspectiveControl);
    }    
   
    function addFileType(parent, fileext, viewerId, editorId) {
        var fileTypeControl = $("<div class='control control-row'>")
                .append($("<div class='input-prepend input-append btn-group' style='padding: 3px 5px'>")
                    .append($("<input type='text' class='span1' placeholder='e.g: jpg'>").val(fileext))
                    .append($("<select class='ftviewer span2'></select>"))
                    .append($("<select class='fteditor span2'></select>"))                
                    .append($("<button class='btn' title='Remove this file type'><i class='icon-remove'></button>")
                        .click(function() {
                            $(this).parent().parent().remove();
                        })
                    )
                )
        generateSelectOptions(fileTypeControl.find(".ftviewer"), TSCORE.Config.getViewerExtensions(), viewerId);
        generateSelectOptions(fileTypeControl.find(".fteditor"), TSCORE.Config.getEditorExtensions(), editorId);
        parent.append(fileTypeControl);
    }    
    
    function initUI() {
        $("#extensionsPathInput").val(TSCORE.Config.getExtensionPath()); 
        $("#showHiddenFilesCheckbox").attr("checked",TSCORE.Config.getShowUnixHiddenEntries());
        $("#checkforUpdatesCheckbox").attr("checked",TSCORE.Config.getCheckForUpdates());
        
        TSCORE.Config.getPerspectives().forEach(function (value, index) {
            addPerspective($('#perspectiveList'), value.id);
        });

        $( "#perspectiveList" ).sortable();

        TSCORE.Config.getSupportedFileTypes().forEach(function (value, index) {
            addFileType($('#fileTypesList'), value.type, value.viewer, value.editor);
        });
        
        $('#saveSettingsCloseButton').click(function() {
            updateSettings(); 
            $('#dialogOptions').modal("hide");
            //TSCORE.reloadUI();            
        }) 
        
        $('#addFileTypeButton').click(function() {
            addFileType($('#fileTypesList'), "", "", "")
        }) 

        $('#addPerspectiveButton').click(function() {
            addPerspective($('#perspectiveList'), "")
        })        
    }    

    function collectPerspectivesData() {
        var data = new Array();
        $('#perspectiveList').children().each( function(index, element) {
                data.push({
                    "id":$(element).find("select").val(),
                });
            }            
        ) 
        return data;
    }

    function collectSupportedFileTypesData() {
        var data = new Array();
        $('#fileTypesList').children().each( function(index, element) {
                data.push({
                    "type":     $(element).find("input").val(),
                    "viewer":   $(element).find(".ftviewer").val(),
                    "editor":   $(element).find(".fteditor").val(),
                    });
            }            
        ) 
        return data;
    }
    
    function updateSettings() {
//        TSCORE.Config.setExtensionPath($("#extensionsPathInput").val());
        TSCORE.Config.setShowUnixHiddenEntries($('#showHiddenFilesCheckbox').is(":checked"));
        TSCORE.Config.setCheckForUpdates($('#checkforUpdatesCheckbox').is(":checked"));

        TSCORE.Config.setPerspectives(collectPerspectivesData());
        TSCORE.Config.setSupportedFileTypes(collectSupportedFileTypesData());
        
        TSCORE.Config.saveSettings();
    }
    
    generateUI()
    initUI();
});