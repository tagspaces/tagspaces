/**
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

/* jslint node: true */

var fs = require('fs');
var path = require('path');
var unorm = require('unorm');
var projectFile = require('./lib/projectFile');
var check_reqs = require('./lib/check_reqs');
var CordovaError = require('cordova-common').CordovaError;
var CordovaLogger = require('cordova-common').CordovaLogger;
var events = require('cordova-common').events;
var PluginManager = require('cordova-common').PluginManager;
var Q = require('q');
var util = require('util');
var xcode = require('xcode');
var ConfigParser = require('cordova-common').ConfigParser;

function setupEvents (externalEventEmitter) {
    if (externalEventEmitter) {
        // This will make the platform internal events visible outside
        events.forwardEventsTo(externalEventEmitter);
    } else {
        // There is no logger if external emitter is not present,
        // so attach a console logger
        CordovaLogger.get().subscribe(events);
    }
}

/**
 * Creates a new PlatformApi instance.
 *
 * @param  {String}  [platform] Platform name, used for backward compatibility
 *   w/ PlatformPoly (CordovaLib).
 * @param  {String}  [platformRootDir] Platform root location, used for backward
 *   compatibility w/ PlatformPoly (CordovaLib).
 * @param {EventEmitter} [events] An EventEmitter instance that will be used for
 *   logging purposes. If no EventEmitter provided, all events will be logged to
 *   console
 */
function Api (platform, platformRootDir, events) {
    // 'platform' property is required as per PlatformApi spec
    this.platform = platform || 'ios';
    this.root = platformRootDir || path.resolve(__dirname, '..');

    setupEvents(events);

    var xcodeProjDir;
    var xcodeCordovaProj;

    try {

        var xcodeProjDir_array = fs.readdirSync(this.root).filter(function (e) { return e.match(/\.xcodeproj$/i); });
        if (xcodeProjDir_array.length > 1) {
            for (var x = 0; x < xcodeProjDir_array.length; x++) {
                if (xcodeProjDir_array[x].substring(0, 2) === '._') {
                    xcodeProjDir_array.splice(x, 1);
                }
            }
        }
        xcodeProjDir = xcodeProjDir_array[0];

        if (!xcodeProjDir) {
            throw new CordovaError('The provided path "' + this.root + '" is not a Cordova iOS project.');
        }

        var cordovaProjName = xcodeProjDir.substring(xcodeProjDir.lastIndexOf(path.sep) + 1, xcodeProjDir.indexOf('.xcodeproj'));
        xcodeCordovaProj = path.join(this.root, cordovaProjName);
    } catch (e) {
        throw new CordovaError('The provided path "' + this.root + '" is not a Cordova iOS project.');
    }

    this.locations = {
        root: this.root,
        www: path.join(this.root, 'www'),
        platformWww: path.join(this.root, 'platform_www'),
        configXml: path.join(xcodeCordovaProj, 'config.xml'),
        defaultConfigXml: path.join(this.root, 'cordova/defaults.xml'),
        pbxproj: path.join(this.root, xcodeProjDir, 'project.pbxproj'),
        xcodeProjDir: path.join(this.root, xcodeProjDir),
        xcodeCordovaProj: xcodeCordovaProj
    };
}

/**
 * Creates platform in a specified directory.
 *
 * @param  {String}  destination Destination directory, where install platform to
 * @param  {ConfigParser}  [config] ConfigParser instance, used to retrieve
 *   project creation options, such as package id and project name.
 * @param  {Object}  [options]  An options object. The most common options are:
 * @param  {String}  [options.customTemplate]  A path to custom template, that
 *   should override the default one from platform.
 * @param  {Boolean}  [options.link]  Flag that indicates that platform's
 *   sources will be linked to installed platform instead of copying.
 * @param {EventEmitter} [events] An EventEmitter instance that will be used for
 *   logging purposes. If no EventEmitter provided, all events will be logged to
 *   console
 *
 * @return {Promise<PlatformApi>} Promise either fulfilled with PlatformApi
 *   instance or rejected with CordovaError.
 */
