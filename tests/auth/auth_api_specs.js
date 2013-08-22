define(['Hoist', 'chai', 'superagent', 'sinon'], function(Hoist, chai, superagent, sinon) {
	var should = chai.should();
	'use strict';
	describe('Auth#getTokensFromHeaders', function() {
		describe('getting tokens from header array', function() {
			var _result;
			before(function() {
				var headers = {
					header1:"ABC",
					"x-sso-data-hoi-io":"TOKEN",
					"x-sso-other-url":"TOKEN2"
				};
				_result = Hoist.auth.getTokensFromHeaders(headers);
			});
			it("should generate the correct array",function(){
				_result["data-hoi-io"].should.equal('TOKEN');
				_result["other-url"].should.equal('TOKEN2');
			});
		});

	});
	describe('Hoist auth api', function() {
		it('should have a login function', function() {
			Hoist.auth.should.respondTo('login');
		});

		describe('calling login without setting an api key', function() {
			var _exception;
			before(function() {
				try {
					Hoist.auth.login("username", "password");
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
			it('should keep the login status as logged out', function() {
				Hoist.auth.status.should.equal('LoggedOut');
			});
		});
		describe('login with ok response', function() {
			var _server;
			var _listeners;
			var _eventWasRaised = false;
			var _eventArgs = {};
			var _callbackListener = function(a) {
				_eventWasRaised = true;
				_eventArgs = a;
			};
			before(function(done) {
				var apiKey = "APIKEY";
				var username = "username";
				var password = "password";

				_listeners = Hoist.bus.getListeners(Hoist.auth.LoginEvent);

				if (_listeners.length > 0) {
					Hoist.bus.removeListeners(Hoist.auth.LoginEvent, _listeners);
				}
				Hoist.bus.addListener(Hoist.auth.LoginEvent, _callbackListener);
				Hoist.config.ApiKey = apiKey;
				_server = sinon.fakeServer.create();
				_server.respondWith('POST', 'https://auth.hoi.io/login', [200, {
						"Content-Type": "application/json",
						"x-sso-data-hoi-io": "TOKEN"
					},
					'{"UserName":"My User","EmailAddresses":["test@hoi.io"],"UserId":1}'
				]);
				Hoist.auth.login(username, password, done);
				_server.respond();
			});
			after(function() {
				_server.restore();
				Hoist.bus.removeListeners(Hoist.auth.LoginEvent, [_callbackListener]);
				Hoist.bus.addListeners(Hoist.auth.LoginEvent, _listeners);
			});
			it('should set current logged in status to LoggedIn', function() {
				Hoist.auth.status.should.equal('LoggedIn');
			});
			it('should raise the login event', function() {
				_eventWasRaised.should.equal(true);
			});
			it('raised event arg should have user', function() {
				_eventArgs.user.id.should.equal(1);
			});
			it('raised event args should have data token', function() {
				_eventArgs.tokens["data-hoi-io"].should.equal("TOKEN");
			});

		});
	});
});