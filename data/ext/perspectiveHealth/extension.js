/* Copyright (c) 2013 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";
	
	console.log("Loading perspectiveHealth");

	var extensionTitle = "Quantified Self"
	var extensionID = "perspectiveHealth";  // ID should be equal to the directory name where the ext. is located   
	var extensionType =  "perspective";
	var extensionIcon = "icon-medkit";
	var extensionVersion = "1.0";
	var extensionManifestVersion = 1;
	var extensionLicense = "AGPL";

	var TSCORE = require("tscore");
	
	var viewContainer = undefined;
	var viewToolbar = undefined;
	var viewFooter = undefined;
	
	var extensionDirectory = TSCORE.Config.getExtensionPath()+"/"+extensionID;
	
	var vizMode = "quantYours" // tree
	
	exports.init = function init() {
		console.log("Initializing View "+extensionID);
		
	    viewContainer = $("#"+extensionID+"Container").empty();
	    viewToolbar = $("#"+extensionID+"Toolbar").empty();
		viewFooter = $("#"+extensionID+"Footer").empty();
	
	    initUI();  
	}
	
	exports.load = function load() {
		console.log("Loading View "+extensionID);
        reDraw();        
	}
	
	var reDraw = function() {
	    switch (vizMode) {
          case "quantYours":
            require([
                extensionDirectory+'/quantifiedSelfViz.js',
                'css!'+extensionDirectory+'/styles.css',
                ], function(viz) {
                    d3.select("svg").remove();                
                    var svg = d3.select("#"+extensionID+"Container")
                        .append("svg")
                        .attr("width", viewContainer.width())
                        .attr("height", viewContainer.height())
                    viz.draw(svg);
                    TSCORE.hideLoadingAnimation();
            });            
            break;
	      default:
	        break;
	    }
	}
	
	exports.updateTreeData = function updateIndexData(fsTreeData) {
		console.log("Updating tree data, not supported here...");
   
		TSCORE.hideLoadingAnimation(); 
	}
	  
	exports.setFileFilter = function setFileFilter(filter) {

	}
	
	exports.clearSelectedFiles = function() {

	}
	
	var initUI = function() {
       
        viewToolbar.append($("<div >", { 
            class: "btn-group", 
            "data-toggle": "buttons-radio",        
        })  
            
            .append($("<button>", {
                    class: "btn",           
                    title: "Show Quantified Yourself Graphic",
                    id: extensionID+"QAMode",    
                    text: " Quantified Self"
                })
                .button('toggle')   
                .click(function() {
                    vizMode = "quantYours";
                    TSCORE.showLoadingAnimation();                                     
                    TSCORE.IO.createDirectoryIndex(TSCORE.currentPath);
                })
                .prepend( "<i class='icon-tasks' />")                
            )                
       ) // end button group       

	}
	
    // Vars
    exports.Title                   = extensionTitle;
    exports.ID                      = extensionID;   
    exports.Type                    = extensionType;
    exports.Icon                    = extensionIcon;
    exports.Version                 = extensionVersion;
    exports.ManifestVersion         = extensionManifestVersion;
    exports.License                 = extensionLicense;
    
    // Methods
//    exports.init                    = init;
//    exports.load                    = load;
//    exports.setFileFilter           = setFileFilter;
//    exports.clearSelectedFiles      = clearSelectedFiles;
//    exports.getNextFile             = getNextFile;
//    exports.getPrevFile             = getPrevFile;	
});