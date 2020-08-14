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
'use strict';

const fs = require('fs-extra');
const CordovaError = require('cordova-common').CordovaError;

function BridgingHeader (bridgingHeaderPath) {
    this.path = bridgingHeaderPath;
    this.bridgingHeaders = null;
    if (!fs.existsSync(this.path)) {
        throw new CordovaError('BridgingHeader.h is not found.');
    }
    this.bridgingHeaders = this.__parseForBridgingHeader(fs.readFileSync(this.path, 'utf8'));
}

BridgingHeader.prototype.addHeader = function (plugin_id, header_path) {
    this.bridgingHeaders.push({ type: 'code', code: `#import "${header_path}"\n` });
};

BridgingHeader.prototype.removeHeader = function (plugin_id, header_path) {
    this.bridgingHeaders = this.bridgingHeaders.filter(function (line) {
        if (this.found) {
            return true;
        }
        if (line.type === 'code') {
            const re = new RegExp(`#import\\s+"${preg_quote(header_path)}"(\\s*|\\s.+)(\\n|$)`);
            if (re.test(line.code)) {
                this.found = true;
                return false;
            }
        }
        return true;
    }, { found: false });
};

BridgingHeader.prototype.write = function () {
    const text = this.__stringifyForBridgingHeader(this.bridgingHeaders);
    fs.writeFileSync(this.path, text, 'utf8');
};

BridgingHeader.prototype.__stringifyForBridgingHeader = function (bridgingHeaders) {
    return bridgingHeaders.map(obj => obj.code).join('');
};

BridgingHeader.prototype.__parseForBridgingHeader = function (text) {
    let i = 0;
    const list = [];
    let type = 'code';
    let start = 0;
    while (i < text.length) {
        switch (type) {
        case 'comment':
            if (i + 1 < text.length && text[i] === '*' && text[i + 1] === '/') {
                i += 2;
                list.push({ type, code: text.slice(start, i) });
                type = 'code';
                start = i;
            } else {
                i += 1;
            }
            break;
        case 'line-comment':
            if (i < text.length && text[i] === '\n') {
                i += 1;
                list.push({ type, code: text.slice(start, i) });
                type = 'code';
                start = i;
            } else {
                i += 1;
            }
            break;
        case 'code':
        default:
            if (i + 1 < text.length && text[i] === '/' && text[i + 1] === '*') { // comment
                if (start < i) {
                    list.push({ type, code: text.slice(start, i) });
                }
                type = 'comment';
                start = i;
            } else if (i + 1 < text.length && text[i] === '/' && text[i + 1] === '/') { // line comment
                if (start < i) {
                    list.push({ type, code: text.slice(start, i) });
                }
                type = 'line-comment';
                start = i;
            } else if (i < text.length && text[i] === '\n') {
                i += 1;
                list.push({ type, code: text.slice(start, i) });
                start = i;
            } else {
                i += 1;
            }
            break;
        }
    }
    if (start < i) {
        list.push({ type, code: text.slice(start, i) });
    }
    return list;
};

function preg_quote (str, delimiter) {
    return (`${str}`).replace(new RegExp(`[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\${delimiter || ''}-]`, 'g'), '\\$&');
}

module.exports.BridgingHeader = BridgingHeader;
