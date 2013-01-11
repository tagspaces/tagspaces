/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
chrome.browserAction.onClicked.addListener(function() {
	chrome.tabs.create({ url: 'index.html'});
});
//chrome.app.runtime.onLaunched.addListener(function() {
//  chrome.app.window.create('index.html');
//});