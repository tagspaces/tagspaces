/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
  'use strict';
  console.log('Loading directorybrowser.js ...');
  var hopscotch = require('hopscotch');
  var TSCORE = require('tscore');

  var nextI18N = $.i18n.t('ns.dialogs:titleWaiting'); // not working
  //console.log("nextI18N "+ nextI18N);

  var tour = {
    id: "gettingstarted",
    steps: [
      {
        title: "Welcome to TagSpaces!",
        content: "Start using TagSpaces by connecting a location from your device to TagSpaces.",
        target: "locationName",
        placement: "bottom",
        onNext: function() {
          $("#locationsList").css("display","block");
        }
      },
      {
        title: "Connecting location",
        content: "Connect ",
        target: "createNewLocation",
        placement: "bottom",
        onNext: function() {
          $("#locationsList").css("display","");
          $('#tagGroupsContent').hide();
          $('#contactUsContent').hide();
          $('#locationContent').show();
          $('#showTagGroups').removeClass('active');
          $('#contactUs').removeClass('active');
          $('#showLocations').addClass('active');
          $('.col1 .row2').addClass("uiEmphasizer");
        }
      },
      {
        title: "Your folder navigator",
        content: "...",
        target: "showLocations",
        placement: "top",
        onNext: function() {
          $('#locationContent').hide();
          $('#contactUsContent').hide();
          $('#tagGroupsContent').show();
          $('#showLocations').removeClass('active');
          $('#contactUs').removeClass('active');
          $('#showTagGroups').addClass('active');
          $('.col1 .row2').removeClass("uiEmphasizer");
          $('#tagGroupsContent').addClass("uiEmphasizer");
        },
        xOffset: -60,
        arrowOffset: 60,
      },
      {
        title: "Your tag library",
        content: "...",
        target: "showTagGroups",
        placement: "top",
        onNext: function() {
          $('#tagGroupsContent').removeClass("uiEmphasizer");
          $('#contactUsContent').addClass("uiEmphasizer");
          $('#locationContent').hide();
          $('#tagGroupsContent').hide();
          $('#contactUsContent').show();
          $('#showLocations').removeClass('active');
          $('#showTagGroups').removeClass('active');
          $('#contactUs').addClass('active');
        }
      },
      {
        title: "About the project",
        content: "Here you'll find useful information and links regarding the TagSpaces project",
        target: "contactUs",
        placement: "top",
        onNext: function() {
          $('#contactUsContent').removeClass("uiEmphasizer");
        },
        xOffset: -120,
        arrowOffset: 120,
      },
      {
        title: "Settings",
        content: "This button will open the settings dialog of the app, where you can change language of the user interface or manage the file associations.",
        target: "openOptions",
        placement: "top",
        onNext: function() {
          $('#closeLeftPanel').addClass("uiEmphasizer");
        },
        xOffset: -220,
        arrowOffset: 220,
      },
      {
        title: "Closing side panel",
        content: ".",
        target: "closeLeftPanel",
        placement: "bottom",
        onNext: function() {
          $('#closeLeftPanel').removeClass("uiEmphasizer");
          $('#closeLeftPanel').click();
          $('#viewContainers').addClass("uiEmphasizer");
        },
        xOffset: -220,
        arrowOffset: 220,
      },
      {
        title: "Main area",
        content: ".",
        target: "viewContainers",
        placement: "top",
        onNext: function() {
          $('#viewContainers').removeClass("uiEmphasizer");
        },
        yOffset: 220,
        xOffset: 'center',
        arrowOffset: 'center',
      },
    ],
    onEnd: function() {
      closeTour();
    },
    onClose: function() {
      closeTour();
    },
    showCloseButton: true,
    showNextButton: true,
    i18n: {
      nextBtn: nextI18N,
    }
  };

  function closeTour() {
    $('#openLeftPanel').click();
    $("#locationsList").css("display","");
    $('#tagGroupsContent').removeClass("uiEmphasizer");
    $('#contactUsContent').removeClass("uiEmphasizer");
    $('#closeLeftPanel').removeClass("uiEmphasizer");
    $('.col1 .row2').removeClass("uiEmphasizer");
    $('#viewContainers').removeClass("uiEmphasizer");
  }

  exports.closeTour = closeTour();

  exports.startTour = function() {
    // Start the tour!
    TSCORE.openLeftPanel();
    hopscotch.startTour(tour);
  };

});