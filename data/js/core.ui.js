/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define([
    'require',
    'exports',
    'module',
    'jsoneditor',
//    'css!jsoneditorcss'
],function(require, exports, module) {
//"use strict";

console.debug("Loading core.ui.js ...");

// Init JSON Editor
// TODO variable editor is hardcoded due a bug in the JSONEditor lib
var initJSONEditor = function() {
    var edEl = document.getElementById("settingsEditor");
    editor = new JSONEditor(edEl);   
    formatter = new JSONFormatter(document.getElementById("settingsPlainJSON")); 
}

var initButtons = function() {
    $( "#openSettings" ).button({
        text: true,
        icons: {
            primary: "ui-icon-wrench"
        }
    })
    .click(function() {
        initJSONEditor();        
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
    
    $( "#toggleLeftPanel" ).button({
        text: false,
        icons: {
            primary: "ui-icon-bookmark"
        }
    })
    .click(function() {
		UIAPI.toggleLeftPanel();
    });             
}

var initDialogs = function() {
    var newDirName = $( "#dirname" );    
    var newFileName = $( "#newFileName" );    
    var renamedFileName = $( "#renamedFileName" );    
    
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
    
    $( "#fileTypeRadio" ).buttonset();

    var fileContent = undefined;

    $( "#txtFileTypeButton" ).click(function() {
        // TODO Add to config options
        fileContent = TSSETTINGS.getNewTextFileContent();
        //Leave the filename as it is by no extension
        if(newFileName.val().lastIndexOf(".")>=0) {
            newFileName.val(newFileName.val().substring(0,newFileName.val().lastIndexOf("."))+".txt");  
        }
    });            

    $( "#htmlFileTypeButton" ).click(function() {
        // TODO Add to config options
        fileContent = TSSETTINGS.getNewHTMLFileContent();
        //Leave the filename as it is by no extension
        if(newFileName.val().lastIndexOf(".")>=0) {
            newFileName.val(newFileName.val().substring(0,newFileName.val().lastIndexOf("."))+".html");            
        }
    }); 
    
    $( "#mdFileTypeButton" ).click(function() {
        // TODO Add to config options
        fileContent = TSSETTINGS.getNewMDFileContent();
        //Leave the filename as it is by no extension
        if(newFileName.val().lastIndexOf(".")>=0) {
            newFileName.val(newFileName.val().substring(0,newFileName.val().lastIndexOf("."))+".md");            
        }
    });     

    $( "#dialog-filecreate" ).dialog({
        autoOpen: false,
        height: 250,
        width: 450,
        modal: true,
        buttons: {
            "Create": function() {
                var bValid = true;                
                allFields.removeClass( "ui-state-error" );

                bValid = bValid && checkLength( newFileName, "filename", 4, 200 );
        //        bValid = bValid && checkRegexp( renamedFileName, /^[a-z]([0-9a-z_.])+$/i, "Filename may consist of a-z, 0-9, underscores, begin with a letter." );
                if(UIAPI.fileExists(newFileName.val())) {
                    updateTips("File already exists.");
                    bValid = false;
                }
                if ( bValid ) {
                    IOAPI.saveTextFile(UIAPI.currentPath+UIAPI.getDirSeparator()+$( "#newFileName" ).val(),fileContent);
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
            fileContent = TSSETTINGS.getNewTextFileContent(); // Default new file in text file
            $( "#newFileName" ).val(".txt");
        }                
    });     

    $( "#dialog-filerename" ).dialog({
        autoOpen: false,
        height: 220,
        width: 450,
        modal: true,
        buttons: {
            "Rename": function() {
                var bValid = true;                
                allFields.removeClass( "ui-state-error" );

                bValid = bValid && checkLength( renamedFileName, "filename", 3, 200 );
        //        bValid = bValid && checkRegexp( renamedFileName, /^[a-z]([0-9a-z_.])+$/i, "Filename may consist of a-z, 0-9, underscores, begin with a letter." );
                if ( bValid ) {
                    IOAPI.renameFile(
                            UIAPI.currentPath+UIAPI.getDirSeparator()+UIAPI.selectedFiles[0],
                            UIAPI.currentPath+UIAPI.getDirSeparator()+renamedFileName.val()
                        );
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
    
    $( "#dialog-confirmdelete" ).dialog({
        autoOpen: false,
        resizable: false,
        height:140,
        modal: true,
        buttons: {
            "Delete all items": function() {
                IOAPI.deleteElement(UIAPI.currentPath+UIAPI.getDirSeparator()+UIAPI.selectedFiles[0]);
                $( this ).dialog( "close" );
                IOAPI.listDirectory(UIAPI.currentPath);   
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        }
    }); 
    
    $( "#dialogAddTags" ).dialog({
        autoOpen: false,
        resizable: false,
        height:240,
        modal: true,
        buttons: {
            "Add tags": function() {
                var tags = $("#tags").val().split(",");
                TSAPI.writeTagsToFile(UIAPI.selectedFiles[0], tags);
                IOAPI.listDirectory(UIAPI.currentPath);                                   
                $( this ).dialog( "close" );
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        },
        open: function() {
            
            function split( val ) {
                return val.split( /,\s*/ );
            }
            function extractLast( term ) {
                return split( term ).pop();
            }
                        
            $( "#tags" )
                // don't navigate away from the field on tab when selecting an item
                .bind( "keydown", function( event ) {
                    if ( event.keyCode === $.ui.keyCode.TAB &&
                            $( this ).data( "autocomplete" ).menu.active ) {
                        event.preventDefault();
                    }
                })
                .autocomplete({
                    minLength: 0,
                    source: function( request, response ) {
                        // delegate back to autocomplete, but extract the last term
                        response( $.ui.autocomplete.filter(
                            TSSETTINGS.getAllTags(), extractLast( request.term ) ) );
                    },
                    focus: function() {
                        // prevent value inserted on focus
                        return false;
                    },
                    select: function( event, ui ) {
                        var terms = split( this.value );
                        // remove the current input
                        terms.pop();
                        // add the selected item
                        terms.push( ui.item.value );
                        // add placeholder to get the comma-and-space at the end
                        terms.push( "" );
                        this.value = terms.join( ", " );
                        return false;
                    }
                });
        }            
    });        
    
    $( "#tagTypeRadio" ).buttonset();

    $( "#plainTagTypeButton" ).click(function() {
        UIAPI.selectedTag, $( "#newTag" ).datepicker( "destroy" ).val("");
    });  

    $( "#dateTagTypeButton" ).click(function() {
        UIAPI.selectedTag, $( "#newTag" ).datepicker({
            showWeek: true,
            firstDay: 1,
            dateFormat: "yymmdd"
        });
    });  
    
    $( "#currencyTagTypeButton" ).click(function() {
        UIAPI.selectedTag, $( "#newTag" ).datepicker( "destroy" ).val("XEUR")
    });      
    
    $( "#dialogEditTag" ).dialog({
        autoOpen: false,
        resizable: false,
        height:240,
        modal: true,
        buttons: {
            "Save": function() {
                TSAPI.renameTag(UIAPI.selectedFiles[0], UIAPI.selectedTag, $( "#newTag" ).val());
                IOAPI.listDirectory(UIAPI.currentPath);                                   
                $( this ).dialog( "close" );
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        }
    });
    
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
//            "Ext. Folder": function() {
//                IOAPI.openExtensionsDirectory()
//            },
            "Editor": function() {
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
            "Default Settings": function() {
                if(confirm("Are you sure you want to restore the default application settings?\nAll manually made changes such as tags and taggroups will be lost.")) {
                    TSSETTINGS.Settings = TSSETTINGS.DefaultSettings;
                    TSSETTINGS.saveSettings();
                    UIAPI.reloadUI();                    
                    console.debug("Default settings loaded.");                    
                }
            },
            "Save": function() {
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

// Autoinitialization
initButtons();
initDialogs();

});