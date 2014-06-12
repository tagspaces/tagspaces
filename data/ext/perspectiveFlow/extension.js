/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
/* global define, Handlebars  */

define(function(require, exports, module) {
"use strict";
	
	var extensionTitle = "Flow";
	var extensionID = "perspectiveFlow";  // ID should be equal to the directory name where the ext. is located
	var extensionType =  "perspective";
	var extensionIcon = "fa fa-road";
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

        $viewToolbar.html('<div  id="myToolbar"><div class="btn-group">'+ // ng-app ng-controller="myToolbarCtrl"
                '<button class="btn btn-link" data-i18n="[title]ns.perspectiveList:toggleSelectAll" title="" id="{{id}}ToogleSelectAll"><i class="fa fa-square-o fa-lg fa-fw"></i></button>'+
            '</div>'+
            '<div class="btn-group">'+
                '<button class="btn btn-link" data-i18n="[title]ns.perspectiveList:createNewFileTooltip" id="{{id}}CreateFileButton"><i class="glyphicon glyphicon-plus fa-lg"></i></button>'+
                '<button class="btn btn-link" data-i18n="[title]ns.perspectiveList:showSubfolderContentTooltip" id="{{id}}IncludeSubDirsButton"><i class="fa fa-retweet fa-lg"></i></button>'+
                '<button class="btn btn-link" data-i18n="[title]ns.perspectiveList:addRemoveTagsTooltip" id="{{id}}TagButton"><i class="fa fa-tag fa-lg"></i></button>'+
                '<button class="btn btn-link" data-i18n="[title]ns.perspectiveList:toggleThumbnailsTooltip" data-toggle="button" id="{{id}}ShowTmbButton"><i class="fa fa-picture-o fa-lg"></i></button>'+
                '<button class="btn btn-link" data-i18n="[title]ns.perspectiveList:increasThumbnailsTooltip" id="{{id}}IncreaseThumbsButton"><i class="fa fa-search-plus fa-lg"></i></button>'+
            '</div>'+
            '<div class="btn-group" data-toggle="buttons-checkbox">'+
                '<button class="btn btn-link" data-i18n="[title]ns.perspectiveList:toggleFileDetailsTooltip" id="{{id}}ShowFileDetailsButton"><i class="fa fa-list-alt fa-lg"></i></button>'+
            '</div></div>');

        $viewContainer.html('<table ng-app ng-controller="myCtrl" id="myTable" cellpadding="0" cellspacing="0" border="0" style="width: 100%" class="table content disableTextSelection"><thead>'+
            '<tr role="row">'+
                '<th class="fileTitle noWrap" tabindex="0" rowspan="1" colspan="1">File Ext.</th>'+
                '<th class="fileTitle forceWrap" tabindex="0" rowspan="1" colspan="1" aria-sort="ascending">Title</th>'+
                '<th class="fileTitle" tabindex="0" rowspan="1" colspan="1" >Tags</th>'+
                '<th class="fileTitle" rowspan="1" colspan="1">Size</th>'+
                '<th class="fileTitle" tabindex="0" rowspan="1" colspan="1">Last Modified</th>'+
                '<th class="fileTitle sorting" tabindex="0" rowspan="1" colspan="1">File Path</th>'+
            '</tr></thead><tbody>'+
            '<tr ng-repeat="entry in data" ng-click="selectFile(entry[5])" ng-dblclick="openFile(entry[5])">'+
                '<td class="fileTitle noWrap">'+
                    '<button filepath="{{entry[5]}}" class="btn btn-link fileSelection"><i class="fa fa-square-o"></i></button>'+
                    '<button filepath="{{entry[5]}}" ng-click="" class="btn btn-link fileTitleButton ui-draggable"><span class="fileExt"><span>{{entry[0]}}</span>&nbsp;<span class="caret white-caret"></span></span></button>'+
                '</td>'+
                '<td class="fileTitle forceWrap">{{entry[1]}}</td>'+
                '<td class="fileTitle">'+
                    '<button ng-repeat="tag in entry[2]" ng-click="openContextMenu($event, entry[5], tag)" class="btn btn-sm tagButton ui-draggable" tag="{{tag}}" filepath="{{entry[5]}}" style="">{{tag}} <span class="caret"></span></button>'+
                '</td>'+
                '<td class="fileTitle">{{entry[3]}}</td>'+
                '<td class="fileTitle">{{entry[4]}}</td>'+
                '<td class="fileTitle">{{entry[5]}}</td>'+
            '</tr>'+
        '</tbody></table>');

        require([
            extensionDirectory+'/angular.min.js',
            extensionDirectory+'/angular-touch.min.js',
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

        if(tableScope === undefined) {
            window.setTimeout( function() { tableScope.update(); }, 1000);
        } else {
            tableScope.update();
        }
    };

    var selectFile = function(uiElement, filePath) {
        TSCORE.PerspectiveManager.clearSelectedFiles();

        $(uiElement).parent().parent().toggleClass("ui-selected");
        $(uiElement).parent().parent().find(".fileSelection").find("i")
            .toggleClass("fa-check-square")
            .toggleClass("fa-square-o");

        TSCORE.selectedFiles.push(filePath);
        //handleElementActivation();
    };

    var clearSelectedFiles = function() {

    };
    
    var removeFileUI = function(filePath) {

    };    
    
    var updateFileUI = function(oldFilePath, newFilePath) {

    };     
	
	var getNextFile = function (filePath) {

	};

	var getPrevFile = function (filePath) {

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