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
        content: "Start using TagSpaces by choosing a location from your locale storage.",
        target: "locationName",
        placement: "bottom",
        onNext: function() {
          $("#locationsList").css("display", "block");
          $("#createNewLocation").addClass("uiEmphasizer");
        }
      },
      {
        title: "Connecting location",
        content: "If you don't have an already connected location, you can create one with this button. You can connect for example folders containing document or photos. And remember TagSpaces is <b>completely offline</b> tool so <b>no data will leave you device</b>.",
        target: "createNewLocation",
        placement: "bottom",
        onNext: function() {
          $("#createNewLocation").removeClass("uiEmphasizer");
          $("#locationsList").css("display", "");
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
        content: "In the selected area, you will find after opening of a location the subfolders of the opened location folder. Clicking on a folder will open it and list the its subfolder ",
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
        content: "Clicking on this button will open your tag library. For your convenience, it is divided in tag groups containing the single tags.",
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
        content: "Clicking on this button will open a panel, containing useful information and links regarding the TagSpaces project.",
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
        content: "This button will open the settings dialog of the app, where you can <b>change language</b> of the user interface or manage the <b>file associations</b>.",
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
        content: "This button will close the left panel, in order to have more working space for the perspectives.",
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
        title: "Perspectives area",
        content: "This is the ",
        target: "viewContainers",
        placement: "top",
        onNext: function() {
          $('#viewContainers').removeClass("uiEmphasizer");
          $('#perspectiveSwitcherButton').addClass("uiEmphasizer");
        },
        yOffset: 220,
        xOffset: 'center',
        arrowOffset: 'center',
      },
      {
        title: "Perspectives switch",
        content: "This is place where your can switch between the supported perspectives.",
        target: "perspectiveSwitcherButton",
        placement: "bottom",
        onNext: function() {
          $('#perspectiveSwitcherButton').removeClass("uiEmphasizer");
          $('#showSearchButton').addClass("uiEmphasizer");
        },
        xOffset: -220,
        arrowOffset: 220,
      },
      {
        title: "Search",
        content: "",
        target: "showSearchButton",
        placement: "bottom",
        onNext: function() {
          $('#showSearchButton').removeClass("uiEmphasizer");
          $('#openLeftPanel').addClass("uiEmphasizer");
        },
        xOffset: -275,
        arrowOffset: 275,
      },
      {
        title: "Opening the left panel",
        content: "Here you can open the left panel.",
        target: "openLeftPanel",
        placement: "bottom",
        onNext: function() {
          $('#openLeftPanel').removeClass("uiEmphasizer");
          $('#openLeftPanel').click();
        },
      },
      {
        title: "Thanks for your attention!",
        content: "Enjoy using TagSpaces.",
        target: "startNewInstanceBack",
        placement: "bottom",
        onNext: function() {
        },
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
    showPrevButton: true, // disable in production
    i18n: {
      nextBtn: nextI18N,
    }
  };

  function closeTour() {
    $('#openLeftPanel').click();
    $("#locationsList").css("display", "");
    $("#createNewLocation").removeClass("uiEmphasizer");
    $('#tagGroupsContent').removeClass("uiEmphasizer");
    $('#contactUsContent').removeClass("uiEmphasizer");
    $('#closeLeftPanel').removeClass("uiEmphasizer");
    $('.col1 .row2').removeClass("uiEmphasizer");
    $('#viewContainers').removeClass("uiEmphasizer");
    $('#showSearchButton').removeClass("uiEmphasizer");
    $('#perspectiveSwitcherButton').removeClass("uiEmphasizer");
    $('#openLeftPanel').removeClass("uiEmphasizer");
  }

  exports.closeTour = closeTour();

  exports.startTour = function() {
    // Start the tour!
    TSCORE.openLeftPanel();
    hopscotch.startTour(tour);
  };

});