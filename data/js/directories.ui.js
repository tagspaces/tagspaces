/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
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
        
        document.title = currentLocation.name + " | " + TSCORE.Config.DefaultSettings.appName;
    
        $( "#locationName" ).text(currentLocation.name);
        $( "#locationName" ).attr("title",path);            

        // Open the directory locations panel
        TSCORE.showLocationsPanel();
        
        // Clears the directory history
        directoryHistory = new Array();
        navigateToDirectory(path);

        // Handle open default perspective for a location
        var defaultPerspective = currentLocation.perspective;
        if(defaultPerspective != undefined) {
            TSCORE.PerspectiveManager.changePerspective(defaultPerspective);
        }
    }  
    
    // Updates the directory subtree
    function updateSubDirs(dirList) {
        //console.log("Updating subdirs(TSCORE)..."+JSON.stringify(dirList));
        
        for(var i=0; i < directoryHistory.length; i++) {
            if(directoryHistory[i].path == TSCORE.currentPath) {
                directoryHistory[i]["children"] = new Array();
                for(var j=0; j < dirList.length; j++) {
                	 if(!dirList[j].isFile) {
                     	directoryHistory[i]["children"].push(dirList[j]);                	 	
                	 }  
                }
		        // Sort the dirList alphabetically
		        directoryHistory[i]["children"].sort(function(a,b) { return a.name.localeCompare(b.name); });
            }
        }
        
        generateDirPath();
        handleDirCollapsion();     
    }
    
    function generateDirPath() {
        console.log("Generating Directory Path...");
        $("#locationContent").empty();
        $("#locationContent").addClass("accordion");
        for(var i=0; i < directoryHistory.length; i++) {
            $("#locationContent").append($("<div>", { 
                "class":        "accordion-group disableTextSelection",   
                "style":        "width: 99%; border: 0px #aaa solid;", 
            })
            
            .append($("<div>", { 
                    "class":    "accordion-heading btn-group",
                    "key":      directoryHistory[i].path, 
                    "style":    "width:100%; margin: 0px; ",
                }
            )

            .append($("<button>", { // Dir toggle button
                        "class":        "btn btn-link directoryIcon",
                        "data-toggle":  "collapse",
                        "data-target":  "#dirButtons"+i,                        
                        "key":          directoryHistory[i].path,
                        "title":        "Toggle Directory",
                    }  
                )
                .html("<i class='fa fa-folder-open'></i>")   
            )// End dir toggle button  
            
            .append($("<button>", { // Dir main button
                        "class":        "btn btn-link btn-sm directoryTitle",
                        "key":          directoryHistory[i].path,
                        "title":        "Change Direoctory to: "+directoryHistory[i].path,
                        "text":         directoryHistory[i].name,
                    }  
                )
                .click(function() {
                        navigateToDirectory($(this).attr("key"));
                    }
                )                                
                .droppable({
                        greedy: "true",                    
                        accept: '.fileTitleButton,.fileTile',
                        hoverClass: "dropOnFolder",
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
                    "class":        "btn btn-link directoryActions",
                    "key":          directoryHistory[i].path, 
                    "title":        "Directory Options", 
            })                       
            //.dropdown( 'attach' , '#directoryMenu' )
            .append("<b class='fa fa-ellipsis-v'>")
            ) // end gear    
                    
            ) // end heading
            
            .append($("<div>", { 
                "class":    "accordion-body collapse in",
                "id":       "dirButtons"+i,
                "style":    "margin: 0px 0px 0px 3px; border: 0px;"
            })          
            .append($("<div>", { 
                "class":    "accordion-inner",
                "id":       "dirButtonsContent"+i,
                "style":    "padding: 2px; border: 0px;",
            })
            ) // end accordion-inner    
            ) // end accordion button        

            ); // end group

            var dirButtons = $("<div>").appendTo( "#dirButtonsContent"+i );  
            if(directoryHistory[i]["children"].length <= 0) {
                    dirButtons.append("<div class='alert'><strong> No subfolders found</strong></div>");          
            } else {
                for(var j=0; j < directoryHistory[i]["children"].length; j++) {                    
                    if (TSCORE.Config.getShowUnixHiddenEntries() || 
                            (!TSCORE.Config.getShowUnixHiddenEntries() && (directoryHistory[i]["children"][j].name.indexOf(".") != 0))) {
                        dirButtons.append($("<button>", { 
                            "class":    "btn btn-sm dirButton", 
                            "key":      directoryHistory[i]["children"][j].path,
                            "title":    directoryHistory[i]["children"][j].path,
                            "style":    "margin: 1px;",
                            "text":     " "+directoryHistory[i]["children"][j].name
                        })
                        .droppable({
                            greedy: "true",
                            accept: ".fileTitleButton,.fileTile",
                            hoverClass: "dropOnFolder",
                            drop: function( event, ui ) {
                                // Fixing issue with dropping on stacked/overlapped directories
                                if( $(this).parent().parent().parent().hasClass("in") ) {
                                    var filePath = ui.draggable.attr("filepath");
                                    var fileName = TSCORE.TagUtils.extractFileName(filePath);
                                    var targetDir = $(this).attr("key");
                                    console.log("Moving file: "+filePath+" to "+targetDir);
                                    TSCORE.IO.renameFile(filePath, targetDir+TSCORE.TagUtils.DIR_SEPARATOR+fileName);
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
        $("#locationContent").find(".accordion-heading").each(function(index) {
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
            if(directoryHistory[i].path == directoryPath) {
                return directoryHistory[i].collapsed;
            }
        }
    }
    
    function setDirectoryCollapse(directoryPath, collapsed) {
        for(var i=0; i < directoryHistory.length; i++) {
            if(directoryHistory[i].path == directoryPath) {
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
            if(directoryHistory[i].path == directoryPath) {
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
                if(directoryHistory[i].path == parentLocation) {
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
                "name": locationTitle,
                "path" : directoryPath,
                "collapsed" : false,
            });             
        }    
    
        TSCORE.currentPath = directoryPath;
        TSCORE.IO.listDirectory(directoryPath);    
    } 
    
    function initUI() {  
		// Context Menus
		
	    $("body").on("contextmenu click", ".directoryActions", function (e) {
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
        $( "#createNewLocation" ).attr("title", "Connect New Location");
        $( "#createNewLocation" ).removeClass("createFirstLocation");
        $( "#createNewLocation" ).tooltip( "destroy" );             
        $( "#locationName" ).prop('disabled', false);
        $( "#selectLocation" ).prop('disabled', false); 
                        
        initConnections();  
        openLocation(locationPath);                                 
    }

    function editLocation() {
        TSCORE.Config.editLocation(
             $("#connectionName2").attr("oldName"), 
             $("#connectionName2").val(), 
             $("#folderLocation2").val(),
             $("#locationPerspective2").val()
        );
        initConnections();  
        openLocation($("#folderLocation2").val());                                         
    }

    function showLocationEditDialog(name,path) {
        require([
              "text!templates/LocationEditDialog.html",
            ], function(uiTPL) {
                // Check if dialog already created
                if($("#dialogLocationEdit").length < 1) {
                    var uiTemplate = Handlebars.compile( uiTPL );
                    $("body").append(uiTemplate()); 
                                    
                    $("#selectLocalDirectory2").on("click",function(e) {
                        e.preventDefault();
                        TSCORE.IO.selectDirectory();
                    }); 
                    
                    
                    $( "#saveLocationButton" ).on("click", function() {        
                        editLocation();
                    });  
                    
                    $( "#deleteLocationButton" ).on("click", function() { 
                        $("#dialogLocationEdit").modal("hide");
                        showDeleteFolderConnectionDialog();
                    });                                                       
                }

                var selectedPerspectiveId = TSCORE.Config.getLocation(path).perspective;
                $("#locationPerspective2").empty();
                TSCORE.Config.getActivatedPerspectiveExtensions().forEach( function(value) {
                        if (selectedPerspectiveId == value.id) { 
                            $("#locationPerspective2").append($("<option>").attr("selected","selected").text(value.id).val(value.id));                
                        } else {
                            $("#locationPerspective2").append($("<option>").text(value.id).val(value.id));                    
                        }    
                    }            
                );    

                $("#connectionName2").val(name);
                $("#connectionName2").attr("oldName",name);
                $("#folderLocation2").val(path);
                $("#dialogLocationEdit").modal({show: true});
        });     
    } 
    
    function showLocationCreateDialog() {
		require([
	          "text!templates/LocationCreateDialog.html",
		    ], function(uiTPL) {
                // Check if dialog already created
		     	if($("#dialogCreateFolderConnection").length < 1) {
		            var uiTemplate = Handlebars.compile( uiTPL );
			     	$("body").append(uiTemplate());	
			     		            
			        $("#selectLocalDirectory").on("click",function(e) {
			            e.preventDefault();
			            TSCORE.IO.selectDirectory();
			        }); 	
			        
                    TSCORE.Config.getActivatedPerspectiveExtensions().forEach( function(value) {
                        $("#locationPerspective").append($("<option>").text(value.id).val(value.id));                    
                    });			        
			        
			        $( "#createFolderConnectionButton" ).on("click", function() { 
			            createLocation();
			        }); 
            			        
                    if(isCordova) {
                        //$("#selectLocalDirectory").hide();		
                        $("#folderLocation").attr("placeholder","Example: DCIM/Camera");	         			        	     		
                    }
		     	}
		        $("#connectionName").val("");
		        $("#folderLocation").val("");
		        $("#dialogCreateFolderConnection").modal({show: true});
		});    	
    }  
    
    function showCreateDirectoryDialog() {
		require([
	          "text!templates/DirectoryCreateDialog.html",
		    ], function(uiTPL) {
		     	if($("#dialogDirectoryCreate").length < 1) {		    	
		            var uiTemplate = Handlebars.compile( uiTPL );
			     	$('body').append(uiTemplate());		
			     	
			        $( "#createNewDirectoryButton" ).on("click", function() {			
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
		     	}
		        $("#newDirectoryName").val("");
		        $('#dialogDirectoryCreate').modal({show: true});        
		});
    }    
    
    function deleteLocation(name) {
        console.log("Deleting folder connection..");
        TSCORE.Config.deleteLocation(name);
        
        initConnections();
        
        //Opens the first location in the settings after deleting a location  
        if(TSCORE.Config.Settings["tagspacesList"].length > 0) {
        	openLocation(TSCORE.Config.Settings["tagspacesList"][0].path);        	
        } else {
            closeCurrentLocation();      
        }                              				
    }  

    function closeCurrentLocation() {
        console.log("Closing location..");
        $("#locationName").text("Choose Location");
        $("#locationName").attr("title","");         
        $("#locationContent").empty(); 
    }  

    function showDeleteFolderConnectionDialog(name) {
		TSCORE.showConfirmDialog(
			"Delete connection to folder",
			"Do you want to delete the connection "+$("#connectionName2").attr("oldName")+"?",
			function() {
			     deleteLocation($("#connectionName2").attr("oldName"));
			 }
		);
    }             
    
    function initConnections() {
        console.log("Creating location menu...");
        
        var $connectionList = $( "#connectionsList" ); 
        $connectionList.empty();
        $connectionList.attr("style","overflow-y: auto; max-height: 500px; width: 238px;");
        $connectionList.append('<li class="dropdown-header"><span id="">Your Locations</span><button type="button" class="close">×</button></li>');
        $connectionList.append('<li class="divider"></li>');
//        $connectionList.append('<li><button class="btn btn-default" style="width: 180px; text-align: left; border: 0px;"><i class="fa fa-dropbox"></i>&nbsp;<span data-i18n="app.test1;">My Dropbox Folder</span></button>&nbsp;'+
//                                '<button type="button" class="btn btn-default pull-right" style="margin-right: 5px"><i class="fa fa-pencil"></i></button></li>');
        var connectionsList = TSCORE.Config.Settings["tagspacesList"];
        for (var i=0; i < connectionsList.length; i++) { 
            $connectionList.append(
                $('<li>', {
                    style: "line-height: 45px"
                }).append(
                    $('<button>', { 
                        title:  "Location pointing to "+connectionsList[i].path,
                        path:   connectionsList[i].path,
                        name:   connectionsList[i].name,
                        text:   " "+connectionsList[i].name,
                        style:  "width: 180px; text-align: left; border: 0px;",
                        class:  "btn btn-default"
                        } )
                        .click(function() {
                            openLocation($(this).attr( "path" ));                           
                        })
                    	.prepend("<i class='fa fa-bookmark'></i>&nbsp;")                         	
                    )
                    .append(
                        $('<button>', { 
                            type:     "button",
                            title:    "Edit Location",
                            location: connectionsList[i].name,
                            path:     connectionsList[i].path,
                            class:    "btn btn-default pull-right",
                            style:    "margin-right: 5px"
                           } )
                           .append("<i class='fa fa-pencil'></i>")
                           .click(function(e) {
                                console.log("Edit location");
                                showLocationEditDialog($(this).attr("location"),$(this).attr("path"));
                                return false;
                           })                              
                    )
                );
        };
        
        $( "#createNewLocation" ).click(function() {
            showLocationCreateDialog();         
        });

    }

    // Public API definition
    exports.openLocation             = openLocation;
    exports.closeCurrentLocation       = closeCurrentLocation;
    exports.updateSubDirs              = updateSubDirs;
    exports.initUI 		               = initUI;
    exports.initConnections            = initConnections;
    exports.showCreateDirectoryDialog  = showCreateDirectoryDialog;
    
});