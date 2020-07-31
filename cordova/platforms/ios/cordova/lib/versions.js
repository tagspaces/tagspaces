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

var child_process = require('child_process');
var Q = require('q');
var semver = require('semver');

exports.get_apple_ios_version = function () {
    var d = Q.defer();
    child_process.exec('xcodebuild -showsdks', function (error, stdout, stderr) {
        if (error) {
            d.reject(stderr);
        } else {
            d.resolve(stdout);
        }
    });

    return d.promise.then(function (output) {
        var regex = /[0-9]*\.[0-9]*/;
        var versions = [];
        var regexIOS = /^iOS \d+/;
        output = output.split('\n');
        for (var i = 0; i < output.length; i++) {
            if (output[i].trim().match(regexIOS)) {
                versions[versions.length] = parseFloat(output[i].match(regex)[0]);
            }
        }
        versions.sort();
        console.log(versions[0]);
        return Q();
    }, function (stderr) {
        return Q.reject(stderr);
    });
};

exports.get_apple_osx_version = function () {
    var d = Q.defer();
    child_process.exec('xcodebuild -showsdks', function (error, stdout, stderr) {
        if (error) {
            d.reject(stderr);
        } else {
            d.resolve(stdout);
        }
    });

    return d.promise.then(function (output) {
        var regex = /[0-9]*\.[0-9]*/;
        var versions = [];
        var regexOSX = /^macOS \d+/;
        output = output.split('\n');
        for (var i = 0; i < output.length; i++) {
            if (output[i].trim().match(regexOSX)) {
                versions[versions.length] = parseFloat(output[i].match(regex)[0]);
            }
        }
        versions.sort();
        console.log(versions[0]);
        return Q();
    }, function (stderr) {
        return Q.reject(stderr);
    });
};

exports.get_apple_xcode_version = function () {
    var d = Q.defer();
    child_process.exec('xcodebuild -version', function (error, stdout, stderr) {
        var versionMatch = /Xcode (.*)/.exec(stdout);
        if (error || !versionMatch) {
            d.reject(stderr);
        } else {
            d.resolve(versionMatch[1]);
        }
    });
    return d.promise;
};

/**
 * Gets ios-deploy util version
 * @return {Promise} Promise that either resolved with ios-deploy version
 *                           or rejected in case of error
 */
exports.get_ios_deploy_version = function () {
    var d = Q.defer();
    child_process.exec('ios-deploy --version', function (error, stdout, stderr) {
        if (error) {
            d.reject(stderr);
        } else {
            d.resolve(stdout);
        }
    });
    return d.promise;
};

/**
 * Gets pod (CocoaPods) util version
 * @return {Promise} Promise that either resolved with pod version
 *                           or rejected in case of error
 */
exports.get_cocoapods_version = function () {
    var d = Q.defer();
    child_process.exec('pod --version', function (error, stdout, stderr) {
        if (error) {
            d.reject(stderr);
        } else {
            d.resolve(stdout);
        }
    });
    return d.promise;
};

/**
 * Gets ios-sim util version
 * @return {Promise} Promise that either resolved with ios-sim version
 *                           or rejected in case of error
 */
exports.get_ios_sim_version = function () {
    var d = Q.defer();
    child_process.exec('ios-sim --version', function (error, stdout, stderr) {
        if (error) {
            d.reject(stderr);
        } else {
            d.resolve(stdout);
        }
    });
    return d.promise;
};

/**
 * Gets specific tool version
 * @param  {String} toolName Tool name to check. Known tools are 'xcodebuild', 'ios-sim' and 'ios-deploy'
 * @return {Promise}         Promise that either resolved with tool version
 *                                   or rejected in case of error
 */
exports.get_tool_version = function (toolName) {
    switch (toolName) {
    case 'xcodebuild': return exports.get_apple_xcode_version();
    case 'ios-sim': return exports.get_ios_sim_version();
    case 'ios-deploy': return exports.get_ios_deploy_version();
    case 'pod': return exports.get_cocoapods_version();
    default: return Q.reject(toolName + ' is not valid tool name. Valid names are: \'xcodebuild\', \'ios-sim\', \'ios-deploy\', and \'pod\'');
    }
};

/**
 * Compares two version strings that can be coerced to semver.
 *
 * @param  {String} version1 Version to compare
 * @param  {String} version2 Another version to compare
 * @return {Number}          Negative number if first version is lower than the second,
 *                                    positive otherwise and 0 if versions are equal.
 */
exports.compareVersions = (...args) => {
    const coerceToSemverIfInvalid = v => {
        const semverVersion = semver.parse(v) || semver.coerce(v);
        if (!semverVersion) throw new TypeError(`Invalid Version: ${v}`);
        return semverVersion;
    };

    const semverVersions = args.map(coerceToSemverIfInvalid);
    return semver.compare(...semverVersions);
};
