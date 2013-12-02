/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";

var layoutContainer, col1Layout, col2Layout, col3Layout;

	$(document).ready(function(){
		var row1Height = 40; // px
		var row3Height = 45; // px
	
		layoutContainer = $('body').layout({ 
			name:			'outerLayout' // for debugging & auto-adding buttons (see below)
		,   fxName: 		"none"
		,	autoResize:		true	// try to maintain pane-percentages
		,	autoReopen:		true	// auto-open panes that were previously auto-closed due to 'no room'
		,	autoBindCustomButtons:	true
		,	west__paneSelector: 	'.col1' 
		,	center__paneSelector: 	'.col2' 
		,	east__paneSelector: 	'.col3' 
		,	west__size: 		250		// percentage size expresses as a decimal
		,	east__size: 		0.4
		,   west__spacing_open:         1 	
		,   east__spacing_open:         1
	    ,   spacing_closed:		0	
		,	minSize:		100
		,	west__minWidth:		250 
		,	noRoomToOpenAction:	"hide" // 'close' or 'hide' when no room to open a pane at minSize
	//	,   west__showOverflowOnHover:	true
	//	,   center__showOverflowOnHover:	true
	//	,   east__showOverflowOnHover:	true	
		,   enableCursorHotkey:         false
		});
		
		//outerLayout.close("east");
	
		col1Layout = outerLayout.panes.west.layout({ 
			name:			'col1Layout' // for debugging & auto-adding buttons (see below)
	//	,	north__paneSelector: 	'.row1'
		,	center__paneSelector: 	'.row2'
		,	south__paneSelector: 	'.row3'
	//	,	north__size: 		row1Height	// percentage size expresses as a string
		,	south__size: 		row3Height
		,   north__spacing_open:        0 	
		,   south__spacing_open:        0 	
		,	autoResize:		false	// try to maintain pane-percentages
		,	closable:		false
		,	togglerLength_open:	0	// hide toggler-buttons
		,	spacing_closed:		0	// hide resizer/slider bar when closed
		,	autoReopen:		true	// auto-open panes that were previously auto-closed due to 'no room'
		,	autoBindCustomButtons:	true
		,	minSize:		25
		,	center__minHeight:	25
	//	,   north__showOverflowOnHover:	true
	//	,   center__showOverflowOnHover:	true
	//	,   south__showOverflowOnHover:	true		
		,   enableCursorHotkey:         false
		}); 
	
	/*
		col2Layout = outerLayout.panes.center.layout({ 
			name:			'col2Layout' // for debugging & auto-adding buttons (see below)
	//	,	north__paneSelector: 	'.row1'
		,	center__paneSelector: 	'.row2'
		,	south__paneSelector: 	'.row3'
	//	,	north__size: 		row1Height	// percentage size expresses as a string
		,	south__size: 		row3Height
		,   north__spacing_open:        0 	
		,   south__spacing_open:        0 	
		,	autoResize:		true	// try to maintain pane-percentages
		,	closable:		false
		,	togglerLength_open:	0	// hide toggler-buttons
		,	spacing_closed:		0	// hide resizer/slider bar when closed
		,	autoReopen:		true	// auto-open panes that were previously auto-closed due to 'no room'
		,	autoBindCustomButtons:	true
		,	minSize:		25
		,	center__minHeight:	25
		,   north__showOverflowOnHover:	true
	//	,   center__showOverflowOnHover:	true
	//	,   south__showOverflowOnHover:	true		
		,   enableCursorHotkey:         false
		}); */
	
	/*
		col3Layout = outerLayout.panes.east.layout({ 
			name:			'col2Layout' // for debugging & auto-adding buttons (see below)
	//	,	north__paneSelector: 	'.row1'
		,	center__paneSelector: 	'.row2'
		,	south__paneSelector: 	'.row3'
	//	,	north__size: 		row1Height	// percentage size expresses as a string
		,	south__size: 		row3Height
		,   north__spacing_open:        0 	
		,   south__spacing_open:        0 	
		,	autoResize:		true	// try to maintain pane-percentages
		,	closable:		false
		,	togglerLength_open:	0	// hide toggler-buttons
		,	spacing_closed:		0	// hide resizer/slider bar when closed
		,	autoReopen:		true	// auto-open panes that were previously auto-closed due to 'no room'
		,	autoBindCustomButtons:	true
		,	minSize:		25
		,	center__minHeight:	25
		,   north__showOverflowOnHover:	true
	//	,   center__showOverflowOnHover:	true
	//	,   south__showOverflowOnHover:	true		
		,   enableCursorHotkey:         false
		}); */

		$('#switchLang').click(function(e) {
			$.i18n.setLng('en', function(t) { 
				$('[data-i18n]').i18n();
			});
	    });

		$('#loading').hide();
	
		$('#toggleLeft').click(function(e) {
			layoutContainer.toggle("west");
	    });
	    
		$('#closeRight').click(function(e) {
			closeRightPanel();
	    });	    
	    
		$('#toggleFullScreen').click(function(e) {
			toggleFullWidth();
	    }); 
	    
		$("#tagSelect").select2({
	        minimumInputLength: 1,
	        multiple: true,
		    data:[{id:0,text:'enhancement'},{id:1,text:'bug'},{id:2,text:'duplicate'},{id:3,text:'invalid'},{id:4,text:'wontfix'}]
		});  
		
		$("#documentTitle").change(function(e) {
			console.log("Title: "+$(this).val());
	    });  
	    
	    // KEY Shortcurs
	    //$(document).bind('keydown', 'left', toggleFullWidth);
	    $(document).bind('keyup', 'esc', closeRightPanel);
	    
	    //$.fn.editable.defaults.mode = 'inline';
	    //$('#docTitle').editable();
	    
	    var isFullWidth = false; 
	
		function closeRightPanel() {
			layoutContainer.hide("east");
		}
	
	    function toggleFullWidth() {
	        var fullWidth = window.innerWidth;
	        var halfWidth = Math.round(fullWidth/2);
	        if(!isFullWidth) {
	        	layoutContainer.close("west");
	            layoutContainer.sizePane("east", fullWidth);
	            layoutContainer.open("east"); 
	        } else {
	            layoutContainer.sizePane("east", halfWidth);
	            layoutContainer.open("east");               
	        }
	        isFullWidth = !isFullWidth;
	    }  

		// Init Internationalization	
		$.i18n.init({
		    ns: { namespaces: ['ns.common'], defaultNs: 'ns.common'},
		    lng: "de",
		    debug: false 
		}, function() {
            $('[data-i18n]').i18n();
	    });
	});	

});