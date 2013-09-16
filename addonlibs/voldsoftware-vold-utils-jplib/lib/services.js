/* ***** BEGIN LICENSE BLOCK *****
 * Version: MIT/X11 License
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Contributor(s):
 *   Erik Vold <erikvvold@gmail.com> (Original Author)
 *
 * ***** END LICENSE BLOCK ***** */

const {Cc, Ci, Cu} = require("chrome");
Cu.import("resource://gre/modules/Services.jsm", this);

const global = this;
var Services = exports.Services = {};
(function(inc, tools){
  inc("resource://gre/modules/XPCOMUtils.jsm", global);
  inc("resource://gre/modules/Services.jsm", tools);
  Services.__proto__ = tools.Services;
})(Cu.import, {});

/*
XPCOMUtils.defineLazyGetter(Services, "scriptish", function() (
    Cc["@scriptish.erikvold.com/scriptish-service;1"]
        .getService().wrappedJSObject));
*/

XPCOMUtils.defineLazyServiceGetter(
     Services, "as", "@mozilla.org/alerts-service;1", "nsIAlertsService");

XPCOMUtils.defineLazyServiceGetter(
    Services, "ass", "@mozilla.org/appshell/appShellService;1",
    "nsIAppShellService");

XPCOMUtils.defineLazyServiceGetter(
    Services, "cb", "@mozilla.org/widget/clipboardhelper;1",
    "nsIClipboardHelper");

XPCOMUtils.defineLazyServiceGetter(
    Services, "cs", "@mozilla.org/consoleservice;1", "nsIConsoleService");

XPCOMUtils.defineLazyServiceGetter(
    Services, "eps", "@mozilla.org/uriloader/external-protocol-service;1",
    "nsIExternalProtocolService");

if (Cc["@mozilla.org/privatebrowsing;1"]) {
  XPCOMUtils.defineLazyServiceGetter(
      Services, "pbs", "@mozilla.org/privatebrowsing;1",
      "nsIPrivateBrowsingService");
} else {
  Services.pbs = {privateBrowsingEnabled: false};
}

XPCOMUtils.defineLazyServiceGetter(
    Services, "sis", "@mozilla.org/scriptableinputstream;1",
    "nsIScriptableInputStream");

XPCOMUtils.defineLazyServiceGetter(
    Services, "suhtml", "@mozilla.org/feed-unescapehtml;1",
    "nsIScriptableUnescapeHTML");

XPCOMUtils.defineLazyServiceGetter(
    Services, "tld", "@mozilla.org/network/effective-tld-service;1",
    "nsIEffectiveTLDService");

XPCOMUtils.defineLazyServiceGetter(
    Services, "uuid", "@mozilla.org/uuid-generator;1",
    "nsIUUIDGenerator");
