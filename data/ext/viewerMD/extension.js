/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";

    console.log("Loading viewerMD");

    exports.id = "viewerMD"; // ID should be equal to the directory name where the ext. is located
    exports.title = "MD Viewer";
    exports.type = "editor";
    exports.supportedFileTypes = [ "md", "markdown", "mdown" ];

    var TSCORE = require("tscore");

    var md2htmlConverter;
    var containerElID;
    var currentFilePath;

    var extensionDirectory = TSCORE.Config.getExtensionPath()+"/"+exports.id;

    // GFM https://help.github.com/articles/github-flavored-markdown

    exports.init = function(filePath, containerElementID) {
        console.log("Initalization MD Viewer...");
        containerElID = containerElementID;
        currentFilePath = filePath;
        require(['css!'+extensionDirectory+'/viewerMD.css']);
        require([extensionDirectory+'/marked/marked.js'], function(marked) {
            md2htmlConverter = marked;
            md2htmlConverter.setOptions({
                renderer: new marked.Renderer(),
                //highlight: function (code) {
                //    //return require([extensionDirectory+'/highlightjs/highlight.js']).highlightAuto(code).value;
                //},
                gfm: true,
                tables: true,
                breaks: false,
                pedantic: false,
                smartLists: true,
                smartypants: false
            });
            TSCORE.IO.loadTextFile(filePath);
        });
    };

    exports.setFileType = function() {
        console.log("setFileType not supported on this extension");
    };

    exports.viewerMode = function(isViewerMode) {
        // set readonly
    };

    exports.setContent = function(content) {
       var UTF8_BOM = "\ufeff";

       // removing the UTF8 bom because it brakes thing like #header1 in the beginning of the document
       if(content.indexOf(UTF8_BOM) === 0) {
           content = content.substring(1,content.length); 
       }

       var cleanedContent = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,"");
       $('#'+containerElID).append($("<div>", { class: "viewerMDContainer" })
            .append(md2htmlConverter(cleanedContent))
            );
       
       var fileDirectory = TSCORE.TagUtils.extractContainingDirectoryPath(currentFilePath);

       // fixing embedding of local images
       $('#'+containerElID+" img[src]").each(function(){
           var currentSrc = $( this ).attr("src");
           if(currentSrc.indexOf("http://") === 0 || currentSrc.indexOf("https://") === 0 || currentSrc.indexOf("data:") === 0) {
               // do nothing if src begins with http(s)://
           } else {
               $( this ).attr("src","file://"+fileDirectory+TSCORE.dirSeparator+currentSrc);
           }
       });

        // making all links open in the user default browser
        $('#'+containerElID+ " a").bind('click', function(e){
            e.preventDefault();
            TSCORE.openLinkExternally($(this).attr("href"));
        });
    };

    exports.getContent = function() {
        //$('#'+containerElID).html();
    };

});