/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
console.debug("Loading DirectoriesUI...");

var DirectoriesUI = (typeof DirectoriesUI == 'object' && DirectoriesUI != null) ? DirectoriesUI : {};

DirectoriesUI.directoryHistory = [];

DirectoriesUI.openFavorite = function(path, title) {
    console.debug("Opening favorite in : "+path+" title: "+title);

	document.title = title + " | " + TSSETTINGS.DefaultSettings.appName;

    $( "#reloadTagSpace" ).button({
        label: title
    });     
    $( "#reloadTagSpace" ).attr("title",path);
    
    // Clears the directory history
    DirectoriesUI.directoryHistory = new Array();
    DirectoriesUI.navigateToDirectory(path);
}  

// Updates the directory subtree
DirectoriesUI.updateSubDirs = function(dirList) {
    console.debug("Updating subdirs(UIAPI)..."+JSON.stringify(dirList));

    // Sort the dirList alphabetically
    dirList.sort(function(a,b) { return a.title.localeCompare(b.title); });
    
    for(var i=0; i < DirectoriesUI.directoryHistory.length; i++) {
        if(DirectoriesUI.directoryHistory[i].key == UIAPI.currentPath) {
            DirectoriesUI.directoryHistory[i]["children"] = new Array();
            for(var j=0; j < dirList.length; j++) {    
                DirectoriesUI.directoryHistory[i]["children"].push(dirList[j]);
            }
        }
    }
    
    DirectoriesUI.generateDirPath();
    DirectoriesUI.handleDirCollapsion();     
}

DirectoriesUI.dir4ContextMenu = null;

DirectoriesUI.generateDirPath = function() {
    console.debug("Generating Directory Path...");
    $("#dirTree").empty();
    
    // Code based on http://jsbin.com/eqape/1/edit
    $("#dirTree").addClass("ui-accordion ui-accordion-icons ui-widget ui-helper-reset")
    for(var i=0; i < DirectoriesUI.directoryHistory.length; i++) {
        $("#dirTree").append($("<h3>", { 
            class: "ui-accordion-header ui-helper-reset ui-state-default ui-corner-top ui-corner-bottom"    
        })
        .hover(function() { $(this).toggleClass("ui-state-hover"); })        
        // Add plus button to h3
        .append($("<span>", { 
            class: "ui-icon ui-icon-triangle-1-e",
            style: "position:relative!important; display:inline-block;",             
        })
        .click(function() {
          $(this)
//            .toggleClass("ui-icon-triangle-1-s")
            .parent().toggleClass("ui-accordion-header-active ui-state-active ui-state-default ui-corner-bottom").end()
            .parent().next().toggleClass("ui-accordion-content-active").toggle();
          return false;
        })        
        )
        // Add directory button to h3
        .append($("<button>", { 
            class: "dirButton",
            key: DirectoriesUI.directoryHistory[i].key,
            title: DirectoriesUI.directoryHistory[i].key,
            text: DirectoriesUI.directoryHistory[i].title, 
        })
        .droppable({
        	accept: ".fileButton",
	    	hoverClass: "dirButtonActive",
	    	drop: function( event, ui ) {
	    		var fileName = ui.draggable.attr("title");
	    		var targetDir = $(this).attr("key");
				console.log("Moving file: "+fileName+" to "+targetDir);
	    		IOAPI.renameFile(UIAPI.currentPath+UIAPI.getDirSeparator()+fileName, targetDir+UIAPI.getDirSeparator()+fileName);
	    		IOAPI.listDirectory(UIAPI.currentPath);  
	    	}	            	
        })        
        .click(function() {
            DirectoriesUI.navigateToDirectory($(this).attr("key"));
        })        
        )        
        // Add settings button to h3        
        .append($("<span>", { 
            class: "ui-icon ui-icon-gear",
            key: DirectoriesUI.directoryHistory[i].key, 
            title: "Directorys options",
            style: "float: right!important; position:relative!important; vertical-align: middle; display:inline-block;", 
        })                
        .dropdown( 'attach' , '#directoryMenu' )
        .click( function(event) {
            DirectoriesUI.dir4ContextMenu = $(this).attr("key");
        })
        )
        );
          
        var dirButtons = $("<div>").appendTo( "#dirTree" );  
        dirButtons.attr("style","margin: 0px; padding: 5px;");
        dirButtons.addClass("ui-accordion-content  ui-helper-reset ui-widget-content ui-corner-bottom")
        dirButtons.hide();
        if(DirectoriesUI.directoryHistory[i]["children"].length <= 0) {
	            dirButtons.append("No subfolders found.");        	
        } else {
	        for(var j=0; j < DirectoriesUI.directoryHistory[i]["children"].length; j++) {
	            dirButtons.append($("<button>", { 
	                class: "dirButton", 
	                key: DirectoriesUI.directoryHistory[i]["children"][j].key,
	                title: DirectoriesUI.directoryHistory[i]["children"][j].key,
	                text: DirectoriesUI.directoryHistory[i]["children"][j].title, 
	            })
	            .droppable({
	            	accept: ".fileButton",
			    	hoverClass: "dirButtonActive",
			    	drop: function( event, ui ) {
			    		var fileName = ui.draggable.attr("title");
			    		var targetDir = $(this).attr("key");
						console.log("Moving file: "+fileName+" to "+targetDir);
			    		IOAPI.renameFile(UIAPI.currentPath+UIAPI.getDirSeparator()+fileName, targetDir+UIAPI.getDirSeparator()+fileName);
			    		IOAPI.listDirectory(UIAPI.currentPath);  
			    	}	            	
	            })
	            .click( function() {
	                DirectoriesUI.navigateToDirectory($(this).attr("key"));
	            })
	            );                      
	        }        	
        }
    }
}

