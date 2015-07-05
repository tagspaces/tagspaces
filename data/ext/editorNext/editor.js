"use strict";
var contentVersion = 0;
var isCordova = parent.isCordova;
var editor = null;

function initEditor() {
  var el = document.querySelector("textarea");
	editor = woofmark(el, {
     	parseMarkdown: megamark,
     	parseHTML: domador
 	});

	editor.setMode("html");
  
  $(el).on("change keyup cut paste", function(event) {
    contentVersion++;
  });
}

function resetContentVersion() {
  contentVersion = 0;
}

function getContentVersion() {
  return contentVersion;
}

function setContent(content) {
	
  resetContentVersion();

  $('#htmlEditor').find('textarea').val(content);

  initEditor();
}