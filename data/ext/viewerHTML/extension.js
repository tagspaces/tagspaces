/* Copyright (c) 2012-2014 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
    "use strict";

    console.log("Loading viewerHTML");

    var extensionTitle = "HTML Viewer";
    var extensionID = "viewerHTML";  // ID should be equal to the directory name where the ext. is located
    var extensionType =  "viewer";
    var extensionIcon = "icon-list";
    var extensionVersion = "1.0";
    var extensionManifestVersion = 1;
    var extensionLicense = "AGPL";
    var extensionSupportedFileTypes = [ "html", "htm" ];

    var TSCORE = require("tscore");

    var containerElID,
        $containerElement,
        currentFilePath,
        viewerToolbar,
        $iframeViewer;

    var extensionDirectory = TSCORE.Config.getExtensionPath()+"/"+extensionID;

    exports.init = function(filePath, containerElementID) {
        console.log("Initalization HTML Viewer...");
        containerElID = containerElementID;
        $containerElement = $('#'+containerElID);

        currentFilePath = filePath;

        //var fileExt = TSCORE.TagUtils.extractFileExtension(filePath);

        $containerElement.empty();
        $containerElement.css("background-color","white");

        $containerElement.append($('<iframe>', {
                sandbox: "allow-same-origin allow-scripts",
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
            $iframeViewerHead.append($('<link/>', { rel: 'stylesheet', href: extensionDirectory+'/css/markdown.css' }));
            $iframeViewerHead.append($('<link/>', { rel: 'stylesheet', href: extensionDirectory+'/css/github.css' }));
            $iframeViewerHead.append($('<link/>', { rel: 'stylesheet', href: extensionDirectory+'/css/haroopad.css' }));
            $iframeViewerHead.append($('<link/>', { rel: 'stylesheet', href: extensionDirectory+'/css/metro-vibes.css' }));
            $iframeViewerHead.append($('<link/>', { rel: 'stylesheet', href: extensionDirectory+'/css/solarized-dark.css' }));
            $iframeViewerHead.append($('<link/>', { rel: 'stylesheet', href: extensionDirectory+'/css/clearness.css' }));
            $iframeViewerHead.append($('<link/>', { rel: 'stylesheet', href: extensionDirectory+'/css/clearness-dark.css' }));
        }

        require([
                "text!"+extensionDirectory+'/mainUI.html'
        ], function(uiTPL) {
            var uiTemplate = Handlebars.compile( uiTPL );
            viewerToolbar = uiTemplate({ id: extensionID });

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
        // removing the script tags from the content
        var cleanedContent = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,"");
        var $iframeViewer = $("#iframeViewer");

        var fileDirectory = TSCORE.TagUtils.extractContainingDirectoryPath(currentFilePath);

        var styles = ['','github','haroopad','metro-vibes','solarized-dark','clearness','clearness-dark'];
        var currentStyleIndex = 0;

        if($iframeViewer != undefined) {
            var $iframeViewerBody = $iframeViewer.contents().find('body');
            $iframeViewerBody.children().remove();
            $iframeViewerBody.append($('<div/>', { id: 'htmlContent', class: "markdown" }).append(cleanedContent));
            $iframeViewerBody.append(viewerToolbar);

            var $iframeHTMLContent = $iframeViewer.contents().find('#htmlContent');

            $iframeViewerBody.find( "#changeStyleButton" ).bind('click', function(){
                currentStyleIndex = currentStyleIndex + 1;
                if(currentStyleIndex >= styles.length) {
                    currentStyleIndex = 0;
                }
                $iframeHTMLContent.removeClass();
                $iframeHTMLContent.addClass('markdown');
                $iframeHTMLContent.addClass(styles[currentStyleIndex]);
            });

            $iframeViewerBody.find( "#increaseFontSizeButton" ).bind('click', function(e){
                $iframeHTMLContent.removeClass();
                $iframeHTMLContent.addClass('markdown');
                $iframeHTMLContent.addClass(styles[currentStyleIndex]);
                $iframeHTMLContent.addClass('zoomLarger');
            });

            $iframeViewerBody.find( "#decreaseFontSizeButton" ).bind('click', function(e){
                $iframeHTMLContent.removeClass();
                $iframeHTMLContent.addClass('markdown');
                $iframeHTMLContent.addClass(styles[currentStyleIndex]);
                $iframeHTMLContent.addClass('zoomDefault');
            });

            // making all links open in the user default browser
            $iframeViewerBody.find( "a" ).bind('click', function(e){
                e.preventDefault();
                TSCORE.openLinkExternally($(this).attr("href"));
            });

            // fixing embedding of local images
            $iframeViewerBody.find( "img[src]").each(function(){
                var currentSrc = $( this ).attr("src");
                if(currentSrc.indexOf("http://") == 0 || currentSrc.indexOf("https://") == 0 || currentSrc.indexOf("data:") == 0) {
                    // do nothing if src begins with http(s):// or data:
                } else {
                    $( this ).attr("src","file://"+fileDirectory+TSCORE.dirSeparator+currentSrc);
                }
            });
        }
    };

    exports.getContent = function() {
        console.log("Not implemented");
    };

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