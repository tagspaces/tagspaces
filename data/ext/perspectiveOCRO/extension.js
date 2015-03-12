/* Copyright (c) 2014-2015 The TagSpaces Authors. All rights reserved.
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

    var controller;

	function init() {
		console.log("Initializing perspective "+extensionID);

        $viewContainer = $("#"+extensionID+"Container");
        $viewToolbar = $("#"+extensionID+"Toolbar");
        $viewFooter = $("#"+extensionID+"Footer");

        $viewContainer.empty();
        $viewToolbar.empty();
        $viewFooter.empty();

        require([
            extensionDirectory+'/templates.js',
            extensionDirectory+'/controller.js',
            "text!"+extensionDirectory+"/DesktopTMPL.html",
            "css!"+extensionDirectory+"/extension.css",
            "css!"+extensionDirectory+"/fontello/css/fontello.css"
        ], function(templates, ctrl, desktoptmpl) {
            controller = ctrl;

            // Adding UI blocks
            $viewToolbar.html(templates.mainToolBar({"id":extensionID}));

            templates.homeScreen = Handlebars.compile( desktoptmpl );

            $("body").append(templates.dialogOCSetting());

            ctrl.init(extensionID,templates);

            ctrl.showHomeScreen();

            initUI();
        });
	}

    var initUI = function() {
        $("#"+extensionID+"ReloadFolderButton")
            .click(function() {
                TSCORE.navigateToDirectory(TSCORE.currentPath);
            });

        $("#"+extensionID+"searchBoxOC")
            .keyup(function(e) {
                // On enter fire the search
                if (e.keyCode === 13) {
                    searchOC(TSCORE.Search.nextQuery);
                }  else {
                    TSCORE.Search.nextQuery = this.value;
                }
                if (this.value.length === 0) {
                    TSCORE.PerspectiveManager.redrawCurrentPerspective();
                }
            })
    };

    var searchOC = function(query) {
        controller.searchOC(query);
    };

    var makeUIReadOnly = function () {
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

        //TODO hide unneeded area settings

    };

	var load = function () {
		console.log("Loading data in "+extensionID);

        // Clear old data
        $viewContainer.children().remove();
        $viewFooter.children().remove();

        makeUIReadOnly();

        if(controller !== undefined) {
            controller.load();
        }
    };

    var selectFile = function(uiElement, filePath) {
        TSCORE.PerspectiveManager.clearSelectedFiles();
    };

    var desktopTPML = Handlebars.compile(
        '<div style="box-sizing: border-box; display: block">'+
        '<ul style="padding: 0; margin: auto; box-sizing: border-box; display: block">'+
        '{{#each desktop}}'+
            '<li title="{{descriptionEn}}" data-filepath="{{filepath}}" style="">'+
                '<span><i class="{{icon}}" style="font-size: 200%;"></i></span>'+
                '<p class="">{{nameEn}}</p>' +
                '<button class="btn btn-link" data-filepath="{{path}}">Navigate</button>'+
            '</li>'+
        '{{/each}}'+
        '</ul>'+
        '</div>'
    );

    var clearSelectedFiles = function() {

    };
    
    var removeFileUI = function(filePath) {

    };    
    
    var updateFileUI = function(oldFilePath, newFilePath) {

    };     
	
	var getNextFile = function (filePath) {
        return controller.getNextFile(filePath)
    };

	var getPrevFile = function (filePath) {
        return controller.getPrevFile(filePath)
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