DirectoriesUI.handleDirCollapsion = function() {
    $("#dirTree").find("h3").each(function(index) {
        console.log("Entered h3 "+$(this).next().text());
        var key = $(this).find("button").attr("key");
        if(!DirectoriesUI.getDirectoryCollapsed(key)) {
            $(this).toggleClass("ui-accordion-header-active ui-state-active ui-state-default ui-corner-bottom").end();
            $(this).next().toggleClass("ui-accordion-content-active").toggle();          
        }
    });
}

DirectoriesUI.getDirectoryCollapsed = function(directoryPath) {
    for(var i=0; i < DirectoriesUI.directoryHistory.length; i++) {
        if(DirectoriesUI.directoryHistory[i].key == directoryPath) {
            return DirectoriesUI.directoryHistory[i].collapsed;
        }
    }
}

DirectoriesUI.setDirectoryCollapse = function(directoryPath, collapsed) {
    for(var i=0; i < DirectoriesUI.directoryHistory.length; i++) {
        if(DirectoriesUI.directoryHistory[i].key == directoryPath) {
            DirectoriesUI.directoryHistory[i].collapsed = collapsed;
        }
    }
}

DirectoriesUI.navigateToDirectory = function(directoryPath) {
    console.log("Navigating to directory: "+directoryPath);

	// Cleaning the directory path from \\ \ and / 
	if( (directoryPath.lastIndexOf('/')+1 == directoryPath.length) || (directoryPath.lastIndexOf('\\')+1 == directoryPath.length)) {
		directoryPath = directoryPath.substring(0,directoryPath.length-1);
	}
	if( (directoryPath.lastIndexOf('\\\\')+1 == directoryPath.length)) {
		directoryPath = directoryPath.substring(0,directoryPath.length-2);
	}

    var directoryFoundOn = -1;    
    for(var i=0; i < DirectoriesUI.directoryHistory.length; i++) {
        if(DirectoriesUI.directoryHistory[i].key == directoryPath) {
            DirectoriesUI.directoryHistory[i].collapsed = false;
            directoryFoundOn = i;
        } else {
            DirectoriesUI.directoryHistory[i].collapsed = true;            
        }
    }
    
    // Removes the history only if it is a completely new path
    if(directoryFoundOn >= 0) { 
		var diff = DirectoriesUI.directoryHistory.length - (directoryFoundOn+1);
		if(diff > 0) {
			DirectoriesUI.directoryHistory.splice(directoryFoundOn+1, diff);
		}    
    }    	
    
    // If directory path not in history then add it to the history
    if(directoryFoundOn < 0) {    	
	    var parentLocation = directoryPath.substring(0, directoryPath.lastIndexOf(UIAPI.getDirSeparator()));
		var parentFound = -1;
	    for(var i=0; i < DirectoriesUI.directoryHistory.length; i++) {
	        if(DirectoriesUI.directoryHistory[i].key == parentLocation) {
 				parentFound = i;
	        } 
	    }    	
	    if(parentFound >= 0) { 
			var diff = DirectoriesUI.directoryHistory.length - (parentFound+1);
			if(diff > 0) {
				DirectoriesUI.directoryHistory.splice(parentFound+1, diff);
			}    
	    }  
    	    	
    	var locationTitle = directoryPath.substring(directoryPath.lastIndexOf(UIAPI.getDirSeparator())+1,directoryPath.length);
        DirectoriesUI.directoryHistory.push({
            "title": locationTitle,
            "key" : directoryPath,
            "collapsed" : false,
        });	        	
    }    


    UIAPI.currentPath = directoryPath;
    IOAPI.getSubdirs(directoryPath);
    IOAPI.listDirectory(directoryPath);    
} 

