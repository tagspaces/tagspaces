/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
//var LOG = debug ? console.log : function () {};
// the value of this var is replaced to "true" by the build script
var PRODUCTION = "@@PRODUCTION";

// Disabling all output to console in production mode
if (PRODUCTION == "true") {
    console = console || {};
    console.log = function(){};
    console.error = function(){};    
    console.log = function(){};    
}

var isFirefox = document.URL.indexOf( 'resource://' ) == 0; 
//var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
var isChrome =  document.URL.indexOf( 'chrome-extension://' ) == 0; 
var isNode = undefined;
var isCordova = document.URL.indexOf( 'file:///android_asset' ) == 0; 
var isWeb = document.URL.indexOf( 'http' ) == 0;
var isOSX = navigator.appVersion.indexOf("Mac")!=-1;
var isWin = navigator.appVersion.indexOf("Win")!=-1;

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
var IO_JS = undefined;
if( isFirefox ) {
	IO_JS = "mozilla/mozilla.api";
} else if ( isChrome ) {
    IO_JS = "chrome/chrome.api";           
} else if (isNode){
    IO_JS = "node-webkit/node-webkit.api";
} else if (isCordova){
    IO_JS = "cordova/cordova.api";
} else {
    IO_JS = "chrome/chrome.api";        
}

//IO_JS = "js/ioapi.dropbox";        

console.log("Loading Loader - Firefox: "+isFirefox+" | ChromeExt: "+isChrome+" | Node: "+isNode+" | Cordova: "+isCordova);

requirejs.config({
    map: {
      '*': {
        'css':  'libs/requirecss/css',
        'text':  'libs/requiretext/text',
      }
    },
    paths: {
        jquery:                 'libs/jquery/jquery-2.0.1',
        jqueryui:               'libs/jqueryui/jquery.ui.core',
        jqueryuiwidget:         'libs/jqueryui/jquery.ui.widget',
        jqueryuimouse:          'libs/jqueryui/jquery.ui.mouse', 
        jqueryuiposition:       'libs/jqueryui/jquery.ui.position',
        jqueryuiselectable:     'libs/jqueryui/jquery.ui.selectable',        
        jqueryuisortable:       'libs/jqueryui/jquery.ui.sortable',        
        jqueryuiresizable:      'libs/jqueryui/jquery.ui.resizable',
        jqueryuidraggable:      'libs/jqueryui/jquery.ui.draggable',
        jqueryuidroppable:      'libs/jqueryui/jquery.ui.droppable',        
        jqueryuiautocomplete:   'libs/jqueryui/jquery.ui.autocomplete',
        jqueryuidatepicker:     'libs/jqueryui/jquery.ui.datepicker',   
        
        bootstrap:              'libs/bootstrap/js/bootstrap.min',
        bootstrap3xeditable:    'libs/bootstrap3xeditable/js/bootstrap-editable.min',
        jquerysimplecolorpicker:'libs/jquery-simplecolorpicker/jquery.simplecolorpicker',
        jquerylayout:           'libs/jquerylayout/jquery.layout-latest',
        underscore:             'libs/underscore/underscore',
        d3:                     'libs/d3/d3.v3',
        dropbox:                'libs/dropbox/dropbox.0.10.2',
        i18next:                'libs/i18next/i18next.amd.withJQuery-1.7.1',
        jqueryhotkeys:			'libs/jqueryhotkeys/jquery.hotkeys',
		select2:				'libs/select2/select2.min',
		hammerjs:				'libs/hammerjs/jquery.hammer.min',
		handlebarsjs:			'libs/handlebars.js/handlebars-v1.1.2',
		
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
        tsioapi:                IO_JS,
        tsioapidropbox:         'js/ioapi.dropbox',
        tsdirectorybrowser:     'js/directorybrowser',
    }, 
    shim: {
        'underscore':               { exports: '_' }, 
        'bootstrap':                { deps: ['jquery'] }, 
        'jquerysimplecolorpicker':  { deps: ['jquery','bootstrap'] },
        'jqueryui':                 { deps: ['jquery'] },
        'jqueryuiwidget':           { deps: ['jqueryui'] }, 
        'jqueryuimouse':            { deps: ['jqueryui','jqueryuiwidget'] },
        'jqueryuiposition':         { deps: ['jqueryui'] },
        'jqueryuiselectable':       { deps: ['jqueryui','jqueryuiwidget','jqueryuimouse'] },
        'jqueryuisortable':         { deps: ['jqueryui','jqueryuiwidget','jqueryuimouse'] },
        'jqueryuidatepicker':       { deps: ['jqueryui'] },
        'jqueryuidroppable':        { deps: ['jqueryui','jqueryuiwidget','jqueryuimouse','jqueryuidraggable'] }, 
        'jqueryuidraggable':        { deps: ['jqueryui','jqueryuiwidget','jqueryuimouse'] },        
        'jqueryuiresizable':        { deps: ['jqueryui','jqueryuiwidget','jqueryuimouse'] },          
        'jquerylayout':             { deps: ['jquery','jqueryuidraggable' ] },        
        'jquerydropdown':           { deps: ['jquery','bootstrap'] },
        'bootstrap3xeditable':      { deps: ['jquery','jqueryui','bootstrap'] },
        'jquerynanoscroller':       { deps: ['jquery'] },        
        'select2':          	    { deps: ['jquery'] },
        'hammerjs':          	    { deps: ['jquery'] },
        'jqueryhotkeys':            { deps: ['jquery'] },
        'tscore':                   { deps: [
                'jquery',
                'jqueryui',
                'jqueryuidraggable',
                'jqueryuidroppable',
                'jqueryuiresizable',
                'jqueryuiposition',
                'jqueryuiselectable',
                'jqueryuisortable',
                'hammerjs',
                'bootstrap',
                'bootstrap3xeditable',
                'jquerysimplecolorpicker',
                'jquerylayout',
                'i18next',
                'jqueryhotkeys',
                'select2',
                'handlebarsjs',  
                'tssettingsdefault', 
            ] },                   
    } 
});

define(function (require, exports, module) {
"use strict";

    if (isCordova) {
        require(["cordova.js"]);
    }

    var TSCORE = undefined;
    requirejs(['tscore','underscore'], function (core,_) {
        TSCORE = core;
        TSCORE.initApp();
    }); 

});    