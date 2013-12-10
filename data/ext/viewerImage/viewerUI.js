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

        //TODO minimize platform specific calls
        if(isCordova) {
            this.filePath = filePath;            
        } else {
            this.filePath = "file:///"+filePath;  
        }	    
	}
	
	ExtUI.prototype.buildUI = function(uiTemplate) {
		console.log("Init UI module");
		
        this.viewContainer = $("#"+this.extensionID+"Container").empty();
        this.viewToolbar = $("#"+this.extensionID+"Toolbar").empty();
        this.viewFooter = $("#"+this.extensionID+"Footer").empty();		
		       
		var self = this;
		
        var context = {
        	id: this.extensionID,
        	imgPath: this.filePath,
        };
		//console.log(uiTemplate(context));
     	this.containerElem.html(uiTemplate(context));

    	$("#"+this.extensionID+"imgViewer")
    	.panzoom({
            $zoomIn: $("#"+this.extensionID+"ZoomIn"),
            $zoomOut: $("#"+this.extensionID+"ZoomOut"),
            contain: 'invert'
//            $zoomRange: $section.find(".zoom-range"),
//            $reset: $section.find(".reset")
        });
/*		.hammer().on("swipeleft", function(event) {
			TSCORE.FileOpener.openFile(TSCORE.PerspectiveManager.getPrevFile(this.filePath));
		})
		.hammer().on("swiperight", function(event) {
			TSCORE.FileOpener.openFile(TSCORE.PerspectiveManager.getNextFile(this.filePath));
		}); */        

        $("#"+this.extensionID+"imgViewer").parent().on('mousewheel.focal', function( e ) {
        	e.preventDefault();
        	var delta = e.delta || e.originalEvent.wheelDelta;
        	var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
        	$("#"+self.extensionID+"imgViewer").panzoom('zoom', zoomOut, {
          		increment: 0.1,
          		focal: e
        	});
      	});	    

/*
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
        )                */
	};	

	exports.ExtUI	 				= ExtUI;
});