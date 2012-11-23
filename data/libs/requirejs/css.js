/**
 * @license RequireCSS 0.3.1 Copyright (c) 2011, VIISON All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/VIISON/RequireCSS for details
 */

/*jslint forin: true */
/*global document: true, setTimeout: true, define: true */

(function () {
	"use strict";

	var doc = document,
		head = doc.head || doc.getElementsByTagName('head')[0],
		// Eliminate browsers that admit to not support the link load event (e.g. Firefox < 9)
		nativeLoad = doc.createElement('link').onload === null ? undefined : false,
		a = doc.createElement('a');

	function createLink(url) {
		var link = doc.createElement('link');

		link.rel = "stylesheet";
		link.type = "text/css";
		link.href = url;

		return link;
	}

	function styleSheetLoaded(url) {
		var i;

		// Get absolute url by assigning to a link and reading it back below
		a.href = url;

		for (i in doc.styleSheets) {
			if (doc.styleSheets[i].href === a.href) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Load using the browsers built-in load event on link tags
	 */
	function loadLink(url, load) {
		var link = createLink(url);

		link.onload = function () {
			load();
		};

		head.appendChild(link);
	};

	/**
	 * Insert a script tag and use it's onload & onerror to know when
	 * the CSS is loaded, this will unfortunately also fire on other
	 * errors (file not found, network problems)
	 */
	function loadScript(url, load) {
		var link = createLink(url),
			script = doc.createElement('script');

		head.appendChild(link);

		script.onload = script.onerror = function () {
			head.removeChild(script);

			// In Safari the stylesheet might not yet be applied, when
			// the script is loaded so we poll document.styleSheets for it
			var checkLoaded = function () {
				if (styleSheetLoaded(url)) {
					load();

					return;
				}

				setTimeout(checkLoaded, 25);
			};
			checkLoaded();
		};
		script.src = url;

		head.appendChild(script);
	};

	function loadSwitch(url, load) {
		if (nativeLoad) {
			loadLink(url, load);
		} else {
			loadScript(url, load);
		}
	};

	define(function () {
		var css;

		css = {
			version: '0.3.1',

			load: function (name, req, load) { //, config (not used)
				// convert name to actual url
				var url = req.toUrl(
					// Append default extension
					name.search(/\.(css|less|scss)$/i) === -1 ? name + '.css' : name
				);

				// Test if the browser supports the link load event,
				// in case we don't know yet (mostly WebKit)
				if (nativeLoad === undefined) {
					// Create a link element with a data url,
					// it would fire a load event immediately
					var link = createLink('data:text/css,');

					link.onload = function () {
						// Native link load event works
						nativeLoad = true;
					};

					head.appendChild(link);

					// Schedule function in event loop, this will
					// execute after a potential execution of the link onload
					setTimeout(function () {
						head.removeChild(link);

						if (nativeLoad !== true) {
							// Native link load event is broken
							nativeLoad = false;
						}

						loadSwitch(url, load);
					}, 0);
				} else {
					loadSwitch(url, load);
				}
			}
		};

		return css;
	});
}());