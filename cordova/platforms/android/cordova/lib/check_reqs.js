#!/usr/bin/env node

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

/* jshint sub:true */

var shelljs = require('shelljs');
var child_process = require('child_process');
var Q = require('q');
var path = require('path');
var fs = require('fs');
var os = require('os');
var REPO_ROOT = path.join(__dirname, '..', '..', '..', '..');
var PROJECT_ROOT = path.join(__dirname, '..', '..');
var CordovaError = require('cordova-common').CordovaError;
var superspawn = require('cordova-common').superspawn;
var android_sdk = require('./android_sdk');

function forgivingWhichSync (cmd) {
    try {
        return fs.realpathSync(shelljs.which(cmd));
    } catch (e) {
        return '';
    }
}

module.exports.isWindows = function () {
    return (os.platform() === 'win32');
};

module.exports.isDarwin = function () {
    return (os.platform() === 'darwin');
};

// Get valid target from framework/project.properties if run from this repo
// Otherwise get target from project.properties file within a generated cordova-android project
module.exports.get_target = function () {
    function extractFromFile (filePath) {
        var target = shelljs.grep(/\btarget=/, filePath);
        if (!target) {
            throw new Error('Could not find android target within: ' + filePath);
        }
        return target.split('=')[1].trim();
    }
    var repo_file = path.join(REPO_ROOT, 'framework', 'project.properties');
    if (fs.existsSync(repo_file)) {
        return extractFromFile(repo_file);
    }
    var project_file = path.join(PROJECT_ROOT, 'project.properties');
    if (fs.existsSync(project_file)) {
        // if no target found, we're probably in a project and project.properties is in PROJECT_ROOT.
        return extractFromFile(project_file);
    }
    throw new Error('Could not find android target in either ' + repo_file + ' nor ' + project_file);
};

// Returns a promise. Called only by build and clean commands.
module.exports.check_ant = function () {
    return superspawn.spawn('ant', ['-version']).then(function (output) {
        // Parse Ant version from command output
        return /version ((?:\d+\.)+(?:\d+))/i.exec(output)[1];
    }).catch(function (err) {
        if (err) {
            throw new CordovaError('Failed to run `ant -version`. Make sure you have `ant` on your $PATH.');
        }
    });
};

module.exports.get_gradle_wrapper = function () {
    var androidStudioPath;
    var i = 0;
    var foundStudio = false;
    var program_dir;
    // OK, This hack only works on Windows, not on Mac OS or Linux.  We will be deleting this eventually!
    if (module.exports.isWindows()) {

        var result = child_process.spawnSync(path.join(__dirname, 'getASPath.bat'));
        // console.log('result.stdout =' + result.stdout.toString());
        // console.log('result.stderr =' + result.stderr.toString());

        if (result.stderr.toString().length > 0) {
            var androidPath = path.join(process.env['ProgramFiles'], 'Android') + '/';
            if (fs.existsSync(androidPath)) {
                program_dir = fs.readdirSync(androidPath);
                while (i < program_dir.length && !foundStudio) {
                    if (program_dir[i].startsWith('Android Studio')) {
                        foundStudio = true;
                        androidStudioPath = path.join(process.env['ProgramFiles'], 'Android', program_dir[i], 'gradle');
                    } else { ++i; }
                }
            }
        } else {
            // console.log('got android studio path from registry');
            // remove the (os independent) new line char at the end of stdout
            // add gradle to match the above.
            androidStudioPath = path.join(result.stdout.toString().split('\r\n')[0], 'gradle');
        }
    }

    if (androidStudioPath !== null && fs.existsSync(androidStudioPath)) {
        var dirs = fs.readdirSync(androidStudioPath);
        if (dirs[0].split('-')[0] === 'gradle') {
            return path.join(androidStudioPath, dirs[0], 'bin', 'gradle');
        }
    } else {
        // OK, let's try to check for Gradle!
        return forgivingWhichSync('gradle');
    }
};

// Returns a promise. Called only by build and clean commands.
module.exports.check_gradle = function () {
    var sdkDir = process.env['ANDROID_HOME'];
    var d = Q.defer();
    if (!sdkDir) {
        return Q.reject(new CordovaError('Could not find gradle wrapper within Android SDK. Could not find Android SDK directory.\n' +
            'Might need to install Android SDK or set up \'ANDROID_HOME\' env variable.'));
    }

    var gradlePath = module.exports.get_gradle_wrapper();
    if (gradlePath.length !== 0) { d.resolve(gradlePath); } else {
        d.reject(new CordovaError('Could not find an installed version of Gradle either in Android Studio,\n' +
                                'or on your system to install the gradle wrapper. Please include gradle \n' +
                                'in your path, or install Android Studio'));
    }
    return d.promise;
};

