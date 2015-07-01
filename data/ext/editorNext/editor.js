"use strict";

var isCordova = parent.isCordova;
var $htmlEditor;
var editor = null;
function initEditor() {
 
	editor = woofmark(document.querySelector('textarea'), {
     	parseMarkdown: megamark,
     	parseHTML: domador
 	});

	editor.setMode("html");
}

var contentVersion = 0;

function resetContentVersion() {
  contentVersion = 0;
}

function getContentVersion() {
  return contentVersion;
}

function setContent(content) {
  resetContentVersion();
  $htmlEditor = $('#htmlEditor');

  $htmlEditor.find('textarea').val(content);
  
  initEditor();
}