/* Copyright (c) 2012-2014 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
/* global define, isCordova */

$(document).ready(function() {
    var filePath = getParameterByName("cp");
    /*$.ajax({
        url: fileURL,//"file://"+filePath,
        type: 'POST'
    })
        .done(function(data) {
            cleanContent(data);
        })
        .fail(function(data) {
            console.log("AJAX failed "+data);
        }); */

    var imageRotationClass = "";
    var isCordova = document.URL.indexOf( 'file:///android_asset' ) === 0;
    var isWeb = document.URL.indexOf( 'http' ) === 0;

    if(isCordova || isWeb) {

    } else {
        filePath = "file://"+filePath;
    }

    if(isCordova) {
        $("#zoomInButton").hide();
        $("#zoomOutButton").hide();
        $("#printButton").hide();
    }

    var $imgViewer = $("#imgViewer");

    $imgViewer.append($('<img>', {
            src: filePath,
            style: "background: repeating-linear-gradient(45deg, #d5d5d5, #d5d5d5 10px, #a7a7a7 10px, #a7a7a7 20px)",
            id: "Image"
        })
    );

    console.log("inner html: "+$("#Image").attr("src"));

    $imgViewer
        .panzoom({
            $zoomIn: $("#zoomInButton"),
            $zoomOut: $("#zoomOutButton"),
            $reset: $("#zoomResetButton"),
            //contain: true,
            easing: "ease-in-out",
            contain: 'invert'
//            $zoomRange: $section.find(".zoom-range"),
//            $reset: $section.find(".reset")
        })
        //.hammer().on("swipeleft", function() {
        //    TSCORE.FileOpener.openFile(TSCORE.PerspectiveManager.getNextFile(internPath));
        //})
        //.hammer().on("swiperight", function() {
        //    TSCORE.FileOpener.openFile(TSCORE.PerspectiveManager.getPrevFile(internPath));
        //})
        .parent().on('mousewheel.focal', handleMouseWheel );

    $("#rotateLeftButton").on("click",function() {
        //console.log("Rotate Left");
        var $image = $("#Image");
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

    $("#rotateRightButton").on("click",function() {
        //console.log("Rotate Right");
        var $image = $("#Image");
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

    $("#printButton").on("click",function() {
        window.print();
    });
});

function handleMouseWheel(e) {
    e.preventDefault();
    var delta = e.delta || e.originalEvent.wheelDelta;
    var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
    $("#imgViewer").panzoom('zoom', zoomOut, {
        increment: 0.1,
        focal: e,
        animate: false
    });
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}