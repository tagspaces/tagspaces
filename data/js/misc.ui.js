/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
console.debug("Loading MiscUI...");

var UIAPI = (typeof UIAPI == 'object' && UIAPI != null) ? UIAPI : {};

// ONE_DIR_UP
UIAPI.parentDir = "..";

UIAPI.currentPath = "";

UIAPI.currentTreeElements = "";

UIAPI.currentView = "fileView"; // tagView, riverView

// Current selected files
UIAPI.selectedFiles = [];

UIAPI.currentFilename = "";

// True if a file is opened in the viewer
UIAPI.isFileOpened = false;

// Current directory list of files
UIAPI.fileList = [];

UIAPI.fileSortCriteria = "name";

// Last clicked button for removing a tag
UIAPI.selectedTag = "";

UIAPI.selectedTagData = "";

UIAPI.favIDPrefix = "fav";

UIAPI.fileTable = undefined;

UIAPI.htmlEditor = undefined;

UIAPI.getDirSeparator = function() {
    return UIAPI.isWindows()?"\\":"/";
}

UIAPI.isWindows = function() {
    return (navigator.appVersion.indexOf("Win")!=-1) ;    
}

UIAPI.setCurrentPath = function(path) {
    console.debug("Setting current path to: "+path);
    UIAPI.currentPath = path;
	
	// List preselected dir automatically
    IOAPI.listDirectory(UIAPI.currentPath);
}

UIAPI.updateLogger = function(message) {
    console.debug("Updating logger...");
    $("#footer").attr("value",message);
}

UIAPI.showLoadingAnimation = function(message) {
    $("#loadingAnimation").show();
}

UIAPI.hideLoadingAnimation = function(message) {
    $("#loadingAnimation").hide();
}

UIAPI.fileExists = function(fileName) {
    console.debug("Check if filename: "+fileName+" already exists.");
    for (var i=0; i < UIAPI.fileList.length; i++) {
        if(UIAPI.fileList[i].name == fileName) {
            return true;
        }
    }
    return false;
}

UIAPI.hideAllContextMenus = function() {
    $('.contextMenu').each(function() {
        $(this).hide();
    });    
}

UIAPI.updateFileBrowserData = function(dirList) {
    console.debug("Updating the file browser data...");
    
    UIAPI.fileList = [];
    var tags = undefined;
    var ext = undefined;
    var title = undefined;
    // Sort the dir list alphabetically before displaying 
    // TODO sorting files not working correctly
    dirList.sort(function(a,b) { return a.name.localeCompare(b.name); });
    for (var i=0; i < dirList.length; i++) {
        if (dirList[i].type == "file"){  
            // Considering Unix HiddenEntries (. in the beginning)
            if (TSSETTINGS.Settings["showUnixHiddenEntries"] || 
               (!TSSETTINGS.Settings["showUnixHiddenEntries"] && (dirList[i].name.indexOf(".") != 0))) {
                 tags = TSAPI.extractTags(dirList[i].name);
                 title = TSAPI.extractTitle(dirList[i].name);
                 if(dirList[i].name.lastIndexOf(".") > 0) {
                    // title = dirList[i].name.substring(0, dirList[i].name.lastIndexOf(".")); 
                     ext = dirList[i].name.substring(dirList[i].name.lastIndexOf(".")+1,dirList[i].name.length);                     
                 } else {
                    // title = dirList[i].name;
                     ext = "";
                 }
                 var entry = [dirList[i].name,dirList[i].size,dirList[i].lmdt,title,tags,ext];   
                 UIAPI.fileList.push(entry);
            }
        }
    }    

 
         
    UIAPI.changeView(UIAPI.currentView);    
}

// Updates the directory subtree
UIAPI.updateTree = function(dirList) {
    console.debug("Updating subdirs(UIAPI)..."+JSON.stringify(dirList));
    UIAPI.currentTreeElements.addChild(dirList);
    UIAPI.currentTreeElements.sortChildren();
}

UIAPI.setFileSortCriteria = function(sortBy) {
    console.debug("Setting sort criteris: "+sortBy);
    UIAPI.fileSortCriteria = sortBy;
}

