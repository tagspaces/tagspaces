/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var Q = require('q');
var path = require('path');
var shell = require('shelljs');
var superspawn = require('cordova-common').superspawn;
var fs = require('fs');
var plist = require('plist');
var util = require('util');

var check_reqs = require('./check_reqs');
var projectFile = require('./projectFile');

var events = require('cordova-common').events;

// These are regular expressions to detect if the user is changing any of the built-in xcodebuildArgs
/* eslint-disable no-useless-escape */
var buildFlagMatchers = {
    'workspace': /^\-workspace\s*(.*)/,
    'scheme': /^\-scheme\s*(.*)/,
    'configuration': /^\-configuration\s*(.*)/,
    'sdk': /^\-sdk\s*(.*)/,
    'destination': /^\-destination\s*(.*)/,
    'archivePath': /^\-archivePath\s*(.*)/,
    'configuration_build_dir': /^(CONFIGURATION_BUILD_DIR=.*)/,
    'shared_precomps_dir': /^(SHARED_PRECOMPS_DIR=.*)/
};
/* eslint-enable no-useless-escape */

/**
 * Creates a project object (see projectFile.js/parseProjectFile) from
 * a project path and name
 *
 * @param {*} projectPath
 * @param {*} projectName
 */
function createProjectObject (projectPath, projectName) {
    var locations = {
        root: projectPath,
        pbxproj: path.join(projectPath, projectName + '.xcodeproj', 'project.pbxproj')
    };

    return projectFile.parse(locations);
}

/**
 * Gets the resolved bundle identifier from a project.
 * Resolves the variable set in INFO.plist, if any (simple case)
 *
 * @param {*} projectObject
 */
function getBundleIdentifier (projectObject) {
    var packageName = projectObject.getPackageName();
    var bundleIdentifier = packageName;

    var variables = packageName.match(/\$\((\w+)\)/); // match $(VARIABLE), if any
    if (variables && variables.length >= 2) {
        bundleIdentifier = projectObject.xcode.getBuildProperty(variables[1]);
    }

    return bundleIdentifier;
}

/**
 * Returns a promise that resolves to the default simulator target; the logic here
 * matches what `cordova emulate ios` does.
 *
 * The return object has two properties: `name` (the Xcode destination name),
 * `identifier` (the simctl identifier), and `simIdentifier` (essentially the cordova emulate target)
 *
 * @return {Promise}
 */
function getDefaultSimulatorTarget () {
    return require('./list-emulator-build-targets').run()
        .then(function (emulators) {
            var targetEmulator;
            if (emulators.length > 0) {
                targetEmulator = emulators[0];
            }
            emulators.forEach(function (emulator) {
                if (emulator.name.indexOf('iPhone') === 0) {
                    targetEmulator = emulator;
                }
            });
            return targetEmulator;
        });
}

