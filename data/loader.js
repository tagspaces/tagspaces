/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
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

// Setting up the IO functionality according to the plattform
var IO_JS = undefined;
if( isFirefox ) {
	IO_JS = "js/ioapi.mozilla";
} else if ( isChrome ) {
    IO_JS = "js/ioapi.chrome";           
}

require.config({
    map: {
      '*': {
        'css': 'libs/requirecss/css'
      }
    },
    paths: {
        jquery: 'libs/jquery/jquery-1.8.3',
        jqueryui: 'libs/jqueryui/jquery.ui.core',
        jqueryuiwidget: 'libs/jqueryui/jquery.ui.widget',
        jqueryuimouse: 'libs/jqueryui/jquery.ui.mouse', 
        jqueryuiposition: 'libs/jqueryui/jquery.ui.position',
        jqueryuimenu: 'libs/jqueryui/jquery.ui.menu',
        jqueryuibutton: 'libs/jqueryui/jquery.ui.button', 
        jqueryuidialog: 'libs/jqueryui/jquery.ui.dialog',              
        jqueryuiselectable: 'libs/jqueryui/jquery.ui.selectable',        
        jqueryuisortable: 'libs/jqueryui/jquery.ui.sortable',        
        jqueryuiresizable: 'libs/jqueryui/jquery.ui.resizable',
        jqueryuidraggable: 'libs/jqueryui/jquery.ui.draggable',
        jqueryuidroppable: 'libs/jqueryui/jquery.ui.droppable',        
        jqueryuiaccordion: 'libs/jqueryui/jquery.ui.accordion',
        jqueryuiautocomplete: 'libs/jqueryui/jquery.ui.autocomplete',
        jqueryuidatepicker: 'libs/jqueryui/jquery.ui.datepicker',        
        jqueryuispinner: 'libs/jqueryui/jquery.ui.spinner',
        jqueryuislider: 'libs/jqueryui/jquery.ui.slider',
        jqueryuitabs: 'libs/jqueryui/jquery.ui.tabs',
        jqueryuitooltips: 'libs/jqueryui/jquery.ui.tooltip',       
        jqueryuicss: 'libs/jqueryui/custom-theme/jquery-ui-1.9.2.custom',

        datatables: 'libs/datatables/js/jquery.dataTables.min',
        datatablescss: 'libs/datatables/css/jquery.dataTables',
        jsoneditor: 'libs/jsoneditor/jsoneditor',
        jsoneditorcss: 'libs/jsoneditor/jsoneditor',
        jquerylayout: 'libs/jquerylayout/jquery.layout-1.3.0.rc30.77',
        jquerylayoutcss: 'libs/jquerylayout/layout-default-latest',
        jquerydropdown: 'libs/jquerydropdown/jquery.dropdown',
        jquerydropdowncss: 'libs/jquerydropdown/jquery.dropdown',
        less: 'libs/less/less-1.3.3.min',

        tscore: 'js/core.api',
        tssetting: 'js/settings.api',
        tspersmanager: "js/perspective.manager",
        tstagutils: "js/tagutils",
        tsfileopener: "js/fileopener",
        tstagsui: "js/tags.ui",
        tsdirectoriesui: "js/directories.ui",
        tscoreui: "js/core.ui",
        tsioapi: IO_JS,        
        tsiomozrec: "js/ioapi.mozilla.receiver",        
    }, 
    shim: {
        'jquerylayout': {
            deps: [
                'jquery',
                'jqueryui',
                'jqueryuidraggable',
                'jqueryuiresizable',
            ]
        },
        'jquerydropdown': {
            deps: [
                'jquery'
            ]
        },
        'jqueryui': {
            deps: [
                'jquery',
                'jqueryuiwidget',
                'jqueryuimouse', 
                'jqueryuiposition',
                'jqueryuimenu',
                'jqueryuibutton', 
                'jqueryuidialog',
                'jqueryuiselectable',
                'jqueryuiautocomplete',
                'jqueryuidatepicker', 
            ]
        },
        'jqueryuitooltips': {
            deps: [
                'jqueryui',
                'jqueryuiwidget',
                'jqueryuiposition',                 
            ]
        },
        'jqueryuidraggable': {
            deps: [
                'jqueryui',
                'jqueryuiwidget',
                'jqueryuimouse',                 
            ]
        },        
        'jqueryuidroppable': {
            deps: [
                'jqueryuidraggable',
            ]
        }, 
        'jqueryuiresizable': {
            deps: [
                'jqueryui',
                'jqueryuiwidget',
                'jqueryuimouse',                 
            ]
        },
        'dynatree': {
            deps: [
                'jquery'
            ]
        },
        'datatables': {
            deps: [
                'jquery'
            ]
        },
    } 
});

define(function (require, exports, module) {
//"use strict";
        
    // Load dependent non-module scripts
    require("jquery");
    require("jqueryui");
    require("datatables");
    require("jsoneditor");
    require("jquerylayout");
    require("jquerydropdown");
    require("jqueryuitooltips");
    require("jqueryuidroppable");
    require("less");
	
	if( isFirefox ) {
		require("tsiomozrec");    
	}
	                                
    var TSCORE = require("tscore");

	require(['libs/requirejs/domReady!'], function (docu) {
	    //This function is called once the DOM is ready,
	    //the value for 'domReady!' is the current document.
		TSCORE.initApp();
	});

});    