UIAPI.initFileTagView = function(viewType) {
    UIAPI.fileTable.fnClearTable();  
    UIAPI.fileTable.fnAddData( UIAPI.fileList );

    UIAPI.fileTable.fnSetColumnVis(0, true);            
    UIAPI.fileTable.fnSetColumnVis(1, true);            
    UIAPI.fileTable.fnSetColumnVis(2, true);            
    UIAPI.fileTable.fnSetColumnVis(3, true);            
    UIAPI.fileTable.fnSetColumnVis(4, true);  

    UIAPI.fileTable.$('tr').dblclick( function() {
        console.debug("Opening file...");
        var rowData = UIAPI.fileTable.fnGetData( this );
        $("#selectedFilePath").val(UIAPI.currentPath+UIAPI.getDirSeparator()+rowData[0]);            
        UIAPI.openFile(rowData[0]);
        UIAPI.hideAllContextMenus();
    } );     
    
    UIAPI.fileTable.$('.fileButton').click( function() {
        BasicViewsUI.openFileMenu(this, $(this).attr("title"));
    } );      

    UIAPI.fileTable.$('.fileTitleButton').click( function() {
        BasicViewsUI.openFileTitleMenu(this, $(this).attr("title"));
    } );          
    
    UIAPI.fileTable.$('.extTagButton').click( function() {
        TagsUI.openTagMenu(this, $(this).attr("tag"), $(this).attr("filename"));
    } );           
    
    UIAPI.fileTable.$('.tagButton').click( function() {
        TagsUI.openTagMenu(this, $(this).attr("tag"), $(this).attr("filename"));
    } );      
   
}

UIAPI.initRiverView = function(viewType) {
    $("#riverView").empty();
    layoutContainer.close("east");
    var tagsHTML = undefined;
    for (var i=0; i < UIAPI.fileList.length; i++) {
        if(i > 10) break;
        tagsHTML = "";
//          for (var j=0; j < tags.length; j++) {
//              tagsHTML +='<button id="'+tags[j]+'" title="Open tag menu" class="tagButton">'+tags[j]+'</button>';    
//          };
        var fileName = UIAPI.fileList[i][0];
        var filePath = UIAPI.currentPath+UIAPI.getDirSeparator()+fileName;
        tagsHTML += '<iframe id="idFrameViewer" style="width: 100%; height: 150px;" src="'+'file:///'+filePath+'" />';
        $("#riverView").append(tagsHTML);
    }
    $("#riverView").show();
}

UIAPI.initThumbView = function(viewType) {
    $("#selectableFiles").empty();
    var tagsHTML = undefined;
    for (var i=0; i < UIAPI.fileList.length; i++) {
        tagsHTML = "";
        var fileName = UIAPI.fileList[i][0];
        var fileExt = fileName.substring(fileName.lastIndexOf(".")+1,fileName.length).toLowerCase();
        if(TSSETTINGS.getSupportedFileExt4Thumbnailing().indexOf(fileExt) >= 0) {
            var filePath = UIAPI.currentPath+UIAPI.getDirSeparator()+fileName;
            tagsHTML += '<img title="'+fileName+'" class="thumbImg" src="file:///'+filePath+'" />';
        } else {
            tagsHTML += '<span class="fileExtension">'+fileExt+'</span>';
        }
        $("#selectableFiles").append('<li title="'+fileName+'" class="ui-widget-content">'+tagsHTML+'</li>');
    }    
}

