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
	
	var content = undefined;
	
	exports.init = function(filePath, containerElementID) {
	    console.log("Initalization HTML Text Editor...");
		require([
			extensionDirectory+'/summernote/summernote.js',
            'css!'+extensionDirectory+'/summernote/summernote.css',     
            'css!'+extensionDirectory+'/extension.css',
		 	], function() {
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
	
	exports.setContent = function(cont) {
		content = cont;
		
        var reg = /\<body[^>]*\>([^]*)\<\/body/m;
        
        var bodyContent = undefined;
        
        // TODO try this 
        try {
            bodyContent = content.match( reg )[1];                  
        } catch(e) {
            console.log("Error parsing HTML document. "+e);
            $('#htmlEditor').append("<p style='font-size: 15px'><br/>  Error parsing HTML document. Probably a body tag was not found in the document.</p>");
            return false;
        }

		//console.log("body content: "+bodyContent);

        var cleanedBodyContent = bodyContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,"");         

		$('#htmlEditor').append(cleanedBodyContent);
		$('#htmlEditor').summernote({
          focus: true, 		
          toolbar: [
            ['style', ['style']], 
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['fontsize', ['fontsize']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['height', ['height']],
            ['insert', ['picture', 'link']], 
            ['table', ['table']], 
            ['view', ['codeview']], 
            //['help', ['help']] //no help button
          ]		    
		});
       // $("#"+containerElementID).find('.note-image-dialog').css("position","static");   

	};
	
	exports.getContent = function() {
		var code = "<body>"+$('#htmlEditor').code()+"</body>";
        
        var htmlContent = content.replace(/\<body[^>]*\>([^]*)\<\/body>/m,code);
        console.log("Final html "+htmlContent);
		return htmlContent;
	};	

});
