/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

'use strict';
module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  if (!grunt.file.exists('developer.json')) {
    grunt.file.copy('developer.tmpl.json', 'developer.json');
  }

  grunt.initConfig({
    dev: grunt.file.readJSON('developer.json'),

    replace: {
      templates: {
        options: {
          variables: {
            VERSION: '<%= mainVersion %>',
            BUILD: '<%= subVersion %>',
            BID: '<%= buildId %>',
            APPNAME: '<%= name %>',
            APPDESCRIPTION: '<%= description %>',
            PACKAGE: '<%= package %>',
            PRODUCTION: 'false',
            DEFAULTLOCATIONS: '',
            DEFAULTPERSPECTIVES: "'perspectiveList', 'perspectiveGrid', 'perspectiveGraph', 'perspectiveImageSwiper'",
            ACTIVATEDPERSPECTIVES: "{ 'id': 'perspectiveList', 'name': 'List' }, { 'id': 'perspectiveGrid', 'name': 'Grid' }, { 'id': 'perspectiveGraph', 'name': 'Graph' }, { 'id': 'perspectiveImageSwiper', 'name': 'ImageSwiper' }",
            MHTVIEWER: 'viewerBrowser',
            PDFVIEWER: 'viewerPDF'
          },
          prefix: '@@'
        },
        files: [{
          src: 'default.settings.tmpl.js',
          dest: 'data/js/settings.default.js'
        }, {
          src: 'data/mozilla/mozilla.package.tmpl.json',
          dest: 'package.json'
        }, {
          src: 'data/electron/package.tmpl.json',
          dest: 'data/package.json'
        }, {
          src: 'data/chromium/chrome.manifest.tmpl.json',
          dest: 'data/manifest.json'
        }]
      },
    },

    myth: {
      options: {
        sourcemap: false
      },
      dist: {
        files: {
          'data/assets/generated.css': 'data/assets/tagspaces.css'
        }
      }
    },

    cssmin: {
      options: {
        //shorthandCompacting: false,
        //roundingPrecision: -1
      },
      target: {
        files: {
          'data/assets/generated.css': ['data/assets/tagspaces.css']
        }
      }
    },

    watch: {
      scripts: {
        files: ['**/*.css'],
        tasks: ['myth'],
        options: {
          spawn: false,
        },
      },
    },

    jshint: {
      options: {
        jshintrc: true
      },
      all: {
        src: [
          'Gruntfile.js',
          'data/js/**/*.js',
          '!data/js/settings.default.js',
          'data/chromium/*.js',
          'data/cordova/*.js',
          'data/electron/*.js',
          'data/ext/editorHTML/*.js',
          'data/ext/editorJSON/*.js',
          'data/ext/editorODF/*.js',
          'data/ext/editorText/*.js',
          'data/ext/perspectiveGrid/*.js',
          'data/ext/perspectiveList/*.js',
          'data/ext/perspectiveGraph/*.js',
          'data/ext/perspectiveImageSwiper/*.js',
          'data/ext/viewerAudioVideo/*.js',
          'data/ext/viewerBrowser/*.js',
          'data/ext/viewerEPUB/*.js',
          'data/ext/viewerHTML/*.js',
          'data/ext/viewerImage/*.js',
          'data/ext/viewerMD/*.js',
          'data/ext/viewerMHTML/*.js',
          'data/ext/viewerPDF/*.js',
          'data/ext/viewerText/*.js',
          'data/ext/viewerURL/*.js',
          'data/ext/viewerZIP/*.js',
          'data/mozilla/**/*.js',
          '!data/mozilla/listen.js',
          '!data/mozilla/menuitems.js',
          '!data/mozilla/toolbarbutton.js',
          '!data/mozilla/unload+.js',
          '!data/mozilla/update.js',
          '!data/mozilla/userstyles.js',
          'data/node-webkit/*.js',
          'data/web/*.js',
          'data/pro/js/*.js',
        ]
      }
    },

    jscs: {
      options: {
        config: ".jscs.json",
        maxErrors: 20
      },
      files: {
        src: [
          'Gruntfile.js',
          'data/js/**/*.js',
          '!data/js/settings.default.js',
          'data/chromium/**/*.js',
          'data/cordova/*.js',
          'data/electron/*.js',
          '!data/electron/main.js', // ignore until es6 migration
          'data/ext/editorHTML/*.js',
          'data/ext/editorJSON/*.js',
          'data/ext/editorODF/*.js',
          'data/ext/editorText/*.js',
          'data/ext/perspectiveGrid/*.js',
          'data/ext/perspectiveList/*.js',
          //'data/ext/perspectiveGraph/*.js',
          'data/ext/perspectiveImageSwiper/*.js',
          'data/ext/viewerAudioVideo/*.js',
          'data/ext/viewerBrowser/*.js',
          'data/ext/viewerEPUB/*.js',
          'data/ext/viewerHTML/*.js',
          'data/ext/viewerImage/*.js',
          'data/ext/viewerMD/*.js',
          'data/ext/viewerMHTML/*.js',
          'data/ext/viewerPDF/*.js',
          'data/ext/viewerText/*.js',
          'data/ext/viewerURL/*.js',
          'data/ext/viewerZIP/*.js',
          '!data/mozilla/*.js',
          'data/node-webkit/*.js',
          'data/web/*.js',
          'data/pro/js/*.js',
        ]
      }
    },

    fixmyjs: {
      options: {
        //config: '.jshintrc',
        //legacy: true,
        //dry: true
        //indentpref: 'spaces'
      },
      core: {
        files: [
          {
            expand: true,
            cwd: 'data/',
            //src: ['js/**/*.js', '!js/fileopener.js'],
            dest: 'data',
          }
        ]
      },
      extensions: {
        files: [{
          expand: true,
          cwd: 'data/',
          //src: ['ext/**/*.js', '!js/fileopener.js'],
          dest: 'data',
          ext: '.js'
        }]
      }
    },

    jsbeautifier : {
      files : [
        'Gruntfile.js',
        'data/js/**/*.js',
        '!data/js/settings.default.js',
        'data/chromium/**/*.js',
        'data/cordova/**/*.js',
        'data/ext/editorHTML/*.js',
        'data/ext/editorJSON/*.js',
        'data/ext/editorODF/*.js',
        'data/ext/editorText/*.js',
        'data/ext/perspectiveGrid/*.js',
        'data/ext/perspectiveList/*.js',
        'data/ext/viewerBrowser/*.js',
        'data/ext/viewerHTML/*.js',
        'data/ext/viewerImage/*.js',
        'data/ext/viewerMD/*.js',
        'data/ext/viewerMHTML/*.js',
        'data/ext/viewerPDF/*.js',
        'data/ext/viewerText/*.js',
        'data/ext/viewerURL/*.js',
        'data/mozilla/**/*.js',
        'data/node-webkit/**/*.js',
        'data/web/**/*.js',
        '!data/web/webdavlib.js'
      ],
      options : {
        js: {
          "indent_size": 2,
          "indent_char": " ",
          "indent_level": 0,
          "preserve_newlines": true,
          "max_preserve_newlines": 2,
          "jslint_happy": false,
          "space_after_anon_function": false,
          "brace_style": "collapse",
          "keep_array_indentation": false,
          "keep_function_indentation": false,
          "space_before_conditional": true,
          "break_chained_methods": false,
          "eval_code": false,
          "unescape_strings": false,
          "wrap_line_length": 0
        }
      }
    },

    shell: {
      jsdoc: {
        command: 'node node_modules/jsdoc/jsdoc.js -c jsdoc.conf.json --verbose',
      },
      transifexpull: {
        command: 'tx pull -a',
      },
    },

    compress: {
      chrome: {
        options: {
          mode: 'zip',
          archive: 'backup.zip',
          pretty: true
        },
        files: [{
          expand: true,
          src: ['**/*'],
          cwd: 'data/'
        }]
      },
    },

  });
  //loading modules
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks("grunt-jscs");
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-fixmyjs');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-shell');
  
  //tasks
  grunt.registerTask('checkStyle', ['jshint', 'jscs']);
  grunt.registerTask('jsfix', ['jsbeautifier', 'checkstyle']); // 'fixmyjs:core'
  grunt.registerTask('bumpVersion', ['init', 'replace:templates']);
  grunt.registerTask('default', ['help']);
  grunt.registerTask('runDav', ['shell:jsdav']),
  grunt.registerTask('updateI18N', ['shell:transifexpull']),
  grunt.registerTask('generateDocs', ['shell:jsdoc']),
  grunt.registerTask('help', 'Printing help for this script.', function() {
    grunt.log.writeln("Supported grunt tasks:");
    grunt.log.writeln(" * checkStyle - checking the javascript files complying with the coding standards");
    grunt.log.writeln(" * runDav - runs the webdav server");
    grunt.log.writeln(" * updateI18N - update the translations");
    grunt.log.writeln(" * generateDocs - generates the javascript docs");
    grunt.log.writeln(" * bumpVersion - update the current version from the packages.json accross the application");
  });

  grunt.registerTask('init', 'Initializing variables.', function() {
    grunt.log.writeln("Initializing builder...");
    var cfg = grunt.file.readJSON('package.json');
    grunt.config("buildId", formatDateTime(new Date(), true));
    grunt.config("subVersion", cfg.subversion);
    grunt.config("mainVersion", cfg.mainversion);
    grunt.config("package", cfg.name);
    grunt.config("name", cfg.fullName);
    grunt.config("description", cfg.description);

    function formatDateTime(date, includeTime, includeMS) {
      if ((date === undefined) || (date === "")) {
        return "";
      }
      var d = new Date(date);
      var cDate = d.getDate();
      cDate = cDate + "";
      if (cDate.length === 1) {
        cDate = "0" + cDate;
      }
      var cMonth = d.getMonth();
      cMonth++;
      cMonth = cMonth + "";
      if (cMonth.length === 1) {
        cMonth = "0" + cMonth;
      }
      var cYear = d.getFullYear();
      var cHour = d.getHours();
      cHour = cHour + "";
      if (cHour.length === 1) {
        cHour = "0" + cHour;
      }
      var cMinute = d.getMinutes();
      cMinute = cMinute + "";
      if (cMinute.length === 1) {
        cMinute = "0" + cMinute;
      }
      var cSecond = d.getSeconds();
      cSecond = cSecond + "";
      if (cSecond.length === 1) {
        cSecond = "0" + cSecond;
      }
      var time = "";
      if (includeTime) {
        time = cHour + "" + cMinute + "" + cSecond;
      }
      var milliseconds = "";
      if (includeMS) {
        milliseconds = d.getMilliseconds();
      }
      return cYear + "" + cMonth + "" + cDate + time + milliseconds;
    }
  });
};