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

const { superspawn: { spawn } } = require('cordova-common');

const DEVICE_REGEX = /-o (iPhone|iPad|iPod)@.*?"USB Serial Number" = "([^"]*)"/gs;

/**
 * Gets list of connected iOS devices
 * @return {Promise} Promise fulfilled with list of available iOS devices
 */
function listDevices () {
    return spawn('ioreg', ['-p', 'IOUSB', '-l'])
        .then(output => {
            return [...matchAll(output, DEVICE_REGEX)]
                .map(m => m.slice(1).reverse().join(' '));
        });
}

// TODO: Should be replaced with String#matchAll once available
function * matchAll (s, r) {
    let match;
    while ((match = r.exec(s))) yield match;
}

exports.run = listDevices;
