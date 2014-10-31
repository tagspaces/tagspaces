/* Copyright (c) 2012-2014 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
/* global define, isCordova */

define(function(require, exports, module) {
"use strict";

console.log("Loading UI for Image Viewer");

    var TSCORE = require("tscore");

    var extensionID;
    var $containerElem;
    var internPath;
    var filePath;
    var imageRotationClass;

    function ExtUI(extID, extContainerID, filePth, uiTemplate) {
        imageRotationClass = "";
        extensionID = extID;
        $containerElem = $('#'+extContainerID);
        internPath = filePth;

        if(isCordova || isWeb) {
            filePath = filePth;
        } else {
            filePath = "file:///"+filePth;
        }

        //$("#"+extensionID+"Image").unbind();
        //$("#"+extensionID+"Image").remove();

        $containerElem.children().remove();

        var context = {
            id: extensionID,
            imgPath: filePath
        };
        //console.log(uiTemplate(context));

        $containerElem.attr("style","width: 100%; height: 100%; background-color: white;");

        $containerElem.append(uiTemplate(context));

        if(isCordova) {
            $("#"+extensionID+"ZoomOut").hide();
            $("#"+extensionID+"ZoomIn").hide();
        }

        $("#"+extensionID+"imgViewer")
            .panzoom({
                $zoomIn: $("#"+extensionID+"ZoomIn"),
                $zoomOut: $("#"+extensionID+"ZoomOut"),
                $reset: $("#"+extensionID+"ZoomReset"),
                //contain: true,
                easing: "ease-in-out",                
                contain: 'invert'
    //            $zoomRange: $section.find(".zoom-range"),
    //            $reset: $section.find(".reset")
            })
            .hammer().on("swipeleft", function() {
                TSCORE.FileOpener.openFile(TSCORE.PerspectiveManager.getNextFile(internPath));
            })
            .hammer().on("swiperight", function() {
                TSCORE.FileOpener.openFile(TSCORE.PerspectiveManager.getPrevFile(internPath));
            })
            .parent().on('mousewheel.focal', handleMouseWheel );

        function handleMouseWheel(e) {
            e.preventDefault();
            var delta = e.delta || e.originalEvent.wheelDelta;
            var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
            $("#"+extensionID+"imgViewer").panzoom('zoom', zoomOut, {
                increment: 0.1,
                focal: e
            });
        }

        // Image Processing
        /*$("#"+extensionID+"Brighter")
            .click(function() {
                $("#"+extensionID+"imgViewer").pixastic("brightness", {brightness:60});
            });*/
        
        $("#"+extensionID+"RotateLeft").on("click",function() {
                console.log("Rotate Left");
                var $image = $("#"+extensionID+"Image");
                $image.removeClass(imageRotationClass);
                switch (imageRotationClass) {
                    case "":
                        imageRotationClass = "rotate270";
                        break;
                    case "rotate270":
                        imageRotationClass = "rotate180";
                        break;
                    case "rotate180":
                        imageRotationClass = "rotate90";
                        break;
                    case "rotate90":
                        imageRotationClass = "";
                        break;
                    default:
                        imageRotationClass = "";
                }
                $image.addClass(imageRotationClass);
            });

        $("#"+extensionID+"RotateRight").on("click",function() {
            console.log("Rotate Right");
            var $image = $("#"+extensionID+"Image");
            $image.removeClass(imageRotationClass);
            switch (imageRotationClass) {
                case "":
                    imageRotationClass = "rotate90";
                    break;
                case "rotate90":
                    imageRotationClass = "rotate180";
                    break;
                case "rotate180":
                    imageRotationClass = "rotate270";
                    break;
                case "rotate270":
                    imageRotationClass = "";
                    break;
                default:
                    imageRotationClass = "";
            }
            $image.addClass(imageRotationClass);
        });

        $containerElem = null;
    }
    
    exports.ExtUI		= ExtUI;
});