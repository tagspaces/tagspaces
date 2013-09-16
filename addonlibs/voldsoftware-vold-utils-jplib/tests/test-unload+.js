/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Initial Developer of the Original Code is Erik Vold
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Erik Vold <erikvvold@gmail.com> (Original Author)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var timer = require("timer");
var {Cc,Ci} = require("chrome");

function makeEmptyWindow() {
  var xulNs = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
  var blankXul = ('<?xml version="1.0"?>' +
                  '<?xml-stylesheet href="chrome://global/skin/" ' +
                  '                 type="text/css"?>' +
                  '<window xmlns="' + xulNs + '">' +
                  '</window>');
  var url = "data:application/vnd.mozilla.xul+xml," + escape(blankXul);
  var features = ["chrome", "width=10", "height=10"];

  var ww = Cc["@mozilla.org/embedcomp/window-watcher;1"]
           .getService(Ci.nsIWindowWatcher);
  return ww.openWindow(null, url, null, features.join(","), null);
}

exports.testUnloading = function(test) {
  var loader = test.makeSandboxedLoader();
  var {unload} = loader.require("unload+");
  var unloadCalled = 0;

  function unloader() {
    unloadCalled++;
    throw "error";
  }
  unload(unloader);

  function unloader2() unloadCalled++;
  var removeUnloader2 = unload(unloader2);

  function unloader3() unloadCalled++;
  unload(unloader3);

  // remove unloader2
  removeUnloader2();

  loader.unload();
  test.assertEqual(
      unloadCalled, 2, "Unloader functions are called on unload.");
};

exports.testUnloadingWindow = function(test) {
  var loader = test.makeSandboxedLoader();
  var {unload} = loader.require("unload+");
  var windowUtils = loader.require("window-utils");
  var unloadCalled = 0;
  var finished = false;
  var myWindow;

  var delegate = {
    onTrack: function(window) {
      if (window == myWindow) {
        test.pass("onTrack() called with our test window");

        function unloader() {
          unloadCalled++;
        }
        unload(unloader, window);
        unload(unloader);

        timer.setTimeout(function() {
          window.close();

          test.assertEqual(
                unloadCalled, 0, "no unloaders called.");

          if (window.closed) {
            test.pass("window closed");
          } else {
            test.fail("window is not closed!");
          }

          timer.setTimeout(function() {
            test.assertEqual(
                unloadCalled, 0, "zero unloaders called.");

            loader.unload();

            test.assertEqual(
                  unloadCalled, 1, "one unloaders called.");

            if (finished) {
              test.pass("finished");
              test.done();
            } else {
              test.fail("not finished!");
            }
          }, 1);
        }, 1);
      }
    },
    onUntrack: function(window) {
      if (window == myWindow) {
        test.pass("onUntrack() called with our test window");

          if (!finished) {
            finished = true;
            myWindow = null;
            wt.unload();
          } else {
            test.fail("finishTest() called multiple times.");
          }
      }
    }
  };

  var wt = new windowUtils.WindowTracker(delegate);
  myWindow = makeEmptyWindow();
  test.waitUntilDone(5000);
}
