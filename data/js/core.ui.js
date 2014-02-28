/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";

	console.log("Loading core.ui.js ...");

	var TSCORE = require("tscore");

	var fileContent = undefined;
	var fileType = undefined;		

	var showAlertDialog = function(message, title) {
	    if (!title) { title = 'Alert'; }	
	    if (!message) { message = 'No Message to Display.'; }
	
	    var alertModal = $('#alertDialog');	
        alertModal.find('h4').text(title);        
        alertModal.find('.modal-body').empty();
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
        confirmModal.find('.modal-body').empty();
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
	        multiple: true,
			tags: TSCORE.Config.getAllTags(),
			tokenSeparators: [",", " "],
			minimumInputLength: 2
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
            "The file \""+filePath+"\" will be permanently deleted and cannot be recovered. Are you sure?",
            function() {
                TSCORE.IO.deleteElement(filePath); 
            }
        );
    };    
    
    var showTagEditDialog = function() {
        $( "#newTagName" ).val(TSCORE.selectedTag);

        /* $( "#newTagName" ).select2('data', null);        
        $( "#newTagName" ).select2({
            multiple: false,
            tags: TSCORE.Config.getAllTags(),
            tokenSeparators: [",", " "],
            minimumInputLength: 2            
        });  */
        
        $( '#dialogEditTag' ).modal({show: true});
    };  
    
    var showDirectoryBrowserDialog = function(path) {
        require([
              "text!templates/DirectoryBrowserDialog.html",
              "tsdirectorybrowser"
            ], function(uiTPL, controller) {
                TSCORE.directoryBrowser = controller;
                if($("#directoryBrowserDialog").length < 1) {                
                    var uiTemplate = Handlebars.compile( uiTPL );
                    $('body').append(uiTemplate());   
                    TSCORE.directoryBrowser.initUI();                        
                }
                TSCORE.IO.listSubDirectories(path);                     
        });         
    };  
    
    var showOptionsDialog = function() {
        require([
              "text!templates/OptionsDialog.html",
              "tsoptions",
            ], function(uiTPL, controller) {
                if($("#dialogOptions").length < 1) {                
                    var uiTemplate = Handlebars.compile( uiTPL );
                    $('body').append(uiTemplate());    
                    controller.initUI();
                }
                controller.reInitUI();                    
        });
    };   
    
    var showWelcomeDialog = function() {
        require([
              "text!templates/WelcomeDialog.html",
            ], function(uiTPL) {
                if($("#dialogWelcome").length < 1) {                
                    var uiTemplate = Handlebars.compile( uiTPL );
                    $('body').append(uiTemplate());    
                    $('#welcomeCarosel').carousel();
                }
                $("#dialogWelcome").modal("show");
        });
    };         
    
	var initUI = function() {
        $("#appVersion").text(TSCORE.Config.DefaultSettings["appVersion"]+"."+TSCORE.Config.DefaultSettings["appBuild"]);
        $("#appVersion").attr("title","BuildID: "+TSCORE.Config.DefaultSettings["appVersion"]+"."+TSCORE.Config.DefaultSettings["appBuild"]+"."+TSCORE.Config.DefaultSettings["appBuildID"]);
 
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
	                fileTags = fileTags + TSCORE.Config.getTagDelimiter() + value;                                 
	            }
	        }); 

			if($("#tagWithCurrentDate").prop("checked")) {
	            if(fileTags.length < 1) {
	                fileTags = TSCORE.TagUtils.formatDateTime4Tag(new Date());                 
	            } else {
	                fileTags = fileTags + TSCORE.Config.getTagDelimiter() + TSCORE.TagUtils.formatDateTime4Tag(new Date());                                 
	            }				
			}
			
			if(fileTags.length > 0) {
				fileTags = TSCORE.TagUtils.beginTagContainer + fileTags + TSCORE.TagUtils.endTagContainer;
			}

			var fileName = TSCORE.currentPath+TSCORE.dirSeparator+$( "#newFileName" ).val()+fileTags+"."+fileType;

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
                        containingDir+TSCORE.dirSeparator+$( "#renamedFileName" ).val()
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
            showOptionsDialog();
        });
	    
	    // File Menu
        $( "#fileMenuAddTag" ).click( function() {
            TSCORE.showAddTagsDialog();
        }); 
        
        $( "#fileMenuOpenFile" ).click( function() {
            TSCORE.FileOpener.openFile(TSCORE.selectedFiles[0]);                
        }); 

        $( "#fileMenuOpenNatively" )
            .click( function() {
                TSCORE.IO.openFile(TSCORE.selectedFiles[0]);
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
        
        $( "#fileOpenProperties" ).click( function() {
            //TSCORE.showFilePropertiesDialog(TSCORE.selectedFiles[0]);
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
	    
	    // Hide the tagGroupsContent or locationContent by default
	    $('#locationContent').hide(); // #tagGroupsContent
	    
        // Search UI

        $("#closeSearchOptionButton")
            .click(function(e) {
                $("#searchOptions").hide();
            });

        $("#includeSubfoldersOption")
            .click(function(e) {
                var searchQuery = $("#searchBox").val();
                if(searchQuery.indexOf("?")==0) {
                    $("#searchBox").val(searchQuery.substring(1,searchQuery.length));
                } else {
                    $("#searchBox").val("?"+searchQuery);                    
                }
            });
        
        $("#searchBox")
            .prop('disabled', true)
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
            
        $("#searchButton")
            .prop('disabled', true)
            .click(function(evt) {
                evt.preventDefault();
                $( "#clearFilterButton").addClass("filterOn");
                $("#searchOptions").hide();
                TSCORE.PerspectiveManager.redrawCurrentPerspective();
            }); 
                
        $("#clearFilterButton")
            .prop('disabled', true)
            .click(function(evt) {
                evt.preventDefault();
                clearSearchFilter();
                
                // Old clear
                //$("#"+self.extensionID+"FilterBox").val("").addClass("input-medium");
                //$("#"+self.extensionID+"FilterBox").val("").removeClass("input-large");
                //self.setFilter(""); 
                //$("#silterBox").val("");    
                
                // Restoring initial dir listing without subdirectories  
                TSCORE.IO.listDirectory(TSCORE.currentPath);           
            });        
        
        // Search UI END
        
        $('#perspectiveSwitcherButton').prop('disabled', true);
         	    
        $('#contactUs').popover({
                placement: 'top', 
                content: $("#contactUsContent").html(), 
                html: true
        });      
        
        $("#sideBarButtunGroup").on('click',"#openHints", function () {
                showWelcomeDialog();
            });

        // Handle external links _system is important in cordova
        $("#sideBarButtunGroup").on('click',"#openUservoice", function () {
                window.open($(this).attr("url"),"_system");
            });

        $("#sideBarButtunGroup").on('click',"#openGitHubIssues", function () {
                window.open($(this).attr("url"),"_system");
            });
            
        $("#sideBarButtunGroup").on('click',"#openTwitter", function () {
                window.open($(this).attr("url"),"_system");
            });    

        $("#sideBarButtunGroup").on('click',"#openTwitter2", function () {
                window.open($(this).attr("url"),"_system");
            });    

        $("#sideBarButtunGroup").on('click',"#openGooglePlus", function () {
                window.open($(this).attr("url"),"_system");
            });    
                    	    
	    // Hide drop downs by click and drag
	    $(document).click(function () {
			TSCORE.hideAllDropDownMenus();
	    });	          	        

	};

    function clearSearchFilter() {
        $("#searchOptions").hide();
        $("#searchBox").val("");
        $("#clearFilterButton").removeClass("filterOn");        
        TSCORE.Search.nextQuery = "";       
    }

    function disableTopToolbar() {
        $("#perspectiveSwitcherButton")
            .prop('disabled', true);
            
        $("#searchBox")
            .prop('disabled', true);
            
        $("#searchButton")
            .prop('disabled', true);
                
        $("#clearFilterButton")
            .prop('disabled', true);       
    }
	
	function enableTopToolbar() {
        $("#perspectiveSwitcherButton")
            .prop('disabled', false);
            
        $("#searchBox")
            .prop('disabled', false);
            
        $("#searchButton")
            .prop('disabled', false);
                
        $("#clearFilterButton")
            .prop('disabled', false);	    
	}
	
    function platformTuning() {
        if(isCordova) {
            $("#startNewInstanceBack").hide();
            $("#directoryMenuOpenDirectory").parent().hide();
            $("#fileMenuOpenDirectory").parent().hide();
            $("#fullscreenFile").parent().hide();
            $("#openDirectory").parent().hide();
            $("#advancedSettings").hide();
            $("#openFileInNewWindow").hide();
        }
        if(isChrome) {
            $("#directoryMenuOpenDirectory").parent().hide();
            $("#fileMenuOpenDirectory").parent().hide();
            $("#openDirectory").parent().hide();
            //$("#openFileInNewWindow").hide();
            $("#openNatively").hide();            
        }
        if(isFirefox) {
            $("#openNatively").hide();                   
        }
        if(isNode) {
            $("#fullscreenFile").hide(); 
            $("#openFileInNewWindow").hide();         
            
            // handling window maximization
            var nwwin = gui.Window.get();        
            nwwin.on('maximize', function() {
              //console.log('NW Window maximized');
              TSCORE.Config.setIsWindowMaximized(true);
              TSCORE.Config.saveSettings();                    
            });        
            nwwin.on('unmaximize', function() {
              //console.log('NW Window unmaximize');
              TSCORE.Config.setIsWindowMaximized(false);
              TSCORE.Config.saveSettings();      
            }); 

            if(TSCORE.Config.getIsWindowMaximized()){
                nwwin.maximize();
            }               
        }
        if(isOSX) {
            $("body").addClass("osx");                   
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
        //$('.popover').hide();        
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
    exports.showContextMenu			    = showContextMenu;
	exports.initUI 					    = initUI;
	exports.clearSearchFilter           = clearSearchFilter;
    exports.enableTopToolbar            = enableTopToolbar;
    exports.disableTopToolbar           = disableTopToolbar;
	exports.showAlertDialog 		    = showAlertDialog;
	exports.showConfirmDialog 		    = showConfirmDialog;
	exports.showFileRenameDialog        = showFileRenameDialog;
	exports.showFileCreateDialog        = showFileCreateDialog;
	exports.showFileDeleteDialog        = showFileDeleteDialog;
    exports.showWelcomeDialog           = showWelcomeDialog;
    exports.showTagEditDialog           = showTagEditDialog;
    exports.showLocationsPanel          = showLocationsPanel;
    exports.showTagsPanel       	    = showTagsPanel;    
    exports.showDirectoryBrowserDialog  = showDirectoryBrowserDialog; 
	exports.hideAllDropDownMenus	    = hideAllDropDownMenus;


});