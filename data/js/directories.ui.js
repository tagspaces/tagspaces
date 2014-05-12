/* Copyright (c) 2012-2014 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
/* global define, Handlebars, isCordova  */

define(function(require, exports, module) {
"use strict";

    console.log("Loading directories.ui.js ...");

    var TSCORE = require("tscore");
    
    var directoryHistory = [];
    
    var dir4ContextMenu = null;
    
//    var currentLocationName = undefined;
    
    function openLocation(path) {
        console.log("Opening connection in : "+path);
    
        var currentLocation = TSCORE.Config.getLocation(path);
        if(currentLocation != undefined) {
            document.title = currentLocation.name + " | " + TSCORE.Config.DefaultSettings.appName;

            $( "#locationName" ).text(currentLocation.name).attr("title",path);

            // Handle open default perspective for a location
            var defaultPerspective = currentLocation.perspective;
            TSCORE.PerspectiveManager.changePerspective(defaultPerspective);

            // Saving the last opened location path in the settings
            TSCORE.Config.setLastOpenedLocation(path);
            TSCORE.Config.saveSettings();
        }

        // Clear search query
        TSCORE.clearSearchFilter();                         
       
        // Clears the directory history
        directoryHistory = [];
        navigateToDirectory(path);
        
        TSCORE.showLocationsPanel();
    }  
    
    // Updates the directory subtree
    function updateSubDirs(dirList) {
        //console.log("Updating subdirs(TSCORE)..."+JSON.stringify(dirList));

        var hasSubFolders = false;
        
        for(var i=0; i < directoryHistory.length; i++) {
            if(directoryHistory[i].path === TSCORE.currentPath) {
                directoryHistory[i].children = [];
                for(var j=0; j < dirList.length; j++) {
                     if(!dirList[j].isFile) {
                        directoryHistory[i].children.push(dirList[j]);
                        hasSubFolders = true;
                     }
                }
                // Sort the dirList alphabetically
                directoryHistory[i].children.sort(function(a,b) { return a.name.localeCompare(b.name); });
            }
        }

        // If the folder contains subfolders, automatically opening the directory browser
        //if(hasSubFolders) {
        //    TSCORE.showLocationsPanel();
        //}               
        
        generateDirPath();
        generateAlternativeDirPath();
        handleDirCollapsion();     
    }

    function generateAlternativeDirPath() {
        console.log("Generating Alternative Directory Path...");
        var subfolders, 
            homeIcon,
            i;

        var $alternativeNavigator = $("#alternativeNavigator");
        $alternativeNavigator.empty();
        for(i=0; i < directoryHistory.length; i++) {
            homeIcon = "";
            if(i===0) {
                homeIcon = "<i class='fa fa-home'></i>&nbsp;";
            }
            
            subfolders = $("<div>", {
                class: "dropdown clearfix dirAltNavMenu",
                "id":         "dirMenu"+i
            })
            .append($("<ul>", {
                   "style":      "overflow-y: auto; max-height: 430px; width: 250px; padding: 5px; display: block;",
                   "role":       "menu",
                   "class":      "dropdown-menu"
            })
            .append($("<li>", {
                    "text": $.i18n.t("ns.common:actionsForDirectory", {dirName: directoryHistory[i].name}),
                    "class": 'dropdown-header'
                })
                .append($('<button>', {
                            type: "button",
                            class: "close",
                            text: "×"
                        })
                        .click(function() {
                            TSCORE.hideAllDropDownMenus();
                        })
                    )
            )
            //.append('<li class="divider"></li>')
            .append($("<li>", {} )
                .append($("<button>", {
                        "class":    "btn btn-link",
                        "path":      directoryHistory[i].path,
                        "title":     $.i18n.t("ns.common:reloadCurrentDirectoryTooltip", {dirName: directoryHistory[i].name}),
                        "data-i18n": "ns.common:reloadCurrentDirectory",
                        "text":      " "+$.i18n.t("ns.common:reloadCurrentDirectory")
                    })
                    .prepend("<i class='fa fa-refresh fa-lg fa-fw'></i>")
                    .click( function() {
                        navigateToDirectory($(this).attr("path"));
                    })
                    )
             )
            .append($("<li>", {} )                     
                .append($("<button>", {
                        "class":    "btn btn-link",
                        "path":      directoryHistory[i].path,
                        "title":     $.i18n.t("ns.common:createSubdirectoryTooltip", {dirName: directoryHistory[i].name}),
                        "data-i18n": "ns.common:createSubdirectory",
                        "text":     " "+$.i18n.t("ns.common:createSubdirectory")
                    })
                    .prepend("<i class='fa fa-folder fa-lg fa-fw'></i>")
                    .click( function() {
                        showCreateDirectoryDialog($(this).attr("path"));
                    })
                )
            )
            .append('<li class="divider"></li>')
            .append($("<li>", {
                "text": $.i18n.t("ns.common:subfodersOfDirectory", {dirName: directoryHistory[i].name}),
                "class": 'dropdown-header'
            })
            ));
                          
            if(directoryHistory[i].children.length <= 0) {
                    subfolders.find("ul").append($("<div>", {
                        "class":        'alert alert-warning',
                        "data-i18n":    "ns.common:noSubfoldersFound",
                        "text":         $.i18n.t("ns.common:noSubfoldersFound")
                    }));
            } else {
                for(var j=0; j < directoryHistory[i].children.length; j++) {
                    if (TSCORE.Config.getShowUnixHiddenEntries() || 
                            (!TSCORE.Config.getShowUnixHiddenEntries() &&
                                (directoryHistory[i].children[j].name.indexOf(".") !== 0))
                        ) {
                        subfolders.find("ul").append($("<button>", {
                            "class":    "btn dirButton",
                            "key":      directoryHistory[i].children[j].path,
                            "title":    directoryHistory[i].children[j].path,
                            "style":    "margin: 1px;",
                            "text":     " "+directoryHistory[i].children[j].name
                        })
                        .prepend("<i class='fa fa-folder-o'></i>")            
                        .click( function() {
                            navigateToDirectory($(this).attr("key"));
                        })
                        );
                    }
               }        
           }

            $alternativeNavigator.append(
                $("<div>", {
                    "class":      "btn-group dropup"
                })
                .append($("<button>", {
                        "class":       "btn btn-link dropdown-toggle",
                        "text":        directoryHistory[i].name,
                        "key":         directoryHistory[i].path,
                        "data-menu":   i
                        //"data-toggle": "dropdown"
                    })
                    .on("contextmenu click", function () {
                        TSCORE.hideAllDropDownMenus();
                        showDropUp("#dirMenu"+$(this).attr("data-menu"), $(this));
                        return false;
                    })
                    .prepend(homeIcon)
                    .append("&nbsp;&nbsp;<i class='fa fa-caret-right'></i>&nbsp;")
                )
                .append(subfolders)
            );
        } // FOR End
    }

    var showDropUp = function(menuId, sourceObject) {
        var $menu = $(menuId);
        var leftPos = 0;
        var topPos = -$menu.height();

        if (sourceObject.offset().left+300 > window.innerWidth) {
            leftPos = -200+sourceObject.width();
        }
        console.log(leftPos+" "+sourceObject.offset().left+" "+$menu.width()+" "+window.innerWidth);

        $menu.css({
            display: "block",
            left:  leftPos+"px",
            top: topPos
        });
    };

    function generateDirPath() {
        console.log("Generating Directory Path...");
        var $locationContent = $("#locationContent");
        $locationContent.empty().addClass("accordion");
        for(var i=0; i < directoryHistory.length; i++) {
            $locationContent.append($("<div>", {
                "class":        "accordion-group disableTextSelection",   
                "style":        "width: 99%; border: 0px #aaa solid;"
            })
            
            .append($("<div>", { 
                    "class":    "accordion-heading btn-group",
                    "key":      directoryHistory[i].path, 
                    "style":    "width:100%; margin: 0px; "
                }
            )

            .append($("<button>", { // Dir toggle button
                        "class":        "btn btn-link btn-lg directoryIcon",
                        "data-toggle":  "collapse",
                        "data-target":  "#dirButtons"+i,                        
                        "key":          directoryHistory[i].path,
                        "title":        $.i18n.t("ns.common:toggleDirectory")
                    }  
                )
                .html("<i class='fa fa-folder-open' style='margin-left: 5px;'></i>")
            )// End dir toggle button  
            
            .append($("<button>", { // Dir main button
                        "class":        "btn btn-link directoryTitle",
                        "key":          directoryHistory[i].path,
                        "title":        directoryHistory[i].path,
                        "text":         directoryHistory[i].name
                    }  
                )
                .click(function() {
                        navigateToDirectory($(this).attr("key"));
                    }
                )                                
                .droppable(
                    {
                        greedy: "true",                    
                        accept: '.fileTitleButton,.fileTile',
                        hoverClass: "dropOnFolder",
                        drop: function( event, ui ) {
                            ui.draggable.detach();
                            var filePath = ui.draggable.attr("filepath");
                            var fileName = TSCORE.TagUtils.extractFileName(filePath);
                            var targetDir = $(this).attr("key");
                            console.log("Moving file: "+filePath+" to "+targetDir);
                            TSCORE.IO.renameFile(filePath, targetDir+TSCORE.dirSeparator+fileName);
                            $(ui.helper).remove();
                        }                  
                    }
                )
            )// End dir main button  
            
            .append($("<button>", {
                    "class":        "btn btn-link btn-lg directoryActions",
                    "key":          directoryHistory[i].path,
                    "title":        $.i18n.t("ns.common:directoryOperations")
            })                       
            //.dropdown( 'attach' , '#directoryMenu' )
            .append("<b class='fa fa-ellipsis-v'>")
            ) // end gear    
                    
            ) // end heading
            
            .append($("<div>", { 
                "class":    "accordion-body collapse in",
                "id":       "dirButtons"+i,
                "style":    "margin: 0 0 0 3px; border: 0;"
            })          
            .append($("<div>", { 
                "class":    "accordion-inner",
                "id":       "dirButtonsContent"+i,
                "style":    "padding: 2px; border: 0;"
            })
            ) // end accordion-inner    
            ) // end accordion button        

            ); // end group

            var dirButtons = $("<div>").appendTo( "#dirButtonsContent"+i );  
            if(directoryHistory[i].children.length <= 0) {
                    dirButtons.append("<div class='alert'><strong> No subfolders found</strong></div>");          
            } else {
                for(var j=0; j < directoryHistory[i].children.length; j++) {
                    if (TSCORE.Config.getShowUnixHiddenEntries() || 
                            (!TSCORE.Config.getShowUnixHiddenEntries() && (directoryHistory[i].children[j].name.indexOf(".") !== 0))) {
                        dirButtons.append($("<button>", { 
                            "class":    "btn btn-sm dirButton", 
                            "key":      directoryHistory[i].children[j].path,
                            "title":    directoryHistory[i].children[j].path,
                            "style":    "margin: 1px;",
                            "text":     " "+directoryHistory[i].children[j].name
                        })
                        .droppable({
                            greedy: "true",
                            accept: ".fileTitleButton,.fileTile",
                            hoverClass: "dropOnFolder",
                            drop: function( event, ui ) {
                                ui.draggable.detach();
                                // Fixing issue with dropping on stacked/overlapped directories
                                if( $(this).parent().parent().parent().hasClass("in") ) {
                                    var filePath = ui.draggable.attr("filepath");
                                    var fileName = TSCORE.TagUtils.extractFileName(filePath);
                                    var targetDir = $(this).attr("key");
                                    console.log("Moving file: "+filePath+" to "+targetDir);
                                    TSCORE.IO.renameFile(filePath, targetDir+TSCORE.dirSeparator+fileName);
                                    $(ui.helper).remove();  
                                }                              
                            }                   
                        }) 
                        .prepend("<i class='fa fa-folder-o'></i>")            
                        .click( function() {
                            navigateToDirectory($(this).attr("key"));
                        })                   
                        );
                    }
               }        
           }
        }
    }
    
    function handleDirCollapsion() {
        $("#locationContent").find(".accordion-heading").each(function() {
            var key = $(this).attr("key");
            console.log("Entered Header for: "+key);
            if(getDirectoryCollapsed(key)) {
                $(this).find("i").removeClass("fa-folder-open");
                $(this).find("i").addClass("fa-folder");          
                $(this).next().removeClass("in");
                $(this).next().addClass("out");
            } else {
                $(this).find("i").removeClass("fa-folder");
                $(this).find("i").addClass("fa-folder-open");          
                $(this).next().removeClass("out");
                $(this).next().addClass("in");
            }
        });
    }
    
    function getDirectoryCollapsed(directoryPath) {
        for(var i=0; i < directoryHistory.length; i++) {
            if(directoryHistory[i].path === directoryPath) {
                return directoryHistory[i].collapsed;
            }
        }
    }
    
    function setDirectoryCollapse(directoryPath, collapsed) {
        for(var i=0; i < directoryHistory.length; i++) {
            if(directoryHistory[i].path === directoryPath) {
                directoryHistory[i].collapsed = collapsed;
            }
        }
    }
    
    function navigateToDirectory(directoryPath) {
        console.log("Navigating to directory: "+directoryPath);
    
        // Cleaning the directory path from \\ \ and / 
        if( (directoryPath.lastIndexOf('/')+1 === directoryPath.length) || (directoryPath.lastIndexOf('\\')+1 === directoryPath.length)) {
            directoryPath = directoryPath.substring(0,directoryPath.length-1);
        }
        if( (directoryPath.lastIndexOf('\\\\')+1 === directoryPath.length)) {
            directoryPath = directoryPath.substring(0,directoryPath.length-2);
        }
    
        var directoryFoundOn = -1;    
        for(var i=0; i < directoryHistory.length; i++) {
            if(directoryHistory[i].path === directoryPath) {
                directoryHistory[i].collapsed = false;
                directoryFoundOn = i;
            } else {
                directoryHistory[i].collapsed = true;            
            }
        }
        
        // Removes the history only if it is a completely new path
        if(directoryFoundOn >= 0) { 
            var diff1 = directoryHistory.length - (directoryFoundOn+1);
            if(diff1 > 0) {
                directoryHistory.splice(directoryFoundOn+1, diff1);
            }    
        }       
        
        // If directory path not in history then add it to the history
        if(directoryFoundOn < 0) {      
            // var parentLocation = directoryPath.substring(0, directoryPath.lastIndexOf(TSCORE.dirSeparator));
            var parentLocation = TSCORE.TagUtils.extractParentDirectoryPath(directoryPath);
            var parentFound = -1;
            for(var j=0; j < directoryHistory.length; j++) {
                if(directoryHistory[j].path === parentLocation) {
                    parentFound = j;
                } 
            }       
            if(parentFound >= 0) { 
                var diff2 = directoryHistory.length - (parentFound+1);
                if(diff2 > 0) {
                    directoryHistory.splice(parentFound+1, diff2);
                }    
            }  
                    
            var locationTitle = directoryPath.substring(directoryPath.lastIndexOf(TSCORE.dirSeparator)+1,directoryPath.length);
            directoryHistory.push({
                "name": locationTitle,
                "path" : directoryPath,
                "collapsed" : false
            });             
        }    
        console.log("Dir History: "+JSON.stringify(directoryHistory));
        TSCORE.currentPath = directoryPath;
        TSCORE.IO.listDirectory(directoryPath);    
    } 
    
    function initUI() {  
        // Context Menus

        $("body").on("contextmenu click", ".directoryActions", function () {
            TSCORE.hideAllDropDownMenus();
            dir4ContextMenu = $(this).attr("key");
            TSCORE.showContextMenu("#directoryMenu", $(this));
            return false;
        });

        // Context menu for the tags in the file table and the file viewer
        $( "#directoryMenuReloadDirectory" ).click( function() {
            navigateToDirectory(dir4ContextMenu);
        });    
        
        $( "#directoryMenuCreateDirectory" ).click( function() {
            showCreateDirectoryDialog();
        });    
        
        $( "#directoryMenuOpenDirectory" ).click( function() {
            TSCORE.IO.openDirectory(dir4ContextMenu);
        });
    }

    function createLocation() {
        var locationPath = $("#folderLocation").val();        
        TSCORE.Config.createLocation(
            $("#connectionName").val(), 
            locationPath, 
            $("#locationPerspective").val()
            );
        
        // Enable the UI behavior by not empty location list
        $( "#createNewLocation" ).attr("title",$.i18n.t("ns.common:connectNewLocationTooltip")).tooltip( "destroy" );
        $( "#locationName" ).prop('disabled', false);
        $( "#selectLocation" ).prop('disabled', false); 
                        
        initLocations();  
        openLocation(locationPath);                                 
    }

    function editLocation() {
        var $connectionName2 = $("#connectionName2");
        var $folderLocation2 = $("#folderLocation2");
        TSCORE.Config.editLocation(
            $connectionName2.attr("oldName"),
            $connectionName2.val(),
            $folderLocation2.val(),
            $("#locationPerspective2").val()
        );
        initLocations();  
        openLocation($folderLocation2.val());
    }
    
    function selectLocalDirectory() {
       TSCORE.IO.selectDirectory();
       //TSCORE.showDirectoryBrowserDialog("/media");               
    }

    function showLocationEditDialog(name,path) {
        require([
              "text!templates/LocationEditDialog.html"
            ], function(uiTPL) {
                var $dialogLocationEdit = $("#dialogLocationEdit");

                // Check if dialog already created
                if($dialogLocationEdit.length < 1) {
                    var uiTemplate = Handlebars.compile( uiTPL );
                    $("body").append(uiTemplate());

                    if(isWeb) {
                        $("#selectLocalDirectory2").attr("style","visibility: hidden");
                    } else {
                        $("#selectLocalDirectory2").on("click",function(e) {
                            e.preventDefault();
                            selectLocalDirectory();
                        });
                    }

                    $( "#saveLocationButton" ).on("click", function() {
                        editLocation();
                    });  
                    
                    $( "#deleteLocationButton" ).on("click", function() { 
                        showDeleteFolderConnectionDialog();
                    });                                                       
                }

                var $connectionName2 = $("#connectionName2");
                var $folderLocation2 = $("#folderLocation2");
                var $locationPerspective2 = $("#locationPerspective2");

                var selectedPerspectiveId = TSCORE.Config.getLocation(path).perspective;
                    $locationPerspective2.empty();
                    TSCORE.Config.getActivatedPerspectiveExtensions().forEach( function(value) {
                            if (selectedPerspectiveId === value.id) {
                                $locationPerspective2.append($("<option>").attr("selected","selected").text(value.id).val(value.id));
                            } else {
                                $locationPerspective2.append($("<option>").text(value.id).val(value.id));
                            }
                        }
                    );

                $connectionName2.val(name);
                $connectionName2.attr("oldName",name);
                $folderLocation2.val(path);
                $("#dialogLocationEdit").i18n();
                if(isCordova) {
                    $("#folderLocation2").attr("placeholder","e.g.: DCIM/Camera");
                } else if(isWeb) {
                    $("#folderLocation2").attr("placeholder","e.g.: /owncloud/remote.php/webdav/");
                }
                $("#dialogLocationEdit").modal({backdrop: 'static',show: true});
        });     
    } 
    
    function showLocationCreateDialog() {
        require([
              "text!templates/LocationCreateDialog.html"
            ], function(uiTPL) {
                var $dialogCreateFolderConnection = $("#dialogCreateFolderConnection");

                // Check if dialog already created
                if($dialogCreateFolderConnection.length < 1) {
                    var uiTemplate = Handlebars.compile( uiTPL );
                    $("body").append(uiTemplate());

                    if(isWeb) {
                        $("#selectLocalDirectory").attr("style","visibility: hidden");
                    } else {
                        $("#selectLocalDirectory").on("click",function(e) {
                            e.preventDefault();
                            selectLocalDirectory();
                        });
                    }

                    TSCORE.Config.getActivatedPerspectiveExtensions().forEach( function(value) {
                        $("#locationPerspective").append($("<option>").text(value.id).val(value.id));                    
                    });

                    $( "#createFolderConnectionButton" ).on("click", function() {
                        createLocation();
                    });

                }
                $("#connectionName").val("");
                $("#folderLocation").val("");
                $("#dialogCreateFolderConnection").i18n();
                if(isCordova) {
                    $("#folderLocation").attr("placeholder","e.g.: DCIM/Camera");
                } else if(isWeb) {
                    $("#folderLocation").attr("placeholder","e.g.: /owncloud/remote.php/webdav/");
                }
                $("#dialogCreateFolderConnection").modal({backdrop: 'static',show: true});
        });
    }  
    
    function showCreateDirectoryDialog(dirPath) {
        require([
              "text!templates/DirectoryCreateDialog.html"
            ], function(uiTPL) {
                if($("#dialogDirectoryCreate").length < 1) {
                    var uiTemplate = Handlebars.compile( uiTPL );
                    $('body').append(uiTemplate());

                    $( "#createNewDirectoryButton" ).on("click", function() {
                        // TODO validate folder name
                        var bValid = true;
                        //bValid = bValid && checkLength( newDirName, "directory name", 3, 100 );
                        //bValid = bValid && checkRegexp( newDirName, /^[a-z]([0-9a-z_])+$/i, "Directory name may consist of a-z, 0-9, underscores, begin with a letter." );
                        if ( bValid ) {
                            TSCORE.IO.createDirectory($( "#createNewDirectoryButton" ).attr("path")+TSCORE.dirSeparator+$( "#newDirectoryName" ).val());
                        }
                    });
                }
                // TODO remove use dir4ContextMenu
                if(dirPath === undefined) {
                    dirPath = dir4ContextMenu;
                }
                $( "#createNewDirectoryButton" ).attr("path", dirPath);
                $("#newDirectoryName").val("");
                $('#dialogDirectoryCreate').i18n();
                $('#dialogDirectoryCreate').modal({backdrop: 'static',show: true});
        });
    }    
    
    function deleteLocation(name) {
        console.log("Deleting folder connection..");
        TSCORE.Config.deleteLocation(name);
        
        initLocations();
        
        //Opens the first location in the settings after deleting a location  
        if(TSCORE.Config.Settings.tagspacesList.length > 0) {
            openLocation(TSCORE.Config.Settings.tagspacesList[0].path);
        } else {
            closeCurrentLocation();      
        }
    }  

    function closeCurrentLocation() {
        console.log("Closing location..");
        $("#locationName").text($.i18n.t("ns.common:chooseLocation")).attr("title","");
        $("#locationContent").empty(); 
        
        // Clear the footer
        $("#statusBar").empty();
        $("#alternativeNavigator").empty();
        
        
        TSCORE.disableTopToolbar();
        TSCORE.PerspectiveManager.hideAllPerspectives();
    }  

    function showDeleteFolderConnectionDialog() {
        TSCORE.showConfirmDialog(
            $.i18n.t("ns.dialogs:deleteLocationTitleAlert"),
            $.i18n.t("ns.dialogs:deleteLocationContentAlert", { locationName: $("#connectionName2").attr("oldName") }),
            function() {
                 deleteLocation($("#connectionName2").attr("oldName"));
                 $("#dialogLocationEdit").modal('hide');
             }
        );
    }             
    
    function initLocations() {
        console.log("Creating location menu...");
        
        var $connectionList = $( "#connectionsList" ); 
        $connectionList.empty();
        $connectionList.attr("style","overflow-y: auto; max-height: 500px; width: 238px;");
        $connectionList.append($('<li>', {
                class: "dropdown-header",
                "data-i18n": "ns.common:yourLocations"
            })
            .append('<button type="button" class="close">×</button>'));
        $connectionList.append('<li class="divider"></li>');
        var connectionsList = TSCORE.Config.Settings.tagspacesList;
        for (var i=0; i < connectionsList.length; i++) { 
            $connectionList.append(
                $('<li>', {
                    style: "line-height: 45px"
                }).append(
                    $('<button>', { 
                        "title":  connectionsList[i].path,
                        "path":   connectionsList[i].path,
                        "name":   connectionsList[i].name,
                        "text":   " "+connectionsList[i].name,
                        "style":  "width: 180px; text-align: left; border: 0px;",
                        "class":  "btn btn-default"
                        } )
                        .click(function() {
                            openLocation($(this).attr( "path" ));                           
                        })
                        .prepend("<i class='fa fa-bookmark'></i>&nbsp;")
                    )
                    .append(
                        $('<button>', { 
                            type:        "button",
                            "data-i18n": "[title]ns.common:editLocation",
                            location:    connectionsList[i].name,
                            path:        connectionsList[i].path,
                            class:       "btn btn-link pull-right",
                            style:       "margin-right: 5px; margin-top: 5px"
                            } )
                            .append("<i class='fa fa-pencil fa-lg'></i>")
                            .click(function() {
                                console.log("Edit location clicked");
                                showLocationEditDialog($(this).attr("location"),$(this).attr("path"));
                                return false;
                            })
                    )
                );
        }
        
        $( "#createNewLocation" ).click(function() {
            showLocationCreateDialog();         
        });

    }

    // Public API definition
    exports.openLocation               = openLocation;
    exports.closeCurrentLocation       = closeCurrentLocation;
    exports.updateSubDirs              = updateSubDirs;
    exports.initUI                     = initUI;
    exports.initLocations              = initLocations;
    exports.showCreateDirectoryDialog  = showCreateDirectoryDialog;
    exports.navigateToDirectory        = navigateToDirectory;
    
});