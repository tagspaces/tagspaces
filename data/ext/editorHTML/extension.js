/* Copyright (c) 2013 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";

    console.log("Loading editorHTML");

    var extensionTitle = "HTML Editor";
    var extensionID = "editorHTML";  // ID should be equal to the directory name where the ext. is located
    var extensionType =  "editor";
    var extensionIcon = "icon-list";
    var extensionVersion = "1.0";
    var extensionManifestVersion = 1;
    var extensionLicense = "AGPL";
    var extensionSupportedFileTypes = [ "html", "htm" ];

    var TSCORE = require("tscore");

    var $htmlEditor;

    var extensionsPath = TSCORE.Config.getExtensionPath();

    var extensionDirectory = extensionsPath+"/"+extensionID;

    var currentContent,
        currentFilePath,
        $iframeViewer,
        $containerElement;

    exports.init = function(filePath, containerElementID) {
        console.log("Initalization HTML Editor...");

        $containerElement = $('#'+containerElementID);

        currentFilePath = filePath;

        //var fileExt = TSCORE.TagUtils.extractFileExtension(filePath);

        $containerElement.empty();
        $containerElement.css("background-color","white");

        var extPath = extensionDirectory+"/index.html";
        $containerElement.append($('<iframe>', {
            id: "iframeViewer",
            sandbox: "allow-same-origin allow-scripts",
            scrolling: "no",
            style: "background-color: white; overflow: hidden;",
            src: extPath+"?cp="+filePath,
            "nwdisable": "",
            "nwfaketop": ""
        }));

        /*$containerElement.append($('<iframe>', {
                //sandbox: "allow-same-origin allow-scripts",
                id: "iframeViewer",
                "nwdisable": "",
                "nwfaketop": ""
            })
        );

        $iframeViewer = $("#iframeViewer");
        if($iframeViewer != undefined) {
            var $iframeViewerHead = $iframeViewer.contents().find('head');
            $iframeViewerHead.append($('<link/>', { rel: 'stylesheet', href: extensionDirectory+'/extension.css' }));
            $iframeViewerHead.append($('<link/>', { rel: 'stylesheet', href: extensionDirectory+'/../../libs/bootstrap/css/bootstrap.css' }));
            $iframeViewerHead.append($('<link/>', { rel: 'stylesheet', href: extensionDirectory+'/../../libs/font-awesome/css/font-awesome.css' }));
            $iframeViewerHead.append($('<link/>', { rel: 'stylesheet', href: extensionDirectory+'/summernote/summernote.css' }));
            $iframeViewerHead.append($('<script/>', { type: 'text/javascript', src: extensionDirectory+'/../../libs/jquery/jquery-2.1.1.min.js' }));
            $iframeViewerHead.append($('<script/>', { type: 'text/javascript', src: extensionDirectory+'/../../libs/bootstrap/js/bootstrap.min.js' }));
            $iframeViewerHead.append($('<script/>', { type: 'text/javascript', src: extensionDirectory+'/summernote/summernote.js' }));
            $iframeViewerHead.append($('<script/>', { type: 'text/javascript', src: extensionDirectory+'/editor.js' }));
        }*/

        //require([
        //    extensionDirectory+'/summernote/summernote.js'
        //], function(uiTPL) {
            //TSCORE.IO.loadTextFile(filePath);
        //});
    };

    exports.setFileType = function(fileType) {
        console.log("setFileType not supported on this extension");
    };

    exports.viewerMode = function(isViewerMode) {
        // set readonly
        console.log("viewerMode not supported on this extension");
    };

    exports.setContent = function(content) {
        /*currentContent = content;

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

        var $iframeViewer = $("#iframeViewer");
        $iframeViewer.contents().find("body").append('<div id="htmlEditor"></div>');
        //console.log(document.getElementById("iframeViewer").contentWindow);
        window.setTimeout(function() {
            document.getElementById("iframeViewer").contentWindow.initEditor(cleanedBodyContent);
        }, 2000);*/
    };

    var contentVersion = 0;

    function resetContentVersion() {
        contentVersion = 0;
        document.getElementById("iframeViewer").contentWindow.resetContentVersion();
    }

    function checkContentChanged() {
        var newContentVersion = document.getElementById("iframeViewer").contentWindow.getContentVersion();
        if(newContentVersion > contentVersion) {
            contentVersion = newContentVersion;
            TSCORE.FileOpener.setFileChanged(true);
            // autosave
            //TSCORE.FileOpener.saveFile();
        }
        window.setTimeout(checkContentChanged, 1000);
    }

    window.setTimeout(checkContentChanged, 1000);

    exports.getContent = function() {
        var content = $("#iframeViewer").contents().find(".note-editable").html();

        var currentContent = document.getElementById("iframeViewer").contentWindow.getOriginalContent();

        // removing all scripts from the document
        var cleanedContent = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,"");

        // saving all images as png in base64 format
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
        // end saving all images

        cleanedContent = "<body>"+cleanedContent+"</body>";

        var htmlContent = currentContent.replace(/\<body[^>]*\>([^]*)\<\/body>/m,cleanedContent);
        //console.log("Final html "+htmlContent);
        resetContentVersion();
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

    // Extension Vars
    exports.Title                   = extensionTitle;
    exports.ID                      = extensionID;
    exports.Type                    = extensionType;
    exports.Icon                    = extensionIcon;
    exports.Version                 = extensionVersion;
    exports.ManifestVersion         = extensionManifestVersion;
    exports.License                 = extensionLicense;
    exports.SupportedFileTypes      = extensionSupportedFileTypes;

});
