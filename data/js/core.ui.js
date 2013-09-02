/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";

	console.log("Loading core.ui.js ...");

	var TSCORE = require("tscore");

    var editor = undefined;
	var formatter = undefined;
	
	var fileContent = undefined;	

	var showAlertDialog = function(message, title) {
	    if (!title) { title = 'Alert'; }	
	    if (!message) { message = 'No Message to Display.'; }
	
	    var alertModal = 
	      $('<div class="modal hide">' +    
	          '<div class="modal-header">' +
	            '<a class="close" data-dismiss="modal" >&times;</a>' +
	            '<h4></h4>' +
	          '</div>' +
              '<div class="modal-body"><p class="lead"></p></div>' +
	          '<div class="modal-footer">' +
	            '<button id="okButton" class="btn btn-primary">Ok</button>' +
	          '</div>' +
	        '</div>');
	
        alertModal.find('h4').text(title);        
        alertModal.find('.lead').append(message);
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
	            '<h4></h4>' +
	          '</div>' +
	          '<div class="modal-body"><p class="lead"></p></div>' +
	          '<div class="modal-footer">' +
	            '<button class="btn" data-dismiss="modal">Cancel</button>' +
	            '<button id="okButton" class="btn btn-primary">Ok</button>' +
	          '</div>' +
	        '</div>');

        confirmModal.find('h4').text(title);    	
	    confirmModal.find('.lead').text(message);
	    confirmModal.find('#okButton').click(function(event) {
	      callback();
	      confirmModal.modal('hide');
	    });
	
	    confirmModal.modal('show');     
	};	
	

    var showFileCreateDialog = function() {
        fileContent = TSCORE.Config.getNewTextFileContent(); // Default new file in text file
        $( "#newFileName" ).val(".txt");
        $( '#dialogFileCreate' ).modal({show: true});
        $( '#txtFileTypeButton' ).button('toggle');
    }
    
    var showFileRenameDialog = function() {
        $( "#renamedFileName" ).val(TSCORE.TagUtils.extractFileName(TSCORE.selectedFiles[0]));
        $( '#dialogFileRename' ).modal({show: true});
    }    
    
    var showTagEditDialog = function() {
        $( "#newTagName" ).val(TSCORE.selectedTag);
        $( '#dialogEditTag' ).modal({show: true});
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
	
	    $( "#txtFileTypeButton" ).click(function(e) {
            // Fixes reloading of the application by click
            e.preventDefault();
            	        
	        fileContent = TSCORE.Config.getNewTextFileContent();
	        //Leave the filename as it is by no extension
	        if($( "#newFileName" ).val().lastIndexOf(".")>=0) {
	            $( "#newFileName" ).val($( "#newFileName" ).val().substring(0,$( "#newFileName" ).val().lastIndexOf("."))+".txt");  
	        }
	    });            
	
	    $( "#htmlFileTypeButton" ).click(function(e) {
            // Fixes reloading of the application by click
            e.preventDefault();
            	        
	        fileContent = TSCORE.Config.getNewHTMLFileContent();
	        //Leave the filename as it is by no extension
	        if($( "#newFileName" ).val().lastIndexOf(".")>=0) {
	            $( "#newFileName" ).val($( "#newFileName" ).val().substring(0,$( "#newFileName" ).val().lastIndexOf("."))+".html");            
	        }
	    }); 
	    
	    $( "#mdFileTypeButton" ).click(function(e) {
            // Fixes reloading of the application by click
            e.preventDefault();
            	        
	        fileContent = TSCORE.Config.getNewMDFileContent();
	        //Leave the filename as it is by no extension
	        if($( "#newFileName" ).val().lastIndexOf(".")>=0) {
	            $( "#newFileName" ).val($( "#newFileName" ).val().substring(0,$( "#newFileName" ).val().lastIndexOf("."))+".md");            
	        }
	    });     
	
	    $( '#fileCreateConfirmButton' ).click(function() {
            var bValid = true;                
//                bValid = bValid && checkLength( newFileName, "filename", 4, 200 );

/*            if(TSCORE.fileExists($( "#newFileName" ).val())) {
                updateTips("File already exists.");
                bValid = false;
            } */
            if ( bValid ) {
                TSCORE.IO.saveTextFile(TSCORE.currentPath+TSCORE.TagUtils.DIR_SEPARATOR+$( "#newFileName" ).val(),fileContent);
                TSCORE.IO.listDirectory(TSCORE.currentPath);                    
            }
        });

        $( '#renameFileButton' ).click(function() {
            var bValid = true;           
    //        bValid = bValid && checkLength( $( "#renamedFileName" ).val(), "filename", 3, 200 );
    //        bValid = bValid && checkRegexp( renamedFileName, /^[a-z]([0-9a-z_.])+$/i, "Filename may consist of a-z, 0-9, underscores, begin with a letter." );
            if ( bValid ) {
                var containingDir = TSCORE.TagUtils.extractContainingDirectoryPath(TSCORE.selectedFiles[0]);
                TSCORE.IO.renameFile(
                        TSCORE.selectedFiles[0],
                        containingDir+TSCORE.TagUtils.DIR_SEPARATOR+$( "#renamedFileName" ).val()
                    );
            }
        });

        // Edit Tag Dialog

	    $( "#plainTagTypeButton" ).click(function(e) {
            // Fixes reloading of the application by click
            e.preventDefault();
	        
	        TSCORE.selectedTag, $( "#newTagName" ).datepicker( "destroy" ).val("");
	    });  
	
	    $( "#dateTagTypeButton" ).click(function(e) {
            // Fixes reloading of the application by click
            e.preventDefault();
            
	        TSCORE.selectedTag, $( "#newTagName" ).datepicker({
	            showWeek: true,
	            firstDay: 1,
	            dateFormat: "yymmdd"
	        });
	    });  
	    
	    $( "#currencyTagTypeButton" ).click(function(e) {
            // Fixes reloading of the application by click
            e.preventDefault();
            
	        TSCORE.selectedTag, $( "#newTagName" ).datepicker( "destroy" ).val("XEUR")
	    });      
	    
        $( "#editTagButton" ).click(function() {
            TSCORE.TagUtils.renameTag(TSCORE.selectedFiles[0], TSCORE.selectedTag, $( "#newTagName" ).val());
            TSCORE.IO.listDirectory(TSCORE.currentPath);                                   
        });  
	    
	    // End Edit Tag Dialog

        $( "#startNewInstanceBack" ).click(function() {
            window.open(window.location.href,'_blank');
        });
    
	    $( "#aboutDialogBack" ).click(function() {
            $("#aboutIframe").attr("src","about.html");
        });

        // Open About Dialog
        $( "#openAboutBox" ).click(function() {
           $('#dialogAbout').modal('show');
        });

        // Open Options Dialog
        $( "#openOptions" ).click(function() {
            require(['tsoptions'], function () {
                $('#dialogOptions').modal('show');
            });
        });

	    // Advanced Settings
        $( "#aboutDialogSettings" ).click(function() {
            $('#dialogOptions').modal('hide');
            require(['jsoneditor'], function () {
                editor = new JSONEditor(document.getElementById("settingsEditor")); 
                formatter = new JSONFormatter(document.getElementById("settingsPlainJSON"));
                $("#settingsPlainJSON").hide();
                editor.set(TSCORE.Config.Settings);
                $('#dialogAdvancedSetting').modal('show');
            });
        });
        	
        $( "#editorButton" ).click(function() {
            if($("#settingsEditor").is(":hidden") ) {
                $("#settingsPlainJSON").hide();
                $("#settingsEditor").show();
                editor.set(formatter.get());                    
            }
        });
        	
        $( "#importExportButton" ).click(function() {
            if($("#settingsPlainJSON").is(":hidden") ) {
                formatter.set(editor.get());
                $("#settingsPlainJSON").show();
                $("#settingsEditor").hide();
            }
        });
        
        $( "#defaultSettingsButton" ).click(function() {
            TSCORE.showConfirmDialog(
                "Warning",
                "Are you sure you want to restore the default application settings?\n"+
                +"All manually made changes such as tags and taggroups will be lost.",
                function() {
                    TSCORE.Config.loadDefaultSettings();                
                }                
            );
        });
        
        $( "#saveSettingsButton" ).click(function() {
            TSCORE.Config.Settings = editor.get();
            TSCORE.Config.saveSettings();
            TSCORE.reloadUI();
        });
        // End Advanced Settings
	    
	    // File Menu
        $( "#fileMenuAddTag" ).click( function() {
            TSCORE.showAddTagsDialog();
        }); 
        
        $( "#fileMenuOpenFile" ).click( function() {
            TSCORE.FileOpener.openFile(TSCORE.selectedFiles[0]);                
        }); 
        
        $( "#fileMenuOpenDirectory" ).click( function() {
            TSCORE.IO.openDirectory(TSCORE.currentPath);
        }); 
        
        $( "#fileMenuRenameFile" ).click( function() {
            TSCORE.showFileRenameDialog();
        }); 
        
        $( "#fileMenuDeleteFile" ).click( function() {
            console.log("Deleting file...");
            TSCORE.showConfirmDialog(
                "Delete File(s)",
                "These items will be permanently deleted and cannot be recovered. Are you sure?",
                function() {
                    TSCORE.IO.deleteElement(TSCORE.selectedFiles[0]);
                    TSCORE.IO.listDirectory(TSCORE.currentPath);   
                }
            );
        });
        // End File Menu  
  	        
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
	exports.showFileRenameDialog    = showFileRenameDialog;
	exports.showFileCreateDialog    = showFileCreateDialog;
    exports.showTagEditDialog       = showTagEditDialog;
	exports.hideAllDropDownMenus	= hideAllDropDownMenus;

});