Api.createPlatform = function (destination, config, options, events) {
    setupEvents(events);

    // CB-6992 it is necessary to normalize characters
    // because node and shell scripts handles unicode symbols differently
    // We need to normalize the name to NFD form since iOS uses NFD unicode form
    var name = unorm.nfd(config.name());
    var result;
    try {
        result = require('../../../lib/create')
            .createProject(destination, config.getAttribute('ios-CFBundleIdentifier') || config.packageName(), name, options, config)
            .then(function () {
                // after platform is created we return Api instance based on new Api.js location
                // This is required to correctly resolve paths in the future api calls
                var PlatformApi = require(path.resolve(destination, 'cordova/Api'));
                return new PlatformApi('ios', destination, events);
            });
    } catch (e) {
        events.emit('error', 'createPlatform is not callable from the iOS project API.');
        throw e;
    }
    return result;
};

/**
 * Updates already installed platform.
 *
 * @param  {String}  destination Destination directory, where platform installed
 * @param  {Object}  [options]  An options object. The most common options are:
 * @param  {String}  [options.customTemplate]  A path to custom template, that
 *   should override the default one from platform.
 * @param  {Boolean}  [options.link]  Flag that indicates that platform's
 *   sources will be linked to installed platform instead of copying.
 * @param {EventEmitter} [events] An EventEmitter instance that will be used for
 *   logging purposes. If no EventEmitter provided, all events will be logged to
 *   console
 *
 * @return {Promise<PlatformApi>} Promise either fulfilled with PlatformApi
 *   instance or rejected with CordovaError.
 */
Api.updatePlatform = function (destination, options, events) {
    setupEvents(events);

    var result;
    try {
        result = require('../../../lib/create')
            .updateProject(destination, options)
            .then(function () {
                var PlatformApi = require(path.resolve(destination, 'cordova/Api'));
                return new PlatformApi('ios', destination, events);
            });
    } catch (e) {
        events.emit('error', 'updatePlatform is not callable from the iOS project API, you will need to do this manually.');
        throw e;
    }
    return result;
};

/**
 * Gets a CordovaPlatform object, that represents the platform structure.
 *
 * @return  {CordovaPlatform}  A structure that contains the description of
 *   platform's file structure and other properties of platform.
 */
Api.prototype.getPlatformInfo = function () {
    var result = {};
    result.locations = this.locations;
    result.root = this.root;
    result.name = this.platform;
    result.version = require('./version');
    result.projectConfig = new ConfigParser(this.locations.configXml);

    return result;
};

/**
 * Updates installed platform with provided www assets and new app
 *   configuration. This method is required for CLI workflow and will be called
 *   each time before build, so the changes, made to app configuration and www
 *   code, will be applied to platform.
 *
 * @param {CordovaProject} cordovaProject A CordovaProject instance, that defines a
 *   project structure and configuration, that should be applied to platform
 *   (contains project's www location and ConfigParser instance for project's
 *   config).
 *
 * @return  {Promise}  Return a promise either fulfilled, or rejected with
 *   CordovaError instance.
 */
Api.prototype.prepare = function (cordovaProject) {
    cordovaProject.projectConfig = new ConfigParser(cordovaProject.locations.rootConfigXml || cordovaProject.projectConfig.path);

    return require('./lib/prepare').prepare.call(this, cordovaProject);
};

/**
 * Installs a new plugin into platform. It doesn't resolves plugin dependencies.
 *
 * @param  {PluginInfo}  plugin  A PluginInfo instance that represents plugin
 *   that will be installed.
 * @param  {Object}  installOptions  An options object. Possible options below:
 * @param  {Boolean}  installOptions.link: Flag that specifies that plugin
 *   sources will be symlinked to app's directory instead of copying (if
 *   possible).
 * @param  {Object}  installOptions.variables  An object that represents
 *   variables that will be used to install plugin. See more details on plugin
 *   variables in documentation:
 *   https://cordova.apache.org/docs/en/4.0.0/plugin_ref_spec.md.html
 *
 * @return  {Promise}  Return a promise either fulfilled, or rejected with
 *   CordovaError instance.
 */
