/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
console.debug("Loading Loader...");

require.config({
    map: {
      '*': {
        'css': 'libs/requirecss/css'
      }
    },
    paths: {
        jquery: 'libs/jquery/jquery-1.8.3',
        dynatree: 'libs/dynatree/jquery.dynatree.min',
        dynatreecss: 'libs/dynatree/skin-vista/ui.dynatree',   
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
        less: 'libs/less/less-1.3.1',
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
/*        less: {
            deps: [
                'css!jquerylayoutcss',
                'css!jqueryuicss',
                'css!dynatreecss',
                'css!datatablescss',
                'css!jsoneditorcss'
                ]
        },*/
    }  
});

// Init Application
require(['js/main'], 
    function(Main) { 
        Main.initializeApp();
    }
);    