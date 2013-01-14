/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define([
    'require',
    'exports',
    'module',
],function(require, exports, module) {
"use strict";

console.debug("Loading ViewManager...");
// Placeholder for the view is #middle-center
// Palcehoder for the buttons is #viewsRadio
/*
            <!--table id="fileTable" cellpadding="0" cellspacing="0" border="0" style="width: 100%"></table>
            <ol style="overflow: visible;" id="selectableFiles"></ol>
            <div id="riverView" style="width: 100%"></div-->
            
            <input type="radio" id="fileViewButton" name="viewsRadio" checked="checked" /><label for="fileViewButton">Files View</label>
            <input type="radio" id="tagViewButton" name="viewsRadio" /><label for="tagViewButton">Tags View</label>
            <input type="radio" id="thumbViewButton" name="viewsRadio" /><label for="thumbViewButton">Thumbs View</label>
            <input type="radio" id="moreViewsButton" name="viewsRadio" /><label for="moreViewsButton">...</label>               
 */

var views = undefined;

exports.initViews = function initViews() {
	views = [];
	for (var i=0; i < TSSETTINGS.Settings["extensions"].length; i++) {
		if(TSSETTINGS.Settings["extensions"][i].enabled 
			&& (TSSETTINGS.Settings["extensions"][i].type == "view") ) {
	//        require([TSSETTINGS.getExtensionPath()+UIAPI.getDirSeparator()+viewerExt+UIAPI.getDirSeparator()+"extension.js"], function(viewer) {
	        require(["js/"+TSSETTINGS.Settings["extensions"][i].id], function(viewer) {
	           views.push(viewer);
	           viewer.init();
	        });			
		} 
	}
	//initViewsRadio();   
}

//exports.initViewsRadio = 
function initViewsRadio() {
	for (var i=0; i < views.length; i++) {
        $("#viewsRadio").append($("<input>", { 
            class: "ui-accordion-header ui-helper-reset ui-state-default ui-corner-top ui-corner-bottom"    
        }))
        .append($("<label>", { 
            class: "tagGroupTitle",
            text: TSSETTINGS.Settings["tagGroups"][i].title, 
        }))
	}
}


exports.registerView = function registerView(viewName) {

}

exports.clearSelectedFiles = function clearSelectedFiles() {
    // Clear selected files in the model
    UIAPI.selectedFiles = [];  
    
    // Deselect all
    $(".selectedRow", $(UIAPI.fileTable)).each(function(){
        $(this).toggleClass('selectedRow');
    });    
}

});