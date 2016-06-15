/* Copyright (c) 2015-2016 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

/* global define, Handlebars, isNode */
define(function(require, exports, module) {
  'use strict';
  console.log('Loading search.ui.js ...');
  var TSCORE = require('tscore');
  var TSPOSTIO = require("tspostioapi");

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
      updateQuery();
      startSearch();
    });

    $('#showSearchOptionsButton').on("click", function() {
      showSearchOptions();
    });

    $('#searchOptions').on('click', '.close', function() {
      $('#searchOptions').hide();
    });

    $('#resetSearchButton').on('click', function(e) {
      e.preventDefault();
      resetSearchOptions();
      $('#searchBox').val("");
    });

    $('#clearSearchButton').on('click', function(e) {
      e.preventDefault();
      $('#searchOptions').hide();
      cancelSearch();
    });

    $('#searchRecursive').attr('checked', TSCORE.Config.getUseSearchInSubfolders());

    $('#searchRecursive').on('click', function(e) {
      updateQuery();
    });

    $('#searchTerms').on('blur', function(e) {
      updateQuery();
    }).keypress(startSearchOnEnter);

    $('#searchTags').on('blur', function(e) {
      updateQuery();
    }).keypress(startSearchOnEnter);

    $('#searchFileType').on('change', function(e) {
      updateQuery();
    });

    if (TSCORE.PRO) {
      $('#searchFileType').prop('disabled', false);
      $('#searchHistory').prop('disabled', false);
      $('#searchFileType').attr('title', '');
      $('#searchHistory').attr('title', '');
      $('#searchFileType').removeClass('disabled');
      $('#searchHistory').removeClass('disabled');
    }
  };

  function startSearchOnEnter(e) {
    if (e.which == 13) {
      e.preventDefault();
      updateQuery();
      startSearch();
    }
  }

  //function parseQuery() {}

  function updateQuery() {
    var query = "";
    if (!$('#searchRecursive').is(':checked')) {
      query = TSCORE.Search.recursiveSymbol + " ";
    }

    var searchTerms = $('#searchTerms').val();
    if (searchTerms.length > 0) {
      searchTerms = searchTerms.split(" ");
      searchTerms.forEach(function(term) {
        if (term.length > 1) {
          query = query + " " + term;
        }
      });
    }

    var tags = $('#searchTags').val();
    if (tags.length > 0) {
      tags = tags.split(" ");
      tags.forEach(function(tag) {
        if (tag.length > 1) {
          query = query + " +" + tag;
        }
      });
    }

    var fileType = $('#searchFileType').val();
    if (fileType.length > 0) {
      query = query + " " + fileType;
    }

    console.log();
    $('#searchBox').val(query);
    TSCORE.Search.nextQuery = query;
  }

  function resetSearchOptions() {
    $('#searchRecursive').prop('checked', TSCORE.Config.getUseSearchInSubfolders());
    $('#searchTerms').val("");
    $('#searchTags').val("");
    $('#searchFileType').val("");
    $('#searchHistory').val("");
  }

  function showSearchOptions() {
    resetSearchOptions();
    if (TSCORE.PRO && TSCORE.PRO.Search) {
      TSCORE.PRO.Search.loadSearchHistory();
    }
    var leftPosition = $(".col2").position().left + $(".col2").width();
    leftPosition = leftPosition - ($("#searchOptions").width() + 2);
    $("#searchOptions").css({left: leftPosition});
    $("#searchOptions").show();
  }

  function startSearch() {
    if (TSCORE.IO.stopWatchingDirectories) {
      TSCORE.IO.stopWatchingDirectories();
    }
    if ($('#searchBox').val().length > 0) {
      var origSearchVal = $('#searchBox').val(); 
      origSearchVal = origSearchVal.trim();

      if ($('#searchRecursive').prop('checked')) {
        $('#searchBox').val(origSearchVal);
      } else {
        if (origSearchVal.indexOf(TSCORE.Search.recursiveSymbol) === 0) {
          $('#searchBox').val(origSearchVal);
        } else {
          //origSearchVal = origSearchVal.substring(1, origSearchVal.length);
          $('#searchBox').val(TSCORE.Search.recursiveSymbol + " " + origSearchVal);
        }
      }

      if (TSCORE.PRO && TSCORE.PRO.Search) {
        TSCORE.PRO.Search.addQueryToHistory(origSearchVal);
      }
      TSCORE.Search.nextQuery = $('#searchBox').val();
    }
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
    var nxtQuery = ' +' + tagQuery; //TSCORE.Search.recursiveSymbol + ' +' + tagQuery;
    TSCORE.Search.nextQuery = nxtQuery;
    $('#searchBox').val(nxtQuery);
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
