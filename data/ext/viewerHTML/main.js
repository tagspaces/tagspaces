/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that can be found in the LICENSE file. */
/* global define */
"use strict";

var isCordova;
var isWin;
var $htmlContent;

$(document).ready(function() {
  function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  var locale = getParameterByName("locale");

  var extSettings;
  loadExtSettings();

  isCordova = parent.isCordova;
  isWin = parent.isWin;

  $htmlContent = $("#htmlContent");

  var styles = ['', 'solarized-dark', 'github', 'metro-vibes', 'clearness', 'clearness-dark'];
  var currentStyleIndex = 0;
  if (extSettings && extSettings.styleIndex) {
    currentStyleIndex = extSettings.styleIndex;
  }

  var zoomSteps = ['zoomSmallest', 'zoomSmaller', 'zoomSmall', 'zoomDefault', 'zoomLarge', 'zoomLarger', 'zoomLargest'];
  var currentZoomState = 3;
  if (extSettings && extSettings.zoomState) {
    currentZoomState = extSettings.zoomState;
  }

  $htmlContent.removeClass();
  $htmlContent.addClass('markdown ' + styles[currentStyleIndex] + " " + zoomSteps[currentZoomState]);

  $("#changeStyleButton").bind('click', function() {
    currentStyleIndex = currentStyleIndex + 1;
    if (currentStyleIndex >= styles.length) {
      currentStyleIndex = 0;
    }
    $htmlContent.removeClass();
    $htmlContent.addClass('markdown ' + styles[currentStyleIndex] + " " + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $("#resetStyleButton").bind('click', function() {
    currentStyleIndex = 0;
    $htmlContent.removeClass();
    $htmlContent.addClass('markdown ' + styles[currentStyleIndex] + " " + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $("#zoomInButton").bind('click', function() {
    currentZoomState++;
    if (currentZoomState >= zoomSteps.length) {
      currentZoomState = 6;
    }
    $htmlContent.removeClass();
    $htmlContent.addClass('markdown ' + styles[currentStyleIndex] + " " + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $("#zoomOutButton").bind('click', function() {
    currentZoomState--;
    if (currentZoomState < 0) {
      currentZoomState = 0;
    }
    $htmlContent.removeClass();
    $htmlContent.addClass('markdown ' + styles[currentStyleIndex] + " " + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $("#zoomResetButton").bind('click', function() {
    currentZoomState = 3;
    $htmlContent.removeClass();
    $htmlContent.addClass('markdown ' + styles[currentStyleIndex] + " " + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $("#printButton").on("click", function() {
    $(".dropdown-menu").dropdown('toggle');
    window.print();
  });

  if (isCordova) {
    $("#printButton").hide();
  }

  // Init internationalization
  $.i18n.init({
    ns: {namespaces: ['ns.viewerHTML']},
    debug: true,
    lng: locale,
    fallbackLng: 'en_US'
  }, function() {
    $('[data-i18n]').i18n();
  });

  function saveExtSettings() {
    var settings = {
      "styleIndex": currentStyleIndex,
      "zoomState":  currentZoomState
    };
    localStorage.setItem('viewerHTMLSettings', JSON.stringify(settings));
  }

  function loadExtSettings() {
    extSettings = JSON.parse(localStorage.getItem("viewerHTMLSettings"));
  }

});

function setContent(content, fileDirectory) {
  $htmlContent = $("#htmlContent");

  $htmlContent.append(content);

  $htmlContent.find("a[href]").each(function() {
    var currentSrc = $(this).attr("href");
    if (currentSrc.indexOf("http://") === 0 ||
        currentSrc.indexOf("https://") === 0 ||
        currentSrc.indexOf("file://") === 0 ||
        currentSrc.indexOf("data:") === 0) {
      // do nothing if src begins with http(s):// or data:
    } else {
      var path = "file://" + fileDirectory + "/" + currentSrc;
      $(this).attr("href", path);
    }
  });

  // fixing embedding of local images
  $htmlContent.find("img[src]").each(function() {
    var currentSrc = $(this).attr("src");
    if (currentSrc.indexOf("http://") === 0 ||
        currentSrc.indexOf("https://") === 0 ||
        currentSrc.indexOf("file://") === 0 ||
        currentSrc.indexOf("data:") === 0) {
      // do nothing if src begins with http(s):// or data:
    } else {
      $(this).attr("src", "file://" + fileDirectory + "/" + currentSrc);
    }
  });

  $htmlContent.find("a").bind('click', function(e) {
    e.preventDefault();
    var msg = { command: "openLinkExternally", link : $(this).attr("href") };
    window.parent.postMessage(JSON.stringify(msg), "*");
  });

}
