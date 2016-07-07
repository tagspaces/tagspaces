/* Copyright (c) 2012-2016 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

/* global define, Handlebars, isNode, isFirefox */
define(function(require, exports, module) {
  'use strict';
  console.log('Loading map.ui.js ...');

  var TSCORE = require('tscore');
  var TSPOSTIO = require("tspostioapi");

  require('leaflet');
  require('leafletlocate');

  // TagSpaces Map
  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showLocationNotFound);
    } else {
      TSCORE.showAlertDialog("Geolocation is not supported by this browser.");
    }
  }

  function showPosition(position) {
    var lat = position.coords.latitude;
    var long = position.coords.longitude;
  }

  function showLocationNotFound(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        TSCORE.showAlertDialog("User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        TSCORE.showAlertDialog("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        TSCORE.showAlertDialog("The request to get user location timed out.");
        break;
    }
  }

  var ACCESS_TOKEN = 'pk.eyJ1Ijoia3Jpc3RpeWFuZGQiLCJhIjoiY2lweHVlam5rMDA3Y2k0bTJ4Z3l2ZzFxdyJ9.6pyZff5AHe9xPRX7FcjwCw';
  var MB_ATTR = 'Map data &copy; <a href="http://tagspaces.org">TagSpaces</a>';
  var MB_URL = 'https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}?access_token=' + ACCESS_TOKEN;
  var OSM_URL = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  var OSM_ATTRIB = '';
  var tagSpacesMapOptions = {
    //layers: [MB_ATTR],
    zoomControl: true,
    detectRetina: true
  };
  var tagSpacesMap = L.map('mapTag', tagSpacesMapOptions);
  var tileLayer = L.tileLayer(OSM_URL, {
    attribution: MB_ATTR,
    id: 'tagSpacesMap'
  });
  var marker;
  //
  //var trackMe = L.control.locate({
  //  position: 'topright',
  //  strings: {
  //    title: $.i18n.t('ns.dialogs:yourLocation') //
  //  }
  //}).addTo(tagSpacesMap);
  var currentLat, currentLong;

  function splitValue(value, index) {
    currentLat = value.substring(0, index);
    currentLong = value.substring(index);

    return currentLat + "," + currentLong;
  }

  function showGeoLocation(coordinate) {

    tagSpacesMap.setView(new L.LatLng(54.5259614, -15.2551187), 5);
    //tagSpacesMap.addLayer(tileLayer);
    tileLayer.addTo(tagSpacesMap);
    var regExp = /^([-+]?)([\d]{1,2})(((\.)(\d+)(.)))(\s*)(([-+]?)([\d]{1,3})((\.)(\d+))?)$/g;

    var currentCoordinate;
    if (coordinate.lastIndexOf('+') !== -1) {
      currentCoordinate = splitValue(coordinate, coordinate.lastIndexOf('+'));
    } else if (coordinate.lastIndexOf('-') !== -1) {
      currentCoordinate = splitValue(coordinate, coordinate.lastIndexOf('-'));
    } else {
      console.log('Invalid coordinate date.');
    }

    if (!regExp.exec(currentCoordinate)) {
      tagSpacesMap.setView([54.5259614, +15.2551187], 5);
    } else {
      tagSpacesMap.setView([currentLat, currentLong], 13);
      marker = L.marker([currentLat, currentLong], {
        draggable: true
      }).addTo(tagSpacesMap).bindPopup('Tag', {showOnMouseOver: true});
    }
  }

  function addMarker(currentCoord) {
    // Add marker to map at click location; add popup window
    if (typeof marker === 'undefined') {
      marker = new L.marker(currentCoord.latlng, {
        draggable: true,
        showOnMouseOver: true
      }).update();
      marker.addTo(tagSpacesMap);
    } else {
      marker.setLatLng(currentCoord.latlng);
    }
  }

  function removeMarker() {
    //tagSpacesMap.removeLayer(marker);
    if (tagSpacesMap.removeLayer(marker)) {
      console.log("MARKER REMOVED");
    }
  }

  var lat, lng;
  var latlng;

  function onMapClick(e) {
    addMarker(e);
    parseCoordinateMap(e);
    lat = e.latlng.lat.toFixed(7);
    lng = e.latlng.lng.toFixed(7);
  }

  function parseCoordinateMap(e) {
    var date = $('#coordinateMap')[0];
    var long = lng >= 0 ? '+' + lng : lng;
    var dateValue = e.latlng.lat.toFixed(7) + "" + long;
    date.value = dateValue.trim();
  }

  function tagYourself() {
    tagSpacesMap.locate({
      setView: true,
      watch: true
    }) /* This will return map so you can do chaining */.on('locationfound', function(e) {
      var marker = L.marker([e.latitude, e.longitude]).bindPopup('Current position', {showOnMouseOver: true});
      var circle = L.circle([e.latitude, e.longitude], e.accuracy / 2, {
        weight: 1,
        color: 'blue',
        fillColor: '#cacaca',
        fillOpacity: 0.2
      });
      tagSpacesMap.addLayer(marker);
      tagSpacesMap.addLayer(circle);
    }).on('locationerror', function(error) {
      showLocationNotFound(error);
    });
  }

  function initMap() {
    $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
      var target = $(e.target).attr("href"); // activated tab
      if (target === "#geoLocation") {
        tagSpacesMap.invalidateSize();

        $('#editTagButton').click(function() {
          var longitude = lng >= 0 ? '+' + lng : lng;
          latlng = lat + "" + longitude;
          console.log(latlng);
          TSCORE.TagUtils.renameTag(TSCORE.selectedFiles[0], TSCORE.selectedTag, latlng.trim());
        });

        $('#dialogEditTag').on('hidden.bs.modal', function() {
          removeMarker();
        });
      }
    });
    tagSpacesMap.on('resize', function() {
      tagSpacesMap.invalidateSize();
    });

    $('#dialogEditTag').on('shown.bs.modal', function() {
      var date = $('#coordinateMap')[0];
      date.value = TSCORE.selectedTag;
    });

    tagSpacesMap.on('click', onMapClick);

    showGeoLocation(TSCORE.selectedTag);
  }

  // Public API definition
  exports.initMap = initMap;
  exports.tagYourself = tagYourself;
  exports.onMapClick = onMapClick;
  exports.addMarker = addMarker;
  exports.showGeoLocation = showGeoLocation;
  exports.getLocation = getLocation;
  exports.showPosition = showPosition;
});