Api.prototype.addPlugin = function (plugin, installOptions) {

    var xcodeproj = projectFile.parse(this.locations);
    var self = this;

    installOptions = installOptions || {};
    installOptions.variables = installOptions.variables || {};
    // Add PACKAGE_NAME variable into vars
    if (!installOptions.variables.PACKAGE_NAME) {
        installOptions.variables.PACKAGE_NAME = xcodeproj.getPackageName();
    }

    return PluginManager.get(self.platform, self.locations, xcodeproj)
        .addPlugin(plugin, installOptions)
        .then(function () {
            if (plugin != null) {
                var headerTags = plugin.getHeaderFiles(self.platform);
                var bridgingHeaders = headerTags.filter(function (obj) {
                    return (obj.type === 'BridgingHeader');
                });
                if (bridgingHeaders.length > 0) {
                    var project_dir = self.locations.root;
                    var project_name = self.locations.xcodeCordovaProj.split('/').pop();
                    var BridgingHeader = require('./lib/BridgingHeader').BridgingHeader;
                    var bridgingHeaderFile = new BridgingHeader(path.join(project_dir, project_name, 'Bridging-Header.h'));
                    events.emit('verbose', 'Adding Bridging-Headers since the plugin contained <header-file> with type="BridgingHeader"');
                    bridgingHeaders.forEach(function (obj) {
                        var bridgingHeaderPath = path.basename(obj.src);
                        bridgingHeaderFile.addHeader(plugin.id, bridgingHeaderPath);
                    });
                    bridgingHeaderFile.write();
                }
            }
        })
        .then(function () {
            if (plugin != null) {
                var podSpecs = plugin.getPodSpecs ? plugin.getPodSpecs(self.platform) : [];
                var frameworkTags = plugin.getFrameworks(self.platform);
                var frameworkPods = frameworkTags.filter(function (obj) {
                    return (obj.type === 'podspec');
                });
                return self.addPodSpecs(plugin, podSpecs, frameworkPods);
            }
        })
        // CB-11022 return non-falsy value to indicate
        // that there is no need to run prepare after
        .thenResolve(true);
};

/**
 * Removes an installed plugin from platform.
 *
 * Since method accepts PluginInfo instance as input parameter instead of plugin
 *   id, caller shoud take care of managing/storing PluginInfo instances for
 *   future uninstalls.
 *
 * @param  {PluginInfo}  plugin  A PluginInfo instance that represents plugin
 *   that will be installed.
 *
 * @return  {Promise}  Return a promise either fulfilled, or rejected with
 *   CordovaError instance.
 */
Api.prototype.removePlugin = function (plugin, uninstallOptions) {
    var xcodeproj = projectFile.parse(this.locations);
    var self = this;

    return PluginManager.get(self.platform, self.locations, xcodeproj)
        .removePlugin(plugin, uninstallOptions)
        .then(function () {
            if (plugin != null) {
                var headerTags = plugin.getHeaderFiles(self.platform);
                var bridgingHeaders = headerTags.filter(function (obj) {
                    return (obj.type === 'BridgingHeader');
                });
                if (bridgingHeaders.length > 0) {
                    var project_dir = self.locations.root;
                    var project_name = self.locations.xcodeCordovaProj.split('/').pop();
                    var BridgingHeader = require('./lib/BridgingHeader').BridgingHeader;
                    var bridgingHeaderFile = new BridgingHeader(path.join(project_dir, project_name, 'Bridging-Header.h'));
                    events.emit('verbose', 'Removing Bridging-Headers since the plugin contained <header-file> with type="BridgingHeader"');
                    bridgingHeaders.forEach(function (obj) {
                        var bridgingHeaderPath = path.basename(obj.src);
                        bridgingHeaderFile.removeHeader(plugin.id, bridgingHeaderPath);
                    });
                    bridgingHeaderFile.write();
                }
            }
        })
        .then(function () {
            if (plugin != null) {
                var podSpecs = plugin.getPodSpecs ? plugin.getPodSpecs(self.platform) : [];
                var frameworkTags = plugin.getFrameworks(self.platform);
                var frameworkPods = frameworkTags.filter(function (obj) {
                    return (obj.type === 'podspec');
                });
                return self.removePodSpecs(plugin, podSpecs, frameworkPods);
            }
        })
        // CB-11022 return non-falsy value to indicate
        // that there is no need to run prepare after
        .thenResolve(true);
};

