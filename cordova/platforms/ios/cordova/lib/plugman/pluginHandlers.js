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
const events = require('cordova-common').events;
const CordovaError = require('cordova-common').CordovaError;

// These frameworks are required by cordova-ios by default. We should never add/remove them.
const keep_these_frameworks = [
    'MobileCoreServices.framework',
    'CoreGraphics.framework',
    'AssetsLibrary.framework'
];

const handlers = {
    'source-file': {
        install: function (obj, plugin, project, options) {
            installHelper('source-file', obj, plugin.dir, project.projectDir, plugin.id, options, project);
        },
        uninstall: function (obj, plugin, project, options) {
            uninstallHelper('source-file', obj, project.projectDir, plugin.id, options, project);
        }
    },
    'header-file': {
        install: function (obj, plugin, project, options) {
            installHelper('header-file', obj, plugin.dir, project.projectDir, plugin.id, options, project);
        },
        uninstall: function (obj, plugin, project, options) {
            uninstallHelper('header-file', obj, project.projectDir, plugin.id, options, project);
        }
    },
    'resource-file': {
        install: function (obj, plugin, project, options) {
            const src = obj.src;
            let target = obj.target;
            const srcFile = path.resolve(plugin.dir, src);

            if (!target) {
                target = path.basename(src);
            }
            const destFile = path.resolve(project.resources_dir, target);

            if (!fs.existsSync(srcFile)) {
                throw new CordovaError(`Cannot find resource file "${srcFile}" for plugin ${plugin.id} in iOS platform`);
            }
            if (fs.existsSync(destFile)) {
                throw new CordovaError(`File already exists at destination "${destFile}" for resource file specified by plugin ${plugin.id} in iOS platform`);
            }
            project.xcode.addResourceFile(path.join('Resources', target));
            const link = !!(options && options.link);
            copyFile(plugin.dir, src, project.projectDir, destFile, link);
        },
        uninstall: function (obj, plugin, project, options) {
            const src = obj.src;
            let target = obj.target;

            if (!target) {
                target = path.basename(src);
            }
            const destFile = path.resolve(project.resources_dir, target);

            project.xcode.removeResourceFile(path.join('Resources', target));
            fs.removeSync(destFile);
        }
    },
    framework: { // CB-5238 custom frameworks only
        install: function (obj, plugin, project, options) {
            const src = obj.src;
            const custom = !!(obj.custom); // convert to boolean (if truthy/falsy)
            const embed = !!(obj.embed); // convert to boolean (if truthy/falsy)
            const link = !embed; // either link or embed can be true, but not both. the other has to be false

            if (!custom) {
                const keepFrameworks = keep_these_frameworks;

                if (keepFrameworks.indexOf(src) < 0) {
                    if (obj.type === 'podspec') {
                        // podspec handled in Api.js
                    } else {
                        project.frameworks[src] = project.frameworks[src] || 0;
                        project.frameworks[src]++;
                        const opt = { customFramework: false, embed: false, link: true, weak: obj.weak };
                        events.emit('verbose', util.format('Adding non-custom framework to project... %s -> %s', src, JSON.stringify(opt)));
                        project.xcode.addFramework(src, opt);
                        events.emit('verbose', util.format('Non-custom framework added to project. %s -> %s', src, JSON.stringify(opt)));
                    }
                }
                return;
            }
            const srcFile = path.resolve(plugin.dir, src);
            const targetDir = path.resolve(project.plugins_dir, plugin.id, path.basename(src));
            if (!fs.existsSync(srcFile)) throw new CordovaError(`Cannot find framework "${srcFile}" for plugin ${plugin.id} in iOS platform`);
            if (fs.existsSync(targetDir)) throw new CordovaError(`Framework "${targetDir}" for plugin ${plugin.id} already exists in iOS platform`);
            const symlink = !!(options && options.link);
            copyFile(plugin.dir, src, project.projectDir, targetDir, symlink); // frameworks are directories
            // CB-10773 translate back slashes to forward on win32
            const project_relative = fixPathSep(path.relative(project.projectDir, targetDir));
            // CB-11233 create Embed Frameworks Build Phase if does not exist
            const existsEmbedFrameworks = project.xcode.buildPhaseObject('PBXCopyFilesBuildPhase', 'Embed Frameworks');
            if (!existsEmbedFrameworks && embed) {
                events.emit('verbose', '"Embed Frameworks" Build Phase (Embedded Binaries) does not exist, creating it.');
                project.xcode.addBuildPhase([], 'PBXCopyFilesBuildPhase', 'Embed Frameworks', null, 'frameworks');
            }
            const opt = { customFramework: true, embed, link, sign: true };
            events.emit('verbose', util.format('Adding custom framework to project... %s -> %s', src, JSON.stringify(opt)));
            project.xcode.addFramework(project_relative, opt);
            events.emit('verbose', util.format('Custom framework added to project. %s -> %s', src, JSON.stringify(opt)));
        },
        uninstall: function (obj, plugin, project, options) {
            const src = obj.src;

            if (!obj.custom) { // CB-9825 cocoapod integration for plugins
                const keepFrameworks = keep_these_frameworks;
                if (keepFrameworks.indexOf(src) < 0) {
                    if (obj.type !== 'podspec') {
                        // this should be refactored
                        project.frameworks[src] = project.frameworks[src] || 1;
                        project.frameworks[src]--;
                        if (project.frameworks[src] < 1) {
                            // Only remove non-custom framework from xcode project
                            // if there is no references remains
                            project.xcode.removeFramework(src);
                            delete project.frameworks[src];
                        }
                    }
                }
                return;
            }

            const targetDir = fixPathSep(path.resolve(project.plugins_dir, plugin.id, path.basename(src)));
            const pbxFile = project.xcode.removeFramework(targetDir, { customFramework: true });
            if (pbxFile) {
                project.xcode.removeFromPbxEmbedFrameworksBuildPhase(pbxFile);
            }
            fs.removeSync(targetDir);
        }
    },
    'lib-file': {
        install: function (obj, plugin, project, options) {
            events.emit('verbose', '<lib-file> install is not supported for iOS plugins');
        },
        uninstall: function (obj, plugin, project, options) {
            events.emit('verbose', '<lib-file> uninstall is not supported for iOS plugins');
        }
    },
    asset: {
        install: function (obj, plugin, project, options) {
            if (!obj.src) {
                throw new CordovaError(generateAttributeError('src', 'asset', plugin.id));
            }
            if (!obj.target) {
                throw new CordovaError(generateAttributeError('target', 'asset', plugin.id));
            }

            copyFile(plugin.dir, obj.src, project.www, obj.target);
            if (options && options.usePlatformWww) copyFile(plugin.dir, obj.src, project.platformWww, obj.target);
        },
        uninstall: function (obj, plugin, project, options) {
            const target = obj.target;

            if (!target) {
                throw new CordovaError(generateAttributeError('target', 'asset', plugin.id));
            }

            removeFile(project.www, target);
            removeFileF(path.resolve(project.www, 'plugins', plugin.id));
            if (options && options.usePlatformWww) {
                removeFile(project.platformWww, target);
                removeFileF(path.resolve(project.platformWww, 'plugins', plugin.id));
            }
        }
    },
    'js-module': {
        install: function (obj, plugin, project, options) {
            // Copy the plugin's files into the www directory.
            const moduleSource = path.resolve(plugin.dir, obj.src);
            const moduleName = `${plugin.id}.${obj.name || path.basename(obj.src, path.extname(obj.src))}`;

            // Read in the file, prepend the cordova.define, and write it back out.
            let scriptContent = fs.readFileSync(moduleSource, 'utf-8').replace(/^\ufeff/, ''); // Window BOM
            if (moduleSource.match(/.*\.json$/)) {
                scriptContent = `module.exports = ${scriptContent}`;
            }
            scriptContent = `cordova.define("${moduleName}", function(require, exports, module) {\n${scriptContent}\n});\n`;

            const moduleDestination = path.resolve(project.www, 'plugins', plugin.id, obj.src);
            fs.ensureDirSync(path.dirname(moduleDestination));
            fs.writeFileSync(moduleDestination, scriptContent, 'utf-8');
            if (options && options.usePlatformWww) {
                const platformWwwDestination = path.resolve(project.platformWww, 'plugins', plugin.id, obj.src);
                fs.ensureDirSync(path.dirname(platformWwwDestination));
                fs.writeFileSync(platformWwwDestination, scriptContent, 'utf-8');
            }
        },
        uninstall: function (obj, plugin, project, options) {
            const pluginRelativePath = path.join('plugins', plugin.id, obj.src);
            removeFileAndParents(project.www, pluginRelativePath);
            if (options && options.usePlatformWww) removeFileAndParents(project.platformWww, pluginRelativePath);
        }
    }
};

