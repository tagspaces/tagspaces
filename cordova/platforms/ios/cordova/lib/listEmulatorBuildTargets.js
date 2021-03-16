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

const { superspawn: { spawn }, events } = require('cordova-common');

/**
 * Returns a list of available simulator build targets of the form
 *
 *     [
 *         { name: <xcode-destination-name>,
 *           identifier: <simctl-identifier>,
 *           simIdentifier: <cordova emulate target>
 *         }
 *     ]
 *
 */
function listEmulatorBuildTargets () {
    events.emit('log', 'List simulator targets');
    return spawn('xcrun', ['simctl', 'list', '--json'], { printCommand: true })
        .then(output => JSON.parse(output))
        .then(function (simInfo) {
            var devices = simInfo.devices;
            var deviceTypes = simInfo.devicetypes;
            return deviceTypes.reduce(function (typeAcc, deviceType) {
                if (!deviceType.name.match(/^[iPad|iPhone]/)) {
                // ignore targets we don't support (like Apple Watch or Apple TV)
                    return typeAcc;
                }
                var availableDevices = Object.keys(devices).reduce(function (availAcc, deviceCategory) {
                    var availableDevicesInCategory = devices[deviceCategory];
                    availableDevicesInCategory.forEach(function (device) {
                        if (device.name === deviceType.name || device.name === deviceType.name.replace(/-inch/g, ' inch')) {
                        // Check new flag isAvailable (XCode 10.1+) or legacy string availability (XCode 10 and lower)
                            if (device.isAvailable || (device.availability && device.availability.toLowerCase().indexOf('unavailable') < 0)) {
                                availAcc.push(device);
                            }
                        }
                    });
                    return availAcc;
                }, []);
                // we only want device types that have at least one available device
                // (regardless of OS); this filters things out like iPhone 4s, which
                // is present in deviceTypes, but probably not available on the user's
                // system.
                if (availableDevices.length > 0) {
                    typeAcc.push(deviceType);
                }
                return typeAcc;
            }, []);
        })
        .then(function (filteredTargets) {
        // the simIdentifier, or cordova emulate target name, is the very last part
        // of identifier.
            return filteredTargets.map(function (target) {
                var identifierPieces = target.identifier.split('.');
                target.simIdentifier = identifierPieces[identifierPieces.length - 1];
                return target;
            });
        });
}

exports.run = listEmulatorBuildTargets;

/**
 * Given a simIdentifier, return the matching target.
 *
 * @param {string} simIdentifier       a target, like "iPhone-SE"
 * @return {Object}                    the matching target, or undefined if no match
 */
exports.targetForSimIdentifier = function (simIdentifier) {
    return listEmulatorBuildTargets()
        .then(function (targets) {
            return targets.reduce(function (acc, target) {
                if (!acc && target.simIdentifier.toLowerCase() === simIdentifier.toLowerCase()) {
                    acc = target;
                }
                return acc;
            }, undefined);
        });
};