/**
 * adding CocoaPods libraries
 *
 * @param  {PluginInfo}  plugin  A PluginInfo instance that represents plugin
 *   that will be installed.
 * @param  {Object}  podSpecs: the return value of plugin.getPodSpecs(self.platform)
 * @param  {Object}  frameworkPods: framework tags object with type === 'podspec'
 * @return  {Promise}  Return a promise
 */

Api.prototype.addPodSpecs = function (plugin, podSpecs, frameworkPods) {
    var self = this;

    var project_dir = self.locations.root;
    var project_name = self.locations.xcodeCordovaProj.split('/').pop();
    var minDeploymentTarget = self.getPlatformInfo().projectConfig.getPreference('deployment-target', 'ios');

    var Podfile = require('./lib/Podfile').Podfile;
    var PodsJson = require('./lib/PodsJson').PodsJson;
    var podsjsonFile = new PodsJson(path.join(project_dir, PodsJson.FILENAME));
    var podfileFile = new Podfile(path.join(project_dir, Podfile.FILENAME), project_name, minDeploymentTarget);

    if (podSpecs.length) {
        events.emit('verbose', 'Adding pods since the plugin contained <podspecs>');
        podSpecs.forEach(function (obj) {
            // declarations
            Object.keys(obj.declarations).forEach(function (key) {
                if (obj.declarations[key] === 'true') {
                    var declaration = Podfile.proofDeclaration(key);
                    var podJson = {
                        declaration: declaration
                    };
                    var val = podsjsonFile.getDeclaration(declaration);
                    if (val) {
                        podsjsonFile.incrementDeclaration(declaration);
                    } else {
                        podJson.count = 1;
                        podsjsonFile.setJsonDeclaration(declaration, podJson);
                        podfileFile.addDeclaration(podJson.declaration);
                    }
                }
            });
            // sources
            Object.keys(obj.sources).forEach(function (key) {
                var podJson = {
                    source: obj.sources[key].source
                };
                var val = podsjsonFile.getSource(key);
                if (val) {
                    podsjsonFile.incrementSource(key);
                } else {
                    podJson.count = 1;
                    podsjsonFile.setJsonSource(key, podJson);
                    podfileFile.addSource(podJson.source);
                }
            });
            // libraries
            Object.keys(obj.libraries).forEach(function (key) {
                var podJson = Object.assign({}, obj.libraries[key]);
                var val = podsjsonFile.getLibrary(key);
                if (val) {
                    events.emit('warn', plugin.id + ' depends on ' + podJson.name + ', which may conflict with another plugin. ' + podJson.name + '@' + val.spec + ' is already installed and was not overwritten.');
                    podsjsonFile.incrementLibrary(key);
                } else {
                    podJson.count = 1;
                    podsjsonFile.setJsonLibrary(key, podJson);
                    podfileFile.addSpec(podJson.name, podJson);
                }
            });

        });
    }

    if (frameworkPods.length) {
        events.emit('warn', '"framework" tag with type "podspec" is deprecated and will be removed. Please use the "podspec" tag.');
        events.emit('verbose', 'Adding pods since the plugin contained <framework>(s) with type="podspec"');
        frameworkPods.forEach(function (obj) {
            var podJson = {
                name: obj.src,
                type: obj.type,
                spec: obj.spec
            };

            var val = podsjsonFile.getLibrary(podJson.name);
            if (val) { // found
                if (podJson.spec !== val.spec) { // exists, different spec, print warning
                    events.emit('warn', plugin.id + ' depends on ' + podJson.name + '@' + podJson.spec + ', which conflicts with another plugin. ' + podJson.name + '@' + val.spec + ' is already installed and was not overwritten.');
                }
                // increment count, but don't add in Podfile because it already exists
                podsjsonFile.incrementLibrary(podJson.name);
            } else { // not found, write new
                podJson.count = 1;
                podsjsonFile.setJsonLibrary(podJson.name, podJson);
                // add to Podfile
                podfileFile.addSpec(podJson.name, podJson.spec);
            }
        });
    }

    if (podSpecs.length > 0 || frameworkPods.length > 0) {
        // now that all the pods have been processed, write to pods.json
        podsjsonFile.write();

        // only write and pod install if the Podfile changed
        if (podfileFile.isDirty()) {
            podfileFile.write();
            events.emit('verbose', 'Running `pod install` (to install plugins)');
            projectFile.purgeProjectFileCache(self.locations.root);

            return podfileFile.install(check_reqs.check_cocoapods)
                .then(function () {
                    return self.setSwiftVersionForCocoaPodsLibraries(podsjsonFile);
                });
        } else {
            events.emit('verbose', 'Podfile unchanged, skipping `pod install`');
        }
    }
    return Q.when();
};