module.exports.getInstaller = type => {
    if (handlers[type] && handlers[type].install) {
        return handlers[type].install;
    }

    events.emit('warn', `<${type}> is not supported for iOS plugins`);
};

module.exports.getUninstaller = type => {
    if (handlers[type] && handlers[type].uninstall) {
        return handlers[type].uninstall;
    }

    events.emit('warn', `<${type}> is not supported for iOS plugins`);
};

function installHelper (type, obj, plugin_dir, project_dir, plugin_id, options, project) {
    const srcFile = path.resolve(plugin_dir, obj.src);
    const targetDir = path.resolve(project.plugins_dir, plugin_id, obj.targetDir || '');
    const destFile = path.join(targetDir, path.basename(obj.src));

    let project_ref;
    const link = !!(options && options.link);
    if (link) {
        const trueSrc = fs.realpathSync(srcFile);
        // Create a symlink in the expected place, so that uninstall can use it.
        if (options && options.force) {
            copyFile(plugin_dir, trueSrc, project_dir, destFile, link);
        } else {
            copyNewFile(plugin_dir, trueSrc, project_dir, destFile, link);
        }
        // Xcode won't save changes to a file if there is a symlink involved.
        // Make the Xcode reference the file directly.
        // Note: Can't use path.join() here since it collapses 'Plugins/..', and xcode
        // library special-cases Plugins/ prefix.
        project_ref = `Plugins/${fixPathSep(path.relative(fs.realpathSync(project.plugins_dir), trueSrc))}`;
    } else {
        if (options && options.force) {
            copyFile(plugin_dir, srcFile, project_dir, destFile, link);
        } else {
            copyNewFile(plugin_dir, srcFile, project_dir, destFile, link);
        }
        project_ref = `Plugins/${fixPathSep(path.relative(project.plugins_dir, destFile))}`;
    }

    if (type === 'header-file') {
        project.xcode.addHeaderFile(project_ref);
    } else if (obj.framework) {
        const opt = { weak: obj.weak };
        const project_relative = path.join(path.basename(project.xcode_path), project_ref);
        project.xcode.addFramework(project_relative, opt);
        project.xcode.addToLibrarySearchPaths({ path: project_ref });
    } else {
        project.xcode.addSourceFile(project_ref, obj.compilerFlags ? { compilerFlags: obj.compilerFlags } : {});
    }
}

