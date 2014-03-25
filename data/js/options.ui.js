/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";

    console.log("Loading options.ui.js ...");
    
    var TSCORE = require("tscore");

    function generateSelectOptions(parent, data, selectedId) {
        parent.empty();
        parent.append($("<option>").text("").val("false"));
        data.forEach( function(value) {
                if (selectedId == value) { 
                    parent.append($("<option>").attr("selected","selected").text(value).val(value));                
                } else {
                    parent.append($("<option>").text(value).val(value));                    
                }    
            }            
        );
    }

    function addPerspective(parent, perspectiveId) {
        var perspectiveControl = $("<div class='form-inline'>")
                .append($("<div class='input-group' style='width: 90%'>")
                    //.append($("<button class='btn btn-default' style='width: 10%' title='Remove Perspective'><i class='fa fa-ellipsis-v'></i></button>"))
                    .append($("<select class='form-control' style='width: 70%'></select>"))
                    .append($("<button class='btn btn-default'  style='width: 40px' title='Remove Perspective'><i class='fa fa-times'></button>")
                        .click(function() {
                            $(this).parent().parent().remove();
                        })                
                  )
                );
                //.append($("<button class='btn' title='Remove this extension'><i class='icon-arrow-up'></button>"))
                //.append($("<button class='btn' title='Remove this extension'><i class='icon-arrow-down'></button>"))  

        generateSelectOptions(perspectiveControl.find("select"), TSCORE.Config.getPerspectiveExtensions(), perspectiveId);
        parent.append(perspectiveControl);
    }    
   
    function addFileType(parent, fileext, viewerId, editorId) {
        var fileTypeControl = $("<div class='form-inline'>")
                .append($("<div class='input-group' >")
                    .append($("<input style='width: 80px' type='text' class='form-control' placeholder='e.g: jpg'>").val(fileext))
                    .append($("<select class='ftviewer form-control' style='width: 170px' placeholder='Select Viewer'></select>"))
                    .append($("<select class='fteditor form-control' style='width: 170px' placeholder='Select Editor'></select>"))                
                    .append($("<button style='width: 40px' class='btn btn-default' title='Remove this file type'><i class='fa fa-times'></button>")
                        .click(function() {
                            $(this).parent().parent().remove();
                        })
                    )
                );
        generateSelectOptions(fileTypeControl.find(".ftviewer"), TSCORE.Config.getViewerExtensions(), viewerId);
        generateSelectOptions(fileTypeControl.find(".fteditor"), TSCORE.Config.getEditorExtensions(), editorId);
        parent.append(fileTypeControl);
    }    
    
    function initUI() {
        $('#addFileTypeButton').click(function(e) {
            // Fixes reloading of the application by click
            e.preventDefault();
            
            addFileType($('#fileTypesList'), "", "", "");
        }); 

        $('#addPerspectiveButton').click(function(e) {
            // Fixes reloading of the application by click
            e.preventDefault();
            
            addPerspective($('#perspectiveList'), "");
        });   

        $('#saveSettingsCloseButton').click(function() {
            updateSettings(); 
            $('#dialogOptions').modal("hide");
            //TSCORE.reloadUI();            
        }); 
        
        $( "#defaultSettingsButton" ).click(function() {
            TSCORE.showConfirmDialog(
                "Warning",
                "By restoring the defalt setting, all locations, tags and taggroups will be lost."+
                " Are you sure you want to continue?",
                function() {
                    TSCORE.Config.loadDefaultSettings();                
                }                
            );
        });
        
    }    
    
    function reInitUI() {
        $("#extensionsPathInput").val(TSCORE.Config.getExtensionPath()); 
        $("#showHiddenFilesCheckbox").attr("checked",TSCORE.Config.getShowUnixHiddenEntries());
        $("#checkforUpdatesCheckbox").attr("checked",TSCORE.Config.getCheckForUpdates());
        $("#calculateTagsCheckbox").attr("checked",TSCORE.Config.getCalculateTags());
        $("#tagsDelimiterInput").val(TSCORE.Config.getTagDelimiter());
        $("#prefixTagContainerInput").val(TSCORE.Config.getPrefixTagContainer());        
        
        $('#perspectiveList').empty();
        TSCORE.Config.getPerspectives().forEach(function (value, index) {
            addPerspective($('#perspectiveList'), value.id);
        });

        $('#fileTypesList')
	        .empty()
	        .append($("<div class='input-group' >")
	                .append($("<span style='width: 80px; border: 0px' class='form-control' >File Ext.</span>"))
	                .append($("<span style=' border: 0px; width: 170px' class='ftviewer form-control'>File Viewer</span>"))
	                .append($("<span style=' border: 0px; width: 170px' class='fteditor form-control'>File Editor</span>"))                
	                );

        TSCORE.Config.getSupportedFileTypes().forEach(function (value, index) {
            addFileType($('#fileTypesList'), value.type, value.viewer, value.editor);
        });        
       
        $('#dialogOptions a:first').tab('show');   
        $('#dialogOptions').modal({backdrop: 'static',show: true});        
    }        

    function updateSettings() {
        TSCORE.Config.setExtensionPath($("#extensionsPathInput").val());
        TSCORE.Config.setShowUnixHiddenEntries($('#showHiddenFilesCheckbox').is(":checked"));
        TSCORE.Config.setCheckForUpdates($('#checkforUpdatesCheckbox').is(":checked"));
        TSCORE.Config.setCalculateTags($('#calculateTagsCheckbox').is(":checked"));
        TSCORE.Config.setTagDelimiter($("#tagsDelimiterInput").val());
        TSCORE.Config.setPrefixTagContainer($("#prefixTagContainerInput").val());        

        TSCORE.Config.setPerspectives(collectPerspectivesData());
        TSCORE.Config.setSupportedFileTypes(collectSupportedFileTypesData());
        
        TSCORE.Config.saveSettings();
    }

    function collectPerspectivesData() {
        var data = new Array();
        $('#perspectiveList').children().each( function(index, element) {
                if($(element).find("select").val() != "false") {
	                data.push({
	                    "id":$(element).find("select").val(),
	                });                	
                }
            }            
        ); 
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
        ); 
        return data;
    }
    
    
    // Public Methods
    exports.initUI         = initUI;
    exports.reInitUI       = reInitUI;

});