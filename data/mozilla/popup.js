/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
/* global saveAs, DOMPurify */
'use strict';

(function() {
  var tags;
  var title;
  var html;
  var htmlTemplate;
  var tagLibrary;
  var currentSelection;

  function init(selection) {
    console.log("Mozilla Popup init...");

    loadSettingsLocalStorage();

    $("#startTagSpaces").on("click", function(e) {
      self.port.emit('openNewTab', e.toString());
    });

    $("#saveAsMhtml").on('click', saveAsMHTML);

    $("#saveSelectionAsHtml").on("click", function() {
      
      if(currentSelection) {
        var content = prepareContent(currentSelection);  
        self.port.emit('saveSelectionAsHtml', content);  
      } else {
        alert("Please select text");
      }
    });

    $("#saveScreenshot").on("click", saveScreenshot);
  }

  function saveAsMHTML() {
    self.port.emit('saveAsMHTML');
  }

  function saveScreenshot() { 
    self.port.emit('saveScreenshot');
  }

  function prepareContent(uncleanedHTML) {
    //console.log("uncleaned "+uncleanedHTML);
    var cleanedHTML = DOMPurify.sanitize(uncleanedHTML);

    cleanedHTML = "<body>" + cleanedHTML + "</body>";
    cleanedHTML = htmlTemplate.replace(/\<body[^>]*\>([^]*)\<\/body>/m, cleanedHTML); // jshint ignore:line
    return cleanedHTML;
  }

  function loadSettingsLocalStorage() {
    try {
      var settings = JSON.parse(localStorage.getItem('tagSpacesSettings'));
      //console.log("Settings: "+JSON.stringify(tmpSettings));
      if (settings !== null) {
        htmlTemplate = settings.newHTMLFileContent;
        tagLibrary = settings.tagGroups;
      }
      console.log("Loaded settings from local storage: " + JSON.stringify(tagLibrary));
    } catch (ex) {
      console.log("Loading settings from local storage failed due exception: " + ex);
    }
  }

  function extractAllTags() {
    var allTags = [];
    if (tagLibrary === undefined) {
      return allTags;
    }
    for (var i = 0; i < tagLibrary.length; i++) {
      for (var j = 0; j < tagLibrary[i].children.length; j++) {
        if (tagLibrary[i].children[j].type === "plain") {
          allTags.push(tagLibrary[i].children[j].title);
        }
      }
    }
    return allTags;
  }

  //$(document).ready(init);
  init();

  self.port.on("show", function(selection, title) {
   
    //self.postMessage('show', "ddd1");
    currentSelection = selection;
    var tagList = extractAllTags(tagLibrary);
    console.log("currentSelection: " + currentSelection);

    $('#title').val(title);
  
    $('#title').focus();

    $('#tags').select2('data', null);
    $("#tags").select2({
      multiple: true,
      tags: tagList,
      tokenSeparators: [",", " "],
      minimumInputLength: 2,
      selectOnBlur: true
    });

  });

  self.port.on("hide", function(){
    console.log("Hide Popup");
  });

  return {};
}());
