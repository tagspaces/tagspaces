/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";

	console.debug("Loading core.ui.js ...");

    require('jsoneditor');
	var TSCORE = require("tscore");

    var editor = undefined;
	var formatter = undefined;
	
	var fileContent = undefined;	

	// Init JSON Editor
	var initJSONEditor = function() {
	    editor = new JSONEditor(document.getElementById("settingsEditor")); 
	    formatter = new JSONFormatter(document.getElementById("settingsPlainJSON"));
	}
	
	var showAlertDialog = function(message, title) {
	    if (!title) { title = 'Alert'; }	
	    if (!message) { message = 'No Message to Display.'; }
	
	    var alertModal = 
	      $('<div class="modal hide">' +    
	          '<div class="modal-header">' +
	            '<a class="close" data-dismiss="modal" >&times;</a>' +
	            '<h4>' + title +'</h4>' +
	          '</div>' +
	          '<div class="modal-body">' +
	            '' + message + '' +
	          '</div>' +
	          '<div class="modal-footer">' +
	            '<a href="#" id="okButton" class="btn btn-primary">Ok</a>' +
	          '</div>' +
	        '</div>');
	
	    alertModal.find('#okButton').click(function(event) {
	      alertModal.modal('hide');
	    });
	
	    alertModal.modal('show');
	}	
	
	var showConfirmDialog = function(title, message, callback) {
	    if (!title) { title = 'Confirm'; }	
	    if (!message) { message = 'No Message to Display.'; }
	    
	    var confirmModal = 
	      $('<div class="modal hide">' +    
	          '<div class="modal-header">' +
	            '<a class="close" data-dismiss="modal" >&times;</a>' +
	            '<h4>' + title +'</h4>' +
	          '</div>' +
	          '<div class="modal-body">' +
	            '' + message + '' +
	          '</div>' +
	          '<div class="modal-footer">' +
	            '<a href="#" class="btn" data-dismiss="modal">Cancel</a>' +
	            '<a href="#" id="okButton" class="btn btn-primary">Ok</a>' +
	          '</div>' +
	        '</div>');
	
	    confirmModal.find('#okButton').click(function(event) {
	      callback();
	      confirmModal.modal('hide');
	    });
	
	    confirmModal.modal('show');     
	};	
	

    var openFileCreateDialog = function() {
        fileContent = TSCORE.Config.getNewTextFileContent(); // Default new file in text file
        $("#newFileName").val(".txt");
        $('#dialog-filecreate').modal({show: true});
        $('#txtFileTypeButton').button('toggle');
    }
    
	var initUI = function() {
	    
	    $( "#openAboutBox" ).tooltip();
    
	    $( "#toggleLeftPanel" ).click(function() {
			TSCORE.toggleLeftPanel();
	    });   
		
		$( "#testAlertButton" ).click(function() {
			TSCORE.showAlertDialog("test1","test2");	
			TSCORE.showConfirmDialog("test1","test2", function() {alert("test")});
		})
	
	    $( "#txtFileTypeButton" ).click(function() {
	        // TODO Add to config options
	        fileContent = TSCORE.Config.getNewTextFileContent();
	        //Leave the filename as it is by no extension
	        if($( "#newFileName" ).val().lastIndexOf(".")>=0) {
	            $( "#newFileName" ).val($( "#newFileName" ).val().substring(0,$( "#newFileName" ).val().lastIndexOf("."))+".txt");  
	        }
	    });            
	
	    $( "#htmlFileTypeButton" ).click(function() {
	        // TODO Add to config options
	        fileContent = TSCORE.Config.getNewHTMLFileContent();
	        //Leave the filename as it is by no extension
	        if($( "#newFileName" ).val().lastIndexOf(".")>=0) {
	            $( "#newFileName" ).val($( "#newFileName" ).val().substring(0,$( "#newFileName" ).val().lastIndexOf("."))+".html");            
	        }
	    }); 
	    
	    $( "#mdFileTypeButton" ).click(function() {
	        // TODO Add to config options
	        fileContent = TSCORE.Config.getNewMDFileContent();
	        //Leave the filename as it is by no extension
	        if($( "#newFileName" ).val().lastIndexOf(".")>=0) {
	            $( "#newFileName" ).val($( "#newFileName" ).val().substring(0,$( "#newFileName" ).val().lastIndexOf("."))+".md");            
	        }
	    });     
	
	    $( '#fileCreateConfirmButton' ).click(function() {
            var bValid = true;                
//                bValid = bValid && checkLength( newFileName, "filename", 4, 200 );

            if(TSCORE.fileExists($( "#newFileName" ).val())) {
                updateTips("File already exists.");
                bValid = false;
            }
            if ( bValid ) {
                TSCORE.IO.saveTextFile(TSCORE.currentPath+TSCORE.TagUtils.DIR_SEPARATOR+$( "#newFileName" ).val(),fileContent);
                $('#dialog-filecreate').modal('hide')
                TSCORE.IO.listDirectory(TSCORE.currentPath);                    
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
	        //        bValid = bValid && checkLength( $( "#renamedFileName" ).val(), "filename", 3, 200 );
	        //        bValid = bValid && checkRegexp( renamedFileName, /^[a-z]([0-9a-z_.])+$/i, "Filename may consist of a-z, 0-9, underscores, begin with a letter." );
	                if ( bValid ) {
	                    var containingDir = TSCORE.TagUtils.extractContainingDirectoryPath(TSCORE.selectedFiles[0]);
	                    TSCORE.IO.renameFile(
	                            TSCORE.selectedFiles[0],
	                            containingDir+TSCORE.TagUtils.DIR_SEPARATOR+$( "#renamedFileName" ).val()
	                        );
	                    $( this ).dialog( "close" );
	                }
	            },
	            Cancel: function() {
	                $( this ).dialog( "close" );
	            }
	        },
	        close: function() {

	        },
	        open: function() {
	            $( "#renamedFileName" ).val(TSCORE.TagUtils.extractFileName(TSCORE.selectedFiles[0]));
	        }                
	    }); 

	    $( "#tagTypeRadio" ).buttonset();
	
	    $( "#plainTagTypeButton" ).click(function() {
	        TSCORE.selectedTag, $( "#newTag" ).datepicker( "destroy" ).val("");
	    });  
	
	    $( "#dateTagTypeButton" ).click(function() {
	        TSCORE.selectedTag, $( "#newTag" ).datepicker({
	            showWeek: true,
	            firstDay: 1,
	            dateFormat: "yymmdd"
	        });
	    });  
	    
	    $( "#currencyTagTypeButton" ).click(function() {
	        TSCORE.selectedTag, $( "#newTag" ).datepicker( "destroy" ).val("XEUR")
	    });      
	    
	    $( "#dialogEditTag" ).dialog({
	        autoOpen: false,
	        resizable: false,
	        height:240,
	        modal: true,
	        buttons: {
	            "Save": function() {
	                TSCORE.TagUtils.renameTag(TSCORE.selectedFiles[0], TSCORE.selectedTag, $( "#newTag" ).val());
	                TSCORE.IO.listDirectory(TSCORE.currentPath);                                   
	                $( this ).dialog( "close" );
	            },
	            Cancel: function() {
	                $( this ).dialog( "close" );
	            }
	        }
	    });	    
	    
	    $( "#aboutDialogBack" ).click(function() {
            $("#aboutIframe").attr("src","about.html");
        });
	    
        $( "#aboutDialogSettings" ).click(function() {
            $('#dialogAbout').modal('hide');
            initJSONEditor();        
            $( "#dialogSetting" ).dialog( "open" );    
        });
        	    
	    $( "#dialogSetting" ).dialog({
	        autoOpen: false,
	        resizable: true,
	        height: 370,
	        width: 600,
	        modal: true,
	        buttons: {
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
	                    TSCORE.Config.Settings = TSCORE.Config.DefaultSettings;
	                    TSCORE.Config.saveSettings();
	                    TSCORE.reloadUI();                    
	                    console.debug("Default settings loaded.");                    
	                }
	            },
	            "Save": function() {
	                TSCORE.Config.Settings = editor.get();
	                TSCORE.Config.saveSettings();
	                TSCORE.reloadUI();
	                console.debug("Settings saved and UI reloaded.");
	                $( this ).dialog( "close" );
	            },
	            "Cancel": function() {
	                $( this ).dialog( "close" );
	            }
	        },
	        open: function() {
	            $("#settingsPlainJSON").hide();
	            editor.set(TSCORE.Config.Settings);
	        }         
	    }); 
	    
        $( "#fileMenu" ).menu({
            select: function( event, ui ) {
                var commandName = ui.item.attr( "action" );
                switch (commandName) {
                  case "addTag":        
                    TSCORE.showAddTagsDialog();
                    break;  
                  case "openFile":
                    TSCORE.FileOpener.openFile(TSCORE.selectedFiles[0]);                
                    break;
                  case "openDirectory":
                    TSCORE.IO.openDirectory(TSCORE.currentPath);
                    break;
                  case "renameFile":        
                    console.debug("Renaming file...");
                    $( "#dialog-filerename" ).dialog( "open" );
                    break;  
                  case "deleteFile":        
                    console.debug("Deleting file...");
                    TSCORE.showConfirmDialog(
                        "Delete File(s)",
                        "These items will be permanently deleted and cannot be recovered. Are you sure?",
                        function() {
                            TSCORE.IO.deleteElement(TSCORE.selectedFiles[0]);
                            TSCORE.IO.listDirectory(TSCORE.currentPath);   
                        }
                    );
                    break;  
                  default:
                    break;
                }
            }
        });  	        
	}

	var hideAllDropDownMenus = function() {
		$('BODY')
			.find('.dropdown-menu').hide().end()
			.find('[data-dropdown]').removeClass('dropdown-open');
	}

    // Public API definition
	exports.initUI 					= initUI;
	exports.showAlertDialog 		= showAlertDialog;
	exports.showConfirmDialog 		= showConfirmDialog;
	exports.openFileCreateDialog    = openFileCreateDialog;
	exports.hideAllDropDownMenus	= hideAllDropDownMenus;

});