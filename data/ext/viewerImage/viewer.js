/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
/* global define, EXIF */
"use strict";

$(document).ready(function() {
  function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

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
  var isCordova = parent.isCordova;
  var isWeb = document.URL.indexOf('http') === 0;

  if (isCordova || isWeb) {

  } else {
    filePath = "file://" + filePath;
  }

  var $imgViewer = $("#imgViewer");

  $("#imageContent")
    .attr("src", filePath)
    .bind("load", function() {
      $(this).addClass("transparentImageBackground");
      $imgViewer.addClass("imgViewer");
      if (filePath.toLowerCase().indexOf("jpg") === (filePath.length - 3) ||
        filePath.toLowerCase().indexOf("jpeg") === (filePath.length - 4)) {
        EXIF.getData(this, function() {
          var orientation = EXIF.getTag(this, "Orientation");
          correctOrientation(orientation);
          //console.log(EXIF.pretty(this));
        });
      }
    });

  $imgViewer
    .panzoom({
      $zoomIn: $("#zoomInButton"),
      $zoomOut: $("#zoomOutButton"),
      $reset: $("#zoomResetButton"),
      minScale: 0.1,
      maxScale: 10,
      increment: 0.2,
      easing: "ease-in-out",
      contain: 'invert'
    })
    .parent().on('mousewheel.focal', function(e) {
      e.preventDefault();
      var delta = e.delta || e.originalEvent.wheelDelta;
      var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
      $imgViewer.panzoom('zoom', zoomOut, {
        increment: 0.1,
        focal: e,
        animate: false
      });
    });

  function correctOrientation(orientation) {
    var $image = $("#imageContent");
    $image.removeClass(imageRotationClass);
    console.log("ORIENTATION: " + orientation);
    switch (orientation) {
      case 8:
        imageRotationClass = "rotate270";
        break;
      case 3:
        imageRotationClass = "rotate180";
        break;
      case 6:
        imageRotationClass = "rotate90";
        break;
      case 1:
        imageRotationClass = "";
        break;
      default:
        imageRotationClass = "";
    }
    $image.addClass(imageRotationClass);
  }

  $("#rotateLeftButton").on("click", function() {
    //console.log("Rotate Left");
    var $image = $("#imageContent");
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

  $("#rotateRightButton").on("click", function() {
    //console.log("Rotate Right");
    var $image = $("#imageContent");
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

  $("#printButton").on("click", function() {
    window.print();
  });

  if (isCordova) {
    $("#zoomInButton").hide();
    $("#zoomOutButton").hide();
    $("#printButton").hide();
  }
});
