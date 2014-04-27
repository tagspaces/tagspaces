/**
 * RequireJS i18next Plugin
 * 
 * Version 0.4.0 (01-19-2014)
 * Copyright 2013-2014 Jacob van Mourik
 * Released under the MIT license
 */
define(["i18next"], function(i18next) {
    "use strict";

    var plugin,
        supportedLngs,
        resStore = {},
        f = i18next.functions,
        o = i18next.options;

    plugin = {
        version: "0.4.0",
        pluginBuilder: "./i18next-builder",

        /**
         * Checks to see if there exists a resource with the given 
         * module, language and namespace in the store. 
         * 
         * @param {String} module The module name
         * @param {String} lng The language
         * @param {String} ns The namespace
         * @returns {Boolean} If the resource exists in the store
         */
        resourceExists: function(module, lng, ns) {
            return resStore[module] && resStore[module][lng] && resStore[module][lng][ns];
        },

        /**
         * Adds a resource to the store (overrides existing one).
         * 
         * @param {String} module The module name
         * @param {String} lng The language
         * @param {String} ns The namespace
         * @param {Object} data The resource data
         */
        addResource: function(module, lng, ns, data) {
            resStore[module] = resStore[module] || {};
            resStore[module][lng] = resStore[module][lng] || {};
            resStore[module][lng][ns] = data;
        },

        /**
         * Gets all resources by the given language and namespace.
         * 
         * @param {String} lng The language
         * @param {String} ns The namespace
         * @returns {Object} The resource data
         */
        getResources: function(lng, ns) {
            var data = {};
            f.each(resStore, function(module) {
                if (resStore[module][lng] && resStore[module][lng][ns]) {
                    f.extend(data, resStore[module][lng][ns]);
                }
            });
            return data;
        },

        /**
         * Parses a resource name into its component parts. 
         * For example: resource:namespace1,namespace2 where resource is the path to
         * the locales and the part after the : the additional namespace(s) to load.
         * 
         * @param {String} name The resource name
         * @returns {Object} Object containing module name and namespaces
         */
        parseName: function(name) {
            var splitted = name.split(":");
            return {
                module: splitted[0],
                namespaces: splitted[1] ? splitted[1].split(",") : []
            };
        },

        load: function(name, req, onload, config) {
            var parsedName = plugin.parseName(name), 
                options = f.extend({}, config.i18next), 
                namespaces = parsedName.namespaces, 
                module = parsedName.module, 
                supportedLngs = options.supportedLngs;

            // Check for scoped supported languages value
            if (supportedLngs && supportedLngs[module]) {
                supportedLngs = supportedLngs[module];
            }

            // Set namespaces
            if (typeof o.ns == "string") {
                namespaces.unshift(options.ns || o.ns);
                options.ns = {
                    defaultNs: namespaces[0],
                    namespaces: namespaces
                };
            } else {
                options.ns = o.ns;
                f.each(namespaces, function(idx, namespace) {
                    if (options.ns.namespaces.indexOf(namespace) == -1) {
                        options.ns.namespaces.push(namespace);
                    }
                });
            }

            // Set a custom load function
            options.customLoad = function(lng, ns, opts, done) {

                // Check for already loaded resource
                if (plugin.resourceExists(module, lng, ns)) {
                    done(null, plugin.getResources(lng, ns));
                    return;
                }

                // Check for language/namespace support
                if (supportedLngs && (!supportedLngs[lng] || supportedLngs[lng].indexOf(ns) == -1)) {
                    f.log("no locale support found for " + lng + " with namespace " + ns);
                    done(null, {});
                    return;
                }

                // Define resource url
                var url = req.toUrl(module + (module.substr(module.length - 1) !== "/" ? "/" : "") + 
                        f.applyReplacement(opts.resGetPath, {lng : lng, ns : ns}));

                // Make the request
                f.ajax({
                    url: url,
                    dataType: "json",
                    async: opts.async,
                    success: function(data, status, xhr) {
                        plugin.addResource(module, lng, ns, data);
                        f.log("loaded: " + url);
                        done(null, plugin.getResources(lng, ns));
                    },
                    error: function(xhr, status, error) {
                        f.log("failed loading: " + url);
                        done(error, {});
                    }
                });
            };

            // Delete supported languages, they are only needed by this plugin
            delete options.supportedLngs;

            // Initialize i18next and return the i18next instance
            i18next.init(options, function() {
                onload(i18next);
            });
        }
    };

    return plugin;
});
