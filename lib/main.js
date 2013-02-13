/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

// Import the APIs we need.
//var contextMenu = require("context-menu");
var request = require("request");
var selection = require("selection");
var widgets = require("widget");
var data = require('self').data;
var addontab = require("addon-page"); // Enables the opening of main UI without location bar
var ioutils = require("ioutils"); 
var settings = require("settings"); 

var workers = [];
 
exports.main = function(options, callbacks) {
	console.log(options.loadReason);
	
    var mainUIMod = require("page-mod");
    mainUIMod.PageMod({
      include: data.url("index.html"), 
      contentScript: ''+
        'self.on("message", function(message) {'+
            'console.debug("Message received in content script from addon: "+JSON.stringify(message));'+
            'var event = document.createEvent("CustomEvent");'+
            'event.initCustomEvent("addon-message1", true, true, message);'+    
            'document.documentElement.dispatchEvent(event);    '+
        '}); '+
        'document.documentElement.addEventListener("addon-message", function(event) {'+
            'console.debug("Message received from page script in content script "+JSON.stringify(event.detail));'+
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
			isPinned: true,
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
      onCommand: function() {
    	// Opens the main ui in a new pinned tab
        require("tabs").open({
    	  url: data.url("index.html"),
    	  isPinned: true,
    	});	
      },
      insertbefore: "menu_pageInfo"
    });
    
    // Adding toolbar button
	var toolbarButton = require("toolbarbutton").ToolbarButton({
	    id: "TagspacesToolbarButton",
	    label: "TagSpaces",
	    image: data.url("icons/icon16.png"),
	    toolbarID: "nav-bar", // nav-bar, TabsToolbar, addon-bar, toolbar-menubar
		onCommand: function() {
			// Opens the main ui in a new pinned tab
			require("tabs").open({
		  	url: data.url("index.html"),
				isPinned: true,
			});	
		},
	    forceMove: true
  	});
  	
	if (require('self').loadReason == "install") {
	  toolbarButton.moveTo({
	    toolbarID: "nav-bar",
	    forceMove: true // only move from palette
	  });
	}  	    
};
 
exports.onUnload = function(reason) {
  console.log(reason);
};

function detachWorker(worker) {
  console.log("Detaching worker...");
  var index = workers.indexOf(worker);
  workers.splice(index,1);
}

function handleMessage(msg, worker) {
	console.debug("Message in main.js: "+JSON.stringify(msg)+" from tab "+worker.tab.title);
	switch (msg.detail.command) {
      case "loadSettings":
        settings.loadSettings(worker)        
        break;
      case "saveSettings":
        settings.saveSettings(msg.detail.content,worker)
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
	  case "getSubdirs":
		ioutils.getSubdirs(msg.detail.path,worker);
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