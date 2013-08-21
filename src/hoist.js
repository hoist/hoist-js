define([
		'data',
		'auth',
		'bus',
		'exceptions',
		'config'
		],function(data,auth,bus,exceptions,config){
	return {
		data:data,
		auth:auth,
		bus:bus,
		exceptions:exceptions,
		config:config
	};
});