module.exports.run = function (buildOpts) {
    var emulatorTarget = '';
    var projectPath = path.join(__dirname, '..', '..');
    var projectName = '';

    buildOpts = buildOpts || {};

    if (buildOpts.debug && buildOpts.release) {
        return Q.reject('Cannot specify "debug" and "release" options together.');
    }

    if (buildOpts.device && buildOpts.emulator) {
        return Q.reject('Cannot specify "device" and "emulator" options together.');
    }

    if (buildOpts.buildConfig) {
        if (!fs.existsSync(buildOpts.buildConfig)) {
            return Q.reject('Build config file does not exist: ' + buildOpts.buildConfig);
        }
        events.emit('log', 'Reading build config file: ' + path.resolve(buildOpts.buildConfig));
        var contents = fs.readFileSync(buildOpts.buildConfig, 'utf-8');
        var buildConfig = JSON.parse(contents.replace(/^\ufeff/, '')); // Remove BOM
        if (buildConfig.ios) {
            var buildType = buildOpts.release ? 'release' : 'debug';
            var config = buildConfig.ios[buildType];
            if (config) {
                ['codeSignIdentity', 'codeSignResourceRules', 'provisioningProfile', 'developmentTeam', 'packageType', 'buildFlag', 'iCloudContainerEnvironment', 'automaticProvisioning'].forEach(
                    function (key) {
                        buildOpts[key] = buildOpts[key] || config[key];
                    });
            }
        }
    }

    return require('./list-devices').run()
        .then(function (devices) {
            if (devices.length > 0 && !(buildOpts.emulator)) {
                // we also explicitly set device flag in options as we pass
                // those parameters to other api (build as an example)
                buildOpts.device = true;
                return check_reqs.check_ios_deploy();
            }
        }).then(function () {
            // CB-12287: Determine the device we should target when building for a simulator
            if (!buildOpts.device) {
                var newTarget = buildOpts.target || '';

                if (newTarget) {
                    // only grab the device name, not the runtime specifier
                    newTarget = newTarget.split(',')[0];
                }
                // a target was given to us, find the matching Xcode destination name
                var promise = require('./list-emulator-build-targets').targetForSimIdentifier(newTarget);
                return promise.then(function (theTarget) {
                    if (!theTarget) {
                        return getDefaultSimulatorTarget().then(function (defaultTarget) {
                            emulatorTarget = defaultTarget.name;
                            events.emit('warn', `No simulator found for "${newTarget}. Falling back to the default target.`);
                            events.emit('log', `Building for "${emulatorTarget}" Simulator (${defaultTarget.identifier}, ${defaultTarget.simIdentifier}).`);
                            return emulatorTarget;
                        });
                    } else {
                        emulatorTarget = theTarget.name;
                        events.emit('log', `Building for "${emulatorTarget}" Simulator (${theTarget.identifier}, ${theTarget.simIdentifier}).`);
                        return emulatorTarget;
                    }
                });
            }
        }).then(function () {
            return check_reqs.run();
        }).then(function () {
            return findXCodeProjectIn(projectPath);
        }).then(function (name) {
            projectName = name;
            var extraConfig = '';
            if (buildOpts.codeSignIdentity) {
                extraConfig += 'CODE_SIGN_IDENTITY = ' + buildOpts.codeSignIdentity + '\n';
                extraConfig += 'CODE_SIGN_IDENTITY[sdk=iphoneos*] = ' + buildOpts.codeSignIdentity + '\n';
            }
            if (buildOpts.codeSignResourceRules) {
                extraConfig += 'CODE_SIGN_RESOURCE_RULES_PATH = ' + buildOpts.codeSignResourceRules + '\n';
            }
            if (buildOpts.provisioningProfile) {
                extraConfig += 'PROVISIONING_PROFILE = ' + buildOpts.provisioningProfile + '\n';
            }
            if (buildOpts.developmentTeam) {
                extraConfig += 'DEVELOPMENT_TEAM = ' + buildOpts.developmentTeam + '\n';
            }

            function writeCodeSignStyle (value) {
                var project = createProjectObject(projectPath, projectName);

                events.emit('verbose', `Set CODE_SIGN_STYLE Build Property to ${value}.`);
                project.xcode.updateBuildProperty('CODE_SIGN_STYLE', value);
                events.emit('verbose', `Set ProvisioningStyle Target Attribute to ${value}.`);
                project.xcode.addTargetAttribute('ProvisioningStyle', value);

                project.write();
            }

            if (buildOpts.provisioningProfile) {
                events.emit('verbose', 'ProvisioningProfile build option set, changing project settings to Manual.');
                writeCodeSignStyle('Manual');
            } else if (buildOpts.automaticProvisioning) {
                events.emit('verbose', 'ProvisioningProfile build option NOT set, changing project settings to Automatic.');
                writeCodeSignStyle('Automatic');
            }

            return Q.nfcall(fs.writeFile, path.join(__dirname, '..', 'build-extras.xcconfig'), extraConfig, 'utf-8');
        }).then(function () {
            var configuration = buildOpts.release ? 'Release' : 'Debug';

            events.emit('log', 'Building project: ' + path.join(projectPath, projectName + '.xcworkspace'));
            events.emit('log', '\tConfiguration: ' + configuration);
            events.emit('log', '\tPlatform: ' + (buildOpts.device ? 'device' : 'emulator'));
            events.emit('log', '\tTarget: ' + emulatorTarget);

            var buildOutputDir = path.join(projectPath, 'build', (buildOpts.device ? 'device' : 'emulator'));

            // remove the build/device folder before building
            shell.rm('-rf', buildOutputDir);

            var xcodebuildArgs = getXcodeBuildArgs(projectName, projectPath, configuration, buildOpts.device, buildOpts.buildFlag, emulatorTarget, buildOpts.automaticProvisioning);
            return superspawn.spawn('xcodebuild', xcodebuildArgs, { cwd: projectPath, printCommand: true, stdio: 'inherit' });

        }).then(function () {
            if (!buildOpts.device || buildOpts.noSign) {
                return;
            }

            var project = createProjectObject(projectPath, projectName);
            var bundleIdentifier = getBundleIdentifier(project);
            var exportOptions = { 'compileBitcode': false, 'method': 'development' };

            if (buildOpts.packageType) {
                exportOptions.method = buildOpts.packageType;
            }

            if (buildOpts.iCloudContainerEnvironment) {
                exportOptions.iCloudContainerEnvironment = buildOpts.iCloudContainerEnvironment;
            }

            if (buildOpts.developmentTeam) {
                exportOptions.teamID = buildOpts.developmentTeam;
            }

            if (buildOpts.provisioningProfile && bundleIdentifier) {
                exportOptions.provisioningProfiles = { [ bundleIdentifier ]: String(buildOpts.provisioningProfile) };
                exportOptions.signingStyle = 'manual';
            }

            if (buildOpts.codeSignIdentity) {
                exportOptions.signingCertificate = buildOpts.codeSignIdentity;
            }

            var exportOptionsPlist = plist.build(exportOptions);
            var exportOptionsPath = path.join(projectPath, 'exportOptions.plist');

            var buildOutputDir = path.join(projectPath, 'build', 'device');

            function checkSystemRuby () {
                var ruby_cmd = shell.which('ruby');

                if (ruby_cmd !== '/usr/bin/ruby') {
                    events.emit('warn', 'Non-system Ruby in use. This may cause packaging to fail.\n' +
                  'If you use RVM, please run `rvm use system`.\n' +
                  'If you use chruby, please run `chruby system`.');
                }
            }

            function packageArchive () {
                var xcodearchiveArgs = getXcodeArchiveArgs(projectName, projectPath, buildOutputDir, exportOptionsPath, buildOpts.automaticProvisioning);
                return superspawn.spawn('xcodebuild', xcodearchiveArgs, { cwd: projectPath, printCommand: true, stdio: 'inherit' });
            }

            return Q.nfcall(fs.writeFile, exportOptionsPath, exportOptionsPlist, 'utf-8')
                .then(checkSystemRuby)
                .then(packageArchive);
        });
};