function uninstallHelper (type, obj, project_dir, plugin_id, options, project) {
    const targetDir = path.resolve(project.plugins_dir, plugin_id, obj.targetDir || '');
    const destFile = path.join(targetDir, path.basename(obj.src));

    let project_ref;
    const link = !!(options && options.link);
    if (link) {
        const trueSrc = fs.readlinkSync(destFile);
        project_ref = `Plugins/${fixPathSep(path.relative(fs.realpathSync(project.plugins_dir), trueSrc))}`;
    } else {
        project_ref = `Plugins/${fixPathSep(path.relative(project.plugins_dir, destFile))}`;
    }

    fs.removeSync(targetDir);

    if (type === 'header-file') {
        project.xcode.removeHeaderFile(project_ref);
    } else if (obj.framework) {
        const project_relative = path.join(path.basename(project.xcode_path), project_ref);
        project.xcode.removeFramework(project_relative);
        project.xcode.removeFromLibrarySearchPaths({ path: project_ref });
    } else {
        project.xcode.removeSourceFile(project_ref);
    }
}

const pathSepFix = new RegExp(path.sep.replace(/\\/, '\\\\'), 'g');
function fixPathSep (file) {
    return file.replace(pathSepFix, '/');
}

function copyFile (plugin_dir, src, project_dir, dest, link) {
    src = path.resolve(plugin_dir, src);
    if (!fs.existsSync(src)) throw new CordovaError(`"${src}" not found!`);

    // check that src path is inside plugin directory
    const real_path = fs.realpathSync(src);
    const real_plugin_path = fs.realpathSync(plugin_dir);
    if (real_path.indexOf(real_plugin_path) !== 0) { throw new CordovaError(`File "${src}" is located outside the plugin directory "${plugin_dir}"`); }

    dest = path.resolve(project_dir, dest);

    // check that dest path is located in project directory
    if (dest.indexOf(project_dir) !== 0) { throw new CordovaError(`Destination "${dest}" for source file "${src}" is located outside the project`); }

    fs.ensureDirSync(path.dirname(dest));

    if (link) {
        linkFileOrDirTree(src, dest);
    } else {
        fs.copySync(src, dest);
    }
}

// Same as copy file but throws error if target exists
function copyNewFile (plugin_dir, src, project_dir, dest, link) {
    const target_path = path.resolve(project_dir, dest);
    if (fs.existsSync(target_path)) { throw new CordovaError(`"${target_path}" already exists!`); }

    copyFile(plugin_dir, src, project_dir, dest, !!link);
}

function linkFileOrDirTree (src, dest) {
    if (fs.existsSync(dest)) {
        fs.removeSync(dest);
    }

    if (fs.statSync(src).isDirectory()) {
        fs.ensureDirSync(dest);
        fs.readdirSync(src).forEach(entry => {
            linkFileOrDirTree(path.join(src, entry), path.join(dest, entry));
        });
    } else {
        fs.linkSync(src, dest);
    }
}

// checks if file exists and then deletes. Error if doesn't exist
function removeFile (project_dir, src) {
    const file = path.resolve(project_dir, src);
    fs.removeSync(file);
}

// deletes file/directory without checking
function removeFileF (file) {
    fs.removeSync(file);
}

function removeFileAndParents (baseDir, destFile, stopper) {
    stopper = stopper || '.';
    const file = path.resolve(baseDir, destFile);
    if (!fs.existsSync(file)) return;

    removeFileF(file);

    // check if directory is empty
    let curDir = path.dirname(file);

    while (curDir !== path.resolve(baseDir, stopper)) {
        if (fs.existsSync(curDir) && fs.readdirSync(curDir).length === 0) {
            fs.rmdirSync(curDir);
            curDir = path.resolve(curDir, '..');
        } else {
            // directory not empty...do nothing
            break;
        }
    }
}

function generateAttributeError (attribute, element, id) {
    return `Required attribute "${attribute}" not specified in <${element}> element from plugin: ${id}`;
}
