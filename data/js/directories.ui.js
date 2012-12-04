/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
console.debug("Loading DirectoriesUI...");

var DirectoriesUI = (typeof DirectoriesUI == 'object' && DirectoriesUI != null) ? DirectoriesUI : {};

DirectoriesUI.initDirectoryTree = function() {
    // Init the tree module
    $("#dirTree").dynatree({
      autoFocus: true,
      activeVisible: true,
      clickFolderMode: 1,      
      onActivate: function(node) {
        DirectoriesUI.clearSelectedDirs();  
        UIAPI.currentPath = node.data.key;
        $(node.li).addClass("selectedDirectory");
        $("#selectedFilePath").val("");     
        TSSETTINGS.setLastOpenedDir(node.data.key);
        IOAPI.listDirectory(UIAPI.currentPath);
      },
      onExpand: function(flag, node) {
      }, 
      onLazyRead: function(node){
        UIAPI.currentTreeElements = node;
        IOAPI.getSubdirs(node.data.key);
        return true;
      },
      onDblClick: function(node, event) {
        DirectoriesUI.clearSelectedDirs();            
        node.toggleExpand();
        $(node.li).addClass("selectedDirectory");
      },        
      // children: [{title: "Test Node"}]      
    });    
}

DirectoriesUI.clearSelectedDirs = function() {
    // Deselect all
    $(".selectedDirectory", $("#dirTree")).each(function(){
        $(this).removeClass('selectedDirectory');
    });    
} 

DirectoriesUI.initButtons = function() {
    $( "#reloadTagSpace" )
        .button()
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
        height: 300,
        width: 450,
        modal: true,
        buttons: {
            "Create": function() {
                var bValid = true;
                allFields.removeClass( "ui-state-error" );

                bValid = bValid && checkLength( newDirName, "directory name", 3, 100 );

                bValid = bValid && checkRegexp( newDirName, /^[a-z]([0-9a-z_])+$/i, "Directory name may consist of a-z, 0-9, underscores, begin with a letter." );
                // From jquery.validate.js (by joern), contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
//                    bValid = bValid && checkRegexp( email, /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i, "eg. ui@jquery.com" );
//                    bValid = bValid && checkRegexp( password, /^([0-9a-zA-Z])+$/, "Password field only allow : a-z 0-9" );
                if ( bValid ) {
                    IOAPI.createDirectory(UIAPI.currentPath+UIAPI.getDirSeparator()+newDirName.val());
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
    $( "#favoritesList" ).append('<li><hr style="height: 0px; border: 0px;"></li>');    
    $( "#favoritesList" ).append('<li name="createDirectory"><a href="javascript:void(0);"><span class="ui-icon ui-icon-document"></span>New Folder</a></li>');
    
    $( "#favoritesList" ).menu("destroy").menu({
        select: function( event, ui ) {
            var commandName = ui.item.attr( "name" );
            switch (commandName) {
              case "createFavorite":
                console.debug("Creating fav...");
                $("#favoriteName").val("");
                $("#favoriteLocation").val("");
                $("#dialogFavoriteCreate").dialog("open");                
                break;
              case "editFavorite":
                console.debug("Editing fav... under dev...");   
                $("#dialogFavoriteEdit").dialog("open");
                break;
              case "deleteFavorite":        
                console.debug("Deleting fav...");
                $( "#dialog-confirmfavoritedelete" ).dialog("open");               
                break;  
              case "createDirectory":
                $("#dialog-dircreate").dialog("open");
                $( "#favoritesList" ).hide();                
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

DirectoriesUI.openFavorite = function(path, title) {
    console.debug("Opening favorite in : "+path+" title: "+title);
    UIAPI.currentPath = path;  
    $( "#reloadTagSpace" ).button({
        label: title
    });
    $( "#reloadTagSpace" ).attr("title",path);
                    
    $("#dirTree").dynatree("getRoot").removeChildren();
    UIAPI.currentTreeElements = $("#dirTree").dynatree("getRoot");
    IOAPI.getSubdirs(UIAPI.currentPath);
    IOAPI.listDirectory(UIAPI.currentPath);
}  

