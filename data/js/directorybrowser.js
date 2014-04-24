/* Copyright (c) 2012-2014 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";

    console.log("Loading directorybrowser.js ...");
    
    var TSCORE = require("tscore");    
    var TSPOSTIO = require("tspostioapi");  
    
    function initUI() {
        $( "#gotoParentDirButton" ).click(function() {
            var parent = TSCORE.TagUtils.extractParentDirectoryPath($("#directoryPath").val());
            TSCORE.IO.listSubDirectories(parent);
        });

        $( "#selectDirectoryButton" ).click(function() {
            TSPOSTIO.selectDirectory($("#directoryPath").val());
        });
    }    
    
    function reInitUI(dirPath) {
        $('#directoryPath').val(dirPath);

        var subfolders = $('#subdirectoriesArea').empty();
        if(TSCORE.subfoldersDirBrowser === undefined || TSCORE.subfoldersDirBrowser.length <= 0) {
                subfolders.append("<div class='alert alert-warning'>No subfolders found</div>");          
        } else {
            for(var j=0; j < TSCORE.subfoldersDirBrowser.length; j++) {                    
                if (TSCORE.Config.getShowUnixHiddenEntries() || 
                        (!TSCORE.Config.getShowUnixHiddenEntries() && (TSCORE.subfoldersDirBrowser[j].name.indexOf(".") !== 0))
                    ) {
                    subfolders.append($("<button>", { 
                        "class":    "btn btn-sm dirButton", 
                        "path":      TSCORE.subfoldersDirBrowser[j].path,
                        //"title":    TSCORE.subfoldersDirBrowser[j].path,
                        "style":    "margin: 1px;",
                        "text":     " "+TSCORE.subfoldersDirBrowser[j].name
                    })
                    .prepend("<i class='fa fa-folder-o'></i>")            
                    .click( function() {
                        TSCORE.IO.listSubDirectories($(this).attr("path"));
                    })                   
                    );
                }
           }        
       }           

        $('#directoryBrowserDialog').modal({backdrop: 'static',show: true});         
    }           
    
    // Public Methods
    exports.initUI         = initUI;
    exports.reInitUI       = reInitUI;

});