DirectoriesUI.initButtons = function() {
    $( "#reloadTagSpace" )
        .button()
        .click(function() {
        	$( "#selectTagSpace" ).tooltip( "disable" );
            $("#favoritesList").width($( "#reloadTagSpace" ).width()+$("#selectTagSpace").width());
            $("#favoritesList").show().position({
                my: "left top",
                at: "left bottom",
                of: $( "#reloadTagSpace" )
            });
            $( document ).one( "click", function() {
                $("#favoritesList").hide();
            });
            return false;
        })
        .next()
            .button({
                text: false,
                icons: {
                    primary: "ui-icon-triangle-1-s"
                }
            })
            .click(function() {
                $("#favoritesList").width($( "#reloadTagSpace" ).width()+$("#selectTagSpace").width());
                $("#favoritesList").show().position({
                    my: "left top",
                    at: "left bottom",
                    of: $( "#reloadTagSpace" )
                });
                $( document ).one( "click", function() {
                    $("#favoritesList").hide();
                });
                return false;
            })
            .parent()
                .buttonset()
                .next()
                    .hide()
                    .menu();    
                    
    $( "#selectTagSpace" ).tooltip();

    $( "#selectLocalDirectory" )
        .button({
            text: false,
            icons: {
                primary: "ui-icon-folder-open"
            }
        })
        .click(function() {
            IOAPI.selectDirectory();
            return false;
        })    
}

DirectoriesUI.initContextMenus = function() {    
    // Context menu for the tags in the file table and the file viewer
    $( "#directoryMenu" ).menu({
        select: function( event, ui ) {
            console.debug("Tag menu action: "+ui.item.attr( "action" ));
            switch (ui.item.attr( "action" )) {
              case "reloadDirectory":
                DirectoriesUI.navigateToDirectory(DirectoriesUI.dir4ContextMenu);
                break;                            
              case "createDirectory":
                $( "#dialog-dircreate" ).dialog("open");
                break;                           
              case "openDirectory":
				IOAPI.openDirectory(DirectoriesUI.dir4ContextMenu);
                break; 
            }
        }
    });
}

