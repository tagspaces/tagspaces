/* Copyright (c) 2012-2013 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

// the value of this var is replaced to "true" by the build script  
var PRODUCTION = "@PRODUCTION@";
var VERSION = "@VERSION@";

// Disabling all output to console in production mode
if (PRODUCTION == "true") {
    console = console || {};
    console.log = function(){};
    console.error = function(){};    
    console.log = function(){};    
}

// Import the needed APIs
//var selection = require("selection");
var widgets = require("widget");
var data = require('self').data;
var addontab = require("addon-page"); // Enables the opening of main UI without location bar
var ioutils = require("ioutils"); 
var settings = require("settings"); 
var request = require("request");

var workers = [];

var toolbarButton;
var toolbarButtonDestroyed = false;

exports.main = function(options, callbacks) {
	console.log("Load reason: "+options.loadReason);
	
    var mainUIMod = require("page-mod");
    mainUIMod.PageMod({
      include: data.url("index.html"), 
      contentScript: ''+
        'self.on("message", function(message) {'+
            'console.log("Message received in content script from addon: "+JSON.stringify(message));'+
            'var event = document.createEvent("CustomEvent");'+
            'event.initCustomEvent("tsMessage", true, true, message);'+    
            'document.documentElement.dispatchEvent(event);    '+
        '}); '+
        'document.documentElement.addEventListener("addon-message", function(event) {'+
            'console.log("Message received from page script in content script "+JSON.stringify(event.detail));'+
            'self.postMessage(event.detail);'+ 
        '}, false);'+
      '',        
      contentScriptWhen: 'end', 
      onAttach: function onAttach(worker) {
        console.log("Attaching worker on tab with title: "+worker.tab.title);
        
    	workers.push(worker);	
    	worker.on('message', function(data) {
    		handleMessage(data, this);      
        });
        worker.on('detach', function () {
    		detachWorker(this);
        });	
      }  
    }); 
      
    // A basic click-able image widget.
    widgets.Widget({
		id: "TagSpaces",
		label: "TagSpaces",
		contentURL: data.url("icons/icon16.png"),
		onClick: function() {
			// Opens the main ui in a new pinned tab
			require("tabs").open({
			url: data.url("index.html"),
		//	isPinned: true,
			});	
		},
        onMouseover: function() {
        	this.contentURL = data.url("icons/icon16color.png");
        },
        onMouseout: function() {
        	this.contentURL = data.url("icons/icon16.png");
        }
    });       
    
    // Adding menuitem to the tools menu
    var menuitem = require("menuitems").Menuitem({
      id: "TagSpacesMenuItem",
      menuid: "menu_ToolsPopup",
      label: "TagSpaces",
      image: data.url("icons/icon16.png"),      
      onCommand: function() {
    	// Opens the main ui in a new pinned tab
        require("tabs").open({
    	  url: data.url("index.html"),
      //	  isPinned: true,
    	});	
      },
      insertbefore: "menu_pageInfo"
    });
    
    // Adding toolbar button
    initToobarButton();
    installToolbarButton();
    //if (options.loadReason == "install" || options.loadReason == "enable") {}  	
 	    
};

function installToolbarButton () {
    toolbarButton.moveTo({
      toolbarID: "nav-bar",
      forceMove: false
    });
}

function initToobarButton() {
    toolbarButton = require("toolbarbutton").ToolbarButton({
        id: "TSToolbarButton",
        label: "TagSpaces",
        image: data.url("icons/icon16.png"),
        onCommand: function() {
            require("tabs").open({
                url: data.url("index.html"),
                //isPinned: true,
                isPrivate : true,
            });
        }
    });
}
 
exports.onUnload = function(reason) {
  console.log(reason);
};

function detachWorker(worker) {
  console.log("Detaching worker...");
  var index = workers.indexOf(worker);
  workers.splice(index,1);
}

var checkForNewVersion = request.Request({
  url: "http://tagspaces.org/releases/version.json?fVer="+VERSION,
  onComplete: function (response) {
//    console.log("Result: " + response.text + " " + response.status);
    return response.text;  
  }
});

function checkNewVersion(worker) {
    try {   
        var content = undefined;
        var versionReq = request.Request({
          url: "http://tagspaces.org/releases/version.json?fVer="+VERSION,
          onComplete: function (response) {
            console.log("Result: " + response.text + " " + response.status);
            response.text;  
            worker.postMessage({
                    "command": "checkNewVersion",
                    "content": response.text,
                    "success": true
                });     
            console.log("Loading settings successful!");      
           }
        }).get();
    } catch(ex) {
        worker.postMessage({
                "command": "checkNewVersion",
                "success": false    
            });
        console.error("Checking new version failed "+ex);
    } 
}

function handleMessage(msg, worker) {
	console.log("Message in main.js: "+JSON.stringify(msg)+" from tab "+worker.tab.title);
   	//console.log("Thumbnail: "+worker.tab.getThumbnail());
	switch (msg.detail.command) {
      case "loadSettings":
        settings.loadSettings(worker);      
        break; 
      case "checkNewVersion":
        checkNewVersion(worker);
        break;
      case "saveSettings":
        settings.saveSettings(msg.detail.content,worker);
        break;
	  case "rename":
		ioutils.rename(msg.detail.path,msg.detail.newPath,worker);
		break;
	  case "saveTextFile":
		ioutils.saveTextFile(msg.detail.path,msg.detail.content,worker);
		break;
	  case "createDirectory":
		ioutils.createDirectory(msg.detail.path,worker);
		break;
	  case "loadTextFile":
		ioutils.loadTextFile(msg.detail.path,worker);
		break;
	  case "listDirectory":
		ioutils.listDirectory(msg.detail.path,worker);
		break;		
	  case "delete":
		ioutils.deleteElement(msg.detail.path,worker);
		break;	
	  case "selectFile":
		ioutils.promptFileOpenPicker(worker);
		break;	
	  case "selectDirectory":
		ioutils.promptDirectorySelector(worker);
		break;	
	  case "openDirectory":
		ioutils.openDirectory(msg.detail.path,worker);	
		break;			
      case "openExtensionsDirectory":
        ioutils.openExtensionsDirectory(worker);  
        break;      
      case "createDirectoryIndex":
        ioutils.createDirectoryIndex(msg.detail.path,worker);  
        break;
      case "createDirectoryTree":
        ioutils.createDirectoryTree(msg.detail.path,worker);  
        break;
	  default:
		break;
	}	
}