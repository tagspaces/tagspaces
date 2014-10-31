var badge, type, tooltiptext;

exports.ToolbarButton = function (options) {
  var {Cu}   = require('chrome'),
      utils = require('sdk/window/utils');
  Cu.import("resource:///modules/CustomizableUI.jsm");

  var listen = {
    onWidgetBeforeDOMChange: function(tbb, aNextNode, aContainer, aIsRemoval) {
      if (tbb.id != options.id) return;
      if (tbb.installed) return;
      tbb.installed = true;
      
      if (badge) {
        tbb.setAttribute("value", badge ? badge : "");
        tbb.setAttribute("length", badge ? (badge + "").length : 0);
      }
      if (type) {
        tbb.setAttribute("type", type);
      }
      if (tooltiptext) {
        tbb.setAttribute("tooltiptext", tooltiptext);
      }
    
      tbb.addEventListener("command", function(e) {
        if (e.ctrlKey) return;
        if (e.originalTarget.localName == "menu" || e.originalTarget.localName == "menuitem") return;

        if (options.onCommand) {
          options.onCommand(e);
        }

        if (options.panel) {
          options.panel.show(tbb);
        }
      }, true);
      if (options.onClick) {
          tbb.addEventListener("click", options.onClick, true); 
      }
      if (options.onContext) {
        const NS_XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
        
        let doc = tbb.ownerDocument.defaultView.document;
        let menupopup = doc.createElementNS(NS_XUL, "menupopup");
        let menu = doc.createElementNS(NS_XUL, "menu");
        let menuitem = doc.createElementNS(NS_XUL, "menuitem");
        let menuseparator = doc.createElementNS(NS_XUL, "menuseparator");
        tbb.addEventListener("contextmenu", function (e) {
          e.stopPropagation(); //Prevent Firefox context menu
          e.preventDefault();
          options.onContext(e, menupopup, menuitem, menuseparator, menu);
          menupopup.openPopup(tbb , "after_end", 0, 0, false);
        }, true);
        tbb.appendChild(menupopup);
      }
    }
  }
  CustomizableUI.addListener(listen);

  var getButton = () => utils.getMostRecentBrowserWindow().document.getElementById(options.id);
  var button = CustomizableUI.createWidget({
    id : options.id,
    defaultArea : CustomizableUI.AREA_NAVBAR,
    label : options.label,
    tooltiptext : options.tooltiptext
  });
  
  //Destroy on unload
  require("sdk/system/unload").when(function () {
    CustomizableUI.removeListener(listen);
    CustomizableUI.destroyWidget(options.id);
  });
  
  return {
    destroy: function () {
      CustomizableUI.destroyWidget(options.id);
    },
    moveTo: function () {
    
    },
    get label() button.label,
    set label(value) {
      button.instances.forEach(function (i) {
        var tbb = i.anchor.ownerDocument.defaultView.document.getElementById(options.id);
        tbb.setAttribute("label", value);
      });
    },
    set type(value) {
      type = value;
      button.instances.forEach(function (i) {
        var tbb = i.anchor.ownerDocument.defaultView.document.getElementById(options.id);
        tbb.setAttribute("type", value);
      });
    },
    get badge() badge,
    set badge(value) {
      if ((value + "").length > 4) {
        value = "9999";
      }
      badge = value;
      button.instances.forEach(function (i) {
        var tbb = i.anchor.ownerDocument.defaultView.document.getElementById(options.id);
        tbb.setAttribute("value", value ? value : "");
        tbb.setAttribute("length", value ? (value + "").length : 0);
      });
    },
    get tooltiptext() button.tooltiptext,
    set tooltiptext(value) {
      button.instances.forEach(function (i) {
        tooltiptext = value;
        var tbb = i.anchor.ownerDocument.defaultView.document.getElementById(options.id);
        tbb.setAttribute("tooltiptext", value);
      });
    },
    get object () {
      return getButton();
    }
  }
}