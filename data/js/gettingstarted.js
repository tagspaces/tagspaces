/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
  'use strict';
  console.log('Loading directorybrowser.js ...');
  var hopscotch = require('hopscotch');
  var TSCORE = require('tscore');

  require([
    "css!libs/hopscotch/dist/css/hopscotch.min.css",
  ], function() {
  });

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
    $('#openOptions').removeClass("uiEmphasizer");
  }

  function startTour() {
    var tour = {
      id: "gettingstarted",
      steps: [
        {
          title: $.i18n.t('ns.common:welcomeTitle'),
          content: $.i18n.t('ns.common:welcomeContent'),
          target: "locationName",
          placement: "bottom",
          onNext: function() {
            $("#locationsList").css("display", "block");
            $("#createNewLocation").addClass("uiEmphasizer");
          }
        },
        {
          title: $.i18n.t('ns.common:connectingLocationTitle'),
          content: $.i18n.t('ns.common:createNewLocationContent'),
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
          title: $.i18n.t('ns.common:folderNavigatorTitle'),
          content: $.i18n.t('ns.common:showLocationsContent'),
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
          title: $.i18n.t('ns.common:taglibraryTitle'),
          content: $.i18n.t('ns.common:tagGroupsContent'),
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
          title: $.i18n.t('ns.common:aboutTitle'),
          content: $.i18n.t('ns.common:usefulinformationContent'),
          target: "contactUs",
          placement: "top",
          onNext: function() {
            $('#contactUsContent').removeClass("uiEmphasizer");
            $('#openOptions').addClass("uiEmphasizer");
          },
          xOffset: -120,
          arrowOffset: 120,
        },
        {
          title: $.i18n.t('ns.common:settingsTitle'),
          content: $.i18n.t('ns.common:settingsdialogContent'),
          target: "openOptions",
          placement: "top",
          onNext: function() {
            $('#closeLeftPanel').addClass("uiEmphasizer");
            $('#openOptions').removeClass("uiEmphasizer");
          },
          xOffset: -220,
          arrowOffset: 220,
        },
        {
          title: $.i18n.t('ns.common:closingpanelTitle'),
          content: $.i18n.t('ns.common:leftpanelContent'),
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
          title: $.i18n.t('ns.common:perspectiveTitle'),
          content: $.i18n.t('ns.common:perspectiveviewContent'),
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
          title: $.i18n.t('ns.common:perspectiveswitchTitle'),
          content: $.i18n.t('ns.common:supportedperspectivesContent'),
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
          title: $.i18n.t('ns.common:searchTitle'),
          content: $.i18n.t('ns.common:searchareaContent'),
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
          title: $.i18n.t('ns.common:openingleftpanelTitle'),
          content: $.i18n.t('ns.common:openingleftpanelagainContent'),
          target: "openLeftPanel",
          placement: "bottom",
          onNext: function() {
            $('#openLeftPanel').removeClass("uiEmphasizer");
            $('#openLeftPanel').click();
          },
        },
        {
          title: $.i18n.t('ns.common:enjoyTitle'),
          content: $.i18n.t('ns.common:thankyouContent'),
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
        nextBtn: $.i18n.t('ns.common:next'),
        prevBtn: $.i18n.t('ns.common:prev'),
        doneBtn: $.i18n.t('ns.common:done'),
        closeTooltip: $.i18n.t('ns.common:closeTooltip'),
      }
    };

    // Preparations
    TSCORE.clearSearchFilter();
    TSCORE.openLeftPanel();

    // Start the tour!
    hopscotch.startTour(tour);
  }

  function stopTour() {
    hopscotch.endTour();
  }

  exports.stopTour = stopTour;
  exports.startTour = startTour;

});