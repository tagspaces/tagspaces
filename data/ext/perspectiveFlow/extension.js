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

	function init() {
		console.log("Initializing perspective "+extensionID);

        $viewContainer = $("#"+extensionID+"Container");
        $viewToolbar = $("#"+extensionID+"Toolbar");
        $viewFooter = $("#"+extensionID+"Footer");

        $viewContainer.empty();
        $viewToolbar.empty();
        $viewFooter.empty();

        //$viewContainer.html('<div ng-app><input type="text" ng-model="yourName" placeholder="Enter a name here"><hr><h1>Hello {{yourName}}!</h1></div>');

        $viewContainer.html('<div ng-app><div ng-controller="TodoCtrl"><span>{{remaining()}} of {{todos.length}} remaining</span>[ <a href="" ng-click="archive()">archive</a> ]<ul class="unstyled"><li ng-repeat="todo in todos"><input type="checkbox" ng-model="todo.done">' +
            '<span class="done-{{todo.done}}">{{todo.text}}</span></li></ul><form ng-submit="addTodo()"><input type="text" ng-model="todoText"  size="30" placeholder="add new todo here"><input class="btn-primary" type="submit" value="add"></form></div></div>');

        require([
            extensionDirectory+'/angular.min.js',
            extensionDirectory+'/controller.js'
            ], function() {

            }
        );
	}

	var load = function () {
		console.log("Loading perspective "+extensionID);

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