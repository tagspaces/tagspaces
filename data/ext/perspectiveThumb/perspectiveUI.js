/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";
    
console.log("Loading UI for perspectiveDefault");

    var TSCORE = require("tscore");
        
    var TMB_SIZES = [ "100px", "200px", "300px", "400px", "500px" ];

    var supportedFileTypeThumnailing = ['jpg','jpeg','png','gif'];

    function ExtUI(extID) {
        this.extensionID = extID;
        this.viewContainer = $("#"+this.extensionID+"Container").empty();
        this.viewToolbar = $("#"+this.extensionID+"Toolbar").empty();
        this.viewFooter = $("#"+this.extensionID+"Footer").empty();

    }
    
    ExtUI.prototype.buildUI = function() {
        console.log("Init UI module");
               
        var self = this;
        
        this.viewToolbar.append($("<div >", { 
            class: "btn-group", 
        })          
        
            .append($("<button>", { 
                class: "btn ",
                title: "Toggle Select All Files",
                id: this.extensionID+"ToogleSelectAll",    
            })
            .click(function() {
                if($(this).find("i").attr("class") == "icon-check-empty") {
                    TSCORE.selectedFiles = [];   
                    $('#'+self.extensionID+'FileTable tbody tr').each(function(){
                        //$(this).addClass('ui-selected');
                        //$(this).find(".fileSelection").prop("checked",true);
                        TSCORE.selectedFiles.push($(this).find(".fileTitleButton").attr("filepath"));  
                        //self.handleElementActivation();                          
                    });
                    $(this).find("i").removeClass("icon-check-empty"); 
                    $(this).find("i").addClass("icon-check"); 
                } else {
                    TSCORE.PerspectiveManager.clearSelectedFiles();
                    $(this).find("i").removeClass("icon-check");                                     
                    $(this).find("i").addClass("icon-check-empty");
                }            
            })
            .append( "<i class='icon-check-empty'>" )
            )
            
        )
        
        this.viewToolbar.append($("<div>", { 
            class: "btn-group",
            id: this.extensionID+"Toolbar",             
        })

            .append($("<button>", { 
                class: "btn ",
                title: "Create new file",
                id: this.extensionID+"CreateFileButton",    
            })
            .prop('disabled', true)
            .click(function() {
                TSCORE.showFileCreateDialog();
            })
            .append( "<i class='icon-plus'>" )
            )
        
            .append($("<button>", { 
                class: "btn",
                title: "Show subfolders content. \nOn subfolder with many files, this step can take some time!",
                id: this.extensionID+"IncludeSubDirsButton",    
            })
        //    .prop('disabled', true)         
            .click(function() {
             //   $(this).prop('disabled', true);
                TSCORE.IO.createDirectoryIndex(TSCORE.currentPath);
            })
            .append( $("<i>", { class: "icon-retweet", }) )
            )
            
            .append($("<button>", { 
                class: "btn",           
                title: "Tag Selected Files",
                id: this.extensionID+"TagButton",    
            })
        //    .prop('disabled', true)
            .click(function() {
                TSCORE.showAddTagsDialog();
            })
            .append( $("<i>", { class: "icon-tag", }) )
            )    
            
        ); // end toolbar
               

        this.viewToolbar.append($("<div >", { 
            class: "input-append pull-right", 
        })      
            // Filter               
            .append($("<input>", { 
                type: "text",
                //name: "fileFilter",
                class: "input-medium",
                id:   this.extensionID+"FilterBox",
                placeholder: "Filename Filter",
                style: "width: 100px;"
            }).keyup(function() {
                self.setFilter(this.value); 
            }))
                    
            .append($("<button>", { 
                    class: "btn", 
                    title: "Clear Filter",
                    id:   this.extensionID+"ClearFilterButton",
                })
                .append( $("<i>", { class: "icon-remove", }) )
                .click(function(evt) {
                    evt.preventDefault();
                    self.setFilter("");            
                })
            )        
        ); // End Filter
        
    }
    
    ExtUI.prototype.initMainContainer = function() {
       
    }           

    // Helper function for organizing the files in data buckets
    function groupDataByDate() {
        var dataGroupedByDate = TSCORE.fileList;

        // Group by date
        dataGroupedByDate = _.groupBy( dataGroupedByDate, function(value){ 
                var tmpDate = new Date(value[TSCORE.fileListFILELMDT])    
                tmpDate.setHours(0,0,0,0);
                tmpDate.setDate(1);
                return tmpDate.getTime();
            });       

        // Sort by date
        dataGroupedByDate = _.sortBy(dataGroupedByDate, function(value) { 
                var tmpDate = new Date(value[0][TSCORE.fileListFILELMDT]);    
                return -tmpDate.getTime();            
            });
        
        return dataGroupedByDate;
    }
    
    ExtUI.prototype.reInit = function() {
        this.viewContainer.empty();
        this.viewContainer.addClass("accordion");

        $( this.extensionID+"CreateFileButton" ).prop("disabled", false);     
        $( this.extensionID+"IncludeSubDirsButton" ).prop('disabled', false); 
        
        var self = this;
//            console.log("Grouping by date: "+value[0][TSCORE.fileName]+" length: "+value.length);        

        var i=0;
        _.each(groupDataByDate(), function (value) { 
            i++;
            
            var tmpDate = new Date(value[0][TSCORE.fileListFILELMDT]);
            tmpDate.setHours(0,0,0,0);
            var groupingTitle = TSCORE.TagUtils.formatDateTime(tmpDate, false);
            
            self.viewContainer.append($("<div>", { 
                "class": "accordion-group",    
                "style": "width: 99%; border: 0px #aaa solid;",             
            })
            .append($("<div>", { 
                "class":        "accordion-heading  btn-group",
                "style":        "width:100%; margin: 0px;",
            })
            
            .append($("<button>", { // Grouped content toggle button
                        "class":        "btn btn-link",
                        "data-toggle":  "collapse",
                        "data-target":  "#"+self.extensionID+"sortingButtons"+i,
                        "title":        "Toggle Group",
                    }  
                )
                .html("<i class='icon-minus-sign-alt'></i>")   
            )// End date toggle button  
                                    
            .append($("<button>", {
                "class":        "btn btn-link btn-small",
                "text":         groupingTitle, 
                })  
            )
            
            ) // end heading
            
            .append($("<div>", { 
                "class":   "accordion-body collapse in",
                "id":      self.extensionID+"sortingButtons"+i,
                "style":   "margin: 0px 0px 0px 3px; border: 0px;",
            })          
            .append($("<div>", { 
                "class":   "accordion-inner",
                "id":      self.extensionID+"sortingButtonsContent"+i,
                "style":   "padding: 2px; border: 0px;",
            })
            ) // end accordion-inner    
            ) // end accordion button        

            ); // end group

            var groupedContent = $("<ol>", {
                style: "overflow: visible;",
                class: "selectableFiles",
            }).appendTo( "#"+self.extensionID+"sortingButtonsContent"+i ); 
            
            // Iterating over the files in group 
            for(var j=0; j < value.length; j++) {
                var previewContent = "";
                if(supportedFileTypeThumnailing.indexOf(value[j][TSCORE.fileListFILEEXT]) >= 0) {
                    previewContent = $('<img>', { 
//                            title: value[j][TSCORE.fileListTITLE]+"\n"+value[j][TSCORE.fileListFILELMDT], 
                            class: "thumbImg", 
                            src: 'file:///'+value[j][TSCORE.fileListFILEPATH] 
                         });
                } else {
                    previewContent = $('<span>', { 
                            class: "fileExtension", 
                            text: value[j][TSCORE.fileListFILEEXT],
//                            title: value[j][TSCORE.fileListTITLE]+"\n"+value[j][TSCORE.fileListFILELMDT], 
                         });
               }
               groupedContent.append(
                 $('<li>', { 
                     title: value[j][TSCORE.fileListTITLE]+"\n"+value[j][TSCORE.fileListFILELMDT],    
                     filepath: value[j][TSCORE.fileListFILEPATH], 
                     style: 'border: 1px dashed gray;' 
                 })
                 .append(previewContent)
                 .dblclick(function() {
                        var filePath = $(this).attr("filepath");
                        TSCORE.FileOpener.openFile(filePath);
                        self.selectFile($(this), filePath); 
                 })
                 .click(function() {
                        var filePath = $(this).attr("filepath");
                        self.selectFile($(this), filePath); 
                 })
                 );
            } 

            $( "#"+self.extensionID+"sortingButtonsContent"+i ).selectable({
                start: function() {
                    TSCORE.PerspectiveManager.clearSelectedFiles();   
                },                
                stop: function() {
                    TSCORE.selectedFiles = [];          
                    $( ".ui-selected", this ).each(function() {
                        TSCORE.selectedFiles.push($(this).attr("filepath"));
                    });
                    console.log("Selected files: "+TSCORE.selectedFiles);
                    self.handleElementActivation();
                }
            });            
        });           
   
    }
    
    ExtUI.prototype.selectFile = function(uiElement, filePath) {
        TSCORE.PerspectiveManager.clearSelectedFiles();   

        $(uiElement).toggleClass("ui-selected");
        
        TSCORE.selectedFiles.push(filePath);  
        
        this.handleElementActivation();      
    }     

    ExtUI.prototype.setFilter = function(filterValue) {
        TSCORE.PerspectiveManager.clearSelectedFiles();   


        console.log("Filter to value: "+filterValue);           
    }   
    
    ExtUI.prototype.handleElementActivation = function() {
        console.log("Entering element activation handler...");
        
        var tagButton = $( "#"+this.extensionID+"TagButton" );
        
        if (TSCORE.selectedFiles.length > 1) {
            tagButton.prop('disabled', false);
        } else if (TSCORE.selectedFiles.length == 1) {
            tagButton.prop('disabled', false);
        } else {
            tagButton.prop('disabled', true);
        }    
    }
    
    exports.ExtUI                   = ExtUI;
});