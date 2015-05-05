"use strict";

var isCordova = parent.isCordova;
var $htmlEditor;

var toolbar = [
  ['style', ['style']],
  ['color', ['color']],
  ['font', ['bold', 'italic', 'underline']],
  ['font2', ['superscript', 'subscript', 'strikethrough', 'clear']],
  ['fontname', ['fontname']],
  // ['fontsize', ['fontsize']],
  ['para', ['ul', 'ol', 'paragraph']],
  ['height', ['height']],
  ['table', ['table']],
  ['insert', ['link', 'picture', 'hr']], // 'video',
  ['view', ['codeview']], // 'fullscreen',
  ['help', ['help']]
];

if (isCordova) {
  toolbar = [
    ['color', ['color']],
    ['style', ['style']],
    ['para', ['paragraph', 'ul', 'ol']],
    ['font', ['bold', 'italic', 'underline']],
    ['font2', ['superscript', 'subscript', 'strikethrough', 'clear']],
    //['fontsize', ['fontsize']],
    ['height', ['height']],
    ['insert', ['picture', 'link', 'hr']],
    ['table', ['table']],
    ['view', ['codeview']]
  ];
}

function initEditor() {
  $htmlEditor.summernote({
    focus: true,
    height: "100%",
    toolbar: toolbar,
    onkeyup: function() {
      contentVersion++;
      //            window.parent.postMessage('par1', '*');
    }
  });
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
  $htmlEditor.append(content);
  // Check if summernote is loaded
  if (typeof $htmlEditor.summernote === 'function') {
    initEditor();
  } else {
    // window.setTimeout(initEditor(), 1000);
  }
}