UIAPI.changeView = function(viewType) {
    console.debug("Change the view of the file browser to "+viewType);
    UIAPI.showLoadingAnimation();
       
    //Setting the current view
    UIAPI.currentView = viewType;

    $("#riverView").hide();
    
    $("#selectableFiles").hide();         

    // Purging the thumbnail view
    document.getElementById("selectableFiles").innerHTML = "";

    UIAPI.fileTable.hide();     
    $("fileTable_wrapper").hide();
    
    // Purging file table
    UIAPI.fileTable.fnClearTable();  

    //TODO River View Disabled due performance
    //UIAPI.initRiverView();
    
    // Clear the list with the selected files    
    UIAPI.selectedFiles = [];  
    UIAPI.currentFilename = "";

    if(viewType == "thumbView") {	    
        UIAPI.initThumbView();  
        $("#selectableFiles").show();           
//	 } else if(viewType == "riverView") {
//        $("#riverView").show();
	 } else { // Fileview or Tagview
        UIAPI.initFileTagView();  
        if(viewType == "fileView") {
            console.debug("Change to FileView");
            UIAPI.fileTable.fnSetColumnVis(0, true);            
            UIAPI.fileTable.fnSetColumnVis(1, true);            
            UIAPI.fileTable.fnSetColumnVis(2, true);            
            UIAPI.fileTable.fnSetColumnVis(3, false);            
            UIAPI.fileTable.fnSetColumnVis(4, false);            
        } else if (viewType == "tagView") {
            console.debug("Change to TagView");            
            UIAPI.fileTable.fnSetColumnVis(0, false);            
            UIAPI.fileTable.fnSetColumnVis(1, false);            
            UIAPI.fileTable.fnSetColumnVis(2, false);            
            UIAPI.fileTable.fnSetColumnVis(3, true);            
            UIAPI.fileTable.fnSetColumnVis(4, true);            
        }
        UIAPI.fileTable.show();
        $("fileTable_wrapper").show();        
    }        
    UIAPI.handleElementActivation();   
    UIAPI.hideLoadingAnimation();     
}

UIAPI.updateFileSelection = function() {
    console.debug("Updating file selection...");
    UIAPI.selectedFiles = [];          
    UIAPI.fileTable.$('tr.selectedRow').each(function() {
        var data = UIAPI.fileTable.fnGetData( this );
//        console.debug( "Selected #:" + data[0] );
        UIAPI.selectedFiles.push(data[0]);
    });
    UIAPI.handleElementActivation();     
}

UIAPI.changeDirectory = function(newDir) {
    console.debug("Change direcotory to: "+newDir);
    var newPath = UIAPI.currentPath;
    if(UIAPI.isWindows()) { 
        // Cutting trailig \\ or \\\\ .
        if(UIAPI.currentPath.lastIndexOf("\\")+1 == UIAPI.currentPath.length) {
            newPath = UIAPI.currentPath.substring(0,UIAPI.currentPath.length-1);
			console.debug("Cutting trailing \ "+newPath);
		} else if(UIAPI.currentPath.lastIndexOf("\\\\")+2 == UIAPI.currentPath.length) {
            newPath = UIAPI.currentPath.substring(0,UIAPI.currentPath.length-2);
			console.debug("Cutting trailing \\ "+newPath);
		}
        if(newDir == UIAPI.parentDir) {
            newPath = newPath.substring(0,newPath.lastIndexOf("\\"));            
            UIAPI.currentPath  = newPath;
        } else if(newDir.length > 0) {
            UIAPI.currentPath  = newPath+"\\"+newDir+"\\";
        }        
    } else { 
        // Cutting trailing /
        if(UIAPI.currentPath.lastIndexOf("/")+1 == UIAPI.currentPath.length) {
            newPath = UIAPI.currentPath.substring(0,UIAPI.currentPath.length-1);
        }
        if(newDir == UIAPI.parentDir) {
            newPath = newPath.substring(0,newPath.lastIndexOf("/"));            
            UIAPI.currentPath  = newPath;
        } else if(newDir.length > 0) {
            UIAPI.currentPath  = newPath+"/"+newDir+"/";
        }      
    }
    $('#footer').empty();
    $('#footer').append("Path: "+UIAPI.currentPath);
    console.debug("New path: "+UIAPI.currentPath);
    IOAPI.listDirectory(UIAPI.currentPath);
    UIAPI.selectedTag = "";
}