/**
 * removing CocoaPods libraries
 *
 * @param  {PluginInfo}  plugin  A PluginInfo instance that represents plugin
 *   that will be installed.
 * @param  {Object}  podSpecs: the return value of plugin.getPodSpecs(self.platform)
 * @param  {Object}  frameworkPods: framework tags object with type === 'podspec'
 * @return  {Promise}  Return a promise
 */

Api.prototype.removePodSpecs = function (plugin, podSpecs, frameworkPods) {
    var self = this;

    var project_dir = self.locations.root;
    var project_name = self.locations.xcodeCordovaProj.split('/').pop();

    var Podfile = require('./lib/Podfile').Podfile;
    var PodsJson = require('./lib/PodsJson').PodsJson;
    var podsjsonFile = new PodsJson(path.join(project_dir, PodsJson.FILENAME));
    var podfileFile = new Podfile(path.join(project_dir, Podfile.FILENAME), project_name);

    if (podSpecs.length) {
        events.emit('verbose', 'Adding pods since the plugin contained <podspecs>');
        podSpecs.forEach(function (obj) {
            // declarations
            Object.keys(obj.declarations).forEach(function (key) {
                if (obj.declarations[key] === 'true') {
                    var declaration = Podfile.proofDeclaration(key);
                    var podJson = {
                        declaration: declaration
                    };
                    var val = podsjsonFile.getDeclaration(declaration);
                    if (val) {
                        podsjsonFile.decrementDeclaration(declaration);
                    } else {
                        var message = util.format('plugin \"%s\" declaration \"%s\" does not seem to be in pods.json, nothing to remove. Will attempt to remove from Podfile.', plugin.id, podJson.declaration); /* eslint no-useless-escape : 0 */
                        events.emit('verbose', message);
                    }
                    if (!val || val.count === 0) {
                        podfileFile.removeDeclaration(podJson.declaration);
                    }
                }
            });
            // sources
            Object.keys(obj.sources).forEach(function (key) {
                var podJson = {
                    source: obj.sources[key].source
                };
                var val = podsjsonFile.getSource(key);
                if (val) {
                    podsjsonFile.decrementSource(key);
                } else {
                    var message = util.format('plugin \"%s\" source \"%s\" does not seem to be in pods.json, nothing to remove. Will attempt to remove from Podfile.', plugin.id, podJson.source); /* eslint no-useless-escape : 0 */
                    events.emit('verbose', message);
                }
                if (!val || val.count === 0) {
                    podfileFile.removeSource(podJson.source);
                }
            });
            // libraries
            Object.keys(obj.libraries).forEach(function (key) {
                var podJson = Object.assign({}, obj.libraries[key]);
                var val = podsjsonFile.getLibrary(key);
                if (val) {
                    podsjsonFile.decrementLibrary(key);
                } else {
                    var message = util.format('plugin \"%s\" podspec \"%s\" does not seem to be in pods.json, nothing to remove. Will attempt to remove from Podfile.', plugin.id, podJson.name); /* eslint no-useless-escape : 0 */
                    events.emit('verbose', message);
                }
                if (!val || val.count === 0) {
                    podfileFile.removeSpec(podJson.name);
                }
            });

        });
    }

    if (frameworkPods.length) {
        events.emit('warn', '"framework" tag with type "podspec" is deprecated and will be removed. Please use the "podspec" tag.');
        events.emit('verbose', 'Adding pods since the plugin contained <framework>(s) with type=\"podspec\"'); /* eslint no-useless-escape : 0 */
        frameworkPods.forEach(function (obj) {
            var podJson = {
                name: obj.src,
                type: obj.type,
                spec: obj.spec
            };

            var val = podsjsonFile.getLibrary(podJson.name);
            if (val) { // found, decrement count
                podsjsonFile.decrementLibrary(podJson.name);
            } else { // not found (perhaps a sync error)
                var message = util.format('plugin \"%s\" podspec \"%s\" does not seem to be in pods.json, nothing to remove. Will attempt to remove from Podfile.', plugin.id, podJson.name); /* eslint no-useless-escape : 0 */
                events.emit('verbose', message);
            }

            // always remove from the Podfile
            podfileFile.removeSpec(podJson.name);
        });
    }

    if (podSpecs.length > 0 || frameworkPods.length > 0) {
        // now that all the pods have been processed, write to pods.json
        podsjsonFile.write();

        if (podfileFile.isDirty()) {
            podfileFile.write();
            events.emit('verbose', 'Running `pod install` (to uninstall pods)');

            return podfileFile.install(check_reqs.check_cocoapods)
                .then(function () {
                    return self.setSwiftVersionForCocoaPodsLibraries(podsjsonFile);
                });
        } else {
            events.emit('verbose', 'Podfile unchanged, skipping `pod install`');
        }
    }
    return Q.when();
};

