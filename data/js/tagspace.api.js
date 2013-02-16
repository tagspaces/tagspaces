/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
console.debug("Loading tsAPI.js..");

var TSAPI = (typeof TSAPI == "object" && TSAPI != null) ? TSAPI : {};

TSAPI.beginTagContainer = "[";
TSAPI.endTagContainer = "]";
TSAPI.tagDelimiter = " ";
TSAPI.tagIDPrefix = "ts";
TSAPI.suggestedTagIDPrefix = "sts";
TSAPI.tagspaceIDLength = 3;


// TODO Create Search Index
TSAPI.createSearchIndex = function(currentLocation) {
    console.debug("Creating search index for: "+currentLocation);
    
}

TSAPI.formatFileSize = function(fileSize) {
	// TODO implement format file size
    return fileSize;
}

TSAPI.formatDateTime = function(date, includeTime) {
    if( (date == undefined) || (date == "") ) return "";
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

TSAPI.extractTags = function(fileName) {
    console.debug("Extracting tags from: "+fileName);
    var tags = [];
    var beginTagContainer = fileName.indexOf(TSAPI.beginTagContainer);
    var endTagContainer = fileName.indexOf(TSAPI.endTagContainer);
    if( ( beginTagContainer < 0 ) || ( endTagContainer < 0 ) || ( beginTagContainer >= endTagContainer ) ) {
        console.debug("Filename does not contains tags. Aborting extraction.");
        return tags;
    }    
    var tagContainer = fileName.slice(beginTagContainer+1,endTagContainer).trim();
    tags = tagContainer.split(TSAPI.tagDelimiter);
    
    var cleanedTags = [];
    for (var i=0; i < tags.length; i++) {
        if(tags[i].trim().length > 1) {
            cleanedTags.push(tags[i]);
        }
    }
    return cleanedTags; 
}

TSAPI.extractTitle = function(fileName) {
    console.debug("Extracting title from: "+fileName);
    var beginTagContainer = fileName.indexOf(TSAPI.beginTagContainer);
    var indexExtensionSepartor = fileName.lastIndexOf(".");
    if( (indexExtensionSepartor <= 0) || (indexExtensionSepartor < beginTagContainer) ) {
        return fileName.trim();
    } else if( beginTagContainer < 0 ) {
        return fileName.slice(0,indexExtensionSepartor).trim();
    } else if( beginTagContainer >= 0 ) {
        return fileName.slice(0,beginTagContainer).trim();
    }
}

// TODO Buggy function
TSAPI.suggestTags = function(fileName) {
    console.debug("Suggesting tags for: "+fileName);
    var tags = [];
    var tagContainer;
    var beginTagContainer = fileName.indexOf(TSAPI.beginTagContainer);
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

TSAPI.generateFileName = function(fileName, tags) {
    var tagsString = "";
    // Creating the string will all the tags by more that 0 tags
    if(tags.length > 0){
        tagsString = TSAPI.beginTagContainer;
        for (var i=0; i < tags.length; i++) {
          tagsString += tags[i]+" ";
        };
        tagsString = tagsString.trim();  
        tagsString += TSAPI.endTagContainer;        
    }
    console.debug("The tags string: "+tagsString);

    var fileExt = fileName.substring(fileName.lastIndexOf(".")+1,fileName.length).trim();
    console.debug("Filename: "+fileName+" file extenstion: "+fileExt);
        
    // Assembling the new filename with the tags    
    var newFileName = "";
    var beginTagContainer = fileName.indexOf(TSAPI.beginTagContainer);
    var endTagContainer = fileName.indexOf(TSAPI.endTagContainer);
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

TSAPI.writeTagsToFile = function(fileName, tags) {
    console.debug("Add the tags to: "+fileName);
        
    var extractedTags = TSAPI.extractTags(fileName);

    for (var i=0; i < tags.length; i++) {
        // check if tag is already in the tag array
        if(extractedTags.indexOf(tags[i].trim()) < 0) {
            // Adding the new tag
            extractedTags.push(tags[i].trim());          
        } 
    };    
    
    var newFileName = TSAPI.generateFileName(fileName, extractedTags);
   
    IOAPI.renameFile(UIAPI.currentPath+UIAPI.getDirSeparator()+fileName, UIAPI.currentPath+UIAPI.getDirSeparator()+newFileName);
}

TSAPI.renameTag = function(fileName, oldTag, newTag) {
    console.debug("Rename tag for file: "+fileName);
        
    var extractedTags = TSAPI.extractTags(fileName);

    for (var i=0; i < extractedTags.length; i++) {
        // check if tag is already in the tag array
        if(extractedTags[i] == oldTag) {
            extractedTags[i] = newTag.trim();
        } 
    };    
    
    var newFileName = TSAPI.generateFileName(fileName, extractedTags);
   
    IOAPI.renameFile(UIAPI.currentPath+UIAPI.getDirSeparator()+fileName, UIAPI.currentPath+UIAPI.getDirSeparator()+newFileName);
}

// Removing a tag from a filename
TSAPI.removeTag = function(tag) {
    console.debug("Removing tag: "+tag);   
    
    // Getting the real tag name from ID of the button
    var tagname = tag; //tag.substring(TSAPI.tagIDPrefix.length,tag.length);
    
    var fileName = UIAPI.currentFilename;
        
    var tags = TSAPI.extractTags(fileName);

    var newTags = [];
    for (var i=0; i < tags.length; i++) {
        if(tags[i] != tagname) {
            newTags.push(tags[i]);
        }
    };
    
    var newFileName = TSAPI.generateFileName(fileName, newTags);

    IOAPI.renameFile(UIAPI.currentPath+UIAPI.getDirSeparator()+fileName, UIAPI.currentPath+UIAPI.getDirSeparator()+newFileName);     

    // Refreshing the dir list
    IOAPI.listDirectory(UIAPI.currentPath);  
}

TSAPI.addTag = function(tagName, tagType) {
	console.debug("Adding tag: "+tagName+" to the files, first file: "+UIAPI.selectedFiles[0]);
	
	for (var i=0; i < UIAPI.selectedFiles.length; i++) {
	   TSAPI.writeTagsToFile(UIAPI.selectedFiles[i], [tagName]);
	};
	
	// Refreshing the dir list
	IOAPI.listDirectory(UIAPI.currentPath);  
}