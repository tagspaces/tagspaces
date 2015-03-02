'use strict';

module.exports = function(grunt) {

  grunt.initConfig({

    buildsDir: "../builds",
    cordovaDevDir: "/home/na/TagSpaces/cordova/www",
    //default.locations.android = {"name": "Photos", "path": "DCIM"}, {"name": "Downloads", "path": "Download"}

    clean: {
      cordova: ['<%= cordovaDevDir %>'],
    },

    copy: {
      /*templates: {
        files: [
          { src: 'default.settings.tmpl.js', dest: 'data/js/settings.default.js' },
          //{ src: 'data/mozilla/mozilla.package.tmpl.json', dest: 'package.json' },
          { src: 'data/chromelight/chrome.manifest.tmpl.json', dest: 'data/manifest.json' }
        ]
      },*/
      cordova: {
        files: [
          { expand: true, cwd: 'data/assets', src: ['**'], dest: '<%= cordovaDevDir %>/assets' },
          { expand: true, cwd: 'data/libs', src: ['**'], dest: '<%= cordovaDevDir %>/libs' },
          { expand: true, cwd: 'data/js', src: ['**'], dest: '<%= cordovaDevDir %>/js' },
          { expand: true, cwd: 'data/locales', src: ['**'], dest: '<%= cordovaDevDir %>/locales' },
          { expand: true, cwd: 'data/templates', src: ['**'], dest: '<%= cordovaDevDir %>/templates' },
          { expand: true, cwd: 'data/ext/perspectiveList/', src: ['**'], dest: '<%= cordovaDevDir %>/ext/perspectiveList/' },
          { expand: true, cwd: 'data/ext/perspectiveGrid/', src: ['**'], dest: '<%= cordovaDevDir %>/ext/perspectiveGrid/' },
          { expand: true, cwd: 'data/ext/editorHTML/', src: ['**'], dest: '<%= cordovaDevDir %>/ext/editorHTML/' },
          { expand: true, cwd: 'data/ext/editorJSON/', src: ['**'], dest: '<%= cordovaDevDir %>/ext/editorJSON/' },
          { expand: true, cwd: 'data/ext/editorText/', src: ['**'], dest: '<%= cordovaDevDir %>/ext/editorText/' },
          { expand: true, cwd: 'data/ext/editorODF/', src: ['**'], dest: '<%= cordovaDevDir %>/ext/editorODF/' },
          { expand: true, cwd: 'data/ext/viewerText/', src: ['**'], dest: '<%= cordovaDevDir %>/ext/viewerText' },
          { expand: true, cwd: 'data/ext/viewerHTML/', src: ['**'], dest: '<%= cordovaDevDir %>/ext/viewerHTML' },
          { expand: true, cwd: 'data/ext/viewerMHTML/', src: ['**'], dest: '<%= cordovaDevDir %>/ext/viewerMHTML' },
          { expand: true, cwd: 'data/ext/viewerPDF/', src: ['**'], dest: '<%= cordovaDevDir %>/ext/viewerPDF' },
          { expand: true, cwd: 'data/ext/viewerImage/', src: ['**'], dest: '<%= cordovaDevDir %>/ext/viewerImage/' },
          { expand: true, cwd: 'data/ext/viewerURL/', src: ['**'], dest: '<%= cordovaDevDir %>/ext/viewerURL/' },
          { expand: true, cwd: 'data/ext/viewerMD/', src: ['**'], dest: '<%= cordovaDevDir %>/ext/viewerMD/' },
          { expand: true, cwd: 'data/ext/viewerBrowser/', src: ['**'], dest: '<%= cordovaDevDir %>/ext/viewerBrowser/' },
          { expand: true, cwd: 'data/cordova', src: ['*.js'], dest: '<%= cordovaDevDir %>/cordova' },
          { src: 'data/about.html', dest: '<%= cordovaDevDir %>/about.html' },
          { src: 'data/index.html', dest: '<%= cordovaDevDir %>/index.html' },
          { src: 'data/LICENSE.txt', dest: '<%= cordovaDevDir %>/LICENSE.txt' },
          { src: 'data/EULA.txt', dest: '<%= cordovaDevDir %>/EULA.txt' },
          { src: 'data/loader.js', dest: '<%= cordovaDevDir %>/loader.js' }
        ]
      }
    },
    
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
        files: [
          { src: 'default.settings.tmpl.js', dest: 'data/js/settings.default.js' },
          { src: 'data/mozilla/mozilla.package.tmpl.json', dest: 'package.json' },
          { src: 'data/chromelight/chrome.manifest.tmpl.json', dest: 'data/manifest.json' },
        ]
      },
      cordova: {
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
        files: [
          { src: 'data/cordova/config.xml', dest: '<%= cordovaDevDir %>/config.xml' },
          { src: 'data/about.html', dest: '<%= cordovaDevDir %>/about.html' },
        ]
      }
    },

    jshint: {
      options: {
        jshintrc: true
      },
      all: {
        src: [
          'Gruntfile.js',
          //'data/js/**/*.js'
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
        ]
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

    'mozilla-addon-sdk': {
      '1_17': {
        options: {
          revision: '1.17'
        }
      }
    },
    'mozilla-cfx-xpi': {
      stable: {
        options: {
          'mozilla-addon-sdk': '1_17',
          extension_dir: 'build/firefox',
          dist_dir: 'dist/',
          arguments: '--output-file=mailvelope.firefox.xpi'
        }
      }
    },
    'mozilla-cfx': {
      'run_stable': {
        options: {
          "mozilla-addon-sdk": "1_17",
          extension_dir: "build/firefox",
          command: "run"
        }
      }
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

  //tasks
  grunt.registerTask('checkstyle', ['jshint', 'jscs']);
  //grunt.registerTask('dist-doc', ['jsdoc', 'compress:doc']);
  grunt.registerTask('bump-version', ['init', 'replace:templates']);
  grunt.registerTask('prepare-cordova', ['init', /*'clean:cordova',*/'copy:cordova', 'replace:cordova']);
  grunt.registerTask('default', ['init', 'checkstyle']);

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
      if ((date === undefined) || (date === "")) { return ""; }
      var d = new Date(date);
      var cDate = d.getDate();
      cDate = cDate + "";
      if (cDate.length === 1) { cDate = "0" + cDate; }
      var cMonth = d.getMonth(); cMonth++;
      cMonth = cMonth + "";
      if (cMonth.length === 1) { cMonth = "0" + cMonth; }
      var cYear = d.getFullYear();
      var cHour = d.getHours();
      cHour = cHour + "";
      if (cHour.length === 1) { cHour = "0" + cHour; }
      var cMinute = d.getMinutes();
      cMinute = cMinute + "";
      if (cMinute.length === 1) { cMinute = "0" + cMinute; }
      var cSecond = d.getSeconds();
      cSecond = cSecond + "";
      if (cSecond.length === 1) { cSecond = "0" + cSecond; }
      var time = "";
      if (includeTime) {
          time = cHour+""+cMinute+""+cSecond;
      }
      var milliseconds = "";
      if (includeMS) {
          milliseconds = d.getMilliseconds();
      }
      return cYear+""+cMonth+""+cDate+time+milliseconds;
    }
  });

};
