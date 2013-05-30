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
    console.debug = function(){};    
}

// Temporal hacks
var isFirefox = 'MozBoxSizing' in document.documentElement.style; 
var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
var isChrome = !isSafari && 'WebkitTransform' in document.documentElement.style;

console.debug("Loading Loader 4 Firefox: "+isFirefox+" | Chrome: "+isChrome);

// Setting up the IO functionality according to the platform
var IO_JS = undefined;
if( isFirefox ) {
	IO_JS = "js/ioapi.mozilla";
} else if ( isChrome ) {
    IO_JS = "js/ioapi.chrome";           
} else if ( isSafari ) {
    // TODO safari io handler needed
    IO_JS = "js/ioapi.chrome";    
}

require.config({
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
        tsioapi:                IO_JS,        
        tsiomozrec:             'js/ioapi.mozilla.receiver',        
    }, 
    shim: {
        'bootstrap':            { deps: ['jquery'] }, 
        'jqueryui':             { deps: ['jquery'] },
        'jqueryuiwidget':       { deps: ['jqueryui'] }, 
        'jqueryuimouse':        { deps: ['jqueryui','jqueryuiwidget'] },
        'jqueryuiposition':     { deps: ['jqueryui'] },
        'jqueryuiselectable':   { deps: ['jqueryui','jqueryuiwidget','jqueryuimouse'] },
        'jqueryuisortable':     { deps: ['jqueryui','jqueryuiwidget','jqueryuimouse'] },
        'jqueryuidatepicker':   { deps: ['jqueryui'] },
        'jqueryuidroppable':    { deps: ['jqueryui','jqueryuiwidget','jqueryuimouse','jqueryuidraggable'] }, 
        'jqueryuidraggable':    { deps: ['jqueryui','jqueryuiwidget','jqueryuimouse'] },        
        'jqueryuiresizable':    { deps: ['jqueryui','jqueryuiwidget','jqueryuimouse'] },          
        'jquerylayout':         { deps: ['jquery', 'jqueryuidraggable' ] },        
        'jquerydropdown':       { deps: ['jquery','bootstrap'] },
        'datatables':           { deps: ['jquery'] },
        'jqueryeditinplace':    { deps: ['jquery'] },
        'tscore':               { deps: [
                'jquery',
                'jqueryui',
                'jqueryuidraggable',
                'jqueryuidroppable',
                'jqueryuiresizable',
                'jqueryuiposition',
                'jqueryuiselectable',
                'jqueryuisortable',
                'bootstrap',
                'jquerylayout',
                'jquerydropdown',  
            ] },        
    } 
});

define(function (require, exports, module) {
"use strict";

    require("less");	
	if( isFirefox ) {
		require("tsiomozrec");    
	}	                                

    var TSCORE = undefined;
    require(['tscore'], function (core) {
        TSCORE = core;
        TSCORE.initApp();
    }); 

/*    var TSCORE = require("tscore");
	require(['libs/requirejs/domReady!'], function () {
	    //This function is called once the DOM is ready
		TSCORE.initApp();
	}); */

});    