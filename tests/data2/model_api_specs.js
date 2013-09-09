define(['Hoist', 'chai'], function(Hoist, chai) {
	'use strict';
	
	var should = chai.should();
	
	describe('Hoist api', function() {
		it('should have a data object', function() {
			should.exist(Hoist.data);
			Hoist.data.should.respondTo('defineModel');
		});
		describe('creating a new model definition', function() {
			var _modelDefinition;
			before(function() {
				_modelDefinition = Hoist.data.defineModel({});
			});
			it('should create a model definition object', function() {
				_modelDefinition.should.be.instanceof(Hoist.data.ModelDefinition);
			});
		});
	});
});