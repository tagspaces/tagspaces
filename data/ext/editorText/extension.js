define(function(require, exports, module) {
"use strict";

exports.id = "editorText"; // ID should be equal to the directory name where the ext. is located   
exports.title = "Text Editor";
exports.type = "editor";
exports.supportedFileTypes = [
        "h", "c", "clj", "coffee", "coldfusion", "cpp",
        "cs", "css", "groovy", "haxe", "htm", "html",
        "java", "js", "jsm", "json", "latex", "less",
        "ly", "ily", "lua", "markdown", "md", "mdown",
        "mdwn", "mkd", "ml", "mli", "pl", "php", 
        "powershell", "py", "rb", "scad", "scala",
        "scss", "sh", "sql", "svg", "textile", "txt", "xml"
     ] ;

var aceEditor = undefined;
var extensionDirectory = TSSETTINGS.getExtensionPath()+UIAPI.getDirSeparator()+exports.id];

var generateUI = function(containerElementID) {
	$("#"+containerElementID).append('<div id="aceEditor" style="width: 100%; height: 100%"></div>');	
}

/* require.config({
    baseUrl: 'file:///Z://TagSpaces//repository//data//ext//editorText'
}); */

exports.init = function(filePath, containerElementID) {
    console.debug("Initalization ACE Text Editor...");
    var fileExt = filePath.substring(filePath.lastIndexOf(".")+1,filePath.length).toLowerCase();
	generateUI(containerElementID);
	 
    aceEditor = require('./ace/ace').edit('aceEditor');
//    aceEditor.setTheme("./ace/theme/monokai");
    IOAPI.loadTextFile(filePath);
    if (filetype[fileExt] != null) {
        require(["./ace/mode/" + filetype[fileExt]], function(acemode) {
        	var syntaxMode = acemode.Mode;
        	aceEditor.getSession().setMode(new syntaxMode());
        })       
    }

}

exports.init2 = function(filePath, containerElementID) {
    console.debug("Initalization ACE Text Editor...");
    var fileExt = filePath.substring(filePath.lastIndexOf(".")+1,filePath.length).toLowerCase();
	generateUI(containerElementID);
	
	require([extensionDirectory+'/ace/ace.js'], function(acemodule) { //"file:///Z:/TagSpaces/repository/data/ext/editorText/ace/ace.js" extensionDirectory+'/ace/ace.js'
	    aceEditor = acemodule.edit('aceEditor');
	//    aceEditor.setTheme("./ace/theme/monokai");
	    IOAPI.loadTextFile(filePath);
	    if (filetype[fileExt] != null) {
	        require(["./ace/mode/" + filetype[fileExt]], function(acemode) {
	        	var syntaxMode = acemode.Mode;
	        	aceEditor.getSession().setMode(new syntaxMode());
	        })       
	    }
	});
}

exports.viewerMode = function(isViewerMode) {
    aceEditor.setReadOnly(isViewerMode);      
}

exports.setContent = function(content) {
    aceEditor.setValue(content);
    aceEditor.clearSelection();
}

exports.getContent = function() {
    return aceEditor.getValue();
}

var filetype = new Array();
filetype["h"] = "c_cpp";
filetype["c"] = "c_cpp";
filetype["clj"] = "clojure";
filetype["coffee"] = "coffee";
filetype["coldfusion"] = "cfc";
filetype["cpp"] = "c_cpp";
filetype["cs"] = "csharp";
filetype["css"] = "css";
filetype["groovy"] = "groovy";
filetype["haxe"] = "hx";
filetype["htm"] = "html";
filetype["html"] = "html";
filetype["java"] = "java";
filetype["js"] = "javascript";
filetype["jsm"] = "javascript";
filetype["json"] = "json";
filetype["latex"] = "latex";
filetype["less"] = "less";
filetype["ly"] = "latex";
filetype["ily"] = "latex";
filetype["lua"] = "lua";
filetype["markdown"] = "markdown";
filetype["md"] = "markdown";
filetype["mdown"] = "markdown";
filetype["mdwn"] = "markdown";
filetype["mkd"] = "markdown";
filetype["ml"] = "ocaml";
filetype["mli"] = "ocaml";
filetype["pl"] = "perl";
filetype["php"] = "php";
filetype["powershell"] = "ps1";
filetype["py"] = "python";
filetype["rb"] = "ruby";
filetype["scad"] = "scad";
filetype["scala"] = "scala";
filetype["scss"] = "scss";
filetype["sh"] = "sh";
filetype["sql"] = "sql";
filetype["svg"] = "svg";
filetype["textile"] = "textile";
filetype["txt"] = "textile";
filetype["xml"] = "xml";

});