/**
 * set Swift Version for all CocoaPods libraries
 *
 * @param  {PodsJson}  podsjsonFile  A PodsJson instance that represents pods.json
 */

Api.prototype.setSwiftVersionForCocoaPodsLibraries = function (podsjsonFile) {
    var self = this;
    var __dirty = false;
    return check_reqs.check_cocoapods().then(function (toolOptions) {
        if (toolOptions.ignore) {
            events.emit('verbose', '=== skip Swift Version Settings For Cocoapods Libraries');
        } else {
            var podPbxPath = path.join(self.root, 'Pods', 'Pods.xcodeproj', 'project.pbxproj');
            var podXcodeproj = xcode.project(podPbxPath);
            podXcodeproj.parseSync();
            var podTargets = podXcodeproj.pbxNativeTargetSection();
            var podConfigurationList = podXcodeproj.pbxXCConfigurationList();
            var podConfigs = podXcodeproj.pbxXCBuildConfigurationSection();

            var libraries = podsjsonFile.getLibraries();
            Object.keys(libraries).forEach(function (key) {
                var podJson = libraries[key];
                var name = podJson.name;
                var swiftVersion = podJson['swift-version'];
                if (swiftVersion) {
                    __dirty = true;
                    Object.keys(podTargets).filter(function (targetKey) {
                        return podTargets[targetKey].productName === name;
                    }).map(function (targetKey) {
                        return podTargets[targetKey].buildConfigurationList;
                    }).map(function (buildConfigurationListId) {
                        return podConfigurationList[buildConfigurationListId];
                    }).map(function (buildConfigurationList) {
                        return buildConfigurationList.buildConfigurations;
                    }).reduce(function (acc, buildConfigurations) {
                        return acc.concat(buildConfigurations);
                    }, []).map(function (buildConfiguration) {
                        return buildConfiguration.value;
                    }).forEach(function (buildId) {
                        __dirty = true;
                        podConfigs[buildId].buildSettings['SWIFT_VERSION'] = swiftVersion;
                    });
                }
            });
            if (__dirty) {
                fs.writeFileSync(podPbxPath, podXcodeproj.writeSync(), 'utf-8');
            }
        }
    });
};

