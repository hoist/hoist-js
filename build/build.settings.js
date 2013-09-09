 {
 	"compile": {
 		"options": {
 			"baseUrl": "src",
 			"mainConfigFile": "build/build.config.js",
 			"out": "build/out/hoist-min.js",
 			"generateSourceMaps": true,
 			"name": "Hoist",
 			"preserveLicenseComments": false,
 			"optimize": "uglify2",
 			"wrap": true
 		}
 	},
 	"compile-debug": {
 		"options": {
 			"baseUrl": "src",
 			"mainConfigFile": "build/build.config.js",
 			"out": "build/out/hoist.js",
 			"generateSourceMaps": true,
 			"name": "Hoist",
 			"preserveLicenseComments": false,
 			"optimize": "none",
 			"wrap": true
 		}
 	}
 }