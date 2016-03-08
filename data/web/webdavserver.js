"use strict";

var jsDAV = require("jsDAV/lib/jsdav");
jsDAV.debugMode = true;
var jsDAV_Auth_Backend_File = require("jsDAV/lib/DAV/plugins/auth/file");

jsDAV.createServer({
  node: "../../data",
  authBackend:  jsDAV_Auth_Backend_File.new("./jsdavauth"),
  realm: "jdavtest"
}, 8000);
