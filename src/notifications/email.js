define(['config','exceptions'],function(config,exceptions){
	'use strict';
	var Email = function(){
		if (config.ApiKey === undefined||config.ApiKey===null) {
			throw new exceptions.ApiKeyNotSet();
		}
	};
	return Email;
});