'use strict';
module.exports = function(grunt) {
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
            DEFAULTPERSPECTIVES: "'perspectiveList', 'perspectiveGrid', 'perspectiveGraph'",
            ACTIVATEDPERSPECTIVES: "{ 'id': 'perspectiveList' }, { 'id': 'perspectiveGrid' }, { 'id': 'perspectiveGraph' }",
            MHTVIEWER: 'viewerBrowser',
            PDFVIEWER: 'viewerBrowser'
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
          src: 'data/chromelight/chrome.manifest.tmpl.json',
          dest: 'data/manifest.json'
        }]
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
          'data/chrome/**/*.js',
          'data/chromelight/**/*.js',
          'data/cordova/*.js',
          '!data/cordova/cordova.api.3.4.js',
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
          'data/pro/*.js',
        ]
      }
    },
    jscs: {
      options: {
        config: ".jscs.json",
        maxErrors: 5
      },
      files: {
        src: [
          'Gruntfile.js',
          'data/js/**/*.js',
          '!data/js/settings.default.js',
          'data/chrome/**/*.js',
          'data/chromelight/**/*.js',
          'data/cordova/*.js',
          '!data/cordova/cordova.api.3.4.js',
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
          'data/ext/viewerZIP/*.js',
          '!data/mozilla/*.js',
          'data/node-webkit/**/*.js',
          'data/web/*.js',
          'data/pro/*.js',
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
        //'Gruntfile.js',
        //'data/js/**/*.js',
        //'!data/js/settings.default.js',
        //'data/chrome/**/*.js',
        //'data/chromelight/**/*.js',
        //'data/cordova/**/*.js',
        //'data/ext/editorHTML/*.js',
        //'data/ext/editorJSON/*.js',
        //'data/ext/editorODF/*.js',
        //'data/ext/editorText/*.js',
        //'data/ext/perspectiveGrid/*.js',
        //'data/ext/perspectiveList/*.js',
        //'data/ext/viewerBrowser/*.js',
        //'data/ext/viewerHTML/*.js',
        //'data/ext/viewerImage/*.js',
        //'data/ext/viewerMD/*.js',
        //'data/ext/viewerMHTML/*.js',
        //'data/ext/viewerPDF/*.js',
        //'data/ext/viewerText/*.js',
        //'data/ext/viewerURL/*.js',
        //'data/mozilla/**/*.js',
        //'data/node-webkit/**/*.js',
        //'data/web/**/*.js',
        //'!data/web/webdavlib.js'
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
    /*jsdoc : {
        dist : {
            src: ['data/js/*.js', "Readme.md"],
            options: {
                destination: 'build/doc',
                template: "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template",
                tutorials: "doc/client-api",
                configure: "jsdoc.conf.json"
            }
        }
    },*/
    watch: {
      scripts: {
        files: ['Gruntfile.js', '{data/js,data/ext}/**/*.js'],
        tasks: ['default'],
        options: {
          spawn: false
        }
      }
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
  grunt.loadNpmTasks('grunt-mozilla-addon-sdk');
  grunt.loadNpmTasks("grunt-jscs");
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-fixmyjs');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  
  //tasks
  grunt.registerTask('checkstyle', ['jshint', 'jscs']);
  //grunt.registerTask('dist-doc', ['jsdoc', 'compress:doc']);
  grunt.registerTask('jsfix', ['jsbeautifier', 'checkstyle']); // 'fixmyjs:core'
  grunt.registerTask('bump-version', ['init', 'replace:templates']);
  grunt.registerTask('default', ['help']);
  grunt.registerTask('jsdav', 'Run JSDav Server.', function() {
    var jsDAV = require("jsDAV/lib/jsdav");
    jsDAV.debugMode = true;
    var jsDAV_Auth_Backend_File = require("jsDAV/lib/DAV/plugins/auth/file");
    grunt.log.writeln("Starting WebDAV server");
    jsDAV.createServer({
        node: "/home/na/TagSpaces/repo/data",
        authBackend:  jsDAV_Auth_Backend_File.new("/home/na/TagSpaces/repo/jsdavauth"),
        realm: "jdavtest"
    }, 8000);
  }),

  grunt.registerTask('help', 'Printing help for this script.', function() {
    grunt.log.writeln("Supported grunt tasks:");
    grunt.log.writeln(" - checkstyle");
    grunt.log.writeln(" - bump-version");
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