/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
/* global define, requirejs, _  */

// the value of this var is replaced to "true" by the build script
var PRODUCTION = "@@PRODUCTION";
var PRO = "@@PROVERSION";

// Disabling all output to console in production mode
if (PRODUCTION == "true") {
  console = console || {};
  console.log = function(){};
  console.error = function(){};
}

var isFirefox = document.URL.indexOf( 'resource://' ) === 0;
var isFirefoxOS = document.URL.indexOf( 'app://' ) === 0;
var isChrome =  document.URL.indexOf( 'chrome-extension://' ) === 0;
var isNode;
var isCordovaAndroid = document.URL.indexOf( 'file:///android_asset' ) === 0;
var isCordovaiOS= navigator.isCordovaApp == true;
var isCordova = isCordovaAndroid  == true || isCordovaiOS == true;
var isWeb = document.URL.indexOf( 'http' ) === 0;
var isOSX = navigator.appVersion.indexOf("Mac")!==-1;
var isWin = navigator.appVersion.indexOf("Win")!==-1;
//cordova ios handleOpenURL is global 
var handleOpenURL;

// Check for running in node-webkit
try {
  var fs = require('fs');
  var pathUtils = require('path');
  var gui = require('nw.gui');
  isNode = true;
} catch(e) {
  isNode = false;
  console.log("node-webkit not found!");
}

// Setting up the IO functionality according to the platform
var IO_JS = "web/web.api";
if( isFirefox ) {
  IO_JS = "mozilla/mozilla.api";
} else if ( isFirefoxOS ) {
  IO_JS = "mozilla/firefoxos.api";
} else if ( isChrome ) {
  IO_JS = "chromelight/chrome.api";
} else if (isNode){
  IO_JS = "node-webkit/node-webkit.api";
} else if (isCordova){
  IO_JS = "cordova/cordova.api";
} else if (isWeb){
  IO_JS = "web/web.api";
}

var PRO_JS = "pro/js/pro.api";
if(PRO.indexOf("@@PROVERS") == 0 || PRO == "false") { PRO_JS = 'js/pro'; }

console.log("Loading Loader - Firefox: "+isFirefox+" | ChromeExt: "+isChrome+" | Node: "+isNode+" | Cordova: "+isCordova+" | Web: "+isWeb+" | isWin: "+isWin);

requirejs.config({
  map: {
    '*': {
      'css':   'libs/requirecss/css',
      'text':  'libs/requiretext/text'
    }
  },
  paths: {
    jquery:                 'libs/jquery/jquery-2.1.1.min',
    jqueryui:               'libs/jqueryui/jquery.ui.core',
    jqueryuiwidget:         'libs/jqueryui/jquery.ui.widget',
    jqueryuimouse:          'libs/jqueryui/jquery.ui.mouse',
    jqueryuiposition:       'libs/jqueryui/jquery.ui.position',
    jqueryuiselectable:     'libs/jqueryui/jquery.ui.selectable',
    jqueryuisortable:       'libs/jqueryui/jquery.ui.sortable',
    jqueryuidraggable:      'libs/jqueryui/jquery.ui.draggable',
    jqueryuidroppable:      'libs/jqueryui/jquery.ui.droppable',

    bootstrap:              'libs/bootstrap/js/bootstrap.min',
    bootstrap3xeditable:    'libs/bootstrap3xeditable/js/bootstrap-editable.min',
    bootstrapvalidator:     'libs/bootstrap-validator/validator.min',
    jquerysimplecolorpicker:'libs/jquery-simplecolorpicker/jquery.simplecolorpicker',
    underscore:             'libs/underscore/underscore-min',
    d3:                     'libs/d3/d3.v3',
    i18next:                'libs/i18next/i18next.amd.withJQuery-1.10.1.min',
    mousetrap:              'libs/mousetrap/mousetrap.min',
    mousetrapgb:            'libs/mousetrap/mousetrap-global-bind',
    select2:                'libs/select2/select2.min',
    hammerjs:               'libs/hammerjs/jquery.hammer.min',
    handlebarsjs:           'libs/handlebars.js/handlebars-v1.1.2',
    pdfjs:                  'libs/pdfjs/build/pdf',
    webdavlib:              'web/webdavlib',
    jszip:                  'libs/jszip/jszip.min',
    slideout:               'libs/slideoutjs/slideout.min',

    tscore:                 'js/core.api',
    tssetting:              'js/settings.api',
    tssettingsdefault:      'js/settings.default',
    tsoptions:              'js/options.ui',
    tspersmanager:          'js/perspective.manager',
    tstagutils:             'js/tagutils',
    tssearch:               'js/search',
    tsfileopener:           'js/fileopener',
    tstagsui:               'js/tags.ui',
    tsdirectoriesui:        'js/directories.ui',
    tscoreui:               'js/core.ui',
    tspostioapi:            'js/postioapi',
    tsdirectorybrowser:     'js/directorybrowser',
    tsutils:                'js/utils',
    tsmeta:                 'js/meta', 
    tsioapi:                 IO_JS,
    tspro:                   PRO_JS
  },
  shim: {
    'underscore':               { exports: '_' },
    'bootstrap':                { deps: ['jquery'] },
    'jqueryui':                 { deps: ['jquery'] },
    'jqueryuiwidget':           { deps: ['jqueryui'] },
    'jqueryuiposition':         { deps: ['jqueryui'] },
    'jqueryuimouse':            { deps: ['jqueryui','jqueryuiwidget'] },
    'jqueryuiselectable':       { deps: ['jqueryui','jqueryuiwidget','jqueryuimouse'] },
    'jqueryuisortable':         { deps: ['jqueryui','jqueryuiwidget','jqueryuimouse'] },
    'jqueryuidroppable':        { deps: ['jqueryui','jqueryuimouse','jqueryuidraggable'] },
    'jqueryuidraggable':        { deps: ['jqueryui','jqueryuimouse'] },
    'jquerysimplecolorpicker':  { deps: ['jquery','bootstrap'] },
    'bootstrap3xeditable':      { deps: ['jquery','jqueryui','bootstrap'] },
    'bootstrapvalidator':       { deps: ['jquery','bootstrap'] },
    'i18next':                  { deps: ['jquery'] },
    'select2':                  { deps: ['jquery'] },
    'hammerjs':                 { deps: ['jquery'] },
    'mousetrapgb':              { deps: ['mousetrap'] },
    'tscore':                   { deps: [
      'jquery',
      'jqueryui',
      'jqueryuimouse',
      'jqueryuidraggable',
      'jqueryuidroppable',
      'jqueryuiposition',
      'jqueryuiselectable',
      'jqueryuisortable',
      'hammerjs',
      'bootstrap',
      'bootstrap3xeditable',
      'bootstrapvalidator',
      'jquerysimplecolorpicker',
      'i18next',
      'mousetrap',
      'mousetrapgb',
      'select2',
      'handlebarsjs',
      'tssettingsdefault',
  ] }
  }
});

define(function (require) {
"use strict";

  if(isCordova) {
    require(["cordova.js"]);
  }

  var TSCORE;
  requirejs(['tscore','underscore'], function (core) {
    TSCORE = core;
    if(!isCordova) {
      TSCORE.initApp();
    }
  });
});
