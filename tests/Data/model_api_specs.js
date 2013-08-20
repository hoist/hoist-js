define(['Hoist','chai'],function(Hoist,chai){
	chai.should();
	'use strict';
	describe('Hoist api',function(){
		it('should have a model function', function () {
			Hoist.should.respondTo('model');
		});
	});
});