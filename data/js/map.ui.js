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

  var MB_ATTR = 'Map data &copy; <a href="http://tagspaces.org">TagSpaces</a>';
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
  var currentLat, currentLng;

  function splitValue(value, index) {
    currentLat = value.substring(0, index);
    currentLng = value.substring(index);

    return parseFloat(currentLat) + "," + parseFloat(currentLng);
  }

  function showViewLocation() {
    tagSpacesMap.setView(new L.LatLng(51.51, 27.95), 3);
  }

  function showGeoLocation(coordinate) {
    showViewLocation();
    tileLayer.addTo(tagSpacesMap);
    var regExp = /^([-+]?)([\d]{1,2})(((\.)(\d+)(,)))(\s*)(([-+]?)([\d]{1,3})((\.)(\d+))?)$/g;

    var currentCoordinate;
    if (coordinate.lastIndexOf('+') !== -1) {
      currentCoordinate = splitValue(coordinate, coordinate.lastIndexOf('+'));
    } else if (coordinate.lastIndexOf('-') !== -1) {
      currentCoordinate = splitValue(coordinate, coordinate.lastIndexOf('-'));
    }
    var geoTag = TSCORE.selectedTag === 'geoTag';

    if (geoTag) {
      showViewLocation();
    }

    if (regExp.exec(currentCoordinate)) {
      tagSpacesMap.setView([currentLat, currentLng], 13);

      var getCoord = L.latLng(currentLat, currentLng);
      addMarker(getCoord);
    } else {
      showViewLocation();
      //tagSpacesMap.setView([54.5259614, +15.2551187], 5);
    }
  }

  function addMarker(currentCoord) {
    //var getLatLng = L.latLng(currentLat, currentLng);

    // Add marker to map at click location; add popup window
    if (typeof marker === 'undefined') {
      if (currentCoord.latlng) {
        marker = new L.marker(currentCoord.latlng, {
          draggable: true,
          showOnMouseOver: true
        }).update();
      } else {
        marker = new L.marker(currentCoord, {
          draggable: true,
          showOnMouseOver: true
        }).update();
      }
      marker.addTo(tagSpacesMap);
    } else {
      if (currentCoord.latlng) {
        marker.setLatLng(currentCoord.latlng);
      } else {
        marker.setLatLng(currentCoord);
      }
    }
  }

  function removeMarker(e) {
    //tagSpacesMap.removeLayer(marker);
    //if (tagSpacesMap.removeLayer(marker)) {
    //  console.log("MARKER REMOVED");
    //}
    //tagSpacesMap.clearLayers(marker);
  }

  var lat, lng;

  function onMapClick(e) {
    addMarker(e);
    parseCoordinateMap(e);
    lat = e.latlng.lat.toFixed(7);
    lng = e.latlng.lng.toFixed(7);
  }

  function parseCoordinateMap(e) {
    var date = $('#dateInputCalendar')[0];
    var long = lng >= 0 ? '+' + e.latlng.lng.toFixed(7) : '+' +  e.latlng.lng.toFixed(7);
    var dateValue = e.latlng.lat.toFixed(7) + "" + long;
    date.value = dateValue.trim();
  }

  function onLocationFound() {
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

        $('#dialogEditTag').on('hidden.bs.modal', function() {
          //removeMarker();
          if (TSCORE.selectedTag === 'geoTag') {
            TSCORE.TagUtils.removeTag(TSCORE.selectedFiles[0], TSCORE.selectedTag);
            removeMarker();
          }
        });
      }
    });
    tagSpacesMap.on('resize', function() {
      tagSpacesMap.invalidateSize();
    });

    $('#dialogEditTag').on('shown.bs.modal', function() {
      var data = $('#dateInputCalendar')[0];
      data.value = TSCORE.selectedTag;
    });

    tagSpacesMap.on('click', onMapClick);

    tagSpacesMap.on('locationfound', onLocationFound);

    tagSpacesMap.on('layeradd', function(e) {
      //console.log('layeradd', e);
    });
    
    showGeoLocation(TSCORE.selectedTag);
  }

  // Public API definition
  exports.initMap = initMap;
  exports.onLocationFound = onLocationFound;
  exports.onMapClick = onMapClick;
  exports.addMarker = addMarker;
  exports.showGeoLocation = showGeoLocation;
  exports.getLocation = getLocation;
  exports.showPosition = showPosition;
  exports.splitValue = splitValue;
});