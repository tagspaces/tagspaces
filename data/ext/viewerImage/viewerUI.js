/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";
	
console.log("Loading UI for Image Viewer");

	var TSCORE = require("tscore");

	var TMB_SIZES = [ "100px", "200px", "300px", "400px", "500px" ];

	function ExtUI(extID, extContainerID, filePath) {
		this.extensionID = extID;
	    this.containerElem = $('#'+extContainerID);
	
	    this.filePath = "file:///"+filePath;
	}
	
	ExtUI.prototype.buildUI = function() {
		console.log("Init UI module");
		
        this.viewContainer = $("#"+this.extensionID+"Container").empty();
        this.viewToolbar = $("#"+this.extensionID+"Toolbar").empty();
        this.viewFooter = $("#"+this.extensionID+"Footer").empty();		
		       
		var self = this;
		
		this.containerElem.addClass("row-fluid");

        this.containerElem.append($("<div>", { 
         //   class: "span11",
        })
        .append($('<img>', {
            id: "imgViewer",
            style: "max-width: 100%; max-height: 100%; display: block; margin-left: auto; margin-right: auto ", 
            src: this.filePath
        })
        ));
/*		
		this.containerElem.append($("<div>", { 
			class: "btn-group btn-group-vertical span1",
			//style: "margin: 0px",
			id: this.extensionID+"Toolbar", 			
	    })

        .append($("<button>", { 
            class: "btn ",
            title: "Toggle Select All Files",
            id: this.extensionID+"ToogleSelectAll",    
        })
        .click(function() {
            $("#imgViewer").pixastic("brightness", {brightness:60});
        })
        .append( "<i class='icon-sun'>" )
        )	
        
        .append($("<button>", { 
            class: "btn ",
            title: "Toggle Select All Files",
            id: this.extensionID+"ToogleSelectAll",    
        })
        .click(function() {
            $("#imgViewer").pixastic("rotate", {angle:90});         
        })
        .append( "<i class='icon-sun'>" )
        )                  	    

        .append($("<button>", { 
            class: "btn ",
            title: "Toggle Select All Files",
            id: this.extensionID+"ToogleSelectAll",    
        })
        .click(function() {
            Caman('#imgViewer', function () {
                this.saturation(-30);
                this.render();
            });          
        })
        .append( "<i class='icon-sun'>" )
        )      
        
        .append($("<button>", { 
            class: "btn ",
            title: "Toggle Select All Files",
            id: this.extensionID+"ToogleSelectAll",    
        })
        .click(function() {
            Caman('#imgViewer', function () {
                this.contrast(30);
                this.render();
            });          
        })
        .append( "<i class='icon-sun'>" )
        )        
        
        .append($("<button>", { 
            class: "btn ",
            title: "Rotate",
            id: this.extensionID+"ToogleSelectAll",    
        })
        .click(function() {
            Caman('#imgViewer', function () {
                this.rotate(90);
                this.render();
            });          
        })
        .append( "<i class='icon-sun'>" )
        )                
		
	    ); // end toolbar    		
*/
    
	    
	}	

	exports.ExtUI	 				= ExtUI;
});