/**
 * Searches for first XCode project in specified folder
 * @param  {String} projectPath Path where to search project
 * @return {Promise}            Promise either fulfilled with project name or rejected
 */
function findXCodeProjectIn (projectPath) {
    // 'Searching for Xcode project in ' + projectPath);
    var xcodeProjFiles = shell.ls(projectPath).filter(function (name) {
        return path.extname(name) === '.xcodeproj';
    });

    if (xcodeProjFiles.length === 0) {
        return Q.reject('No Xcode project found in ' + projectPath);
    }
    if (xcodeProjFiles.length > 1) {
        events.emit('warn', 'Found multiple .xcodeproj directories in \n' +
            projectPath + '\nUsing first one');
    }

    var projectName = path.basename(xcodeProjFiles[0], '.xcodeproj');
    return Q.resolve(projectName);
}

module.exports.findXCodeProjectIn = findXCodeProjectIn;

/**
 * Returns array of arguments for xcodebuild
 * @param  {String}  projectName    Name of xcode project
 * @param  {String}  projectPath    Path to project file. Will be used to set CWD for xcodebuild
 * @param  {String}  configuration  Configuration name: debug|release
 * @param  {Boolean} isDevice       Flag that specify target for package (device/emulator)
 * @param  {Array}   buildFlags
 * @param  {String}  emulatorTarget Target for emulator (rather than default)
 * @param  {Boolean} autoProvisioning   Whether to allow Xcode to automatically update provisioning
 * @return {Array}                  Array of arguments that could be passed directly to spawn method
 */
