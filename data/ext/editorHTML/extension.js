/* Copyright (c) 2013 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";

	console.log("Loading editorHTML");
	exports.id = "editorHTML"; // ID should be equal to the directory name where the ext. is located   
	exports.title = "HTML Editor";
	exports.type = "editor";
	exports.supportedFileTypes = [ "htm", "html" ];
	
	var TSCORE = require("tscore");	
	
	var htmlEditor = undefined;
	
	var extensionsPath = TSCORE.Config.getExtensionPath();
	
	var extensionDirectory = extensionsPath+"/"+exports.id;
	
	exports.init = function(filePath, containerElementID) {
	    console.log("Initalization HTML Text Editor...");
		require([
            extensionsPath+'/editorText/codemirror/codemirror.js',
			extensionDirectory+'/summernote/summernote.min.js',
            //"css!"+extensionDirectory+'/summernote/summernote-bs3.css', 
            "css!"+extensionDirectory+'/summernote/summernote.css',     
            'css!'+extensionsPath+'/editorText/codemirror/codemirror.css',            
            'css!'+extensionsPath+'/editorText/codemirror/theme/monokai.css',    
            'css!'+extensionDirectory+'/extension.css',
		 	], function() {
                require([
                    extensionsPath+'/editorText/codemirror/mode/xml/xml.js',    
                ]);		 	    
				$("#"+containerElementID).append('<div id="htmlEditor"></div>');	 		
				TSCORE.IO.loadTextFile(filePath);
		});
	};
	
	exports.setFileType = function(fileType) {
	    console.log("setFileType not supported on this extension");      
	};
	
	exports.viewerMode = function(isViewerMode) {
	    // set readonly      
	};
	
	exports.setContent = function(content) {
		$('#htmlEditor').html(content);
		$('#htmlEditor').summernote({
          focus: true, 		
          codemirror: { 
            theme: 'monokai'
          },              
          toolbar: [
            ['style', ['style']], 
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['fontsize', ['fontsize']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['height', ['height']],
            //['insert', ['picture', 'link']], // no insert buttons
            ['table', ['table']], 
            ['view', ['codeview']], 
            //['help', ['help']] //no help button
          ]		    
		});
	};
	
	exports.getContent = function() {
		var content = $('#htmlEditor').code();
		//console.log("HTML content: "+content);
		return content;
	};	

});
