/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
/*
define([
    'require',
    'exports',
    'module',
    'jsoneditor',
//    'css!jsoneditorcss'
],function(require, exports, module) {
//"use strict";
*/
console.debug("Loading SettingsUI...");

var SettingsUI = (typeof SettingsUI == 'object' && SettingsUI != null) ? SettingsUI : {};

// Init JSON Editor
// TODO variable editor is hardcoded due a bug in the JSONEditor lib
SettingsUI.initJSONEditor = function() {
    var edEl = document.getElementById("settingsEditor");
    editor = new JSONEditor(edEl);   
    formatter = new JSONFormatter(document.getElementById("settingsPlainJSON")); 
}

SettingsUI.initButtons = function() {
    $( "#openSettings" ).button({
        text: true,
        icons: {
            primary: "ui-icon-wrench"
        }
    })
    .click(function() {
        SettingsUI.initJSONEditor();        
        $( "#dialogSetting" ).dialog( "open" );
    });
    
    $( "#openAboutBox" ).button({
        text: true,
        icons: {
            primary: "ui-icon-lightbulb"
        }
    })
    .click(function() {
        $( "#dialogAbout" ).dialog( "open" );
    });          
}

SettingsUI.initDialogs = function() {
    
    $( "#dialogAbout" ).dialog({
        autoOpen: false,
        resizable: true,
        height: 370,
        width: 600,
        modal: true,
        buttons: {
            "Back": function() {
				$("#aboutIframe").attr("src","about.html");
            },
            "Close": function() {
                $( this ).dialog( "close" );
            }
        },
        open: function() {

        }         
    });  
    
    $( "#dialogSetting" ).dialog({
        autoOpen: false,
        resizable: true,
        height: 370,
        width: 600,
        modal: true,
        buttons: {
            "Ext. Folder": function() {
                IOAPI.openExtensionsDirectory()
            },
            "Settings Editor": function() {
                if($("#settingsEditor").is(":hidden") ) {
                    $("#settingsPlainJSON").hide();
                    $("#settingsEditor").show();
                    editor.set(formatter.get());                    
                }
            },
            "Import/Export": function() {
                if($("#settingsPlainJSON").is(":hidden") ) {
                    formatter.set(editor.get());
                    $("#settingsPlainJSON").show();
                    $("#settingsEditor").hide();
                }
            },
            "Load default settings": function() {
                if(confirm("Are you sure you want to restore the default application settings?\nAll manually made changes such as tags and taggroups will be lost.")) {
                    TSSETTINGS.Settings = TSSETTINGS.DefaultSettings;
                    TSSETTINGS.saveSettings();
                    UIAPI.reloadUI();                    
                    console.debug("Default settings loaded.");                    
                }
            },
            "Save changes": function() {
                TSSETTINGS.Settings = editor.get();
                TSSETTINGS.saveSettings();
                UIAPI.reloadUI();
                console.debug("Settings saved and UI reloaded.");
                $( this ).dialog( "close" );
            },
            "Cancel": function() {
                $( this ).dialog( "close" );
            }
        },
        open: function() {
            $("#settingsPlainJSON").hide();
            editor.set(TSSETTINGS.Settings);
        }         
    });     
}

//return SettingsUI;
//});