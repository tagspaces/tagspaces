/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
console.debug("Loading ioAPIDummy.js..");

var IOAPI = (typeof IOAPI == 'object' && IOAPI != null) ? IOAPI : {};

IOAPI.sampleVar = 1;

IOAPI.renameFile = function(filepath, newname) {
	console.debug("Renaming "+filepath+" to "+newname);
}


