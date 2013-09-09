define([
		'data',
		'auth',
		'bus',
		'exceptions',
		'config',
		'notifications'
		],function(data,auth,bus,exceptions,config,notifications){
	return {
		data:data,
		auth:auth,
		bus:bus,
		exceptions:exceptions,
		config:config,
		notifications:notifications
	};
});