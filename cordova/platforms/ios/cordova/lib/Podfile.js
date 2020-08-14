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
const path = require('path');
const util = require('util');
const {
    CordovaError,
    events,
    superspawn: { spawn }
} = require('cordova-common');

Podfile.FILENAME = 'Podfile';
Podfile.declarationRegexpMap = {
    'use_frameworks!': 'use[-_]frameworks!?',
    'inhibit_all_warnings!': 'inhibit[-_]all[-_]warnings!?'
};

function Podfile (podFilePath, projectName, minDeploymentTarget) {
    this.declarationToken = '##INSERT_DECLARATION##';
    this.sourceToken = '##INSERT_SOURCE##';
    this.podToken = '##INSERT_POD##';

    this.path = podFilePath;
    this.projectName = projectName;
    this.minDeploymentTarget = minDeploymentTarget || '11.0';
    this.contents = null;
    this.sources = null;
    this.declarations = null;
    this.pods = null;
    this.__dirty = false;

    // check whether it is named Podfile
    const filename = this.path.split(path.sep).pop();
    if (filename !== Podfile.FILENAME) {
        throw new CordovaError(util.format('Podfile: The file at %s is not `%s`.', this.path, Podfile.FILENAME));
    }

    if (!projectName) {
        throw new CordovaError('Podfile: The projectName was not specified in the constructor.');
    }

    if (!fs.existsSync(this.path)) {
        events.emit('verbose', util.format('Podfile: The file at %s does not exist.', this.path));
        events.emit('verbose', 'Creating new Podfile in platforms/ios');
        this.clear();
        this.write();
    } else {
        events.emit('verbose', 'Podfile found in platforms/ios');
        // parse for pods
        const fileText = fs.readFileSync(this.path, 'utf8');
        this.declarations = this.__parseForDeclarations(fileText);
        this.sources = this.__parseForSources(fileText);
        this.pods = this.__parseForPods(fileText);
    }
}

Podfile.prototype.__parseForDeclarations = function (text) {
    // split by \n
    const arr = text.split('\n');

    // getting lines between "platform :ios, '11.0'"" and "target 'HelloCordova'" do
    const declarationsPreRE = new RegExp('platform :ios,\\s+\'[^\']+\'');
    const declarationsPostRE = new RegExp('target\\s+\'[^\']+\'\\s+do');
    const declarationRE = new RegExp('^\\s*[^#]');

    return arr.reduce((acc, line) => {
        switch (acc.state) {
        case 0:
            if (declarationsPreRE.exec(line)) {
                acc.state = 1; // Start to read
            }
            break;
        case 1:
            if (declarationsPostRE.exec(line)) {
                acc.state = 2; // Finish to read
            } else {
                acc.lines.push(line);
            }
            break;
        case 2:
        default:
            // do nothing;
        }
        return acc;
    }, { state: 0, lines: [] })
        .lines
        .filter(line => declarationRE.exec(line))
        .reduce((obj, line) => {
            obj[line] = line;
            return obj;
        }, {});
};

Podfile.prototype.__parseForSources = function (text) {
    // split by \n
    const arr = text.split('\n');

    const sourceRE = new RegExp('source \'(.*)\'');
    return arr.filter(line => {
        const m = sourceRE.exec(line);

        return (m !== null);
    })
        .reduce((obj, line) => {
            const m = sourceRE.exec(line);
            if (m !== null) {
                const source = m[1];
                obj[source] = source;
            }
            return obj;
        }, {});
};

