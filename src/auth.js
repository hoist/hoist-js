define(['bus', 'config', 'exceptions', '../lib/superagent/superagent', '../util/lodash'], function(bus, config, exceptions, request, _) {
	var Auth = function() {

		this.status = 'LoggedOut';
		this.LoginEvent = 'Auth:LoginEvent';
		this.bus = bus;
		this.keyStart = 'x-sso-';
		this.bus.defineEvent(this.LoginEvent);
		this.getTokensFromHeaders = function(headers) {
			var self = this;
			var tokens = {};

			_.forEach(headers,function(value, key) {
				if (key.indexOf(this.keyStart) === 0) {
					var keyShortened = key.substring(this.keyStart.length);
					tokens[keyShortened] = value;
				}
			}, self);
			console.log(tokens);
			return tokens;
		};
	};

	Auth.prototype.login = function(username, password, callback) {
		if (config.ApiKey === undefined) {
			throw new exceptions.ApiKeyNotSet();
		}
		var self = this;
		request
			.post('https://auth.hoi.io/login')
			.send({
				username: username,
				password: password
			})
			.set('Authorization', 'Hoist ' + config.ApiKey)
			.set('Accept', 'applicaiton/json')
			.end(function(error, res) {
				if (error) {

				} else {

					if (res.status === 200) {

						self.status = 'LoggedIn';

						var user = {
							id: res.body.UserId,
							name: res.body.UserName,
							emailAddresses: res.body.EmailAddresses,
						};
						var tokens = self.getTokensFromHeaders.call(self, res.headers);

						self.bus.emitEvent(self.LoginEvent, [{
							user: user,
							tokens: tokens
						}]);

						if (callback) {
							callback.apply(this);
						}
					}
				}
			});

	};
	return new Auth();
});