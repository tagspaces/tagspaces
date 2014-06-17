/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
/* global define, Handlebars  */

define(function(require, exports, module) {
"use strict";
	
	var extensionTitle = "OCRO";
	var extensionID = "perspectiveOCRO";  // ID should be equal to the directory name where the ext. is located
	var extensionType =  "perspective";
	var extensionIcon = "fa fa-automobile";
	var extensionVersion = "1.0";
	var extensionManifestVersion = 1;
	var extensionLicense = "AGPL";

	console.log("Loading "+extensionID);

	var TSCORE = require("tscore");

	var extensionDirectory = TSCORE.Config.getExtensionPath()+"/"+extensionID;

    var $viewContainer,
        $viewToolbar,
        $viewFooter;

    var tableScope;

	function init() {
		console.log("Initializing perspective "+extensionID);

        $viewContainer = $("#"+extensionID+"Container");
        $viewToolbar = $("#"+extensionID+"Toolbar");
        $viewFooter = $("#"+extensionID+"Footer");

        $viewContainer.empty();
        $viewToolbar.empty();
        $viewFooter.empty();

        $viewToolbar.html('<div id="myToolbar"><div class="btn-group">'+ // ng-app ng-controller="myToolbarCtrl"
                '<button class="btn btn-link" data-i18n="[title]ns.perspectiveList:toggleSelectAll" title="" id="{{id}}ToogleSelectAll"><i class="fa fa-square-o fa-lg fa-fw"></i></button>'+
                '<button class="btn btn-link" data-i18n="[title]ns.perspectiveList:downloadTooltip" id="{{id}}DownloadButton"><i class="fa fa-download fa-lg"></i></button>'+
                '<button class="btn btn-link" data-i18n="[title]ns.perspectiveList:reloadDirectoryTooltip" id="{{id}}ReloadFolderButton"><i class="fa fa-refresh fa-lg"></i></button>'+
                '<button class="btn btn-link" data-i18n="[title]ns.perspectiveList:showSubfolderContentTooltip" id="{{id}}IncludeSubDirsButton"><i class="fa fa-retweet fa-lg"></i></button>'+
                //'<button class="btn btn-link" data-i18n="[title]ns.perspectiveList:toggleThumbnailsTooltip" data-toggle="button" id="{{id}}ShowTmbButton"><i class="fa fa-picture-o fa-lg"></i></button>'+
                '<button class="btn btn-link" data-i18n="[title]ns.perspectiveList:increasThumbnailsTooltip" id="{{id}}IncreaseThumbsButton"><i class="fa fa-search-plus fa-lg"></i></button>'+
            '</div>');

        $("#"+extensionID+"ReloadFolderButton")
            .click(function() {
                TSCORE.navigateToDirectory(TSCORE.currentPath);
            });

        $viewContainer.html('<div ng-app ng-controller="perspectiveOCROCtrl" id="myTable" >'+
            '<li title="{{entry[5]}}" filepath="{{entry[5]}}" ng-repeat="entry in data" ng-click="selectFile(entry[5])" ng-dblclick="openFile(entry[5])" class="fileTile">'+
               '<span><img class="thumbImgTile" style="max-width: 200px; max-height: 200px;" src="{{entry[5]}}"></span>'+
               '<p class="titleInFileTile">{{entry[1]}}</p>'+
               '<span class="tagsInFileTile">'+
                    '<button ng-repeat="tag in entry[2] track by $index" class="btn btn-sm tagButton ui-draggable" tag="{{tag}}" filepath="{{entry[5]}}" style="">{{tag}} <!--span class="caret"></span--></button>'+
               '</span>'+
               '<span class="fileExtTile">{{entry[0]}}</span>'+
               '<button class="btn btn-link fileTileSelector" filepath="{{entry[5]}}"><i class="fa fa-square-o"></i></button></p>'+
            '</li>' +
            '</div>');

        $("body").append('<div class="modal" id="dialogOCSettings" tabindex="-1" role="dialog" aria-hidden="true">'+
            '<div class="modal-dialog">'+
            '<div class="modal-content">'+
                '<div class="modal-header">'+
                    '<button type="button" class="close" data-dismiss="modal" aria-hidden="true"><i class="fa fa-times fa-lg"></i></button>'+
                    '<h4 class="modal-title" id="myModalLabel1" data-i18n="">Settings</h4>'+
                '</div>'+
                '<div class="modal-body">'+
                    '<iframe id="aboutIframe" nwdisable style="width: 100%; height: 350px; border: 0;" src="../../../index.php/settings/personal"></iframe>'+
                '</div>'+
                '<div class="modal-footer">'+
                    '<button class="btn btn-primary" data-dismiss="modal" title="Close Dialog" aria-hidden="true"><i class="fa fa-check fa-lg"></i></button>'+
                '</div>'+
            '</div><!-- /.modal-content -->'+
        '</div><!-- /.modal-dialog -->'+
        '</div><!-- /.modal -->');

        require([
            extensionDirectory+'/angular.min.js',
            //extensionDirectory+'/angular-touch.min.js',
            extensionDirectory+'/controller.js'
            ], function() {
                angular.module('app', ['ngTouch']);
                tableScope = angular.element($("#myTable")).scope();
                tableScope.setTSCORE(TSCORE);
            }
        );
	}

	var load = function () {
		console.log("Loading perspective "+extensionID);

        if(isWeb) {
            $("#mainTopMenu").html(' '+
                '<a class="btn btn-link" href="#" onclick="$(\'#dialogOCSettings\').modal({backdrop: \'static\',show: true});"><i class="fa fa-gears fa-lg"></i>&nbsp;<span data-i18n="ns.perspectiveList:ocSettings">User Account</span></a>'+
                '<a class="btn btn-link" href="../../../index.php?logout=true"><i class="fa fa-sign-out fa-lg"></i>&nbsp;<span data-i18n="ns.perspectiveList:ocLogOut">Log out</span></a>'+
                ' ');
        }

        // TODO Disable Edit File Title

        $("#showTagGroups").hide();
        $("#searchBox").hide();
        $("#searchButton").hide();
        $("#clearFilterButton").hide();
        $("#perspectiveSwitcherButton").hide();

        // Directory Menu
        $("#directoryMenuRenameDirectory").hide();
        $("#directoryMenuDeleteDirectory").hide();
        $("#directoryMenuCreateDirectory").hide();
        $("#directoryMenuOpenDirectory").hide();
        // Contact Panel
        $("#openHints").hide();
        $("#openWhatsnew").hide();
        $("#openGooglePlay").hide();
        $("#openSupportUs").hide();
        // File Menu
        $("#tagFile").hide();
        $("#renameFile").hide();
        $("#sendFile").hide();
        $("#deleteFile").hide();
        $("#openNatively").hide();
        $("#openDirectory").hide();
        $("#addTagFileViewer").hide();
        // Tag Menu
        $("#tagMenuEditTag").hide();
        $("#tagMenuMoveTagFirst").hide();
        $("#tagMenuMoveTagLeft").hide();
        $("#tagMenuMoveTagRight").hide();
        $("#tagMenuRemoveTag").hide();

//        $("#").hide();

        //TODO hide unneeded area settings

        if(tableScope === undefined) {
            window.setTimeout( function() { tableScope.update(); }, 1000);
        } else {
            tableScope.update();
        }
    };

    var selectFile = function(uiElement, filePath) {
        TSCORE.PerspectiveManager.clearSelectedFiles();
    };

    var clearSelectedFiles = function() {

    };
    
    var removeFileUI = function(filePath) {

    };    
    
    var updateFileUI = function(oldFilePath, newFilePath) {

    };     
	
	var getNextFile = function (filePath) {
        var nextFilePath;
        var self = this;
        this.searchResults.forEach(function(entry, index) {
            if(entry[TSCORE.fileListFILEPATH] === filePath) {
                var nextIndex = index+1;
                if(nextIndex < self.searchResults.length) {
                    nextFilePath = self.searchResults[nextIndex][TSCORE.fileListFILEPATH];
                } else {
                    nextFilePath = self.searchResults[0][TSCORE.fileListFILEPATH];
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
        var self = this;
        this.searchResults.forEach(function(entry, index) {
            if(entry[TSCORE.fileListFILEPATH] === filePath) {
                var prevIndex = index-1;
                if(prevIndex >= 0) {
                    prevFilePath = self.searchResults[prevIndex][TSCORE.fileListFILEPATH];
                } else {
                    prevFilePath = self.searchResults[self.searchResults.length-1][TSCORE.fileListFILEPATH];
                }
            }
            console.log("Path: "+entry[TSCORE.fileListFILEPATH]);
        });
        TSCORE.PerspectiveManager.clearSelectedFiles();
        console.log("Prev file: "+prevFilePath);
        return prevFilePath;
	};
		
	// Vars
	exports.Title 					= extensionTitle;
	exports.ID 						= extensionID;   
	exports.Type 					= extensionType;
	exports.Icon 					= extensionIcon;
	exports.Version 				= extensionVersion;
	exports.ManifestVersion 		= extensionManifestVersion;
	exports.License 				= extensionLicense;
	
	// Methods
	exports.init					= init;
	exports.load					= load;
	exports.clearSelectedFiles		= clearSelectedFiles;
	exports.getNextFile				= getNextFile;
	exports.getPrevFile				= getPrevFile;	
    exports.removeFileUI            = removeFileUI;
    exports.updateFileUI            = updateFileUI;
     	
});