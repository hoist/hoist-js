module.exports = function (grunt) {
  'use strict';

  var port = 8981;

  grunt.initConfig({
    browserify: {
      dist: {
        files: {
          'build/hoist.js': ['src/hoist.js']
        }
      },
      debug: {
        files: {
          'build/hoist.js': ['src/hoist.js']
        },
        options: {
          bundleOptions: {
            debug: false
          }
        }
      }
    },
    uglify: {
      dist: {
        files: {
          'build/hoist.min.js': ['build/hoist.js']
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
          ],
          setting: {
            "webSecurityEnabled": false
          }
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
      develop: {
        options: {
          port: 8001,
          base: '.'
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
        files: ['src/*.js'],
        tasks: ['jshint', 'browserify:debug', 'mochaTest']
      },
      tests: {
        files: ['tests/*/*.js'],
        tasks: ['jshint', 'mochaTest']
      }
    },
    bower: {
      install: {
        //just run 'grunt bower:install' and you'll see files from your Bower packages in lib directory
      }
    }
  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('build',['browserify:dist','uglify:dist']);
  grunt.registerTask("test", ['jshint', 'browserify:debug', 'browserify:dist', 'uglify:dist', 'connect:server', 'mocha_phantomjs', 'mochaTest']);
  grunt.registerTask("default", ['jshint']);
  grunt.registerTask("develop", ['jshint', 'browserify:debug', 'browserify:dist', 'uglify:dist', 'mochaTest', 'connect:develop', 'watch']);

};
