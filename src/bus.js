define(['../lib/EventEmitter/EventEmitter','../lib/heir/heir'], function(EventEmitter,heir) {
	var Bus = function() {
		
	};
	heir.inherit(EventEmitter,Bus);
	return new Bus();
});