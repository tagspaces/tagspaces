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

const xcode = require('xcode');
const plist = require('plist');
const _ = require('underscore');
const path = require('path');
const fs = require('fs-extra');

const pluginHandlers = require('./plugman/pluginHandlers');
const CordovaError = require('cordova-common').CordovaError;

const cachedProjectFiles = {};

function parseProjectFile (locations) {
    const project_dir = locations.root;
    const pbxPath = locations.pbxproj;

    if (cachedProjectFiles[project_dir]) {
        return cachedProjectFiles[project_dir];
    }

    const xcodeproj = xcode.project(pbxPath);
    xcodeproj.parseSync();

    const xcBuildConfiguration = xcodeproj.pbxXCBuildConfigurationSection();
    const plist_file_entry = _.find(xcBuildConfiguration, entry => entry.buildSettings && entry.buildSettings.INFOPLIST_FILE);
    const plist_file = path.join(project_dir, plist_file_entry.buildSettings.INFOPLIST_FILE.replace(/^"(.*)"$/g, '$1').replace(/\\&/g, '&'));
    const config_file = path.join(path.dirname(plist_file), 'config.xml');

    if (!fs.existsSync(plist_file) || !fs.existsSync(config_file)) {
        throw new CordovaError('Could not find *-Info.plist file, or config.xml file.');
    }

    const frameworks_file = path.join(project_dir, 'frameworks.json');
    let frameworks = {};
    try {
        frameworks = require(frameworks_file);
    } catch (e) { }

    const xcode_dir = path.dirname(plist_file);
    const pluginsDir = path.resolve(xcode_dir, 'Plugins');
    const resourcesDir = path.resolve(xcode_dir, 'Resources');

    cachedProjectFiles[project_dir] = {
        plugins_dir: pluginsDir,
        resources_dir: resourcesDir,
        xcode: xcodeproj,
        xcode_path: xcode_dir,
        pbx: pbxPath,
        projectDir: project_dir,
        platformWww: path.join(project_dir, 'platform_www'),
        www: path.join(project_dir, 'www'),
        write: function () {
            fs.writeFileSync(pbxPath, xcodeproj.writeSync());
            if (Object.keys(this.frameworks).length === 0) {
                // If there is no framework references remain in the project, just remove this file
                fs.removeSync(frameworks_file);
                return;
            }
            fs.writeFileSync(frameworks_file, JSON.stringify(this.frameworks, null, 4));
        },
        getPackageName: function () {
            const packageName = plist.parse(fs.readFileSync(plist_file, 'utf8')).CFBundleIdentifier;
            let bundleIdentifier = packageName;

            const variables = packageName.match(/\$\((\w+)\)/); // match $(VARIABLE), if any
            if (variables && variables.length >= 2) {
                bundleIdentifier = xcodeproj.getBuildProperty(variables[1]);
            }

            return bundleIdentifier.replace(/^"/, '').replace(/"$/, '');
        },
        getInstaller: function (name) {
            return pluginHandlers.getInstaller(name);
        },
        getUninstaller: function (name) {
            return pluginHandlers.getUninstaller(name);
        },
        frameworks
    };
    return cachedProjectFiles[project_dir];
}

function purgeProjectFileCache (project_dir) {
    delete cachedProjectFiles[project_dir];
}

module.exports = {
    parse: parseProjectFile,
    purgeProjectFileCache
};

xcode.project.prototype.pbxEmbedFrameworksBuildPhaseObj = function (target) {
    return this.buildPhaseObject('PBXCopyFilesBuildPhase', 'Embed Frameworks', target);
};

xcode.project.prototype.addToPbxEmbedFrameworksBuildPhase = function (file) {
    const sources = this.pbxEmbedFrameworksBuildPhaseObj(file.target);
    if (sources) {
        sources.files.push(pbxBuildPhaseObj(file));
    }
};
xcode.project.prototype.removeFromPbxEmbedFrameworksBuildPhase = function (file) {
    const sources = this.pbxEmbedFrameworksBuildPhaseObj(file.target);
    if (sources) {
        sources.files = _.reject(sources.files, file => file.comment === longComment(file));
    }
};

// special handlers to add frameworks to the 'Embed Frameworks' build phase, needed for custom frameworks
// see CB-9517. should probably be moved to node-xcode.
const util = require('util');
function pbxBuildPhaseObj (file) {
    const obj = Object.create(null);
    obj.value = file.uuid;
    obj.comment = longComment(file);
    return obj;
}

function longComment (file) {
    return util.format('%s in %s', file.basename, file.group);
}
