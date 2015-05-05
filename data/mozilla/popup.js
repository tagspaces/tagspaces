/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
/* global saveAs, DOMPurify */

'use strict';

(function() {
  console.log("Loading Mozilla Popup...");
  var tags;
  var title;
  var html;
  var htmlTemplate;
  var tagLibrary;

  function init() {
    console.log("Mozilla Popup init" );

    $("#startTagSpaces").on("click", function(e) {
      self.port.emit('tagspaces.openNewTab', e.toString());
    });

    $("#saveAsMhtml").on('click', saveAsMHTML);

    $("#saveSelectionAsHtml").on("click", function() {
      console.log("TODO: capture content");
    });

    $("#saveScreenshot").on("click", saveScreenshot);
  }

  function saveAsMHTML() {
    console.log("TODO: saveAsMHTML");
  }

  function saveScreenshot() {
    console.log("TODO: saveScreenshot"); 
  }

  $(document).ready(init);

}());
