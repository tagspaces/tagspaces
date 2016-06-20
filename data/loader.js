/* Copyright (c) 2012-2016 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
/* global define, requirejs, _  */

var isFirefox = document.URL.indexOf( 'resource://' ) === 0;
var isFirefoxOS = document.URL.indexOf( 'app://' ) === 0;
var isChrome = document.URL.indexOf( 'chrome-extension://' ) === 0;
var isNode = false;
var isElectron = false;
var isCordovaAndroid = document.URL.indexOf( 'file:///android_asset' ) === 0;
var isCordovaiOS = /^file:\/{3}[^\/]/i.test(window.location.href) && /ios|iphone|ipod|ipad/i.test(navigator.userAgent);
var isCordova = isCordovaAndroid || isCordovaiOS;
var isWeb = document.URL.indexOf( 'http' ) === 0;
var isOSX = navigator.appVersion.indexOf("Mac")!==-1;
var isWin = navigator.appVersion.indexOf("Win")!==-1;

/**
 * The main loader module for the application
 * @name TSLoader
 */
(function () {
  // the value of this var is replaced to "true" by the build script
  var PRODUCTION = "@@PRODUCTION";
  var PRO = "@@PROVERSION";

  // Disabling all output to console in production mode
  if (PRODUCTION == "true") {
    console = console || {};
    console.log = function(){};
    console.warn = function(){};
    console.time = function(){};
    console.timeEnd = function(){};
    //console.error = function(){};
  }

  // Check for running in node-webkit
  try {
    require('nw.gui');
    isNode = true;
  } catch(e) {
    console.log("node-webkit not found!");
  }

  try {
    if (process.versions['electron']) {
      isElectron = true;
      //electron bug
      //https://github.com/atom/electron/issues/254
      window.$ = window.jQuery = require('./libs/jquery/dist/jquery.min.js');
    }
  } catch(e) {
    console.log(e.message);
  }
  var PRO_JS = "pro/js/pro.api";
  if(PRO.indexOf("@@PROVERS") == 0 || PRO == "false") { PRO_JS = 'js/pro'; }

  // Setting up the IO functionality according to the platform
  var IO_JS = "web/web.api";
  if( isFirefox ) {
    IO_JS = "mozilla/mozilla.api";
    PRO_JS = 'js/pro';
  } else if ( isChrome && !isNode ) {
    isNode = false;
    IO_JS = "chromium/chrome.api";
    PRO_JS = 'js/pro';
  } else if (isNode){
    isChrome = false;
    IO_JS = "node-webkit/node-webkit.api";
  } else if (isCordova){
    IO_JS = "cordova/cordova.api";
  } else if (isWeb){
    IO_JS = "web/web.api";
  } else if (isElectron) {
    IO_JS = "electron/electron.api"
  }

  console.log("Loading Loader - Firefox: "+isFirefox+" | ChromeExt: "+isChrome+" | Node: "+isNode+" | Cordova: "+isCordova+" | Web: "+isWeb+" | isWin: "+isWin+" | isElectron: "+isElectron);

  requirejs.config({
    map: {
      '*': {
        'css':   'libs/require-css/css.min',
        'text':  'libs/requiretext/index'
      }
    },
    paths: {
      jquery:                 'libs/jquery/dist/jquery.min',
      jqueryui:               'libs/jqueryui/jquery-ui.min',
      bootstrap:              'libs/bootstrap/dist/js/bootstrap.min',
      bootstrap3xeditable:    'libs/x-editable/dist/bootstrap3-editable/js/bootstrap-editable.min',
      bootstrapvalidator:     'libs/bootstrap-validator/dist/validator.min',
      jquerysimplecolorpicker:'libs/jquery-simplecolorpicker/jquery.simplecolorpicker',
      underscore:             'libs/underscore/index',
      d3:                     'libs/d3/d3.min',
      i18next:                'libs/i18next/i18next.amd.withJQuery.min',
      mousetrap:              'libs/mousetrap/mousetrap.min',
      mousetrapgb:            'libs/mousetrap/plugins/global-bind/mousetrap-global-bind.min',
      select2:                'libs/select2/select2.min',
      hammerjs:               'libs/hammerjs/hammer.min',
      jqueryhammerjs:         'libs/jquery.hammer.js/jquery.hammer',
      handlebarsjs:           'libs/handlebars/handlebars.min',
      pdfjs:                  'libs/pdfjs/build/pdf',
      webdavlib:              'web/webdavlib',
      jszip:                  'libs/jszip/dist/jszip.min',
      hopscotch:              'libs/hopscotch/dist/js/hopscotch.min',
      noty:                   'libs/noty/js/noty/packaged/jquery.noty.packaged.min',
      marked:                 'libs/marked/marked.min',
      webaudiorecording:      'libs/audio-record/WebAudioRecorder',

      tscore:                 'js/core.api',
      tssetting:              'js/settings.api',
      tssettingsdefault:      'js/settings.default',
      tsoptions:              'js/options.ui',
      tspersmanager:          'js/perspective.manager',
      tstagutils:             'js/tagutils',
      tssearch:               'js/search',
      tssearchui:             'js/search.ui',
      tsfileopener:           'js/fileopener',
      tstagsui:               'js/tags.ui',
      tsdirectoriesui:        'js/directories.ui',
      tscoreui:               'js/core.ui',
      tspostioapi:            'js/postioapi',
      tsdirectorybrowser:     'js/directorybrowser',
      tsutils:                'js/utils',
      tsioutils:              'js/ioutils',
      tsmeta:                 'js/meta',
      tsgettingstarted:       'js/gettingstarted',
      tsextapi:               'js/ext.api',
      tsextmanager:           'js/extension.manager',
      tsioapi:                 IO_JS,
      tspro:                   PRO_JS,
      tsaudiorecorderui:      'js/audiorecorder.ui'
    },
    shim: {
      'underscore':               { exports: '_' },
      'bootstrap':                { deps: ['jquery'] },
      'jqueryui':                 { deps: ['jquery'] },
      'jquerysimplecolorpicker':  { deps: ['jquery','bootstrap'] },
      'bootstrap3xeditable':      { deps: ['jquery','bootstrap'] },
      'bootstrapvalidator':       { deps: ['jquery','bootstrap'] },
      'i18next':                  { deps: ['jquery'] },
      'select2':                  { deps: ['jquery'] },
      'hammerjs':                 { deps: ['jquery'] },
      'jqueryhammerjs':           { deps: ['hammerjs'] },
      'mousetrapgb':              { deps: ['mousetrap'] },
      'tscore':                   { deps: [
        'jquery',
        'jqueryui',
        'hammerjs',
        'jqueryhammerjs',
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
        'noty',
    ] }
    }
  });

  define(function (require) {
    requirejs(['tscore','underscore'], function (core) {
      if(isCordova) {
        require(["cordova.js"]);
      } else {
        core.initApp();
      }
    });
  });

})();