UIAPI.openFile = function(fileName) {
    console.debug("Opening file: "+fileName);
   
    // TODO Consider page width by opening, e.g. responsive design
   layoutContainer.open("east");    
   // layoutContainer.close("west");

    UIAPI.isFileOpened = true;

    var openedFilePath = UIAPI.currentPath+UIAPI.getDirSeparator()+fileName;
    // TODO replace \\ to \ in filenames
    openedFilePath.replace("\\\\","\\");
    $("#selectedFilePath").val(openedFilePath); 
    
    var fileExt = fileName.substring(fileName.lastIndexOf(".")+1,fileName.length).toLowerCase();
//    console.debug("Ext: "+fileExt);
    var filePath = "file:///"+UIAPI.currentPath+UIAPI.getDirSeparator()+fileName;

    $( "#viewer" ).show();
    if(TSSETTINGS.getSupportedFileExt4Viewing().indexOf(fileExt) >= 0) {
        $( "#viewer" ).html('<iframe id="idFrameViewer" src="'+filePath+'" />');                 
    } else {
        $( "#viewer" ).html('File type/extension not supported for viewing');                 
    }
  
    
    // Adding tag buttons to the filetoolbox
    var tags = TSAPI.extractTags(fileName);

    $( "#fileTitle" ).html(TSAPI.extractTitle(fileName));
    
    // Generate tag buttons
    $( "#fileTags" ).html("");
    for (var i=0; i < tags.length; i++) {
        $( "#fileTags" ).append('<button title="Opens context menu for '+tags[i]+'" tag="'+tags[i]+'" filename="'+fileName+'" class="tagButton">'+tags[i]+'</button>');    
    };

    // Activate tagButtons in file view
    $('.tagButton', $( "#fileTags" )).click( function() {
        TagsUI.openTagMenu(this, $(this).attr("tag"), $(this).attr("filename"));
    } ); 
    
    // Clear filetoolbox
    $( "#filetoolbox" ).html("");

    // TODO Fullscreen disabled due a fullscreen issue
    //UIAPI.addFullScreenButton("#filetoolbox");

    UIAPI.addOpenInWindowButton("#filetoolbox", filePath);

    // TODO Tag suggestion disabled due menu init issue
    //UIAPI.initTagSuggestionMenu(fileName, tags);
    //UIAPI.addTagSuggestionButton("#filetoolbox");

    UIAPI.addCloseButton("#filetoolbox");         
} 

UIAPI.initTagSuggestionMenu = function(fileName, tags) {
    // Adding buttons for creating tags according to the suggested tags
    var suggTags = TSAPI.suggestTags(fileName);

 //   $( "#tagSuggestionsMenu" ).menu();
 //   $( "#tagSuggestionsMenu" ).menu("disable");
    $( "#tagSuggestionsMenu" ).html(""); 
    
    for (var i=0; i < suggTags.length; i++) {        
        // Ignoring the tags already assigned to a file
        if(tags.indexOf(suggTags[i]) < 0) {
            $( "#tagSuggestionsMenu" ).append('<li name="'+suggTags[i]+'" title="Add tag '+suggTags[i]+' to current file">Tag with "'+suggTags[i]+'"</li>');               
        }         
    };
    
    // TODO menu does not initialize
    $( "#tagSuggestionsMenu" ).menu({ // menu("destroy").
        select: function( event, ui ) {
            var tagName = ui.item.attr( "name" );    
            TSAPI.writeTagsToFile(fileName, [tagName]);
            IOAPI.listDirectory(UIAPI.currentPath);  
        }         
    });  
}

UIAPI.addOpenInWindowButton = function(container, filename) {
    $( ""+container ).append('<button id="openInNewWindow">Open in new tab</button>');
    $( "#openInNewWindow" ).button({
        text: false,        
        icons: {
            primary: "ui-icon-newwin"
        },
        disabled: false
    })
    .click(function() {
        window.open(filename);
    });        
}

UIAPI.addCloseButton = function(container) {
    $( ""+container ).append('<button id="closeOpenedFile">Close</button>');
    $( "#closeOpenedFile" ).button({
        text: false,        
        icons: {
            primary: "ui-icon-circle-close"
        },
        disabled: false
    })
    .click(function() {
        UIAPI.isFileOpened = false;
        layoutContainer.open("west");    
        layoutContainer.close("east");
    });    
}


UIAPI.addFullScreenButton = function(container) {
    $( ""+container ).append('<button id="startFullscreen">Fullscreen</button>');
    $( "#startFullscreen" ).button({
        text: false,        
        icons: {
            primary: "ui-icon-arrow-4-diag"
        },
        disabled: false
    })
    .click(function() {
        var docElm = $("#container");
        docElm.mozRequestFullScreen();
/*        alert(docElm.webkitRequestFullScreen);
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        }
        else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
        }
        else if (docElm.webkitRequestFullScreen) {
        alert(docElm);
            docElm.webkitRequestFullScreen();
        }*/
    });    
}

