/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";
    
console.log("Loading UI for perspectiveDefault");

    var TSCORE = require("tscore");
        
    var TMB_SIZES = [ "200px", "300px", "100px" ];

    var MONTH = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

    var PREVIEW_TAGS_CNT = 5;

    var supportedFileTypeThumnailing = ['jpg','jpeg','png','gif'];

    function ExtUI(extID) {
        this.extensionID = extID;
        this.viewContainer = $("#"+this.extensionID+"Container").empty();
        this.viewToolbar = $("#"+this.extensionID+"Toolbar").empty();
        this.viewFooter = $("#"+this.extensionID+"Footer").empty();

        this.currentGrouping = ""; // tagchain, day, month, year
        this.thumbEnabled = false;
        this.currentTmbSize = 0;
        this.currentFilter = "";
        this.nextFilter = "";        
        this.searchResults = undefined;    
        this.supportedGroupings = [];
        
        this.supportedGroupings.push({"title":"Day","key":"day"});
        this.supportedGroupings.push({"title":"Month","key":"month"});
        this.supportedGroupings.push({"title":"Year","key":"year"});
        
        for(var i=0; i < TSCORE.Config.Settings["tagGroups"].length; i++) {
            this.supportedGroupings.push({
                "title": TSCORE.Config.Settings["tagGroups"][i].title,
                "key": TSCORE.Config.Settings["tagGroups"][i].key
            });
        }
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
                class: "titleInFileTile",
            });
            
        //var tagsHTML = TSCORE.generateTagButtons(fileTags);   
        var tagsHTML = $('<span>', {
            class: "tagsInFileTile"
        });
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
                    "class":  "btn btn-sm tagButton fileTagsTile", 
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
        };
          
        var extHTML = "";
        if(fileExt.length > 0) {
            extHTML = $('<span>', {
                "class":  "fileExtTile",                
                text: fileExt
               });
        };
        
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
              });              
            
        var tileHTML = $('<p>', {})        
        .append(thumbHTML)
        .append(titleHTML)        
        .append(tagsHTML)
        .append(extHTML)
        .append(fileSelectorHTML);
                        
        return tileHTML;        
    };    
    
    ExtUI.prototype.initFileGroupingMenu = function () {
        var self = this;
        
        var suggMenu = $("#"+self.extensionID+"GroupingMenu");
    
        suggMenu.append($('<li>').append($('<a>', { 
            title: "Ungroup all elementes", 
            text: " Ungroup",
            })
            .prepend("<i class='fa fa-times-circle'></i>") 
            .click(function() {
                $("#"+self.extensionID+"GroupingButton")
                    .text(" Group ")
                    .prepend( "<i class='fa fa-group' />" )
                    .append( "<span class='caret'></span>" );                                
                self.switchGrouping("");
            })                
        )); 
        suggMenu.append('<li class="divider"></li>');

        // Adding context menu entries according to the taggroups
        for (var i=0; i < self.supportedGroupings.length; i++) {        
            suggMenu.append($('<li>').append($('<a>', { 
                    title: "Group by "+self.supportedGroupings[i].title, 
                    text: " "+self.supportedGroupings[i].title,
                    key: self.supportedGroupings[i].key,
                    group: self.supportedGroupings[i].title,
                })
                .prepend( "<i class='fa fa-group' />" )            
                .click(function() {
                    $("#"+self.extensionID+"GroupingButton")
                        .text(" Grouped by "+$(this).attr("group")+" ")
                        .prepend( "<i class='fa fa-group' />" )
                        .append( "<span class='caret'></span>" );                                
                    self.switchGrouping($(this).attr("key"));
                })                
            ));              
        };    

    };
    
    ExtUI.prototype.buildUI = function() {
        console.log("Init UI module");
               
        var self = this;
        
        this.viewToolbar.css("position","relative");
        
        this.viewToolbar.append($("<div >", { 
            class: "btn-group", 
        })          
        
            .append($("<button>", { 
                class: "btn btn-default",
                title: "Toggle Select All Files",
                id: this.extensionID+"ToogleSelectAll",    
            })
            .click(function(e) {
                var checkIcon = $(this).find("i");
                if(checkIcon.hasClass("fa-square-o")) {
                    TSCORE.selectedFiles = [];   
                    $(self.viewContainer).find('.fileTileSelector').each(function(){
                        $(this).parent().parent().addClass("ui-selected");
                        $(this).find("i").addClass("fa-check-square-o").removeClass("fa-square-o");
                        TSCORE.selectedFiles.push($(this).attr("filepath"));  
                    });
                } else {
                    TSCORE.PerspectiveManager.clearSelectedFiles();
                }    
                self.handleElementActivation();
                checkIcon.toggleClass("fa-check-square-o");                                     
                checkIcon.toggleClass("fa fa-square-o");                        
            })
            .append( "<i class='fa fa-square-o'>" )
            )
            
        );
        
        this.viewToolbar.append($("<div>", { 
            class: "btn-group",
        })

            .append($("<button>", { 
                class: "btn btn-default",
                title: "Create new file",
                id: this.extensionID+"CreateFileButton",    
            })
            .click(function() {
                TSCORE.showFileCreateDialog();
            })
            .append( "<i class='fa fa-plus'>" )
            )
        
            .append($("<button>", { 
                class: "btn btn-default",
                title: "Show subfolders content. \nOn subfolder with many files, this step can take some time!",
                id: this.extensionID+"IncludeSubDirsButton",    
            })
        //    .prop('disabled', true)         
            .click(function() {
             //   $(this).prop('disabled', true);
                //TSCORE.startTime = new Date().getTime();      
                TSCORE.IO.createDirectoryIndex(TSCORE.currentPath);
            })
            .append( $("<i>", { class: "glyphicon glyphicon-retweet" }) )
            )
            
            .append($("<button>", { 
                class: "btn btn-default",           
                title: "Tag Selected Files",
                id: this.extensionID+"TagButton",    
            })
        //    .prop('disabled', true)
            .click(function() {
                TSCORE.showAddTagsDialog();
            })
            .append( $("<i>", { class: "fa fa-tag", }) )
            )    
            
            .append($("<button>", { 
                class: "btn btn-default",  
                "data-toggle": "button",        
                title: "Toggle file thumbnails",
                id: this.extensionID+"ShowTmbButton",    
            })
            .click(function() {
                self.toggleThumbnails();
            })
            .append( $("<i>", { class: "fa fa-picture-o", }) )
            )
     
            .append($("<button>", { 
                class: "btn btn-default",  
                title: "Increase Thumbnails Size",
                id: this.extensionID+"IncreaseThumbsButton",    
            })
            .click(function() {
                self.switchThumbnailSize();
            })      
            .append( $("<i>", { class: "fa fa-search-plus", }) )
            .prop('disabled', true)
            )               
            
        ); // end toolbar


        this.viewToolbar.append($("<div>", { 
            "class"         : "btn-group",
        })

            .append($("<button>", { 
                class:            "btn btn-default",
                type:             "button",
                title:            "Group",
                text:             " Group ",
                id:               this.extensionID+"GroupingButton",
                "data-toggle":    "dropdown"                    
            })
            .prepend( "<i class='fa fa-group' />" )
            .append( "<span class='caret'></span>" )
            )  
               
	        .append($('<ul>', {
	                id: self.extensionID+"GroupingMenu",
	                class: "dropdown-menu "            
	            }            
	        ))               
                        
        ); // end toolbar

        this.initFileGroupingMenu();

        this.viewToolbar.append($("<div >", { 
            class: "input-group pull-right",
            style: "width: 180px; padding-right: 4px;"  
        })      
            // Filter               
            .append($("<input>", { 
                type: "text",
                class: "form-control",
                id:   this.extensionID+"FilterBox",
                placeholder: "Search",
                title: "Search hints:\n"+
                       "All terms should be true in order the file to appear in the search results \n"+
                       "term: the term should be part of the file title or file extension \n"+
                       "!term: the term should not be part of the file title or file extension \n"+
                       "+tagname: file should be tagged with this tag \n"+
                       "-tagname: file should not be tagged with this tag",
            })
            /*.focus(function(e) {
                $(this).removeClass("input-medium");
                $(this).addClass("input-large");
            })*/
            .keyup(function(e) {
                // On enter fire the search
                if (e.keyCode == 13) {
                    $( "#"+self.extensionID+"ClearFilterButton").addClass("filterOn");
                    //TSCORE.startTime = new Date().getTime(); 
                    self.reInit();
                }  else {
                    self.nextFilter = this.value;
                } 
                if (this.value.length == 0) {
                    //TSCORE.startTime = new Date().getTime(); 
                    $( "#"+self.extensionID+"ClearFilterButton").removeClass("filterOn");
                    self.reInit();
                }                 
            })
            .blur(function() {
                //$(this).addClass("input-medium");
                //$(this).removeClass("input-large");                
                if (this.value.length == 0) {
                    $( "#"+self.extensionID+"ClearFilterButton").removeClass("filterOn");
                    //TSCORE.startTime = new Date().getTime(); 
                    self.reInit();
                } 
            })            
            )
            
            .append($("<span>", { 
                    class: "input-group-btn", 
                })                    
	            .append($("<button>", { 
	                    class: "btn btn-default", 
	                    title: "Search",
	                })
	                .append( $("<i>", { class: "fa fa-search", }) )
	                .click(function(evt) {
	                    evt.preventDefault();
	                    $( "#"+self.extensionID+"ClearFilterButton").addClass("filterOn");
	                    //TSCORE.startTime = new Date().getTime(); 
	                    self.reInit();
	                })
	            )        
	            
	            .append($("<button>", { 
	                    class: "btn btn-default", 
	                    title: "Clear Filter",
	                    id: self.extensionID+"ClearFilterButton"
	                })
	                .append( $("<i>", { class: "fa fa-times", }) )
	                .click(function(evt) {
	                    evt.preventDefault();
	                    $( "#"+self.extensionID+"ClearFilterButton").removeClass("filterOn");
	                    $("#"+self.extensionID+"FilterBox").val("");
	                    //$("#"+self.extensionID+"FilterBox").val("").addClass("input-medium");
	                    //$("#"+self.extensionID+"FilterBox").val("").removeClass("input-large");
	                    self.setFilter(""); 
	                    //TSCORE.startTime = new Date().getTime();                     
	                    self.reInit();
	                })
	            )
	        )        
        ); // End Filter  
        
		// Init Tag Context Menus
	    this.viewContainer.on("contextmenu click", ".tagButton", function (e) {
			TSCORE.hideAllDropDownMenus();
			
	        TSCORE.openTagMenu(this, $(this).attr("tag"), $(this).attr("filepath"));
	        
	        $("#tagMenu").css({
	            display: "block",
	            left: e.pageX,
	            top: e.pageY
	        });
	        return false;
	    });		              
    };
    
    ExtUI.prototype.setFilter = function(filterValue) {
        console.log("Filter to value: "+filterValue);   
        $("#"+this.extensionID+"FilterBox").val(filterValue);    
        
        if(filterValue.length > 0) {
            $( "#"+this.extensionID+"ClearFilterButton").addClass("filterOn");
        } else {
            $( "#"+this.extensionID+"ClearFilterButton").removeClass("filterOn");
        }
                    
        this.nextFilter = filterValue;
    };   

    ExtUI.prototype.switchThumbnailSize = function() {
        this.currentTmbSize = this.currentTmbSize + 1;
        
        if(this.currentTmbSize >= TMB_SIZES.length) { this.currentTmbSize = 0; }
        
        $('.thumbImgTile').css({"max-width":TMB_SIZES[this.currentTmbSize], "max-height":TMB_SIZES[this.currentTmbSize] });     
    };
    
    ExtUI.prototype.enableThumbnails = function() {
        $( "#"+this.extensionID+"IncreaseThumbsButton" ).prop('disabled', false);
        $("#"+this.extensionID+"Container .thumbImgTile").each(function() {
            $(this).attr('style', "");
            $(this).attr('src',$(this).attr('filepath'));
        });
        $('.thumbImgTile').css({"max-width":TMB_SIZES[this.currentTmbSize], "max-height":TMB_SIZES[this.currentTmbSize] });     
    };   
    
    ExtUI.prototype.disableThumbnails = function() {
        //this.currentTmbSize = 0;
        $( "#"+this.extensionID+"IncreaseThumbsButton" ).prop('disabled', true);
        $("#"+this.extensionID+"Container .thumbImgTile").each(function() {
            $(this).attr('style', "width: 0px; height: 0px; border: 0px");
            $(this).attr('src',"");
        });
    };     
    
    ExtUI.prototype.refreshThumbnails = function() {
        if(this.thumbEnabled) {
            this.enableThumbnails();
        } else {
            this.disableThumbnails();
        }
    };       
    
    ExtUI.prototype.toggleThumbnails = function() {
        this.thumbEnabled = !this.thumbEnabled;
        this.refreshThumbnails();
    };       

    ExtUI.prototype.switchGrouping = function(grouping) {
        this.currentGrouping = grouping;
        //TSCORE.startTime = new Date().getTime(); 
        this.reInit();
    };

    ExtUI.prototype.calculateGroupTitle = function(rawSource) {    
        var groupingTitle = "No Grouping";
        var self = this;
        switch (this.currentGrouping){
            case "day": {
                var tmpDate = new Date(rawSource[TSCORE.fileListFILELMDT]);
                tmpDate.setHours(0,0,0,0);
                groupingTitle = TSCORE.TagUtils.formatDateTime(tmpDate, false);                
                break;                
            }
            case "month": {
                var tmpDate = new Date(rawSource[TSCORE.fileListFILELMDT]);
                tmpDate.setHours(0,0,0,0);
                tmpDate.setDate(1);
                groupingTitle = MONTH[tmpDate.getMonth()] +", "+tmpDate.getFullYear();                                
                break;                
            }
            case "year": {
                var tmpDate = new Date(rawSource[TSCORE.fileListFILELMDT]);
                tmpDate.setHours(0,0,0,0);
                tmpDate.setDate(1);
                tmpDate.setMonth(1);
                groupingTitle = tmpDate.getFullYear();                                
                break;                
            }            
            default : {
                this.supportedGroupings.forEach(function(grouping) {
                    if(grouping.key == self.currentGrouping) {
                        groupingTitle = grouping.title;                        
                    }
                });                            
            }
        }
        return groupingTitle;
    };
        
    // Helper function for organizing the files in data buckets
    ExtUI.prototype.calculateGrouping = function(data) {
        var self = this;
        switch (this.currentGrouping){
            case "day": {
                data = _.groupBy( data, function(value){ 
                        var tmpDate = new Date(value[TSCORE.fileListFILELMDT]);    
                        tmpDate.setHours(0,0,0,0);
                        return tmpDate.getTime();
                    });                       
                break;                
            }
            case "month": {
                data = _.groupBy( data, function(value){ 
                        var tmpDate = new Date(value[TSCORE.fileListFILELMDT]);    
                        tmpDate.setHours(0,0,0,0);
                        tmpDate.setDate(1);
                        return tmpDate.getTime();
                    });
                break;                
            }
            case "year": {
                data = _.groupBy( data, function(value){ 
                        var tmpDate = new Date(value[TSCORE.fileListFILELMDT]);    
                        tmpDate.setHours(0,0,0,0);
                        tmpDate.setDate(1);
                        tmpDate.setMonth(1);
                        return tmpDate.getTime();
                    });
                break;                
            }            
            default : {
                var grouped = false;
                this.supportedGroupings.forEach(function(grouping) {
                    if(grouping.key == self.currentGrouping) {
                        data = _.groupBy( data, function(value) { 
                                var tagGroup = TSCORE.Config.getTagGroupData(grouping.key);
                                for (var i=0; i < tagGroup.children.length; i++) {
                                    for (var j=0; j < value[TSCORE.fileListTAGS].length; j++) {
                                        if (tagGroup.children[i].title == value[TSCORE.fileListTAGS][j]) {
                                            return tagGroup.children[i].title;
                                        }
                                    }
                                };
                            });
                        grouped = true;
                    }
                });                            
                if(!grouped) {
                    data = _.groupBy( data, function(value){ 
                              return true;
                    });                    
                }
                break;                            
            }
        }
 
        // Sort groups by date
        data = _.sortBy(data, function(value) { 
                var tmpDate = new Date(value[0][TSCORE.fileListFILELMDT]);    
                return -tmpDate.getTime();            
            }); 
        
        return data;
    };
    
    
    
    /** Filtering the data
     * 
     * @param {Object} data The data to be filtered
     */
    ExtUI.prototype.filterData = function(data) {
        
        // By empty filter just return the data
        if(this.nextFilter.length <= 0) {
            return data;
        }
        
        var query = this.nextFilter.toLowerCase();
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
        });  
        
        data = _.filter(data, function(value) {
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
    };    

    ExtUI.prototype.reInit = function() {
        
        this.viewContainer.empty();
        this.viewContainer.addClass("accordion");
   
        $( this.extensionID+"IncludeSubDirsButton" ).prop('disabled', false); 
        
        var self = this;

        this.searchResults = self.filterData(TSCORE.fileList);

        this.viewFooter.empty();
        if(this.searchResults.length == 0) {
            this.viewFooter.append($("<div>", { 
                "class": "searchSummary",    
                "text": "No files found."             
            }));            
        } else {
            var endTime = new Date().getTime();
            this.viewFooter.append($("<div>", { 
                "class": "searchSummary",    
                "text":  this.searchResults.length+" files found" //" in "+(endTime-TSCORE.startTime)/1000+" sec."             
            }));
        } 


        var i=0;
        _.each(self.calculateGrouping(this.searchResults), function (value) { 
            i++;
            
            var groupingTitle = self.calculateGroupTitle(value[0]);
            
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
            
            // Sort the files in group by name
            value = _.sortBy(value, function(entry) { 
                    return entry[TSCORE.fileListFILENAME];
                });                                         

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
				 .hammer().on("doubletap", function(event) {
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
    };
    
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
    };     

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
    };
    
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
    };
    
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
    };    
    
    exports.ExtUI                   = ExtUI;
});