// Returns a promise.
module.exports.check_java = function () {
    var javacPath = forgivingWhichSync('javac');
    var hasJavaHome = !!process.env['JAVA_HOME'];
    return Q().then(function () {
        if (hasJavaHome) {
            // Windows java installer doesn't add javac to PATH, nor set JAVA_HOME (ugh).
            if (!javacPath) {
                process.env['PATH'] += path.delimiter + path.join(process.env['JAVA_HOME'], 'bin');
            }
        } else {
            if (javacPath) {
                // OS X has a command for finding JAVA_HOME.
                var find_java = '/usr/libexec/java_home';
                var default_java_error_msg = 'Failed to find \'JAVA_HOME\' environment variable. Try setting it manually.';
                if (fs.existsSync(find_java)) {
                    return superspawn.spawn(find_java).then(function (stdout) {
                        process.env['JAVA_HOME'] = stdout.trim();
                    }).catch(function (err) {
                        if (err) {
                            throw new CordovaError(default_java_error_msg);
                        }
                    });
                } else {
                    // See if we can derive it from javac's location.
                    // fs.realpathSync is require on Ubuntu, which symplinks from /usr/bin -> JDK
                    var maybeJavaHome = path.dirname(path.dirname(javacPath));
                    if (fs.existsSync(path.join(maybeJavaHome, 'lib', 'tools.jar'))) {
                        process.env['JAVA_HOME'] = maybeJavaHome;
                    } else {
                        throw new CordovaError(default_java_error_msg);
                    }
                }
            } else if (module.exports.isWindows()) {
                // Try to auto-detect java in the default install paths.
                var oldSilent = shelljs.config.silent;
                shelljs.config.silent = true;
                var firstJdkDir =
                    shelljs.ls(process.env['ProgramFiles'] + '\\java\\jdk*')[0] ||
                    shelljs.ls('C:\\Program Files\\java\\jdk*')[0] ||
                    shelljs.ls('C:\\Program Files (x86)\\java\\jdk*')[0];
                shelljs.config.silent = oldSilent;
                if (firstJdkDir) {
                    // shelljs always uses / in paths.
                    firstJdkDir = firstJdkDir.replace(/\//g, path.sep);
                    if (!javacPath) {
                        process.env['PATH'] += path.delimiter + path.join(firstJdkDir, 'bin');
                    }
                    process.env['JAVA_HOME'] = firstJdkDir;
                }
            }
        }
    }).then(function () {
        return Q.denodeify(child_process.exec)('javac -version')
            .then(outputs => {
                // outputs contains two entries: stdout and stderr
                // Java <= 8 writes version info to stderr, Java >= 9 to stdout
                const output = outputs.join('').trim();
                const match = /javac\s+([\d.]+)/i.exec(output);
                return match && match[1];
            }, () => {
                var msg =
                'Failed to run "javac -version", make sure that you have a JDK installed.\n' +
                'You can get it from: http://www.oracle.com/technetwork/java/javase/downloads.\n';
                if (process.env['JAVA_HOME']) {
                    msg += 'Your JAVA_HOME is invalid: ' + process.env['JAVA_HOME'] + '\n';
                }
                throw new CordovaError(msg);
            });
    });
};

// Returns a promise.
module.exports.check_android = function () {
    return Q().then(function () {
        var androidCmdPath = forgivingWhichSync('android');
        var adbInPath = forgivingWhichSync('adb');
        var avdmanagerInPath = forgivingWhichSync('avdmanager');
        var hasAndroidHome = !!process.env['ANDROID_HOME'] && fs.existsSync(process.env['ANDROID_HOME']);
        function maybeSetAndroidHome (value) {
            if (!hasAndroidHome && fs.existsSync(value)) {
                hasAndroidHome = true;
                process.env['ANDROID_HOME'] = value;
            }
        }
        // First ensure ANDROID_HOME is set
        // If we have no hints (nothing in PATH), try a few default locations
        if (!hasAndroidHome && !androidCmdPath && !adbInPath && !avdmanagerInPath) {
            if (module.exports.isWindows()) {
                // Android Studio 1.0 installer
                maybeSetAndroidHome(path.join(process.env['LOCALAPPDATA'], 'Android', 'sdk'));
                maybeSetAndroidHome(path.join(process.env['ProgramFiles'], 'Android', 'sdk'));
                // Android Studio pre-1.0 installer
                maybeSetAndroidHome(path.join(process.env['LOCALAPPDATA'], 'Android', 'android-studio', 'sdk'));
                maybeSetAndroidHome(path.join(process.env['ProgramFiles'], 'Android', 'android-studio', 'sdk'));
                // Stand-alone installer
                maybeSetAndroidHome(path.join(process.env['LOCALAPPDATA'], 'Android', 'android-sdk'));
                maybeSetAndroidHome(path.join(process.env['ProgramFiles'], 'Android', 'android-sdk'));
            } else if (module.exports.isDarwin()) {
                // Android Studio 1.0 installer
                maybeSetAndroidHome(path.join(process.env['HOME'], 'Library', 'Android', 'sdk'));
                // Android Studio pre-1.0 installer
                maybeSetAndroidHome('/Applications/Android Studio.app/sdk');
                // Stand-alone zip file that user might think to put under /Applications
                maybeSetAndroidHome('/Applications/android-sdk-macosx');
                maybeSetAndroidHome('/Applications/android-sdk');
            }
            if (process.env['HOME']) {
                // Stand-alone zip file that user might think to put under their home directory
                maybeSetAndroidHome(path.join(process.env['HOME'], 'android-sdk-macosx'));
                maybeSetAndroidHome(path.join(process.env['HOME'], 'android-sdk'));
            }
        }
        if (!hasAndroidHome) {
            // If we dont have ANDROID_HOME, but we do have some tools on the PATH, try to infer from the tooling PATH.
            var parentDir, grandParentDir;
            if (androidCmdPath) {
                parentDir = path.dirname(androidCmdPath);
                grandParentDir = path.dirname(parentDir);
                if (path.basename(parentDir) === 'tools' || fs.existsSync(path.join(grandParentDir, 'tools', 'android'))) {
                    maybeSetAndroidHome(grandParentDir);
                } else {
                    throw new CordovaError('Failed to find \'ANDROID_HOME\' environment variable. Try setting it manually.\n' +
                        'Detected \'android\' command at ' + parentDir + ' but no \'tools\' directory found near.\n' +
                        'Try reinstall Android SDK or update your PATH to include valid path to SDK' + path.sep + 'tools directory.');
                }
            }
            if (adbInPath) {
                parentDir = path.dirname(adbInPath);
                grandParentDir = path.dirname(parentDir);
                if (path.basename(parentDir) === 'platform-tools') {
                    maybeSetAndroidHome(grandParentDir);
                } else {
                    throw new CordovaError('Failed to find \'ANDROID_HOME\' environment variable. Try setting it manually.\n' +
                        'Detected \'adb\' command at ' + parentDir + ' but no \'platform-tools\' directory found near.\n' +
                        'Try reinstall Android SDK or update your PATH to include valid path to SDK' + path.sep + 'platform-tools directory.');
                }
            }
            if (avdmanagerInPath) {
                parentDir = path.dirname(avdmanagerInPath);
                grandParentDir = path.dirname(parentDir);
                if (path.basename(parentDir) === 'bin' && path.basename(grandParentDir) === 'tools') {
                    maybeSetAndroidHome(path.dirname(grandParentDir));
                } else {
                    throw new CordovaError('Failed to find \'ANDROID_HOME\' environment variable. Try setting it manually.\n' +
                        'Detected \'avdmanager\' command at ' + parentDir + ' but no \'tools' + path.sep + 'bin\' directory found near.\n' +
                        'Try reinstall Android SDK or update your PATH to include valid path to SDK' + path.sep + 'tools' + path.sep + 'bin directory.');
                }
            }
        }
        if (!process.env['ANDROID_HOME']) {
            throw new CordovaError('Failed to find \'ANDROID_HOME\' environment variable. Try setting it manually.\n' +
                'Failed to find \'android\' command in your \'PATH\'. Try update your \'PATH\' to include path to valid SDK directory.');
        }
        if (!fs.existsSync(process.env['ANDROID_HOME'])) {
            throw new CordovaError('\'ANDROID_HOME\' environment variable is set to non-existent path: ' + process.env['ANDROID_HOME'] +
                '\nTry update it manually to point to valid SDK directory.');
        }
        // Next let's make sure relevant parts of the SDK tooling is in our PATH
        if (hasAndroidHome && !androidCmdPath) {
            process.env['PATH'] += path.delimiter + path.join(process.env['ANDROID_HOME'], 'tools');
        }
        if (hasAndroidHome && !adbInPath) {
            process.env['PATH'] += path.delimiter + path.join(process.env['ANDROID_HOME'], 'platform-tools');
        }
        if (hasAndroidHome && !avdmanagerInPath) {
            process.env['PATH'] += path.delimiter + path.join(process.env['ANDROID_HOME'], 'tools', 'bin');
        }
        return hasAndroidHome;
    });
};

// TODO: is this actually needed?
module.exports.getAbsoluteAndroidCmd = function () {
    var cmd = forgivingWhichSync('android');
    if (cmd.length === 0) {
        cmd = forgivingWhichSync('sdkmanager');
    }
    if (module.exports.isWindows()) {
        return '"' + cmd + '"';
    }
    return cmd.replace(/(\s)/g, '\\$1');
};

module.exports.check_android_target = function (originalError) {
    // valid_target can look like:
    //   android-19
    //   android-L
    //   Google Inc.:Google APIs:20
    //   Google Inc.:Glass Development Kit Preview:20
    var desired_api_level = module.exports.get_target();
    return android_sdk.list_targets().then(function (targets) {
        if (targets.indexOf(desired_api_level) >= 0) {
            return targets;
        }
        var androidCmd = module.exports.getAbsoluteAndroidCmd();
        var msg = 'Please install Android target / API level: "' + desired_api_level + '".\n\n' +
            'Hint: Open the SDK manager by running: ' + androidCmd + '\n' +
            'You will require:\n' +
            '1. "SDK Platform" for API level ' + desired_api_level + '\n' +
            '2. "Android SDK Platform-tools (latest)\n' +
            '3. "Android SDK Build-tools" (latest)';
        if (originalError) {
            msg = originalError + '\n' + msg;
        }
        throw new CordovaError(msg);
    });
};

// Returns a promise.
module.exports.run = function () {
    return Q.all([this.check_java(), this.check_android()]).then(function (values) {
        console.log('ANDROID_HOME=' + process.env['ANDROID_HOME']);
        console.log('JAVA_HOME=' + process.env['JAVA_HOME']);

        if (!String(values[0]).startsWith('1.8.')) {
            throw new CordovaError('Requirements check failed for JDK 1.8');
        }

        if (!values[1]) {
            throw new CordovaError('Requirements check failed for Android SDK');
        }
    });
};

/**
 * Object thar represents one of requirements for current platform.
 * @param {String} id         The unique identifier for this requirements.
 * @param {String} name       The name of requirements. Human-readable field.
 * @param {String} version    The version of requirement installed. In some cases could be an array of strings
 *                            (for example, check_android_target returns an array of android targets installed)
 * @param {Boolean} installed Indicates whether the requirement is installed or not
 */
var Requirement = function (id, name, version, installed) {
    this.id = id;
    this.name = name;
    this.installed = installed || false;
    this.metadata = {
        version: version
    };
};

/**
 * Methods that runs all checks one by one and returns a result of checks
 * as an array of Requirement objects. This method intended to be used by cordova-lib check_reqs method
 *
 * @return Promise<Requirement[]> Array of requirements. Due to implementation, promise is always fulfilled.
 */
module.exports.check_all = function () {

    var requirements = [
        new Requirement('java', 'Java JDK'),
        new Requirement('androidSdk', 'Android SDK'),
        new Requirement('androidTarget', 'Android target'),
        new Requirement('gradle', 'Gradle')
    ];

    var checkFns = [
        this.check_java,
        this.check_android,
        this.check_android_target,
        this.check_gradle
    ];

    // Then execute requirement checks one-by-one
    return checkFns.reduce(function (promise, checkFn, idx) {
        // Update each requirement with results
        var requirement = requirements[idx];
        return promise.then(checkFn).then(function (version) {
            requirement.installed = true;
            requirement.metadata.version = version;
        }, function (err) {
            requirement.metadata.reason = err instanceof Error ? err.message : err;
        });
    }, Q()).then(function () {
        // When chain is completed, return requirements array to upstream API
        return requirements;
    });
};
