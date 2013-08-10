/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
//var LOG = debug ? console.log : function () {};
// the value of this var is replaced to "true" by the build script
var PRODUCTION = "@PRODUCTION@";

// Disabling all output to console in production mode
if (PRODUCTION == "true") {
    console = console || {};
    console.log = function(){};
    console.error = function(){};    
    console.log = function(){};    
}

// Temporal hacks
var isFirefox = 'MozBoxSizing' in document.documentElement.style; 
var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
var isChrome = !isSafari && 'WebkitTransform' in document.documentElement.style;
var isNode = undefined;

  // BROWSER SNIFFING
/*
  // Crude, but necessary to handle a number of hard-to-feature-detect
  // bugs and behavior differences.
  var gecko = /gecko\/\d/i.test(navigator.userAgent);
  var ie = /MSIE \d/.test(navigator.userAgent);
  var ie_lt8 = ie && (document.documentMode == null || document.documentMode < 8);
  var ie_lt9 = ie && (document.documentMode == null || document.documentMode < 9);
  var webkit = /WebKit\//.test(navigator.userAgent);
  var qtwebkit = webkit && /Qt\/\d+\.\d+/.test(navigator.userAgent);
  var chrome = /Chrome\//.test(navigator.userAgent);
  var opera = /Opera\//.test(navigator.userAgent);
  var safari = /Apple Computer/.test(navigator.vendor);
  var khtml = /KHTML\//.test(navigator.userAgent);
  var mac_geLion = /Mac OS X 1\d\D([7-9]|\d\d)\D/.test(navigator.userAgent);
  var mac_geMountainLion = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(navigator.userAgent);
  var phantom = /PhantomJS/.test(navigator.userAgent);

  var ios = /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent);
  // This is woefully incomplete. Suggestions for alternative methods welcome.
  var mobile = ios || /Android|webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(navigator.userAgent);
  var mac = ios || /Mac/.test(navigator.platform);
  var windows = /windows/i.test(navigator.platform);
*/
console.log("Loading Loader 4 Firefox: "+isFirefox+" | Chrome: "+isChrome);

// Setting up the IO functionality according to the platform
var IO_JS = undefined;
if( isFirefox ) {
	IO_JS = "js/ioapi.mozilla";
} else if ( isChrome ) {
    IO_JS = "js/ioapi.chrome";           
} else {
    // TODO safari and ie io handler needed
    IO_JS = "js/ioapi.chrome";    
}

// Check for running in node-webkit
try {
    var fs = require('fs');
    var pathUtils = require('path');   
    var gui = require('nw.gui');
    IO_JS = "js/ioapi.node";
    isNode = true;
} catch(e) {
    console.log("node-webkit not found!");
}

requirejs.config({
    map: {
      '*': {
        'css': 'libs/requirecss/css'
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
        
        bootstrap:              'libs/bootstrap/js/bootstrap',
        jquerysimplecolorpicker:'libs/jquery-simplecolorpicker/jquery.simplecolorpicker',
        datatables:             'libs/datatables/js/jquery.dataTables.min',
        datatablescss:          'libs/datatables/css/jquery.dataTables',
        jsoneditor:             'libs/jsoneditor/jsoneditor',
        jsoneditorcss:          'libs/jsoneditor/jsoneditor',
        jquerylayout:           'libs/jquerylayout/jquery.layout-latest',
        jquerylayoutcss:        'libs/jquerylayout/layout-default-latest',
        jquerydropdown:         'libs/jquerydropdown/jquery.dropdown',
        jquerydropdowncss:      'libs/jquerydropdown/jquery.dropdown',        
        less:                   'libs/less/less-1.3.3.min',
        jqueryeditinplace:      'libs/jqueryeditinplace/jquery.editinplace',

        tscore:                 'js/core.api',
        tssetting:              'js/settings.api',
        tsoptions:              'js/options.ui',
        tspersmanager:          'js/perspective.manager',
        tstagutils:             'js/tagutils',
        tsfileopener:           'js/fileopener',
        tstagsui:               'js/tags.ui',
        tsdirectoriesui:        'js/directories.ui',
        tscoreui:               'js/core.ui',
        tspostioapi:            'js/postioapi',
        tsioapi:                IO_JS,        
    }, 
    shim: {
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
        'jquerylayout':             { deps: ['jquery', 'jqueryuidraggable' ] },        
        'jquerydropdown':           { deps: ['jquery','bootstrap'] },
        'datatables':               { deps: ['jquery'] },
        'jqueryeditinplace':        { deps: ['jquery'] },
        'jquerynanoscroller':       { deps: ['jquery'] },        
        'tscore':                   { deps: [
                'jquery',
                'jqueryui',
                'jqueryuidraggable',
                'jqueryuidroppable',
                'jqueryuiresizable',
                'jqueryuiposition',
                'jqueryuiselectable',
                'jqueryuisortable',
                'bootstrap',
                'jquerysimplecolorpicker',
                'jquerylayout',
                'jquerydropdown',  
            ] },        
    } 
});

define(function (require, exports, module) {
"use strict";

    //require("less");	

    var TSCORE = undefined;
    requirejs(['tscore'], function (core) {
        TSCORE = core;
        TSCORE.initApp();
    }); 

});    