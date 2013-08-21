define(['Hoist','chai'],function(Hoist,chai){
	chai.should();
	'use strict';
	describe('Hoist api',function(){
		it('should have a model function', function () {
			Hoist.should.respondTo('Model');
		});
		it('should define the model as a class', function(){
			new Hoist.Model().should.be.instanceof(Hoist.Model);
		});
	});
});