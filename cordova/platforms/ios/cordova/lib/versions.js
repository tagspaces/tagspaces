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

const {
    CordovaError,
    superspawn: { spawn }
} = require('cordova-common');
const semver = require('semver');

function fetchSdkVersionByType (sdkType) {
    return spawn('xcodebuild', ['-showsdks'])
        .then(output => {
            const regexSdk = new RegExp(`^${sdkType} \\d`);

            const versions = output.split('\n')
                .filter(line => line.trim().match(regexSdk))
                .map(line => line.match(/\d+\.\d+/)[0])
                .sort(exports.compareVersions);

            console.log(versions[0]);
        });
}

exports.get_apple_ios_version = () => {
    return fetchSdkVersionByType('iOS');
};

exports.get_apple_osx_version = () => {
    return fetchSdkVersionByType('macOS');
};

exports.get_apple_xcode_version = () => {
    return spawn('xcodebuild', ['-version'])
        .then(output => {
            const versionMatch = /Xcode (.*)/.exec(output);

            if (!versionMatch) return Promise.reject(output);

            return versionMatch[1];
        });
};

/**
 * Gets ios-deploy util version
 * @return {Promise} Promise that either resolved with ios-deploy version
 *                           or rejected in case of error
 */
exports.get_ios_deploy_version = () => {
    return spawn('ios-deploy', ['--version']);
};

/**
 * Gets pod (CocoaPods) util version
 * @return {Promise} Promise that either resolved with pod version
 *                           or rejected in case of error
 */
exports.get_cocoapods_version = () => {
    return spawn('pod', ['--version']);
};

/**
 * Gets ios-sim util version
 * @return {Promise} Promise that either resolved with ios-sim version
 *                           or rejected in case of error
 */
exports.get_ios_sim_version = () => {
    return spawn('ios-sim', ['--version']);
};

/**
 * Gets specific tool version
 * @param  {String} toolName Tool name to check. Known tools are 'xcodebuild', 'ios-sim' and 'ios-deploy'
 * @return {Promise}         Promise that either resolved with tool version
 *                                   or rejected in case of error
 */
exports.get_tool_version = toolName => {
    switch (toolName) {
    case 'xcodebuild': return exports.get_apple_xcode_version();
    case 'ios-sim': return exports.get_ios_sim_version();
    case 'ios-deploy': return exports.get_ios_deploy_version();
    case 'pod': return exports.get_cocoapods_version();
    default: return Promise.reject(new CordovaError(`${toolName} is not valid tool name. Valid names are: 'xcodebuild', 'ios-sim', 'ios-deploy', and 'pod'`));
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
