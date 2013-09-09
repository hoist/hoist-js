define(['Hoist', 'chai', 'superagent', 'sinon'], function(Hoist, chai, superagent, sinon) {
	'use strict';
	var should = chai.should();
	describe('Notification api', function() {
		it('should expose notifications on the Hoist root', function() {
			should.exist(Hoist.notifications);
		});
		describe('creating a new email before setting api key', function() {
			var _exception;
			before(function() {
				Hoist.config.ApiKey = null;
				try {
					var email = new Hoist.notifications.Email();
				} catch (e) {
					_exception = e;
				}
			});
			it('should throw an exception', function() {
				should.exist(_exception);
			});
			it('should throw an API Key Not Set Exception', function() {
				_exception.should.be.instanceOf(Hoist.exceptions.ApiKeyNotSet);
			});
		});
		describe('creating an email', function () {
			before(function() {
				Hoist.config.ApiKey = null;
				var email = new Hoist.notifications.Email('welcome_email',{
					field:'value'	
				});
				email.send();
			});
		});
	});

});