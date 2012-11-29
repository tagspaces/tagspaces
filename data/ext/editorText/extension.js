define(function(require, exports, module) {
"use strict";

exports.config = {
    "id": "editorText", // ID should be equal to the directory name where the ext. is located   
    "title": "Text Editor",
    "type": "editor", // viewer, ts for tagspace
    "supportedFileTypes": [
        "h", "c", "clj", "coffee", "coldfusion", "cpp",
        "cs", "css", "groovy", "haxe", "htm", "html",
        "java", "js", "jsm", "json", "latex", "less",
        "ly", "ily", "lua", "markdown", "md", "mdown",
        "mdwn", "mkd", "ml", "mli", "pl", "php", 
        "powershell", "py", "rb", "scad", "scala",
        "scss", "sh", "sql", "svg", "textile", "txt", "xml"
     ]        
}

var aceEditor = undefined;
//var editorElId = undefined;

exports.init = function(elementID) {
    console.debug("Initalization ACE Text Editor...");
//    editorElId = elementID;
    var ace = require("./ace/ace");  
    aceEditor = ace.edit(elementID);
    aceEditor.setTheme("./ace/theme/monokai");
}

/*exports.getEditor = function() {
    return editorElId;
}*/

exports.viewerMode = function(isViewerMode) {
    ace.setReadonly(isViewerMode);      
}

exports.setContent = function(content) {
    aceEditor.setValue(content);
}

exports.getContent = function() {
    return aceEditor.getValue();
}

exports.setFileType = function(fileExt) {
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

    if (filetype[fileExt] != null) {
        aceEditor.getSession().setMode("./ace/mode/" + filetype[fileExt]);
        //var syntaxMode = require("./ace/mode/" + filetype[fileExt]).Mode;
        //aceEditor.getSession().setMode(new syntaxMode());
    }  
}

});