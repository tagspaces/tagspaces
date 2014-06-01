/* Copyright (c) 2012-2014 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
/* global define, Mousetrap, Handlebars  */
 define(function(require, exports, module) {
"use strict";

    console.log("Loading options.ui.js ...");
    
    var TSCORE = require("tscore");

    function generateSelectOptions(parent, data, selectedId) {
        parent.empty();
        parent.append($("<option>").text("").val("false"));
        data.forEach( function(value) {
            if (selectedId === value) {
                parent.append($("<option>").attr("selected","selected").text(value).val(value));
            } else {
                parent.append($("<option>").text(value).val(value));
            }
        });
    }

    function addPerspective(parent, perspectiveId) {
        var perspectiveControl = $("<div class='form-inline'>")
            .append($("<div class='input-group' style='width: 90%'>")
                .append($("<select class='form-control' style='width: 70%'></select>"))
                .append($("<button class='btn btn-default'  style='width: 40px' data-i18n='[title]ns.dialogs:removePerspectiveTooltip'><i class='fa fa-times'></button>")
                    .click(function() {
                        $(this).parent().parent().remove();
                    })
              )
            )
            .i18n();

        generateSelectOptions(perspectiveControl.find("select"), TSCORE.Config.getPerspectiveExtensions(), perspectiveId);
        parent.append(perspectiveControl);
    }    
   
    function addFileType(parent, fileext, viewerId, editorId) {
        var fileTypeControl = $("<div class='form-inline'>")
            .append($("<div class='input-group' >")
                .append($("<input style='width: 80px' type='text' class='form-control' data-i18n='[placeholder]ns.dialogs:fileExtensionPlaceholder'>").val(fileext))
                .append($("<select class='ftviewer form-control' style='width: 170px'></select>"))
                .append($("<select class='fteditor form-control' style='width: 170px'></select>"))
                .append($("<button style='width: 40px' class='btn btn-default' data-i18n='[title]ns.dialogs:removeFileTypeTooltip'><i class='fa fa-times'></button>")
                    .click(function() {
                        $(this).parent().parent().remove();
                    })
                )
            )
            .i18n();
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
                $.i18n.t("ns.dialogs:restoreDefaulSettingTitleConfirm"),
                $.i18n.t("ns.dialogs:restoreDefaulSettingMessageConfirm"),
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

        $("#nextDocumentKeyBinding").val(TSCORE.Config.getNextDocumentKeyBinding());
        $("#prevDocumentKeyBinding").val(TSCORE.Config.getPrevDocumentKeyBinding());
        $("#closeDocumentKeyBinding").val(TSCORE.Config.getCloseViewerKeyBinding());
        $("#reloadDocumentKeyBinding").val(TSCORE.Config.getReloadDocumentKeyBinding());
        $("#saveDocumentKeyBinding").val(TSCORE.Config.getSaveDocumentKeyBinding());
        $("#documentPropertiesKeyBinding").val(TSCORE.Config.getPropertiesDocumentKeyBinding());
        //$("#").val(TSCORE.Config.get());

        $('#perspectiveList').empty();
        TSCORE.Config.getPerspectives().forEach(function (value) {
            addPerspective($('#perspectiveList'), value.id);
        });

        var $languagesDropdown = $("#languagesList");
        $languagesDropdown.empty();
        TSCORE.Config.getSupportedLanguages().forEach( function(value) {
            if (TSCORE.Config.getInterfaceLangauge() === value.iso) {
                $languagesDropdown.append($("<option>").attr("selected","selected").text(value.title).val(value.iso));
            } else {
                $languagesDropdown.append($("<option>").text(value.title).val(value.iso));
            }
        });

        $('#fileTypesList')
            .empty()
            .append($("<div class='input-group' >")
                    .append($("<span style='width: 80px; border: 0' class='form-control' data-i18n='ns.dialogs:fileExtension'></span>"))
                    .append($("<span style=' border: 0; width: 170px' class='ftviewer form-control' data-i18n='ns.dialogs:fileViewer'></span>"))
                    .append($("<span style=' border: 0; width: 170px' class='fteditor form-control' data-i18n='ns.dialogs:fileEditor'></span>"))
            ).i18n();

        TSCORE.Config.getSupportedFileTypes().sort(function(a, b){
            if (a.type > b.type) {
                return 1;
            }
            if (a.type < b.type) {
                return -1;
            }
            return 0;
        }).forEach(function (value) {
            addFileType($('#fileTypesList'), value.type, value.viewer, value.editor);
        });        
       
        $('#dialogOptions a:first').tab('show');   
        $('#dialogOptions').modal({backdrop: 'static',show: true});        
    }

    function parseKeyBinding(keybinding) {
        keybinding = keybinding.trim();
        if(keybinding.indexOf(",") >= 0) {
            keybinding = keybinding.split(",");
        }
        return keybinding;
    }

    function updateSettings() {
        TSCORE.Config.setExtensionPath($("#extensionsPathInput").val());
        TSCORE.Config.setShowUnixHiddenEntries($('#showHiddenFilesCheckbox').is(":checked"));
        TSCORE.Config.setCheckForUpdates($('#checkforUpdatesCheckbox').is(":checked"));
        TSCORE.Config.setCalculateTags($('#calculateTagsCheckbox').is(":checked"));
        TSCORE.Config.setTagDelimiter($("#tagsDelimiterInput").val());
        TSCORE.Config.setPrefixTagContainer($("#prefixTagContainerInput").val());

        TSCORE.Config.setNextDocumentKeyBinding(parseKeyBinding($("#nextDocumentKeyBinding").val()));
        TSCORE.Config.setPrevDocumentKeyBinding(parseKeyBinding($("#prevDocumentKeyBinding").val()));
        TSCORE.Config.setCloseViewerKeyBinding(parseKeyBinding($("#closeDocumentKeyBinding").val()));
        TSCORE.Config.setReloadDocumentKeyBinding(parseKeyBinding($("#reloadDocumentKeyBinding").val()));
        TSCORE.Config.setSaveDocumentKeyBinding(parseKeyBinding($("#saveDocumentKeyBinding").val()));
        TSCORE.Config.setPropertiesDocumentKeyBinding(parseKeyBinding($("#documentPropertiesKeyBinding").val()));

        var interfaceLang = $("#languagesList").val();
        TSCORE.Config.setInterfaceLangauge(interfaceLang);
        TSCORE.switchInterfaceLanguage(interfaceLang);

        TSCORE.Config.setPerspectives(collectPerspectivesData());
        TSCORE.Config.setSupportedFileTypes(collectSupportedFileTypesData());
        
        TSCORE.Config.saveSettings();
    }

    function collectPerspectivesData() {
        var data = [];
        $('#perspectiveList').children().each( function(index, element) {
                if($(element).find("select").val() != "false") {
                    data.push({
                        "id":$(element).find("select").val()
                    });
                }
            }            
        ); 
        return data;
    }

    function collectSupportedFileTypesData() {
        var data = [];
        $('#fileTypesList').children().each( function(index, element) {
            // Skiping the first line with the descriptions
            if(index > 0) {
                data.push({
                    "type":     $(element).find("input").val(),
                    "viewer":   $(element).find(".ftviewer").val(),
                    "editor":   $(element).find(".fteditor").val()
                    });
                }
            }            
        ); 
        return data;
    }
    
    // Public Methods
    exports.initUI         = initUI;
    exports.reInitUI       = reInitUI;

});