/*!
 * Hoist JavaScript Library v@VERSION
 * http://hoistapps.com/
 *
 * Includes Lodash.js
 * http://lodash.com/
 * Heir
 * http://git.io/F87mKg
 * And EventEmitter
 * http://git.io/ee
 *
 * Copyright 2013 Hoist AppsLtd. and other contributors
 * Released under the MIT license
 * https://github.com/hoist/hoist-js/blob/master/LICENSE
 *
 * Date: @DATE
 */
(function ( window, factory ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// Expose a jQuery-making factory as module.exports in loaders that implement the Node
		// module pattern (including browserify).
		// This accentuates the need for a real window in the environment
		// e.g. var jQuery = require("jquery")(window);
		module.exports = function( w ) {
			w = w || window;
			if ( !w.document ) {
				throw new Error("jQuery requires a window with a document");
			}
			return factory( w );
		};
	} else {
		factory( window );
	}

// Pass this, window may not be defined yet
}(this, function ( window ) {