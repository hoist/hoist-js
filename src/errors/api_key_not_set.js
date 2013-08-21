define(function(){
	'use strict';

	var ApiKeyNotSet = function(){
		Error.apply(this,arguments);
		this.stack = (new Error()).stack;

	};
	ApiKeyNotSet.prototype = new Error();
	ApiKeyNotSet.prototype.constructor = ApiKeyNotSet;
	ApiKeyNotSet.prototype.name = 'ApiKeyNotSet';
	ApiKeyNotSet.prototype.message='You need to set an API key by calling Hoist.config.ApiKey=\'MY_KEY\'';

	return ApiKeyNotSet;


});