UIAPI.addTagSuggestionButton = function(container) {
    $( ""+container ).append('<button id="openTagSuggestionMenu">Tag Suggestion</button>');
    $( "#openTagSuggestionMenu" ).button({
        text: false,        
        icons: {
            primary: "ui-icon-suitcase"
        },
        disabled: false
    })
    .click(function() {
        UIAPI.selectedTag = this.id;
        var menu = $("#tagSuggestionsMenu").show().position({
            my: "left top",
            at: "left bottom",
            of: $( this )
        });
        $( document ).one( "click", function() {
           menu.hide();
        });
        return false;
    });    
}

// TODO handle different file type such as txt or md
UIAPI.updateTextEditorContent = function(fileContent) {
    console.debug("Updating edtitor with data: "+fileContent); 
    aceEditor.setValue(fileContent);    
}

UIAPI.editFile = function(fileName) {
    console.debug("Editing file: "+fileName);
    var fileExt = fileName.substring(fileName.lastIndexOf(".")+1,fileName.length).toLowerCase();
  
    $( "#viewer" ).empty();

    if(TSSETTINGS.Settings["supportedFileTypeEditing"].indexOf(fileExt) < 0) {
        $( "#viewer" ).html("File type not supported for editing.");        
        return;
    }
    
    var filePath = UIAPI.currentPath+UIAPI.getDirSeparator()+fileName;
    if(fileExt == "js") {
        $( "#viewer" ).html('<div id="generalEditor" style="width: 100%; height: 100%">'+' '+'</div>');
        aceEditor = undefined
        require(["ext/editor_text/ace/ace"], function(ace) {
        	aceEditor = ace.edit("generalEditor");
			aceEditor.setTheme("ext/editor_text/ace/theme/monokai");
			aceEditor.getSession().setMode("ext/editor_text/ace/mode/javascript");        	
		});
        IOAPI.loadTextFile(filePath);
    } else if (fileExt == "html" || fileExt == "htm" ) {

    } else if (fileExt == "md" ) {
        
    } else {
        $( "#viewer" ).html("File type not supported for editing.");       
    }
    
    layoutContainer.open("east");    
    UIAPI.isFileOpened = true;
    $( "#viewer" ).show();    
}     

UIAPI.handleElementActivation = function() {
    console.debug("Entering element activation handler...");
    // Workarround for bug ...
    UIAPI.hideAllContextMenus();

    if (UIAPI.selectedFiles.length > 1) {
        $( "#openFileButton" ).button( "disable" );
        $( "#editFileButton" ).button( "disable" );
        $( "#deleteFileButton" ).button( "disable" );
        $( "#renameFileButton" ).button( "disable" );   
    } else if (UIAPI.selectedFiles.length == 1) {
        $( "#openFileButton" ).button( "enable" );
        $( "#editFileButton" ).button( "enable" );        
        $( "#deleteFileButton" ).button( "enable" );
        $( "#renameFileButton" ).button( "enable" ); 
    } else {
        $( "#openFileButton" ).button( "disable" );
        $( "#editFileButton" ).button( "disable" );        
        $( "#deleteFileButton" ).button( "disable" );
        $( "#renameFileButton" ).button( "disable" );       
    }    
}


UIAPI.initUI = function() {
    try {
        console.debug("Initializing UI...");
        $("#appVersion").html("["+TSSETTINGS.Settings["appVersion"]+"]");

        DirectoriesUI.initFavorites();
    
        TagsUI.updateTagGroups();
      
        // TODO Workarround for a bug
        $("#dirTree").css("display", "block");         

        // Loading the first tagspace in config by default     
        //DirectoriesUI.openFavorite(TSSETTINGS.Settings["tagspacesList"][0].path, TSSETTINGS.Settings["tagspacesList"][0].name);
        
        UIAPI.hideLoadingAnimation();        
    } catch (ex) {
        console.error("Initializing UI failed! "+ex);
    }   
}

UIAPI.reloadUI = function() {
    location.reload();
}

