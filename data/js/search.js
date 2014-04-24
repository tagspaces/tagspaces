/* Copyright (c) 2012-2014 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";

    console.log("Loading search.js ...");

    var TSCORE = require("tscore");
    var currentQuery = "";
    var nextQuery = "";    

    var search4Tag = function(tagQuery) {
        TSCORE.Search.nextQuery = "+"+tagQuery;
        $("#searchBox").val("+"+tagQuery);
        TSCORE.PerspectiveManager.redrawCurrentPerspective();
    };

    var search4String = function(query) {
        TSCORE.Search.nextQuery = "+"+query;
        $("#searchBox").val("+"+query);
        TSCORE.PerspectiveManager.redrawCurrentPerspective();        
    };

    var calculateTags = function(data) {
        console.log("Calculating tags from search results");
        var allTags = [];

        data.forEach(function(fileEntry) {
            fileEntry[TSCORE.fileListTAGS].forEach(function(tag) {
                allTags.push(tag.toLowerCase());
            });
        });

        var countData = _.countBy(allTags, function(obj){
            return obj;
        }); 

        TSCORE.calculatedTags.length = 0;
        _.each(countData, function(count, tag) {
            TSCORE.calculatedTags.push({
                "title":     tag,
                "type" :     "plain",
                "count":     count
            });  
        }); 
        
        TSCORE.generateTagGroups();        
    };
    
    var searchData = function(data, query) {
        query = query.toLowerCase().replace(/^\s+|\s+$/g, "");        

        if(query.indexOf("?") === 0) {
            TSCORE.Search.nextQuery = query.substring(1,query.length);
            TSCORE.IO.createDirectoryIndex(TSCORE.currentPath);
            return false;
        }

        // By empty filter just return the data
        if(query.length > 0) {

            var queryTerms = query.split(" ");
            
            // Analysing filter
            var includedTerms = [];
            var excludedTerms = [];
            var includedTags = [];
            var excludedTags = [];
            
            queryTerms.forEach(function (value) {
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
                }
                for (var i=0; i < excludedTerms.length; i++) {
                    if(searchIn.indexOf(excludedTerms[i][0]) < 0) {
                        excludedTerms[i][1] = true;
                    } else {
                        return false;
                    }
                }

                for (var i=0; i < includedTags.length; i++) {
                    includedTags[i][1] = false;
                    for (var j=0; j < tags.length; j++) {
                        if(tags[j].toLowerCase() == includedTags[i][0]) {
                            includedTags[i][1] = true;
                        }
                    }
                }
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
                }
                for (var i=0; i < excludedTags.length; i++) {
                    result = result & excludedTags[i][1];
                }

                return result;
            });
    
            currentQuery = nextQuery;     
        }

        if(TSCORE.Config.getCalculateTags()) {
            // Find all tags in the current search results
            exports.calculateTags(data);            
        }
         
        return data;
    };       

    // Public variables definition
    exports.currentQuery                 = currentQuery;
    exports.nextQuery                    = nextQuery;
    
    // Public API definition    
    exports.searchData                   = searchData;   
    exports.searchForTag                 = search4Tag;       
    exports.searchForString              = search4String;    
    exports.calculateTags                = calculateTags;
    
});