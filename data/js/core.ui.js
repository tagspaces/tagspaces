/* Copyright (c) 2012-2014 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
/* global define, Handlebars, isNode, isFirefox  */
define(function(require, exports, module) {
"use strict";

    console.log("Loading core.ui.js ...");

    var TSCORE = require("tscore");

    var fileContent;
    var fileType;

    var showAlertDialog = function(message, title) {
        if (!title) { title = $.i18n.t("ns.dialogs:titleAlert"); }
        if (!message) { message = 'No Message to Display.'; }

        var alertModal = $('#alertDialog');
        alertModal.find('h4').text(title);        
        alertModal.find('.modal-body').empty();
        alertModal.find('.modal-body').text(message);
        alertModal.find('#okButton')
            .off('click')
            .click(function() {
               alertModal.modal('hide');
            }
        );

        alertModal.modal({backdrop: 'static',show: true});
    };

    var showConfirmDialog = function(title, message, okCallback, cancelCallback, confirmShowNextTime) {
        if (!title) { title = $.i18n.t("ns.dialogs:titleConfirm"); }
        if (!message) { message = 'No Message to Display.'; }

        var confirmModal = $('#confirmDialog');

        if(confirmShowNextTime) {
            confirmModal.find('#showThisDialogAgain').prop('checked', true);
        } else {
            confirmModal.find('#showThisDialogAgainContainer').hide();
        }

        confirmModal.find('h4').text(title);
        confirmModal.find('#dialogContent').text(message);
        confirmModal.find('#confirmButton')
            .off('click')
            .click(function() {
               okCallback(confirmModal.find('#showThisDialogAgain').prop('checked'));
               confirmModal.modal('hide');
            }
        );
        confirmModal.find('#cancelButton')
            .off('click')
            .click(function() {
               if(cancelCallback != undefined) {
                   cancelCallback();
               }
               confirmModal.modal('hide');
            }
        );

        confirmModal.modal({backdrop: 'static',show: true});
    };


    var showFileCreateDialog = function() {
        fileContent = TSCORE.Config.getNewTextFileContent(); // Default new file in text file
        fileType = "txt";
        
        $('#newFileNameTags').select2('data', null);        
        $("#newFileNameTags").select2({
            multiple: true,
            tags: TSCORE.Config.getAllTags(),
            tokenSeparators: [",", " "],
            minimumInputLength: 2,
            selectOnBlur: true
        });
   
        $("#newFileName").val("");
        $("#tagWithCurrentDate").prop('checked', false);

        $( '#dialogFileCreate' ).modal({backdrop: 'static',show: true});
        $( '#txtFileTypeButton' ).button('toggle');

        $('#dialogFileCreate').on('shown', function () {
            $('#newFileName').focus();
        });
    };
    
    var showFileRenameDialog = function(filePath) {
        $( "#renamedFileName" ).attr("filepath",filePath);
        $( "#renamedFileName" ).val(TSCORE.TagUtils.extractFileName(filePath));
        $( '#dialogFileRename' ).modal({backdrop: 'static',show: true});
    };    
    
    var showFileDeleteDialog = function(filePath) {
        console.log("Deleting file...");
        TSCORE.showConfirmDialog(
            $.i18n.t("ns.dialogs:fileDeleteTitleConfirm"),
            $.i18n.t("ns.dialogs:fileDeleteContentConfirm", {filePath: filePath}),
            function() {
                TSCORE.IO.deleteElement(filePath); 
            }
        );
    };    
    
    var showTagEditDialog = function() {
        $( "#newTagName" ).val(TSCORE.selectedTag);
        $( '#dialogEditTag' ).modal({backdrop: 'static',show: true});
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
                $("#directoryBrowserDialog").i18n();
                TSCORE.IO.listSubDirectories(path);                     
        });         
    };  
    
    var showOptionsDialog = function() {
        require([
              "text!templates/OptionsDialog.html",
              "tsoptions"
            ], function(uiTPL, controller) {
                if($("#dialogOptions").length < 1) {                
                    var uiTemplate = Handlebars.compile( uiTPL );
                    $('body').append(uiTemplate());    
                    controller.initUI();
                }
                $("#dialogOptions").i18n();
                controller.reInitUI();                    
        });
    };   
    
    var showWelcomeDialog = function() {
        require([
              "text!templates/WelcomeDialog.html"
            ], function(uiTPL) {
                if($("#dialogWelcome").length < 1) {                
                    var uiTemplate = Handlebars.compile( uiTPL );
                    $('body').append(uiTemplate());    
                    $('#welcomeCarosel').carousel();
                }
                $("#dialogWelcome").i18n();
                $("#dialogWelcome").modal({backdrop: 'static',show: true});
        });
    };

    var showAboutDialog = function() {
        $("#dialogAboutTS").modal({backdrop: 'static',show: true});
    };

    var initUI = function() {
        $("#appVersion").text(TSCORE.Config.DefaultSettings["appVersion"]+"."+TSCORE.Config.DefaultSettings["appBuild"]);
        $("#appVersion").attr("title","BuildID: "+TSCORE.Config.DefaultSettings["appVersion"]+"."+TSCORE.Config.DefaultSettings["appBuild"]+"."+TSCORE.Config.DefaultSettings["appBuildID"]);
 
        // prevent default behavior from changing page on dropped file
        window.ondragover = function(e) { e.preventDefault(); return false; };
        window.ondrop = function(e) { e.preventDefault(); return false; };
        
        platformTuning();        
 
        $( "#toggleLeftPanel" ).click(function() {
            TSCORE.toggleLeftPanel();
        });

        $( "#closeLeftPanel" ).click(function() {
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
            
            // TODO move this functionality to postio
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
           $('#dialogAbout').modal({backdrop: 'static',show: true});
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

        $( "#fileMenuSendTo" )
            .click( function() {
                TSCORE.IO.sendFile(TSCORE.selectedFiles[0]);
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
                
        $('#showLocations').click(function() {
            showLocationsPanel();
            console.log("Show Directories");
        });

        $('#showTagGroups').click(function() {
            showTagsPanel();
            console.log("Show Tags");
        });

        $('#contactUs').click(function () {
            showContactUsPanel();
            console.log("Show Contact Us");
        });

        // Hide the tagGroupsContent or locationContent by default
        $('#locationContent').hide(); // #tagGroupsContent
        $('#contactUsContent').hide();

        // Search UI

        $("#closeSearchOptionButton")
            .click(function() {
                $("#searchOptions").hide();
            });

        $("#includeSubfoldersOption")
            .click(function() {
                var searchQuery = $("#searchBox").val();
                if(searchQuery.indexOf("?")===0) {
                    $("#searchBox").val(searchQuery.substring(1,searchQuery.length));
                } else {
                    $("#searchBox").val("?"+searchQuery);                    
                }
            });
        
        $("#searchBox")
            .prop('disabled', true)
            .focus(function() {
                //$(this).removeClass("input-medium");
                //$(this).addClass("input-large");
                $("#searchOptions").show();
            })
            .keyup(function(e) {
                // On enter fire the search
                if (e.keyCode === 13) {
                    $( "#clearFilterButton").addClass("filterOn");
                    TSCORE.PerspectiveManager.redrawCurrentPerspective();
                    $("#searchOptions").hide();
                }  else {
                    TSCORE.Search.nextQuery = this.value;
                } 
                if (this.value.length === 0) {
                    $( "#clearFilterButton").removeClass("filterOn");
                    TSCORE.PerspectiveManager.redrawCurrentPerspective();
                }                 
            })
            .blur(function() {
                //$(this).addClass("input-medium");
                //$(this).removeClass("input-large");                
                if (this.value.length === 0) {
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

        var $contactUsContent = $("#contactUsContent");

        $contactUsContent.on('click',"#openHints", function () {
            showWelcomeDialog();
        });

        $contactUsContent.on('click',"#openUservoice", function (e) {
            e.preventDefault();
            openLinkExternally($(this).attr("href"));
        });

        $contactUsContent.on('click',"#openGooglePlay", function (e) {
            e.preventDefault();
            openLinkExternally($(this).attr("href"));
        });

        $contactUsContent.on('click',"#openWhatsnew", function (e) {
            e.preventDefault();
            openLinkExternally($(this).attr("href"));
        });

        $contactUsContent.on('click',"#openGitHubIssues", function (e) {
            e.preventDefault();
            openLinkExternally($(this).attr("href"));
        });

        $contactUsContent.on('click',"#helpUsTranslate", function (e) {
            e.preventDefault();
            openLinkExternally($(this).attr("href"));
        });

        $contactUsContent.on('click',"#openTwitter", function (e) {
            e.preventDefault();
            openLinkExternally($(this).attr("href"));
        });

        $contactUsContent.on('click',"#openTwitter2", function (e) {
            e.preventDefault();
            openLinkExternally($(this).attr("href"));
        });

        $contactUsContent.on('click',"#openGooglePlus", function (e) {
            e.preventDefault();
            openLinkExternally($(this).attr("href"));
        });

        $contactUsContent.on('click',"#openFacebook", function (e) {
            e.preventDefault();
            openLinkExternally($(this).attr("href"));
        });

        $contactUsContent.on('click',"#openSupportUs", function (e) {
            e.preventDefault();
            openLinkExternally($(this).attr("href"));
        });

        $("#newVersionMenu").on('click',".whatsNewLink", function (e) {
            e.preventDefault();
            openLinkExternally($(this).attr("href"));
        });

        // Hide drop downs by click and drag
        $(document).click(function () {
            TSCORE.hideAllDropDownMenus();
        });
    };

    // Handle external links
    function openLinkExternally(url) {
        if(isNode) {
            gui.Shell.openExternal(url);
        } else {
            // _system is needed for cordova
            window.open(url,"_system");
        }
    }

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
            $("#downloadFile").parent().hide();
            $("#openFileInNewWindow").hide();
            $("#openGooglePlay").hide();
        } else if(isChrome) {
            $("#directoryMenuOpenDirectory").parent().hide();
            $("#fileMenuOpenDirectory").parent().hide();
            $("#fileMenuOpenNatively").parent().hide();
            $("#openDirectory").parent().hide();
            $("#openNatively").hide();
        } else if(isWeb) {
            $("#directoryMenuOpenDirectory").parent().hide();
            $("#fileMenuOpenDirectory").parent().hide();
            $("#fileMenuOpenNatively").parent().hide();
            $("#openDirectory").parent().hide();
            $("#openNatively").hide();
        } else if(isFirefox) {
            $("#openNatively").hide();
            $("#fileMenuOpenNatively").parent().hide();
        } else if(isNode) {
            $("#fullscreenFile").hide(); 
            $("#openFileInNewWindow").hide();         
            
            // handling window maximization
            var nwwin = gui.Window.get();        
            nwwin.on('maximize', function() {
              TSCORE.Config.setIsWindowMaximized(true);
              TSCORE.Config.saveSettings();                    
            });        
            nwwin.on('unmaximize', function() {
              TSCORE.Config.setIsWindowMaximized(false);
              TSCORE.Config.saveSettings();      
            }); 

            // Disabling automatic maximazation of the main window
            //if(TSCORE.Config.getIsWindowMaximized()){
            //    nwwin.maximize();
            //}
        }
        
        // Disable send to feature on all platforms except android cordova
        if(!isCordova) {
            $("#sendFile").hide();
            $("#fileMenuSendTo").hide();
        }
        if(isOSX) {
            $("body").addClass("osx");                   
        }
    }

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
        $(".dirAltNavMenu").hide();
    };

    var showLocationsPanel = function() {
        TSCORE.openLeftPanel();
        $('#contactUsContent').hide();
        $('#tagGroupsContent').hide();
        $('#locationContent').show();
        $('#showTagGroups').removeClass("active");
        $('#contactUs').removeClass("active");
        $('#showLocations').addClass("active");
    };

    var showTagsPanel = function() {
        TSCORE.openLeftPanel();
        $('#contactUsContent').hide();
        $('#locationContent').hide();
        $('#tagGroupsContent').show();
        $('#showLocations').removeClass("active");
        $('#contactUs').removeClass("active");
        $('#showTagGroups').addClass("active");
    };
    
    var showContactUsPanel = function() {
        TSCORE.openLeftPanel();
        $('#locationContent').hide();
        $('#tagGroupsContent').hide();
        $('#contactUsContent').show();
        $('#showLocations').removeClass("active");
        $('#showTagGroups').removeClass("active");
        $('#contactUs').addClass("active");
    };     

    // Public API definition
    exports.showContextMenu             = showContextMenu;
    exports.initUI                      = initUI;
    exports.clearSearchFilter           = clearSearchFilter;
    exports.openLinkExternally          = openLinkExternally;
    exports.enableTopToolbar            = enableTopToolbar;
    exports.disableTopToolbar           = disableTopToolbar;
    exports.showAlertDialog             = showAlertDialog;
    exports.showConfirmDialog           = showConfirmDialog;
    exports.showFileRenameDialog        = showFileRenameDialog;
    exports.showFileCreateDialog        = showFileCreateDialog;
    exports.showFileDeleteDialog        = showFileDeleteDialog;
    exports.showWelcomeDialog           = showWelcomeDialog;
    exports.showTagEditDialog           = showTagEditDialog;
    exports.showOptionsDialog           = showOptionsDialog;
    exports.showAboutDialog             = showAboutDialog;
    exports.showLocationsPanel          = showLocationsPanel;
    exports.showTagsPanel               = showTagsPanel;
    exports.showDirectoryBrowserDialog  = showDirectoryBrowserDialog; 
    exports.hideAllDropDownMenus        = hideAllDropDownMenus;

});