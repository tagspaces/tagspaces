/* Copyright (c) 2012-2014 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
/* global define  */
 define(function(require, exports, module) {
"use strict";

    console.log("Loading tagutils.js ...");

    var TSCORE = require("tscore");

    var BEGIN_TAG_CONTAINER = "[";
    var END_TAG_CONTAINER = "]";

    function extractFileName(filePath) {
        return filePath.substring(filePath.lastIndexOf(TSCORE.dirSeparator) + 1, filePath.length);
    }

    function cleanTrailingDirSeparator(dirPath) {
        if(dirPath !== undefined) {
            if(dirPath.lastIndexOf("\\") === dirPath.length-1) {
                return dirPath.substring(0, dirPath.length-1)
            } else if(dirPath.lastIndexOf("/") === dirPath.length-1) {
                return dirPath.substring(0,dirPath.length-1)
            } else {
                return dirPath;
            }
        } else {
            console.error("Directory Path "+dirPath+" undefined");
        }
    }

    function extractFileNameWithoutExt(filePath) {
        var fileName = extractFileName(filePath);
        var indexOfDot = fileName.lastIndexOf(".");
        var lastIndexBeginTagContainer = fileName.lastIndexOf(BEGIN_TAG_CONTAINER);
        var lastIndexEndTagContainer = fileName.lastIndexOf(END_TAG_CONTAINER);

        if(lastIndexBeginTagContainer === 0 && lastIndexEndTagContainer+1 === fileName.length ) { // case: "[tag1 tag.2]"
            return "";
        } else if(indexOfDot > 0 ) { // case: regular
            return fileName.substring(0, indexOfDot);
        } else if(indexOfDot === 0) { // case ".txt"
            return "";            
        } else {
            return fileName;
        }
    }
    
    function stringEndsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }    

    function extractContainingDirectoryPath(filePath) {
        return filePath.substring(0, filePath.lastIndexOf(TSCORE.dirSeparator));
    }

    function extractParentDirectoryPath(dirPath) {
        if(stringEndsWith(dirPath, TSCORE.dirSeparator)) {
            dirPath = dirPath.substring(0, dirPath.lastIndexOf(TSCORE.dirSeparator));
        }
        return dirPath.substring(0, dirPath.lastIndexOf(TSCORE.dirSeparator));
    }

    function extractDirectoryName(dirPath) {
        if(stringEndsWith(dirPath, TSCORE.dirSeparator)) {
            dirPath = dirPath.substring(0, dirPath.lastIndexOf(TSCORE.dirSeparator));
        }
        return dirPath.substring(dirPath.lastIndexOf(TSCORE.dirSeparator)+1,dirPath.length);
    }

    function extractContainingDirectoryName(filePath) {
        var tmpStr = filePath.substring(0, filePath.lastIndexOf(TSCORE.dirSeparator));
        return tmpStr.substring(tmpStr.lastIndexOf(TSCORE.dirSeparator)+1,tmpStr.length);
    }

    function extractFileExtension(filePath) {
        var lastindexDirSeparator = filePath.lastIndexOf(TSCORE.dirSeparator);
        var lastIndexEndTagContainer = filePath.lastIndexOf(END_TAG_CONTAINER);
        var lastindexDot = filePath.lastIndexOf(".");
        if (lastindexDot < 0) {
            return "";
        } else if (lastindexDot < lastindexDirSeparator) { // case: "../remote.php/webdav/somefilename"
            return "";
        } else if (lastindexDot < lastIndexEndTagContainer) { // case: "[20120125 89.4kg 19.5% 60.5% 39.8% 2.6kg]"
            return "";
        } else {
            return filePath.substring(lastindexDot + 1, filePath.length).toLowerCase().trim();
        }
    }

    function extractTitle(filePath) {
        console.log("Extracting title from: "+filePath);
        var fileName = extractFileNameWithoutExt(filePath);
        var beginTagContainer = fileName.indexOf(BEGIN_TAG_CONTAINER);
        var endTagContainer = fileName.lastIndexOf(END_TAG_CONTAINER);
        
        /* cases like "", "t", "[" 
        if( fileName.length <= 1) {
        // cases like "asd ] asd ["
        else if (beginTagContainer > endTagContainer) {
        // case: [ not found in the filename
        else if ( beginTagContainer < 0 ) 
        else if ( endTagContainer < 0 ) */

        if( (beginTagContainer >= 0 ) && (beginTagContainer < endTagContainer) ){
            if(beginTagContainer === 0 && endTagContainer === fileName.trim().length) { // case: "[tag1, tag2]"
                return "";
            } else if (endTagContainer === fileName.trim().length) { // case: "asd[tag1, tag2]"
                return fileName.slice(0,beginTagContainer);
            } else {  // case: "title1 [tag1 tag2] title2"
                return fileName.slice(0,beginTagContainer)+fileName.slice(endTagContainer+1,fileName.length);
            }
        } else {
            return fileName;                            
        }
    } 

    function formatFileSize(sizeInBytes, siSystem) {
        var threshold = siSystem ? 1000 : 1024;
        if(sizeInBytes < threshold) { return sizeInBytes + ' B'; }
        var units = siSystem ? ['kB','MB','GB','TB','PB','EB'] : ['KiB','MiB','GiB','TiB','PiB','EiB'];
        var cUnit = -1;
        do {
            sizeInBytes /= threshold;
            ++cUnit;
        } 
        while(sizeInBytes >= threshold);
        return sizeInBytes.toFixed(1)+' '+units[cUnit];
    }

    function formatDateTime(date, includeTime) {
        if ((date === undefined) || (date === "")) { return ""; }
        var d = new Date(date);
        var cDate = d.getDate();
        cDate = cDate + "";
        if (cDate.length === 1) { cDate = "0" + cDate; }
        var cMonth = d.getMonth(); cMonth++;
        cMonth = cMonth + "";
        if (cMonth.length === 1) { cMonth = "0" + cMonth; }
        var cYear = d.getFullYear();
        var cHour = d.getHours();
        cHour = cHour + "";
        if (cHour.length === 1) { cHour = "0" + cHour; }
        var cMinute = d.getMinutes();
        cMinute = cMinute + "";
        if (cMinute.length === 1) { cMinute = "0" + cMinute; }
        var cSecond = d.getSeconds();
        cSecond = cSecond + "";
        if (cSecond.length === 1) { cSecond = "0" + cSecond; }
        var time = "";
        if (includeTime) {
            time = " - "+cHour+":"+cMinute+":"+cSecond; 
        }
        return cYear+"."+cMonth+"."+cDate+time;
    }
    
    function formatDateTime4Tag(date, includeTime, includeMS) {
        if ((date === undefined) || (date === "")) { return ""; }
        var d = new Date(date);
        var cDate = d.getDate();
        cDate = cDate + "";
        if (cDate.length === 1) { cDate = "0" + cDate; }
        var cMonth = d.getMonth(); cMonth++;
        cMonth = cMonth + "";
        if (cMonth.length === 1) { cMonth = "0" + cMonth; }
        var cYear = d.getFullYear();
        var cHour = d.getHours();
        cHour = cHour + "";
        if (cHour.length === 1) { cHour = "0" + cHour; }
        var cMinute = d.getMinutes();
        cMinute = cMinute + "";
        if (cMinute.length === 1) { cMinute = "0" + cMinute; }
        var cSecond = d.getSeconds();
        cSecond = cSecond + "";
        if (cSecond.length === 1) { cSecond = "0" + cSecond; }
        var time = "";
        if (includeTime) {
            time = "-"+cHour+""+cMinute+""+cSecond; 
        }
        var milliseconds = "";
        if (includeMS) {
            milliseconds = "-"+d.getMilliseconds();
        }
        return cYear+""+cMonth+""+cDate+time+milliseconds;
    } 
    
    function convertStringToDate(dateString) {
        if ((dateString === undefined) || (dateString === "")) { return false; }
        if (dateString.length === 8) {
            return new Date(dateString.substring(0,4)+"-"+dateString.substring(4,6)+"-"+dateString.substring(6,8));
        } else {
            return false;
        }
    }

    function extractTags(filePath) {
        console.log("Extracting tags from: "+filePath);
        
        var fileName = extractFileName(filePath); // WithoutExt
        
        var tags = [];
        var beginTagContainer = fileName.indexOf(BEGIN_TAG_CONTAINER);
        var endTagContainer = fileName.indexOf(END_TAG_CONTAINER);
        if( ( beginTagContainer < 0 ) || ( endTagContainer < 0 ) || ( beginTagContainer >= endTagContainer ) ) {
            console.log("Filename does not contains tags. Aborting extraction.");
            return tags;
        }    
        var cleanedTags = [];

        var tagContainer = fileName.slice(beginTagContainer+1,endTagContainer).trim();
        tags = tagContainer.split(TSCORE.Config.getTagDelimiter());

        for (var i=0; i < tags.length; i++) {
            // Min tag length set to 1 character
            if(tags[i].trim().length > 0) {
                cleanedTags.push(tags[i]);
            }
        }

        console.log("Extracting finished ");
        return cleanedTags; 
    }

    function suggestTags(filePath) {
        console.log("Suggesting tags for: "+filePath);
        
        var fileName = extractFileName(filePath);
        
        var tags;
        var tagContainer;
        var beginTagContainer = fileName.indexOf(BEGIN_TAG_CONTAINER);
        if(beginTagContainer < 0) {
            tagContainer = fileName.slice(0,fileName.lastIndexOf(".")).trim();
        } else {
            tagContainer = fileName.slice(0,beginTagContainer).trim();        
        }

        // Splitting filename with space, comma, plus, underscore and score delimiters    
        tags = tagContainer.split(/[\s,.+_-]+/);
        
        var cleanedTags = [];
        
        // Extracting tags from the name of the containing directory
        var tagsFromDirName = extractContainingDirectoryName(filePath).trim().split(/[\s,+_-]+/);

        for (var i=0; i < tagsFromDirName.length; i++) {
            if(tagsFromDirName[i].trim().length > 1) {
                cleanedTags.push(tagsFromDirName[i]);
            }
        }
        
        // Cleaning the tags from filename        
        for (var j=0; j < tags.length; j++) {
            if(tags[j].trim().length > 1) {
                cleanedTags.push(tags[j]);
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
              tagsString += tags[i]+TSCORE.Config.getTagDelimiter();
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
                newFileName = fileName.substring(0,lastDotPosition)+TSCORE.Config.getPrefixTagContainer()+tagsString+"."+fileExt;  
            }   
        } else {
            // File does not have an extension
            newFileName = fileName.substring(0,beginTagContainer)+tagsString+fileName.substring(endTagContainer+1,fileName.length);  
        }
        if(newFileName.length < 1) {
            throw "Generated filename is invalid";
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
       
        TSCORE.IO.renameFile(filePath, containingDirectoryPath+TSCORE.dirSeparator+newFileName);
    }
    
    function removeTagsFromFile(filePath, tags) {
        console.log("Remove the tags from: "+filePath);
        
        var fileName = extractFileName(filePath);
            
        var containingDirectoryPath = extractContainingDirectoryPath(filePath);
        
        var extractedTags = extractTags(filePath);

        for (var i=0; i < tags.length; i++) {
            // check if tag is already in the tag array
            var tagLoc = extractedTags.indexOf(tags[i].trim());
            if(tagLoc >= 0) {
                // Remove the new tag
                extractedTags.splice(tagLoc,1);          
            } 
        }
        
        var newFileName = generateFileName(fileName, extractedTags);
       
        TSCORE.IO.renameFile(filePath, containingDirectoryPath+TSCORE.dirSeparator+newFileName);
    }

    function cleanFileFromTags(filePath) {
        console.log("Cleaning file from tags: " + filePath);
        var fileTitle = extractTitle(filePath);
        var fileExt = extractFileExtension(filePath);
        var containingDirectoryPath = extractContainingDirectoryPath(filePath);
        if(fileExt.length > 0) {
            fileExt = "."+fileExt;
        }
        TSCORE.IO.renameFile(filePath, containingDirectoryPath+TSCORE.dirSeparator+fileTitle+fileExt);
    }

     function cleanFilesFromTags(filePathArray) {
         console.log("Cleaning file from tags");
         for (var i=0; i < filePathArray.length; i++) {
             cleanFileFromTags(filePathArray[i]);
         }
     }

     function addTag(filePathArray, tagArray) {
        console.log("Adding tags to files");        
        for (var i=0; i < filePathArray.length; i++) {
           writeTagsToFile(filePathArray[i], tagArray);
        }
    }    

    function removeTags(filePathArray, tagArray) {
        console.log("Remove tags from files");        
        for (var i=0; i < filePathArray.length; i++) {
           removeTagsFromFile(filePathArray[i], tagArray);
        }
    }       
    
    // Moves the location of tag in the file name
    // possible directions should be next, prev, last, first
    function moveTagLocation(filePath, tagName, direction) {
        console.log("Moves the location of tag in the file name: "+filePath);

        var fileName = extractFileName(filePath);
        
        var containingDirectoryPath = extractContainingDirectoryPath(filePath);
            
        var extractedTags = extractTags(filePath);

        var tmpTag;

        for (var i=0; i < extractedTags.length; i++) {
            // check if tag is already in the tag array
            if(extractedTags[i] === tagName) {
                if((direction === "prev") && (i > 0)) {
                    tmpTag = extractedTags[i-1];
                    extractedTags[i-1] = extractedTags[i];
                    extractedTags[i] = tmpTag;
                    break;
                } else if ((direction === "next") && i < (extractedTags.length-1) ){
                    tmpTag = extractedTags[i];
                    extractedTags[i] = extractedTags[i+1];
                    extractedTags[i+1] = tmpTag;
                    break;
                } else if ((direction === "first") && i > 0 ){
                    tmpTag = extractedTags[i];
                    extractedTags[i] = extractedTags[0];
                    extractedTags[0] = tmpTag;
                    break;
                }
            } 
        }    
        
        var newFileName = generateFileName(fileName, extractedTags);
       
        TSCORE.IO.renameFile(filePath, containingDirectoryPath+TSCORE.dirSeparator+newFileName);
        
    }    
    
    // Replaces a tag with a new one
    function renameTag(filePath, oldTag, newTag) {
        console.log("Rename tag for file: "+filePath);

        var fileName = extractFileName(filePath);
        
        var containingDirectoryPath = extractContainingDirectoryPath(filePath);
            
        var extractedTags = extractTags(filePath);

        for (var i=0; i < extractedTags.length; i++) {
            // check if tag is already in the tag array
            if(extractedTags[i] === oldTag) {
                extractedTags[i] = newTag.trim();
            } 
        }    
        
        var newFileName = generateFileName(fileName, extractedTags);
       
        TSCORE.IO.renameFile(filePath, containingDirectoryPath+TSCORE.dirSeparator+newFileName);
        
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
       
        TSCORE.IO.renameFile(filePath, containingDirectoryPath+TSCORE.dirSeparator+newFileName+fileExt);
        
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
            if(tags[i] !== tagName) {
                newTags.push(tags[i]);
            }
        }
        
        var newFileName = generateFileName(fileName, newTags);

        TSCORE.IO.renameFile(filePath, containingDirectoryPath+TSCORE.dirSeparator+newFileName);     
    }

    // Public API definition
    exports.beginTagContainer                   = BEGIN_TAG_CONTAINER;
    exports.endTagContainer                     = END_TAG_CONTAINER;

    exports.extractFileName                     = extractFileName;
    exports.extractFileNameWithoutExt           = extractFileNameWithoutExt;
    exports.extractContainingDirectoryPath      = extractContainingDirectoryPath;
    exports.extractContainingDirectoryName      = extractContainingDirectoryName;
    exports.extractDirectoryName                = extractDirectoryName;
    exports.extractParentDirectoryPath          = extractParentDirectoryPath;
    exports.extractFileExtension                = extractFileExtension;
    exports.extractTitle                        = extractTitle;
    exports.formatFileSize                      = formatFileSize;
    exports.formatDateTime                      = formatDateTime;
    exports.formatDateTime4Tag                  = formatDateTime4Tag; 
    exports.convertStringToDate					= convertStringToDate;
    exports.extractTags                         = extractTags;
    exports.suggestTags                         = suggestTags;
    exports.writeTagsToFile                     = writeTagsToFile;
    exports.moveTagLocation                     = moveTagLocation;
    exports.renameTag                           = renameTag;
    exports.removeTag                           = removeTag;
    exports.removeTags                          = removeTags;
    exports.addTag                              = addTag;
    exports.cleanFilesFromTags                  = cleanFilesFromTags;
    exports.cleanTrailingDirSeparator           = cleanTrailingDirSeparator;
    exports.changeTitle                         = changeTitle;
    exports.stringEndsWith                      = stringEndsWith;

});