function getXcodeBuildArgs (projectName, projectPath, configuration, isDevice, buildFlags, emulatorTarget, autoProvisioning) {
    var xcodebuildArgs;
    var options;
    var buildActions;
    var settings;
    var customArgs = {};
    customArgs.otherFlags = [];

    if (buildFlags) {
        if (typeof buildFlags === 'string' || buildFlags instanceof String) {
            parseBuildFlag(buildFlags, customArgs);
        } else { // buildFlags is an Array of strings
            buildFlags.forEach(function (flag) {
                parseBuildFlag(flag, customArgs);
            });
        }
    }

    if (isDevice) {
        options = [
            '-workspace', customArgs.workspace || projectName + '.xcworkspace',
            '-scheme', customArgs.scheme || projectName,
            '-configuration', customArgs.configuration || configuration,
            '-destination', customArgs.destination || 'generic/platform=iOS',
            '-archivePath', customArgs.archivePath || projectName + '.xcarchive'
        ];
        buildActions = [ 'archive' ];
        settings = [
            customArgs.configuration_build_dir || 'CONFIGURATION_BUILD_DIR=' + path.join(projectPath, 'build', 'device'),
            customArgs.shared_precomps_dir || 'SHARED_PRECOMPS_DIR=' + path.join(projectPath, 'build', 'sharedpch')
        ];
        // Add other matched flags to otherFlags to let xcodebuild present an appropriate error.
        // This is preferable to just ignoring the flags that the user has passed in.
        if (customArgs.sdk) {
            customArgs.otherFlags = customArgs.otherFlags.concat(['-sdk', customArgs.sdk]);
        }

        if (autoProvisioning) {
            options = options.concat(['-allowProvisioningUpdates']);
        }
    } else { // emulator
        options = [
            '-workspace', customArgs.project || projectName + '.xcworkspace',
            '-scheme', customArgs.scheme || projectName,
            '-configuration', customArgs.configuration || configuration,
            '-sdk', customArgs.sdk || 'iphonesimulator',
            '-destination', customArgs.destination || 'platform=iOS Simulator,name=' + emulatorTarget
        ];
        buildActions = [ 'build' ];
        settings = [
            customArgs.configuration_build_dir || 'CONFIGURATION_BUILD_DIR=' + path.join(projectPath, 'build', 'emulator'),
            customArgs.shared_precomps_dir || 'SHARED_PRECOMPS_DIR=' + path.join(projectPath, 'build', 'sharedpch')
        ];
        // Add other matched flags to otherFlags to let xcodebuild present an appropriate error.
        // This is preferable to just ignoring the flags that the user has passed in.
        if (customArgs.archivePath) {
            customArgs.otherFlags = customArgs.otherFlags.concat(['-archivePath', customArgs.archivePath]);
        }
    }
    xcodebuildArgs = options.concat(buildActions).concat(settings).concat(customArgs.otherFlags);
    return xcodebuildArgs;
}

