/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
/* global saveAs, DOMPurify */

'use strict';

(function() {
  console.log("Loading Popup...");
  var tags;
  var title;
  var html;
  var htmlTemplate;
  var tagLibrary;

  function init() {
    $("#startTagSpaces").on("click", function(e) {
      chrome.tabs.create({
        url: '../index.html'
      });
    });

    loadSettingsLocalStorage();

    var tagList = extractAllTags(tagLibrary);
    chrome.tabs.getSelected(null, function(tab) {
      $('#title').val(tab.title);
    });

    $('#title').focus();

    $('#tags').select2('data', null);
    $("#tags").select2({
      multiple: true,
      tags: tagList,
      tokenSeparators: [",", " "],
      minimumInputLength: 2,
      selectOnBlur: true
    });

    $("#saveAsMhtml").on('click', saveAsMHTML);

    $("#saveSelectionAsHtml").on("click", function() {
      chrome.tabs.executeScript(null, {
        file: "chromelight/captureContent.js"
      }, function() {
        if (chrome.extension.lastError) {
          console.log('There was an error injecting script : \n' + chrome.extension.lastError.message);
        }
      });
    });

    $("#saveScreenshot").on("click", saveScreenshot);

    chrome.extension.onMessage.addListener(function(request, sender) {
      if (request.action == "getSource") {
        chrome.tabs.getSelected(null, function(tab) {
          //console.log("HTML: " + request.source);
          var cleanenHTML = prepareContent(request.source);
          var htmlBlob = new Blob([cleanenHTML], {
            type: "text/html;charset=utf-8"
          });
          tags = document.getElementById("tags").value;
          title = document.getElementById("title").value;
          if (tags) {
            tags = tags.split(",").join(" ");
            saveAs(htmlBlob, title + ' [' + tags + '].html');
          } else {
            saveAs(htmlBlob, title + '.html');
          }
        });
      }
    });

    // I18n this panel
    $('[data-i18n]').each(function() {
      var me = $(this);
      var key = me.data('i18n');
      me.html(chrome.i18n.getMessage(key));
    });

    $('[data-i18n-title]').each(function() {
      var me = $(this);
      var key = me.data('i18n-title');
      me.attr("title", chrome.i18n.getMessage(key));
    });
  }

  function saveAsMHTML() {
    chrome.tabs.getSelected(null, function(tab) {
      tags = document.getElementById("tags").value;
      chrome.pageCapture.saveAsMHTML({
        tabId: tab.id
      }, function(mhtml) {
        if (tags) {
          tags = tags.split(",").join(" ");
          saveAs(mhtml, $('#title').val() + ' [' + tags + '].mhtml');
        } else {
          saveAs(mhtml, $('#title').val() + '.mhtml');
        }
      });
    });
  }

  function saveScreenshot() {
    chrome.tabs.getSelected(null, function(tab) {
      tags = document.getElementById("tags").value;
      chrome.tabs.captureVisibleTab(null, {
        "format": "png"
      }, function(image) {
        console.log("Screenshot: " + image);
        if (tags) {
          tags = tags.split(",").join(" ");
          saveAs(dataURItoBlob(image), $('#title').val() + ' [' + tags + '].png');
        } else {
          saveAs(dataURItoBlob(image), $('#title').val() + '.png');
        }
      });
    });
  }

  function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var arrayBuffer = new ArrayBuffer(byteString.length);
    var _ia = new Uint8Array(arrayBuffer);
    for (var i = 0; i < byteString.length; i++) {
      _ia[i] = byteString.charCodeAt(i);
    }

    var dataView = new DataView(arrayBuffer);
    var blob = new Blob([dataView], {
      type: mimeString
    });
    return blob;
  }

  function getBase64Image(imgURL) {
    var canvas = document.createElement("canvas");
    var img = new Image();
    img.src = imgURL;
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/png");
  }

  function prepareContent(uncleanedHTML) {
    //console.log("uncleaned "+uncleanedHTML);
    var cleanedHTML = DOMPurify.sanitize(uncleanedHTML);

    /*console.log("cleaned "+cleanedHTML);
    // saving all images as png in base64 format
    var match,
        urls = [],
        imgUrl = "",
        rex = /<img.*?src="([^">]*\/([^">]*?))".*?>/g;

    while ( match = rex.exec( cleanedHTML ) ) {
        imgUrl = match[1];
        //console.log("URLs: "+imgUrl);
        urls.push([imgUrl, getBase64Image(imgUrl)]);
    }

    urls.forEach(function(dataURLObject) {
        cleanedHTML = cleanedHTML.split(dataURLObject[0]).join(dataURLObject[1]);
        //console.log(dataURLObject[0]+" - "+dataURLObject[1]);
    });
    // end saving all images*/

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

  $(document).ready(init);

}());