Podfile.prototype.__parseForPods = function (text) {
    // split by \n
    const arr = text.split('\n');

    // aim is to match (space insignificant around the comma, comma optional):
    //     pod 'Foobar', '1.2'
    //     pod 'Foobar', 'abc 123 1.2'
    //     pod 'PonyDebugger', :configurations => ['Debug', 'Beta']
    // var podRE = new RegExp('pod \'([^\']*)\'\\s*,?\\s*(.*)');
    const podRE = new RegExp('pod \'([^\']*)\'\\s*(?:,\\s*\'([^\']*)\'\\s*)?,?\\s*(.*)');

    // only grab lines that don't have the pod spec'
    return arr.filter(line => {
        const m = podRE.exec(line);

        return (m !== null);
    })
        .reduce((obj, line) => {
            const m = podRE.exec(line);

            if (m !== null) {
                const podspec = {
                    name: m[1]
                };
                if (m[2]) {
                    podspec.spec = m[2];
                }
                if (m[3]) {
                    podspec.options = m[3];
                }
                obj[m[1]] = podspec; // i.e pod 'Foo', '1.2' ==> { 'Foo' : '1.2'}
            }

            return obj;
        }, {});
};

Podfile.prototype.escapeSingleQuotes = function (string) {
    return string.replace(/'/g, '\\\'');
};

Podfile.prototype.getTemplate = function () {
    // Escaping possible ' in the project name
    const projectName = this.escapeSingleQuotes(this.projectName);
    return util.format(
        '# DO NOT MODIFY -- auto-generated by Apache Cordova\n' +
            '%s\n' +
            'platform :ios, \'%s\'\n' +
            '%s\n' +
            'target \'%s\' do\n' +
            '\tproject \'%s.xcodeproj\'\n' +
            '%s\n' +
            'end\n',
        this.sourceToken, this.minDeploymentTarget, this.declarationToken, projectName, projectName, this.podToken);
};

Podfile.prototype.addSpec = function (name, spec) {
    name = name || '';
    // optional
    spec = spec; /* eslint no-self-assign : 0 */

    if (!name.length) { // blank names are not allowed
        throw new CordovaError('Podfile addSpec: name is not specified.');
    }

    if (typeof spec === 'string') {
        if (spec.startsWith(':')) {
            spec = { name, options: spec };
        } else {
            spec = { name, spec };
        }
    }

    this.pods[name] = spec;
    this.__dirty = true;

    events.emit('verbose', util.format('Added pod line for `%s`', name));
};

Podfile.prototype.removeSpec = function (name) {
    if (this.existsSpec(name)) {
        delete this.pods[name];
        this.__dirty = true;
    }

    events.emit('verbose', util.format('Removed pod line for `%s`', name));
};

Podfile.prototype.getSpec = function (name) {
    return this.pods[name];
};

Podfile.prototype.existsSpec = function (name) {
    return (name in this.pods);
};

Podfile.prototype.addSource = function (src) {
    this.sources[src] = src;
    this.__dirty = true;

    events.emit('verbose', util.format('Added source line for `%s`', src));
};

Podfile.prototype.removeSource = function (src) {
    if (this.existsSource(src)) {
        delete this.sources[src];
        this.__dirty = true;
    }

    events.emit('verbose', util.format('Removed source line for `%s`', src));
};

Podfile.prototype.existsSource = function (src) {
    return (src in this.sources);
};

Podfile.prototype.addDeclaration = function (declaration) {
    this.declarations[declaration] = declaration;
    this.__dirty = true;

    events.emit('verbose', util.format('Added declaration line for `%s`', declaration));
};

Podfile.prototype.removeDeclaration = function (declaration) {
    if (this.existsDeclaration(declaration)) {
        delete this.declarations[declaration];
        this.__dirty = true;
    }

    events.emit('verbose', util.format('Removed source line for `%s`', declaration));
};

Podfile.proofDeclaration = declaration => {
    const list = Object.keys(Podfile.declarationRegexpMap).filter(key => {
        const regexp = new RegExp(Podfile.declarationRegexpMap[key]);
        return regexp.test(declaration);
    });
    if (list.length > 0) {
        return list[0];
    }
    return declaration;
};

Podfile.prototype.existsDeclaration = function (declaration) {
    return (declaration in this.declarations);
};

Podfile.prototype.clear = function () {
    this.sources = {};
    this.declarations = {};
    this.pods = {};
    this.__dirty = true;
};

Podfile.prototype.destroy = function () {
    fs.unlinkSync(this.path);
    events.emit('verbose', util.format('Deleted `%s`', this.path));
};

