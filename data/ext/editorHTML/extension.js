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

    var htmlEditor;

    var extensionsPath = TSCORE.Config.getExtensionPath();

    var extensionDirectory = extensionsPath+"/"+exports.id;

    var currentContent;
    var currentFilePath;

    exports.init = function(filePath, containerElementID) {
        console.log("Initalization HTML Text Editor...");
        currentFilePath = filePath;
        require([
            extensionDirectory+'/summernote/summernote.js',
            'css!'+extensionDirectory+'/summernote/summernote.css',     
            'css!'+extensionDirectory+'/extension.css'
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

    exports.setContent = function(content) {
        currentContent = content;

        var bodyRegex = /\<body[^>]*\>([^]*)\<\/body/m;
        var bodyContent = undefined;
        
        try {
            bodyContent = content.match( bodyRegex )[1];
        } catch(e) {
            console.log("Error parsing HTML document. "+e);
            TSCORE.FileOpener.closeFile(true);  
            TSCORE.showAlertDialog("Probably a body tag was not found in the document. Document will be closed.","Error parsing HTML document");
        }

//        var titleRegex = /\<title[^>]*\>([^]*)\<\/title/m;
//        var titleContent = content.match( titleRegex )[1];

        // removing all scripts from the document
        var cleanedBodyContent = bodyContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,"");         

        var $htmlEditor = $('#htmlEditor');
        $htmlEditor.append(cleanedBodyContent);
        $htmlEditor.summernote({
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
              ['view', ['codeview']]
            ],
            onkeyup: function() {
                TSCORE.FileOpener.setFileChanged(true);
            }
        });
    };

    exports.getContent = function() {
        var content = "<body>"+$('#htmlEditor').code()+"</body>";


        // removing all scripts from the document
        var cleanedContent = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,"");

        var match,
            urls = [],
            imgUrl = "",
            rex = /<img.*?src="([^">]*\/([^">]*?))".*?>/g;;

        while ( match = rex.exec( cleanedContent ) ) {
            imgUrl = match[1];
            console.log("URLs: "+imgUrl);
            urls.push([imgUrl, getBase64Image(imgUrl)]);
        }

        urls.forEach(function(dataURLObject) {
            cleanedContent = cleanedContent.split(dataURLObject[0]).join(dataURLObject[1]);
            //console.log(dataURLObject[0]+" - "+dataURLObject[1]);
        });

        var htmlContent = currentContent.replace(/\<body[^>]*\>([^]*)\<\/body>/m,cleanedContent);
        console.log("Final html "+htmlContent);
        return htmlContent;
    };

    function getBase64Image(imgURL) {
        var canvas = document.createElement("canvas");
        var img = new Image();
        img.src = imgURL;
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL("image/png");
    }

});
