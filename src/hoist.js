define([
	'data',
	'auth',
	'bus',
	'exceptions',
	'config',
	'notifications'
], function(data, auth, bus, exceptions, config, notifications) {
	
	var hoist = {
		data: data,
		auth: auth,
		bus: bus,
		exceptions: exceptions,
		config: config,
		notifications: notifications
	};
	window.Hoist = hoist;
	return hoist;
});