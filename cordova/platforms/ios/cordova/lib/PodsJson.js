/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
*/

var fs = require('fs');
var path = require('path');
var util = require('util');
var events = require('cordova-common').events;
var CordovaError = require('cordova-common').CordovaError;

PodsJson.FILENAME = 'pods.json';
PodsJson.LIBRARY = 'libraries';
PodsJson.SOURCE = 'sources';
PodsJson.DECLARATION = 'declarations';

function PodsJson (podsJsonPath) {
    this.path = podsJsonPath;
    this.contents = null;
    this.__dirty = false;

    var filename = this.path.split(path.sep).pop();
    if (filename !== PodsJson.FILENAME) {
        throw new CordovaError(util.format('PodsJson: The file at %s is not `%s`.', this.path, PodsJson.FILENAME));
    }

    if (!fs.existsSync(this.path)) {
        events.emit('verbose', util.format('pods.json: The file at %s does not exist.', this.path));
        events.emit('verbose', 'Creating new pods.json in platforms/ios');
        this.clear();
        this.write();
    } else {
        events.emit('verbose', 'pods.json found in platforms/ios');
        // load contents
        var contents = fs.readFileSync(this.path, 'utf8');
        this.contents = JSON.parse(contents);
    }
    this.__updateFormatIfNecessary();
}

PodsJson.prototype.__isOldFormat = function () {
    if (this.contents !== null) {
        if (this.contents.declarations === undefined ||
            this.contents.sources === undefined ||
            this.contents.libraries === undefined) {
            return true;
        }
    }
    return false;
};

PodsJson.prototype.__updateFormatIfNecessary = function () {
    if (this.__isOldFormat()) {
        this.contents = {
            declarations: {},
            sources: {},
            libraries: this.contents
        };
        this.__dirty = true;
        events.emit('verbose', 'Update format of pods.json');
    }
};

PodsJson.prototype.getLibraries = function () {
    return this.contents[PodsJson.LIBRARY];
};

PodsJson.prototype.__get = function (kind, name) {
    return this.contents[kind][name];
};

PodsJson.prototype.getLibrary = function (name) {
    return this.__get(PodsJson.LIBRARY, name);
};

PodsJson.prototype.getSource = function (name) {
    return this.__get(PodsJson.SOURCE, name);
};

PodsJson.prototype.getDeclaration = function (name) {
    return this.__get(PodsJson.DECLARATION, name);
};

PodsJson.prototype.__remove = function (kind, name) {
    if (this.contents[kind][name]) {
        delete this.contents[kind][name];
        this.__dirty = true;
        events.emit('verbose', util.format('Remove from pods.json for `%s` - `%s`', name));
    }
};

PodsJson.prototype.removeLibrary = function (name) {
    this.__remove(PodsJson.LIBRARY, name);
};

PodsJson.prototype.removeSource = function (name) {
    this.__remove(PodsJson.SOURCE, name);
};

PodsJson.prototype.removeDeclaration = function (name) {
    this.__remove(PodsJson.DECLARATION, name);
};

PodsJson.prototype.clear = function () {
    this.contents = {
        declarations: {},
        sources: {},
        libraries: {}
    };
    this.__dirty = true;
};

PodsJson.prototype.destroy = function () {
    fs.unlinkSync(this.path);
    events.emit('verbose', util.format('Deleted `%s`', this.path));
};

PodsJson.prototype.write = function () {
    if (this.contents) {
        fs.writeFileSync(this.path, JSON.stringify(this.contents, null, 4));
        this.__dirty = false;
        events.emit('verbose', 'Wrote to pods.json.');
    }
};

PodsJson.prototype.__increment = function (kind, name) {
    var val = this.__get(kind, name);
    if (val) {
        val.count++;
    }
};

PodsJson.prototype.incrementLibrary = function (name) {
    this.__increment(PodsJson.LIBRARY, name);
};

PodsJson.prototype.incrementSource = function (name) {
    this.__increment(PodsJson.SOURCE, name);
};

PodsJson.prototype.incrementDeclaration = function (name) {
    this.__increment(PodsJson.DECLARATION, name);
};

PodsJson.prototype.__decrement = function (kind, name) {
    var val = this.__get(kind, name);
    if (val) {
        val.count--;
        if (val.count <= 0) {
            this.__remove(kind, name);
        }
    }
};

PodsJson.prototype.decrementLibrary = function (name) {
    this.__decrement(PodsJson.LIBRARY, name);
};

PodsJson.prototype.decrementSource = function (name) {
    this.__decrement(PodsJson.SOURCE, name);
};

PodsJson.prototype.decrementDeclaration = function (name) {
    this.__decrement(PodsJson.DECLARATION, name);
};

PodsJson.prototype.__setJson = function (kind, name, json) {
    this.contents[kind][name] = Object.assign({}, json);
    this.__dirty = true;
    events.emit('verbose', util.format('Set pods.json for `%s` - `%s`', kind, name));
};

// sample json for library
// { name: "Eureka", spec: "4.2.0", "swift-version": "4.1", count: 1 }
PodsJson.prototype.setJsonLibrary = function (name, json) {
    this.__setJson(PodsJson.LIBRARY, name, json);
};

// sample json for source
// { source: "https://github.com/brightcove/BrightcoveSpecs.git", count: 1 }
PodsJson.prototype.setJsonSource = function (name, json) {
    this.__setJson(PodsJson.SOURCE, name, json);
};

// sample json for declaration
// { declaration: ""}
PodsJson.prototype.setJsonDeclaration = function (name, json) {
    this.__setJson(PodsJson.DECLARATION, name, json);
};

PodsJson.prototype.isDirty = function () {
    return this.__dirty;
};

module.exports.PodsJson = PodsJson;
