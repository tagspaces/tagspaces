define(function(require, exports, module) {
  'use strict';
  var TSCORE = require("tscore");
  console.log("Loading: ext.api.js");

  window.addEventListener("message", handleMessage, false);

  function handleMessage(msg) {
    var data = JSON.parse(msg.data);
    var command = data.command;

    switch (command) {
      case "showAlertDialog":
        TSCORE.showAlertDialog(data.message, data.title);
        break;
      case "saveDocument":
        TSCORE.FileOpener.saveFile();
        break;
      case "hideAllMenus":
        hideMenus();
        break;
      case "playbackEnded":
        openNextFile();
        break;
      case "openLinkExternally":
        if (data.link) {
          openLinkExternally(data.link);
        }
        break;
      case "contentChangedInEditor":
        TSCORE.FileOpener.setFileChanged(true);
        break;
      default:
        console.log("Not recognized messaging command: " + msg);
        break;
    }
  }

  function hideMenus() {
    TSCORE.hideAllDropDownMenus();
    $('#searchOptions').hide();
    $('#fileExtensionMenu').parent().removeClass('open');
    $('#perspectiveSwitcher').parent().removeClass('open');
    $('#locationsList').parent().removeClass('open');
    $('#tagSuggestionsMenu').parent().removeClass('open');
  }

  function openNextFile() {
    //if(TSCORE.selectedFiles.length > 0) {
    // TODO open next selected file
    //} else {
    TSCORE.FileOpener.openFile(TSCORE.PerspectiveManager.getNextFile(TSCORE.FileOpener.getOpenedFilePath()));
    //}
  }

  function openLinkExternally(uri) {
    uri = decodeURIComponent(uri);
    if (
      uri.indexOf("http://") === 0 ||
      uri.indexOf("https://") === 0 ||
      uri.indexOf("file://") === 0
    ) {
      TSCORE.IO.openFile(uri);
    } else {
      console.log("Not supported URL format: " + uri);
    }
  }

});