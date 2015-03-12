/* Copyright (c) 2014-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
/* global define, Handlebars  */

define(function(require, exports, module) {
    "use strict";

    console.log("Loading perspectiveOCRO controller");

    var TSCORE = require("tscore");
    var TSPOSTIO = require("tspostioapi");

    var supportedFileTypesThumbs = ['jpg','jpeg','png','gif','bmp','svg'];
    var supportedFileTypesViewing = ['jpg','jpeg','png','gif','bmp','svg','pdf','url','website','xls','xlsx','dxf','avi'];
    var ocSearchPath = '/oc/index.php/search/ajax/search.php?query=';

    var thumbFolder = ".ts";
    var thumbExt = ".jpg";
    var PREVIEW_TAGS_CNT = 5;
    var extensionID;
    var templates;

    var searchResults;

    var $viewContainer;

    var init = function (id,tmpls) {
        templates = tmpls;
        extensionID = id;
        $viewContainer = $("#"+extensionID+"Container");
    };

    var load = function () {
        console.log("Loading data in "+extensionID);

        // Show home screen if user in the root of the location and no search query
        if((TSCORE.currentLocationObject.path === TSCORE.currentPath) && (TSCORE.Search.nextQuery.length < 1)) {
            showHomeScreen();
            return true;
        }

        // Load new filtered data
        searchResults = TSCORE.Search.searchData(TSCORE.fileList, TSCORE.Search.nextQuery);

        var filesData = [];

        _.each(searchResults, function (value) {
            var fileExt = value[TSCORE.fileListFILEEXT];
            if(supportedFileTypesViewing.indexOf(fileExt) >= 0) {
                filesData.push(
                    createFileContext(
                        value[TSCORE.fileListTITLE],
                        value[TSCORE.fileListFILEPATH],
                        value[TSCORE.fileListFILEEXT],
                        value[TSCORE.fileListTAGS]
                    )
                )
            }
        });

        $viewContainer.append(templates.fileTiles({files: filesData}));

        // Adding event listeners
        $viewContainer.find("img").each(function() {
            var filePath = $(this).attr("data-filepath");
            var fileExt = TSCORE.TagUtils.extractFileExtension(filePath);
            if(supportedFileTypesThumbs.indexOf(fileExt) >= 0) {
                //$(this).error(function() { $(this).attr("src",filePath) });
                // Start a js worker for the thumbnail generation
                $(this).attr("onerror","this.src='"+filePath+"'");
            } else {
                //$(this).error(function() { $(this).attr("src","assets/spacer.png") });
                $(this).attr("onerror","this.src='assets/spacer.png'");
            }
        });

        $viewContainer.find(".fileTile").each(function() {
            var filePath = $(this).attr("data-filepath");
            $(this).hammer().on("doubletap", function () {
                TSCORE.FileOpener.openFile(filePath);
                //selectFile(filePath);
            })
            .click(function () {
                //selectFile(filePath);
            })
        });

        if(searchResults.length !== undefined) {
            if(TSCORE.Search.nextQuery.length > 0) {
                $("#statusBar").text(searchResults.length+" files found for '"+TSCORE.Search.nextQuery+"'");
            } else {
                $("#statusBar").text(searchResults.length+" files found");
            }
        }
    };

    var showHomeScreen = function() {
        $viewContainer.children().remove();
        $viewContainer.append(templates.homeScreen({"id":extensionID}));

        $viewContainer.find(".dirNavigator").each(function() {
            var dirPath = $(this).attr("data-path");
            $(this).click(function () {
                TSCORE.navigateToDirectory(TSCORE.currentLocationObject.path+TSCORE.dirSeparator+dirPath);
            })
        });
    };

    var createFileContext = function(title, filePath, fileExt, fileTags) {
        var fileName = TSCORE.TagUtils.extractFileNameWithoutExt(filePath);
        var fileContainingPath = TSCORE.TagUtils.extractContainingDirectoryPath(filePath);
        //var tmbPath = fileContainingPath+TSCORE.dirSeparator+thumbFolder+TSCORE.dirSeparator+fileName+thumbExt;

        var webdavPath = "oc/remote.php/webdav";

        var fileID = filePath.substring(filePath.indexOf(webdavPath)+webdavPath.length,filePath.length);

        //var tmbPath = location.protocol+"//"+location.host+"/owncloud6/index.php/core/preview.png?file="+fileID;

        // thumbnail from the gallery plugin, user name have to be specified
        var tmbPath = location.protocol+"//"+location.host+"/oc/index.php/apps/gallery/ajax/thumbnail.php?file=na"+fileID+"&square=1";

        if(isCordova || isWeb) {

        } else {
            tmbPath = "file:///"+tmbPath;
        }

        var context = {
            filepath: filePath,
            tmbpath: tmbPath,
            fileext: fileExt,
            title: title,
            tags : []
        };

        if(fileTags.length > 0) {
            var tagString = ""+fileTags ;
            var tags = tagString.split(",");

            var tagCounter = 0;
            if (tags.length > PREVIEW_TAGS_CNT) {
                tagCounter = PREVIEW_TAGS_CNT+1;
                tags[PREVIEW_TAGS_CNT] = "...";
            } else {
                tagCounter = tags.length;
            }
            for (var i=0; i < tagCounter; i++) {
                context.tags.push({
                    tag: tags[i],
                    filepath: filePath,
                    style: TSCORE.generateTagStyle(TSCORE.Config.findTag(tags[i]))
                });
            }
        }

        return context;
    };

    var getNextFile = function (filePath) {
        var nextFilePath;
        searchResults.forEach(function(entry, index) {
            if(entry[TSCORE.fileListFILEPATH] === filePath) {
                var nextIndex = index+1;
                if(nextIndex < searchResults.length) {
                    nextFilePath = searchResults[nextIndex][TSCORE.fileListFILEPATH];
                } else {
                    nextFilePath = searchResults[0][TSCORE.fileListFILEPATH];
                }
            }
            console.log("Path: "+entry[TSCORE.fileListFILEPATH]);
        });
        TSCORE.PerspectiveManager.clearSelectedFiles();
        console.log("Next file: "+nextFilePath);
        return nextFilePath;
    };

    var getPrevFile = function (filePath) {
        var prevFilePath;
        searchResults.forEach(function(entry, index) {
            if(entry[TSCORE.fileListFILEPATH] === filePath) {
                var prevIndex = index-1;
                if(prevIndex >= 0) {
                    prevFilePath = searchResults[prevIndex][TSCORE.fileListFILEPATH];
                } else {
                    prevFilePath = searchResults[searchResults.length-1][TSCORE.fileListFILEPATH];
                }
            }
            console.log("Path: "+entry[TSCORE.fileListFILEPATH]);
        });
        TSCORE.PerspectiveManager.clearSelectedFiles();
        console.log("Prev file: "+prevFilePath);
        return prevFilePath;
    };

    var searchOC = function(query) {
        console.log("Searching oc index on: "+location.protocol+"//"+location.host);

        var tags,
            ext,
            title,
            fileSize,
            fileLMDT,
            path,
            filename;

        $.ajax({
            url: location.protocol+"//"+location.host+ocSearchPath+query,
            type: 'GET'
        })
            .done(function(data) {
                var searchResults = [];
                data.forEach(function(entry, index) {
                    //if(entry.indexOf("/"+thumbFolder)>0) {
                    searchResults.push({
                        "name": decodeURI(entry.name),
                        "isFile": true,
                        "size": undefined,
                        "lmdt": undefined,
                        "path": decodeURI(entry.link)
                    });
                });
                console.log("Search results "+JSON.stringify(searchResults));
                TSPOSTIO.listDirectory(searchResults);
            })
            .fail(function(data) {
                console.log("AJAX failed "+data);
            })
        ;
    };

    exports.init					= init;
    exports.load					= load;
    exports.searchOC    			= searchOC;
    exports.showHomeScreen          = showHomeScreen;
//    exports.clearSelectedFiles		= clearSelectedFiles;
    exports.getNextFile				= getNextFile;
    exports.getPrevFile				= getPrevFile;
//    exports.removeFileUI            = removeFileUI;
//    exports.updateFileUI            = updateFileUI;

});