DirectoriesUI.initDialogs = function() {
    var newDirName = $( "#dirname" );
    
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

    $( "#dialog-dircreate" ).dialog({
        autoOpen: false,
        height: 200,
        width: 350,
        modal: true,
        buttons: {
            "Create": function() {
                var bValid = true;
                allFields.removeClass( "ui-state-error" );

                bValid = bValid && checkLength( newDirName, "directory name", 3, 100 );

                bValid = bValid && checkRegexp( newDirName, /^[a-z]([0-9a-z_])+$/i, "Directory name may consist of a-z, 0-9, underscores, begin with a letter." );
                // From jquery.validate.js (by joern), contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
                // bValid = bValid && checkRegexp( email, /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i, "eg. ui@jquery.com" );
                // bValid = bValid && checkRegexp( password, /^([0-9a-zA-Z])+$/, "Password field only allow : a-z 0-9" );
                if ( bValid ) {
                    IOAPI.createDirectory(DirectoriesUI.dir4ContextMenu+UIAPI.getDirSeparator()+newDirName.val());
                    DirectoriesUI.navigateToDirectory(DirectoriesUI.dir4ContextMenu);
                    $( this ).dialog( "close" );
                }
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        },
        close: function() {
            allFields.val( "" ).removeClass( "ui-state-error" );
        }
    });  
    
    $( "#dialog-confirmfavoritedelete" ).dialog({
        autoOpen: false,
        resizable: false,
        height:140,
        modal: true,
        buttons: {
            "Delete": function() {                
                TSSETTINGS.deleteFavorite(nameCurrentFavorite);
                DirectoriesUI.initFavorites();  
                DirectoriesUI.openFavorite(TSSETTINGS.Settings["tagspacesList"][0].path, TSSETTINGS.Settings["tagspacesList"][0].name);                                 
                $( this ).dialog( "close" );
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        }
    }); 

    $( "#dialogFavoriteCreate" ).dialog({
        autoOpen: false,
        resizable: false,
        height:240,
        modal: true,
        buttons: {
            "Create": function() {                
                TSSETTINGS.createFavorite($("#favoriteName").val(), $("#favoriteLocation").val());
                DirectoriesUI.initFavorites();  
                DirectoriesUI.openFavorite(TSSETTINGS.Settings["tagspacesList"][0].path, TSSETTINGS.Settings["tagspacesList"][0].name);                                 
                $( this ).dialog( "close" );
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        }
    });  
}

var nameCurrentFavorite = undefined;

DirectoriesUI.initFavorites = function() {
    console.debug("Creating location menu...");
    
    $( "#favoritesList" ).menu();
    $( "#favoritesList" ).menu("disable");
    $( "#favoritesList" ).empty();
    
    var favoritesList = TSSETTINGS.Settings["tagspacesList"]
    for (var i=0; i < favoritesList.length; i++) { 
          $( "#favoritesList" ).append(
                $('<li>',  { title: favoritesList[i].path, name: favoritesList[i].name}).append(
                    $('<a>', { href: "javascript:void(0);", text: favoritesList[i].name} )));
    };
    $( "#favoritesList" ).append('<li><hr></li>');    
    $( "#favoritesList" ).append('<li name="createFavorite"><a href="javascript:void(0);"><span class="ui-icon ui-icon-document"></span>New Location</a></li>');
  //  $( "#favoritesList" ).append('<li name="editFavorite"><a href="javascript:void(0);"><span class="ui-icon ui-icon-pencil"></span>Edit Location</a></li>');
    $( "#favoritesList" ).append('<li name="deleteFavorite"><a href="javascript:void(0);"><span class="ui-icon ui-icon-trash"></span>Remove Location</a></li>');
   
    $( "#favoritesList" ).menu("destroy").menu({
        select: function( event, ui ) {
            var commandName = ui.item.attr( "name" );
            switch (commandName) {
              case "createFavorite":
                $("#favoriteName").val("");
                $("#favoriteLocation").val("");
                $("#dialogFavoriteCreate").dialog("open");                
                break;
              case "editFavorite":
                console.debug("Editing fav... under dev...");   
                $("#dialogFavoriteEdit").dialog("open");
                break;
              case "deleteFavorite":        
                $( "#dialog-confirmfavoritedelete" ).dialog("open");               
                break;  
              default:
                nameCurrentFavorite = ui.item.attr( "name" );
                DirectoriesUI.openFavorite(ui.item.attr( "title" ), ui.item.attr( "name" ));   
                $( "#favoritesList" ).hide();  
                break;
            }
        }         
    });  
    $( "#favoritesList" ).hide(); 
}