Podfile.prototype.write = function () {
    let text = this.getTemplate();

    const podsString =
    Object.keys(this.pods).map(key => {
        const name = key;
        const json = this.pods[key];

        if (typeof json === 'string') { // compatibility for using framework tag.
            const spec = json;
            if (spec.length) {
                if (spec.indexOf(':') === 0) {
                    // don't quote it, it's a specification (starts with ':')
                    return util.format('\tpod \'%s\', %s', name, spec);
                } else {
                    // quote it, it's a version
                    return util.format('\tpod \'%s\', \'%s\'', name, spec);
                }
            } else {
                return util.format('\tpod \'%s\'', name);
            }
        } else {
            const list = [`'${name}'`];
            if ('spec' in json && json.spec.length) {
                list.push(`'${json.spec}'`);
            }

            let options = ['tag', 'branch', 'commit', 'git', 'podspec']
                .filter(tag => tag in json)
                .map(tag => `:${tag} => '${json[tag]}'`);

            if ('configurations' in json) {
                options.push(`:configurations => [${json.configurations.split(',').map(conf => `'${conf.trim()}'`).join(',')}]`);
            }
            if ('options' in json) {
                options = [json.options];
            }
            if (options.length > 0) {
                list.push(options.join(', '));
            }
            return util.format('\tpod %s', list.join(', '));
        }
    }).join('\n');

    const sourcesString =
    Object.keys(this.sources).map(key => {
        const source = this.sources[key];
        return util.format('source \'%s\'', source);
    }).join('\n');

    const declarationString =
    Object.keys(this.declarations).map(key => {
        const declaration = this.declarations[key];
        return declaration;
    }).join('\n');

    text = text.replace(this.podToken, podsString)
        .replace(this.sourceToken, sourcesString)
        .replace(this.declarationToken, declarationString);

    fs.writeFileSync(this.path, text, 'utf8');
    this.__dirty = false;

    events.emit('verbose', 'Wrote to Podfile.');
};

Podfile.prototype.isDirty = function () {
    return this.__dirty;
};

Podfile.prototype.before_install = function (toolOptions) {
    toolOptions = toolOptions || {};

    // Template tokens in order: project name, project name, debug | release
    const template =
    '// DO NOT MODIFY -- auto-generated by Apache Cordova\n' +
    '#include "Pods/Target Support Files/Pods-%s/Pods-%s.%s.xcconfig"';

    const debugContents = util.format(template, this.projectName, this.projectName, 'debug');
    const releaseContents = util.format(template, this.projectName, this.projectName, 'release');

    const debugConfigPath = path.join(this.path, '..', 'pods-debug.xcconfig');
    const releaseConfigPath = path.join(this.path, '..', 'pods-release.xcconfig');

    fs.writeFileSync(debugConfigPath, debugContents, 'utf8');
    fs.writeFileSync(releaseConfigPath, releaseContents, 'utf8');

    return Promise.resolve(toolOptions);
};

Podfile.prototype.install = function (requirementsCheckerFunction) {
    const opts = {};
    opts.cwd = path.join(this.path, '..'); // parent path of this Podfile
    opts.stdio = 'pipe';
    opts.printCommand = true;
    let first = true;

    if (!requirementsCheckerFunction) {
        requirementsCheckerFunction = Promise.resolve();
    }

    return requirementsCheckerFunction()
        .then(toolOptions => this.before_install(toolOptions))
        .then(toolOptions => {
            if (toolOptions.ignore) {
                events.emit('verbose', '==== pod install start ====\n');
                events.emit('verbose', toolOptions.ignoreMessage);
                return Promise.resolve();
            } else {
                return spawn('pod', ['install', '--verbose'], opts)
                    .progress(stdio => {
                        if (stdio.stderr) { console.error(stdio.stderr); }
                        if (stdio.stdout) {
                            if (first) {
                                events.emit('verbose', '==== pod install start ====\n');
                                first = false;
                            }
                            events.emit('verbose', stdio.stdout);
                        }
                    });
            }
        })
        .then(() => { // done
            events.emit('verbose', '==== pod install end ====\n');
        });
};

module.exports.Podfile = Podfile;
