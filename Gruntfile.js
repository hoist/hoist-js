module.exports = function(grunt) {
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
					'reporter': 'spec',
					urls: [
						'http://localhost:8000/testrunner.html'
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
			test:{
				options: {
					port: 8001,
					base: '.',
					keepalive:true
				}
			}
		},
		jshint: {
			options: {
				laxcomma: true
			},
			tests: {
				options: {
					'-W030': true, // to.be.true syntax
				},
				src: ['test/**/*.js']
			},
			lib: ['Gruntfile.js', 'src/**/*.js']
		},
		watch: {
			js: {
				files: ['**/*.js', '!**/nodemodules/**'],
				tasks: ['jshint', 'connect:server', 'mocha_phantomjs']
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-mocha-phantomjs');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-shell');
};