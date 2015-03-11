"use strict";

function DOMtoString(document_root) {
  var html = '',
    node = document_root.firstChild;
  while (node) {
    switch (node.nodeType) {
      case Node.ELEMENT_NODE:
        html += node.outerHTML;
        break;
      case Node.TEXT_NODE:
        html += node.nodeValue;
        break;
      case Node.CDATA_SECTION_NODE:
        html += '<![CDATA[' + node.nodeValue + ']]>';
        break;
      case Node.COMMENT_NODE:
        html += '<!--' + node.nodeValue + '-->';
        break;
      case Node.DOCUMENT_TYPE_NODE:
        // (X)HTML documents are identified by public identifiers
        html += "<!DOCTYPE " + node.name + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '') + (!node.publicId && node.systemId ? ' SYSTEM' : '') + (node.systemId ? ' "' + node.systemId + '"' : '') + '>\n';
        break;
    }
    node = node.nextSibling;
  }
  return html;
}

function getSelectionHtml() {
  var html = "";
  if (typeof window.getSelection != "undefined") {
    var sel = window.getSelection();
    if (sel.rangeCount) {
      var container = document.createElement("div");
      for (var i = 0, len = sel.rangeCount; i < len; ++i) {
        container.appendChild(sel.getRangeAt(i).cloneContents());
      }
      html = container.innerHTML;
    }
  } else if (typeof document.selection != "undefined") {
    if (document.selection.type == "Text") {
      html = document.selection.createRange().htmlText;
    }
  }
  return html;
}

chrome.extension.sendMessage({
  action: "getSource",
  //source: DOMtoString(document)
  source: getSelectionHtml()
});

/*
 function adjustRange(range) {
 range = range.cloneRange();

 // Expand range to encompass complete element if element's text
 // is completely selected by the range
 var container = range.commonAncestorContainer;
 var parentElement = container.nodeType == 3 ?
 container.parentNode : container;

 if (parentElement.textContent == range.toString()) {
 range.selectNode(parentElement);
 }

 return range;
 }

 function getSelectionHtml(selection) {
 var html = "", sel, range;
 if (typeof selection != "undefined") {
 sel = selection;
 if (sel.rangeCount) {
 var container = document.createElement("div");
 for (var i = 0, len = sel.rangeCount; i < len; ++i) {
 range = adjustRange( sel.getRangeAt(i) );
 container.appendChild(range.cloneContents());
 }
 html = container.innerHTML;
 }
 }
 //else if (typeof document.selection != "undefined") {
 //    if (document.selection.type == "Text") {
 //        html = document.selection.createRange().htmlText;
 //    }
 //}
 return html;
 }*/
