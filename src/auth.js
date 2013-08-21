define(['bus', 'config', 'exceptions', 'superagent'], function(bus, config, exceptions, request) {
	var Auth = function() {

		this.status = 'LoggedOut';
		this.LoginEvent = 'Auth:LoginEvent';
		this.bus = bus;
		this.bus.defineEvent(this.LoginEvent);

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
						self.bus.emitEvent(self.LoginEvent,[res]);
						if (callback) {
							callback.apply(this);
						}
					}
				}
			});

	};
	return new Auth();
});