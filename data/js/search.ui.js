/* Copyright (c) 2016 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

/* global define, Handlebars, isNode */
define(function(require, exports, module) {
  'use strict';
  console.log('Loading core.ui.js ...');
  var TSCORE = require('tscore');

  var initUI = function() {
    // Search UI
    $('#searchBox')
      .keyup(function(e) {
        if (e.keyCode === 13) { // Start the search on ENTER
          startSearch();
        } else if (e.keyCode == 27) { // Hide search on ESC
          cancelSearch();
        } else {
          TSCORE.Search.nextQuery = this.value;
        }
        if (this.value.length === 0) {
          TSCORE.Search.nextQuery = this.value;
          TSCORE.PerspectiveManager.redrawCurrentPerspective();
        }
      })
      .focus(function(e) {
        $("#searchOptions").hide();
      });

    $('#showSearchButton').on('click', function() {
      // Showing the expanded search area
      TSCORE.showSearchArea();
    });

    $('#searchButton').on("click", function(e) {
      startSearch();
    });

    $('#startSearchButton').on("click", function(e) {
      e.preventDefault();
      startSearch();
    });

    $('#showSearchOptionsButton').on("click", function() {
      showSearchOptions();
    });

    $('#searchOptions').on('click', '.close', function() {
      $('#searchOptions').hide();
      cancelSearch();
    });

    $('#cancelSearchButton').on('click', function(e) {
      e.preventDefault();
      $('#searchOptions').hide();
      cancelSearch();
    });

    $('#searchRecursive').on('click', function(e) {
      updateQuery();
    });

    $('#searchTerms').on('blur', function(e) {
      updateQuery();
    });

    $('#searchTags').on('blur', function(e) {
      updateQuery();
    });

    $('#searchFileType').on('change', function(e) {
      updateQuery();
    });

    // END Search UI

    // Hide drop downs by click and drag
    $(document).click(function() {
      TSCORE.hideAllDropDownMenus();
    });
  };

  function updateQuery() {
    var query = "";
    if(!$('#searchRecursive').is(':checked')) {
      query = "| "
    }

    var searchTerms = $('#searchTerms').val();
    if(searchTerms.length > 0 ) {
      searchTerms = searchTerms.split(" ");
      searchTerms.forEach(function(term) {
        if(term.length > 1) {
          query = query + " " + term;
        }
      })
    }

    var tags = $('#searchTags').val();
    if(tags.length > 0 ) {
      tags = tags.split(" ");
      tags.forEach(function(tag) {
        if(tag.length > 1) {
          query = query + " +" + tag;
        }
      })
    }

    var fileType = $('#searchFileType').val();
    if(fileType.length > 0) {
      query = query + " " + fileType;
    }

    console.log();
    $('#searchBox').val(query);
  }

  function showSearchOptions() {
    $('#searchRecursive').prop('checked', true);
    $('#searchTerms').val("");
    $('#searchTags').val("");
    $('#searchFileType').val("");

    var leftPosition = $(".col2").position().left + $(".col2").width();
    leftPosition = leftPosition - ($("#searchOptions").width() + 2);
    $("#searchOptions").css({left: leftPosition});
    $("#searchOptions").show();
  }

  function startSearch() {
    $('#searchOptions').hide();
    TSCORE.PerspectiveManager.redrawCurrentPerspective();
  }

  function cancelSearch() {
    clearSearchFilter();
    // Restoring initial dir listing without subdirectories
    TSCORE.IO.listDirectoryPromise(TSCORE.currentPath).then(
      function(entries) {
        TSPOSTIO.listDirectory(entries);
      }
    ).catch(function(err) {
      TSPOSTIO.errorOpeningPath(TSCORE.currentPath);
      console.warn("Error listing directory" + err);
    });
  }

  function showSearchArea() {
    $('#showSearchButton').hide();
    $('#searchToolbar').show();
    $('#searchBox').focus();
  }

  function clearSearchFilter() {
    $('#searchToolbar').hide();
    $('#showSearchButton').show();
    $('#searchOptions').hide();
    $('#searchBox').val('');
    $('#clearFilterButton').removeClass('filterOn');
    TSCORE.Search.nextQuery = '';
  }

  function searchForTag(tagQuery) {
    if (TSCORE.isOneColumn()) {
      TSCORE.closeLeftPanel();
    }
    TSCORE.Search.nextQuery = '+' + tagQuery;
    $('#searchBox').val('+' + tagQuery);
    TSCORE.PerspectiveManager.redrawCurrentPerspective();
    $('#showSearchButton').hide();
    $('#searchToolbar').show();
    //TSCORE.showSearchArea();
  }

  // Public API definition
  exports.initUI = initUI;
  exports.clearSearchFilter = clearSearchFilter;
  exports.showSearchArea = showSearchArea;
  exports.searchForTag = searchForTag;
});
