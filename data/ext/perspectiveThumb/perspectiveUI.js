/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";
    
console.log("Loading UI for perspectiveDefault");

    var TSCORE = require("tscore");
        
    var TMB_SIZES = [ "100px", "200px", "300px" ];

    var MONTH = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

    var PREVIEW_TAGS_CNT = 5;

    var supportedFileTypeThumnailing = ['jpg','jpeg','png','gif'];

    function ExtUI(extID) {
        this.extensionID = extID;
        this.viewContainer = $("#"+this.extensionID+"Container").empty();
        this.viewToolbar = $("#"+this.extensionID+"Toolbar").empty();
        this.viewFooter = $("#"+this.extensionID+"Footer").empty();

        this.currentGrouping = "" // tagchain, day, month, year
        this.thumbEnabled = false;
        this.currentTmbSize = 0;
        this.currentFilter = "";
        this.nextFilter = "";        
        this.searchResults = undefined;    
        this.startTime = undefined;    
    }
    
    // Helper function user by basic and search views
    ExtUI.prototype.createFileTile = function(title, filePath, fileExt, fileTags) {
        var self = this;
        
        //TODO minimize platform specific calls     
        var tmbPath = undefined;
        if(isCordova) {
            tmbPath = filePath;            
        } else {
            tmbPath = "file:///"+filePath;  
        }       
        
        var thumbHTML = "";     
        if(supportedFileTypeThumnailing.indexOf(fileExt) >= 0) {
            thumbHTML = $('<span>').append( $('<img>', { 
                class: "thumbImgTile",
                filepath: tmbPath, 
                style: "width: 0px; height: 0px; border: 0px" 
            }));
        }       
        
        var titleHTML = $('<p>', { 
                text: title, 
                class: "fileTitle",
            });
            
        //var tagsHTML = TSCORE.generateTagButtons(fileTags);   
        var tagsHTML = $('<span>');
        if(fileTags.length > 0) {
            var tagString = ""+fileTags ;
            var tags = tagString.split(",");

            var tagCounter = 0;
            if (tags.length > PREVIEW_TAGS_CNT) {
                tagCounter = PREVIEW_TAGS_CNT+1;
                tags[PREVIEW_TAGS_CNT] = "...";
            } else {
                tagCounter = tags.length;                
            }
            for (var i=0; i < tagCounter; i++) { 
                tagsHTML.append($('<button>', {
                    "class":  "btn btn-small tagButton fileTagsTile", 
                    text:     tags[i]+" ",
                    tag:      tags[i],   
                    filepath: filePath,                
                    style:    TSCORE.generateTagStyle(TSCORE.Config.findTag(tags[i]))
                    })
                    .click( function() {
                        self.selectFile($(this).attr("filepath"));
                        TSCORE.openTagMenu(this, $(this).attr("tag"), $(this).attr("filepath"));
                    } )
                    .append("<span class='caret'/>")                    
                    .dropdown( 'attach' , '#tagMenu' )
                    /* .draggable({
                        "cancel":   false,
                        "appendTo": "body",
                        "helper":   "clone",
                        "revert":   true,
                        "start":    function(e) {
                            self.selectFile($(this).attr("filepath")); 
                        }         
                    }) */                   
                );   
            }   
        }
          
        var extHTML = "";
        if(fileExt.length > 0) {
            extHTML = $('<span>', {
                "class":  "fileExtTile",                
                text: fileExt
                })
        } 
        
        var fileSelectorHTML = $('<button>', {
                "class":     "btn btn-link fileTileSelector",
                "filepath":  filePath               
             })
             .append( "<i class='icon-check-empty'>" )
             .click( function(e) {
                  e.preventDefault();
                  var fpath = $(this).attr("filepath");
                  var stateTag = $(this).find("i");
                  if(stateTag.hasClass("icon-check-empty")) {                    
                      stateTag.removeClass("icon-check-empty").addClass("icon-check");
                      $(this).parent().parent().addClass("ui-selected");
                      TSCORE.selectedFiles.push(fpath);  
                  } else {
                      stateTag.addClass("icon-check-empty").removeClass("icon-check");                      
                      $(this).parent().parent().removeClass("ui-selected");
                      TSCORE.selectedFiles.splice(TSCORE.selectedFiles.indexOf(fpath), 1);
                  }                  
                  self.handleElementActivation();
                  return false; 
              })              
            
        var tileHTML = $('<p>', {})        
        .append(titleHTML)
        .append(thumbHTML)
        .append(tagsHTML)
        .append(extHTML)
        .append(fileSelectorHTML)
                        
        return tileHTML;        
    }    
    
    ExtUI.prototype.buildUI = function() {
        console.log("Init UI module");
               
        var self = this;
        
        this.viewToolbar.css("position","relative");
        
        this.viewToolbar.append($("<div >", { 
            class: "btn-group", 
        })          
        
            .append($("<button>", { 
                class: "btn ",
                title: "Toggle Select All Files",
                id: this.extensionID+"ToogleSelectAll",    
            })
            .click(function(e) {
                var checkIcon = $(this).find("i");
                if(checkIcon.hasClass("icon-check-empty")) {
                    TSCORE.selectedFiles = [];   
                    $(self.viewContainer).find('.fileTileSelector').each(function(){
                        $(this).parent().parent().addClass("ui-selected");
                        $(this).find("i").addClass("icon-check").removeClass("icon-check-empty");
                        TSCORE.selectedFiles.push($(this).attr("filepath"));  
                    });
                } else {
                    TSCORE.PerspectiveManager.clearSelectedFiles();
                }    
                self.handleElementActivation();
                checkIcon.toggleClass("icon-check");                                     
                checkIcon.toggleClass("icon-check-empty");                        
            })
            .append( "<i class='icon-check-empty'>" )
            )
            
        )
        
        this.viewToolbar.append($("<div>", { 
            class: "btn-group",
        })

            .append($("<button>", { 
                class: "btn ",
                title: "Create new file",
                id: this.extensionID+"CreateFileButton",    
            })
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
            
            .append($("<button>", { 
                class: "btn ",  
                "data-toggle": "button",        
                title: "Toggle file thumbnails",
                id: this.extensionID+"ShowTmbButton",    
            })
            .click(function() {
                self.toggleThumbnails();
            })
            .append( $("<i>", { class: "icon-picture", }) )
            )
     
            .append($("<button>", { 
                class: "btn ",  
                title: "Increase Thumbnails Size",
                id: this.extensionID+"IncreaseThumbsButton",    
            })
            .click(function() {
                self.switchThumbnailSize();
            })      
            .append( $("<i>", { class: "icon-zoom-in", }) )
            .prop('disabled', true)
            )               
            
        ); // end toolbar

        this.viewToolbar.append($("<div>", { 
            "class"         : "btn-group",
            "data-toggle"   : "buttons-radio"             
        })

            .append($("<button>", { 
                class:  "btn ",
                type:   "button",
                title:  "Disable Grouping ",
                text:   ""
            })
            .button('toggle')
            .click(function() {
                self.switchGrouping("ungroup");
            })
            .prepend( "<i class='icon-calendar-empty' />" )
            )
        
            .append($("<button>", { 
                class:  "btn ",
                type:   "button",
                title:  "Group by Day ",
                text:   " D"
            })
            .click(function() {
                self.switchGrouping("day");
            })
            .prepend( "<i class='icon-calendar' />" )                        
            )
            
            .append($("<button>", { 
                class:  "btn ",
                type:   "button",
                title:  "Group by Month ",
                text:   " M"
            })
            .click(function() {
                self.switchGrouping("month");
            })
            .prepend( "<i class='icon-calendar' />" )                        
            )

            .append($("<button>", { 
                class:  "btn ",
                type:   "button",
                title:  "Group by Year ",
                text:   " Y"
            })
            .click(function() {
                self.switchGrouping("year");
            })
            .prepend( "<i class='icon-calendar' />" )            
            )                        
            
        ); // end toolbar

        this.viewToolbar.append($("<div >", { 
            class: "input-append",
            style: "position:absolute; top:1px; right:1px;" 
        })      
            // Filter               
            .append($("<input>", { 
                type: "text",
                class: "input-medium",
                id:   this.extensionID+"FilterBox",
                placeholder: "Search",
                title: "Search hints:\n"+
                       "All terms should be true in order the file to appear in the search results \n"+
                       "term: the term should be part of the file title or file extension \n"+
                       "!term: the term should not be part of the file title or file extension \n"+
                       "+tagname: file should be tagged with this tag \n"+
                       "-tagname: file should not be tagged with this tag",
            })
            .focus(function(e) {
                $(this).removeClass("input-medium");
                $(this).addClass("input-large");
            })
            .keyup(function(e) {
                if (e.keyCode == 13) {
                    self.reInit();
                }  else {
                    self.nextFilter = this.value;
                } 
                if (this.value.length == 0) {
                    self.reInit();
                }                 
            })
            .blur(function() {
                $(this).addClass("input-medium");
                $(this).removeClass("input-large");                
                if (this.value.length == 0) {
                    self.reInit();
                } 
            })            
            )
                    
            .append($("<button>", { 
                    class: "btn", 
                    title: "Search",
                })
                .append( $("<i>", { class: "icon-filter", }) )
                .click(function(evt) {
                    evt.preventDefault();
                    self.reInit();
                })
            )        
            
            .append($("<button>", { 
                    class: "btn", 
                    title: "Clear Filter",
                })
                .append( $("<i>", { class: "icon-remove", }) )
                .click(function(evt) {
                    evt.preventDefault();
                    $("#"+self.extensionID+"FilterBox").val("");
                    $("#"+self.extensionID+"FilterBox").val("").addClass("input-medium")
                    $("#"+self.extensionID+"FilterBox").val("").removeClass("input-large");
                    self.setFilter(""); 
                    self.reInit();
                })
            )        
        ); // End Filter        
    }
    
    ExtUI.prototype.setFilter = function(filterValue) {
        console.log("Filter to value: "+filterValue);   
        $("#"+this.extensionID+"FilterBox").val(filterValue);        
        this.nextFilter = filterValue;
    }   

    ExtUI.prototype.switchThumbnailSize = function() {
        this.currentTmbSize = this.currentTmbSize + 1;
        
        if(this.currentTmbSize >= TMB_SIZES.length) { this.currentTmbSize = 0; }
        
        $('.thumbImgTile').css({"max-width":TMB_SIZES[this.currentTmbSize], "max-height":TMB_SIZES[this.currentTmbSize] });     
    }
    
    ExtUI.prototype.enableThumbnails = function() {
        $( "#"+this.extensionID+"IncreaseThumbsButton" ).prop('disabled', false);
        $("#"+this.extensionID+"Container .thumbImgTile").each(function() {
            $(this).attr('style', "");
            $(this).attr('src',$(this).attr('filepath'));
        });
        $('.thumbImgTile').css({"max-width":TMB_SIZES[this.currentTmbSize], "max-height":TMB_SIZES[this.currentTmbSize] });     
    }   
    
    ExtUI.prototype.disableThumbnails = function() {
        //this.currentTmbSize = 0;
        $( "#"+this.extensionID+"IncreaseThumbsButton" ).prop('disabled', true);
        $("#"+this.extensionID+"Container .thumbImgTile").each(function() {
            $(this).attr('style', "width: 0px; height: 0px; border: 0px");
            $(this).attr('src',"");
        });
    }     
    
    ExtUI.prototype.refreshThumbnails = function() {
        if(this.thumbEnabled) {
            this.enableThumbnails();
        } else {
            this.disableThumbnails();
        }
    }        
    
    ExtUI.prototype.toggleThumbnails = function() {
        this.thumbEnabled = !this.thumbEnabled;
        this.refreshThumbnails();
    }       

    ExtUI.prototype.switchGrouping = function(grouping) {
        this.currentGrouping = grouping;
        this.reInit();
    }
        
    // Helper function for organizing the files in data buckets
    ExtUI.prototype.calculateGrouping = function(data) {
        switch (this.currentGrouping){
            case "day": {
                data = _.groupBy( data, function(value){ 
                        var tmpDate = new Date(value[TSCORE.fileListFILELMDT])    
                        tmpDate.setHours(0,0,0,0);
                        return tmpDate.getTime();
                    });                       
                // Sort groups by date
                data = _.sortBy(data, function(value) { 
                        var tmpDate = new Date(value[0][TSCORE.fileListFILELMDT]);    
                        return -tmpDate.getTime();            
                    });
                break;                
            }
            case "month": {
                data = _.groupBy( data, function(value){ 
                        var tmpDate = new Date(value[TSCORE.fileListFILELMDT])    
                        tmpDate.setHours(0,0,0,0);
                        tmpDate.setDate(1);
                        return tmpDate.getTime();
                    });
                // Sort groups by date
                data = _.sortBy(data, function(value) { 
                        var tmpDate = new Date(value[0][TSCORE.fileListFILELMDT]);    
                        return -tmpDate.getTime();            
                    });                                           
                break;                
            }
            case "year": {
                data = _.groupBy( data, function(value){ 
                        var tmpDate = new Date(value[TSCORE.fileListFILELMDT])    
                        tmpDate.setHours(0,0,0,0);
                        tmpDate.setDate(1);
                        tmpDate.setMonth(1);
                        return tmpDate.getTime();
                    });
                // Sort groups by date
                data = _.sortBy(data, function(value) { 
                        var tmpDate = new Date(value[0][TSCORE.fileListFILELMDT]);    
                        return -tmpDate.getTime();            
                    });                           
                break;                
            }            
            default : {
                data = _.groupBy( data, function(value){ 
                        return true;
                    });       
                break;                            
            }
        }
        
        return data;
    }
    
    /** Filtering the data
     * 
     * @param {Object} data The data to be filtered
     */
    ExtUI.prototype.filterData = function(data) {
        var self = this;
        
        // By empty filter just return the data
        if(this.nextFilter.length <= 0) {
            return data;
        }
        
        var query = self.nextFilter.toLowerCase();
        query = query.replace(/^\s+|\s+$/g, "");
        var queryTerms = query.split(" ");
        
        // Analysing filter
        var includedTerms = [];
        var excludedTerms = [];
        var includedTags = [];
        var excludedTags = [];
        
        queryTerms.forEach(function (value, index) {
            if(value.length > 1) {
                if(value.indexOf("!") == 0) {
                    excludedTerms.push([value.substring(1,value.length),false]);
                } else if(value.indexOf("+") == 0) {    
                    includedTags.push([value.substring(1,value.length),true]);
                } else if(value.indexOf("-") == 0) {
                    excludedTags.push([value.substring(1,value.length),true]);
                } else {
                    includedTerms.push([value,false]);
                }                       
            }
        })  
        
        data = _.filter(data, function(value) {
                // Serching in the title and the extension
                // var searchIn = value[TSCORE.fileListTITLE].toLowerCase()+"."+value[TSCORE.fileListFILEEXT].toLowerCase();
                
                // Searching in the whole filename
                var searchIn = value[TSCORE.fileListFILENAME].toLowerCase();
                var tags = value[TSCORE.fileListTAGS];
                var result = true;
                if(tags.length < 1 && includedTags.length > 0) {
                    return false;
                }
                for (var i=0; i < includedTerms.length; i++) {
                    if(searchIn.indexOf(includedTerms[i][0]) >= 0) {
                        includedTerms[i][1] = true;
                    } else {
                        return false;
                    }
                };
                for (var i=0; i < excludedTerms.length; i++) {
                    if(searchIn.indexOf(excludedTerms[i][0]) < 0) {
                        excludedTerms[i][1] = true;
                    } else {
                        return false;
                    }
                };
                   
                for (var i=0; i < includedTags.length; i++) {
                    includedTags[i][1] = false;
                    for (var j=0; j < tags.length; j++) {
                        if(tags[j].toLowerCase() == includedTags[i][0]) {
                            includedTags[i][1] = true;
                        }
                    }
                };
                for (var i=0; i < includedTags.length; i++) {
                    result = result & includedTags[i][1];
                }
               
                for (var i=0; i < excludedTags.length; i++) {
                    excludedTags[i][1] = true;
                    for (var j=0; j < tags.length; j++) {
                        if(tags[j].toLowerCase() == excludedTags[i][0]) {
                            excludedTags[i][1] = false;
                        }
                    }   
                };                
                for (var i=0; i < excludedTags.length; i++) {
                    result = result & excludedTags[i][1];
                }
                
                return result;        
            });

        this.currentFilter = this.nextFilter;        
        return data;
    }    

    ExtUI.prototype.calculateGroupTitle = function(rawSource) {    
        var groupingTitle = undefined;
        switch (this.currentGrouping){
            case "day": {
                var tmpDate = new Date(rawSource);
                tmpDate.setHours(0,0,0,0);
                groupingTitle = TSCORE.TagUtils.formatDateTime(tmpDate, false);                
                break;                
            }
            case "month": {
                var tmpDate = new Date(rawSource);
                tmpDate.setHours(0,0,0,0);
                tmpDate.setDate(1);
                groupingTitle = MONTH[tmpDate.getMonth()] +", "+tmpDate.getFullYear();                                
                break;                
            }
            case "year": {
                var tmpDate = new Date(rawSource);
                tmpDate.setHours(0,0,0,0);
                tmpDate.setDate(1);
                tmpDate.setMonth(1);
                groupingTitle = tmpDate.getFullYear();                                
                break;                
            }            
            default : {
                groupingTitle = "No Grouping";                            
            }
        }

        return groupingTitle;
    }
    
    ExtUI.prototype.reInit = function() {
        this.startTime = new Date().getTime();
        
        this.viewContainer.empty();
        this.viewContainer.addClass("accordion");
   
        $( this.extensionID+"IncludeSubDirsButton" ).prop('disabled', false); 
        
        var self = this;

        this.searchResults = self.filterData(TSCORE.fileList);

        this.viewFooter.empty();
        var endTime = new Date().getTime();          
        if(this.searchResults.length == 0) {
            this.viewFooter.append($("<div>", { 
                "class": "searchSummary",    
                "text": "No files found."             
            }));            
        } else {
            this.viewFooter.append($("<div>", { 
                "class": "searchSummary",    
                "text":  this.searchResults.length+" files found in "+(endTime-this.startTime)/1000+" sec."             
            }));
        } 


        var i=0;
        _.each(self.calculateGrouping(this.searchResults), function (value) { 
            i++;
            
            var groupingTitle = self.calculateGroupTitle(value[0][TSCORE.fileListFILELMDT]);
            
            self.viewContainer.append($("<div>", { 
                "class": "accordion-group disableTextSelection",    
                "style": "width: 100%; border: 0px #aaa solid;",             
            })
            .append($("<div>", { 
                "class":        "accordion-heading  btn-group",
                "style":        "width:100%; margin: 0px; border-bottom: solid 1px #eee",
            })
            
            .append($("<button>", { // Grouped content toggle button
                        "class":        "btn btn-link",
                        "data-toggle":  "collapse",
                        "data-target":  "#"+self.extensionID+"sortingButtons"+i,
                        "title":        "Toggle Group",
                    }  
                )
                .html("<i class='icon-minus-sign-alt' /i>&nbsp;")
                .click(function() {
                    $(this).find('i').toggleClass("icon-minus-sign-alt").toggleClass("icon-plus-sign-alt");
                })   
            )// End date toggle button  
                                    
            .append($("<span>", {
                "class":        "btn btn-link groupTitle",
               // "data-toggle":  "collapse",
               // "data-target":  "#"+self.extensionID+"sortingButtons"+i,                
                "style":        "margin-left: 0px; padding-left: 0px",
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
               groupedContent.append(
                 $('<li>', { 
                     title: value[j][TSCORE.fileListFILENAME]+"\n Modified on: "+ TSCORE.TagUtils.formatDateTime(value[j][TSCORE.fileListFILELMDT], false),    
                     filepath: value[j][TSCORE.fileListFILEPATH], 
                     class: 'fileTile' 
                 })
                 .append(self.createFileTile(
                     value[j][TSCORE.fileListTITLE],
                     value[j][TSCORE.fileListFILEPATH],
                     value[j][TSCORE.fileListFILEEXT],
                     value[j][TSCORE.fileListTAGS]
                 ))
                 .dblclick(function() {
                        var filePath = $(this).attr("filepath");
                        TSCORE.FileOpener.openFile(filePath);
                        self.selectFile(filePath); 
                 })
                 .click(function() {
                        var filePath = $(this).attr("filepath");
                        self.selectFile(filePath); 
                 })
                .draggable({
                    "cancel":    false,
                    "appendTo":  "body",
                    "helper":    "clone",
                    "opacity":   "0.5",
                    "revert":    true,
                    "start":     function(e, ui) {
                        self.selectFile($(this).attr("filepath")); 
                    }            
                })                  
                .droppable({
                    accept: ".tagButton",
                    hoverClass: "activeRow",
                    drop: function( event, ui ) {
                        var tagName = TSCORE.selectedTag; //ui.draggable.attr("tag");
                                        
                        var targetFilePath = $(this).attr("filepath");
        
                        // preventing self drag of tags
                        var targetTags = TSCORE.TagUtils.extractTags(targetFilePath);
                        for (var i = 0; i < targetTags.length; i++) {
                            if (targetTags[i] === tagName) {
                                return true;
                            }
                        }
                        
                        console.log("Tagging file: "+tagName+" to "+targetFilePath);
                        $(this).toggleClass("ui-selected");
                        TSCORE.PerspectiveManager.clearSelectedFiles();
                        TSCORE.selectedFiles.push(targetFilePath); 
                        TSCORE.TagUtils.addTag(TSCORE.selectedFiles, [tagName]);
                        self.handleElementActivation();
                        
                        $(ui.helper).remove();  
                    }                   
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
                 
        this.refreshThumbnails();
    }
    
    ExtUI.prototype.selectFile = function(filePath) {
        TSCORE.PerspectiveManager.clearSelectedFiles();   
        $(this.viewContainer).find('.fileTileSelector').each(function(){
            if($(this).attr("filepath") == filePath) {
                $(this).parent().parent().toggleClass("ui-selected");
                $(this).find("i").toggleClass("icon-check").toggleClass("icon-check-empty");
                TSCORE.selectedFiles.push($(this).attr("filepath"));                  
            }
        });
      
        TSCORE.selectedFiles.push(filePath);  
        this.handleElementActivation();      
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
    
    ExtUI.prototype.getNextFile = function(filePath) {
        var nextFilePath = undefined;
        var self = this;
        this.searchResults.forEach(function(entry, index) {
            if(entry[TSCORE.fileListFILEPATH] == filePath) {
                var nextIndex = index+1;
                if(nextIndex < self.searchResults.length) {
                    nextFilePath = self.searchResults[nextIndex][TSCORE.fileListFILEPATH];                        
                } else {
                    nextFilePath = self.searchResults[0][TSCORE.fileListFILEPATH];
                }               
            }           
            console.log("Path: "+entry[TSCORE.fileListFILEPATH]);
        });
        TSCORE.PerspectiveManager.clearSelectedFiles();     
        console.log("Next file: "+nextFilePath);
        return nextFilePath;         
    }
    
    ExtUI.prototype.getPrevFile = function(filePath) {    
        var prevFilePath = undefined;
        var self = this;
        this.searchResults.forEach(function(entry, index) {
            if(entry[TSCORE.fileListFILEPATH] == filePath) {
                var prevIndex = index-1;
                if(prevIndex >= 0) {
                    prevFilePath = self.searchResults[prevIndex][TSCORE.fileListFILEPATH];                        
                } else {
                    prevFilePath = self.searchResults[self.searchResults.length-1][TSCORE.fileListFILEPATH];
                }
            }           
            console.log("Path: "+entry[TSCORE.fileListFILEPATH]);
        });
        TSCORE.PerspectiveManager.clearSelectedFiles();
        console.log("Prev file: "+prevFilePath);
        return prevFilePath;
    }    
    
    exports.ExtUI                   = ExtUI;
});