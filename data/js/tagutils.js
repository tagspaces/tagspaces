/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";

    console.log("Loading tagutils.js ...");
    	
    var IOAPI = require("tsioapi");

    var BEGIN_TAG_CONTAINER = "[",
        END_TAG_CONTAINER = "]",
        TAG_DELIMITER = " ",
        DIR_SEPARATOR = isWindows() ? "\\" : "/";

    function isWindows() {
        return (navigator.appVersion.indexOf("Win") !== -1);
    }

    function extractFileName(filePath) {
        return filePath.substring(filePath.lastIndexOf(DIR_SEPARATOR) + 1, filePath.length);
    }

    function extractContainingDirectoryPath(filePath) {
        return filePath.substring(0, filePath.lastIndexOf(DIR_SEPARATOR));
    }

    function extractFileExtension(filePath) {
        var ext = filePath.substring(filePath.lastIndexOf(".") + 1, filePath.length).toLowerCase().trim();
        if (filePath.lastIndexOf(".") < 0) { ext = ""; }
        return ext;
    }

    // TODO consider [qweq wqeqe].txt 
    function extractTitle(filePath) {
        console.log("Extracting title from: "+filePath);
        var fileName = extractFileName(filePath);

        var beginTagContainer = fileName.indexOf(BEGIN_TAG_CONTAINER);
        var indexExtensionSepartor = fileName.lastIndexOf(".");
        if( (indexExtensionSepartor <= 0) || (indexExtensionSepartor < beginTagContainer) ) {
            return fileName.trim();
        } else if( beginTagContainer < 0 ) {
            return fileName.slice(0,indexExtensionSepartor).trim();
        } else if( beginTagContainer >= 0 ) {
            return fileName.slice(0,beginTagContainer).trim();
        }
    } 

    function formatFileSize(fileSize) {
        // TODO implement format file size
        return fileSize;
    }

    function formatDateTime(date, includeTime) {
        if ((date === undefined) || (date === "")) return "";
        var d = new Date(date);
        var cDate = d.getDate();
        cDate = cDate + "";
        if (cDate.length == 1) { cDate = "0" + cDate; }
        var cMonth = d.getMonth(); cMonth++;
        cMonth = cMonth + "";
        if (cMonth.length == 1) { cMonth = "0" + cMonth; }    
        var cYear = d.getFullYear();
        var cHour = d.getHours();
        cHour = cHour + "";
        if (cHour.length == 1) { cHour = "0" + cHour; }
        var cMinute = d.getMinutes();
        cMinute = cMinute + "";
        if (cMinute.length == 1) { cMinute = "0" + cMinute; }
        var cSecond = d.getSeconds();
        cSecond = cSecond + "";
        if (cSecond.length == 1) { cSecond = "0" + cSecond; }    
        var time = "";
        if (includeTime) {
            time = " - "+cHour+":"+cMinute+":"+cSecond; 
        }
        return cYear+"."+cMonth+"."+cDate+time;
    }

    function extractTags(filePath) {
        console.log("Extracting tags from: "+filePath);
        
        var fileName = extractFileName(filePath);
        
        var tags = [];
        var beginTagContainer = fileName.indexOf(BEGIN_TAG_CONTAINER);
        var endTagContainer = fileName.indexOf(END_TAG_CONTAINER);
        if( ( beginTagContainer < 0 ) || ( endTagContainer < 0 ) || ( beginTagContainer >= endTagContainer ) ) {
            console.log("Filename does not contains tags. Aborting extraction.");
            return tags;
        }    
        var tagContainer = fileName.slice(beginTagContainer+1,endTagContainer).trim();
        tags = tagContainer.split(TAG_DELIMITER);

        var cleanedTags = [];
        for (var i=0; i < tags.length; i++) {
            if(tags[i].trim().length > 1) {
                cleanedTags.push(tags[i]);
            }
        }

        console.log("Extracting finished ");
        
        return cleanedTags; 
    }

    function suggestTags(filePath) {
        console.log("Suggesting tags for: "+filePath);
        
        var fileName = extractFileName(filePath);
        
        var tags = [];
        var tagContainer;
        var beginTagContainer = fileName.indexOf(BEGIN_TAG_CONTAINER);
        if(beginTagContainer < 0) {
            tagContainer = fileName.slice(0,fileName.lastIndexOf(".")).trim();
        } else {
            tagContainer = fileName.slice(0,beginTagContainer).trim();        
        }

        // Splitting filename with space, comma, plus, underscore and score delimiters    
        tags = tagContainer.split(/[\s,+_-]+/);
        
        var cleanedTags = [];
        for (var i=0; i < tags.length; i++) {
            if(tags[i].trim().length > 1) {
                cleanedTags.push(tags[i]);
            }
        }
        return cleanedTags; 
    }

    // Internal
    function generateFileName(fileName, tags) {
        var tagsString = "";
        // Creating the string will all the tags by more that 0 tags
        if(tags.length > 0){
            tagsString = BEGIN_TAG_CONTAINER;
            for (var i=0; i < tags.length; i++) {
              tagsString += tags[i]+" ";
            }
            tagsString = tagsString.trim();  
            tagsString += END_TAG_CONTAINER;        
        }
        console.log("The tags string: "+tagsString);

        var fileExt = extractFileExtension(fileName); 
        console.log("Filename: "+fileName+" file extenstion: "+fileExt);
            
        // Assembling the new filename with the tags    
        var newFileName = "";
        var beginTagContainer = fileName.indexOf(BEGIN_TAG_CONTAINER);
        var endTagContainer = fileName.indexOf(END_TAG_CONTAINER);
        var lastDotPosition = fileName.lastIndexOf(".");

        if( ( beginTagContainer < 0 ) || ( endTagContainer < 0 ) || ( beginTagContainer >= endTagContainer ) ) {
            // Filename does not contains tags.        
            if(lastDotPosition < 0) {
                // File does not have an extension
                newFileName = fileName +tagsString;  
            } else {
                // File has an extension
                newFileName = fileName.substring(0,lastDotPosition)+tagsString+"."+fileExt;  
            }   
        } else {
            // File does not have an extension
            newFileName = fileName.substring(0,beginTagContainer)+tagsString+fileName.substring(endTagContainer+1,fileName.length);  
        } 
        return newFileName;    
    }

    function writeTagsToFile(filePath, tags) {
        console.log("Add the tags to: "+filePath);
        
        var fileName = extractFileName(filePath);
            
        var containingDirectoryPath = extractContainingDirectoryPath(filePath);
        
        var extractedTags = extractTags(filePath);

        for (var i=0; i < tags.length; i++) {
            // check if tag is already in the tag array
            if(extractedTags.indexOf(tags[i].trim()) < 0) {
                // Adding the new tag
                extractedTags.push(tags[i].trim());          
            } 
        }
        
        var newFileName = generateFileName(fileName, extractedTags);
       
        IOAPI.renameFile(filePath, containingDirectoryPath+DIR_SEPARATOR+newFileName);
    }

    function addTag(filePathArray, tagArray) {
        console.log("Adding tags to files");
        
        for (var i=0; i < filePathArray.length; i++) {
           writeTagsToFile(filePathArray[i], tagArray);
        }
    }    
    
    // Replaces a tag with a new one
    function renameTag(filePath, oldTag, newTag) {
        console.log("Rename tag for file: "+filePath);

        var fileName = extractFileName(filePath);
        
        var containingDirectoryPath = extractContainingDirectoryPath(filePath);
            
        var extractedTags = extractTags(filePath);

        for (var i=0; i < extractedTags.length; i++) {
            // check if tag is already in the tag array
            if(extractedTags[i] == oldTag) {
                extractedTags[i] = newTag.trim();
            } 
        }    
        
        var newFileName = generateFileName(fileName, extractedTags);
       
        IOAPI.renameFile(filePath, containingDirectoryPath+DIR_SEPARATOR+newFileName);
        
    }
    
    function changeTitle(filePath, newTitle) {
        console.log("Changing title for file: "+filePath);
     
        var containingDirectoryPath = extractContainingDirectoryPath(filePath);
            
        var extractedTags = extractTags(filePath);

		var fileExt = extractFileExtension(filePath);
		if(fileExt.length > 0) {
			fileExt = "."+fileExt;
		}

		// TODO generalize generateFileName to support fileTitle & fileExtension
        var newFileName = generateFileName(newTitle, extractedTags);
       
        IOAPI.renameFile(filePath, containingDirectoryPath+DIR_SEPARATOR+newFileName+fileExt);
        
        return true;        
    }    

    // Removing a tag from a filename
    function removeTag(filePath, tagName) {
        console.log("Removing tag: "+tagName+" from "+filePath);   
    
        var fileName = extractFileName(filePath);    
    
        var containingDirectoryPath = extractContainingDirectoryPath(filePath);
            
        var tags = extractTags(filePath);

        var newTags = [];
        for (var i=0; i < tags.length; i++) {
            if(tags[i] != tagName) {
                newTags.push(tags[i]);
            }
        }
        
        var newFileName = generateFileName(fileName, newTags);

        IOAPI.renameFile(filePath, containingDirectoryPath+DIR_SEPARATOR+newFileName);     
    }

    // Public API definition
    exports.DIR_SEPARATOR                       = DIR_SEPARATOR;
    exports.isWindows                           = isWindows;
    exports.extractFileName                     = extractFileName;
    exports.extractContainingDirectoryPath      = extractContainingDirectoryPath;
    exports.extractFileExtension                = extractFileExtension;
    exports.extractTitle                        = extractTitle;
    exports.formatFileSize                      = formatFileSize;
    exports.formatDateTime                      = formatDateTime;
    exports.extractTags                         = extractTags;
    exports.suggestTags                         = suggestTags;
    exports.writeTagsToFile                     = writeTagsToFile;
    exports.renameTag                           = renameTag;
    exports.removeTag                           = removeTag;
    exports.addTag                              = addTag;
    exports.changeTitle 						= changeTitle;

});