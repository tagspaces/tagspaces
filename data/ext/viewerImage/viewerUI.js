/* Copyright (c) 2012-2014 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
/* global define, isCordova */

define(function(require, exports, module) {
"use strict";

console.log("Loading UI for Image Viewer");

    var TSCORE = require("tscore");

    function ExtUI(extID, extContainerID, filePath) {
        this.extensionID = extID;
        this.containerElem = $('#'+extContainerID);

        this.internPath = filePath;

        if(isCordova || isWeb) {
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
            imgPath: this.filePath
        };
        //console.log(uiTemplate(context));
        this.containerElem.append(uiTemplate(context));

        if(isCordova) {
            $("#"+this.extensionID+"ZoomOut").hide();
            $("#"+this.extensionID+"ZoomIn").hide();
        }

        $("#"+this.extensionID+"imgViewer")
            .panzoom({
                $zoomIn: $("#"+this.extensionID+"ZoomIn"),
                $zoomOut: $("#"+this.extensionID+"ZoomOut"),
                $reset: $("#"+this.extensionID+"ZoomReset"),
                //contain: true,
                easing: "ease-in-out",                
                contain: 'invert'
    //            $zoomRange: $section.find(".zoom-range"),
    //            $reset: $section.find(".reset")
            })
            .hammer().on("swipeleft", function() {
                TSCORE.FileOpener.openFile(TSCORE.PerspectiveManager.getNextFile(self.internPath));
            })
            .hammer().on("swiperight", function() {
                TSCORE.FileOpener.openFile(TSCORE.PerspectiveManager.getPrevFile(self.internPath));
            })
            .parent().on('mousewheel.focal', function( e ) {
                e.preventDefault();
                var delta = e.delta || e.originalEvent.wheelDelta;
                var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
                $("#"+self.extensionID+"imgViewer").panzoom('zoom', zoomOut, {
                    increment: 0.1,
                    focal: e
                });
            });

        // Image Processing
        $("#"+this.extensionID+"Brighter")
            .click(function() {
                $("#"+self.extensionID+"imgViewer").pixastic("brightness", {brightness:60});
            });
        
        $("#"+this.extensionID+"RotateLeft")
            .click(function() {
                console.log("Rotate");
                $("#"+self.extensionID+"imgViewer").pixastic("rotate", {angle:90});         
            });
    };
    
    exports.ExtUI		= ExtUI;
});