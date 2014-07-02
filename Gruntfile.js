module.exports = function (grunt) {
  'use strict';

  var port = 8981;

  grunt.initConfig({
    nodemon: {
      dev: {
        options: {
          file: 'util/web-server.js',
          watchedFolders: ['src']
        }
      }
    },
    mocha_phantomjs: {
      all: {
        options: {
          reporter: grunt.option('reporter') || 'spec',
          urls: [
            'http://localhost:8000/testrunner.html',
            'http://localhost:8000/testrunner-vanilla.html'
          ]
        }
      }
    },
    connect: {
      server: {
        options: {
          port: 8000,
          base: '.',
        }
      },
      test: {
        options: {
          port: 8001,
          base: '.',
          keepalive: true
        }
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['tests/test.node.js']
      }
    },
    jshint: {
      options: {
        laxcomma: true,
        expr: true
      },
      tests: {
        options: {
          '-W030': true, // to.be.true syntax
        },
        src: ['tests/**/*.js']
      },
      lib: ['Gruntfile.js', 'src/**/*.js']
    },
    watch: {
      js: {
        files: ['**/*.js', '!**/nodemodules/**'],
        tasks: ['jshint', 'connect:server', 'mocha_phantomjs']
      }
    },
    bower: {
      install: {
        //just run 'grunt bower:install' and you'll see files from your Bower packages in lib directory
      }
    },
    requirejs: grunt.file.readJSON('./build/build.settings.js')
  });

  require('load-grunt-tasks')(grunt);


  grunt.registerTask("test", ['jshint', 'connect:server', 'mocha_phantomjs', 'mochaTest']);
  grunt.registerTask("default", ['jshint']);

};
