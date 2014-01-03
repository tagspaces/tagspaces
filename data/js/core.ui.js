/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";

	console.log("Loading core.ui.js ...");

	var TSCORE = require("tscore");

    var jsonEditor = undefined;

	var fileContent = undefined;
	var fileType = undefined;		

	var showAlertDialog = function(message, title) {
	    if (!title) { title = 'Alert'; }	
	    if (!message) { message = 'No Message to Display.'; }
	
	    var alertModal = $('#alertDialog');	
        alertModal.find('h4').text(title);        
        alertModal.find('.modal-body').text(message);
	    alertModal.find('#okButton')
	       .off('click')
	       .click(function(event) {
	           alertModal.modal('hide');
	       }
	    );
	
	    alertModal.modal('show');
	};	
	
	var showConfirmDialog = function(title, message, okCallback, cancelCallback) {
	    if (!title) { title = 'Confirm'; }	
	    if (!message) { message = 'No Message to Display.'; }
	    
	    var confirmModal = $('#confirmDialog');
        confirmModal.find('h4').text(title);    	
	    confirmModal.find('.modal-body').text(message);
	    confirmModal.find('#okButton')
	       .off('click')
	       .click(function(event) {
	           okCallback();
	           confirmModal.modal('hide');
	       }
	    );
        confirmModal.find('#cancelButton')
           .off('click')
           .click(function(event) {
               if(cancelCallback != undefined) {
                   cancelCallback();              
               }
               confirmModal.modal('hide');
            }
        );
	
	    confirmModal.modal('show');     
	};	
	

    var showFileCreateDialog = function() {
        fileContent = TSCORE.Config.getNewTextFileContent(); // Default new file in text file
        fileType = "txt";
        
        $('#newFileNameTags').select2('data', null);        
		$("#newFileNameTags").select2({
	        //minimumInputLength: 1,
	        multiple: true,
			tags: TSCORE.Config.getAllTags(),
		});  
   
		$("#newFileName").val("");     
		$("#tagWithCurrentDate").prop('checked', false);     

        $( '#dialogFileCreate' ).modal({show: true});
        $( '#txtFileTypeButton' ).button('toggle');
        		
		$('#dialogFileCreate').on('shown', function () {
		    $('#newFileName').focus();
		});
    };
    
    var showFileRenameDialog = function(filePath) {
        $( "#renamedFileName" ).attr("filepath",filePath);
        $( "#renamedFileName" ).val(TSCORE.TagUtils.extractFileName(filePath));
        $( '#dialogFileRename' ).modal({show: true});
    };    
    
    var showFileDeleteDialog = function(filePath) {
        console.log("Deleting file...");
        TSCORE.showConfirmDialog(
            "Delete File(s)",
            "The file: "+filePath+" will be permanently deleted and cannot be recovered. Are you sure?",
            function() {
                TSCORE.IO.deleteElement(TSCORE.selectedFiles[0]);
            }
        );
    };    
    
    var showTagEditDialog = function() {
        $( "#newTagName" ).val(TSCORE.selectedTag);
        $( '#dialogEditTag' ).modal({show: true});
    };    
    
	var initUI = function() {
        $("#appVersion").text(TSCORE.Config.DefaultSettings["appVersion"]+"beta");
        $("#appVersion").attr("title","["+TSCORE.Config.DefaultSettings["appVersion"]+"."+TSCORE.Config.DefaultSettings["appBuild"]+"]");

        // Show start hint
        if(TSCORE.Config.Settings.tagspacesList.length < 1 ) {
            $( "#createNewLocation" ).attr("title", "Start using TagSpaces by creating a new location.");
            $( "#createNewLocation" ).addClass("createFirstLocation");
            $( "#createNewLocation" ).tooltip( { placement: "bottom" } );
            $( "#createNewLocation" ).tooltip( "show" );
            $( "#locationName" ).prop('disabled', true);
            $( "#selectLocation" ).prop('disabled', true);              
        }
 
        platformTuning();        
 
	    $( "#toggleLeftPanel" ).click(function() {
			TSCORE.toggleLeftPanel();
	    });   
		
	    $( "#txtFileTypeButton" ).click(function(e) {
            // Fixes reloading of the application by click
            e.preventDefault();
            	        
	        fileContent = TSCORE.Config.getNewTextFileContent();
	        fileType = "txt";

	    });            
	
	    $( "#htmlFileTypeButton" ).click(function(e) {
            // Fixes reloading of the application by click
            e.preventDefault();
            	        
	        fileContent = TSCORE.Config.getNewHTMLFileContent();
			fileType = "html";
	    }); 
	    
	    $( "#mdFileTypeButton" ).click(function(e) {
            // Fixes reloading of the application by click
            e.preventDefault();
            	        
	        fileContent = TSCORE.Config.getNewMDFileContent();
			fileType = "md";
	    });     
	    
	
	    $( '#fileCreateConfirmButton' ).click(function() {
	    	var fileTags = "";
	    	var rawTags = $( "#newFileNameTags" ).val().split(",");

		    rawTags.forEach(function (value, index) {         
	            if(index == 0) {
	                fileTags = value;                 
	            } else {
	                fileTags = fileTags + TSCORE.TagUtils.tagDelimiter + value;                                 
	            }
	        }); 

			if($("#tagWithCurrentDate").prop("checked")) {
	            if(fileTags.length < 1) {
	                fileTags = TSCORE.TagUtils.formatDateTime4Tag(new Date());                 
	            } else {
	                fileTags = fileTags + TSCORE.TagUtils.tagDelimiter + TSCORE.TagUtils.formatDateTime4Tag(new Date());                                 
	            }				
			}
			
			if(fileTags.length > 0) {
				fileTags = TSCORE.TagUtils.beginTagContainer + fileTags + TSCORE.TagUtils.endTagContainer;
			}

			var fileName = TSCORE.currentPath+TSCORE.TagUtils.DIR_SEPARATOR+$( "#newFileName" ).val()+fileTags+"."+fileType;

            TSCORE.IO.saveTextFile(fileName,fileContent);
            TSCORE.IO.listDirectory(TSCORE.currentPath);                    

        });

        $( '#renameFileButton' ).click(function() {
            var bValid = true;           
    //        bValid = bValid && checkLength( $( "#renamedFileName" ).val(), "filename", 3, 200 );
    //        bValid = bValid && checkRegexp( renamedFileName, /^[a-z]([0-9a-z_.])+$/i, "Filename may consist of a-z, 0-9, underscores, begin with a letter." );
            if ( bValid ) {
                var containingDir = TSCORE.TagUtils.extractContainingDirectoryPath(TSCORE.selectedFiles[0]);
                TSCORE.IO.renameFile(
                        $( "#renamedFileName" ).attr("filepath"),
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
            
	        TSCORE.selectedTag, $( "#newTagName" ).datepicker( "destroy" ).val("XEUR");
	    });      
	    
        $( "#editTagButton" ).click(function() {
            TSCORE.TagUtils.renameTag(TSCORE.selectedFiles[0], TSCORE.selectedTag, $( "#newTagName" ).val());
            TSCORE.startTime = new Date().getTime();             
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
        $( "#advancedSettings" ).click(function() {
            $('#dialogOptions').modal('hide');
            require([
                'ext/editorText/codemirror/codemirror.js',
                'css!ext/editorText/codemirror/codemirror.css',
                'css!ext/editorText/extension.css',
            ], function() { 
                require([
                    'ext/editorText/codemirror/mode/javascript/javascript.js',
                ], function() { 
                    jsonEditor = CodeMirror(document.getElementById("settingsJSON"), {
                        fixedGutter: false,
                        mode: "javascript",
                        lineNumbers: true,
                        lineWrapping: true,
                        tabSize: 2,
                        collapseRange: true,
                        matchBrackets: true,
                        readOnly: false,
                    });        
                    //jsonEditor.setSize("100%","100%");  
                    jsonEditor.setValue(JSON.stringify(TSCORE.Config.Settings));
                    //jsonEditor.autoFormatRange();
                    $('#dialogAdvancedSetting').modal('show');
                });
            });
        });
        
        $( "#defaultSettingsButton" ).click(function() {
            TSCORE.showConfirmDialog(
                "Warning",
                "Are you sure you want to restore the default application settings?\n"+
                "All manually made changes such as tags and taggroups will be lost.",
                function() {
                    TSCORE.Config.loadDefaultSettings();                
                }                
            );
        });
        
        $( "#saveSettingsButton" ).click(function() {
            TSCORE.Config.Settings = jsonEditor.getValue();
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
            TSCORE.showFileRenameDialog(TSCORE.selectedFiles[0]);
        }); 
        
        $( "#fileMenuDeleteFile" ).click( function() {
            TSCORE.showFileDeleteDialog(TSCORE.selectedFiles[0]);
        });
        // End File Menu  
                
		$('#switchLang').click(function(e) {
			$.i18n.setLng('de', function(t) { 
				$('[data-i18n]').i18n();
			});
	    });
	    
		$('#showLocations').click(function(e) {
			showLocationsPanel();
			console.log("Show Directories");					
	    });	
	    
		$('#showTagGroups').click(function(e) {
			showTagsPanel();
			console.log("Show Tags");		
	    });
	    
	    // Hide the taggroups by default
	    $('#tagGroupsContent').hide();
	    
        // Search UI

        $("#closeSearchOptionButton")
            .click(function(e) {
                $("#searchOptions").hide();
            });
        
        $("#searchBox")
            .focus(function(e) {
                //$(this).removeClass("input-medium");
                //$(this).addClass("input-large");
                $("#searchOptions").show();
            })
            .keyup(function(e) {
                // On enter fire the search
                if (e.keyCode == 13) {
                    $( "#clearFilterButton").addClass("filterOn");
                    TSCORE.PerspectiveManager.redrawCurrentPerspective();
                    $("#searchOptions").hide();
                }  else {
                    TSCORE.Search.nextQuery = this.value;
                } 
                if (this.value.length == 0) {
                    $( "#clearFilterButton").removeClass("filterOn");
                    TSCORE.PerspectiveManager.redrawCurrentPerspective();
                }                 
            })
            .blur(function() {
                //$(this).addClass("input-medium");
                //$(this).removeClass("input-large");                
                if (this.value.length == 0) {
                    $( "#clearFilterButton").removeClass("filterOn");
                    TSCORE.PerspectiveManager.redrawCurrentPerspective();
                } 
            });
            
        $("#searchButton").click(function(evt) {
                evt.preventDefault();
                $( "#clearFilterButton").addClass("filterOn");
                $("#searchOptions").hide();
                TSCORE.PerspectiveManager.redrawCurrentPerspective();
            }); 
                
        $("#clearFilterButton")
            .click(function(evt) {
                evt.preventDefault();
                $("#searchOptions").hide();
                $("#clearFilterButton").removeClass("filterOn");
                $("#searchBox").val("");
                //$("#"+self.extensionID+"FilterBox").val("").addClass("input-medium");
                //$("#"+self.extensionID+"FilterBox").val("").removeClass("input-large");
                //self.setFilter(""); 
                $("#silterBox").val("");    
                $("#clearFilterButton").removeClass("filterOn");                            
                TSCORE.Search.nextQuery = "";
                
                // Restoring initial dir listing without subdirectories  
                TSCORE.IO.listDirectory(TSCORE.currentPath);           
                // Keeps the subdir files    
                //TSCORE.PerspectiveManager.redrawCurrentPerspective();
            });        
        
        // Search UI END

        // Handle external links
        $("#openUservoice")
            .click(function(evt) {
                window.open("https://tagspaces.uservoice.com/forums/213931-general","_system");
            });

        $("#openGitHubIssues")
            .click(function(evt) {
                window.open("https://github.com/uggrock/tagspaces/issues/","_system");
            });
            
        $("#openTwitter")
            .click(function(evt) {
                window.open("https://twitter.com/intent/tweet?original_referer=http%3A%2F%2Ftagspaces.org%2F&text=Organize%20your%20files%20with%20@tagspaces","_system");
            });           
        	    
	    // Hide drop downs by click and drag
	    $(document).click(function () {
			TSCORE.hideAllDropDownMenus();
	    });	          	        

	};
	
    function platformTuning() {
        if(isCordova) {
            $("#startNewInstanceBack").hide();
            $("#directoryMenuOpenDirectory").parent().hide();
            $("#fileMenuOpenDirectory").parent().hide();
            $("#fullscreenFile").parent().hide();
            //$("#openDirectory").parent().hide();
            $("#advancedSettings").hide();
            $("#openFileInNewWindow").hide();
          
        }
        if(isChrome) {
            $("#directoryMenuOpenDirectory").parent().hide();
            $("#fileMenuOpenDirectory").parent().hide();
            $("#openDirectory").parent().hide();
            //$("#advancedSettings").hide();
            $("#openFileInNewWindow").hide();
            $("#openNatively").hide();            
        }
        if(isFirefox) {
            $("#openNatively").hide();                   
        }
    };	

	var showContextMenu = function(menuId, sourceObject) {
        var leftPos = sourceObject.offset().left; 
        var topPos = sourceObject.offset().top+sourceObject.height()+5;	  
        if (sourceObject.offset().top+sourceObject.height()+$(menuId).height() > window.innerHeight) {
	        topPos = window.innerHeight-$(menuId).height();
	        leftPos = sourceObject.offset().left+15;	        	
        } 

        if (sourceObject.offset().left+sourceObject.width()+$(menuId).width() > window.innerWidth) {
	        leftPos = window.innerWidth-$(menuId).width();	        	
        } 
        
        $(menuId).css({
            display: "block",
            left:  leftPos,
            top: topPos
        });
	};

	var hideAllDropDownMenus = function() {
        $('#tagGroupMenu').hide();
        $('#tagTreeMenu').hide();
        $('#directoryMenu').hide();
        $('#tagMenu').hide();
        $('#fileMenu').hide();                
	};
	
    var showLocationsPanel = function() {
		$('#tagGroupsContent').hide();
		$('#locationContent').show();
		$('#showLocations').addClass("active");
		$('#showTagGroups').removeClass("active");				
    }; 	

    var showTagsPanel = function() {
		$('#locationContent').hide();
		$('#tagGroupsContent').show();	
		$('#showLocations').removeClass("active");
		$('#showTagGroups').addClass("active");				
    }; 	

    // Public API definition
    exports.showContextMenu			= showContextMenu;
	exports.initUI 					= initUI;
	exports.showAlertDialog 		= showAlertDialog;
	exports.showConfirmDialog 		= showConfirmDialog;
	exports.showFileRenameDialog    = showFileRenameDialog;
	exports.showFileCreateDialog    = showFileCreateDialog;
	exports.showFileDeleteDialog    = showFileDeleteDialog;
    exports.showTagEditDialog       = showTagEditDialog;
    exports.showLocationsPanel      = showLocationsPanel;
    exports.showTagsPanel       	= showTagsPanel;    
	exports.hideAllDropDownMenus	= hideAllDropDownMenus;

});