$(document).ready(function () {
    layoutContainer = $('#container').layout(
        {
        fxName: "none"
        
    //  some resizing/toggling settings
    ,    north__resizable:            false   // OVERRIDE the pane-default of 'slidable=true'
    ,   north__spacing_open:        0       // no resizer-bar when open (zero height)       
 //       ,   north__togglerLength_closed: '100%' // toggle-button is full-width of resizer-bar
 //       ,   north__spacing_closed:      20      // big resizer-bar when open (zero height)
    ,   north__size:                33      
 
    ,   south__resizable:           false   // OVERRIDE the pane-default of 'resizable=true'
    ,   south__spacing_open:        0       // no resizer-bar when open (zero height)
 //       ,   south__spacing_closed:      20      // big resizer-bar when open (zero height)

    //  west settings
    ,   west__resizable:           true 
    ,   west__minSize:              .1
//        ,   west__maxSize:              .4
    ,   west__size:                 200
    ,   west__spacing_open:         3     

    //  east settings
    ,   east__resizable:           true                 
    ,   east__size:                 .45
    ,   east__minSize:              .2
//        ,   east__maxSize:              .8 // 80% of layout width
    ,   east__spacing_open:        3   

    //  center settings
    ,   center__resizable:          true 
    ,   center__minSize:           0.5

    //  enable showOverflow on west-pane so CSS popups will overlap north pane
    ,   west__showOverflowOnHover:  true

    //  enable state management
    ,   stateManagement__enabled:   false // automatic cookie load & save enabled by default

    ,   showDebugMessages:          true // log and/or display messages from debugging & testing code
    } 
    
    );
    
    var westLayout = $('div.ui-layout-west').layout({
            minSize:                50  // ALL panes
        ,   center__paneSelector:   ".west-center"
        ,   south__paneSelector:    ".west-south"
        ,   south__size:            .5
        ,   south__spacing_open:    3       
    });

    var centerLayout = $('div.ui-layout-center').layout({
            name:                   "middle"
        ,   north__paneSelector:    ".middle-north"            
        ,   center__paneSelector:   ".middle-center"      
        ,   south__paneSelector:    ".middle-south"   
        ,   minSize:                0  // ALL panes
        ,   center__minSize:        300
        ,   north__size:            32
        ,   north__resizable:       false        
        ,   north__spacing_open:    0    
        ,   south__spacing_open:    0              
        ,   south__size:            1
    });

    // File Viewer / Editor
    var eastLayout = $('div.ui-layout-east').layout({
            minSize:                30  // ALL panes
        ,   north__paneSelector:    ".east-north"
        ,   center__paneSelector:   ".east-center"
        ,   south__paneSelector:    ".east-south" 
        ,   north__size:            80
        ,   north__resizable:       false
        ,   north__spacing_open:    0    
        ,   south__size:            25
        ,   south__spacing_open:    0        
    });

    var dirNavigationLayout = $('#directoryNavigator').layout({
            minSize:                30  // ALL panes
        ,   north__paneSelector:    "#directoryNavigatorNorth"
        ,   center__paneSelector:   "#dirTree"
        ,   north__size:            30
        ,   north__resizable:       false
        ,   north__spacing_open:    0
    });

    // Hide Document Viewer by default     
    layoutContainer.toggle("east");
});  


/**
 * Sorting 
    switch (UIAPI.fileSortCriteria) {
      case "name":
        UIAPI.fileList.sort(function(a,b) { return a.name.localeCompare(b.name); });
        
        // Descending
        // UIAPI.fileList.sort(function(a,b) { return b.name.localeCompare(a.name); });    
        break;
      case "size":        
        UIAPI.fileList.sort(function(a,b) { 
            if (a.size > b.size) return 1;
            if (a.size < b.size) return -1;
              return 0;
            });
        break;  
      case "lmdt":
        UIAPI.fileList.sort(function(a,b) { 
              var date1 = new Date(a.lmdt);
              var date2 = new Date(b.lmdt);
              if (date1 > date2) return 1;
              if (date1 < date2) return -1;
              return 0; 
            });
        break;          
      default:
        UIAPI.fileList.sort(function(a,b) { return a.name.localeCompare(b.name); });      
        break;
    }   
*
**/