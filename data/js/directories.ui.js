/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";

    console.debug("Loading DirectoriesUI...");

    var TSCORE = require("tscore");
    
    var directoryHistory = [];
    
    var dir4ContextMenu = null;
    
    var nameCurrentFavorite = undefined;
    
    function openFavorite(path, title) {
        console.debug("Opening favorite in : "+path+" title: "+title);
    
        document.title = title + " | " + TSCORE.Config.DefaultSettings.appName;
    
        $( "#reloadTagSpace" ).text(title);
        $( "#reloadTagSpace" ).attr("title",path);
        
        // Clears the directory history
        directoryHistory = new Array();
        navigateToDirectory(path);
    }  
    
    // Updates the directory subtree
    function updateSubDirs(dirList) {
        console.debug("Updating subdirs(TSCORE)..."+JSON.stringify(dirList));
    
        // Sort the dirList alphabetically
        dirList.sort(function(a,b) { return a.title.localeCompare(b.title); });
        
        for(var i=0; i < directoryHistory.length; i++) {
            if(directoryHistory[i].key == TSCORE.currentPath) {
                directoryHistory[i]["children"] = new Array();
                for(var j=0; j < dirList.length; j++) {    
                     directoryHistory[i]["children"].push(dirList[j]);
                }
            }
        }
        
        generateDirPath();
        handleDirCollapsion();     
    }
    
    function generateDirPath() {
        console.debug("Generating Directory Path...");
        $("#dirTree").empty();
        $("#dirTree").addClass("accordion")
        for(var i=0; i < directoryHistory.length; i++) {
            $("#dirTree").append($("<div>", { 
                "class":        "accordion-group",   
                "style":        "width: 100%; border: 0px;", 
            })
            
            .append($("<div>", { 
                    "class":    "accordion-heading btn-group",
                    "key":      directoryHistory[i].key, 
                    "style":    "width:99%; margin: 2px; ", // background: url('css/arrow-down.png') no-repeat center bottom; padding-bottom: 5px;
                }
            )

            .append($("<button>", { // Dir toggle button
                        "class":        "btn btn-link",
                        "data-toggle":  "collapse",
                        "data-target":  "#dirButtons"+i,                        
                        "key":          directoryHistory[i].key,
                        "title":        "Toggle Directory",
                        "style":        "width: 15%;",
                    }  
                )
                .html("<i class='icon-folder-open-alt'></i>")   
            )// End dir toggle button  
            
            .append($("<button>", { // Dir main button
                        "class":        "btn btn-link btn-small",
                        "key":          directoryHistory[i].key,
                        "title":        "Change Direoctory to: "+directoryHistory[i].key,
                        "text":         directoryHistory[i].title,
                        "style":        "text-align: left; width:65%;",
                    }  
                )
                .click(function() {
                        navigateToDirectory($(this).attr("key"));
                    }
                )                                
                .droppable({
                        accept: '.fileTitleButton',
                        hoverClass: "btn-info",
                        drop: function( event, ui ) {
                            var filePath = ui.draggable.attr("filepath");
                            var fileName = TSCORE.TagUtils.extractFileName(filePath);
                            var targetDir = $(this).attr("key");
                            console.log("Moving file: "+filePath+" to "+targetDir);
                            TSCORE.IO.renameFile(filePath, targetDir+TSCORE.TagUtils.DIR_SEPARATOR+fileName);
                            $(ui.helper).remove(); 
                        }                  
                    }
                )
            )// End dir main button  
            
            .append($("<button>", {
                    "class":        "btn btn-link",
                    "key":          directoryHistory[i].key, 
                    "title":        "Directory Options", 
                    "style":        "width:20%",                   
            })              
            .dropdown( 'attach' , '#directoryMenu' )
            .append("<b class='icon-reorder'>")
            .click( function(event) {
                dir4ContextMenu = $(this).attr("key");
            })) // end gear    
                    
            ) // end heading
            
            .append($("<div>", { 
                "class": "accordion-body collapse in",
                "id": "dirButtons"+i,
                "style": "margin: 0px 3px 3px 3px; border: 0px;"
            })          
            .append($("<div>", { 
                "class": "accordion-inner",
                "id": "dirButtonsContent"+i,
                "style": "padding: 2px; border: 0px;",
            })
            ) // end accordion-inner    
            ) // end accordion button        

            ); // end group

            var dirButtons = $("<div>").appendTo( "#dirButtonsContent"+i );  
            if(directoryHistory[i]["children"].length <= 0) {
                    dirButtons.append("<div class='alert alert-info'><strong>Info:</strong> No subfolders found.</div>");          
            } else {
                for(var j=0; j < directoryHistory[i]["children"].length; j++) {                    
                    if (TSCORE.Config.getShowUnixHiddenEntries() || 
                            (!TSCORE.Config.getShowUnixHiddenEntries() && (directoryHistory[i]["children"][j].title.indexOf(".") != 0))) {
                        dirButtons.append($("<button>", { 
                            "class":    "btn btn-warning btn-small", 
                            "key":      directoryHistory[i]["children"][j].key,
                            "title":    directoryHistory[i]["children"][j].key,
                            "style":    "margin: 1px"
                        })
                        .droppable({
                            accept: ".fileTitleButton",
                            hoverClass: "btn-info",
                            drop: function( event, ui ) {
                                var filePath = ui.draggable.attr("filepath");
                                var fileName = TSCORE.TagUtils.extractFileName(filePath);
                                var targetDir = $(this).attr("key");
                                console.log("Moving file: "+filePath+" to "+targetDir);
                                TSCORE.IO.renameFile(filePath, targetDir+TSCORE.TagUtils.DIR_SEPARATOR+fileName);
                                $(ui.helper).remove();                                
                            }                   
                        })
                        .html("<i class='icon-folder-close-alt'></i> "+directoryHistory[i]["children"][j].title)            
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
        $("#dirTree").find(".accordion-heading").each(function(index) {
            var key = $(this).attr("key");
            console.log("Entered Header for: "+key);
            if(getDirectoryCollapsed(key)) {
                $(this).find("i").removeClass("icon-folder-open-alt");
                $(this).find("i").addClass("icon-folder-close-alt");          
                $(this).next().removeClass("in");
                $(this).next().addClass("out");
            } else {
                $(this).find("i").removeClass("icon-folder-close-alt");
                $(this).find("i").addClass("icon-folder-open-alt");          
                $(this).next().removeClass("out");
                $(this).next().addClass("in");
            }
        });
    }
    
    function getDirectoryCollapsed(directoryPath) {
        for(var i=0; i < directoryHistory.length; i++) {
            if(directoryHistory[i].key == directoryPath) {
                return directoryHistory[i].collapsed;
            }
        }
    }
    
    function setDirectoryCollapse(directoryPath, collapsed) {
        for(var i=0; i < directoryHistory.length; i++) {
            if(directoryHistory[i].key == directoryPath) {
                directoryHistory[i].collapsed = collapsed;
            }
        }
    }
    
    function navigateToDirectory(directoryPath) {
        console.log("Navigating to directory: "+directoryPath);
    
        // Cleaning the directory path from \\ \ and / 
        if( (directoryPath.lastIndexOf('/')+1 == directoryPath.length) || (directoryPath.lastIndexOf('\\')+1 == directoryPath.length)) {
            directoryPath = directoryPath.substring(0,directoryPath.length-1);
        }
        if( (directoryPath.lastIndexOf('\\\\')+1 == directoryPath.length)) {
            directoryPath = directoryPath.substring(0,directoryPath.length-2);
        }
    
        var directoryFoundOn = -1;    
        for(var i=0; i < directoryHistory.length; i++) {
            if(directoryHistory[i].key == directoryPath) {
                directoryHistory[i].collapsed = false;
                directoryFoundOn = i;
            } else {
                directoryHistory[i].collapsed = true;            
            }
        }
        
        // Removes the history only if it is a completely new path
        if(directoryFoundOn >= 0) { 
            var diff = directoryHistory.length - (directoryFoundOn+1);
            if(diff > 0) {
                directoryHistory.splice(directoryFoundOn+1, diff);
            }    
        }       
        
        // If directory path not in history then add it to the history
        if(directoryFoundOn < 0) {      
            var parentLocation = directoryPath.substring(0, directoryPath.lastIndexOf(TSCORE.TagUtils.DIR_SEPARATOR));
            var parentFound = -1;
            for(var i=0; i < directoryHistory.length; i++) {
                if(directoryHistory[i].key == parentLocation) {
                    parentFound = i;
                } 
            }       
            if(parentFound >= 0) { 
                var diff = directoryHistory.length - (parentFound+1);
                if(diff > 0) {
                    directoryHistory.splice(parentFound+1, diff);
                }    
            }  
                    
            var locationTitle = directoryPath.substring(directoryPath.lastIndexOf(TSCORE.TagUtils.DIR_SEPARATOR)+1,directoryPath.length);
            directoryHistory.push({
                "title": locationTitle,
                "key" : directoryPath,
                "collapsed" : false,
            });             
        }    
    
        TSCORE.currentPath = directoryPath;
        TSCORE.IO.getSubdirs(directoryPath);
        TSCORE.IO.listDirectory(directoryPath);    
    } 
    
    function initButtons() {
        $( "#selectTagSpace" ).click(function() {
                //$("#favoritesList").width($( "#reloadTagSpace" ).width()+$("#selectTagSpace").width());
                $("#favoritesList").show().position({
                    my: "left top",
                    at: "left bottom",
                    of: $( "#reloadTagSpace" )
                });
                return false;
        })   
                        
        $( "#selectTagSpace" ).tooltip();
    
        $( "#selectLocalDirectory" ).click(function() {
            TSCORE.IO.selectDirectory();
            return false;
        })    
    }
    
    
    function initContextMenus() {    
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
    
    function showCreateDirectoryDialog() {
        $("#newDirectoryName").val("");
        $('#dialogDirectoryCreate').modal({show: true});        
    }
    
    function initDialogs() {
        $( "#createNewDirectoryButton" ).click( function() {
            var bValid = true;

            //bValid = bValid && checkLength( newDirName, "directory name", 3, 100 );

            //bValid = bValid && checkRegexp( newDirName, /^[a-z]([0-9a-z_])+$/i, "Directory name may consist of a-z, 0-9, underscores, begin with a letter." );
            // From jquery.validate.js (by joern), contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
            // bValid = bValid && checkRegexp( email, /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i, "eg. ui@jquery.com" );
            // bValid = bValid && checkRegexp( password, /^([0-9a-zA-Z])+$/, "Password field only allow : a-z 0-9" );
            if ( bValid ) {
                TSCORE.IO.createDirectory(dir4ContextMenu+TSCORE.TagUtils.DIR_SEPARATOR+$( "#newDirectoryName" ).val());
                navigateToDirectory(dir4ContextMenu);
            }
        });  
        
        $( "#createFolderConnectionButton" ).click( function() {                
            TSCORE.Config.createFavorite($("#connectionName").val(), $("#folderLocation").val());
            initFavorites();  
            openFavorite(TSCORE.Config.Settings["tagspacesList"][0].path, TSCORE.Config.Settings["tagspacesList"][0].name);                                 
        });  
    }
    
    function showCreateFolderConnectionDialog() {
        $("#connectionName").val("");
        $("#folderLocation").val("");
        $('#dialogCreateFolderConnection').modal({show: true});
    }  
    
    function deleteFolderConnection() {
        console.debug("Deleting folder connection..");
        TSCORE.Config.deleteFavorite(nameCurrentFavorite);
        initFavorites();  
        if(TSCORE.Config.Settings["tagspacesList"][0] != undefined) {
        	openFavorite(TSCORE.Config.Settings["tagspacesList"][0].path, TSCORE.Config.Settings["tagspacesList"][0].name);        	
        }                               				
    }  

    function showDeleteFolderConnectionDialog() {
		TSCORE.showConfirmDialog(
			"Delete connection to folder",
			"Do you want to delete this connection to a folder?",
			deleteFolderConnection
		)
    }             
    
    function initFavorites() {
        console.debug("Creating location menu...");
        
        $( "#favoritesList" ).empty();
        var favoritesList = TSCORE.Config.Settings["tagspacesList"]
        for (var i=0; i < favoritesList.length; i++) { 
              $( "#favoritesList" ).append(
                    $('<li>', {}).append(
                        $('<a>', { 
                            href: "#",
                            title: favoritesList[i].path, 
                            name: favoritesList[i].name
                            } )
                        .click(function() {
                            nameCurrentFavorite = $(this).attr( "name" );
                            openFavorite($(this).attr( "title" ), $(this).attr( "name" ));                           
                        })
                        .append("<i class='icon-bookmark'></i>")
                        .append(" "+favoritesList[i].name)                         
                        ));
        };
        $( "#favoritesList" ).append('<li class="divider"></li>');    
        $( "#favoritesList" ).append('<li id="createNewLocation"><a href="#"><i class="icon-bookmark-empty"></i> New Location</a></li>');
        $( "#favoritesList" ).append('<li id="deleteFavorite"><a href="#"><i class="icon-trash"></i> Remove Location</a></li>');
       
        $( "#createNewLocation" ).click(function() {
            showCreateFolderConnectionDialog();         
        });
        
        $( "#deleteFavorite" ).click(function() {
            showDeleteFolderConnectionDialog();
        }); 
    }

    // Public API definition
    exports.openFavorite               = openFavorite;
    exports.updateSubDirs              = updateSubDirs;
    exports.initDialogs                = initDialogs;
    exports.initButtons                = initButtons;
    exports.initContextMenus           = initContextMenus;
    exports.initFavorites              = initFavorites;
    exports.showCreateDirectoryDialog  = showCreateDirectoryDialog;
    
});