/**
 * Returns array of arguments for xcodebuild
 * @param  {String}  projectName        Name of xcode project
 * @param  {String}  projectPath        Path to project file. Will be used to set CWD for xcodebuild
 * @param  {String}  outputPath         Output directory to contain the IPA
 * @param  {String}  exportOptionsPath  Path to the exportOptions.plist file
 * @param  {Boolean} autoProvisioning   Whether to allow Xcode to automatically update provisioning
 * @return {Array}                      Array of arguments that could be passed directly to spawn method
 */
function getXcodeArchiveArgs (projectName, projectPath, outputPath, exportOptionsPath, autoProvisioning) {
    return [
        '-exportArchive',
        '-archivePath', projectName + '.xcarchive',
        '-exportOptionsPlist', exportOptionsPath,
        '-exportPath', outputPath
    ].concat(autoProvisioning ? ['-allowProvisioningUpdates'] : []);
}

function parseBuildFlag (buildFlag, args) {
    var matched;
    for (var key in buildFlagMatchers) {
        var found = buildFlag.match(buildFlagMatchers[key]);
        if (found) {
            matched = true;
            // found[0] is the whole match, found[1] is the first match in parentheses.
            args[key] = found[1];
            events.emit('warn', util.format('Overriding xcodebuildArg: %s', buildFlag));
        }
    }

    if (!matched) {
        // If the flag starts with a '-' then it is an xcodebuild built-in option or a
        // user-defined setting. The regex makes sure that we don't split a user-defined
        // setting that is wrapped in quotes.
        /* eslint-disable no-useless-escape */
        if (buildFlag[0] === '-' && !buildFlag.match(/^.*=(\".*\")|(\'.*\')$/)) {
            args.otherFlags = args.otherFlags.concat(buildFlag.split(' '));
            events.emit('warn', util.format('Adding xcodebuildArg: %s', buildFlag.split(' ')));
        } else {
            args.otherFlags.push(buildFlag);
            events.emit('warn', util.format('Adding xcodebuildArg: %s', buildFlag));
        }
    }
}

// help/usage function
module.exports.help = function help () {
    console.log('');
    console.log('Usage: build [--debug | --release] [--archs=\"<list of architectures...>\"]');
    console.log('             [--device | --simulator] [--codeSignIdentity=\"<identity>\"]');
    console.log('             [--codeSignResourceRules=\"<resourcerules path>\"]');
    console.log('             [--developmentTeam=\"<Team ID>\"]');
    console.log('             [--provisioningProfile=\"<provisioning profile>\"]');
    console.log('    --help                  : Displays this dialog.');
    console.log('    --debug                 : Builds project in debug mode. (Default)');
    console.log('    --release               : Builds project in release mode.');
    console.log('    -r                      : Shortcut :: builds project in release mode.');
    /* eslint-enable no-useless-escape */
    // TODO: add support for building different archs
    // console.log("    --archs   : Builds project binaries for specific chip architectures (`anycpu`, `arm`, `x86`, `x64`).");
    console.log('    --device, --simulator');
    console.log('                            : Specifies, what type of project to build');
    console.log('    --codeSignIdentity      : Type of signing identity used for code signing.');
    console.log('    --codeSignResourceRules : Path to ResourceRules.plist.');
    console.log('    --developmentTeam       : New for Xcode 8. The development team (Team ID)');
    console.log('                              to use for code signing.');
    console.log('    --provisioningProfile   : UUID of the profile.');
    console.log('    --device --noSign       : Builds project without application signing.');
    console.log('');
    console.log('examples:');
    console.log('    build ');
    console.log('    build --debug');
    console.log('    build --release');
    console.log('    build --codeSignIdentity="iPhone Distribution" --provisioningProfile="926c2bd6-8de9-4c2f-8407-1016d2d12954"');
    // TODO: add support for building different archs
    // console.log("    build --release --archs=\"armv7\"");
    console.log('');
    process.exit(0);
};
