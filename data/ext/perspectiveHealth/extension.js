/* Copyright (c) 2013 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";
	
	console.log("Loading perspectiveHealth");

	var extensionTitle = "My Weight"
	var extensionID = "perspectiveHealth";  // ID should be equal to the directory name where the ext. is located   
	var extensionType =  "perspective";
	var extensionIcon = "fa fa-bar-chart-o";
	var extensionVersion = "1.0";
	var extensionManifestVersion = 1;
	var extensionLicense = "AGPL";

	var TSCORE = require("tscore");

	require("d3");
	
	var viewContainer = undefined;
	var viewToolbar = undefined;
	var viewFooter = undefined;
	
	var extensionDirectory = TSCORE.Config.getExtensionPath()+"/"+extensionID;
	
	var vizMode = "quantYours"; // tree
	
	exports.init = function init() {
		console.log("Initializing View "+extensionID);
		
	    viewContainer = $("#"+extensionID+"Container").empty();
	    viewToolbar = $("#"+extensionID+"Toolbar").empty();
		viewFooter = $("#"+extensionID+"Footer").empty();
	
	    initUI();  
	};
	
	exports.load = function load() {
		console.log("Loading View "+extensionID);
        reDraw();        
	};
	
	var reDraw = function() {
	    switch (vizMode) {
          case "quantYours":
            require([
                extensionDirectory+'/myweight2.js',
                extensionDirectory+'/nvd3/nv.d3.min.js',
                'css!'+extensionDirectory+'/styles.css',
                'css!'+extensionDirectory+'/nvd3/nv.d3.min.css',
                ], function(viz) {
                    d3.select("svg").remove();                
                    var svg = d3.select("#"+extensionID+"Container")
                        .append("svg")
                        .attr("width", viewContainer.width())
                        .attr("height", viewContainer.height()
                    );
                    viz.draw(svg);
                    TSCORE.hideLoadingAnimation();
            });            
            break;
	      default:
	        break;
	    }
	};
	
    function showAddWeightDataDialog() {
        require([
              "text!"+extensionDirectory+"/AddWeightDataDialog.html",
            ], function(uiTPL) {
                // Check if dialog already created
                if($("#dialogAddWeight").length < 1) {
                    var uiTemplate = Handlebars.compile( uiTPL );
                    $("body").append(uiTemplate()); 
                    
                    $( "#createWeightDataEntry" ).on("click", function() {        
                    	createWeightDataEntry();
                    });  
                                                     
                }
                $("#dateData").val(TSCORE.TagUtils.formatDateTime4Tag(new Date(), false));
                $("#weightData").val("0.0");
                $("#fatData").val("0.0");
                $("#watterData").val("0.0");
                $("#musclesData").val("0.0");
                $("#bonesData").val("0.0");
                $("#dialogAddWeight").modal({backdrop: 'static',show: true});
        });     
    } 	
    
    function createWeightDataEntry() { 
    	var filePath = TSCORE.currentPath+TSCORE.dirSeparator+TSCORE.TagUtils.beginTagContainer
    				  +TSCORE.Config.getTagDelimiter()+$("#dateData").val()
    				  +TSCORE.Config.getTagDelimiter()+"WEI"+$("#weightData").val()+"kg"
    				  +TSCORE.Config.getTagDelimiter()+"FAT"+$("#fatData").val()+"%"
    				  +TSCORE.Config.getTagDelimiter()+"WAT"+$("#watterData").val()+"%"
    				  +TSCORE.Config.getTagDelimiter()+"MUS"+$("#musclesData").val()+"%"
    				  +TSCORE.Config.getTagDelimiter()+"BON"+$("#bonesData").val()+"kg"
    				  +TSCORE.TagUtils.endTagContainer+".tsd";
        TSCORE.IO.saveTextFilePromise(filePath, "Weight Data Created by TagSpaces");    
    } 	    
	
	exports.updateTreeData = function updateIndexData(fsTreeData) {
		console.log("Updating tree data, not supported here...");
   
		TSCORE.hideLoadingAnimation(); 
	};
	  	
	var clearSelectedFiles = function() {
		console.log("clearSelectedFiles not implemented in "+extensionID);
	};
	
    var removeFileUI = function(filePath) {
        console.log("removeFileUI not implemented in "+extensionID);
    };    
    
    var updateFileUI = function(oldFilePath, newFilePath) {
    	console.log("updateFileUI not implemented in "+extensionID);
    };     	
    
	var getNextFile = function (filePath) {
		console.log("getNextFile not implemented in "+extensionID);
	};

	var getPrevFile = function (filePath) {
		console.log("getPrevFile not implemented in "+extensionID);
	};    
	
	var initUI = function() {

        viewToolbar.append($("<div >", { 
            class: "btn-group", 
        })  

            .append($("<button>", { 
                class: "btn btn-default",
                title: "Add new weight data",
                id: extensionID+"CreateFileButton",    
            })
            .click(function() {
            	showAddWeightDataDialog();
                //TSCORE.showFileCreateDialog();
            })
            .append( "<i class='fa fa-plus'>" )
            )
       
        ); // end button group  


        viewToolbar.append($("<div >", { 
            class: "btn-group", 
            //"data-toggle": "buttons-radio",        
        })  
            
            
            .append($("<button>", {
                    class: "btn btn-default",           
                    title: "Index the directory structure",
                    id: extensionID+"QAMode",    
                    text: " Index Subdirectories"
                })
                //.button('toggle')   
                .click(function() {
                    vizMode = "quantYours";
                    TSCORE.showLoadingAnimation();    
                    TSCORE.Utils.createDirectoryIndex(TSCORE.currentPath);
                })
                .prepend( "<i class='fa fa-tasks' />")                
            )       
        ); // end button group  
            
        viewToolbar.append($("<div >", { 
            class: "btn-group", 
        })       
            .append($("<button>", { 
                class: "btn btn-default",           
                title: "Exports current table data as CSV",
                id: extensionID+"ExportButton",    
            })
            .click(function() {
                var dialogContent = $('<textarea>', {
                    style: "width: 500px; height: 350px;",
                    text: TSCORE.exportFileListCSV(TSCORE.fileList)
                });                
                //TSCORE.showAlertDialog(dialogContent,"Export to CSV Dialog");
                console.log("Export data: "+TSCORE.exportFileListCSV(TSCORE.fileList));
            })
            .append( $("<i class='fa fa-download' />") )
            )          
                        
        ); // end toolbar

    };
	
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
	exports.clearSelectedFiles		= clearSelectedFiles;
	exports.getNextFile				= getNextFile;
	exports.getPrevFile				= getPrevFile;	
    exports.removeFileUI            = removeFileUI;
    exports.updateFileUI            = updateFileUI;	
});