/* Copyright (c) 2012-2014 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";

    console.log("Loading directorybrowser.js ...");
    
    var TSCORE = require("tscore");    

    function addPerspective(parent, perspectiveId) {
        var perspectiveControl = $("<div class='form-inline'>")
                .append($("<div class='input-group' style='width: 90%'>")
                    //.append($("<button class='btn btn-default' style='width: 10%' title='Remove Perspective'><i class='fa fa-ellipsis-v'></i></button>"))
                    .append($("<select class='form-control' style='width: 70%'></select>"))
                    .append($("<button class='btn btn-default'  style='width: 40px' title='Remove Perspective'><i class='fa fa-times'></button>")
                        .click(function() {
                            $(this).parent().parent().remove();
                        })                
                  )
                );
                //.append($("<button class='btn' title='Remove this extension'><i class='icon-arrow-up'></button>"))
                //.append($("<button class='btn' title='Remove this extension'><i class='icon-arrow-down'></button>"))  

        generateSelectOptions(perspectiveControl.find("select"), TSCORE.Config.getPerspectiveExtensions(), perspectiveId);
        parent.append(perspectiveControl);
    }    
   

    
    function initUI() {

        $('#addPerspectiveButton').click(function(e) {
            // Fixes reloading of the application by click
            e.preventDefault();
            
            addPerspective($('#perspectiveList'), "");
        });   

        $( "#startDir" ).click(function() {
            TSCORE.IO.listSubDirectories("/media/z/TagSpaces");
        });

        $( "#selectDirectoryButton" ).click(function() {

        });
        
    }    
    
    function reInitUI(dirPath) {
        // $("#extensionsPathInput").val(TSCORE.Config.getExtensionPath()); 
        
        $('#directoryPath').empty();

        $('#subdirectoriesArea').empty();

        $('#directoryBrowserDialog').modal('show');         
    }        

   
    
    // Public Methods
    exports.initUI         = initUI;
    exports.reInitUI       = reInitUI;

});