/**
 * Builds an application package for current platform.
 *
 * @param  {Object}  buildOptions  A build options. This object's structure is
 *   highly depends on platform's specific. The most common options are:
 * @param  {Boolean}  buildOptions.debug  Indicates that packages should be
 *   built with debug configuration. This is set to true by default unless the
 *   'release' option is not specified.
 * @param  {Boolean}  buildOptions.release  Indicates that packages should be
 *   built with release configuration. If not set to true, debug configuration
 *   will be used.
 * @param   {Boolean}  buildOptions.device  Specifies that built app is intended
 *   to run on device
 * @param   {Boolean}  buildOptions.emulator: Specifies that built app is
 *   intended to run on emulator
 * @param   {String}  buildOptions.target  Specifies the device id that will be
 *   used to run built application.
 * @param   {Boolean}  buildOptions.nobuild  Indicates that this should be a
 *   dry-run call, so no build artifacts will be produced.
 * @param   {String[]}  buildOptions.archs  Specifies chip architectures which
 *   app packages should be built for. List of valid architectures is depends on
 *   platform.
 * @param   {String}  buildOptions.buildConfig  The path to build configuration
 *   file. The format of this file is depends on platform.
 * @param   {String[]} buildOptions.argv Raw array of command-line arguments,
 *   passed to `build` command. The purpose of this property is to pass a
 *   platform-specific arguments, and eventually let platform define own
 *   arguments processing logic.
 *
 * @return  {Promise}  Return a promise either fulfilled, or rejected with
 *   CordovaError instance.
 */
Api.prototype.build = function (buildOptions) {
    var self = this;
    return check_reqs.run()
        .then(function () {
            return require('./lib/build').run.call(self, buildOptions);
        });
};

/**
 * Builds an application package for current platform and runs it on
 *   specified/default device. If no 'device'/'emulator'/'target' options are
 *   specified, then tries to run app on default device if connected, otherwise
 *   runs the app on emulator.
 *
 * @param   {Object}  runOptions  An options object. The structure is the same
 *   as for build options.
 *
 * @return {Promise} A promise either fulfilled if package was built and ran
 *   successfully, or rejected with CordovaError.
 */
Api.prototype.run = function (runOptions) {
    var self = this;
    return check_reqs.run()
        .then(function () {
            return require('./lib/run').run.call(self, runOptions);
        });
};

/**
 * Cleans out the build artifacts from platform's directory.
 *
 * @return  {Promise}  Return a promise either fulfilled, or rejected with
 *   CordovaError.
 */
Api.prototype.clean = function (cleanOptions) {
    var self = this;
    return check_reqs.run()
        .then(function () {
            return require('./lib/clean').run.call(self, cleanOptions);
        })
        .then(function () {
            return require('./lib/prepare').clean.call(self, cleanOptions);
        });
};

/**
 * Performs a requirements check for current platform. Each platform defines its
 *   own set of requirements, which should be resolved before platform can be
 *   built successfully.
 *
 * @return  {Promise<Requirement[]>}  Promise, resolved with set of Requirement
 *   objects for current platform.
 */
Api.prototype.requirements = function () {
    return check_reqs.check_all();
};

module.exports = Api;
