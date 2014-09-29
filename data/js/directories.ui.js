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

    var tsMetadataFolder = ".ts";
    var tsMetadataFile = "tsm.json";

    var alternativeDirectoryNavigatorTmpl = Handlebars.compile(
//        '<i class="fa fa-home"></i>&nbsp;' +
        '{{#each dirHistory}}'+
        '<div class="btn-group dropup">'+
            '<button class="btn btn-link dropdown-toggle" data-menu="{{@index}}">'+
                '{{name}}&nbsp;&nbsp;<i class="fa fa-caret-right"></i>&nbsp;' +
            '</button>'+
            '<div class="dropdown clearfix dirAltNavMenu" id="dirMenu{{@index}}">'+
                '<ul style="overflow-y: auto; max-height: 430px; width: 250px; padding: 5px; display: block;" role="menu" class="dropdown-menu">'+
                    '<li class="dropdown-header">{{../actionsForDirectory}}&nbsp;"{{name}}"<button type="button" class="close">×</button></li>'+
                    '<li><a class="btn btn-link pull-left reloadCurrentDirectory" data-path="{{path}}"><i class="fa fa-refresh fa-fw"></i>&nbsp;{{../reloadCurrentDirectory}}</a></li>'+
                    '<li class="notreadonly"><a class="btn btn-link pull-left createSubdirectory" data-path="{{path}}"><i class="fa fa-folder-o fa-fw"></i>&nbsp;{{../createSubdirectory}}</a></li>'+
                    '<li class="notreadonly"><a class="btn btn-link pull-left renameDirectory" data-path="{{path}}"><i class="fa fa-paragraph fa-fw"></i>&nbsp;{{../renameDirectory}}</a></li>'+
                    '<li class="divider" style="width: 100%"></li>'+
                    '<li class="dropdown-header">{{../subfodersOfDirectory}}&nbsp;"{{name}}"</li>'+
                    '{{#if children}}'+
                    '{{#each children}}'+
                    '<button class="btn dirButton" data-path="{{path}}" title="{{path}}" style="margin: 1px;">'+
                    '<i class="fa fa-folder-o"></i>&nbsp;{{name}}</button>'+
                    '{{/each}}'+
                    '{{else}}'+
                    '<div>{{../../noSubfoldersFound}}</div>'+
                    '{{/if}}'+
                '</ul>'+
            '</div>'+
        '</div>'+
        '{{/each}}'
    );

    var mainDirectoryNavigatorTmpl = Handlebars.compile(
        '<div>{{#each dirHistory}}'+
        '<div class="accordion-group disableTextSelection" style="width: 99%; border: 0px #aaa solid;">'+
            '<div class="accordion-heading btn-group" key="{{path}}" style="width:100%; margin: 0; ">'+
                '<button class="btn btn-link btn-lg directoryIcon" data-toggle="collapse" data-target="#dirButtons{{@index}}" key="{{path}}" title="{{../toggleDirectory}}">'+
                    '<i class="fa fa-folder fa-fw"></i>'+
                '</button>'+
                '<button class="btn btn-link directoryTitle ui-droppable" key="{{path}}" title="{{path}}">{{name}}</button>'+
                '<button class="btn btn-link btn-lg directoryActions" key="{{path}}" title="{{../directoryOperations}}">'+
                    '<b class="fa fa-ellipsis-v"></b>'+
                '</button>'+
            '</div>'+
            '<div class="accordion-body collapse in" id="dirButtons{{@index}}">'+
                '<div class="accordion-inner" id="dirButtonsContent{{@index}}" style="padding: 4px;">'+
                    '{{#if children}}'+
                    '<div>{{#each children}}'+
                        '<button class="btn btn-sm dirButton ui-droppable" key="{{path}}" title="{{path}}" style="margin: 1px;">'+
                            '<i class="fa fa-folder-o"></i>&nbsp;{{name}}</button>'+
                    '{{/each}}</div>'+
                    '{{else}}'+
                        '<div>{{../../noSubfoldersFound}}</div>'+
                    '{{/if}}'+
                '</div>'+
            '</div>'+
        '</div>'+
        '{{/each}}</div>'
    );

    var locationChooserTmpl = Handlebars.compile(
        '<li class="dropdown-header" data-i18n="ns.common:yourLocations">{{yourLocations}} '+
            '<button type="button" class="close">×</button>'+
        '</li>'+
        '<li class="divider" ></li>'+
        '{{#each locations}}'+
        '<li style="line-height: 45px">'+
            '<button title="{{path}}" path="{{path}}" name="{{name}}" style="width: 180px; text-align: left; border: 0;" class="btn btn-default">'+
                '<i class="fa fa-bookmark"></i>&nbsp;{{name}}' +
            '</button>'+
            '<button type="button" data-i18n="[title]ns.common:editLocation" title="{{editLocationTitle}}" location="{{name}}" path="{{path}}" class="btn btn-link pull-right" style="margin-right: 5px; margin-top: 5px">'+
                '<i class="fa fa-pencil fa-lg"></i>'+
            '</button>'+
        '</li>'+
        '{{/each}}'
    );

    function openLocation(path) {
        console.log("Opening location in : "+path);

        if(TSCORE.Config.getLoadLocationMeta()) {
            loadFolderMetaData(path);
        }

        TSCORE.currentLocationObject = TSCORE.Config.getLocation(path);
        if(TSCORE.currentLocationObject != undefined) {
            document.title = TSCORE.currentLocationObject.name + " | " + TSCORE.Config.DefaultSettings.appName;

            $( "#locationName" ).text(TSCORE.currentLocationObject.name).attr("title",path);

            // Handle open default perspective for a location
            var defaultPerspective = TSCORE.currentLocationObject.perspective;
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

    function loadFolderMetaData(path) {
        var metadataPath;
        if(isWeb) {
            metadataPath = path+TSCORE.dirSeparator+tsMetadataFolder+TSCORE.dirSeparator+tsMetadataFile;
        } else {
            metadataPath = "file://"+path+TSCORE.dirSeparator+tsMetadataFolder+TSCORE.dirSeparator+tsMetadataFile;
        }

        require(["text!"+metadataPath], function(jsonFile) {
            if(jsonFile !== null && jsonFile !== undefined && jsonFile !== "" ) {
                var metadata = JSON.parse(jsonFile);
                //console.log("Location Metadata: "+JSON.stringify(metadata));

                if(metadata.tagGroups.length > 0) {
                    TSCORE.locationTags = metadata.tagGroups;
                    TSCORE.generateTagGroups();
                }
            }
        });
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
                         if (TSCORE.Config.getShowUnixHiddenEntries() || (!TSCORE.Config.getShowUnixHiddenEntries() && (dirList[j].name.indexOf(".") !== 0))) {
                             directoryHistory[i].children.push(dirList[j]);
                             hasSubFolders = true;
                         }
                     }
                }
                // Sort the dirList alphabetically
                directoryHistory[i].children.sort(function(a,b) { return a.name.localeCompare(b.name); });
            }
        }

        generateDirPath();
        generateAlternativeDirPath();
        handleDirCollapsion();     
    }

    function generateAlternativeDirPath() {
        console.log("Generating Alternative Directory Path...");
        var $alternativeNavigator = $("#alternativeNavigator");

        $alternativeNavigator.children().remove();
        $alternativeNavigator.html(alternativeDirectoryNavigatorTmpl({
            "dirHistory":directoryHistory,
            "actionsForDirectory":$.i18n.t("ns.common:actionsForDirectory2"),
            "subfodersOfDirectory":$.i18n.t("ns.common:subfodersOfDirectory2"),
            "noSubfoldersFound":$.i18n.t("ns.common:noSubfoldersFound"),
            "reloadCurrentDirectory":$.i18n.t("ns.common:reloadCurrentDirectory"),
            "createSubdirectory":$.i18n.t("ns.common:createSubdirectory"),
            "renameDirectory":$.i18n.t("ns.common:renameDirectory")
        }));

        $alternativeNavigator.find(".reloadCurrentDirectory").each(function() {
            $(this).on("click", function () {
                navigateToDirectory($(this).attr("data-path"))
            })
        });

        $alternativeNavigator.find(".createSubdirectory").each(function() {
            $(this).on("click", function () {
                showCreateDirectoryDialog($(this).attr("data-path"))
            })
        });

        $alternativeNavigator.find(".renameDirectory").each(function() {
            $(this).on("click", function () {
                showRenameDirectoryDialog($(this).attr("data-path"))
            })
        });

        $alternativeNavigator.find(".dropdown-toggle").each(function() {
            $(this).on("contextmenu click", function () {
                TSCORE.hideAllDropDownMenus();
                showDropUp("#dirMenu"+$(this).attr("data-menu"), $(this));
                return false;
            })
        });

        $alternativeNavigator.find(".close").each(function() {
            $(this).click(function() {
                TSCORE.hideAllDropDownMenus();
            })
        });

        $alternativeNavigator.find(".dirButton").each(function() {
            $(this).click(function () {
                navigateToDirectory($(this).attr("data-path"));
            })
        });
    }

    var showDropUp = function(menuId, sourceObject) {
        var $menu = $(menuId);
        var leftPos = 0;
        var topPos = -$menu.height();

        if (sourceObject.offset().left+300 > window.innerWidth) {
            leftPos = -200+sourceObject.width();
        }
        //console.log(leftPos+" "+sourceObject.offset().left+" "+$menu.width()+" "+window.innerWidth);

        $menu.css({
            display: "block",
            left:  leftPos+"px",
            top: topPos
        });
    };

    function generateDirPath() {
        console.log("Generating Directory Path...");
        var $locationContent = $("#locationContent");
        $locationContent.children().remove();

        $locationContent.html(mainDirectoryNavigatorTmpl({
            "dirHistory":directoryHistory,
            "noSubfoldersFound":$.i18n.t("ns.common:noSubfoldersFound"),
            "toggleDirectory":$.i18n.t("ns.common:toggleDirectory"),
            "directoryOperations":$.i18n.t("ns.common:directoryOperations")
        }));

        $locationContent.find(".directoryTitle").each(function() {
            $(this)
            .click(function () {
                navigateToDirectory($(this).attr("key"));
            })
            .droppable({
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
            })
        });

        $locationContent.find(".dirButton").each(function() {
            $(this)
            .click(function () {
                navigateToDirectory($(this).attr("key"));
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
        });
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
                "path": directoryPath,
                "collapsed": false
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
            showCreateDirectoryDialog(dir4ContextMenu);
        });

        $( "#directoryMenuRenameDirectory" ).click( function() {
            showRenameDirectoryDialog(dir4ContextMenu);
        });

        $( "#directoryMenuDeleteDirectory" ).click( function() {
            TSCORE.showConfirmDialog(
                $.i18n.t("ns.dialogs:deleteDirectoryTitleConfirm"),
                $.i18n.t("ns.dialogs:deleteDirectoryContentConfirm", { dirPath: dir4ContextMenu }),
                function() {
                    TSCORE.IO.deleteDirectory(dir4ContextMenu);
                }
            );
        });

        $( "#directoryMenuOpenDirectory" ).click( function() {
            TSCORE.IO.openDirectory(dir4ContextMenu);
        });

        $( "#createNewLocation" ).click(function() {
            showLocationCreateDialog();
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
                    $locationPerspective2.children().remove();
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

                $("#formLocationEdit").validator();
                $('#formLocationEdit').on('invalid.bs.validator', function() {
                    $( "#saveLocationButton").prop( "disabled", true );
                });
                $('#formLocationEdit').on('valid.bs.validator', function() {
                    $( "#saveLocationButton").prop( "disabled", false );
                });

                $('#dialogLocationEdit').on('shown.bs.modal', function () {
                  $('#folderLocation2').focus();
                });

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

                $("#formLocationCreate").validator();
                $('#formLocationCreate').on('invalid.bs.validator', function() {
                    $( "#createFolderConnectionButton").prop( "disabled", true );
                });
                $('#formLocationCreate').on('valid.bs.validator', function() {
                    $( "#createFolderConnectionButton").prop( "disabled", false );
                });

                $('#dialogCreateFolderConnection').on('shown.bs.modal', function () {
                  $('#folderLocation').focus();
                });

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
                        TSCORE.IO.createDirectory($( "#createNewDirectoryButton" ).attr("path")+TSCORE.dirSeparator+$( "#newDirectoryName" ).val());
                    });
                }
                $( "#createNewDirectoryButton" ).attr("path", dirPath);
                $("#newDirectoryName").val("");
                $('#dialogDirectoryCreate').i18n();

                $("#formDirectoryCreate").validator();
                $('#formDirectoryCreate').on('invalid.bs.validator', function() {
                    $( "#createNewDirectoryButton").prop( "disabled", true );
                });
                $('#formDirectoryCreate').on('valid.bs.validator', function() {
                    $( "#createNewDirectoryButton").prop( "disabled", false );
                });

                $('#dialogDirectoryCreate').on('shown.bs.modal', function () {
                  $('#newDirectoryName').focus();
                });

                $('#dialogDirectoryCreate').modal({backdrop: 'static',show: true});
        });
    }

    function showRenameDirectoryDialog(dirPath) {
        require([
            "text!templates/DirectoryRenameDialog.html"
        ], function(uiTPL) {
            if($("#dialogDirectoryRename").length < 1) {
                var uiTemplate = Handlebars.compile( uiTPL );
                $('body').append(uiTemplate());

                $( "#renameDirectoryButton" ).on("click", function() {
                    TSCORE.IO.renameDirectory($( "#renameDirectoryButton" ).attr("path"), $( "#directoryNewName" ).val());
                });
            }

            $("#formDirectoryRename").validator();
            $('#formDirectoryRename').on('invalid.bs.validator', function() {
                $( "#renameDirectoryButton").prop( "disabled", true );
            });
            $('#formDirectoryRename').on('valid.bs.validator', function() {
                $( "#renameDirectoryButton").prop( "disabled", false );
            });

            $( "#renameDirectoryButton" ).attr("path", dirPath);
            var dirName = TSCORE.TagUtils.extractDirectoryName(dirPath);
            $("#directoryNewName").val(dirName);
            $('#dialogDirectoryRename').i18n();

            $('#dialogDirectoryRename').on('shown.bs.modal', function () {
              $('#directoryNewName').focus();
            });

            $('#dialogDirectoryRename').modal({backdrop: 'static',show: true});
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
        $("#locationContent").children().remove();
        
        // Clear the footer
        $("#statusBar").children().remove();
        $("#alternativeNavigator").children().remove();
        
        
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
        
        var $locationsList = $( "#locationsList" );
        $locationsList.children().remove();

        $locationsList.html(locationChooserTmpl({
            "locations":TSCORE.Config.Settings.tagspacesList,
            "yourLocations":$.i18n.t("ns.common:yourLocations"),
            "editLocationTitle":$.i18n.t("ns.common:editLocation")
        }));

        $locationsList.find(".btn-default").each(function() {
            $(this).on("click", function () {
                openLocation($(this).attr( "path" ));
            })
        });

        $locationsList.find(".btn-link").each(function() {
            $(this).on("click", function () {
                console.log("Edit location clicked");
                showLocationEditDialog($(this).attr("location"),$(this).attr("path"));
                return false;
            })
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
