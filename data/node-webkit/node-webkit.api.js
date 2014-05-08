/* Copyright (c) 2012-2014 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

/* global define, fs, process, gui  */
/* undef: true, unused: true */

define(function(require, exports, module) {
"use strict";
    
    // Activating browser specific exports modul
    console.log("Loading ioapi.node.js..");
    
    var TSCORE = require("tscore");    
    var TSPOSTIO = require("tspostioapi");

    //var exif = require('../ext/viewerImage/exif-parser-master/lib/exif');
    //var BufferStream = require('../ext/viewerImage/exif-parser-master/lib/bufferstream');

    process.on("uncaughtException", function(err) {
        //alert("error: " + err);

        var msg =
              ' Information | Description \n'
            + '-------------|-----------------------------\n'
            + ' Date        | '+ new Date +'\n'
            + ' Type        | UncaughtException \n'
            + ' Stack       | '+ err.stack +'\n\n';

        //fs.appendFile(errorLogFile, '---uncaughtException---\n' + msg);
    });

    var handleStartParameters = function() {
        //Windows "C:\Users\na\Desktop\TagSpaces\tagspaces.exe" --original-process-start-time=13043601900594583 "G:\data\assets\icon16.png"
        //Linux /opt/tagspaces/tagspaces /home/na/Dropbox/TagSpaces/README[README].md
        //OSX /home/na/Dropbox/TagSpaces/README[README].md
        //gui.App.on('open', function(cmdline) {
        //   console.log('Command line arguments on open: ' + cmdline);
        //   TSCORE.FileOpener.openFile(cmdArguments);
        //});
        var cmdArguments = gui.App.argv;
        if(cmdArguments !== undefined && cmdArguments.length > 0) {
            console.log("CMD Arguments: "+cmdArguments+" Process running in "+process.cwd());
            var filePath = ""+cmdArguments;
            TSCORE.FileOpener.openFileOnStartup(filePath);
        }
    };

    var initMainMenu = function() {
        var rootMenu = new gui.Menu({ type: 'menubar'});
        var aboutMenu = new gui.Menu();
        var viewMenu = new gui.Menu();
        var win = gui.Window.get();

        // TODO Clear the menu on reload
        if(TSCORE.Config.getShowMainMenu()) {
            aboutMenu.append(new gui.MenuItem({
                type: 'normal',
                label: $.i18n.t("ns.common:aboutTagSpaces"),
                click: function (){
                    TSCORE.UI.showAboutDialog();
                } }));

            viewMenu.append(new gui.MenuItem({
                type: 'normal',
                label: $.i18n.t("ns.common:showTagLibraryTooltip")+" ("+TSCORE.Config.getShowTagLibraryKeyBinding()+")",
                click: function (){
                    TSCORE.UI.showTagsPanel();
                } }));

            viewMenu.append(new gui.MenuItem({
                type: 'normal',
                label: $.i18n.t("ns.common:showLocationNavigatorTooltip")+" ("+TSCORE.Config.getShowFolderNavigatorBinding()+")",
                click: function (){
                    TSCORE.UI.showLocationsPanel();
                } }));

            viewMenu.append(new gui.MenuItem({ type: 'separator' }));

            viewMenu.append(new gui.MenuItem({
                type: 'normal',
                label: $.i18n.t("ns.common:toggleFullScreen")+" ("+TSCORE.Config.getToggleFullScreenKeyBinding()+")",
                click: function (){
                    win.toggleFullscreen();
                } }));

            viewMenu.append(new gui.MenuItem({
                type: 'normal',
                label: $.i18n.t("ns.common:showDevTools")+" ("+TSCORE.Config.getOpenDevToolsScreenKeyBinding()+")",
                click: function (){
                    win.showDevTools();
                } }));

            //viewMenu.append(new gui.MenuItem({
            //    type: 'normal',
            //    label: $.i18n.t("ns.common:reloadApplication")+" ("+TSCORE.Config.getReloadApplicationKeyBinding()+")",
            //    click: function (){
            //        win.reloadIgnoringCache();
            //    } }));

            viewMenu.append(new gui.MenuItem({ type: 'separator' }));

            viewMenu.append(new gui.MenuItem({
                type: 'normal',
                label: 'Settings',
                click: function (){
                    TSCORE.UI.showOptionsDialog();
                } }));

            rootMenu.append(new gui.MenuItem({
                label: 'View',
                submenu: viewMenu
            }));

            rootMenu.append(new gui.MenuItem({
                label: 'Help',
                submenu: aboutMenu
            }));

            gui.Window.get().menu = rootMenu;
        }
    };

    function scanDirectory(dirPath, index) {
        try {
            var dirList = fs.readdirSync(dirPath);
            var path, stats;
            for (var i=0; i < dirList.length; i++) {
                path = dirPath+TSCORE.dirSeparator+dirList[i];
                stats = fs.statSync(path);
                //console.log('stats: ' + JSON.stringify(stats));
                index.push({
                    "name": dirList[i],
                    "isFile": !stats.isDirectory(),
                    "size": stats.size,
                    "lmdt": stats.mtime,
                    "path": path  
                });     
                if (stats.isDirectory()) {
                    scanDirectory(path, index);
                }                        
            }        
            return index;
        } catch(ex) {
            console.error("Scanning directory "+dirPath+" failed "+ex);
        }
    }

    function generateDirectoryTree(dirPath) {
        try {
            var tree = {}; 
            var dstats = fs.statSync(dirPath);           
            tree.name = pathUtils.basename(dirPath);
            tree.isFile = false;
            tree.lmdt = dstats.mtime;
            tree.path = dirPath;
            tree.children = [];
            var dirList = fs.readdirSync(dirPath);
            for (var i=0; i < dirList.length; i++) {
                var path = dirPath+TSCORE.dirSeparator+dirList[i];
                var stats = fs.statSync(path);
                if (stats.isFile()) {
                    tree.children.push({
                        "name": pathUtils.basename(path),
                        "isFile": true,
                        "size": stats.size,
                        "lmdt": stats.mtime,   
                        "path": path 
                    });
                } else {
                    tree.children.push( generateDirectoryTree(path) );
                }  
            }
            return tree;
        } catch(ex) {
            console.error("Scanning directory "+dirPath+" failed "+ex);
        }         
    }

    /* var directoryExist = function(dirPath) {
        console.log("Checks if a directory exist: "+dirPath);
        //TSPOSTIO.
    }; */
    
    var createDirectoryIndex = function(dirPath) {
        console.log("Creating index for directory: "+dirPath);
        TSCORE.showLoadingAnimation();  
        
        var directoryIndex = [];
        directoryIndex = scanDirectory(dirPath, directoryIndex);
        //console.log(JSON.stringify(directoryIndex));
        TSPOSTIO.createDirectoryIndex(directoryIndex);
    };
    
    var createDirectoryTree = function(dirPath) {
        console.log("Creating directory index for: "+dirPath);
        TSCORE.showLoadingAnimation();

        var directoyTree = generateDirectoryTree(dirPath);
        //console.log(JSON.stringify(directoyTree));
        TSPOSTIO.createDirectoryTree(directoyTree);
    };
    
    var createDirectory = function(dirPath) {
        console.log("Creating directory: "+dirPath);   
        TSCORE.showLoadingAnimation();  
                
        fs.mkdir(dirPath, function(error) {
            if (error) {
                console.log("Creating directory "+dirPath+" failed "+error);
                return;
            }
            TSPOSTIO.createDirectory(dirPath);
        });
    };

    var renameFile = function(filePath, newFilePath) {
        console.log("Renaming file: "+filePath+" to "+newFilePath);
        TSCORE.showLoadingAnimation();  
                
        if(filePath.toLowerCase() === newFilePath.toLowerCase()) {
            console.log("Initial and target filenames are the same...");
            return false;            
        }        
        if(fs.existsSync(newFilePath)) {
            TSCORE.showAlertDialog("Target filename '"+newFilePath+"' already exists.","File renaming failed!");
            return false;
        }
        fs.rename(filePath, newFilePath, function(error) {
            if (error) {
                console.log("Renaming file failed "+error);
                return;
            }
            TSPOSTIO.renameFile(filePath, newFilePath);
        });
    };
        
    var loadTextFile = function(filePath, isPreview) {
        console.log("Loading file: "+filePath);
        TSCORE.showLoadingAnimation();  
        
        if(isPreview) {
            var stream = fs.createReadStream(filePath,  {start: 0, end: 10000});
            stream.on('error', function(err){
                console.log("Loading file "+filePath+" failed "+err);
                return;
            });

            stream.on('data', function(content) {
                console.log("Stream: "+content);
                TSPOSTIO.loadTextFile(content);
            });

        } else {
            fs.readFile(filePath, 'utf8', function(error, content) {
                if (error) {
                    console.log("Loading file "+filePath+" failed "+error);
                    return;
                }
                TSPOSTIO.loadTextFile(content);
            });
        }
    };
    
    /* var loadEXIF = function(filePath) {
        console.log("Loading file: "+filePath);
        TSCORE.showLoadingAnimation();  

        var buf = fs.readFileSync(filePath);
        exif.parseTags(new BufferStream(buf, 24, 23960), function(ifdSection, tagType, value, format) {
            console.log("EXIF: "+ifdSection+" "+tagType+" "+value+" "+format);
        });
    };    */
    
    var saveTextFile = function(filePath,content,overWrite) {
        console.log("Saving file: "+filePath);
        TSCORE.showLoadingAnimation();  
                
        /** TODO check if fileExist by saving needed
        if(overWrite) {
            // Current implementation
        } else {
            if (!pathUtils.existsSync(filePath)) { 
               // Current implementation
            }                     
        }
        */
 
        // Handling the UTF8 support for text files
        var UTF8_BOM = "\ufeff";

        if(content.indexOf(UTF8_BOM) === 0) {
            console.log("Content beging with a UTF8 bom");
        } else {
            content = UTF8_BOM+content;
        }            

        var isNewFile = !fs.existsSync(filePath);
       
        fs.writeFile(filePath, content, 'utf8', function(error) {
            if (error) {
                console.log("Save to file "+filePath+" failed "+error);
                return;
            }
            TSPOSTIO.saveTextFile(filePath, isNewFile);
        }); 
    };

    var listDirectory = function (dirPath) {
        console.log("Listing directory: " + dirPath);
        TSCORE.showLoadingAnimation();

        try {
            fs.readdir(dirPath, function (error, dirList) {
                if (error) {
                    TSPOSTIO.errorOpeningPath();
                    console.log("Listing directory: " + dirPath + " failed " + error);
                    return;
                }

                var anotatedDirList = [];
                for (var i = 0; i < dirList.length; i++) {
                    var path = dirPath + TSCORE.dirSeparator + dirList[i];
                    var stats = fs.statSync(path);
                    //console.log('stats: ' + JSON.stringify(stats));
                    anotatedDirList.push({
                        "name": dirList[i],
                        "isFile": !stats.isDirectory(),
                        "size": stats.size,
                        "lmdt": stats.mtime,
                        "path": path
                    });
                }
                TSPOSTIO.listDirectory(anotatedDirList);
            });
        } catch (ex) {
            TSPOSTIO.errorOpeningPath();
            console.error("Listing directory " + dirPath + " failed " + ex);
        }
    };
    
    var deleteElement = function(path) {
        console.log("Deleting: "+path);
        TSCORE.showLoadingAnimation();  
                
        fs.unlink(path, function(error) {
            if (error) {
                console.log("Deleting file "+path+" failed "+error);
                return;
            }
            TSPOSTIO.deleteElement(path);
        });        
    };
    
    var checkAccessFileURLAllowed = function() {
        console.log("checkAccessFileURLAllowed function not relevant for node..");
    };    
    
    var checkNewVersion = function() {
        console.log("Checking for new version...");
        var cVer = TSCORE.Config.DefaultSettings.appVersion+"."+TSCORE.Config.DefaultSettings.appBuild;
        $.ajax({
            url: 'http://tagspaces.org/releases/version.json?nVer='+cVer,
            type: 'GET'
        })
        .done(function(data) { 
            TSPOSTIO.checkNewVersion(data);    
        })
        .fail(function(data) { 
            console.log("AJAX failed "+data); 
        })
        ;      
    };    

    var selectDirectory = function() {
        if(document.getElementById('folderDialog') === null) {
            $("#folderLocation").after('<input style="display:none;" id="folderDialog" type="file" nwdirectory />');
        }
        var chooser = $('#folderDialog');        
        chooser.change(function() {
            TSPOSTIO.selectDirectory($(this).val());
        });
        chooser.trigger('click');  
    };
    
    var openDirectory = function(dirPath) {
        // showItemInFolder
        gui.Shell.openItem(dirPath);
    };

    var openFile = function(filePath) {
        // TODO prevent opening executables in windows
        gui.Shell.openItem(filePath);
    };

    var selectFile = function() {
        if(document.getElementById('fileDialog') === null) {
            $("#folderLocation").after('<input style="display:none;" id="fileDialog" type="file" />');
        }
        var chooser = $('#fileDialog');        
        chooser.change(function() {
            console.log("File selected: "+$(this).val());
        });
        chooser.trigger('click');  
    };
    
    var openExtensionsDirectory = function() {
        // TODO implement openExtensionsDirectory on node
        //gui.Shell.openItem(extPath);
        console.log("Open extensions directory functionality not implemented on chrome yet!");
        TSCORE.showAlertDialog("Open extensions directory functionality not implemented yet!");
    };

/* stats for file:
  dev: 2114,
  ino: 48064969,
  mode: 33188,
  nlink: 1,
  uid: 85,
  gid: 100,
  rdev: 0,
  size: 527,
  blksize: 4096,
  blocks: 8,
  atime: Mon, 10 Oct 2011 23:24:11 GMT,
  mtime: Mon, 10 Oct 2011 23:24:11 GMT,
  ctime: Mon, 10 Oct 2011 23:24:11 GMT 
*/    
    var getFileProperties = function(filePath) {
        var fileProperties = {};
        var stats = fs.statSync(filePath);
        if (stats.isFile()) {
            fileProperties.path = filePath;
            fileProperties.size = stats.size;
            fileProperties.lmdt = stats.mtime;
            TSPOSTIO.getFileProperties(fileProperties);
        } else {
            console.warn("Error getting file properties. "+filePath+" is directory");   
        }        
    };    
    
    exports.createDirectory              = createDirectory;
    exports.renameFile                   = renameFile;
    exports.loadTextFile                 = loadTextFile;
    exports.saveTextFile                 = saveTextFile;
    exports.listDirectory                = listDirectory;
    exports.deleteElement                = deleteElement;
    exports.createDirectoryIndex         = createDirectoryIndex;
    exports.createDirectoryTree          = createDirectoryTree;
    exports.selectDirectory              = selectDirectory;
    exports.openDirectory                = openDirectory;
    exports.openFile                     = openFile;
    exports.selectFile                   = selectFile;
    exports.openExtensionsDirectory      = openExtensionsDirectory;
    exports.checkAccessFileURLAllowed    = checkAccessFileURLAllowed;
    exports.checkNewVersion              = checkNewVersion;
    exports.getFileProperties            = getFileProperties;
    exports.initMainMenu                 = initMainMenu;
    exports.handleStartParameters        = handleStartParameters;

});
