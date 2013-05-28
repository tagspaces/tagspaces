/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";

    console.debug("Loading options.ui.js ...");
    
    var TSCORE = require("tscore");

    function generateUI() {
        var optionsUI = $("#dialogOptions").find(".form-horizontal");
   /*     
        optionsUI.append($("<h5>Perspectives  <button class='btn' id='addFileTypeButton' title='Add new extension'><i class='icon-plus'></button></h5>"));
        
        optionsUI.append(
            $("<div class='control control-row'>", {})
//                .append($("<select class='span3'><option>bla</option></select>"))
//                .append($("<button class='btn' title='Remove this extension'><i class='icon-arrow-up'></button>"))
                .append($("<button class='btn' title='Remove this extension'><i class='icon-arrow-down'></button>"))
                .append($("<button class='btn' title='Remove this extension'><i class='icon-remove'></button>"))                                                
        );

        optionsUI.append($("<h5>File Types  <button class='btn' id='addFileTypeButton' title='Add new extension'><i class='icon-plus'></button></h5>"));
        
        optionsUI.append(
            $("<div class='control control-row'>", {})
                .append($("<input type='text' class='span1' id='' placeholder='jpg'>"))
                .append($("<select class='span2'><option>viewer</option></select>"))
                .append($("<select class='span2'><option>editor</option></select>"))                
                .append($("<button class='btn' title='Remove this extension'><i class='icon-remove'></button>"))                    
        );
*/
        optionsUI.append($("<h5>Miscellaneous</h5>"));
                      
        optionsUI.append($("<div class='control-group'>", {})
            .append($("<label class='control-label' for='extensionsPathInput'>Extensions folder</label>"))
            .append($("<div class='controls'>", {})
                .append($("<input type='text' class='input-xlarge' id='extensionsPathInput' placeholder='Path to your tagspaces extensions' title='e.g.: c:\\tagspaces\\extensions'>", {})
                )
            )
        );        

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
    }   
    
    function initUI() {
        $("#extensionsPathInput").val(TSCORE.Config.getExtensionPath()); 
        $("#showHiddenFilesCheckbox").attr("checked",TSCORE.Config.getShowUnixHiddenEntries());
        $("#checkforUpdatesCheckbox").attr("checked",TSCORE.Config.getCheckForUpdates());
        
        $('#saveSettingsCloseButton').click(function() {
            updateSettings();
            TSCORE.reloadUI();            
        })
    }    
    
    function updateSettings() {
        TSCORE.Config.setExtensionPath($("#extensionsPathInput").val());
        TSCORE.Config.setShowUnixHiddenEntries($('#showHiddenFilesCheckbox').is(":checked"));
        TSCORE.Config.setCheckForUpdates($('#checkforUpdatesCheckbox').is(":checked"));
        
        TSCORE.Config.saveSettings();
    }
    
    generateUI()
    initUI();
});